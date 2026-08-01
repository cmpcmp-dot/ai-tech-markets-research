#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# clean/ces_jolts.R — BLS CES employment and JOLTS flows, cut to the units the
# adoption comparison is made on, with each unit's BTOS adoption attached.
#
# Two BLS whole-survey downloads come in. What goes out is four small frames
# keyed by the analysis unit, so neither exhibit has to know anything about BLS
# series coding or about the BTOS-to-BLS crosswalk:
#
#   ces_sector_employment.csv  BTOS 2-digit sector x month  -> JD card 03
#   jolts_rates.csv            JOLTS supersector x flow x month -> JD card 04
#   sector_groups.csv          18 sectors, adoption + tercile
#   jolts_groups.csv           15 supersectors, adoption + tercile + weight
#   ces_jolts_meta.json        vintages, windows, unit counts, exclusions
#
# ── The three decisions made here ────────────────────────────────────────────
#
# 1. Adoption is the mean of BTOS "AI current"/Yes over the whole PRE-BREAK
#    span, 2023-09-11 to 2025-11-16 (locked 2026-07-26). The obvious
#    alternative is the first six months only ("initial exposure"), which is
#    cleaner on reverse causality. It is not used, because BTOS suppression is
#    heaviest early: that window leaves 15 sectors / 33 subsectors against
#    18 / 46 here, and the exclusions correlate with cell size and therefore
#    with adoption itself. Spearman between the two measures is 0.91. Initial
#    exposure, the post-break level and "AI future" are all still computed, so
#    a robustness cut can be taken without touching this file.
#
# 2. A unit needs at least MIN_READS unsuppressed readings inside a window for
#    that window's measure to exist. Below that it is NA and the unit sits out.
#
# 3. BTOS sectors are pooled into JOLTS supersectors with CES EMPLOYMENT
#    weights. BTOS is firm-weighted and Census publishes no firm counts at this
#    cut, so there is no firm-weighted way to pool. The unweighted alternative
#    rides along as `prebreak_unw` and the difference is published as `gap`, so
#    a reader can see how much the weighting choice moves each supersector.
#
# Terciles, not a median split (changed 2026-07-31). Both cards cut on thirds of
# their own unit's adoption distribution, so the two exhibits speak one language
# and the middle of the distribution stays visible rather than being folded into
# whichever half it fell in.
#
# Reads   inputs/bls/{ces,jolts}.RDS          (fetch/ces_jolts.R)
#         interim/btos/btos_ai_long.csv       (clean/btos_survey.R)
#         src/lookups/crosswalk_btos_jolts.csv
# Writes  interim/bls/{ces_slim,jolts_slim}.rds   slim extracts, cached
#         interim/bls/ces_sector_employment.csv
#         interim/bls/jolts_rates.csv
#         interim/bls/sector_groups.csv
#         interim/bls/jolts_groups.csv
#         interim/bls/ces_jolts_meta.json
#
#   Rscript analysis/src/clean/ces_jolts.R            reuse the slim extracts
#   Rscript analysis/src/clean/ces_jolts.R --reslim   re-derive them (slow)
#
# --reslim reloads a 3.8 GB RDS and takes a couple of minutes. Everything after
# the slimming step is seconds, so the default reuses interim/bls/*_slim.rds and
# only the BTOS side is recomputed. Pass --reslim after a new BLS vintage.
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressPackageStartupMessages({
  library(dplyr); library(tidyr); library(readr); library(purrr)
  library(lubridate); library(jsonlite)
})

assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)

out_dir <- ensure_dir(interim_path("bls"))
reslim  <- "--reslim" %in% commandArgs(trailingOnly = TRUE)

# ── Windows ──────────────────────────────────────────────────────────────────
# INIT_*  the six-month "initial exposure" window, kept as a robustness measure
# BASE_*  base window both outcomes are measured from
# PRE_*   2017-19, the pre-period the cards' notes quote
# C19_*   2019 average, the level card 03 indexes employment to
INIT_START  <- as.Date("2023-09-01"); INIT_END  <- as.Date("2024-02-29")
BASE_START  <- as.Date("2023-09-01"); BASE_END  <- as.Date("2024-02-01")
MIN_READS   <- 3                    # unsuppressed BTOS readings per unit
PRE_A_START <- as.Date("2017-01-01"); PRE_A_END <- as.Date("2017-06-01")
PRE_B_START <- as.Date("2019-07-01"); PRE_B_END <- as.Date("2019-12-01")
C19_START   <- as.Date("2019-01-01"); C19_END   <- as.Date("2019-12-01")
BREAK_DATE  <- as.Date("2025-11-17") # first period on the rewritten BTOS question
END_MONTHS  <- 6                    # length of the terminal window

# CES data_type codes: 01 all employees, 56 aggregate weekly hours.
CES_EMP <- "01"; CES_HRS <- "56"
# JOLTS data elements, and the names the site uses for them. TS (total
# separations) is deliberately absent: nothing downstream reads it, and an
# unnamed element used to serialise as a fifth series with outcome:null.
JOLTS_EL <- c(JO = "openings", HI = "hires", QU = "quits", LD = "layoffs")

# ═══ 1. Slim BLS extracts ════════════════════════════════════════════════════
# The whole-survey files are unusable in memory alongside anything else, so each
# is loaded once, cut to seasonally adjusted monthly rows at the display levels
# and data types used here, and dropped.
ces_slim_path   <- file.path(out_dir, "ces_slim.rds")
jolts_slim_path <- file.path(out_dir, "jolts_slim.rds")
how_fetch       <- "Rscript analysis/src/fetch/ces_jolts.R"

if (reslim || !file.exists(ces_slim_path)) {
  say("Deriving slim CES extract from inputs/bls/ces.RDS (3.8 GB, ~2 min) ...")
  ces_raw <- readRDS(need_file(input_path("bls", "ces.RDS"), how_fetch))
  ces_slim <- ces_raw %>%
    filter(seasonal == "S", period != "M13",
           data_type_code %in% c(CES_EMP, CES_HRS),
           # 1 = total private, the card's reference line; 5 = 4-digit NAICS
           industry_display_level %in% 1:5) %>%
    select(date, industry_code, naics_code, industry_name,
           industry_display_level, data_type_code, value)
  saveRDS(ces_slim, ces_slim_path); rm(ces_raw); gc(verbose = FALSE)
  say("  %s rows -> %s", format(nrow(ces_slim), big.mark = ","), ces_slim_path)
} else {
  ces_slim <- readRDS(ces_slim_path)
  say("Reusing %s (%s rows). --reslim to re-derive.",
      basename(ces_slim_path), format(nrow(ces_slim), big.mark = ","))
}

if (reslim || !file.exists(jolts_slim_path)) {
  say("Deriving slim JOLTS extract from inputs/bls/jolts.RDS ...")
  jolts_raw <- readRDS(need_file(input_path("bls", "jolts.RDS"), how_fetch))
  jolts_slim <- jolts_raw %>%
    # state 00 = national, sizeclass 00 = all sizes, ratelevel R = rate not level
    filter(seasonal == "S", period != "M13", state_code == "00",
           sizeclass_code == "00", ratelevel_code == "R",
           dataelement_code %in% c(names(JOLTS_EL), "TS")) %>%
    select(date, industry_code, industry_text, dataelement_code, value)
  saveRDS(jolts_slim, jolts_slim_path); rm(jolts_raw); gc(verbose = FALSE)
  say("  %s rows -> %s", format(nrow(jolts_slim), big.mark = ","), jolts_slim_path)
} else {
  jolts_slim <- readRDS(jolts_slim_path)
  say("Reusing %s (%s rows). --reslim to re-derive.",
      basename(jolts_slim_path), format(nrow(jolts_slim), big.mark = ","))
}

ces_latest   <- max(ces_slim$date)
jolts_latest <- max(jolts_slim$date)
say("CES through %s | JOLTS through %s", format(ces_latest), format(jolts_latest))

ces_end_start   <- ces_latest   %m-% months(END_MONTHS - 1)
jolts_end_start <- jolts_latest %m-% months(END_MONTHS - 1)

# ═══ 2. BTOS adoption measures ═══════════════════════════════════════════════
ai <- read_csv(need_file(interim_path("btos", "btos_ai_long.csv"),
                         "Rscript analysis/src/clean/btos_survey.R"),
               show_col_types = FALSE) %>%
  filter(answer == "Yes", !suppressed, !is.na(est),
         strata_type %in% c("sector", "subsector"),
         # XX / XXX are the "all sectors" rollups, not a unit of analysis.
         !strata_value %in% c("XX", "XXX"))

assert(all(ai$est >= 0 & ai$est <= 100), "BTOS estimates outside [0,100].")
ai_start <- min(ai$date)

measure <- function(opt, from, to, nm) {
  ai %>%
    filter(option == opt, date >= from, date <= to) %>%
    group_by(strata_type, strata_value) %>%
    summarise(v = mean(est), reads = n(), .groups = "drop") %>%
    filter(reads >= MIN_READS) %>%
    rename(!!nm := v, !!paste0("reads_", nm) := reads)
}

adoption <-
  measure("AI current", ai_start,   BREAK_DATE - 1, "prebreak") %>%
  full_join(measure("AI current", INIT_START,  INIT_END,       "initial"),
            by = c("strata_type", "strata_value")) %>%
  full_join(measure("AI current", BREAK_DATE,  max(ai$date),   "postbreak"),
            by = c("strata_type", "strata_value")) %>%
  full_join(measure("AI future",  ai_start,    BREAK_DATE - 1, "future"),
            by = c("strata_type", "strata_value")) %>%
  filter(!is.na(prebreak))

say("Adoption coverage (units with >= %d unsuppressed readings):", MIN_READS)
print(adoption %>% group_by(strata_type) %>%
        summarise(across(c(prebreak, initial, postbreak, future),
                         ~ sum(!is.na(.x))), .groups = "drop"))

# ═══ 3. CES, keyed by the BTOS unit ══════════════════════════════════════════
xwalk <- read_csv(lookup_path("crosswalk_btos_jolts.csv"),
                  col_types = cols(.default = col_character()))
assert(nrow(xwalk) == 19, "Crosswalk should carry all 19 non-XX BTOS sectors.")

ces_sector_map <- xwalk %>% filter(!is.na(ces_industry_code)) %>%
  transmute(strata_value = btos_sector, industry_code = ces_industry_code,
            title = btos_title)

# Subsectors are BTOS 3-digit NAICS, which CES publishes directly at display
# level 4, so no hand crosswalk is needed on this side.
ces_sub_map <- ces_slim %>%
  filter(industry_display_level == 4, nchar(naics_code) == 3) %>%
  distinct(strata_value = naics_code, industry_code, title = industry_name)

ces_series <- function(map) {
  ces_slim %>%
    inner_join(map, by = "industry_code", relationship = "many-to-many") %>%
    select(strata_value, title, date, data_type_code, value)
}

win_mean <- function(d, v, from, to) mean(v[d >= from & d <= to], na.rm = TRUE)

# Which units have a usable CES series. The base-to-terminal change these
# windows define is no longer published -- the cross-section regressions it fed
# were dropped in the analysis/ refactor -- but the finiteness test is still
# what decides membership, and membership is what card 03's terciles and the
# published `counts` and `dropped` are built from. So it stays exactly as
# specified, including the hours series: a unit is a unit in this frame only if
# it survives the same test the regression sample applied.
ces_units <- function(map) {
  o <- ces_series(map) %>%
    group_by(strata_value, title, data_type_code) %>%
    summarise(base = win_mean(date, value, BASE_START, BASE_END),
              endw = win_mean(date, value, ces_end_start, ces_latest),
              .groups = "drop") %>%
    filter(is.finite(base), is.finite(endw), base > 0)
  o %>% filter(data_type_code == CES_EMP) %>%
    select(strata_value, title, emp_base = base) %>%
    left_join(o %>% filter(data_type_code == CES_HRS) %>%
                select(strata_value, hrs_base = base),
              by = "strata_value")
}

xs_sector <- ces_units(ces_sector_map) %>%
  inner_join(adoption %>% filter(strata_type == "sector"), by = "strata_value")
xs_sub <- ces_units(ces_sub_map) %>%
  inner_join(adoption %>% filter(strata_type == "subsector"), by = "strata_value")

say("  aggregate-hours coverage: sector %d/%d, subsector %d/%d",
    sum(!is.na(xs_sector$hrs_base)), nrow(xs_sector),
    sum(!is.na(xs_sub$hrs_base)), nrow(xs_sub))

say("Cross-section units -- sector: %d, subsector: %d", nrow(xs_sector), nrow(xs_sub))
assert(nrow(xs_sector) == 18, "Expected 18 CES-matched BTOS sectors (all but agriculture).")
assert(nrow(xs_sub) >= 40, "Subsector match count collapsed -- check the NAICS vintage overlap.")

# ═══ 4. JOLTS supersectors, employment-weighted ══════════════════════════════
ces_emp_base <- ces_series(ces_sector_map) %>%
  filter(data_type_code == CES_EMP) %>%
  group_by(strata_value) %>%
  summarise(w = win_mean(date, value, BASE_START, BASE_END), .groups = "drop")

wmean <- function(x, w) {
  k <- !is.na(x) & !is.na(w)
  if (!any(k)) NA_real_ else sum(x[k] * w[k]) / sum(w[k])
}

jolts_groups <- xwalk %>%
  filter(!is.na(jolts_industry_code)) %>%
  left_join(ces_emp_base, by = c("btos_sector" = "strata_value")) %>%
  left_join(adoption %>% filter(strata_type == "sector"),
            by = c("btos_sector" = "strata_value")) %>%
  group_by(industry_code = jolts_industry_code, title = jolts_title) %>%
  summarise(
    prebreak_unw = mean(prebreak, na.rm = TRUE),
    prebreak     = wmean(prebreak,  w),
    initial      = wmean(initial,   w),
    postbreak    = wmean(postbreak, w),
    future       = wmean(future,    w),
    members      = paste(btos_sector, collapse = "+"),
    emp_w        = sum(w),
    .groups = "drop"
  )

assert(nrow(jolts_groups) == 15, "Expected 15 JOLTS supersectors.")
assert(setequal(jolts_groups$industry_code,
                intersect(jolts_groups$industry_code, jolts_slim$industry_code)),
       "A JOLTS supersector in the crosswalk has no rows in the JOLTS extract.")

# ═══ 5. Terciles ═════════════════════════════════════════════════════════════
# Cut on each level's own adoption distribution: 18 sectors split 6/6/6,
# 15 supersectors split 5/5/5.
tercile <- function(x) cut(x, quantile(x, c(0, 1/3, 2/3, 1)), include.lowest = TRUE,
                           labels = c("Low adoption", "Middle", "High adoption"))

sector_groups <- xs_sector %>%
  transmute(strata_value, title, prebreak, grp = as.character(tercile(prebreak))) %>%
  arrange(desc(prebreak))

# By BLS code, not by adoption: this table is published as-is under
# `jolts_groups`, where it is a reference list of the supersectors and their
# weighting, so code order is the stable key order. The cards sort their own
# member tables by adoption.
jolts_out <- jolts_groups %>%
  transmute(industry_code, title, members, prebreak, prebreak_unw, emp_w,
            grp = as.character(tercile(prebreak))) %>%
  arrange(industry_code)

say("Sector terciles:     %s", paste(sprintf("%s=%d", names(table(sector_groups$grp)),
                                             table(sector_groups$grp)), collapse = "  "))
say("Supersector terciles: %s", paste(sprintf("%s=%d", names(table(jolts_out$grp)),
                                              table(jolts_out$grp)), collapse = "  "))

# ═══ 6. The keyed monthly frames the exhibits read ═══════════════════════════
ces_sector_employment <- ces_series(ces_sector_map) %>%
  filter(data_type_code == CES_EMP) %>%
  transmute(strata_value, title, date, employment = value) %>%
  arrange(strata_value, date)

jolts_rates <- jolts_slim %>%
  semi_join(jolts_groups, by = "industry_code") %>%
  filter(dataelement_code %in% names(JOLTS_EL)) %>%
  transmute(industry_code, outcome = unname(JOLTS_EL[dataelement_code]),
            date, rate = value) %>%
  arrange(industry_code, outcome, date)

assert(!any(is.na(jolts_rates$outcome)), "Unnamed JOLTS data element reached jolts_rates.")

write_csv(ces_sector_employment, file.path(out_dir, "ces_sector_employment.csv"))
write_csv(jolts_rates,           file.path(out_dir, "jolts_rates.csv"))
write_csv(sector_groups,         file.path(out_dir, "sector_groups.csv"))
write_csv(jolts_out,             file.path(out_dir, "jolts_groups.csv"))

# ═══ 7. Metadata both cards' notes quote ═════════════════════════════════════
# `dropped` is the honest denominator: units with enough BTOS readings but no
# CES counterpart. The section notes render these counts, so they cannot go
# stale in the HTML.
write_json(list(
  ces_latest   = format(ces_latest),
  jolts_latest = format(jolts_latest),
  counts = list(sector = nrow(xs_sector), subsector = nrow(xs_sub),
                jolts = nrow(jolts_groups)),
  windows = list(
    treat         = c(format(ai_start), format(BREAK_DATE - 1)),
    treat_initial = c(format(INIT_START), format(INIT_END)),
    base          = c(format(BASE_START), format(BASE_END)),
    end_ces       = c(format(ces_end_start), format(ces_latest)),
    end_jolts     = c(format(jolts_end_start), format(jolts_latest)),
    pre           = c(format(PRE_A_START), format(PRE_B_END)),
    break_date    = format(BREAK_DATE)
  ),
  index_base = c(format(C19_START), format(C19_END)),
  dropped = list(
    sectors_no_ces    = setdiff(adoption$strata_value[adoption$strata_type == "sector"],
                                xs_sector$strata_value),
    subsectors_no_ces = setdiff(adoption$strata_value[adoption$strata_type == "subsector"],
                                xs_sub$strata_value)
  ),
  weighting = paste("BTOS sectors pooled into JOLTS supersectors with CES",
                    "employment weights; BTOS itself is firm-weighted."),
  min_reads = MIN_READS
), file.path(out_dir, "ces_jolts_meta.json"), auto_unbox = TRUE, pretty = TRUE,
   digits = 6)

say("Wrote %d frames to %s", 5, out_dir)
