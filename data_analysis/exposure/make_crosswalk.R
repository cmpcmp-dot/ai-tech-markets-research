#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# exposure/make_crosswalk.R — build crosswalks/cps_ind_to_naics3.csv, once.
#
# Not part of the regular pipeline. Run it when the Census industry code list is
# revised; otherwise the committed CSV is the source of truth and should be
# edited by hand, like btos/crosswalk_btos_jolts.csv.
#
# Source: 2017 Industry Code List with Crosswalk, Census.
#   https://www2.census.gov/programs-surveys/demo/guidance/industry-occupation/
#     2017-industry-code-list-with-crosswalk.xlsx
# The sheet gives Census industry code -> 2017 NAICS. CPS `IND` in 2018-2019
# uses that Census scheme, which is why 2018-19 is the pooling window for the
# exposure weights.
#
# The NAICS field is often a list or a range ("1131, 1132", "5111-5112"). A
# Census industry maps to NAICS3 only when every NAICS code it covers shares a
# 3-digit prefix. Where it does not, the row is written with naics3 blank and
# `ambiguous = TRUE` rather than being forced.
# ─────────────────────────────────────────────────────────────────────────────

suppressPackageStartupMessages({ library(readxl); library(data.table) })

args <- commandArgs(trailingOnly = TRUE)
if (!length(args)) stop("Usage: Rscript exposure/make_crosswalk.R <path to xlsx>", call. = FALSE)
src <- args[1]

.file <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
repo  <- if (length(.file)) dirname(dirname(normalizePath(.file))) else normalizePath(getwd())
dest  <- file.path(repo, "exposure", "crosswalks", "cps_ind_to_naics3.csv")
dir.create(dirname(dest), showWarnings = FALSE, recursive = TRUE)

raw <- as.data.table(read_excel(src, sheet = 1, col_names = FALSE, .name_repair = "minimal"))
setnames(raw, paste0("c", seq_len(ncol(raw))))

# Locate the description / census-code / NAICS-code columns by their header text.
hdr <- which(apply(raw, 1, function(r) any(grepl("2017 Census Code", r, fixed = TRUE))))[1]
if (is.na(hdr)) stop("Could not find the '2017 Census Code' header row.", call. = FALSE)
col_cen  <- which(raw[hdr] == "2017 Census Code")[1]
col_naic <- which(raw[hdr] == "2017 NAICS Code")[1]
# The description sits in whichever column left of the code column is the most
# densely populated; leading columns hold only section banners.
fill     <- vapply(seq_len(col_cen - 1L), function(j) sum(!is.na(raw[[j]])), 1L)
col_desc <- which.max(fill)

d <- raw[(hdr + 1L):.N, .(desc = trimws(as.character(get(paste0("c", col_desc)))),
                          census = trimws(as.character(get(paste0("c", col_cen)))),
                          naics  = trimws(as.character(get(paste0("c", col_naic)))))]

# Keep leaf rows only: a single 4-digit Census code, not a range (those are
# section headers), with a NAICS value attached.
d <- d[!is.na(census) & !is.na(naics) & grepl("^[0-9]{4}$", census)]

expand_naics <- function(s) {
  toks <- trimws(unlist(strsplit(s, "[,;]")))
  toks <- toks[nzchar(toks)]
  unlist(lapply(toks, function(t) {
    if (grepl("^[0-9]+-[0-9]+$", t)) {
      ab <- as.integer(strsplit(t, "-")[[1]])
      # Ranges are written over equal-width codes, e.g. 5111-5112.
      if (nchar(strsplit(t, "-")[[1]][1]) == nchar(strsplit(t, "-")[[1]][2]))
        return(as.character(seq(ab[1], ab[2])))
      return(as.character(ab))
    }
    gsub("[^0-9]", "", t)
  }))
}

d[, `:=`(
  naics3    = vapply(naics, function(s) {
    p <- unique(substr(expand_naics(s), 1, 3))
    p <- p[nchar(p) == 3L]
    if (length(p) == 1L) p else NA_character_
  }, character(1))
)]
d[, ind := as.integer(census)]

# NAICS 55 has exactly one subsector, so a Census industry coded "55" resolves.
d[is.na(naics3) & naics == "55", naics3 := "551"]

# ── Manual assignments ───────────────────────────────────────────────────────
# Where a Census industry spans several NAICS3 codes but one of them holds the
# overwhelming majority of employment, assign the dominant code and say so. Only
# these three qualify; the rest of the ambiguous rows are "not specified"
# residuals, government, or genuine even splits, and are left unmapped.
MANUAL <- data.table(
  ind    = c(6870L, 6970L, 7190L),
  naics3 = c("522", "523", "532"),
  why    = c("521 is the central bank and negligible in employment; 5221 and 5219 both sit inside 522",
             "525 (funds and trusts) has very little employment next to 523",
             "5324 sits inside 532; 533 (lessors of intangibles) is tiny")
)
d <- merge(d, MANUAL, by = "ind", all.x = TRUE)
d[!is.na(why) & is.na(naics3.x), naics3.x := naics3.y]
setnames(d, "naics3.x", "naics3"); d[, naics3.y := NULL]
d[, assignment := fifelse(!is.na(why), "manual-dominant", "auto")]
setnames(d, "why", "note")
d[is.na(note), note := ""]

d[, ambiguous := is.na(naics3)]

# A Census code can appear twice where the sheet repeats it across a banner and
# a detail row. Keep the row that carries a description, then the first.
d[, .desclen := nchar(ifelse(is.na(desc), "", desc))]
setorder(d, ind, -.desclen)
d <- unique(d, by = "ind")
d[, .desclen := NULL]

setcolorder(d, c("ind", "naics3", "ambiguous", "assignment", "desc", "naics", "note", "census"))
d[, census := NULL]
setnames(d, "naics", "naics_raw")
setorder(d, ind)

fwrite(d, dest)
cat(sprintf("Wrote %s\n  %d Census industries, %d mapped to a NAICS3, %d ambiguous\n",
            dest, nrow(d), sum(!d$ambiguous), sum(d$ambiguous)))
if (any(d$ambiguous))
  cat(sprintf("  ambiguous rows (fill naics3 by hand if a sensible target exists):\n%s\n",
              paste(sprintf("    %d  %-55s %s", d[ambiguous == TRUE, ind],
                            substr(d[ambiguous == TRUE, desc], 1, 55),
                            d[ambiguous == TRUE, naics_raw]), collapse = "\n")))
