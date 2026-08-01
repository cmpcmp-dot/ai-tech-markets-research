# Inputs

Everything this pipeline reads that is **not** committed, why, and how to get it
back. If a script stops with "Missing &lt;path&gt;", the answer is on this page --
`need_file()` prints the exact command alongside the error.

`index.html` reads only `data/*.js`, and those are committed. **A fresh clone
renders the site correctly with none of the data below.** These files are needed
only to *rebuild* a `.js`.

Set up once per machine:

```sh
git config core.hooksPath .githooks    # 2 MB size guard on commits
```

## The rule

| Class | Where | Committed? |
|---|---|---|
| Code and hand-maintained crosswalks | `analysis/{R,src}/` | yes |
| Publish artifacts the site loads | `data/*.js` | yes &mdash; **the contract** |
| Raw downloads | `analysis/inputs/` | no, 5.7 GB |
| Built intermediates | `analysis/interim/` | no, 62 MB |
| Small and genuinely irreplaceable | `analysis/frozen/` | yes, 1.7 MB |

If a script can rebuild it, it is not committed. `frozen/` is the exception and
every file in it is listed below with the reason.

---

## Raw inputs

Sizes are as of 2026-08-01. Every `src/fetch/` script accepts `--out=<dir>`, so a
fetch can be proved to work into a scratch directory without disturbing the cache
the rest of the pipeline is being verified against. Use it.

| Path under `analysis/inputs/` | Size | Needed by | How to get it back |
|---|---|---|---|
| `bls/ces.RDS` | 3.6 GB | `clean/ces_jolts.R`, which caches `interim/bls/ces_slim.rds` | `Rscript src/fetch/ces_jolts.R --only=ces` &mdash; needs `BLS_EMAIL`; tens of minutes |
| `bls/jolts.RDS` | 217 MB | same, caches `jolts_slim.rds` | `Rscript src/fetch/ces_jolts.R --only=jolts` |
| `cps/cps.dat.gz` + `cps.xml` | 788 MB | `clean/cps_age_education.R`, `clean/cps_industry_weights.R` | `python src/fetch/cps_ipums.py` &mdash; needs `IPUMS_API_KEY`; IPUMS queues the extract, so this is **not** fully automatable |
| `cps/cpi_monthly.csv` | 8 KB | reserved for real-wage outcomes; no card reads it today | `Rscript src/fetch/cpi.R` &mdash; needs `BLS_KEY` |
| `qwi/raw/*.csv.gz` | 948 MB, 103 files | `clean/qwi.R` | `Rscript src/fetch/qwi.R` &mdash; 103 LEHD bulk downloads, md5-verified against the published manifests |
| `btos/period_*.json` | 67 MB, 71 files | `clean/btos_survey.R` | `Rscript src/fetch/btos.R` &mdash; ~70 Census API requests on a cold start |
| `btos/strata.json` | 16 KB | `R/btos_frame.R` (MSA names for Adoption 05) | same |
| `btos/AI_Supplement_Table_2026.xlsx` | 580 KB | `clean/btos_supplement.R` | same |
| `btos/{Sector,Subsector,Employment_Size_Class}.xlsx` | 8 MB | **nothing** &mdash; reference workbooks. The employment-size labels in `clean/btos_survey.R` were transcribed from one of them by hand. Safe to delete. | download from the BTOS Downloads page |
| `exposure/yale_*.csv` | 80 KB | `clean/exposure.R` | `Rscript src/fetch/exposure.R` &mdash; sha256-pinned, see below |
| `fred/fred_series.csv` | 40 KB | `exhibits/jobs_01_okun.R` | `Rscript src/fetch/fred.R` &mdash; no key needed, five named series |

Credentials live in `~/.Renviron` and are read with `Sys.getenv()`. Never
printed, never committed:

| Variable | Needed by | Get one at |
|---|---|---|
| `BLS_KEY` | `fetch/cpi.R` | https://data.bls.gov/registrationEngine/ |
| `BLS_EMAIL` | `fetch/ces_jolts.R` (BLS asks for a contact address on flat-file requests) | any address you read |
| `IPUMS_API_KEY` | `fetch/cps_ipums.py` | https://account.ipums.org/api_keys |

`fetch/fred.R`, `fetch/btos.R`, `fetch/qwi.R` and `fetch/exposure.R` need no
credentials at all.

### Two inputs that are pinned rather than merely cached

**Exposure.** `src/lookups/exposure_sources.csv` records a URL, an immutable
commit pin and a sha256 for each Yale file. `fetch/exposure.R` verifies the hash
and **stops** on a mismatch, because a pinned upstream file that changed means
every downstream number moved silently. A new index is one row in that registry;
run with `--adopt` to record the hash for a row you have just added and inspected.

**QWI.** `latest_release` is a moving pointer, and LEHD reissues individual
states between releases. `interim/qwi/qwi_manifest.csv` records the md5 of every
file actually on disk and `qwi_fetch_vintage.txt` when it was resolved. Re-running
`fetch/qwi.R` replaces any state whose published md5 no longer matches, which
means **it can leave `inputs/` ahead of `interim/`** if you do not then re-run
`clean/qwi.R`. If you only want to check integrity without moving the cache, run
it with `--out=<scratch dir>`.

---

## Built intermediates

`analysis/interim/` is 62 MB and entirely regenerable. Nothing needs backing up.
The two expensive ones are cached rather than rebuilt by default, and `run.R`
skips them unless you pass `--refresh`:

| Intermediate | Cost | Skipped unless |
|---|---|---|
| `interim/cps/age_month_totals.csv` | re-parses the 788 MB extract | `--refresh jobs-displacement` |
| `interim/qwi/qwi_naics3_age_quarter.rds` | reassembles 103 state files | `--refresh jobs-young-workers` |

`clean/ces_jolts.R` is a third case: it reuses `interim/bls/*_slim.rds` unless
given `--reslim`, because deriving them loads a 3.6 GB file. `--refresh` passes
`--reslim` for you.

---

## `frozen/`: the committed exceptions

Each is small and cannot be regenerated without an input that is not committed,
so a fresh clone could not rebuild the card that needs it. Each has a matching
`!` exception in `.gitignore`.

| File | Size | Produced by | Rebuilding it needs |
|---|---|---|---|
| `cps_occ_ind_weights.rds` | 1.6 MB | `clean/cps_industry_weights.R` | the 788 MB IPUMS extract (account required). **Load-bearing**: `clean/exposure.R` reads this copy, so Adoption 02 works in a fresh clone. |
| `t1_adoption_exposure.csv` | 32 KB | `exhibits/adoption_02_exposure.R` | the 948 MB LEHD QWI cache (employment weights for pooling two BTOS subsectors) |
| `t1_coefs.csv` | 4 KB | same | same |
| `t1_slope_over_time.csv` | 4 KB | same | same |
| `tests_industry_meta.json` | 4 KB | pre-refactor `micro/03_tests_industry.R` | the QWI cache; carries the vintage and assertion record for the three above |

The four `t1_*` / `tests_industry_meta` files are **archival, not load-bearing**:
`exhibits/adoption_02_exposure.R` now regenerates its own copies into
`interim/exposure/`, and no script reads the frozen ones. They are kept because
they are the snapshot the published `btos-exposure-data.js` was built from and
they cost 44 KB. `cps_occ_ind_weights.rds` is different: delete it and Adoption
02 stops working without an IPUMS account.

`clean/cps_industry_weights.R` deliberately writes to `interim/` and only
*compares* against the frozen copy, printing whether they match. Pass `--promote`
to overwrite the committed one on purpose. A rebuild that silently replaced a
committed artifact would be the one thing here nobody could audit.

If you add a file to `frozen/`, add a `!` line to `.gitignore` **and** a row
here, and commit it alongside the code change that produced it.

---

## Rebuild entry points

| Cadence | Command | Then commit |
|---|---|---|
| Biweekly, new BTOS period | `Rscript analysis/run.R --refresh btos` | `data/btos-data.js` |
| Monthly, jobs day | `Rscript analysis/run.R --refresh jobs-displacement` | `data/jobs-displacement-data.js` |
| New CES / JOLTS vintage | `Rscript analysis/run.R --refresh btos-jobs-monitor` | `data/btos-jobs-monitor-data.js` |
| New QWI release (quarterly) | `Rscript analysis/run.R --refresh jobs-young-workers` | `data/jobs-young-workers-data.js` |
| Exposure source update (rare) | `Rscript analysis/run.R --refresh btos-exposure` | `data/btos-exposure-data.js` |
| CPS extract rebuild (rare) | `python analysis/src/fetch/cps_ipums.py`, then `Rscript analysis/src/clean/cps_industry_weights.R --promote`, then `Rscript analysis/run.R --refresh btos-exposure jobs-displacement` | `frozen/cps_occ_ind_weights.rds` and the two `.js` |

`Rscript analysis/run.R --list` prints the same thing from the code, so it cannot
go stale. Without `--refresh` nothing touches the network, which is what makes a
rebuild reproducible: same inputs in, same numbers out.

After any rebuild, prove nothing moved that you did not intend to move:

```sh
Rscript analysis/tests/compare_golden.R <dir of previous data/*.js>
```
