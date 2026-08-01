#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# exhibits/tracker_productivity.R -- Data Tracker: Productivity.
#
# Writes interim/cards/tracker_productivity.json. Offline; reads only what
# fetch/productivity.R left in interim/bls/productivity.csv.
#
# UNITS. Every series is already a percent change from the previous quarter at
# an annual rate, as published. Nothing here re-annualises or re-indexes, so
# the numbers on the page are BLS's own. `yoy` is the four-quarter change in
# the LEVEL, reconstructed by compounding the four most recent quarterly rates,
# which is not the same thing as averaging them and is the comparison people
# actually mean by "over the year".
#
# The 2019 average is carried as the pre-pandemic reference because the useful
# question is whether output per hour is running above or below the trend it
# had before, not whether one quarter was strong.
#
#   Rscript analysis/src/exhibits/tracker_productivity.R
# ─────────────────────────────────────────────────────────────────────────────

.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

suppressPackageStartupMessages({ library(readr); library(dplyr) })

src <- need_file(interim_path("bls", "productivity.csv"),
                 "Rscript analysis/src/fetch/productivity.R")
d <- read_csv(src, show_col_types = FALSE)

qlabel <- function(dt) paste0(format(dt, "%Y"), "Q", (as.integer(format(dt, "%m")) - 1) %/% 3 + 1)

# Compound four quarterly annualised rates into a four-quarter level change.
# Each rate r is annualised, so one quarter's level factor is (1 + r/100)^(1/4).
yoy_from_saar <- function(rates) {
  if (length(rates) < 4 || anyNA(tail(rates, 4))) return(NA_real_)
  (prod((1 + tail(rates, 4) / 100)^(1 / 4)) - 1) * 100
}

block <- function(m) {
  x <- d |> filter(measure == m) |> arrange(date)
  if (!nrow(x)) stop("no rows for measure '", m, "' in ", basename(src), call. = FALSE)
  list(
    latest         = round(tail(x$value, 1), 3),
    latest_quarter = qlabel(tail(x$date, 1)),
    yoy            = round(yoy_from_saar(x$value), 3),
    avg_2019       = round(mean(x$value[x$year == 2019], na.rm = TRUE), 3),
    n              = nrow(x),
    # A data frame serialises as an array of records, which is the shape every
    # other payload in this repo uses for a series.
    points         = x |>
      transmute(quarter = qlabel(date), date = format(date, "%Y-%m-%d"),
                value = round(value, 3))
  )
}

vintage_file <- interim_path("bls", "productivity_fetch_vintage.txt")

card <- list(
  vintage        = if (file.exists(vintage_file)) readLines(vintage_file, warn = FALSE)[1]
                   else format(Sys.time(), "%Y-%m-%d %H:%M %Z"),
  latest_quarter = qlabel(max(d$date)),
  sample_start   = qlabel(min(d$date)),
  opq            = block("opq"),
  ulc            = block("ulc"),
  output         = block("output"),
  hours          = block("hours"),
  meta = list(
    survey     = "BLS Major Sector Productivity (PR), nonfarm business",
    seasonal   = "seasonally adjusted",
    units      = "percent change from previous quarter at an annual rate",
    series_ids = list(opq = "PRS85006092", ulc = "PRS85006112",
                      output = "PRS85006042", hours = "PRS85006032")
  )
)

write_card(card, "tracker_productivity")
say("tracker_productivity: %s quarters, latest %s, output per hour %.1f%% SAAR",
    card$opq$n, card$latest_quarter, card$opq$latest)
