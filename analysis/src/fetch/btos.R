#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# fetch/btos.R — the Census Business Trends and Outlook Survey, AI questions.
#
# Pulls the public BTOS JSON API and caches one file per collection period, plus
# the stratum dictionary and the AI supplement workbook:
#
#   inputs/btos/period_<id>.json               the two core biweekly AI questions
#   inputs/btos/strata.json                    stratum code -> name (MSA names)
#   inputs/btos/AI_Supplement_Table_2026.xlsx  the depth layer, not in the API
#
# Only the AI rows are kept, not the ~24k-record period dump, which keeps the
# cache lean. Those rows carry every stratum used here (national, state, MSA,
# 2-digit sector, 3-digit subsector, employment size) plus the standard error.
#
# Incremental. Each run rediscovers which periods carry the AI question, fetches
# any that are missing, and always refetches the REFETCH_LATEST most recent by
# date, because Census revises recent periods (the 2025-12-04 supplement erratum,
# for one). The full history stays on disk so clean/btos_survey.R rebuilds
# offline and deterministically.
#
# Fails loudly, but proportionately: a failed fetch with an existing cache warns
# and continues; with no cache at all it stops.
#
# API docs: https://www.census.gov/hfp/btos/api_docs   (no auth, rate-limited)
#
#   Rscript analysis/src/fetch/btos.R [--out=<dir>]
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressMessages({ library(httr); library(jsonlite); library(lubridate) })

API <- "https://www.census.gov/hfp/btos/api"
UA  <- "ESP-BTOS-pipeline/1.0"
REFETCH_LATEST <- 3   # always re-pull the N most recent periods to catch revisions

raw_dir <- fetch_dir("btos")

get_json <- function(path, tries = 3) {
  url <- paste0(API, path)
  for (i in seq_len(tries)) {
    resp <- tryCatch(GET(url, user_agent(UA), timeout(60)), error = function(e) e)
    if (!inherits(resp, "error") && status_code(resp) == 200)
      return(fromJSON(content(resp, as = "text", encoding = "UTF-8"),
                      simplifyDataFrame = TRUE))
    if (i < tries) Sys.sleep(2 * i)   # back off before retry
  }
  stop("API request failed after ", tries, " tries: ", url, call. = FALSE)
}

# ── 1. Which periods carry the AI question? ──────────────────────────────────
# The AI headline is question id 6; it exists only from the period Census added
# it. Discovered from /questions rather than hardcoded, so a new release is
# picked up without editing this file.
say("Discovering AI periods ...")
questions <- get_json("/questions")
ai_qids   <- questions$QUESTION_ID == "6" &
             grepl("Artificial Intelligence", questions$QUESTION, fixed = TRUE)
ai_period_ids <- unique(questions$PERIOD_ID[ai_qids])

periods <- get_json("/periods")
periods$start <- dmy(substr(periods$COLLECTION_START, 1, 9))  # "18-JUL-22 ..." -> Date
periods <- periods[periods$PERIOD_ID %in% ai_period_ids & !is.na(periods$start), ]
# Order by DATE, not id: period ids are not chronological across survey redesigns.
periods <- periods[order(periods$start), ]

if (nrow(periods) == 0)
  stop("No AI periods found -- the API shape may have changed.", call. = FALSE)
say("  %d AI periods, %s to %s (ids %s..%s)", nrow(periods),
    min(periods$start), max(periods$start),
    periods$PERIOD_ID[1], periods$PERIOD_ID[nrow(periods)])

# ── 2. Decide what to fetch: missing + the latest N ──────────────────────────
cached      <- function(id) file.path(raw_dir, paste0("period_", id, ".json"))
latest_ids  <- tail(periods$PERIOD_ID, REFETCH_LATEST)
missing_ids <- periods$PERIOD_ID[!file.exists(vapply(periods$PERIOD_ID, cached, ""))]
to_fetch    <- unique(c(missing_ids, latest_ids))

say("Cache: %d present, %d missing, refetching latest %d -> %d to fetch",
    nrow(periods) - length(missing_ids), length(missing_ids),
    length(latest_ids), length(to_fetch))

# ── 3. Fetch, filter to AI rows, save ───────────────────────────────────────
ok <- 0L; failed <- character(0)
for (id in to_fetch) {
  res <- tryCatch(get_json(paste0("/periods/", id, "/data")), error = function(e) e)
  if (inherits(res, "error")) { failed <- c(failed, id); next }

  # Some periods (future, or collected but not yet published) return an empty
  # array or a shape without the expected columns. Skip those without dying.
  if (!is.data.frame(res) || nrow(res) == 0 || !"OPTION_TEXT" %in% names(res)) {
    say("  period %-4s : no data yet, skipped", id); next
  }
  ai <- res[res$OPTION_TEXT %in% c("AI current", "AI future"), , drop = FALSE]
  if (nrow(ai) == 0) { say("  period %-4s : no AI rows, skipped", id); next }

  write_json(ai, cached(id), auto_unbox = TRUE, na = "null")
  ok <- ok + 1L
  say("  period %-4s %s : %d AI rows", id,
      format(periods$start[periods$PERIOD_ID == id]), nrow(ai))
}

# ── 3b. Stratum dictionary ──────────────────────────────────────────────────
# The period rows carry stratum CODES only. MSA names live here, and
# R/btos_frame.R needs them for Adoption card 05's geography table. Small and
# slow-changing, but fetched rather than hand-kept so a new MSA cannot arrive
# as a bare five-digit code on the page.
say("Fetching the stratum dictionary ...")
strata <- tryCatch(get_json("/strata"), error = function(e) e)
if (!inherits(strata, "error") && is.data.frame(strata) && nrow(strata) > 0) {
  write_json(strata, file.path(raw_dir, "strata.json"), auto_unbox = TRUE, na = "null")
  say("  %d strata (%s)", nrow(strata),
      paste(sprintf("%s %d", names(table(strata$STRATA_TYPE)), table(strata$STRATA_TYPE)),
            collapse = ", "))
} else if (file.exists(file.path(raw_dir, "strata.json"))) {
  say("  WARNING: strata fetch failed -- using the cached copy.")
} else {
  stop("Could not fetch /strata and no cache exists. clean/btos_survey.R needs it.",
       call. = FALSE)
}

# ── 3c. AI supplement workbook ──────────────────────────────────────────────
# The biweekly API carries only the two core firm-weighted AI questions. The
# supplement (business functions, augment/replace, barriers, GenAI tasks) is
# published separately as a downloadable workbook covering the 2025-11-17 to
# 2026-02-08 collection cycle, and it is what Adoption cards 03, 04 and 06 are
# tabulated from. Firm-weighted throughout, like everything else in BTOS.
supp_url  <- "https://www.census.gov/hfp/btos/downloads/AI_Supplement_Table_2026.xlsx"
supp_dest <- file.path(raw_dir, "AI_Supplement_Table_2026.xlsx")
say("Downloading the AI supplement workbook ...")
sresp <- tryCatch(GET(supp_url, user_agent(UA), timeout(120)), error = function(e) e)
if (!inherits(sresp, "error") && status_code(sresp) == 200) {
  bytes <- content(sresp, as = "raw")
  writeBin(bytes, supp_dest)
  say("  wrote %s (%s bytes)", basename(supp_dest), format(length(bytes), big.mark = ","))
} else if (file.exists(supp_dest)) {
  say("  WARNING: supplement download failed -- using the cached copy.")
} else {
  say("  WARNING: supplement download failed and no cache exists.")
  say("           Adoption cards 03, 04 and 06 will be empty until it succeeds.")
}

# ── 4. Report; fail only if there is nothing usable ─────────────────────────
n_have <- length(list.files(raw_dir, pattern = "^period_.*\\.json$"))
if (length(failed)) {
  msg <- paste0("Fetch failed for periods: ", paste(failed, collapse = ", "))
  if (n_have > 0) say("WARNING: %s -- continuing from the existing cache.", msg)
  else stop(msg, " -- and no cache exists.", call. = FALSE)
}
say("")
say("Fetched %d period(s); the cache now holds %d period file(s) in %s",
    ok, n_have, raw_dir)
