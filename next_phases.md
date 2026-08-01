# Next phases

State as of 2026-08-01. Everything planned in this file has now been done except
the parts that need R and a BLS key, which cannot run in the environment the
work was done in. Those are written, wired into `analysis/run.R`, and waiting on
one command each.

Nothing is committed.

---

## Where things stand

| | Status |
|---|---|
| Phase 1 — split `index.html` into `src/` | done, verified byte-identical |
| Phase 2 — retire `sync_jobs_displacement.py` | done, one bug fixed |
| Data Tracker view | done, 4 of 5 sub-tabs carry real data |
| Phase 3 — one router | done |
| Phase 4 — lazy payloads | done, 42% of bytes off the critical path |
| View key rename `adoption` → `tracker` | done |
| Test harness | done: `tests/routes.js`, `tests/interactions.js` |
| Repo hygiene | done: `README.md`, `docs/`, `notes/`, `monthly/` |
| **Productivity contract** | **written, never run — needs you** |
| **National JOLTS contract** | **written, never run — needs you** |
| Published URL in `<head>` | **needs your decision** |
| `job_displacement_AI` archive | **needs your decision** |

---

## 1. Two contracts that need running

Both are written and registered in `analysis/run.R`. Neither has been executed:
there is no R and no `BLS_KEY` in the sandbox this was built in, so **treat them
as drafts that compile in my head, not as working code.** Expect to fix
something on the first run.

```sh
Rscript analysis/run.R --list                      # both should appear
Rscript analysis/run.R --refresh tracker-productivity
Rscript analysis/run.R --refresh tracker-jolts
python3 build.py
```

### New shared helper

`analysis/R/bls_api.R` is a small BLS v2 client. The older contracts pull
whole-survey flat files through `tidyusmacro` because they need every series;
these need five each, so the API is a few KB instead of 3.8 GB. It reads
`BLS_KEY` from `.Renviron`, never prints it, chunks at the 50-series limit, and
refuses a window longer than the API's 20 years.

`bls_require_all()` stops and names any series id that came back empty. That
matters because **the series ids are the part I am least sure of.** They follow
the documented layouts, but I could not verify them against a live API. Check
them on the first run:

| Contract | Series |
|---|---|
| `tracker-productivity` | `PRS85006092` output per hour, `PRS85006112` unit labour costs, `PRS85006042` output, `PRS85006032` hours — all nonfarm business, quarterly, SAAR |
| `tracker-jolts` | `JTS000000000000000JOR/HIR/QUR/LDR/TSR` — total nonfarm, SA, rates |

### Correction to what this file said before

An earlier draft claimed the national JOLTS rates could be published from
`analysis/interim/bls/jolts_rates.csv` with no fetch. **That was wrong.** That
file holds only the 15 adoption-group industry codes; there is no total-nonfarm
row in it. Hence `fetch/jolts_national.R` and an API pull.

### Wiring the Productivity tab up once it builds

The tab is currently a deliberate empty state. After the payload exists:

1. Add `data/tracker-productivity-data.js` to `src/views/00-data-scripts.html`.
2. Add `renderProductivity()` to `assets/tracker-charts.js` beside `renderGdp()`
   and call it from `renderAll()`. Quarter labels convert with the same `QM` map.
3. Replace the `.trk-empty` block in `src/views/60-tracker.html` with
   `.trk-stats` plus a `.jd-chart-wrap` holding
   `<svg id="trkProductivity" viewBox="0 0 700 320">`. Keep the fixed viewBox.
4. Change that sub-tab's `<span class="trk-tab-s trk-tab-tk">Not built yet</span>`
   to a plain `trk-tab-s`, e.g. `BLS &middot; quarterly`.
5. `python3 build.py`, then `node tests/routes.js --write` and read the diff.

For JOLTS, add a national-rates chart above the adoption grid in the same view
and delete the third bullet in that panel's `<details>`, which is what currently
discloses that only the adoption split is shown.

---

## 2. Two decisions only you can make

**The published URL.** `src/head.html` still has `canonical`, `og:url` and the
JSON-LD `url` pointing at `cmpcmp-dot.github.io`. I fixed the author metadata,
because the About copy told me the right answer, but I will not guess a URL. Set
all three before this is embedded anywhere.

**`job_displacement_AI`.** 5.7 GB, still holding `btos.html`, `paper.html`,
`evidence_tracker.html` and parallel `micro/`, `exposure/`, `qwi/` trees that
`analysis/` now supersedes. Two live copies means two sources of truth. Archive
it or delete it, but decide.

---

## 3. What was done, and what to know about it

### Phase 3, one router

Routing lives in `src/js/40-router.js`. Flat routes are a `VIEWS` table, so
adding a plain view is one row. The BTOS chain runs on `makeTabGroup`. The six
per-button nav listeners became one delegated listener reading `data-view`.

**One deliberate departure from the plan.** The plan said to put the view nav on
`makeTabGroup` too. I did not. Views have no panels of their own — they share
`#viewPanel` and are shown by body class — and `setView` also drives masthead
copy, `render()`, the sort button and the live region, while About is activated
by the `<h1>` link rather than a nav button. Forcing that in meant contorting
the abstraction or changing ARIA state on the `<h1>`. The duplication that
actually hurt is gone. The snapshot makes it cheap to try if you disagree.

### Phase 4, lazy payloads

`src/js/05-lazy.js` adds `loadPayload(src)`: a cached promise around an injected
`<script src>`, not `fetch`, because `fetch` is blocked on `file://` and both
the preview and offline rebuilds depend on `file://` working.

Deferred: `fact-bank-data.js` (880 KB, on first open of the Fact Bank view) and
`us-albers-data.js` (107 KB, on first open of the BTOS Where panel). 964 KB, 42%
of payload bytes, off the critical path.

**Still eager, and why.** `tracker-data.js` is the research database: the router
reads `RESEARCH_DATA` to resolve `#entry/<id>` and the cards view is one click
from the default. The jobs, BTOS and JOLTS payloads feed three chart engines
that initialise on `DOMContentLoaded` and draw into fixed-viewBox SVGs while
panels are still hidden, which is what makes tab switching instant. Deferring
those means restructuring all three engines' init — a larger and riskier change
than the remaining bytes justify.

The Fact Bank tab is now enabled optimistically and removes itself if the
payload fails, rather than being disabled at load when the data is absent.

### The view key rename

`adoption` → `tracker` throughout: `.tracker-view`, `#trackerArea`,
`setView('tracker')`, `viewTracker`. Files renamed to match:
`src/views/60-tracker.html`, `src/js/50-tracker-tabs.js`.

Three things deliberately kept the old name at the time. Two have since been
revisited; see [`docs/adr/0005`](docs/adr/0005-adoption-to-economy-rename.md).

- `head === 'adoption'` in the router, kept "because `#adoption` and
  `#adoption/<link>` are public links that must keep resolving." The premise was
  wrong: the page is not circulating and nothing links to it. **Alias removed
  2026-08-01**, along with the `#themes`/`#theme/<id>` handoff, which called a
  function that was never defined and threw on every hit.
- `data-group="adoption"`, kept "because the nav group stays labelled Adoption."
  **The group is now labelled Economy**, and the attribute is `economy` to
  match. Adoption named one of the tracker's five sub-tabs, not the group.
- `assets/adoption-charts.js` and `src/styles/adoption.css`. **Still kept**, on a
  sharper reason than the original: `adoption-charts.js` is not only the BTOS
  renderer, it is the shared primitive engine `tracker-charts.js` draws Jobs,
  JOLTS and GDP with, so `btos-charts.js` would be a worse name than the one it
  has. The `.ad-*`/`#ad*` prefix stays for the same reason at ~180 call sites.

### Tests

```sh
node tests/interactions.js              # 58 assertions, ~40s
node tests/routes.js                    # 27 routes, ~2.5 min
node tests/routes.js --slice=0:6        # a chunk, for a short timeout
node tests/routes.js --write            # re-record an intended change
```

`tests/dom.js` inlines every local `<script src>` before parsing so execution
order is real, and serves dynamically injected payloads from disk through a
`requestInterceptor`, without which the lazy path would silently no-op and the
tests would pass for the wrong reason.

The router refactor came out byte-identical on all 26 routes. Later changes
moved the snapshot on purpose and only in the fields named: the tracker and Lab
announcements now match their nav labels, `#tracker/<unknown>` resolves inside
the tracker and normalises the address bar, and the rename changed the body
class, the nav button id and `aria-labelledby`.

### Repo hygiene

Root now holds `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `next_phases.md`,
`build.py` and the two generated pages. `CONTEXT.md` split into the new
`README.md` and `docs/GLOSSARY.md`. Post-mortems to `docs/history/`
(`MERGE_PLAN.md`, `PORTING.md`), working notes to `notes/`. `monthly data/`
renamed `monthly/`. `tests/golden/` deleted, now that `build.py --check` and the
pre-commit guard subsume it. Live cross-references updated; the ones left
pointing at old paths are inside ADRs and post-mortems, where they are the
historical record.

---

## 4. The Quarto question, still open

Nothing in the Data Tracker uses Quarto. The four new sub-tabs are hand-written
markup reading published payloads, which was the fastest honest path to a demo.
The decision in `docs/ARCHITECTURE_OPTIONS.md` still stands: prose and numbers
move into `.qmd` files rendered to fragments and spliced by `build.py`, with
charts staying in the JS engine.

The tracker is the natural place to try it, because its panels are short and
structurally identical month to month. Cheapest first cut: convert the **GDP
panel only** to `monthly/gdp.qmd`, add a target to `build.py`'s `TARGETS` for the
fragment, and see whether the authoring loop is pleasant before converting the
rest. One panel is an experiment; five is a commitment.

Rule that holds whatever you decide: a `.qmd` may **read**
`analysis/interim/**` and `data/*.js`, and must never fetch BLS, BEA or Census
at render time.
