#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# publish/btos_jobs_monitor.R — assemble data/btos-jobs-monitor-data.js
#
#   window.BTOS_JOBS_MONITOR = { vintage, ces_latest, jolts_latest, counts,
#                                jolts_groups, windows, dropped, a1, a2 }
#
# Read by index.html and jobs_displacement.html as a classic <script src>, and
# drawn by assets/jobs-charts.js: a1 feeds Job Displacement card 03 (employment
# by adoption tercile), a2 feeds card 04 (JOLTS flows by tercile). The section
# notes render `ces_latest`, `jolts_latest`, `windows.break_date` and
# `dropped.sectors_no_ces`, so no vintage or exclusion count is typed into the
# HTML by hand and none of them can go stale.
#
# Offline and does no analysis.
#
# Dropped in the analysis/ refactor: the whole `monitor` block -- board, decomp,
# quad, mde, scorecard, nat_adopt, total_private_chg. It was still being
# computed and published, but the dashboard markup and
# assets/jobs-monitor-charts.js that drew it were removed on 2026-07-31, so
# nothing has read `J.monitor` since. Also gone, and never published: the 96
# cross-section regression coefficients, the placebo fits, the added-variable
# plot and the quarterly panel. Those were an identification attempt that the
# sample could not support -- a 200k-job effect sat inside the confidence
# interval -- and cards 03 and 04 are descriptive by design.
#
#   Rscript analysis/src/publish/btos_jobs_monitor.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

suppressPackageStartupMessages({ library(dplyr); library(readr); library(purrr) })

meta <- fromJSON(need_file(interim_path("bls", "ces_jolts_meta.json"),
                           "Rscript analysis/src/clean/ces_jolts.R"),
                 simplifyVector = FALSE)

# The supersector table is the one place a reader can see how much the
# employment weighting moves each group's adoption figure, so it ships with the
# unweighted mean and the gap beside the number the cards actually use.
jolts_groups <- read_csv(need_file(interim_path("bls", "jolts_groups.csv"),
                                   "Rscript analysis/src/clean/ces_jolts.R"),
                         col_types = cols(industry_code = "c", title = "c",
                                          members = "c", prebreak = "d",
                                          prebreak_unw = "d", emp_w = "d", grp = "c")) %>%
  pmap(function(industry_code, title, members, prebreak, prebreak_unw, ...) {
    # gap is the difference of the two PUBLISHED figures, not of the raw ones,
    # so the printed columns add up on the page. For professional and business
    # services the raw difference is -1.158; the rounded columns read
    # 11.66 - 12.81, and the table shows -1.15.
    p <- round(prebreak, 2); u <- round(prebreak_unw, 2)
    list(code = industry_code, title = title, members = members,
         prebreak = p, prebreak_unw = u, gap = round(p - u, 2))
  })

industries <- read_card("jobs_03_industries")
flows      <- read_card("jobs_04_flows")

payload <- list(
  vintage      = format(Sys.time(), "%Y-%m-%d %H:%M %Z"),
  ces_latest   = meta$ces_latest,
  jolts_latest = meta$jolts_latest,
  counts       = meta$counts,
  jolts_groups = jolts_groups,
  windows      = meta$windows,
  dropped      = meta$dropped,
  a1           = industries$a1,
  a2           = flows$a2
)

target <- publish_path("btos-jobs-monitor-data.js")
write_js(payload, "BTOS_JOBS_MONITOR", target,
         "Rscript analysis/run.R btos-jobs-monitor", digits = 5)

say("Wrote %s (%s bytes)", target, format(file.info(target)$size, big.mark = ","))
