# Research Tracker — Refinement Recommendations

**Product:** AI, Tech and the Economy: Research Intelligence (`research_tracker.html`)
**Assessment date:** 2026-06-14
**Scope:** Full-site review for a more impactful product — content, information architecture, distribution, trust, accessibility, and technical maintainability.
**Status:** Recommendations only. Nothing here is implemented yet.

---

## What's already strong

The three content tabs (Research, Themes, Policy Lab) share one cohesive system: concise syntheses, inline APA citations, the cited/related references pattern, confidence + "points of leverage" framing, the key-findings band, and a consistent signature-blue accent. The confidence / recency / lens model is genuinely sophisticated, and the underlying content is the product's real asset. The opportunities below are mostly about **getting the content in front of people, earning trust quickly, and letting them act on it** — not about the content itself.

---

## Summary (tracking table)

| # | Recommendation | Tier | Effort | Impact | Status |
|---|----------------|------|--------|--------|--------|
| 1 | Social / SEO metadata (OG, Twitter, description, structured data) | 1 Distribution | S | High | Not started |
| 2 | Shareable & citable findings (deep links + copy/cite) | 1 Distribution | M | High | Not started |
| 3 | Privacy-friendly analytics | 1 Distribution | S | Med–High | Not started |
| 4 | Clean URL / custom domain | 1 Distribution | S | Med | Not started |
| 15 | Key-finding cards open a source-excerpt modal (not jump to Themes) | 1–2 | M | High | Not started |
| 16 | Inline citations throughout all theme & policy cards (not just the synthesis) | 1–2 | M–L | Med–High | Not started |
| 5 | Reconsider landing / first-visit orientation | 2 Trust | M | Med–High | Not started |
| 6 | Methodology / expand the About tab | 2 Trust | M | High | Not started |
| 7 | Reframe the AI disclaimer alongside methodology | 2 Trust | S | Med | Not started |
| 8 | Clarify the General / Focused lens value | 2 Trust | S | Med | Not started |
| 9 | Subscribe / follow + changelog | 3 Engagement | M | Med | Not started |
| 10 | Dark mode | 4 Accessibility | M | Low–Med | Not started |
| 11 | WCAG AA contrast + keyboard/focus audit | 4 Accessibility | M | Med | Not started |
| 12 | Policy Lab mobile layout | 5 Polish | M | Med | Not started |
| 13 | Remove dead CSS | 5 Polish | S | Low | Not started |
| 14 | Extract data to JSON | 5 Polish | L | Low–Med | Not started |

**Top 3 priorities:** #1 (metadata), #2 (shareable/citable findings, with #15), #6 (methodology + #3 analytics).

---

## Tier 1 — Distribution & reach

The biggest gap. The content is strong but currently hard to spread or cite.

### 1. Social / SEO metadata is missing
No Open Graph tags, no Twitter card, no meta description, no structured data. Pasting the link into Slack, LinkedIn, or X shows a bare URL with no title, blurb, or image. For a tool meant to influence a conversation, this alone caps reach. Add OG/Twitter cards + a meta description (+ optional JSON-LD). Small effort, large payoff.

### 2. Nothing is individually shareable or citable
The URL never changes — you can't send someone "this specific finding/theme/policy." Add per-item deep links (URL hash for the open theme/policy/paper), copy-to-clipboard on findings, and a "cite this" action (APA / BibTeX). For a research audience, citability is table stakes and currently absent.

### 3. No analytics
There's no way to see what resonates — which findings get clicked, which themes get read, where people drop. A privacy-friendly tracker (e.g., Plausible) creates the feedback loop that makes future refinements evidence-based.

### 4. The URL reads like a file, not a product
Currently `…github.io/ai-tech-markets-research/research_tracker.html`. A clean root (`index.html`, ideally a custom domain) makes it feel and share like a destination.

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
*(Added 2026-06-14; extends #2 and #15.)*

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
A first-time visitor meets 219 cards before the argument. The key-findings band helps, but the *synthesis* (Themes) is the more persuasive entry. Consider orienting newcomers — lead with the themes/findings, or add a brief "start here."

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

## Tier 5 — Polish & maintainability

### 12. The Policy Lab matrix doesn't fit phones
Its 5-phase layout is ~758px wide, so on a 375px screen it overflows. It needs a dedicated mobile layout (e.g., stack by category, phase as a sub-label).

### 13. Dead CSS has accumulated
Leftovers include `theme-research-sidebar`, `theme-risk-badge`, `pol-basis-chip`, and orphaned confidence classes. A cleanup pass would help maintainability.

### 14. All data is inline in a ~716KB HTML file
Fine today, but extracting the data to JSON would make it far easier to maintain, reuse, or eventually feed an API/newsletter.
