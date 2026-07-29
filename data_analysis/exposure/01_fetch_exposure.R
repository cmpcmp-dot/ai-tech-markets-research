#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# exposure/01_fetch_exposure.R — the only exposure script that touches the network.
#
# Reads the registry in exposure/sources.csv, downloads each file at its PINNED
# revision, and verifies its sha256 against the registry. A hash mismatch is a
# hard stop, not a warning: it means the upstream file changed under a pin that
# was supposed to be immutable, and every downstream number would silently move.
#
# Adding an exposure index later (Webb pct_ai, an updated Eloundou vintage, the
# Anthropic Economic Index) is one row in sources.csv and nothing else. Run with
# --adopt to compute and write the sha256 for a new row whose hash is blank.
#
# Raw files land in exposure/raw/ and are never edited or regenerated.
#
# Usage:  Rscript exposure/01_fetch_exposure.R [--adopt] [--force]
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({ library(curl); library(digest); library(jsonlite) })

args  <- commandArgs(trailingOnly = TRUE)
ADOPT <- "--adopt" %in% args    # fill in blank hashes for newly added rows
FORCE <- "--force" %in% args    # re-download even if the cached hash matches

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
here  <- function(...) file.path(repo, "exposure", ...)

raw_dir <- here("raw")
dir.create(raw_dir, showWarnings = FALSE, recursive = TRUE)

say <- function(...) cat(sprintf(...), "\n", sep = "")

src <- read.csv(here("sources.csv"), stringsAsFactors = FALSE, colClasses = "character")
stopifnot(all(c("source_id", "file", "url", "pin", "sha256") %in% names(src)))
if (anyDuplicated(src$file)) stop("Duplicate file name in sources.csv", call. = FALSE)

# A pin must be an immutable reference. A branch name is not one.
bad_pin <- src$pin[grepl("^(main|master|HEAD|latest)$", src$pin)]
if (length(bad_pin)) {
  stop("sources.csv pins a moving reference (", paste(unique(bad_pin), collapse = ", "),
       "). Pin a commit SHA or a dated release URL.", call. = FALSE)
}

sha_of <- function(path) digest::digest(file = path, algo = "sha256")

say("Exposure registry: %d file(s) across %d source(s)",
    nrow(src), length(unique(src$source_id)))

changed <- FALSE
for (i in seq_len(nrow(src))) {
  dest <- file.path(raw_dir, src$file[i])
  want <- trimws(src$sha256[i])

  if (!FORCE && file.exists(dest) && nzchar(want) && identical(sha_of(dest), want)) {
    say("  ok      %s", src$file[i])
    next
  }

  say("  fetch   %s", src$file[i])
  res <- curl::multi_download(src$url[i], dest, progress = FALSE)
  if (!isTRUE(res$success) || res$status_code != 200L) {
    stop("Download failed for ", src$file[i], " (status ", res$status_code, "): ",
         src$url[i], call. = FALSE)
  }
  got <- sha_of(dest)

  if (!nzchar(want)) {
    if (!ADOPT) {
      stop("No sha256 recorded for ", src$file[i], ". Inspect the file, then re-run ",
           "with --adopt to record ", got, call. = FALSE)
    }
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
  write.csv(src, here("sources.csv"), row.names = FALSE)
  say("sources.csv updated with adopted hashes.")
}

# ── Manifest: what is on disk right now, and when it got there ───────────────
manifest <- list(
  generated_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  files = lapply(seq_len(nrow(src)), function(i) {
    dest <- file.path(raw_dir, src$file[i])
    list(source_id = src$source_id[i], file = src$file[i], url = src$url[i],
         pin = src$pin[i], sha256 = sha_of(dest), bytes = unname(file.info(dest)$size),
         licence = src$licence[i], note = src$retrieved_note[i])
  })
)
write_json(manifest, here("MANIFEST.json"), auto_unbox = TRUE, pretty = TRUE)

say("")
say("Verified %d file(s) in %s", nrow(src), raw_dir)
say("Manifest: %s", here("MANIFEST.json"))
