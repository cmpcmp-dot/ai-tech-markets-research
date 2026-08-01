#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# clean/cps_age_education.R — CPS microdata to monthly unemployment totals by
# age and education. Nothing here is an estimate; it is the collapse that makes
# the estimate cheap.
#
# The IPUMS extract is 818 MB and takes minutes to parse. The two tables this
# writes are a few hundred KB, so exhibits/jobs_02_age_bands.R can be re-run in
# seconds while someone is actually thinking about the specification. Run this
# only when the extract itself changes.
#
# Universe: age 16 and over. Weighted by WTFINL throughout. The unweighted
# labor-force count is carried alongside so that cell size stays auditable and
# a thin band cannot quietly drive a result.
#
# Education (IPUMS CPS EDUC codes):
#   College+     EDUC >= 111            bachelor's degree or higher
#   HS+ (no BA)  73 <= EDUC < 111       high school completion, no bachelor's
#
# "< HS" is deliberately absent. Below roughly age 21 that category is defined
# by an outcome that is itself mechanically age-dependent (still enrolled, or a
# dropout), and its share of the young population more than halved over the
# sample. Its residuals measure compositional change in who remains in the
# category, not labor demand.
#
# Reads   inputs/cps/cps.dat.gz + cps.xml
# Writes  interim/cps/overall_totals.csv     date x (unemp, lf), weighted
#         interim/cps/age_month_totals.csv   date x age x group totals
#         interim/cps/cps_read_meta.json     records read, first/last month
#
#   Rscript analysis/src/clean/cps_age_education.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressPackageStartupMessages({
  library(ipumsr); library(data.table); library(lubridate); library(jsonlite)
})

EDU_GROUPS <- c("college", "hs_plus")

ddi_path <- need_file(input_path("cps", "cps.xml"),
                      "python analysis/src/fetch/cps_ipums.py  (needs IPUMS_API_KEY)")
dat_path <- need_file(input_path("cps", "cps.dat.gz"),
                      "python analysis/src/fetch/cps_ipums.py  (needs IPUMS_API_KEY)")
out <- ensure_dir(interim_path("cps"))

# ── 1. Read only the seven variables this needs ──────────────────────────────
ddi <- read_ipums_ddi(ddi_path)
say("Reading CPS extract (YEAR, MONTH, AGE, WTFINL, LABFORCE, EMPSTAT, EDUC) ...")
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
n_person_records <- nrow(cps)
rm(cps_raw); gc()

# ── 2. Collapse ──────────────────────────────────────────────────────────────
cps[, `:=`(unemp_w = wtfinl * unemp_flag, lf_w = wtfinl * lf_flag)]

overall_totals <- cps[, .(unemp = sum(unemp_w, na.rm = TRUE),
                          lf    = sum(lf_w,    na.rm = TRUE)), by = .(date)]
setorder(overall_totals, date)

# Weighted unemployment and labor force per (date, age, group), plus the
# UNWEIGHTED labor-force count n_* so cell size is visible downstream.
age_month <- cps[, c(
  list(date = date, age = age),
  setNames(lapply(EDU_GROUPS, function(g) unemp_w * get(g)), paste0("unemp_", EDU_GROUPS)),
  setNames(lapply(EDU_GROUPS, function(g) lf_w    * get(g)), paste0("lf_",    EDU_GROUPS)),
  setNames(lapply(EDU_GROUPS, function(g) as.integer(lf_flag & get(g))),
           paste0("n_", EDU_GROUPS))
)][, lapply(.SD, sum, na.rm = TRUE), by = .(date, age),
   .SDcols = c(paste0("unemp_", EDU_GROUPS), paste0("lf_", EDU_GROUPS),
               paste0("n_", EDU_GROUPS))]
setorder(age_month, date, age)
rm(cps); gc()

# ── 3. Write ─────────────────────────────────────────────────────────────────
fwrite(overall_totals, file.path(out, "overall_totals.csv"))
fwrite(age_month,      file.path(out, "age_month_totals.csv"))

write_json(list(
  vintage             = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"),
  person_records_read = n_person_records,
  first_month         = format(min(overall_totals$date), "%Y-%m"),
  last_month          = format(max(overall_totals$date), "%Y-%m"),
  edu_groups          = EDU_GROUPS,
  universe            = "age 16+, weighted by WTFINL"
), file.path(out, "cps_read_meta.json"), auto_unbox = TRUE, pretty = TRUE)

say("  %s person-records, %s to %s",
    format(n_person_records, big.mark = ","),
    format(min(overall_totals$date), "%Y-%m"), format(max(overall_totals$date), "%Y-%m"))
say("  overall_totals   %d rows", nrow(overall_totals))
say("  age_month_totals %d rows", nrow(age_month))
say("Wrote %s", out)
