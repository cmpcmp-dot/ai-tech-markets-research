#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Adoption, card 01 — "How many firms are we talking about?"
#
# The national headline adoption series, in four segments: current use and
# six-month expectation, each split at the 2025-11-17 question rewrite. Four
# separate series rather than two, because the old and new wordings are not
# the same question and drawing them as one line would invent a jump.
#
# Reads   interim/btos/{btos_ai_long.csv, survey_meta.json, supplement.json}
# Writes  interim/cards/adoption_01_aggregate.json
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))
source(analysis_path("R", "btos_frame.R"))

suppressMessages({ library(dplyr); library(tidyr); library(purrr); library(jsonlite) })

b <- btos_frame()
supp <- fromJSON(need_file(interim_path("btos", "supplement.json"),
                           "Rscript analysis/src/clean/btos_supplement.R"),
                 simplifyVector = FALSE)

nat <- b$nat

write_card(list(
  headline = list(
    current_old = series_pts(filter(nat, option == "AI current", wording == "old")),
    current_new = series_pts(filter(nat, option == "AI current", wording == "new")),
    future_old  = series_pts(filter(nat, option == "AI future",  wording == "old")),
    future_new  = series_pts(filter(nat, option == "AI future",  wording == "new"))
  ),
  # The supplement's own firm-weighted headline and provenance block travel
  # with this card; the publisher folds them back into `supplement`.
  supplement_headline = supp$headline,
  supplement_meta     = supp$meta
), "adoption_01_aggregate", digits = 4)

say("  headline series: %d old / %d new current-use points",
    length(series_pts(filter(nat, option == "AI current", wording == "old"))),
    length(series_pts(filter(nat, option == "AI current", wording == "new"))))
