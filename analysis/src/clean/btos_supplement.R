#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# clean/btos_supplement.R — parse the Census BTOS AI Supplement workbook.
#
# The core biweekly BTOS series carries only two AI questions. The supplement
# is a separate one-time workbook covering the 2025-11-17..2026-02-08 cycle,
# published on the Downloads page rather than the JSON API, and it is where the
# interesting detail lives: which business functions AI is used for, which
# GenAI tasks, what firms say the employment effect was, what stops the rest.
#
# It is one Census product read by three cards (Adoption "who", "what for" and
# "jobs"), which is why it is parsed once here rather than sharded across them.
#
# Everything is computed directly from that public workbook. Nothing is sourced
# from restricted microdata or a working paper, and nothing is imputed.
#
# Reads   inputs/btos/AI_Supplement_Table_2026.xlsx
#         src/lookups/naics_titles.csv
# Writes  interim/btos/btos_ai_supplement_long.csv   tidy, one row per estimate
#         interim/btos/supplement.json               the eight display blocks
#
#   Rscript analysis/src/clean/btos_supplement.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressMessages({
  library(dplyr); library(tidyr); library(readr); library(readxl)
  library(purrr); library(lubridate); library(jsonlite)
})

raw_dir <- input_path("btos")
out_dir <- ensure_dir(interim_path("btos"))

# Employment size class labels (A-G). Source: BTOS "Employment Size Class.xlsx"
# Data Dictionary sheet (verified 2026-07-26). Not available from the API.
EMPSIZE_LABELS <- c(A = "1-4", B = "5-9", C = "10-19", D = "20-49",
                    E = "50-99", F = "100-249", G = "250+")

naics_titles <- read_csv(lookup_path("naics_titles.csv"), col_types = "cc")

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

# ── Build, check, write ──────────────────────────────────────────────────────
SUPPLEMENT <- build_supplement()
if (is.null(SUPPLEMENT))
  stop("No supplement workbook found under ", raw_dir,
       "\n  How to get it: Rscript analysis/src/fetch/btos.R", call. = FALSE)

# The firm-weighted headline is the one number with an external plausibility
# range. The block checks below are schema guards: an empty block means the
# workbook layout moved and the parse silently produced nothing.
fw <- SUPPLEMENT$headline$current
if (length(fw) != 1 || is.na(fw) || fw < 5 || fw > 40)
  stop(sprintf("Supplement firm-weighted headline implausible: %s", paste(fw, collapse = ",")))
for (k in c("size_gradient", "sector_adoption", "business_functions",
            "genai_tasks", "employment_effect", "barriers"))
  if (length(SUPPLEMENT[[k]]) == 0) stop("Supplement block empty: ", k)

# The size gradient must increase: larger firms adopt more. That gradient is the
# whole point of the chart, and it is the substitute for the employment-weighted
# adoption number Census does not publish. Fail if it ever flips.
sg <- SUPPLEMENT$size_gradient
a_share <- sg[[which(vapply(sg, function(x) x$class == "A", logical(1)))]]$share
g_share <- sg[[which(vapply(sg, function(x) x$class == "G", logical(1)))]]$share
if (is.na(a_share) || is.na(g_share) || g_share <= a_share)
  stop(sprintf("Size gradient not increasing: A=%s, G=%s", a_share, g_share))

write_json(SUPPLEMENT, file.path(out_dir, "supplement.json"),
           auto_unbox = TRUE, pretty = TRUE, na = "null", digits = 4)

say("  current use %.1f%% (A=%.1f%%, G=%.1f%%)", fw, a_share, g_share)
say("  %d functions, %d GenAI tasks, %d sectors, %d barriers",
    length(SUPPLEMENT$business_functions), length(SUPPLEMENT$genai_tasks),
    length(SUPPLEMENT$sector_adoption), length(SUPPLEMENT$barriers))
say("Wrote %s", file.path(out_dir, "supplement.json"))
