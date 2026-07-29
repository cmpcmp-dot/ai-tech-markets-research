# Tier 3 (AI supplement) — status & next steps

_Last updated 2026-07-26._

## Principle: everything derives from public BTOS data

Tier 3 is built **entirely** from data we tabulate ourselves from two public
Census releases: the biweekly BTOS JSON API and the downloadable AI-supplement
workbook. There are **no** figures imported from restricted microdata or a
working paper. The earlier draft carried an employment-weighted ~32% headline
sourced from a CES working paper's reweighting of the restricted microdata; that
number and every reference to it have been removed. BTOS publishes no public
employment-weighted number, so we do not assert one.

## What we learned about the source (the key question)

**The AI supplement is NOT available on the BTOS JSON API.** Verified live:

- `/questions` and `/questions/answers` expose only QIDs 2–28; the only AI items
  are QID 6 (`AI current`) and QID 24 (`AI future`), both firm-weighted core
  biweekly questions.
- Every period 80–107 (`/periods/{id}/questions`) carries the same 22 core
  questions. No supplement QIDs anywhere.
- The supplement QIDs the API docs mention (2006–2009, 2018–2052) were an
  **erroneous** December 2025 upload that Census **removed**. They are not back.

**The supplement IS published as a downloadable workbook**, which the pipeline
pulls and parses in full:

- `AI_Supplement_Table_2026.xlsx` — collection cycle **2025-11-17 to 2026-02-08**
  (a one-time pooled cross-section, not a biweekly series).
  URL: `https://www.census.gov/hfp/btos/downloads/AI_Supplement_Table_2026.xlsx`
- Sheets: National / Sector / State / Employment(size), each with Response
  Estimates + Standard Errors, plus a Data Dictionary.
- 13 questions. "Scope" column: 1 = all firms, 2 = AI-using firms,
  3 = task-substituting firms, 4 = GenAI users, 5 = plan to use, 6 = don't plan.
  Each question sits at exactly one scope.
- Estimates are `"NN%"` strings; `"S"` = suppressed. Single-select questions put
  the value in `Estimate`; select-all questions (Q2, Q12) put it in
  `Estimate-Yes` (with No/Don't-know alongside).

## What is BUILT (this session)

Pipeline (all three stages run clean end-to-end, assertions pass):
- `01_fetch_btos.R` — downloads the supplement XLSX (proven live).
- `02_build_btos.R` — `build_supplement()` parses **all four strata** into one
  tidy long frame, writes it to CSV, and derives the display objects from it.
- `run_btos.R` — writes UTF-8 explicitly.

New deliverable — **`btos/output/btos_ai_supplement_long.csv`**: the entire
supplement, tidy. One row per `geo_level × geo × question × answer × metric`,
columns `geo_level, geo, scope, question_id, question, answer_id, answer, metric,
estimate, se, suppressed`. `metric ∈ {estimate, yes, no, dont_know}` (single-
select rows use `estimate`; select-all rows use `yes/no/dont_know`). Suppressed
`"S"` cells are kept with `estimate = NA` and `suppressed = TRUE`, never dropped.
~11.7k rows across National, Sector, State and Employment-size.

Charts in `btos.html` (renderers in `assets/btos-charts.js`), Tier 3 section —
all firm-weighted, all from the workbook:
1. **Size gradient** (Q1 by employment size class) — replaces the old firm-vs-
   employment chart. Adoption climbs from 17.6% (1–4 emp.) to 30.6% (250+). This
   is the honest, public way to show that adoption concentrates in large
   employers, so the firm-weighted headline understates worker exposure.
2. **Sector adoption** (Q1 by 2-digit NAICS) — Information (37.6%) to
   Agriculture (5.1%), XX rollup excluded.
3. **Business functions** (Q2, share of all firms) — ranked bars.
4. **Generative-AI task use** (Q10, among GenAI users) — writing/editing 85%,
   dominated by language work.
5. **Attributed employment effect** (Q6, among AI users) — 2.0% decreased,
   2.3% increased, 95.7% no change.
6. **Adoption barriers** (Q13, non-adopters) — ranked bars.

## Next steps (roughly in priority order)

1. **Breadth of integration** ("N functions per firm" distribution). NOT in the
   aggregate workbook — needs the functions-per-firm cross-tab (microdata or
   custom tab). Highest signal on whether adoption is shallow vs. deepening.
2. **Supplement by state.** The tidy CSV already carries every question by state;
   a 50-state ranked panel (like the core-series geography chart) is a low-effort
   add. Parked in the data rather than on the page for now (lower signal than
   size and sector).
3. **Expansion plans by function (Q12, scope 5).** The forward-looking mirror of
   the business-functions chart — which functions the *planners* expect to use AI
   in. Already in the CSV; a candidate next bar.
4. **Refresh cycle.** When Census posts a newer supplement workbook, only the
   URL/date_range in `01`/`02` need touching; the parser is generic across the
   four sheets.

## Refresh workflow

```bash
Rscript btos/01_fetch_btos.R   # core periods + supplement XLSX (network)
Rscript btos/02_build_btos.R   # tidy CSVs + display JSON incl. supplement (asserts)
Rscript btos/run_btos.R        # -> data/btos-data.js (UTF-8)
# open btos.html
```

Note: when eyeballing in a cached preview, the linked `data/btos-data.js` and
`assets/btos-charts.js` can be served stale even after a rebuild. Hard-reload or
cache-bust the sub-resources; the on-disk files are the source of truth.
