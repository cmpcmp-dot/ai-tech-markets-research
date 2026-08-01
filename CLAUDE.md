# Working in this repo

Repo-specific rules. The global `CLAUDE.md` covers R, econometrics and writing
and still applies; this file covers what is different here, because this repo is
mostly a JavaScript and HTML publishing system wrapped around an R pipeline.

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first: it says which file owns what.

## The two boundaries that matter

**1. `data/*.js` is a contract, not a file you edit.** Every payload is generated
by a contract in `analysis/` and carries an `AUTO-GENERATED` header. To change a
number, rerun its contract:

```sh
Rscript analysis/run.R --list        # what exists and what feeds it
Rscript analysis/run.R btos          # rebuild one, offline
Rscript analysis/run.R --refresh btos   # include the network fetch
```

Never hand-edit a payload, and never write one from Python or by hand to save
time. The whole point of `analysis/` is that every published number has one
reproducible path behind it.

**2. `index.html` and `jobs_displacement.html` are generated.** Edit `src/`, then
`python3 build.py`. The pre-commit hook rejects a stale page. If you find
yourself editing a built file, stop and find the `src/` file that owns it.

## Rules with teeth

- **ASCII only in published payloads.** `analysis/R/serialize.R` refuses to write
  non-ASCII and will fail the build rather than ship mojibake. Use HTML entities
  (`&mdash;`, `&times;`, `&ndash;`) in strings destined for the page.
- **No em-dashes in prose.** Enforced in code for payloads, a style rule
  everywhere else.
- **A `.qmd` may read, never fetch.** Quarto documents may read
  `analysis/interim/**` and `data/*.js`. They must never hit BLS, BEA, FRED or
  Census at render time, or reproducibility and offline rebuilds both go.
- **Never invent a number.** If a payload is missing, the page says so and names
  the command that fixes it. The Productivity sub-tab of the Data Tracker is
  deliberately empty for exactly this reason: do not populate it with
  illustrative figures. See `next_phases.md`.
- **Fixed `viewBox` on every chart, never `clientWidth`.** Tab panels sit in the
  DOM `hidden` until selected, and a hidden element measures zero.
- **No CDN, no modules, no bundler.** Classic `<script>` tags, `file://` has to
  keep working, and the deploy artifact is one self-contained document because
  it is embedded in an iframe.

## Before saying something works

There is no R in most sandboxes and the API keys are local, so a contract
usually cannot be run. Say so rather than implying a rebuild happened.

What can be checked, and should be, for anything touching `src/js/` or view
markup:

```sh
python3 build.py --check
node tests/interactions.js
node tests/routes.js
```

`node --check` on a file only proves it parses. It does not prove an identifier
resolves: an export list naming a function that does not exist parses fine and
throws at load. Verify names resolve, and prefer running the page in
`tests/dom.js` over reasoning about whether it would work.

## Conventions worth matching

- One contract per published payload; `analysis/run.R` is the index of them.
- Tab groups go through `makeTabGroup` in `src/js/45-tabgroup.js`. Do not add a
  fourth bespoke tab implementation.
- Routes are declared in `VIEWS` in `src/js/40-router.js`. A flat view is a row
  there and nothing else.
- Chart primitives live in `assets/adoption-charts.js` and are exported on
  `window.ADOPTION_CHARTS`. `assets/tracker-charts.js` draws with them rather
  than carrying a second engine. Anything on that export list is a public
  contract.
- Comments explain *why*, especially where a choice is load-bearing or where the
  obvious alternative is wrong. Several comments in this repo record a bug that
  the obvious arrangement caused; leave them there.
