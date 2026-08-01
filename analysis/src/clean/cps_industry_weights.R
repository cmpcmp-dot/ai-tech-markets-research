#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# clean/cps_industry_weights.R — OCC2010 x IND employment counts from the CPS.
#
# One output: the occupation-by-industry employment table that lets an
# OCCUPATION-level AI exposure index be pushed onto INDUSTRIES, which is what
# Adoption card 02 needs, because BTOS reports adoption by industry and every
# published exposure index is by occupation.
#
# ── Why the counts are kept BY YEAR and not pooled ──────────────────────────
# CPS `IND` carries the CONTEMPORANEOUS Census industry vintage: 2018-19 sits on
# the 2012 scheme and 2020 onward on the 2017 scheme. Pooling across that break
# would silently mix two code systems and quietly mis-assign employment. So the
# counts stay per year and clean/exposure.R picks its own window (2018-19).
#
# 2020 is dropped, following the Yale Budget Lab's AI-Effects code this descends
# from: a pandemic year says little about occupational structure and the CPS
# response rate collapsed. Ages 16 and up; occupation 0 and 9800+ (NIU, military)
# excluded.
#
# ── This file used to do much more ──────────────────────────────────────────
# It was micro/01_build_cps_panel.R, a faithful port of the Yale Budget Lab's
# occupation x quarter panel, and it also wrote cps_occ_quarter_panel.rds,
# cps_occ_quarter_age.rds and cps_telework_occ.rds. Those three existed only to
# feed the synthetic-DID replication chain and the telework confounder test,
# none of which any chart on this site reads; they were removed in the analysis/
# refactor along with the scripts that consumed them. The topcoding,
# winsorization, seasonal adjustment and occupation-thinness screen all belonged
# to those outcomes, not to this one, and are gone with them. This table needs a
# weighted headcount and nothing else.
#
# Reads   inputs/cps/{cps.dat.gz, cps.xml}   (fetch/cps_ipums.py, 818 MB)
# Writes  interim/cps/cps_occ_ind_weights.rds
#
# The committed copy lives at frozen/cps_occ_ind_weights.rds, because the 818 MB
# extract behind it is not committed and clean/exposure.R must work in a fresh
# clone. This script therefore writes to interim/ and COMPARES against frozen/
# rather than overwriting it: a rebuild that silently replaced a committed
# artifact would be the one thing here nobody could audit. Pass --promote to
# copy it over deliberately.
#
#   Rscript analysis/src/clean/cps_industry_weights.R [--promote]
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressPackageStartupMessages({
  library(ipumsr); library(data.table); library(digest)
})

assert  <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)
setDTthreads(0L)
PROMOTE <- "--promote" %in% commandArgs(trailingOnly = TRUE)

# ── Parameters ───────────────────────────────────────────────────────────────
MIN_AGE   <- 16L
DROP_YEAR <- 2020L    # pandemic year, per the Yale code this descends from
FROM_YEAR <- 2015L    # far enough back to cover both industry code vintages
CHUNK     <- 1e6L     # the extract is ~40M person-records; stream it

out_dir  <- ensure_dir(interim_path("cps"))
how      <- "python analysis/src/fetch/cps_ipums.py  (818 MB IPUMS extract)"
ddi_path <- need_file(input_path("cps", "cps.xml"), how)
dat_path <- need_file(input_path("cps", "cps.dat.gz"), how)

ddi <- read_ipums_ddi(ddi_path)

# Only the six variables this table needs. The extract carries 34; reading the
# rest would triple the memory for columns that are then discarded.
VARS <- c("YEAR", "AGE", "EMPSTAT", "OCC2010", "IND", "WTFINL")

acc     <- list()
n_read  <- 0L
i_chunk <- 0L

reduce_chunk <- function(x, pos) {
  i_chunk <<- i_chunk + 1L
  n_read  <<- n_read + nrow(x)

  d <- as.data.table(lapply(x, function(v) { attributes(v) <- NULL; v }))
  setnames(d, tolower(names(d)))

  d <- d[age >= MIN_AGE]
  if (!nrow(d)) return(NULL)

  # EMPSTAT 10 = at work, 12 = has job, not at work last week.
  d[, employed := as.integer(empstat %in% c(10L, 12L))]

  # OCC2010 0 = NIU, 9800+ = military and unemployed-never-worked.
  k <- d[occ2010 != 0L & occ2010 < 9800L & year != DROP_YEAR]
  if (nrow(k))
    acc[[i_chunk]] <<- k[employed == 1L & year >= FROM_YEAR & ind > 0,
                         .(emp = sum(wtfinl), n = .N), by = .(occ2010, ind, year)]

  if (i_chunk %% 10L == 0L)
    say("  chunk %3d | %s person-records read", i_chunk, format(n_read, big.mark = ","))
  NULL
}

say("Streaming %s in chunks of %s ...", basename(dat_path), format(CHUNK, big.mark = ","))
t0 <- Sys.time()
invisible(read_ipums_micro_chunked(
  ddi, data_file = dat_path, vars = all_of(VARS), verbose = FALSE,
  chunk_size = CHUNK, callback = IpumsSideEffectCallback$new(reduce_chunk)))
say("  done: %s person-records in %.1f min", format(n_read, big.mark = ","),
    as.numeric(difftime(Sys.time(), t0, units = "mins")))

ind_w <- rbindlist(acc)[, .(emp = sum(emp), n = sum(n)), by = .(occ2010, ind, year)]

# ── Assertions ──────────────────────────────────────────────────────────────
say("Assertions ...")
assert(nrow(ind_w) > 0, "The occupation-by-industry table is empty.")
assert(!any(ind_w$year == DROP_YEAR), "%d was not dropped.", DROP_YEAR)
assert(ind_w[, min(year)] >= FROM_YEAR, "A year before %d survived.", FROM_YEAR)
assert(ind_w[, all(emp > 0 & n > 0)], "Non-positive employment or cell count.")
assert(ind_w[, uniqueN(occ2010)] > 200, "Only %d occupations.", ind_w[, uniqueN(occ2010)])
assert(nrow(ind_w) == uniqueN(ind_w[, .(occ2010, ind, year)]),
       "Duplicate occupation x industry x year rows.")
# 2018-19 is the window clean/exposure.R uses; it must actually be present.
assert(ind_w[year %in% 2018:2019, .N] > 0, "No 2018-19 rows, which exposure/ needs.")
say("  %s rows | %d occupations | %d industries | years %d-%d",
    format(nrow(ind_w), big.mark = ","), ind_w[, uniqueN(occ2010)],
    ind_w[, uniqueN(ind)], ind_w[, min(year)], ind_w[, max(year)])
say("  all passed")

dest <- file.path(out_dir, "cps_occ_ind_weights.rds")
saveRDS(ind_w, dest, compress = "xz")
say("Wrote %s (%s)", dest,
    format(structure(file.info(dest)$size, class = "object_size"), units = "auto"))

# ── Compare against the committed copy ──────────────────────────────────────
# Content, not bytes: saveRDS embeds a timestamp-free stream but xz output can
# still differ across library versions, so equality is checked on the object.
frozen <- frozen_path("cps_occ_ind_weights.rds")
if (file.exists(frozen)) {
  old <- as.data.table(readRDS(frozen))
  setkeyv(old, c("occ2010", "ind", "year")); setkeyv(ind_w, c("occ2010", "ind", "year"))
  same <- isTRUE(all.equal(as.data.frame(old), as.data.frame(ind_w), tolerance = 0))
  say("")
  if (same) {
    say("Identical to frozen/cps_occ_ind_weights.rds. Nothing to promote.")
  } else {
    say("DIFFERS from frozen/cps_occ_ind_weights.rds:")
    say("  frozen  %s rows, %d occupations, years %d-%d",
        format(nrow(old), big.mark = ","), old[, uniqueN(occ2010)],
        old[, min(year)], old[, max(year)])
    say("  rebuilt %s rows, %d occupations, years %d-%d",
        format(nrow(ind_w), big.mark = ","), ind_w[, uniqueN(occ2010)],
        ind_w[, min(year)], ind_w[, max(year)])
    say("  A newer IPUMS extract moves Adoption card 02. If that is intended,")
    say("  re-run with --promote and rebuild: Rscript analysis/run.R btos-exposure")
  }
  if (PROMOTE && !same) {
    file.copy(dest, frozen, overwrite = TRUE)
    say("Promoted to %s", frozen)
  }
} else {
  say("No frozen copy at %s", frozen)
  if (PROMOTE) { file.copy(dest, frozen); say("Promoted to %s", frozen) }
  else say("  Run with --promote to establish it.")
}
