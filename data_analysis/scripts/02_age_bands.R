#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# 02_age_bands.R  —  Section 2: "Is the unemployment shortfall uneven?"
#
# Reads the residual-by-age output computed from IPUMS CPS microdata by
# `micro/07_age_bands_cps.R` and shapes it into the JSON contract the site
# renders. It does no estimation of its own; see that script's header for the
# method and for the departures from the original blog-repo version.
#
# Method, in one paragraph: for each education group and centered 5-year age
# band, fit a log-log regression of the band's 12-month-MA unemployment rate on
# the overall 12-month-MA rate, trained through 2019, back-transform the
# prediction to levels, and average (actual - predicted) over the most recent
# 6 months. Positive means more unemployment than that band's own pre-2020
# relationship to the aggregate predicts. The same procedure is then re-run
# with the training cut moved back (train through 2014, measure 2015-16; train
# through 2017, measure 2018-19) to estimate how large a residual it reports in
# periods when nothing happened; that placebo bias is subtracted. `adj` is the
# bias-adjusted residual and is the number the site quotes.
#
# WAS: this script used to download a committed snapshot CSV
# (age_diff_sa_3lines.csv) from the blog repo. That file turned out to be an
# orphan -- no code path in the source repo still produces it, its age bands
# reached below 21 for College+, and it was six months stale. It is no longer
# read. Everything now comes from the local microdata run.
#
# Reads:  data_analysis/micro/output/age_diff_3lines.csv
#         data_analysis/micro/output/age_resid_timeseries.csv
#         data_analysis/micro/output/age_bands_cps_meta.json
# Writes: data_analysis/output/age_bands.json
# ─────────────────────────────────────────────────────────────────────────────

suppressMessages({
  library(tidyverse)
  library(jsonlite)
})

# Locate the repo from this script's own position -- never hard-code a path
# containing a user name. Defines REPO_ROOT / DA_ROOT / repo_path() / da_path().
.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.base <- if (length(.file)) dirname(normalizePath(.file)) else normalizePath(getwd())
while (!file.exists(file.path(.base, "data_analysis", "_paths.R")) &&
       dirname(.base) != .base) .base <- dirname(.base)
source(file.path(.base, "data_analysis", "_paths.R"))
repo    <- REPO_ROOT
out_dir <- file.path(repo, "data_analysis", "output")
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)

micro   <- function(...) file.path(repo, "data_analysis", "micro", "output", ...)
src_csv <- micro("age_diff_3lines.csv")
src_ts  <- micro("age_resid_timeseries.csv")
src_met <- micro("age_bands_cps_meta.json")

for (p in c(src_csv, src_ts, src_met))
  if (!file.exists(p))
    stop("Missing ", basename(p), ".\n",
         "Run: Rscript data_analysis/micro/07_age_bands_cps.R\n",
         "(needs the IPUMS CPS extract; see DATA_LOCAL.md)")

vintage <- format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")
cps_meta <- fromJSON(src_met, simplifyVector = TRUE)

d <- read.csv(src_csv, stringsAsFactors = FALSE)
stopifnot(all(c("center_age", "edu_group", "diff_avg", "diff_adj",
                "placebo_bias", "ratio_avg", "z_adj", "n_lf_month",
                "months") %in% names(d)))

months_window <- unique(d$months)[1]
group_levels  <- c("College+", "HS+ (no BA)")
stopifnot(setequal(unique(d$edu_group), group_levels))
d$edu_group <- factor(d$edu_group, levels = group_levels)

# ── Cross-section: one series per education group ────────────────────────────
# `adj` is the headline value (residual net of placebo bias); `raw` and `bias`
# are carried so the chart can show what the adjustment did, and `n` so cell
# size is visible in a tooltip.
series <- d %>%
  arrange(edu_group, center_age) %>%
  group_by(edu_group) %>%
  group_map(~ list(
    group  = as.character(.y$edu_group),
    points = pmap(
      list(.x$center_age, .x$diff_adj, .x$diff_avg, .x$placebo_bias,
           .x$ratio_avg, .x$z_adj, .x$n_lf_month, .x$age_min, .x$age_max),
      function(age, adj, raw, bias, ratio, z, n, lo, hi) list(
        age = age, adj = round(adj, 4), raw = round(raw, 4),
        bias = round(bias, 4), ratio = round(ratio, 3), z = round(z, 2),
        n = round(n), band = paste0(lo, "–", hi)
      )
    )
  ))

# ── Time paths for the pooled age ranges ────────────────────────────────────
ts <- read.csv(src_ts, stringsAsFactors = FALSE)
stopifnot(all(c("label", "date", "resid", "resid_adj", "actual", "pred") %in% names(ts)))

# Only the two series the time-path chart actually draws get a full monthly
# history; shipping all six tripled the size of the site payload for points
# nothing reads. Everything else needs only its latest month, which `latest`
# below provides.
TS_FULL <- c("College+ 22-27", "HS+ (no BA) 20-27")

timeseries <- ts %>%
  filter(label %in% TS_FULL) %>%
  arrange(label, date) %>%
  group_by(label) %>%
  group_map(~ list(
    label     = as.character(.y$label),
    edu_group = .x$edu_group[1],
    points    = map2(.x$date, .x$resid_adj,
                     ~ list(date = substr(.x, 1, 7), adj = round(.y, 4)))
  ))

# Latest month for every pooled band: the actual-versus-predicted chart.
latest <- ts %>%
  group_by(label) %>%
  slice_max(date, n = 1) %>%
  ungroup() %>%
  arrange(match(label, c("College+ 22-27", "College+ 28-34", "College+ 35-44",
                         "College+ 45-54", "HS+ (no BA) 20-27",
                         "HS+ (no BA) 35-54"))) %>%
  pmap(function(label, edu_group, age_min, age_max, date, actual, pred, resid,
                ratio, placebo_bias, resid_adj) list(
    label = label, edu_group = edu_group,
    age_min = age_min, age_max = age_max, date = substr(date, 1, 7),
    actual = round(actual, 4), pred = round(pred, 4),
    raw = round(resid, 4), bias = round(placebo_bias, 4),
    adj = round(resid_adj, 4), ratio = round(actual / pred, 3)
  ))

# ── Headline numbers ────────────────────────────────────────────────────────
# Deliberately NOT the maximum residual across bands. With ~87 bands, the
# argmax is the winner's curse: it lands on the smallest, noisiest cell, which
# is exactly how the old snapshot came to headline a +4.6 pp figure from a band
# reaching down to age 19. The headline is the pooled 22-27 graduate band, a
# pre-specified range with a real sample behind it.
latest_of <- function(lab) {
  r <- ts %>% filter(label == lab) %>% slice_max(date, n = 1)
  if (!nrow(r)) stop("No time series rows for ", lab)
  r
}
yg  <- latest_of("College+ 22-27")
pg  <- latest_of("College+ 45-54")
yng <- latest_of("HS+ (no BA) 20-27")

headline <- list(
  latest_month      = substr(yg$date, 1, 7),
  young_grad = list(
    label = "College+ 22-27", actual = round(yg$actual, 4),
    pred = round(yg$pred, 4), raw = round(yg$resid, 4),
    bias = round(yg$placebo_bias, 4), adj = round(yg$resid_adj, 4),
    ratio = round(yg$actual / yg$pred, 3)
  ),
  prime_grad = list(
    label = "College+ 45-54", adj = round(pg$resid_adj, 4),
    ratio = round(pg$actual / pg$pred, 3)
  ),
  young_nongrad = list(
    label = "HS+ (no BA) 20-27", adj = round(yng$resid_adj, 4),
    ratio = round(yng$actual / yng$pred, 3)
  )
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
  yng$resid_adj * 100, pg$resid_adj * 100
)

age_bands <- list(
  vintage = vintage,
  source = list(
    computed_by = "data_analysis/micro/07_age_bands_cps.R (IPUMS CPS microdata)",
    lineage = paste0(
      "Method descends from github.com/mtkonczal/",
      "Blog-Posts-Presentations-and-Testimony/blogs_2026/01_education_young_unrate. ",
      "No longer a downloaded snapshot; computed locally from the CPS extract."
    ),
    cps_range = paste(cps_meta$cps$first_month, "to", cps_meta$cps$last_month),
    cps_missing_months = cps_meta$missing_months$months,
    method = paste0(
      "actual minus predicted 12-month-MA unemployment rate, by education x ",
      "centered ", cps_meta$params$primary$band_width,
      "-yr age band; log-log fit trained through ", cps_meta$params$train_end_year,
      "; residual averaged over the latest ", months_window, " months; ",
      "placebo bias subtracted"
    )
  ),
  units = "rate proportion (multiply by 100 for percentage points)",
  value_definition = paste0(
    "adj = raw - bias. raw is the residual as originally specified; bias is what ",
    "the identical procedure reports for the same band when trained through 2014 ",
    "and measured over 2015-16, and through 2017 measured over 2018-19, averaged. ",
    "adj is the residual net of that. Quote adj."
  ),
  lag_note = cps_meta$reference_window$note,
  placebo = list(
    scenarios = cps_meta$placebo$scenarios,
    mean_bias_pp = cps_meta$placebo$mean_bias_pp,
    note = cps_meta$placebo$note
  ),
  diagnostics = list(
    extrapolation = cps_meta$extrapolation_check,
    sensitivity = cps_meta$sensitivity_agreement
  ),
  group_order = group_levels,
  band_width = cps_meta$params$primary$band_width,
  months_window = months_window,
  series = series,
  timeseries = timeseries,
  timeseries_full = TS_FULL,
  latest = latest,
  headline = headline,
  verdict = verdict
)

write_json(age_bands, file.path(out_dir, "age_bands.json"),
           auto_unbox = TRUE, pretty = TRUE, digits = 6)

cat("── Age bands ──\n")
cat(sprintf("  CPS %s; bands %d-yr; window %d mo\n",
            age_bands$source$cps_range, age_bands$band_width, months_window))
cat(sprintf("  groups: %s\n", paste(levels(d$edu_group), collapse = ", ")))
cat(sprintf("  young grads (22-27): actual %.2f%% vs predicted %.2f%% = %+.2f pp raw, %+.2f pp adjusted (x%.2f)\n",
            yg$actual * 100, yg$pred * 100, yg$resid * 100, yg$resid_adj * 100,
            yg$actual / yg$pred))
cat(sprintf("  prime grads (45-54):   %+.2f pp adjusted\n", pg$resid_adj * 100))
cat(sprintf("  young non-grads (20-27): %+.2f pp adjusted\n", yng$resid_adj * 100))
cat("── Verdict ──\n  ", verdict, "\n", sep = "")
cat("\nWrote ", file.path(out_dir, "age_bands.json"), "\n", sep = "")
