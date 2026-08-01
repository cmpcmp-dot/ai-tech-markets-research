#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Job Displacement, card 04 — "What do hiring flows show?"
#
# Card 03 asks whether employment fell in high-adoption sectors. This asks the
# sharper question: if AI is displacing work, does it show up as firms not
# HIRING or as firms LAYING PEOPLE OFF? The distinction is the whole argument.
# A hiring freeze and a layoff wave produce similar employment paths and mean
# completely different things for who bears the cost: a freeze falls on people
# trying to enter, a layoff wave on people already in.
#
# Four JOLTS rates, each averaged within an adoption tercile of the 15 JOLTS
# supersectors, three-month trailing mean, 2019 on:
#
#   openings  vacancies posted   -- demand for labour, not just realised hires
#   hires     new starts         -- the freeze margin
#   quits     voluntary exits    -- whether workers see outside options
#   layoffs   involuntary exits  -- the destruction margin
#
# Averaging is employment-weighted within the group, so a supersector counts in
# proportion to the jobs in it. The alternative (unweighted mean of rates) lets
# mining, at under 700k jobs, move the line as much as health care.
#
# Reads   interim/bls/jolts_rates.csv    (clean/ces_jolts.R)
#         interim/bls/jolts_groups.csv
# Writes  interim/cards/jobs_04_flows.json
#
#   Rscript analysis/src/exhibits/jobs_04_flows.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

suppressPackageStartupMessages({
  library(dplyr); library(tidyr); library(readr); library(purrr)
})

assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)

how  <- "Rscript analysis/src/clean/ces_jolts.R"
bls  <- interim_path("bls")
rates <- read_csv(need_file(file.path(bls, "jolts_rates.csv"), how),
                  col_types = cols(industry_code = "c", outcome = "c",
                                   date = "D", rate = "d"))
grps  <- read_csv(need_file(file.path(bls, "jolts_groups.csv"), how),
                  col_types = cols(industry_code = "c", title = "c", members = "c",
                                   prebreak = "d", prebreak_unw = "d",
                                   emp_w = "d", grp = "c"))

CHART_START <- as.Date("2019-01-01")
MA_MONTHS   <- 3
GRP_ORDER   <- c("Low adoption", "Middle", "High adoption")
# Serialisation order only; the chart looks each series up by name. It follows
# the BLS data-element codes (JO, HI, LD, QU) rather than the display order,
# because that is the order the committed contract has always used.
OUTCOME_ORDER <- c("hires", "openings", "layoffs", "quits")

assert(setequal(unique(grps$grp), GRP_ORDER), "unexpected tercile labels")
assert(setequal(unique(rates$outcome), OUTCOME_ORDER), "unexpected JOLTS outcome set")

# Trailing mean, not centered: the last point must be the last observed month,
# not a month with three months of future data behind it. NA for the first two
# months of the window, which are then dropped rather than partially averaged.
ma_trailing <- function(x) as.numeric(stats::filter(x, rep(1 / MA_MONTHS, MA_MONTHS),
                                                    sides = 1))

flows <- rates %>%
  inner_join(grps %>% select(industry_code, emp_w, grp), by = "industry_code") %>%
  filter(date >= CHART_START) %>%
  group_by(grp, outcome, date) %>%
  summarise(rate = weighted.mean(rate, emp_w), .groups = "drop") %>%
  mutate(grp = factor(grp, levels = GRP_ORDER),
         outcome = factor(outcome, levels = OUTCOME_ORDER)) %>%
  arrange(grp, outcome, date) %>%
  group_by(grp, outcome) %>%
  mutate(rate = ma_trailing(rate)) %>%
  ungroup() %>%
  filter(!is.na(rate))

# group_map walks the grouping keys in factor-level order, so the twelve series
# come out grouped by tercile with the four flows inside each.
series <- flows %>%
  group_by(grp, outcome) %>%
  group_map(~ list(
    outcome = as.character(.y$outcome),
    grp     = as.character(.y$grp),
    points  = map2(format(.x$date), .x$rate,
                   ~ list(date = .x, rate = .y))))

members <- grps %>%
  arrange(desc(prebreak)) %>%
  pmap(function(industry_code, title, prebreak, grp, ...)
    list(code = industry_code, title = title,
         adoption = round(prebreak, 1), grp = grp))

# Fragment at 6 decimals, contract at 5. See the note in
# exhibits/jobs_03_industries.R: it is the precision the committed artifact was
# generated at, not a free choice.
write_card(list(a2 = list(series = series, members = members)),
           "jobs_04_flows")

say("-- JOLTS flows by adoption tercile --")
say("  %d supersectors, %d series, %s to %s",
    length(members), length(series),
    format(min(flows$date)), format(max(flows$date)))
for (o in OUTCOME_ORDER) {
  x <- flows %>% filter(outcome == o) %>%
    group_by(grp) %>% slice_max(date, n = 1) %>% ungroup() %>% arrange(grp)
  say("  %-9s %s", o, paste(sprintf("%s %.2f%%", c("lo", "mid", "hi"), x$rate),
                            collapse = "  "))
}
