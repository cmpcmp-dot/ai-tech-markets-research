#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# clean/btos_qwi_join.R — put BTOS adoption and LEHD QWI outcomes on the same
# 3-digit NAICS grid. Two cards need this and neither should build it twice:
# Adoption card 02 (adoption against occupational exposure) and Job
# Displacement card 05 (early-career hiring against adoption).
#
# Three decisions live here, and they are the ones that would change results:
#
#   1. Adoption is the mean of the PRE-BREAK old-wording readings only
#      (2023-09-11 to 2025-11-16), requiring at least three unsuppressed
#      observations. Using the post-rewrite series would mix two questions,
#      and the pre-break span is the one that covers the outcome window.
#
#   2. QWI is not seasonally adjusted, so every change is a four-quarter sum
#      against a four-quarter base. That removes seasonality without imposing
#      an adjustment model. Cells missing any of the twelve quarters are
#      dropped rather than partially summed.
#
#   3. NAICS 2022 merged some 2017 subsectors, so a few BTOS subsectors map to
#      one QWI industry. Those are averaged with QWI all-ages employment
#      weights, flagged `pooled`, and the flag rides through to the charts.
#
# Reads   interim/btos/btos_ai_long.csv          (clean/btos_survey.R)
#         interim/qwi/qwi_naics3_age_quarter.rds (clean/qwi.R)
#         src/lookups/crosswalk_btos_qwi.csv
# Writes  interim/qwi/adoption_naics3.csv   adoption + z-score per industry
#         interim/qwi/qwi_windows.csv       industry x age change windows
#
#   Rscript analysis/src/clean/btos_qwi_join.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressPackageStartupMessages({ library(data.table) })

# ── Windows ──────────────────────────────────────────────────────────────────
BASE_Q  <- c(20191L, 20192L, 20193L, 20194L)   # 2019
END_Q   <- c(20243L, 20244L, 20251L, 20252L)   # four quarters to 2025Q2
PRE_A_Q <- c(20171L, 20172L, 20173L, 20174L)   # 2017, for the pre-trend
BREAK   <- as.Date("2025-11-17")               # BTOS question rewording
MIN_READS <- 3L
AGES    <- c("A03", "A04", "A05", "A06", "A00")

yq <- function(y, q) y * 10L + q
out <- ensure_dir(interim_path("qwi"))

# ── BTOS adoption by subsector, pre-break only ───────────────────────────────
b <- fread(need_file(interim_path("btos", "btos_ai_long.csv"),
                     "Rscript analysis/src/clean/btos_survey.R"))
b <- b[strata_type == "subsector" & option == "AI current" & answer == "Yes"]
pre <- b[wording == "old" & !suppressed & as.Date(date) < BREAK,
         .(adopt = mean(est), n_reads = .N), by = .(btos_subsector = strata_value)]
pre <- pre[n_reads >= MIN_READS]
say("BTOS: %d subsectors with >= %d unsuppressed pre-break readings", nrow(pre), MIN_READS)

xw <- fread(lookup_path("crosswalk_btos_qwi.csv"),
            colClasses = list(character = c("btos_subsector", "qwi_naics3")))
xw <- xw[relation != "dropped" & nzchar(qwi_naics3)]

# ── QWI change windows ───────────────────────────────────────────────────────
q <- as.data.table(readRDS(need_file(
  interim_path("qwi", "qwi_naics3_age_quarter.rds"),
  "Rscript analysis/src/fetch/qwi.R then analysis/src/clean/qwi.R (~940 MB of state pulls)")))
q[, yqi := yq(year, quarter)]

win <- function(qs, ages) q[yqi %in% qs & agegrp %in% ages,
  .(HirA = sum(HirA, na.rm = TRUE), EmpS = sum(EmpS, na.rm = TRUE),
    Sep = sum(Sep, na.rm = TRUE), HirAEndRepl = sum(HirAEndRepl, na.rm = TRUE),
    nq = .N), by = .(naics = industry, agegrp)]

suffix <- function(d, s) {
  setnames(d, setdiff(names(d), c("naics", "agegrp")),
           paste0(setdiff(names(d), c("naics", "agegrp")), s)); d
}
w_base <- suffix(win(BASE_Q,  AGES), "_base")
w_end  <- suffix(win(END_Q,   AGES), "_end")
w_pre  <- suffix(win(PRE_A_Q, AGES), "_pre")

qw <- Reduce(function(a, bb) merge(a, bb, by = c("naics", "agegrp")),
             list(w_base, w_end, w_pre))
qw <- qw[nq_base == 4L & nq_end == 4L & nq_pre == 4L]
qw[, `:=`(
  d_log_hires = log(HirA_end / HirA_base),
  d_log_emp   = log(EmpS_end / EmpS_base),
  d_log_sep   = log(Sep_end  / Sep_base),
  d_log_repl  = log(HirAEndRepl_end / HirAEndRepl_base),
  # 2017 -> 2019 growth, annualised, as the pre-trend control
  pretrend_hires = log(HirA_base / HirA_pre) / 2,
  pretrend_emp   = log(EmpS_base / EmpS_pre) / 2
)]
qw <- qw[is.finite(d_log_hires) & is.finite(d_log_emp)]
say("QWI: %d industry x age cells with complete base, pre and end windows", nrow(qw))

# ── Join, pooling where the crosswalk says so ────────────────────────────────
empw <- q[agegrp == "A00" & yqi %in% END_Q,
          .(w = sum(EmpS, na.rm = TRUE)), by = .(qwi_naics3 = industry)]
ad <- merge(xw[, .(btos_subsector, qwi_naics3, relation)], pre, by = "btos_subsector")
ad <- merge(ad, empw, by = "qwi_naics3", all.x = TRUE)
ad[is.na(w), w := 1]
adoption <- ad[, .(adopt = weighted.mean(adopt, w), n_src = .N,
                   pooled = any(relation == "pooled")), by = .(naics = qwi_naics3)]
adoption[, adopt_z := scale(adopt)[, 1]]
say("Adoption joined to %d QWI industries (%d pooled from two BTOS subsectors)",
    nrow(adoption), adoption[pooled == TRUE, .N])

fwrite(adoption[order(naics)], file.path(out, "adoption_naics3.csv"))
fwrite(qw[order(naics, agegrp)], file.path(out, "qwi_windows.csv"))
say("Wrote %s", out)
