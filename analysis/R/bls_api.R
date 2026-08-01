# ─────────────────────────────────────────────────────────────────────────────
# bls_api.R -- minimal BLS v2 timeseries client.
#
# The older contracts (ces_jolts) pull whole-survey FLAT FILES through
# tidyusmacro, because they need every series in CES and JOLTS. The Data
# Tracker contracts need a handful of named series instead, so they use the
# v2 API: a few KB per request rather than 3.8 GB, and no local cache to keep
# in step.
#
# Requires BLS_KEY in ~/.Renviron. Never printed, never written to disk, never
# committed. Registration is free at https://data.bls.gov/registrationEngine/
#
# The API caps a request at 50 series and 20 years, so bls_series() chunks by
# series and expects the caller to keep the window inside 20 years.
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(httr2)
  library(jsonlite)
  library(dplyr)
})

BLS_V2 <- "https://api.bls.gov/publicAPI/v2/timeseries/data/"

bls_key <- function() {
  k <- Sys.getenv("BLS_KEY")
  if (!nzchar(k))
    stop("BLS_KEY is not set.\n",
         "  Register (free) at https://data.bls.gov/registrationEngine/ and add\n",
         '  a line to ~/.Renviron:  BLS_KEY="..."\n',
         "  Then restart R. Do not put the key in a script.", call. = FALSE)
  k
}

# Return a tidy frame: series_id, year, period, date, value.
# `date` is the first day of the period's month, which is what every chart in
# this repo expects; quarterly series (period Q01..Q04) map to Jan/Apr/Jul/Oct.
bls_series <- function(ids, start_year, end_year) {
  stopifnot(length(ids) > 0, end_year >= start_year)
  if (end_year - start_year > 19)
    stop("BLS v2 allows at most 20 years per request; got ",
         start_year, "-", end_year, ".", call. = FALSE)

  out <- list()
  for (chunk in split(ids, ceiling(seq_along(ids) / 50))) {
    body <- list(seriesid = chunk, startyear = as.character(start_year),
                 endyear = as.character(end_year), registrationkey = bls_key())
    resp <- request(BLS_V2) |>
      req_body_json(body) |>
      req_retry(max_tries = 3) |>
      req_perform() |>
      resp_body_json(simplifyVector = FALSE)

    if (!identical(resp$status, "REQUEST_SUCCEEDED"))
      stop("BLS API returned ", resp$status, ": ",
           paste(unlist(resp$message), collapse = "; "), call. = FALSE)

    for (s in resp$Results$series) {
      if (!length(s$data)) next
      out[[length(out) + 1]] <- tibble(
        series_id = s$seriesID,
        year      = as.integer(vapply(s$data, `[[`, "", "year")),
        period    = vapply(s$data, `[[`, "", "period"),
        value     = suppressWarnings(as.numeric(vapply(s$data, `[[`, "", "value")))
      )
    }
  }
  if (!length(out)) stop("BLS returned no observations for: ",
                         paste(ids, collapse = ", "), call. = FALSE)

  bind_rows(out) |>
    filter(period != "M13") |>            # M13 is the annual average, not a month
    mutate(month = dplyr::case_when(
             grepl("^M", period) ~ as.integer(sub("^M", "", period)),
             grepl("^Q", period) ~ (as.integer(sub("^Q", "", period)) - 1L) * 3L + 1L,
             TRUE ~ NA_integer_)) |>
    filter(!is.na(month)) |>
    mutate(date = as.Date(sprintf("%d-%02d-01", year, month))) |>
    arrange(series_id, date) |>
    select(series_id, year, period, date, value)
}

# Stop unless every requested series came back with data. A mistyped series id
# is otherwise silent: BLS omits it and the payload publishes short.
bls_require_all <- function(d, ids) {
  missing <- setdiff(ids, unique(d$series_id))
  if (length(missing))
    stop("BLS returned no data for ", length(missing), " series:\n    ",
         paste(missing, collapse = "\n    "),
         "\n  Check the ids against https://data.bls.gov/series-id-search/ .",
         call. = FALSE)
  invisible(d)
}
