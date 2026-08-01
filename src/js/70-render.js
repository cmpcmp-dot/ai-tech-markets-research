  /* ── render ──────────────────────────────────────────────────── */
  function updateFilterBadge() {
    const btn   = document.getElementById('filterToggleBtn');
    const badge = document.getElementById('filterBadge');
    if (!btn || !badge) return;
    const count = (activeCat !== 'all' ? 1 : 0) +
                  (activeGeo !== 'all' ? 1 : 0) +
                  (activeEvidence !== 'all' ? 1 : 0) +
                  (searchQuery.trim() ? 1 : 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline' : 'none';
  }

  // View-DOM cache. Each view's DOM is built once and re-shown on tab switch;
  // it rebuilds only when its inputs (its "signature") change. This stops
  // #cardsGrid from being torn down on every switch — the actual source of
  // tab-switch jank. (Dataset cloning,
  // ~0.5ms/render, was never the bottleneck; DOM construction is.)
  let _cardsSig  = null;   // null = never built
  const cardsSig  = () => [activeLens, activeCat, activeStatus, activeGeo, activeEvidence, sortOrder, searchQuery.trim()].join('');

  function render() {
    const grid  = document.getElementById('cardsGrid');
    const empty = document.getElementById('emptyState');

    updateWhatsChangedPill();

    document.body.classList.toggle('cards-view', activeView === 'cards');
    document.body.classList.toggle('changelog-subview', activeView === 'cards' && researchSubview === 'changelog');

    if (activeView === 'policy') { buildPolicyView(); return; }
    if (activeView === 'about')  { return; }
    if (activeView === 'tracker') { return; }   // static: charts drawn once by assets/adoption-charts.js
    if (activeView === 'jobs')   { return; }
    if (activeView === 'solutions') { return; }  // static placeholder

    // ── Research (cards) view ──
    const sig = cardsSig();
    if (_cardsSig === sig) return;   // cached: DOM already reflects these inputs
    _cardsSig = sig;

    // Sidebar nav + inline filters are hidden by CSS on every other view, so
    // build them only when the cards view is actually (re)rendering.
    buildCatNav();
    buildInlineFilters();
    updateFilterBadge();

    grid.innerHTML = '';
    const visible = getVisible();
    const econPool = activeLens === 'economist' ? RESEARCH_DATA.filter(isEconRelevant).length : RESEARCH_DATA.length;
    document.getElementById('resultCount').textContent =
      visible.length === econPool
        ? `${visible.length} entries`
        : `${visible.length} of ${econPool}`;

    const hasFilters = activeCat !== 'all' || activeGeo !== 'all' || activeEvidence !== 'all' || searchQuery.trim();
    empty.classList.toggle('visible', visible.length === 0);
    const clearBtn = document.getElementById('emptyStateClear');
    clearBtn.style.display = visible.length === 0 && hasFilters ? 'inline-block' : 'none';
    clearBtn.onclick = () => {
      activeCat = 'all'; activeStatus = 'all'; activeGeo = 'all'; activeEvidence = 'all';
      searchQuery = ''; document.getElementById('searchInput').value = '';
      render();
    };
    visible.forEach((e, i) => grid.appendChild(buildCard(e, i)));
  }

  // ── lens control ─────────────────────────────────────────────
  function setLens(mode) {
    activeLens = mode;
    document.body.classList.toggle('lens-economist', mode === 'economist');
    document.getElementById('lensGeneral').classList.toggle('active', mode === 'general');
    document.getElementById('lensEconomist').classList.toggle('active', mode === 'economist');
    activeCat = 'all'; activeEvidence = 'all'; activeStatus = 'all'; activeGeo = 'all';
    searchQuery = '';
    const si = document.getElementById('searchInput');
    if (si) si.value = '';
    // Refresh tab description for new lens
    applyMastheadCopy();
    render();
  }

  // ── topbar controls ──────────────────────────────────────────
  // `lede` is the question or statement the tab opens on, set at the
  // shared --lede-size; `text` is the standfirst underneath, which
  // carries the masthead's closing hairline. Cards, Policy Map and
  // Solutions read this table for display — the other three hide
  // .header-tab-desc and carry their own markup — but every entry keeps
  // a lede so the pattern survives a tab being switched over later.
  const TAB_DESCS = {
    cards: {
      general:   { lede: 'What does the research actually show?', text: 'A curated database of peer-reviewed studies, policy reports, and investigative journalism on AI, automation, and labor markets.' },
      economist: { lede: 'What does the research actually show?', text: 'Filtered to peer-reviewed research, institutional analysis, and official reports — organized around economic outcome domains.' },
    },
    'fact-bank': {
      general:   { lede: 'Which numbers can you actually cite?', text: 'Short, number-bearing statements quoted verbatim from sources in the research database, each rated for political noteworthiness and for the rigour of its evidence.' },
      economist: { lede: 'Which numbers can you actually cite?', text: 'Short, number-bearing statements quoted verbatim from sources in the research database, each rated for political noteworthiness and for the rigour of its evidence.' },
    },
    policy: {
      general:   { lede: 'What could policy actually do about it?', text: 'Twenty-seven policy interventions grouped into four policy areas, listed alphabetically within each. Click any policy for rationale, precedents, and supporting research.' },
      economist: { lede: 'What could policy actually do about it?', text: 'Twenty-seven policy interventions grouped into four policy areas, listed alphabetically within each. Click any policy for rationale, precedents, and supporting research.' },
    },
    about: {
      general:   { lede: 'Welcome to our AI dashboard.', text: 'How this tracker is structured and how to use it.' },
      economist: { lede: 'Welcome to our AI dashboard.', text: 'How this tracker is structured and how to use it.' },
    },
    jobs: {
      general:   { lede: 'Is AI displacing workers yet?', text: 'How much job displacement there is and what can be traced to AI, analyzed in an economically rigorous way.' },
      economist: { lede: 'Is AI displacing workers yet?', text: 'How much job displacement there is and what can be traced to AI, analyzed in an economically rigorous way.' },
    },
    tracker: {
      general:   { lede: 'Who is actually adopting AI, what are they using it for, and is anyone losing a job over it?', text: 'Who is actually adopting AI and what they are using it for, from the Census Business Trends and Outlook Survey.' },
      economist: { lede: 'Who is actually adopting AI, what are they using it for, and is anyone losing a job over it?', text: 'Census BTOS AI adoption against employment-weighted occupational exposure, plus the AI supplement on business functions, barriers and self-reported employment effects.' },
    },
    solutions: {
      general:   { lede: 'What should we actually do?', text: 'In development.' },
      economist: { lede: 'What should we actually do?', text: 'In development.' },
    },
  };
  function getTabDesc(view) {
    const lens = activeLens === 'economist' ? 'economist' : 'general';
    return (TAB_DESCS[view] || {})[lens] || null;
  }

  /* The only writer of the masthead's copy. A view switch, a lens switch and
     a sub-tab switch all change it, and the Research sub-tab handler runs
     setResearchSubview() before setView(), so with three independent writers
     the last one to run won — which silently dropped the What's New copy.
     Read the state, don't push to it.

     What's New is inlined rather than added to TAB_DESCS because it is a
     sub-view of cards, not a view of its own, and TAB_DESCS is keyed by
     view. */
  function applyMastheadCopy() {
    const clog = activeView === 'cards' && researchSubview === 'changelog';
    const desc = clog
      ? { lede: 'What has changed lately?',
          text: 'Every dated change to the tracker: research entries added, by intake date, and Policy Map review passes. Click any entry to jump to its card in the database.' }
      : getTabDesc(activeView);
    if (!desc) return;
    const ld = document.getElementById('headerTabDescLede');
    const t  = document.getElementById('headerTabDescText');
    if (ld) ld.textContent = desc.lede || '';
    if (t)  t.textContent  = desc.text;
  }

  const VIEW_TAB_IDS = { cards: 'viewCards', 'fact-bank': 'viewFactBank', policy: 'viewPolicy', tracker: 'viewTracker', jobs: 'viewJobs', solutions: 'viewSolutions', about: 'homeTitleLink' };

  function setView(view) {
    activeView = view;
    viewInitialized = true;
    ['viewCards', 'viewFactBank', 'viewPolicy', 'viewTracker', 'viewJobs', 'viewSolutions'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const active = id === VIEW_TAB_IDS[view];
      el.classList.toggle('active', active);
      el.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    // Update header tab description
    applyMastheadCopy();
    const _sb = document.getElementById('sortBtn'); if (_sb) _sb.style.display = view === 'cards' ? '' : 'none';
    document.body.classList.toggle('policy-view',   view === 'policy');
    document.body.classList.toggle('about-view',    view === 'about');
    document.body.classList.toggle('tracker-view', view === 'tracker');
    document.body.classList.toggle('jobs-view',     view === 'jobs');
    document.body.classList.toggle('solutions-view', view === 'solutions');
    document.body.classList.toggle('fact-bank-view',   view === 'fact-bank');
    if (view === 'fact-bank' && typeof initFactBank === 'function') initFactBank();
    render();
    const activeTabId = VIEW_TAB_IDS[view] || ('view' + view.charAt(0).toUpperCase() + view.slice(1));
    const panel = document.getElementById('viewPanel');
    if (panel) panel.setAttribute('aria-labelledby', activeTabId);
    const ann = document.getElementById('viewAnnounce');
    if (ann) {
      // Must match the visible nav labels in src/views/10-header.html: this is
      // what a screen reader announces on a view change.
      const names = { cards: 'Papers', 'fact-bank': 'Fact Bank', policy: 'Lab', tracker: 'Data Tracker', jobs: 'Job Displacement', solutions: 'Solutions', about: 'About' };
      ann.textContent = (names[view] || view) + ' view';
    }
    setHash(currentRoute());
  }
  /* One delegated listener for the whole view nav, keyed on data-view in
     src/views/10-header.html. This replaced six near-identical listeners that
     had to be edited in lockstep with the markup; now adding a view button is
     a data-view attribute and a VIEWS row in 40-router.js.

     Clicking Papers resets the research sub-view to Database. That belongs on
     the click and not in setView, because #changelog routes through
     setView('cards') too and must keep its sub-view. */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.header-nav-btn[data-view]');
    if (!btn) return;
    const view = btn.dataset.view;
    if (view === 'cards') setResearchSubview('database');
    setView(view);
  });

  // Key findings band: open a source-excerpt modal, or hand off to the frozen
  // Themes page if there is no source paper to show.
  function goToTheme(id) {
    goToThemesPage('theme/' + id);
  }

  function closeFindingModal() {
    const backdrop = document.getElementById('findingModal');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    if (backdrop._lastFocus) { backdrop._lastFocus.focus(); backdrop._lastFocus = null; }
  }

  function openFindingModal(card) {
    const pid = +card.dataset.paperId;
    const themeId = card.dataset.themeId;
    const paper = RESEARCH_DATA.find(r => r.id === pid);
    if (!paper) { goToTheme(themeId); return; }
    const theme = THEMES.find(t => t.id === themeId);
    const stat = card.querySelector('.key-finding-stat')?.textContent || '';
    const text = card.querySelector('.key-finding-text')?.textContent || '';
    const primaryCite = `<a class="finding-modal-source" href="${paper.sourceUrl}" target="_blank" rel="noopener noreferrer">${formatAPACitation(paper)}</a>`;
    const refLink = p => `<a class="theme-ref" href="${p.sourceUrl}" target="_blank" rel="noopener noreferrer">${formatAPACitation(p)}</a>`;
    const related = (theme && theme.papers ? theme.papers : []).filter(id2 => id2 !== pid)
      .map(id2 => RESEARCH_DATA.find(r => r.id === id2)).filter(Boolean)
      .sort((a, b) => (a.source || '').localeCompare(b.source || '')).slice(0, 6);
    const relatedHTML = related.length
      ? `<div class="pol-modal-section"><div class="pol-modal-label">Related research</div><div class="theme-refs" style="grid-template-columns:1fr">${related.map(refLink).join('')}</div></div>`
      : '';
    const themeLink = theme
      ? `<div class="pol-modal-section"><button class="finding-theme-link" type="button">Explore the ${theme.tag} theme →</button></div>`
      : '';
    document.getElementById('findingModalStat').textContent = stat;
    document.getElementById('findingModalTitle').textContent = text;
    document.getElementById('findingModalBody').innerHTML = `
      <div class="pol-modal-section">
        <div class="pol-modal-label">From the research</div>
        ${primaryCite}
        <div class="pol-modal-text">${card.dataset.excerpt || paper.keyFinding}</div>
      </div>
      ${relatedHTML}
      ${themeLink}`;
    document.getElementById('findingModalBody').querySelector('.finding-theme-link')?.addEventListener('click', () => {
      closeFindingModal();
      goToTheme(themeId);
    });
    const backdrop = document.getElementById('findingModal');
    backdrop._lastFocus = document.activeElement;
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { const cb = document.getElementById('findingModalClose'); if (cb) cb.focus(); });
  }

  (function() {
    const backdrop = document.getElementById('findingModal');
    document.getElementById('findingModalClose').addEventListener('click', closeFindingModal);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeFindingModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && backdrop.classList.contains('open')) closeFindingModal(); });
  })();

  // Build the band from the most recently added papers that carry a `highlight`
  // field (capped at 8). Click handling uses event delegation so cards added
  // after script-load still respond.
  function buildKeyFindingsBand() {
    const band = document.getElementById('keyFindingsBand');
    const row  = document.getElementById('keyFindingsRow');
    if (!band || !row) return;
    const themeMap = Object.fromEntries(THEMES.map(t => [t.id, t]));
    const cards = RESEARCH_DATA
      .filter(p => p.highlight)
      .sort((a, b) => new Date(b.added || b.date) - new Date(a.added || a.date) || new Date(b.date) - new Date(a.date))
      .slice(0, 8)
      .map(p => {
        const t = themeMap[p.highlight.themeId];
        if (!t) return '';
        const inst = (p.source || '').split(' \u2014 ').pop().trim();
        const year = p.date ? p.date.slice(0, 4) : '';
        const sourceLine = p.highlight.source || `${inst}, ${year}`;
        return `<button class="key-finding-card" data-paper-id="${p.id}" data-theme-id="${p.highlight.themeId}" style="--kf-color:${t.color}">`
             + `<span class="key-finding-stat">${p.highlight.stat}</span>`
             + `<span class="key-finding-text">${p.highlight.text}</span>`
             + `<span class="key-finding-source">${sourceLine}</span>`
             + `<span class="key-finding-link">${t.tag} \u2192</span>`
             + `</button>`;
      }).join('');
    if (!cards) { band.style.display = 'none'; return; }
    row.innerHTML = cards;
    band.style.display = '';
  }

  document.getElementById('keyFindingsBand').addEventListener('click', e => {
    const card = e.target.closest('.key-finding-card[data-theme-id]');
    if (!card) return;
    if (card.dataset.paperId) openFindingModal(card);
    else goToTheme(card.dataset.themeId);
  });

  buildKeyFindingsBand();

  function updateSortBtn() {
    const btn = document.getElementById('sortBtn');
    if (!btn) return;
    const s = SORT_STATES[sortIdx];
    const lbl = document.getElementById('sortLabel');
    if (lbl) lbl.textContent = s.label;
    btn.classList.toggle('sort-active', sortIdx !== 0);
    const icons = {
      desc:   '<path d="M3 6h18M7 12h10M11 18h2"/>',
      asc:    '<path d="M11 6h2M7 12h10M3 18h18"/>',
      status: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    };
    const svg = btn.querySelector('svg');
    if (svg) svg.innerHTML = icons[s.order] || icons.desc;
  }
  updateSortBtn();

  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { searchQuery = e.target.value; render(); }, 200);
  });

  // ── mobile sidebar ───────────────────────────────────────────
  const sidebar   = document.getElementById('sidebar');
  const backdrop  = document.getElementById('sidebarBackdrop');
  const toggleBtn = document.getElementById('sidebarToggle');
  function closeSidebar() { sidebar.classList.remove('open'); backdrop.classList.remove('visible'); }
  toggleBtn.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    backdrop.classList.toggle('visible', open);
  });
  backdrop.addEventListener('click', closeSidebar);

  // ── mobile filter drawer toggle ───────────────────────────────
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  if (filterToggleBtn) {
    filterToggleBtn.addEventListener('click', () => {
      const bar = document.getElementById('inlineFilters');
      const isOpen = bar.classList.toggle('mobile-open');
      filterToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // ── sidebar collapsible sections ─────────────────────────────
  function updateSectionCounts() {
    const catActive   = filteredBase({ excludeCat: true });
    const statusActive = filteredBase({ excludeStatus: true });
    const geoActive   = filteredBase({ excludeGeo: true });
    const el = id => document.getElementById(id);
    if (activeCat !== 'all') {
      const cat = getCat(activeCat);
      el('secCategoryCount').textContent = cat.label;
    } else {
      el('secCategoryCount').textContent = '';
    }
    if (activeStatus !== 'all') {
      el('secStatusCount').textContent = STATUS_META[activeStatus]?.label || '';
    } else {
      el('secStatusCount').textContent = '';
    }
    if (activeGeo !== 'all') {
      el('secGeoCount').textContent = GEOGRAPHY_META[activeGeo]?.label || '';
    } else {
      el('secGeoCount').textContent = '';
    }
  }

  document.querySelectorAll('.sidebar-heading[data-sec]').forEach(heading => {
    heading.addEventListener('click', () => {
      const sec = document.getElementById(heading.dataset.sec);
      sec.classList.toggle('collapsed');
    });
  });

  // ── footer ───────────────────────────────────────────────────
  const latest  = new Date(Math.max(
    ...RESEARCH_DATA.map(r => new Date(r.date + 'T00:00:00')),
    new Date(LAST_CONTENT_UPDATE + 'T00:00:00')
  ));
  const latestStr = latest.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('headerLastUpdated').textContent = latestStr;

  // ── sources modal ─────────────────────────────────────────────
  (function() {
    const modal   = document.getElementById('sourcesModal');
    const body    = document.getElementById('sourcesModalBody');
    const openBtn = document.getElementById('sourcesInfoBtn');
    const closeBtn= document.getElementById('sourcesModalClose');

    function openModal() {
      modal._lastFocus = document.activeElement;
      if (!body.hasChildNodes()) {
        const intro = document.createElement('p');
        intro.className = 'modal-sources-intro';
        intro.textContent = 'These are the institutions and organizations whose work is tracked in this database.';
        body.appendChild(intro);

        Object.entries(PRIORITY_SOURCE_GROUPS).forEach(([group, names]) => {
          const g = document.createElement('div');
          g.className = 'modal-group';
          const rows = names.map(name => {
            const meta = INST_META[name] || {};
            const nameEl = meta.url
              ? `<a class="modal-source-link" href="${meta.url}" target="_blank" rel="noopener">${name}<span class="modal-source-ext">↗</span></a>`
              : `<span class="modal-source-link">${name}</span>`;
            return `<div class="modal-source-row">
              <div class="modal-source-top">${nameEl}</div>
            </div>`;
          }).join('');
          g.innerHTML = `<div class="modal-group-name">${group}</div>
            <div class="modal-sources-list">${rows}</div>`;
          body.appendChild(g);
        });
      }
      modal.classList.add('open');
      requestAnimationFrame(() => { closeBtn.focus(); });
    }
    function closeModal() {
      modal.classList.remove('open');
      if (modal._lastFocus) { modal._lastFocus.focus(); modal._lastFocus = null; }
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  })();

  // ── about modal ──────────────────────────────────────────────
  (function() {
    const modal    = document.getElementById('aboutModal');
    const openBtn  = document.getElementById('aboutInfoBtn');
    const closeBtn = document.getElementById('aboutModalClose');
    function openModal()  {
      modal._lastFocus = document.activeElement;
      modal.classList.add('open');
      requestAnimationFrame(() => { closeBtn.focus(); });
    }
    function closeModal() {
      modal.classList.remove('open');
      if (modal._lastFocus) { modal._lastFocus.focus(); modal._lastFocus = null; }
    }
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  })();

  document.querySelectorAll('.lens-btn').forEach(btn => {
    btn.addEventListener('click', () => setLens(btn.dataset.lens));
  });

  // ── Home: the site title is the About page ───────────────────
  document.getElementById('homeTitleLink')?.addEventListener('click', e => {
    e.preventDefault();
    setView('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('aboutInfoBtnTopbar')?.addEventListener('click', () => {
    document.getElementById('aboutInfoBtn').click();
  });
  document.getElementById('sourcesInfoBtnTopbar')?.addEventListener('click', () => {
    document.getElementById('sourcesInfoBtn').click();
  });

  // ── Modal focus trap (keyboard accessibility) ───────────────
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const open = document.querySelector('.modal-backdrop.open');
    if (!open) return;
    const f = [...open.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // ── R7: data-validation guard (console-only) ────────────────
  // Catches the silent-reference-rot class of bug (e.g. an entry carrying a
  // theme id as its category, a cite token pointing at a deleted entry) at load.
  (function validateData() {
    const problems = [];
    const catIds = new Set(CATEGORIES.map(c => c.id));
    const ids = new Set();
    RESEARCH_DATA.forEach(e => {
      if (ids.has(e.id)) problems.push(`duplicate entry id ${e.id}`);
      ids.add(e.id);
      if (!catIds.has(e.category)) problems.push(`entry ${e.id}: unknown category "${e.category}"`);
      if (e.geography && !GEOGRAPHY_META[e.geography]) problems.push(`entry ${e.id}: unknown geography "${e.geography}"`);
      if (!e.date || isNaN(new Date(e.date + 'T00:00:00'))) problems.push(`entry ${e.id}: bad date "${e.date}"`);
      if (e.added && isNaN(new Date(e.added + 'T00:00:00'))) problems.push(`entry ${e.id}: bad added "${e.added}"`);
    });
    THEMES.forEach(t => (t.papers || []).forEach(pid => {
      if (!ids.has(pid)) problems.push(`theme ${t.id}: linked paper ${pid} not found`);
    }));
    const polIds = new Set(POLICY_DATA.map(p => p.id));
    POLICY_DATA.forEach(p => {
      (p.paperIds || []).forEach(pid => { if (!ids.has(pid)) problems.push(`policy ${p.id}: paperId ${pid} not found`); });
      if (!POLICY_CATEGORIES[p.category]) problems.push(`policy ${p.id}: unknown category "${p.category}"`);
      if (!DISRUPTION_LEVELS.some(l => l.id === p.level)) problems.push(`policy ${p.id}: unknown level "${p.level}"`);
      // A base category with no CATEGORY_MERGE_MAP entry drops its policies
      // out of the Policy Map rows entirely — the rows filter by merged
      // category, so the card renders nowhere and nothing errors.
      if (!CATEGORY_MERGE_MAP[p.category]) problems.push(`policy ${p.id}: category "${p.category}" has no CATEGORY_MERGE_MAP entry, so it renders in no Policy Map row`);
      else if (!MERGED_POLICY_CATEGORIES[CATEGORY_MERGE_MAP[p.category]]) problems.push(`policy ${p.id}: category "${p.category}" merges to unknown row "${CATEGORY_MERGE_MAP[p.category]}"`);
    });
    Object.entries(CATEGORY_MERGE_MAP).forEach(([orig, merged]) => {
      if (!POLICY_CATEGORIES[orig]) problems.push(`merge map: unknown base category "${orig}"`);
      if (!MERGED_POLICY_CATEGORIES[merged]) problems.push(`merge map: "${orig}" points at unknown merged category "${merged}"`);
    });
    Object.keys(MERGED_POLICY_CATEGORIES).forEach(mc => {
      if (!MERGED_CAT_DESCS[mc]) problems.push(`merged category "${mc}": no MERGED_CAT_DESCS entry`);
    });
    const scanTokens = (obj, label) => {
      const s = JSON.stringify(obj);
      for (const m of s.matchAll(/\{\{citep?:(\d+)\}\}/g)) {
        if (!ids.has(+m[1])) problems.push(`${label}: cite token ${m[1]} resolves to no entry`);
      }
      for (const m of s.matchAll(/\{\{pol:([a-z0-9-]+)\|/g)) {
        if (!polIds.has(m[1])) problems.push(`${label}: policy cross-reference "${m[1]}" resolves to no policy`);
      }
    };
    scanTokens(THEMES, 'themes');
    scanTokens(POLICY_DATA, 'policies');
    if (problems.length) {
      console.error(`[tracker] data validation: ${problems.length} problem(s) found`);
      problems.slice(0, 25).forEach(p => console.warn('[tracker]', p));
    }
  })();

