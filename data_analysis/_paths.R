# ─────────────────────────────────────────────────────────────────────────────
# _paths.R — the only place in the repo that resolves directories.
#
# Nothing in this repository may hard-code a path containing a user name. Source
# this at the top of any script that needs to know where it is:
#
#   source(file.path(dirname(dirname(normalizePath(
#     sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
#   ))), "data_analysis", "_paths.R"))
#
# or, more simply, from a script two levels below the repo root:
#
#   .file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
#   source(file.path(dirname(dirname(normalizePath(.file))), "_paths.R"))
#
# Defines:
#   REPO_ROOT     the repository root (contains index.html and data/)
#   DA_ROOT       <REPO_ROOT>/data_analysis
#   repo_path()   paths under the repo root      e.g. repo_path("data", "btos-data.js")
#   da_path()     paths under data_analysis/     e.g. da_path("job_data", "ces.RDS")
#
# Note the two meanings of "data", which is the one real trap in this layout:
#   repo_path("data")  = the site's publish directory, committed  (data/*.js)
#   da_path("data")    = the ignored IPUMS input cache            (cps.dat.gz)
# ─────────────────────────────────────────────────────────────────────────────

local({
  # Where is this file? Works under Rscript (--file=), source(), and RStudio.
  a <- commandArgs(trailingOnly = FALSE)
  f <- sub("^--file=", "", a[grep("^--file=", a)])
  if (!length(f)) f <- tryCatch(sys.frame(1)$ofile, error = function(e) NULL)
  if (!length(f) || !nzchar(f)) f <- tryCatch(
    normalizePath(sys.frames()[[1]]$ofile), error = function(e) NULL)

  base <- if (length(f) && nzchar(f)) dirname(normalizePath(f)) else normalizePath(getwd())

  # Walk up until we find the directory that CONTAINS data_analysis/.
  while (!dir.exists(file.path(base, "data_analysis")) && dirname(base) != base) {
    base <- dirname(base)
  }
  if (!dir.exists(file.path(base, "data_analysis"))) {
    stop("_paths.R: could not locate the repo root starting from ",
         if (length(f) && nzchar(f)) f else getwd(),
         ". Run scripts with Rscript from anywhere inside the repo.",
         call. = FALSE)
  }

  assign("REPO_ROOT", base, envir = globalenv())
  assign("DA_ROOT", file.path(base, "data_analysis"), envir = globalenv())
})

repo_path <- function(...) file.path(REPO_ROOT, ...)
da_path   <- function(...) file.path(DA_ROOT, ...)
