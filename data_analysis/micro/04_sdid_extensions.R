#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# micro/04_sdid_extensions.R — the CPS-side pre-registered tests.
#
#   T2  Yale's design, run on the age bands Tucker looks at
#   T3  Does the null come from weighting every occupation equally?
#   T5  Is it AI, or is it remote work?
#
# Runs only if 02 passed its replication gate. A departure from Yale's design is
# only interpretable against a replication that worked.
#
# Reads:   micro/output/cps_occ_quarter_panel.rds
#          micro/output/cps_occ_quarter_age.rds
#          micro/output/cps_telework_occ.rds
#          micro/output/sdid_replication.csv
#          exposure/output/exposure_occ2010.csv
# Writes:  micro/output/t2_age_bands.csv
#          micro/output/t3_weighted.csv
#          micro/output/t5_telework.csv
#          micro/output/tests_cps_meta.json
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(data.table); library(jsonlite); library(Hmisc)
  library(sandwich); library(lmtest)
})

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
here  <- function(...) file.path(repo, "micro", ...)
out   <- function(...) here("output", ...)
source(here("sdid_core.R"))

say    <- function(...) cat(sprintf(...), "\n", sep = "")
assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)

assert(file.exists(out("sdid_replication.csv")),
       "No replication results. Run micro/02_sdid_replicate.R first — its gate must pass.")

panel <- as.data.table(readRDS(out("cps_occ_quarter_panel.rds")))
panel[, occ2010 := sprintf("%04d", as.integer(occ2010))]
byage <- as.data.table(readRDS(out("cps_occ_quarter_age.rds")))
byage[, occ2010 := sprintf("%04d", as.integer(occ2010))]

exl <- fread(file.path(repo, "exposure", "output", "exposure_occ2010.csv"),
             colClasses = list(character = "occ2010"))
exposure <- exl[metric == "pca_score", .(occ2010, ai_exposure = value)]

# ═════════════════════════════════════════════════════════════════════════════
# T2 — Yale's design, on the age bands Tucker looks at
# ═════════════════════════════════════════════════════════════════════════════
# The Budget Lab report they could not run the 22-27 recent-graduate cut because
# too few occupations cleared their 50-observation screen. On our panel it
# yields 106 occupations, so the cut is runnable. Whether it is INFORMATIVE is a
# separate question and the confidence intervals answer it, not the point
# estimates. A wide null is not evidence of no effect.
#
# The headline band gets all four outcomes; the rest get employment share and
# unemployment, because the median-wage outcome in a narrow age band is thin.
say("T2  Yale's SDID by age band")
say("%s", strrep("-", 78))
HEADLINE_BAND <- "22-27"
t2 <- rbindlist(lapply(sort(unique(byage$band)), function(bd) {
  p  <- byage[band == bd]
  os <- if (bd == HEADLINE_BAND) SDID_OUTCOMES else SDID_OUTCOMES[c("emp_share_sa", "logurate_sa")]
  say("  band %-6s %d occupations, %d outcomes", bd, p[, uniqueN(occ2010)], length(os))
  r <- run_sdid_all(p, exposure, tag = paste0("T2:", bd), outcomes = os)
  if (nrow(r)) r[, band := bd]
  r
}), fill = TRUE)

# The pooled 16+ replication, for reference in the same table.
rep <- fread(out("sdid_replication.csv"))
rep[, band := "16+ (replication)"]
t2 <- rbindlist(list(rep, t2), fill = TRUE)

say("")
say("  %-20s %-24s %9s %9s %9s %8s %6s", "band", "outcome", "ATT", "SE", "95% lo/hi", "p", "n_tr")
for (i in seq_len(nrow(t2)))
  say("  %-20s %-24s %+9.4f %9.4f %+9.4f %8.3f %6d",
      t2$band[i], t2$label[i], t2$att[i], t2$se[i], t2$ci_lo[i], t2$p[i], t2$n_treated[i])
fwrite(t2, out("t2_age_bands.csv"))

# ═════════════════════════════════════════════════════════════════════════════
# T3 — does the null come from weighting every occupation equally?
# ═════════════════════════════════════════════════════════════════════════════
# Yale compute exposure terciles unweighted, so a 30,000-person occupation
# counts the same as a 3,000,000-person one. They say so and defend it: each
# occupation is one piece of evidence about AI. But it means the estimate is not
# the labor-force-weighted effect on exposed workers. Re-cutting the terciles by
# employment answers whether that choice is doing the work.
say("")
say("T3  Employment-weighted exposure terciles")
say("%s", strrep("-", 78))
pre_emp <- panel[year == 2019, .(emp_wt = mean(emp_wt, na.rm = TRUE)), by = occ2010]
panel_w <- merge(panel, pre_emp, by = "occ2010")
t3 <- run_sdid_all(panel_w, exposure, tag = "T3:weighted", weight_var = "emp_wt")
if (nrow(t3)) {
  cmp <- merge(rep[, .(outcome, label, att_uw = att, se_uw = se, p_uw = p)],
               t3[, .(outcome, att_w = att, se_w = se, p_w = p, n_treated, n_control)],
               by = "outcome")
  for (i in seq_len(nrow(cmp)))
    say("  %-24s unweighted %+8.4f (p %.3f)   weighted %+8.4f (p %.3f)   %d/%d units",
        cmp$label[i], cmp$att_uw[i], cmp$p_uw[i], cmp$att_w[i], cmp$p_w[i],
        cmp$n_treated[i], cmp$n_control[i])
  fwrite(cmp, out("t3_weighted_comparison.csv"))
}
fwrite(t3, out("t3_weighted.csv"))

# ═════════════════════════════════════════════════════════════════════════════
# T5 — is it AI, or is it remote work?
# ═════════════════════════════════════════════════════════════════════════════
# DESCRIPTIVE ONLY, and the reason is structural, not a hedge. CPS first asks
# about telework in October 2022 — after the treatment date. Conditioning on a
# post-treatment variable is a bad control: if exposure raised telework, the
# control absorbs part of the very effect being estimated. So this is a
# decomposition of what moved with what, not an identified estimate, and it is
# labelled that way wherever it appears.
#
# It is also not run through SDID. Residualising an outcome on a post-period
# covariate and then feeding it to a synthetic-control estimator would dress the
# bad control up as identification. A transparent cross-section is more honest.
say("")
say("T5  Telework as a confounder (descriptive)")
say("%s", strrep("-", 78))
tw <- as.data.table(readRDS(out("cps_telework_occ.rds")))
tw[, occ2010 := sprintf("%04d", as.integer(occ2010))]
tw_occ <- tw[year >= 2023, .(telework_share = weighted.mean(telework_share, tw_den, na.rm = TRUE),
                             tw_n = sum(tw_den)), by = occ2010]

pre_w  <- panel[year %in% 2018:2019, lapply(.SD, mean, na.rm = TRUE),
                by = occ2010, .SDcols = c("emp_share_sa", "logurate_sa", "log_real_hrly_wage_sa")]
post_w <- panel[year >= 2024, lapply(.SD, mean, na.rm = TRUE),
                by = occ2010, .SDcols = c("emp_share_sa", "logurate_sa", "log_real_hrly_wage_sa")]
ch <- merge(pre_w, post_w, by = "occ2010", suffixes = c("_pre", "_post"))
ch[, `:=`(d_emp_share = emp_share_sa_post - emp_share_sa_pre,
          d_logurate  = logurate_sa_post  - logurate_sa_pre,
          d_logwage   = log_real_hrly_wage_sa_post - log_real_hrly_wage_sa_pre)]
ch <- merge(ch, exposure, by = "occ2010")
ch <- merge(ch, tw_occ, by = "occ2010", all.x = TRUE)
ch[, exposure_z := scale(ai_exposure)[, 1]]
ch <- ch[!is.na(telework_share)]
say("  %d occupations with both an exposure score and a post-2022 telework share",
    nrow(ch))
say("  correlation between exposure and telework share: %.3f",
    ch[, cor(exposure_z, telework_share)])

t5 <- rbindlist(lapply(c("d_emp_share", "d_logurate", "d_logwage"), function(y) {
  rbindlist(lapply(list(c("exposure_z"), c("exposure_z", "telework_share")), function(rhs) {
    f  <- lm(stats::reformulate(rhs, y), data = ch)
    ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
    data.table(test = "T5", outcome = y,
               spec = if (length(rhs) == 1L) "exposure only" else "+ telework share",
               term = rownames(ct), est = ct[, 1], se = ct[, 2], p = ct[, 4],
               n = nobs(f), r2 = summary(f)$r.squared)[term != "(Intercept)"]
  }))
}))
for (i in seq_len(nrow(t5)))
  say("  %-14s %-18s %-16s %+8.4f (se %.4f, p %.4f)",
      t5$outcome[i], t5$spec[i], t5$term[i], t5$est[i], t5$se[i], t5$p[i])
fwrite(t5, out("t5_telework.csv"))

write_json(list(
  built_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  t2 = list(bands = sort(unique(byage$band)),
            headline_band = HEADLINE_BAND,
            note = paste("The Budget Lab report they could not run the 22-27 cut for lack of",
                         "occupations clearing the 50-observation screen. On this panel it",
                         "yields 106. Runnable is not the same as informative; read the CIs.")),
  t3 = list(note = "Exposure terciles re-cut with 2019 employment weights; nothing else changes."),
  t5 = list(note = paste("DESCRIPTIVE ONLY. CPS asks about telework from October 2022, after",
                         "treatment, so this conditions on a post-treatment variable and is a",
                         "bad control. Reported as a decomposition, never as identification."),
            n_occupations = nrow(ch),
            exposure_telework_cor = round(ch[, cor(exposure_z, telework_share)], 4))
), out("tests_cps_meta.json"), auto_unbox = TRUE, pretty = TRUE)

say("")
say("Wrote t2_*, t3_*, t5_* to %s", out())
