#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# micro/03_tests_industry.R — the industry-level pre-registered tests.
#
#   T1  Do adoption and exposure measure the same thing?  (BTOS x exposure)
#   T4  Early-career hiring against OBSERVED ADOPTION      (BTOS x QWI)
#   T6  Adoption vs exposure, horse race                   (all three)
#
# The tests were written down in plan_microdata.md before being run, and all of
# them are reported here whatever they show. Nothing in this script chooses a
# specification after seeing an answer.
#
# Reads:   btos/output/btos_ai_long.csv
#          btos/crosswalk_btos_qwi.csv
#          qwi/output/qwi_naics3_age_quarter.rds
#          exposure/output/exposure_naics3.csv
# Writes:  micro/output/t1_adoption_exposure.csv     industry-level analysis frame
#          micro/output/t1_coefs.csv                 slope per exposure metric, and over time
#          micro/output/t4_qwi_frame.csv             industry x age outcome frame
#          micro/output/t4_coefs.csv
#          micro/output/t6_coefs.csv
#          micro/output/tests_industry_meta.json
#
# ── PORTING NOTE (2026-07-28) ────────────────────────────────────────────────
# Only T1 is used by this site (Adoption tab, section 01). T4 and T6 need the
# LEHD QWI panel, which is ~1 GB and was NOT copied over from the research repo,
# so this script cannot run end to end here as shipped. Its T1 outputs ARE
# committed in micro/output/, and data/btos-exposure-data.js is built from those
# by micro/run_exposure.R. Rerun this script only if an exposure source or the
# BTOS pre-break window changes; you will need qwi/output/qwi_naics3_age_quarter.rds
# from the research repo first. See data_analysis/README.md, "What was
# deliberately not copied."
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(data.table); library(jsonlite); library(sandwich); library(lmtest); library(fixest)
})
setFixest_notes(FALSE)

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
out   <- function(...) file.path(repo, "micro", "output", ...)

say    <- function(...) cat(sprintf(...), "\n", sep = "")
assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)

# ── Windows ──────────────────────────────────────────────────────────────────
# QWI is unadjusted, so every change is a four-quarter sum against a four-quarter
# base. That removes seasonality without imposing an adjustment model.
BASE_Q  <- c(20191L, 20192L, 20193L, 20194L)   # 2019
END_Q   <- c(20243L, 20244L, 20251L, 20252L)   # four quarters to 2025Q2
PRE_A_Q <- c(20171L, 20172L, 20173L, 20174L)   # 2017, for the pre-trend
BREAK   <- as.Date("2025-11-17")               # BTOS question rewording
MIN_READS <- 3L

yq <- function(y, q) y * 10L + q

# ── BTOS adoption by subsector ───────────────────────────────────────────────
b <- fread(file.path(repo, "btos", "output", "btos_ai_long.csv"))
b <- b[strata_type == "subsector" & option == "AI current" & answer == "Yes"]
pre <- b[wording == "old" & !suppressed & as.Date(date) < BREAK,
         .(adopt = mean(est), n_reads = .N), by = .(btos_subsector = strata_value)]
pre <- pre[n_reads >= MIN_READS]
say("BTOS: %d subsectors with >= %d unsuppressed pre-break readings", nrow(pre), MIN_READS)

xw <- fread(file.path(repo, "btos", "crosswalk_btos_qwi.csv"),
            colClasses = list(character = c("btos_subsector", "qwi_naics3")))
xw <- xw[relation != "dropped" & nzchar(qwi_naics3)]

# ── QWI ──────────────────────────────────────────────────────────────────────
# Not committed to this repo (see the porting note at the top). Fail here with
# an explanation rather than an opaque readRDS error thirty lines later.
.qwi <- file.path(repo, "qwi", "output", "qwi_naics3_age_quarter.rds")
if (!file.exists(.qwi)) stop(
  "Missing ", .qwi, "\n",
  "The LEHD QWI panel (~1 GB) is not committed to this repo. T1's committed\n",
  "outputs in micro/output/ are what the site uses; rebuild them only if you\n",
  "have the panel. See data_analysis/README.md.", call. = FALSE)
q <- as.data.table(readRDS(.qwi))
q[, yqi := yq(year, quarter)]

win <- function(qs, ages) q[yqi %in% qs & agegrp %in% ages,
  .(HirA = sum(HirA, na.rm = TRUE), EmpS = sum(EmpS, na.rm = TRUE),
    Sep = sum(Sep, na.rm = TRUE), HirAEndRepl = sum(HirAEndRepl, na.rm = TRUE),
    nq = .N), by = .(naics = industry, agegrp)]

AGES <- c("A03", "A04", "A05", "A06", "A00")
w_base <- win(BASE_Q, AGES); setnames(w_base, setdiff(names(w_base), c("naics", "agegrp")),
                                      paste0(setdiff(names(w_base), c("naics", "agegrp")), "_base"))
w_end  <- win(END_Q,  AGES); setnames(w_end,  setdiff(names(w_end),  c("naics", "agegrp")),
                                      paste0(setdiff(names(w_end),  c("naics", "agegrp")), "_end"))
w_pre  <- win(PRE_A_Q, AGES); setnames(w_pre, setdiff(names(w_pre), c("naics", "agegrp")),
                                      paste0(setdiff(names(w_pre), c("naics", "agegrp")), "_pre"))

qw <- Reduce(function(a, bb) merge(a, bb, by = c("naics", "agegrp")), list(w_base, w_end, w_pre))
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
say("QWI: %d industry x age cells with complete base, pre and end windows",
    nrow(qw))

# ── Exposure ─────────────────────────────────────────────────────────────────
ex <- fread(file.path(repo, "exposure", "output", "exposure_naics3.csv"),
            colClasses = list(character = "naics"))

# ── Join: BTOS adoption -> QWI industries, pooling where the crosswalk says so ─
# Pooled rows (NAICS 2022 combined two 2017 subsectors) are averaged with QWI
# all-ages employment weights, the same idiom as the pooled rows in
# crosswalk_btos_jolts.csv.
empw <- q[agegrp == "A00" & yqi %in% END_Q, .(w = sum(EmpS, na.rm = TRUE)), by = .(qwi_naics3 = industry)]
ad <- merge(xw[, .(btos_subsector, qwi_naics3, relation)], pre, by = "btos_subsector")
ad <- merge(ad, empw, by = "qwi_naics3", all.x = TRUE)
ad[is.na(w), w := 1]
adoption <- ad[, .(adopt = weighted.mean(adopt, w), n_src = .N,
                   pooled = any(relation == "pooled")), by = .(naics = qwi_naics3)]
adoption[, adopt_z := scale(adopt)[, 1]]
say("Adoption joined to %d QWI industries (%d pooled from two BTOS subsectors)",
    nrow(adoption), adoption[pooled == TRUE, .N])

# ═════════════════════════════════════════════════════════════════════════════
# T1 — do adoption and exposure measure the same thing?
# ═════════════════════════════════════════════════════════════════════════════
say("")
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

# ═════════════════════════════════════════════════════════════════════════════
# T4 — early-career hiring against observed adoption
# ═════════════════════════════════════════════════════════════════════════════
say("")
say("T4  Early-career hiring on observed BTOS adoption")
say("%s", strrep("-", 78))

t4 <- merge(qw, adoption[, .(naics, adopt, adopt_z)], by = "naics")
t4 <- merge(t4, ex[metric == "pca_score", .(naics, exposure_z)], by = "naics", all.x = TRUE)
fwrite(t4, out("t4_qwi_frame.csv"))

fit1 <- function(d, y, rhs, tag) {
  f  <- lm(stats::reformulate(rhs, y), data = d)
  ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
  data.table(test = "T4", spec = tag, outcome = y, term = rownames(ct),
             est = ct[, 1], se = ct[, 2], p = ct[, 4], n = nobs(f),
             r2 = summary(f)$r.squared)[term == "adopt_z"]
}

a03 <- t4[agegrp == "A03"]
say("  (a) levels, ages 22-24, n = %d industries", nrow(a03))
t4a <- rbindlist(list(
  fit1(a03, "d_log_hires", "adopt_z", "a: bivariate"),
  fit1(a03, "d_log_hires", c("adopt_z", "pretrend_hires"), "a: + 2017-19 pre-trend"),
  fit1(a03, "d_log_emp",   c("adopt_z", "pretrend_emp"),   "a: employment, + pre-trend"),
  fit1(a03, "d_log_sep",   c("adopt_z", "pretrend_hires"), "a: separations, + pre-trend"),
  fit1(a03, "d_log_repl",  c("adopt_z", "pretrend_hires"), "a: replacement hires, + pre-trend")
))

# (b) The within-industry age difference. Differencing 22-24 against 35-44 in
# the SAME industry removes any industry-level demand shock, which is the
# objection that sinks every level regression in this literature.
wide <- dcast(t4[agegrp %in% c("A03", "A05")], naics + adopt_z + exposure_z ~ agegrp,
              value.var = c("d_log_hires", "d_log_emp", "pretrend_hires"))
wide[, `:=`(diff_hires = d_log_hires_A03 - d_log_hires_A05,
            diff_emp   = d_log_emp_A03   - d_log_emp_A05,
            diff_pre   = pretrend_hires_A03 - pretrend_hires_A05)]
say("  (b) within-industry age difference (22-24 minus 35-44), n = %d", nrow(wide))
t4b <- rbindlist(list(
  fit1(wide, "diff_hires", "adopt_z", "b: age-diff hires"),
  fit1(wide, "diff_hires", c("adopt_z", "diff_pre"), "b: age-diff hires, + pre-trend"),
  fit1(wide, "diff_emp",   "adopt_z", "b: age-diff employment")
))

# (c) Triple difference on the quarterly panel: industry x age x post, with the
# continuous adoption treatment. Two-way clustered on industry and quarter.
pan <- merge(q[agegrp %in% c("A03", "A05") & yqi >= 20151L & HirA > 0 & EmpS > 0],
             adoption[, .(industry = naics, adopt_z)], by = "industry")
pan[, `:=`(young = as.integer(agegrp == "A03"),
           post  = as.integer(yqi >= 20224L),
           lh    = log(HirA), tq = yqi)]
t4c <- tryCatch({
  m <- feols(lh ~ adopt_z:young:post + adopt_z:post + young:post |
               industry^agegrp + tq^agegrp, data = pan,
             cluster = ~ industry + tq)
  ct <- as.data.table(coeftable(m), keep.rownames = "term")
  setnames(ct, c("term", "est", "se", "t", "p"))
  ct[grepl("young", term)][, `:=`(test = "T4", spec = "c: triple difference",
                                  outcome = "log hires", n = nobs(m), r2 = NA_real_)]
}, error = function(e) { say("  (c) triple difference failed: %s", conditionMessage(e)); NULL })

t4_coefs <- rbindlist(list(t4a, t4b, t4c), fill = TRUE)
for (i in seq_len(nrow(t4_coefs)))
  say("  %-32s %-22s %+8.4f (se %.4f, p %.4f) n=%d",
      t4_coefs$spec[i], t4_coefs$outcome[i], t4_coefs$est[i], t4_coefs$se[i],
      t4_coefs$p[i], t4_coefs$n[i])

# ── Minimum detectable effect ────────────────────────────────────────────────
# The CES displacement monitor reports an MDE of roughly 714,000 jobs, which
# makes a null there nearly uninformative about Tucker's 159,000. Recompute it
# for this design rather than assuming QWI fixed the problem.
#
# Units matter here and are easy to garble. This MDE is in log points of hiring
# PER STANDARD DEVIATION of adoption, on the within-industry age difference. It
# is NOT directly comparable to Tucker's 159,000, which is a total employment
# level effect on the top exposure quintile. The right question is only whether
# this design can see an effect of the size we estimate, so both are reported in
# the same units and the jobs figure is given as an illustrative scale, not as a
# rival to Tucker's number.
key      <- t4b[spec == "b: age-diff hires, + pre-trend"]
base_emp <- q[agegrp == "A03" & yqi %in% END_Q, sum(EmpS, na.rm = TRUE)] / 4
mde_log  <- 2.8 * key$se           # 80% power, 5% two-sided
mde_pct  <- 100 * (exp(mde_log) - 1)
est_pct  <- 100 * (exp(key$est) - 1)
say("")
say("  MDE: this design detects %.1f%% per SD of adoption at 80%% power;", mde_pct)
say("       the estimated effect is %.1f%% per SD, so it is %s the detection floor.",
    est_pct, if (abs(est_pct) > mde_pct) "comfortably inside" else "BELOW")
say("       For scale only: %.1f%% of a %s early-career base is about %s jobs per SD.",
    abs(est_pct), format(round(base_emp), big.mark = ","),
    format(round(abs(base_emp * (exp(key$est) - 1))), big.mark = ","))
say("       Not comparable to Tucker's 159,000, which is a level effect on a quintile.")

fwrite(t4_coefs, out("t4_coefs.csv"))

# ═════════════════════════════════════════════════════════════════════════════
# T6 — horse race
# ═════════════════════════════════════════════════════════════════════════════
say("")
say("T6  Adoption and exposure in the same equation")
say("%s", strrep("-", 78))
hr <- wide[!is.na(exposure_z)]
say("  correlation between adoption and exposure across industries: %.3f",
    hr[, cor(adopt_z, exposure_z)])
t6 <- rbindlist(lapply(list(
  list("adoption only", "adopt_z"),
  list("exposure only", "exposure_z"),
  list("both",          c("adopt_z", "exposure_z"))
), function(s) {
  f  <- lm(stats::reformulate(s[[2]], "diff_hires"), data = hr)
  ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
  data.table(test = "T6", spec = s[[1]], term = rownames(ct), est = ct[, 1],
             se = ct[, 2], p = ct[, 4], n = nobs(f), r2 = summary(f)$r.squared)[term != "(Intercept)"]
}))
for (i in seq_len(nrow(t6)))
  say("  %-16s %-12s %+8.4f (se %.4f, p %.4f)  R2 %.3f",
      t6$spec[i], t6$term[i], t6$est[i], t6$se[i], t6$p[i], t6$r2[i])
vif <- 1 / (1 - hr[, cor(adopt_z, exposure_z)]^2)
say("  variance inflation from collinearity: %.2f", vif)
if (vif > 5) say("  NOTE: VIF above 5. The horse race is uninformative and should be read as such.")
fwrite(t6, out("t6_coefs.csv"))

write_json(list(
  built_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  windows = list(base = "2019 (4 quarters)", end = "2024Q3-2025Q2", pretrend = "2017 (4 quarters)"),
  n_industries_adoption = nrow(adoption),
  n_industries_t1 = t1_coefs[metric == "pca_score", n],
  n_industries_t4 = nrow(a03),
  n_industries_t4b = nrow(wide),
  adoption_exposure_cor = round(hr[, cor(adopt_z, exposure_z)], 4),
  vif = round(vif, 3),
  mde_pct_per_sd = round(mde_pct, 3),
  est_pct_per_sd = round(est_pct, 3),
  mde_units = "log points of hiring per SD of adoption, within-industry age difference; not comparable to a level effect",
  early_career_base = round(base_emp),
  note = "Pre-registered in plan_microdata.md before running. All results reported."
), out("tests_industry_meta.json"), auto_unbox = TRUE, pretty = TRUE)

say("")
say("Wrote t1_*, t4_*, t6_* to %s", out())
