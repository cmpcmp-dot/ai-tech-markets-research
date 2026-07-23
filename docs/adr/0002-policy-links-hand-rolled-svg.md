# Policy Links graph is a hand-rolled SVG force simulation, no external library

**Status:** accepted

The site loads zero external JS libraries today — `tracker-data.js` and `fact-bank-data.js` are the only `<script src>` tags, and even fonts are self-hosted. Adding a force-directed graph could have pulled in D3's force module from a CDN, which is the conventional choice for this kind of layout. We instead hand-rolled a small physics simulation (repulsion between all nodes, spring attraction along `pairsWith` edges, plus a soft per-category gravity pull toward a target height) directly in `index.html`'s existing script block.

Two reasons drove this: (1) the site's deliberate zero-dependency, static-page posture — this is a policy research site sometimes read on locked-down institutional networks, and a broken/blocked CDN would silently kill the Links tab while leaving the rest of the page working; (2) the requirement to keep nodes ordered top-to-bottom by merged category (Economic Security → Global) is a custom force no off-the-shelf force-layout library provides out of the box — we'd have been writing this force code on top of D3 anyway.

We chose **soft gravity** over hard per-category bands: nodes are nudged toward their category's target height but the repel/attract physics can still pull a node slightly out of line, so a `pairsWith` edge that crosses categories (e.g. `automation-levy` ↔ `reskilling-accounts`) reads as a clean line between two nearby nodes rather than punching straight through unrelated ones in a rigid strip.

**Consequence:** if the graph ever needs materially more sophisticated layout behavior (thousands of nodes, edge bundling, drag-to-pin with persistence), this hand-rolled simulation is the first thing that would need to be reconsidered in favor of a library.
