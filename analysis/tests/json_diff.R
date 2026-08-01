# ─────────────────────────────────────────────────────────────────────────────
# json_diff.R — recursive numeric-aware comparison of two parsed JSON objects.
#
# Sourced by compare_golden.R (published contracts) and compare_json.R (any two
# files). Numbers compare on relative difference against TOL rather than
# identity, because a value that survives a round-trip through JSON at 6
# significant digits is not bit-identical to the double that produced it.
#
# Keys named in IGNORE_KEYS are skipped wherever they appear: they hold a
# wall-clock stamp and differ on every run by construction.
# ─────────────────────────────────────────────────────────────────────────────

TOL <- 1e-9
IGNORE_KEYS <- c("vintage", "generated", "vintage_utc", "built")

new_report <- function() {
  r <- new.env(parent = emptyenv())
  r$diffs <- character(); r$declared <- character()
  r
}

note <- function(rep, fmt, ...) rep$diffs <- c(rep$diffs, sprintf(fmt, ...))

# `allowed` is a character vector of top-level keys whose absence from `c` is
# a deliberate decision rather than a regression.
cmp <- function(g, c, path, rep, allowed = character()) {
  if (is.null(c) && !is.null(g)) {
    key <- sub("^\\$", "", path)
    if (key %in% allowed) rep$declared <- c(rep$declared, key)
    else note(rep, "REMOVED   %s", path)
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
    if (is.null(gn) && is.null(cn)) {
      if (length(g) != length(c)) {
        note(rep, "LENGTH    %s: golden %d, current %d", path, length(g), length(c))
        return(invisible())
      }
      for (i in seq_along(g)) cmp(g[[i]], c[[i]], sprintf("%s[%d]", path, i), rep, allowed)
    } else {
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

# Print a report and return TRUE if it passed.
report_out <- function(rep, allowed = character(), label = "", max_show = 40) {
  if (length(rep$declared))
    cat(sprintf("  declared removals: %s\n", paste(unique(rep$declared), collapse = ", ")))
  still <- setdiff(allowed, unique(rep$declared))
  if (length(still))
    cat(sprintf("  note: still present, expected gone: %s\n", paste(still, collapse = ", ")))
  if (length(rep$diffs)) {
    cat(sprintf("  FAIL: %d difference(s)\n", length(rep$diffs)))
    for (d in head(rep$diffs, max_show)) cat("    ", d, "\n", sep = "")
    if (length(rep$diffs) > max_show)
      cat(sprintf("     ... and %d more\n", length(rep$diffs) - max_show))
    return(FALSE)
  }
  cat("  PASS: every value identical\n")
  TRUE
}
