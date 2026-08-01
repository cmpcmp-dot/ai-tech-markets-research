# analysis/

Every number on the site is produced here. The organising idea is two layers:

- **`src/fetch/`** and **`src/clean/`** — one file per *data source*. Download it,
  tidy it, apply the rules that source needs, once. Nothing here decides
  anything.
- **`src/exhibits/`** — one file per *card* on the site. Reads clean data, does
  that card's analysis, writes one JSON fragment. This is where the economics
  is, and it is the file to open if you want to change a result.
- **`src/publish/`** — one file per published `data/*.js` contract. Assembles
  card fragments. No analysis.

If you want to understand a chart, find its row in the table below and read the
one exhibit file. If you want to change it, edit that file and run one command.

```
Rscript analysis/run.R --list              what exists and what feeds it
Rscript analysis/run.R btos                rebuild one contract, offline
Rscript analysis/run.R --refresh btos      include the network fetch
```

---

## Card to script to contract

| Site card | Exhibit | Feeds |
|---|---|---|
| **Job Displacement** | | |
| 01 Is unemployment higher than we would expect? | `jobs_01_okun.R` | `jobs-displacement-data.js` |
| 02 Is the weakness spread evenly? | `jobs_02_age_bands.R` | `jobs-displacement-data.js` |
| 03 Where has job growth slowed? | *not yet ported* | `btos-jobs-monitor-data.js` |
| 04 What do hiring flows show? | *not yet ported* | `btos-jobs-monitor-data.js` |
| 05 Are young workers hit first? | *not yet ported* | `microdata.js` |
| **Adoption** | | |
| 01 How many firms are we talking about? | `adoption_01_aggregate.R` | `btos-data.js` |
| 02 Does the theory predict the practice? | `adoption_02_exposure.R` | `btos-exposure-data.js` |
| 03 Which firms? | `adoption_03_who.R` | `btos-data.js` |
| 04 What is AI actually doing inside firms? | `adoption_04_what_for.R` | `btos-data.js` |
| 05 Where are the adopters? | `adoption_05_where.R` | `btos-data.js` |
| 06 Do adopters say it cost anyone a job? | `adoption_06_jobs.R` | `btos-data.js` |

Three cards are still built from the pre-refactor tree; see **Status** below.

## Sources

| Source | Fetch | Clean | Used by |
|---|---|---|---|
| FRED (5 series) | `fetch/fred.R` | — | JD 01 |
| IPUMS CPS | `fetch/cps_ipums.py` | `clean/cps_age_education.R` | JD 02 |
| Census BTOS, biweekly | `fetch/btos.R` | `clean/btos_survey.R` | Adoption 01, 03, 05 |
| Census BTOS AI Supplement | `fetch/btos.R` | `clean/btos_supplement.R` | Adoption 03, 04, 06 |
| Yale exposure indices | `fetch/exposure.R` | `clean/exposure.R` | Adoption 02 |
| LEHD QWI | `fetch/qwi.R` | `clean/qwi.R`, `clean/btos_qwi_join.R` | Adoption 02, JD 05 |
| BLS CES + JOLTS | `fetch/ces_jolts.R` | `clean/ces_jolts.R` | JD 03, 04 |

## Layout

```
analysis/
  run.R            build a contract
  R/               paths.R, serialize.R, btos_frame.R  (shared, tiny)
  src/fetch/       network, one per source. All accept --out=<dir>.
  src/clean/       offline tidying, one per source
  src/exhibits/    one per card  <- the analysis
  src/publish/     one per data/*.js
  src/lookups/     hand-maintained crosswalks. Edit these, not the R.
  inputs/          raw downloads, 5.7 GB, gitignored
  interim/         built intermediates, gitignored
  frozen/          small and irreplaceable, COMMITTED
  tests/           compare_golden.R, compare_json.R
```

Nothing under `analysis/` is called `data`. The only `data/` in this repository
is the site's publish directory at the root, which `index.html` reads. The old
layout had both and its own docs called that "the one genuine trap."

## Things that will bite you

- **Everything BTOS is firm-weighted.** Census publishes no employment-weighted
  adoption number and this pipeline does not invent one. The firm-size gradient
  in Adoption card 03 is the substitute.
- **The 2025-11-17 BTOS wording break is never spliced.** `clean/btos_survey.R`
  marks every row old or new; a change computed across the break is not a
  change, it is the question rewrite. Right now that makes every 12-month
  sector change unavailable, which is correct and shown as absent.
- **Suppressed cells are kept and flagged**, never silently dropped.
- **Generated strings must be ASCII.** R runs in the C locale here and mangles
  non-ASCII source bytes. `write_js()` refuses to emit non-ASCII rather than
  shipping mojibake. Use `&ndash;` and friends. This is not theoretical: the
  pre-refactor artifact was rendering `Ages 21<e2><80><93>25` to readers.
- **Sanity anchors fail the build on drift.** That is intentional. If one
  fires, check whether Census revised the series before relaxing it.

## Verification

`tests/compare_golden.R` compares every regenerated `data/*.js` against a
snapshot taken before the refactor, at 1e-9 relative, ignoring vintage stamps
and allowing only the key removals it names.

```
Rscript analysis/tests/compare_golden.R <golden_dir>
Rscript analysis/tests/compare_json.R a.json b.json     # any two files
```

Results at the time of the port:

| Contract | Result |
|---|---|
| `btos-data.js` | every value identical |
| `btos-exposure-data.js` | identical (all five intermediates byte-identical) |
| `jobs-displacement-data.js`, `age_bands` | zero numeric differences |
| `jobs-displacement-data.js`, `okun` | data vintage only, see below |

Card 01's input is a live FRED pull, so its committed numbers cannot be
reproduced from today's data at any level of care. It was verified instead by
running the old script and the new fetch/exhibit pair minutes apart against the
same pull: every value identical. The difference against the committed artifact
is the 2026Q2 GDP release, which the committed version predated.

Deliberate removals from published output, each because nothing rendered it:

| Key | Contract | Why |
|---|---|---|
| `ces_slowdown` | jobs-displacement | chart replaced by the BTOS tercile cut |
| `expectations_vs_realized` | btos | `renderExpect()` targets `#adExpect`, which does not exist |

## Status

Ported and verified: Job Displacement 01-02, Adoption 01-06.

Not yet ported, still built from `data_analysis/`:

| Contract | Old command |
|---|---|
| `btos-jobs-monitor-data.js` | `Rscript data_analysis/btos/{03_jobs_join,run_jobs}.R` |
| `microdata.js` | `Rscript data_analysis/micro/{03_tests_industry,06_qwi_dynamics,run_micro}.R` |

Both still work. `data_analysis/` is intact and no committed artifact depends on
the new tree for those two. Remaining work is tracked in `PORTING.md`.
