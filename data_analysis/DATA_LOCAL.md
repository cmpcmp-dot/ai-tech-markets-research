# Local-only data

Everything in this repository that is *not* committed, why, and how to get it
back. If a script stops with "file not found", the answer is on this page.

Set up once per machine:

```sh
git config core.hooksPath .githooks    # 2 MB size guard on commits
```

## The rule

| Class | Where | Committed? |
|---|---|---|
| Code, crosswalks, sha-pinned small raw inputs | `data_analysis/<pipeline>/` | yes |
| Publish artifacts the site loads | `data/*.js` | yes — **the contract** |
| Regenerable intermediates | `data_analysis/**/output/` | no |
| Irreplaceable small snapshots | five named files below | yes |
| Multi-hundred-MB inputs | `data_analysis/{job_data,qwi/output,data}/` | no |

`index.html` only ever reads `data/*.js`, and those are committed. **A fresh
clone renders the site correctly with none of the data below.** These files are
needed only to *rebuild* the `.js`.

---

## Large inputs: symlinked, not copied

On this machine the three big inputs are symlinks into the older research repo,
which is left in place as their physical home:

```
data_analysis/job_data    -> ~/Documents/command_line_AI_projects/job_displacement_AI/job_data
data_analysis/qwi/output  -> ~/Documents/command_line_AI_projects/job_displacement_AI/qwi/output
data_analysis/data/cps.dat.gz, cps.xml
                          -> .../job_displacement_AI/data/{cps.dat.gz,cps.xml}
```

Nothing is duplicated (that folder is 9.6 GB) and git sees none of it. If that
folder ever moves or is deleted, replace each symlink with a real directory and
re-fetch per the table below — no script changes are needed either way.

| Path under `data_analysis/` | Size | Needed by | How to get it back |
|---|---|---|---|
| `job_data/ces.RDS` | 3.8 GB | `btos/03_jobs_join.R`, first run only — it caches `btos/output/ces_slim.rds` | `library(tidyusmacro); write_rds(getBLSFiles("ces", "<your email>"), "job_data/ces.RDS")` |
| `job_data/jolts.RDS` | 210 MB | same (caches `jolts_slim.rds`) | same, with `getBLSFiles("jolts", ...)` |
| `qwi/output/qwi_naics3_age_quarter.rds` | 4.5 MB | `micro/03_tests_industry.R` tests T4/T6, `micro/06_qwi_dynamics.R` | `Rscript qwi/01_fetch_qwi.R` then `02_build_qwi.R` — ~100 state pulls, ~940 MB of raw `.csv.gz` under `qwi/output/raw/` |
| `data/cps.dat.gz` + `cps.xml` | 818 MB | `micro/01_build_cps_panel.R` | `python data_analysis/micro/99_download_ipums.py` — needs `IPUMS_API_KEY` in `~/.Renviron`; IPUMS queues the extract, so this is not fully automatable |
| `data/cpi_monthly.csv` | 6 KB | `micro/01_build_cps_panel.R` (real deflator) | `Rscript micro/00_pull_cpi.R` — needs `BLS_KEY` |
| `btos/output/raw/period_*.json` + `*.xlsx` | 76 MB | `btos/02_build_btos.R` | `Rscript btos/01_fetch_btos.R` — ~70 Census API requests on a cold start |
| `micro/output/*.rds`, `*.csv`, `*.log` (bar the five below) | 12 MB | the SDID chain `micro/{02,04,05}_*.R` and `run_micro.R` | `micro/01_build_cps_panel.R`, which needs the 818 MB IPUMS extract |
| `exposure/output/*`, `data_analysis/output/*`, `btos/output/*` | < 10 MB | the `run_*.R` serializers | re-run the pipeline that owns them; all are pure functions of committed code plus network sources |

`data_analysis/data/` is deliberately **not** the same directory as the site's
`data/`. The first is this ignored input cache; the second is the committed
publish directory. `_paths.R` names them `da_path("data")` and
`repo_path("data")` respectively. This is the one genuine trap in the layout.

⚠️ `micro/00_pull_cpi.R` writes `cpi_monthly.csv` into `data_analysis/data/`,
which is a real directory here, so it will not write into the older repo. The
two `cps.*` symlinks are read-only in practice — nothing in this pipeline
rewrites them.

---

## Committed snapshots (the five exceptions)

These live under an ignored `output/` directory and are re-included by name in
`.gitignore`. Each is small and **cannot be regenerated** without an input we do
not keep, so losing them would mean losing the result.

| File | Size | Produced by | To rebuild you would need |
|---|---|---|---|
| `micro/output/cps_occ_ind_weights.rds` | 1.7 MB | `micro/01_build_cps_panel.R` | the 818 MB IPUMS CPS extract (account required) |
| `micro/output/t1_adoption_exposure.csv` | 64 KB | `micro/03_tests_industry.R` | the 988 MB LEHD QWI panel (employment weights for pooling two BTOS subsectors) |
| `micro/output/t1_coefs.csv` | 4 KB | same | same |
| `micro/output/t1_slope_over_time.csv` | 4 KB | same | same |
| `micro/output/tests_industry_meta.json` | 4 KB | same | same — carries the vintage/assertion record for the three above |

If you add a snapshot to this set, add a `!` line to `.gitignore` **and** a row
here. If you regenerate one, commit it in the same commit as the code change
that produced it, so the provenance stays legible.

---

## Pipeline entry points

| Cadence | Commands | Then commit |
|---|---|---|
| Biweekly (new BTOS period) | `Rscript data_analysis/btos/{01_fetch_btos,02_build_btos,run_btos}.R` | `data/btos-data.js` |
| Monthly (jobs data) | `Rscript data_analysis/scripts/run_all.R --refresh` | `data/jobs-displacement-data.js` |
| New CES/JOLTS vintage | `Rscript data_analysis/btos/{03_jobs_join,run_jobs}.R` | `data/btos-jobs-monitor-data.js` |
| Exposure source update (rare) | `Rscript data_analysis/exposure/{01_fetch_exposure,02_build_exposure}.R`, then `micro/{03_tests_industry,run_exposure}.R` | `data/btos-exposure-data.js` |
| CPS microdata rebuild (rare) | `python data_analysis/micro/99_download_ipums.py`, then `Rscript data_analysis/micro/{00_pull_cpi,01_build_cps_panel,02_sdid_replicate,04_sdid_extensions,05_goldman_cps,06_qwi_dynamics,run_micro}.R` | `micro/output/cps_occ_ind_weights.rds` and any changed snapshot |

`micro/run_micro.R` writes `data/microdata.js`. **Nothing in `index.html` loads
that file yet** — it was the payload for the older repo's `paper.html` /
`btos.html` dashboards, which were not ported. It is wired to the right
directory so it will work if those exhibits are ever brought over.

## Notes carried over

- **ASCII only in generated strings.** R runs in the `C` locale on this machine
  and mangles non-ASCII source bytes. All generated `data/*.js` are ASCII-clean.
- **Everything BTOS is firm-weighted.** Census publishes no employment-weighted
  adoption figure and the pipeline does not invent one.
- **The 2025-11-17 BTOS wording break is never spliced** and the Oct–Nov 2025
  shutdown gap is left open, not interpolated.
- **Suppressed cells are kept and marked**, never dropped silently.
- **`02_build_btos.R` asserts sanity anchors** and fails the build on drift.
  That is intentional; check for a Census revision before relaxing an anchor.
