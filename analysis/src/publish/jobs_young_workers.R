#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# publish/jobs_young_workers.R — assemble data/jobs-young-workers-data.js
#
#   window.JOBS_YOUNG_WORKERS = { vintage, t4, qwi }
#
# Read by index.html and jobs_displacement.html as a classic <script src>, and
# drawn by assets/jobs-charts.js: Job Displacement card 05, early-career hiring
# against BTOS adoption.
#
# Offline and does no analysis.
#
# ── Renamed in the analysis/ refactor ────────────────────────────────────────
# Was data/microdata.js, window.MICRO_DATA. The old contract carried eleven
# blocks from a four-tab research dashboard; this site draws two of them, so the
# other nine are no longer published and the name "microdata" described a file
# that now holds only QWI early-career results:
#
#   sources      CPS / QWI / exposure provenance for panels that are gone
#   replication  synthetic DID replication of Tucker (2026)
#   t1           adoption against exposure -- lives in btos-exposure-data.js now
#   t2, t3, t5   CPS age bands, weighted terciles, telework
#   t6           adoption-vs-exposure horse race (VIF above 5, uninformative)
#   goldman      the Goldman Sachs CPS series rebuilt
#
# Every one of those was computed, published and read by nothing. The SDID chain
# behind `replication` was the largest single piece of the old pipeline and its
# scripts are deleted rather than left to rot.
#
#   Rscript analysis/src/publish/jobs_young_workers.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

card <- read_card("jobs_05_young_workers")

payload <- list(
  vintage = format(Sys.time(), "%Y-%m-%d %H:%M"),
  t4      = card$t4,
  qwi     = card$qwi
)

target <- publish_path("jobs-young-workers-data.js")
# na = "null" is not optional here: several robustness rows have no point
# estimate by construction (the Spearman correlation has a rho, not a slope),
# and jsonlite's default serialises R's NA as the STRING "NA", which is truthy
# in the browser and would be plotted.
write_js(payload, "JOBS_YOUNG_WORKERS", target,
         "Rscript analysis/run.R jobs-young-workers", digits = 6, na = "null")

say("Wrote %s (%s bytes)", target, format(file.info(target)$size, big.mark = ","))
