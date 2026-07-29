# Data analysis

Two independent R pipelines, each ending in a `window.*` JS global that
`index.html` loads as a classic script. No build step, no chart library, no CDN,
works over `file://`.

| Pipeline | Feeds | Global | Directory |
|---|---|---|---|
| Job displacement | Job Displacement tab, sections 01-03 | `JOBS_DISPLACEMENT_DATA` | `scripts/` |
| BTOS adoption | **Adoption tab** + Job Displacement section 04 | `BTOS_DATA`, `BTOS_EXPOSURE`, `BTOS_JOBS_MONITOR` | `btos/`, `exposure/`, `micro/` |

The BTOS pipeline has its own documentation: **[`btos/README.md`](btos/README.md)**
for the survey side and **[`exposure/README.md`](exposure/README.md)** for the
occupational-exposure side. Read those before touching either. A condensed run
order for the Adoption tab is at the bottom of this file.

---

# Job displacement analysis

R pipeline behind sections 01-03 of the **Job displacement** tab.
It answers three questions, each with a chart and a one-line verdict:

1. **Is unemployment higher than we would expect?** Okun's law (GDP growth vs.
   change in unemployment), the current rate vs. CBO's natural rate, and a
   prime-age participation companion.
2. **Is the weakness spread evenly, or concentrated?** Residual unemployment by
   age and education, relative to each group's pre-2020 relationship to the
   overall rate.
3. **Where has job growth slowed the most?** CES payroll growth over the past
   year vs. the 2015-2019 pace, for the 11 major supersectors.

## Layout

```
data_analysis/
  scripts/
    01_okun.R          -> output/okun.json          (FRED: GDPC1, UNRATE, NROU, LNS11300060, LNS12300060)
    02_age_bands.R     -> output/age_bands.json      (snapshot of committed CPS residual CSV; IPUMS regen TBD)
    03_ces_slowdown.R  -> output/ces_slowdown.json   (BLS CES flat files via getBLSFiles)
    run_all.R          -> ../data/jobs-displacement-data.js
  output/              (intermediate JSON + CSV snapshots, safe to regenerate)
```

The HTML loads `data/jobs-displacement-data.js` (a `window.JOBS_DISPLACEMENT_DATA`
global, same pattern as `data/tracker-data.js`) and draws every chart as inline
SVG with vanilla JS. No build step, no chart library, works over `file://`.

## Regenerate

```bash
# assemble the JS from existing output/ (fast, no downloads)
Rscript data_analysis/scripts/run_all.R

# regenerate all data from source, then assemble (the monthly job)
Rscript data_analysis/scripts/run_all.R --refresh
```

`--refresh` re-pulls FRED, the CES flat files, and the age-band CSV, recomputes
all three sections, and rewrites the JS (~30s). Then commit
`data/jobs-displacement-data.js`.

## Notes / caveats

- **Generated strings are ASCII only.** This machine's R runs in the `C` locale,
  which mangles non-ASCII source bytes (an em-dash becomes `<e2><80><94>`). Keep
  verdict/label strings ASCII, or run under a UTF-8 locale.
- **Okun fit** excludes 2020 Q2-Q3 (pandemic outliers); they are off the plotted
  scale and dropped from the regression, not the data.
- **Section 2 is a snapshot.** The IPUMS CPS microdata is not committed upstream,
  so `02_age_bands.R` pulls the blog repo's plot-ready residual CSV. When the
  IPUMS pipeline is wired up, only `SRC_URL` / the read step changes; the JSON
  contract stays the same.
- **Monthly automation seam:** `run_all.R --refresh` is the single entry point a
  cron/scheduled task should call, followed by a commit of the JS. Not yet wired.

Source for §2 method: github.com/mtkonczal/Blog-Posts-Presentations-and-Testimony
/blogs_2026/01_education_young_unrate

---

# BTOS adoption analysis

Everything behind the **Adoption** tab, plus section 04 of Job Displacement.
Ported from the `job_displacement_AI` research repo on 2026-07-28; that repo is
a stop-gap and this copy is the one to maintain.

## Layout

```
data_analysis/
  btos/
    01_fetch_btos.R    -> output/raw/period_*.json + AI_Supplement_Table_2026.xlsx  (NETWORK)
    02_build_btos.R    -> output/btos_ai_long.csv, btos_ai_supplement_long.csv, btos_data.json
    run_btos.R         -> ../../data/btos-data.js                 (window.BTOS_DATA)
    03_jobs_join.R     -> output/btos_jobs.json + tidy coefficient CSVs
    run_jobs.R         -> btos_jobs.json  (see "monitor slice" below)
    crosswalk_btos_jolts.csv, crosswalk_btos_qwi.csv, naics_titles.csv   (committed lookups; edit these, not the R)
  exposure/
    01_fetch_exposure.R -> raw/yale_ai_exposure_occ2010.csv        (NETWORK, sha256-pinned)
    02_build_exposure.R -> output/exposure_naics3.csv, exposure_occ2010.csv, ...
  micro/
    03_tests_industry.R -> output/t1_adoption_exposure.csv, t1_coefs.csv, t1_slope_over_time.csv
    run_exposure.R      -> ../../data/btos-exposure-data.js       (window.BTOS_EXPOSURE)
```

## Regenerate

**Biweekly, when Census posts a new BTOS period** — the only routine job:

```bash
Rscript data_analysis/btos/01_fetch_btos.R   # incremental: new periods + a re-pull of the latest 3
Rscript data_analysis/btos/02_build_btos.R   # offline, fails loudly on sanity-anchor drift
Rscript data_analysis/btos/run_btos.R        # -> data/btos-data.js
```

Then open `index.html`, eyeball the Adoption tab, and commit `data/btos-data.js`.

**When new BLS vintages land** (CES/JOLTS calendar, not the BTOS cadence):

```bash
Rscript data_analysis/btos/03_jobs_join.R
Rscript data_analysis/btos/run_jobs.R
```

`03_jobs_join.R` reads CES and JOLTS RDS extracts pulled separately with
`tidyusmacro::getBLSFiles`; the raw CES file is ~3.8 GB and is **not** committed.
It caches slim extracts to `btos/output/{ces,jolts}_slim.rds` on first run.

**Exposure join** — effectively frozen; rerun only if an exposure source updates:

```bash
Rscript data_analysis/exposure/01_fetch_exposure.R
Rscript data_analysis/exposure/02_build_exposure.R
Rscript data_analysis/micro/03_tests_industry.R   # needs the QWI panel, see below
Rscript data_analysis/micro/run_exposure.R        # -> data/btos-exposure-data.js
```

`03_tests_industry.R` also builds tests T4 and T6, which need the LEHD QWI
panel that is not committed here; it will stop with an explanation if you run it
without one. Its T1 outputs are committed, so `run_exposure.R` works on its own.

## What was deliberately not copied

Three inputs are too large to commit and are either re-fetchable or not needed
for a refresh. If a script errors looking for one of these, this is why:

| Missing | Size | Needed for | How to get it back |
|---|---|---|---|
| `btos/output/raw/period_*.json` | 76 MB | rebuilding `btos_data.json` from scratch | `01_fetch_btos.R` re-downloads from the Census API; the first run after a fresh clone costs ~70 requests |
| `qwi/output/` (LEHD) | 988 MB | the employment weights used to pool two BTOS subsectors in T1 | already baked into `micro/output/t1_adoption_exposure.csv`; only needed to rebuild T1 from raw |
| `data/cps.dat.gz` (IPUMS CPS extract) | 818 MB | building `micro/output/cps_occ_ind_weights.rds` | that `.rds` **is** committed here (1.7 MB); the extract requires an IPUMS account and is not automatable |

Two of the three generated files are deliberate **slices** rather than whole
contracts, because the research repo's dashboard needed far more than this site
does. `run_exposure.R` emits only test T1; `run_jobs.R` emits only the
descriptive monitor block, not the 96 cross-section coefficients or the panel.
Both serializers name the kept keys at the top of the file — add to those lists
if you add an exhibit that needs more.

## Things that will bite you

- **Everything BTOS is firm-weighted.** Census publishes no employment-weighted
  adoption number and the pipeline does not invent one. The firm-size gradient
  is the substitute; see `btos/README.md`.
- **The 2025-11-17 wording break is never spliced**, and the Oct-Nov 2025
  shutdown gap is left open, not interpolated. A few later periods re-ask the
  retired wording; those rows stay in the tidy CSV and are dropped from every
  chart. If you add a chart, preserve this.
- **Suppressed cells are kept and marked**, never dropped silently.
- **ASCII only in generated strings** (same `C`-locale issue as above). All
  three generated `data/btos-*.js` files are ASCII-clean; keep them that way.
- **`02_build_btos.R` asserts sanity anchors** and fails the build if they
  drift. That is intentional. If it fires, check whether Census revised the
  series before relaxing the anchor.
