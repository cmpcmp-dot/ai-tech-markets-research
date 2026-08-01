#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# clean/qwi.R — 103 per-state LEHD bulk files into one national NAICS3 x age x
# quarter panel of employment and worker flows, validated against the published
# national aggregate. Offline, deterministic, and it asserts loudly.
#
# ── Two decisions that matter, and they are the reason this file exists ──────
#
# 1. STATUS FLAGS. LEHD ships a flag per measure (src/lookups/qwi_labels/
#    label_flags.csv):
#      -2 no data in this category   -1 not computable    1 OK
#       5 suppressed                  6 derived, clean    7 derived, some distorted
#       9 distorted, fuzzed value released
#      10 aggregate, clean           11 aggregate, withheld
#      12 aggregate, some distorted
#    A value is used when its flag is in {1, 6, 7, 9, 10, 12} and set missing
#    otherwise. Flags {7, 9, 12} mean the number was released but is noisy, so
#    they are USED and carried as a `distorted` share rather than dropped:
#    dropping them would bias against exactly the small, fast-moving cells this
#    analysis is about.
#
# 2. BALANCED STATE SETS. Naively summing states produces a national series with
#    spurious jumps, because a state whose cell is suppressed in 2019 and
#    released in 2024 adds a level shift that reads as growth. So for each
#    (industry x agegrp x measure) only states reporting the cell in EVERY
#    quarter of the window are kept, and the resulting coverage against the true
#    national total is published. A consistent aggregate of 43 states beats an
#    inconsistent aggregate of 51.
#
# Reads   inputs/qwi/raw/*.csv.gz     (fetch/qwi.R)
# Writes  interim/qwi/qwi_us_sector.rds           published national, sector level
#         interim/qwi/qwi_state_naics3_slim.rds   the slim state panel, kept on disk
#         interim/qwi/qwi_naics3_age_quarter.rds  the analysis frame
#         interim/qwi/qwi_coverage.csv            per cell: states in, share of national
#         interim/qwi/qwi_meta.json               vintage, latest quarter, assertions
#
#   Rscript analysis/src/clean/qwi.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressPackageStartupMessages({ library(data.table); library(jsonlite) })

assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)
setDTthreads(0L)

out_dir <- ensure_dir(interim_path("qwi"))
raw_dir <- input_path("qwi", "raw")
how     <- "Rscript analysis/src/fetch/qwi.R  (~940 MB, 103 files)"

# ── Parameters ───────────────────────────────────────────────────────────────
MIN_YEAR   <- 2005L   # long enough to carry a Great Recession cyclicality control
COV_FLOOR  <- 0.60    # an industry cell needs 60% of national employment to be usable
SECTOR_TOL <- 0.02    # state-sum against published national, sector level: 2% max gap
LAG_TOL    <- 4L      # a state more than 4 quarters behind the pack is excluded

# Measures kept, with the status-flag column governing each.
MEASURES <- c("Emp", "EmpEnd", "EmpS", "EmpTotal",
              "HirA", "HirN", "HirAEnd", "HirAEndRepl",
              "Sep", "SepBeg",
              "FrmJbGn", "FrmJbLs",
              "Payroll")
FLAGS    <- paste0("s", MEASURES)

USABLE    <- c(1L, 6L, 7L, 9L, 10L, 12L)
DISTORTED <- c(7L, 9L, 12L)

STATES <- c("al","ak","az","ar","ca","co","ct","de","dc","fl","ga","hi","id",
            "il","in","ia","ks","ky","la","me","md","ma","mi","mn","ms","mo",
            "mt","ne","nv","nh","nj","nm","ny","nc","nd","oh","ok","or","pa",
            "ri","sc","sd","tn","tx","ut","vt","va","wa","wv","wi","wy")

# ── Reader: one bulk file -> slim data.table ─────────────────────────────────
read_qwi <- function(name) {
  path <- need_file(file.path(raw_dir, name), how)
  keep <- c("geography", "ind_level", "industry", "sex", "agegrp",
            "year", "quarter", MEASURES, FLAGS)
  dt <- fread(path, select = keep, showProgress = FALSE,
              colClasses = list(character = c("geography", "ind_level",
                                              "industry", "agegrp")))
  # sex 0 = both; the sex split is not used and tripling the rows costs memory.
  dt <- dt[sex == 0L & year >= MIN_YEAR]
  dt[, sex := NULL]

  # Apply the flag rule in place: unusable flag -> NA.
  for (m in MEASURES) {
    f <- paste0("s", m)
    set(dt, i = which(!(dt[[f]] %in% USABLE)), j = m, value = NA)
  }
  # Collapse the per-measure flags to one indicator, so the panel carries the
  # caveat without carrying 13 extra columns.
  dt[, distorted := Reduce(`|`, lapply(FLAGS, function(f) dt[[f]] %in% DISTORTED))]
  dt[, (FLAGS) := NULL]
  dt[]
}

# ── 1. Published national, sector level (the validation target) ─────────────
say("Reading the published national sector file ...")
nat <- read_qwi("qwi_us_sa_f_gn_ns_op_u.csv.gz")
assert(nrow(nat) > 0, "The national file produced no rows after filtering.")
nat_latest <- nat[, max(year * 10L + quarter)]
say("  %s rows, %d sectors, through %dQ%d",
    format(nrow(nat), big.mark = ","), nat[ind_level == "S", uniqueN(industry)],
    nat_latest %/% 10L, nat_latest %% 10L)
saveRDS(nat, file.path(out_dir, "qwi_us_sector.rds"), compress = "xz")

# ── 2. State sector files: validate the summing logic ───────────────────────
# This isolates "are we summing states correctly" from "how much does NAICS3
# suppression cost us". If V1 fails, nothing else is trustworthy.
say("Reading %d state sector files ...", length(STATES))
st_ns <- rbindlist(lapply(STATES, function(s)
  read_qwi(sprintf("qwi_%s_sa_f_gs_ns_op_u.csv.gz", s))))
say("  %s rows", format(nrow(st_ns), big.mark = ","))

# The end quarter differs by state: LEHD publishes on each state's own
# data-sharing schedule. In the vintage this was written against Alaska stops at
# 2016Q2 and Michigan at 2021Q4 while the other 49 reach 2025Q3. Letting the
# slowest state set the window would cost nine years and make the exercise
# pointless, so states more than LAG_TOL quarters behind are excluded outright
# and the cost is MEASURED against the published national total rather than
# waved away.
state_last <- st_ns[, .(last = max(year * 10L + quarter)), by = geography]
qidx       <- function(yq) (yq %/% 10L) * 4L + (yq %% 10L)
MODAL_LAST <- state_last[, as.integer(names(sort(table(last), decreasing = TRUE))[1])]
LAGGARDS   <- state_last[qidx(MODAL_LAST) - qidx(last) > LAG_TOL, geography]

say("  state end quarters: %d distinct; %d state(s) reach %dQ%d",
    uniqueN(state_last$last), state_last[last == MODAL_LAST, .N],
    MODAL_LAST %/% 10L, MODAL_LAST %% 10L)
if (length(LAGGARDS))
  say("  EXCLUDED, more than %d quarters behind: %s", LAG_TOL,
      paste(sprintf("%s (ends %dQ%d)", LAGGARDS,
                    state_last[geography %in% LAGGARDS, last] %/% 10L,
                    state_last[geography %in% LAGGARDS, last] %%  10L), collapse = ", "))

# LAST_FULL is the last quarter in which every one of the 51 geographies still
# reported. V1 is checked there, on the full set, because that is the only window
# where "sum of states == published national" is the right expectation.
LAST_FULL <- state_last[, min(last)]
N_STATES  <- length(STATES) - length(LAGGARDS)
END_YQ    <- min(MODAL_LAST, nat_latest)
say("  panel geography: %d of %d; window ends %dQ%d (published national ends %dQ%d)",
    N_STATES, length(STATES), END_YQ %/% 10L, END_YQ %% 10L,
    nat_latest %/% 10L, nat_latest %% 10L)

v1_of <- function(dt, upto) {
  m <- merge(
    dt[ind_level == "S" & year * 10L + quarter <= upto,
       .(state_sum = sum(EmpS, na.rm = TRUE)), by = .(industry, agegrp, year, quarter)],
    nat[ind_level == "S", .(industry, agegrp, year, quarter, published = EmpS)],
    by = c("industry", "agegrp", "year", "quarter"))
  m <- m[!is.na(published) & published > 0]
  m[, gap := state_sum / published - 1][]
}

# V1a: the actual test of the summing logic. All 51 geographies, restricted to
# the era when all 51 still reported. The sum should reproduce the published
# national essentially exactly.
v1a <- v1_of(st_ns, LAST_FULL)
say("V1a summing logic (all 51, through %dQ%d): median gap %+.5f, IQR [%+.5f, %+.5f], n=%s",
    LAST_FULL %/% 10L, LAST_FULL %% 10L, median(v1a$gap),
    quantile(v1a$gap, .25), quantile(v1a$gap, .75), format(nrow(v1a), big.mark = ","))
assert(nrow(v1a) > 0 && median(abs(v1a$gap)) < SECTOR_TOL,
       "V1a FAILED: median |gap| %.4f exceeds %.3f. The state summing logic is wrong.",
       median(abs(v1a$gap)), SECTOR_TOL)

# V1b: the price of excluding the laggards. Not pass/fail; a number to publish.
if (length(LAGGARDS)) st_ns <- st_ns[!geography %in% LAGGARDS]
v1b <- v1_of(st_ns, LAST_FULL)
EXCL_COST <- median(v1b$gap) - median(v1a$gap)
say("V1b cost of excluding %s: national employment sits %.2f%% lower",
    paste(LAGGARDS, collapse = "+"), -100 * EXCL_COST)

# ── 3. State NAICS3 files -> the analysis panel ──────────────────────────────
say("Reading %d state NAICS3 files ...", length(STATES))
st_n3 <- rbindlist(lapply(STATES, function(s)
  read_qwi(sprintf("qwi_%s_sa_f_gs_n3_op_u.csv.gz", s))))
st_n3 <- st_n3[ind_level == "3" & !geography %in% LAGGARDS &
               qidx(year * 10L + quarter) <= qidx(END_YQ)]
say("  %s rows, %d subsectors", format(nrow(st_n3), big.mark = ","),
    st_n3[, uniqueN(industry)])
saveRDS(st_n3, file.path(out_dir, "qwi_state_naics3_slim.rds"), compress = "xz")
say("  slim state panel kept on disk (a state x industry x age design needs no re-download)")

# ── 4. Balanced state sets, then aggregate to national ──────────────────────
# Balance on EmpS: a state contributes an (industry x agegrp) cell only if it
# reports employment in every quarter of the window. Flow measures inherit that
# state set, so numerators and denominators come from the same geography.
nq <- st_n3[, uniqueN(paste(year, quarter))]
say("Balancing state sets over %d quarters ...", nq)

ok <- st_n3[!is.na(EmpS), .N, by = .(geography, industry, agegrp)][N == nq]
ok[, N := NULL]
say("  %s of %s (geography x industry x agegrp) cells are complete",
    format(nrow(ok), big.mark = ","),
    format(st_n3[, uniqueN(paste(geography, industry, agegrp))], big.mark = ","))

bal <- merge(st_n3, ok, by = c("geography", "industry", "agegrp"))

panel <- bal[, c(
  lapply(.SD, sum, na.rm = TRUE),
  .(n_states        = uniqueN(geography),
    share_distorted = sum(EmpS * distorted, na.rm = TRUE) / sum(EmpS, na.rm = TRUE))
), by = .(industry, agegrp, year, quarter), .SDcols = MEASURES]

# Rates from summed numerators and denominators, never as a mean of state rates.
# The denominator is EmpS (full-quarter employment), matching QWI's own published
# rate definitions. That means hire rates can legitimately exceed 100%: HirA
# counts every hire including short spells, while EmpS by construction excludes
# anyone who did not last a full quarter. In small seasonal cells (14-18 year
# olds in performing arts, say) the ratio is genuinely large. It is not an error,
# so it is reported rather than capped.
rate <- function(num, den) fifelse(is.na(den) | den <= 0, NA_real_, 100 * num / den)
panel[, `:=`(
  hire_rate      = rate(HirA,        EmpS),
  hire_end_rate  = rate(HirAEnd,     EmpS),
  sep_rate       = rate(Sep,         EmpS),
  repl_hire_rate = rate(HirAEndRepl, EmpS),
  net_hire_rate  = rate(HirA - Sep,  EmpS),
  jobgain_rate   = rate(FrmJbGn,     EmpS),
  joblose_rate   = rate(FrmJbLs,     EmpS),
  earn_mo        = fifelse(is.na(EmpS) | EmpS <= 0, NA_real_, Payroll / EmpS / 3),
  date           = as.Date(sprintf("%d-%02d-01", year, (quarter - 1L) * 3L + 1L))
)]

# ── 5. Coverage: what fraction of the true national total each cell holds ────
sector_of <- function(n3) {
  s <- substr(n3, 1, 2)
  fifelse(s %in% c("31","32","33"), "31-33",
  fifelse(s %in% c("44","45"),      "44-45",
  fifelse(s %in% c("48","49"),      "48-49", s)))
}
panel[, sector := sector_of(industry)]

cov <- merge(
  panel[, .(n3_sum = sum(EmpS, na.rm = TRUE)), by = .(sector, agegrp, year, quarter)],
  nat[ind_level == "S", .(sector = industry, agegrp, year, quarter, published = EmpS)],
  by = c("sector", "agegrp", "year", "quarter"))
cov <- cov[!is.na(published) & published > 0][, coverage := n3_sum / published]
# EmpS is full-quarter employment, so it needs the following quarter's records
# and is not computable in the newest quarter. Anchor the coverage report on the
# last quarter that actually carries a published value.
COV_YQ <- cov[agegrp == "A00", max(year * 10L + quarter)]
latest_cov <- cov[year * 10L + quarter == COV_YQ & agegrp == "A00"]
assert(nrow(latest_cov) > 0, "V2 produced no coverage rows to report.")
say("V2 NAICS3 coverage of published national employment (%dQ%d, all ages, %d sectors):",
    COV_YQ %/% 10L, COV_YQ %% 10L, nrow(latest_cov))
say("    median %.3f | min %.3f (sector %s) | max %.3f",
    median(latest_cov$coverage), min(latest_cov$coverage),
    latest_cov[which.min(coverage), sector], max(latest_cov$coverage))
if (COV_YQ < END_YQ)
  say("    (EmpS is not computable in %dQ%d, the panel's final quarter)",
      END_YQ %/% 10L, END_YQ %% 10L)
fwrite(cov, file.path(out_dir, "qwi_coverage.csv"))

thin <- cov[coverage < COV_FLOOR, .N, by = .(sector, agegrp)][order(-N)]
if (nrow(thin))
  say("  below the %.0f%% coverage floor: %s", 100 * COV_FLOOR,
      paste(sprintf("sector %s / %s (%d qtrs)", thin$sector, thin$agegrp, thin$N),
            collapse = ", "))
panel <- merge(panel, cov[, .(sector, agegrp, year, quarter, coverage)],
               by = c("sector", "agegrp", "year", "quarter"), all.x = TRUE)
panel[, low_coverage := !is.na(coverage) & coverage < COV_FLOOR]

setkeyv(panel, c("industry", "agegrp", "year", "quarter"))
saveRDS(panel, file.path(out_dir, "qwi_naics3_age_quarter.rds"), compress = "xz")

# ── 6. Assertions ───────────────────────────────────────────────────────────
say("Assertions ...")
assert(panel[, uniqueN(industry)] >= 80,
       "Only %d NAICS3 industries survived; expected >= 80.", panel[, uniqueN(industry)])
assert(setequal(panel$agegrp, sprintf("A0%d", 0:8)),
       "Unexpected age groups: %s", paste(sort(unique(panel$agegrp)), collapse = ","))
assert(panel[!is.na(hire_rate), all(is.finite(hire_rate) & hire_rate >= 0)],
       "Hire rates are negative or non-finite.")
say("  hire rate: median %.1f%%, p99 %.1f%%, max %.1f%% (%.2f%% of cells above 100%%)",
    panel[, median(hire_rate, na.rm = TRUE)],
    panel[, quantile(hire_rate, .99, na.rm = TRUE)],
    panel[, max(hire_rate, na.rm = TRUE)],
    100 * panel[, mean(hire_rate > 100, na.rm = TRUE)])
assert(nrow(panel) == uniqueN(panel[, .(industry, agegrp, year, quarter)]),
       "The panel has duplicate industry x age x quarter rows.")
# A00 is "all ages", so it must dominate every single band.
a00 <- panel[agegrp == "A00", .(industry, year, quarter, all = EmpS)]
a03 <- panel[agegrp == "A03", .(industry, year, quarter, young = EmpS)]
chk <- merge(a00, a03, by = c("industry", "year", "quarter"))
assert(chk[, mean(young <= all, na.rm = TRUE)] > 0.99,
       "Ages 22-24 employment exceeds all-ages employment in %.1f%% of cells.",
       100 * chk[, mean(young > all, na.rm = TRUE)])
say("  all passed")

# ── 7. Meta ─────────────────────────────────────────────────────────────────
write_json(list(
  built_at            = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  source              = "LEHD QWI bulk, https://lehd.ces.census.gov/data/qwi/latest_release/",
  geography           = sprintf("%d of 51 (50 states + DC); PR excluded", N_STATES),
  excluded_states     = if (length(LAGGARDS)) LAGGARDS else "none",
  excluded_reason     = sprintf("more than %d quarters behind the modal state end quarter", LAG_TOL),
  ownership           = "A05 (all private)",
  seasonal            = "unadjusted; use four-quarter changes rather than adjusting",
  min_year            = MIN_YEAR,
  end_quarter         = sprintf("%dQ%d", END_YQ %/% 10L, END_YQ %% 10L),
  published_national_end = sprintf("%dQ%d", nat_latest %/% 10L, nat_latest %% 10L),
  n_industries        = panel[, uniqueN(industry)],
  n_rows              = nrow(panel),
  v1a_median_gap      = round(median(v1a$gap), 5),
  v1b_exclusion_cost  = round(EXCL_COST, 5),
  v2_median_coverage  = round(median(latest_cov$coverage), 4),
  v2_coverage_quarter = sprintf("%dQ%d", COV_YQ %/% 10L, COV_YQ %% 10L),
  coverage_floor      = COV_FLOOR,
  flag_rule           = list(usable = USABLE, distorted = DISTORTED,
                             note = "values with other flags are set missing")
), file.path(out_dir, "qwi_meta.json"), auto_unbox = TRUE, pretty = TRUE)

say("")
say("Wrote:")
for (f in c("qwi_us_sector.rds", "qwi_state_naics3_slim.rds",
            "qwi_naics3_age_quarter.rds", "qwi_coverage.csv", "qwi_meta.json"))
  say("  %-32s %s", f,
      format(structure(file.info(file.path(out_dir, f))$size, class = "object_size"),
             units = "auto"))
