#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# publish/tracker_jolts.R -- assemble data/tracker-jolts-data.js
#
#   window.TRACKER_JOLTS = { vintage, latest_month, openings, hires, quits,
#                            layoffs, separations, meta }
#
# The national headline rates, distinct from window.BTOS_JOBS_MONITOR.a2, which
# carries the same four flows split by industry AI adoption. Both are drawn on
# the Data Tracker's JOLTS sub-tab and they answer different questions: this one
# is what the release said, that one is whether adopters differ.
#
# Offline, and does no analysis.
#
#   Rscript analysis/src/publish/tracker_jolts.R
# ─────────────────────────────────────────────────────────────────────────────

.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

payload <- read_card("tracker_jolts")

target <- write_js(
  payload, "TRACKER_JOLTS", publish_path("tracker-jolts-data.js"),
  regenerate_with = "Rscript analysis/run.R tracker-jolts",
  digits = 6
)

say("wrote %s (%.1f KB)", target, file.size(target) / 1024)
say("  %s: quits %.1f%%, hires %.1f%%, layoffs %.1f%%, openings %.1f%%",
    payload$latest_month, payload$quits$latest, payload$hires$latest,
    payload$layoffs$latest, payload$openings$latest)
