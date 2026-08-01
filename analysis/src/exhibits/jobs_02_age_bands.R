#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Job Displacement, card 02 — "Is the weakness spread evenly, or concentrated?"
#
# For each education group and each centered age band: take the band's
# 12-month moving-average unemployment rate, fit log(band rate) on log(overall
# rate) using months through 2019 only, back-transform, and average
# (actual - predicted) over the most recent months. A positive residual means
# the band has more unemployment than its OWN pre-2020 relationship to the
# aggregate predicts. This is a within-band comparison, so it is not disturbed
# by the fact that young workers always have higher unemployment than old ones.
#
# The number the site quotes is `adj`, not the raw residual. Re-running the
# identical procedure with the training cut moved back (train through 2014,
# measure 2015-16; train through 2017, measure 2018-19) should return roughly
# zero over years when nothing happened to these cohorts. It does not. That
# non-zero output is method bias, it differs by group, and it is subtracted.
# HS+ (no BA) carries the larger bias, so unadjusted comparisons between the
# two education groups are not like-for-like.
#
# Method descends from 01_big_graphic_YoY.R in
#   github.com/mtkonczal/Blog-Posts-Presentations-and-Testimony
#     /blogs_2026/01_education_young_unrate
# The regression, the 12-month MA, the 2019 training cut and the residual
# averaging are unchanged from it. Eight deliberate departures are listed in
# `departures_from_source` in the meta this writes, and each is a decision
# rather than a port artifact.
#
# Reads   interim/cps/{overall_totals,age_month_totals}.csv  (clean/cps_age_education.R)
# Writes  interim/cps/age_diff_3lines.csv         primary cross-section, width 5 / window 6
#         interim/cps/age_diff_sensitivity.csv    width 3 / window 3
#         interim/cps/age_resid_timeseries.csv    pooled residual paths
#         interim/cps/age_bands_cps_meta.json     params + diagnostics
#         interim/cards/jobs_02_age_bands.json    the card
#
#   Rscript analysis/src/exhibits/jobs_02_age_bands.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

suppressPackageStartupMessages({
  library(tidyverse); library(data.table); library(zoo); library(jsonlite)
})

`%||%` <- function(a, b) if (is.null(a) || length(a) == 0 || is.na(a)) b else a
assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)

# ── Parameters ───────────────────────────────────────────────────────────────
TRAIN_END_YEAR <- 2019L
CENTER_AGE_END <- 64L
MA_MONTHS      <- 12L
# October 2025 CPS was never collected. Averaging over 12 CALENDAR months and
# accepting 11 observations keeps every window the same calendar length rather
# than letting a window silently reach an extra month back.
MA_MIN_OBS     <- 11L

PLACEBOS <- list(
  list(name = "train_2014_test_2015_2016", train_end = 2014L,
       test_start = 2015L, test_end = 2016L),
  list(name = "train_2017_test_2018_2019", train_end = 2017L,
       test_start = 2018L, test_end = 2019L)
)

PARAMS <- list(
  primary     = list(band_width = 5L, months_window = 6L),
  sensitivity = list(band_width = 3L, months_window = 3L)
)

# College+ is floored at 21: a completed bachelor's below that age is rare
# enough that including it makes the youngest band a selection artifact.
AGE_FLOOR   <- c(college = 21L, hs_plus = 18L)
EDU_GROUPS  <- c("college", "hs_plus")
GROUP_LABEL <- c(college = "College+", hs_plus = "HS+ (no BA)")

POOLED <- list(
  list(group = "college", label = "College+ 22-27",    age_min = 22L, age_max = 27L),
  list(group = "college", label = "College+ 28-34",    age_min = 28L, age_max = 34L),
  list(group = "college", label = "College+ 35-44",    age_min = 35L, age_max = 44L),
  list(group = "college", label = "College+ 45-54",    age_min = 45L, age_max = 54L),
  list(group = "hs_plus", label = "HS+ (no BA) 20-27", age_min = 20L, age_max = 27L),
  list(group = "hs_plus", label = "HS+ (no BA) 35-54", age_min = 35L, age_max = 54L)
)

cps_dir <- interim_path("cps")
how     <- "Rscript analysis/src/clean/cps_age_education.R"
overall_totals_dt <- fread(need_file(file.path(cps_dir, "overall_totals.csv"), how))
age_month_dt      <- fread(need_file(file.path(cps_dir, "age_month_totals.csv"), how))
read_meta         <- fromJSON(need_file(file.path(cps_dir, "cps_read_meta.json"), how),
                              simplifyVector = TRUE)
overall_totals_dt[, date := as.Date(date)]
age_month_dt[, date := as.Date(date)]

# ── Rate construction and the log-log fit ────────────────────────────────────
# Calendar-aware 12-month moving average. Reindexes onto a complete monthly
# grid so a missing survey month leaves a hole rather than sliding the window.
make_unrate_ma12_from_totals <- function(totals_df, out_col) {
  d <- totals_df %>% arrange(date) %>% mutate(urate = unemp / lf)
  grid <- tibble(date = seq(min(d$date), max(d$date), by = "month"))
  d <- grid %>% left_join(d %>% select(date, urate), by = "date")

  n_obs <- zoo::rollapply(!is.na(d$urate), MA_MONTHS, sum, align = "right", fill = NA)
  ma    <- zoo::rollapply(d$urate, MA_MONTHS, function(x) mean(x, na.rm = TRUE),
                          align = "right", fill = NA)

  d %>%
    mutate(urate_ma12 = if_else(!is.na(n_obs) & n_obs >= MA_MIN_OBS, ma, NA_real_)) %>%
    filter(!is.na(urate_ma12)) %>%
    transmute(date, !!rlang::sym(out_col) := urate_ma12)
}

# The exp() back-transform predicts the conditional MEDIAN, not the mean, so it
# runs very slightly low. That bias is common to every band and so does not
# move the cross-age comparison, which is the object of interest.
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
      stats::predict(model_reg, newdata = regression_data))))
  # Beta is this band's cyclical elasticity to the aggregate rate; reported so
  # a reader can see which bands are highly cycle-sensitive.
  attr(res, "beta")    <- unname(stats::coef(model_reg)[2])
  attr(res, "r2")      <- summary(model_reg)$r.squared
  attr(res, "n_train") <- stats::nobs(model_reg)
  res
}

all_unrate <- make_unrate_ma12_from_totals(as_tibble(overall_totals_dt), "total_unrate")

# ── One band ─────────────────────────────────────────────────────────────────
band_totals_dt <- function(age_month_dt, age_min, age_max, group) {
  age_month_dt[
    age >= age_min & age <= age_max,
    .(unemp = sum(get(paste0("unemp_", group)), na.rm = TRUE),
      lf    = sum(get(paste0("lf_",    group)), na.rm = TRUE),
      n_lf  = sum(get(paste0("n_",     group)), na.rm = TRUE)),
    by = .(date)][order(date)]
}

# Split from the fit so the placebo cuts reuse the moving average instead of
# recomputing it once per training cut.
band_ma_series <- function(age_min, age_max, group, age_month_dt) {
  totals_dt    <- band_totals_dt(age_month_dt, age_min, age_max, group)
  subgroup_col <- paste0(group, "_age", age_min, "_", age_max)
  list(col = subgroup_col,
       ma  = make_unrate_ma12_from_totals(as_tibble(totals_dt), subgroup_col),
       n_lf_month = mean(totals_dt$n_lf, na.rm = TRUE))
}

band_resid_from_ma <- function(bma, all_unrate, train_end_year) {
  with_pred <- add_unrate_prediction_loglog(
    overall_df = all_unrate, subgroup_df = bma$ma,
    overall_col = "total_unrate", subgroup_col = bma$col,
    train_end_year = train_end_year)
  pred_col <- paste0(bma$col, "_predict")
  res <- tibble(date = with_pred$date, actual = with_pred[[bma$col]],
                pred = with_pred[[pred_col]]) %>%
    mutate(resid = actual - pred, ratio = actual / pred, n_lf_month = bma$n_lf_month)
  attr(res, "beta") <- attr(with_pred, "beta")
  attr(res, "r2")   <- attr(with_pred, "r2")
  res
}

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
  train      <- series %>% filter(lubridate::year(date) <= train_end_year)
  last_block <- series %>% tail(months_window)
  sd_train   <- stats::sd(train$resid, na.rm = TRUE)
  diff_avg   <- mean(last_block$resid, na.rm = TRUE)
  tibble(months = nrow(last_block), diff_avg = diff_avg,
         ratio_avg = mean(last_block$ratio, na.rm = TRUE),
         resid_sd_train = sd_train, z = diff_avg / sd_train,
         n_lf_month = last_block$n_lf_month[1],
         beta   = attr(series, "beta") %||% NA_real_,
         fit_r2 = attr(series, "r2")   %||% NA_real_,
         window_start = format(min(last_block$date), "%Y-%m"),
         window_end   = format(max(last_block$date), "%Y-%m"))
}

run_parameterization <- function(band_width, months_window) {
  half <- (band_width - 1L) / 2L
  map_dfr(EDU_GROUPS, function(group) {
    centers <- (AGE_FLOOR[[group]] + half):CENTER_AGE_END
    map_dfr(centers, function(center_age) {
      age_min <- center_age - half; age_max <- center_age + half
      bma <- band_ma_series(age_min, age_max, group, age_month_dt)
      s   <- band_resid_from_ma(bma, all_unrate, TRAIN_END_YEAR)
      pb  <- band_placebo_bias(bma, all_unrate)
      bind_cols(
        tibble(center_age = center_age, age_min = age_min, age_max = age_max,
               edu_group = GROUP_LABEL[[group]], band_width = band_width),
        summarise_band(s, months_window, TRAIN_END_YEAR),
        as_tibble(pb)
      ) %>%
        mutate(diff_adj = diff_avg - placebo_bias, z_adj = diff_adj / resid_sd_train)
    })
  })
}

out <- ensure_dir(cps_dir)

say("Primary parameterization (band_width=%d, window=%d) ...",
    PARAMS$primary$band_width, PARAMS$primary$months_window)
age_diff <- run_parameterization(PARAMS$primary$band_width, PARAMS$primary$months_window)

say("Sensitivity parameterization (band_width=%d, window=%d) ...",
    PARAMS$sensitivity$band_width, PARAMS$sensitivity$months_window)
age_diff_sens <- run_parameterization(PARAMS$sensitivity$band_width,
                                      PARAMS$sensitivity$months_window)

write_csv(age_diff,      file.path(out, "age_diff_3lines.csv"))
write_csv(age_diff_sens, file.path(out, "age_diff_sensitivity.csv"))

say("Pooled residual time series ...")
ts_out <- map_dfr(POOLED, function(p) {
  bma <- band_ma_series(p$age_min, p$age_max, p$group, age_month_dt)
  pb  <- band_placebo_bias(bma, all_unrate)$placebo_bias
  band_resid_from_ma(bma, all_unrate, TRAIN_END_YEAR) %>%
    transmute(label = p$label, edu_group = GROUP_LABEL[[p$group]],
              age_min = p$age_min, age_max = p$age_max,
              date, actual, pred, resid, ratio,
              placebo_bias = pb, resid_adj = resid - pb)
})
write_csv(ts_out, file.path(out, "age_resid_timeseries.csv"))

# ── Diagnostics ──────────────────────────────────────────────────────────────
train_rates <- all_unrate %>% filter(lubridate::year(date) <= TRAIN_END_YEAR) %>%
  pull(total_unrate)
overall_now <- tail(all_unrate$total_unrate, 1)
in_support  <- overall_now >= min(train_rates) && overall_now <= max(train_rates)

all_months  <- seq(min(overall_totals_dt$date), max(overall_totals_dt$date), by = "month")
miss_months <- setdiff(format(all_months, "%Y-%m"), format(overall_totals_dt$date, "%Y-%m"))

placebo_summary <- age_diff %>%
  group_by(edu_group) %>%
  summarise(across(all_of(c(map_chr(PLACEBOS, "name"), "placebo_bias")),
                   ~ round(mean(.x, na.rm = TRUE) * 100, 3)), .groups = "drop")

# Do the two parameterizations agree about the shape of the age profile?
agree <- age_diff %>%
  select(edu_group, center_age, primary = diff_avg) %>%
  inner_join(age_diff_sens %>% select(edu_group, center_age, sens = diff_avg),
             by = c("edu_group", "center_age")) %>%
  group_by(edu_group) %>%
  summarise(n = n(), cor = stats::cor(primary, sens),
            max_abs_gap_pp = max(abs(primary - sens)) * 100, .groups = "drop")

meta <- list(
  vintage = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"),
  source_script = paste0("github.com/mtkonczal/Blog-Posts-Presentations-and-Testimony/",
                         "blob/main/blogs_2026/01_education_young_unrate/01_big_graphic_YoY.R"),
  cps = list(person_records_read = read_meta$person_records_read,
             first_month = read_meta$first_month, last_month = read_meta$last_month),
  params = list(train_end_year = TRAIN_END_YEAR, ma_months = MA_MONTHS,
                center_age_end = CENTER_AGE_END, age_floor = as.list(AGE_FLOOR),
                primary = PARAMS$primary, sensitivity = PARAMS$sensitivity,
                edu_groups = unname(GROUP_LABEL)),
  reference_window = list(
    residual_months = paste(min(age_diff$window_start), "to", max(age_diff$window_end)),
    note = paste0("Each residual month is itself a ", MA_MONTHS,
                  "-month moving average, so the ", PARAMS$primary$months_window,
                  "-month window reflects labor market data back to roughly ",
                  format(as.Date(paste0(min(age_diff$window_start), "-01")) -
                           months(MA_MONTHS - 1), "%Y-%m"),
                  ". This chart is a slow-moving object; it is not a current-month reading.")),
  extrapolation_check = list(overall_ma12_now = round(overall_now, 5),
                             train_min = round(min(train_rates), 5),
                             train_max = round(max(train_rates), 5),
                             in_training_support = in_support),
  sensitivity_agreement = agree,
  missing_months = list(
    months = miss_months,
    note = paste0("October 2025 CPS was never collected (shutdown). The ", MA_MONTHS,
                  "-month average is taken over calendar months, requiring at least ",
                  MA_MIN_OBS, " observed, so windows spanning the gap average ",
                  MA_MIN_OBS, " months rather than silently reaching an extra month back.")),
  placebo = list(
    scenarios = map_chr(PLACEBOS, "name"), mean_bias_pp = placebo_summary,
    note = paste0("Re-running the procedure with the training cut moved back should give a ",
                  "residual near zero over the following two years. It does not. The mean ",
                  "bias by group is above, in percentage points. diff_adj = diff_avg - ",
                  "placebo_bias is the residual net of this. HS+ (no BA) carries the larger ",
                  "bias, so unadjusted pp comparisons between the two groups are not ",
                  "like-for-like.")),
  departures_from_source = c(
    "dropped < HS (compositional, not demand, at young ages)",
    "youngest band lower edge pinned at 21 (College+) / 18 (HS+)",
    "reports resid_sd_train, z, n_lf_month, beta, fit_r2",
    "reports ratio_avg alongside diff_avg",
    "emits both band_width 5/6 and 3/3",
    "emits pooled residual time series",
    "estimates and subtracts per-band placebo bias (diff_adj)",
    "calendar-aware 12-month MA (Oct 2025 CPS gap)")
)
write_json(meta, file.path(out, "age_bands_cps_meta.json"), auto_unbox = TRUE, pretty = TRUE)

# ═════════════════════════════════════════════════════════════════════════════
# The card. Read back from the tidy CSVs just written, so what the site shows
# is provably the same object as the committed research tables.
# ═════════════════════════════════════════════════════════════════════════════
cps_meta <- fromJSON(file.path(out, "age_bands_cps_meta.json"), simplifyVector = TRUE)
d  <- read.csv(file.path(out, "age_diff_3lines.csv"), stringsAsFactors = FALSE)
ts <- read.csv(file.path(out, "age_resid_timeseries.csv"), stringsAsFactors = FALSE)

months_window <- unique(d$months)[1]
group_levels  <- c("College+", "HS+ (no BA)")
assert(setequal(unique(d$edu_group), group_levels), "unexpected education groups")
d$edu_group <- factor(d$edu_group, levels = group_levels)

# `adj` is the headline value; `raw` and `bias` ride along so the chart can show
# what the adjustment did, and `n` so cell size is visible in the tooltip.
# The dash in `band` is an HTML entity on purpose: R runs in the C locale here
# and mangles a literal en-dash into three garbage bytes, which is exactly what
# the pre-refactor artifact shipped ("21<e2><80><93>25").
series <- d %>%
  arrange(edu_group, center_age) %>%
  group_by(edu_group) %>%
  group_map(~ list(
    group  = as.character(.y$edu_group),
    points = pmap(
      list(.x$center_age, .x$diff_adj, .x$diff_avg, .x$placebo_bias,
           .x$ratio_avg, .x$z_adj, .x$n_lf_month, .x$age_min, .x$age_max),
      function(age, adj, raw, bias, ratio, z, n, lo, hi) list(
        age = age, adj = round(adj, 4), raw = round(raw, 4), bias = round(bias, 4),
        ratio = round(ratio, 3), z = round(z, 2), n = round(n),
        band = paste0(lo, "&ndash;", hi)))))

# Only the two series the time-path chart draws get a full monthly history;
# shipping all six tripled the payload for points nothing reads. Everything
# else needs only its latest month, which `latest` supplies.
TS_FULL <- c("College+ 22-27", "HS+ (no BA) 20-27")

timeseries <- ts %>%
  filter(label %in% TS_FULL) %>%
  arrange(label, date) %>%
  group_by(label) %>%
  group_map(~ list(
    label     = as.character(.y$label),
    edu_group = .x$edu_group[1],
    points    = map2(.x$date, .x$resid_adj,
                     ~ list(date = substr(.x, 1, 7), adj = round(.y, 4)))))

latest <- ts %>%
  group_by(label) %>% slice_max(date, n = 1) %>% ungroup() %>%
  arrange(match(label, c("College+ 22-27", "College+ 28-34", "College+ 35-44",
                         "College+ 45-54", "HS+ (no BA) 20-27", "HS+ (no BA) 35-54"))) %>%
  pmap(function(label, edu_group, age_min, age_max, date, actual, pred, resid,
                ratio, placebo_bias, resid_adj) list(
    label = label, edu_group = edu_group, age_min = age_min, age_max = age_max,
    date = substr(date, 1, 7), actual = round(actual, 4), pred = round(pred, 4),
    raw = round(resid, 4), bias = round(placebo_bias, 4), adj = round(resid_adj, 4),
    ratio = round(actual / pred, 3)))

# The headline is deliberately NOT the maximum residual across bands. With ~87
# bands the argmax is the winner's curse: it lands on the smallest, noisiest
# cell, which is how an earlier snapshot came to headline +4.6 pp off a band
# reaching down to age 19. This is a pre-specified range with a real sample.
latest_of <- function(lab) {
  r <- ts %>% filter(label == lab) %>% slice_max(date, n = 1)
  assert(nrow(r) > 0, "No time series rows for %s", lab)
  r
}
yg  <- latest_of("College+ 22-27")
pg  <- latest_of("College+ 45-54")
yng <- latest_of("HS+ (no BA) 20-27")

headline <- list(
  latest_month = substr(yg$date, 1, 7),
  young_grad = list(label = "College+ 22-27", actual = round(yg$actual, 4),
                    pred = round(yg$pred, 4), raw = round(yg$resid, 4),
                    bias = round(yg$placebo_bias, 4), adj = round(yg$resid_adj, 4),
                    ratio = round(yg$actual / yg$pred, 3)),
  prime_grad = list(label = "College+ 45-54", adj = round(pg$resid_adj, 4),
                    ratio = round(pg$actual / pg$pred, 3)),
  young_nongrad = list(label = "HS+ (no BA) 20-27", adj = round(yng$resid_adj, 4),
                       ratio = round(yng$actual / yng$pred, 3))
)

verdict <- sprintf(
  paste0("Yes, and it is narrower than it looks. Graduates aged 22-27 face %.1f%% ",
         "unemployment against the %.1f%% their own pre-2020 relationship to the ",
         "overall rate predicts -- %+.1f pp, or %.0f%% more unemployment than ",
         "predicted, after netting out the %+.1f pp this method reports in periods ",
         "when nothing happened. Same-aged non-graduates show %+.1f pp and graduates ",
         "aged 45-54 %+.1f pp: essentially nothing. The excess sits with young ",
         "graduates specifically, not with young workers generally."),
  yg$actual * 100, yg$pred * 100, yg$resid_adj * 100,
  (yg$actual / yg$pred - 1) * 100, yg$placebo_bias * 100,
  yng$resid_adj * 100, pg$resid_adj * 100)

age_bands <- list(
  vintage = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"),
  source = list(
    computed_by = "analysis/src/exhibits/jobs_02_age_bands.R (IPUMS CPS microdata)",
    lineage = paste0("Method descends from github.com/mtkonczal/",
                     "Blog-Posts-Presentations-and-Testimony/blogs_2026/01_education_young_unrate. ",
                     "No longer a downloaded snapshot; computed locally from the CPS extract."),
    cps_range = paste(cps_meta$cps$first_month, "to", cps_meta$cps$last_month),
    cps_missing_months = cps_meta$missing_months$months,
    method = paste0("actual minus predicted 12-month-MA unemployment rate, by education x ",
                    "centered ", cps_meta$params$primary$band_width,
                    "-yr age band; log-log fit trained through ", cps_meta$params$train_end_year,
                    "; residual averaged over the latest ", months_window, " months; ",
                    "placebo bias subtracted")),
  units = "rate proportion (multiply by 100 for percentage points)",
  value_definition = paste0(
    "adj = raw - bias. raw is the residual as originally specified; bias is what ",
    "the identical procedure reports for the same band when trained through 2014 ",
    "and measured over 2015-16, and through 2017 measured over 2018-19, averaged. ",
    "adj is the residual net of that. Quote adj."),
  lag_note = cps_meta$reference_window$note,
  placebo = list(scenarios = cps_meta$placebo$scenarios,
                 mean_bias_pp = cps_meta$placebo$mean_bias_pp,
                 note = cps_meta$placebo$note),
  diagnostics = list(extrapolation = cps_meta$extrapolation_check,
                     sensitivity = cps_meta$sensitivity_agreement),
  group_order = group_levels,
  band_width = cps_meta$params$primary$band_width,
  months_window = months_window,
  series = series, timeseries = timeseries, timeseries_full = TS_FULL,
  latest = latest, headline = headline, verdict = verdict
)

write_card(age_bands, "jobs_02_age_bands")

say("-- Age bands (CPS microdata) --")
say("  CPS %s; bands %d-yr; window %d mo",
    age_bands$source$cps_range, age_bands$band_width, months_window)
say("  young grads (22-27): actual %.2f%% vs predicted %.2f%% = %+.2f pp raw, %+.2f pp adjusted (x%.2f)",
    yg$actual * 100, yg$pred * 100, yg$resid * 100, yg$resid_adj * 100, yg$actual / yg$pred)
say("  prime grads (45-54):     %+.2f pp adjusted", pg$resid_adj * 100)
say("  young non-grads (20-27): %+.2f pp adjusted", yng$resid_adj * 100)
say("-- Verdict --\n  %s", verdict)
