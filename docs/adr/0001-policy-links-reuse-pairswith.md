# Policy Links graph reuses existing `pairsWith` data, not a new curated layer

**Status:** accepted

The Policy Map's new "Links" view needed a source of policy-to-policy amplification edges. `POLICY_DATA` (in `data/tracker-data.js`) already carries a `pairsWith: [{id, why}]` field on ~20 of 27 policies, previously surfaced only as text cross-links inside the policy detail modal. Rather than hand-author a new, separate edge set grounded in `becky_brief.md`'s theory of the case (worker power, antimonopoly, redistribution reinforcing each other), we reuse `pairsWith` as-is for this first physical spike, deriving the graph's edge list from it at render time. No new data file was created.

This means the Links view currently shows *topical/administrative* relationships ("both cushion lost earnings"), not a deliberately curated *political-economy* argument about which levers amplify each other. That re-curation is deferred, on purpose, to keep this pass focused on proving out the visualization mechanic rather than authoring content. `competesWith` also exists on several policies but is not rendered in this pass.

**Consequence:** a future pass to align the graph with ESP's theory of the case should either (a) rewrite/extend `pairsWith` in place, which will also change the existing modal cross-links, or (b) introduce a separate curated edge set specific to the graph view. That choice was deliberately left open.
