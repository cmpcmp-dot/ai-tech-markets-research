# AI & Tech Markets Research Tracker — Assessment

**To:** Internal
**From:** Research Operations
**Re:** AI & Tech Markets Research Tracker — Assessment
**Date:** May 8, 2026

---

## Overview

The research tracker is a single-file, browser-based tool for curating, filtering, and synthesizing research on AI's impact on labor markets, technology policy, and economic equity. It currently holds 144 entries across 8 thematic areas and 32 policy positions, drawn from academic journals, government bodies, think tanks, industry labs, and investigative journalism.

---

## Strengths

**Depth and scope.** The tracker has reached genuine critical mass. At 144 entries spanning peer-reviewed research, working papers, official reports, and civil society analysis, it covers the field's major debates with enough density that filters return meaningful signal rather than noise.

**Multi-axis filtering.** Users can compose filters across category, recency status, geography, and methodology type simultaneously. This is more analytically useful than most research tools, which offer one or two dimensions at most.

**Methodology signal.** Each entry is automatically classified by source type — Peer-Reviewed, Working Paper, Official, Analysis, Industry, or Commentary. This is relatively rare in policy-adjacent research tools and adds real epistemic value: a Goldman Sachs forecast and an ILO report shouldn't carry the same weight in a policy argument, and now they don't have to.

**Theme synthesis layer.** The eight thematic cards go beyond bibliography. Each captures where research consensus stands, where it's contested, and what gaps remain — the kind of institutional knowledge that usually lives only in a senior researcher's head.

**Policy lab.** A tiered policy framework, linked to the underlying research, gives the tool a prescriptive dimension most trackers lack. It connects evidence to action.

---

## Constraints

**Single-file architecture.** Everything — data, logic, styles, and content — lives in one HTML file. This makes the tool highly portable and easy to share, but it means all editing happens directly in code. There is no interface for adding or updating entries; changes require opening the file and editing the underlying data structures manually.

**No persistence layer.** The tracker has no database, no server, and no backend. It runs entirely in the browser. This means there is no user authentication, no access control, and no audit trail. Anyone with the file can see everything; no one without it can see anything.

**No real-time data.** Entries do not update automatically. Every new source, theme update, or policy addition must be manually researched, formatted, and inserted. The tracker reflects the state of knowledge at the time of last edit, not the state of the field today.

**Single-category constraint.** Each entry is assigned to exactly one primary category. The data model does not support multiple tags per entry, which means cross-cutting topics — surveillance in the workplace, algorithmic bias in hiring, reskilling in underserved communities — can only surface in one thematic lane at a time.

**No external integrations.** The tracker cannot pull from RSS feeds, academic databases, Google Scholar alerts, or any other live source. There is no pipeline between where research is published and where it appears in the tool.

**File size as a soft ceiling.** As a single HTML file, the tracker is currently over 600KB of raw markup, data, and logic. Browsers handle this comfortably now, but as entries, themes, and policy content grow, load time and in-file navigation will degrade. The single-file format has a practical upper limit that a database-backed tool would not.

---

## Accessibility

The tracker has been built with deliberate accessibility support, with particular attention to screen reader and keyboard usability.

**What's in place.** All interactive sidebar navigation — category, status, and geography filters — uses semantic `<button>` elements with `aria-pressed` state and descriptive labels that include entry counts (e.g. *"Labor Rights, 18 entries"*). All three modals (Sources, About, Policy) manage focus correctly: focus moves into the modal on open and returns to the trigger element on close. Collapsible sections across theme cards and research card takeaways carry `aria-expanded` state so screen reader users know whether content is open or closed. Filter pill tooltips are accessible via keyboard focus in addition to hover, and their descriptions are exposed to screen readers via `aria-describedby`. Decorative elements — color dots, SVG icons — are marked `aria-hidden`. The result count and new-entry banner use `aria-live` regions so changes are announced without requiring navigation. View toggle buttons use `role="tablist"` and `aria-selected`.

**Remaining gaps.** The policy filter bar's ⓘ information icon is currently hover-only and does not respond to keyboard focus.

**Status information.** Color-only status indicators have been removed throughout the tool. Status, methodology, and category are communicated through text labels rather than color alone, ensuring the information is available regardless of how the tool is accessed.

---

## Gaps

**Single-user architecture.** The flat HTML format means there is no collaborative editing, no mechanism for a team member to propose an addition, and no version history. Curation is a single point of failure.

**No shared annotations.** Team members cannot flag entries, add notes, or surface disagreements with a finding. That conversation happens in Slack or documents and never feeds back into the tracker.

**No URL-shareable filter state.** There is no way to send a colleague a link to a specific filtered view. They must recreate the filter state manually, which creates friction for team workflows.

**No change visibility.** There is no read/unread state or changelog, so a returning user cannot see what has been added since they last visited. This becomes a more significant problem as the entry count grows.

---

## Opportunities for Growth

**Structured export.** A CSV or JSON export of the full dataset would allow the tracker to feed downstream tools — slide decks, reports, dashboards — without manual re-entry.

- *What it actually saves.* Compiled research can flow directly into reports and presentations without reformatting. The data becomes reusable rather than locked inside the tool.
- *What it doesn't solve.* Export is a snapshot, not a live feed. Any downstream document would still need to be manually refreshed when new entries are added.

**Entry submission workflow.** A Google Form with fields that map to the tracker's data structure — title, source, URL, date, category, key finding — would let anyone on the team flag new sources. Responses land in a Google Sheet that acts as a review queue. The maintainer approves entries and inserts them into the file.

- *What it actually saves.* The bottleneck shifts from finding and researching entries to reviewing and inserting them. That's a meaningful difference — reviewing takes minutes, researching takes much longer. It also means the tracker's scope is no longer limited by one person's reading time.
- *What it doesn't solve.* It doesn't eliminate the manual HTML edit step. For that you'd need a more substantial rebuild — a backend, a CMS, or at minimum a script that reads from the sheet and regenerates the file. That's the natural next step if the submission volume justifies it.

**Google Sheets integration patterns.** There are three ways to connect a Google Sheet to the tracker, each with different levels of effort and payoff.

*Pattern 1 — Sheet as submission queue.* The lightest lift. A Google Form feeds a Sheet. The Sheet is purely a holding area — the maintainer reviews it periodically, copies approved entries, and manually adds them to the HTML. No automation, just structure. Good for distributing the discovery burden without changing anything about how the tool works today. Effort: half a day to set up the form and agree on field definitions.

*Pattern 2 — Sheet as source of truth, script generates the HTML.* The Sheet holds all research entries as rows. A Python or Apps Script reads the sheet and regenerates the `RESEARCH_DATA` array in the HTML file. The HTML becomes a build artifact — you edit data in the sheet, run the script, get an updated file. Multiple people can edit the sheet; only one person needs to run the regeneration script. Effort: a few days. The script needs to map sheet columns to entry fields and handle edge cases. The themes, policy lab, and synthesis cards would still live in the HTML and be managed separately. Risk: the script needs to be maintained alongside the data structure — if a new field is added, both the sheet and the script need updating.

*Pattern 3 — Sheet as live data source.* The HTML fetches directly from the Google Sheets API when it loads in the browser. No file regeneration — the data is always current. Add a row to the sheet, refresh the browser, it appears. Effort: moderate, requiring a published sheet or API key and async data loading. Risk: the tool stops working without an internet connection and becomes dependent on Google's API availability.

*Recommended path.* Start with Pattern 1 to build the habit and validate that the form fields cover everything needed. If submission volume justifies it, move to Pattern 2 — it solves the right problem without introducing the availability risks of Pattern 3. The themes and policy lab synthesis content should stay in the HTML regardless; that is editorial work, not data entry, and does not belong in a spreadsheet.

**Shareable filter URLs.** Encoding active filter state in the URL hash would allow filtered views to be shared directly, making the tool much more useful in team communication.

- *What it actually saves.* A researcher could send a direct link to, say, all current peer-reviewed entries on labor displacement, rather than writing out which filters to apply. Particularly valuable for the team member using a screen reader, who currently has to recreate filter states manually on every visit.
- *What it doesn't solve.* Filter URLs only share a view, not an annotation or interpretation. The recipient still needs context for why that filtered view is relevant.

**Recency threshold tuning.** Given how fast this field moves, the current "stale" threshold of 18 months may be too generous. A tighter window — or a manually overridable "evergreen" flag for foundational entries — would keep the recency signal accurate.

- *What it actually saves.* Users would be less likely to surface outdated findings without realising it. Foundational entries (Acemoglu, Autor) could be marked evergreen so they don't age out of relevance unfairly.
- *What it doesn't solve.* Threshold tuning is a judgment call, not a technical fix. It requires periodic review to stay calibrated as the field evolves.

**Cross-theme tagging.** Many entries (facial recognition bias, gig work, reskilling) span multiple themes naturally. A secondary tag system would surface these connections without disrupting the primary category structure.

- *What it actually saves.* Researchers working across themes would find relevant entries they might otherwise miss. It reduces the cost of the single-category constraint without requiring a data model rebuild.
- *What it doesn't solve.* Adding a second tag to every entry is a significant manual effort retroactively. It works best as a forward-looking practice applied to new entries, with backfill done selectively.

**Deep links to themes.** Adding URL hash support for the themes view would allow researchers to share a direct link to a specific theme card — Displacement & Wages, Algorithmic Bias, or any other — making the thematic layer far more usable in reports, briefings, and team communication.

- *What it actually saves.* Theme syntheses are among the most analytically valuable parts of the tracker. Deep links make them citable and shareable as standalone resources, not just navigable within the tool.
- *What it doesn't solve.* Hash-based routing only works while the file is open in a browser. It doesn't create a stable public URL — for that, the tool would need to be hosted rather than shared as a file.

---

## How to Sequence the Recommendations

Not all opportunities carry equal weight or have the same dependencies. The following framing is intended to help prioritize effort.

**Do first — low effort, high immediate value**

*Deep links to themes* and *shareable filter URLs* are both implementable within the existing single-file format in a matter of hours. They require no new infrastructure, no external services, and no data migration. Deep links in particular address a specific and immediate need: the thematic synthesis layer is the tracker's most analytically valuable asset and currently has no way to be referenced directly in external documents or shared with colleagues.

**Do next — moderate effort, structural payoff**

*Entry submission workflow (Pattern 1)* is the right second move. Setting up a Google Form and Sheet costs half a day and immediately distributes the curation burden. It also creates the data infrastructure needed for Pattern 2 later, so the effort compounds. Running Pattern 1 for a few months also validates the field definitions before committing to any automation.

*Recency threshold tuning* is a low-code change with meaningful signal quality impact. It can be done alongside Pattern 1 with minimal additional effort.

**Do later — higher effort, longer payoff horizon**

*Google Sheets integration (Pattern 2)* makes sense once Pattern 1 has been running long enough to confirm the form fields are stable and submission volume is consistent. Building the script before that risks designing around a data structure that hasn't been stress-tested.

*Cross-theme tagging* is best treated as a forward-looking practice rather than a retroactive project. Start applying secondary tags to new entries from a set date and backfill selectively for the most cross-cutting entries. Doing it all at once is not worth the effort.

**Do when the tool outgrows the file**

*Structured export* and *platform migration* (to a hosted application or collaborative tool) become relevant when the entry count approaches 250–300 or when multiple people need to maintain the data simultaneously. Before that threshold, the overhead of migration outweighs the benefit.

**Dependencies to watch**

The Google Sheets integration patterns are sequentially dependent — Pattern 1 should precede Pattern 2, and Pattern 2 should precede Pattern 3. Shareable filter URLs and deep links to themes are independent of everything else and of each other. Cross-theme tagging is independent but becomes more valuable once filter URLs exist, since a tagged filtered view becomes something you can share directly.

---

## Bottom Line

The tracker is a well-structured, analytically layered research intelligence tool — meaningfully above what most teams build in Notion or Airtable for similar purposes. Its primary ceiling is the single-file format: it scales well to roughly 250–300 entries before the maintenance burden of manually tagging, placing, and cross-referencing each addition starts to outweigh the value. The next phase of investment should focus on lowering the contribution barrier and making filtered views shareable — both of which extend its usefulness to a broader team — while keeping an eye on when the data model outgrows what a flat file can cleanly support.
