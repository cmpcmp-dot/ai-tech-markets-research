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
    slow    = "clean/cps_age_education.R"
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
  )
)

# Not yet ported out of data_analysis/. Named here so `--list` tells the truth
# about what this runner does and does not cover yet.
PENDING <- list(
  `btos-jobs-monitor` = list(
    js    = "data/btos-jobs-monitor-data.js",
    cards = "Job Displacement 03 (industries), 04 (flows)",
    where = "data_analysis/btos/{03_jobs_join,run_jobs}.R"),
  `jobs-young-workers` = list(
    js    = "data/microdata.js",
    cards = "Job Displacement 05 (early-career hiring)",
    where = "data_analysis/micro/{03_tests_industry,06_qwi_dynamics,run_micro}.R")
)

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

run_one <- function(rel) {
  path <- analysis_path("src", rel)
  if (!file.exists(path)) stop("Missing script: ", path, call. = FALSE)
  cat(sprintf("\n=== %s ===\n", rel))
  st <- system2("Rscript", shQuote(path))
  if (st != 0) stop("Failed: src/", rel, call. = FALSE)
}

for (n in targets) {
  c_ <- CONTRACTS[[n]]
  cat(sprintf("\n%s\n%s -> %s\n%s\n", strrep("=", 70), n, c_$js, strrep("=", 70)))
  if (refresh) run_one(c_$fetch)
  for (s in c_$build) {
    if (!refresh && !is.null(c_$slow) && s %in% c_$slow &&
        file.exists(interim_path("cps", "age_month_totals.csv"))) {
      cat(sprintf("\n=== %s (skipped: collapse already present, --refresh to redo) ===\n", s))
      next
    }
    run_one(s)
  }
  cat(sprintf("\n%s built. Commit %s\n", n, c_$js))
}
