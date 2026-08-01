#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Adoption, card 02 — "Does the theory predict the practice?"
#
# Regress observed BTOS adoption on occupational AI exposure, across 3-digit
# NAICS industries. Exposure indices were built to predict where AI would be
# used; this asks whether they did. The answer is a slope in percentage points
# of adoption per standard deviation of exposure, fitted for each of seven
# published exposure measures plus a PCA composite over them, with HC3
# standard errors. The site plots the composite and shows the rest as a
# robustness table, so a reader can see the result is not an artifact of one
# index.
#
# Two things this is NOT. It is not causal: exposure and adoption are both
# industry attributes and everything correlated with being a white-collar
# industry is omitted. And it is not a worker-level test: adoption is measured
# firm-weighted at the industry level, so an industry of many small
# non-adopters and a few large adopters reads as low adoption.
#
# The over-time refit answers a sharper question than the cross-section: has
# the gradient STEEPENED as AI diffused? It re-estimates the same regression
# once per BTOS collection period on the pre-break series.
#
# Benchmark: Tucker (2026) reports 6.7 pp/SD and R2 about 0.47 at the
# subsector level, on crosswalked Eloundou GPT-4 beta exposure and April 2026
# BTOS. Carried in the payload so the page never hard-codes a number the
# pipeline does not also know.
#
# Reads   interim/qwi/adoption_naics3.csv      (clean/btos_qwi_join.R)
#         interim/exposure/exposure_naics3.csv (clean/exposure.R)
#         interim/btos/btos_ai_long.csv        (clean/btos_survey.R)
# Writes  interim/exposure/t1_{adoption_exposure,coefs,slope_over_time}.csv
#         interim/cards/adoption_02_exposure.json
#
#   Rscript analysis/src/exhibits/adoption_02_exposure.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

suppressPackageStartupMessages({
  library(data.table); library(jsonlite); library(sandwich); library(lmtest)
})

BREAK <- as.Date("2025-11-17")   # BTOS question rewording
out   <- function(...) file.path(ensure_dir(interim_path("exposure")), ...)

adoption <- fread(need_file(interim_path("qwi", "adoption_naics3.csv"),
                            "Rscript analysis/src/clean/btos_qwi_join.R"),
                  colClasses = list(character = "naics"))
ex <- fread(need_file(interim_path("exposure", "exposure_naics3.csv"),
                      "Rscript analysis/src/clean/exposure.R"),
            colClasses = list(character = "naics"))
b <- fread(need_file(interim_path("btos", "btos_ai_long.csv"),
                     "Rscript analysis/src/clean/btos_survey.R"))
b <- b[strata_type == "subsector" & option == "AI current" & answer == "Yes"]
xw <- fread(lookup_path("crosswalk_btos_qwi.csv"),
            colClasses = list(character = c("btos_subsector", "qwi_naics3")))
xw <- xw[relation != "dropped" & nzchar(qwi_naics3)]

say("T1  Adoption on exposure, NAICS3")
say("%s", strrep("-", 78))

t1 <- merge(adoption, ex[, .(naics, metric, exposure, exposure_z)],
            by = "naics", allow.cartesian = TRUE)
fwrite(t1[order(metric, naics)], out("t1_adoption_exposure.csv"))

t1_coefs <- rbindlist(lapply(unique(t1$metric), function(m) {
  d <- t1[metric == m]
  if (nrow(d) < 10L) return(NULL)
  f <- lm(adopt ~ exposure_z, data = d)
  ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
  data.table(test = "T1", metric = m, n = nrow(d),
             slope_pp_per_sd = ct[2, 1], se = ct[2, 2], p = ct[2, 4],
             r2 = summary(f)$r.squared)
}))
setorder(t1_coefs, -r2)
for (i in seq_len(nrow(t1_coefs)))
  say("  %-24s slope %+5.2f pp/SD  (se %.2f, p %.4f)  R2 %.3f  n %d",
      t1_coefs$metric[i], t1_coefs$slope_pp_per_sd[i], t1_coefs$se[i],
      t1_coefs$p[i], t1_coefs$r2[i], t1_coefs$n[i])
say("  Tucker (2026) reports 6.7 pp per SD and R2 about 0.47 at the subsector level,")
say("  using crosswalked Eloundou GPT-4 beta exposure on April 2026 BTOS data.")

# Has the gradient steepened? Refit period by period on the pre-break series.
by_period <- b[wording == "old" & !suppressed & as.Date(date) < BREAK,
               .(date, btos_subsector = strata_value, est)]
by_period <- merge(by_period, xw[, .(btos_subsector, qwi_naics3)], by = "btos_subsector")
by_period <- merge(by_period, ex[metric == "pca_score", .(qwi_naics3 = naics, exposure_z)],
                   by = "qwi_naics3")
t1_time <- by_period[, if (.N >= 20L) {
  f <- lm(est ~ exposure_z); ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
  .(slope = ct[2, 1], se = ct[2, 2], r2 = summary(f)$r.squared, n = .N)
}, by = date][order(date)]
if (nrow(t1_time) >= 4L) {
  tt <- lm(slope ~ seq_len(nrow(t1_time)), data = t1_time)
  say("  gradient over time: %+.3f pp/SD per BTOS period (p = %.3f), %d periods",
      coef(tt)[2], summary(tt)$coefficients[2, 4], nrow(t1_time))
}
fwrite(t1_time, out("t1_slope_over_time.csv"))
fwrite(t1_coefs, out("t1_coefs.csv"))

# ── The card ─────────────────────────────────────────────────────────────────
# The scatter plots the PCA composite only; the other six metrics appear in the
# robustness table, which reads t1_coefs, so they are not needed point-by-point.
HEADLINE_METRIC <- "pca_score"

sc <- t1[metric == HEADLINE_METRIC]
if (!nrow(sc)) stop("No rows for metric '", HEADLINE_METRIC, "'", call. = FALSE)
sc <- sc[order(naics), .(naics, adopt = round(adopt, 4),
                         exposure_z = round(exposure_z, 6), pooled = as.logical(pooled))]

co <- t1_coefs[test == "T1", .(test, metric, n,
                               slope_pp_per_sd = round(slope_pp_per_sd, 6),
                               se = round(se, 6), p = signif(p, 3),
                               r2 = round(r2, 6))]

tm <- t1_time[order(date), .(date = as.character(date), slope = round(slope, 6),
                             se = round(se, 6), r2 = round(r2, 6), n)]

write_card(list(
  exposure_meta = fromJSON(interim_path("exposure", "exposure_meta.json"),
                           simplifyVector = FALSE),
  t1 = list(coefs = co, scatter = sc, over_time = tm, n = nrow(sc),
            tucker_slope = 6.7, tucker_r2 = 0.47)
), "adoption_02_exposure", digits = 6)

say("  card: %d industries, %d metrics, %d periods", nrow(sc), nrow(co), nrow(tm))
