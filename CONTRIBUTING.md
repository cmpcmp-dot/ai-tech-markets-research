# Where to edit what

`index.html` and `jobs_displacement.html` are **generated files**. Do not edit
them. They are committed because GitHub Pages serves them and the WordPress embed
loads `index.html` as one self-contained document, but the sources are in `src/`.

```sh
git config core.hooksPath .githooks   # once per machine: enables both guards
python3 build.py                      # src/ -> both pages
python3 build.py --check              # verify without writing; exit 1 on drift
```

| Output | From | Is |
|---|---|---|
| `index.html` | `src/index.template.html` | the site: six views in one document |
| `jobs_displacement.html` | `src/jobs_displacement.template.html` | the Job Displacement view alone, for drafting |

The two **share their sources**. `src/views/70-jobs.html`,
`src/styles/jobs.css`, `src/js/90-jobs-inline.js` and the data-script block are
each included by both templates, so there is no second copy to keep in step and
nothing is scoped, filtered or rewritten on the way between them. Edit the shared
file and both pages change.

Where the two genuinely must differ, the shared JS branches at **runtime** on one
flag:

```js
const EMBEDDED = !!document.getElementById('viewPanel');
```

true inside the `index.html` shell, false standalone. Two behaviours use it: the
scroll-spy writes `location.hash` only when standalone (embedded, the tab router
owns the hash), and the first-paint force-draw runs only when embedded (standalone,
nothing is `display:none`). Anything else that has to differ belongs behind the
same flag, not behind a build-time transform.

## The four things you might want to change

| I want to change | Edit | Then |
|---|---|---|
| **a number** | nothing | `Rscript analysis/run.R <contract>` |
| **prose or markup** | `src/views/<view>.html` | `python3 build.py` |
| **styling** | `src/styles/<area>.css` | `python3 build.py` |
| **app behaviour** | `src/js/<area>.js` | `python3 build.py` |
| **a chart** | `assets/<view>-charts.js` | nothing; loaded directly |

**Never hand-edit `data/*.js`.** Every one is generated, carries an
`AUTO-GENERATED` header, and is the published contract between the analysis and
the site. `Rscript analysis/run.R --list` shows which contract owns which file.
See [`analysis/README.md`](analysis/README.md).

## src/ layout

`src/index.template.html` is 97 lines: the whole document skeleton, plus one
directive per block.

```
@@include src/styles/tokens.css@@
```

alone on a line, replaced by that file's exact bytes at build time. That is the
entire format. No variables, no conditionals, no bundler, no npm.

**Order is significant and lives in the template**, not in `build.py`. CSS
cascade order and JS execution order inside the app IIFE are both just the order
the directives appear. Moving a directive changes behaviour; moving a *file* does
not.

```
src/head.html                meta, JSON-LD, analytics
src/styles/tokens.css        @font-face, :root, type scale, masthead, chevron
src/styles/shell.css         header band, shared tab opener
src/styles/cards.css         app layout, sidebar, filters, card grid, themes
src/styles/modals.css        sources modal, policy pop-out
src/styles/policy.css        policy map, matrix, columns, category rows
src/styles/focus.css         :focus-visible, global
src/styles/charts.css        shared .jd-* chart chrome
src/styles/jobs.css          Job Displacement view
src/styles/adoption.css      Census BTOS panels + the chain (name is historical)
src/views/00-data-scripts    the data/*.js <script> tags
src/views/10-header          site header nav
src/views/20-shell           <main>, sidebar, tab description, #viewPanel
src/views/30-fact-bank       ... 40-solutions, 50-about, 60-tracker,
                                 70-jobs, 80-papers, 90-modals
src/js/00-state              data wiring, helpers, state
src/js/10-policy-map         ... 20-cite-export, 30-changelog, 40-router,
                                 45-tabgroup, 50-tracker-tabs, 60-whats-new,
                                 70-render, 80-fact-bank, 90-jobs-inline
```

The router is still split: `src/js/40-router.js` owns hash mapping and the
`VIEWS` table, but `setView()` lives in `70-render.js` and the `.ad-link` chain
inside the Census BTOS sub-tab is in `50-tracker-tabs.js`. Consolidating them is
a separate change; `40-router.js` is where it lands.

## Tests

```sh
npm install jsdom                       # once
node tests/interactions.js              # clicking and keyboard, ~40s
node tests/routes.js                    # every route, ~2.5 min
node tests/routes.js --slice=0:6        # a chunk, if you want it faster
node tests/routes.js --write            # re-record after an intended change
```

`tests/dom.js` loads a built page into jsdom with every local `<script src>`
inlined in place, so the scripts execute in the real browser order without
touching the network.

`tests/routes.js` is a snapshot: for each route it pins the body classes, which
nav button is current, which tab and panel are visible, the announce text, the
address bar, how many nodes each chart drew, and the published values in the
tracker's stat tiles. A refactor that changes none of that is provably safe. Two
changes legitimately move the snapshot, and both should be visible in review:
rebuilding a data contract (chart node counts, stat values) and adding a view or
tab. Read the diff before re-recording; do not re-record to clear a red run.

`tests/interactions.js` covers what a snapshot of page loads cannot see: that
buttons actually respond. It exists because the view nav is one delegated
listener reading `data-view` attributes, and a typo there would leave every
route green and every button dead.

Neither runs in the pre-commit hook: a full sweep is about two and a half
minutes, which is too slow to sit in front of every commit. Run them before
pushing anything that touches `src/js/` or the view markup.

## Two guards

`.githooks/pre-commit` refuses a commit that:

1. stages an `index.html` differing from a fresh build of `src/`
   (`SKIP_BUILD_GUARD=1` to override), or
2. stages any blob over 2 MB (`SKIP_SIZE_GUARD=1` to override).

Both fire before review, which is the point. If guard 1 trips, you almost
certainly edited `index.html` instead of `src/`; move the change into `src/`
before rebuilding, because rebuilding discards it.

## Provenance

The split of the original 6,341-line `index.html` into `src/` is recorded in
[`tools/extract_phase1.py`](tools/extract_phase1.py) as an explicit line-range
manifest. That extraction was verified byte-for-byte identical against the
pre-split file (md5 `d1dbd2ff7c1328d6815dd77fe0217e03`), so the refactor is
provably behaviour-neutral. The script is kept for reviewability and is not
meant to be re-run.

`sync_jobs_displacement.py` was deleted afterwards. It existed to copy the Job
Displacement view from `jobs_displacement.html` into `index.html`, scoping every
CSS selector to `#jobDisplacementArea`, dropping preview chrome and the shared
`.jd-*` family, checking that both files agreed on which payloads they loaded, and
rewriting two things in the JS. Building both pages from one source removed the
reason for all of it: there is no copy to scope, no second selector list to keep
consistent, no payload list to reconcile, and the two JS differences became a
runtime flag.

It also fixed a bug that arrangement had introduced. The script appended the
first-paint force-draw block *after* the closing `})();` of the view's IIFE, which
put it outside the scope declaring `const drawFor`. Opening the Job Displacement
tab threw `ReferenceError: drawFor is not defined` inside the `MutationObserver`
callback, so the block never did its job and the first section's charts were drawn
later by the scroll observer instead. That block now lives inside the IIFE.
