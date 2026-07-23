---
name: research-intake
description: Add a new source to the AI research tracker AND extract its facts in one pass. Use whenever adding, intaking, or ingesting a new paper, report, or article into the tracker (data/tracker-data.js, RESEARCH_DATA) in the ai-tech-markets-research repo. This is the front door for new entries: it chains the tracker add and the fact-bank extraction so every new source arrives with its facts (or an explicit pending record). For a batch fact sweep over sources already in the tracker, use fact-bank directly with next_steps.md.
---

# Research Intake

The single entry point for putting a new source into the tracker. It does two things in order: (1) add the entry to `data/tracker-data.js`, then (2) immediately extract that entry's facts for the Fact Bank. Historically these were decoupled (add now, fact-sweep later in batches); this skill couples them so no source sits in the tracker without its facts, or without an explicit note saying why they are missing. See `docs/adr/0003-facts-at-intake.md`.

This skill orchestrates. It does **not** restate the fact-extraction rubric: step 2 defers entirely to the `fact-bank` skill (`skills/fact-bank/SKILL.md`, mirrored at `.claude/skills/fact-bank/SKILL.md`). Read that skill before doing step 2.

## Step 1 — Add the tracker entry

Edit `data/tracker-data.js` only (never `index.html`). Append one object to `RESEARCH_DATA` matching the existing schema exactly. Core fields, copied from a recent entry as a template:

```js
{ id: <next unused integer>, date: "YYYY-MM-DD", added: "<today>",
  title: "...",
  source: "Author(s) — Publishing institution",
  sourceUrl: "https://...",
  category: "<one CATEGORIES id>", geography: "us" | "intl",
  keyFinding: "One to three sentences, plain and defensible.",
  takeaways: [ "...", "...", "..." ]
}
```

Rules (from `RECOMMENDATIONS.md`, intake conventions):

- **`added` is mandatory** and is today's date (the intake date). It drives "Recent" status, the What's-changed count, and the changelog. `date` is the source's publication date and is separate.
- **`category` must be one of the ids in `CATEGORIES`** (top of `tracker-data.js`). An unknown category ships a silent bug the R7 guard will flag.
- **`geography`** is `us` or `intl`.
- Match the voice and length of existing `keyFinding` / `takeaways`. No em-dashes in prose fields (repo style). Do not editorialize beyond what the source supports.
- Pick the next unused integer `id`. Keep the array's existing ordering convention.
- If the entry belongs to a theme's or a policy's curated basis, that is a separate editorial decision — flag it, do not wire it silently (theme `papers` / policy `paperIds` links change synthesis meaning).

## Step 2 — Extract the entry's facts

Run the `fact-bank` skill on the entry you just added, following it exactly (verbatim quotes from fetched text only, abstract first but verify in the body, both rating rubrics, controlled vocabularies, mandatory `caveat`, `pubDate` copied from the entry's `date`, `model` recorded).

- If the source is **fully readable**: extract 1-3 facts into `data/fact-bank-data.js` (`FACT_BANK`), keyed to this entry's `paperId`. If it is a genuine wellspring, cap at 3 and set `foundational`.
- If the source is **not fully readable** (paywall, bot-blocked, dead link, PDF fetch failed): do **not** extract from an abstract. Append the entry to `PENDING_SOURCES.md` (paper id, title, clickable link, access problem), and stop there for this entry. A maintainer supplies a local copy later.
- If the source is pure theory or commentary with **no concrete number-bearing findings**: record zero facts and say so. Do not manufacture one.

## Step 3 — Validate

Open `index.html`, and check the browser console:

- The tracker's R7 guard reports **zero problems** (no unknown category, no broken theme/policy links, no unresolved citation tokens, valid `date`/`added`).
- Watch for any `fact-bank:` console warnings (e.g. `FACT_BANK not loaded`); there is currently no per-record validator (unresolved paperId, duplicate id, bad rating) wired into the Fact Bank tab, so check new records by eye against the schema in `skills/fact-bank/SKILL.md`.

Then confirm by eye: the new entry appears in the **Research** tab (and shows as Recent), and its facts appear in the **Fact Bank** tab under the source. If the source went to `PENDING_SOURCES.md`, confirm the row is there instead.

## One entry vs. many

This skill is for **one source at a time** at intake. For working the existing backlog of tracker entries that predate this workflow, use `fact-bank` with the batch queue in `next_steps.md` (one batch of 10 per run, maintainer review between batches).

## Repo conventions

- No build step; data files load as classic `<script src>`. Edits to `tracker-data.js` and `fact-bank-data.js` are plain, diffable, reviewable through the existing PR flow.
- This file is mirrored at `.claude/skills/research-intake/SKILL.md` (the loaded copy; `.claude/` is gitignored) and `skills/research-intake/SKILL.md` (the committed copy). When editing either, sync the other in the same commit.
