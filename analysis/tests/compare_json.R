#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# compare_json.R — do these two JSON files hold the same numbers?
#
#   Rscript analysis/tests/compare_json.R <a.json> <b.json>
#
# Exits 0 if every value matches to 1e-9 relative, ignoring vintage stamps.
# Used throughout the analysis/ refactor to prove that a rewritten exhibit
# reproduces the script it replaced, and useful afterwards for the same
# question about any change you make: run it before, run it after, diff.
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 2) stop("usage: compare_json.R <a.json> <b.json>", call. = FALSE)

.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
source(file.path(.d, "json_diff.R"))

a <- normalizePath(args[1], mustWork = TRUE)
b <- normalizePath(args[2], mustWork = TRUE)
cat(sprintf("a  %s\nb  %s\n", a, b))

rep <- new_report()
cmp(fromJSON(a, simplifyVector = FALSE), fromJSON(b, simplifyVector = FALSE), "$", rep)
ok <- report_out(rep)
quit(status = if (ok) 0 else 1)
