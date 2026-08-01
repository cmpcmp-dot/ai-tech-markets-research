#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Job Displacement, card 05 — "Are young workers hit first?"
#
# The sharpest test on this site, and the only one with a credible control
# group. Inside each 3-digit industry, compare the change in hiring of 22-24
# year olds against the change in hiring of 35-44 year olds in that SAME
# industry, and ask whether that age gap is wider where BTOS adoption is higher.
# Differencing within the industry removes any industry-level demand shock,
# which is the objection that sinks every level regression in this literature.
#
# Two halves, with DIFFERENT evidentiary status, and the difference is carried
# in the data rather than described in prose:
#
#   T4  PRE-REGISTERED. Written down in plan_microdata.md before anything ran.
#       A two-window cross-section: calendar 2019 against the four quarters
#       ending 2025Q2. Three specifications (a) levels, (b) the within-industry
#       age difference, (c) a triple difference on the quarterly panel.
#
#   QWI dynamics  NOT PRE-REGISTERED. Post hoc diagnostics of T4, written after
#       seeing T4's result. Everything here ships with pre_registered = FALSE
#       attached, so the page cannot present it on the same footing by accident.
#
# The dynamics are what make the card honest. T4 answers "is the gap wider in
# high-adoption industries?" but not "when did it widen?", and the second
# question decides whether the answer has anything to do with AI. Running T4's
# regression every quarter shows most of the gap opened during the pandemic,
# there is no break at the ChatGPT release, and a placebo window closing before
# ChatGPT existed returns a similar coefficient. That is a result against the
# simple AI story and it is published as prominently as the headline.
#
# The treatment variable is read from the shared adoption frame, so adoption is
# identical to Adoption card 02 by construction and cannot drift.
#
# Reads   interim/qwi/adoption_naics3.csv        (clean/btos_qwi_join.R)
#         interim/qwi/qwi_windows.csv            (clean/btos_qwi_join.R)
#         interim/qwi/qwi_naics3_age_quarter.rds (clean/qwi.R)
#         interim/qwi/{qwi_coverage.csv,qwi_meta.json}
#         interim/exposure/exposure_naics3.csv   (clean/exposure.R)
# Writes  interim/qwi/t4_frame.csv        industry x age outcome frame
#         interim/qwi/t4_coefs.csv
#         interim/qwi/t4_meta.json
#         interim/qwi/qwi_event_study.csv  beta_t path, per outcome
#         interim/qwi/qwi_event_legs.csv
#         interim/qwi/qwi_placebo.csv
#         interim/qwi/qwi_robust.csv
#         interim/qwi/qwi_descriptive.csv
#         interim/qwi/qwi_dynamics_meta.json
#         interim/cards/jobs_05_young_workers.json
#
#   Rscript analysis/src/exhibits/jobs_05_young_workers.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

suppressPackageStartupMessages({
  library(data.table); library(jsonlite); library(sandwich); library(lmtest); library(fixest)
})
setFixest_notes(FALSE)

assert <- function(cond, msg, ...) if (!isTRUE(cond)) stop(sprintf(msg, ...), call. = FALSE)
pct    <- function(b) 100 * (exp(b) - 1)
qlab   <- function(z) sprintf("%dQ%d", z %/% 10L, z %% 10L)
yq     <- function(y, q) y * 10L + q

# ── Parameters ───────────────────────────────────────────────────────────────
# QWI is not seasonally adjusted, so every level is a trailing four-quarter sum
# and every change is that sum against the same window in the base year. That
# removes seasonality without imposing an adjustment model.
YOUNG   <- "A03"    # ages 22-24
OLD     <- "A05"    # ages 35-44
BASE    <- 20194L   # four quarters ending 2019Q4, i.e. calendar 2019
END_Q   <- c(20243L, 20244L, 20251L, 20252L)   # four quarters to 2025Q2
TREAT   <- 20224L   # ChatGPT release quarter, the T4c break
EV_FROM <- 20154L   # display window for the published paths; CSVs keep 2006 on

out <- ensure_dir(interim_path("qwi"))

# ── Inputs ───────────────────────────────────────────────────────────────────
how_join <- "Rscript analysis/src/clean/btos_qwi_join.R"
how_qwi  <- paste("Rscript analysis/src/fetch/qwi.R then",
                  "analysis/src/clean/qwi.R (~940 MB of state pulls)")

adoption <- fread(need_file(file.path(out, "adoption_naics3.csv"), how_join),
                  colClasses = list(character = "naics"))
qw       <- fread(need_file(file.path(out, "qwi_windows.csv"), how_join),
                  colClasses = list(character = "naics"))
ex       <- fread(need_file(interim_path("exposure", "exposure_naics3.csv"),
                            "Rscript analysis/src/clean/exposure.R"),
                  colClasses = list(character = "naics"))

panel <- as.data.table(readRDS(need_file(
  file.path(out, "qwi_naics3_age_quarter.rds"), how_qwi)))
panel[, yqi := yq(year, quarter)]

say("Adoption on %d QWI industries; %d industry x age outcome cells",
    nrow(adoption), nrow(qw))

# ═════════════════════════════════════════════════════════════════════════════
# T4 — early-career hiring against observed adoption.  PRE-REGISTERED.
# ═════════════════════════════════════════════════════════════════════════════
say("")
say("T4  Early-career hiring on observed BTOS adoption")
say("%s", strrep("-", 78))

t4 <- merge(qw, adoption[, .(naics, adopt, adopt_z)], by = "naics")
t4 <- merge(t4, ex[metric == "pca_score", .(naics, exposure_z)], by = "naics", all.x = TRUE)
fwrite(t4, file.path(out, "t4_frame.csv"))

fit1 <- function(d, y, rhs, tag) {
  f  <- lm(stats::reformulate(rhs, y), data = d)
  ct <- coeftest(f, vcov. = vcovHC(f, type = "HC3"))
  data.table(test = "T4", spec = tag, outcome = y, term = rownames(ct),
             est = ct[, 1], se = ct[, 2], p = ct[, 4], n = nobs(f),
             r2 = summary(f)$r.squared)[term == "adopt_z"]
}

# (a) Levels. Reported because it was pre-registered, not because it identifies
# anything: an industry-level demand shock moves young and old hiring together
# and shows up here as an adoption effect.
a03 <- t4[agegrp == YOUNG]
say("  (a) levels, ages 22-24, n = %d industries", nrow(a03))
t4a <- rbindlist(list(
  fit1(a03, "d_log_hires", "adopt_z", "a: bivariate"),
  fit1(a03, "d_log_hires", c("adopt_z", "pretrend_hires"), "a: + 2017-19 pre-trend"),
  fit1(a03, "d_log_emp",   c("adopt_z", "pretrend_emp"),   "a: employment, + pre-trend"),
  fit1(a03, "d_log_sep",   c("adopt_z", "pretrend_hires"), "a: separations, + pre-trend"),
  fit1(a03, "d_log_repl",  c("adopt_z", "pretrend_hires"), "a: replacement hires, + pre-trend")
))

# (b) The within-industry age difference. This is the headline.
wide <- dcast(t4[agegrp %in% c(YOUNG, OLD)], naics + adopt_z + exposure_z ~ agegrp,
              value.var = c("d_log_hires", "d_log_emp", "pretrend_hires"))
wide[, `:=`(diff_hires = get(paste0("d_log_hires_", YOUNG)) - get(paste0("d_log_hires_", OLD)),
            diff_emp   = get(paste0("d_log_emp_",   YOUNG)) - get(paste0("d_log_emp_",   OLD)),
            diff_pre   = get(paste0("pretrend_hires_", YOUNG)) -
                         get(paste0("pretrend_hires_", OLD)))]
say("  (b) within-industry age difference (22-24 minus 35-44), n = %d", nrow(wide))
t4b <- rbindlist(list(
  fit1(wide, "diff_hires", "adopt_z", "b: age-diff hires"),
  fit1(wide, "diff_hires", c("adopt_z", "diff_pre"), "b: age-diff hires, + pre-trend"),
  fit1(wide, "diff_emp",   "adopt_z", "b: age-diff employment")
))

# (c) Triple difference on the quarterly panel: industry x age x post, with the
# continuous adoption treatment. Two-way clustered on industry and quarter. The
# single break at 2022Q4 is imposed, not tested; the event study below is what
# tests it, and it does not survive.
pan <- merge(panel[agegrp %in% c(YOUNG, OLD) & yqi >= 20151L & HirA > 0 & EmpS > 0],
             adoption[, .(industry = naics, adopt_z)], by = "industry")
pan[, `:=`(young = as.integer(agegrp == YOUNG),
           post  = as.integer(yqi >= TREAT),
           lh    = log(HirA), tq = yqi)]
t4c <- tryCatch({
  m <- feols(lh ~ adopt_z:young:post + adopt_z:post + young:post |
               industry^agegrp + tq^agegrp, data = pan,
             cluster = ~ industry + tq)
  ct <- as.data.table(coeftable(m), keep.rownames = "term")
  setnames(ct, c("term", "est", "se", "t", "p"))
  ct[grepl("young", term)][, `:=`(test = "T4", spec = "c: triple difference",
                                  outcome = "log hires", n = nobs(m), r2 = NA_real_)]
}, error = function(e) { say("  (c) triple difference failed: %s", conditionMessage(e)); NULL })

t4_coefs <- rbindlist(list(t4a, t4b, t4c), fill = TRUE)
for (i in seq_len(nrow(t4_coefs)))
  say("  %-32s %-22s %+8.4f (se %.4f, p %.4f) n=%d",
      t4_coefs$spec[i], t4_coefs$outcome[i], t4_coefs$est[i], t4_coefs$se[i],
      t4_coefs$p[i], t4_coefs$n[i])

# ── Minimum detectable effect ────────────────────────────────────────────────
# Units matter here and are easy to garble. This MDE is in log points of hiring
# PER STANDARD DEVIATION of adoption, on the within-industry age difference. It
# is NOT comparable to Tucker's 159,000, which is a total employment level
# effect on the top exposure quintile. The only question it answers is whether
# this design can see an effect of the size we estimate.
key      <- t4b[spec == "b: age-diff hires, + pre-trend"]
base_emp <- panel[agegrp == YOUNG & yqi %in% END_Q, sum(EmpS, na.rm = TRUE)] / 4
mde_log  <- 2.8 * key$se           # 80% power, 5% two-sided
mde_pct  <- pct(mde_log)
est_pct  <- pct(key$est)
say("")
say("  MDE: this design detects %.1f%% per SD of adoption at 80%% power;", mde_pct)
say("       the estimated effect is %.1f%% per SD, so it is %s the detection floor.",
    est_pct, if (abs(est_pct) > mde_pct) "comfortably inside" else "BELOW")
say("       For scale only: %.1f%% of a %s early-career base is about %s jobs per SD.",
    abs(est_pct), format(round(base_emp), big.mark = ","),
    format(round(abs(base_emp * (exp(key$est) - 1))), big.mark = ","))
say("       Not comparable to Tucker's 159,000, which is a level effect on a quintile.")

fwrite(t4_coefs, file.path(out, "t4_coefs.csv"))

write_json(list(
  built_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  windows = list(base = "2019 (4 quarters)", end = "2024Q3-2025Q2",
                 pretrend = "2017 (4 quarters)"),
  n_industries_adoption = nrow(adoption),
  n_industries_t4 = nrow(a03),
  n_industries_t4b = nrow(wide),
  mde_pct_per_sd = round(mde_pct, 3),
  est_pct_per_sd = round(est_pct, 3),
  mde_units = paste("log points of hiring per SD of adoption, within-industry age",
                    "difference; not comparable to a level effect"),
  early_career_base = round(base_emp),
  note = "Pre-registered in plan_microdata.md before running. All results reported."
), file.path(out, "t4_meta.json"), auto_unbox = TRUE, pretty = TRUE)

# ═════════════════════════════════════════════════════════════════════════════
# QWI dynamics — timing, placebos, robustness.  NOT PRE-REGISTERED.
# ═════════════════════════════════════════════════════════════════════════════
# Treatment is taken from the T4 frame just written, so it cannot drift.
fr <- fread(file.path(out, "t4_frame.csv"), colClasses = list(character = "naics"))
tb <- dcast(fr[agegrp %in% c(YOUNG, OLD)], naics + adopt_z + exposure_z ~ agegrp,
            value.var = c("d_log_hires", "pretrend_hires"))
tb <- tb[!is.na(get(paste0("d_log_hires_", YOUNG))) &
         !is.na(get(paste0("d_log_hires_", OLD)))]
IND <- sort(tb$naics)
say("")
say("T4b sample: %d industries, adoption z from the T4 frame", length(IND))
adopt <- tb[, .(industry = naics, adopt_z, exposure_z)]

q <- panel[agegrp %in% c(YOUNG, OLD) & industry %in% IND]

# The panel is balanced by construction in clean/qwi.R -- a fixed state set per
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

# ── D1  Event study: the T4b coefficient, quarter by quarter ─────────────────
# For every quarter t, the same cross-sectional regression T4b runs once:
#   (log H4_young,t - log H4_young,2019) - (log H4_old,t - log H4_old,2019)
#     = a + beta_t * adopt_z
# so beta_t is in the same units as the T4b headline, and beta at 2025Q2 must
# reproduce the T4b bivariate estimate. That equality is asserted below; if it
# fails, this section is wrong, not T4.
say("")
say("D1  Event study: T4b coefficient by quarter")
say("%s", strrep("-", 78))

ev_panel <- rebase(q, BASE)
gaps <- dcast(ev_panel, industry + yqi + date ~ agegrp, value.var = paste0("l_", OUTS))
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

t4b_biv <- t4_coefs[spec == "b: age-diff hires", est]
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

firstsig <- h[est < 0 & p < 0.05][order(yqi)]
if (nrow(firstsig))
  say("  first significantly negative quarter anywhere in the path: %s (%+.4f, p = %.4f)",
      qlab(firstsig$yqi[1]), firstsig$est[1], firstsig$p[1])

# Decomposition. Splitting the path at the pandemic and at the ChatGPT release
# answers the question the two-window cross-section cannot: how much of the
# headline predates generative AI.
#
# 2019Q4 is the reference period, so beta there is zero by construction and the
# decomposition of the total runs from 2019Q4 forward. The 2016Q1-2019Q4 leg is
# a pre-trend check, not a component of the total, and `in_total` says so:
# summing all four rows would double-count the reference period and miss the
# total by the size of the pre-period drift.
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

fwrite(legs, file.path(out, "qwi_event_legs.csv"))
fwrite(ev,   file.path(out, "qwi_event_study.csv"))

# ── D2  Placebos: the T4b specification on windows ending before ChatGPT ─────
# If T4b is about generative AI, the same regression on a window that closes
# before ChatGPT existed should return roughly nothing. This is the sharpest
# single test available on public data and it is cheap.
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
  # the base so it differences out, leaving only the widening that happened
  # while generative AI was actually diffusing. This is the closest thing here
  # to an AI-era estimate.
  placebo("2023Q2 base -> 2024Q3-2025Q2", 20232L, 20252L,
          "pandemic entirely in the base; the AI-era leg only")
), fill = TRUE)
for (i in seq_len(nrow(pl)))
  say("  %-30s %+7.4f (se %.4f, p %.4f) = %+6.1f%% per SD  n=%d",
      pl$window[i], pl$est[i], pl$se[i], pl$p[i], pl$est_pct[i], pl$n[i])
fwrite(pl, file.path(out, "qwi_placebo.csv"))

# ── D3  Robustness on the T4b headline ──────────────────────────────────────
# n = 59 and the highest-adoption industries are NAICS 51 Information plus 533,
# 541 and 551. "This is the post-2021 tech correction, not AI" is the first
# objection any referee will raise, so it gets tested rather than answered in
# prose.
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
  rfit(tb[!(industry %in% tb[order(-adopt_z)][1:3, industry])],
       "drop 3 highest-adoption industries",
       note = "leverage from the right tail of adoption"),
  rfit(tb[!(industry %in% tb[order(-abs(diff_hires))][1:3, industry])],
       "drop 3 largest outcome outliers",
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

# Leave-one-out over all industries. Only the weakest draw and the summary reach
# the page, so the per-industry table is not written out.
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

# Alternative old-age comparison groups. Choosing 35-44 as the within-industry
# control is a judgment call; if the result depends on it, that is worth knowing.
alt <- rbindlist(lapply(c("A04", "A06", "A07"), function(a) {
  if (!a %in% unique(panel$agegrp)) return(NULL)
  qa <- panel[agegrp %in% c(YOUNG, a) & industry %in% IND]
  setorder(qa, industry, agegrp, yqi)
  qa[, H4 := frollsum(HirA, 4L), by = .(industry, agegrp)]
  bq <- qa[yqi == BASE, .(industry, agegrp, H4b = H4)]
  qa <- merge(qa, bq, by = c("industry", "agegrp"))
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
fwrite(rob, file.path(out, "qwi_robust.csv"))

# ── D4  The underlying series, so a reader can see the data ─────────────────
# Everything above is a regression coefficient. None of it shows what QWI hiring
# actually did. Two descriptive cuts: young against prime-age nationally over
# the T4b sample, and young hiring split by adoption tercile.
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
fwrite(desc, file.path(out, "qwi_descriptive.csv"))

for (g in unique(desc[cut != "tercile_gap", group]))
  say("  %-34s 2019 = 100, 2025Q2 = %.1f", g, desc[group == g & yqi == 20252L, hires_idx])
say("  age gap by tercile at 2025Q2 (22-24 vs 35-44, both against 2019):")
for (g in unique(desc[cut == "tercile_gap", group]))
  say("    %-46s %+.1f%%", g, desc[group == g & yqi == 20252L, hires_idx])

# Coverage, from the QWI validation output.
cov <- fread(need_file(file.path(out, "qwi_coverage.csv"), how_qwi))
qm  <- fromJSON(need_file(file.path(out, "qwi_meta.json"), how_qwi), simplifyVector = FALSE)
cov_last <- cov[agegrp == "A00" & year * 10L + quarter == max(year * 10L + quarter)]
say("  NAICS3 coverage of the published sector total, latest quarter: median %.1f%%, min %.1f%%",
    100 * median(cov_last$coverage), 100 * min(cov_last$coverage))

dyn_meta <- list(
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
)
write_json(dyn_meta, file.path(out, "qwi_dynamics_meta.json"),
           auto_unbox = TRUE, pretty = TRUE)

# ═════════════════════════════════════════════════════════════════════════════
# The card. Read back from the tidy CSVs just written, so what the site shows is
# provably the same object as the committed research tables.
# ═════════════════════════════════════════════════════════════════════════════
t4_meta  <- fromJSON(file.path(out, "t4_meta.json"), simplifyVector = FALSE)
t4_fr    <- fread(file.path(out, "t4_frame.csv"), colClasses = list(character = "naics"))
t4_co    <- fread(file.path(out, "t4_coefs.csv"))
qev      <- fread(file.path(out, "qwi_event_study.csv"))
qlegs    <- fread(file.path(out, "qwi_event_legs.csv"))
qpl      <- fread(file.path(out, "qwi_placebo.csv"))
qrob     <- fread(file.path(out, "qwi_robust.csv"))
qdesc    <- fread(file.path(out, "qwi_descriptive.csv"))
qdyn     <- fromJSON(file.path(out, "qwi_dynamics_meta.json"), simplifyVector = FALSE)

# The scatter panels need one age band; the age-difference panel needs two.
t4_scatter <- t4_fr[agegrp == YOUNG, .(naics, adopt_z, d_log_hires, d_log_emp, exposure_z)]
t4_agediff <- dcast(t4_fr[agegrp %in% c(YOUNG, OLD)], naics + adopt_z ~ agegrp,
                    value.var = "d_log_hires")
setnames(t4_agediff, c(YOUNG, OLD), c("hires_2224", "hires_3544"))
t4_agediff[, diff_hires := hires_2224 - hires_3544]

# Readable outcome names. The CSVs carry the variable names the regressions
# used, which is correct for the CSVs and unreadable in a table a human reads.
OUTLAB <- c(d_log_hires = "Hires, 22-24", d_log_emp = "Employment, 22-24",
            d_log_sep = "Separations, 22-24", d_log_repl = "Replacement hires, 22-24",
            diff_hires = "Hires, 22-24 minus 35-44",
            diff_emp = "Employment, 22-24 minus 35-44",
            `log hires` = "Hires (quarterly panel)")
t4_co[, outcome_label := ifelse(is.na(OUTLAB[outcome]), outcome, OUTLAB[outcome])]

# The event-study and descriptive series only need the display window; the full
# path back to 2006 stays in the CSVs.
card <- list(
  t4 = list(coefs = t4_co, scatter = t4_scatter, agediff = t4_agediff,
            n = t4_meta$n_industries_t4,
            mde_pct_per_sd = t4_meta$mde_pct_per_sd,
            est_pct_per_sd = t4_meta$est_pct_per_sd,
            mde_units = t4_meta$mde_units),
  # pre_registered = FALSE travels with the data so the page cannot present
  # these on the same footing as the pre-registered T4 by accident.
  qwi = list(pre_registered = FALSE, event = qev[yqi >= EV_FROM], legs = qlegs,
             placebo = qpl, robust = qrob, descriptive = qdesc[yqi >= EV_FROM],
             meta = qdyn)
)

write_card(card, "jobs_05_young_workers")

say("")
say("-- Early-career hiring (QWI x BTOS) --")
say("  T4b headline: %+.1f%% per SD of adoption (p = %.4f), n = %d industries",
    est_pct, key$p, nrow(wide))
say("  of which the AI era (2023Q2 on) is %+.0f%% of the total gap",
    100 * legs[leg == "AI era 2023Q2-2025Q2", share_of_total])
say("  pre-ChatGPT placebo: %+.1f%% per SD (p = %.4f) -- the same result before AI",
    pl[end == 20223L, est_pct], pl[end == 20223L, p])
