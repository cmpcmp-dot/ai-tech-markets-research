# ─────────────────────────────────────────────────────────────────────────────
# btos_frame.R — the loader every Adoption exhibit starts with.
#
#   b <- btos_frame()
#
# Returns the tidy BTOS survey frame plus the handful of constants the charts
# share, with the two wording-regime rules already applied so no exhibit can
# forget them:
#
#   b$yes         "Yes" rows, post-break old-wording re-asks removed
#   b$nat         the national subset of the above
#   b$break_date  first period on the new question wording
#   b$latest_new  most recent new-wording period
#   b$meta        everything in interim/btos/survey_meta.json
#   b$naics       code -> title lookup
#   b$msa_names   MSA code -> name lookup
#   b$EMPSIZE_LABELS
#
# Also provides series_pts(), which turns a dated frame into the
# [{date, est, se}] shape every line chart on the tab consumes.
#
# This exists because five exhibits need the same six lines of setup. It is a
# loader, not an analysis layer: nothing here decides anything.
# ─────────────────────────────────────────────────────────────────────────────

suppressMessages({
  library(dplyr); library(readr); library(purrr); library(jsonlite)
})

# Days of tolerance when matching a collection period to a target date, and the
# number of days treated as six months for trailing-change windows.
BTOS_TOL    <- 21
BTOS_SIX_MO <- 182

btos_frame <- function() {
  dir  <- interim_path("btos")
  how  <- "Rscript analysis/src/clean/btos_survey.R"
  long <- read_csv(need_file(file.path(dir, "btos_ai_long.csv"), how),
                   col_types = cols(period = "c", date = "D", option = "c",
                                    answer = "c", wording = "c", strata_type = "c",
                                    strata_value = "c", est = "d", se = "d",
                                    suppressed = "l"))
  meta <- fromJSON(need_file(file.path(dir, "survey_meta.json"), how),
                   simplifyVector = FALSE)

  break_date <- as.Date(meta$break_date)
  latest_new <- as.Date(meta$latest_date)

  # A few post-break periods re-ask the retired wording. They stay in the tidy
  # CSV for provenance and are invisible to every chart.
  yes <- long %>%
    filter(answer == "Yes", !(wording == "old" & date >= break_date))

  list(
    long = long,
    yes  = yes,
    nat  = yes %>% filter(strata_type == "national"),
    break_date = break_date,
    latest_new = latest_new,
    meta = meta,
    naics = read_csv(lookup_path("naics_titles.csv"), col_types = "cc"),
    msa_names = fromJSON(file.path(input_path("btos"), "strata.json"),
                         simplifyDataFrame = TRUE) %>%
      filter(STRATA_TYPE == "msa") %>% select(code = STRATA_VALUE, name = DETAILS),
    EMPSIZE_LABELS = unlist(meta$empsize_labels)
  )
}

series_pts <- function(df) {
  df %>% arrange(date) %>%
    transmute(date = format(date, "%Y-%m-%d"), est, se) %>%
    pmap(function(date, est, se) list(date = date, est = est, se = se))
}
