#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# exposure/02_build_exposure.R — occupation exposure → industry exposure.
#
# Pure transform. Offline. This is the reuse surface: anything in the repo that
# needs an exposure number reads exposure/output/, never exposure/raw/.
#
# Reads:   exposure/raw/yale_ai_exposure_occ2010.csv   (pinned + hashed by 01)
#          exposure/raw/yale_cyclicality_betas.csv
#          exposure/crosswalks/cps_ind_to_naics3.csv
#          micro/output/cps_occ_ind_weights.rds        (OCC2010 x IND x year)
# Writes:  exposure/output/exposure_occ2010.csv        tidy long, one row per occ x metric
#          exposure/output/exposure_naics3.csv         employment-weighted industry exposure
#          exposure/output/exposure_naics2.csv
#          exposure/output/exposure_meta.json
#
#   exposure(j) = sum_o  employment_share(o | j) x exposure(o)
#
# Weights are CPS OCC2010 x IND employment. The window is constrained by the
# Census industry-code vintage (see WEIGHT_YEARS below) and is stamped on every
# output row as `weight_source`, because the choice is consequential and should
# never be implicit.
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({ library(data.table); library(jsonlite) })

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
here  <- function(...) file.path(repo, "exposure", ...)
out   <- function(...) here("output", ...)
dir.create(out(), showWarnings = FALSE, recursive = TRUE)

say    <- function(...) cat(sprintf(...), "\n", sep = "")
assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)

# ── Weight window ────────────────────────────────────────────────────────────
# CPS `IND` carries the contemporaneous Census industry vintage, and it changes
# twice inside our sample. Measured against the 2017 Census industry list, the
# share of employment we cannot map is:
#
#     2015-2019   23.1-23.4%    (CPS is on the 2012 scheme)
#     2021-2024   10.2-10.4%    (CPS is on the 2017 scheme — our crosswalk)
#     2025-2026   19.3-19.4%    (CPS has moved to the 2022 scheme)
#
# So the window has to sit inside 2021-2024. Within that, earlier is better:
# these are within-industry occupation shares, and if AI adoption itself
# reshapes occupation mix, late weights make exposure partly endogenous to the
# outcome. 2021-2022 ends at the treatment quarter. WEIGHT_YEARS_ALT re-runs the
# whole thing on 2023-2024 and the two are correlated below, so the reader can
# see whether the choice matters rather than taking it on trust.
WEIGHT_YEARS     <- 2021:2022
WEIGHT_YEARS_ALT <- 2023:2024
WEIGHT_SOURCE    <- sprintf("cps_occ_ind_%d_%d", min(WEIGHT_YEARS), max(WEIGHT_YEARS))

# The six published metrics plus the Budget Lab's PCA composite. Definitions and
# provenance are in exposure/README.md; do not guess from the column names.
METRICS <- c("AIOE", "dv_rating_beta", "human_rating_beta",
             "genaiexp_estz_total", "genaiexp_estz_core",
             "ai_applicability_score", "pca_score")

# ── 1. Occupation-level, tidy ────────────────────────────────────────────────
ex <- fread(here("raw", "yale_ai_exposure_occ2010.csv"), colClasses = list(character = "occ2010"))
assert(all(METRICS %in% names(ex)), "Missing metric column(s): %s",
       paste(setdiff(METRICS, names(ex)), collapse = ", "))
ex[, occ2010 := sprintf("%04d", as.integer(occ2010))]
ex <- ex[!is.na(occ2010)]

long <- melt(ex, id.vars = "occ2010", measure.vars = METRICS,
             variable.name = "metric", value.name = "value", variable.factor = FALSE)
long <- long[!is.na(value)]
long[, `:=`(z      = (value - mean(value)) / sd(value),
            pctile = frank(value, ties.method = "average") / .N), by = metric]

cyc <- fread(here("raw", "yale_cyclicality_betas.csv"), colClasses = list(character = "occ2010"))
cyc[, occ2010 := sprintf("%04d", as.integer(occ2010))]
setnames(cyc, c("estimate", "p.value"), c("cyclicality_beta", "cyclicality_p"))

fwrite(long[order(metric, occ2010)], out("exposure_occ2010.csv"))
fwrite(cyc[order(occ2010)], out("cyclicality_occ2010.csv"))
say("Occupation level: %d occupations x %d metrics -> %s rows",
    long[, uniqueN(occ2010)], long[, uniqueN(metric)], format(nrow(long), big.mark = ","))
for (m in METRICS)
  say("  %-24s n=%3d  mean %+.3f  sd %.3f", m,
      long[metric == m, .N], long[metric == m, mean(value)], long[metric == m, sd(value)])

# ── 2. Industry weights ──────────────────────────────────────────────────────
w_path <- file.path(repo, "micro", "output", "cps_occ_ind_weights.rds")
assert(file.exists(w_path),
       "Missing %s — run micro/01_build_cps_panel.R first.", w_path)
w_all <- as.data.table(readRDS(w_path))
w_all[, occ2010 := sprintf("%04d", as.integer(occ2010))]

xw <- fread(here("crosswalks", "cps_ind_to_naics3.csv"),
            colClasses = list(character = c("naics3")))
xw <- xw[ambiguous == FALSE & nzchar(naics3), .(ind, naics3)]
say("Crosswalk: %d Census industries carry a NAICS3 target", nrow(xw))

weights_for <- function(years) {
  x <- w_all[year %in% years, .(emp = sum(emp), n = sum(n)), by = .(occ2010, ind)]
  list(w = merge(x, xw, by = "ind"), unmatched = 1 - sum(x[ind %in% xw$ind, emp]) / sum(x$emp))
}
prim <- weights_for(WEIGHT_YEARS)
w    <- prim$w
unmatched <- prim$unmatched
say("Weights: CPS %d-%d, %.1f%% of employment in Census industries with no NAICS3 target",
    min(WEIGHT_YEARS), max(WEIGHT_YEARS), 100 * unmatched)
say("  (construction is a single Census industry, so NAICS 236/237/238 are unreachable — ~7pp of that)")

# ── 3. Employment-weighted industry exposure ─────────────────────────────────
build_industry <- function(level, wtab = w) {
  ww <- copy(wtab)
  ww[, naics := if (level == 3L) naics3 else substr(naics3, 1, 2)]
  ww <- ww[, .(emp = sum(emp)), by = .(naics, occ2010)]
  ww[, share := emp / sum(emp), by = naics]

  m <- merge(ww, long[, .(occ2010, metric, value, z)], by = "occ2010",
             allow.cartesian = TRUE)
  # Shares are renormalised within (industry x metric) over the occupations that
  # actually carry a score for that metric, so partial coverage rescales rather
  # than silently shrinking an industry's exposure toward zero.
  m[, share_r := share / sum(share), by = .(naics, metric)]
  res <- m[, .(exposure     = sum(share_r * value),
               exposure_z   = sum(share_r * z),
               n_occ        = .N,
               emp          = sum(emp),
               score_coverage = sum(share)), by = .(naics, metric)]
  res[, `:=`(level = level, weight_source = WEIGHT_SOURCE)]
  res[order(metric, naics)]
}

n3 <- build_industry(3L)
n2 <- build_industry(2L)

# Thin industries: too few underlying CPS occupation cells to trust.
thin3 <- n3[metric == "pca_score" & n_occ < 3L, naics]
if (length(thin3)) say("  NAICS3 with fewer than 3 scored occupations: %s",
                       paste(thin3, collapse = ", "))
n3[, thin := naics %in% thin3]

fwrite(n3, out("exposure_naics3.csv"))
fwrite(n2, out("exposure_naics2.csv"))
say("Industry level: %d NAICS3, %d NAICS2", n3[, uniqueN(naics)], n2[, uniqueN(naics)])

# Does the weight window matter? Rebuild on the later years and correlate.
alt   <- build_industry(3L, weights_for(WEIGHT_YEARS_ALT)$w)
cmp   <- merge(n3[metric == "pca_score", .(naics, primary = exposure_z)],
               alt[metric == "pca_score", .(naics, alternate = exposure_z)], by = "naics")
WEIGHT_SENSITIVITY <- cmp[, cor(primary, alternate)]
say("Weight-window sensitivity: NAICS3 pca_score exposure from %d-%d vs %d-%d correlates %.4f (n=%d)",
    min(WEIGHT_YEARS), max(WEIGHT_YEARS), min(WEIGHT_YEARS_ALT), max(WEIGHT_YEARS_ALT),
    WEIGHT_SENSITIVITY, nrow(cmp))
fwrite(cmp, out("exposure_weight_sensitivity.csv"))

# ── 4. Assertions ────────────────────────────────────────────────────────────
say("Assertions...")
assert(long[metric == "pca_score", .N] > 300,
       "Only %d occupations carry a pca_score.", long[metric == "pca_score", .N])
assert(n3[metric == "pca_score", uniqueN(naics)] >= 60,
       "Only %d NAICS3 industries got an exposure value.",
       n3[metric == "pca_score", uniqueN(naics)])
say("  exposure-score coverage of industry employment: median %.3f, min %.3f (%s)",
    n3[, median(score_coverage)], n3[, min(score_coverage)],
    n3[which.min(score_coverage), naics])
assert(n3[, median(score_coverage)] > 0.90,
       "Median industry score coverage is only %.3f.", n3[, median(score_coverage)])
low <- unique(n3[score_coverage < 0.75, naics])
if (length(low)) say("  under 75%% scored (flagged, not dropped): %s", paste(low, collapse = " "))
n3[, low_score_coverage := score_coverage < 0.75]
# Face validity, not a tautology: information and professional services should
# sit at the top of the distribution and accommodation at the bottom.
pv  <- n3[metric == "pca_score"]
top <- pv[order(-exposure_z)][1:8, naics]
bot <- pv[order(exposure_z)][1:8, naics]
say("  most exposed NAICS3 (pca_score): %s", paste(top, collapse = " "))
say("  least exposed NAICS3:            %s", paste(bot, collapse = " "))
assert(any(c("541", "518", "519", "523", "524", "513", "551") %in% top),
       "No information/professional/finance subsector in the top 8 — the weights are suspect.")
assert(any(c("721", "722", "236", "237", "238", "115", "484") %in% bot),
       "No accommodation/construction/transport subsector in the bottom 8 — the weights are suspect.")
say("  all passed")

write_json(list(
  built_at      = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  metrics       = METRICS,
  weight_source = WEIGHT_SOURCE,
  weight_note   = sprintf("CPS OCC2010 x IND employment, pooled %d-%d, WTFINL",
                          min(WEIGHT_YEARS), max(WEIGHT_YEARS)),
  crosswalk     = "exposure/crosswalks/cps_ind_to_naics3.csv (Census 2017 industry list)",
  n_occupations = long[, uniqueN(occ2010)],
  n_naics3      = n3[, uniqueN(naics)],
  n_naics2      = n2[, uniqueN(naics)],
  weight_years  = range(WEIGHT_YEARS),
  weight_years_alt = range(WEIGHT_YEARS_ALT),
  weight_window_sensitivity_cor = round(WEIGHT_SENSITIVITY, 4),
  employment_unmatched_share = round(unmatched, 4),
  ind_vintage_note = "CPS IND uses the 2012 Census industry scheme through 2019, the 2017 scheme 2020-2024, and the 2022 scheme from 2025. The weight window must sit inside 2021-2024 to match the committed 2017 crosswalk.",
  caveats = c(
    "Construction is a single Census industry, so NAICS 236/237/238 cannot be separated from CPS.",
    "Government (NAICS 92) is unmapped and out of scope for the BTOS and QWI private-sector frames.",
    "Exposure is a judgment about tasks. It is not adoption, and it does not separate replacement from augmentation."
  )
), out("exposure_meta.json"), auto_unbox = TRUE, pretty = TRUE)

say("")
say("Wrote %s", out())
