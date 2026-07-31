# fix.md — verification and repair pass for the 2026-07-31 merge

**For an agent or console session that can run R.** The merge of
`job_displacement_AI` into this repo is complete and committed, but **no R was
executed** — R was not available in the environment that did the work. Every
path was verified by static reimplementation, not by running a pipeline. Your job
is to run them, confirm the outputs are unchanged, and fix what isn't.

Read first: [`MERGE_PLAN.md`](MERGE_PLAN.md) for why the layout is shaped this
way, and [`data_analysis/DATA_LOCAL.md`](data_analysis/DATA_LOCAL.md) for what is
and isn't committed. Relevant commits: `8743e2c` (ignore rules + size guard),
`c4600f5` (the merge itself).

---

## Ground rules

1. **Do not push.** The branch is 3 commits ahead of `origin/main`. Pushing is
   Mary's call after this pass is clean.
2. **Do not commit data.** A pre-commit hook rejects any staged blob over 2 MB.
   If it fires, the fix is never `SKIP_SIZE_GUARD=1` — it's to put the file under
   an ignored `output/` directory and add a row to `DATA_LOCAL.md`.
3. **Do not modify `~/Documents/command_line_AI_projects/job_displacement_AI`.**
   It is the physical home of 5.8 GB of symlinked input and is otherwise retired.
   Never `git remote add`/`fetch` from it — its single commit contains a 3.8 GB
   blob in history.
4. **Do not relax a sanity anchor** in `02_build_btos.R` to make a build pass.
   If one fires, check whether Census revised the series and report it.
5. **Do not reformat or refactor** beyond what a failure requires. Small commits,
   one concern each.

---

## Step 0 — Environment

```sh
cd ~/Documents/GitHub/ai-tech-markets-research
git config core.hooksPath .githooks     # hooks are not cloned; required
git log --oneline -3                    # expect c4600f5, 8743e2c, c73836b
git status --short                       # index.html + 2 untracked files are Mary's
                                         # in-flight work — leave them alone
```

R packages used across the pipelines:

```
tidyverse tidyusmacro data.table jsonlite lubridate readr readxl dplyr tidyr
purrr stringr httr curl digest tools fixest lmtest sandwich Hmisc ipumsr synthdid
```

`tidyusmacro` and `synthdid` are not on CRAN — install from source/GitHub if
missing. Keys, read from `~/.Renviron`: `BLS_KEY` (`micro/00_pull_cpi.R`),
`IPUMS_API_KEY` (`micro/99_download_ipums.py`). FRED is pulled through
`tidyusmacro::getFRED`, no key.

Confirm the symlinked inputs resolve (all four must print a size, not an error):

```sh
ls -lL data_analysis/job_data/ces.RDS data_analysis/qwi/output/qwi_naics3_age_quarter.rds \
       data_analysis/data/cps.dat.gz data_analysis/data/cps.xml
```

If any is broken, the old folder moved. Do not re-point blindly — read the
symlink target, find where it went, and fix the link; the alternative (re-fetch)
is in `DATA_LOCAL.md` and costs hours.

---

## ⚠️ Read this before judging any output as "changed"

**Every builder in the repo stamps the current time into its output**, so nothing
downstream is ever byte-identical across runs:

| Field | Stamped by | Ends up in |
|---|---|---|
| `generated` | `scripts/run_all.R:48` | `data/jobs-displacement-data.js` |
| `vintage` | `btos/02_build_btos.R:473` | `btos_data.json` → `data/btos-data.js` |
| `vintage` | `btos/03_jobs_join.R:629` | `btos_jobs.json` → `data/btos-jobs-monitor-data.js` |
| `vintage` | `micro/run_exposure.R:63` | `data/btos-exposure-data.js` |
| `built_at` | `micro/03_tests_industry.R:297` | **`micro/output/tests_industry_meta.json` — a committed snapshot** |
| `built_at` | `exposure/02_build_exposure.R:183` | `exposure/output/exposure_meta.json` (ignored) |

The pass criterion is therefore *only the timestamp line differs*. Check it this
way, never with `--stat`:

```sh
git diff -U0 data/ data_analysis/micro/output/ | grep '^[+-]' | grep -v '^[+-][+-]'
```

Every surviving line must be one of the fields above. Anything else is a real
difference and needs explaining before you commit it.

Note the fifth row: `tests_industry_meta.json` is one of the five *committed*
snapshots, so running `03_tests_industry.R` always dirties the working tree by one
line. That is expected churn, not a bug. Either commit it or
`git checkout --` it; don't chase it.

---

## The tests, in dependency order

### T1 — `_paths.R` resolves from anywhere *(highest risk: 4 files were edited)*

This is the only genuinely new code in the merge. It replaced four hard-coded
`/Users/mtkonczal/...` assignments with a walk-up bootstrap.

```sh
# from the repo root
Rscript -e 'source("data_analysis/_paths.R"); cat(REPO_ROOT, DA_ROOT, sep="\n")'
# from a subdirectory
cd data_analysis/scripts && Rscript -e 'source("../_paths.R"); cat(REPO_ROOT,"\n")'; cd -
# from outside the repo entirely, by absolute path
cd /tmp && Rscript ~/Documents/GitHub/ai-tech-markets-research/data_analysis/scripts/01_okun.R; cd -
```

**Expected:** `REPO_ROOT` is the repo root (contains `index.html`), `DA_ROOT` is
`<root>/data_analysis`, in all three cases.

**If the `/tmp` invocation fails:** the `--file=` branch is wrong — that is the
path Rscript actually uses and the one that matters. Report before changing.

**If `source()` from RStudio fails** (no `--file=`, and the `sys.frame(1)$ofile`
fallback is the weakest line in the file): acceptable to leave. Document that
scripts are Rscript-only, or add an `rstudioapi::getSourceEditorContext()` branch.
Do not paper over it by hard-coding a path — that is the exact thing this removed.

### T2 — Jobs displacement, assemble only (no network)

```sh
Rscript data_analysis/scripts/run_all.R
git diff -U0 data/jobs-displacement-data.js | grep '^[+-]' | grep -v '^[+-][+-]'
```

**Expected:** only the `generated` line. This is the real test of T1, because
`run_all.R` is one of the four edited files and it reads `data_analysis/output/`
via `repo`.

**If it can't find `output/*.json`:** those are ignored-but-present on this
machine. Confirm with `ls data_analysis/output/`. If genuinely absent, run with
`--refresh` (T3) rather than restoring them from git — they are not in git by
design.

### T3 — Jobs displacement, full refresh (network: FRED + BLS CES + GitHub)

```sh
Rscript data_analysis/scripts/run_all.R --refresh
git diff -U0 data/jobs-displacement-data.js | grep '^[+-]' | grep -v '^[+-][+-]'
```

**Expected:** the timestamp, plus genuine data movement — new months of FRED and
CES since the last refresh. Numbers *should* change here. Sanity-check the
verdict strings still read correctly and no value went `null` or `NaN`.

**If generated strings contain `<e2><80><94>` or similar:** the `C`-locale
mangling described in `data_analysis/README.md`. Re-run under a UTF-8 locale
(`LANG=en_US.UTF-8`) or keep the source strings ASCII. Do not commit mangled bytes.

### T4 — BTOS rebuild from the copied raw inputs

76 MB of `btos/output/raw/period_*.json` was copied in during the merge
specifically so this works without ~70 Census API calls. This test proves the
copy is complete.

```sh
Rscript data_analysis/btos/02_build_btos.R    # offline; asserts sanity anchors
Rscript data_analysis/btos/run_btos.R
git diff -U0 data/btos-data.js | grep '^[+-]' | grep -v '^[+-][+-]'
```

**Expected:** `02_build_btos.R` completes with anchors passing, and
`data/btos-data.js` differs only in `vintage` (stamped in `02_build_btos.R`, not
in `run_btos.R`). Every survey number must be unchanged.

**If a file under `raw/` is missing:** the copy was incomplete — run
`Rscript data_analysis/btos/01_fetch_btos.R` to backfill, and note it in the report.
**If a sanity anchor fires:** stop, do not relax it, report the drift.

### T5 — The 3.8 GB symlink actually works

`03_jobs_join.R` reads `data_analysis/job_data/{ces,jolts}.RDS` through the
symlink. The slim caches (`btos/output/{ces,jolts}_slim.rds`) were **not** copied,
so this run will load the full 3.8 GB RDS — expect a slow first pass (minutes,
several GB of RAM) and a cache written on completion.

```sh
Rscript data_analysis/btos/03_jobs_join.R     # slow, first run only
Rscript data_analysis/btos/run_jobs.R
git diff -U0 data/btos-jobs-monitor-data.js | grep '^[+-]' | grep -v '^[+-][+-]'
ls -lh data_analysis/btos/output/*_slim.rds   # caches should now exist
```

**Expected:** `data/btos-jobs-monitor-data.js` differs only in `vintage`, plus two
new `*_slim.rds` files — which must be ignored by git. Verify: `git status
--short` shows nothing new.

**If it OOMs:** legitimate. Copy the pre-built caches instead
(`cp ~/Documents/command_line_AI_projects/job_displacement_AI/btos/output/*_slim.rds data_analysis/btos/output/`)
and note that T5 was skipped.

### T6 — Exposure / T1 snapshots reproduce

The five committed snapshots under `micro/output/` are the only derived data in
git. T1 must reproduce them exactly.

```sh
Rscript data_analysis/micro/03_tests_industry.R
git diff --stat data_analysis/micro/output/
Rscript data_analysis/micro/run_exposure.R
git diff -U0 data/btos-exposure-data.js | grep '^[+-]' | grep -v '^[+-][+-]'
```

**Expected:** the three data snapshots — `t1_adoption_exposure.csv`,
`t1_coefs.csv`, `t1_slope_over_time.csv` — **byte-identical**; the fourth,
`tests_industry_meta.json`, changed by exactly one `built_at` line;
`btos-exposure-data.js` differs only in `vintage`. T4/T6 will also run now that
the QWI symlink exists (they previously stopped with an explanation) — their
outputs are ignored, so they should not appear in `git status`.

This is the single most informative test in the file: it is the only one where a
committed artifact must reproduce bit-for-bit from ignored inputs. If the three
CSVs match, the symlinked QWI panel is the same data the snapshots were built
from, and the whole data-local scheme is sound.

**If a T1 snapshot changes:** important. Either an upstream input moved or the
QWI symlink is feeding different data than the committed snapshot was built from.
Investigate before committing; if the new values are correct, commit them
together with a note in `DATA_LOCAL.md`.

### T7 — `micro/run_micro.R` writes to the right `data/`

This is the one place the merge changed behaviour rather than just paths. It used
to write `repo/data/microdata.js`; under this layout that resolved to the
**ignored IPUMS input cache**, so it was changed to `dirname(repo)/data`.

The SDID intermediates it reads (12 MB of `micro/output/*.rds`) were copied in, so
this should run without rebuilding the CPS panel.

```sh
Rscript data_analysis/micro/run_micro.R
ls -l data/microdata.js                    # MUST be here (repo root data/)
ls -l data_analysis/data/microdata.js 2>&1 # MUST NOT exist
```

**Expected:** written to `data/microdata.js`. Note that **nothing in
`index.html` loads this file** — it was the payload for the old repo's
`paper.html`/`btos.html`, which were not ported. Leave it uncommitted and mention
it in the report; whether to commit it is Mary's call, not a fix.

**If it errors on a missing `micro/output/*` file:** check `DATA_LOCAL.md` — the
inputs needing the 818 MB IPUMS extract are expected to be absent-but-derived.
Report which one; do not rebuild the CPS panel just for this.

### T8 — `00_pull_cpi.R` writes locally, not into the old repo

`data_analysis/data/cpi_monthly.csv` is a real file, deliberately not a symlink,
so a re-pull cannot write into the retired folder. Confirm:

```sh
JD=~/Documents/command_line_AI_projects/job_displacement_AI
stat -f "%m %N" $JD/data/cpi_monthly.csv
Rscript data_analysis/micro/00_pull_cpi.R          # needs BLS_KEY
stat -f "%m %N" $JD/data/cpi_monthly.csv           # mtime must be UNCHANGED
ls -l data_analysis/data/cpi_monthly.csv           # this one updated
```

**If the old repo's copy changed:** something is still a symlink that shouldn't
be. Replace it with a real file and report.

### T9 — Nothing leaked into git

```sh
git status --short                       # only Mary's index.html + 2 untracked
git status --porcelain --ignored | grep -cE 'job_data|qwi/output|output/'
git ls-files data_analysis/micro/output | wc -l          # expect exactly 5
git ls-files -z | xargs -0 du -h | sort -rh | head -3    # largest ≈ 1.7M
# guard still works:
head -c 3000000 /dev/urandom | base64 > _v.txt && git add -f _v.txt
git commit -m x ; git reset -q ; rm -f _v.txt            # commit MUST be rejected
```

---

## Reporting back

Append a section to the bottom of this file:

```markdown
## Run log — <date>, R <version>, <platform>

| Test | Result | Notes |
|---|---|---|
| T1 | pass / fail | |
...
```

For each failure, record: the exact error, the file and line, what you changed,
and whether the fix is complete or a workaround. If a test was skipped, say why.

Commit fixes in small separate commits. Commit regenerated `data/*.js` **only**
if the diff is a timestamp plus explained data movement — and say which in the
message. Then stop; do not push.

## Ranked list of what is most likely to be wrong

1. **`_paths.R` under `source()`/RStudio** — the `sys.frame(1)$ofile` fallback is
   the least tested line in the repo. Rscript is fine.
2. **`run_micro.R`'s changed output directory** — behaviour change, unexercised.
3. **Completeness of the copied `btos/output/raw/`** — 76 files copied; if the
   fetcher expects a `strata.json` or an `.xlsx` that didn't come across,
   `02_build_btos.R` will say so.
4. **T4/T6 in `03_tests_industry.R`** — these have never run in this repo, because
   the QWI panel wasn't reachable until now. They may need work unrelated to the merge.
5. **Memory on T5** — 3.8 GB RDS with no slim cache.
6. **Locale mangling** in anything regenerated with `--refresh`.
