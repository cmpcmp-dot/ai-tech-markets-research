#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# 01_fetch_btos.R  —  Stage 1 (the ONLY script that touches the network).
#
# Pulls the Census Business Trends and Outlook Survey (BTOS) AI-adoption series
# from the public JSON API and caches one file per collection period to
#   btos/output/raw/period_<id>.json
#
# We save the AI-question rows only (OPTION_TEXT in "AI current"/"AI future"),
# not the full ~24k-record period dump, to keep the on-disk cache lean. Those
# rows carry every stratum we need (national, sector, subsector, state, MSA,
# employment size) plus the standard error.
#
# Incremental: on each run we (re)discover the AI periods, fetch any that are
# missing, and always refetch the latest 3 by date (BTOS revises recent data;
# e.g. the 2025-12-04 AI-supplement erratum). Full history stays on disk so
# stage 2 can rebuild offline and deterministically.
#
# Fail loudly: a failed fetch with an existing cache warns and continues; with
# no cache at all it stops.
#
# API docs: https://www.census.gov/hfp/btos/api_docs   (no auth, rate-limited)
#
# Usage:  Rscript btos/01_fetch_btos.R
# ─────────────────────────────────────────────────────────────────────────────

suppressMessages({
  library(httr)
  library(jsonlite)
  library(lubridate)
})

# Repo root = two dirs up from this script (btos/ -> repo), so paths don't
# depend on the caller's working directory.
.file    <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo     <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
raw_dir  <- file.path(repo, "btos", "output", "raw")
dir.create(raw_dir, showWarnings = FALSE, recursive = TRUE)

API      <- "https://www.census.gov/hfp/btos/api"
REFETCH_LATEST <- 3   # always re-pull the N most recent periods to catch revisions

# ── GET JSON with a couple of retries; return parsed list or stop() ───────────
get_json <- function(path, tries = 3) {
  url <- paste0(API, path)
  for (i in seq_len(tries)) {
    resp <- tryCatch(
      GET(url, user_agent("ESP-BTOS-pipeline/1.0"), timeout(60)),
      error = function(e) e
    )
    if (!inherits(resp, "error") && status_code(resp) == 200) {
      txt <- content(resp, as = "text", encoding = "UTF-8")
      return(fromJSON(txt, simplifyDataFrame = TRUE))
    }
    if (i < tries) Sys.sleep(2 * i)   # back off before retry
  }
  stop("API request failed after ", tries, " tries: ", url)
}

# ── 1. Which periods carry the AI question? ───────────────────────────────────
# The AI headline is question id 6 ("AI current"); it is only present from the
# period Census added it. Discover the set from /questions rather than hardcode,
# so new releases are picked up automatically.
message("Discovering AI periods ...")
questions <- get_json("/questions")
ai_qids   <- questions$QUESTION_ID == "6" &
             grepl("Artificial Intelligence", questions$QUESTION, fixed = TRUE)
ai_period_ids <- unique(questions$PERIOD_ID[ai_qids])

periods <- get_json("/periods")
periods$start <- dmy(substr(periods$COLLECTION_START, 1, 9))  # "18-JUL-22 ..." -> Date
periods <- periods[periods$PERIOD_ID %in% ai_period_ids & !is.na(periods$start), ]
periods <- periods[order(periods$start), ]                     # ORDER BY DATE, not id

if (nrow(periods) == 0) stop("No AI periods found — API shape may have changed.")
message(sprintf("  %d AI periods, %s to %s (ids %s..%s)",
                nrow(periods), min(periods$start), max(periods$start),
                periods$PERIOD_ID[1], periods$PERIOD_ID[nrow(periods)]))

# ── 2. Decide what to fetch: missing + latest N ───────────────────────────────
cached  <- function(id) file.path(raw_dir, paste0("period_", id, ".json"))
latest_ids  <- tail(periods$PERIOD_ID, REFETCH_LATEST)
missing_ids <- periods$PERIOD_ID[!file.exists(vapply(periods$PERIOD_ID, cached, ""))]
to_fetch    <- unique(c(missing_ids, latest_ids))

message(sprintf("Cache: %d present, %d missing, refetching latest %d -> %d to fetch",
                nrow(periods) - length(missing_ids), length(missing_ids),
                length(latest_ids), length(to_fetch)))

# ── 3. Fetch, filter to AI rows, save ─────────────────────────────────────────
ok <- 0L; failed <- character(0)
for (id in to_fetch) {
  res <- tryCatch(get_json(paste0("/periods/", id, "/data")), error = function(e) e)
  if (inherits(res, "error")) { failed <- c(failed, id); next }

  # Some periods (future/not-yet-collected) return an empty array or a shape
  # without the expected columns — skip those without dying.
  if (!is.data.frame(res) || nrow(res) == 0 || !"OPTION_TEXT" %in% names(res)) {
    message(sprintf("  period %-4s : no data yet, skipped", id)); next
  }
  ai <- res[res$OPTION_TEXT %in% c("AI current", "AI future"), , drop = FALSE]
  if (nrow(ai) == 0) {
    message(sprintf("  period %-4s : no AI rows, skipped", id)); next
  }

  write_json(ai, cached(id), auto_unbox = TRUE, na = "null")
  ok <- ok + 1L
  message(sprintf("  period %-4s %s : %d AI rows", id,
                  format(periods$start[periods$PERIOD_ID == id]), nrow(ai)))
}

# ── 3b. AI supplement (one-time XLSX; NOT in the JSON API) ─────────────────────
# The biweekly API carries only the two core firm-weighted AI questions. The AI
# supplement (business functions, augment/replace, barriers, GenAI use) is
# published separately as a downloadable workbook on the BTOS Downloads page,
# covering the 2025-11-17..2026-02-08 collection cycle. Pull it here; it is the
# Tier 3 depth layer. Firm-weighted throughout (no employment weighting), and
# every Tier 3 figure is tabulated from this public file.
supp_url  <- "https://www.census.gov/hfp/btos/downloads/AI_Supplement_Table_2026.xlsx"
supp_dest <- file.path(raw_dir, "AI_Supplement_Table_2026.xlsx")
message("Downloading AI supplement XLSX ...")
sresp <- tryCatch(GET(supp_url, user_agent("ESP-BTOS-pipeline/1.0"), timeout(120)),
                  error = function(e) e)
if (!inherits(sresp, "error") && status_code(sresp) == 200) {
  bytes <- content(sresp, as = "raw")
  writeBin(bytes, supp_dest)
  message(sprintf("  wrote %s (%s bytes)", basename(supp_dest),
                  format(length(bytes), big.mark = ",")))
} else if (file.exists(supp_dest)) {
  message("  WARNING: supplement download failed — using cached copy.")
} else {
  message("  WARNING: supplement download failed and no cache — Tier 3 supplement ",
          "charts will be empty until it succeeds.")
}

# ── 4. Report; fail loudly only if we have nothing usable ─────────────────────
have_any <- length(list.files(raw_dir, pattern = "^period_.*\\.json$")) > 0
if (length(failed)) {
  msg <- paste0("Fetch failed for periods: ", paste(failed, collapse = ", "))
  if (have_any) message("WARNING: ", msg, " — continuing from existing cache.")
  else stop(msg, " — and no cache exists.")
}
cat(sprintf("\nFetched %d period(s); cache now holds %d file(s) in %s\n",
            ok, length(list.files(raw_dir, pattern = "^period_.*\\.json$")), raw_dir))
