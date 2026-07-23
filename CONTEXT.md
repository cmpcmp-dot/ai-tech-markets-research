# AI, Tech and the Economy: Research Intelligence

A curated research database and synthesis on AI, automation, and the economy, presented as a single static site (`index.html`) with four main views — Research, Fact Bank, Themes, and Policy Map.

## Language

**Fact Bank**:
The tab/view (`#fact-bank`) listing short, citable, number-bearing facts extracted from tracker sources, one to three per source. Stored in `FACT_BANK` (`data/fact-bank-data.js`), rendered in `#factBankArea`, each record tied to one tracker entry via `paperId`. Extraction is governed by the `fact-bank` skill (`skills/fact-bank/SKILL.md`). Formerly called "Killer Facts."
_Avoid_: Killer Facts, Killer Facts page/tab

**Policy** (or **Policy Intervention**):
One entry in `POLICY_DATA` — a specific proposed government or institutional response to AI's economic effects (e.g. Unemployment Insurance Reform, AI Dividend). Has a `category` (one of 10 granular areas) and a `level` (disruption stage it addresses).
_Avoid_: Policy area, category (when you mean the policy itself, not its grouping)

**Category**:
One of 10 granular policy groupings on a policy (`safety-net`, `labor-rights`, `tax-wealth`, `healthcare`, `work-structure`, `education`, `antitrust`, `housing`, `jobs`, `international`), defined in `POLICY_CATEGORIES`. Used for column coloring (`POL_CAT_COLORS`) and description text (`POL_CAT_DESCS`) in the Map view.
_Avoid_: Policy area, merged category

**Merged Category** (or **Policy Area**):
One of 4 top-level groupings (Economic Security, Labor & Worker Rights, Social Infrastructure, Global) that the 10 raw categories roll up into via `CATEGORY_MERGE_MAP`, defined in `MERGED_POLICY_CATEGORIES`. This is the grouping the Policy Map's four columns are built from, and the vertical band ordering (Economic Security top → Global bottom) used by the Links graph.
_Avoid_: Category, policy group

**Policy Link**:
A `pairsWith` entry on a policy — `{id, why}` — meaning the referenced policy reinforces or amplifies this one. Currently authored topically/administratively (not yet aligned to ESP's theory of the case from `becky_brief.md`). Rendered today both as a text cross-link (`.pol-xref`) inside the policy detail modal, and as an edge in the Links graph.
_Avoid_: Connection, relationship, edge (edge is fine in code/rendering context, but "Policy Link" is the domain term)

**Rival Policy**:
A `competesWith` entry on a policy — a substitute or alternative approach, not a reinforcing one (e.g. UBI vs. Guaranteed Income). Currently stored in the data but not visualized anywhere.
_Avoid_: Competing policy, opposite policy

**Map view**:
The existing four-column Policy Map layout, one column per Merged Category, policies listed alphabetically within each.
_Avoid_: Grid view, columns view

**Links view**:
The new (spike/test-run) second tab within the Policy Map, showing policies as nodes in a hand-rolled SVG force simulation, connected by edges derived from each policy's Policy Links, with nodes gravitating toward their Merged Category's vertical band.
_Avoid_: Graph view, network view (Links is the user-facing tab label)
