  /* ── ROUTER ──────────────────────────────────────────────────────────────
     One place that knows how location.hash and app state map onto each other.
     Everything here used to live in what is now 50-tracker-tabs.js, which owned
     it only because the BTOS chain was the first thing that needed deep links.

     Routes
       #about #research #changelog #fact-bank #policy #solutions
       #job-displacement                       ... the flat views, in VIEWS below
       #tracker #tracker/<tab> #tracker/btos/<chain-link>
       #policy/<policy-id> #entry/<entry-id>   ... parameterised
       #themes #theme/<id>                     ... retired, hand off to themes.html
     Legacy: #adoption and #adoption/<chain-link> resolve to the Data Tracker's
     Census BTOS sub-tab, which is what the Adoption tab became. They are kept
     because the page is embedded and those links are already in the wild.

     The address bar tracks navigation with replaceState (no history spam);
     hashchange handles pasted links and back/forward.

     Ordering note: this file runs before the tab groups and the render layer
     are defined, and refers to both. That is safe because everything here is a
     hoisted function declaration and nothing runs until init calls it, by
     which point the whole IIFE has evaluated. Keep them function declarations,
     not const arrows, or they will land in the temporal dead zone. */
  let routeApplying = false;
  let viewInitialized = false;   // set on the first setView

  /* Flat views: a route with no segments that maps to one view, plus optional
     setup and a guard. Adding a plain view is a row here and nothing else,
     which is the property the old if-ladder did not have.
       view   the setView key
       enter  extra state to apply before the view switches
       guard  false means the route does not match (falls through to default) */
  const VIEWS = {
    about:              { view: 'about' },
    research:           { view: 'cards',     enter: () => setResearchSubview('database') },
    changelog:          { view: 'cards',     enter: () => setResearchSubview('changelog') },
    'fact-bank':        { view: 'fact-bank', guard: () => factBankEnabled },
    policy:             { view: 'policy' },
    solutions:          { view: 'solutions' },
    'job-displacement': { view: 'jobs' },
  };
  // Reverse map, for currentRoute(). First key wins, so `research` beats
  // `changelog` as the generic name for the cards view; the sub-view is
  // resolved explicitly below.
  const ROUTE_FOR_VIEW = {};
  for (const [route, cfg] of Object.entries(VIEWS)) {
    if (!(cfg.view in ROUTE_FOR_VIEW)) ROUTE_FOR_VIEW[cfg.view] = route;
  }

  // Write the address-bar hash without triggering hashchange.
  function setHash(route) {
    if (routeApplying) return;
    const target = '#' + route;
    if (location.hash === target) return;
    history.replaceState(null, '', target);
  }

  // The canonical route for the current view state (modal-free).
  function currentRoute() {
    if (activeView === 'cards') return researchSubview === 'changelog' ? 'changelog' : 'research';
    if (activeView === 'tracker') {
      const tab = trackerTabs.get();
      if (tab !== 'btos') return 'tracker/' + tab;
      // Inside Census BTOS the chain link is a third segment; link 1 is bare.
      const link = adChain.get();
      return link === adChain.ids[0] ? 'tracker/btos' : 'tracker/btos/' + link;
    }
    return ROUTE_FOR_VIEW[activeView] || 'about';
  }

  // Apply location.hash to the app. Returns true if it matched a route.
  function applyHashRoute() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!h) return false;
    routeApplying = true;
    try {
      const [head, tail, tail2] = h.split('/');

      // ── flat views ────────────────────────────────────────────────────
      if (!tail && VIEWS[head]) {
        const cfg = VIEWS[head];
        if (cfg.guard && !cfg.guard()) return false;
        if (cfg.enter) cfg.enter();
        setView(cfg.view);
        return true;
      }

      // ── Data Tracker: #tracker/<tab>, and /<link> inside the BTOS tab ──
      if (head === 'tracker') {
        // An unknown sub-tab still belongs in the tracker. Falling through to
        // the default view would drop a reader who mistyped one segment onto
        // About, which reads as a broken link rather than a stale one.
        trackerTabs.set(trackerTabs.has(tail) ? tail : TRACKER_DEFAULT, { silent: true });
        if (!tail || !trackerTabs.has(tail)) {
          setView('tracker');
          // A typo'd segment should not stay in the address bar once it has
          // been resolved. setHash is inert while routeApplying, so write it
          // directly; currentRoute() is now the canonical default.
          if (tail) history.replaceState(null, '', '#' + currentRoute());
          return true;
        }
        if (tail === 'btos') setAdLink(adChain.has(tail2) ? tail2 : adChain.ids[0]);
        setView('tracker');
        return true;
      }

      // ── legacy #adoption[/<chain-link>] ───────────────────────────────
      if (head === 'adoption' && (!tail || adChain.has(tail))) {
        trackerTabs.set('btos', { silent: true });
        setAdLink(tail || adChain.ids[0]);
        setView('tracker');
        return true;
      }

      // ── retired: hand off to the frozen Themes page ───────────────────
      if (head === 'themes' && !tail) { goToThemesPage('themes'); return true; }
      if (head === 'theme' && tail)   { goToThemesPage('theme/' + tail); return true; }

      // ── parameterised ─────────────────────────────────────────────────
      if (head === 'policy' && tail && POLICY_DATA.some(pl => pl.id === tail)) {
        setView('policy');
        openPolModalById(tail);
        return true;
      }
      if (head === 'entry' && tail && RESEARCH_DATA.some(r => r.id === +tail)) {
        const entry = RESEARCH_DATA.find(r => r.id === +tail);
        if (activeLens === 'economist' && !isEconRelevant(entry)) setLens('general');
        activeCat = 'all'; activeStatus = 'all'; activeGeo = 'all'; activeEvidence = 'all';
        searchQuery = '';
        const si = document.getElementById('searchInput'); if (si) si.value = '';
        setResearchSubview('database');
        setView('cards');
        // setTimeout rather than requestAnimationFrame: rAF never fires in a
        // background tab, and shared links routinely open in one.
        setTimeout(() => {
          const el = document.querySelector(`.card[data-entry-id="${+tail}"]`);
          if (!el) return;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('deep-link-flash');
          setTimeout(() => el.classList.add('fading'), 1600);
          setTimeout(() => el.classList.remove('deep-link-flash', 'fading'), 3000);
        }, 60);
        return true;
      }
      return false;
    } finally {
      routeApplying = false;
    }
  }

