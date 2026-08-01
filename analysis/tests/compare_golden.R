#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# compare_golden.R — prove the refactor did not move a published number.
#
# Compares each generated data/*.js against a snapshot taken before the
# analysis/ refactor. The only differences allowed are the ones declared in
# ALLOWED_REMOVALS: keys we deliberately stopped publishing because nothing on
# the site rendered them.
#
#   Rscript analysis/tests/compare_golden.R <golden_dir>
#
# Exits 0 if the only differences are declared, 1 otherwise. Prints every
# difference rather than stopping at the first: when a join breaks you want to
# see the shape of the damage, not one cell of it.
#
# One caveat on card 01. Its input is a live FRED pull, so a golden snapshot
# taken weeks ago cannot be reproduced from today's data at any level of care.
# That card is verified instead by running the old and new code minutes apart
# against the same pull; see analysis/README.md.
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages(library(jsonlite))

.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
source(file.path(.d, "json_diff.R"))
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

# Contract in data/ -> the name(s) its snapshot may carry in <golden_dir>, most
# recent first. Only one contract was ever renamed, and a snapshot taken before
# 2026-08-01 still calls it microdata.js, so both names resolve. Without the
# fallback a pre-rename snapshot silently SKIPs; without the new name first, a
# post-rename one does.
FILES <- list(
  "jobs-displacement-data.js" = "jobs-displacement-data.js",
  "btos-data.js"              = "btos-data.js",
  "btos-exposure-data.js"     = "btos-exposure-data.js",
  "btos-jobs-monitor-data.js" = "btos-jobs-monitor-data.js",
  "jobs-young-workers-data.js" = c("jobs-young-workers-data.js", "microdata.js")
)

# Top-level keys we deliberately stopped publishing, and why:
#   ces_slowdown             chart replaced by the BTOS tercile cut; unread
#   expectations_vs_realized renderExpect() targets #adExpect, which does not exist
#   monitor                  no chart reads J.monitor
#   t1/t2/t3/t5/t6/...       SDID + horse-race outputs; no chart reads them
ALLOWED_REMOVALS <- list(
  "jobs-displacement-data.js"  = "ces_slowdown",
  "btos-data.js"               = "expectations_vs_realized",
  "btos-jobs-monitor-data.js"  = "monitor",
  "jobs-young-workers-data.js" = c("replication", "t1", "t2", "t3", "t5", "t6",
                                   "goldman", "sources")
)

read_js <- function(path) {
  txt <- paste(readLines(path, warn = FALSE), collapse = "\n")
  txt <- sub("^\\s*(//[^\n]*\n)+", "", txt)
  txt <- sub("^\\s*window\\.[A-Za-z0-9_]+\\s*=\\s*", "", txt)
  fromJSON(sub(";\\s*$", "", txt), simplifyVector = FALSE)
}

args <- commandArgs(trailingOnly = TRUE)
if (!length(args)) stop("usage: compare_golden.R <golden_dir>", call. = FALSE)
golden_dir <- normalizePath(args[1], mustWork = TRUE)

fail <- FALSE
for (cf in names(FILES)) {
  candidates <- file.path(golden_dir, FILES[[cf]])
  gp <- candidates[file.exists(candidates)][1]
  cp <- publish_path(cf)
  cat(sprintf("\n%s\n  golden  %s\n  current %s\n",
              cf, if (is.na(gp)) paste(basename(candidates), collapse = " / ") else gp, cp))

  if (is.na(gp)) { cat("  SKIP: no golden snapshot\n"); next }
  if (!file.exists(cp)) { cat("  FAIL: not generated\n"); fail <- TRUE; next }

  allowed <- ALLOWED_REMOVALS[[cf]]
  if (is.null(allowed)) allowed <- character()
  rep <- new_report()
  cmp(read_js(gp), read_js(cp), "$", rep, allowed)
  if (!report_out(rep, allowed)) fail <- TRUE
}

cat("\n", strrep("-", 70), "\n", sep = "")
if (fail) { cat("RESULT: FAIL\n"); quit(status = 1) }
cat("RESULT: PASS\n")
