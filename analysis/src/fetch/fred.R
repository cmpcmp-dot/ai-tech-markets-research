#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# fetch/fred.R — pull the five FRED series behind Job Displacement card 01.
#
# Series IDs are written out explicitly rather than assembled, because the
# identity of the series is the reproducibility claim:
#
#   UNRATE        civilian unemployment rate, 16+, SA        monthly, %
#   GDPC1         real GDP, chained 2017$, SAAR              quarterly, $bn
#   NROU          CBO noncyclical (natural) rate of u        quarterly, %
#   LNS11300060   labor force participation rate, 25-54, SA  monthly, %
#   LNS12300060   employment-population ratio, 25-54, SA     monthly, %
#
# Writes inputs/fred/fred_series.csv plus a vintage stamp. Splitting the pull
# from the estimation is what makes exhibits/jobs_01_okun.R deterministic: the
# card can be recomputed a hundred times without touching the network, and two
# runs a month apart differ only if this file was refreshed.
#
#   Rscript analysis/src/fetch/fred.R [--out=<dir>]
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressPackageStartupMessages({
  library(tidyusmacro); library(dplyr); library(readr)
})

SERIES <- c("UNRATE", "GDPC1", "NROU", "LNS11300060", "LNS12300060")

out <- fetch_dir("fred")

say("Pulling %d FRED series ...", length(SERIES))
raw <- getFRED(SERIES[1], SERIES[2], SERIES[3], SERIES[4], SERIES[5]) %>%
  arrange(date)

expect <- tolower(SERIES)
missing <- setdiff(expect, names(raw))
if (length(missing))
  stop("FRED returned no column for: ", paste(missing, collapse = ", "),
       "\n  Got: ", paste(names(raw), collapse = ", "), call. = FALSE)

write_csv(raw, file.path(out, "fred_series.csv"))
writeLines(
  c(format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"), paste(SERIES, collapse = " ")),
  file.path(out, "fred_vintage.txt")
)

say("  rows %d, %s to %s", nrow(raw), min(raw$date), max(raw$date))
for (s in expect) {
  v <- raw[[s]]; k <- which(!is.na(v))
  say("  %-12s %5d obs, last %s = %s", toupper(s), length(k),
      raw$date[max(k)], format(v[max(k)]))
}
say("Wrote %s", file.path(out, "fred_series.csv"))
