#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# Adoption, card 06 — "Do adopters say it cost anyone a job?"
#
# The employment-effect block of the Census AI Supplement: among firms using
# AI, the share reporting employment increased, decreased, or was unchanged.
#
# This is self-reported, firm-weighted, and asked only of adopters, so it is
# evidence about what adopting firms say rather than a measure of displacement.
# A firm that slowed hiring rather than cutting staff answers "no change".
#
# Reads   interim/btos/supplement.json
# Writes  interim/cards/adoption_06_jobs.json
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

write_card(list(supplement_jobs = list(employment_effect = supp$employment_effect)),
           "adoption_06_jobs", digits = 4)

say("  %d employment-effect categories", length(supp$employment_effect))
