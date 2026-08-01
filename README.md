# AI Tracker: Research, Impact, and Policy

A curated research database and synthesis on AI, automation, and the economy,
published as a single self-contained page (`index.html`) that is embedded as an
iframe on the Economic Security Project site.

Six views: **Papers**, **Fact Bank**, **Data Tracker**, **Job Displacement**,
**Lab**, **Solutions**.

## Setup (once per machine)

```sh
git config core.hooksPath .githooks   # build freshness + 2 MB size guard
npm install jsdom                     # only if you want to run the tests
```

## Build

`index.html` and `jobs_displacement.html` are **generated**. Edit `src/`.

```sh
python3 build.py            # src/ -> both pages
python3 build.py --check    # verify without writing
```

Which file owns what, and how the `@@include@@` format works:
**[`CONTRIBUTING.md`](CONTRIBUTING.md)**.

## Numbers

Every published figure comes from a contract under
**[`analysis/`](analysis/README.md)**. One file per card, one command per
contract, and `data/*.js` is the boundary between them and the site.

```sh
Rscript analysis/run.R --list            # what exists, and what feeds it
Rscript analysis/run.R btos              # rebuild one contract, offline
Rscript analysis/run.R --refresh btos    # include the network fetch
```

**Never hand-edit `data/*.js`.** Each carries an `AUTO-GENERATED` header and
names the command that regenerates it. Rebuilding needs inputs that are not
committed; **[`analysis/INPUTS.md`](analysis/INPUTS.md)** lists every one, its
size, which script needs it, and how to re-fetch it. A fresh clone still renders
correctly, because the site reads only the committed `data/*.js`.

## Tests

```sh
node tests/interactions.js   # clicking and keyboard, ~40s
node tests/routes.js         # snapshot of every route, ~2.5 min
```

## Layout

```
src/            build inputs: head, styles/, views/, js/, two templates
assets/         chart engines and images, loaded directly by the page
data/           published payloads. Generated. The contract.
analysis/       the R pipeline that produces them
monthly/        Quarto scratch space for the monthly data write-ups
tests/          jsdom harness and route snapshot
docs/           GLOSSARY.md, ARCHITECTURE_OPTIONS.md, adr/, history/
notes/          working notes and backlogs, not part of the build
```

Where this is going next, including what is deliberately unfinished:
**[`next_phases.md`](next_phases.md)**.
