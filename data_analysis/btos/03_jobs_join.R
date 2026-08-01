# ─────────────────────────────────────────────────────────────────────────────
# btos/03_jobs_join.R — Tier 4: BTOS AI adoption × CES employment / JOLTS flows
#
# Offline. Reads:
#   btos/output/btos_ai_long.csv     (built by 02_build_btos.R)
#   job_data/ces.RDS, job_data/jolts.RDS  (from tidyusmacro::getBLSFiles)
#   btos/crosswalk_btos_jolts.csv    (hand-maintained sector crosswalk)
#   btos/naics_titles.csv
# Writes:
#   btos/output/btos_jobs.json       (display contract for the web page)
#   btos/output/btos_jobs_*.csv      (tidy frames for reuse in posts)
#
# Design (locked 2026-07-26):
#   Treatment  = mean of BTOS "AI current"/Yes over the whole pre-break
#                (old-wording) span, 2023-09-11 → 2025-11-16, z-scored. It ends
#                before the terminal outcome window. We originally specified the
#                first six months only ("initial exposure"), which is cleaner on
#                reverse causality, but BTOS suppression is heaviest early: that
#                window leaves 15 sectors / 33 subsectors versus 18 / 46 here,
#                and the exclusions correlate with cell size and so with the
#                treatment. Spearman between the two measures is 0.91. Initial
#                exposure, the post-break level and "AI future" all stay in the
#                table as robustness columns.
#   Outcome    = change from a 6-month base window to the latest 6 months.
#                CES in log points; JOLTS in percentage points of the rate.
#   Specs      = (a) bivariate, (b) + 2017-19 pre-trend, (c) + pandemic catch-up.
#   Panel      = quarterly, two-way FE, lag-1 headline plus a lead/lag profile.
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(dplyr); library(tidyr); library(readr); library(purrr)
  library(stringr); library(lubridate); library(jsonlite)
  library(sandwich); library(lmtest); library(fixest)
})

force_refresh <- FALSE   # TRUE re-derives the slim BLS extracts from the 3.8GB RDS
setFixest_notes(FALSE)   # singleton-removal notes; counts are reported per fit instead

# Repo root = two dirs up from this script (btos/ -> repo), so paths don't
# depend on the caller's working directory.
.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
root  <- function(...) file.path(repo, ...)
here  <- function(...) file.path(repo, "btos", ...)
out   <- function(...) here("output", ...)

say <- function(...) cat(sprintf(...), "\n", sep = "")
stopifnot_msg <- function(cond, msg) if (!isTRUE(cond)) stop(msg, call. = FALSE)

# ── Windows ──────────────────────────────────────────────────────────────────
INIT_START  <- as.Date("2023-09-01"); INIT_END  <- as.Date("2024-02-29")
BASE_START  <- as.Date("2023-09-01"); BASE_END  <- as.Date("2024-02-01")
MIN_READS   <- 3                                    # unsuppressed BTOS readings per unit
PRE_A_START <- as.Date("2017-01-01"); PRE_A_END <- as.Date("2017-06-01")
PRE_B_START <- as.Date("2019-07-01"); PRE_B_END <- as.Date("2019-12-01")
PRE_YEARS   <- 2.5                                  # midpoint 2017H1 → midpoint 2019H2
C19_START   <- as.Date("2019-01-01"); C19_END   <- as.Date("2019-12-01")
BREAK_DATE  <- as.Date("2025-11-17")
END_MONTHS  <- 6                                    # length of the terminal window
PANEL_START <- as.Date("2023-10-01")                # 2023Q4; 2023Q3 has only 2 BTOS periods

# ═══ 1. Slim BLS extracts ════════════════════════════════════════════════════
ces_slim_path   <- out("ces_slim.rds")
jolts_slim_path <- out("jolts_slim.rds")

if (force_refresh || !file.exists(ces_slim_path)) {
  say("Deriving slim CES extract from job_data/ces.RDS (~15s load) ...")
  ces_raw <- readRDS(root("job_data", "ces.RDS"))
  ces_slim <- ces_raw %>%
    filter(seasonal == "S", period != "M13",
           data_type_code %in% c("01", "56"),
           industry_display_level %in% 1:5) %>%   # 1 = total private (monitor reference), 5 = 4-digit NAICS
    select(date, industry_code, naics_code, industry_name,
           industry_display_level, data_type_code, value)
  saveRDS(ces_slim, ces_slim_path); rm(ces_raw); gc(verbose = FALSE)
} else ces_slim <- readRDS(ces_slim_path)

if (force_refresh || !file.exists(jolts_slim_path)) {
  say("Deriving slim JOLTS extract ...")
  jolts_raw <- readRDS(root("job_data", "jolts.RDS"))
  jolts_slim <- jolts_raw %>%
    filter(seasonal == "S", period != "M13", state_code == "00",
           sizeclass_code == "00", ratelevel_code == "R",
           dataelement_code %in% c("HI", "JO", "QU", "LD", "TS")) %>%
    select(date, industry_code, industry_text, dataelement_code, value)
  saveRDS(jolts_slim, jolts_slim_path); rm(jolts_raw); gc(verbose = FALSE)
} else jolts_slim <- readRDS(jolts_slim_path)

ces_latest   <- max(ces_slim$date)
jolts_latest <- max(jolts_slim$date)
say("CES through %s · JOLTS through %s", format(ces_latest), format(jolts_latest))

ces_end_start   <- ces_latest   %m-% months(END_MONTHS - 1)
jolts_end_start <- jolts_latest %m-% months(END_MONTHS - 1)

# ═══ 2. BTOS adoption measures ═══════════════════════════════════════════════
ai <- read_csv(out("btos_ai_long.csv"), show_col_types = FALSE) %>%
  filter(answer == "Yes", !suppressed, !is.na(est),
         strata_type %in% c("sector", "subsector"),
         !strata_value %in% c("XX", "XXX"))

stopifnot_msg(all(ai$est >= 0 & ai$est <= 100), "BTOS estimates outside [0,100].")

# A measure is only defined for a unit with at least MIN_READS unsuppressed
# readings inside its window; otherwise it is NA and that unit sits out the
# regressions that use it.
measure <- function(opt, from, to, nm) {
  ai %>%
    filter(option == opt, date >= from, date <= to) %>%
    group_by(strata_type, strata_value) %>%
    summarise(v = mean(est), reads = n(), .groups = "drop") %>%
    filter(reads >= MIN_READS) %>%
    rename(!!nm := v, !!paste0("reads_", nm) := reads)
}

adoption <- measure("AI current", ai_start <- min(ai$date), BREAK_DATE - 1, "prebreak") %>%
  full_join(measure("AI current", INIT_START, INIT_END,  "initial"),   by = c("strata_type", "strata_value")) %>%
  full_join(measure("AI current", BREAK_DATE, max(ai$date), "postbreak"), by = c("strata_type", "strata_value")) %>%
  full_join(measure("AI future",  ai_start,   BREAK_DATE - 1, "future"), by = c("strata_type", "strata_value")) %>%
  filter(!is.na(prebreak))

say("Adoption measure coverage (units with >= %d readings):", MIN_READS)
print(adoption %>% group_by(strata_type) %>%
        summarise(across(c(prebreak, initial, postbreak, future), ~ sum(!is.na(.x))), .groups = "drop"))

naics_titles <- read_csv(here("naics_titles.csv"), show_col_types = FALSE)

# Quarterly adoption, for the panel.
ai_q <- ai %>%
  filter(option == "AI current", date >= PANEL_START) %>%
  mutate(q = quarter(date, type = "date_first")) %>%
  group_by(strata_type, strata_value, q) %>%
  summarise(ai = mean(est), n_periods = n(), .groups = "drop") %>%
  filter(n_periods >= 3)

# ═══ 3. CES analysis frames ══════════════════════════════════════════════════
xwalk <- read_csv(here("crosswalk_btos_jolts.csv"), show_col_types = FALSE,
                  col_types = cols(.default = col_character()))
stopifnot_msg(nrow(xwalk) == 19, "Crosswalk should carry all 19 non-XX BTOS sectors.")

ces_sector_map <- xwalk %>% filter(!is.na(ces_industry_code)) %>%
  transmute(strata_value = btos_sector, industry_code = ces_industry_code, title = btos_title)

ces_sub_map <- ces_slim %>%
  filter(industry_display_level == 4, nchar(naics_code) == 3) %>%
  distinct(strata_value = naics_code, industry_code, title = industry_name)

# Monthly CES series keyed by the unit we analyse.
ces_series <- function(map) {
  ces_slim %>%
    inner_join(map, by = "industry_code", relationship = "many-to-many") %>%
    select(strata_value, title, date, data_type_code, value)
}

win_mean <- function(d, v, from, to) mean(v[d >= from & d <= to], na.rm = TRUE)

# Outcomes + controls from a monthly CES panel.
ces_outcomes <- function(series, end_start, end_end) {
  series %>%
    group_by(strata_value, title, data_type_code) %>%
    summarise(
      base  = win_mean(date, value, BASE_START,  BASE_END),
      endw  = win_mean(date, value, end_start,   end_end),
      preA  = win_mean(date, value, PRE_A_START, PRE_A_END),
      preB  = win_mean(date, value, PRE_B_START, PRE_B_END),
      y2019 = win_mean(date, value, C19_START,   C19_END),
      .groups = "drop"
    ) %>%
    filter(is.finite(base), is.finite(endw), base > 0) %>%
    mutate(
      chg      = 100 * (log(endw) - log(base)),
      pretrend = 100 * (log(preB) - log(preA)) / PRE_YEARS,
      catchup  = 100 * (log(base) - log(y2019))
    ) %>%
    select(strata_value, title, data_type_code, chg, pretrend, catchup)
}

ces_wide <- function(map) {
  o <- ces_outcomes(ces_series(map), ces_end_start, ces_latest)
  emp <- o %>% filter(data_type_code == "01") %>%
    select(strata_value, title, emp = chg, pretrend, catchup)
  hrs <- o %>% filter(data_type_code == "56") %>%
    select(strata_value, hours = chg)
  emp %>% left_join(hrs, by = "strata_value")
}

xs_sector <- ces_wide(ces_sector_map) %>% inner_join(adoption %>% filter(strata_type == "sector"), by = "strata_value")
xs_sub    <- ces_wide(ces_sub_map)    %>% inner_join(adoption %>% filter(strata_type == "subsector"), by = "strata_value")

say("Cross-section units — sector: %d, subsector: %d", nrow(xs_sector), nrow(xs_sub))
say("  aggregate-hours coverage: sector %d/%d, subsector %d/%d",
    sum(!is.na(xs_sector$hours)), nrow(xs_sector), sum(!is.na(xs_sub$hours)), nrow(xs_sub))
stopifnot_msg(nrow(xs_sector) == 18, "Expected 18 CES-matched BTOS sectors (all but agriculture).")
stopifnot_msg(nrow(xs_sub) >= 40, "Subsector match count collapsed — check the NAICS vintage overlap.")

# ═══ 4. JOLTS analysis frame ═════════════════════════════════════════════════
# BTOS sectors are pooled into JOLTS supersectors with CES employment weights
# (BTOS is firm-weighted and no public firm counts exist at this cut; the
# unweighted alternative is carried alongside and reported in a footnote).
ces_emp_base <- ces_series(ces_sector_map) %>%
  filter(data_type_code == "01") %>%
  group_by(strata_value) %>%
  summarise(w = win_mean(date, value, BASE_START, BASE_END), .groups = "drop")

wmean <- function(x, w) { k <- !is.na(x) & !is.na(w); if (!any(k)) NA_real_ else sum(x[k] * w[k]) / sum(w[k]) }

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

stopifnot_msg(nrow(jolts_groups) == 15, "Expected 15 JOLTS groups.")

jolts_el <- c(JO = "openings", HI = "hires", QU = "quits", LD = "layoffs")

xs_jolts <- jolts_slim %>%
  inner_join(jolts_groups %>% select(industry_code), by = "industry_code") %>%
  group_by(industry_code, dataelement_code) %>%
  summarise(
    base     = win_mean(date, value, BASE_START,      BASE_END),
    endw     = win_mean(date, value, jolts_end_start, jolts_latest),
    pretrend = win_mean(date, value, PRE_A_START,     PRE_B_END),   # 2017-19 mean rate level
    .groups = "drop"
  ) %>%
  mutate(chg = endw - base, outcome = jolts_el[dataelement_code]) %>%
  select(industry_code, outcome, chg, pre_level = pretrend) %>%
  pivot_wider(names_from = outcome, values_from = c(chg, pre_level), names_glue = "{outcome}_{.value}") %>%
  rename_with(~ sub("_chg$", "", .x)) %>%
  inner_join(jolts_groups, by = "industry_code") %>%
  left_join(
    ces_wide(ces_sector_map) %>%
      inner_join(xwalk %>% select(strata_value = btos_sector, industry_code = jolts_industry_code),
                 by = "strata_value") %>%
      group_by(industry_code) %>%
      summarise(catchup = weighted.mean(catchup, exp(emp / 100)), .groups = "drop"),
    by = "industry_code"
  )

say("JOLTS groups: %d", nrow(xs_jolts))

# ═══ 5. Cross-section regressions ════════════════════════════════════════════
zs <- function(x) as.numeric(scale(x))

xs_sector <- xs_sector %>% mutate(across(c(prebreak, initial, postbreak, future), zs, .names = "z_{.col}"))
xs_sub    <- xs_sub    %>% mutate(across(c(prebreak, initial, postbreak, future), zs, .names = "z_{.col}"))
xs_jolts  <- xs_jolts  %>% mutate(across(c(prebreak, initial, postbreak, future), zs, .names = "z_{.col}"))

# spec 1 bivariate · 2 + pre-trend · 3 + pre-trend + catch-up
fit_xs <- function(dat, level, outcome, treat, spec, pre_var = "pretrend") {
  rhs <- c(paste0("z_", treat), if (spec >= 2) pre_var, if (spec >= 3) "catchup")
  d <- dat %>% select(y = all_of(outcome), all_of(c(paste0("z_", treat), rhs[-1]))) %>% tidyr::drop_na()
  if (nrow(d) < length(rhs) + 3) return(NULL)
  m  <- lm(reformulate(rhs, "y"), data = d)
  ct <- coeftest(m, vcov. = vcovHC(m, type = "HC1"))
  k  <- paste0("z_", treat)
  tibble(level = level, outcome = outcome, treat = treat, spec = spec,
         est = ct[k, 1], se = ct[k, 2], t = ct[k, 3], p = ct[k, 4],
         ci_lo = ct[k, 1] - 1.96 * ct[k, 2], ci_hi = ct[k, 1] + 1.96 * ct[k, 2],
         n = nrow(d), r2 = summary(m)$r.squared,
         controls = if (length(rhs) > 1) paste(rhs[-1], collapse = " + ") else "—")
}

grid_ces <- expand_grid(level = c("sector", "subsector"),
                        outcome = c("emp", "hours"),
                        treat = c("prebreak", "initial", "postbreak", "future"),
                        spec = 1:3)
grid_jolts <- expand_grid(level = "jolts",
                          outcome = names(jolts_el) %>% {unname(jolts_el)},
                          treat = c("prebreak", "initial", "postbreak", "future"),
                          spec = 1:3)

coefs <- bind_rows(
  pmap_dfr(grid_ces, function(level, outcome, treat, spec)
    fit_xs(if (level == "sector") xs_sector else xs_sub, level, outcome, treat, spec)),
  pmap_dfr(grid_jolts, function(level, outcome, treat, spec)
    fit_xs(xs_jolts, level, outcome, treat, spec, pre_var = paste0(outcome, "_pre_level")))
)

say("Cross-section fits: %d", nrow(coefs))

# Placebo: does adoption predict 2017-19 growth, before any of this happened?
placebo <- bind_rows(
  pmap_dfr(expand_grid(level = c("sector", "subsector"), treat = c("prebreak", "postbreak")),
           function(level, treat) {
             d <- (if (level == "sector") xs_sector else xs_sub) %>%
               select(y = pretrend, x = all_of(paste0("z_", treat))) %>% drop_na()
             m  <- lm(y ~ x, d); ct <- coeftest(m, vcov. = vcovHC(m, type = "HC1"))
             tibble(level = level, treat = treat, est = ct[2, 1], se = ct[2, 2],
                    p = ct[2, 4], ci_lo = ct[2, 1] - 1.96 * ct[2, 2],
                    ci_hi = ct[2, 1] + 1.96 * ct[2, 2], n = nrow(d),
                    r2 = summary(m)$r.squared)
           })
)

# Added-variable plot for the preferred employment spec (spec 3, pre-break treatment).
av_points <- function(dat, level) {
  d <- dat %>% select(strata_value, title, y = emp, x = z_prebreak, pretrend, catchup) %>% drop_na()
  d %>% mutate(xr = resid(lm(x ~ pretrend + catchup, d)),
               yr = resid(lm(y ~ pretrend + catchup, d)),
               level = level) %>%
    select(level, code = strata_value, title, x = xr, y = yr)
}
avplot <- bind_rows(av_points(xs_sector, "sector"), av_points(xs_sub, "subsector"))
av_fit <- avplot %>% group_by(level) %>%
  summarise(a = coef(lm(y ~ x))[1], b = coef(lm(y ~ x))[2], .groups = "drop")

# ═══ 6. Grouped time series (exhibits A1, A2) ════════════════════════════════
tercile <- function(x) cut(x, quantile(x, c(0, 1/3, 2/3, 1)), include.lowest = TRUE,
                           labels = c("Low adoption", "Middle", "High adoption"))

sector_grp <- xs_sector %>% mutate(grp = tercile(prebreak)) %>% select(strata_value, title, prebreak, grp)

a1 <- ces_series(ces_sector_map) %>%
  filter(data_type_code == "01", date >= as.Date("2019-01-01")) %>%
  inner_join(sector_grp %>% select(strata_value, grp), by = "strata_value") %>%
  group_by(grp, date) %>% summarise(emp = sum(value), .groups = "drop") %>%
  group_by(grp) %>%
  mutate(index = 100 * emp / mean(emp[date >= C19_START & date <= C19_END])) %>%
  ungroup()

# CHANGED 2026-07-31: the JOLTS split was a median split into "Higher
# adoption" / "Lower adoption". It is now the same tercile cut a1 uses, on the
# supersectors' own distribution, so both exhibits speak one language and the
# middle of the adoption distribution is visible rather than folded into
# whichever half it fell in. Health care, retail and wholesale move out of the
# top group as a result, which changes what the higher-vs-lower comparison
# below reports; see MERGE_PLAN.md. 15 supersectors split 5/5/5.
jolts_grp <- xs_jolts %>%
  mutate(grp = tercile(prebreak)) %>%
  select(industry_code, title, prebreak, emp_w, grp)

ma3 <- function(x) stats::filter(x, rep(1/3, 3), sides = 1) %>% as.numeric()

a2 <- jolts_slim %>%
  inner_join(jolts_grp, by = "industry_code") %>%
  filter(date >= as.Date("2019-01-01")) %>%
  group_by(grp, dataelement_code, date) %>%
  summarise(rate = weighted.mean(value, emp_w), .groups = "drop") %>%
  arrange(grp, dataelement_code, date) %>%
  group_by(grp, dataelement_code) %>% mutate(rate = ma3(rate)) %>% ungroup() %>%
  filter(!is.na(rate)) %>%
  mutate(outcome = jolts_el[dataelement_code]) %>%
  # jolts_slim also carries TS (total separations), which jolts_el does not
  # name, and an unnamed lookup returns NA. Serialised, that shipped a fifth
  # series per group with outcome:null. The decomposition below reads TS
  # straight from jolts_slim, so dropping it here costs nothing.
  filter(!is.na(outcome))

# ═══ 7. Quarterly panel ══════════════════════════════════════════════════════
ces_panel <- function(map, strata) {
  ces_series(map) %>%
    filter(data_type_code %in% c("01", "56"), date >= PANEL_START %m-% months(3)) %>%
    mutate(q = quarter(date, type = "date_first")) %>%
    group_by(strata_value, data_type_code, q) %>%
    summarise(v = mean(value), nm = n(), .groups = "drop") %>%
    filter(nm >= 2) %>%
    arrange(strata_value, data_type_code, q) %>%
    group_by(strata_value, data_type_code) %>%
    mutate(g = 100 * (log(v) - log(lag(v)))) %>%
    ungroup() %>%
    filter(!is.na(g)) %>%
    select(strata_value, data_type_code, q, g) %>%
    pivot_wider(names_from = data_type_code, values_from = g) %>%
    rename(emp = `01`, hours = `56`) %>%
    inner_join(ai_q %>% filter(strata_type == strata) %>% select(strata_value, q, ai),
               by = c("strata_value", "q"))
}

pan_sub    <- ces_panel(ces_sub_map,    "subsector")
pan_sector <- ces_panel(ces_sector_map, "sector")

ai_q_jolts <- ai_q %>%
  filter(strata_type == "sector") %>%
  inner_join(xwalk %>% select(strata_value = btos_sector, industry_code = jolts_industry_code),
             by = "strata_value") %>%
  filter(!is.na(industry_code)) %>%
  left_join(ces_emp_base, by = "strata_value") %>%
  group_by(industry_code, q) %>% summarise(ai = weighted.mean(ai, w), .groups = "drop")

pan_jolts <- jolts_slim %>%
  inner_join(jolts_groups %>% select(industry_code), by = "industry_code") %>%
  filter(date >= PANEL_START %m-% months(3)) %>%
  mutate(q = quarter(date, type = "date_first")) %>%
  group_by(industry_code, dataelement_code, q) %>%
  summarise(v = mean(value), nm = n(), .groups = "drop") %>%
  filter(nm >= 2) %>%
  arrange(industry_code, dataelement_code, q) %>%
  group_by(industry_code, dataelement_code) %>%
  mutate(g = v - lag(v)) %>% ungroup() %>% filter(!is.na(g)) %>%
  mutate(outcome = jolts_el[dataelement_code]) %>%
  select(industry_code, outcome, q, g) %>%
  pivot_wider(names_from = outcome, values_from = g) %>%
  inner_join(ai_q_jolts, by = c("industry_code", "q"))

# Shift adoption by h quarters (h > 0 = lag, h < 0 = lead) within unit.
shift_ai <- function(d, unit, h) {
  d %>% arrange(.data[[unit]], q) %>% group_by(.data[[unit]]) %>%
    mutate(ai_h = if (h >= 0) dplyr::lag(ai, h) else dplyr::lead(ai, -h)) %>%
    ungroup() %>% filter(!is.na(ai_h))
}

fit_panel <- function(d, unit, outcome, h, level) {
  dd <- shift_ai(d, unit, h) %>% mutate(z_ai = ai_h / sd(ai_h), yv = .data[[outcome]]) %>%
    filter(!is.na(yv))
  if (nrow(dd) < 30) return(NULL)
  m <- feols(as.formula(paste0("yv ~ z_ai | ", unit, " + q")), data = dd,
             cluster = as.formula(paste0("~", unit)))
  ct <- summary(m)$coeftable
  within_sd <- dd %>% group_by(.data[[unit]]) %>% mutate(d = ai_h - mean(ai_h)) %>% pull(d) %>% sd()
  tibble(level = level, outcome = outcome, h = h,
         est = ct[1, 1], se = ct[1, 2], p = ct[1, 4],
         ci_lo = ct[1, 1] - 1.96 * ct[1, 2], ci_hi = ct[1, 1] + 1.96 * ct[1, 2],
         n = nobs(m), clusters = length(unique(dd[[unit]])),
         pooled_sd = sd(dd$ai_h), within_sd = within_sd)
}

panel_coefs <- bind_rows(
  map_dfr(c(-1, 0, 1, 2), ~ fit_panel(pan_sub, "strata_value", "emp", .x, "subsector")),
  map_dfr(c(-1, 0, 1, 2), ~ fit_panel(pan_sub, "strata_value", "hours", .x, "subsector")),
  map_dfr(c(-1, 0, 1, 2), ~ fit_panel(pan_sector, "strata_value", "emp", .x, "sector")),
  map_dfr(c(-1, 0, 1, 2), ~ fit_panel(pan_sector, "strata_value", "hours", .x, "sector")),
  map_dfr(unname(jolts_el), function(o)
    map_dfr(c(-1, 0, 1, 2), ~ fit_panel(pan_jolts, "industry_code", o, .x, "jolts")))
)

say("Panel fits: %d (subsector clusters %d, sector %d, jolts %d)",
    nrow(panel_coefs), n_distinct(pan_sub$strata_value),
    n_distinct(pan_sector$strata_value), n_distinct(pan_jolts$industry_code))

# Binscatter: both sides residualised on unit + quarter FE, 20 equal-count bins.
bs_src <- shift_ai(pan_sub, "strata_value", 1) %>% filter(!is.na(emp))
bs <- bs_src %>%
  mutate(xr = resid(feols(ai_h ~ 1 | strata_value + q, data = bs_src, fixef.rm = "none")),
         yr = resid(feols(emp  ~ 1 | strata_value + q, data = bs_src, fixef.rm = "none"))) %>%
  mutate(bin = ntile(xr, 20)) %>%
  group_by(bin) %>% summarise(x = mean(xr), y = mean(yr), n = n(), .groups = "drop")
bs_fit <- coef(lm(y ~ x, bs))

# ═══ 8b. Displacement monitor ════════════════════════════════════════════════
# Exhibits that refresh on the BLS calendar (CES monthly, JOLTS monthly) and are
# built to test one specific claim: that AI shows up first as a hiring freeze in
# exposed industries, not as layoffs. Tucker's QWI result attributes 100% of the
# early-career employment decline to reduced hires with no rise in destruction,
# so hires-versus-separations is the diagnostic split, not the level of jobs.
GPT_DATE   <- as.Date("2022-11-01")                 # ChatGPT release month
PRE15_A    <- as.Date("2015-01-01"); PRE15_B <- as.Date("2019-12-01")
MON12_A    <- jolts_latest %m-% months(11)

# National firm-weighted adoption, straight from the published series (not an
# employment-weighted aggregate — BTOS publishes none and we do not invent one).
nat_adopt <- read_csv(out("btos_ai_long.csv"), show_col_types = FALSE) %>%
  filter(strata_type == "national", option == "AI current", answer == "Yes", !suppressed) %>%
  arrange(date) %>% select(date, est, wording)

# ── D1: status-board gap series (higher-adoption minus lower-adoption) ────────
emp_gap <- a1 %>%
  filter(grp %in% c("High adoption", "Low adoption")) %>%
  select(grp, date, emp) %>%
  pivot_wider(names_from = grp, values_from = emp) %>%
  arrange(date) %>%
  mutate(hi = 100 * (log(`High adoption`) - log(lag(`High adoption`, 12))),
         lo = 100 * (log(`Low adoption`)  - log(lag(`Low adoption`, 12))),
         gap = hi - lo) %>%
  filter(!is.na(gap)) %>% select(date, gap)

# CHANGED 2026-07-31 with the tercile cut above: this was a median split, so
# the gap was top-half minus bottom-half. It is now top-third minus
# bottom-third, dropping the middle five supersectors. Sharper contrast,
# fewer industries behind each side.
flow_gap <- a2 %>%
  filter(grp %in% c("High adoption", "Low adoption")) %>%
  select(outcome, grp, date, rate) %>%
  pivot_wider(names_from = grp, values_from = rate) %>%
  mutate(gap = `High adoption` - `Low adoption`) %>%
  filter(!is.na(gap)) %>% select(outcome, date, gap)

chg_at <- function(d, v, back) {
  i <- length(v); j <- which(d == d[i] %m-% months(back))
  if (!length(j)) NA_real_ else v[i] - v[j[1]]
}
board_row <- function(name, unit, d, v, note) {
  tibble(name = name, unit = unit, latest = v[length(v)],
         as_of = format(d[length(d)]), chg3 = chg_at(d, v, 3), chg12 = chg_at(d, v, 12),
         note = note, spark = list(tibble(date = format(d), v = v)))
}

board <- bind_rows(
  board_row("Employment growth gap", "pp, 12-month", emp_gap$date, emp_gap$gap,
            "High-adoption minus low-adoption tercile, CES employment"),
  bind_rows(lapply(c("hires", "openings", "quits", "layoffs"), function(o) {
    x <- flow_gap %>% filter(outcome == o) %>% arrange(date)
    board_row(paste0(tools::toTitleCase(o), " rate gap"), "pp", x$date, x$gap,
              "High-adoption minus low-adoption JOLTS tercile, 3-month average")
  }))
)

# ── D2: hires-versus-separations decomposition ───────────────────────────────
# Net rate = hires rate - total separations rate ~ monthly employment growth.
# d(net) = d(hires) - d(seps): the two terms say whether slower job growth came
# from not hiring or from shedding.
decomp <- jolts_slim %>%
  filter(dataelement_code %in% c("HI", "TS")) %>%
  inner_join(jolts_groups %>% select(industry_code, title, prebreak), by = "industry_code") %>%
  group_by(industry_code, title, prebreak, dataelement_code) %>%
  summarise(pre = win_mean(date, value, PRE15_A, PRE15_B),
            now = win_mean(date, value, MON12_A, jolts_latest), .groups = "drop") %>%
  mutate(d = now - pre) %>%
  select(industry_code, title, prebreak, dataelement_code, d) %>%
  pivot_wider(names_from = dataelement_code, values_from = d) %>%
  transmute(code = industry_code, title, adoption = prebreak,
            d_hires = HI, d_seps = TS, hires_term = HI, seps_term = -TS, d_net = HI - TS) %>%
  arrange(desc(adoption))

# ── D3: freeze-versus-shed quadrant ──────────────────────────────────────────
quad <- jolts_slim %>%
  filter(dataelement_code %in% c("HI", "LD")) %>%
  inner_join(jolts_groups %>% select(industry_code, title, prebreak, emp_w), by = "industry_code") %>%
  group_by(industry_code, title, prebreak, emp_w, dataelement_code) %>%
  summarise(pre = win_mean(date, value, PRE15_A, PRE15_B),
            now = win_mean(date, value, MON12_A, jolts_latest), .groups = "drop") %>%
  mutate(d = now - pre) %>% select(-pre, -now) %>%
  pivot_wider(names_from = dataelement_code, values_from = d) %>%
  transmute(code = industry_code, title, adoption = prebreak, emp_w,
            x = HI, y = LD)

# ── D4: 4-digit CES industries inside the highest-adoption sectors ───────────
# Restricted to the top adoption tercile on purpose. The bottom tercile's
# 4-digit detail is 105 industries and almost all of it is manufacturing, whose
# decline is a decades-old story; presenting that as a control group would be
# dishonest. The question here is the aggregation one: inside the sectors where
# adoption is highest, is the sector average hiding detailed industries that
# are actually shrinking?
tercile_pref <- sector_grp %>% filter(grp == "High adoption") %>%
  transmute(pref = strata_value, grp = as.character(grp),
            sector_title = title)
# BTOS sector 31 covers NAICS 31-33, 44 covers 44-45, 48 covers 48-49.
pref_expand <- tercile_pref %>%
  mutate(pref = strsplit(case_when(pref == "31" ~ "31,32,33", pref == "44" ~ "44,45",
                                   pref == "48" ~ "48,49", TRUE ~ pref), ",")) %>%
  tidyr::unnest(pref)

detail <- ces_slim %>%
  filter(data_type_code == "01", industry_display_level == 5, nchar(naics_code) == 4) %>%
  mutate(pref = substr(naics_code, 1, 2)) %>%
  inner_join(pref_expand, by = "pref") %>%
  group_by(naics_code, industry_name, grp, sector_title) %>%
  summarise(base = win_mean(date, value, GPT_DATE, GPT_DATE),
            now  = win_mean(date, value, ces_end_start, ces_latest),
            .groups = "drop") %>%
  filter(is.finite(base), is.finite(now), base > 0) %>%
  transmute(code = naics_code, title = industry_name, grp, sector_title,
            jobs_k = now, chg = 100 * (log(now) - log(base))) %>%
  arrange(chg)

# Reference line: total private employment over the same window.
tot_priv <- ces_slim %>% filter(data_type_code == "01", industry_code == "05000000") %>%
  summarise(b = win_mean(date, value, GPT_DATE, GPT_DATE),
            n = win_mean(date, value, ces_end_start, ces_latest)) %>%
  transmute(chg = 100 * (log(n) - log(b))) %>% pull(chg)
stopifnot_msg(length(tot_priv) == 1 && is.finite(tot_priv), "Total-private reference series not found in the slim CES extract.")

# ── D5: how big an effect could this design even see? ────────────────────────
# Convert the subsector employment coefficient into jobs, using the observed
# top-minus-bottom-tercile spread in the standardised treatment.
mde_for <- function(dat, level) {
  c3 <- coefs %>% filter(level == !!level, outcome == "emp", treat == "prebreak", spec == 3)
  d  <- dat %>% select(z = z_prebreak, emp_base = emp_level) %>% drop_na()
  cut <- quantile(d$z, c(1/3, 2/3))
  dz  <- mean(d$z[d$z >= cut[2]]) - mean(d$z[d$z <= cut[1]])
  top_jobs <- sum(d$emp_base[d$z >= cut[2]]) * 1000        # CES levels are thousands
  jobs <- function(b) top_jobs * (exp(b * dz / 100) - 1)
  tibble(level = level, beta = c3$est, se = c3$se, dz = dz, n = c3$n,
         top_jobs = top_jobs, covered_jobs = sum(d$emp_base) * 1000,
         # jobs() is increasing in b, so the lower CI bound comes from the lower b.
         est = jobs(c3$est), lo = jobs(c3$est - 1.96 * c3$se), hi = jobs(c3$est + 1.96 * c3$se),
         mde = abs(jobs(-2.80 * c3$se)))
}
emp_base_of <- function(map) ces_series(map) %>% filter(data_type_code == "01") %>%
  group_by(strata_value) %>% summarise(emp_level = win_mean(date, value, BASE_START, BASE_END), .groups = "drop")
xs_sub2    <- xs_sub    %>% left_join(emp_base_of(ces_sub_map),    by = "strata_value")
xs_sector2 <- xs_sector %>% left_join(emp_base_of(ces_sector_map), by = "strata_value")
mde <- bind_rows(mde_for(xs_sub2, "subsector"), mde_for(xs_sector2, "sector"))

say("MDE (subsector): beta %.2f, dz %.2f, top-tercile jobs %.1fm, MDE %.0fk jobs",
    mde$beta[1], mde$dz[1], mde$top_jobs[1] / 1e6, mde$mde[1] / 1e3)

# ── D6: scorecard inputs ─────────────────────────────────────────────────────
gapnow <- function(o) { x <- flow_gap %>% filter(outcome == o) %>% arrange(date); tail(x$gap, 1) }
gappre <- function(o) {
  x <- flow_gap %>% filter(outcome == o, date <= as.Date("2022-11-01")) %>% arrange(date)
  mean(tail(x$gap, 12))
}
scorecard <- tibble(
  claim = c("Hiring slows in exposed industries",
            "Layoffs do not rise with it",
            "Employment levels fall in exposed industries",
            "Quits fall (workers see fewer outside options)",
            "Openings fall (demand for labour, not just realised hires)",
            "The effect is concentrated, not economy-wide"),
  metric = c("Hires-rate gap, now vs pre-ChatGPT",
             "Layoffs-rate gap, now vs pre-ChatGPT",
             "Cross-section β on employment, subsector, spec (3)",
             "Quits-rate gap, now vs pre-ChatGPT",
             "Openings-rate gap, now vs pre-ChatGPT",
             "Share of 4-digit industries in high-adoption sectors shrinking faster than total private"),
  value = c(gapnow("hires") - gappre("hires"),
            gapnow("layoffs") - gappre("layoffs"),
            (coefs %>% filter(level == "subsector", outcome == "emp", treat == "prebreak", spec == 3))$est,
            gapnow("quits") - gappre("quits"),
            gapnow("openings") - gappre("openings"),
            100 * mean(detail$chg < tot_priv)),
  unit = c("pp", "pp", "log pts per SD", "pp", "pp", "%"),
  # Sign the displacement hypothesis predicts. NA = no directional prediction.
  predicted = c(-1, 0, -1, -1, -1, NA)
)

# ═══ 8. Assemble ═════════════════════════════════════════════════════════════
sub_title <- function(code) {
  t <- naics_titles$title[match(code, naics_titles$code)]
  ifelse(is.na(t), code, t)
}

scatter_rows <- function(dat, level, ycol) {
  d <- dat %>% mutate(code = if (level == "jolts") industry_code else strata_value) %>%
    select(code, title, x = prebreak, y = all_of(ycol)) %>% drop_na()
  fitm <- lm(y ~ x, d)
  list(points = d, fit = list(a = unname(coef(fitm)[1]), b = unname(coef(fitm)[2]),
                              r2 = summary(fitm)$r.squared, n = nrow(d)))
}

xs_sub_named <- xs_sub %>% mutate(title = sub_title(strata_value))

payload <- list(
  vintage      = format(Sys.time(), "%Y-%m-%d %H:%M %Z"),
  ces_latest   = format(ces_latest),
  jolts_latest = format(jolts_latest),
  windows = list(
    treat = c(format(ai_start), format(BREAK_DATE - 1)),
    treat_initial = c(format(INIT_START), format(INIT_END)),
    base  = c(format(BASE_START), format(BASE_END)),
    end_ces   = c(format(ces_end_start), format(ces_latest)),
    end_jolts = c(format(jolts_end_start), format(jolts_latest)),
    pre = c(format(PRE_A_START), format(PRE_B_END)),
    break_date = format(BREAK_DATE)
  ),
  counts = list(sector = nrow(xs_sector), subsector = nrow(xs_sub), jolts = nrow(xs_jolts)),
  scatters = list(
    sector_emp      = scatter_rows(xs_sector, "sector", "emp"),
    sector_hours    = scatter_rows(xs_sector, "sector", "hours"),
    subsector_emp   = scatter_rows(xs_sub_named, "subsector", "emp"),
    jolts_openings  = scatter_rows(xs_jolts, "jolts", "openings"),
    jolts_hires     = scatter_rows(xs_jolts, "jolts", "hires"),
    jolts_quits     = scatter_rows(xs_jolts, "jolts", "quits"),
    jolts_layoffs   = scatter_rows(xs_jolts, "jolts", "layoffs"),
    placebo_sector    = scatter_rows(xs_sector, "sector", "pretrend"),
    placebo_subsector = scatter_rows(xs_sub_named, "subsector", "pretrend")
  ),
  a1 = list(
    groups = a1 %>% mutate(date = format(date)) %>%
      select(grp, date, index) %>% nest(points = c(date, index)),
    members = sector_grp %>% arrange(desc(prebreak)) %>%
      transmute(code = strata_value, title, adoption = round(prebreak, 1), grp = as.character(grp))
  ),
  a2 = list(
    series = a2 %>% mutate(date = format(date)) %>%
      select(outcome, grp, date, rate) %>% nest(points = c(date, rate)),
    members = jolts_grp %>% arrange(desc(prebreak)) %>%
      transmute(code = industry_code, title, adoption = round(prebreak, 1),
                grp = as.character(grp))
  ),
  coefs   = coefs,
  placebo = placebo,
  avplot  = list(points = avplot, fit = av_fit),
  panel   = list(coefs = panel_coefs, binscatter = bs,
                 fit = list(a = unname(bs_fit[1]), b = unname(bs_fit[2]))),
  jolts_groups = jolts_groups %>%
    transmute(code = industry_code, title, members,
              prebreak = round(prebreak, 2), prebreak_unw = round(prebreak_unw, 2),
              gap = round(prebreak - prebreak_unw, 2)),
  monitor = list(
    board     = board,
    decomp    = decomp,
    quad      = quad,
    detail    = detail,
    mde       = mde,
    scorecard = scorecard,
    nat_adopt = nat_adopt %>% mutate(date = format(date)),
    total_private_chg = tot_priv,
    windows   = list(gpt = format(GPT_DATE),
                     pre15 = c(format(PRE15_A), format(PRE15_B)),
                     mon12 = c(format(MON12_A), format(jolts_latest)))
  ),
  dropped = list(
    sectors_no_ces   = setdiff(adoption$strata_value[adoption$strata_type == "sector"], xs_sector$strata_value),
    subsectors_no_ces = setdiff(adoption$strata_value[adoption$strata_type == "subsector"], xs_sub$strata_value)
  )
)

write_json(payload, out("btos_jobs.json"), auto_unbox = TRUE, digits = 6, na = "null")
write_csv(xs_sector %>% mutate(level = "sector"), out("btos_jobs_crosssection_sector.csv"))
write_csv(xs_sub_named %>% mutate(level = "subsector"), out("btos_jobs_crosssection_subsector.csv"))
write_csv(xs_jolts, out("btos_jobs_crosssection_jolts.csv"))
write_csv(coefs, out("btos_jobs_coefs.csv"))
write_csv(panel_coefs, out("btos_jobs_panel_coefs.csv"))

say("Wrote %s (%.0f KB)", out("btos_jobs.json"), file.size(out("btos_jobs.json")) / 1024)
say("Done.")
