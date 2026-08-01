#!/usr/bin/env python3
"""
sync_jobs_displacement.py — regenerate the Job Displacement tab in
index.html from jobs_displacement.html.

Why this exists
----------------
jobs_displacement.html is a full, standalone, previewable HTML page (open
it directly in a browser to see your edits). index.html embeds the *same*
content inside its own single-page-app shell, in the tab reached via the
"Job displacement" nav button. Rather than hand-copying content into
index.html every time jobs_displacement.html changes, this script does it
for you.

It edits ONLY the text strictly between three marker-comment pairs already
present in index.html:

  1. CSS:  /* SYNC:CSS:BEGIN */  ...  /* SYNC:CSS:END */   (inside <style>)
  2. HTML: <!-- SYNC:HTML:BEGIN -->  ...  <!-- SYNC:HTML:END -->
           (inside <div id="jobDisplacementArea">)
  3. JS:   /* SYNC:JS:BEGIN */  ...  /* SYNC:JS:END */
           (inside a <script> tag, right after <script src="assets/jobs-charts.js">)

Everything else in index.html — the real site header/nav, the app engine,
the other tabs — is left untouched.

Usage
-----
    python3 sync_jobs_displacement.py            # write the sync
    python3 sync_jobs_displacement.py --check    # verify only, never write

--check exits 1 if running the sync would change index.html. Use it in a
pre-commit hook or CI so a hand-edit made between the markers is caught
before the next sync silently destroys it:

    python3 sync_jobs_displacement.py --check || {
      echo "index.html is out of sync with jobs_displacement.html"; exit 1; }

It also exits 1 on the .jd-* ownership error described below, so a single
--check run covers both failure modes.

Everything in the CSS block is scoped
--------------------------------------
Every selector ported into index.html is prefixed with #jobDisplacementArea,
and the source file's `:root` becomes a scoped custom-property block on that
same element. Without this, the ported sheet would redefine site-wide tokens
(--surface, --border, --text, --serif, ...) and claim very general class
names (.wrap, .sec, .rail, .prose, .figure, .meta, .verdict) in the global
stylesheet, so a color tweak meant for one tab could restyle the whole site.

Two consequences worth knowing:

  - Scoping adds an ID to every selector, so these rules now outrank
    plain-class rules elsewhere in index.html. Nothing outside the jobs area
    can match them, so this only matters within the tab.
  - `html`/`body` selectors cannot be scoped meaningfully (#jobDisplacementArea
    body matches nothing). They are all in CHROME_SELECTORS and dropped; if a
    new one appears, the script warns rather than emitting a dead rule.

What gets stripped on the way in
---------------------------------
1. Preview chrome. jobs_displacement.html carries a fake header/nav so the
   file looks right when opened on its own. index.html has its OWN real
   header using the same class names, so those rules are dropped. See
   CHROME_SELECTORS for the exact list. @font-face is dropped too —
   index.html already loads the fonts.

2. The shared .jd-* family. These belong to index.html (see the "SHARED
   CHART CHROME" block in its <style>), because the Adoption tab renders
   into the same vocabulary and both assets/jobs-charts.js and
   assets/adoption-charts.js attach a .jd-tooltip straight to <body> —
   outside #jobDisplacementArea, where a scoped rule could never reach it.
   The copy in jobs_displacement.html exists only so the standalone preview
   looks right.

   Because that means the two files can drift on shared chrome, the script
   FAILS if jobs_displacement.html uses a .jd-* selector that index.html
   does not define. Adding a new shared component is then a deliberate,
   two-file act rather than a silent one.

3. Every <script src>. index.html loads its data files in its own order,
   alongside the other tabs' payloads, so these are not ported. For the
   same reason as the .jd-* family, the script FAILS if jobs_displacement
   .html loads a script index.html does not — otherwise a section whose
   payload is missing renders as an empty frame and one console warning.

The <main>...</main> inner content (masthead, short version, the
sections) is ported as-is.

The page's own inline <script> is ported with two changes:
  - The scroll-spy's `history.replaceState(..., '#' + cur)` call is
    disabled. index.html already owns location.hash for its own tab router
    (see applyHashRoute in the main engine script) and the two would
    otherwise fight over the address bar on every scroll.
  - A small addendum is appended so the first section's charts still draw
    immediately the moment the tab becomes visible, even though the tab
    (and everything in it) sits inside `display:none` until then — a
    plain IntersectionObserver can miss that transition.

Safe to re-run any number of times; the output is idempotent.
"""

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_FILE = ROOT / "jobs_displacement.html"
DEST_FILE = ROOT / "index.html"

CSS_BEGIN = "/* ══ SYNC:CSS:BEGIN ══ */"
CSS_END = "/* ══ SYNC:CSS:END ══ */"
HTML_BEGIN = "<!-- SYNC:HTML:BEGIN -->"
HTML_END = "<!-- SYNC:HTML:END -->"
JS_BEGIN = "/* SYNC:JS:BEGIN */"
JS_END = "/* SYNC:JS:END */"

# Every ported selector is prefixed with this, and the source :root is
# rewritten onto it. See the module docstring.
SCOPE = "#jobDisplacementArea"

# Selectors from jobs_displacement.html's <style> that belong to its
# standalone-preview header/nav/reset/footer, not to the content. index.html
# already defines all of these for its real header — porting them over
# would silently override the real nav's styling.
CHROME_SELECTORS = {
    "*", "html", "body", "a", ":focus-visible", "main", "footer", "footer a",
    ".site-header", ".header-inner", ".header-brand", ".header-brand img",
    ".site-header h1", ".site-header h1 a", ".site-header h1 a:hover",
    ".header-sub", ".header-nav", ".header-nav-btn", ".header-nav-btn:hover",
    ".header-nav-btn.active",
}

# Selectors that must never be prefixed with SCOPE: they are not element
# selectors at all. @keyframes step selectors ('from', 'to', '43%') look like
# type selectors to a naive prefixer, and scoping them silently kills the
# animation.
KEYFRAME_STEPS = re.compile(r"^(?:from|to|\d+(?:\.\d+)?%)$")

# At-rules whose body is a nested list of ordinary rules to be filtered and
# scoped recursively (as opposed to @keyframes, whose body must be left alone).
NESTED_AT_RULES = ("@media", "@supports", "@container", "@layer")


def die(msg):
    print(f"sync_jobs_displacement.py: error: {msg}", file=sys.stderr)
    sys.exit(1)


def extract_between(text, start_marker, end_marker, label):
    i = text.find(start_marker)
    if i == -1:
        die(f"could not find {label} start marker {start_marker!r} in source")
    j = text.find(end_marker, i)
    if j == -1:
        die(f"could not find {label} end marker in source")
    return text[i:j], i, j


def strip_comments(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def split_blocks(text):
    """Split CSS text into a list of top-level '<selector-and-comments> {..}'
    chunks, by brace-depth counting. Assumes no braces occur inside string
    literals/comments, true of this stylesheet."""
    blocks = []
    depth = 0
    start = 0
    for i, ch in enumerate(text):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                blocks.append(text[start : i + 1])
                start = i + 1
    tail = text[start:]
    return blocks, tail


def selector_of(block):
    return strip_comments(block.split("{", 1)[0]).strip()


def selector_parts(selector_text):
    return [p.strip() for p in selector_text.split(",") if p.strip()]


def is_excluded(selector_text):
    parts = selector_parts(selector_text)
    return bool(parts) and all(p in CHROME_SELECTORS for p in parts)


def is_jd(selector_text):
    """True for rules in the shared .jd-* family, which index.html owns."""
    parts = selector_parts(selector_text)
    return bool(parts) and all(p.startswith(".jd-") for p in parts)


def scope_selector(selector_text, warnings):
    """Prefix every comma-separated part of a selector with SCOPE."""
    out = []
    for part in selector_parts(selector_text):
        if KEYFRAME_STEPS.match(part):
            out.append(part)
        elif part in ("html", "body") or re.match(r"^(?:html|body)\b", part):
            # #jobDisplacementArea body matches nothing. Anything reaching
            # here escaped CHROME_SELECTORS and needs a human decision.
            warnings.append(
                f"dropped un-scopable selector {part!r} — it targets html/body, which "
                f"cannot live under {SCOPE}. Add it to CHROME_SELECTORS if index.html "
                f"already handles it, or hand-write an equivalent in index.html."
            )
        else:
            out.append(f"{SCOPE} {part}")
    return ", ".join(out)


def scope_block(block, warnings):
    """Rewrite one '<selector> { ... }' chunk so its selector is scoped.
    Comments preceding the selector are preserved."""
    brace = block.index("{")
    head, body = block[:brace], block[brace:]

    # Keep any leading comments/whitespace attached to the rule.
    raw_sel = head
    lead = ""
    while True:
        m = re.match(r"\s*/\*.*?\*/\s*", raw_sel, flags=re.S)
        if not m:
            break
        lead += m.group(0)
        raw_sel = raw_sel[m.end() :]

    scoped = scope_selector(raw_sel.strip(), warnings)
    if not scoped:
        return ""  # every part was dropped
    return f"{lead}{scoped} {body}"


def filter_css(css_text, jd_selectors, warnings):
    """Drop preview chrome, @font-face and the shared .jd-* family; scope
    everything that survives to SCOPE. jd_selectors is populated with the
    .jd-* selectors seen, for the ownership check in check_jd_ownership()."""
    blocks, tail = split_blocks(css_text)
    kept = []
    for b in blocks:
        sel = selector_of(b)

        if sel.startswith("@font-face"):
            continue

        if sel.startswith("@keyframes"):
            # Body is from/to/% steps — filter nothing, scope nothing. The
            # animation name is global, which is fine: these names
            # (drawline, growbar, pop) are unique in index.html.
            kept.append(b)
            continue

        if sel.startswith(NESTED_AT_RULES):
            brace = b.index("{")
            prefix = b[: brace + 1]
            body = b[brace + 1 : -1]
            inner = filter_css(body, jd_selectors, warnings)
            if inner.strip():
                kept.append(prefix + inner + "}")
            continue

        if is_excluded(sel):
            continue

        if is_jd(sel):
            jd_selectors.add(sel)
            continue

        if sel == ":root":
            # Becomes a scoped custom-property block: the tab's tokens
            # (--col, --measure, --rail-w, --terra) stay
            # inside the tab, and its restatements of site tokens
            # (--surface, --text, --serif, ...) no longer shadow the real
            # ones for the rest of the page.
            brace = b.index("{")
            kept.append(f"{SCOPE} {b[brace:]}")
            continue

        scoped = scope_block(b, warnings)
        if scoped:
            kept.append(scoped)

    return "".join(kept) + tail


def check_jd_ownership(jd_selectors, dest_text):
    """Every .jd-* class jobs_displacement.html styles must also be defined by
    index.html outside the sync markers, since index.html owns that family and
    the synced copy is dropped. Anything missing would render unstyled."""
    i = dest_text.find(CSS_BEGIN)
    j = dest_text.find(CSS_END)
    owned_area = dest_text if i == -1 or j == -1 else dest_text[:i] + dest_text[j:]

    wanted = set()
    for sel in jd_selectors:
        wanted |= set(re.findall(r"\.(jd-[\w-]+)", sel))

    defined = set(re.findall(r"\.(jd-[\w-]+)", owned_area))
    missing = sorted(wanted - defined)
    if missing:
        die(
            "jobs_displacement.html styles .jd-* classes that index.html does not "
            "define:\n"
            + "".join(f"    .{m}\n" for m in missing)
            + "  index.html owns the shared .jd-* family (both the Job Displacement\n"
            "  and Adoption tabs use it, and .jd-tooltip is attached to <body>), so\n"
            "  the copy in jobs_displacement.html is dropped during sync. Copy these\n"
            "  rules by hand into the 'SHARED CHART CHROME' block in index.html's\n"
            "  <style>, then re-run."
        )


def check_script_srcs(src_text, dest_text):
    """Every <script src> jobs_displacement.html loads must also be loaded by
    index.html.

    Only three things are synced: the <style>, the <main> content and the last
    inline <script>. External scripts are deliberately NOT synced, because
    index.html loads its data files in its own order alongside seven other
    tabs' payloads. But nothing used to check the two lists agreed, and the
    failure is quiet: a section whose payload never loads renders as an empty
    chart frame and one console warning. Adding a data file is a two-file act,
    the same way adding a shared .jd-* component is."""
    tags = re.compile(r"<script[^>]*\bsrc=\"([^\"]+)\"")
    wanted = [s for s in dict.fromkeys(tags.findall(src_text))]
    have = set(tags.findall(dest_text))
    missing = [s for s in wanted if s not in have]
    if missing:
        die(
            "jobs_displacement.html loads scripts that index.html does not:\n"
            + "".join(f"    {m}\n" for m in missing)
            + "  <script src> tags are not synced: index.html loads its data files in\n"
            "  its own order, alongside the other tabs' payloads. Add these by hand to\n"
            "  the data-loading block near the top of index.html's <body>, before\n"
            "  assets/jobs-charts.js, then re-run."
        )


def patch_js(js_text):
    warnings = []

    pattern = re.compile(
        r"try\s*\{\s*history\.replaceState\(null,\s*''\s*,\s*'#'\s*\+\s*cur\)\s*;\s*\}\s*catch\s*\(_\)\s*\{\s*\}"
    )
    new_text, n = pattern.subn(
        "/* disabled by sync_jobs_displacement.py: index.html owns location.hash "
        "via its own tab router (applyHashRoute in the main engine script); "
        "writing '#' + cur here would fight it on every scroll. */",
        js_text,
    )
    if n == 0:
        warnings.append(
            "could not find the history.replaceState(...) line in the source script "
            "to disable it — check by hand whether the ported script writes to "
            "location.hash in a way that conflicts with index.html's tab router."
        )
    js_text = new_text

    addendum = """

  /* ─ index.html integration patch, added by sync_jobs_displacement.py ─
     #jobDisplacementArea sits under `display:none` until the Jobs tab is
     selected (.jobs-view on <body>). A plain IntersectionObserver can miss
     that display:none -> block transition, so the first section's charts
     might never draw if the user never nudges the scroll position. Force
     one draw pass for whichever section is first in the DOM the moment the
     tab becomes visible; the existing IntersectionObserver above takes over
     for every section reached after that by ordinary scrolling. */
  (function () {
    var body = document.body;
    var firstSec = document.querySelector('#jobDisplacementArea .sec');
    if (!firstSec) return;
    function reveal() {
      if (!body.classList.contains('jobs-view')) return;
      drawFor(firstSec.id);
      firstSec.classList.add('in');
    }
    reveal();
    new MutationObserver(reveal).observe(body, { attributes: true, attributeFilter: ['class'] });
  })();
"""
    js_text = js_text + addendum
    return js_text, warnings


def build(src, dest):
    """Return (new_dest_text, warnings). Pure — writes nothing."""
    warnings = []

    style_content, _, _ = extract_between(src, "<style>", "</style>", "source <style>")
    style_content = style_content[len("<style>") :]

    main_content, _, _ = extract_between(src, "<main>", "</main>", "source <main>")
    main_content = main_content[len("<main>") :]

    script_blocks = re.findall(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", src, flags=re.S)
    if not script_blocks:
        die("could not find an inline (non-src) <script> block in source")
    inline_js = script_blocks[-1]

    jd_selectors = set()
    filtered_css = filter_css(style_content, jd_selectors, warnings)
    check_jd_ownership(jd_selectors, dest)
    check_script_srcs(src, dest)

    patched_js, js_warnings = patch_js(inline_js)
    warnings += js_warnings

    replacements = [
        (CSS_BEGIN, CSS_END, "\n" + filtered_css.strip("\n") + "\n  "),
        (HTML_BEGIN, HTML_END, "\n" + main_content.strip("\n") + "\n        "),
        (JS_BEGIN, JS_END, "\n" + patched_js.strip("\n") + "\n"),
    ]

    for begin, end, replacement in replacements:
        i = dest.find(begin)
        if i == -1:
            die(f"could not find marker {begin!r} in index.html")
        j = dest.find(end, i)
        if j == -1:
            die(f"could not find marker {end!r} in index.html")
        dest = dest[: i + len(begin)] + replacement + dest[j:]

    return dest, warnings


def main():
    ap = argparse.ArgumentParser(
        description="Regenerate the Job Displacement tab in index.html from "
        "jobs_displacement.html."
    )
    ap.add_argument(
        "--check",
        action="store_true",
        help="verify only: exit 1 if index.html is out of sync, and never write. "
        "Intended for a pre-commit hook or CI.",
    )
    args = ap.parse_args()

    if not SRC_FILE.exists():
        die(f"{SRC_FILE} not found")
    if not DEST_FILE.exists():
        die(f"{DEST_FILE} not found")

    src = SRC_FILE.read_text(encoding="utf-8")
    dest = DEST_FILE.read_text(encoding="utf-8")

    new_dest, warnings = build(src, dest)

    if args.check:
        for w in warnings:
            print(f"  WARNING: {w}")
        if new_dest != dest:
            print(
                f"sync_jobs_displacement.py: {DEST_FILE.name} is OUT OF SYNC with "
                f"{SRC_FILE.name}.\n"
                "  Either the source changed, or the block between the SYNC markers in "
                "index.html\n"
                "  was hand-edited (those edits will be lost). Run "
                "`python3 sync_jobs_displacement.py` to regenerate.",
                file=sys.stderr,
            )
            sys.exit(1)
        print(f"{DEST_FILE.name} is in sync with {SRC_FILE.name}")
        return

    if new_dest == dest:
        print(f"{DEST_FILE.name} already in sync with {SRC_FILE.name} — nothing to do")
    else:
        DEST_FILE.write_text(new_dest, encoding="utf-8")
        print(f"Synced {SRC_FILE.name} -> {DEST_FILE.name}")

    for w in warnings:
        print(f"  WARNING: {w}")


if __name__ == "__main__":
    main()
