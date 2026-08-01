#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Job Displacement, card 03 — "Where has job growth slowed?"
#
# Sort the 18 BTOS sectors into thirds by AI adoption, add up CES payroll
# employment inside each third, and index all three to their own 2019 average.
# Three lines that start together in 2019 and can be read off directly: if
# adoption were displacing work at the sector level, the high-adoption third
# should visibly fall behind.
#
# Two things this chart is not. It is not identified: sectors differ in a
# hundred ways besides adoption, and the earlier cross-section regressions that
# tried to condition on pre-trend and pandemic catch-up were underpowered
# enough that a 200k-job effect sat comfortably inside the confidence interval.
# They were dropped rather than published as null results. And it is a SECTOR
# cut, so anything happening to particular occupations inside every sector is
# invisible here by construction; that is what card 05 is for.
#
# The tercile is on pre-break adoption only. Census rewrote the BTOS AI question
# on 2025-11-17 and the two wordings are never spliced, so the grouping uses one
# consistent definition of "AI use" throughout.
#
# Reads   interim/bls/ces_sector_employment.csv  (clean/ces_jolts.R)
#         interim/bls/sector_groups.csv
#         interim/bls/ces_jolts_meta.json
# Writes  interim/cards/jobs_03_industries.json
#
#   Rscript analysis/src/exhibits/jobs_03_industries.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

suppressPackageStartupMessages({
  library(dplyr); library(tidyr); library(readr); library(purrr); library(jsonlite)
})

assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)

how  <- "Rscript analysis/src/clean/ces_jolts.R"
bls  <- interim_path("bls")
emp  <- read_csv(need_file(file.path(bls, "ces_sector_employment.csv"), how),
                 col_types = cols(strata_value = "c", title = "c", date = "D",
                                  employment = "d"))
grps <- read_csv(need_file(file.path(bls, "sector_groups.csv"), how),
                 col_types = cols(strata_value = "c", title = "c",
                                  prebreak = "d", grp = "c"))
meta <- fromJSON(need_file(file.path(bls, "ces_jolts_meta.json"), how),
                 simplifyVector = TRUE)

CHART_START <- as.Date("2019-01-01")
INDEX_BASE  <- as.Date(meta$index_base)          # the 2019 average, = 100
GRP_ORDER   <- c("Low adoption", "Middle", "High adoption")

assert(setequal(unique(grps$grp), GRP_ORDER), "unexpected tercile labels")

# Sum first, then index. Summing employment and indexing the total is a
# jobs-weighted statement about the third as a whole; indexing each sector and
# averaging the indices would weight a 300k-job sector like a 15m-job one.
lines <- emp %>%
  inner_join(grps %>% select(strata_value, grp), by = "strata_value") %>%
  filter(date >= CHART_START) %>%
  group_by(grp, date) %>%
  summarise(emp = sum(employment), .groups = "drop") %>%
  group_by(grp) %>%
  mutate(index = 100 * emp / mean(emp[date >= INDEX_BASE[1] & date <= INDEX_BASE[2]])) %>%
  ungroup()

assert(all(is.finite(lines$index)), "non-finite index value; check the 2019 base window")

groups <- lines %>%
  mutate(grp = factor(grp, levels = GRP_ORDER)) %>%
  arrange(grp, date) %>%
  group_by(grp) %>%
  group_map(~ list(
    grp    = as.character(.y$grp),
    points = map2(format(.x$date), .x$index,
                  ~ list(date = .x, index = .y))))

members <- grps %>%
  arrange(desc(prebreak)) %>%
  pmap(function(strata_value, title, prebreak, grp)
    list(code = strata_value, title = title,
         adoption = round(prebreak, 1), grp = grp))

# The fragment carries one more decimal than the contract publishes (6 against
# 5). That is not cosmetic: it is the precision the committed artifact was
# generated at, because the old pipeline also wrote an intermediate JSON at 6
# before serialising the contract at 5. Rounding once at 5 instead moves about
# one point in twenty by a single unit in the fifth decimal of an index number.
write_card(list(a1 = list(groups = groups, members = members)),
           "jobs_03_industries")

say("-- Employment by adoption tercile (CES) --")
say("  %d sectors, %d groups, %s to %s",
    length(members), length(groups),
    format(min(lines$date)), format(max(lines$date)))
for (g in GRP_ORDER) {
  x <- lines %>% filter(grp == g) %>% arrange(date)
  say("  %-14s index %.1f at %s (%d sectors)", g, tail(x$index, 1),
      format(tail(x$date, 1)), sum(grps$grp == g))
}
