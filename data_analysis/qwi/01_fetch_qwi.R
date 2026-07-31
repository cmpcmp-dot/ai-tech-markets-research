#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# qwi/01_fetch_qwi.R — the only QWI script that touches the network.
#
# Pulls the LEHD Quarterly Workforce Indicators bulk files. The API is not used:
# it has no national geography, rejects wildcards and comma-lists on `industry`
# and `agegrp`, and so would need ~10,000 requests to cover NAICS3 × state × age.
# The bulk files cover the same ground in 103 downloads.
#
# What it fetches, all from https://lehd.ces.census.gov/data/qwi/latest_release/
#   us/qwi_us_sa_f_gn_ns_op_u.csv.gz     published national, NAICS sector    (validation target)
#   {st}/qwi_{st}_sa_f_gs_ns_op_u.csv.gz per-state, NAICS sector             (validation input)
#   {st}/qwi_{st}_sa_f_gs_n3_op_u.csv.gz per-state, NAICS subsector          (the analysis input)
# plus the schema label files from https://lehd.ces.census.gov/data/schema/latest/.
#
# Filename grammar: qwi_{geo}_{sa|se|rh}_{f}_{gn|gs}_{ns|n3}_{op}_{u}
#   sa = sex × age   f = no firm characteristics   gn/gs = national/state
#   ns/n3 = NAICS sector / subsector   op = all private ownership   u = unadjusted
#
# Geography: 50 states + DC, matching the published national aggregate
# ("National (50 States + DC)", per label_geography_us.csv). Puerto Rico
# publishes QWI but is excluded from the national total, so we exclude it too.
#
# Integrity: LEHD publishes qwi_{st}.md5sum over the DECOMPRESSED csv. We verify
# against it, which also proves the gzip stream is intact.
#
# Incremental: a file already on disk that matches its published md5 is skipped.
# Pass --force to re-download everything.
#
# Usage:  Rscript qwi/01_fetch_qwi.R [--force] [--jobs N]
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({
  library(curl); library(tools)
})

args    <- commandArgs(trailingOnly = TRUE)
FORCE   <- "--force" %in% args
JOBS    <- {
  i <- match("--jobs", args)
  if (!is.na(i) && length(args) > i) as.integer(args[i + 1]) else 6L
}

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
here  <- function(...) file.path(repo, "qwi", ...)

raw_dir   <- here("output", "raw")
label_dir <- here("labels")
dir.create(raw_dir,   showWarnings = FALSE, recursive = TRUE)
dir.create(label_dir, showWarnings = FALSE, recursive = TRUE)

QWI_BASE    <- "https://lehd.ces.census.gov/data/qwi/latest_release"
SCHEMA_BASE <- "https://lehd.ces.census.gov/data/schema/latest"

# 50 states + DC. Not PR: it is published but excluded from the national total.
STATES <- c("al","ak","az","ar","ca","co","ct","de","dc","fl","ga","hi","id",
            "il","in","ia","ks","ky","la","me","md","ma","mi","mn","ms","mo",
            "mt","ne","nv","nh","nj","nm","ny","nc","nd","oh","ok","or","pa",
            "ri","sc","sd","tn","tx","ut","vt","va","wa","wv","wi","wy")
stopifnot(length(STATES) == 51L, !anyDuplicated(STATES))

LABELS <- c("label_flags.csv", "label_agegrp.csv", "label_industry.csv",
            "label_ind_level.csv", "label_geography_us.csv", "label_sex.csv",
            "label_ownercode.csv", "label_seasonadj.csv")

say <- function(...) cat(sprintf(...), "\n", sep = "")

# ── Published md5 manifests (one per state) ──────────────────────────────────
# Keyed by the DECOMPRESSED csv name, e.g. "qwi_ca_sa_f_gs_n3_op_u.csv".
say("Fetching md5 manifests for %d states...", length(STATES))
md5_index <- new.env(parent = emptyenv())
for (st in STATES) {
  txt <- tryCatch(
    readLines(curl(sprintf("%s/%s/qwi_%s.md5sum", QWI_BASE, st, st)), warn = FALSE),
    error = function(e) character(0)
  )
  if (!length(txt)) stop("Could not read the md5 manifest for ", st, call. = FALSE)
  parts <- strsplit(trimws(txt), "\\s+")
  for (p in parts) if (length(p) >= 2L) assign(p[[2]], p[[1]], envir = md5_index)
}
say("  %d checksums indexed", length(ls(md5_index)))

# ── Build the download list ──────────────────────────────────────────────────
targets <- rbind(
  data.frame(
    url  = sprintf("%s/us/qwi_us_sa_f_gn_ns_op_u.csv.gz", QWI_BASE),
    dest = file.path(raw_dir, "qwi_us_sa_f_gn_ns_op_u.csv.gz"),
    csv  = "qwi_us_sa_f_gn_ns_op_u.csv",
    stringsAsFactors = FALSE
  ),
  do.call(rbind, lapply(STATES, function(st) do.call(rbind, lapply(c("ns", "n3"), function(lvl) {
    f <- sprintf("qwi_%s_sa_f_gs_%s_op_u.csv", st, lvl)
    data.frame(url  = sprintf("%s/%s/%s.gz", QWI_BASE, st, f),
               dest = file.path(raw_dir, paste0(f, ".gz")),
               csv  = f, stringsAsFactors = FALSE)
  }))))
)

# The national file has no published checksum (the us/ dir ships no md5sum), so
# it is verified structurally in 02 rather than by hash.
targets$md5 <- vapply(targets$csv,
                      function(k) if (exists(k, envir = md5_index)) get(k, envir = md5_index) else NA_character_,
                      character(1))
missing_md5 <- targets$csv[is.na(targets$md5) & targets$csv != "qwi_us_sa_f_gn_ns_op_u.csv"]
if (length(missing_md5)) stop("No published checksum for: ", paste(missing_md5, collapse = ", "))

# ── Verify what is already on disk ───────────────────────────────────────────
# md5 is over the decompressed csv, so this streams each cached file through
# gunzip. Cheaper than re-downloading 1.5 GB, and it proves the gzip is intact.
verify <- function(dest, want_md5) {
  if (!file.exists(dest) || is.na(want_md5)) return(FALSE)
  tmp <- tempfile(fileext = ".csv")
  on.exit(unlink(tmp), add = TRUE)
  ok <- tryCatch({ R.utils::gunzip(dest, destname = tmp, remove = FALSE, overwrite = TRUE); TRUE },
                 error = function(e) FALSE)
  if (!ok) return(FALSE)
  identical(unname(tools::md5sum(tmp)), want_md5)
}

if (FORCE) {
  todo <- targets
  say("--force: re-downloading all %d files", nrow(todo))
} else {
  say("Checking %d cached files...", nrow(targets))
  cached <- vapply(seq_len(nrow(targets)),
                   function(i) verify(targets$dest[i], targets$md5[i]), logical(1))
  # The national file has no checksum; accept it if it is present and non-trivial.
  nat <- targets$csv == "qwi_us_sa_f_gn_ns_op_u.csv"
  cached[nat] <- file.exists(targets$dest[nat]) &&
    file.info(targets$dest[nat])$size > 1e6
  todo <- targets[!cached, , drop = FALSE]
  say("  %d verified, %d to fetch", sum(cached), nrow(todo))
}

# ── Download ─────────────────────────────────────────────────────────────────
# The Census host sits behind an F5 that silently drops connections when it sees
# a large parallel burst: firing all 103 requests at once returned "success" for
# every one but wrote 124 MB where 1.5 GB was expected. So: a small bounded pool,
# in batches, with retries, and a hard size floor to catch truncated bodies.
MIN_BYTES <- 5e5   # the smallest real file (a small state's sector file) is ~2 MB

# multi_download in curl 7.1.0 takes no `pool` argument, so concurrency is
# bounded by the batch size instead: each call opens at most JOBS connections.
download_batch <- function(urls, dests) {
  res <- curl::multi_download(urls, dests, resume = FALSE, progress = TRUE,
                              multiplex = FALSE)
  sz  <- file.info(dests)$size
  res$success & res$status_code == 200L & !is.na(sz) & sz >= MIN_BYTES
}

if (nrow(todo)) {
  say("Downloading %d files (%d at a time)...", nrow(todo), JOBS)
  pending <- seq_len(nrow(todo))
  for (attempt in 1:4) {
    if (!length(pending)) break
    if (attempt > 1L) {
      say("  retry %d for %d file(s)", attempt - 1L, length(pending))
      Sys.sleep(5 * attempt)
    }
    failed <- integer(0)
    nb <- 0L
    for (chunk in split(pending, ceiling(seq_along(pending) / JOBS))) {
      okc <- download_batch(todo$url[chunk], todo$dest[chunk])
      failed <- c(failed, chunk[!okc])
      nb <- nb + length(chunk)
      say("  %d/%d fetched (%d failed so far)", nb, length(pending), length(failed))
    }
    pending <- failed
  }
  if (length(pending)) {
    stop("Download failed after 4 attempts:\n  ",
         paste(basename(todo$dest[pending]), collapse = "\n  "), call. = FALSE)
  }

  say("Verifying checksums...")
  ok <- vapply(seq_len(nrow(todo)),
               function(i) if (is.na(todo$md5[i])) TRUE else verify(todo$dest[i], todo$md5[i]),
               logical(1))
  if (any(!ok)) {
    stop("Checksum mismatch (corrupt, truncated, or revised upstream):\n  ",
         paste(basename(todo$dest[!ok]), collapse = "\n  "), call. = FALSE)
  }
  say("  all %d verified", nrow(todo))
}

# ── Schema labels ────────────────────────────────────────────────────────────
say("Fetching %d schema label files...", length(LABELS))
lab_urls <- file.path(SCHEMA_BASE, LABELS)
lab_res  <- curl::multi_download(lab_urls, file.path(label_dir, LABELS), progress = FALSE)
if (any(!lab_res$success)) stop("Failed to fetch: ",
                                paste(LABELS[!lab_res$success], collapse = ", "))

# ── Provenance ───────────────────────────────────────────────────────────────
# latest_release is a moving pointer, so record when we resolved it and what we
# got. 02 refuses to build a panel from a mixed-vintage cache.
manifest <- data.frame(
  file      = basename(targets$dest),
  md5_csv   = targets$md5,
  bytes_gz  = file.info(targets$dest)$size,
  url       = targets$url,
  stringsAsFactors = FALSE
)
write.csv(manifest, here("output", "qwi_manifest.csv"), row.names = FALSE)
writeLines(
  c(sprintf("release_pointer: %s", QWI_BASE),
    sprintf("retrieved_at: %s", format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")),
    sprintf("files: %d", nrow(targets)),
    sprintf("total_gz_bytes: %s", format(sum(manifest$bytes_gz), big.mark = ","))),
  here("output", "qwi_fetch_vintage.txt")
)

say("")
say("Done. %d files, %s in %s",
    nrow(targets), format(structure(sum(manifest$bytes_gz), class = "object_size"),
                          units = "auto"), raw_dir)
say("Manifest: %s", here("output", "qwi_manifest.csv"))
