#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# publish/tracker_productivity.R -- assemble data/tracker-productivity-data.js
#
#   window.TRACKER_PRODUCTIVITY = { vintage, latest_quarter, sample_start,
#                                   opq, ulc, output, hours, meta }
#
# Read by index.html as a classic <script src> and drawn by
# assets/tracker-charts.js into the Data Tracker's Productivity sub-tab.
#
# Offline, and does no analysis: it only wraps the card the exhibit wrote.
#
#   Rscript analysis/src/publish/tracker_productivity.R
# ─────────────────────────────────────────────────────────────────────────────

.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

payload <- read_card("tracker_productivity")

target <- write_js(
  payload, "TRACKER_PRODUCTIVITY", publish_path("tracker-productivity-data.js"),
  regenerate_with = "Rscript analysis/run.R tracker-productivity",
  digits = 6
)

say("wrote %s (%.1f KB)", target, file.size(target) / 1024)
say("  latest %s: output per hour %.1f%% SAAR, unit labour costs %.1f%% SAAR",
    payload$latest_quarter, payload$opq$latest, payload$ulc$latest)
