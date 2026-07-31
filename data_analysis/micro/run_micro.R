#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# micro/run_micro.R — assemble the Microdata tab's display contract.
#
# Reads every tidy output in micro/output/ and writes data/microdata.js
# defining window.MICRO_DATA. Offline, no analysis: if a number is not already
# in a CSV written by 02-05, it does not belong here.
#
# Usage:  Rscript micro/run_micro.R
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({ library(data.table); library(jsonlite) })

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
out   <- function(...) file.path(repo, "micro", "output", ...)
say   <- function(...) cat(sprintf(...), "\n", sep = "")

rd  <- function(f) if (file.exists(out(f))) fread(out(f)) else NULL
rj  <- function(f) if (file.exists(out(f))) fromJSON(out(f), simplifyVector = FALSE) else NULL
need <- function(x, what) { if (is.null(x)) stop("Missing ", what, " — run the upstream script.",
                                                 call. = FALSE); x }

t1     <- need(rd("t1_coefs.csv"), "T1 coefficients")
t1_sc  <- need(rd("t1_adoption_exposure.csv"), "T1 scatter frame")
t1_tm  <- rd("t1_slope_over_time.csv")
t4     <- need(rd("t4_coefs.csv"), "T4 coefficients")
t4_fr  <- need(rd("t4_qwi_frame.csv"), "T4 frame")
t6     <- need(rd("t6_coefs.csv"), "T6 coefficients")
# The SDID stages are slow (a 200-replication bootstrap per outcome), so the
# page and the paper are built from whatever has run. Both render an explicit
# "not yet run" state rather than an empty panel, and the gap is listed here.
rep    <- rd("sdid_replication.csv")
t2     <- rd("t2_age_bands.csv")
t3     <- rd("t3_weighted_comparison.csv")
t5     <- rd("t5_telework.csv")
gm     <- need(rd("goldman_cps.csv"), "the Goldman CPS rebuild")
# QWI dynamics (06). Post hoc diagnostics of T4, not part of the pre-registered
# list, and flagged as such wherever they surface.
qev    <- rd("qwi_event_study.csv")
qlegs  <- rd("qwi_event_legs.csv")
qpl    <- rd("qwi_placebo.csv")
qrob   <- rd("qwi_robust.csv")
qdesc  <- rd("qwi_descriptive.csv")

missing <- names(Filter(is.null, list(
  "SDID replication (02)"   = rep,
  "T2 age bands (04)"       = t2,
  "T3 weighted terciles (04)" = t3,
  "T5 telework (04)"        = t5)))
if (length(missing)) {
  say("WARNING: not yet run, so these sections will render as pending:")
  for (m in missing) say("  - %s", m)
}

mi <- rj("tests_industry_meta.json")
mq <- rj("qwi_dynamics_meta.json")
mc <- rj("tests_cps_meta.json")
mg <- rj("goldman_cps_meta.json")
mp <- rj("cps_panel_meta.json")
ms <- rj("sdid_replication_meta.json")
qm <- fromJSON(file.path(repo, "qwi", "output", "qwi_meta.json"), simplifyVector = FALSE)
xm <- fromJSON(file.path(repo, "exposure", "output", "exposure_meta.json"), simplifyVector = FALSE)

# The scatter panels only need the pca_score cut; the other metrics live in the
# coefficient table, where they belong.
t1_scatter <- t1_sc[metric == "pca_score", .(naics, adopt, exposure_z, pooled)]
t4_scatter <- t4_fr[agegrp == "A03", .(naics, adopt_z, d_log_hires, d_log_emp, exposure_z)]
t4_agediff <- dcast(t4_fr[agegrp %in% c("A03", "A05")], naics + adopt_z ~ agegrp,
                    value.var = "d_log_hires")
setnames(t4_agediff, c("A03", "A05"), c("hires_2224", "hires_3544"))
t4_agediff[, diff_hires := hires_2224 - hires_3544]

# Readable outcome names. The CSVs carry the variable names the regressions used,
# which is correct for the CSVs and unreadable in a table a human looks at.
OUTLAB <- c(d_log_hires = "Hires, 22-24", d_log_emp = "Employment, 22-24",
            d_log_sep = "Separations, 22-24", d_log_repl = "Replacement hires, 22-24",
            diff_hires = "Hires, 22-24 minus 35-44", diff_emp = "Employment, 22-24 minus 35-44",
            `log hires` = "Hires (quarterly panel)")
t4[, outcome_label := ifelse(is.na(OUTLAB[outcome]), outcome, OUTLAB[outcome])]

# The event-study and descriptive series only need the display window; the full
# path back to 2006 stays in the CSVs.
EV_FROM <- 20154L
qev_d   <- if (!is.null(qev)) qev[yqi >= EV_FROM] else NULL
qdesc_d <- if (!is.null(qdesc)) qdesc[yqi >= EV_FROM] else NULL

payload <- list(
  vintage = format(Sys.time(), "%Y-%m-%d %H:%M"),
  sources = list(
    cps      = mp,
    qwi      = qm,
    exposure = xm
  ),
  replication = list(results = rep, meta = ms),
  t1 = list(coefs = t1, scatter = t1_scatter, over_time = t1_tm,
            n = mi$n_industries_t1,
            tucker_slope = 6.7, tucker_r2 = 0.47),
  t2 = list(results = t2, note = mc$t2$note, headline_band = mc$t2$headline_band),
  t3 = list(comparison = t3, note = mc$t3$note),
  t4 = list(coefs = t4, scatter = t4_scatter, agediff = t4_agediff,
            n = mi$n_industries_t4,
            mde_pct_per_sd = mi$mde_pct_per_sd, est_pct_per_sd = mi$est_pct_per_sd,
            mde_units = mi$mde_units),
  t5 = list(results = t5, note = mc$t5$note,
            exposure_telework_cor = mc$t5$exposure_telework_cor),
  t6 = list(coefs = t6, cor = mi$adoption_exposure_cor, vif = mi$vif),
  # Post hoc, not pre-registered. pre_registered = FALSE travels with the data so
  # the page cannot present these on the same footing as T1-T6 by accident.
  qwi = list(pre_registered = FALSE, event = qev_d, legs = qlegs, placebo = qpl,
             robust = qrob, descriptive = qdesc_d, meta = mq),
  goldman = list(series = gm, meta = mg)
)

js <- paste0(
  "// AUTO-GENERATED by micro/run_micro.R -- do not edit by hand.\n",
  "// Regenerate: Rscript micro/{02,03,04,05}_*.R && Rscript micro/run_micro.R\n",
  "window.MICRO_DATA = ",
  toJSON(payload, auto_unbox = TRUE, pretty = TRUE, digits = 6, null = "null", na = "null"),
  ";\n")

# `repo` is data_analysis/ in this layout; the site's data/ is one level up.
# (data_analysis/data/ is the ignored IPUMS input cache, not the publish dir.)
# Keep this in step with btos/run_btos.R if the tree ever moves.
data_dir <- file.path(dirname(repo), "data")
dir.create(data_dir, showWarnings = FALSE, recursive = TRUE)
target <- file.path(data_dir, "microdata.js")
con <- file(target, open = "w", encoding = "UTF-8")
writeLines(enc2utf8(js), con, useBytes = TRUE)
close(con)
say("Wrote %s (%s bytes)", target, format(file.info(target)$size, big.mark = ","))
