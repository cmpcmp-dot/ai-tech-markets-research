#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# exhibits/tracker_jolts.R -- Data Tracker: JOLTS national headline rates.
#
# Writes interim/cards/tracker_jolts.json. Offline; reads only what
# fetch/jolts_national.R left in interim/bls/jolts_national.csv.
#
# For each of the five flows: the latest rate, the change over twelve months in
# percentage points, and the 2019 average as the pre-pandemic reference. 2019
# is the reference throughout this repo for the same reason it is on the Jobs
# sub-tab: it is the last full year before the pandemic distorted every labour
# market series, and it is what "back to normal" is usually measured against.
#
# No seasonal adjustment, indexing or smoothing happens here. BLS publishes
# these seasonally adjusted and the numbers are passed through as released.
#
#   Rscript analysis/src/exhibits/tracker_jolts.R
# ─────────────────────────────────────────────────────────────────────────────

.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

suppressPackageStartupMessages({ library(readr); library(dplyr) })

src <- need_file(interim_path("bls", "jolts_national.csv"),
                 "Rscript analysis/src/fetch/jolts_national.R")
d <- read_csv(src, show_col_types = FALSE)

block <- function(o) {
  x <- d |> filter(outcome == o) |> arrange(date)
  if (!nrow(x)) stop("no rows for outcome '", o, "' in ", basename(src), call. = FALSE)
  latest <- tail(x, 1)
  # Twelve months back by date, not by position: JOLTS occasionally revises a
  # month in or out, and tail(x, 13) would then compare the wrong pair.
  prior <- x |> filter(date == latest$date - months(12))
  list(
    latest        = round(latest$rate, 3),
    latest_month  = format(latest$date, "%Y-%m"),
    chg12         = if (nrow(prior)) round(latest$rate - prior$rate, 3) else NA_real_,
    avg_2019      = round(mean(x$rate[x$year == 2019], na.rm = TRUE), 3),
    vs_2019       = round(latest$rate - mean(x$rate[x$year == 2019], na.rm = TRUE), 3),
    n             = nrow(x),
    points        = x |> transmute(date = format(date, "%Y-%m-%d"), rate = round(rate, 3))
  )
}

vintage_file <- interim_path("bls", "jolts_national_fetch_vintage.txt")

card <- list(
  vintage      = if (file.exists(vintage_file)) readLines(vintage_file, warn = FALSE)[1]
                 else format(Sys.time(), "%Y-%m-%d %H:%M %Z"),
  latest_month = format(max(d$date), "%Y-%m"),
  openings     = block("openings"),
  hires        = block("hires"),
  quits        = block("quits"),
  layoffs      = block("layoffs"),
  separations  = block("separations"),
  meta = list(
    survey    = "BLS Job Openings and Labor Turnover Survey (JOLTS), total nonfarm",
    seasonal  = "seasonally adjusted",
    units     = "rate, percent",
    # Kept in the payload because the page states it: the openings rate does
    # not share a denominator with the other four.
    denominators = list(
      openings = "openings as a share of employment plus openings",
      other    = "share of employment"
    ),
    series_ids = list(openings = "JTS000000000000000JOR", hires = "JTS000000000000000HIR",
                      quits = "JTS000000000000000QUR", layoffs = "JTS000000000000000LDR",
                      separations = "JTS000000000000000TSR")
  )
)

write_card(card, "tracker_jolts")
say("tracker_jolts: latest %s, quits %.1f%% (%+.1f pp y/y), openings %.1f%%",
    card$latest_month, card$quits$latest, card$quits$chg12, card$openings$latest)
