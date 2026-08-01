#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Adoption, card 03 — "Which firms?"
#
# Four cuts of the same adoption measure, answering who is actually doing this:
#
#   size_class   adoption over time by employment size class (A-G). The single
#                most important chart on the tab, because BTOS is firm-weighted
#                and this gradient is the only visible substitute for the
#                employment-weighted number Census does not publish.
#   subsector    3-digit NAICS ranking at the latest new-wording period.
#   diffusion    trailing 6- and 12-month change by 2-digit sector: who is
#                accelerating, not just who is high.
#   size_gradient / sector_adoption
#                the supplement's own firm-size and sector breakouts.
#
# The diffusion window is the delicate one. A trailing change is computed ONLY
# when both endpoints sit on the same side of the 2025-11-17 wording break.
# Spanning it would report the question rewrite as adoption growth. At the
# moment that rules out every 12-month change, which is correct and is shown
# as absent rather than filled in.
#
# Reads   interim/btos/{btos_ai_long.csv, survey_meta.json, supplement.json}
# Writes  interim/cards/adoption_03_who.json
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

EMPSIZE_LABELS <- b$EMPSIZE_LABELS

# ── Adoption over time by employment size class ──────────────────────────────
size_class <- b$yes %>%
  filter(strata_type == "empsize", option == "AI current") %>%
  group_by(strata_value) %>%
  group_map(~ list(
    class  = .y$strata_value,
    label  = unname(EMPSIZE_LABELS[.y$strata_value]),
    series = .x %>% arrange(date) %>%
      transmute(date = format(date, "%Y-%m-%d"), est, se, wording, suppressed) %>%
      pmap(function(date, est, se, wording, suppressed)
        list(date = date, est = est, se = se,
             wording = wording, suppressed = suppressed)))) %>%
  keep(~ .x$class %in% names(EMPSIZE_LABELS)) %>%
  (\(x) x[order(match(map_chr(x, "class"), names(EMPSIZE_LABELS)))])()

# ── Subsector ranking, latest new-wording period ─────────────────────────────
# Standard 3-digit NAICS only. BTOS aggregate and rollup codes (NNX, NN0, XXX)
# are excluded: they double-count and carry no standard title.
std_subsector <- b$naics$code[grepl("^[0-9]{3}$", b$naics$code)]

subsector <- b$yes %>%
  filter(strata_type == "subsector", wording == "new",
         date == b$latest_new, strata_value %in% std_subsector) %>%
  select(naics3 = strata_value, option, est, se, suppressed) %>%
  pivot_wider(names_from = option, values_from = c(est, se, suppressed)) %>%
  left_join(b$naics, by = c("naics3" = "code")) %>%
  transmute(naics3, name = coalesce(title, naics3),
            current = `est_AI current`, current_se = `se_AI current`,
            future  = `est_AI future`,
            suppressed = coalesce(`suppressed_AI current`, TRUE)) %>%
  arrange(desc(current)) %>%
  pmap(function(naics3, name, current, current_se, future, suppressed)
    list(naics3 = naics3, name = name, current = current,
         current_se = current_se, future = future, suppressed = suppressed))

# ── Diffusion speed by 2-digit sector ────────────────────────────────────────
sector_yes <- b$yes %>%
  filter(strata_type == "sector", option == "AI current",
         !is.na(est), strata_value != "XX")

# Nearest reading to a target date, within tolerance, on the same side of the
# wording break as the target.
nearest_sector <- function(code, target, tol = BTOS_TOL) {
  cand <- sector_yes %>%
    filter(strata_value == code, (target >= b$break_date) == (date >= b$break_date))
  if (nrow(cand) == 0) return(NA_real_)
  i <- which.min(abs(as.numeric(cand$date - target)))
  if (abs(as.numeric(cand$date[i] - target)) > tol) return(NA_real_)
  cand$est[i]
}
same_regime <- function(a, z) (a >= b$break_date) == (z >= b$break_date)

diffusion <- sector_yes %>%
  group_by(strata_value) %>% filter(date == max(date)) %>% ungroup() %>%
  transmute(sector = strata_value, latest_date = date, latest = est) %>%
  left_join(b$naics, by = c("sector" = "code")) %>%
  rowwise() %>%
  mutate(
    chg6  = if (same_regime(latest_date, latest_date - BTOS_SIX_MO))
              latest - nearest_sector(sector, latest_date - BTOS_SIX_MO) else NA_real_,
    chg12 = if (same_regime(latest_date, latest_date - 2 * BTOS_SIX_MO))
              latest - nearest_sector(sector, latest_date - 2 * BTOS_SIX_MO) else NA_real_
  ) %>%
  ungroup() %>%
  transmute(sector, name = coalesce(title, sector), latest, chg6, chg12) %>%
  arrange(desc(latest)) %>%
  pmap(function(sector, name, latest, chg6, chg12)
    list(sector = sector, name = name, latest = latest, chg6 = chg6, chg12 = chg12))

write_card(list(
  size_class = size_class,
  subsector  = subsector,
  diffusion  = diffusion,
  supplement_who = list(size_gradient   = supp$size_gradient,
                        sector_adoption = supp$sector_adoption)
), "adoption_03_who", digits = 4)

say("  %d size classes, %d subsectors ranked, %d sectors",
    length(size_class), length(subsector), length(diffusion))
n12 <- sum(vapply(diffusion, function(x) !is.null(x$chg12) && !is.na(x$chg12), logical(1)))
say("  12-month changes computable for %d of %d sectors (break-crossing windows are dropped)",
    n12, length(diffusion))
