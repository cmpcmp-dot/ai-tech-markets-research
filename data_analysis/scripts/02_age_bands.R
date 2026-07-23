#!/usr/bin/env Rscript
# ─────────────────────────────────────────────────────────────────────────────
# 02_age_bands.R  —  Section 2: "Is the unemployment shortfall uneven?"
#
# Reproduces the residual-by-age chart from:
#   github.com/mtkonczal/Blog-Posts-Presentations-and-Testimony
#     /blogs_2026/01_education_young_unrate
#
# Method (as implemented in that repo's 01_big_graphic_YoY.R):
#   For each education group and centered 3-year age band, fit a log-log
#   regression of the subgroup's 12-month-MA unemployment RATE on the overall
#   12-month-MA rate, trained through 2019, back-transform the prediction to
#   levels (exp), and average (actual - predicted) over the last 6 months.
#   diff_avg is therefore in RATE units (a proportion); positive => that group
#   has HIGHER unemployment than its pre-2020 relationship to the overall rate
#   would predict.
#
# THIS PASS: we do not have the IPUMS CPS microdata locally, so we snapshot the
#   repo's committed, plot-ready residual CSV and render it.  When the IPUMS
#   pipeline is wired up later, only SRC_URL / the read step changes; the JSON
#   contract below stays the same.
#
# Output: data_analysis/output/age_bands.json
# ─────────────────────────────────────────────────────────────────────────────

suppressMessages({
  library(tidyverse)
  library(jsonlite)
})

SRC_URL <- paste0(
  "https://raw.githubusercontent.com/mtkonczal/",
  "Blog-Posts-Presentations-and-Testimony/main/blogs_2026/",
  "01_education_young_unrate/data/age_diff_sa_3lines.csv"
)

repo    <- "/Users/mtkonczal/Documents/GitHub/ai-tech-markets-research"
out_dir <- file.path(repo, "data_analysis", "output")
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)
snapshot <- file.path(out_dir, "age_diff_sa_3lines.csv")

# Refresh the snapshot (monthly-run seam). Fall back to existing snapshot if
# the download fails, so a run never silently produces stale/empty output.
ok <- tryCatch({
  download.file(SRC_URL, snapshot, quiet = TRUE); TRUE
}, error = function(e) FALSE)
if (!ok && !file.exists(snapshot)) {
  stop("Could not download age-band CSV and no local snapshot exists: ", SRC_URL)
}
if (!ok) message("WARNING: download failed; using existing snapshot ", snapshot)

vintage <- format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")

d <- read.csv(snapshot, stringsAsFactors = FALSE)
stopifnot(all(c("center_age", "edu_group", "diff_avg", "months") %in% names(d)))

months_window <- unique(d$months)[1]

# Order groups for a stable legend/color mapping.
group_levels <- c("College+", "HS+ (no BA)", "< HS")
d$edu_group  <- factor(d$edu_group, levels = group_levels)

series <- d %>%
  arrange(edu_group, center_age) %>%
  group_by(edu_group) %>%
  group_map(~ list(
    group  = as.character(.y$edu_group),
    points = map2(.x$center_age, .x$diff_avg,
                  ~ list(age = .x, value = round(.y, 4)))
  ))

# ── Headline numbers for the section's "answer" ──────────────────────────────
young_college <- d %>% filter(edu_group == "College+", center_age <= 24) %>%
  summarise(v = max(diff_avg)) %>% pull(v)
prime_college <- d %>% filter(edu_group == "College+", center_age >= 45, center_age <= 55) %>%
  summarise(v = mean(diff_avg)) %>% pull(v)
peak_row <- d %>% filter(edu_group == "College+") %>% slice_max(diff_avg, n = 1)

verdict <- sprintf(
  paste0("Yes, sharply. Young college graduates (age %d) carry unemployment about ",
         "%.1f pp above what their pre-2020 relationship to the overall rate predicts, ",
         "versus roughly %.1f pp for prime-age (45-55) graduates. The softness is ",
         "concentrated among the young and educated, not spread evenly."),
  peak_row$center_age[1], peak_row$diff_avg[1] * 100, prime_college * 100
)

age_bands <- list(
  vintage = vintage,
  source = list(
    url = SRC_URL,
    note = paste0("Snapshot of committed residual CSV from the blog repo. ",
                  "Residuals averaged over the last ", months_window,
                  " months; log-log prediction trained through 2019. ",
                  "IPUMS microdata regeneration deferred."),
    method = "actual minus predicted 12-month-MA unemployment RATE (proportion), by education x centered 3-yr age band"
  ),
  units = "rate proportion (multiply by 100 for percentage points)",
  group_order = group_levels,
  series = series,
  headline = list(
    peak_age = peak_row$center_age[1],
    peak_college_resid = round(peak_row$diff_avg[1], 4),
    young_college_resid = round(young_college, 4),
    prime_college_resid = round(prime_college, 4)
  ),
  verdict = verdict
)

write_json(age_bands, file.path(out_dir, "age_bands.json"),
           auto_unbox = TRUE, pretty = TRUE, digits = 6)

cat("── Age bands ──\n")
cat(sprintf("  groups: %s\n", paste(levels(d$edu_group), collapse = ", ")))
cat(sprintf("  peak College+ residual: %.3f (%.1f pp) at age %d\n",
            peak_row$diff_avg[1], peak_row$diff_avg[1]*100, peak_row$center_age[1]))
cat(sprintf("  prime-age (45-55) College+ residual: %.3f (%.1f pp)\n",
            prime_college, prime_college*100))
cat("── Verdict ──\n  ", verdict, "\n", sep = "")
cat("\nWrote ", file.path(out_dir, "age_bands.json"), "\n", sep = "")
