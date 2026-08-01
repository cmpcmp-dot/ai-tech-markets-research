# Merge plan: `job_displacement_AI` → `ai-tech-markets-research`

Written 2026-07-31. **Status: executed 2026-07-31.** All five phases are done;
`job_displacement_AI` was left untouched as agreed. Where execution deviated from
the plan as first written, the section says so and
[Deviations](#deviations-from-the-plan-as-written) collects them.

Day-to-day reference is **[`data_analysis/DATA_LOCAL.md`](data_analysis/DATA_LOCAL.md)**;
this file is the record of *why*.

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
# No trailing slash on the first two: they are symlinks, which git sees as
# files, and a trailing-slash rule would not match them.
data_analysis/job_data
data_analysis/qwi/output
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
files. Link to them rather than duplicating — but **not** by symlinking whole
directories, which the first draft of this plan got wrong twice:

- Symlinking `qwi/` would have made the ported QWI *code* literally the same
  files as the old repo's, so editing it here would edit there. Only
  `qwi/output/` (988 MB) is data.
- Symlinking `data/` would have exposed the old repo's stale `data/*.js` publish
  files at `data_analysis/data/*.js`, one careless copy away from overwriting a
  live site data file. Only the two `cps.*` files are wanted.

What was actually done:

```sh
cd ~/Documents/GitHub/ai-tech-markets-research/data_analysis
JD=~/Documents/command_line_AI_projects/job_displacement_AI

ln -sfn "$JD/job_data"   job_data              # 3.8 GB CES + 210 MB JOLTS
mkdir -p qwi && ln -sfn "$JD/qwi/output" qwi/output    # 988 MB LEHD panel
mkdir -p data
ln -sfn "$JD/data/cps.dat.gz" data/cps.dat.gz  # 818 MB IPUMS extract
ln -sfn "$JD/data/cps.xml"    data/cps.xml
cp "$JD/data/cpi_monthly.csv" data/            # 6 KB, real copy so re-pulls
                                               # don't write into the old repo
```

Two ignored-but-cheap inputs were **copied** rather than linked or re-fetched,
because they make the pipelines runnable offline for the price of 88 MB:

```sh
cp -R "$JD/btos/output/raw/." btos/output/raw/   #  76 MB, saves ~70 Census calls
cp "$JD"/micro/output/*       micro/output/      #  12 MB SDID intermediates
```

- Everything above is gitignored; `git status` shows none of it.
- Zero script edits: the mirror paths resolve exactly as the R expects.
- No 9.6 GB duplication, and no risk of the code copies drifting.
- Trade-off: the pipelines depend on that folder existing. Acceptable while it
  stays put; if it ever moves, replace each symlink with a real directory and
  re-fetch per `DATA_LOCAL.md`. Nothing else changes.

Verified with:

```sh
git status --porcelain --ignored | grep -E 'job_data|qwi|data_analysis/data'
git check-ignore -v data_analysis/job_data data_analysis/qwi/output
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

Each of the four scripts now opens with the same five-line bootstrap that finds
`_paths.R` by walking up from its own location, then `repo <- REPO_ROOT`. Every
line after that is untouched, so the diff is five lines per file and the values
are identical to what was hard-coded.

**The BTOS/micro/QWI scripts were deliberately left alone.** Their
`dirname(dirname(--file))` idiom is already machine-independent — it was only
*inconsistent*, not broken. Rewriting a dozen working scripts to use the new
helper is risk with no benefit, and R is not installed here to verify it. Use
`_paths.R` for new scripts; convert old ones only when touching them anyway,
re-running each and diffing the generated `data/*.js` to confirm byte-identical
output.

`grep -rn "/Users/" --include="*.R" --include="*.py" .` now returns nothing.

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

## Deviations from the plan as written

1. **`qwi/` and `data/` are hybrids, not whole-directory symlinks** — see Phase 1
   above for why both would have been footguns.
2. **88 MB of ignored inputs were copied** (`btos/output/raw/`,
   `micro/output/*`) so the pipelines run without a cold re-fetch.
3. **The other pipelines' path idiom was left as-is** rather than unified on
   `_paths.R`; see Phase 3.
4. **`micro/run_micro.R` needed a two-line fix** the plan hadn't anticipated: it
   wrote `repo/data/microdata.js`, which under the new layout is the *ignored
   input cache*, not the publish directory. Now `dirname(repo)/data`, matching
   `btos/run_btos.R`.
5. **`99_download_ipums.py` resolved its output as `Path("data")`** — relative to
   the working directory. Now resolved from `__file__`.
6. **The size guard's first version didn't work.** It used
   `--diff-filter=ACM`, and git classified a copied 5 MB CSV as a *rename* (`R`),
   which sailed straight through. Now `ACMRT`, tested three ways: fresh 3 MB file
   blocked, rename-shaped 5 MB file blocked, small file still commits.
7. **Not done: `01_load_data.R` was not ported.** It is four meaningful lines
   that write `job_data/*.RDS` from a working-directory-relative path; the
   command is recorded in `DATA_LOCAL.md` instead of carried as a script.

## Suggested order

1. Phase 0 (gitignore, `git rm --cached`, hook) — self-contained, ~30 min.
2. Phase 1 symlinks + verify ignore rules hold.
3. Phase 2 `DATA_LOCAL.md` while the details are fresh.
4. Phase 3 path helper, one pipeline at a time, diffing `data/*.js`.
5. Phase 4 port remaining code, most-depended-on first (`qwi/`, then `micro/`).

Phases 0–2 are half a day and capture nearly all the benefit. 3 and 4 can wait.

---

## Later change: JOLTS adoption groups became terciles (2026-07-31)

`03_jobs_join.R` split the 15 JOLTS supersectors at the **median** of pre-break
BTOS adoption (`"Higher adoption"` / `"Lower adoption"`) while the 18 CES
sectors were cut into **terciles** (`"Low adoption"` / `"Middle"` /
`"High adoption"`). Two groupings, two vocabularies, one script.

The JOLTS cut is now the same `tercile()` call, on the supersectors' own
distribution (5/5/5, cut points ~3.3% and ~7.4% adoption). Consequences worth
knowing before quoting anything built on this:

- **Health care, retail and wholesale leave the top group** for the middle.
  Under the median split they sat on the high-adoption side and pulled the
  higher-vs-lower flow comparison toward zero. The tercile contrast is sharper
  and rests on five supersectors a side instead of seven or eight.
- **`flow_gap` changed meaning**, from top-half-minus-bottom-half to
  top-third-minus-bottom-third. It feeds the `monitor$board` D1 series, which
  **nothing currently renders** — the dashboard markup and
  `assets/jobs-monitor-charts.js` were dropped from `index.html` the same day.
  If the monitor is ever restored, its flow-gap cards are not comparable with
  their pre-2026-07-31 values.
- **A fifth, unnamed a2 series is gone.** `jolts_slim` carries `TS` (total
  separations); `jolts_el` names only `JO/HI/QU/LD`, and the unmatched lookup
  returned `NA`, so every group shipped a series with `outcome: null`. Now
  filtered out. The hires-vs-separations decomposition reads `TS` directly from
  `jolts_slim` and is unaffected.

`run_jobs.R` also now ships `a1`, `a2`, `windows` and `dropped` in
`data/btos-jobs-monitor-data.js`, because Job Displacement sections 03 and 04
read them: the two grouped time series, plus the question-change date and the
count of sectors with no CES match, which the section notes quote rather than
hardcode. That takes the file from 54 KB to roughly 160 KB — most of it the
twelve 87-month JOLTS series. The monitor block is still shipped and still
unused; dropping it would buy back about 40 KB if the size ever matters.
