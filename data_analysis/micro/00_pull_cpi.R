#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# micro/00_pull_cpi.R — CPI-U, All Items, seasonally adjusted (CUSR0000SA0),
# rebased to December 2022 = 100. Deflator for the real-wage outcome.
#
# Port of the Budget Lab's pull_cpi.R, differing only in that the key comes from
# ~/.Renviron (BLS_KEY) rather than being pasted into the script.
#
# Writes: data/cpi_monthly.csv  (year, month, cpi, cpi_base)
# Usage:  Rscript micro/00_pull_cpi.R
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({ library(httr); library(jsonlite) })

SERIES_ID  <- "CUSR0000SA0"
START_YEAR <- 2005L
END_YEAR   <- 2026L
BLS_URL    <- "https://api.bls.gov/publicAPI/v2/timeseries/data/"

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
dest  <- file.path(repo, "data", "cpi_monthly.csv")

key <- Sys.getenv("BLS_KEY")
if (!nzchar(key)) {
  rn <- file.path(Sys.getenv("HOME"), ".Renviron")
  if (file.exists(rn)) {
    ln <- grep("^BLS_KEY=", readLines(rn, warn = FALSE), value = TRUE)
    if (length(ln)) key <- gsub('^BLS_KEY=|"|\'', "", ln[1])
  }
}
if (!nzchar(key)) stop("BLS_KEY not found in the environment or ~/.Renviron", call. = FALSE)

say <- function(...) cat(sprintf(...), "\n", sep = "")

# The v2 API caps a request at 20 years, so this is chunked.
chunks <- seq(START_YEAR, END_YEAR, by = 10L)
rows <- do.call(rbind, lapply(chunks, function(s) {
  e <- min(s + 9L, END_YEAR)
  say("  requesting %s, %d-%d", SERIES_ID, s, e)
  resp <- POST(BLS_URL, encode = "json", timeout(60), body = list(
    seriesid = list(SERIES_ID), startyear = as.character(s),
    endyear = as.character(e), registrationkey = key))
  stop_for_status(resp)
  res <- content(resp, as = "parsed")
  if (!identical(res$status, "REQUEST_SUCCEEDED"))
    stop("BLS API: ", paste(unlist(res$message), collapse = "; "), call. = FALSE)
  do.call(rbind, lapply(res$Results$series[[1]]$data, function(d) {
    if (!startsWith(d$period, "M") || d$period == "M13") return(NULL)
    v <- suppressWarnings(as.numeric(d$value)); if (is.na(v)) return(NULL)
    data.frame(year = as.integer(d$year),
               month = as.integer(substr(d$period, 2, 3)), cpi = v)
  }))
}))

cpi <- rows[order(rows$year, rows$month), ]
cpi <- cpi[!duplicated(cpi[c("year", "month")]), ]

base <- cpi$cpi[cpi$year == 2022 & cpi$month == 12]
if (!length(base)) stop("December 2022 not in the series; cannot rebase.", call. = FALSE)
cpi$cpi_base <- base

# Sanity: monthly and complete, except for documented gaps.
#
# October 2025 CPI was never published — the funding lapse stopped collection,
# and BLS returns "-" for that month. It is the same shutdown gap that removed
# the October 2025 CPS sample. Downstream, quarterly CPI is a mean over the
# months present, so 2025Q4 is deflated on November and December alone. That
# matches the Budget Lab's `mean(cpi, na.rm = TRUE)` and is noted on the page.
KNOWN_MISSING <- list(c(2025L, 10L))

have <- paste(cpi$year, cpi$month)
grid <- expand.grid(month = 1:12, year = min(cpi$year):max(cpi$year))
grid <- grid[!(grid$year == max(cpi$year) & grid$month > tail(cpi$month, 1)) &
             !(grid$year == min(cpi$year) & grid$month < cpi$month[1]), ]
gaps <- grid[!paste(grid$year, grid$month) %in% have, ]
known <- vapply(seq_len(nrow(gaps)), function(i)
  any(vapply(KNOWN_MISSING, function(k) all(k == c(gaps$year[i], gaps$month[i])), logical(1))),
  logical(1))
if (any(!known))
  stop(sprintf("Unexplained CPI gaps: %s",
               paste(sprintf("%d-%02d", gaps$year[!known], gaps$month[!known]), collapse = ", ")),
       call. = FALSE)
for (i in seq_len(nrow(gaps)))
  say("  gap (known): %d-%02d  not published (funding lapse)", gaps$year[i], gaps$month[i])

dir.create(dirname(dest), showWarnings = FALSE, recursive = TRUE)
write.csv(cpi, dest, row.names = FALSE)
say("Dec 2022 base: %.3f", base)
say("Wrote %s (%d months, %d-%02d to %d-%02d)", dest, nrow(cpi),
    min(cpi$year), cpi$month[1], max(cpi$year), tail(cpi$month, 1))
