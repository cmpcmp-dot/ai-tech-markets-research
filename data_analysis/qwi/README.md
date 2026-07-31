# QWI — the flows layer

Census Quarterly Workforce Indicators, built from LEHD matched employer-employee
records. This is the only public source with labor **flows by industry and age**,
which is where the AI displacement signal is supposed to show up. It needs no
restricted-data agreement.

```bash
Rscript qwi/01_fetch_qwi.R    # 103 bulk files, ~940 MB, md5-verified (network)
Rscript qwi/02_build_qwi.R    # -> national NAICS3 x age x quarter panel (offline, asserts)
```

`01` is incremental: a cached file whose md5 matches is skipped, so a re-run
after a new LEHD release costs only the files that changed.

## Why bulk files and not the API

The API (`api.census.gov/data/timeseries/qwi/sa`) works and is authenticated
with `CENSUS_API_KEY`, but it has no national geography (`for=us:1` errors) and
rejects wildcards and comma-lists on `industry` and `agegrp`. Covering NAICS3 ×
51 states × 9 age groups would take on the order of 10,000 requests. The bulk
files cover the same ground in 103 downloads and ship published checksums.

## Files

| File | Role |
|---|---|
| `01_fetch_qwi.R` | The only script that touches the network. Downloads, verifies md5 against the per-state `qwi_{st}.md5sum`, writes `output/qwi_manifest.csv`. |
| `02_build_qwi.R` | Pure transform. Flag rules, balanced state sets, national aggregation, both validation passes, assertions. |
| `labels/` | LEHD schema label files (flags, age groups, industry titles). |
| `output/raw/` | Cached bulk `.csv.gz`. ~940 MB. Derived, safe to delete, gitignored. |
| `output/qwi_us_sector.rds` | The **published** national sector file. The validation target, not an input to the analysis. |
| `output/qwi_state_naics3_slim.rds` | The slim state panel, 41 MB. Kept deliberately so the state × industry × age design needs no re-download. |
| `output/qwi_naics3_age_quarter.rds` | **The analysis frame.** National, NAICS3 × age × quarter. |
| `output/qwi_coverage.csv` | Per sector × age × quarter: our aggregate as a share of the published national total. |
| `output/qwi_meta.json` | Vintage, window, exclusions, assertion results. |

## What the current build produced (2026-07-28 vintage, LEHD release of 2026-06-04)

- **Window:** 2005Q1 – 2025Q2, 82 quarters. Ends where the published national
  ends, which is also where Tucker's sample ends.
- **96 NAICS3 subsectors**, 9 age groups (`A00` all, `A03` = 22–24, `A05` = 35–44).
- **49 of 51 geographies.** Alaska stops at 2016Q2 and Michigan at 2021Q4 in this
  vintage. Letting the slowest state bound the panel would have cost nine years,
  so both are excluded; the measured price is **3.75%** of national employment.
- **Not seasonally adjusted.** LEHD publishes no adjusted variant at this cut.
  Use four-quarter changes rather than adjusting.

## Two things that will bite anyone reading the raw files

**Status flags.** Every measure ships a companion flag (`label_flags.csv`):

| Flag | Meaning | Treatment |
|---|---|---|
| 1, 6, 10 | OK / derived / aggregated, clean | used |
| 7, 9, 12 | released but **significantly distorted** (fuzzed) | used, carried as a `distorted` share |
| −2, −1, 5, 11 | no data / not computable / **suppressed** / withheld | set missing |

Distorted values are kept rather than dropped. Dropping them would bias the
sample against exactly the small, fast-moving cells this analysis is about, so
the caveat travels with the data instead.

**Balanced state sets.** Summing states naively produces a national series with
fake growth: a state suppressed in 2019 and released in 2024 arrives as a level
shift. For each (industry × age) cell we keep only the states that report it in
*every* quarter of the window. A consistent aggregate of 43 states beats an
inconsistent aggregate of 49.

## Validation (the build fails if V1a drifts)

- **V1a — is the summing logic right?** All 51 geographies, restricted to the era
  when all 51 still reported, sector level, against the *published* national
  file. Median gap **−0.031%**. This is the assertion; anything above 2% stops
  the build.
- **V1b — what did excluding the laggards cost?** −3.75% of national employment.
  Reported, not asserted.
- **V2 — what does NAICS3 suppression cost?** Rolling our NAICS3 panel up to
  sectors recovers a median **94.6%** of published national employment
  (min 86.6%, educational services). Cells below a 60% floor are flagged
  `low_coverage`; currently only utilities × ages 14–18.

`EmpS` is full-quarter employment, so it needs the following quarter's records
and is not computable in the newest quarter. Coverage is therefore reported at
2025Q1, one quarter behind the panel's end.

**Hire rates above 100% are real, not a bug.** `HirA` counts every hire including
short spells; `EmpS` excludes anyone who did not last a full quarter. In small
seasonal cells the ratio is genuinely large — 6.9% of cells exceed 100%, and the
maximum is 1,721%. They are reported rather than capped.

## Joining to BTOS

**52 BTOS subsectors match a QWI NAICS3 code** and carry at least three
unsuppressed pre-break adoption readings. For comparison, the existing CES
subsector cross-section runs on 46, and it has no age dimension at all.

The unmatched codes fall into two groups, and only the second is a real loss:

1. **BTOS rollups.** Codes like `210`, `23X`, `XXX` are sector totals and "other"
   residuals, not subsectors. Correctly excluded.
2. **NAICS vintage.** QWI has restated its entire history to **NAICS 2022**;
   BTOS is **NAICS 2017**. Retail (BTOS `442`–`454` against QWI `449`, `455`–`459`)
   and part of information and finance (`511`/`515` against `513`/`516`,
   `521`/`525`) do not line up at three digits. Where the 2017→2022 mapping is
   many-to-one the BTOS side can be aggregated; where it is one-to-many it
   cannot be split and the industry is dropped. That mapping lives in
   `crosswalk_btos_qwi.csv` as a committed, human-readable file with a note
   column — edit that, not the R.
