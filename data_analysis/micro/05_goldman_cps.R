#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# micro/05_goldman_cps.R — the publicly replicable pieces of the Goldman Sachs
# AI Adoption Tracker, rebuilt from CPS.
#
# The report in papers/ is a licensed subscriber copy. Nothing from it is
# reproduced here: not an exhibit, not a number, not a proprietary index. What
# this script does is rebuild the same ANALYSES from public data with a stated
# specification, and the report is cited only as motivation for asking.
#
#   G1  Tech employment share against its own long-run trend      (their Ex 19)
#   G2  Unemployment among young tech workers                     (their Ex 20)
#   G3  Employment path of an AI-exposed occupation basket        (their Ex 17-18)
#
# G3 differs from theirs on purpose. Their basket is occupations "where
# anecdotes suggest AI is having an impact". Ours is the top tercile of the
# exposure asset — published, reproducible, and defined before looking at the
# outcome. That is the improvement, and it is the whole reason to redo it.
#
# Reads:   micro/output/cps_occ_quarter_panel.rds
#          exposure/output/exposure_occ2010.csv
# Writes:  micro/output/goldman_cps.csv, goldman_cps_meta.json
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({ library(data.table); library(jsonlite) })

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
out   <- function(...) file.path(repo, "micro", "output", ...)
say   <- function(...) cat(sprintf(...), "\n", sep = "")

panel <- as.data.table(readRDS(out("cps_occ_quarter_panel.rds")))
panel[, `:=`(occ2010 = sprintf("%04d", as.integer(occ2010)),
             t = year + (quarter - 1) / 4)]

# OCC2010 1000-1240 is the computer and mathematical occupation block. Stated
# here rather than buried: "tech" is a definitional choice, not a fact.
TECH_LO <- 1000L; TECH_HI <- 1240L
panel[, tech := as.integer(occ2010) >= TECH_LO & as.integer(occ2010) <= TECH_HI]
say("Tech basket: %d occupations (OCC2010 %d-%d)", panel[tech == TRUE, uniqueN(occ2010)],
    TECH_LO, TECH_HI)

TREAT_T <- 2022.75   # 2022Q4

# ── G1. Tech employment share vs its own pre-2020 trend ──────────────────────
g1 <- panel[tech == TRUE, .(emp_share = sum(emp_share, na.rm = TRUE)), by = .(year, quarter, t)]
setorder(g1, t)
trend_fit <- lm(emp_share ~ t, data = g1[t < 2020])
g1[, `:=`(trend = predict(trend_fit, newdata = g1), gap = NA_real_)]
g1[, gap := emp_share - trend]
say("G1 tech employment share: %.3f%% of population now, trend says %.3f%%, gap %.3f pp",
    g1[.N, emp_share], g1[.N, trend], g1[.N, gap])
say("   pre-2020 trend slope: %+.4f pp per year", coef(trend_fit)[2])

# ── G2. Unemployment, tech vs all, young vs prime ────────────────────────────
# Occupation is poorly measured for the unemployed — they are coded to their
# last job — which the Budget Lab flag too. Reported for that reason as a
# descriptive series, not as a displacement estimate.
g2 <- panel[, .(urate = sum(unemp_wt, na.rm = TRUE) / sum(lf_wt, na.rm = TRUE)),
            by = .(group = fifelse(tech, "tech", "all other"), year, quarter, t)]
setorder(g2, group, t)
g2w <- dcast(g2, year + quarter + t ~ group, value.var = "urate")
setnames(g2w, c("all other", "tech"), c("urate_other", "urate_tech"))
g2w[, gap_pp := 100 * (urate_tech - urate_other)]
say("G2 tech unemployment: %.2f%% vs %.2f%% elsewhere, gap %+.2f pp (latest quarter)",
    100 * g2w[.N, urate_tech], 100 * g2w[.N, urate_other], g2w[.N, gap_pp])
say("   2015-2019 average gap: %+.2f pp", g2w[year %in% 2015:2019, mean(gap_pp)])

# ── G3. Exposure-tercile employment paths ────────────────────────────────────
exl <- fread(file.path(repo, "exposure", "output", "exposure_occ2010.csv"),
             colClasses = list(character = "occ2010"))
ex  <- exl[metric == "pca_score", .(occ2010, ai_exposure = value)]
p3  <- merge(panel, ex, by = "occ2010")
cut <- stats::quantile(unique(p3[, .(occ2010, ai_exposure)])$ai_exposure, c(1/3, 2/3))
p3[, tercile := fcase(ai_exposure >  cut[2], "top third (most exposed)",
                      ai_exposure <= cut[1], "bottom third (least exposed)",
                      default = "middle third")]

g3 <- p3[, .(emp_share = sum(emp_share, na.rm = TRUE)), by = .(tercile, year, quarter, t)]
setorder(g3, tercile, t)
# Index to the four quarters before treatment so the two paths start together.
base <- g3[t >= TREAT_T - 1 & t < TREAT_T, .(b = mean(emp_share)), by = tercile]
g3 <- merge(g3, base, by = "tercile")
g3[, index := 100 * emp_share / b]
latest <- g3[t == max(t)][order(tercile)]
for (i in seq_len(nrow(latest)))
  say("G3 %-30s index %.1f (2022Q4 = 100)", latest$tercile[i], latest$index[i])
gap_now <- latest[tercile == "top third (most exposed)", index] -
           latest[tercile == "bottom third (least exposed)", index]
say("   most-exposed minus least-exposed since treatment: %+.1f index points", gap_now)

# ── Write ────────────────────────────────────────────────────────────────────
res <- rbindlist(list(
  g1[, .(series = "tech_emp_share", year, quarter, t, value = emp_share, ref = trend)],
  g2w[, .(series = "urate_gap_tech_minus_other", year, quarter, t, value = gap_pp, ref = NA_real_)],
  g2w[, .(series = "urate_tech", year, quarter, t, value = 100 * urate_tech, ref = 100 * urate_other)],
  g3[, .(series = paste0("exposure_index:", tercile), year, quarter, t, value = index, ref = NA_real_)]
), fill = TRUE)
fwrite(res, out("goldman_cps.csv"))

write_json(list(
  built_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  provenance = paste(
    "Rebuilt from CPS microdata. The Goldman Sachs AI Adoption Tracker is a",
    "licensed subscriber copy and is cited only as motivation; no exhibit,",
    "number or index from it is reproduced or presented as ours."),
  tech_definition = sprintf("OCC2010 %d-%d, computer and mathematical occupations", TECH_LO, TECH_HI),
  g1 = list(trend_window = "2005-2019", slope_pp_per_year = round(unname(coef(trend_fit)[2]), 5),
            latest_share = round(g1[.N, emp_share], 4), latest_trend = round(g1[.N, trend], 4),
            latest_gap_pp = round(g1[.N, gap], 4)),
  g2 = list(latest_gap_pp = round(g2w[.N, gap_pp], 3),
            avg_gap_2015_2019_pp = round(g2w[year %in% 2015:2019, mean(gap_pp)], 3),
            caveat = "The unemployed are coded to their last occupation, so occupation is measured with error for exactly the group of interest."),
  g3 = list(basket = "top tercile of the exposure asset's pca_score, defined before looking at outcomes",
            index_base = "mean of the four quarters before 2022Q4",
            gap_index_points = round(gap_now, 3))
), out("goldman_cps_meta.json"), auto_unbox = TRUE, pretty = TRUE)

say("")
say("Wrote %s", out("goldman_cps.csv"))
