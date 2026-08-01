/* ═══════════════════════════════════════════════════════════════════════════
   dom.js — load a built page into jsdom with its scripts actually running.

   The site is a classic multi-<script> document with no modules and no build
   step at run time, so the honest way to test it is to execute it the way a
   browser does. jsdom's own resource loader is off; instead every local
   <script src> is inlined in place before parsing, which gets execution order
   exactly right and avoids the network entirely.

   Requires jsdom:  npm install jsdom
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* Serve dynamically injected <script src> from disk.

   Static script tags are inlined below before parsing, but the lazy payloads
   in src/js/05-lazy.js are appended at runtime, and jsdom will not fetch them
   without a loader. Without this the lazy path is untestable, which is exactly
   the path most likely to break. Everything resolves against the repo root and
   nothing touches the network.

   jsdom 30 replaced the old ResourceLoader class with requestInterceptor. */
function diskInterceptor() {
  const { requestInterceptor } = require('jsdom');
  return requestInterceptor(request => {
    const rel = decodeURIComponent(new URL(request.url).pathname).replace(/^\//, '');
    const p = path.resolve(ROOT, rel);
    if (!p.startsWith(ROOT + path.sep) || !fs.existsSync(p)) {
      return new Response('not on disk: ' + rel, { status: 404 });
    }
    const type = p.endsWith('.js') ? 'text/javascript'
               : p.endsWith('.css') ? 'text/css' : 'application/octet-stream';
    return new Response(fs.readFileSync(p), { status: 200, headers: { 'content-type': type } });
  });
}

function load(page, hash) {
  const { JSDOM, VirtualConsole } = require('jsdom');
  let html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const missing = [];

  // Inline local <script src>. A literal `</script` inside the code would
  // close the tag early, so escape it; this is inside JS, where the backslash
  // is a no-op in both string and comment context.
  html = html.replace(/<script([^>]*?)\bsrc="([^"]+)"([^>]*)><\/script>/g, (m, a, src) => {
    if (/^https?:|^\/\//.test(src)) return m;          // remote: leave it, never fetch
    const p = path.join(ROOT, src);
    if (!fs.existsSync(p)) { missing.push(src); return m; }
    return '<script>' + fs.readFileSync(p, 'utf8').replace(/<\/script/gi, '<\\/script') + '</script>';
  });

  const errors = [], warns = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('jsdomError: ' + ((e && e.message) || e)));
  vc.on('error', (...a) => errors.push('console.error: ' + a.map(String).join(' ')));
  vc.on('warn', (...a) => warns.push(a.map(String).join(' ')));

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: { interceptors: [diskInterceptor()] },
    url: 'https://example.org/' + (hash || ''),
    virtualConsole: vc,
    beforeParse(w) {
      // Browser APIs jsdom does not implement. Each is a no-op rather than a
      // fake: the tests assert on state the page sets, not on scrolling.
      w.matchMedia = () => ({ matches: false, media: '', addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} });
      w.requestAnimationFrame = cb => setTimeout(cb, 0);
      w.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} takeRecords(){ return []; } };
      w.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
      w.scrollTo = () => {};
      w.Element.prototype.scrollIntoView = function () {};
    },
  });

  const w = dom.window, d = w.document;
  d.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true }));
  w.dispatchEvent(new w.Event('load'));
  return { dom, w, d, errors, warns, missing };
}

/* Let queued microtasks and the disk loader settle. Needed after anything that
   triggers a lazy payload, since loadPayload resolves a promise and only then
   builds. 3 turns of setTimeout(0) is enough for load -> then -> render. */
function settle(times = 3) {
  let p = Promise.resolve();
  for (let i = 0; i < times; i++) p = p.then(() => new Promise(r => setTimeout(r, 0)));
  return p;
}

module.exports = { load, settle, ROOT };
