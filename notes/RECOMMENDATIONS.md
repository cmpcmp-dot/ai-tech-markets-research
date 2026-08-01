# Research Tracker — Refinement Recommendations

**Product:** AI, Tech and the Economy: Research Intelligence (`index.html`)
**Assessment date:** 2026-06-14
**Scope:** Full-site review for a more impactful product — content, information architecture, distribution, trust, accessibility, and technical maintainability.
**Status:** #1, #4, #5, #6, #7, #8, #10, #11, #12, and #15 implemented on the `fable-pilot` branch (2026-06-14); #16 and #13 implemented (2026-06-22). A substantial round of content work followed on 2026-06-26 (Policy Lab primer expansion, What's New banner fix, new research entries, acronym pass, policy-wide citation sweep, deep fact-check) — see the **Update log** below. #17 (screen-reader accessibility) implemented 2026-07-06. #3 remains wired (pending your analytics account code). A **product assessment (2026-07-06)** reframed the tracker as a working tool for a team that develops policy primers and responds to the AI/tech landscape, producing recommendations **R1–R9** — R2, R5, and R8 absorb the remaining open items #2, #9, and #14. See the **Product assessment** section below.

---

## Project state & how to resume (for a fresh session)

- **Working files:** `index.html` (app shell: styles, markup, app script; ~170KB) + **`data/tracker-data.js`** (the data layer, extracted 2026-07-07; ~690KB): `RESEARCH_DATA` (251 entries as of 2026-07-07, each with `added:` intake date), `THEMES` (9, each with `lastReviewed`), `POLICY_DATA` (27, each with primer fields, `lastReviewed`, and curated `paperIds`), plus the category/status/institution tables and `calcStatus`. Loaded as a classic `<script src>`, so there is still no build step and file:// still works. **Content edits go to the data file; UI edits go to index.html.** (`research_tracker.html` remains a redirect stub.)
- **Repo / deploy:** `github.com/cmpcmp-dot/ai-tech-markets-research`; working branch `policy_primer_pilot`, merged to `main` via pull requests (working tree verified identical to `main` on 2026-07-06, so the live site is current); GitHub Pages at `cmpcmp-dot.github.io/ai-tech-markets-research/`.
- **Local preview:** served from `/tmp/tracker_preview/` via `/tmp/serve_tracker.py` (regenerable; the macOS sandbox blocks serving directly from `~/Documents`). Copy **both** `index.html` and `data/tracker-data.js` (keeping the `data/` subfolder) into that mirror and start the `research-tracker` launch config. **Cache caveat (post-R8):** since the data now loads as an external `<script src>`, a `?t=` cache-buster on the page URL does **not** refresh it — after editing `tracker-data.js`, force-revalidate the data file (in the preview, `fetch('data/tracker-data.js',{cache:'reload'})` then `location.reload()`), or the page will render stale data.
- **To resume:** read this file, then pick from the **R-series** in the Product assessment section (suggested sequence: R1+R2, then R4+R5, with R3's fact-check burn-down in parallel). The remaining #-items (#2, #9, #14) are absorbed into R2, R5, and R8.

### Design & content conventions (keep consistent)
- **Color:** signature blue = `var(--accent)` (#2563EB light / #6fa1f5 dark). All interactive elements and markers (gap arrows →, takeaway triangles ▸, working checks ✓), the leverage callout, reference toggles, and key-finding stats/links use it.
- **Type:** Publico Banner (serif) for headings/section labels; Public Sans for body. Sentence case for labels (never ALL CAPS or Title Case).
- **Prose style:** no em-dash connector clauses (use commas/periods); paired parenthetical em-dashes are fine; the " — " inside a `source` field is the author/organization separator (keep it). Keep sentences to roughly 42 words or fewer.
- **Citations:** inline tokens `{{cite:ID}}` (renders "(Year)") and `{{citep:ID}}` (renders "(Author, Year)"), resolved by `injectCitations()` against `RESEARCH_DATA`; APA via `formatAPACitation()`. References use a cited-then-"related" toggle with APA hanging indent.
- **Dark mode:** automatic via `prefers-color-scheme`; all colors flow through CSS variables, with a lightened per-theme palette in the dark block.
- **Default landing tab:** Themes.
- **Editing workflow:** make content edits via Python scripts that assert each anchor is unique, preserve every `{{cite}}` token and numeric figure, and check for em-dashes / raw double quotes / over-length sentences before writing. Verify in the preview — computed styles are authoritative; the panel's screenshots are intermittently blank.
- **New research entries (intake):** add entries to **`data/tracker-data.js`** (not index.html). Every entry carries `added: "YYYY-MM-DD"` (the date it entered the tracker) alongside `date` (publication). "Recent" status, the header's What's-changed count pill, and the changelog all key off `added` — omit it and the entry degrades to publication-based recency. A console-only validation guard (R7) flags unknown categories, broken theme/policy paper links, and unresolvable citation tokens at load — check the browser console after data edits.

---

## What's already strong

The three content tabs (Research, Themes, Policy Lab) share one cohesive system: concise syntheses, inline APA citations, the cited/related references pattern, confidence + "points of leverage" framing, the key-findings band, and a consistent signature-blue accent. The confidence / recency / lens model is genuinely sophisticated, and the underlying content is the product's real asset. The opportunities below are mostly about **getting the content in front of people, earning trust quickly, and letting them act on it** — not about the content itself.

---

## Summary (tracking table)

| # | Recommendation | Tier | Effort | Impact | Status |
|---|----------------|------|--------|--------|--------|
| 1 | Social / SEO metadata (OG, Twitter, description, structured data) | 1 Distribution | S | High | Done |
| 2 | Shareable & citable findings (deep links + copy/cite) | 1 Distribution | M | High | Done via R2 (2026-07-06) |
| 3 | Privacy-friendly analytics | 1 Distribution | S | Med–High | Wired — add account code |
| 4 | Clean URL / custom domain | 1 Distribution | S | Med | Clean URL done; domain pending |
| 15 | Key-finding cards open a source-excerpt modal (not jump to Themes) | 1–2 | M | High | Done |
| 16 | Inline citations throughout all theme & policy cards (not just the synthesis) | 1–2 | M–L | Med–High | Done |
| 5 | Reconsider landing / first-visit orientation | 2 Trust | M | Med–High | Done |
| 6 | Methodology / expand the About tab | 2 Trust | M | High | Done |
| 7 | Reframe the AI disclaimer alongside methodology | 2 Trust | S | Med | Done |
| 8 | Clarify the General / Focused lens value | 2 Trust | S | Med | Done |
| 9 | Subscribe / follow + changelog | 3 Engagement | M | Med | Changelog done via R5 (2026-07-06); subscribe/RSS still open |
| 10 | Dark mode | 4 Accessibility | M | Low–Med | Done |
| 11 | WCAG AA contrast + keyboard/focus audit | 4 Accessibility | M | Med | Done |
| 17 | Screen-reader accessibility (headings, ARIA, citation labels, skip link) | 4 Accessibility | M | Med | Done |
| 12 | Policy Lab mobile layout | 5 Polish | M | Med | Done |
| 13 | Remove dead CSS | 5 Polish | S | Low | Done |
| 14 | Extract data to JSON | 5 Polish | L | Low–Med | Absorbed into R8 |

**Current priorities (2026-07-07): the full R-series (R1–R9) is implemented.** Remaining open threads: #3 analytics (needs your account code), #4 custom domain, #9's subscribe/RSS half, the Focused-lens keep-or-simplify decision (R9), and the ~14 user-added entries from early July that have not had a fact-check pass. *(The original top-3 line — #1, #2, #6 — is superseded.)*

---

## Product assessment — 2026-07-06: the tracker as a policy-primer engine

*(Full-site review under a new goal: make the tracker a working tool for a team that develops policy primers and responds to the AI/tech landscape — not just a publication people read. A team like that needs to **take things out** of the tracker — evidence, citations, primer drafts — and **put things in** — new research, updated positions — on a news cycle's clock. Judged that way, the tracker is content-rich but workflow-poor. R2, R5, and R8 below absorb open items #2, #9, and #14.)*

**Evidence snapshot (audited in the live app and code, 2026-07-06):**
- **Nothing can leave the site.** No export, no print stylesheet, no copy-to-clipboard, no deep links — zero occurrences of any of these in the code. A teammate who wants to use a Policy Lab card in a primer must retype it.
- **"New" means published, not added.** `calcStatus` keys off the publication date; there is no record of when an entry was added to the tracker. An older-but-important paper added today lands as "Older" and never surfaces in the What's New banner.
- **Evidence is thinnest where primers need it most.** Policies inline-cite only 25 distinct papers of 241; each policy's "Research basis" is auto-generated (the 16 most recent same-category entries), not curated. The fact-check backlog (9 unverified claims, 8 missing sources — see the 2026-06-26 log) sits on exactly this surface.
- **No freshness accounting on syntheses.** All 27 policies share one `lastReviewed` stamp (2026-06-23); themes have none. Nothing flags which syntheses new entries affect.
- **Reach and recency.** 230/241 entries are linked to a theme; 11 are orphans (in no theme, cited nowhere — invisible outside the Research tab). Recency split: 38 Recent / 75 Current / 128 Older, so 53% of the database is 18+ months old (fine as a baseline library; worth knowing).
- **Tab-level notes.** Research: the methodology filter (17 peer-reviewed, 19 working papers, 26 official) is genuinely useful for primer sourcing, but there is no way to act on a filtered set. Themes: the strongest synthesis surface; its "Research gaps" sections read as a ready-made team research agenda but are not actionable. Policy Lab: post-primer-expansion, each card is two-thirds of a primer; the last mile (export) is missing. About: explains the site's methodology but nothing about the team workflow (how entries get added, verified, challenged).

### Job A — Produce a primer (highest leverage)

- **R1. Policy export: "Copy as draft" + print-to-PDF.** Two affordances on the policy modal: a button that copies the full card as formatted Markdown (title, phase, summary, rationale, the six primer fields, precedent, APA references), and a print stylesheet so ⌘P yields a clean one-pager. *Rationale: the Policy Lab already holds primer-grade content structured on the ESP model, but it is trapped in a modal. This single feature converts the tracker from reference site to first-draft generator, and it is cheap because the content model is already right.*
- **R2. Deep links + copy-cite** *(absorbs #2)*. Hash routes (`#policy/ubi`, `#theme/displacement`, `#entry/230`), a copy-link button on modals, and a "cite this" action (APA/BibTeX) on research entries. *Rationale: team coordination happens in Slack and docs — "look at this policy" must be a pasteable URL, or the tracker stays a solo tool. Also makes the tracker itself citable inside primers.*
- **R3. Curated evidence per policy + fact-check burn-down.** Give each policy a hand-picked `paperIds` list (falling back to the current category-based list), then work the 9 verify-then-correct claims and add the 8 missing source entries. *Rationale: "recent same-category papers" is fine for browsing, not for evidence. The moment a staffer checks a primer claim, curation is what stands up.*

### Job B — Respond to the landscape

- **R4. Record when entries are added, separately from publication date.** New `added:` field at intake; the What's New banner and "Recent" logic key off it (publication date keeps driving scholarly recency). *Rationale: the banner's "38 new entries" currently means "38 recent publications." For rapid response, "new to us" is the signal that matters, and today it is structurally invisible.*
- **R5. Changelog view** *(lightweight #9)*. A dated feed of entries added and policies re-reviewed, generated from data already present once R4 exists; RSS/email can follow. *Rationale: a returning teammate's first question is "what changed since Tuesday?" The banner answers "how many," not "what."*
- **R6. Theme freshness accounting.** Add `lastReviewed` to themes and surface "N entries added in this theme's categories since review." *Rationale: turns intake into a review queue — new research automatically flags which syntheses may be stale, institutionalizing the respond-to-the-landscape loop.*

### Job C — Operate as a team

- **R7. Data-validation guard.** A startup assertion (console-only) that every entry's category, theme links, and citation ids resolve. *Rationale: the #230/#231 invalid-category bug shipped silently and sat live; entries are now also added by hand. A ~20-line guard catches the whole class at load.*
- **R8. Extract data to JSON + a documented intake path** *(upgrades #14 from polish to operational)*. *Rationale: with all data inline in an ~828KB HTML file, exactly one person can safely update it, via full-file replace. JSON files make edits diffable and reviewable through the existing PR flow — which the merge history shows already works — and open the door to teammates contributing entries.*
- **R9. Hygiene.** Reconnect (or consciously accept) the 11 orphan entries; keep this file's deploy note current; revisit whether the Focused lens's parallel econ fields (6 of 9 themes carry them) still earn their maintenance cost for a team-internal audience.

### Suggested sequence

1. **R1 + R2 together** — same modal surfaces; together they flip the product's identity (any policy becomes a linkable, exportable primer draft).
2. **R4 + R5** — the rapid-response loop — with **R3's** fact-check backlog as parallel content work.
3. **R6–R8** — operational hardening once the team is actively using it.

### R-series tracking

| R# | Recommendation | Job | Effort | Status |
|----|----------------|-----|--------|--------|
| R1 | Policy export (copy-as-Markdown + print stylesheet) | A Primer | M | Done 2026-07-06 |
| R2 | Deep links + copy-cite (absorbs #2) | A Primer | M | Done 2026-07-06 |
| R3 | Curated policy evidence + fact-check burn-down | A Primer | M–L | Done 2026-07-07 |
| R4 | `added` date; What's New keys off it | B Response | S–M | Done 2026-07-06 |
| R5 | Changelog view (lightweight #9) | B Response | M | Done 2026-07-06 |
| R6 | Theme `lastReviewed` + staleness counter | B Response | S–M | Done 2026-07-07 |
| R7 | Data-validation guard | C Ops | S | Done 2026-07-07 |
| R8 | Data extracted to `data/tracker-data.js` + intake path (upgrades #14) | C Ops | L | Done 2026-07-07 |
| R9 | Hygiene: orphans, doc currency, lens cost | C Ops | S | Done 2026-07-07 (lens decision left open) |

---

## Update log — 2026-07-16 (later still)

- **Policy modals: "Policy considerations" and "Political landscape" consolidated into "Where it stands."** Diagnosis first: "Political landscape" was coherent and universal (who's for/against, bills, precedents), but "Policy considerations" (only 15 of 27 policies) was a grab-bag — **9 of the 15 were relationship restatements now fully covered by "How it interacts,"** ~5 were genuine analytical/evidence caveats, and a couple were really landscape. Chose Option A (merge to one section). Implementation: deleted all 15 `considerations` fields; merged the ~5 substantive caveats into `landscape` (deduped against text already there — e.g. the SWF antimonopoly line and automation-levy's Casar op-ed were not duplicated), preserving their citations and the delink-healthcare cross-link; renamed the section **"Where it stands"** in the modal and the Copy-as-draft export. Two follow-through fixes so nothing was lost: **promoted two relationships that lived only in considerations prose** into the structured data (ui-reform ↔ portable-benefits, ai-displacement-reporting ↔ wage-insurance), and **reconciled the worker-ownership ↔ sovereign-wealth-fund conflict to *complement*** (they broaden capital at the firm vs. society level, two layers of one agenda — they don't compete for one bill or fiscal pool). Verified: no `considerations` field remains, "Where it stands" renders with merged content + citations + cross-link, export matches, all relationships bidirectionally consistent, every cite/pol token resolves, console clean. **Judgment calls to flag: (a) the worker-ownership/SWF flip to complement — easy to revert if you prefer competes; (b) `feasibility` remains preserved-but-hidden in the data from the earlier change.**

## Update log — 2026-07-16 (later)

- **Policy modals: "Feasibility" replaced by "How it interacts."** Every policy now carries `pairsWith` and `competesWith` arrays (each entry `{id, why}`), and the modal renders them in the slot the Feasibility section used to occupy — **Pairs with** (green, solid glyph) and **Competes with** (amber, dashed glyph), each item a cross-link to the related policy's modal plus a one-line rationale. Colors echo the (unbuilt) policy-map mockup and switch correctly in dark mode. Relationship set: 16 complementary edges, 11 substitutive edges, bidirectionally consistent, every one of the 27 policies has at least one relationship (23 have pairs, 13 have competes). The "Copy as draft" Markdown export mirrors the change (Pairs with / Competes with sections; no Feasibility). **The `feasibility` data field is preserved on all 27 policies (non-destructive) — it is simply no longer rendered, so it can be restored or repurposed later.** Verified live: section renders in the right order, cross-links navigate, dark mode correct, export matches, no console errors. **(Later refinement: when a policy has both, Pairs / Competes render as two aligned columns mirroring Strengths/Risks via `.pol-rel-cols`, collapsing to one column ≤720px; a lone group spans full width. And the "Precedents, examples & related research" section was renamed "Precedents and examples.")**

## Update log — 2026-07-16

- **3 research entries added and wired across all tabs (ids 266–268, `added: 2026-07-16`; database 260 → 263).** (1) **Tech Policy Press, "Labor Power and the Role of Subcontracting in the AI Economy"** (Sana Ahmad, 2026-07-10) — the outsourcing-maze analysis of AI supply chains; category `workers`, intl; linked into the **Worker Power** theme's References and added to **Sectoral Bargaining**'s curated basis (subcontracting layers are that policy's motivating problem). (2) **"Europe 2031: What Getting AI Wrong Means for Us"** (Juijn, van Baarsen, Dada et al., 2026-06-11) — a book-length foresight *scenario* (explicitly flagged as speculative fiction in the entry, not empirical research); category `macro`, intl; linked into **Macroeconomic Risk**'s References. (3) **NCSL, "Portable Benefits for Independent Contractors: A Framework for State Policymaking"** (Hultin, Petrini & Jacquinot, Feb 2023 — the filename's "Natwick" is not the author) — joins **Portable Benefits**' curated basis (now 6 papers) and is cited inline in its feasibility field backing the state-activity claim; the entry notes the work group was Amazon-supported, keeping the card's industry-vs-labor sourcing balance legible. R7 guard: zero problems; changelog shows "July 16, 2026 — 3 entries."

## Update log — 2026-07-08

- **9 research entries added on the portable-benefits / platform-work debate (ids 257–265, `added: 2026-07-08`; database 251 → 260).** Aspen Institute *Portable Benefits Resource Guide*; Brookings *Exploring Portable Benefits for Gig Workers*; NELP *Why Workers Need Real Portable Benefits* and *App-Based Workers Need Real Rights, Not 'Portable Benefits' Gimmicks*; EPI *Workers Need Real Security and Flexibility…*; TechCrunch on OpenAI's AI-economy proposals; Data & Society *Explainer: Algorithmic Management in the Workplace*; Seattle's *App-Based Worker Deactivation Rights Ordinance*; and the Ninth Circuit ruling upholding it (*Uber Technologies, Inc. v. City of Seattle*, 2026-03-04). Metadata web-verified via a research agent. Curated `paperIds` wired: **Portable Benefits** now leads with the five portable-benefits pieces (a balanced set — Aspen/Brookings design work plus NELP/EPI critiques — filling one of the 10 policies that lacked a curated basis); **Worker Data Rights** gained the Data & Society explainer, the Seattle ordinance, and the Ninth Circuit ruling; **Sovereign Wealth Fund** and **AI Productivity Dividend** and **Shorter Workweek** gained the OpenAI/TechCrunch piece. R7 validation guard reports zero problems; changelog shows a "July 8, 2026 — 9 entries" group.
- **Portable Benefits policy rewritten for balance and citations.** The card previously described only the **individual-account** design (worker-tied accounts funded by pro-rata contributions, the industry-favored model) and carried no inline citations. The "What it is" summary now lays out both designs as distinct paragraphs — the individual-account model and the **universal, social-insurance model** (pooled-risk public programs plus multi-employer plans, coverage independent of any account balance) — with the design choice framed as the central question. Twelve inline citations woven through summary/precedent/feasibility/risks/considerations/landscape, mapping all five curated papers (Aspen 257, Brookings 258, NELP 259/260, EPI 261) to the claims they support, plus the $31/month-vs-11%-of-pay contrast and a `{{pol:delink-healthcare}}` cross-link. Neutral framing preserved (models presented, not ranked). Verified: cross-ref navigates, guard clean, no leaked tokens.

## Update log — 2026-07-07

- **What's New banner retired; replaced by a header "What's new" button.** *(Label finalized as "What's new" — button, modal title, footer link, and About text all match; internal ids and the `#changelog` route are unchanged.)* **Placement (finalized):** "What's new" sits **inside the navigation**, styled identically to the tabs (same type, spacing, hover) and distinguished only by its accent count pill — the nav reads Research · Themes · Policy Lab · About · What's new ⑩ at every width, with the full label everywhere (below 560px, nav-item padding tightens so all five fit one line). Structurally the four view tabs live in a `role="tablist"` wrapper and the What's-new button is their nav sibling (it opens the log rather than switching views), which keeps spacing uniform and ARIA correct. The full-width banner (Research-only), its "View new entries → filtered view" behavior, and the Research-tab count badge are all removed — markup, `wnb-*`/badge CSS, and the four banner functions. In their place: a single **"What's changed" button in the header**, visible from every tab, with a count pill showing **entries added since the log was last opened** (30-day fallback for first-time visitors; the old `wnbSeen` marker migrates automatically). The pill pulses twice on load when there is something unseen (suppressed under `prefers-reduced-motion`), and clears when the log opens. The Recent sidebar filter and the changelog's footer/About/`#changelog` entry points are unchanged; the About Updates text no longer mentions a banner. Verified: fresh visitor sees 38, post-open the pill clears and persists cleared across reloads, a one-day-old seen marker correctly shows 10 (that day's additions), mobile fits without overflow, console clean.

- **R6 Theme freshness — implemented.** All 9 themes now carry `lastReviewed: "2026-06-22"` (the date of the last systematic pass over every theme field, the #16 citation sweep). Each theme card ends with an italic freshness line: "Synthesis last reviewed <date>." plus, when applicable, "N newer entries in this theme's categories since review" — computed live as entries whose `added` date postdates the review, whose category matches the categories the theme's linked papers span, and which are not yet linked. Intake now automatically surfaces which syntheses need re-review.
- **R7 Data-validation guard — implemented.** A console-only check runs at load: duplicate/unknown entry ids, categories, geographies, malformed `date`/`added` values; theme `papers` and policy `paperIds` that resolve to no entry; `{{cite}}`/`{{citep}}` tokens with no target; `{{pol:…}}` cross-references with no policy; policy category/level validity. Current dataset: zero problems. This is the class of bug that shipped silently as #230/#231's invalid category.
- **R8 Data extracted — implemented.** The entire data layer moved from an inline `<script>` block to **`data/tracker-data.js`** (index.html: 862KB → 171KB; data file ~690KB), loaded as a classic script so there is still no build step and GitHub Pages/file:// behavior is unchanged. Data edits are now isolated, diffable commits reviewable through the existing PR flow; the file opens with an intake-convention comment. Preview mirrors must copy both files.
- **R9 Hygiene — done.** Of the 11 orphan entries (linked to no theme, cited nowhere, in no curated list): the four substantive policy/economy pieces (#225 Policy on the AI Exponential → Macroeconomic Risk; #226 Anthropic policy framework → Policy & Regulation; #227 People-Centered AI Agenda → Macroeconomic Risk; #228 Building Pro-Worker AI → Worker Power) are now linked into those themes' papers. The remaining seven (#178, #182, #183, #185, #188, #193, #194 — business-strategy/marketing talks, mostly `macro`) are **consciously accepted** as Research-tab-only: they fit no synthesis and would dilute theme References. **Left open for a product decision:** whether the Focused lens's parallel econ fields (6 of 9 themes carry `econSynthesis`/`econGaps`) still earn their maintenance cost for a team-internal audience — no change made.
- **R3 Curated policy evidence + fact-check burn-down — implemented.** Three parts, all verified live:
  - **Fact-check (web-verified via parallel research agents).** Of the nine flagged claims: five wrong, three partly wrong, one correct. Corrections applied (15 prose replacements): NY Fast Food Wage Board covered **~136,000** workers, not 60,000 (two places); the job-lock finding is **Madrian (Quarterly Journal of Economics, 1994)**, not RAND, and the figure is ~25% lower turnover; **CBO has never scored a federal job guarantee** — the leading estimate is the Levy Economics Institute (2018, >$500B/yr gross); the "Ro Khanna National Technology and Innovation Dividend Fund" **does not exist** — replaced with Sanders's American AI Sovereign Wealth Fund Act (2026) (two places); the 2022 employee-ownership measure is the **WORK Act's $50M in DOL grants** (SBA lending came from the 2018 Main Street Employee Ownership Act) (two places); the UCL Universal Basic Services costing is **£42.2bn/yr (2.3% of GDP, ~£126/week to the poorest households)**, not "£10,000 per person"; Switzerland's wealth taxes are **cantonal/municipal only** and the ~4% share is of **total** (not federal) tax revenue (two places); **~23 states** (not six) maintain sovereign wealth funds; the unsourced "70% of Fortune 500" hiring claim replaced with the Harvard Business School-backed ">90% of employers use ATS/RMS"; two loose "CBO scoring" attributions softened to "budget scoring and academic research." France's Participation "~8 million workers" **verified correct** (DARES 2023: 7.7M) — no change.
  - **Evidence entries added (ids 247–256, `added: 2026-07-07`, entries now 251):** Harvard Business School "Hidden Workers"; Census P60-277 (2021 SPM, child poverty −46%); NLIHC "The Gap" (7.2M shortage); CBPP federal rental assistance (1-in-4); CFPB Circular 2022-03; NIST AI RMF 1.0; Stockton SEED first-year analysis; NCEO "Employee Ownership by the Numbers" (6,609 ESOPs / 15.1M participants); UCL IGP Universal Basic Services (2017); OECD Pillar Two statement (2021). Ten inline citations wired into the policy prose making those claims.
  - **Curated research basis.** Policies now carry hand-picked `paperIds` (17 of 27 seeded from their inline citations plus curated extras); the modal's "Research basis" shows the curated list in full, with the category-derived list demoted to a deduplicated "Show N related studies" toggle. Policies without `paperIds` keep the old behavior. The R1 Markdown export's References section includes curated papers.

## Update log — 2026-07-06

- **R4 Added-date semantics — implemented.** Every research entry now carries `added: "YYYY-MM-DD"` (its intake date), **backfilled from git history** — a script mined all 51 commits touching the tracker file and recorded the first commit each entry id appears in (11 distinct intake dates, 2026-04-30 initial import of 107 through 14 entries on 2026-07-06). `calcStatus` now returns **Recent = added to the tracker within 30 days** (the window was tightened from 90 because the whole tracker is only ~10 weeks old — a 90-day added-window would mark all 241 entries Recent); Current/Older remain publication-based (18-month boundary). The What's New banner and Research-tab badge key off intake dates, so importing an old-but-important paper now correctly surfaces as new (verified: entry #230, published April, added June 23 → Recent; 2023 papers from the initial import → Older). The "From recent research" band now shows the 8 most recently added highlight papers, so it can never go empty. Status distribution moved 38/75/128 → 28/93/120.
- **R5 Changelog — implemented.** A "What's changed" modal presents a dated feed built from data already in the file: research entries added (grouped by intake date, newest first; bulk groups >20 collapse to a count line, with the 107-entry initial import labeled as such) and Policy Lab review passes (from `lastReviewed`). Reachable from a persistent **footer link**, a link in the About Updates section, and the **`#changelog` deep link**; clicking an entry closes the modal and deep-links to the card. Subscribe/RSS (the rest of #9) remains open.
- **R1 Policy export — implemented.** Every policy modal now carries three actions under its header: **Copy as draft** (the full card as formatted Markdown: title, phase/domain line, all primer sections in order, press links, and a References section of every paper cited in the card, in plain-text APA with URLs; `{{cite}}`/`{{pol}}` tokens resolve to text), **Copy link** (the policy's deep link), and **Print** (a `@media print` stylesheet renders just the open modal as a clean one-pager — related studies expanded, press URLs printed inline). Verified: a 5.5KB Markdown draft with 10 sections and zero leaked tokens/HTML.
- **R2 Deep links + copy-cite — implemented.** Hash routes: `#research` / `#themes` / `#policy` / `#about` (tabs), `#theme/<id>`, `#policy/<id>` (opens the modal), `#entry/<id>` (switches to Research, clears filters, scrolls to the card with a brief accent-outline flash; switches lens if needed). The address bar tracks navigation via `replaceState`; `hashchange` handles pasted links and back/forward; unknown hashes fall back to the default landing. Research cards gained a **Cite** button (Copy APA / Copy BibTeX / Copy link, with a "Copied ✓" flash); theme cards gained **Copy link** in the prev/next row. All copy formats and routes verified live, no console errors.
- **#17 Screen-reader accessibility — implemented** (see the #17 section for the full item-by-item breakdown). Verified in preview with no console errors and no visual change.
- **Recency taxonomy renamed (Option B).** The status labels are now **Recent / Current / Older** (were Emergent / Current / Stale); internal keys (`emergent`/`current`/`stale`) and all filter logic are unchanged, so `calcStatus`, the status filter, and the What's New banner still work. The banner flow now reads coherently: "N new entries added in the last 90 days" → the resulting chip says "Recent."
- **Data-integrity fix.** Entries #230 and #231 (the two Acemoglu NBER knowledge papers) had `category: "experience"` — a *theme* id, not one of the 14 categories — so they rendered a gray fallback chip and matched no category filter. Corrected both to `macro`. A full sweep confirms zero entries now carry an invalid category.

## Update log — 2026-06-26 (reflects the current live version)

Substantial work beyond the original recommendation scope. The four open items (#2, #9, #14, #17) remain open; everything below is additive and was verified against the current `index.html`.

**Content & data**
- **Research data grew 223 → 241 entries** (max id 246). Added: an Acemoglu et al. NBER trio plus the JEP "Automation and New Tasks"; KFF (Medicare WISeR), The Atlantic (AI in hospitals), arXiv (data-broker privacy compliance), IPPR ("Acceleration is not a strategy"), GLAAD (LGBTQ AI report), the Mijente / Just Futures Law / Surveillance Resistance Lab ICE report, and Business Insider (Amazon warehouse automation). A further ~6 entries (ids 241–246: OpenAI 5%-stake, FTC accuracy-suppression statement, a California unemployment-claims job-loss tracker, NJ A3481, and others) were added subsequently.
- **Acronym-expansion passes** across Policy Lab fields and the About tab (e.g., "unemployment insurance," "Earned Income Tax Credit," "Trade Adjustment Assistance" spelled out; proper-noun acronyms like NBER kept).
- **Policy-wide inline-citation sweep** (extends #16): citations propagated into every policy field where a claim maps to a database paper, plus a de-AI-style prose pass on the new fields.

**Policy Lab primer expansion** *(net-new; not an original recommendation)*
- Every policy card gained six structured deliberation fields — **feasibility, strengths, risks, considerations, political landscape, press** — plus a **`lastReviewed`** date, and the modal was widened. Matrix positioning is unchanged; the modal is now primer-depth. An editorial "recommendation" field was deliberately omitted to preserve neutrality.

**What's New banner — fixed** *(revises the premise of #9)*
- The banner was **broken** (never rendered: a `display:none` bug, and it only lived on the Research tab while the default landing is Themes). Now fixed, recolored coral → signature blue, moved full-width under the header, given a **Research-tab count badge** (discoverable from any tab), and switched to **dismiss-until-next-update** persistence. #9's subscribe / RSS / changelog remains not started.

**Other UI**
- **Dynamic "From recent research" band** — the key-findings band now pulls only emergent (<90-day) papers and was relabeled.
- **Salary-premium key-finding card** — the one card that jumped to a theme instead of opening a modal (an #15 edge case) was wired to its source paper with a curated excerpt.
- **About tab currency pass** — removed the outdated recency-status description, corrected theme/policy counts, updated the separate info-modal.

**Deep fact-check of the Policy Lab (2026-06-26)** — partial (batch 1 live-verified via web; the rest knowledge-assessed after a spend-limit interruption).
- **Applied:** two verified minimum-wage corrections — "23 states" → "20 states + D.C. (~13 currently indexing)" (3 places) and "BLS publishes indices monthly" → "CPI monthly, ECI quarterly."
- ~~**Open — verify, then correct**~~ **Resolved 2026-07-07** (see the R3 entry in the 2026-07-07 log): all nine claims web-verified; eight corrected, France Participation confirmed accurate.
- ~~**Open — add research entries to back claims**~~ **Resolved 2026-07-07**: all eight source groups added as entries 247–256 and cited inline where the claims live.
- **Data caveats on new entries:** the WIRED World Cup piece carries a 2022-11-03 metadata date despite 2026 content; the Amazon (filed under *surveillance*) and Atlantic (filed under *labor*) category assignments are judgment calls.

---

## Tier 1 — Distribution & reach

The biggest gap. The content is strong but currently hard to spread or cite.

### 1. Social / SEO metadata is missing
No Open Graph tags, no Twitter card, no meta description, no structured data. Pasting the link into Slack, LinkedIn, or X shows a bare URL with no title, blurb, or image. For a tool meant to influence a conversation, this alone caps reach. Add OG/Twitter cards + a meta description (+ optional JSON-LD). Small effort, large payoff.

### 2. Nothing is individually shareable or citable
The URL never changes — you can't send someone "this specific finding/theme/policy." Add per-item deep links (URL hash for the open theme/policy/paper), copy-to-clipboard on findings, and a "cite this" action (APA / BibTeX). For a research audience, citability is table stakes and currently absent.

### 3. No analytics
There's no way to see what resonates — which findings get clicked, which themes get read, where people drop. A privacy-friendly tracker (e.g., Plausible) creates the feedback loop that makes future refinements evidence-based.

*Status (2026-06-14): GoatCounter snippet added to `<head>`, commented and ready. To activate: create a free site at goatcounter.com, replace `YOURCODE`, and uncomment the tag. Swappable for Plausible/Fathom/Cloudflare with one line.*

### 4. The URL reads like a file, not a product
Currently `…github.io/ai-tech-markets-research/research_tracker.html`. A clean root (`index.html`, ideally a custom domain) makes it feel and share like a destination.

*Status (2026-06-14): Renamed `research_tracker.html` → `index.html`, so the URL is now `…/ai-tech-markets-research/`. Self-references (canonical, og:url, header link) updated; a redirect stub at the old filename preserves existing links. Custom domain still open — needs a domain you own; I can add the CNAME + DNS guidance once you pick one.*

### 15. Key-finding cards should open a source-excerpt modal, not jump to Themes
*(Added 2026-06-14; belongs in Tier 1–2, tightly coupled to #2.)*

**Problem.** Each key-finding card currently navigates to the Themes tab (lens-aware). But the headline stat was drawn from a specific *paper*, and that exact number often isn't surfaced in the theme synthesis — so a reader who clicks "60% of new AI jobs in the top 20 metros" lands on the Communities theme and can't find the figure they clicked. That breaks the trust loop on the most prominent, most-shared numbers on the site.

**Proposed.** Clicking a key-finding card opens a focused modal scoped to that finding, containing:
- **Source excerpt** — the exact paragraph/sentence from the originating paper the stat was cited from, with that paper's full APA citation and a link to the source.
- **Related research** — APA citations of other connected papers (corroborating or extending the finding), each linking out.
- **Related theme** — a link to the relevant theme card (the current behavior, demoted from primary click to a secondary affordance inside the modal).

**Why it's better.** Keeps the evidence one tap from the number instead of sending people somewhere the stat may not appear; makes the headline figures verifiable and citable; and the modal becomes the natural home for the copy/cite/deep-link actions from #2.

**Notes / dependencies (from the current data model):**
- Cards today carry only a free-text `source` string + `data-theme-id`. Each needs a **source paper id** (`data-paper-id`) to pull the excerpt and build "related research."
- The **excerpt** can reuse each paper's existing `keyFinding` in `RESEARCH_DATA`, or a dedicated short quote field for precision.
- **Related research** can reuse the cited/related references logic already built for Themes/Policy; **related theme** reuses the existing lens-aware theme navigation; the modal can reuse the policy-modal infrastructure for consistency.
- Edge case: a few band stats are composite/derived (e.g., "78M" = WEF's 170M − 92M; "31:1" is a ratio). Those need the underlying source paragraph (WEF, Open Markets) as the excerpt — a couple may need a lightly curated excerpt rather than a verbatim pull.

### 16. Inline citations throughout all theme and policy cards
*(Added 2026-06-14; extends #2 and #15. **Implemented 2026-06-22.**)*

**Status (2026-06-22): Done.**
- **Renderer (themes).** `buildThemeCard` now runs `injectCitations()` on `working`, `gaps`/`econGaps`, `implication`, `risk.summary`, and `risk.leverage` (previously synthesis-only). The "cited vs. related" References split now scans all of those active-lens fields, so a paper cited only in (say) the implication correctly surfaces under cited References instead of being buried under "related."
- **Renderer (policy).** Added `injectPolicyLinks()` (runs `injectCitations` then resolves a new cross-reference token), applied to the modal's `summary` / `rationale` / `precedent`. New token `{{pol:policy-id|link text}}` renders an inline `.pol-xref` link that opens the target policy via `openPolModalById()`; click + Enter/Space handled, focus-restore preserved across policy→policy navigation; tokens with no matching policy degrade to plain text.
- **Annotation.** 74 theme citations (propagated from each theme's own synthesis citation IDs into its other sections — high-confidence, no new source→ID guesses), plus 7 policy paper citations and 5 policy cross-references (`automation-levy`→reskilling/portable-benefits, `guaranteed-income`→ui-reform/ubi, `ubi`→sovereign-wealth-fund). Applied via verify-before-write Python scripts (`/tmp/annotate_themes.py`, `/tmp/annotate_policy.py`) that assert each anchor is unique and that edits only insert tokens (never alter prose/figures).
- **Scope.** Per the caveat below, only named sources with a real DB paper (and a `sourceUrl`) were linked; most policy precedents name laws/programs not in the database, so they stay plain text. Verified in preview: 106 distinct citation IDs all resolve, 5 cross-refs valid, cross-ref navigation works, no leaked tokens, no console errors.
- **Follow-ups:** the remaining theme `gaps`/`risk.summary` prose that names no specific source stays unlinked (correct); a few legislative references (S.1840, S.3108) are linked in theme cards but left plain in policy precedent prose to avoid double-parenthetical clutter next to their inline "(introduced …)" descriptions.

**Problem.** Inline citation links currently exist only in the Themes "What the research shows" synthesis. The other theme sections — "What's working," "Points of leverage," "What this means for institutions," the risk summary, and "Research gaps" — name studies and sources with no hyperlink. The Policy Lab cards have no inline citations at all: their prose refers both to specific papers *and to other policy recommendations* (e.g., "wage insurance," "UBI," "EITC expansion") with no direct link to them. A reader hits a named source or a cross-referenced policy and has no way to jump to it.

**Proposed.**
- **Theme cards** — extend inline citations to every section, not just the synthesis: implications, what's-working, points-of-leverage, risk, and gaps, wherever a named study or source appears.
- **Policy Lab cards** — add inline citations in the summary / rationale / precedent prose, with two link types:
  1. **Paper citations** linking to the source (and/or the source-excerpt modal from #15).
  2. **Cross-references to other policy recommendations** — when one policy's text names another, link it directly to that policy's modal.

**Why it's better.** Verifiability and navigation. Today a reader is told "X" or pointed at "policy Y" and has to go hunting; hyperlinking closes every reference in place and reinforces the citability goal in #2/#15.

**Notes / dependencies:**
- Themes: the implication/working/leverage/risk/gaps fields carry no `{{cite}}` tokens today, and the renderer only runs `injectCitations()` on the synthesis. Work = annotate those fields with tokens (same approach as the synthesis pass) and apply `injectCitations()` to them in `buildThemeCard`.
- Policy: needs (a) a paper-citation mechanism in policy prose (map named sources → paper ids; reuse `injectCitations` / `formatAPACitation`), and (b) a new intra-site cross-link mechanism mapping policy mentions → other policy ids that open the target policy modal.
- Scope caveat (consistent with the earlier Policy treatment): only link references that have a real target in the system. Laws/precedents not in the database (e.g., NYC Local Law 144) stay as plain text unless a source is added.
- Sizable annotation pass (9 themes × ~5 extra fields, plus 27 policies × 3 fields) — best done with the same verify-before-apply workflow used for the synthesis citations and keyFinding splits.

---

## Tier 2 — Orientation & trust

### 5. The default landing is the raw database
A first-time visitor meets 241 cards before the argument. The key-findings band helps, but the *synthesis* (Themes) is the more persuasive entry. Consider orienting newcomers — lead with the themes/findings, or add a brief "start here."

### 6. The About tab is the weakest surface
Currently just Purpose, Created by, and an AI disclaimer. For a research tool this is where credibility is won or lost. It should explain methodology: inclusion criteria, how sources are chosen, what the confidence / status / lens labels mean, and the update cadence. The sophisticated confidence/recency system is never explained to the user.

### 7. The AI disclaimer cuts against authority
"AI-generated, reviewed for accuracy" is honest and should stay, but pairing it with a visible methodology and sourcing standard reframes it from "caveat" to "rigor."

### 8. The General / Focused lens has an unclear value proposition
A great feature, but a newcomer won't know when to switch. One line explaining the difference (or a tooltip) would unlock it.

---

## Tier 3 — Engagement & retention

### 9. No reason or mechanism to return
There's a "what's new" banner and a last-updated date (good), but no way to subscribe (email/RSS) and no changelog/archive. A tracker that updates regularly should capture interested visitors and pull them back.

---

## Tier 4 — Accessibility & inclusivity

### 10. No dark mode
No `prefers-color-scheme` support — many professional/research users expect it.

### 11. Contrast & keyboard gaps
Specific spots were patched (e.g., the community gold), but a systematic WCAG AA pass on the colored category links and small markers is worth doing, plus a keyboard/focus audit of the modals and collapsibles.

---

### 17. Screen-reader accessibility
*(Added 2026-06-14; extends #11. **Implemented 2026-07-06.**)*

**Status (2026-07-06): Done.** All eight audited items shipped and verified in preview (no console errors; computed styles confirm zero visual change):
1. **Real heading structure.** Theme questions → `h2`; the five theme section labels (What the research shows / What's working / Risks & leverage / What this means for institutions / Research gaps) → `h3` using the ARIA accordion pattern (an `h3.theme-section-heading` wrapping the existing `role="button"` toggle, so both heading and button semantics are exposed and the collapse behavior is untouched); References heading → `h3`; research card titles → `h3` (wrapper around the source link); the "From recent research" band label → `h2`; all four modal titles → `h2`; About section labels → `h2`. A CSS normalization block strips UA heading margins so every converted element looks identical.
2. **Citation link context.** `injectCitations()` now adds an `aria-label` to each inline `(Year)` link carrying the full source and "Opens in new tab" (e.g., "Tim De Chant, TechCrunch, 2026. Opens in new tab."), so they no longer announce as a bare "link, 2026."
3. **View-change announcement + tab pattern.** `.main-content` is now `role="tabpanel"` with `aria-labelledby` tracking the active tab; all four nav buttons carry `aria-controls` and About is now a proper `role="tab"`; a visually-hidden `aria-live` region announces "Research/Themes/Policy Lab/About view" on switch.
4. **Skip link.** A visually-hidden "Skip to main content" link is the first focusable element, targeting `#mainContent` (`<main tabindex="-1">`).
5. **Search input name.** `aria-label="Search the research database"`.
6. **Decorative glyphs hidden.** `aria-hidden` on gap arrows (→), takeaway triangles (▸), working checks (✓), section/reference chevrons, and prev/next nav arrows.
7. **Named the two unlabeled dialogs.** Policy modal → `aria-labelledby="polModalTitle"`; key-finding modal → `aria-labelledby="findingModalStat findingModalTitle"`.
8. **New-tab signal** folded into the citation `aria-label` (item 2), covering the inline citations.

**Follow-up:** validate with a real screen reader (VoiceOver / NVDA) — automated checks miss reading-flow and focus nuances. The policy-matrix cards were left as-is (each is a single click target; converting their titles to headings would reintroduce the heading/button dual-role question and is low value).

**Original audit (2026-06-14) — already in place at that time:** landmarks (`header`/`nav`/`main`/`footer`/`aside`); nav as `role="tablist"` with `aria-selected` tabs; modals with `role="dialog"` + `aria-modal` + Escape + focus trap + focus restore; `aria-expanded` on collapsible sections; `aria-label`s on icon-only buttons; two `aria-live` regions (what's-new banner, result count).

**High-value core:**
1. **Real heading structure** *(biggest gap)*. Theme questions, card titles, modal titles, section labels, the "Key findings" label, and the References heading are all `<div>`s, so SR users have no headings to navigate by — the page is one flat stream. Make them semantic headings (theme question → `h2`, section labels → `h3`, modal title → `h2`, "Key findings" → `h2`, Research card titles → `h3`), styled to look identical.
2. **Citation link context.** Inline `(2025)` citations announce as bare "link, 2025." Add an `aria-label` carrying the full citation (e.g., "World Economic Forum, 2025, opens in new tab") in the citation renderer.
3. **Announce/focus on view change.** Switching tab/lens/theme swaps content silently with focus left on the button. Move focus to the new view's main heading on switch and/or announce via a live region; consider completing the tab pattern (the content area has no `role="tabpanel"`).
4. **Skip link.** Add a visually-hidden "Skip to main content" link as the first focusable element.
5. **Search input name.** The search box relies on a `placeholder` only; add `aria-label="Search the research database"` (and check the filter controls).

**Polish:**
6. **Hide decorative glyphs.** Gap arrows (→), takeaway triangles (▸), chevrons, and nav arrows are read aloud; add `aria-hidden="true"`.
7. **Name the two unlabeled dialogs.** Policy and key-finding modals have `role="dialog"` but no `aria-labelledby`; point it at their title elements.
8. **Signal new-tab links.** Source links open in new tabs with no warning; folding "(opens in new tab)" into the citation/reference labels (#2) covers most.

**Note:** after implementing, validate with a real screen reader (VoiceOver on macOS, NVDA on Windows) — automated checks miss reading-flow and focus issues.

## Tier 5 — Polish & maintainability

### 12. The Policy Lab matrix doesn't fit phones
Its 5-phase layout is ~758px wide, so on a 375px screen it overflows. It needs a dedicated mobile layout (e.g., stack by category, phase as a sub-label).

### 13. Dead CSS has accumulated
Leftovers include `theme-research-sidebar`, `theme-risk-badge`, `pol-basis-chip`, and orphaned confidence classes. A cleanup pass would help maintainability.

**Status (2026-06-22): Done.** Removed 159 dead rule blocks (~22.8 KB; CSS 72.2 KB → 49.5 KB, file 756 KB → 733 KB) covering 97 class selectors that were defined in the `<style>` block but referenced nowhere outside it — mostly orphans from prior redesigns (old header `header-eyebrow`/`header-updated`/`header-disclaimer`, the removed `sidebar-*`/`stat-bar`/`card-meta*` research-card layout, `theme-confidence-*`/`theme-expand-btn`/`theme-detail` theme-card design, `pol-chip*`/`pol-filterbar*`/`pol-modal-activation*`, plus the named suspects). Method: a comment/string/brace-aware detector (`/tmp/find_dead_css.py`) cross-checked every class against all markup, JS template strings, and `classList`/`querySelector` calls; first verified there is **no** dynamic class construction in the codebase (every `classList` call uses string literals; the only fragment concatenations build element *ids*). Removal (`/tmp/strip_dead_css.py`) deletes a rule only when **all** its selectors are dead and prunes dead selectors from mixed groups — 0 mixed groups occurred, so no live rule was altered. Guards: balanced-brace assertion + a core-live-class allowlist that must survive. Verified in preview: header/research/themes/policy/about all render unchanged, no removed class is present on any live element, no console errors.

### 14. All data is inline in a ~825KB HTML file
Fine today, but extracting the data to JSON would make it far easier to maintain, reuse, or eventually feed an API/newsletter. *(Update 2026-06-26: the single file has grown from ~716KB to ~825KB as research entries [223 → 241] and the policy-primer fields expanded — strengthening this case.)*
