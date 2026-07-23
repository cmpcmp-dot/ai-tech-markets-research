# Rename "Killer Facts" to "Fact Bank"

**Status:** accepted

"Killer Facts" was the working name for the citable, number-bearing facts extracted from tracker sources, and for the tab/skill/data file built around them. The name read wrong for the audience (progressive organizers and communications staff) and for the register of the surrounding site. Renamed throughout to "Fact Bank."

## Scope of the rename

- **Skill:** `skills/killer-ai-facts/` → `skills/fact-bank/` (and its `.claude/` mirror), frontmatter `name`, and the "killer fact" concept-noun throughout the rubric replaced with plain "fact." Cross-references from `research-intake` updated to match.
- **Data:** `data/killer-facts-data.js` → `data/fact-bank-data.js`; JS global `KILLER_FACTS` → `FACT_BANK`.
- **UI:** in `index.html`, `#killerFactsArea`/`.killer-view` → `#factBankArea`/`.fact-bank-view`, the internal view id `'killer'` and URL route `killer-facts` were unified into a single `'fact-bank'` (previously the view id and the hash string didn't match; they now do), `killerFactsEnabled`/`initKillerFacts` → `factBankEnabled`/`initFactBank`, the visible tab label "Killer Facts" → "Fact Bank," and the `killer-facts:` console log prefix → `fact-bank:`.
- **Docs:** `next_steps.md`, `PENDING_SOURCES.md`, `CONTEXT.md` (including a new glossary entry), `docs/adr/0002`, and the static nav mockups in the three `jobs_displacement_*.html` prototypes.

## Deliberately left alone

- **`kf-<paperId>-<n>` record ids** (373 of them in the data file) and their derived DOM ids (`kfSearch`, `kf-card-*`, `kf-all-*`, etc.) keep the `kf-` prefix. Treated as an opaque internal id rather than a rebrand target: renaming would touch hundreds of lines in a large data file for no user-visible benefit, and would break any `#kf-N-M` deep link already shared externally (e.g. in a Substack post).
- **No redirect** from the old `#killer-facts` URL fragment to `#fact-bank`. This is an internal research tool with no known external links to that fragment; a clean break was simpler than maintaining an alias.
- **`data/tracker-data.js`'s "AI May Not Be a Job Killer, After All"** (paper #184, a real Wharton article title, and its URL) is unrelated to this rename and was not touched.

## Pre-existing gaps noticed, not fixed here

- `research-intake`'s "Step 3 — Validate" previously claimed a `killer-facts: validated N facts.` console log with per-record checks (unresolved `paperId`, duplicate id, bad rating). That validator does not actually exist in `index.html`'s merged Fact Bank module (it lived only in the now-retired standalone `killer_facts.html`, which had it). The doc's wording was corrected to describe current behavior rather than silently renaming a feature that no longer runs. Reintroducing that validation is a separate piece of work.
- `research-intake/SKILL.md` cites `docs/adr/0003-facts-at-intake.md`, which does not exist in the repo. This ADR intentionally still uses number 0003 for the rename since that slot was otherwise unused; the missing facts-at-intake ADR is a separate gap for the maintainer to fill in.
- `skills/research-intake/SKILL.md` (the "committed copy" per its own mirroring convention) did not exist before this change; only the `.claude/` copy did. Both now exist and match.

## Consequence

The standalone `killer_facts.html` page (876 lines, fully superseded by the tab merged into `index.html`) was deleted rather than renamed.
