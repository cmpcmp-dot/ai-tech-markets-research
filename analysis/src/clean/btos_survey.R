#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# clean/btos_survey.R — the biweekly BTOS AI question, tidied.
#
# One row per collection period x question x answer x stratum. Strata are
# national, state, MSA, 2-digit NAICS sector, 3-digit NAICS subsector, and
# employment size class. Rows setting more than one stratum column are
# cross-tabs this site does not use and are dropped.
#
# Three things about this survey that every chart downstream has to respect,
# and which are handled once, here:
#
#   1. The 2025-11-17 wording change. Census rewrote the AI question ("using
#      AI in producing goods or services" became a business-functions framing)
#      and the new series sits well above the old one. The two are NEVER
#      spliced. `wording` marks every row old or new, and a change computed
#      across the break is not a change, it is the rewrite.
#
#   2. A few post-break periods re-ask the RETIRED old wording. Those readings
#      belong to neither clean series. They stay in the tidy CSV for
#      provenance and are dropped from everything a chart can see.
#
#   3. Suppressed cells are kept and flagged, never silently dropped, so a
#      thin stratum reads as absent rather than as zero.
#
# Everything BTOS is FIRM-weighted. Census publishes no employment-weighted
# adoption number and this pipeline does not invent one; the firm-size
# gradient in the supplement is the substitute.
#
# Reads   inputs/btos/period_*.json + strata.json   (fetch/btos.R)
#         src/lookups/naics_titles.csv
# Writes  interim/btos/btos_ai_long.csv    the tidy frame every exhibit reads
#         interim/btos/survey_meta.json    break date, latest period, labels
#
#   Rscript analysis/src/clean/btos_survey.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressMessages({
  library(dplyr); library(tidyr); library(readr); library(purrr)
  library(lubridate); library(jsonlite)
})

raw_dir <- input_path("btos")
out_dir <- ensure_dir(interim_path("btos"))

# Employment size class labels (A-G). Source: BTOS "Employment Size Class.xlsx"
# Data Dictionary sheet (verified 2026-07-26). Not available from the API.
EMPSIZE_LABELS <- c(A = "1-4", B = "5-9", C = "10-19", D = "20-49",
                    E = "50-99", F = "100-249", G = "250+")

raw_files <- list.files(raw_dir, pattern = "^period_.*\\.json$", full.names = TRUE)
if (length(raw_files) == 0)
  stop("No raw period files under ", raw_dir,
       "\n  How to get them: Rscript analysis/src/fetch/btos.R", call. = FALSE)

read_period <- function(f) {
  d <- fromJSON(f, simplifyDataFrame = TRUE)
  # Force the columns we use to character so bind_rows never fights on type.
  cols <- c("PERIOD_ID", "DATE_RANGE", "STATE", "NAICS2", "MSA", "NAICS3", "EMPSIZE",
            "ESTIMATE_PERCENTAGE", "STANDARD_ERROR", "QUESTION", "ANSWER", "OPTION_TEXT")
  d[cols] <- lapply(d[cols], as.character)
  d[cols]
}
raw <- map_dfr(raw_files, read_period)

# ── Tidy long ────────────────────────────────────────────────────────────────
strata_cols <- c("STATE", "NAICS2", "NAICS3", "MSA", "EMPSIZE")

long <- raw %>%
  mutate(
    date    = mdy(trimws(sub("-.*$", "", DATE_RANGE))),   # start of "m/d/Y - m/d/Y"
    est     = suppressWarnings(as.numeric(ESTIMATE_PERCENTAGE)),
    se      = suppressWarnings(as.numeric(STANDARD_ERROR)),
    option  = OPTION_TEXT,                                # "AI current" / "AI future"
    answer  = ANSWER,
    wording = if_else(grepl("business functions", QUESTION, fixed = TRUE), "new", "old"),
    n_strata   = rowSums(!is.na(across(all_of(strata_cols)))),
    suppressed = is.na(est)
  ) %>%
  filter(n_strata <= 1) %>%
  mutate(
    strata_type = case_when(
      n_strata == 0   ~ "national",
      !is.na(STATE)   ~ "state",     !is.na(NAICS2)  ~ "sector",
      !is.na(NAICS3)  ~ "subsector", !is.na(MSA)     ~ "msa",
      !is.na(EMPSIZE) ~ "empsize"),
    strata_value = coalesce(STATE, NAICS2, NAICS3, MSA, EMPSIZE, NA_character_)
  ) %>%
  select(period = PERIOD_ID, date, option, answer, wording,
         strata_type, strata_value, est, se, suppressed) %>%
  arrange(date, strata_type, strata_value)

write_csv(long, file.path(out_dir, "btos_ai_long.csv"))

# ── Regime boundaries ────────────────────────────────────────────────────────
# The adoption metric everywhere is the "Yes" share.
yes <- long %>% filter(answer == "Yes")
nat <- yes %>% filter(strata_type == "national")

break_date <- nat %>% filter(option == "AI current", wording == "new") %>%
  summarise(m = min(date)) %>% pull(m)
latest_new <- nat %>% filter(option == "AI current", wording == "new") %>%
  summarise(m = max(date)) %>% pull(m)

n_anom <- sum(yes$wording == "old" & yes$date >= break_date)
nat_clean <- nat %>% filter(!(wording == "old" & date >= break_date))

latest_current <- nat_clean %>% filter(option == "AI current", date == latest_new) %>% pull(est)
latest_future  <- nat_clean %>% filter(option == "AI future") %>%
  filter(date == max(date)) %>% pull(est)

# ── Assertions: fail loudly on drift or a schema change ──────────────────────
# These exist because a silent Census revision is indistinguishable from a
# parsing bug. If one fires, check whether the series was revised before
# relaxing the anchor.
anchor <- function(period_id, expected, tol, what) {
  v <- nat_clean %>% filter(period == period_id, option == "AI current") %>% pull(est)
  if (length(v) != 1 || is.na(v) || abs(v - expected) > tol)
    stop(sprintf("Sanity anchor failed: %s = %s, expected ~%.1f (+/-%.1f)",
                 what, paste(v, collapse = ","), expected, tol))
  say("  anchor OK: %s = %.1f%%", what, v)
}
anchor("31", 3.7, 1.0, "national AI-current Yes, period 31 (Sep 2023)")
anchor("84", 10.0, 1.5, "national AI-current Yes, period 84")

# Yes + No + Do-not-know should account for every firm, every period.
chk <- long %>% filter(strata_type == "national", option == "AI current") %>%
  group_by(period) %>% summarise(tot = sum(est, na.rm = TRUE), .groups = "drop") %>%
  filter(abs(tot - 100) > 0.6)
if (nrow(chk) > 0)
  stop("National AI-current answers do not sum to 100 in periods: ",
       paste(chk$period, collapse = ", "))

if (any(yes$est < 0 | yes$est > 100, na.rm = TRUE)) stop("Estimate outside [0,100].")
if (any(long$se < 0, na.rm = TRUE)) stop("Negative standard error.")
if (is.na(break_date) || break_date < as.Date("2025-11-01") ||
    break_date > as.Date("2025-12-15"))
  stop("Wording break date implausible: ", break_date)

# ── Survey-level metadata every Adoption exhibit and the publisher need ──────
write_json(list(
  n_periods    = length(raw_files),
  break_date   = format(break_date, "%Y-%m-%d"),
  latest_date  = format(latest_new, "%Y-%m-%d"),
  dropped_post_break_old_wording = n_anom,
  shutdown_gap = list(start = "2025-10-06", end = "2025-11-16",
                      note = "No collection (funding lapse); coincides with the wording break."),
  weighting      = "firm-weighted (core series has no employment weight)",
  empsize_labels = as.list(EMPSIZE_LABELS),
  headline_now   = list(current = latest_current, future = latest_future),
  source = list(
    api    = "https://www.census.gov/hfp/btos/api",
    note   = paste("Census Business Trends and Outlook Survey (BTOS), core",
                   "biweekly AI question. Firm-weighted 'Yes' share.",
                   "Experimental data product."),
    method = "Share answering Yes to the AI-use question, by stratum, per collection period.")
), file.path(out_dir, "survey_meta.json"), auto_unbox = TRUE, pretty = TRUE, digits = 4)

say("  periods %d | break %s | latest %s", length(raw_files), break_date, latest_new)
if (n_anom > 0) say("  dropped %d post-break old-wording re-ask row(s) from charts", n_anom)
say("  latest national adoption (new wording) %.1f%% ; 6-mo expectation %.1f%%",
    latest_current, latest_future)
say("Wrote %s", file.path(out_dir, "btos_ai_long.csv"))
