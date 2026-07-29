# The exposure asset

Occupational AI-exposure scores, kept once and reused everywhere. Nothing else
in this repo re-derives exposure from a vendor file; everything reads
`exposure/output/`.

## Layout

| Path | Role |
|---|---|
| `sources.csv` | The registry. One row per raw file: URL, **pinned revision**, sha256, licence, note. Adding an index is one row. |
| `01_fetch_exposure.R` | The only script here that touches the network. Downloads at the pin, verifies the hash, writes `MANIFEST.json`. A hash mismatch is a hard stop. |
| `raw/` | Immutable vendor drops. Never edited, never regenerated, never cleaned. |
| `crosswalks/` | Committed, human-readable, hand-checked mappings. Edit these, not the R. |
| `02_build_exposure.R` | Pure transform: occupation-level scores → industry-level exposure. |
| `output/` | Derived and regenerable. This is the reuse surface. |

## Why pins and hashes

`main` is not a reproducible reference. Every raw file is pinned to a commit SHA
(or a dated release URL) and checked against a recorded sha256, so a silent
upstream revision surfaces as a build failure rather than as coefficients that
quietly moved between two runs of the same script.

```bash
Rscript exposure/01_fetch_exposure.R           # verify + fetch at the pin
Rscript exposure/01_fetch_exposure.R --adopt   # record the hash for a newly added row
Rscript exposure/02_build_exposure.R           # occupation -> industry
```

## What is in the raw layer

### `yale_ai_exposure_occ2010.csv`

From the Budget Lab at Yale's [AI-Effects](https://github.com/Budget-Lab-Yale/AI-Effects)
replication repo, pinned at `4898eb3`. 469 IPUMS `OCC2010` codes. They crosswalk
every underlying metric to SOC 2018 first and then to OCC2010, following
Goldschlag and Eckhardt's method.

Definitions below are taken from the Budget Lab's methods appendix to
[*Labor Market AI Exposure: What Do We Know?*](https://budgetlab.yale.edu/research/labor-market-ai-exposure-what-do-we-know),
read on 2026-07-28 — not inferred from the column names.

| Column | Source | What it measures | Native scheme |
|---|---|---|---|
| `AIOE` | Felten, Raj & Seamans (2021) | AI Occupational Exposure. MTurk workers rated ten AI applications against 52 O\*NET abilities; scores are rolled up to occupations. | SOC 2010 |
| `dv_rating_beta` | Eloundou et al. (2024) | Whether GPTs **and software built on top of them** can cut the time to complete an O\*NET task. Annotated by GPT-4. The "beta" variant counts tool-augmented capability at half the weight of direct exposure. | SOC 2019 |
| `human_rating_beta` | Eloundou et al. (2024) | The same rubric, annotated by human raters instead of GPT-4. | SOC 2019 |
| `genaiexp_estz_total` | Eisfeldt, Schubert & Zhang (2023) | Generative AI's capacity to raise productivity, over **all** O\*NET tasks. GPT-4 annotated, on their own rubric built atop Eloundou et al. | SOC 2010 |
| `genaiexp_estz_core` | Eisfeldt, Schubert & Zhang (2023) | The same, restricted to tasks flagged **core** for that occupation. | SOC 2010 |
| `ai_applicability_score` | Tomlinson et al. (2025), Microsoft | Built from real Microsoft Copilot conversations, classified by user goal, type of use, and whether the model completed the O\*NET task. **Realized use rather than inferred capability**, which makes it the odd one out and the most interesting. | SOC 2018 (no crosswalk needed) |
| `pca_score` | Budget Lab | The composite. Every metric is z-scored, then weighted by its contribution to overall variance under PCA. This is the treatment variable in the Budget Lab's SDID. | — |

**Webb (2020) `pct_ai` is absent, and that is deliberate.** It measures exposure
to *patented* AI technologies by matching patent text to O\*NET task text, and it
behaves unlike the rest: its PCA weight came out roughly ten times smaller than
the other six. The Budget Lab dropped it, which also bought them 69 more
fully-covered occupations. Anyone re-adding it should expect it to load on a
different axis. Add it as a `sources.csv` row rather than editing anything here.

Coverage in the Budget Lab's SOC-2018 working file: 867 occupations with at
least one metric, 710 with all seven, 778 with all six after dropping `pct_ai`.
Occupations missing a metric score slightly lower on exposure than those with
full coverage (significant on a Mann-Whitney test), so the balanced set is
mildly selected toward exposure. Our 469 OCC2010 rows are coarser than that
because OCC2010 is coarser than SOC 2018.

### `yale_cyclicality_betas.csv`

450 OCC2010 codes with `estimate` and `p.value` from regressing each
occupation's log employment on the CBO output gap, 1994–2019. Descriptive, and
useful as a control: the Budget Lab find exposed occupations were historically
*less* procyclical, and warn explicitly that this did not hold over the last few
years. Do not use it as a structural adjustment.

## What exposure is not

Every metric here is a judgment about **tasks**, made without observing whether
any firm actually deployed anything. None of them separates replacement from
augmentation, and none carries deployment intensity. An occupation can score in
the top percentile and see no adoption at all. That gap between inferred
exposure and observed adoption is the thing our BTOS work is for, and it is why
exposure and adoption are carried as two distinct variables here rather than
being blended into one index.

## Industry-level exposure

`02_build_exposure.R` maps occupation scores onto industries:

```
exposure(j) = Σ_o  employment_share(o | j) × exposure(o)
```

**The weight window is not free to choose.** CPS `IND` carries whichever Census
industry vintage was current at the time, and it changes twice inside our
sample. Measured against the committed 2017 Census industry list, the share of
employment we cannot map to a NAICS3 code is:

| CPS years | Unmapped | Census industry scheme in use |
|---|---|---|
| 2015–2019 | 23.1–23.4% | 2012 |
| 2021–2024 | 10.2–10.4% | **2017 — our crosswalk** |
| 2025–2026 | 19.3–19.4% | 2022 |

So the window must sit inside 2021–2024, which rules out the pre-pandemic years
that would otherwise be the obvious choice. Within that range, earlier is safer:
these are *within-industry occupation shares*, and if AI adoption itself
reshapes occupation mix then late weights make exposure partly endogenous to the
outcome being explained.

- **Primary weights:** CPS `OCC2010 × IND`, pooled **2021–2022**, `WTFINL`. The
  window ends at the treatment quarter (2022Q4).
- **Sensitivity:** rebuilt on 2023–2024, NAICS3 exposure correlates **0.9935**
  with the primary. The choice does not matter, and the comparison is written to
  `output/exposure_weight_sensitivity.csv` rather than asserted in prose.
- **Not built:** OEWS national industry × SOC weights. NAICS-native and cleaner
  on the industry side, but it costs an OCC2010→SOC hop and the sensitivity
  above suggests little to gain.

The residual 10.3% unmapped is mostly structural, not fixable by a better
crosswalk: **construction alone is 7.2%**, because CPS codes all of NAICS 23 as
a single industry, so 236/237/238 cannot be separated. Government (NAICS 92) is
another 2.3% and is out of scope for the BTOS and QWI private-sector frames.

The weight source is recorded in a `weight_source` column of every output row.

## Face validity

The build asserts that the ranking is not nonsense before writing anything. On
the current vintage, the most exposed NAICS3 subsectors by `pca_score` are data
processing and hosting (518), publishing (511), other information services
(519), credit intermediation (522), securities (523) and professional services
(541); the least exposed are private households (814), warehousing (493), animal
and crop production (112, 111) and repair and personal services (811, 812).
