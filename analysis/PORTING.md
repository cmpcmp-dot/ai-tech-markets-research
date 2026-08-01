# Porting record

The `data_analysis/` → `analysis/` refactor is **complete**. `data_analysis/` has
been deleted. This file is the record of what moved, what was checked, and the
handful of judgement calls that are worth knowing about later.

For how to use the result, read `README.md`. For how to rebuild anything, read
`INPUTS.md`. Neither depends on this file.

## What every contract was checked against

`tests/compare_golden.R` at 1e-9 relative, ignoring vintage stamps and allowing
only declared key removals.

| Contract | Golden was | Result |
|---|---|---|
| `btos-jobs-monitor-data.js` | the genuine pre-refactor artifact | every value identical |
| `jobs-young-workers-data.js` (was `microdata.js`) | the genuine pre-refactor artifact | every value identical |
| `btos-data.js` | already-ported output | every value identical (regression check) |
| `btos-exposure-data.js` | already-ported output | every value identical (regression check) |
| `jobs-displacement-data.js` | already-ported output | every value identical (regression check) |

Intermediates were also compared directly, which is the stronger test because it
catches a compensating error the published rounding would hide:

| Intermediate | Result |
|---|---|
| `interim/bls/{ces_slim,jolts_slim}.rds` | identical to the pre-refactor extracts |
| `interim/qwi/t4_frame.csv` | identical |
| `interim/qwi/t4_coefs.csv` | identical to 4e-15 (the `fixest` triple difference) |
| `interim/qwi/qwi_{event_study,event_legs,placebo,robust,descriptive}.csv` | identical |
| `frozen/cps_occ_ind_weights.rds` | rebuilt from the 788 MB extract, identical |
| `inputs/btos/period_*.json` (71), supplement workbook | `fetch/btos.R --out=<scratch>` reproduced all byte-for-byte |
| `inputs/exposure/yale_*.csv`, `inputs/cps/cpi_monthly.csv` | fetch scripts reproduced them byte-for-byte |

## Judgement calls worth knowing

**Card fragments carry 6 decimals, contracts 5.** The old pipeline wrote
`btos_jobs.json` at 6 and then the `.js` at 5, so the committed artifact contains
a double-rounded value. Rounding once at 5 instead moves about one point in
twenty by one unit in the fifth decimal. `write_card()` defaults to 6 so the two
stages reproduce it; do not override it to 5 for cards 03 and 04.

**`jolts_groups.gap` is the difference of the published figures**, not the rounded
raw difference. The old `transmute()` reused its own freshly-rounded columns, so
for professional and business services the raw gap is -1.158 but the table shows
11.66 - 12.81 = -1.15. That is the better behaviour for a display table (the
printed columns add up), so it was reproduced deliberately rather than fixed.

**`fetch/btos.R` now fetches `strata.json`.** Nothing in the old tree ever did;
it was a hand-placed file that `R/btos_frame.R` depended on, so the pipeline was
not actually reproducible from scratch. The `/strata` endpoint supplies it.

**`clean/cps_industry_weights.R` writes to `interim/` and only compares against
`frozen/`.** It needs `--promote` to overwrite the committed copy. A rebuild that
silently replaced a committed artifact would be the one thing here nobody could
audit.

**QWI vintage.** LEHD reissued six states (dc, de, ia, ma, nd, ne) on 2026-07-31,
after the input cache was first pulled. Taking the revision was a deliberate
choice made during this port: it keeps `inputs/`, `interim/` and `data/` on one
vintage. It moves the T4b headline from -7.293% to -7.299% and changes no figure
the site displays. This is why `jobs-young-workers-data.js` no longer byte-matches
the pre-refactor artifact even though the port itself was verified against it.

## What was deleted, and why nothing read it

Published but unrendered, so dropped from the contracts:

| Key | Contract | Why |
|---|---|---|
| `ces_slowdown` | jobs-displacement | chart replaced by the BTOS tercile cut |
| `expectations_vs_realized` | btos | `renderExpect()` targeted `#adExpect`, which does not exist |
| `monitor` | btos-jobs-monitor | the dashboard markup that drew it was removed 2026-07-31 |
| `sources`, `replication`, `t1`, `t2`, `t3`, `t5`, `t6`, `goldman` | jobs-young-workers | SDID and horse-race outputs; no chart read them |

Computed but never published, and now gone with the scripts that made them: the
96 cross-section regression coefficients behind cards 03 and 04, their placebos,
the added-variable plot, the quarterly panel, and the whole synthetic-DID chain
(`02_sdid_replicate.R`, `04_sdid_extensions.R`, `05_goldman_cps.R`,
`sdid_core.R`). The regressions were an identification attempt the sample could
not support: a 200k-job effect sat inside the confidence interval. Cards 03 and
04 are descriptive by design and say so on the page.

Dead JS: `renderExpect()` and `renderGeography()` in `assets/adoption-charts.js`
(their target elements have never existed in `index.html`), and
`assets/jobs-monitor-charts.js` entirely. `renderStateMap()` stays; it is the
geography chart that actually draws.

`prototypes/themes.html` is collateral. It loaded the deleted asset and contains
the three orphaned chart slots, so its monitor section and those three slots no
longer draw. It is a frozen theming prototype, it is not on the live site, and its
header now says so.

## Renamed

`data/microdata.js` → `data/jobs-young-workers-data.js`, `MICRO_DATA` →
`JOBS_YOUNG_WORKERS`. After the prune the file holds only QWI early-career
results and the old name described a four-tab research dashboard that no longer
exists. `tests/compare_golden.R` maps the old golden filename to the new one, so
the comparison above still works.

## The one deliberate loss

`data_analysis/**/output/` was gitignored, so the pre-refactor reference outputs
(`t4_coefs.csv`, `qwi_event_study.csv`, `btos_ai_long.csv`, the slim CES and JOLTS
extracts) were not in git history and are gone. Every comparison made against
them is recorded above. All of them are regenerable from `analysis/` given the
inputs in `INPUTS.md`.
