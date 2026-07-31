# Age-band residual script: what moved, and how to run it

## What this is

Section 2 of the Job Displacement tab ("is the weakness spread evenly, or
concentrated?") shows excess unemployment by age, split by education group.
Right now `data_analysis/scripts/02_age_bands.R` gets that data by downloading
a committed snapshot CSV from the blog repo
(`mtkonczal/Blog-Posts-Presentations-and-Testimony`,
`blogs_2026/01_education_young_unrate/data/age_diff_sa_3lines.csv`). It doesn't
compute anything itself.

I ported the actual computation from that repo's `01_big_graphic_YoY.R` into
`data_analysis/micro/07_age_bands_cps.R`. It is **not wired into the site
pipeline yet** — it just produces the CSV that `02_age_bands.R` would
eventually read instead of downloading. Running it does not touch
`run_all.R`, `index.html`, or anything else.

## Method (unchanged from the source script)

For each education group (College+, HS+ no BA, < HS) and a centered age band:

1. Build the group's 12-month moving-average unemployment rate from CPS
   totals (weighted by `wtfinl`).
2. Fit `log(subgroup_rate) ~ log(overall_rate)`, trained through 2019.
3. Back-transform (`exp`) to get a predicted rate at every date.
4. Average `(actual - predicted)` over the trailing window.

Positive = that group runs hotter than its pre-2020 relationship to the
overall rate would predict.

Education groups (IPUMS CPS `EDUC` codes):
- College+: `EDUC >= 111`
- HS+ (no BA): `73 <= EDUC < 111`
- < HS: `EDUC < 73`

Parameters, identical to the source script: 3-year age bands, 3-month
averaging window, trained through 2019, College+ bands start at age 22,
HS+/<HS bands start at age 19, all end at 64.

## The one thing not yet resolved

The file the site's chart actually links to today (`age_diff_sa_3lines.csv`)
has a **5-year** age band and a **6-month** window — not what the current
source script produces. There's no seasonal-adjustment step anywhere in that
repo, so "_sa" looks like a label left over from an earlier parameterization
that was never regenerated. I ported the script as it exists today rather
than guess at which parameterization is correct. Running `07_age_bands_cps.R`
will **not** reproduce the numbers on the site right now — that's expected,
and it needs a decision from you before anything gets wired in.

## Do you need to re-download the CPS microdata? No.

The script reads `data_analysis/data/cps.dat.gz` + `cps.xml` — the same
IPUMS extract `micro/01_build_cps_panel.R` already uses. I checked the DDI
(`cps.xml`) and confirmed `EDUC` is already in that extract, along with
`AGE`, `WTFINL`, `LABFORCE`, `EMPSTAT`, `YEAR`, `MONTH` — everything this
script needs. That extract is dated 2026-07-28 (three days old), so unless
you specifically want a fresher pull (e.g., a new CPS month just posted),
there's nothing to re-download. It's a symlink into `job_displacement_AI/data/`
per `DATA_LOCAL.md`, so as long as that folder is where it's always been, the
script will find it.

If you *do* want a fresh extract anyway:

```bash
python data_analysis/micro/99_download_ipums.py   # needs IPUMS_API_KEY in ~/.Renviron; IPUMS queues it, not instant
```

That overwrites `data_analysis/data/cps.dat.gz`/`cps.xml` in place; nothing
else about the command below changes.

## Command to run just this script

```bash
cd /path/to/ai-tech-markets-research
Rscript data_analysis/micro/07_age_bands_cps.R
```

Required packages: `ipumsr`, `tidyverse`, `data.table`, `zoo`, `jsonlite`
(all already used elsewhere in `data_analysis/`, so should already be
installed).

Expected output:
- `data_analysis/micro/output/age_diff_3lines.csv` — columns `center_age`,
  `age_min`, `age_max`, `edu_group`, `months`, `diff_avg`.
- `data_analysis/micro/output/age_bands_cps_meta.json` — vintage + params.
- Console: row count, list of the three education groups, a reminder that
  it isn't wired into `02_age_bands.R` yet.

Runtime: reads ~40M CPS rows but only 7 columns, so this should be well under
a minute — much faster than `01_build_cps_panel.R`, which reads all 36
columns and chunks for memory.

## Validation checks worth running after

- Row count: `length(19:64) + 2 * length(22:64)` roughly — one row per
  (group, center age) combination (College+ starts at 22, the other two at
  19, all end at 64).
- `diff_avg` should be small (single-digit percentage points as a proportion,
  so roughly -0.05 to 0.05) — anything wildly outside that range suggests a
  units or weighting bug.
- `months` should be `3` for every row (the `MONTHS_WINDOW` constant). If any
  row shows fewer, that band's data starts too late in the sample for a full
  trailing window.
- Compare `diff_avg` at a few center ages against
  `01_education_young_unrate/data/age_diff_3lines.csv` (not the `_sa` file —
  that one uses different parameters) to confirm the port matches the source
  script's own output before anything is wired in.
