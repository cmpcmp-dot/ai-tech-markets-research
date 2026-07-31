#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# micro/07_age_bands_cps.R — CPS microdata -> residual unemployment by age x
# education (Job Displacement section 2: "is the weakness spread evenly?").
#
# Computes, for each education group and centered age band:
#   the group's 12-month moving-average unemployment rate, a log-log fit of
#   that rate on the overall 12-month-MA rate trained through 2019, the
#   back-transformed prediction, and the average (actual - predicted) over the
#   most recent MONTHS_WINDOW months. Positive => the group has more
#   unemployment than its own pre-2020 relationship to the aggregate predicts.
#
# Descends from `01_big_graphic_YoY.R` in
#   github.com/mtkonczal/Blog-Posts-Presentations-and-Testimony
#     /blogs_2026/01_education_young_unrate
# The regression, the 12-month MA, the 2019 training cut, and the residual
# averaging are unchanged from that script. What changed is documented under
# DEPARTURES below; each one is a deliberate decision, not a port artifact.
#
# ── DEPARTURES from the source script (these change the numbers) ────────────
# 1. "< HS" is dropped. Below age ~21 that category is defined by an outcome
#    that is mechanically age-dependent (still enrolled in high school, or a
#    dropout), its share of the young population fell by more than half over
#    the sample, and its residuals are large, negative and non-monotonic --
#    i.e. it is measuring compositional change in who remains in the category,
#    not labor demand. Two groups (College+, HS+ no BA) is the comparison the
#    method can actually support.
# 2. Age bands never straddle an age at which the credential is unattainable.
#    A band centered at 21 with width 5 spans ages 19-23, so the source's
#    youngest "College+" points are dominated by 22-23 year-olds plus a
#    handful of highly unusual 19-20 year-old BA holders. Here the youngest
#    band's LOWER edge is pinned at 21 for College+ and 18 for HS+ (no BA),
#    so center ages start at AGE_FLOOR + (width-1)/2. This removes the
#    boundary cell that produced the largest residual in the source output.
# 3. Uncertainty is reported. `resid_sd_train` is the standard deviation of
#    (actual - predicted) over the TRAINING period: how far this band's rate
#    ordinarily wanders from the fitted relationship. `z` = diff_avg /
#    resid_sd_train puts every band on a comparable scale, which single-year
#    bands in pp emphatically are not (a small cell at 21 and a large cell at
#    45 are not equally precise). `n_lf_month` is the mean UNWEIGHTED
#    labor-force count behind each band-month, so cell size is visible.
# 4. `ratio_avg` (mean actual/predicted) is reported alongside diff_avg. The
#    fit is multiplicative, so a residual in pp mechanically scales with the
#    group's base rate; young non-graduates have roughly 2-3x the base rate of
#    young graduates, and comparing the two in pp understates how anomalous
#    the graduate number is. pp remains the headline unit; the ratio is the
#    honest cross-group comparison.
# 5. Both parameterizations are produced, not one. band_width=5/window=6 is
#    the primary (it is what the site has displayed, and it is the less noisy
#    of the two); band_width=3/window=3 -- the source script's current
#    setting -- is written alongside as a sensitivity check. If the two
#    disagree about the shape, that is a finding and should stop publication.
# 6. A pooled time series is written (age_resid_timeseries.csv) so the
#    residual can be shown as a path over time, not only as a snapshot
#    cross-section. The snapshot cannot distinguish "opened up in 2023" from
#    "always been there"; the path can.
# 7. Extrapolation is checked. The prediction is out-of-sample in TIME but
#    should be in-sample in the regressor. The meta JSON records the current
#    overall 12mo-MA rate against its training range; if the current rate sits
#    outside that range the log-log fit is extrapolating and the residual is
#    not interpretable.
# 8. PLACEBO BIAS is estimated and subtracted. This is the most consequential
#    departure. Re-running the whole procedure with the training cut moved
#    back -- train through 2014, measure the residual over 2015-2016; train
#    through 2017, measure over 2018-2019 -- should return a residual near
#    zero, because nothing happened to these cohorts in those years. It does
#    not. The source repo's own check_holdout_summary.csv found a mean error
#    of +0.4 to +0.5 pp for College+ and +0.7 to +1.0 pp for HS+ (no BA), and
#    mean error ~= mean ABSOLUTE error, so the miss is one-directional across
#    essentially every band: it is bias, not noise. The mechanism is that the
#    aggregate rate is not a sufficient statistic for a group's rate -- group
#    betas drift as educational composition shifts -- so in any stretch where
#    the aggregate is falling, the fit over-predicts improvement for these
#    groups. `placebo_bias` is the mean of the two scenarios PER BAND (not
#    pooled across bands, since the young cells are the imprecise ones), and
#    `diff_adj` = diff_avg - placebo_bias is the number worth quoting. This
#    matters most for the cross-group comparison: HS+ (no BA) carries roughly
#    twice the bias of College+, so an unadjusted pp comparison between them
#    is not a like-for-like comparison.
# 9. The 12-month moving average is made CALENDAR-aware. October 2025 CPS was
#    never collected (shutdown), so the extract has 257 month-rows where the
#    calendar has 258. zoo::rollmean averages 12 consecutive ROWS, so every
#    window touching the gap silently spanned 13 calendar months -- including
#    every window in the current reporting period. The series is now reindexed
#    onto a complete monthly grid with the gap as NA and averaged over 12
#    calendar months requiring at least MA_MIN_OBS present.
#
# Education definitions (IPUMS CPS EDUC codes, unchanged from source):
#   College+     : EDUC >= 111  (Bachelor's degree or higher)
#   HS+ (no BA)  : 73 <= EDUC < 111
#
# Reads:   data/cps.dat.gz + data/cps.xml   (same IPUMS extract as
#          01_build_cps_panel.R; see DATA_LOCAL.md)
# Writes:  micro/output/age_diff_3lines.csv      (primary: width 5, window 6)
#          micro/output/age_diff_sensitivity.csv (width 3, window 3)
#          micro/output/age_resid_timeseries.csv (pooled residual paths)
#          micro/output/age_bands_cps_meta.json  (vintage, params, diagnostics)
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(ipumsr); library(tidyverse); library(data.table); library(zoo)
  library(jsonlite)
})

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
here  <- function(...) file.path(repo, "micro", ...)
out   <- function(...) here("output", ...)
dir.create(out(), showWarnings = FALSE, recursive = TRUE)

say    <- function(...) cat(sprintf(...), "\n", sep = "")
assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)

# ── Parameters ──────────────────────────────────────────────────────────────
TRAIN_END_YEAR <- 2019L
CENTER_AGE_END <- 64L
MA_MONTHS      <- 12L
# October 2025 CPS was never collected. Averaging over 12 CALENDAR months and
# accepting 11 observations keeps every window the same calendar length
# (departure 9).
MA_MIN_OBS     <- 11L

# Placebo scenarios (departure 8): move the training cut back and measure the
# residual over the following two years, when nothing happened to these
# cohorts. Whatever the procedure reports there is bias, and is subtracted.
PLACEBOS <- list(
  list(name = "train_2014_test_2015_2016", train_end = 2014L,
       test_start = 2015L, test_end = 2016L),
  list(name = "train_2017_test_2018_2019", train_end = 2017L,
       test_start = 2018L, test_end = 2019L)
)

# Primary and sensitivity parameterizations (departure 5).
PARAMS <- list(
  primary     = list(band_width = 5L, months_window = 6L),
  sensitivity = list(band_width = 3L, months_window = 3L)
)

# Lower edge of the youngest band, per group (departure 2). College+ is pinned
# at 21 because a completed BA below that age is rare enough that including it
# makes the youngest band a selection artifact rather than a cohort.
AGE_FLOOR <- c(college = 21L, hs_plus = 18L)
EDU_GROUPS <- c("college", "hs_plus")
GROUP_LABEL <- c(college = "College+", hs_plus = "HS+ (no BA)")

# Pooled ranges for the residual time path (departure 6).
POOLED <- list(
  list(group = "college", label = "College+ 22-27",    age_min = 22L, age_max = 27L),
  list(group = "college", label = "College+ 28-34",    age_min = 28L, age_max = 34L),
  list(group = "college", label = "College+ 35-44",    age_min = 35L, age_max = 44L),
  list(group = "college", label = "College+ 45-54",    age_min = 45L, age_max = 54L),
  list(group = "hs_plus", label = "HS+ (no BA) 20-27", age_min = 20L, age_max = 27L),
  list(group = "hs_plus", label = "HS+ (no BA) 35-54", age_min = 35L, age_max = 54L)
)

ddi_path <- file.path(repo, "data", "cps.xml")
dat_path <- file.path(repo, "data", "cps.dat.gz")
for (p in c(ddi_path, dat_path))
  assert(file.exists(p), "Missing %s -- see DATA_LOCAL.md", p)

# ── 1. Read only what this needs, lower-cased to match micro/ convention ────
ddi <- read_ipums_ddi(ddi_path)
say("Reading CPS extract (YEAR, MONTH, AGE, WTFINL, LABFORCE, EMPSTAT, EDUC only)...")
cps_raw <- read_ipums_micro(
  ddi, data_file = dat_path,
  vars = c("YEAR", "MONTH", "AGE", "WTFINL", "LABFORCE", "EMPSTAT", "EDUC")
)
setnames(cps_raw <- as.data.table(cps_raw), tolower(names(cps_raw)))

cps <- cps_raw[age >= 16, .(
  date       = make_date(year, month, 1),
  age,
  lf_flag    = labforce == 2,
  unemp_flag = empstat %in% c(20, 21, 22),
  college    = educ >= 111,
  hs_plus    = educ >= 73 & educ < 111,
  wtfinl
)]
rm(cps_raw); gc()

# ── 2. Helpers: 12mo-MA unemployment rate from totals, log-log prediction ───
# Calendar-aware 12-month moving average (departure 9). Reindexes onto a
# complete monthly grid so a missing survey month (Oct 2025) leaves a hole
# rather than sliding the window; a window is reported only if at least
# MA_MIN_OBS of its MA_MONTHS calendar slots have data.
make_unrate_ma12_from_totals <- function(totals_df, out_col) {
  # totals_df must have: date, unemp, lf
  d <- totals_df %>% arrange(date) %>% mutate(urate = unemp / lf)
  grid <- tibble(date = seq(min(d$date), max(d$date), by = "month"))
  d <- grid %>% left_join(d %>% select(date, urate), by = "date")

  n_obs <- zoo::rollapply(!is.na(d$urate), MA_MONTHS, sum,
                          align = "right", fill = NA)
  ma    <- zoo::rollapply(d$urate, MA_MONTHS,
                          function(x) mean(x, na.rm = TRUE),
                          align = "right", fill = NA)

  d %>%
    mutate(urate_ma12 = if_else(!is.na(n_obs) & n_obs >= MA_MIN_OBS,
                                ma, NA_real_)) %>%
    filter(!is.na(urate_ma12)) %>%
    transmute(date, !!rlang::sym(out_col) := urate_ma12)
}

# Fits log(subgroup) ~ log(overall) on training months and returns the full
# series with a back-transformed prediction attached. Note the exp() back-
# transform reproduces the source script: it predicts the conditional MEDIAN,
# not the mean, so it is very slightly low on average. The bias is common to
# every band and so does not move the cross-age comparison.
add_unrate_prediction_loglog <- function(overall_df, subgroup_df, overall_col,
                                         subgroup_col, train_end_year) {
  pred_col <- paste0(subgroup_col, "_predict")

  regression_data <- overall_df %>%
    select(date, !!rlang::sym(overall_col)) %>%
    left_join(subgroup_df %>% select(date, !!rlang::sym(subgroup_col)), by = "date") %>%
    arrange(date) %>%
    filter(.data[[overall_col]] > 0, .data[[subgroup_col]] > 0)

  model_reg <- lm(
    stats::as.formula(paste0("log(", subgroup_col, ") ~ log(", overall_col, ")")),
    data = regression_data %>% filter(lubridate::year(date) <= train_end_year)
  )

  res <- regression_data %>%
    mutate(!!rlang::sym(pred_col) := exp(as.numeric(
      stats::predict(model_reg, newdata = regression_data)
    )))
  # Beta is the cyclical elasticity of this band's rate to the aggregate;
  # reported so a reader can see which bands are highly cycle-sensitive.
  attr(res, "beta") <- unname(stats::coef(model_reg)[2])
  attr(res, "r2")   <- summary(model_reg)$r.squared
  attr(res, "n_train") <- stats::nobs(model_reg)
  res
}

# ── 3. Pre-collapse once: date totals overall, date x age totals per group ──
cps[, `:=`(unemp_w = wtfinl * unemp_flag, lf_w = wtfinl * lf_flag)]

overall_totals_dt <- cps[, .(
  unemp = sum(unemp_w, na.rm = TRUE),
  lf    = sum(lf_w,    na.rm = TRUE)
), by = .(date)]
setorder(overall_totals_dt, date)

# Weighted unemp/lf per (date, age, group), plus the UNWEIGHTED labor-force
# count so cell size is auditable (departure 3).
age_month_dt <- cps[, c(
  list(date = date, age = age),
  setNames(lapply(EDU_GROUPS, function(g) unemp_w * get(g)),   paste0("unemp_", EDU_GROUPS)),
  setNames(lapply(EDU_GROUPS, function(g) lf_w    * get(g)),   paste0("lf_",    EDU_GROUPS)),
  setNames(lapply(EDU_GROUPS, function(g) as.integer(lf_flag & get(g))),
           paste0("n_", EDU_GROUPS))
)][, lapply(.SD, sum, na.rm = TRUE), by = .(date, age),
   .SDcols = c(paste0("unemp_", EDU_GROUPS), paste0("lf_", EDU_GROUPS),
               paste0("n_", EDU_GROUPS))]
setorder(age_month_dt, date, age)

n_person_records <- nrow(cps)
rm(cps); gc()

all_unrate <- make_unrate_ma12_from_totals(as_tibble(overall_totals_dt), "total_unrate")

# ── 4. Residual for one age range within one education group ────────────────
band_totals_dt <- function(age_month_dt, age_min, age_max, group) {
  age_month_dt[
    age >= age_min & age <= age_max,
    .(unemp = sum(get(paste0("unemp_", group)), na.rm = TRUE),
      lf    = sum(get(paste0("lf_",    group)), na.rm = TRUE),
      n_lf  = sum(get(paste0("n_",     group)), na.rm = TRUE)),
    by = .(date)
  ][order(date)]
}

# The expensive half: subset the collapsed table and build the band's 12-month
# MA rate. Split out from the fit so the placebo scenarios can reuse it
# instead of recomputing the moving average once per training cut.
band_ma_series <- function(age_min, age_max, group, age_month_dt) {
  totals_dt    <- band_totals_dt(age_month_dt, age_min, age_max, group)
  subgroup_col <- paste0(group, "_age", age_min, "_", age_max)
  list(
    col        = subgroup_col,
    ma         = make_unrate_ma12_from_totals(as_tibble(totals_dt), subgroup_col),
    # Mean unweighted LF count per month in this band (cell size, not smoothed).
    n_lf_month = mean(totals_dt$n_lf, na.rm = TRUE)
  )
}

# The cheap half: fit at a given training cut and return the residual series.
band_resid_from_ma <- function(bma, all_unrate, train_end_year) {
  with_pred <- add_unrate_prediction_loglog(
    overall_df = all_unrate, subgroup_df = bma$ma,
    overall_col = "total_unrate", subgroup_col = bma$col,
    train_end_year = train_end_year
  )
  pred_col <- paste0(bma$col, "_predict")
  res <- tibble(
    date   = with_pred$date,
    actual = with_pred[[bma$col]],
    pred   = with_pred[[pred_col]]
  ) %>%
    mutate(resid = actual - pred, ratio = actual / pred,
           n_lf_month = bma$n_lf_month)
  attr(res, "beta") <- attr(with_pred, "beta")
  attr(res, "r2")   <- attr(with_pred, "r2")
  res
}

band_resid_series <- function(age_min, age_max, group, age_month_dt, all_unrate,
                              train_end_year) {
  band_resid_from_ma(band_ma_series(age_min, age_max, group, age_month_dt),
                     all_unrate, train_end_year)
}

# Placebo bias for one band (departure 8): move the training cut back, average
# the residual over the two following years, and average across scenarios.
# Whatever this returns is what the procedure reports when nothing happened.
band_placebo_bias <- function(bma, all_unrate) {
  vals <- map_dbl(PLACEBOS, function(p) {
    s <- band_resid_from_ma(bma, all_unrate, p$train_end)
    mean(s$resid[lubridate::year(s$date) >= p$test_start &
                 lubridate::year(s$date) <= p$test_end], na.rm = TRUE)
  })
  set_names(as.list(c(vals, mean(vals, na.rm = TRUE))),
            c(map_chr(PLACEBOS, "name"), "placebo_bias"))
}

summarise_band <- function(series, months_window, train_end_year) {
  train <- series %>% filter(lubridate::year(date) <= train_end_year)
  last_block <- series %>% tail(months_window)
  sd_train <- stats::sd(train$resid, na.rm = TRUE)
  diff_avg <- mean(last_block$resid, na.rm = TRUE)
  tibble(
    months         = nrow(last_block),
    diff_avg       = diff_avg,
    ratio_avg      = mean(last_block$ratio, na.rm = TRUE),
    resid_sd_train = sd_train,
    z              = diff_avg / sd_train,
    n_lf_month     = last_block$n_lf_month[1],
    beta           = attr(series, "beta") %||% NA_real_,
    fit_r2         = attr(series, "r2")   %||% NA_real_,
    window_start   = format(min(last_block$date), "%Y-%m"),
    window_end     = format(max(last_block$date), "%Y-%m")
  )
}

# ── 5. Snapshot cross-section, for each parameterization ────────────────────
run_parameterization <- function(band_width, months_window) {
  half <- (band_width - 1L) / 2L
  map_dfr(EDU_GROUPS, function(group) {
    centers <- (AGE_FLOOR[[group]] + half):CENTER_AGE_END
    map_dfr(centers, function(center_age) {
      age_min <- center_age - half; age_max <- center_age + half
      bma <- band_ma_series(age_min, age_max, group, age_month_dt)
      s   <- band_resid_from_ma(bma, all_unrate, TRAIN_END_YEAR)
      pb  <- band_placebo_bias(bma, all_unrate)
      row <- bind_cols(
        tibble(center_age = center_age, age_min = age_min, age_max = age_max,
               edu_group = GROUP_LABEL[[group]], band_width = band_width),
        summarise_band(s, months_window, TRAIN_END_YEAR),
        as_tibble(pb)
      )
      # diff_adj is the number worth quoting: the raw residual net of what the
      # same procedure reports in periods when nothing happened.
      row %>% mutate(diff_adj = diff_avg - placebo_bias,
                     z_adj    = diff_adj / resid_sd_train)
    })
  })
}

say("Computing primary parameterization (band_width=%d, window=%d)...",
    PARAMS$primary$band_width, PARAMS$primary$months_window)
age_diff <- run_parameterization(PARAMS$primary$band_width,
                                 PARAMS$primary$months_window)

say("Computing sensitivity parameterization (band_width=%d, window=%d)...",
    PARAMS$sensitivity$band_width, PARAMS$sensitivity$months_window)
age_diff_sens <- run_parameterization(PARAMS$sensitivity$band_width,
                                      PARAMS$sensitivity$months_window)

write_csv(age_diff,      out("age_diff_3lines.csv"))
write_csv(age_diff_sens, out("age_diff_sensitivity.csv"))

# ── 6. Pooled residual time paths (departure 6) ─────────────────────────────
say("Computing pooled residual time series...")
ts_out <- map_dfr(POOLED, function(p) {
  bma <- band_ma_series(p$age_min, p$age_max, p$group, age_month_dt)
  pb  <- band_placebo_bias(bma, all_unrate)$placebo_bias
  band_resid_from_ma(bma, all_unrate, TRAIN_END_YEAR) %>%
    transmute(
      label = p$label, edu_group = GROUP_LABEL[[p$group]],
      age_min = p$age_min, age_max = p$age_max,
      date, actual, pred, resid, ratio,
      placebo_bias = pb, resid_adj = resid - pb
    )
})
write_csv(ts_out, out("age_resid_timeseries.csv"))

# ── 7. Diagnostics: extrapolation check + sensitivity agreement ─────────────
train_rates  <- all_unrate %>% filter(lubridate::year(date) <= TRAIN_END_YEAR) %>%
  pull(total_unrate)
overall_now  <- tail(all_unrate$total_unrate, 1)
in_support   <- overall_now >= min(train_rates) && overall_now <= max(train_rates)

# Calendar months with no CPS collection (Oct 2025 = shutdown).
all_months  <- seq(min(overall_totals_dt$date), max(overall_totals_dt$date), by = "month")
miss_months <- setdiff(format(all_months, "%Y-%m"),
                       format(overall_totals_dt$date, "%Y-%m"))

# Mean placebo bias by group, in pp, over the bands actually published.
placebo_summary <- age_diff %>%
  group_by(edu_group) %>%
  summarise(across(all_of(c(map_chr(PLACEBOS, "name"), "placebo_bias")),
                   ~ round(mean(.x, na.rm = TRUE) * 100, 3)), .groups = "drop")

# Do the two parameterizations agree about the shape? Correlate diff_avg over
# the center ages both produce, within each group.
agree <- age_diff %>%
  select(edu_group, center_age, primary = diff_avg) %>%
  inner_join(age_diff_sens %>% select(edu_group, center_age, sens = diff_avg),
             by = c("edu_group", "center_age")) %>%
  group_by(edu_group) %>%
  summarise(n = n(), cor = stats::cor(primary, sens),
            max_abs_gap_pp = max(abs(primary - sens)) * 100, .groups = "drop")

meta <- list(
  vintage = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"),
  source_script = paste0(
    "github.com/mtkonczal/Blog-Posts-Presentations-and-Testimony/blob/main/",
    "blogs_2026/01_education_young_unrate/01_big_graphic_YoY.R"
  ),
  cps = list(
    person_records_read = n_person_records,
    first_month = format(min(overall_totals_dt$date), "%Y-%m"),
    last_month  = format(max(overall_totals_dt$date), "%Y-%m")
  ),
  params = list(
    train_end_year = TRAIN_END_YEAR, ma_months = MA_MONTHS,
    center_age_end = CENTER_AGE_END,
    age_floor = as.list(AGE_FLOOR),
    primary = PARAMS$primary, sensitivity = PARAMS$sensitivity,
    edu_groups = unname(GROUP_LABEL)
  ),
  reference_window = list(
    residual_months = paste(min(age_diff$window_start), "to",
                            max(age_diff$window_end)),
    note = paste0(
      "Each residual month is itself a ", MA_MONTHS, "-month moving average, ",
      "so the ", PARAMS$primary$months_window, "-month window reflects labor ",
      "market data back to roughly ",
      format(as.Date(paste0(min(age_diff$window_start), "-01")) -
               months(MA_MONTHS - 1), "%Y-%m"),
      ". This chart is a slow-moving object; it is not a current-month reading."
    )
  ),
  extrapolation_check = list(
    overall_ma12_now = round(overall_now, 5),
    train_min = round(min(train_rates), 5), train_max = round(max(train_rates), 5),
    in_training_support = in_support
  ),
  sensitivity_agreement = agree,
  missing_months = list(
    months = miss_months,
    note = paste0(
      "October 2025 CPS was never collected (shutdown). The ", MA_MONTHS,
      "-month average is taken over calendar months, requiring at least ",
      MA_MIN_OBS, " observed, so windows spanning the gap average ", MA_MIN_OBS,
      " months rather than silently reaching an extra month back."
    )
  ),
  placebo = list(
    scenarios = map_chr(PLACEBOS, "name"),
    mean_bias_pp = placebo_summary,
    note = paste0(
      "Re-running the procedure with the training cut moved back should give a ",
      "residual near zero over the following two years. It does not. The mean ",
      "bias by group is above, in percentage points. diff_adj = diff_avg - ",
      "placebo_bias is the residual net of this. HS+ (no BA) carries the larger ",
      "bias, so unadjusted pp comparisons between the two groups are not ",
      "like-for-like."
    )
  ),
  departures_from_source = c(
    "dropped < HS (compositional, not demand, at young ages)",
    "youngest band lower edge pinned at 21 (College+) / 18 (HS+)",
    "reports resid_sd_train, z, n_lf_month, beta, fit_r2",
    "reports ratio_avg alongside diff_avg",
    "emits both band_width 5/6 and 3/3",
    "emits pooled residual time series",
    "estimates and subtracts per-band placebo bias (diff_adj)",
    "calendar-aware 12-month MA (Oct 2025 CPS gap)"
  )
)
write_json(meta, out("age_bands_cps_meta.json"), auto_unbox = TRUE, pretty = TRUE)

# ── 8. Console diagnostics ──────────────────────────────────────────────────
cat("\n── Age bands (CPS microdata) ──\n")
cat(sprintf("  CPS: %s person-records, %s to %s\n",
            format(n_person_records, big.mark = ","),
            meta$cps$first_month, meta$cps$last_month))
cat(sprintf("  residual window: %s\n", meta$reference_window$residual_months))
cat(sprintf("  primary rows: %d  (%s)\n", nrow(age_diff),
            paste(unique(age_diff$edu_group), collapse = ", ")))
cat(sprintf("  overall 12mo-MA rate now %.3f%%; training range %.3f%%-%.3f%% -> %s\n",
            overall_now * 100, min(train_rates) * 100, max(train_rates) * 100,
            if (in_support) "IN support" else "*** OUT OF SUPPORT ***"))
if (!in_support)
  cat("  *** The log-log fit is extrapolating. Residuals are not interpretable. ***\n")

cat(sprintf("  missing CPS months: %s\n",
            if (length(miss_months)) paste(miss_months, collapse = ", ") else "none"))

cat("\n  Sensitivity agreement (primary 5/6 vs 3/3):\n")
print(as.data.frame(agree), row.names = FALSE)

cat("\n  PLACEBO BIAS by group (pp) -- what the procedure reports when nothing happened:\n")
print(as.data.frame(placebo_summary), row.names = FALSE)

cat("\n  Primary, youngest 8 center ages per group:\n")
cat("    pp = raw residual, bias = placebo, adj = pp - bias, ratio = actual/pred\n")
age_diff %>%
  group_by(edu_group) %>% slice_head(n = 8) %>% ungroup() %>%
  transmute(edu_group, band = paste0(age_min, "-", age_max),
            pp = round(diff_avg * 100, 2), bias = round(placebo_bias * 100, 2),
            adj = round(diff_adj * 100, 2), ratio = round(ratio_avg, 2),
            z_adj = round(z_adj, 2), beta = round(beta, 2),
            n_lf = round(n_lf_month)) %>%
  as.data.frame() %>% print(row.names = FALSE)

cat("\n  Pooled residual, latest month:\n")
ts_out %>% group_by(label) %>% slice_max(date, n = 1) %>% ungroup() %>%
  transmute(label, date = format(date, "%Y-%m"),
            actual_pct = round(actual * 100, 2), pred_pct = round(pred * 100, 2),
            resid_pp = round(resid * 100, 2), bias_pp = round(placebo_bias * 100, 2),
            adj_pp = round(resid_adj * 100, 2), ratio = round(ratio, 2)) %>%
  as.data.frame() %>% print(row.names = FALSE)

cat("\nWrote ", out("age_diff_3lines.csv"), "\n", sep = "")
cat("Wrote ", out("age_diff_sensitivity.csv"), "\n", sep = "")
cat("Wrote ", out("age_resid_timeseries.csv"), "\n", sep = "")
cat("Wrote ", out("age_bands_cps_meta.json"), "\n", sep = "")
