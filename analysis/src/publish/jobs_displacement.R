#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# publish/jobs_displacement.R — assemble data/jobs-displacement-data.js
#
#   window.JOBS_DISPLACEMENT_DATA = { generated, okun, age_bands }
#
# Read by index.html and jobs_displacement.html as a classic <script src>, and
# drawn by assets/jobs-charts.js: okun feeds Job Displacement card 01,
# age_bands feeds card 02.
#
# Offline and does no analysis. If a number is not already in a card fragment
# written by an exhibit, it does not belong here.
#
# Dropped in the analysis/ refactor: `ces_slowdown`. It was still being
# computed and published, but the CES-supersector chart it fed was replaced by
# the BTOS adoption-tercile cut in card 03, and nothing had read the key since.
#
#   Rscript analysis/src/publish/jobs_displacement.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

payload <- list(
  generated = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"),
  okun      = read_card("jobs_01_okun"),
  age_bands = read_card("jobs_02_age_bands")
)

target <- publish_path("jobs-displacement-data.js")
write_js(payload, "JOBS_DISPLACEMENT_DATA", target,
         "Rscript analysis/run.R jobs-displacement", digits = 6)

say("Wrote %s (%s bytes)", target, format(file.info(target)$size, big.mark = ","))
