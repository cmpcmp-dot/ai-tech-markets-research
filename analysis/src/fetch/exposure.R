#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# fetch/exposure.R — the Yale Budget Lab occupational AI-exposure indices.
#
# Reads the registry in src/lookups/exposure_sources.csv, downloads each file at
# its PINNED revision, and verifies its sha256 against the registry. A hash
# mismatch is a hard stop, not a warning: it means an upstream file changed under
# a pin that was supposed to be immutable, and every number downstream of it
# would move silently.
#
# A pin must be immutable. A branch name is not, and the script refuses one.
#
# Adding an index later (Webb pct_ai, a newer Eloundou vintage, the Anthropic
# Economic Index) is one row in the registry and nothing else. Run with --adopt
# to compute and record the sha256 for a new row whose hash is blank -- which
# forces you to look at the file once before trusting it forever.
#
# Reads   src/lookups/exposure_sources.csv
# Writes  inputs/exposure/<file>            never edited or regenerated
#         interim/exposure/download_manifest.json
#
#   Rscript analysis/src/fetch/exposure.R [--out=<dir>] [--adopt] [--force]
# ─────────────────────────────────────────────────────────────────────────────

# locate analysis/ (see R/paths.R)
.f <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
.d <- if (length(.f)) dirname(normalizePath(.f)) else normalizePath(getwd())
while (!file.exists(file.path(.d, "R", "paths.R")) && dirname(.d) != .d) .d <- dirname(.d)
source(file.path(.d, "R", "paths.R"))

suppressPackageStartupMessages({ library(curl); library(digest); library(jsonlite) })

args  <- commandArgs(trailingOnly = TRUE)
ADOPT <- "--adopt" %in% args    # record hashes for newly added rows
FORCE <- "--force" %in% args    # re-download even when the cached hash matches

raw_dir  <- fetch_dir("exposure")
reg_path <- lookup_path("exposure_sources.csv")

src <- read.csv(reg_path, stringsAsFactors = FALSE, colClasses = "character")
stopifnot(all(c("source_id", "file", "url", "pin", "sha256") %in% names(src)))
if (anyDuplicated(src$file))
  stop("Duplicate file name in ", basename(reg_path), call. = FALSE)

bad_pin <- src$pin[grepl("^(main|master|HEAD|latest)$", src$pin)]
if (length(bad_pin))
  stop(basename(reg_path), " pins a moving reference (",
       paste(unique(bad_pin), collapse = ", "),
       "). Pin a commit SHA or a dated release URL.", call. = FALSE)

sha_of <- function(path) digest::digest(file = path, algo = "sha256")

say("Exposure registry: %d file(s) across %d source(s)",
    nrow(src), length(unique(src$source_id)))

changed <- FALSE
for (i in seq_len(nrow(src))) {
  dest <- file.path(raw_dir, src$file[i])
  want <- trimws(src$sha256[i])

  if (!FORCE && file.exists(dest) && nzchar(want) && identical(sha_of(dest), want)) {
    say("  ok      %s", src$file[i]); next
  }

  say("  fetch   %s", src$file[i])
  res <- curl::multi_download(src$url[i], dest, progress = FALSE)
  if (!isTRUE(res$success) || res$status_code != 200L)
    stop("Download failed for ", src$file[i], " (status ", res$status_code, "): ",
         src$url[i], call. = FALSE)
  got <- sha_of(dest)

  if (!nzchar(want)) {
    if (!ADOPT)
      stop("No sha256 recorded for ", src$file[i], ". Inspect the file, then re-run ",
           "with --adopt to record ", got, call. = FALSE)
    say("  adopt   %s  sha256=%s", src$file[i], got)
    src$sha256[i] <- got
    changed <- TRUE
  } else if (!identical(got, want)) {
    stop("sha256 mismatch for ", src$file[i], "\n  expected ", want, "\n  got      ", got,
         "\nThe pinned upstream file changed. Do not overwrite the registry without ",
         "understanding why.", call. = FALSE)
  }
}

if (changed) {
  write.csv(src, reg_path, row.names = FALSE)
  say("%s updated with adopted hashes.", basename(reg_path))
}

# ── Manifest: what is on disk right now, and when it got there ──────────────
manifest <- list(
  generated_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  registry     = "analysis/src/lookups/exposure_sources.csv",
  files = lapply(seq_len(nrow(src)), function(i) {
    dest <- file.path(raw_dir, src$file[i])
    list(source_id = src$source_id[i], file = src$file[i], url = src$url[i],
         pin = src$pin[i], sha256 = sha_of(dest),
         bytes = unname(file.info(dest)$size),
         licence = src$licence[i], note = src$retrieved_note[i])
  })
)
man_path <- file.path(ensure_dir(interim_path("exposure")), "download_manifest.json")
write_json(manifest, man_path, auto_unbox = TRUE, pretty = TRUE)

say("")
say("Verified %d file(s) in %s", nrow(src), raw_dir)
say("Manifest: %s", man_path)
