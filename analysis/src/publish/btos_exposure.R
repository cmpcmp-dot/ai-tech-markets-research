#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# publish/btos_exposure.R — assemble data/btos-exposure-data.js
#
#   window.BTOS_EXPOSURE = { vintage, source, exposure_meta, t1 }
#
# Read by index.html, drawn by assets/adoption-charts.js: Census BTOS card 02.
#
#   Rscript analysis/src/publish/btos_exposure.R
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))
source(analysis_path("R", "serialize.R"))

card <- read_card("adoption_02_exposure")

payload <- list(
  vintage = format(Sys.time(), "%Y-%m-%d %H:%M"),
  source = list(
    exposure = paste0("Budget Lab at Yale, AI-Effects replication (commit 4898eb3); composite PCA ",
                      "z-score over Felten-Raj-Seamans AIOE, Eloundou et al. GPT and human ratings, ",
                      "Eisfeldt-Schubert-Zhang total and core, and Microsoft AI applicability."),
    weighting = paste0("Occupation exposure aggregated to 3-digit NAICS using CPS 2021-22 ",
                       "occupation-by-industry employment shares (IPUMS basic monthly, WTFINL)."),
    adoption = paste0("BTOS 3-digit subsector AI-current Yes share, mean over the pre-break span ",
                      "(2023-09-11 to 2025-11-16), minimum 3 unsuppressed readings, pooled ",
                      "subsectors averaged with QWI employment weights.")
  ),
  exposure_meta = card$exposure_meta,
  t1            = card$t1
)

target <- publish_path("btos-exposure-data.js")
write_js(payload, "BTOS_EXPOSURE", target,
         "Rscript analysis/run.R btos-exposure", digits = 6)

say("Wrote %s (%s bytes, %d industries, %d metrics, %d periods)",
    target, format(file.info(target)$size, big.mark = ","),
    length(card$t1$scatter), length(card$t1$coefs), length(card$t1$over_time))
