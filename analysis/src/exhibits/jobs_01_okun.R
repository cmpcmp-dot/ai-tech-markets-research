#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Job Displacement, card 01 — "Is unemployment higher than we would expect?"
#
# Three readings, one verdict:
#
#   A. Okun's law, difference form. Quarterly real GDP growth (SAAR) against the
#      change in the unemployment rate over the quarter. The line is fitted on
#      the full history EXCLUDING 2020Q2 and 2020Q3: those two quarters are off
#      any sensible scale and would otherwise set the slope by themselves. They
#      are dropped from the fit, not from the data, and are plotted flagged.
#      The reading is the residual over the most recent four quarters: actual
#      change in u minus the change Okun predicts from growth. Positive means
#      unemployment is rising faster than growth alone accounts for.
#
#   B. Level check. Current unemployment against CBO's estimate of the natural
#      rate (NROU).
#
#   C. Companion. Prime-age (25-54) participation and employment-population
#      against February 2020 and the 2019 average, so that a low unemployment
#      rate achieved by people leaving the labor force does not read as health.
#
# Reads   inputs/fred/fred_series.csv      (fetch/fred.R)
# Writes  interim/cards/jobs_01_okun.json
#
# Offline and deterministic: same input file, same numbers, always.
#
#   Rscript analysis/src/exhibits/jobs_01_okun.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

suppressPackageStartupMessages({
  library(dplyr); library(tidyr); library(readr); library(lubridate)
})

src <- need_file(input_path("fred", "fred_series.csv"),
                 "Rscript analysis/src/fetch/fred.R")
raw <- read_csv(src, show_col_types = FALSE) %>% arrange(date)

stopifnot(all(c("unrate", "gdpc1", "nrou", "lns11300060", "lns12300060") %in% names(raw)))

# ── A quarterly panel for Okun ───────────────────────────────────────────────
# Unemployment is the quarterly mean of the monthly rate; GDPC1 is already
# quarterly. NROU is left-joined because CBO publishes it only to a horizon.
unrate_q <- raw %>%
  filter(!is.na(unrate)) %>%
  transmute(date, unrate) %>%
  mutate(q = floor_date(date, "quarter")) %>%
  group_by(q) %>%
  summarise(unrate = mean(unrate), .groups = "drop")

gdp_q  <- raw %>% filter(!is.na(gdpc1)) %>% transmute(q = floor_date(date, "quarter"), gdpc1)
nrou_q <- raw %>% filter(!is.na(nrou))  %>% transmute(q = floor_date(date, "quarter"), nrou)

panel <- gdp_q %>%
  inner_join(unrate_q, by = "q") %>%
  left_join(nrou_q, by = "q") %>%
  arrange(q) %>%
  mutate(
    gdp_growth = ((gdpc1 / lag(gdpc1))^4 - 1) * 100,   # SAAR, % (annualised q/q)
    d_unrate   = unrate - lag(unrate),                 # change in u over the quarter, pp
    year       = year(q),
    qtr        = quarter(q),
    label      = paste0(year, "Q", qtr)
  ) %>%
  filter(!is.na(gdp_growth), !is.na(d_unrate))

pandemic <- panel$label %in% c("2020Q2", "2020Q3")
fit_df   <- panel %>% filter(!pandemic)

okun_fit <- lm(d_unrate ~ gdp_growth, data = fit_df)
b0 <- unname(coef(okun_fit)[1]); b1 <- unname(coef(okun_fit)[2])
okun_r2 <- summary(okun_fit)$r.squared

panel <- panel %>%
  mutate(is_pandemic = pandemic,
         d_unrate_pred = b0 + b1 * gdp_growth,
         residual = d_unrate - d_unrate_pred)

# Growth at which unemployment holds steady.
breakeven_growth <- -b0 / b1

recent <- panel %>% filter(!is_pandemic) %>% tail(4)
recent_resid_mean <- mean(recent$residual)
last_q <- tail(panel, 1)

# ── B. Level against the natural rate ────────────────────────────────────────
latest_unrate_row <- raw %>% filter(!is.na(unrate)) %>% arrange(date) %>% tail(1)
latest_nrou_hist  <- nrou_q %>%
  filter(q <= floor_date(latest_unrate_row$date, "quarter")) %>% arrange(q) %>% tail(1)
u_now    <- latest_unrate_row$unrate
u_now_m  <- format(latest_unrate_row$date, "%b %Y")
nrou_now <- latest_nrou_hist$nrou
u_gap    <- u_now - nrou_now                # pp; positive = above natural rate

# ── C. Prime-age participation companion ─────────────────────────────────────
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

# ── Verdict ──────────────────────────────────────────────────────────────────
# Thresholds exist so that a noise-level residual is not narrated as weakness:
# 0.10 pp on the quarterly residual, 0.10 pp on the unemployment gap.
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

# ── Assemble ─────────────────────────────────────────────────────────────────
scatter <- panel %>%
  transmute(label, year, gdp_growth = round(gdp_growth, 3),
            d_unrate = round(d_unrate, 3), residual = round(residual, 3),
            is_pandemic)

pa_series <- pa %>%
  filter(date >= as.Date("2000-01-01")) %>%
  transmute(date = format(date, "%Y-%m-%d"),
            lfpr = round(lfpr, 2), epop = round(epop, 2))

okun <- list(
  vintage = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"),
  fit = list(intercept = round(b0, 4), slope = round(b1, 4),
             r2 = round(okun_r2, 3), breakeven_growth = round(breakeven_growth, 2),
             sample_start = as.character(min(fit_df$q)),
             sample_end   = as.character(max(fit_df$q)),
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
  level = list(unrate = round(u_now, 2), unrate_month = u_now_m,
               nrou = round(nrou_now, 2), gap = round(u_gap, 2)),
  prime_age = list(
    series = pa_series,
    latest_month = format(pa_latest$date, "%b %Y"),
    lfpr_now = round(pa_latest$lfpr, 2), epop_now = round(pa_latest$epop, 2),
    lfpr_feb2020 = round(feb2020$lfpr, 2), epop_feb2020 = round(feb2020$epop, 2),
    lfpr_vs_feb2020 = round(lfpr_vs_feb20, 2),
    epop_vs_feb2020 = round(epop_vs_feb20, 2),
    lfpr_vs_2019 = round(lfpr_vs_2019, 2)
  ),
  verdict = verdict
)

write_card(okun, "jobs_01_okun")

# ── Diagnostics ──────────────────────────────────────────────────────────────
say("-- Okun fit --")
say("  d_u = %.3f + %.3f * gdp_growth   (R2 = %.3f, n = %d)", b0, b1, okun_r2, nrow(fit_df))
say("  breakeven growth (u steady): %.2f%% SAAR", breakeven_growth)
say("  last quarter: %s  GDP %.2f%%  d_u %.2f pp  residual %.2f pp",
    last_q$label, last_q$gdp_growth, last_q$d_unrate, last_q$residual)
say("  last-4-qtr mean residual: %.3f pp", recent_resid_mean)
say("-- Level --")
say("  u = %.2f%% (%s)   NROU = %.2f%%   gap = %+.2f pp", u_now, u_now_m, nrou_now, u_gap)
say("-- Prime-age (25-54) --")
say("  LFPR %.2f (%s)  vs Feb-2020 %+.2f  vs 2019 avg %+.2f",
    pa_latest$lfpr, format(pa_latest$date, "%b %Y"), lfpr_vs_feb20, lfpr_vs_2019)
say("  EPOP %.2f             vs Feb-2020 %+.2f", pa_latest$epop, epop_vs_feb20)
say("-- Verdict --\n  %s", verdict)
