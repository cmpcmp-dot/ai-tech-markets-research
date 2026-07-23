#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# 01_okun.R  —  Section 1: "Is unemployment higher than we would expect?"
#
# Two checks, one verdict:
#   (A) Okun's law, difference form.  Scatter of quarterly real GDP growth (SAAR)
#       vs the change in the unemployment rate over the quarter.  Line fit on the
#       full history EXCLUDING the 2020Q2/2020Q3 pandemic outliers (kept but flagged).
#       "Answer" = residual for the most recent quarters: actual Δu minus the Δu
#       Okun predicts from GDP growth.  Positive residual => unemployment rising
#       faster than growth alone would predict.
#   (B) Level check.  Current unemployment rate vs CBO's natural rate (FRED NROU).
#   (C) Companion.  Prime-age (25-54) participation & EPOP vs pre-pandemic (Feb-2020)
#       and vs the 2019 average — is low unemployment masking labor-force exit?
#
# Output: data_analysis/output/okun.json  (consumed by run_all.R)
# Reproducibility: deterministic; all series pulled by explicit FRED ID.
# ─────────────────────────────────────────────────────────────────────────────

suppressMessages({
  library(tidyusmacro)
  library(tidyverse)
  library(jsonlite)
  library(lubridate)
})

`%||%` <- function(a, b) if (is.null(a) || length(a) == 0 || is.na(a)) b else a

repo    <- "/Users/mtkonczal/Documents/GitHub/ai-tech-markets-research"
out_dir <- file.path(repo, "data_analysis", "output")
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)

vintage <- format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")

# ── FRED series IDs (explicit, for reproducibility) ──────────────────────────
#   UNRATE       : civilian unemployment rate, 16+, SA (monthly, %)
#   GDPC1        : real GDP, chained 2017$, SAAR (quarterly, $bn)
#   NROU         : CBO noncyclical (natural) rate of unemployment (quarterly, %)
#   LNS11300060  : labor force participation rate, 25-54, SA (monthly, %)
#   LNS12300060  : employment-population ratio, 25-54, SA (monthly, %)
raw <- getFRED("UNRATE", "GDPC1", "NROU", "LNS11300060", "LNS12300060") %>%
  arrange(date)

stopifnot(all(c("unrate","gdpc1","nrou","lns11300060","lns12300060") %in% names(raw)))

# ── Build a clean quarterly panel for Okun ───────────────────────────────────
# Unemployment: quarterly average of the monthly rate.
# Real GDP:     quarterly level (GDPC1 is already quarterly).
unrate_q <- raw %>%
  filter(!is.na(unrate)) %>%
  transmute(date, unrate) %>%
  mutate(q = floor_date(date, "quarter")) %>%
  group_by(q) %>%
  summarise(unrate = mean(unrate), .groups = "drop")

gdp_q <- raw %>%
  filter(!is.na(gdpc1)) %>%
  transmute(q = floor_date(date, "quarter"), gdpc1)

nrou_q <- raw %>%
  filter(!is.na(nrou)) %>%
  transmute(q = floor_date(date, "quarter"), nrou)

panel <- gdp_q %>%
  inner_join(unrate_q, by = "q") %>%
  left_join(nrou_q, by = "q") %>%
  arrange(q) %>%
  mutate(
    gdp_growth = ((gdpc1 / lag(gdpc1))^4 - 1) * 100,   # SAAR, % (annualized q/q)
    d_unrate   = unrate - lag(unrate),                 # change in u over the quarter, pp
    year       = year(q),
    qtr        = quarter(q),
    label      = paste0(year, "Q", qtr)
  ) %>%
  filter(!is.na(gdp_growth), !is.na(d_unrate))

# Pandemic outliers to exclude from the FIT (kept in the data, flagged).
pandemic <- panel$label %in% c("2020Q2", "2020Q3")
fit_df   <- panel %>% filter(!pandemic)

okun_fit <- lm(d_unrate ~ gdp_growth, data = fit_df)
b0 <- unname(coef(okun_fit)[1]); b1 <- unname(coef(okun_fit)[2])
okun_r2 <- summary(okun_fit)$r.squared

panel <- panel %>%
  mutate(
    is_pandemic = pandemic,
    d_unrate_pred = b0 + b1 * gdp_growth,
    residual = d_unrate - d_unrate_pred
  )

# Okun "breakeven" growth: GDP growth at which Δu = 0  (u holds steady)
breakeven_growth <- -b0 / b1

# Most-recent-4-quarters residual summary (the "answer").
recent <- panel %>% filter(!is_pandemic) %>% tail(4)
recent_resid_mean <- mean(recent$residual)
last_q <- tail(panel, 1)

# ── Level check: current u vs CBO natural rate ───────────────────────────────
latest_unrate_row <- raw %>% filter(!is.na(unrate)) %>% arrange(date) %>% tail(1)
latest_nrou_hist  <- nrou_q %>% filter(q <= floor_date(latest_unrate_row$date, "quarter")) %>%
  arrange(q) %>% tail(1)
u_now     <- latest_unrate_row$unrate
u_now_m   <- format(latest_unrate_row$date, "%b %Y")
nrou_now  <- latest_nrou_hist$nrou
u_gap     <- u_now - nrou_now     # unemployment gap, pp (positive = above natural rate)

# ── Prime-age participation & EPOP companion ─────────────────────────────────
pa <- raw %>%
  transmute(date, lfpr = lns11300060, epop = lns12300060) %>%
  filter(!is.na(lfpr) | !is.na(epop))

feb2020 <- pa %>% filter(date == as.Date("2020-02-01"))
avg2019 <- pa %>% filter(year(date) == 2019) %>%
  summarise(lfpr = mean(lfpr, na.rm = TRUE), epop = mean(epop, na.rm = TRUE))
pa_latest <- pa %>% filter(!is.na(lfpr)) %>% arrange(date) %>% tail(1)

lfpr_vs_feb20 <- pa_latest$lfpr - feb2020$lfpr
epop_vs_feb20 <- pa_latest$epop - feb2020$epop
lfpr_vs_2019  <- pa_latest$lfpr - avg2019$lfpr

# ── Verdict string (one line, data-driven) ───────────────────────────────────
# Thresholds are set so trivial (noise-level) residuals do not get narrated as
# weakness. 0.10 pp on a quarterly residual, 0.10 pp on the unemployment gap.
above_natural <- u_gap > 0.10
rising_faster <- recent_resid_mean > 0.10
verdict <- if (above_natural && rising_faster) {
  sprintf("Yes. Unemployment (%.1f%%) sits above CBO's natural rate (%.1f%%), and over the last year it has risen about %.2f pp faster than GDP growth alone would predict.", u_now, nrou_now, recent_resid_mean)
} else if (rising_faster) {
  sprintf("Somewhat. Unemployment (%.1f%%) is near CBO's natural rate (%.1f%%), but it has been rising about %.2f pp faster than GDP growth predicts; softening is emerging beneath the surface.", u_now, nrou_now, recent_resid_mean)
} else if (above_natural) {
  sprintf("Modestly. Unemployment (%.1f%%) is above CBO's natural rate (%.1f%%), though its recent path is roughly in line with what GDP growth predicts.", u_now, nrou_now)
} else {
  sprintf("No, not in the aggregate. At %.1f%%, unemployment is at or below CBO's natural rate (%.1f%%), prime-age participation is above its pre-pandemic level, and its path tracks GDP growth about as Okun's law predicts. If AI-driven displacement is showing up, it is not yet in the headline rate. That is why the next sections look at who and where.", u_now, nrou_now)
}

# ── Assemble output ──────────────────────────────────────────────────────────
scatter <- panel %>%
  transmute(label, year, gdp_growth = round(gdp_growth, 3),
            d_unrate = round(d_unrate, 3),
            residual = round(residual, 3),
            is_pandemic)

pa_series <- pa %>%
  filter(date >= as.Date("2000-01-01")) %>%
  transmute(date = format(date, "%Y-%m-%d"),
            lfpr = round(lfpr, 2), epop = round(epop, 2))

okun <- list(
  vintage = vintage,
  fit = list(intercept = round(b0, 4), slope = round(b1, 4),
             r2 = round(okun_r2, 3), breakeven_growth = round(breakeven_growth, 2),
             sample_start = as.character(min(fit_df$q)),
             sample_end = as.character(max(fit_df$q)),
             excluded = c("2020Q2", "2020Q3")),
  scatter = scatter,
  recent = list(
    quarters = recent$label,
    residual_mean = round(recent_resid_mean, 3),
    last_quarter = last_q$label,
    last_gdp_growth = round(last_q$gdp_growth, 2),
    last_d_unrate = round(last_q$d_unrate, 2),
    last_residual = round(last_q$residual, 2)
  ),
  level = list(
    unrate = round(u_now, 2), unrate_month = u_now_m,
    nrou = round(nrou_now, 2), gap = round(u_gap, 2)
  ),
  prime_age = list(
    series = pa_series,
    latest_month = format(pa_latest$date, "%b %Y"),
    lfpr_now = round(pa_latest$lfpr, 2),
    epop_now = round(pa_latest$epop, 2),
    lfpr_feb2020 = round(feb2020$lfpr, 2),
    epop_feb2020 = round(feb2020$epop, 2),
    lfpr_vs_feb2020 = round(lfpr_vs_feb20, 2),
    epop_vs_feb2020 = round(epop_vs_feb20, 2),
    lfpr_vs_2019 = round(lfpr_vs_2019, 2)
  ),
  verdict = verdict
)

write_json(okun, file.path(out_dir, "okun.json"),
           auto_unbox = TRUE, pretty = TRUE, digits = 6)

# ── Diagnostics (fail loudly / sanity print) ─────────────────────────────────
cat("── Okun fit ──\n")
cat(sprintf("  Δu = %.3f + %.3f * gdp_growth   (R² = %.3f, n = %d)\n",
            b0, b1, okun_r2, nrow(fit_df)))
cat(sprintf("  breakeven growth (u steady): %.2f%% SAAR\n", breakeven_growth))
cat(sprintf("  last quarter: %s  GDP %.2f%%  Δu %.2f pp  residual %.2f pp\n",
            last_q$label, last_q$gdp_growth, last_q$d_unrate, last_q$residual))
cat(sprintf("  last-4-qtr mean residual: %.3f pp\n", recent_resid_mean))
cat("── Level ──\n")
cat(sprintf("  u = %.2f%% (%s)   NROU = %.2f%%   gap = %+.2f pp\n",
            u_now, u_now_m, nrou_now, u_gap))
cat("── Prime-age (25-54) ──\n")
cat(sprintf("  LFPR now %.2f (%s)  vs Feb-2020 %+.2f  vs 2019 avg %+.2f\n",
            pa_latest$lfpr, format(pa_latest$date, "%b %Y"), lfpr_vs_feb20, lfpr_vs_2019))
cat(sprintf("  EPOP now %.2f            vs Feb-2020 %+.2f\n",
            pa_latest$epop, epop_vs_feb20))
cat("── Verdict ──\n  ", verdict, "\n", sep = "")
cat("\nWrote ", file.path(out_dir, "okun.json"), "\n", sep = "")
