# Job displacement analysis

R pipeline behind the **Job displacement** tab (`jobs_displacement_prototype.html`).
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
