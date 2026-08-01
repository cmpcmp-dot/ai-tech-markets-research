  /* ── lazy payload loading ────────────────────────────────────────────────
     index.html used to load all eight data/*.js payloads on every page view,
     2.33 MB, whatever the reader opened. Inside the WordPress iframe that is
     the first thing they wait on, and most of it is for views they never
     touch. Two of the largest are now fetched on first use instead.

     Script injection, not fetch(). fetch() is blocked on file://, and the
     preview and offline rebuilds both rely on file:// working. A dynamically
     appended <script src> has no such restriction and needs no CORS.

       loadPayload(src) -> Promise, resolved once that file has executed.
       Repeat calls for the same src share one promise and one <script>.

     WHAT IS STILL EAGER, AND WHY. data/tracker-data.js is the research
     database: the router reads RESEARCH_DATA to resolve #entry/<id>, and the
     cards view is one click from the default. The jobs, BTOS and JOLTS
     payloads are read by three chart engines that initialise on
     DOMContentLoaded and draw into fixed-viewBox SVGs while their panels are
     still hidden, which is exactly what makes tab switching instant. Deferring
     those means restructuring all three engines' init, which is a larger and
     riskier change than the bytes justify. Deferred here are the two payloads
     whose consumers already had a single, late entry point:

       fact-bank-data.js   880 KB   built on first open of the Fact Bank view
       us-albers-data.js   107 KB   built on first open of the BTOS Where panel

     That is 987 KB, 42% of the total, off the critical path. */
  const _payloads = {};
  function loadPayload(src) {
    if (_payloads[src]) return _payloads[src];
    _payloads[src] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.charset = 'utf-8';
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error('failed to load ' + src));
      document.head.appendChild(s);
    });
    return _payloads[src];
  }

