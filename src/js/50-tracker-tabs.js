  /* ── Data Tracker: the five source sub-tabs ─────────────────────────────
     Declared once and driven by makeTabGroup (45-tabgroup.js). Census BTOS is
     the default because it is the only tab that was already published; the
     others were added for the tracker.

     Routes: #tracker/<tab>, plus #tracker/btos/<link> for the chain inside the
     BTOS tab. The legacy #adoption and #adoption/<link> still resolve, to the
     BTOS tab, so links shared before the tracker existed keep working.

     Charts are drawn eagerly by tracker-charts.js into fixed-viewBox SVGs, so
     switching tabs is pure show/hide with no re-render. */
  const TRACKER_TABS = [
    { id: 'jobs',         label: 'Jobs' },
    { id: 'jolts',        label: 'JOLTS' },
    { id: 'gdp',          label: 'GDP' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'btos',         label: 'Census BTOS' },
  ];
  const TRACKER_DEFAULT = 'btos';

  const trackerTabs = makeTabGroup({
    name: 'tracker',
    tabs: TRACKER_TABS,
    btn: id => 'trkTab-' + id,
    panel: id => 'trkPanel-' + id,
    container: '.trk-tabs',
    onChange: () => { if (activeView === 'tracker') setHash(currentRoute()); },
  });
  trackerTabs.set(TRACKER_DEFAULT, { silent: true });

  document.addEventListener('click', e => {
    const t = e.target.closest('.trk-tab');
    if (t && t.dataset.trktab) trackerTabs.set(t.dataset.trktab);
  });

  /* ── Census BTOS: the chain ─────────────────────────────────────────────
     Six links, one panel visible at a time. The charts are drawn once by
     assets/adoption-charts.js into fixed-viewBox SVGs, so switching links is
     pure show/hide — no re-render, no layout thrash, and the panels stay
     correct even though they were laid out while hidden.
     Deep-linkable as #adoption/<id>; link 1 is just #adoption. */
  const AD_LABELS = {
    aggregate: 'How many', exposure: 'Exposure', who: 'Who',
    'what-for': 'What for', where: 'Where', jobs: 'The jobs'
  };

  const adChain = makeTabGroup({
    name: 'btos-chain',
    tabs: ['aggregate', 'exposure', 'who', 'what-for', 'where', 'jobs'].map(id => ({ id, label: AD_LABELS[id] })),
    btn: id => 'adLink-' + id,
    panel: id => 'adPanel-' + id,
    container: '.ad-spine',
    onChange: id => {
      if (activeView === 'tracker') setHash(currentRoute());
      if (id === 'where') ensureStateMap();
    },
  });

  /* The choropleth is the only thing that needs the 107 KB of pre-projected
     state outlines, and it is one panel deep inside one sub-tab, so the
     payload is fetched the first time that panel is shown rather than at page
     load. adoption-charts.js already ran by then and left #adStateMap empty
     (it guards on window.US_ALBERS), so the draw has to be re-triggered here.
     Idempotent: loadPayload caches the promise and renderStateMap redraws from
     scratch. */
  let stateMapAsked = false;
  function ensureStateMap() {
    if (stateMapAsked) return;
    stateMapAsked = true;
    loadPayload('data/us-albers-data.js')
      .then(() => window.ADOPTION_CHARTS && window.ADOPTION_CHARTS.renderStateMap())
      .catch(e => console.error('tracker: state map payload', e));
  }
  const AD_LINKS = adChain.ids;
  const setAdLink = (id, opts) => adChain.set(id, opts);

  /* Prev/next controls inside each panel, so the chain reads as a sequence
     rather than six unrelated tabs. Built once from AD_LINKS. */
  function buildAdSteps() {
    AD_LINKS.forEach((id, i) => {
      const host = document.querySelector('#adPanel-' + id + ' [data-step]');
      if (!host) return;
      const prev = AD_LINKS[i - 1], next = AD_LINKS[i + 1];
      host.innerHTML =
        (prev ? `<button class="ad-step-btn" data-goto="${prev}"><span class="s">&larr; Back to</span>${AD_LABELS[prev]}</button>`
              : `<button class="ad-step-btn" disabled><span class="s">Start of chain</span>How many</button>`) +
        (next ? `<button class="ad-step-btn" data-goto="${next}"><span class="s">Next &rarr;</span>${AD_LABELS[next]}</button>`
              : `<button class="ad-step-btn" disabled><span class="s">End of chain</span>The jobs</button>`);
    });
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('.ad-link');
    if (link && link.dataset.link) { setAdLink(link.dataset.link); return; }
    const step = e.target.closest('.ad-step-btn[data-goto]');
    if (step) setAdLink(step.dataset.goto, { scroll: true });
  });
  // Arrow-key traversal of the spine comes from makeTabGroup's `container`.

