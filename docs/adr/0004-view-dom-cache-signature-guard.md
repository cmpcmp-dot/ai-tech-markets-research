# Views own their container and rebuild only on an input-signature change

**Status:** accepted

Switching tabs felt sluggish. The cause was not what an early `slowness.md` draft
assumed (per-render "full-dataset clones," measured at ~0.5 ms and imperceptible).
It was DOM construction: Research and Themes both wrote into a single `#cardsGrid`,
so every switch between them ran `innerHTML = ''` and rebuilt all cards from
scratch — 264 research cards, or every theme card — even when nothing had changed.
Every other view (Policy, About, Jobs, Fact Bank) already owned its own container
and was shown/hidden purely by a `document.body` class in CSS; Research and Themes
were the exception.

We made Themes consistent with the others: it now renders into its own
`#themesArea`, toggled by the `.strategy-view` body class, so it no longer shares
`#cardsGrid` with Research and the two stop tearing each other down. On top of that,
`render()` rebuilds a view only when its **input signature** changes — Research:
`activeLens, activeCat, activeStatus, activeGeo, activeEvidence, sortOrder,
searchQuery`; Themes: `activeLens, activeThemeId, themeShowAll`. On a plain tab
switch the signature is unchanged, so the cached DOM is simply re-shown.

**Considered alternatives.** (1) Keep the shared `#cardsGrid` and swap cached
detached DocumentFragments in and out of it — rejected as more JS state to keep in
sync than the CSS-driven container approach. (2) A same-view early return in
`setView()` — rejected because the signature guard already removes its cost and it
risked skipping hash/aria bookkeeping.

**Consequences.** A cached view will not reflect a state change unless that state is
in its signature, so any new input that affects Research or Themes output *must* be
added to the relevant signature or the view will show stale DOM. Any code path that
mutates a signature input must flow through `render()` (the theme-pill handlers were
rerouted from calling `buildThemesView()` directly to calling `render()` for this
reason). `scrollIntoView` targets that pointed at `#cardsGrid` for the Themes view
were repointed to `#themesArea`, since `#cardsGrid` is now `display:none` there.
Out of scope and left for later (see `slowness.md`): deferring the large data
payloads and fonts, and the per-render micro-optimizations.
