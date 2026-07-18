---
name: killer-facts
description: Extract 1-3 "killer facts" from a research tracker entry (or a batch of entries) into data/killer-facts-data.js. A killer fact is a short, citable, number-bearing factual statement progressive organizers can drop into press releases and fact sheets. Use when asked to extract killer facts, process new tracker entries for facts, or refresh the killer facts page.
---

# Killer Facts for Progressives

## Purpose

This skill turns entries in the research tracker (`data/tracker-data.js`, `RESEARCH_DATA`) into **killer facts**: one- to two-sentence factual statements, each with a number or concrete factoid, quoted verbatim from the source, rated for political usefulness and truthfulness, and stored in `data/killer-facts-data.js` for the Killer Facts page (`killer_facts.html`).

The audience is **not just experts**. Progressive organizers, communications staff, and everyday people familiar with the issues should be able to lift a fact, with its citation and its "how to say it” caveat to protect the person from overstating the fact, straight into a press release, fact sheet, testimony, or social post, and have it survive a hostile fact-check.

## What counts as a killer fact

A killer fact is:

- **Short.** One to two sentences.
- **Concrete.** It contains a number, magnitude, or specific factoid (a percentage, a dollar figure, a count, a ratio, a documented event). "AI may reshape work" is not a killer fact. "Correcting the bias would raise the share of Black patients flagged for high-risk care from 17.7% to 46.5%" is.
- **Verbatim.** The `fact` field is an exact quote from the source document. Never paraphrase into the `fact` field, and never reconstruct a quote from memory. If the sentence in the paper is too long or entangled to quote cleanly, quote the cleanest fragment that contains the number and put the plain-language version in `factPlain`.
- **Citable.** It ties to exactly one tracker entry (`paperId`) so a reader can hunt down the methodology.
- **Usable.** Another researcher or organizer could deploy it without reading the paper.

Extract **one to three** killer facts per paper. If a paper genuinely has none (pure theory, pure commentary with no concrete findings), record zero and say so; do not manufacture one.

## Where to look: abstracts first, but read the paper

**The best killer facts are almost always in the abstract, executive summary, or key-findings section.** Authors put their strongest, most defensible numbers there. Start there, and treat those passages as your primary hunting ground.

But **you must still read the body of the paper** before finalizing a fact, for four reasons:

1. **Scope.** The abstract's headline number often has a quieter definition in the methods section (exposure vs. displacement, tasks vs. jobs, projection vs. measurement, subgroup vs. population). The `caveat` and `factPlain` fields depend on knowing the real scope.
2. **Context.** The `context` field is the verbatim paragraph around the fact, and the richest version of a finding sometimes sits in the results section with detail the abstract compresses away.
3. **Methodology.** The `truth` rating and `methodNote` cannot be assessed from an abstract. Skim methods, sample, and limitations before rating.
4. **Caveat.** The `caveat` field is there to provide context and limitations of the killer fact, and to understand this it needs to be assessed from the full research picture.

So the workflow is: mine the abstract/summary for candidates, then verify each candidate against the body before recording it.

## The progressive lens

"Politically noteworthy" is judged for **progressive politics**, meaning research relevant to:

- Wealth and income inequality
- Non-democratic tech institutions (concentrated corporate power, unaccountable platforms, opaque algorithms)
- The environment: resource depletion, carbon, energy and water usage
- Worker displacement, and workers lacking power or voice

It equally includes the **affirmative side**: findings that AI can help workers, evidence that specific interventions work (wage insurance, bargaining, audits, procurement standards), and solutions to big problems. A fact showing "this policy works" scores as high as a fact showing "this harm is real." Organizers need both.

## Extraction procedure

For each tracker entry:

1. **Fetch the source** at `sourceUrl`. Try WebFetch first; if blocked, try `curl -L` with a browser user agent. For PDFs, download to the scratchpad and read them there.
2. **Check access level.**
   - `full` — you can read the complete paper/report (an HTML report page counts if it is the whole document).
   - `abstract-only` — only the abstract or landing page is reachable.
   - `blocked`/`dead` — nothing substantive is reachable.
3. **If access is not `full`: do not extract.** Add the entry to the pending list (see "Pending sources" below) with its clickable link. Facts extracted from an abstract alone cannot be scope-checked, and facts from memory are forbidden. The maintainer will download the paper for a local read.
4. **Mine the abstract / executive summary / key findings** for 1-3 candidate facts.
5. **Verify each candidate in the body**: confirm the number, its universe, its time period, whether it is measured or projected, and copy the exact surrounding paragraph.
6. **Write the record** using the schema below, including both ratings with one-line justifications.
7. **Dedupe.** If the same statistic already exists in `killer-facts-data.js` from another paper, keep it only on the primary source (the paper that produced the number, not one that cites it).

## Rating rubrics

### Politically noteworthy (`political`, 1-5)

- **5** — Headline-ready. A number that directly evidences a core progressive concern or a proven worker-empowering solution; could anchor a press release lede with no framing beyond the caveat.
- **4** — Strong. Needs one sentence of setup, then lands hard.
- **3** — Solid supporting evidence. Strengthens an argument; not a lede.
- **2** — Useful to researchers and policy staff, not to organizers.
- **1** — Background or technical context only.

### Truthful (`truth`, 1-5)

- **5** — Causal or direct measurement on strong data (RCT, natural experiment, administrative records, audit study), peer-reviewed or equivalent rigor, and consistent with the wider literature.
- **4** — Rigorous single study not yet replicated, or high-quality official statistics.
- **3** — Transparent projection, model, or survey with stated assumptions. Defensible **if labeled as what it is**.
- **2** — Advocacy or industry figure with opaque methodology. Use only with explicit attribution ("Goldman Sachs estimates...") and caution.
- **1** — Does not withstand scrutiny. Present in the dataset only as a warning; the page flags it.

`truth` and `political` are independent. A 5-noteworthy, 2-truthful fact is exactly the record an organizer most needs to see flagged; never inflate `truth` because a number is politically convenient, and never deflate `political` because the methodology is weak.

### Good research (`goodResearch`, boolean + `methodNote`)

Your verdict on the study itself: is the methodology sound and the conclusion reasonable given the evidence? `methodNote` states, in one or two sentences, what the method actually is (sample, design, data) so a reader can judge without opening the paper. Rate the research honestly even when its conclusion is politically useful.

## Controlled vocabularies

**`keywords`** (1-4 per fact, from this list only; propose additions to the maintainer rather than inventing silently):
`inequality`, `corporate-power`, `tech-democracy`, `environment-energy`, `displacement`, `worker-power`, `wages`, `surveillance`, `discrimination`, `gender`, `race`, `gig-work`, `healthcare`, `housing`, `education`, `safety-net`, `global-south`, `solutions`

Tag `solutions` on any fact showing an intervention works, alongside its topic keywords.

**`evidenceType`** (exactly one):
`rct`, `natural-experiment`, `administrative-data`, `audit-study`, `survey`, `model-projection`, `meta-analysis`, `descriptive-statistics`, `investigative`, `legal-policy-analysis`

The single most protective field for non-expert users is the distinction between measurement and `model-projection`. "300 million jobs exposed" (projection about task exposure) and "productivity rose 14% among 5,179 agents" (randomized deployment) are different species of fact. Never let a projection read as a measurement.

## Schema

Records live in `data/killer-facts-data.js` in a `const KILLER_FACTS = [...]` array, loaded as a classic script (no build step, works on `file://`), same conventions as `tracker-data.js`.

```js
{
  id: "kf-94-1",              // kf-<paperId>-<n>
  paperId: 94,                 // must exist in RESEARCH_DATA
  pubDate: "2020-10-01",       // source publication date, copied from the tracker entry's `date`
  fact: "...",                 // VERBATIM quote, 1-2 sentences, contains the number
  factPlain: "...",            // plain-English restatement, fact-sheet ready
  context: "...",              // VERBATIM surrounding paragraph from the source
  provenance: "...",           // where in the paper + data basis, e.g. "Results, p. 449; commercial risk scores for 49,618 patients"
  keywords: ["discrimination", "healthcare"],
  evidenceType: "audit-study",
  political: 5,
  politicalWhy: "...",         // one line
  goodResearch: true,
  methodNote: "...",           // what the method actually is
  truth: 5,
  truthWhy: "...",             // one line
  caveat: "...",               // the "how to say it" line: defensible phrasing, scope warnings
  suggestedUse: "...",         // e.g. "press release or testimony on algorithmic bias in healthcare"
  sourceAccess: "full",        // full | abstract-only | blocked | dead
  model: "Fable 5",            // the AI model that extracted and rated this fact
  added: "YYYY-MM-DD"          // date extracted
}
```

Field notes:

- **`pubDate`** is mandatory. It is the source's publication date, copied verbatim from the matching tracker entry's `date` field (do not invent or re-derive it). It powers the "Published" label and the newest-first sort on the Killer Facts page, and it keeps each fact's recency legible without a lookup back into the tracker.
- **`model`** is mandatory. Record the model that performed the extraction and ratings (e.g. "Fable 5", "Sonnet 5", "Haiku 4.5") — in a fan-out run, the model the subagents ran on. This lets maintainers compare extraction and rating quality across models and re-rate selectively if one model's ratings drift.
- **`caveat`** is mandatory and essential. This is the note to the reader about the limitations and potential vulnerabilities of the fact. An essential part of any research advisor is knowing the limitations of what one knows and protecting the person using this knowledge from being embarrassed in the future. Provide that here. This is the one line that keeps anyone from overclaiming: say "exposed to automation," not "will lose their jobs"; say "a projection by Goldman Sachs," not "research shows"; note when a finding is short-run, one country, or one sector. If a fact genuinely needs no caveat, write "None needed" deliberately, not by omission.
- **`factPlain`** should read aloud well at a rally or in a one-pager: short sentences, no jargon, no em-dashes, keep the number.
- **`suggestedUse`** is one concrete deployment, not a list.

## Pending sources

When a source is not fully readable, append it to `PENDING_SOURCES.md` in the repo root as a markdown table row: paper id, title, clickable link, and the access problem (paywall, bot-blocked, dead link, PDF fetch failed). The maintainer downloads these for a local read; when a local copy is provided, extract from it normally and remove the row.

## Style rules (repo conventions)

- No em-dash connector clauses in any prose field; use commas or periods. (Verbatim `fact`/`context` quotes keep the source's own punctuation.)
- Sentence case for labels. Keep written sentences to roughly 42 words or fewer.
- Every record needs `added:` with the extraction date.
- Every record needs `pubDate:` copied from the source's tracker `date`.
- After editing `killer-facts-data.js`, open `killer_facts.html` in a browser and check the console: the page validates that every `paperId` resolves, ids are unique, and vocabularies are respected.

## Batch runs

For multi-entry runs, fan out subagents with each agent handling 3-6 entries. Give each agent this skill file to read, plus its entries' `id`, `title`, `source`, `sourceUrl`, and the tracker `keyFinding` (orientation only, never a quote source). Tell each agent which model it is running on so it can fill the `model` field correctly. Agents write JSON to scratchpad files; the coordinating session aggregates, dedupes across agents, normalizes rating drift by re-reading a sample from each agent, and merges into `data/killer-facts-data.js` sorted by `paperId`. The remaining-work queue and batch assignments live in `next_steps.md` at the repo root; process one batch of 10 per run, then stop for maintainer review.

## Canonical copy

This file is mirrored at `skills/killer-facts/SKILL.md` in the repo root so others can download it (`.claude/` is gitignored except for this skill). When editing either copy, sync the other in the same commit.
