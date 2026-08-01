# Porting status

The `data_analysis/` → `analysis/` refactor is partly done. This file says
exactly what is left, so the next session does not have to rediscover it.

Nothing is broken. `data_analysis/` is intact and the two unported contracts
still build from it with their original commands.

## Done and verified

| Contract | Cards | Verification |
|---|---|---|
| `data/btos-data.js` | Adoption 01, 03, 04, 05, 06 | every value identical |
| `data/btos-exposure-data.js` | Adoption 02 | identical; 5 intermediates byte-identical |
| `data/jobs-displacement-data.js` | JD 01, 02 | zero numeric differences (card 01 verified old-vs-new on one FRED pull) |

Also done: 5.7 GB of inputs copied into `analysis/inputs/` and sha256-verified,
so the repository no longer depends on `~/Documents/command_line_AI_projects/
job_displacement_AI`. `.gitignore` rewritten. Golden-diff harness built.

## Remaining

### 1. Port `btos-jobs-monitor-data.js` (JD cards 03, 04)

From `data_analysis/btos/03_jobs_join.R` (719 lines) and `run_jobs.R`.

Target shape:

```
src/fetch/ces_jolts.R    getBLSFiles("ces"/"jolts") -> inputs/bls/
src/clean/ces_jolts.R    slim extracts + BTOS adoption by sector + terciles
                         -> interim/bls/{ces_slim,jolts_slim}.rds
src/exhibits/jobs_03_industries.R   the `a1` block (CES employment by tercile)
src/exhibits/jobs_04_flows.R        the `a2` block (JOLTS flows by tercile)
src/publish/btos_jobs_monitor.R
```

The care point: `a1` (line ~325) needs `sector_grp`, which is built from
`xs_sector`, which is also the input to the cross-section regressions that are
being deleted. Keep the adoption-and-tercile construction, drop the regression
machinery. Read lines 40–360 properly before cutting.

Delete on the way through, per the agreed scope (nothing reads `J.monitor`):
- D1–D6, roughly lines 467–620: `board`, `decomp`, `quad`, `mde`, `scorecard`,
  `nat_adopt`, `total_private_chg`
- the cross-section regression grid, placebos, AV plot, panel fits
- `MONITOR_KEEP` in `run_jobs.R`

`ALLOWED_REMOVALS` in `tests/compare_golden.R` already declares `monitor`, so
the golden-diff will pass once only `a1`/`a2` and the top-level keys remain.
Inputs are frozen on disk, so this one must reproduce exactly.

### 2. Port `microdata.js` (JD card 05), and rename it

From `micro/03_tests_industry.R` (test T4 only), `micro/06_qwi_dynamics.R`,
`micro/run_micro.R`.

The shared setup is already ported: `clean/btos_qwi_join.R` writes
`interim/qwi/{adoption_naics3,qwi_windows}.csv`, which is exactly what T4 needs.

```
src/fetch/qwi.R                     ~100 state pulls -> inputs/qwi/raw/
src/clean/qwi.R                     from qwi/02_build_qwi.R
src/exhibits/jobs_05_young_workers.R   T4 + the QWI event study
src/publish/jobs_young_workers.R
```

Keep only `t4` and `qwi`. Drop `replication`, `t1`, `t2`, `t3`, `t5`, `t6`,
`goldman`, `sources` — no chart reads any of them. Within `06_qwi_dynamics.R`,
check whether `qwi_placebo`, `qwi_robust`, `qwi_loo` and `qwi_descriptive`
reach the published `qwi` key; prune under the same rule if not.

**Approved rename**: `data/microdata.js` → `data/jobs-young-workers-data.js`,
global `MICRO_DATA` → `JOBS_YOUNG_WORKERS`. After the prune the file holds only
QWI early-career results and the old name misleads. Requires a one-line
`<script src>` change in `index.html` (line ~2595) and `jobs_displacement.html`
(line ~782), plus the three `M.` references in `assets/jobs-charts.js`.
`tests/compare_golden.R` already maps `microdata.js` to the new filename.

### 3. Port the remaining source scripts

Mostly mechanical moves with a path rewrite. Each `src/fetch/` script must
accept `--out=<dir>` via `fetch_dir()` so it can be proved to work into a
scratch directory without disturbing the cached inputs.

| New file | From |
|---|---|
| `src/fetch/btos.R` | `btos/01_fetch_btos.R` |
| `src/fetch/exposure.R` | `exposure/01_fetch_exposure.R` |
| `src/fetch/qwi.R` | `qwi/01_fetch_qwi.R` |
| `src/fetch/cps_ipums.py` | `micro/99_download_ipums.py` |
| `src/clean/qwi.R` | `qwi/02_build_qwi.R` |
| `src/clean/cps_industry_weights.R` | `micro/01_build_cps_panel.R`, **trimmed** |
| `src/fetch/cpi.R` | `micro/00_pull_cpi.R` |

`cps_industry_weights.R` is approved to be trimmed to produce only
`cps_occ_ind_weights.rds`; the other three `.rds` it writes existed solely for
the deleted SDID chain. Verify by checksum against `frozen/cps_occ_ind_weights.rds`.

### 4. Deletions (approved, not yet done)

Hold until the ports above are verified, because the old scripts are the
reference being compared against.

```
99_area_test.R
data_analysis/exposure/make_crosswalk.R
data_analysis/scripts/03_ces_slowdown.R
data_analysis/micro/02_sdid_replicate.R
data_analysis/micro/04_sdid_extensions.R
data_analysis/micro/05_goldman_cps.R
data_analysis/micro/sdid_core.R
assets/jobs-monitor-charts.js
```

Then remove `data_analysis/` entirely and drop its `.gitignore` block.

Keep `micro/07_age_bands_cps.R` in mind as a *counter*-example: it looked dead
in the old README but is live, and its logic now lives in
`exhibits/jobs_02_age_bands.R`. Check before deleting anything else.

### 5. Prune dead JS (approved)

In `assets/adoption-charts.js`, delete `renderExpect()` (targets `#adExpect`)
and `renderGeography()` (targets `#adMSA`/`#adStates`) — none of those elements
exist in `index.html` — and their entries in `renderAll()`. `renderStateMap()`
stays; it is the map that actually draws.

### 6. Update path references shown to readers

Twelve strings in `index.html` and `jobs_displacement.html` cite
`data_analysis/...` paths as source credits. They must point at the new files
or the site cites things that do not exist.

```
data_analysis/btos/crosswalk_btos_jolts.csv  -> analysis/src/lookups/crosswalk_btos_jolts.csv
data_analysis/scripts/run_all.R              -> analysis/run.R jobs-displacement
data_analysis/micro/run_micro.R              -> analysis/run.R jobs-young-workers
data_analysis/btos/README.md                 -> analysis/README.md
data_analysis/exposure/README.md             -> analysis/README.md
```

`assets/jobs-charts.js` line ~313 cites
`data_analysis/micro/07_age_bands_cps.R`; the exhibit already emits the new
path in `source.computed_by`, so point the chart at that field or update the
string.

Also update `CONTEXT.md`, which describes the old layout, and
`.githooks/pre-commit`, which references `data_analysis`.

### 7. Write `INPUTS.md`

One row per uncommitted input: size, which script needs it, how to re-fetch.
The content exists in `data_analysis/DATA_LOCAL.md`; it needs rewriting for the
new paths, and the symlink section deleted since nothing is symlinked now.
