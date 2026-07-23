#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# 03_ces_slowdown.R  —  Section 3: "Where has job growth slowed the most?"
#
# CES payroll employment (all employees, thousands, SA) for the 11 major
# supersectors that partition total nonfarm (no double-counting):
#   Mining & logging, Construction, Manufacturing, Trade/transport/utilities,
#   Information, Financial activities, Professional & business services,
#   Private education & health, Leisure & hospitality, Other services,
#   Government.
#
# Slowdown metric (first approximation):
#   recent  = trailing-12-month employment growth at the latest month (%)
#   baseline= average of the trailing-12-month growth rate over 2015-2019 (%)
#   slowdown= recent - baseline  (pp; negative => decelerated vs pre-pandemic norm)
# Also reported: net jobs added over the last 12 months (thousands).
#
# Output: data_analysis/output/ces_slowdown.json
# ─────────────────────────────────────────────────────────────────────────────

suppressMessages({
  library(tidyusmacro)
  library(tidyverse)
  library(jsonlite)
  library(lubridate)
})

repo    <- "/Users/mtkonczal/Documents/GitHub/ai-tech-markets-research"
out_dir <- file.path(repo, "data_analysis", "output")
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)
vintage <- format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")

BASELINE_START <- 2015
BASELINE_END   <- 2019

# The 11 supersectors that sum to total nonfarm (display level 2).
super_codes <- c("10","20","30","40","50","55","60","65","70","80","90")

raw <- getBLSFiles("ces", "rortybomb@gmail.com")

ces <- raw %>%
  filter(data_type_code == "01",            # all employees, thousands
         seasonal == "S",                   # seasonally adjusted
         period != "M13",                   # drop annual averages
         supersector_code %in% super_codes,
         industry_code == paste0(supersector_code, "000000")) %>%
  transmute(supersector_code, supersector_name, date, value) %>%
  arrange(supersector_code, date)

stopifnot(nrow(ces) > 0, n_distinct(ces$supersector_code) == 11)

# Trailing-12-month growth at every month, per sector.
ces <- ces %>%
  group_by(supersector_code) %>%
  arrange(date) %>%
  mutate(value_l12 = lag(value, 12),
         yoy = (value / value_l12 - 1) * 100,
         jobs_chg_12 = value - value_l12) %>%
  ungroup()

# Common latest month present for ALL sectors (fail loud if series misaligned).
latest_month <- ces %>% filter(!is.na(yoy)) %>%
  group_by(supersector_code) %>% summarise(mx = max(date), .groups="drop") %>%
  summarise(m = min(mx)) %>% pull(m)

recent <- ces %>% filter(date == latest_month) %>%
  transmute(supersector_code, supersector_name, recent_yoy = yoy,
            jobs_chg_12, level = value)

baseline <- ces %>%
  filter(year(date) >= BASELINE_START, year(date) <= BASELINE_END, !is.na(yoy)) %>%
  group_by(supersector_code) %>%
  summarise(baseline_yoy = mean(yoy), .groups = "drop")

tab <- recent %>%
  left_join(baseline, by = "supersector_code") %>%
  mutate(slowdown = recent_yoy - baseline_yoy) %>%
  arrange(slowdown)   # most negative (biggest slowdown) first

# ── Verdict ──────────────────────────────────────────────────────────────────
worst <- tab %>% slice(1)
worst3 <- tab %>% slice(1:3) %>% pull(supersector_name)
verdict <- sprintf(
  paste0("%s has decelerated most: employment there is growing %.1f%% over the past ",
         "year versus a %.1f%% pre-pandemic (2015-19) pace, a %.1f pp slowdown. The ",
         "sharpest decelerations are in %s."),
  worst$supersector_name, worst$recent_yoy, worst$baseline_yoy, worst$slowdown,
  paste(worst3, collapse = ", ")
)

bars <- tab %>%
  transmute(code = supersector_code,
            sector = supersector_name,
            recent_yoy = round(recent_yoy, 2),
            baseline_yoy = round(baseline_yoy, 2),
            slowdown = round(slowdown, 2),
            jobs_chg_12 = round(jobs_chg_12, 0),
            level = round(level, 0))

ces_slow <- list(
  vintage = vintage,
  latest_month = format(latest_month, "%b %Y"),
  baseline = sprintf("%d-%d average annual growth", BASELINE_START, BASELINE_END),
  method = "recent = trailing-12-mo growth at latest month; baseline = mean trailing-12-mo growth over 2015-2019; slowdown = recent - baseline (pp).",
  units = "percent (growth), pp (slowdown), thousands (jobs change & level)",
  bars = bars,
  verdict = verdict
)

write_json(ces_slow, file.path(out_dir, "ces_slowdown.json"),
           auto_unbox = TRUE, pretty = TRUE, digits = 6)

cat("── CES supersector slowdown (latest:", format(latest_month, "%b %Y"), ") ──\n")
print(as.data.frame(bars), row.names = FALSE)
cat("── Verdict ──\n  ", verdict, "\n", sep = "")
cat("\nWrote ", file.path(out_dir, "ces_slowdown.json"), "\n", sep = "")
