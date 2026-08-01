# Rename the nav category "Adoption" to "Economy"

**Status:** accepted

The site's six tabs sit in three labelled groups. The middle one, holding Data
Tracker and Job Displacement, was called Adoption. That was accurate when the
group was one tab drawing Census BTOS. It stopped being accurate when the Data
Tracker grew to five sub-tabs: Jobs, JOLTS, GDP, Productivity and Census BTOS.
Adoption named one of those five, and named neither the tracker as a whole nor
Job Displacement beside it. Renamed to **Economy**.

Economy is also what the About page already called it. The lede reads "We don't
know what this technology will become, how the economy will absorb it, or what
policy should do in response," which maps onto Research / Economy / Policy. The
site title, previously "AI Tracker: Research, Impact, and Policy," now names the
same three groups the nav does.

"Impact" was considered for title consistency and rejected: most of what sits
under the group currently reports *no* detectable impact, so the label would
presuppose its own conclusion.

## Scope of the rename

- **Nav:** the `tab-group-label` text, `data-group="adoption"` →
  `data-group="economy"`, and the matching accent selector in
  `src/styles/shell.css` (Warm Gold, unchanged).
- **Title:** `AI Tracker: Research, Impact, and Policy` → `... Research, Economy,
  and Policy` in `src/views/10-header.html`.
- **About:** the second of the three framing questions and its section header.
  One clause changed with it, from "how it enters the economy is a separate
  question" to "how the economy absorbs it is a separate question," because the
  original ate its own tail under the new label and the replacement echoes the
  lede. The three body paragraphs were not touched.
- **Comments:** in `40-router.js`, `50-tracker-tabs.js`, `60-tracker.html`,
  `assets/adoption-charts.js`, `src/styles/adoption.css`, and the headers of
  `analysis/src/publish/btos.R` and `btos_exposure.R`.
- **Docs:** `CONTRIBUTING.md`, `next_phases.md`, `docs/ARCHITECTURE_OPTIONS.md`,
  the root `CLAUDE.md`, and a `docs/GLOSSARY.md` entry for each of the three nav
  groups, which the glossary previously did not define at all.

## Deliberately left alone

- **"Adoption" as an economic variable.** BTOS measures the share of firms using
  AI; the charts split industries into high, middle and low adoption groups; the
  prose says "Adoption is not causation." This is the correct technical term for
  what the survey asks and it matches `analysis/src/exhibits/adoption_*.R`. The
  nav category and the variable are different things that shared a word. Purging
  the word would have made the charts wrong.
- **`assets/adoption-charts.js` and `window.ADOPTION_CHARTS`.** The filename is
  historical, but the obvious replacement, `btos-charts.js`, would be *more*
  misleading: the export list is the shared primitive engine that
  `assets/tracker-charts.js` uses to draw the Jobs, JOLTS and GDP panels, and
  only the renderers are BTOS. An accurate name is a refactor, not a rename, and
  the file is load-order-critical. Header comment rewritten instead.
- **`src/styles/adoption.css` and the `.ad-*` / `#ad*` prefix.** Around 180 call
  sites across CSS, markup and JS selectors, several of them element ids that
  `adoption-charts.js` documents as a contract. A missed `#adMapNote` renders a
  chart into nothing, and tab panels sit in the DOM `hidden`, so it would not
  necessarily be visible. No reader ever sees a class name. Header comment
  rewritten instead.
- **`docs/history/PORTING.md`, `docs/history/MERGE_PLAN.md`,
  `tools/extract_phase1.py`.** Records of what happened, when the thing was in
  fact called Adoption. `extract_phase1.py`'s line-range manifest refers to a
  specific past `index.html` and would be actively falsified by editing it.
- **`prototypes/`.** Frozen. `themes.html`'s `<a href="#adoption">` links resolve
  inside its own router, not the main app's.

## Consequence: two dead routes removed

The rename surfaced routing that only made sense under the old name.

**The `#adoption` alias.** `next_phases.md` justified keeping it "because
`#adoption` and `#adoption/<link>` are public links that must keep resolving."
The page is not circulating and has no inbound links, so the premise was false.
Removed. Under the new label an `#adoption` URL landing in a group called
Economy would have been the exact confusion this ADR exists to prevent.

**The `#themes` / `#theme/<id>` handoff, and a live `ReferenceError`.**
`goToThemesPage()` was called in three places and defined in none. Visiting
`#themes` threw inside `applyHashRoute()`, which has a `finally` but no `catch`,
aborting init before `setView()` and before the `hashchange` listener bound,
leaving a blank page. It was reachable by click too: every key-finding modal
rendered an "Explore the *tag* theme" button whose handler called it.

Removed with it: `goToTheme()`, two guards in `openFindingModal` and the
key-findings band that could not fire (cards are built from `RESEARCH_DATA` with
`data-paper-id` always set), the `.paper-theme-badge` click handler (no template
ever emitted that element), and the `.finding-theme-link` and
`.paper-theme-badge` CSS rules left orphaned.

## Pre-existing gaps noticed

- **`tests/routes.js` did not cover `#themes` or `#theme/<id>`,** which is why a
  `ReferenceError` on a live route went unnoticed. `#nonsense` was covered, but
  the themes branch intercepted before the fall-through. Both are now in
  `ROUTES`, as are `#adoption` and `#adoption/who`, pinned to their fall-through
  to About. Removing a route from the app is the moment to add it to the tests,
  not to drop it: all four now record `bodyClasses: [about-view]` with an empty
  `errors` array, which is the standing evidence the throw is gone.
- **The sources modal linked to `themes.html` at the site root,** where no such
  file exists. Repointed to `prototypes/themes.html`.
- **Two comments named `src/js/50-adoption-chain.js`,** a file that no longer
  exists. Corrected to `50-tracker-tabs.js`.

## Verification

`node tests/routes.js` and `node tests/interactions.js` were run green on a
clean tree before any edit. After the label change the route snapshot was
**byte-identical**, which is the property that made the rename safe to assert:
the snapshot keys on element ids and view names, not labels. The snapshot was
re-recorded only for the route deletions, going from 26 routes to 27.

No data payload changed, so no contract in `analysis/` was rerun. There is no R
in the sandbox this was done in, and none was needed.
