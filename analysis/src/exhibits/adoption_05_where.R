#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Adoption, card 05 — "Where are the adopters?"
#
# State and metro adoption at the latest new-wording period only. A single
# cross-section rather than a trend: state cells are thin, and a two-period
# change at this level is mostly sampling noise. Suppressed cells are carried
# with their flag so the map can grey them out rather than show a hole.
#
# Reads   interim/btos/{btos_ai_long.csv, survey_meta.json}
# Writes  interim/cards/adoption_05_where.json
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

latest <- b$yes %>%
  filter(option == "AI current", wording == "new", date == b$latest_new)

# "XX" is the Census rollup row, not a state.
states <- latest %>%
  filter(strata_type == "state", strata_value != "XX") %>%
  transmute(code = strata_value, est, se, suppressed) %>%
  arrange(desc(est)) %>%
  pmap(function(code, est, se, suppressed)
    list(code = code, est = est, se = se, suppressed = suppressed))

msas <- latest %>%
  filter(strata_type == "msa") %>%
  left_join(b$msa_names, by = c("strata_value" = "code")) %>%
  transmute(code = strata_value, name = coalesce(name, strata_value), est, se, suppressed) %>%
  arrange(desc(est)) %>%
  pmap(function(code, name, est, se, suppressed)
    list(code = code, name = name, est = est, se = se, suppressed = suppressed))

write_card(list(geography = list(states = states, msas = msas)),
           "adoption_05_where", digits = 4)

say("  %d states, %d MSAs at %s", length(states), length(msas), b$latest_new)
