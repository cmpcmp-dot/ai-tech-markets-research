#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# fetch/jolts_national.R -- national JOLTS headline rates, total nonfarm.
#
# The Data Tracker's JOLTS sub-tab currently shows the ADOPTION SPLIT, which is
# what btos-jobs-monitor publishes because that is what the displacement
# analysis needs. This contract adds the national headline rates that actually
# lead the JOLTS release.
#
# Note for anyone who read an earlier draft of next_phases.md: this cannot be
# derived from interim/bls/jolts_rates.csv. That file holds only the 15
# adoption-group industry codes; there is no total-nonfarm row in it. Hence a
# fetch rather than a publish-only step.
#
#   JTS000000000000000JOR   job openings rate
#   JTS000000000000000HIR   hires rate
#   JTS000000000000000QUR   quits rate
#   JTS000000000000000LDR   layoffs and discharges rate
#   JTS000000000000000TSR   total separations rate
#
# All total nonfarm, all areas, all size classes, seasonally adjusted, rate
# rather than level.
#
# VERIFY THE IDS ON FIRST RUN. These follow the documented JOLTS series-id
# layout (JTS + industry + state + area + sizeclass + element + R for rate) but
# have not been executed here: there is no R and no BLS_KEY in the environment
# this was written in. bls_require_all() stops loudly naming any id that comes
# back empty, so a wrong one fails rather than publishing a short payload.
#
# DENOMINATORS DIFFER. Hires, quits, layoffs and total separations are shares
# of employment. The openings rate is openings over employment plus openings.
# They are all "rates" and they are not the same denominator; the payload keeps
# that in meta and the page says it.
#
#   Rscript analysis/src/fetch/jolts_national.R [--from=YYYY]
# ─────────────────────────────────────────────────────────────────────────────

.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "bls_api.R"))

suppressPackageStartupMessages({ library(readr); library(dplyr) })

SERIES <- c(
  openings    = "JTS000000000000000JOR",
  hires       = "JTS000000000000000HIR",
  quits       = "JTS000000000000000QUR",
  layoffs     = "JTS000000000000000LDR",
  separations = "JTS000000000000000TSR"
)

args <- commandArgs(trailingOnly = TRUE)
from <- as.integer(sub("^--from=", "", grep("^--from=", args, value = TRUE)))
if (!length(from) || is.na(from)) from <- as.integer(format(Sys.Date(), "%Y")) - 19L
to   <- as.integer(format(Sys.Date(), "%Y"))

say("Pulling %d national JOLTS series, %d-%d ...", length(SERIES), from, to)
d <- bls_series(unname(SERIES), from, to)
bls_require_all(d, unname(SERIES))

d <- d |>
  mutate(outcome = names(SERIES)[match(series_id, SERIES)]) |>
  select(outcome, series_id, date, year, period, rate = value)

out <- interim_path("bls")
ensure_dir(out)
target <- file.path(out, "jolts_national.csv")
write_csv(d, target)
writeLines(format(Sys.time(), "%Y-%m-%d %H:%M %Z"),
           file.path(out, "jolts_national_fetch_vintage.txt"))

say("  %s rows, %s outcomes, %s to %s -> %s",
    format(nrow(d), big.mark = ","), dplyr::n_distinct(d$outcome),
    min(d$date), max(d$date), target)
