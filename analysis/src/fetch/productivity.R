#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# fetch/productivity.R -- BLS Major Sector Productivity, nonfarm business.
#
# Four quarterly series, seasonally adjusted, from the PR survey. Together they
# answer the Data Tracker's Productivity question: is output per hour doing
# anything unusual, and is it showing up in labour costs.
#
#   PRS85006092  output per hour        % change from previous quarter, SAAR
#   PRS85006112  unit labour costs      % change from previous quarter, SAAR
#   PRS85006042  output                 % change from previous quarter, SAAR
#   PRS85006032  hours worked           % change from previous quarter, SAAR
#
# VERIFY THE IDS ON FIRST RUN. These follow the documented PRS8500 nonfarm
# business pattern with the standard measure codes, but they have not been
# executed here (no R and no BLS_KEY in the environment this was written in).
# bls_require_all() stops loudly if any of them returns nothing, so a wrong id
# fails rather than silently publishing a short payload. Cross-check at
# https://data.bls.gov/series-id-search/ or in the PR survey documentation.
#
#   Rscript analysis/src/fetch/productivity.R [--from=YYYY]
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "bls_api.R"))

suppressPackageStartupMessages({ library(readr); library(dplyr) })

SERIES <- c(
  opq   = "PRS85006092",   # output per hour, nonfarm business
  ulc   = "PRS85006112",   # unit labour costs
  output = "PRS85006042",  # output
  hours = "PRS85006032"    # hours worked
)

args <- commandArgs(trailingOnly = TRUE)
from <- as.integer(sub("^--from=", "", grep("^--from=", args, value = TRUE)))
if (!length(from) || is.na(from)) from <- as.integer(format(Sys.Date(), "%Y")) - 19L
to   <- as.integer(format(Sys.Date(), "%Y"))

say("Pulling %d BLS productivity series, %d-%d ...", length(SERIES), from, to)
d <- bls_series(unname(SERIES), from, to)
bls_require_all(d, unname(SERIES))

# Attach the short measure name the exhibit works in, so nothing downstream
# has to know a raw series id.
d <- d |>
  mutate(measure = names(SERIES)[match(series_id, SERIES)]) |>
  select(measure, series_id, date, year, period, value)

out <- interim_path("bls")
ensure_dir(out)
target <- file.path(out, "productivity.csv")
write_csv(d, target)

# Vintage is recorded rather than inferred: release-day rebuilds need to be
# distinguishable, and the payload prints it.
writeLines(format(Sys.time(), "%Y-%m-%d %H:%M %Z"),
           file.path(out, "productivity_fetch_vintage.txt"))

say("  %s rows, %s series, %s to %s -> %s",
    format(nrow(d), big.mark = ","), dplyr::n_distinct(d$series_id),
    min(d$date), max(d$date), target)
