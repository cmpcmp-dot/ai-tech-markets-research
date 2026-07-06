# Research Tracker — Refinement Recommendations

**Product:** AI, Tech and the Economy: Research Intelligence (`index.html`)
**Assessment date:** 2026-06-14
**Scope:** Full-site review for a more impactful product — content, information architecture, distribution, trust, accessibility, and technical maintainability.
**Status:** #1, #4, #5, #6, #7, #8, #10, #11, #12, and #15 implemented on the `fable-pilot` branch (2026-06-14); #16 and #13 implemented (2026-06-22). A substantial round of content work followed on 2026-06-26 (Policy Lab primer expansion, What's New banner fix, new research entries, acronym pass, policy-wide citation sweep, deep fact-check) — see the **Update log** below. #17 (screen-reader accessibility) implemented 2026-07-06. #3 remains wired (pending your analytics account code). The three open items (#2, #9, #14) are unchanged. See the Status column and Update log below.

---

## Project state & how to resume (for a fresh session)

- **Working file:** `index.html` (renamed from `research_tracker.html`, which is now a redirect stub). Single-file app; data is inline: `RESEARCH_DATA` (241 entries as of 2026-06-26), `THEMES` (9), `POLICY_DATA` (27, each now carrying primer-style fields — feasibility, strengths, risks, considerations, landscape, press, lastReviewed).
- **Repo / deploy:** `github.com/cmpcmp-dot/ai-tech-markets-research`, branch `fable-pilot` (main is `main`); GitHub Pages at `cmpcmp-dot.github.io/ai-tech-markets-research/`.
- **Local preview:** served from `/tmp/tracker_preview/` via `/tmp/serve_tracker.py` (regenerable; the macOS sandbox blocks serving directly from `~/Documents`). Copy `index.html` into that mirror and start the `research-tracker` launch config.
- **To resume:** read this file, pick an open item (#2, #9, #14, #17), and continue.

### Design & content conventions (keep consistent)
- **Color:** signature blue = `var(--accent)` (#2563EB light / #6fa1f5 dark). All interactive elements and markers (gap arrows →, takeaway triangles ▸, working checks ✓), the leverage callout, reference toggles, and key-finding stats/links use it.
- **Type:** Publico Banner (serif) for headings/section labels; Public Sans for body. Sentence case for labels (never ALL CAPS or Title Case).
- **Prose style:** no em-dash connector clauses (use commas/periods); paired parenthetical em-dashes are fine; the " — " inside a `source` field is the author/organization separator (keep it). Keep sentences to roughly 42 words or fewer.
- **Citations:** inline tokens `{{cite:ID}}` (renders "(Year)") and `{{citep:ID}}` (renders "(Author, Year)"), resolved by `injectCitations()` against `RESEARCH_DATA`; APA via `formatAPACitation()`. References use a cited-then-"related" toggle with APA hanging indent.
- **Dark mode:** automatic via `prefers-color-scheme`; all colors flow through CSS variables, with a lightened per-theme palette in the dark block.
- **Default landing tab:** Themes.
- **Editing workflow:** make content edits via Python scripts that assert each anchor is unique, preserve every `{{cite}}` token and numeric figure, and check for em-dashes / raw double quotes / over-length sentences before writing. Verify in the preview — computed styles are authoritative; the panel's screenshots are intermittently blank.

---

## What's already strong

The three content tabs (Research, Themes, Policy Lab) share one cohesive system: concise syntheses, inline APA citations, the cited/related references pattern, confidence + "points of leverage" framing, the key-findings band, and a consistent signature-blue accent. The confidence / recency / lens model is genuinely sophisticated, and the underlying content is the product's real asset. The opportunities below are mostly about **getting the content in front of people, earning trust quickly, and letting them act on it** — not about the content itself.

---

## Summary (tracking table)

| # | Recommendation | Tier | Effort | Impact | Status |
|---|----------------|------|--------|--------|--------|
| 1 | Social / SEO metadata (OG, Twitter, description, structured data) | 1 Distribution | S | High | Done |
| 2 | Shareable & citable findings (deep links + copy/cite) | 1 Distribution | M | High | Not started |
| 3 | Privacy-friendly analytics | 1 Distribution | S | Med–High | Wired — add account code |
| 4 | Clean URL / custom domain | 1 Distribution | S | Med | Clean URL done; domain pending |
| 15 | Key-finding cards open a source-excerpt modal (not jump to Themes) | 1–2 | M | High | Done |
| 16 | Inline citations throughout all theme & policy cards (not just the synthesis) | 1–2 | M–L | Med–High | Done |
| 5 | Reconsider landing / first-visit orientation | 2 Trust | M | Med–High | Done |
| 6 | Methodology / expand the About tab | 2 Trust | M | High | Done |
| 7 | Reframe the AI disclaimer alongside methodology | 2 Trust | S | Med | Done |
| 8 | Clarify the General / Focused lens value | 2 Trust | S | Med | Done |
| 9 | Subscribe / follow + changelog | 3 Engagement | M | Med | Not started |
| 10 | Dark mode | 4 Accessibility | M | Low–Med | Done |
| 11 | WCAG AA contrast + keyboard/focus audit | 4 Accessibility | M | Med | Done |
| 17 | Screen-reader accessibility (headings, ARIA, citation labels, skip link) | 4 Accessibility | M | Med | Done |
| 12 | Policy Lab mobile layout | 5 Polish | M | Med | Done |
| 13 | Remove dead CSS | 5 Polish | S | Low | Done |
| 14 | Extract data to JSON | 5 Polish | L | Low–Med | Not started |

**Top 3 priorities:** #1 (metadata), #2 (shareable/citable findings, with #15), #6 (methodology + #3 analytics).

---

## Update log — 2026-07-06

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
- **Open — verify, then correct:** NY Fast Food Wage Board "60,000 workers"; the "RAND" job-lock attribution (likely Madrian 1994); "CBO scored $400–700B" for a job guarantee (likely Levy Institute); the Ro Khanna "National Technology and Innovation Dividend Fund" bill name; Biden 2022 Employee Ownership Initiative "$100M SBA"; UCL IGP "£10,000 per person"; Switzerland "federal and cantonal wealth taxes" (Switzerland has no federal wealth tax); France Participation "~8 million workers"; the "six" US state sovereign-wealth-fund count.
- **Open — add research entries to back claims:** hiring-AI adoption ("70% of Fortune 500"); 2021 Child Tax Credit child-poverty −46% (Census SPM / Columbia); NLIHC 7M-unit shortage + Section 8 "1 in 4"; CFPB algorithmic-credit circular + NIST AI RMF; the Stockton SEED evaluation (heavily referenced, not yet in the database); NCEO ESOP participation data; UCL IGP Universal Basic Services report; OECD Pillar Two primary source.
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
