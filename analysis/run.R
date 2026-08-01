#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# run.R — build a published contract.
#
#   Rscript analysis/run.R --list                 what exists, and what feeds it
#   Rscript analysis/run.R jobs-displacement      rebuild one contract
#   Rscript analysis/run.R --refresh btos         include the network fetch
#   Rscript analysis/run.R all                    every contract, offline
#
# Each contract is a list of scripts run in order. That is the whole design:
# no dependency graph, no caching layer, nothing hidden. If you want to know
# what a command does, read the list below and then read those files.
#
# --refresh adds the fetch step. Without it nothing touches the network, which
# is what makes a rebuild reproducible: same inputs in, same numbers out.
# ─────────────────────────────────────────────────────────────────────────────

.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

CONTRACTS <- list(
  `jobs-displacement` = list(
    js      = "data/jobs-displacement-data.js",
    cards   = "Job Displacement 01 (Okun), 02 (age x education)",
    fetch   = "fetch/fred.R",
    build   = c("clean/cps_age_education.R",
                "exhibits/jobs_01_okun.R",
                "exhibits/jobs_02_age_bands.R",
                "publish/jobs_displacement.R"),
    # The CPS collapse re-parses an 818 MB extract; skip it unless asked.
    # `slow` maps a script to the output that proves it already ran.
    slow    = list(`clean/cps_age_education.R` = c("cps", "age_month_totals.csv"))
  ),
  btos = list(
    js      = "data/btos-data.js",
    cards   = "Adoption 01, 03, 04, 05, 06",
    fetch   = "fetch/btos.R",
    build   = c("clean/btos_survey.R", "clean/btos_supplement.R",
                "exhibits/adoption_01_aggregate.R", "exhibits/adoption_03_who.R",
                "exhibits/adoption_04_what_for.R", "exhibits/adoption_05_where.R",
                "exhibits/adoption_06_jobs.R", "publish/btos.R")
  ),
  `btos-exposure` = list(
    js      = "data/btos-exposure-data.js",
    cards   = "Adoption 02 (adoption against occupational exposure)",
    fetch   = "fetch/exposure.R",
    build   = c("clean/exposure.R", "clean/btos_qwi_join.R",
                "exhibits/adoption_02_exposure.R", "publish/btos_exposure.R")
  ),
  `btos-jobs-monitor` = list(
    js      = "data/btos-jobs-monitor-data.js",
    cards   = "Job Displacement 03 (industries), 04 (hiring flows)",
    fetch   = "fetch/ces_jolts.R",
    build   = c("clean/ces_jolts.R",
                "exhibits/jobs_03_industries.R",
                "exhibits/jobs_04_flows.R",
                "publish/btos_jobs_monitor.R"),
    # clean/ces_jolts.R reuses interim/bls/*_slim.rds unless told otherwise, so
    # a rebuild is seconds. After a new BLS vintage the slim extracts have to be
    # re-derived from a 3.8 GB file; --refresh asks for that.
    refresh_args = list(`clean/ces_jolts.R` = "--reslim")
  ),
  `jobs-young-workers` = list(
    js      = "data/jobs-young-workers-data.js",
    cards   = "Job Displacement 05 (early-career hiring, QWI x BTOS)",
    fetch   = "fetch/qwi.R",
    build   = c("clean/qwi.R", "clean/btos_qwi_join.R",
                "exhibits/jobs_05_young_workers.R",
                "publish/jobs_young_workers.R"),
    # clean/qwi.R reassembles ~100 state pulls into the national panel; skip it
    # unless asked, the same way the CPS collapse is skipped above.
    slow    = list(`clean/qwi.R` = c("qwi", "qwi_naics3_age_quarter.rds"))
  )
)

# Everything is ported. Kept as an empty list rather than deleted so `--list`
# keeps its shape if a contract is ever staged here again.
PENDING <- list()

args    <- commandArgs(trailingOnly = TRUE)
refresh <- "--refresh" %in% args
targets <- setdiff(args, c("--refresh", "--list"))

if ("--list" %in% args || !length(targets)) {
  cat("\nContracts built by this runner:\n\n")
  for (n in names(CONTRACTS)) {
    c_ <- CONTRACTS[[n]]
    cat(sprintf("  %-18s -> %s\n%22s%s\n", n, c_$js, "", c_$cards))
    for (s in c_$build) cat(sprintf("%22ssrc/%s\n", "", s))
    cat(sprintf("%22s(--refresh also runs src/%s)\n\n", "", c_$fetch))
  }
  if (length(PENDING)) {
    cat("Not yet ported into analysis/ -- still run from the old tree:\n\n")
    for (n in names(PENDING)) {
      p <- PENDING[[n]]
      cat(sprintf("  %-18s -> %s\n%22s%s\n%22sRscript %s\n\n",
                  n, p$js, "", p$cards, "", p$where))
    }
  }
  quit(status = 0)
}

if (identical(targets, "all")) targets <- names(CONTRACTS)

unknown <- setdiff(targets, names(CONTRACTS))
if (length(unknown)) {
  extra <- intersect(unknown, names(PENDING))
  if (length(extra))
    stop("Not yet ported into analysis/: ", paste(extra, collapse = ", "),
         "\n  Run it from the old tree: ", PENDING[[extra[1]]]$where,
         "\n  See analysis/run.R --list", call. = FALSE)
  stop("Unknown contract: ", paste(unknown, collapse = ", "),
       "\n  Try: Rscript analysis/run.R --list", call. = FALSE)
}

run_one <- function(rel, extra = character()) {
  path <- analysis_path("src", rel)
  if (!file.exists(path)) stop("Missing script: ", path, call. = FALSE)
  cat(sprintf("\n=== %s%s ===\n", rel,
              if (length(extra)) paste0(" ", paste(extra, collapse = " ")) else ""))
  st <- system2("Rscript", c(shQuote(path), extra))
  if (st != 0) stop("Failed: src/", rel, call. = FALSE)
}

for (n in targets) {
  c_ <- CONTRACTS[[n]]
  cat(sprintf("\n%s\n%s -> %s\n%s\n", strrep("=", 70), n, c_$js, strrep("=", 70)))
  if (refresh) run_one(c_$fetch)
  for (s in c_$build) {
    sentinel <- c_$slow[[s]]
    if (!refresh && !is.null(sentinel) && file.exists(interim_path(sentinel[1], sentinel[2]))) {
      cat(sprintf("\n=== %s (skipped: %s already present, --refresh to redo) ===\n",
                  s, sentinel[2]))
      next
    }
    run_one(s, if (refresh) unlist(c_$refresh_args[[s]]) else character())
  }
  cat(sprintf("\n%s built. Commit %s\n", n, c_$js))
}
