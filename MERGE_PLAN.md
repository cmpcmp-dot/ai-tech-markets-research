# Merge plan: `job_displacement_AI` → `ai-tech-markets-research`

Written 2026-07-31. Status: proposed, nothing executed yet.

## The two problems this solves

1. **Repo bloat.** `job_displacement_AI` is 9.6 GB. This repo is 35 MB (20 MB of
   which is `.git`) and pushes to GitHub. The heavy inputs must live somewhere
   git cannot see them, while the code that uses them lives here.
2. **Machine dependence.** Four scripts hard-code
   `/Users/mtkonczal/Documents/GitHub/ai-tech-markets-research`. A clone on any
   other machine — or a scheduled task with a different working directory —
   breaks. Nothing in the repo should know who ran it or from where.

## Ground rules (the whole plan in five lines)

| Class | Lives in | Committed? |
|---|---|---|
| Code, crosswalks, sha-pinned small raw inputs | `data_analysis/<pipeline>/` | yes |
| Publish artifacts the site loads | `data/*.js` | yes — **this is the contract** |
| Regenerable intermediates | `data_analysis/**/output/` | **no** |
| Irreplaceable small snapshots | `data_analysis/**/output/`, named exceptions | yes, ~5 files |
| Multi-hundred-MB inputs | `data_analysis/{job_data,qwi,data}/` | **no** |

The site never breaks from an ignored file, because the site only ever reads
`data/*.js`, and those are committed. Ignored files are only needed to *rebuild*
them.

---

## Why `data_analysis/` is already the right seam

The 2026-07-28 port left `data_analysis/` as a **mirror of the old repo root**.
Every ported script resolves its base as:

```r
repo <- dirname(dirname(normalizePath(.file)))   # = <this repo>/data_analysis
```

so `03_jobs_join.R` looks for `job_data/ces.RDS` at
`data_analysis/job_data/ces.RDS`, and `03_tests_industry.R` looks for
`qwi/output/qwi_naics3_age_quarter.rds` at `data_analysis/qwi/output/...`.

**This is worth preserving.** Dropping the big inputs at exactly those mirror
paths means the remaining migration requires *zero* edits to the R that reads
them. Fighting the convention would mean touching every script.

---

## Phase 0 — Stop the bleeding (30 min, do first)

Currently committed and regenerable: `btos/output/btos_ai_long.csv` (5.0 MB),
`btos_ai_supplement_long.csv` (2.4 MB), all `exposure/output/*.csv`,
`data_analysis/output/*.json`.

1. Add the `.gitignore` block below.
2. `git rm --cached` the regenerable outputs (files stay on disk, just untracked).
3. History is left alone deliberately — no filter-repo, no force-push, no
   rebasing the four live branches. `.git` stays at 20 MB, which is fine.
4. Add a pre-commit size guard so this cannot recur.

### `.gitignore` additions

Verified against a scratch repo mirroring this tree: the exceptions survive, the
disposable files don't.

```gitignore
# ── data_analysis: generated output is never committed ─────────────────
# Anything under an output/ directory is disposable and regenerable.
data_analysis/**/output/*

# Exceptions: small artifacts that CANNOT be regenerated without an input
# we do not keep. Provenance in data_analysis/DATA_LOCAL.md.
!data_analysis/micro/output/cps_occ_ind_weights.rds
!data_analysis/micro/output/t1_adoption_exposure.csv
!data_analysis/micro/output/t1_coefs.csv
!data_analysis/micro/output/t1_slope_over_time.csv
!data_analysis/micro/output/tests_industry_meta.json

# ── large local-only inputs (see data_analysis/DATA_LOCAL.md) ──────────
data_analysis/job_data/
data_analysis/qwi/
data_analysis/data/
data_analysis/data-local/

# ── belt and braces: never commit these formats anywhere ───────────────
*.RDS
*.rds
*.dat.gz
*.parquet
!data_analysis/micro/output/cps_occ_ind_weights.rds
```

Order matters: the `!` lines must follow the rule they override, and the
directory itself must not be excluded (hence `output/*`, not `output/`) or git
will refuse to re-include anything inside it.

### Pre-commit size guard

`.githooks/pre-commit`, enabled with `git config core.hooksPath .githooks`:

```sh
#!/bin/sh
# Reject any staged blob over 2 MB. Override with: SKIP_SIZE_GUARD=1 git commit
[ -n "$SKIP_SIZE_GUARD" ] && exit 0
limit=2097152
fail=0
for f in $(git diff --cached --name-only --diff-filter=ACM); do
  [ -f "$f" ] || continue
  size=$(wc -c < "$f")
  if [ "$size" -gt "$limit" ]; then
    echo "pre-commit: $f is $((size/1024)) KB (limit $((limit/1024)) KB)"
    fail=1
  fi
done
[ "$fail" -eq 1 ] && echo "
Large derived data does not belong in this repo. Put it under an ignored
output/ directory, or document it in data_analysis/DATA_LOCAL.md."
exit $fail
```

Hooks are not cloned, so note the `core.hooksPath` line in the setup section of
`CONTEXT.md`.

---

## Phase 1 — Land the big inputs without copying 9.6 GB

`job_displacement_AI` stays untouched and remains the physical home of the raw
files. Link to them rather than duplicating:

```sh
cd ~/Documents/GitHub/ai-tech-markets-research/data_analysis
JD=~/Documents/command_line_AI_projects/job_displacement_AI

ln -s "$JD/job_data" job_data     # 3.8 GB CES + 210 MB JOLTS
ln -s "$JD/qwi"      qwi          # 988 MB LEHD panel + fetch/build R
ln -s "$JD/data"     data         # 818 MB IPUMS CPS extract (cps.dat.gz + cps.xml)
```

- All three link names are in `.gitignore`, so git sees nothing — not even the
  symlink.
- Zero script edits: the mirror paths resolve exactly as the R expects.
- No 9.6 GB duplication, and no risk of the two copies drifting.
- Trade-off: the pipelines depend on that folder existing. Acceptable while it
  stays put; if it ever moves, replace the symlink with a real directory and
  re-fetch per `DATA_LOCAL.md`. Nothing else changes.

Confirm the guard actually holds before moving on:

```sh
git status --porcelain --ignored | grep -E 'job_data|qwi|data_analysis/data'
git check-ignore -v data_analysis/job_data/ces.RDS
```

---

## Phase 2 — `data_analysis/DATA_LOCAL.md`, the manifest

One page, committed, that makes every ignored input reproducible. Anyone who
clones this repo reads exactly one file to know what's missing and why.

| Path (ignored) | Size | Needed by | How to get it |
|---|---|---|---|
| `job_data/ces.RDS` | 3.8 GB | `btos/03_jobs_join.R` (first run only; caches `output/ces_slim.rds`) | `tidyusmacro::getBLSFiles` — see `job_displacement_AI/01_load_data.R` |
| `job_data/jolts.RDS` | 210 MB | same | same |
| `qwi/output/qwi_naics3_age_quarter.rds` | 4.5 MB | `micro/03_tests_industry.R` T4/T6, `micro/06_qwi_dynamics.R` | `qwi/01_fetch_qwi.R` then `02_build_qwi.R` (~988 MB of raw `.csv.gz`, ~100 state pulls) |
| `data/cps.dat.gz` + `cps.xml` | 818 MB | `micro/01_build_cps_panel.R` | `99.download_IPUMS_data.py`, needs `IPUMS_API_KEY`; not fully automatable |
| `btos/output/raw/period_*.json` | 76 MB | `btos/02_build_btos.R` from scratch | `btos/01_fetch_btos.R`, ~70 Census API requests on a cold start |

Plus a short **committed snapshots** section: for each of the five exception
files, what produced it, from which vintage, and what would be required to
rebuild it. `cps_occ_ind_weights.rds` (1.7 MB) is the important one — it is
committed precisely because its 818 MB IPUMS parent cannot be re-fetched
without an account.

---

## Phase 3 — Kill the hard-coded paths

`data_analysis/scripts/{01_okun,02_age_bands,03_ces_slowdown,run_all}.R` each
set `repo <- "/Users/mtkonczal/..."`. They also use a different base convention
than the BTOS scripts (repo root vs. `data_analysis/`), which is the real source
of confusion.

Add `data_analysis/_paths.R`, sourced at the top of every script:

```r
# Resolves both roots from the script's own location. Works under Rscript,
# source(), and RStudio; falls back to getwd() in a bare REPL.
local({
  a <- commandArgs(trailingOnly = FALSE)
  f <- sub("^--file=", "", a[grep("^--file=", a)])
  if (!length(f)) f <- tryCatch(sys.frame(1)$ofile, error = function(e) NULL)
  base <- if (length(f) && nzchar(f)) dirname(normalizePath(f)) else getwd()
  # walk up to the directory containing data_analysis/
  while (!dir.exists(file.path(base, "data_analysis")) && dirname(base) != base) {
    base <- dirname(base)
  }
  if (!dir.exists(file.path(base, "data_analysis")))
    stop("_paths.R: could not locate the repo root from ", base, call. = FALSE)
  assign("REPO_ROOT", base, envir = globalenv())
  assign("DA_ROOT", file.path(base, "data_analysis"), envir = globalenv())
})
repo_path <- function(...) file.path(REPO_ROOT, ...)   # e.g. data/btos-data.js
da_path   <- function(...) file.path(DA_ROOT, ...)     # e.g. job_data/ces.RDS
```

Then `repo <- "/Users/..."` becomes `source(".../\_paths.R")` + `da_path(...)`,
and the BTOS scripts' bespoke `dirname(dirname(...))` lines collapse to the same
helper. Small, mechanical, and it removes the last thing in the repo that knows
whose machine it is on. Do it one pipeline at a time, re-running each and
diffing the generated `data/*.js` to confirm byte-identical output.

---

## Phase 4 — Port the remaining code

Already ported: `btos/`, `exposure/`, `micro/03` + `run_exposure`, `scripts/`.

Still only in `job_displacement_AI`, in dependency order:

| Source | Brings | Notes |
|---|---|---|
| `qwi/{01_fetch,02_build}_qwi.R`, `labels/` | LEHD fetch + build | code is small; only its output is huge. Copy the code, symlink the output. |
| `micro/{00_pull_cpi,01_build_cps_panel}.R`, `99.download_IPUMS_data.py` | CPS panel construction | needs `IPUMS_API_KEY`, `BLS_KEY` from `~/.Renviron` |
| `micro/{02_sdid_replicate,04_sdid_extensions,05_goldman_cps}.R`, `sdid_core.R`, `run_micro.R` | SDID replication + extensions | reads `micro/output/*.rds`, all ignored |
| `micro/06_qwi_dynamics.R` | QWI event study | needs the QWI panel |
| `01_load_data.R` | the CES/JOLTS pull that writes `job_data/*.RDS` | one-liner; fold into `DATA_LOCAL.md` |

Not to port: `job_data/`, `qwi/output/`, `data/cps.dat.gz`, `papers/`,
`btos/output/raw/*.xlsx`, `.claude/worktrees/` (a stale worktree holding a
second 3.6 GB copy of `ces.RDS`).

HTML/prototypes (`btos.html`, `paper.html`, `evidence_tracker.html`,
`micro_next_steps.md`, `plan_microdata.md`) are a separate editorial decision
from the data plumbing — handle after the pipelines run clean here.

---

## ⚠️ One hard rule

`job_displacement_AI` has a **single commit that contains `job_data/ces.RDS`
(3.8 GB) and `jolts.RDS` (210 MB) in its history**. It has no remote, so this is
currently harmless.

**Never `git remote add` / `fetch` / `merge` / `subtree` from that repo into this
one.** Doing so would pull 4 GB of blobs into a repo that pushes to GitHub —
irreversible without a history rewrite, and over GitHub's file-size limit
anyway. Migrate with `cp`, `rsync`, or symlinks only.

---

## Suggested order

1. Phase 0 (gitignore, `git rm --cached`, hook) — self-contained, ~30 min.
2. Phase 1 symlinks + verify ignore rules hold.
3. Phase 2 `DATA_LOCAL.md` while the details are fresh.
4. Phase 3 path helper, one pipeline at a time, diffing `data/*.js`.
5. Phase 4 port remaining code, most-depended-on first (`qwi/`, then `micro/`).

Phases 0–2 are half a day and capture nearly all the benefit. 3 and 4 can wait.
