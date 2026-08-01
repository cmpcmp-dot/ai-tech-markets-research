# Data Tracker tab + repo structure: options

Draft for discussion, 2026-08-01. Nothing here is executed. Two decisions at the
bottom gate everything else.

## What exists now

`index.html` is 6,341 lines in one file:

| Part | Lines | Notes |
|---|---|---|
| `<style>` (34-2567) | 2,533 | one block, all six views |
| `<script>` (3595-6039, 6074-6326) | 2,705 | app engine, router, renderers |
| Content HTML (2568-3594) | ~1,027 | all six views' markup |

Six top-level views in three labelled groups: Research (Papers, Fact Bank),
Adoption (Adoption, Job Displacement), Policy (Lab, Solutions). Two independent,
hand-rolled tab systems: `.header-nav-btn` for views, `.ad-link` / `.ad-panel`
for the six sub-tabs inside Adoption.

Data flow is already clean and worth preserving:

```
analysis/src/fetch/*.R  ->  analysis/interim/**       (uncommitted, regenerable)
analysis/src/exhibits/  ->  interim/cards/*.json      (one fragment per card)
analysis/src/publish/   ->  data/*.js                 (committed; the contract)
index.html              <-  window.BTOS_DATA etc.     (classic <script src>)
```

`data/*.js` totals 2.33 MB and every byte loads on every page view regardless of
which tab is open (`fact-bank-data.js` alone is 880 KB, `tracker-data.js` 723 KB).

The publish page is embedded as an iframe on a WordPress page, the way
`affordability-data-tracker` embeds `mikekonczal.com/affordability_tracker_demo/?embed=1#view=national&anchor=2019`.
That fixes three constraints: one document, hash-based deep links, and whatever
height handshake the parent uses has to keep working across tab switches.

## Part 1 - Adoption becomes Data Tracker

Requested: rename the top-level Adoption view to **Data Tracker**, with five
sub-tabs (Jobs, JOLTS, GDP, Productivity, Census BTOS), and move all six current
`.ad-panel` sections under Census BTOS.

Mechanically this is small: the `.ad-spine` / `.ad-panel` machinery already does
sub-tabs, so Census BTOS becomes one sub-tab whose body is the existing spine.
That nests tabs three deep (group -> view -> sub-tab -> BTOS chain), which is one
level more than the current router was built for and the point at which a single
generic router earns its keep.

The substantive problem is overlap, not markup:

- Job Displacement already *is* the jobs analysis (Okun, age x education,
  industries, hiring flows, young workers).
- JOLTS already appears there, via the `btos-jobs-monitor` contract
  (`jobs_04_flows`).
- A "Jobs" sub-tab under Data Tracker and a "Job Displacement" view will
  duplicate each other within two release cycles unless the boundary is written
  down.

The defensible split: **Data Tracker = what this month's release said** (short,
regenerated on release day, near-identical structure every month). **Job
Displacement = the standing argument** (long, revised occasionally, cites the
tracker). If that is the split, Job Displacement probably belongs under Research,
not next to Data Tracker.

## Part 2 - Where Quarto fits

Five options, cheapest first. They are not exclusive; A is a prerequisite for all
of them and B/D are the real fork.

### A. Quarto (or plain R) produces numbers only; no HTML from Quarto

Extend what `analysis/` already does. Each tracker sub-tab gets a contract that
publishes a flat key/value payload of every citable figure. Prose in `index.html`
carries `<span data-num="jolts.quits_rate">`, filled at render from the payload.
No number is ever typed by a human.

This already half-exists: `renderChain()` fills `#adChainV-*` from `BTOS_DATA`
"so they cannot drift from the data". Generalising that into one `data-num`
binding is maybe 30 lines and removes the largest single class of error on a
release-day deadline.

- **For:** cheap, zero design risk, keeps `file://` working, works with every
  other option.
- **Against:** staff still write prose inside a 6,000-line HTML file.

### B. Quarto renders content *fragments*; a build step splices them in

Each sub-tab is a `.qmd` with inline R (`` `r fmt(payroll_3mo)` ``). Quarto
renders it two ways: a standalone themed HTML for drafting (`quarto preview`),
and a bare body fragment that a build script splices into `index.html` between
markers.

This is exactly the pattern `sync_jobs_displacement.py` already implements for
one file, generalised to N. The hard-won parts (scoping every ported selector
under a container id, `--check` mode so a hand-edit between markers is caught
before the next sync destroys it) carry straight over.

- **For:** authors get a real preview loop and their own small file; deploy
  artifact stays one self-contained document; `file://` still works; matches the
  repo's existing taste.
- **Against:** the sync script becomes load-bearing infrastructure; CSS scoping
  discipline is mandatory; Quarto injects Bootstrap unless run with `theme: none`,
  which will fight the ESP styles.

### C. Quarto owns the whole page

Port the 2,533 lines of CSS to a Quarto SCSS theme plus a custom HTML template,
make every view a `.qmd`, and let a Quarto website project emit the site.

- **For:** one authoring system, nothing bespoke to maintain.
- **Against:** highest up-front cost, and it fights Quarto's grain. Quarto wants
  pages; this is one document with a bespoke tab shell. `panel-tabset` will not
  reproduce the `.ad-spine` design. Realistically a multi-week rebuild of working
  UI, and the odds of ending up with a template that is harder to reason about
  than the current file are not low.

### D. Each sub-tab is a Quarto page fetched into the shell at runtime

`index.html` stays the shell and router; on first open of a tab it `fetch()`es
`tracker/jolts.html` and injects it.

- **For:** best authoring isolation (one person per file, no merge conflicts on
  the monolith), lazy loading falls out for free, one URL and hash deep links
  preserved.
- **Against:** `fetch()` fails over `file://`, so this trades away a constraint
  `analysis/R/serialize.R` says is deliberate. Needs loading states, error states,
  and charts must initialise on inject rather than `DOMContentLoaded`.

### E. Nested iframe per sub-tab

Zero CSS collision, total isolation. Also nested iframes inside an
already-iframed WordPress page: double scrollbars, two height handshakes, broken
deep links, awkward analytics. Not recommended.

### The decision underneath all five: who draws the charts

Bigger than A-E. Today every chart is hand-rolled inline SVG in
`assets/adoption-charts.js` (779 lines) and `assets/jobs-charts.js` (919 lines),
drawn from JSON, no library, no CDN. If staff write ggplot in `.qmd` chunks, the
Data Tracker gets static images that will not match the interactive charts one
tab over, and the repo carries two chart systems forever.

- **(i) Charts stay in JS.** Quarto contributes numbers and prose only. Visual
  consistency holds; every new chart costs JS work.
- **(ii) ggplot in the tracker tabs.** Far faster monthly turnaround, uses the R
  skills already here, and static PNG/SVG in a tracker is defensible. Costs
  interactivity and consistency.

A middle path: (ii) for the four new tabs while they find their shape, (i) for
anything promoted into the argument views. That is a real fork with a real cost
either way, and it should be a conscious choice rather than a drift.

### Rule Quarto must not break

A `.qmd` may **read** `analysis/interim/**` and `data/*.js`. It must never fetch
BLS/BEA/Census at render time. Otherwise reproducibility, offline rebuilds and
render speed all go, and the contract boundary that `analysis/run.R` enforces
stops meaning anything.

## Part 3 - Simplifying the repo

### Split `index.html` into build inputs (highest value)

```
src/head.html
src/styles/{tokens,shell,cards,adoption,tracker,jobs,policy}.css
src/views/{papers,fact-bank,tracker,jobs,lab,solutions}.html   (or .qmd)
src/js/{router,cards,factbank,policy}.js
build.py            -> index.html   (single self-contained file)
```

The deploy artifact stays one file, which is what the iframe embed wants. Authors
touch 200-line files. No bundler, no npm; a ~50-line script in the style of
`run.R` and `sync_jobs_displacement.py`. This is what makes multi-author editing
possible at all, and it is the prerequisite for B.

### One router, one tab abstraction

Replace the two ad-hoc systems with a declared view/sub-view config; render nav
from it; hash format `#view=data-tracker&tab=jolts`, matching the affordability
tracker's `#view=...&anchor=...` convention so deep links work inside the embed.

### Load data per view

Defer each `data/*.js` until its view first opens. An 880 KB fact bank should not
block first paint of the Data Tracker inside a WordPress page.

### Directory hygiene

- Root holds six `.md` files totalling ~130 KB of working notes
  (`RECOMMENDATIONS.md` 53 KB, `MERGE_PLAN.md`, `PENDING_SOURCES.md`,
  `next_steps.md`, `becky_brief.md`, `CONTEXT.md`). Move post-mortems to
  `docs/history/` (`MERGE_PLAN.md` says itself it is superseded; same for
  `analysis/PORTING.md`), working notes to `notes/`. Keep the `CONTEXT.md`
  glossary - it is good - as `docs/GLOSSARY.md`.
- One `CONTRIBUTING.md` that answers only "where do I edit": a number -> rerun
  the contract, never touch `data/*.js`; prose -> `src/views/<tab>`; a chart ->
  `assets/<tab>-charts.js`; then `make`. That routing is currently spread across
  `CONTEXT.md`, `MERGE_PLAN.md`, `analysis/README.md`, `analysis/PORTING.md`,
  `analysis/INPUTS.md` and `next_steps.md`.
- Rename `monthly data/` to `monthly/`. A space in a directory name will break
  shell and R paths repeatedly for no benefit.
- `.DS_Store` appears throughout; add a global ignore.
- Five branches including `killer-facts.lock.old`, and Killer Facts was renamed
  to Fact Bank. Prune.
- Decide whether `job_displacement_AI` (5.7 GB) is archived. `MERGE_PLAN.md` says
  the merge executed and the old repo was left untouched; it still holds
  `btos.html`, `paper.html`, `evidence_tracker.html` and parallel `micro/`,
  `exposure/`, `qwi/` trees. Two live copies means two sources of truth, and
  `monthly data/` was started in the new repo, so the ambiguity is already live.

### Release-mode versioning

Five monthly tabs means five artifacts overwritten on release day. Per the
release-mode rules in `CLAUDE.md`, each rebuild should be datestamped rather than
silently overwritten - either a `data/vintages/YYYY-MM-DD/` archive or a git tag
per release, so a chart can be reproduced as it was published.

### `CLAUDE.md`

The global file is written for R econometrics. This repo is now mostly a
JS/HTML publishing system, and needs a repo-level `CLAUDE.md` stating: never
hand-edit `data/*.js`; run the build after touching `src/`; ASCII only in
published payloads (`serialize.R` refuses non-ASCII, and the no-em-dash rule is
enforced there in code, not just style); a `.qmd` never fetches at render time.

Nothing in `analysis/` needs changing. Contracts, `--refresh`, sentinel skipping
for the slow CPS/QWI steps, and the ASCII guard are the right design and should
be the template for the new tabs, not the thing that gets reorganised.

## Decisions taken 2026-08-01

**1. Data Tracker and Job Displacement stay separate views.**

> "The Tracker is monthly, short, updating graphics, small narrative for
> reporters and others looking at real-time data. Displacement is more research
> focused, longer-term, asking specific questions and perhaps pulling in more
> data. This distinction will grow with more work." - MK

Consequences: Job Displacement moves out of the Adoption group (it is research,
not a release monitor). The tracker's five sub-tabs are short and structurally
identical month to month, which argues for one template plus five payloads rather
than five bespoke pages. JOLTS content currently inside Job Displacement
(`jobs_04_flows`) has to be assigned to one side or the other - most likely the
long-run hiring-flows argument stays in Displacement and the tracker's JOLTS tab
reads the current month off the same interim data.

**2. Charts stay interactive, drawn by the existing JS SVG engine.** Not ggplot
images. See [Interactive charts](#interactive-charts-what-the-options-actually-cost).

## Interactive charts: what the options actually cost

The requirement is hover. The repo already satisfies it: `assets/jobs-charts.js`
and `assets/adoption-charts.js` share a single `.jd-tooltip` div, mark hoverable
SVG nodes with `data-tip`, and the time-series charts add an invisible overlay
rect that snaps a crosshair guide to the nearest observation
(`jobs-charts.js:183`, `:383`, `:618`). That is better behaviour than most
library defaults.

Ranked for this situation:

1. **The existing engine (chosen).** `drawLines()` and `drawBars()` in
   `adoption-charts.js` are already generic over `{pts, color, tipLabel}` and
   `{label, value, color, tip}`. Most tracker charts are lines and bars, so a new
   tab is mostly a new payload, not new chart code. Zero dependencies, exact ESP
   colours, works offline. Cost: a renderer function per genuinely new chart type,
   written in JS.
2. **ggiraph.** The closest thing to "write ggplot, get hover":
   `geom_line_interactive(aes(tooltip =, data_id =))` plus `girafe()`. Costs: ships
   its own JS, emits a verbose inline SVG that gets large with many points, needs
   the font present at render, and its tooltip will not match `.jd-tooltip`
   without replicating the CSS through `opts_tooltip(css =)`. Good escape hatch
   for a one-off exploratory chart not worth a renderer.
3. **plotly via `ggplotly()`.** Hover for free, but roughly 3 MB of JS, an
   unmistakable plotly look (modebar, its own type and tooltips), and `ggplotly()`
   silently mangles annotations, secondary axes and custom scales. Wrong for a
   brand-forward embed.
4. **echarts4r / highcharter / dygraphs.** Polished, each with its own visual
   language and bundle. Same objection as plotly, milder.
5. **OJS cells (Observable Plot / D3) in the `.qmd`.** Full control and it lives
   in the document. Costs a third language and a reactive runtime, to rebuild a
   tooltip layer that already exists in `assets/`.

### Constraint that must not be broken

Tracker panels sit in the DOM `hidden` when not selected, and a hidden element
measures zero width. Every chart therefore keeps a fixed `viewBox` (700x360 today)
and must never size itself from `clientWidth` / `getBoundingClientRect()`. The
current engine already obeys this, which is why hidden panels render correctly on
first open. It has to stay a rule for anything new.

## What a tracker `.qmd` looks like

Three files per tab, each small enough for one person to own:

| File | Owns |
|---|---|
| `analysis/src/exhibits/tracker_jolts.R` | the numbers -> `interim/cards/tracker_jolts.json` |
| `monthly/jolts.qmd` | the prose, and an empty `<svg>` where each chart goes |
| `assets/tracker-charts.js` | `renderJoltsRates()`, keyed to that svg id |

````markdown
---
title: "JOLTS"
format:
  html:
    theme: none                     # do not let Bootstrap fight the ESP styles
    css: ../src/styles/tracker.css
    include-after-body:
      - text: |
          <script src="../data/tracker-jolts-data.js"></script>
          <script src="../assets/tracker-charts.js"></script>
---

```{r setup, include=FALSE}
source(here::here("analysis/R/paths.R"))
source(here::here("analysis/R/serialize.R"))
j   <- read_card("tracker_jolts")     # never fetches; reads what the exhibit wrote
pct <- function(x) sprintf("%.1f%%", x)
pp  <- function(x) sprintf("%+.1f pp", x)
```

## Quits and layoffs

The quits rate was **`r pct(j$quits$latest)`** in `r j$quits$month`,
`r pp(j$quits$chg12)` over the year, and still below its 2019 average of
`r pct(j$quits$avg2019)`. Layoffs remain the quieter series: `r pct(j$layoffs$latest)`,
essentially flat for `r j$layoffs$flat_months` months.

```{=html}
<div class="jd-chart-wrap">
  <div class="jd-chart-title">Quits and layoffs rate, private sector</div>
  <div class="jd-chart-sub">JOLTS, seasonally adjusted, monthly</div>
  <svg class="jd-svg" id="tkJoltsRates" viewBox="0 0 700 360" role="img"
       aria-label="Quits and layoffs rates since 2015"></svg>
  <div class="jd-legend" id="tkJoltsRatesLegend"></div>
  <div class="jd-chart-note" id="tkJoltsRatesNote"></div>
</div>
```
````

Reading that top to bottom: the R chunk reads the card the exhibit script already
wrote, inline R puts live numbers in the sentences, and the `{=html}` block is
the same chart-wrapper markup `index.html` uses today - a titled container around
an empty `<svg>` with a known id. `tracker-charts.js` finds `#tkJoltsRates`, reads
`window.TRACKER_JOLTS`, and draws the interactive chart with the shared tooltip.

`include-after-body` is what makes this pleasant to write: `quarto preview` on
that one file shows real, hoverable, correctly-styled charts, because the preview
loads the same payload and the same engine that production does.

When one tab needs many near-identical charts (one per industry, say), an R chunk
with `results='asis'` can `cat()` the wrappers in a loop rather than repeating
the HTML by hand.

### Numbers in prose: inline R, guarded by the build

Inline `` `r pct(...)` `` bakes the value in at render time, which keeps the
`.qmd` readable and previewable. The drift risk is narrow and specific: someone
reruns a contract and does not re-render the `.qmd`. Handle it the way
`sync_jobs_displacement.py --check` already handles the same risk - a `make check`
that re-renders and fails on any diff - rather than by pushing every number into
a client-side `data-num` binding, which cannot drift but makes the source unreadable
and the preview blank.

Ordering the build enforces the rest: exhibit -> payload -> render `.qmd` ->
splice fragment into `index.html`.
