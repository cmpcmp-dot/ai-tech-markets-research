#!/usr/bin/env python3
"""
extract_phase1.py -- one-off: split index.html into src/ build inputs.

This is the record of exactly how the monolith was cut. It is idempotent only
against an unsplit index.html, so it is meant to be run once and then kept for
reviewability, not re-run. build.py is the permanent tool.

The split is a strict PARTITION of index.html by line range:

  * every extracted block is a contiguous range of original lines
  * ranges never overlap and are listed in ascending order
  * nothing is reordered, reindented, reformatted or reworded
  * every line not covered by the manifest stays in src/index.template.html

Because of that, concatenating the template with its includes reproduces the
original file byte for byte. That is the whole safety property of phase 1, and
build.py --check is what keeps proving it afterwards.

Line numbers below refer to the pre-split index.html frozen at
tests/golden/index.html (6341 lines). Boundaries were taken from the section
banner comments already in the file, so each block starts where the original
author already drew a line.

Usage:
    python3 tools/extract_phase1.py --dry-run     report the partition only
    python3 tools/extract_phase1.py               write src/ and the template
"""

import argparse
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
TEMPLATE = ROOT / "src" / "index.template.html"

# (first_line, last_line, destination) -- inclusive, 1-based, ascending.
MANIFEST = [
    # ── head metadata ──────────────────────────────────────────────────────
    #  1-3   <!DOCTYPE html> / <html> / <head>        stay in the template
    (4, 33, "src/head.html"),

    # ── styles ─────────────────────────────────────────────────────────────
    #  34    <style>                                  stays in the template
    (35, 230, "src/styles/tokens.css"),        # @font-face, :root, type scale,
                                               # masthead frame, chevron
    (231, 407, "src/styles/shell.css"),        # header band, shared tab opener
    (408, 1199, "src/styles/cards.css"),       # app layout, research sub-tabs,
                                               # key findings, sidebar, filters,
                                               # card grid, themes, cite/export,
                                               # pills, footer, mobile toggles
    (1200, 1395, "src/styles/modals.css"),     # sources modal, policy pop-out
    (1396, 2091, "src/styles/policy.css"),     # policy map, matrix, columns,
                                               # category rows, links toggle
    (2092, 2102, "src/styles/focus.css"),      # :focus-visible, global
    (2103, 2198, "src/styles/charts.css"),     # shared .jd-* chart chrome
    (2199, 2396, "src/styles/jobs.css"),       # incl. SYNC:CSS:BEGIN..END
    (2397, 2566, "src/styles/adoption.css"),   # adoption extras + the chain
    #  2567-2572  </style> </head> <body> skip-link  stay in the template

    # ── body markup ────────────────────────────────────────────────────────
    (2573, 2601, "src/views/00-data-scripts.html"),  # the data/*.js <script> tags
    (2602, 2643, "src/views/10-header.html"),        # site header nav + aria-live
    (2644, 2688, "src/views/20-shell.html"),         # <main>, sidebar, tab desc,
                                                     # #viewPanel, subview toggle
    #  2689-2691  <div class="cards-area"> + #policyArea   stay in the template
    (2692, 2756, "src/views/30-fact-bank.html"),
    (2757, 2768, "src/views/40-solutions.html"),
    (2769, 2802, "src/views/50-about.html"),
    (2803, 3073, "src/views/60-adoption.html"),      # becomes the Data Tracker
    (3074, 3472, "src/views/70-jobs.html"),          # incl. SYNC:HTML:BEGIN..END
    (3473, 3487, "src/views/80-papers.html"),        # changelog, grid, empty state
    #  3488-3501  close main-content/main, <footer>  stay in the template
    (3502, 3591, "src/views/90-modals.html"),        # about, policy, finding, sources

    # ── app engine ─────────────────────────────────────────────────────────
    #  3592-3596  ENGINE banner, <script>, "(function () {"  stay in the template
    (3597, 4066, "src/js/00-state.js"),          # data wiring, helpers, state
    (4067, 4169, "src/js/10-policy-map.js"),
    (4170, 4862, "src/js/20-cite-export.js"),    # export, citation, deep-link helpers
    (4863, 4924, "src/js/30-changelog.js"),
    (4925, 4935, "src/js/40-router.js"),         # deep-link routing (see note below)
    (4936, 5088, "src/js/50-adoption-chain.js"),
    (5089, 5122, "src/js/60-whats-new.js"),
    (5123, 5639, "src/js/70-render.js"),         # also holds VIEW_TAB_IDS + setView
    (5640, 6037, "src/js/80-fact-bank.js"),
    #  6038-6056  "})();" </script> JD banner, jobs-charts.js, <script>
    (6057, 6325, "src/js/90-jobs-inline.js"),    # incl. SYNC:JS:BEGIN..END
    #  6326-6341  </script>, adoption-charts.js, </body></html>
]

# NOTE ON 40-router.js: the router is currently only 11 lines here, because the
# rest of it is scattered -- VIEW_TAB_IDS and setView() live inside 70-render.js
# and the six per-view click listeners follow them, while the .ad-link sub-tab
# system lives in 50-adoption-chain.js. Phase 1 deliberately does NOT gather
# them, because gathering means reordering and reordering forfeits byte-identity.
# Consolidating the router is phase 3, and this file is where it lands.

INCLUDE_FMT = "@@include {}@@\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="report the partition without writing anything")
    args = ap.parse_args()

    with open(SRC, "r", encoding="utf-8", newline="") as fh:
        lines = fh.readlines()
    n = len(lines)

    # ── validate the manifest before touching the disk ────────────────────
    prev_end = 0
    for first, last, dest in MANIFEST:
        if first > last:
            sys.exit(f"inverted range: {dest} ({first}-{last})")
        if first <= prev_end:
            sys.exit(f"overlap or misordering at {dest}: {first} <= {prev_end}")
        if last > n:
            sys.exit(f"{dest} ends at {last}, past EOF ({n})")
        prev_end = last

    covered = sum(last - first + 1 for first, last, _ in MANIFEST)
    print(f"index.html: {n} lines")
    print(f"extracted:  {covered} lines into {len(MANIFEST)} files")
    print(f"template:   {n - covered} lines of structural glue\n")

    for first, last, dest in MANIFEST:
        print(f"  {first:5d}-{last:<5d} {last - first + 1:5d}  {dest}")

    if args.dry_run:
        return 0

    # ── write the extracted blocks ────────────────────────────────────────
    for first, last, dest in MANIFEST:
        out = ROOT / dest
        out.parent.mkdir(parents=True, exist_ok=True)
        with open(out, "w", encoding="utf-8", newline="") as fh:
            fh.writelines(lines[first - 1:last])

    # ── write the template: glue verbatim, one directive per block ─────────
    # The directive inherits the indentation of the block's first line so the
    # template reads the way the original file did.
    tmpl, cursor = [], 1
    for first, last, dest in MANIFEST:
        tmpl.extend(lines[cursor - 1:first - 1])
        indent = lines[first - 1][:len(lines[first - 1]) - len(lines[first - 1].lstrip())]
        tmpl.append(indent.replace("\n", "") + INCLUDE_FMT.format(dest))
        cursor = last + 1
    tmpl.extend(lines[cursor - 1:])

    TEMPLATE.parent.mkdir(parents=True, exist_ok=True)
    with open(TEMPLATE, "w", encoding="utf-8", newline="") as fh:
        fh.writelines(tmpl)

    print(f"\nwrote {TEMPLATE.relative_to(ROOT)} ({len(tmpl)} lines)")
    print("now run: python3 build.py --check")
    return 0


if __name__ == "__main__":
    sys.exit(main())
