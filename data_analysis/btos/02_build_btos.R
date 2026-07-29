#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# 02_build_btos.R  —  Stage 2 (pure transform; offline, deterministic).
#
# Reads the cached raw AI rows (btos/output/raw/period_*.json), builds one tidy
# long CSV, then the six Tier 1–2 chart objects for btos.html, and writes
#   btos/output/btos_ai_long.csv     (tidy provenance)
#   btos/output/btos_data.json       (the display contract)
#
# All series are the "Yes" share of the relevant AI question and are
# FIRM-WEIGHTED (the core biweekly series has no employment weight; that lives
# in the AI supplement, which is out of scope here).
#
# Two structural facts are handled explicitly and never spliced across:
#   * Wording break: Q6 changed from "...in producing goods or services" to
#     "...in any of its business functions", first collected 2025-11-17. Rows
#     are tagged old/new by the question text; segments are kept separate.
#   * Shutdown gap: no collection for ref. periods 2025-10-06..2025-11-16
#     (funding lapse). There are simply no period files there, and it coincides
#     with the wording break, so the old/new split already leaves the gap open.
#
# Build FAILS LOUDLY if sanity anchors drift (see ASSERTIONS below).
#
# Usage:  Rscript btos/02_build_btos.R   (run 01_fetch_btos.R first)
# ─────────────────────────────────────────────────────────────────────────────

suppressMessages({
  library(dplyr)
  library(tidyr)
  library(readr)
  library(readxl)
  library(purrr)
  library(lubridate)
  library(jsonlite)
})

.file    <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo     <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
out_dir  <- file.path(repo, "btos", "output")
raw_dir  <- file.path(out_dir, "raw")

TOL      <- 21    # days: tolerance when matching a period to a target date
SIX_MO   <- 182   # days ≈ six months, for expectations-vs-realization & diffusion

# Employment size class labels (A–G). Source: BTOS "Employment Size Class.xlsx"
# Data Dictionary sheet (verified 2026-07-26). Not available from the API.
EMPSIZE_LABELS <- c(A = "1-4", B = "5-9", C = "10-19", D = "20-49",
                    E = "50-99", F = "100-249", G = "250+")

# ── Tier 3 — AI supplement (parsed from the downloaded XLSX) ───────────────────
# The core biweekly series above is FIRM-WEIGHTED and carries only two AI
# questions. The AI supplement is a separate one-time workbook (Downloads page,
# NOT the JSON API) covering the 2025-11-17..2026-02-08 cycle. It adds business
# functions, augment/replace, barriers, GenAI task use, and the size/sector/state
# breakouts. Every number below is computed directly from that public workbook —
# nothing here is sourced from restricted microdata or a working paper. Scope
# (per its Data Dictionary): 1 = all firms, 2 = AI-using firms, 3 = task-
# substituting firms, 4 = GenAI users, 5 = plan to use, 6 = do not plan to use.
# Each question lives at exactly one scope.
#
# The workbook has NO employment-weighted number. What it does publish, and what
# we compute here, is firm-weighted adoption BY EMPLOYMENT SIZE CLASS (Q1 on the
# Employment sheet). That size gradient is the honest, public way to show that
# adoption concentrates in large employers — i.e. that the firm-weighted headline
# understates the share of *workers* at AI-using firms.
#
# `build_supplement()` parses all four strata (National, Sector, State,
# Employment size) into one tidy long frame, writes it to CSV, and derives the
# display objects from that same frame.

# Answer-metric column names differ between single-select questions (value in
# `Estimate`) and multi/select-all questions (values in Estimate-Yes/No/Don't-
# know). Map both onto a tidy `metric` column so nothing is lost.
SUPP_METRIC <- c(est = "estimate", est_yes = "yes", est_no = "no", est_dk = "dont_know",
                 se  = "estimate", se_yes  = "yes", se_no  = "no", se_dk  = "dont_know")

build_supplement <- function() {
  supp_file <- file.path(raw_dir, "AI_Supplement_Table_2026.xlsx")
  if (!file.exists(supp_file)) {
    message("  supplement XLSX not found; skipping Tier 3 (run 01_fetch_btos.R).")
    return(NULL)
  }
  pct <- function(x) {                      # "17.9%" -> 17.9 ; "S"/""/NA -> NA
    x <- as.character(x)
    ifelse(is.na(x) | x %in% c("S", ""), NA_real_,
           suppressWarnings(as.numeric(sub("%", "", x))))
  }

  # ── read one estimates + standard-error sheet pair into tidy long ───────────
  # Non-national sheets carry a leading stratum column (Sector / State / Empsize);
  # the national sheets do not, so we synthesise geo = "US". Footer rows (DRB
  # approval, source citation) have a non-numeric Question ID and are dropped by
  # the `grepl("^[0-9]+$", qid)` filter. Structurally-absent metric cells (empty)
  # are dropped; suppressed cells ("S") are KEPT with value NA and suppressed=TRUE.
  read_pair <- function(est_sheet, se_sheet, level, has_geo) {
    e_names <- c("scope","qid","question","aid","answer","est","est_yes","est_no","est_dk")
    s_names <- c("scope","qid","question","aid","answer","se","se_yes","se_no","se_dk")
    if (has_geo) { e_names <- c("geo", e_names); s_names <- c("geo", s_names) }
    ne <- read_excel(supp_file, est_sheet, col_names = FALSE, skip = 1,
                     col_types = "text", .name_repair = "minimal")
    se <- read_excel(supp_file, se_sheet,  col_names = FALSE, skip = 1,
                     col_types = "text", .name_repair = "minimal")
    names(ne)[seq_along(e_names)] <- e_names
    names(se)[seq_along(s_names)] <- s_names
    if (!has_geo) { ne$geo <- "US"; se$geo <- "US" }
    clean <- function(d) d %>%
      filter(!is.na(qid), grepl("^[0-9]+$", qid)) %>%
      mutate(scope = as.integer(scope), qid = as.integer(qid), aid = as.integer(aid))
    ne <- clean(ne); se <- clean(se)

    present <- function(x) !(is.na(x) | x == "")   # keep populated cells, incl. "S"
    e_long <- ne %>%
      select(geo, scope, qid, question, aid, answer, est, est_yes, est_no, est_dk) %>%
      pivot_longer(c(est, est_yes, est_no, est_dk), names_to = "mcol", values_to = "raw") %>%
      filter(present(raw)) %>%
      mutate(metric = unname(SUPP_METRIC[mcol]),
             suppressed = raw == "S",
             estimate = pct(raw)) %>%
      select(geo, scope, qid, question, aid, answer, metric, estimate, suppressed)
    s_long <- se %>%
      select(geo, scope, qid, aid, se, se_yes, se_no, se_dk) %>%
      pivot_longer(c(se, se_yes, se_no, se_dk), names_to = "mcol", values_to = "raw") %>%
      filter(present(raw)) %>%
      mutate(metric = unname(SUPP_METRIC[mcol]), se = pct(raw)) %>%
      select(geo, scope, qid, aid, metric, se)

    e_long %>%
      left_join(s_long, by = c("geo","scope","qid","aid","metric")) %>%
      mutate(geo_level = level) %>%
      select(geo_level, geo, scope, question_id = qid, question,
             answer_id = aid, answer, metric, estimate, se, suppressed)
  }

  supp_long <- bind_rows(
    read_pair("National Response Estimates",  "National Standard Errors",   "national", FALSE),
    read_pair("Sector Response Estimates",    "Sector Standard Errors",     "sector",   TRUE),
    read_pair("State Response Estimates",     "State Standard Errors",      "state",    TRUE),
    read_pair("Employment Response Estimates","Employment Standard Errors", "empsize",  TRUE)
  ) %>%
    arrange(geo_level, geo, question_id, answer_id, metric)

  # Tidy long CSV of the ENTIRE supplement — the play-with-it deliverable.
  write_csv(supp_long, file.path(out_dir, "btos_ai_supplement_long.csv"))

  # ── derive display objects from the same tidy frame ─────────────────────────
  nat <- supp_long %>% filter(geo_level == "national")
  # one share (+SE) per answer for a question, at a given metric, ordered as asked
  get_q <- function(df, q, metric_name = "estimate") df %>%
    filter(question_id == q, metric == metric_name) %>%
    arrange(answer_id) %>%
    transmute(label = answer, share = estimate, se = se)
  emit <- function(df) pmap(df, function(label, share, se)
    list(label = label, share = share, se = se))

  # Q1 (scope 1): firm-weighted headline current use. aid 1 = Yes.
  firm_now <- nat %>% filter(question_id == 1, answer_id == 1, metric == "estimate") %>%
    pull(estimate)
  # Q2 (scope 1, select-all): AI use by business function, share of ALL firms.
  business_functions <- get_q(nat, 2, "yes") %>% arrange(desc(share)) %>% emit()
  # Q10 (scope 4, GenAI users): which work tasks GenAI assists with, ranked.
  genai_tasks        <- get_q(nat, 10) %>% arrange(desc(share)) %>% emit()
  # Q6 (scope 2, AI users): effect on total employment. Keep questionnaire order.
  employment_effect  <- get_q(nat, 6) %>% emit()
  # Q13 (scope 6, non-adopters): barriers to adoption, ranked.
  barriers           <- get_q(nat, 13) %>% arrange(desc(share)) %>% emit()

  # Size gradient — Q1 "Yes" by employment size class (A–G). Public, and the
  # honest replacement for the (unavailable) employment-weighted headline.
  size_gradient <- supp_long %>%
    filter(geo_level == "empsize", question_id == 1, answer_id == 1, metric == "estimate",
           geo %in% names(EMPSIZE_LABELS)) %>%
    mutate(geo = factor(geo, levels = names(EMPSIZE_LABELS))) %>%
    arrange(geo) %>%
    transmute(class = as.character(geo), label = unname(EMPSIZE_LABELS[as.character(geo)]),
              share = estimate, se = se) %>%
    pmap(function(class, label, share, se)
      list(class = class, label = label, share = share, se = se))

  # Headline adoption by sector — Q1 "Yes" by 2-digit NAICS (exclude XX rollup).
  sector_adoption <- supp_long %>%
    filter(geo_level == "sector", question_id == 1, answer_id == 1, metric == "estimate",
           geo != "XX") %>%
    left_join(naics_titles, by = c("geo" = "code")) %>%
    transmute(code = geo, name = coalesce(title, geo), share = estimate, se = se) %>%
    arrange(desc(share)) %>%
    pmap(function(code, name, share, se)
      list(code = code, name = name, share = share, se = se))

  list(
    meta = list(
      file       = "AI_Supplement_Table_2026.xlsx",
      date_range = "2025-11-17 to 2026-02-08",
      source     = paste("US Census Bureau, BTOS AI Supplement (one-time module).",
                         "Firm-weighted. Downloadable XLSX; NOT in the biweekly JSON API.",
                         "Every figure here is computed from the public workbook."),
      note       = "Estimates are firm-weighted 'Yes' shares; 'S' cells are suppressed.",
      tidy_csv   = "btos/output/btos_ai_supplement_long.csv"
    ),
    headline           = list(current = firm_now),
    size_gradient      = size_gradient,
    sector_adoption    = sector_adoption,
    business_functions = business_functions,
    genai_tasks        = genai_tasks,
    employment_effect  = employment_effect,
    barriers           = barriers
  )
}
# naics_titles is loaded below; build_supplement() needs it, so build after load.

# ── Load raw AI rows + lookups ────────────────────────────────────────────────
raw_files <- list.files(raw_dir, pattern = "^period_.*\\.json$", full.names = TRUE)
if (length(raw_files) == 0) stop("No raw period files. Run 01_fetch_btos.R first.")

read_period <- function(f) {
  d <- fromJSON(f, simplifyDataFrame = TRUE)
  # Force the columns we use to character so bind_rows never fights on type.
  cols <- c("PERIOD_ID","DATE_RANGE","STATE","NAICS2","MSA","NAICS3","EMPSIZE",
            "ESTIMATE_PERCENTAGE","STANDARD_ERROR","QUESTION","ANSWER","OPTION_TEXT")
  d[cols] <- lapply(d[cols], as.character)
  d[cols]
}
raw <- map_dfr(raw_files, read_period)

strata <- fromJSON(file.path(raw_dir, "strata.json"), simplifyDataFrame = TRUE)
msa_names <- strata %>% filter(STRATA_TYPE == "msa") %>%
  select(code = STRATA_VALUE, name = DETAILS)
naics_titles <- read_csv(file.path(repo, "btos", "naics_titles.csv"),
                         col_types = "cc")

# Tier 3 supplement is parsed now (needs EMPSIZE_LABELS + naics_titles, both
# above). It also writes the tidy long supplement CSV as a side effect.
SUPPLEMENT <- build_supplement()

# ── Tidy long ────────────────────────────────────────────────────────────────
# One row per period × question × answer × stratum. Stratum is whichever of the
# five strata columns is set; rows with more than one set are cross-tabs we don't
# use here and are dropped.
strata_cols <- c("STATE","NAICS2","NAICS3","MSA","EMPSIZE")

long <- raw %>%
  mutate(
    date   = mdy(trimws(sub("-.*$", "", DATE_RANGE))),   # start of "m/d/Y - m/d/Y"
    est    = suppressWarnings(as.numeric(ESTIMATE_PERCENTAGE)),
    se     = suppressWarnings(as.numeric(STANDARD_ERROR)),
    option = OPTION_TEXT,                                 # "AI current" / "AI future"
    answer = ANSWER,
    wording = if_else(grepl("business functions", QUESTION, fixed = TRUE),
                      "new", "old"),
    n_strata = rowSums(!is.na(across(all_of(strata_cols)))),
    suppressed = is.na(est)
  ) %>%
  filter(n_strata <= 1) %>%
  mutate(
    strata_type = case_when(
      n_strata == 0 ~ "national",
      !is.na(STATE)   ~ "state",   !is.na(NAICS2) ~ "sector",
      !is.na(NAICS3)  ~ "subsector", !is.na(MSA)  ~ "msa",
      !is.na(EMPSIZE) ~ "empsize"
    ),
    strata_value = coalesce(STATE, NAICS2, NAICS3, MSA, EMPSIZE, NA_character_)
  ) %>%
  select(period = PERIOD_ID, date, option, answer, wording,
         strata_type, strata_value, est, se, suppressed) %>%
  arrange(date, strata_type, strata_value)

write_csv(long, file.path(out_dir, "btos_ai_long.csv"))

# The adoption metric everywhere is the "Yes" share.
yes <- long %>% filter(answer == "Yes")
nat <- yes %>% filter(strata_type == "national")

break_date <- nat %>% filter(option == "AI current", wording == "new") %>%
  summarise(m = min(date)) %>% pull(m)
latest_new <- nat %>% filter(option == "AI current", wording == "new") %>%
  summarise(m = max(date)) %>% pull(m)

# A few post-break periods re-ask the RETIRED old-wording question (e.g.
# 2026-03-09). Those readings belong to neither clean series — drop them from
# every chart (they remain in btos_ai_long.csv for provenance).
n_anom <- sum(yes$wording == "old" & yes$date >= break_date)
yes <- yes %>% filter(!(wording == "old" & date >= break_date))
nat <- nat %>% filter(!(wording == "old" & date >= break_date))
if (n_anom > 0) message(sprintf("  dropped %d post-break old-wording re-ask row(s)", n_anom))

# helper: value of a national "Yes" series nearest a target date, same regime
nearest_nat <- function(opt, target, regime, tol = TOL) {
  cand <- nat %>% filter(option == opt, wording == regime, !is.na(est))
  if (nrow(cand) == 0) return(NA_real_)
  i <- which.min(abs(as.numeric(cand$date - target)))
  if (abs(as.numeric(cand$date[i] - target)) > tol) return(NA_real_)
  cand$est[i]
}

# ── Chart 1: headline adoption (national), segmented by wording ───────────────
series_pts <- function(df) df %>% arrange(date) %>%
  transmute(date = format(date, "%Y-%m-%d"), est, se) %>%
  pmap(function(date, est, se) list(date = date, est = est, se = se))

headline <- list(
  current_old = series_pts(filter(nat, option == "AI current", wording == "old")),
  current_new = series_pts(filter(nat, option == "AI current", wording == "new")),
  future_old  = series_pts(filter(nat, option == "AI future",  wording == "old")),
  future_new  = series_pts(filter(nat, option == "AI future",  wording == "new"))
)

# ── Chart 2: expectations vs. realization (national) ──────────────────────────
# Pair each "AI future" expectation at date d with realized "AI current" ~6mo
# later. Flag pairs whose window crosses the wording break (not comparable).
exp_real <- nat %>% filter(option == "AI future", !is.na(est)) %>%
  transmute(expect_date = date, expected = est, exp_wording = wording) %>%
  rowwise() %>%
  mutate(
    realized = nearest_nat("AI current",
                           expect_date + SIX_MO,
                           regime = if_else(expect_date + SIX_MO >= break_date,
                                            "new", "old")),
    crosses_break = (expect_date < break_date) != ((expect_date + SIX_MO) < break_date)
  ) %>%
  ungroup() %>%
  filter(!is.na(realized)) %>%
  transmute(expect_date = format(expect_date, "%Y-%m-%d"),
            expected, realized, crosses_break) %>%
  pmap(function(expect_date, expected, realized, crosses_break)
    list(expect_date = expect_date, expected = expected,
         realized = realized, crosses_break = crosses_break))

# ── Chart 3: diffusion speed by sector (trailing 6/12-month change) ───────────
# Change is only meaningful within one wording regime; a 12-month window that
# crosses the break is set NA (currently the case for all sectors).
sector_yes <- yes %>% filter(strata_type == "sector", option == "AI current",
                             !is.na(est), strata_value != "XX")
nearest_sector <- function(code, target, tol = TOL) {
  cand <- sector_yes %>% filter(strata_value == code,
                                (target >= break_date) == (date >= break_date))
  if (nrow(cand) == 0) return(NA_real_)
  i <- which.min(abs(as.numeric(cand$date - target)))
  if (abs(as.numeric(cand$date[i] - target)) > tol) return(NA_real_)
  cand$est[i]
}
# A trailing change is valid only if BOTH endpoints are in the same wording
# regime as the latest reading — otherwise it splices across the rewording.
same_regime <- function(a, b) (a >= break_date) == (b >= break_date)
diffusion <- sector_yes %>%
  group_by(strata_value) %>%
  filter(date == max(date)) %>%          # latest obs per sector
  ungroup() %>%
  transmute(sector = strata_value, latest_date = date, latest = est) %>%
  left_join(naics_titles, by = c("sector" = "code")) %>%
  rowwise() %>%
  mutate(
    chg6  = if (same_regime(latest_date, latest_date - SIX_MO))
              latest - nearest_sector(sector, latest_date - SIX_MO) else NA_real_,
    chg12 = if (same_regime(latest_date, latest_date - 2 * SIX_MO))
              latest - nearest_sector(sector, latest_date - 2 * SIX_MO) else NA_real_
  ) %>%
  ungroup() %>%
  transmute(sector, name = coalesce(title, sector), latest,
            chg6, chg12) %>%
  arrange(desc(latest)) %>%
  pmap(function(sector, name, latest, chg6, chg12)
    list(sector = sector, name = name, latest = latest,
         chg6 = chg6, chg12 = chg12))

# ── Chart 4: adoption by employment size class (series over time) ─────────────
size_class <- yes %>% filter(strata_type == "empsize", option == "AI current") %>%
  group_by(strata_value) %>%
  group_map(~ list(
    class = .y$strata_value,
    label = unname(EMPSIZE_LABELS[.y$strata_value]),
    series = .x %>% arrange(date) %>%
      transmute(date = format(date, "%Y-%m-%d"), est, se,
                wording, suppressed) %>%
      pmap(function(date, est, se, wording, suppressed)
        list(date = date, est = est, se = se,
             wording = wording, suppressed = suppressed))
  )) %>%
  keep(~ .x$class %in% names(EMPSIZE_LABELS)) %>%
  (\(x) x[order(match(map_chr(x, "class"), names(EMPSIZE_LABELS)))])()

# ── Chart 5: subsector ranking (latest new-regime period) ─────────────────────
# Standard 3-digit NAICS only; BTOS aggregate/rollup codes (NNX, NN0, XXX) are
# excluded because they double-count and have no standard title.
std_subsector <- naics_titles$code[grepl("^[0-9]{3}$", naics_titles$code)]
sub_latest <- yes %>%
  filter(strata_type == "subsector", wording == "new",
         date == latest_new, strata_value %in% std_subsector)
subsector <- sub_latest %>%
  select(naics3 = strata_value, option, est, se, suppressed) %>%
  pivot_wider(names_from = option, values_from = c(est, se, suppressed)) %>%
  left_join(naics_titles, by = c("naics3" = "code")) %>%
  transmute(naics3, name = coalesce(title, naics3),
            current = `est_AI current`, current_se = `se_AI current`,
            future = `est_AI future`,
            suppressed = coalesce(`suppressed_AI current`, TRUE)) %>%
  arrange(desc(current)) %>%
  pmap(function(naics3, name, current, current_se, future, suppressed)
    list(naics3 = naics3, name = name, current = current,
         current_se = current_se, future = future, suppressed = suppressed))

# ── Chart 6: geography (latest new-regime period) ─────────────────────────────
states <- yes %>%
  filter(strata_type == "state", option == "AI current", wording == "new",
         date == latest_new, strata_value != "XX") %>%
  transmute(code = strata_value, est, se, suppressed) %>%
  arrange(desc(est)) %>%
  pmap(function(code, est, se, suppressed)
    list(code = code, est = est, se = se, suppressed = suppressed))

msas <- yes %>%
  filter(strata_type == "msa", option == "AI current", wording == "new",
         date == latest_new) %>%
  left_join(msa_names, by = c("strata_value" = "code")) %>%
  transmute(code = strata_value, name = coalesce(name, strata_value), est, se,
            suppressed) %>%
  arrange(desc(est)) %>%
  pmap(function(code, name, est, se, suppressed)
    list(code = code, name = name, est = est, se = se, suppressed = suppressed))

# ── ASSERTIONS (fail loudly on drift / schema change) ─────────────────────────
anchor <- function(period_id, expected, tol, what) {
  v <- nat %>% filter(period == period_id, option == "AI current") %>% pull(est)
  if (length(v) != 1 || is.na(v) || abs(v - expected) > tol)
    stop(sprintf("Sanity anchor failed: %s = %s, expected ~%.1f (±%.1f)",
                 what, paste(v, collapse=","), expected, tol))
  message(sprintf("  anchor OK: %s = %.1f%%", what, v))
}
anchor("31", 3.7, 1.0, "national AI-current Yes, period 31 (Sep 2023)")
anchor("84", 10.0, 1.5, "national AI-current Yes, period 84")

# Yes+No+Do-not-know ≈ 100 for the national headline, every period.
chk <- long %>% filter(strata_type == "national", option == "AI current") %>%
  group_by(period) %>% summarise(tot = sum(est, na.rm = TRUE), .groups = "drop") %>%
  filter(abs(tot - 100) > 0.6)
if (nrow(chk) > 0) stop("National AI-current answers do not sum to 100 in periods: ",
                        paste(chk$period, collapse = ", "))
# Ranges
if (any(yes$est < 0 | yes$est > 100, na.rm = TRUE)) stop("Estimate outside [0,100].")
if (any(long$se < 0, na.rm = TRUE)) stop("Negative standard error.")
if (is.na(break_date) || break_date < as.Date("2025-11-01") ||
    break_date > as.Date("2025-12-15"))
  stop("Wording break date implausible: ", break_date)
# Supplement (if present): firm-weighted headline must be a plausible share, and
# every chart block must be non-empty. All blocks are computed from the public
# workbook — there is no external constant to validate.
if (!is.null(SUPPLEMENT)) {
  fw <- SUPPLEMENT$headline$current
  if (length(fw) != 1 || is.na(fw) || fw < 5 || fw > 40)
    stop(sprintf("Supplement firm-weighted headline implausible: %s", paste(fw, collapse=",")))
  for (k in c("size_gradient","sector_adoption","business_functions",
              "genai_tasks","employment_effect","barriers"))
    if (length(SUPPLEMENT[[k]]) == 0) stop("Supplement block empty: ", k)
  # Size gradient must be monotone-ish: the largest class (G) should adopt more
  # than the smallest (A). This is the whole point of the chart; fail if it flips.
  sg <- SUPPLEMENT$size_gradient
  a_share <- sg[[which(vapply(sg, function(x) x$class == "A", logical(1)))]]$share
  g_share <- sg[[which(vapply(sg, function(x) x$class == "G", logical(1)))]]$share
  if (is.na(a_share) || is.na(g_share) || g_share <= a_share)
    stop(sprintf("Size gradient not increasing: A=%s, G=%s", a_share, g_share))
  message(sprintf(paste("  supplement OK: current use = %.1f%% (A=%.1f%%, G=%.1f%%),",
                        "%d functions, %d GenAI tasks, %d sectors, %d barriers"),
                  fw, a_share, g_share, length(SUPPLEMENT$business_functions),
                  length(SUPPLEMENT$genai_tasks), length(SUPPLEMENT$sector_adoption),
                  length(SUPPLEMENT$barriers)))
}
message("  all assertions passed.")

# ── Assemble display contract ─────────────────────────────────────────────────
latest_current <- nat %>% filter(option == "AI current", date == latest_new) %>% pull(est)
latest_future  <- nat %>% filter(option == "AI future") %>%
  filter(date == max(date)) %>% pull(est)

payload <- list(
  vintage = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"),
  source = list(
    api    = "https://www.census.gov/hfp/btos/api",
    note   = paste("Census Business Trends and Outlook Survey (BTOS), core",
                   "biweekly AI question. Firm-weighted 'Yes' share.",
                   "Experimental data product."),
    method = "Share answering Yes to the AI-use question, by stratum, per collection period."
  ),
  n_periods    = length(raw_files),
  break_date   = format(break_date, "%Y-%m-%d"),
  latest_date  = format(latest_new, "%Y-%m-%d"),
  shutdown_gap = list(start = "2025-10-06", end = "2025-11-16",
                      note = "No collection (funding lapse); coincides with the wording break."),
  weighting    = "firm-weighted (core series has no employment weight)",
  empsize_labels = as.list(EMPSIZE_LABELS),
  headline_now = list(current = latest_current, future = latest_future),
  headline     = headline,
  expectations_vs_realized = exp_real,
  diffusion    = diffusion,
  size_class   = size_class,
  subsector    = subsector,
  geography    = list(states = states, msas = msas),
  supplement   = SUPPLEMENT
)

write_json(payload, file.path(out_dir, "btos_data.json"),
           auto_unbox = TRUE, pretty = TRUE, na = "null", digits = 4)

cat(sprintf("\nWrote %s\n", file.path(out_dir, "btos_ai_long.csv")))
if (!is.null(SUPPLEMENT))
  cat(sprintf("Wrote %s\n", file.path(out_dir, "btos_ai_supplement_long.csv")))
cat(sprintf("Wrote %s\n", file.path(out_dir, "btos_data.json")))
cat(sprintf("── Summary ──\n  periods: %d | break: %s | latest: %s\n",
            length(raw_files), break_date, latest_new))
cat(sprintf("  latest national adoption (new wording): %.1f%% ; 6-mo expectation: %.1f%%\n",
            latest_current, latest_future))
cat(sprintf("  sectors: %d | subsectors ranked: %d | states: %d | MSAs: %d\n",
            length(diffusion), length(subsector), length(states), length(msas)))
