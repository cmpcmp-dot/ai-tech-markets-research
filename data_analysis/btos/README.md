# BTOS AI-adoption pipeline

Downloads the Census Business Trends and Outlook Survey (BTOS) AI-adoption
series and builds the data behind [`../btos.html`](../btos.html). Tier 1–2 of the
plan in [`../plan.md`](../plan.md): headline adoption, expectations-vs-realization,
diffusion, size class, subsector, geography. All series are the **firm-weighted
"Yes" share** of the core biweekly AI question.

## Run it

```bash
Rscript btos/01_fetch_btos.R    # API + supplement XLSX -> cached raw (network)
Rscript btos/02_build_btos.R    # raw -> tidy CSVs + btos_data.json  (offline, asserts)
Rscript btos/run_btos.R         # btos_data.json -> data/btos-data.js (window.BTOS_DATA)
```

Then open `btos.html`. Biweekly refresh: re-run all three and eyeball the page.
`01` is incremental — it fetches only new periods plus a re-pull of the latest 3
(BTOS revises recent data), so a fresh release costs one or two requests.

### Tier 4 — the jobs-effects tab

A second, independent stage that joins adoption to CES and JOLTS. It reads
`job_data/ces.RDS` and `job_data/jolts.RDS` (pulled separately with
`tidyusmacro::getBLSFiles`), so re-run it when new BLS vintages land, not on the
BTOS cadence:

```bash
Rscript btos/03_jobs_join.R     # BTOS + CES + JOLTS -> btos_jobs.json + tidy CSVs
Rscript btos/run_jobs.R         # btos_jobs.json -> data/btos-jobs-data.js (window.BTOS_JOBS)
```

`03` caches slim BLS extracts to `output/{ces,jolts}_slim.rds` on first run
(the raw CES RDS is 3.8 GB); set `force_refresh <- TRUE` at the top to rebuild
them after a new BLS pull. Nothing in Tier 4 touches `02_build_btos.R`,
`data/btos-data.js` or `assets/btos-charts.js`, so a break here cannot take down
the Tier 1–3 charts.

## Files

| File | Role |
|------|------|
| `01_fetch_btos.R` | The only script that hits the network. Discovers AI periods from `/questions`, pulls `/periods/{id}/data`, filters to the AI rows, caches to `output/raw/period_XX.json`. |
| `02_build_btos.R` | Pure transform. Tidy long CSV + the six chart objects. Fails loudly on sanity-anchor drift. |
| `run_btos.R` | Wraps `btos_data.json` as `data/btos-data.js`. |
| `naics_titles.csv` | 2- and 3-digit NAICS 2017 titles (from census.gov/naics), joined for sector/subsector names. Committed lookup. |
| `output/raw/*.json` | Cached raw API responses (provenance + offline rebuild). |
| `output/raw/*.xlsx` | Reference bulk files pulled once for label mappings (empsize A–G, NAICS). Not used at runtime. |
| `output/btos_ai_long.csv` | Core biweekly series, tidy long, full provenance (includes rows dropped from charts). |
| `output/btos_ai_supplement_long.csv` | The **AI supplement** workbook, tidy long: one row per `geo_level × geo × question × answer × metric`, with `estimate`, `se`, and a `suppressed` flag. Covers National, Sector, State and Employment-size strata. Built by `02` from the XLSX. |
| `output/btos_data.json` | The display contract. |
| `03_jobs_join.R` | Tier 4. Joins adoption to CES employment/hours and JOLTS flows; runs every cross-section and panel regression; builds the displacement monitor; asserts the match counts. |
| `run_jobs.R` | Wraps `btos_jobs.json` as `data/btos-jobs-data.js`. |
| `crosswalk_btos_jolts.csv` | Committed, human-readable BTOS sector → CES industry code → JOLTS industry code, with a note column for the two pooled rows and the one dropped sector. Edit this, not the R. |
| `output/btos_jobs.json` | Tier 4 display contract. |
| `output/btos_jobs_crosssection_{sector,subsector,jolts}.csv` | Tidy analysis frames: one row per industry with adoption, outcomes and controls. |
| `output/btos_jobs_coefs.csv`, `output/btos_jobs_panel_coefs.csv` | Every coefficient on the page, tidy. Pull numbers from here rather than re-running. |
| `output/{ces,jolts}_slim.rds` | Cached slim BLS extracts. Derived, safe to delete. |

## Data facts baked in (verified 2026-07-26)

- **Source:** `https://www.census.gov/hfp/btos/api` (no auth, rate-limited).
  Adoption = share answering **Yes** to `OPTION_TEXT == "AI current"`; the
  six-month outlook is `"AI future"`.
- **Wording break (2025-11-17):** Q6 changed from "…in producing goods or
  services" to "…in any business function." Tagged by question text; the two
  segments are never spliced; a vertical rule marks the break.
- **Shutdown gap (2025-10-06 → 2025-11-16):** no collection (funding lapse); the
  chart leaves it open. It coincides with the wording break.
- **Anomalous re-asks:** a few post-break periods (e.g. **2026-03-09**) re-ask
  the retired old-wording question. Those rows are kept in `btos_ai_long.csv`
  but dropped from every chart — they belong to neither clean series.
- **Employment size classes** (labels not in the API; from the size-class XLSX
  Data Dictionary): A 1-4, B 5-9, C 10-19, D 20-49, E 50-99, F 100-249, G 250+.
- **Everything is firm-weighted and everything is public.** The core series is
  firm-weighted; the AI supplement (Tier 3) is a separate downloadable workbook
  (`AI_Supplement_Table_2026.xlsx`, Nov 2025–Feb 2026), NOT on the JSON API. `01`
  downloads it; `02` parses **all four strata** (National, Sector, State,
  Employment size) into `btos_ai_supplement_long.csv` and derives the Tier 3
  charts from it: the size gradient (Q1 by size class), sector adoption (Q1 by
  sector), business functions (Q2), generative-AI task use (Q10), the attributed
  employment effect (Q6), and barriers (Q13). BTOS publishes **no** employment-
  weighted number; we do not import one. The firm-vs-worker-exposure point is made
  with the public size gradient instead — adoption rises with firm size, so the
  firm-weighted headline understates the share of workers at AI-using firms.
- **Suppression:** `null` estimates are suppressed cells; kept and marked `†`,
  never dropped silently.
- **Ordering:** periods are ordered by `COLLECTION_START` (period ids are not
  monotonic with date and include future scheduled periods).

## Sanity anchors (build fails if these drift)

- National AI-current Yes, period 31 (Sep 2023) ≈ 3.7%.
- National AI-current Yes, period 84 ≈ 10.0%.
- Yes + No + "Do not know" ≈ 100 each period; estimates in [0,100]; SE ≥ 0;
  break date in Nov–Dec 2025.
- Supplement: firm-weighted current use in [5, 40]%; all six chart blocks
  non-empty; the size gradient is increasing (250+ firms adopt more than 1–4).
- Tier 4: the crosswalk carries all 19 non-`XX` BTOS sectors; 18 match CES
  (all but agriculture); ≥40 subsectors match CES three-digit; exactly 15 JOLTS
  groups.

## Tier 4 design notes (locked 2026-07-26)

- **Treatment** is the mean firm-weighted Yes share over the whole pre-break span
  (2023-09-11 → 2025-11-16), z-scored, requiring ≥3 unsuppressed readings. We
  first specified the opening six months only, which is cleaner on reverse
  causality, but suppression is heaviest early and that window leaves 15 sectors
  / 33 subsectors against 18 / 46, with the exclusions correlated with cell size
  and therefore with adoption. Spearman between the two is 0.91. Initial
  exposure, the post-break level and "AI future" all survive as robustness
  columns in the on-page table.
- **JOLTS carries no NAICS.** `industry_code` is the CES supersector scheme, so
  13 supersectors map one-to-one to a BTOS sector, 22+48 and 54+55+56 are pooled
  (CES employment weights; the unweighted version is shown on the page), and
  agriculture is dropped. n = 15 is the ceiling for every JOLTS cut.
- **NAICS vintage mismatch.** BTOS is 2017 NAICS, CES is 2022 NAICS. Most retail
  and part of information cannot be matched, and 541 has no separate CES
  three-digit series. The subsector sample is not a random subset.
- **The panel is the only design the wording break does not damage**: the break
  hits every industry in the same quarter, so quarter fixed effects absorb it and
  the panel runs the full span without splicing.

## The displacement monitor (tab 3)

Built from the same script, refreshing on the BLS calendar with no judgment calls
in between. Organised around the hires-versus-separations split rather than the
level of employment, because Tucker's QWI result attributes essentially all of
the early-career decline to reduced hiring, which makes payroll counts the wrong
variable at the wrong frequency.

- **Status board** — five gaps (employment growth, hires, openings, quits,
  layoffs), higher-adoption minus lower-adoption, with sparklines.
- **Hires/separations decomposition** — the change in the net hiring rate since
  2015–19 split into a hires term and a separations term, by JOLTS supersector.
- **Freeze-or-shed quadrant** — Δ hires rate against Δ layoffs rate. Currently
  every supersector but transportation sits left of zero, so the freeze pattern
  is economy-wide and not specific to AI-exposed industries. That is the
  strongest caveat on the whole build.
- **Four-digit detail** — every CES 4-digit industry inside the top adoption
  tercile since ChatGPT's release, against total private as the reference. This
  is the aggregation point made concrete. Restricted to the top tercile on
  purpose; the bottom tercile's 4-digit detail is 105 industries and nearly all
  manufacturing, which is not a control group.
- **Minimum detectable effect** — the subsector coefficient converted into jobs.
  At current sample sizes the design can only detect an effect above roughly
  **714,000 jobs**; Tucker's estimate is 159,000. A null on this dashboard is
  therefore close to uninformative about a Tucker-sized effect, and that belongs
  on the page rather than in a footnote.
- **Scorecard** — six observable implications of the displacement hypothesis
  against the current numbers.

Known gap, documented on the page: nothing here has an age dimension, and the
finding this literature turns on is an age finding. QWI is the fix and needs no
restricted-data agreement.
