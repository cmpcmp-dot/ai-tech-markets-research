#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# fetch/ces_jolts.R — pull the BLS CES and JOLTS flat files.
#
# These are the two BLS whole-survey downloads behind Job Displacement cards 03
# and 04. They are enormous and they are the reason inputs/ is 5.7 GB:
#
#   ces.RDS     ~3.8 GB   all series, all vintages, Current Employment Statistics
#   jolts.RDS   ~210 MB   all series, Job Openings and Labor Turnover Survey
#
# tidyusmacro::getBLSFiles() reads the published flat files rather than the API,
# which is why there is no series-ID list here: the download is the whole survey
# and clean/ces_jolts.R is what narrows it. BLS requires a contact email on flat
# file requests; set BLS_EMAIL in .Renviron rather than editing this file.
#
# This is slow (tens of minutes on a normal connection) and it is not part of a
# routine rebuild. Run it when a new BLS vintage lands, then re-run
# clean/ces_jolts.R with --reslim to re-derive the extracts the cards read.
#
#   Rscript analysis/src/fetch/ces_jolts.R [--out=<dir>] [--only=ces|jolts]
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressPackageStartupMessages({
  library(tidyusmacro)
})

# BLS asks for a contact address on flat file requests and throttles anonymous
# ones. Keep it out of the source: the repository is public.
email <- Sys.getenv("BLS_EMAIL")
if (!nzchar(email))
  stop("BLS_EMAIL is not set.\n",
       "  BLS requires a contact email on flat file requests.\n",
       '  Add a line to ~/.Renviron:  BLS_EMAIL="you@example.org"',
       call. = FALSE)

args <- commandArgs(trailingOnly = TRUE)
only <- sub("^--only=", "", grep("^--only=", args, value = TRUE))
want <- if (length(only)) only else c("ces", "jolts")
bad  <- setdiff(want, c("ces", "jolts"))
if (length(bad)) stop("--only accepts ces or jolts, got: ", paste(bad, collapse = ", "),
                      call. = FALSE)

out <- fetch_dir("bls")

for (src in want) {
  target <- file.path(out, paste0(src, ".RDS"))
  say("Pulling BLS %s flat files (this takes a while) ...", toupper(src))
  d <- getBLSFiles(src, email)
  if (!nrow(d)) stop("getBLSFiles(\"", src, "\") returned no rows.", call. = FALSE)
  saveRDS(d, target)
  say("  %s: %s rows, %s cols -> %s (%.1f GB)", toupper(src),
      format(nrow(d), big.mark = ","), ncol(d), target,
      file.size(target) / 1024^3)
  rm(d); gc(verbose = FALSE)
}

writeLines(
  c(format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"), paste(want, collapse = " ")),
  file.path(out, "bls_vintage.txt")
)
say("Wrote %s", file.path(out, "bls_vintage.txt"))
say("Next: Rscript analysis/src/clean/ces_jolts.R --reslim")
