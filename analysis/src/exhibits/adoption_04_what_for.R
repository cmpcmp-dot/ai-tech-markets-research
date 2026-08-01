#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Adoption, card 04 — "What is AI actually doing inside these firms?"
#
# Three blocks of the Census AI Supplement: which business functions firms use
# AI for, which GenAI tasks specifically, and what stops the firms that do not
# use it. Selection and ordering only; the parse lives in
# clean/btos_supplement.R because the same workbook feeds three cards.
#
# Reads   interim/btos/supplement.json
# Writes  interim/cards/adoption_04_what_for.json
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))
source(analysis_path("R", "btos_frame.R"))

suppressMessages({ library(dplyr); library(tidyr); library(purrr); library(jsonlite) })

b <- btos_frame()
supp <- fromJSON(need_file(interim_path("btos", "supplement.json"),
                           "Rscript analysis/src/clean/btos_supplement.R"),
                 simplifyVector = FALSE)

write_card(list(
  supplement_what_for = list(
    business_functions = supp$business_functions,
    genai_tasks        = supp$genai_tasks,
    barriers           = supp$barriers
  )
), "adoption_04_what_for", digits = 4)

say("  %d functions, %d GenAI tasks, %d barriers",
    length(supp$business_functions), length(supp$genai_tasks), length(supp$barriers))
