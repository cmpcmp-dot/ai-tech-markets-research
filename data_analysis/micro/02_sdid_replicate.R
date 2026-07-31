#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# micro/02_sdid_replicate.R — reproduce the Budget Lab at Yale's SDID.
#
# This is the gate. If the numbers here do not land where the Budget Lab's
# published numbers land, the port in 01 is wrong and nothing downstream is
# worth running. Their design, unchanged:
#
#   ages 16+, 2020 dropped, occupations with >= 50 average quarterly obs,
#   balanced panel, seasonally adjusted, pca_score terciles computed UNWEIGHTED,
#   top third treated, bottom third donors, middle third discarded,
#   treatment at 2022Q4, synthdid with a 200-replication bootstrap.
#
# What they report (What We Do and Don't Know About How AI is Affecting the
# Labor Market, 7 May 2026), against which we check ourselves:
#   employment share      no significant effect, a bounded null
#   real hourly wages     no significant effect
#   unemployment rate     about +0.5pp, not significant
#
# Reads:   micro/output/cps_occ_quarter_panel.rds
#          exposure/output/exposure_occ2010.csv
# Writes:  micro/output/sdid_replication.csv
#          micro/output/sdid_replication_omega.csv
#          micro/output/sdid_replication_meta.json
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(data.table); library(jsonlite); library(Hmisc)
})

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
here  <- function(...) file.path(repo, "micro", ...)
out   <- function(...) here("output", ...)
source(here("sdid_core.R"))

say <- function(...) cat(sprintf(...), "\n", sep = "")

panel <- as.data.table(readRDS(out("cps_occ_quarter_panel.rds")))
panel[, occ2010 := sprintf("%04d", as.integer(occ2010))]

exl <- fread(file.path(repo, "exposure", "output", "exposure_occ2010.csv"),
             colClasses = list(character = "occ2010"))
exposure <- exl[metric == "pca_score", .(occ2010, ai_exposure = value)]

say("Panel: %d occupations x %d quarters (%s to %s)",
    panel[, uniqueN(occ2010)], panel[, uniqueN(paste(year, quarter))],
    panel[order(year, quarter)][1, paste0(year, "Q", quarter)],
    panel[order(-year, -quarter)][1, paste0(year, "Q", quarter)])
say("Exposure: %d occupations carry a pca_score", nrow(exposure))
say("  merged:  %d occupations in both", length(intersect(panel$occ2010, exposure$occ2010)))
say("  panel-only (dropped): %d", length(setdiff(panel$occ2010, exposure$occ2010)))
say("")

res <- run_sdid_all(panel, exposure, tag = "replication")

say("")
say("%-24s %10s %9s %8s %8s   %s", "outcome", "ATT", "SE", "t", "p", "units")
say("%s", strrep("-", 78))
for (i in seq_len(nrow(res)))
  say("%-24s %10.4f %9.4f %8.2f %8.3f   %s", res$label[i], res$att[i], res$se[i],
      res$t[i], res$p[i], res$unit[i])
say("%s", strrep("-", 78))
say("units: %d treated, %d control, %d periods, %d pre-treatment",
    res$n_treated[1], res$n_control[1], res$n_periods[1], res$t0[1])
say("mean pca_score: treated %+.3f, control %+.3f",
    res$exposure_treated[1], res$exposure_control[1])

# ── The gate ─────────────────────────────────────────────────────────────────
# Yale publish signs and significance rather than a table of point estimates, so
# the check is on the qualitative pattern they report, not on decimals we do not
# have. Each is stated as a claim about THEIR result that ours must also satisfy.
say("")
say("Replication checks against the Budget Lab's published findings:")
checks <- list()
chk <- function(name, pass, detail) {
  checks[[length(checks) + 1L]] <<- list(check = name, pass = pass, detail = detail)
  say("  [%s] %-46s %s", if (pass) "ok" else "FAIL", name, detail)
}
g <- function(v) res[outcome == v]

e <- g("emp_share_sa")
chk("employment share: no significant effect", nrow(e) == 1L && e$p > 0.05,
    sprintf("ATT %+.4f pp of population, p = %.3f", e$att, e$p))
w <- g("log_real_hrly_wage_sa")
chk("real hourly wages: no significant effect", nrow(w) == 1L && w$p > 0.05,
    sprintf("ATT %+.4f log points, p = %.3f", w$att, w$p))
u <- g("logurate_sa")
chk("unemployment: positive, not significant", nrow(u) == 1L && u$att > 0 && u$p > 0.05,
    sprintf("ATT %+.3f pp, p = %.3f", u$att, u$p))
chk("treated occupations are the more exposed group",
    res$exposure_treated[1] > res$exposure_control[1],
    sprintf("%+.3f vs %+.3f", res$exposure_treated[1], res$exposure_control[1]))
chk("terciles split the sample roughly in thirds",
    abs(res$n_treated[1] - res$n_control[1]) / (res$n_treated[1] + res$n_control[1]) < 0.20,
    sprintf("%d treated vs %d control", res$n_treated[1], res$n_control[1]))

failed <- vapply(checks, function(c) !c$pass, logical(1))

# Persist BEFORE gating. An earlier version stopped on a failed check without
# writing anything, which threw away thirty minutes of estimation and left no
# record of what actually failed. The gate exists to stop downstream scripts
# from consuming an unvalidated replication, not to destroy the evidence.
res[, gate_passed := !any(failed)]
fwrite(res, out("sdid_replication.csv"))
fwrite(attr(res, "omega"),  out("sdid_replication_omega.csv"))
fwrite(attr(res, "groups"), out("sdid_replication_groups.csv"))
say("  results written to %s regardless of gate status", basename(out("sdid_replication.csv")))

write_json(list(
  built_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  design = list(
    source = "Budget Lab at Yale, AI-Effects @ 4898eb3, sdid.R sections 9-12",
    min_age = 16, dropped_year = 2020, obs_threshold = 50,
    exposure_metric = "pca_score", terciles = "unweighted, 1/3 and 2/3",
    treatment = "2022Q4", estimator = "synthdid", bootstrap_replications = 200
  ),
  panel = list(n_occupations = panel[, uniqueN(occ2010)],
               n_quarters = panel[, uniqueN(paste(year, quarter))]),
  results = res,
  checks = checks,
  known_inconsistency = paste(
    "Yale construct logurate as log(urate + 0.0005) but convert the ATT back to",
    "percentage points with (urate + 0.001). We reproduce their conversion rather",
    "than correcting it, so the comparison stays like-for-like.")
), out("sdid_replication_meta.json"), auto_unbox = TRUE, pretty = TRUE)

say("")
say("Wrote %s", out("sdid_replication.csv"))

# Now gate. Downstream scripts (04) refuse to run on an unvalidated replication.
if (any(failed)) {
  say("")
  stop(sprintf("REPLICATION GATE FAILED (%d of %d checks). Results were still written ",
               sum(failed), length(checks)),
       "so the failure can be diagnosed, but 04 must not run until it is understood. ",
       "Do not reinterpret a failed replication as a finding.", call. = FALSE)
}
say("  replication gate passed")
