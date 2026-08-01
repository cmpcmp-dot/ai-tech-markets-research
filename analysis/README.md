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
| 03 Where has job growth slowed? | `jobs_03_industries.R` | `btos-jobs-monitor-data.js` |
| 04 What do hiring flows show? | `jobs_04_flows.R` | `btos-jobs-monitor-data.js` |
| 05 Are young workers hit first? | `jobs_05_young_workers.R` | `jobs-young-workers-data.js` |
| **Adoption** | | |
| 01 How many firms are we talking about? | `adoption_01_aggregate.R` | `btos-data.js` |
| 02 Does the theory predict the practice? | `adoption_02_exposure.R` | `btos-exposure-data.js` |
| 03 Which firms? | `adoption_03_who.R` | `btos-data.js` |
| 04 What is AI actually doing inside firms? | `adoption_04_what_for.R` | `btos-data.js` |
| 05 Where are the adopters? | `adoption_05_where.R` | `btos-data.js` |
| 06 Do adopters say it cost anyone a job? | `adoption_06_jobs.R` | `btos-data.js` |

Every card is built here. `Rscript analysis/run.R --list` prints the same table
from the code, so it cannot go stale.

## Sources

| Source | Fetch | Clean | Used by |
|---|---|---|---|
| FRED (5 series) | `fetch/fred.R` | — | JD 01 |
| IPUMS CPS | `fetch/cps_ipums.py` | `clean/cps_age_education.R` | JD 02 |
| Census BTOS, biweekly | `fetch/btos.R` | `clean/btos_survey.R` | Adoption 01, 03, 05 |
| Census BTOS AI Supplement | `fetch/btos.R` | `clean/btos_supplement.R` | Adoption 03, 04, 06 |
| Yale exposure indices | `fetch/exposure.R` | `clean/exposure.R` | Adoption 02 |
| LEHD QWI | `fetch/qwi.R` | `clean/qwi.R`, `clean/btos_qwi_join.R` | Adoption 02, JD 05 |
| IPUMS CPS, occ x ind | `fetch/cps_ipums.py` | `clean/cps_industry_weights.R` | Adoption 02 (pushes occupational exposure onto industries) |
| BLS CPI | `fetch/cpi.R` | &mdash; | nothing yet; kept for real-wage outcomes |
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
  INPUTS.md        every uncommitted input: size, owner, how to re-fetch
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

Results at the end of the port, every contract:

| Contract | Result |
|---|---|
| `btos-data.js` | every value identical |
| `btos-exposure-data.js` | identical (all five intermediates byte-identical) |
| `btos-jobs-monitor-data.js` | every value identical |
| `jobs-young-workers-data.js` | every value identical at the port; see the QWI vintage note below |
| `jobs-displacement-data.js`, `age_bands` | zero numeric differences |
| `jobs-displacement-data.js`, `okun` | data vintage only, see below |

Several intermediates were checked directly rather than only through the
published contract, which is the stronger test:

| Intermediate | Result |
|---|---|
| `interim/bls/{ces_slim,jolts_slim}.rds` | identical to the pre-refactor extracts |
| `interim/qwi/t4_{frame,coefs}.csv` | identical (`t4_coefs` to 4e-15, the `fixest` fit) |
| `interim/qwi/qwi_{event_study,event_legs,placebo,robust,descriptive}.csv` | identical |
| `frozen/cps_occ_ind_weights.rds` | rebuilt from the 788 MB extract, identical |

Card 01's input is a live FRED pull, so its committed numbers cannot be
reproduced from today's data at any level of care. It was verified instead by
running the old script and the new fetch/exhibit pair minutes apart against the
same pull: every value identical. The difference against the committed artifact
is the 2026Q2 GDP release, which the committed version predated.

### The QWI vintage, and why one contract no longer byte-matches

LEHD reissued six states (dc, de, ia, ma, nd, ne) on 2026-07-31, after the input
cache was first pulled. The port was verified against the pre-revision inputs and
reproduced the committed artifact exactly. The revision was then taken
deliberately, so that `inputs/`, `interim/` and `data/` sit on one vintage rather
than three. It moves the T4b headline from -7.293% to -7.299% and changes no
figure the site displays: still -7.6% per SD of adoption, 40% of the gap in the
AI era, n = 59. Every one of the 2,726 differences is about 1e-5 relative.

If you re-run `compare_golden.R` against a snapshot older than 2026-08-01, that
contract will report those differences. That is expected, and it is the reason to
take a fresh snapshot after any deliberate vintage bump.

Two fetch scripts were verified by running them into a scratch directory
(`--out=`) and comparing byte-for-byte against the cached inputs: `fetch/btos.R`
reproduced all 71 period files and the supplement workbook exactly, and
`fetch/exposure.R` and `fetch/cpi.R` reproduced their files exactly.

### One rounding subtlety, in case a value looks off by 1e-5

`a1` and `a2` in `btos-jobs-monitor-data.js` are serialised at 5 decimals, and
the card fragments that feed them at 6. That is not arbitrary: the pre-refactor
pipeline also wrote an intermediate JSON at 6 before the contract at 5, and
double rounding at those two precisions is what the committed artifact contains.
Rounding once at 5 instead moves about one point in twenty by a single unit in
the fifth decimal of an index number. `write_card()` defaults to 6 for this
reason; do not override it to 5 for these two cards.

Deliberate removals from published output, each because nothing rendered it:

| Key | Contract | Why |
|---|---|---|
| `ces_slowdown` | jobs-displacement | chart replaced by the BTOS tercile cut |
| `expectations_vs_realized` | btos | `renderExpect()` targeted `#adExpect`, which does not exist |
| `monitor` | btos-jobs-monitor | the dashboard markup that drew it was removed 2026-07-31 |
| `sources`, `replication`, `t1`, `t2`, `t3`, `t5`, `t6`, `goldman` | jobs-young-workers | SDID replication and horse-race outputs; no chart read them |

Also never published, and now deleted rather than left to rot: the 96
cross-section regression coefficients behind cards 03 and 04, their placebos, the
added-variable plot, the quarterly panel, and the whole synthetic-DID chain. The
regressions were an identification attempt the sample could not support -- a
200k-job effect sat inside the confidence interval -- and cards 03 and 04 are
descriptive by design.

## Possible extensions

Carried over from `data_analysis/btos/TIER3_NEXT_STEPS.md` (2026-07-26) so the
list survives the directory that held it. Roughly in priority order, and none of
it is started.

1. **Breadth of integration** &mdash; the "how many business functions per firm"
   distribution. The single highest-signal thing missing: it separates shallow
   adoption from deepening adoption, which is the difference between the
   optimistic and pessimistic readings of the whole Adoption tab. **Not in the
   aggregate workbook.** Needs a functions-per-firm cross-tab, so restricted
   microdata or a custom Census tabulation.
2. **Supplement by state.** `clean/btos_supplement.R` already parses every
   question by state into `interim/btos/supplement.json`; a 50-state ranked panel
   is a low-effort add. Parked in the data rather than on the page because it is
   lower signal than the size and sector cuts.
3. **Expansion plans by function** (supplement Q12, scope 5) &mdash; the
   forward-looking mirror of the business-functions chart: which functions the
   *planners* expect to use AI in. Already parsed.
4. **Monthly automation.** `Rscript analysis/run.R --refresh <contract>` is the
   single entry point a scheduled task should call, followed by a commit of the
   `.js`. Not wired to anything yet. `analysis/INPUTS.md` lists the cadence each
   contract actually needs.

When Census posts a newer supplement workbook, only the URL and date range in
`fetch/btos.R` and `clean/btos_supplement.R` need touching: the parser is generic
across the four sheets.

## Status

Complete. Every card on the site is built from this directory, and
`data_analysis/` has been removed. [`PORTING.md`](../docs/history/PORTING.md) records how the migration was
done and what was checked at each step.
