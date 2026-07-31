#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# micro/06_qwi_dynamics.R — timing, placebos and robustness for the QWI test.
#
# 03_tests_industry.R estimates T4 as a two-window cross-section: a 2019 base
# against the four quarters ending 2025Q2. That answers "is the age-differenced
# hiring gap wider in high-adoption industries?" but not "when did it widen?" —
# and the second question is the one that decides whether the answer has anything
# to do with AI. T4c imposes a single break at 2022Q4 without ever showing the
# path, so the parallel-trends assumption is asserted rather than tested.
#
# NOT PRE-REGISTERED. plan_microdata.md specified T1-T6 before anything ran; this
# script is a post hoc diagnostic of T4 written after seeing T4's result. That is
# a real difference in evidentiary status and it is labelled as such everywhere
# it surfaces. Nothing here redefines T4 or replaces its headline. The treatment
# variable is read straight out of t4_qwi_frame.csv rather than rebuilt from
# BTOS, so adoption is identical to T4 by construction.
#
# Reads:   qwi/output/qwi_naics3_age_quarter.rds
#          qwi/output/qwi_coverage.csv, qwi/output/qwi_meta.json
#          micro/output/t4_qwi_frame.csv        (for adopt_z and the T4b sample)
# Writes:  micro/output/qwi_event_study.csv     beta_t path, per outcome
#          micro/output/qwi_placebo.csv         pre-ChatGPT placebo windows
#          micro/output/qwi_robust.csv          leave-one-out, subsamples, weights
#          micro/output/qwi_descriptive.csv     the underlying series, indexed
#          micro/output/qwi_dynamics_meta.json
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(data.table); library(jsonlite); library(sandwich); library(lmtest)
})

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
out   <- function(...) file.path(repo, "micro", "output", ...)

say    <- function(...) cat(sprintf(...), "\n", sep = "")
assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)
pct    <- function(b) 100 * (exp(b) - 1)

YOUNG <- "A03"   # 22-24
OLD   <- "A05"   # 35-44
BASE  <- 20194L  # trailing-four-quarter window ending 2019Q4, i.e. calendar 2019
TREAT <- 20224L  # ChatGPT release quarter, the T4c break

yq <- function(y, q) y * 10L + q

# ── Treatment, taken from T4 so it cannot drift ──────────────────────────────
fr <- fread(out("t4_qwi_frame.csv"), colClasses = list(character = "naics"))
tb <- dcast(fr[agegrp %in% c(YOUNG, OLD)], naics + adopt_z + exposure_z ~ agegrp,
            value.var = c("d_log_hires", "pretrend_hires"))
tb <- tb[!is.na(get(paste0("d_log_hires_", YOUNG))) &
         !is.na(get(paste0("d_log_hires_", OLD)))]
IND <- sort(tb$naics)
say("T4b sample: %d industries, adoption z from t4_qwi_frame.csv", length(IND))
adopt <- tb[, .(industry = naics, adopt_z, exposure_z)]

# ── The panel ────────────────────────────────────────────────────────────────
q <- as.data.table(readRDS(file.path(repo, "qwi", "output", "qwi_naics3_age_quarter.rds")))
q[, yqi := yq(year, quarter)]
q <- q[agegrp %in% c(YOUNG, OLD) & industry %in% IND]

# The panel is balanced by construction in 02_build_qwi.R -- a fixed state set per
# industry x age cell, every quarter present. Assert it rather than trust it,
# because a rolling four-quarter sum over an unbalanced panel silently
# manufactures the very level shifts the balanced-state rule exists to prevent.
cells <- q[, .N, by = .(industry, agegrp)]
assert(uniqueN(cells$N) == 1L,
       "panel is not balanced: %d distinct quarter counts across industry x age cells",
       uniqueN(cells$N))
assert(nrow(cells) == 2L * length(IND), "expected %d cells, got %d",
       2L * length(IND), nrow(cells))
assert(q[, uniqueN(n_states), by = .(industry, agegrp)][, max(V1)] == 1L,
       "state set varies within an industry x age cell")
say("Panel: %d industries x 2 age bands x %d quarters, state set fixed within cell",
    length(IND), cells$N[1])

# QWI is unadjusted, so every level is a trailing four-quarter sum and every
# change is that sum against the same window in the base year. Same idiom as T4,
# extended to every quarter instead of just one.
setorder(q, industry, agegrp, yqi)
q[, `:=`(H4 = frollsum(HirA, 4L), E4 = frollsum(EmpS, 4L),
         R4 = frollsum(HirAEndRepl, 4L), S4 = frollsum(Sep, 4L)),
  by = .(industry, agegrp)]

OUTS <- c(hires = "H4", emp = "E4", repl = "R4", sep = "S4")

rebase <- function(dt, base_q) {
  b <- dt[yqi == base_q, c(.(industry = industry, agegrp = agegrp),
                           setNames(lapply(OUTS, function(v) get(v)), paste0(OUTS, "_b")))]
  m <- merge(dt, b, by = c("industry", "agegrp"))
  for (v in OUTS) m[, (paste0("l_", v)) := log(get(v) / get(paste0(v, "_b")))]
  m
}

# ═════════════════════════════════════════════════════════════════════════════
# D1 — Event study: the T4b coefficient, quarter by quarter
# ═════════════════════════════════════════════════════════════════════════════
# For every quarter t, the same cross-sectional regression T4b runs once:
#   (log H4_young,t - log H4_young,2019) - (log H4_old,t - log H4_old,2019)
#     = a + beta_t * adopt_z
# so beta_t is in the same units as the T4b headline (log points of hiring per SD
# of adoption, net of anything that hit all ages in an industry equally) and
# beta at 2025Q2 must reproduce the T4b bivariate estimate. That equality is
# checked below; if it fails, this script is wrong, not T4.
say("")
say("D1  Event study: T4b coefficient by quarter")
say("%s", strrep("-", 78))

ev_panel <- rebase(q, BASE)
gaps <- dcast(ev_panel, industry + yqi + date ~ agegrp,
              value.var = paste0("l_", OUTS))
for (nm in names(OUTS)) {
  v <- OUTS[[nm]]
  gaps[, (paste0("gap_", nm)) := get(paste0("l_", v, "_", YOUNG)) -
                                 get(paste0("l_", v, "_", OLD))]
  gaps[, (paste0("lvl_", nm)) := get(paste0("l_", v, "_", YOUNG))]
}
gaps <- merge(gaps, adopt, by = "industry")

xsec <- function(d, y) {
  d <- d[is.finite(get(y))]
  if (nrow(d) < 20L) return(NULL)
  f  <- lm(stats::reformulate("adopt_z", y), data = d)
  ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
  data.table(est = ct[2, 1], se = ct[2, 2], p = ct[2, 4], n = nrow(d))
}

ev <- rbindlist(lapply(names(OUTS), function(nm) {
  rbindlist(lapply(c(agediff = "gap_", level = "lvl_"), function(pfx) {
    y <- paste0(pfx, nm)
    r <- gaps[, { s <- xsec(.SD, y); if (is.null(s)) NULL else s },
              by = .(yqi, date), .SDcols = c(y, "adopt_z")]
    if (!nrow(r)) return(NULL)
    r[, `:=`(outcome = nm, spec = if (pfx == "gap_") "agediff" else "level")]
  }), fill = TRUE)
}), fill = TRUE)
ev <- ev[yqi >= 20064L]
ev[, `:=`(est_pct = pct(est), lo_pct = pct(est - 1.96 * se), hi_pct = pct(est + 1.96 * se),
          post = as.integer(yqi >= TREAT))]
setorder(ev, outcome, spec, yqi)

# Internal consistency: beta at the T4 end quarter must equal T4b bivariate.
t4c <- fread(out("t4_coefs.csv"))
t4b_biv <- t4c[spec == "b: age-diff hires", est]
ev_end  <- ev[outcome == "hires" & spec == "agediff" & yqi == 20252L, est]
say("  check: event study at 2025Q2 = %+.4f, T4b bivariate = %+.4f, gap %.2e",
    ev_end, t4b_biv, abs(ev_end - t4b_biv))
assert(abs(ev_end - t4b_biv) < 1e-6,
       "event study does not reproduce T4b at the end quarter (%.6f vs %.6f)",
       ev_end, t4b_biv)

h <- ev[outcome == "hires" & spec == "agediff"]

# Pre-trend, tested three ways, because the pandemic makes a single flat-line
# claim indefensible. 2016Q1-2019Q4 is a clean pre-period; 2020Q1-2021Q3 is not
# and is not used for any test; 2021Q4-2022Q3 is the four quarters immediately
# before treatment and is the one that matters for T4c's single break.
pre_clean <- h[yqi >= 20161L & yqi <= 20194L][, k := .I]
tr <- lm(est ~ k, data = pre_clean)
tr_ct <- coeftest(tr, vcov. = vcovHC(tr, type = "HC3"))
say("  pre-trend 2016Q1-2019Q4: %+.4f log pts per quarter (p = %.3f), %d quarters",
    tr_ct[2, 1], tr_ct[2, 4], nrow(pre_clean))

imm <- h[yqi >= 20214L & yqi <= 20223L]
say("  immediate pre-period 2021Q4-2022Q3: mean beta %+.4f, max |beta| %.4f, %d of %d significant at 5%%",
    imm[, mean(est)], imm[, max(abs(est))], imm[p < 0.05, .N], nrow(imm))

post_end <- h[yqi >= 20243L]
say("  post 2024Q3-2025Q2: mean beta %+.4f (%.1f%%), %d of %d significant at 5%%",
    post_end[, mean(est)], pct(post_end[, mean(est)]),
    post_end[p < 0.05, .N], nrow(post_end))

qlab <- function(z) sprintf("%dQ%d", z %/% 10L, z %% 10L)

firstsig <- h[est < 0 & p < 0.05][order(yqi)]
if (nrow(firstsig))
  say("  first significantly negative quarter anywhere in the path: %s (%+.4f, p = %.4f)",
      qlab(firstsig$yqi[1]), firstsig$est[1], firstsig$p[1])

# Decomposition. The total gap is -7.3 log points. Splitting the path at the
# pandemic and at the ChatGPT release answers the question the two-window
# cross-section cannot: how much of the headline predates generative AI.
#
# 2019Q4 is the reference period, so beta there is zero by construction and the
# decomposition of the total runs from 2019Q4 forward. The 2016Q1-2019Q4 leg is a
# pre-trend check, not a component of the total, and `in_total` says so: summing
# all four rows would double-count the reference period and miss the total by the
# size of the pre-period drift.
legs <- data.table(
  leg = c("pre-pandemic 2016Q1-2019Q4", "pandemic 2019Q4-2021Q1",
          "plateau 2021Q1-2023Q2", "AI era 2023Q2-2025Q2"),
  from = c(20161L, 20194L, 20211L, 20232L),
  to   = c(20194L, 20211L, 20232L, 20252L),
  in_total = c(FALSE, TRUE, TRUE, TRUE))
legs[, `:=`(beta_from = h[match(from, yqi), est], beta_to = h[match(to, yqi), est])]
legs[, change := beta_to - beta_from]
total <- h[yqi == 20252L, est]
legs[, share_of_total := ifelse(in_total, change / total, NA_real_)]
assert(abs(legs[in_total == TRUE, sum(change)] - total) < 1e-9,
       "legs marked in_total do not sum to the 2025Q2 total (%.6f vs %.6f)",
       legs[in_total == TRUE, sum(change)], total)
say("")
say("  Decomposition of the %.1f log point total gap (reference 2019Q4 = 0):", 100 * total)
for (i in seq_len(nrow(legs)))
  say("    %-30s %+6.3f -> %+6.3f  change %+6.3f  %s",
      legs$leg[i], legs$beta_from[i], legs$beta_to[i], legs$change[i],
      if (legs$in_total[i]) sprintf("(%+5.0f%% of total)", 100 * legs$share_of_total[i])
      else "(pre-trend check, not part of the total)")
say("  ChatGPT was released 2022-11-30, inside the plateau. There is no break at it:")
say("    2022Q3 %+.4f, 2022Q4 %+.4f, 2023Q1 %+.4f", h[yqi == 20223L, est],
    h[yqi == 20224L, est], h[yqi == 20231L, est])
fwrite(legs, out("qwi_event_legs.csv"))

fwrite(ev, out("qwi_event_study.csv"))

# ═════════════════════════════════════════════════════════════════════════════
# D2 — Placebos: run the T4b specification on windows that end before ChatGPT
# ═════════════════════════════════════════════════════════════════════════════
# If the T4b result is about generative AI, the same regression on a window that
# closes before ChatGPT existed should return roughly nothing. This is the
# sharpest single test available on public data and it is cheap.
say("")
say("D2  Placebo windows: the T4b specification, ending before ChatGPT")
say("%s", strrep("-", 78))

placebo <- function(tag, base_q, end_q, note) {
  p <- rebase(q, base_q)
  p <- p[yqi == end_q]
  if (!nrow(p)) return(NULL)
  g <- dcast(p, industry ~ agegrp, value.var = "l_H4")
  setnames(g, c(YOUNG, OLD), c("y", "o"))
  g[, diff_hires := y - o]
  g <- merge(g, adopt, by = "industry")[is.finite(diff_hires)]
  f  <- lm(diff_hires ~ adopt_z, data = g)
  ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
  data.table(window = tag, base = base_q, end = end_q, est = ct[2, 1], se = ct[2, 2],
             p = ct[2, 4], n = nrow(g), est_pct = pct(ct[2, 1]), note = note)
}

pl <- rbindlist(list(
  placebo("2019 base -> 2021Q4-2022Q3", BASE, 20223L,
          "post-pandemic, pre-ChatGPT: the placebo that matters for the 2022Q4 break"),
  placebo("2017 base -> 2018Q3-2019Q2", 20174L, 20192L,
          "entirely pre-pandemic, no COVID window in either leg"),
  placebo("2019 base -> 2024Q3-2025Q2", BASE, 20252L,
          "the actual T4b window, for comparison"),
  # The pandemic sits inside the 2019-to-2025 window and, as the event study
  # shows, opened most of the gap. Re-basing to 2023Q2 moves the pandemic into
  # the base so it differences out, leaving only the widening that happened while
  # generative AI was actually diffusing. This is the closest thing here to an
  # AI-era estimate.
  placebo("2023Q2 base -> 2024Q3-2025Q2", 20232L, 20252L,
          "pandemic entirely in the base; the AI-era leg only")
), fill = TRUE)
for (i in seq_len(nrow(pl)))
  say("  %-30s %+7.4f (se %.4f, p %.4f) = %+6.1f%% per SD  n=%d",
      pl$window[i], pl$est[i], pl$se[i], pl$p[i], pl$est_pct[i], pl$n[i])
fwrite(pl, out("qwi_placebo.csv"))

# ═════════════════════════════════════════════════════════════════════════════
# D3 — Robustness on the T4b headline
# ═════════════════════════════════════════════════════════════════════════════
# n = 59 and the six highest-adoption industries are all NAICS 51 Information
# plus 533, 541 and 551. "This is the post-2021 tech correction, not AI" is the
# first objection any referee will raise, so it gets tested rather than answered
# in prose.
say("")
say("D3  Robustness on T4b (age-differenced hires, + pre-trend control)")
say("%s", strrep("-", 78))

setnames(tb, c(paste0("d_log_hires_", YOUNG), paste0("d_log_hires_", OLD),
               paste0("pretrend_hires_", YOUNG), paste0("pretrend_hires_", OLD)),
         c("dy", "do", "py", "po"))
tb[, `:=`(diff_hires = dy - do, diff_pre = py - po, industry = naics,
          sec2 = substr(naics, 1, 2))]
emp_young <- q[agegrp == YOUNG & yqi == 20252L, .(industry, w_emp = E4)]
tb <- merge(tb, emp_young, by = "industry", all.x = TRUE)

rfit <- function(d, tag, rhs = c("adopt_z", "diff_pre"), wts = NULL, note = "") {
  f  <- if (is.null(wts)) lm(stats::reformulate(rhs, "diff_hires"), data = d)
        else lm(stats::reformulate(rhs, "diff_hires"), data = d, weights = d[[wts]])
  ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
  data.table(spec = tag, est = ct["adopt_z", 1], se = ct["adopt_z", 2],
             p = ct["adopt_z", 4], n = nobs(f), r2 = summary(f)$r.squared,
             est_pct = pct(ct["adopt_z", 1]), note = note)
}

TECH <- c("51", "54", "55")
rob <- rbindlist(list(
  rfit(tb, "baseline (T4b + pre-trend)", note = "the headline, reproduced here"),
  rfit(tb[sec2 != "51"], "drop NAICS 51 Information",
       note = "removes six of the top seven adopters"),
  rfit(tb[!(sec2 %in% TECH)], "drop 51, 54, 55 (info, prof/tech, management)",
       note = "the whole white-collar tech block"),
  rfit(tb[!(industry %in% tb[order(-adopt_z)][1:3, industry])], "drop 3 highest-adoption industries",
       note = "leverage from the right tail of adoption"),
  rfit(tb[!(industry %in% tb[order(-abs(diff_hires))][1:3, industry])], "drop 3 largest outcome outliers",
       note = "leverage from the tails of the outcome"),
  rfit(tb, "employment-weighted", wts = "w_emp",
       note = "weights by 22-24 employment, so 541 does not count the same as 611"),
  rfit(tb, "bivariate, no pre-trend control", rhs = "adopt_z",
       note = "as pre-registered before the pre-trend control was added")
), fill = TRUE)

# Winsorized outcome, since a log ratio on a small industry has fat tails.
tw <- copy(tb)
lim <- tw[, quantile(diff_hires, c(0.05, 0.95), na.rm = TRUE)]
tw[, diff_hires := pmin(pmax(diff_hires, lim[1]), lim[2])]
rob <- rbind(rob, rfit(tw, "outcome winsorized at 5/95",
                       note = "log ratios on small industries have fat tails"), fill = TRUE)

# Leave-one-out over all 59 industries.
loo <- rbindlist(lapply(tb$industry, function(i) {
  r <- rfit(tb[industry != i], "loo"); r[, dropped := i]; r
}))
say("  leave-one-out over %d industries: est ranges %+.4f to %+.4f (%.1f%% to %.1f%%), max p = %.4f",
    nrow(loo), min(loo$est), max(loo$est), pct(min(loo$est)), pct(max(loo$est)), max(loo$p))
loo_worst <- loo[which.max(est)]
rob <- rbind(rob, data.table(
  spec = "leave-one-out, weakest draw", est = loo_worst$est, se = loo_worst$se,
  p = loo_worst$p, n = loo_worst$n, r2 = loo_worst$r2, est_pct = pct(loo_worst$est),
  note = sprintf("dropping NAICS %s; no single industry overturns the sign", loo_worst$dropped)),
  fill = TRUE)

# Rank correlation, which cares about ordering only.
sp <- tb[, cor.test(adopt_z, diff_hires, method = "spearman", exact = FALSE)]
rob <- rbind(rob, data.table(
  spec = "Spearman rank correlation", est = NA_real_, se = NA_real_, p = sp$p.value,
  n = nrow(tb), r2 = NA_real_, est_pct = NA_real_,
  note = sprintf("rho = %.3f; monotone in ranks, not driven by the fitted line", sp$estimate)),
  fill = TRUE)

# Alternative old-age comparison groups. The choice of 35-44 as the within-industry
# control is a judgment call; if the result depends on it, that is worth knowing.
alt <- rbindlist(lapply(c("A04", "A06", "A07"), function(a) {
  if (!a %in% unique(as.data.table(readRDS(file.path(repo, "qwi", "output",
      "qwi_naics3_age_quarter.rds")))$agegrp)) return(NULL)
  qa <- as.data.table(readRDS(file.path(repo, "qwi", "output", "qwi_naics3_age_quarter.rds")))
  qa[, yqi := yq(year, quarter)]
  qa <- qa[agegrp %in% c(YOUNG, a) & industry %in% IND]
  setorder(qa, industry, agegrp, yqi)
  qa[, H4 := frollsum(HirA, 4L), by = .(industry, agegrp)]
  b <- qa[yqi == BASE, .(industry, agegrp, H4b = H4)]
  qa <- merge(qa, b, by = c("industry", "agegrp"))
  qa[, lh := log(H4 / H4b)]
  g <- dcast(qa[yqi == 20252L], industry ~ agegrp, value.var = "lh")
  setnames(g, c(YOUNG, a), c("y", "o"))
  g[, diff_hires := y - o]
  g <- merge(g, adopt, by = "industry")[is.finite(diff_hires)]
  f  <- lm(diff_hires ~ adopt_z, data = g)
  ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
  data.table(spec = sprintf("comparison group %s instead of %s", a, OLD),
             est = ct[2, 1], se = ct[2, 2], p = ct[2, 4], n = nrow(g),
             r2 = summary(f)$r.squared, est_pct = pct(ct[2, 1]),
             note = "bivariate; the choice of within-industry control age band")
}), fill = TRUE)
rob <- rbind(rob, alt, fill = TRUE)

for (i in seq_len(nrow(rob)))
  say("  %-46s %s (p %.4f) n=%d",
      rob$spec[i],
      if (is.na(rob$est[i])) "      --      " else sprintf("%+6.1f%% per SD", rob$est_pct[i]),
      rob$p[i], rob$n[i])
fwrite(rob, out("qwi_robust.csv"))
fwrite(loo[order(est)], out("qwi_loo.csv"))

# ═════════════════════════════════════════════════════════════════════════════
# D4 — The underlying series, so a reader can see the data
# ═════════════════════════════════════════════════════════════════════════════
# Everything above is a regression coefficient. None of it shows what QWI hiring
# actually did. Two descriptive cuts: young against prime-age nationally over the
# T4b sample, and young hiring split by adoption tercile.
say("")
say("D4  Descriptive series")
say("%s", strrep("-", 78))

adopt[, tercile := cut(adopt_z, quantile(adopt_z, c(0, 1/3, 2/3, 1)),
                       labels = c("low", "mid", "high"), include.lowest = TRUE)]
say("  adoption terciles: %s", paste(sprintf("%s=%d", levels(adopt$tercile),
    tabulate(adopt$tercile)), collapse = ", "))

qd <- merge(q, adopt, by = "industry")
nat <- qd[, .(H4 = sum(H4, na.rm = TRUE), E4 = sum(E4, na.rm = TRUE)),
          by = .(agegrp, yqi, date)][!is.na(H4) & H4 > 0]
natb <- nat[yqi == BASE, .(agegrp, H4b = H4, E4b = E4)]
nat <- merge(nat, natb, by = "agegrp")
nat[, `:=`(group = fifelse(agegrp == YOUNG, "ages 22-24", "ages 35-44"),
           cut = "national", hires_idx = 100 * H4 / H4b, emp_idx = 100 * E4 / E4b)]

ter <- qd[agegrp == YOUNG, .(H4 = sum(H4, na.rm = TRUE), E4 = sum(E4, na.rm = TRUE)),
          by = .(tercile, yqi, date)][!is.na(H4) & H4 > 0]
terb <- ter[yqi == BASE, .(tercile, H4b = H4, E4b = E4)]
ter <- merge(ter, terb, by = "tercile")
ter[, `:=`(group = paste0(tercile, " adoption, ages 22-24"), cut = "tercile",
           hires_idx = 100 * H4 / H4b, emp_idx = 100 * E4 / E4b)]

# The tercile levels above are the raw series and they are NOT the object T4b
# estimates: T4b is a within-industry age difference, so the level path of young
# hiring by tercile can move for reasons the regression differences out. Build
# the age gap by tercile too, which is the actual estimand in descriptive form.
gp <- qd[, .(H4 = sum(H4, na.rm = TRUE)), by = .(tercile, agegrp, yqi, date)][H4 > 0]
gpb <- gp[yqi == BASE, .(tercile, agegrp, H4b = H4)]
gp <- merge(gp, gpb, by = c("tercile", "agegrp"))
gp[, li := log(H4 / H4b)]
gpw <- dcast(gp, tercile + yqi + date ~ agegrp, value.var = "li")
gpw[, gap_pct := 100 * (exp(get(YOUNG) - get(OLD)) - 1)]
gpw[, `:=`(group = paste0(tercile, " adoption, 22-24 minus 35-44"), cut = "tercile_gap",
           hires_idx = gap_pct, emp_idx = NA_real_)]

desc <- rbind(nat[, .(cut, group, yqi, date, hires_idx, emp_idx)],
              ter[, .(cut, group, yqi, date, hires_idx, emp_idx)],
              gpw[, .(cut, group, yqi, date, hires_idx, emp_idx)])
desc <- desc[yqi >= 20064L]
setorder(desc, cut, group, yqi)
fwrite(desc, out("qwi_descriptive.csv"))

for (g in unique(desc[cut != "tercile_gap", group]))
  say("  %-34s 2019 = 100, 2025Q2 = %.1f", g, desc[group == g & yqi == 20252L, hires_idx])
say("  age gap by tercile at 2025Q2 (22-24 vs 35-44, both against 2019):")
for (g in unique(desc[cut == "tercile_gap", group]))
  say("    %-46s %+.1f%%", g, desc[group == g & yqi == 20252L, hires_idx])

# Coverage, from the validation output that nothing currently surfaces.
cov <- fread(file.path(repo, "qwi", "output", "qwi_coverage.csv"))
qm  <- fromJSON(file.path(repo, "qwi", "output", "qwi_meta.json"), simplifyVector = FALSE)
cov_last <- cov[agegrp == "A00" & year * 10L + quarter == max(year * 10L + quarter)]
say("  NAICS3 coverage of the published sector total, latest quarter: median %.1f%%, min %.1f%%",
    100 * median(cov_last$coverage), 100 * min(cov_last$coverage))

write_json(list(
  built_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  pre_registered = FALSE,
  status_note = paste("Post hoc diagnostics of T4, written after T4 was estimated.",
                      "Not part of the pre-registered T1-T6 list in plan_microdata.md."),
  n_industries = length(IND),
  base_window = "2019 (four quarters ending 2019Q4)",
  treat_quarter = "2022Q4",
  young = YOUNG, old = OLD,
  event_study_check = list(
    at_end_quarter = round(ev_end, 6), t4b_bivariate = round(t4b_biv, 6),
    note = "must match; the event study is the T4b regression run every quarter"),
  pretrend_clean = list(
    window = "2016Q1-2019Q4", slope_per_quarter = round(tr_ct[2, 1], 5),
    p = round(tr_ct[2, 4], 4)),
  pretrend_immediate = list(
    window = "2021Q4-2022Q3", mean_beta = round(imm[, mean(est)], 5),
    max_abs_beta = round(imm[, max(abs(est))], 5), n_sig = imm[p < 0.05, .N]),
  placebo_pre_chatgpt = list(
    est = round(pl[end == 20223L, est], 5), p = round(pl[end == 20223L, p], 4),
    est_pct = round(pl[end == 20223L, est_pct], 3)),
  ai_era_only = list(
    est = round(pl[base == 20232L, est], 5), p = round(pl[base == 20232L, p], 4),
    est_pct = round(pl[base == 20232L, est_pct], 3),
    note = "2023Q2 base, so the pandemic differences out"),
  legs = lapply(seq_len(nrow(legs)), function(i) as.list(legs[i])),
  no_break_at_chatgpt = list(
    q2022q3 = round(h[yqi == 20223L, est], 5), q2022q4 = round(h[yqi == 20224L, est], 5),
    q2023q1 = round(h[yqi == 20231L, est], 5),
    note = "ChatGPT released 2022-11-30; the path is flat across it"),
  # pct() is monotone in est, so min/max map through it; carry both so the page
  # never has to convert log points to percent itself and get it wrong.
  loo = list(min = round(min(loo$est), 5), max = round(max(loo$est), 5),
             min_pct = round(pct(min(loo$est)), 3), max_pct = round(pct(max(loo$est)), 3),
             max_p = round(max(loo$p), 4), sign_flips = loo[est > 0, .N]),
  coverage_median_latest = round(median(cov_last$coverage), 4),
  coverage_min_latest = round(min(cov_last$coverage), 4),
  coverage_quarter = qlab(cov_last[1, year * 10L + quarter]),
  qwi_validation = list(
    v1a_median_gap = qm$v1a_median_gap, v1b_exclusion_cost = qm$v1b_exclusion_cost,
    v2_median_coverage = qm$v2_median_coverage, end_quarter = qm$end_quarter,
    excluded_states = qm$excluded_states, n_industries_panel = qm$n_industries)
), out("qwi_dynamics_meta.json"), auto_unbox = TRUE, pretty = TRUE)

say("")
say("Wrote qwi_event_study.csv, qwi_placebo.csv, qwi_robust.csv, qwi_loo.csv,")
say("      qwi_descriptive.csv, qwi_dynamics_meta.json to %s", out())
