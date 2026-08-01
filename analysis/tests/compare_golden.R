#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# compare_golden.R — prove the refactor did not move a published number.
#
# Compares each generated data/*.js against a snapshot taken before the
# refactor. Every number must match to TOL. The only differences allowed are
# the ones declared in ALLOWED_REMOVALS below, each of which is a key we
# deliberately stopped publishing because nothing on the site rendered it.
#
#   Rscript analysis/tests/compare_golden.R <golden_dir>
#
# Exits 0 if the only differences are declared, 1 otherwise. Prints every
# difference it finds; it does not stop at the first one, because when a join
# breaks you want to see the shape of the damage, not one cell of it.
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages(library(jsonlite))

TOL <- 1e-9

# Keys whose value is a wall-clock stamp: expected to differ on every run.
IGNORE_KEYS <- c("vintage", "generated", "vintage_utc", "built")

# golden file -> (current file, global name in the current build)
FILES <- list(
  "jobs-displacement-data.js"  = "jobs-displacement-data.js",
  "btos-data.js"               = "btos-data.js",
  "btos-exposure-data.js"      = "btos-exposure-data.js",
  "btos-jobs-monitor-data.js"  = "btos-jobs-monitor-data.js",
  "microdata.js"               = "jobs-young-workers-data.js"
)

# Top-level keys we deliberately stopped publishing. Anything removed that is
# NOT on this list is a regression.
ALLOWED_REMOVALS <- list(
  "jobs-displacement-data.js" = "ces_slowdown",
  "btos-data.js"              = "expectations_vs_realized",
  "btos-jobs-monitor-data.js" = "monitor",
  "microdata.js"              = c("replication", "t1", "t2", "t3", "t5", "t6",
                                  "goldman", "sources")
)

# ── Parse `window.NAME = { ... };` into an R list ────────────────────────────
read_js <- function(path) {
  txt <- paste(readLines(path, warn = FALSE), collapse = "\n")
  txt <- sub("^\\s*(//[^\n]*\n)+", "", txt)          # drop banner comments
  txt <- sub("^\\s*window\\.[A-Za-z0-9_]+\\s*=\\s*", "", txt)
  txt <- sub(";\\s*$", "", txt)
  fromJSON(txt, simplifyVector = FALSE)
}

# ── Recursive comparison ─────────────────────────────────────────────────────
new_report <- function() new.env(parent = emptyenv())
note <- function(rep, fmt, ...) {
  msg <- sprintf(fmt, ...)
  rep$diffs <- c(rep$diffs, msg)
}

cmp <- function(g, c, path, rep, allowed) {
  # A declared removal at the top level: golden has it, current does not.
  if (is.null(c) && !is.null(g)) {
    key <- sub("^\\$", "", path)
    if (key %in% allowed) {
      rep$declared <- c(rep$declared, key)
    } else {
      note(rep, "REMOVED   %s", path)
    }
    return(invisible())
  }
  if (is.null(g) && !is.null(c)) { note(rep, "ADDED     %s", path); return(invisible()) }
  if (is.null(g) && is.null(c))  return(invisible())

  gl <- is.list(g); cl <- is.list(c)
  if (gl != cl) {
    note(rep, "TYPE      %s: golden %s, current %s", path, class(g)[1], class(c)[1])
    return(invisible())
  }

  if (gl) {
    gn <- names(g); cn <- names(c)
    if (is.null(gn) && is.null(cn)) {                 # unnamed array
      if (length(g) != length(c)) {
        note(rep, "LENGTH    %s: golden %d, current %d", path, length(g), length(c))
        return(invisible())
      }
      for (i in seq_along(g)) cmp(g[[i]], c[[i]], sprintf("%s[%d]", path, i), rep, allowed)
    } else {                                          # object
      for (k in union(gn, cn)) {
        if (k %in% IGNORE_KEYS) next
        cmp(if (k %in% gn) g[[k]] else NULL,
            if (k %in% cn) c[[k]] else NULL,
            if (path == "$") paste0("$", k) else paste0(path, ".", k),
            rep, allowed)
      }
    }
    return(invisible())
  }

  # Scalars
  if (is.numeric(g) && is.numeric(c)) {
    if (length(g) != length(c)) {
      note(rep, "LENGTH    %s: golden %d, current %d", path, length(g), length(c))
    } else if (any(is.na(g) != is.na(c))) {
      note(rep, "NA        %s", path)
    } else {
      d <- abs(g - c); d[is.na(d)] <- 0
      rel <- d / pmax(abs(g), 1)
      if (any(rel > TOL))
        note(rep, "VALUE     %s: golden %s, current %s (rel %.3g)",
             path, format(g[which.max(rel)]), format(c[which.max(rel)]), max(rel))
    }
  } else if (!identical(as.character(g), as.character(c))) {
    gs <- paste(as.character(g), collapse = "|"); cs <- paste(as.character(c), collapse = "|")
    note(rep, "STRING    %s\n            golden : %s\n            current: %s",
         path, substr(gs, 1, 140), substr(cs, 1, 140))
  }
  invisible()
}

# ── Main ─────────────────────────────────────────────────────────────────────
args <- commandArgs(trailingOnly = TRUE)
if (!length(args)) stop("usage: compare_golden.R <golden_dir>", call. = FALSE)
golden_dir <- normalizePath(args[1], mustWork = TRUE)

.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

fail <- FALSE
for (gf in names(FILES)) {
  cf <- FILES[[gf]]
  gp <- file.path(golden_dir, gf)
  cp <- publish_path(cf)

  cat(sprintf("\n%s\n  golden  %s\n  current %s\n", cf, gp, cp))
  if (!file.exists(gp)) { cat("  SKIP: no golden snapshot\n"); next }
  if (!file.exists(cp)) { cat("  FAIL: not generated\n"); fail <- TRUE; next }

  rep <- new_report(); rep$diffs <- character(); rep$declared <- character()
  allowed <- if (!is.null(ALLOWED_REMOVALS[[gf]])) ALLOWED_REMOVALS[[gf]] else character()
  cmp(read_js(gp), read_js(cp), "$", rep, allowed)

  if (length(rep$declared))
    cat(sprintf("  declared removals: %s\n",
                paste(unique(rep$declared), collapse = ", ")))
  missing_removals <- setdiff(allowed, unique(rep$declared))
  if (length(missing_removals))
    cat(sprintf("  note: still present, expected gone: %s\n",
                paste(missing_removals, collapse = ", ")))

  if (length(rep$diffs)) {
    fail <- TRUE
    cat(sprintf("  FAIL: %d difference(s)\n", length(rep$diffs)))
    for (d in head(rep$diffs, 40)) cat("    ", d, "\n", sep = "")
    if (length(rep$diffs) > 40)
      cat(sprintf("     ... and %d more\n", length(rep$diffs) - 40))
  } else {
    cat("  PASS: every published number identical\n")
  }
}

cat("\n", strrep("-", 70), "\n", sep = "")
if (fail) { cat("RESULT: FAIL\n"); quit(status = 1) }
cat("RESULT: PASS\n")
