# ─────────────────────────────────────────────────────────────────────────────
# paths.R — the only place in this repository that resolves a directory.
#
# No script may hard-code a path containing a user name. Every script instead
# locates this file by walking up from its own position, using this four-line
# header (copy it verbatim; it works under Rscript, source(), and RStudio):
#
#   .f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
#   .d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
#   while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
#   source(file.path(.d, "R", "paths.R"))
#
# Defines:
#   ANALYSIS_ROOT   <repo>/analysis
#   REPO_ROOT       the repository root (contains index.html and data/)
#
#   input_path()    analysis/inputs/     raw downloads         NOT committed
#   interim_path()  analysis/interim/    built intermediates   NOT committed
#   card_path()     analysis/interim/cards/  one JSON per card NOT committed
#   frozen_path()   analysis/frozen/     small, irreplaceable  COMMITTED
#   lookup_path()   analysis/src/lookups/  hand-maintained     COMMITTED
#   publish_path()  <repo>/data/         what index.html reads COMMITTED
#
# The old layout had two directories called "data" and its own docs called that
# "the one genuine trap." Nothing under analysis/ is named data. The only
# "data" in this repository is the site's publish directory, at the repo root.
# ─────────────────────────────────────────────────────────────────────────────

local({
  a <- commandArgs(trailingOnly = FALSE)
  f <- sub("^--file=", "", a[grep("^--file=", a)])
  if (!length(f)) f <- tryCatch(sys.frame(1)$ofile, error = function(e) NULL)
  base <- if (length(f) && nzchar(f)) dirname(normalizePath(f)) else normalizePath(getwd())

  # Walk up to the directory that contains R/paths.R -- that is analysis/.
  while (!file.exists(file.path(base, "R", "paths.R")) && dirname(base) != base) {
    base <- dirname(base)
  }
  if (!file.exists(file.path(base, "R", "paths.R"))) {
    stop("paths.R: could not locate analysis/ starting from ",
         if (length(f) && nzchar(f)) f else getwd(),
         ".\nRun scripts with Rscript from anywhere inside the repository.",
         call. = FALSE)
  }

  assign("ANALYSIS_ROOT", base,          envir = globalenv())
  assign("REPO_ROOT",     dirname(base), envir = globalenv())
})

analysis_path <- function(...) file.path(ANALYSIS_ROOT, ...)
input_path    <- function(...) file.path(ANALYSIS_ROOT, "inputs", ...)
interim_path  <- function(...) file.path(ANALYSIS_ROOT, "interim", ...)
card_path     <- function(...) file.path(ANALYSIS_ROOT, "interim", "cards", ...)
frozen_path   <- function(...) file.path(ANALYSIS_ROOT, "frozen", ...)
lookup_path   <- function(...) file.path(ANALYSIS_ROOT, "src", "lookups", ...)
publish_path  <- function(...) file.path(REPO_ROOT, "data", ...)

# Create a directory on demand and return it, so a script can write without a
# separate dir.create() line.
ensure_dir <- function(p) {
  dir.create(p, showWarnings = FALSE, recursive = TRUE)
  p
}

# Progress logging. Scripts print what they did; nothing here is silent.
say <- function(fmt, ...) cat(sprintf(fmt, ...), "\n", sep = "")

# Stop with a message that tells the reader how to fix it, rather than a bare
# "cannot open file". Used wherever a script depends on an uncommitted input.
need_file <- function(path, how) {
  if (!file.exists(path))
    stop("Missing ", path, "\n  How to get it: ", how,
         "\n  See analysis/INPUTS.md", call. = FALSE)
  path
}
