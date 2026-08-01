# Glossary

The words this project uses for its own parts, and the ones to avoid.
Orientation and build instructions are in the root [`README.md`](../README.md).

**Nav Group**:
One of three labelled clusters in the site header, each holding two tabs and carrying its own accent colour via `data-group` and `--group-accent` (`src/styles/shell.css`). They are **Research** (Papers, Fact Bank; Soft Green), **Economy** (Data Tracker, Job Displacement; Warm Gold), and **Policy** (Lab, Solutions; Warm Pink). The three match the site title and the three framing questions on the About page, in that order. A nav group is a label only: it has no view key, no route, and no state.
_Avoid_: tab category, section (when you mean the group)

**Economy**:
The middle Nav Group, holding Data Tracker and Job Displacement (`data-group="economy"`). Named for the question it asks, which the About lede states as "how the economy will absorb it." Formerly called "Adoption," which named only the Census BTOS sub-tab and not the other four or Job Displacement; renamed 2026-08-01, see [`adr/0005`](adr/0005-adoption-to-economy-rename.md). Not to be confused with **adoption** the variable, which is live and correct terminology throughout the charts and prose.
_Avoid_: Adoption (as the name of this group), Impact

**Adoption**:
The economic variable, not a part of the site: the share of firms reporting they used AI to produce goods or services, as measured by the Census Business Trends and Outlook Survey. Industries are cut into high, middle and low adoption groups for the payroll and turnover comparisons. Correct and current usage; the term survives in `assets/adoption-charts.js`, `src/styles/adoption.css`, the `.ad-*`/`#ad*` prefix and `analysis/src/exhibits/adoption_*.R`, none of which were renamed. Adoption is not causation, and the pages that use it say so.
_Avoid_: using it for the nav group (that is Economy), or as a synonym for AI's effect on employment

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
One of 4 top-level groupings — Economic Security, Labor & Worker Rights, AI Governance, Mitigating Harms — that the 10 raw categories roll up into via `CATEGORY_MERGE_MAP`, defined in `MERGED_POLICY_CATEGORIES`. These are the four pathways of `becky_brief.md`, in Becky's order, and that key order is the render order: the Policy Map's four rows top→bottom, and the Links graph's vertical bands (Economic Security top → Mitigating Harms bottom). Two departures from the brief are deliberate and documented at the definition: tax and ownership policy sits in AI Governance rather than Economic Security, and surveillance splits by setting (workplace → Labor & Worker Rights, consumer/public + civil rights → Mitigating Harms). Mitigating Harms is thin pending new policy cards; an empty merged category is skipped at render, not drawn blank.
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
