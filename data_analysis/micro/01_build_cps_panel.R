#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# micro/01_build_cps_panel.R — CPS microdata → occupation × quarter panel.
#
# A faithful port of sections 1–8 of the Budget Lab at Yale's `sdid.R`
# (github.com/Budget-Lab-Yale/AI-Effects @ 4898eb3), so that 02 can reproduce
# their SDID on a sample-identical panel. Departures are marked "DEPARTURE".
#
# Reads:   data/cps.dat.gz + data/cps.xml   (IPUMS extract from 99.download_IPUMS_data.py)
#          data/cpi_monthly.csv             (from 00_pull_cpi.R)
# Writes:  micro/output/cps_occ_quarter_panel.rds   Yale-faithful, ages 16+
#          micro/output/cps_occ_quarter_age.rds     the same outcomes by age band
#          micro/output/cps_occ_ind_weights.rds     OCC2010 x IND employment, 2018-19
#          micro/output/cps_telework_occ.rds        occupation telework share by quarter
#          micro/output/cps_panel_meta.json
#
# ── Why this is chunked ──────────────────────────────────────────────────────
# The extract is 257 monthly samples, roughly 40M person-records × 36 variables.
# Read whole, that is ~11 GB before any work happens, on a 16 GB machine. So the
# file is streamed in chunks and each chunk is reduced immediately.
#
# The awkward part is that three of Yale's steps are group operations that span
# chunks, and they run in a specific order:
#   1. dynamic EARNWEEK2 topcode, by (year, month)
#   2. NA out topcoded salaried wages
#   3. 1/99 winsorization of the hourly wage, weighted, by (year, quarter),
#      computed on the MIS 4/8 earner population
# Each is computed on the age-filtered but NOT occupation-filtered sample, so
# the pass accumulates exactly the statistics those steps need — per (year,
# month) maxima, and the MIS 4/8 wage observations — alongside the slim person
# rows, and applies them afterwards in Yale's order. The result is identical to
# doing it in memory; it just fits.
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(ipumsr); library(data.table); library(Hmisc); library(jsonlite)
})

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
here  <- function(...) file.path(repo, "micro", ...)
out   <- function(...) here("output", ...)
dir.create(out(), showWarnings = FALSE, recursive = TRUE)

say    <- function(...) cat(sprintf(...), "\n", sep = "")
assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)
setDTthreads(0L)

# ── Parameters (Yale's main.R) ───────────────────────────────────────────────
MIN_AGE       <- 16L
OBS_THRESHOLD <- 50L      # min average quarterly observations to keep an occupation
DROP_YEAR     <- 2020L    # Yale drop 2020 as uninformative about post-AI trends
CHUNK         <- 1e6L

# DEPARTURE: age bands are ours, not Yale's. Their design pools 16+; the whole
# point of T2 is to run it where Tucker looks. 22-27 is the recent-graduate cut
# Yale reported they could not run because too few occupations cleared the
# 50-observation screen. Whether we can is an empirical question, answered below.
AGE_BANDS <- list(
  "16-24" = c(16, 24), "22-27" = c(22, 27), "25-34" = c(25, 34),
  "35-54" = c(35, 54), "55+"   = c(55, Inf)
)

ddi_path <- file.path(repo, "data", "cps.xml")
dat_path <- file.path(repo, "data", "cps.dat.gz")
cpi_path <- file.path(repo, "data", "cpi_monthly.csv")
for (p in c(ddi_path, dat_path, cpi_path))
  assert(file.exists(p), "Missing %s", p)

ddi <- read_ipums_ddi(ddi_path)

# ── The chunk reducer ────────────────────────────────────────────────────────
acc_pop  <- list()   # population denominator: sum(wtfinl) by year-quarter
acc_tc   <- list()   # topcode inputs: earnweek2 maxima by year-month
acc_wage <- list()   # MIS 4/8 wage observations, for the winsorization bounds
acc_keep <- list()   # slim person rows for the collapse
acc_ind  <- list()   # OCC2010 x IND x year employment, 2015+
acc_tw   <- list()   # telework, Oct 2022+
n_read   <- 0L
i_chunk  <- 0L

reduce_chunk <- function(x, pos) {
  i_chunk <<- i_chunk + 1L
  n_read  <<- n_read + nrow(x)

  d <- as.data.table(lapply(x, function(v) { attributes(v) <- NULL; v }))
  setnames(d, tolower(names(d)))

  # § Yale 2. CLEAN — age filter first; every later group statistic is computed
  # on the age-filtered sample.
  d <- d[age >= MIN_AGE]
  if (!nrow(d)) return(NULL)

  d[, `:=`(
    employed   = as.integer(empstat %in% c(10L, 12L)),
    unemployed = as.integer(empstat %in% c(20L, 21L, 22L)),
    in_lf      = as.integer(labforce == 2L),
    quarter    = as.integer((month - 1L) %/% 3L + 1L)
  )]

  # Population denominator: everyone in universe, i.e. empstat != 1 (NIU).
  acc_pop[[i_chunk]] <<- d[empstat != 1L, .(pop = sum(wtfinl)), by = .(year, quarter)]

  # Hourly wage, before the topcode filter and before winsorization.
  d[, hrly_wage_raw := fcase(
    paidhour == 2L & hourwage2 > 0 & hourwage2 < 999,                 as.numeric(hourwage2),
    paidhour == 1L & earnweek2 > 0 & uhrswork1 > 0 & uhrswork1 < 997, earnweek2 / uhrswork1,
    default = NA_real_)]

  # Inputs to the dynamic topcode. Yale use a fixed value before 2023-04, the
  # MIS-4 maximum to 2024-04, and the all-rotation maximum after; all three are
  # resolved after the pass, so both maxima are carried here.
  acc_tc[[i_chunk]] <<- d[earnweek2 > 0 & earnweek2 < 999999.99,
    .(max_all  = max(earnweek2),
      max_mis4 = suppressWarnings(max(earnweek2[mish == 4L]))), by = .(year, month)]

  # The winsorization bounds are computed on the MIS 4/8 earner population,
  # weighted by earnwt, over the age-filtered sample — before the occupation
  # filter, so these rows are kept regardless of occupation.
  acc_wage[[i_chunk]] <<- d[mish %in% c(4L, 8L) & !is.na(hrly_wage_raw),
    .(year, month, quarter, mish, paidhour, earnweek2, hrly_wage_raw, earnwt)]

  # § Yale 3. RESTRICT TO VALID OCCUPATIONS (9999 = NIU is excluded by < 9800).
  k <- d[occ2010 != 0L & occ2010 < 9800L & year != DROP_YEAR]

  # DEPARTURE: OCC2010 x IND employment for the exposure asset's industry
  # weights. Kept BY YEAR rather than pre-pooled, because CPS `IND` carries the
  # contemporaneous Census industry vintage — 2018-19 sits on the 2012 scheme
  # and 2020+ on the 2017 scheme. Pooling across that break would silently mix
  # two code systems. exposure/02 picks the window.
  if (nrow(k)) {
    acc_ind[[i_chunk]] <<- k[employed == 1L & year >= 2015L & ind > 0,
                             .(emp = sum(wtfinl), n = .N), by = .(occ2010, ind, year)]
    # DEPARTURE: realized telework, for T5. Asked from October 2022.
    acc_tw[[i_chunk]] <<- k[employed == 1L & !is.na(telwrkpay) & telwrkpay %in% c(0L, 1L, 2L),
                            .(tw_num = sum(wtfinl * (telwrkpay == 2L)), tw_den = sum(wtfinl)),
                            by = .(occ2010, year, quarter)]
    acc_keep[[i_chunk]] <<- k[, .(
      occ2010, year, month, quarter, mish, sex, race, educ, wtfinl, earnwt,
      empstat, employed, unemployed, in_lf, age,
      durunemp, whyunemp, empsame, uhrswork1, paidhour, earnweek2, hrly_wage_raw)]
  }

  if (i_chunk %% 10L == 0L)
    say("  chunk %3d | %s rows read | %s kept",
        i_chunk, format(n_read, big.mark = ","),
        format(sum(vapply(acc_keep, nrow, 1L)), big.mark = ","))
  NULL
}

say("Streaming %s in chunks of %s...", basename(dat_path), format(CHUNK, big.mark = ","))
t0 <- Sys.time()
read_ipums_micro_chunked(ddi, data_file = dat_path, verbose = FALSE,
                         chunk_size = CHUNK, callback = IpumsSideEffectCallback$new(reduce_chunk))
say("  done: %s rows in %.1f min", format(n_read, big.mark = ","),
    as.numeric(difftime(Sys.time(), t0, units = "mins")))

pop  <- rbindlist(acc_pop)[, .(pop = sum(pop)), by = .(year, quarter)]
tc   <- rbindlist(acc_tc)[, .(max_all = max(max_all, na.rm = TRUE),
                              max_mis4 = max(max_mis4, na.rm = TRUE)), by = .(year, month)]
wg   <- rbindlist(acc_wage)
dt   <- rbindlist(acc_keep)
rm(acc_pop, acc_tc, acc_wage, acc_keep); invisible(gc())
say("Accumulated: %s panel rows, %s wage rows, %d year-months",
    format(nrow(dt), big.mark = ","), format(nrow(wg), big.mark = ","), nrow(tc))

# Yale drop 2020 from the population denominator too.
pop <- pop[year != DROP_YEAR]

# ── § Yale 2 (cont.). Topcode, then winsorize — in that order ────────────────
tc[, date := as.Date(sprintf("%d-%02d-01", year, month))]
tc[, topcode := fcase(
  date <  as.Date("2023-04-01"), 2884.61,
  date <  as.Date("2024-04-01"), as.numeric(max_mis4),
  default = as.numeric(max_all))]

apply_topcode <- function(x) {
  x <- merge(x, tc[, .(year, month, topcode)], by = c("year", "month"), all.x = TRUE)
  x[paidhour == 1L & earnweek2 >= topcode, hrly_wage_raw := NA_real_]
  x[, topcode := NULL][]
}
wg <- apply_topcode(wg)
dt <- apply_topcode(dt)

# 1/99 weighted winsorization, by year-quarter, bounds from the MIS 4/8 population.
bounds <- wg[!is.na(hrly_wage_raw), {
  q <- Hmisc::wtd.quantile(hrly_wage_raw, weights = earnwt, probs = c(.01, .99), na.rm = TRUE)
  .(p01 = q[[1]], p99 = q[[2]])
}, by = .(year, quarter)]
dt <- merge(dt, bounds, by = c("year", "quarter"), all.x = TRUE)
dt[, hrly_wage := pmax(p01, pmin(p99, hrly_wage_raw))][, c("p01", "p99") := NULL]

# Recodes Yale apply inside the same mutate.
dt[, `:=`(
  female    = as.integer(sex == 2L),
  educ_ba   = as.integer(educ >= 111L),
  not_white = as.integer(race != 100L),
  same_emp  = fcase(empsame == 2L, 1L, empsame == 1L, 0L, default = NA_integer_),
  durunemp  = fifelse(unemployed == 1L & durunemp > 0 & durunemp < 999,
                      as.numeric(durunemp), NA_real_)
)]

# ── § Yale 5. COLLAPSE TO OCCUPATION × QUARTER ───────────────────────────────
cpi <- fread(cpi_path)
cpi <- cpi[, .(cpi = mean(cpi, na.rm = TRUE), cpi_base = first(cpi_base)),
           by = .(year, quarter = (month - 1L) %/% 3L + 1L)]

collapse_panel <- function(d, label) {
  emp <- d[, .(emp_wt   = sum(employed   * wtfinl),
               unemp_wt = sum(unemployed * wtfinl),
               lf_wt    = sum(in_lf      * wtfinl)), by = .(occ2010, year, quarter)]
  emp <- merge(emp, pop, by = c("year", "quarter"))
  emp[, `:=`(emp_share = 100 * emp_wt / pop,
             lf_share  = 100 * lf_wt  / pop,
             urate     = unemp_wt / lf_wt)]

  une <- d[unemployed == 1L & whyunemp >= 1L & whyunemp <= 5L,
           .(mean_durunemp = weighted.mean(durunemp, wtfinl, na.rm = TRUE)),
           by = .(occ2010, year, quarter)]

  sam <- d[employed == 1L & mish %in% c(2:4, 6:8) & !is.na(same_emp),
           .(same_emp_share = weighted.mean(same_emp, wtfinl)),
           by = .(occ2010, year, quarter)]

  ern <- d[employed == 1L & mish %in% c(4L, 8L) & !is.na(earnwt), {
    ok <- uhrswork1 > 0 & uhrswork1 < 997
    .(mean_hours = if (any(ok)) Hmisc::wtd.mean(uhrswork1[ok], weights = earnwt[ok], na.rm = TRUE) else NA_real_,
      med_hrly_wage = tryCatch(
        as.numeric(Hmisc::wtd.quantile(hrly_wage, weights = earnwt, probs = .5, na.rm = TRUE)),
        error = function(e) NA_real_))
  }, by = .(occ2010, year, quarter)]
  ern <- merge(ern, cpi, by = c("year", "quarter"), all.x = TRUE)
  ern[, log_real_hrly_wage := log(med_hrly_wage / cpi * cpi_base)]
  ern[, c("cpi", "cpi_base", "med_hrly_wage") := NULL]

  dem <- d[, .(female = sum(female * wtfinl) / sum(wtfinl),
               educ   = sum(educ_ba * wtfinl) / sum(wtfinl),
               not_white = sum(not_white * wtfinl) / sum(wtfinl)),
           by = .(occ2010, year, quarter)]

  p <- Reduce(function(a, b) merge(a, b, by = c("occ2010", "year", "quarter"), all.x = TRUE),
              list(emp, une, sam, ern, dem))
  p[, band := label][]
}

# ── § Yale 6-7. Drop thin occupations, then balance ──────────────────────────
screen_and_balance <- function(p, d, label) {
  obs <- d[employed == 1L | unemployed == 1L, .N, by = .(occ2010, year, quarter)
           ][, .(avg_q = mean(N)), by = occ2010]
  thin <- obs[avg_q < OBS_THRESHOLD, occ2010]
  say("  [%s] dropping %d of %d occupations below %d avg quarterly obs",
      label, length(thin), nrow(obs), OBS_THRESHOLD)
  p <- p[!occ2010 %in% thin]
  if (!nrow(p)) { say("  [%s] EMPTY after the thinness screen", label); return(p) }

  maxq <- p[, .N, by = occ2010][, max(N)]
  keep <- p[, .N, by = occ2010][N == maxq, occ2010]
  say("  [%s] balancing: %d quarters, %d of %d occupations retained",
      label, maxq, length(keep), p[, uniqueN(occ2010)])
  p[occ2010 %in% keep][order(occ2010, year, quarter)]
}

# ── § Yale 8a. Seasonal adjustment ───────────────────────────────────────────
# Per occupation, regress each outcome on quarter dummies (Q1 = base) and take
# residuals + the Q1 INTERCEPT. Anchoring on the intercept rather than the mean
# is Yale's choice and it matters: it pins the level to Q1 instead of to the
# annual average. Occupations with fewer than 5 usable observations are left
# unadjusted.
#
# Note the order on unemployment: Yale build `logurate = log(urate + 0.0005)`
# and seasonally adjust THAT. Adjusting the rate and logging afterwards is not
# the same transformation, and about 8% of occupation-quarters have zero
# measured unemployment, which is what the 0.0005 is for.
SA_VARS <- c("emp_share", "lf_share", "logurate", "same_emp_share",
             "mean_hours", "log_real_hrly_wage")
seasonally_adjust <- function(p) {
  p[, logurate := log(urate + 0.0005)]
  for (v in SA_VARS) {
    sav <- paste0(v, "_sa")
    p[, (sav) := {
      y <- get(v)
      ok <- which(!is.na(y))
      z  <- rep(NA_real_, .N)
      if (length(ok) >= 5L && uniqueN(quarter[ok]) >= 2L) {
        fit <- stats::lm(y[ok] ~ factor(quarter[ok]))
        z[ok] <- stats::residuals(fit) + stats::coef(fit)[["(Intercept)"]]
      }
      z
    }, by = occ2010]
  }
  p[]
}

say("Collapsing (all ages %d+)...", MIN_AGE)
panel <- screen_and_balance(collapse_panel(dt, "all"), dt, "all")
panel <- seasonally_adjust(panel)
saveRDS(panel, out("cps_occ_quarter_panel.rds"), compress = "xz")

say("Collapsing by age band...")
band_rows <- list()
band_diag <- list()
for (nm in names(AGE_BANDS)) {
  rng <- AGE_BANDS[[nm]]
  sub <- dt[age >= rng[1] & age <= rng[2]]
  p   <- screen_and_balance(collapse_panel(sub, nm), sub, nm)
  band_diag[[nm]] <- list(band = nm, n_occ = if (nrow(p)) p[, uniqueN(occ2010)] else 0L,
                          n_rows = nrow(p))
  if (nrow(p)) band_rows[[nm]] <- seasonally_adjust(p)
}
panel_age <- rbindlist(band_rows, fill = TRUE)
saveRDS(panel_age, out("cps_occ_quarter_age.rds"), compress = "xz")

# ── Side outputs ─────────────────────────────────────────────────────────────
ind_w <- rbindlist(acc_ind)[, .(emp = sum(emp), n = sum(n)), by = .(occ2010, ind, year)]
saveRDS(ind_w, out("cps_occ_ind_weights.rds"), compress = "xz")

tw <- rbindlist(acc_tw)[, .(tw_num = sum(tw_num), tw_den = sum(tw_den)),
                        by = .(occ2010, year, quarter)]
tw[, telework_share := tw_num / tw_den]
saveRDS(tw, out("cps_telework_occ.rds"), compress = "xz")

# ── Assertions ───────────────────────────────────────────────────────────────
say("Assertions...")
assert(nrow(panel) > 0, "The main panel is empty.")
assert(panel[, uniqueN(occ2010)] > 200, "Only %d occupations in the main panel.",
       panel[, uniqueN(occ2010)])
assert(!any(panel$year == DROP_YEAR), "%d was not dropped.", DROP_YEAR)
assert(panel[, all(emp_share >= 0 & emp_share <= 100, na.rm = TRUE)],
       "Employment shares outside [0, 100].")
assert(panel[, all(urate >= 0 & urate <= 1, na.rm = TRUE)], "Unemployment rates outside [0, 1].")
assert(nrow(panel) == uniqueN(panel[, .(occ2010, year, quarter)]),
       "The main panel has duplicate occupation-quarter rows.")
# Employment shares should sum to roughly the employment-to-population ratio.
tot <- panel[, .(s = sum(emp_share)), by = .(year, quarter)]
assert(tot[, all(s > 35 & s < 70)],
       "Summed employment share is outside 35-70%% in some quarter (min %.1f, max %.1f).",
       tot[, min(s)], tot[, max(s)])
say("  summed employment share: %.1f%% to %.1f%% of population across quarters",
    tot[, min(s)], tot[, max(s)])
say("  all passed")

write_json(list(
  built_at      = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  source        = "IPUMS CPS basic monthly, extract in data/cps.xml",
  person_records_read = n_read,
  min_age       = MIN_AGE,
  dropped_year  = DROP_YEAR,
  obs_threshold = OBS_THRESHOLD,
  quarters      = panel[, uniqueN(paste(year, quarter))],
  first_quarter = panel[, sprintf("%dQ%d", min(year), quarter[which.min(year * 10 + quarter)])],
  last_quarter  = panel[, sprintf("%dQ%d", max(year), quarter[which.max(year * 10 + quarter)])],
  n_occupations = panel[, uniqueN(occ2010)],
  age_bands     = unname(band_diag),
  cpi_note      = "October 2025 CPI was never published; 2025Q4 is deflated on Nov-Dec only",
  telework_note = "TELWRKPAY is asked from October 2022, so telework is post-treatment by construction"
), out("cps_panel_meta.json"), auto_unbox = TRUE, pretty = TRUE)

say("")
say("Wrote:")
for (f in c("cps_occ_quarter_panel.rds", "cps_occ_quarter_age.rds",
            "cps_occ_ind_weights.rds", "cps_telework_occ.rds", "cps_panel_meta.json"))
  say("  %-30s %s", f, format(structure(file.info(out(f))$size, class = "object_size"),
                              units = "auto"))
