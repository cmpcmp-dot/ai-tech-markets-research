# Performance Analysis: index.html

## What the user experiences

Tab clicks feel sluggish. The page takes noticeable time to become interactive on load,
and switching between views (Research, Themes, Policy Map, etc.) causes visible pauses
even though the data hasn't changed.

## Root causes

### 1. Synchronous blocking payload (~2.9 MB)

Three data files load as plain `<script src>` tags with no `async` or `defer`
(index.html:1942-1946). The browser cannot paint anything until all of them
finish downloading, parsing, and executing.

| File                     | Size  |
|--------------------------|-------|
| tracker-data.js          | 704 KB |
| fact-bank-data.js        | 860 KB |
| jobs-displacement-data.js| 164 KB |
| index.html (inline JS+CSS)| 260 KB |
| Fonts (8 files)          | ~880 KB |

The 1.7 MB of JavaScript is the critical path. Nothing renders until it's fully
executed.

### 2. Every tab click unconditionally rebuilds hidden DOM

`setView()` (line 4164) calls `render()` (line 4068) on every tab switch, with no
check for whether the user is already on that view.

`render()` unconditionally runs `buildCatNav()` and `buildInlineFilters()` before
branching on the active view. These two functions:

- Empty and rebuild the sidebar category nav and inline filter bar from scratch
- Call `filteredBase()` a total of 3 times per render pass
- Each `filteredBase()` call clones every entry via
  `.map(r => ({ ...r, _status: calcStatus(r) }))` — a full dataset copy

The sidebar and inline filters are hidden by CSS on 5 of 6 views (themes, policy,
about, jobs, fact-bank), so this produces invisible DOM on every non-Research tab
click.

**Correction (measured 2026-07-23):** an earlier draft blamed the "full-dataset
clones" for the slowness. That is wrong. Cloning all 264 entries with
`calcStatus` costs ~0.14 ms; a render's 3-4 clones is ~0.5 ms. Even 10x slower on
a phone it is imperceptible. The clone is not the bottleneck. The real cost on a
tab switch is **DOM construction** — building 264 research cards (`innerHTML` +
`addEventListener` each) on the Research view and rebuilding all theme cards on
Themes — plus the whole-tree style recalc when `render()` toggles `document.body`
classes over a large DOM. The wasted sidebar/filter build is cheap; it is worth
skipping only because it is trivially skippable, not because it was slow.

### 3. View DOM is torn down and rebuilt on repeat visits

- `buildThemesView()` (line 3034) does `grid.innerHTML = ''` and rebuilds every
  theme card from scratch, including a fresh paperMap.
- The cards view does `grid.innerHTML = ''` then calls `buildCard()` for every
  visible entry, each with innerHTML + event listener attachment.
- The Policy Map view is the exception: it has a `if (!area.hasChildNodes())`
  guard (line 3341) that caches the DOM after first build.

### 4. `filteredBase()` count per render

| Tab clicked | filteredBase() calls | Full dataset clones | DOM rebuilt |
|-------------|---------------------|--------------------|-------------|
| Themes      | 3                   | 3                  | All theme cards + nav |
| Research    | 4                   | 4                  | All cards + nav + filters |
| Policy      | 3                   | 3                  | (guarded, cached) |
| About       | 3                   | 3                  | Nothing |
| Jobs        | 3                   | 3                  | Nothing |
| Fact Bank   | 3                   | 3                  | (lazy, but still clones) |

### 5. Secondary issues

- `validateData()` (line 4491) runs `JSON.stringify()` over entire THEMES and
  POLICY_DATA arrays for regex scanning at load time.
- `renderPolicyLinksGraph()` (line 3549) runs 400 ticks of O(n^2) repulsion
  on the main thread, though this only runs on first visit to the Links sub-view.
- The paperMap lookup (`Object.fromEntries(RESEARCH_DATA.map(...))`) is rebuilt
  in at least 5 separate places (lines 3041, 3091, 3735, 4545, and within
  buildPolicyView forEach loops).
- 8 font files totaling ~880 KB load eagerly at page start.

## What was done (2026-07-23)

Scoped to the tab-switch symptom only. See ADR `docs/adr/0004`.

1. **Themes got its own container.** Added `#themesArea` beside `#cardsGrid` and
   pointed `buildThemesView()` at it. CSS shows `#themesArea` under
   `.strategy-view` and hides `.cards-grid` there (and vice versa on the cards
   view), exactly like Policy/About/Jobs/Fact Bank already work. Research and
   Themes no longer share one container, so switching between them stops tearing
   either one down.

2. **Signature-guarded rebuilds.** `render()` now rebuilds a view only when its
   inputs change. Research signature: `activeLens, activeCat, activeStatus,
   activeGeo, activeEvidence, sortOrder, searchQuery`. Themes signature:
   `activeLens, activeThemeId, themeShowAll`. On a plain tab switch the signature
   is unchanged, so the cached DOM is re-shown by CSS with no rebuild.

3. **Sidebar/filter build gated to the cards view** (the old 1a), moved inside
   the cards rebuild path so it no longer runs on the five views where it is
   `display:none`.

Deliberately **not** done: the `setView` same-view early return (the signature
guard already removes its cost, and it risked skipping hash/aria bookkeeping);
the load-time deferral; and the micro-optimizations below.

Verification: caching logic checked headlessly with jsdom (rebuild counts via
`MutationObserver`) — tab switches rebuild nothing; filter, lens, and theme
changes rebuild the correct view; no JS errors. CSS visibility per view still
wants a real-browser pass.

## Deferred next steps

These remain worthwhile but were out of scope for the tab-switch fix. Rough
priority: 3 (load time) is the next real user-visible win; the rest are hygiene.

### Phase 2: Reduce per-render compute (LOW impact — see correction above)

Worth doing as hygiene, not for speed: the clone/paperMap costs are ~0.5 ms and
sub-millisecond. Do these only if touching this code for another reason.

**2a. Compute `_status` once at load time.**

`calcStatus(r)` is pure and deterministic. Run it once when the data loads
and store the result on each entry, so `filteredBase()` doesn't need to
`.map()` over the entire dataset on every call.

**2b. Build paperMap once at load time.**

`Object.fromEntries(RESEARCH_DATA.map(r => [r.id, r]))` is called in
5+ places. Build it once and store it as a module-level constant.

**2c. Cache filteredBase results.**

Since filters rarely change between renders, memoize `filteredBase()` with
a cache key based on the filter parameters. Invalidate on any filter
state change.

### Phase 3: Reduce blocking load time (medium impact, medium risk)

**3a. Defer jobs-displacement-data.js.**

This data is only needed when the Job Displacement tab is opened. Load it
with `<script defer>` or dynamically on first tab access.

**3b. Defer or lazy-load fact-bank-data.js.**

Same logic: the Fact Bank module already lazily builds its DOM on first
tab open (line 4829). The data could also load lazily.

**3c. Consider data as JSON instead of JS.**

The current `<script src="data/tracker-data.js">` pattern forces the browser
to parse the data as executable JavaScript. Loading as JSON via fetch()
would allow the browser to skip JS parsing and use a faster JSON parser.
This would require a small init function to load the data on demand.

### Phase 4: Move validation off the critical path (low impact, low risk)

**4a. Defer validateData() to requestIdleCallback.**

The data validation IIFE (line 4491) runs synchronously at load and does
heavy `JSON.stringify()` calls. Move it to `requestIdleCallback` or
`setTimeout(..., 0)` so it doesn't block rendering.

### Prioritized execution order (remaining work)

1. **3b + 3a** (defer the 860 KB fact-bank and 164 KB jobs payloads) — the next
   real user-visible win, targets initial load / time-to-interactive
2. **3c** (data as JSON via fetch) — larger change; do only if 3a/3b aren't enough
3. **4a** (defer validation to `requestIdleCallback`) — minor load cleanup
4. **2a + 2b + 2c** (per-render micro-opts) — hygiene only; not perceptible

Before shipping any load-time change, capture a real Chrome Performance cold-load
trace so the before/after is measured, not assumed.
