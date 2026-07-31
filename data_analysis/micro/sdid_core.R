# ─────────────────────────────────────────────────────────────────────────────
# micro/sdid_core.R — the SDID estimator, factored out so the replication (02)
# and the extensions (03) run literally the same code path.
#
# A port of sections 9-12 of the Budget Lab's `sdid.R`. The defaults reproduce
# their design exactly; every argument that departs from it has to be passed in
# explicitly, which is the point — a departure should be visible at the call
# site, not buried in a helper.
#
# Sourced, not run.
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(data.table); library(synthdid)
})

# Yale's outcome set and labels.
SDID_OUTCOMES <- c(
  emp_share_sa          = "Employment share",
  lf_share_sa           = "Labor force share",
  logurate_sa           = "Log unemployment rate",
  log_real_hrly_wage_sa = "Log real hourly wage"
)

# ─────────────────────────────────────────────────────────────────────────────
# run_sdid() — one outcome, one panel, one exposure metric.
#
#   panel        occ2010 x year x quarter, seasonally adjusted, from 01
#   exposure     data.table(occ2010, ai_exposure)
#   var          outcome column in `panel`
#   treat_year   / treat_quarter   treatment onset (Yale: 2022 Q4)
#   treat_pctile / donor_pctile    tercile cutoffs (Yale: 2/3 and 1/3)
#   weight_var   NULL for Yale's unweighted terciles; a column name to weight
#                the tercile cutoffs by employment (this is T3)
#   B            bootstrap replications for the SE (Yale: 200)
#
# Returns a one-row data.table plus the omega weights and the treatment
# assignment as attributes.
# ─────────────────────────────────────────────────────────────────────────────
run_sdid <- function(panel, exposure, var,
                     treat_year = 2022L, treat_quarter = 4L,
                     treat_pctile = 2/3, donor_pctile = 1/3,
                     weight_var = NULL, B = 200L, seed = 12345L,
                     label = var, tag = "") {

  set.seed(seed)
  d <- merge(as.data.table(panel), exposure, by = "occ2010")
  d <- d[!is.na(ai_exposure) & !is.na(get(var))]
  if (!nrow(d)) return(NULL)

  # ── Tercile cutoffs, over the pre-treatment occupation set ─────────────────
  # Yale compute these unweighted: every occupation is one observation
  # regardless of size. `weight_var` makes that an employment-weighted quantile
  # instead, which is T3 and is the only thing that changes.
  pre <- unique(d[year < treat_year | (year == treat_year & quarter < treat_quarter),
                  c("occ2010", "ai_exposure", weight_var), with = FALSE],
                by = "occ2010")
  if (nrow(pre) < 12L) return(NULL)

  if (is.null(weight_var)) {
    p_treat <- stats::quantile(pre$ai_exposure, treat_pctile, na.rm = TRUE)
    p_donor <- stats::quantile(pre$ai_exposure, donor_pctile, na.rm = TRUE)
  } else {
    q <- Hmisc::wtd.quantile(pre$ai_exposure, weights = pre[[weight_var]],
                             probs = c(donor_pctile, treat_pctile), na.rm = TRUE)
    p_donor <- q[[1]]; p_treat <- q[[2]]
  }

  d[, treat_group := fcase(ai_exposure >  p_treat, 1L,
                           ai_exposure <= p_donor, 0L,
                           default = NA_integer_)]
  d <- d[!is.na(treat_group)]
  if (!nrow(d)) return(NULL)

  d[, `:=`(treated = treat_group,
           post = as.integer(year > treat_year |
                             (year == treat_year & quarter >= treat_quarter)))]
  d[, D := treated * post]

  # ── Re-balance after dropping the middle tercile ───────────────────────────
  d[, yq := paste0(year, "Q", quarter)]
  cnt  <- d[, .(nq = uniqueN(yq)), by = occ2010]
  d    <- d[occ2010 %in% cnt[nq == max(cnt$nq), occ2010]]

  n_treat <- d[treated == 1L, uniqueN(occ2010)]
  n_ctrl  <- d[treated == 0L, uniqueN(occ2010)]
  if (n_treat < 3L || n_ctrl < 3L) return(NULL)

  tix <- unique(d[order(year, quarter), yq])
  ctrl_u  <- d[treated == 0L, unique(occ2010)]
  treat_u <- d[treated == 1L, unique(occ2010)]
  ordr    <- c(ctrl_u, treat_u)          # synthdid wants controls first

  wide <- dcast(d, occ2010 ~ factor(yq, levels = tix), value.var = var)
  Y <- as.matrix(wide[match(ordr, wide$occ2010), -1L]); rownames(Y) <- ordr
  if (anyNA(Y)) return(NULL)

  N0 <- length(ctrl_u)
  T0 <- sum(tix < paste0(treat_year, "Q", treat_quarter))
  if (T0 < 4L || (length(tix) - T0) < 2L) return(NULL)

  est      <- synthdid_estimate(Y, N0, T0)
  att_log  <- as.numeric(est)
  var_log  <- as.numeric(vcov(est, method = "bootstrap", replications = B))
  se_log   <- sqrt(var_log)

  # ── Unemployment: report in percentage points, as Yale do ──────────────────
  # The outcome is a log rate, so the ATT is converted with the post-period
  # treated mean:  att_pp = 100 * (u + 0.001) * (1 - exp(-att_log)).
  #
  # Two notes, both departures worth stating rather than burying.
  #
  # (1) Yale build logurate with +0.0005 but convert back with +0.001. We keep
  #     their conversion so the number is comparable to theirs, rather than
  #     silently "fixing" it.
  # (2) Yale bootstrap the conversion by resampling BOTH the SDID estimate and
  #     the treated post-period mean. Re-estimating SDID 200 more times costs
  #     another eight minutes for a variance the synthdid bootstrap has already
  #     computed, so we combine the two analytically instead: the delta method
  #     on att_log using var_log, plus the sampling variance of the mean rate.
  #     Same two sources of uncertainty, no second bootstrap.
  # Units are the outcome's own units, which are not the same across outcomes:
  # the share outcomes are already in percentage points of population, and only
  # the wage outcome is in log points. Labelling them all "log points" (as an
  # earlier version did) misreports the employment-share result by implying a
  # proportional effect where the number is an absolute share difference.
  UNITS <- c(emp_share_sa = "pp of population", lf_share_sa = "pp of population",
             log_real_hrly_wage_sa = "log points", logurate_sa = "percentage points")
  att <- att_log; se <- se_log
  unit <- if (var %in% names(UNITS)) UNITS[[var]] else "outcome units"
  if (var == "logurate_sa") {
    u  <- d[treated == 1L & post == 1L & !is.na(urate), urate]
    um <- mean(u); uv <- stats::var(u) / length(u)
    att  <- 100 * (um + 0.001) * (1 - exp(-att_log))
    d_a  <- 100 * (um + 0.001) * exp(-att_log)      # d att / d att_log
    d_u  <- 100 * (1 - exp(-att_log))               # d att / d u
    se   <- sqrt(d_a^2 * var_log + d_u^2 * uv)
    # unit already set from UNITS above
  }

  omega <- attr(est, "weights")$omega
  res <- data.table(
    tag = tag, outcome = var, label = label,
    att = att, se = se, t = att / se, p = 2 * stats::pnorm(-abs(att / se)),
    se_log = se_log,
    ci_lo = att - 1.96 * se, ci_hi = att + 1.96 * se, unit = unit,
    att_log = att_log,
    n_treated = n_treat, n_control = n_ctrl, n_periods = length(tix),
    t0 = T0, cut_donor = p_donor, cut_treat = p_treat,
    weighted_terciles = !is.null(weight_var),
    exposure_treated = mean(unique(d[treated == 1L, .(occ2010, ai_exposure)])$ai_exposure),
    exposure_control = mean(unique(d[treated == 0L, .(occ2010, ai_exposure)])$ai_exposure)
  )
  attr(res, "omega") <- data.table(occ2010 = ctrl_u, omega = as.numeric(omega))
  attr(res, "groups") <- unique(d[, .(occ2010, treat_group, ai_exposure)])
  attr(res, "time_index") <- tix
  res
}

# Convenience: every outcome in SDID_OUTCOMES for one panel/exposure pair.
# Each SDID fit costs a 200-replication bootstrap, so the omega weights and
# group assignments are carried out on the returned object rather than
# recovered by re-running the estimator.
run_sdid_all <- function(panel, exposure, tag = "", outcomes = SDID_OUTCOMES, ...) {
  fits <- lapply(names(outcomes), function(v) {
    tryCatch(run_sdid(panel, exposure, v, label = outcomes[[v]], tag = tag, ...),
             error = function(e) { message("  ", tag, "/", v, ": ", conditionMessage(e)); NULL })
  })
  fits <- Filter(Negate(is.null), fits)
  if (!length(fits)) return(data.table())
  res <- rbindlist(fits, fill = TRUE)
  attr(res, "omega") <- rbindlist(lapply(fits, function(f) {
    o <- copy(attr(f, "omega")); o[, `:=`(outcome = f$outcome, tag = f$tag)][]
  }), fill = TRUE)
  attr(res, "groups") <- rbindlist(lapply(fits, function(f) {
    g <- copy(attr(f, "groups")); g[, `:=`(outcome = f$outcome, tag = f$tag)][]
  }), fill = TRUE)
  res
}
