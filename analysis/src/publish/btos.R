#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# publish/btos.R — assemble data/btos-data.js
#
#   window.BTOS_DATA = { ... }
#
# Read by index.html and drawn by assets/adoption-charts.js: the whole Adoption
# tab. Survey-level metadata comes from clean/btos_survey.R; each chart block
# comes from the exhibit that owns it.
#
# `supplement` is reassembled here from four card fragments. It is one Census
# workbook read by three cards, so it is parsed once in clean/ and sharded to
# the cards that display it; this puts the eight blocks back in the key order
# the committed contract has always used.
#
# Dropped in the analysis/ refactor: `expectations_vs_realized`. It was
# computed and published, but renderExpect() in adoption-charts.js targets an
# element (#adExpect) that does not exist in index.html, so no reader has ever
# seen it.
#
#   Rscript analysis/src/publish/btos.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

meta <- fromJSON(need_file(interim_path("btos", "survey_meta.json"),
                           "Rscript analysis/src/clean/btos_survey.R"),
                 simplifyVector = FALSE)

aggregate <- read_card("adoption_01_aggregate")
who       <- read_card("adoption_03_who")
what_for  <- read_card("adoption_04_what_for")
where     <- read_card("adoption_05_where")
jobs      <- read_card("adoption_06_jobs")

payload <- list(
  vintage        = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z"),
  source         = meta$source,
  n_periods      = meta$n_periods,
  break_date     = meta$break_date,
  latest_date    = meta$latest_date,
  shutdown_gap   = meta$shutdown_gap,
  weighting      = meta$weighting,
  empsize_labels = meta$empsize_labels,
  headline_now   = meta$headline_now,
  headline       = aggregate$headline,
  diffusion      = who$diffusion,
  size_class     = who$size_class,
  subsector      = who$subsector,
  geography      = where$geography,
  supplement     = list(
    meta               = aggregate$supplement_meta,
    headline           = aggregate$supplement_headline,
    size_gradient      = who$supplement_who$size_gradient,
    sector_adoption    = who$supplement_who$sector_adoption,
    business_functions = what_for$supplement_what_for$business_functions,
    genai_tasks        = what_for$supplement_what_for$genai_tasks,
    employment_effect  = jobs$supplement_jobs$employment_effect,
    barriers           = what_for$supplement_what_for$barriers
  )
)

target <- publish_path("btos-data.js")
write_js(payload, "BTOS_DATA", target, "Rscript analysis/run.R btos",
         digits = 4, na = "null")

say("Wrote %s (%s bytes)", target, format(file.info(target)$size, big.mark = ","))
