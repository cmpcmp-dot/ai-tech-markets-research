
  // ── state ────────────────────────────────────────────────────
  let activeView    = 'about';
  // Research sub-tab: 'database' | 'changelog'
  let researchSubview = 'database';
  let activeCat      = 'all';
  let activeStatus   = 'all';
  let activeGeo      = 'all';
  let activeEvidence = 'all';
  let searchQuery   = '';
  let sortOrder     = 'desc';   // 'desc' | 'asc' | 'status'
  let factBankEnabled = false;      // set true by the Fact Bank module if data is present
  let initFactBank = function () {}; // replaced with the real builder when data is present
  let activeLens    = 'general'; // 'general' | 'economist'
  const SORT_STATES = [
    { order: 'desc',   label: 'Newest first' },
    { order: 'asc',    label: 'Oldest first' },
  ];
  let sortIdx = 0;
  const STATUS_ORDER = { emergent: 0, current: 1, stale: 2 };

  // ── Economist lens data ───────────────────────────────────────
  const ECON_INSTITUTIONS = new Set([
    'Stanford HAI','NBER','NBER Working Paper',
    'MIT Work of the Future Task Force','MIT Work of the Future',
    'Cornell ILR School','Brookings Institution','Brookings Metro',
    'Opportunity@Work & Brookings Metro','New England Journal of Medicine',
    'Council on Foreign Relations','arXiv','Nature Communications',
    'Science','NYU Law Review','Philosophy & Technology','ACM FAccT',
    'University of Michigan Poverty Solutions',
    'Georgetown Journal on Poverty Law & Policy',
    'AI Now Institute','AI Now Institute et al.',
    'AI Now Institute, Aapti Institute, The Maybe',
    'Data & Society','Data and Society Research Institute',
    'Georgetown CSET','Georgetown Law Center on Privacy & Technology','Upturn',
    'Economic Policy Institute','Center for American Progress',
    'Open Markets Institute','Open Markets Institute & Mozilla',
    'Open Markets Institute & Mission:data Coalition',
    'American Economic Liberties Project',
    'International Labour Organization','OECD Competition Committee',
    'World Economic Forum','Washington Center for Equitable Growth',
    'Bipartisan Policy Center','European Parliament Research Service',
    'German Marshall Fund of the United States',
    'Tony Blair Institute for Global Change','Centre for Future Generations',
    'Digitalist Papers','Tech Policy Press',
    'Resources for the Future / Lincoln Institute',
    'U.S. National Science Foundation','Anticipation Hub',
    'AFL-CIO','National Employment Law Project',
    'National Consumer Law Center','National Fair Housing Alliance',
    'The Leadership Conference on Civil and Human Rights',
    'U.S. Equal Employment Opportunity Commission',
    'U.S. Senate Permanent Subcommittee on Investigations',
    'U.S. Department of Housing and Urban Development',
    'Federal Housing Finance Agency','Federal Trade Commission',
    'National Institute of Standards and Technology',
    'U.S. Senate','Executive Office of the President',
    'New Jersey Department of Labor','New Jersey Legislature',
    'McKinsey Global Institute','Goldman Sachs Global Investment Research',
    'BCG Henderson Institute','IDC',
    'Anthropic','OpenAI','OpenAI / University of Pennsylvania',
    'Wharton AI & Analytics Initiative',
    'Singapore Parliament','AI Commons Project',
    'Anton Leicht','AI Futures Project',
    'National Partnership for Women & Families','Benefits Tech Advocacy Hub',
    'Luddite Lab / DAIR Institute',
  ]);
  const ECON_CAT_TO_SRC = {
    'econ-labor':  ['hiring','labor','workers'],
    'econ-macro':  ['macro','corporate'],
    'econ-dist':   ['equity','wellbeing'],
    'econ-policy': ['policy','reskilling','education'],
  };
  const ECON_CATS = [
    { id: 'econ-labor',  label: 'Labor Markets',             color: '#2C3254' },
    { id: 'econ-macro',  label: 'Productivity & Macro',      color: '#472B51' },
    { id: 'econ-dist',   label: 'Distribution & Inequality', color: '#C99A3F' },
    { id: 'econ-policy', label: 'Policy & Adjustment',       color: '#70AD8F' },
  ];

  // ── lookups ──────────────────────────────────────────────────
  const catMap = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
  const getCat = id => catMap[id] || { label: id, color: '#888' };

  // resolve CSS var to hex for use in inline styles that need a real color
  const COLOR_MAP = {
    'var(--c0)':'#2C3254','var(--c1)':'#70AD8F','var(--c2)':'#472B51','var(--c3)':'#C99A3F',
    'var(--c4)':'#FFBFA7','var(--c5)':'#3C4164','var(--c6)':'#2C3254','var(--c7)':'#70AD8F',
    'var(--c8)':'#472B51','var(--c9)':'#C99A3F','var(--c10)':'#FFBFA7','var(--c11)':'#3C4164',
    'var(--c12)':'#2C3254','var(--c13)':'#70AD8F','var(--g-us)':'#2C3254','var(--g-intl)':'#C99A3F',
    'var(--s-emergent)':'#70AD8F','var(--s-current)':'#2C3254','var(--s-stale)':'#6d7091',
  };
  const resolve = v => COLOR_MAP[v] || v;

  // ── utils ────────────────────────────────────────────────────
  function fmtDate(str) {
    return new Date(str + 'T00:00:00').toLocaleDateString('en-US',
      { year: 'numeric', month: 'short', day: 'numeric' });
  }
  // ── filter + sort ────────────────────────────────────────────
  function filteredBase({ excludeCat = false, excludeStatus = false, excludeGeo = false, excludeEvidence = false } = {}) {
    let data = RESEARCH_DATA.map(r => ({ ...r, _status: calcStatus(r) }));
    if (activeLens === 'economist') data = data.filter(isEconRelevant);
    if (!excludeCat && activeCat !== 'all') {
      const srcCats = ECON_CAT_TO_SRC[activeCat];
      data = srcCats
        ? data.filter(r => srcCats.includes(r.category))
        : data.filter(r => r.category === activeCat);
    }
    if (!excludeStatus   && activeStatus   !== 'all') data = data.filter(r => r._status  === activeStatus);
    if (!excludeGeo      && activeGeo      !== 'all') data = data.filter(r => (r.geography || 'us') === activeGeo);
    if (!excludeEvidence && activeEvidence !== 'all') data = data.filter(r => getEvidenceType(r) === activeEvidence);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.keyFinding.toLowerCase().includes(q) ||
        (r.takeaways || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return data;
  }

  function isEconRelevant(entry) {
    const evidence = getEvidenceType(entry);
    const inst = entry.source ? entry.source.split(' — ').pop().trim() : entry.source || '';
    const excluded = new Set(['criminal-justice', 'surveillance']);
    if (excluded.has(entry.category)) return false;
    if (evidence === 'peer-reviewed' || evidence === 'industry') return true;
    return ECON_INSTITUTIONS.has(inst);
  }

  function getVisible() {
    let data = filteredBase();
    data.sort((a, b) => {
      if (sortOrder === 'status') {
        const sd = (STATUS_ORDER[a._status] ?? 3) - (STATUS_ORDER[b._status] ?? 3);
        if (sd !== 0) return sd;
        return new Date(b.date) - new Date(a.date);
      }
      const d = new Date(a.date) - new Date(b.date);
      return sortOrder === 'desc' ? -d : d;
    });
    return data;
  }

  // ── sidebar builders ─────────────────────────────────────────
  function buildSidebarStats() {
    const el = document.getElementById('sidebarStats');
    el.innerHTML = `
      <div class="stat-item"><strong>${RESEARCH_DATA.length}</strong>Entries</div>
      <div class="stat-item"><strong>${CATEGORIES.length}</strong>Categories</div>
      <div class="stat-item"><strong>${new Set(RESEARCH_DATA.map(r=>r.source)).size}</strong>Sources</div>`;
  }

  function buildCatNav() {
    const el = document.getElementById('catNav');
    el.innerHTML = '';
    const mk = (id, label, color, count) => {
      const isActive = activeCat === id;
      const d = document.createElement('button');
      d.className = 'nav-item' + (isActive ? ' active' : '');
      d.setAttribute('role', 'button');
      d.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      d.setAttribute('aria-label', `${label}, ${count} entries`);
      const hex = resolve(color || '');
      if (isActive) d.style.borderLeftColor = '#70AD8F';
      d.innerHTML = `
        <span class="nav-label">${label}</span>
        <span class="nav-count">${count}</span>`;
      d.onclick = () => { activeCat = id; render(); };
      el.appendChild(d);
    };
    const base = filteredBase({ excludeCat: true });
    mk('all', 'All Research', null, base.length);
    const cats = activeLens === 'economist' ? ECON_CATS : CATEGORIES;
    cats.forEach(cat => {
      const srcCats = ECON_CAT_TO_SRC[cat.id];
      const n = srcCats
        ? base.filter(r => srcCats.includes(r.category)).length
        : base.filter(r => r.category === cat.id).length;
      mk(cat.id, cat.label, cat.color, n);
    });
  }

  function buildInlineFilters() {
    const bar = document.getElementById('inlineFilters');
    if (!bar) return;
    bar.innerHTML = '';

    // Active-status chip: when the user lands on the cards view with a status
    // filter already applied (typically via the What's New banner), show a
    // visible chip in the filter bar so the filter is both discoverable and
    // dismissable in one click.
    if (activeStatus !== 'all') {
      const sm = STATUS_META[activeStatus] || {};
      const chip = document.createElement('button');
      chip.className = 'if-pill if-status-chip';
      chip.setAttribute('aria-label', `Filtered to ${sm.label || activeStatus}. Click to show all statuses.`);
      chip.innerHTML = `<span class="if-status-dot" style="background:${sm.dot || 'var(--accent)'}" aria-hidden="true"></span>`
                     + `<span>${sm.label || activeStatus}</span>`
                     + `<span class="if-status-x" aria-hidden="true">\u2715</span>`;
      chip.addEventListener('click', () => { activeStatus = 'all'; render(); });
      bar.appendChild(chip);
    }

    const mkPill = (label, color, isActive, onClick, tooltip) => {
      const btn = document.createElement('button');
      btn.className = 'if-pill if-pill-fallback';
      btn.textContent = label;
      btn.style.setProperty('--pill-color', color);
      if (tooltip) {
        btn.dataset.tooltip = tooltip;
        const descId = 'pill-desc-' + Math.random().toString(36).slice(2);
        const desc = document.createElement('span');
        desc.id = descId;
        desc.className = 'sr-only';
        desc.textContent = tooltip;
        btn.setAttribute('aria-describedby', descId);
        btn.appendChild(desc);
      }
      if (isActive) {
        btn.classList.add('active');
        try { btn.classList.remove('if-pill-fallback'); } catch(e) {}
      }
      btn.addEventListener('click', onClick);
      return btn;
    };

    // Methodology pills
    const evLabel = document.createElement('span');
    evLabel.className = 'pol-filter-label';
    evLabel.textContent = 'Methodology:';
    bar.appendChild(evLabel);

    const evBase = filteredBase({ excludeEvidence: true });
    bar.appendChild(mkPill('All', 'var(--muted)', activeEvidence === 'all', () => { activeEvidence = 'all'; render(); }));
    Object.entries(EVIDENCE_META).forEach(([key, em]) => {
      const n = evBase.filter(r => getEvidenceType(r) === key).length;
      if (!n) return;
      bar.appendChild(mkPill(`${em.label} (${n})`, resolve('var(--accent)'), activeEvidence === key, () => { activeEvidence = key; render(); }));
    });

    // Sort button — right-aligned on the Methodology row
    const sortIcons = {
      desc:   '<path d="M3 6h18M7 12h10M11 18h2"/>',
      asc:    '<path d="M11 6h2M7 12h10M3 18h18"/>',
      status: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    };
    const sortSpacer = document.createElement('span');
    sortSpacer.style.marginLeft = 'auto';
    bar.appendChild(sortSpacer);
    const sb = document.createElement('button');
    sb.id = 'sortBtn';
    sb.className = 'if-pill sort-btn' + (sortIdx !== 0 ? ' sort-active' : '');
    sb.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">${sortIcons[SORT_STATES[sortIdx].order] || sortIcons.desc}</svg><span id="sortLabel">${SORT_STATES[sortIdx].label}</span>`;
    sb.addEventListener('click', () => {
      sortIdx = (sortIdx + 1) % SORT_STATES.length;
      sortOrder = SORT_STATES[sortIdx].order;
      render();
    });
    bar.appendChild(sb);

    // Row break before region
    const evBreak = document.createElement('div');
    evBreak.className = 'if-break';
    bar.appendChild(evBreak);

    // Geo pills
    const geoLabel = document.createElement('span');
    geoLabel.className = 'pol-filter-label';
    geoLabel.textContent = 'Region:';
    bar.appendChild(geoLabel);
    const geoBase = filteredBase({ excludeGeo: true });
    bar.appendChild(mkPill(`All (${geoBase.length})`, 'var(--muted)', activeGeo === 'all', () => { activeGeo = 'all'; render(); }));
    Object.entries(GEOGRAPHY_META).forEach(([key, gm]) => {
      const n = geoBase.filter(r => (r.geography || 'us') === key).length;
      bar.appendChild(mkPill(`${gm.label} (${n})`, resolve(gm.color), activeGeo === key, () => { activeGeo = key; render(); }));
    });

    // Clear all
    const hasFilters = activeStatus !== 'all' || activeGeo !== 'all' || activeCat !== 'all' || activeEvidence !== 'all' || searchQuery.trim();
    if (hasFilters) {
      const sep2 = document.createElement('div');
      sep2.className = 'if-sep';
      bar.appendChild(sep2);
      const clearBtn = mkPill('Clear all', 'var(--red-deep)', false, () => {
        activeStatus = 'all'; activeGeo = 'all'; activeCat = 'all'; activeEvidence = 'all'; searchQuery = '';
        const s = document.getElementById('searchInput'); if (s) s.value = '';
        render();
      });
      clearBtn.style.setProperty('--pill-color', 'var(--red-deep)');
      bar.appendChild(clearBtn);
    }
  }

  function buildStatusNav() {
    const el = document.getElementById('statusNav');
    el.innerHTML = '';

    const statusBase = filteredBase({ excludeStatus: true });
    // All option
    const allEl = document.createElement('button');
    allEl.className = 'nav-item' + (activeStatus === 'all' ? ' active' : '');
    allEl.setAttribute('aria-pressed', activeStatus === 'all' ? 'true' : 'false');
    allEl.setAttribute('aria-label', `All Statuses, ${statusBase.length} entries`);
    allEl.innerHTML = `<span class="nav-label">All Statuses</span><span class="nav-count">${statusBase.length}</span>`;
    allEl.onclick = () => { activeStatus = 'all'; render(); };
    el.appendChild(allEl);

    Object.entries(STATUS_META).forEach(([key, sm]) => {
      const n = statusBase.filter(r => r._status === key).length;
      const isActive = activeStatus === key;
      const d = document.createElement('button');
      d.className = 'status-nav-item' + (isActive ? ' active' : '');
      d.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      d.setAttribute('aria-label', `${sm.label}, ${n} entries. ${sm.desc}`);
      if (isActive) d.style.borderLeftColor = sm.dot;
      d.innerHTML = `
        <div class="status-top">
          <span style="flex:1">${sm.label}</span>
          <span class="nav-count">${n}</span>
        </div>
        <div class="status-desc">${sm.desc}</div>`;
      d.onclick = () => { activeStatus = key; render(); };
      el.appendChild(d);
    });
  }

  function buildGeoNav() {
    const el = document.getElementById('geoNav');
    el.innerHTML = '';
    const geoBase = filteredBase({ excludeGeo: true });
    const allGeoEl = document.createElement('button');
    allGeoEl.className = 'nav-item' + (activeGeo === 'all' ? ' active' : '');
    allGeoEl.setAttribute('aria-pressed', activeGeo === 'all' ? 'true' : 'false');
    allGeoEl.setAttribute('aria-label', `All Geographies, ${geoBase.length} entries`);
    allGeoEl.innerHTML = `<span class="nav-label">All Geographies</span><span class="nav-count">${geoBase.length}</span>`;
    allGeoEl.onclick = () => { activeGeo = 'all'; render(); };
    el.appendChild(allGeoEl);
    Object.entries(GEOGRAPHY_META).forEach(([key, gm]) => {
      const n = geoBase.filter(r => (r.geography || 'us') === key).length;
      if (!n) return;
      const isActive = activeGeo === key;
      const hex = resolve(gm.color);
      const d = document.createElement('button');
      d.className = 'nav-item' + (isActive ? ' active' : '');
      d.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      d.setAttribute('aria-label', `${gm.label}, ${n} entries`);
      if (isActive) { d.style.borderLeftColor = '#70AD8F'; }
      d.innerHTML = `
        <span class="nav-label">${gm.label}</span>
        <span class="nav-count">${n}</span>`;
      d.onclick = () => { activeGeo = key; render(); };
      el.appendChild(d);
    });
  }

  // ── card ─────────────────────────────────────────────────────
  function buildCard(entry, idx) {
    const cat    = getCat(entry.category);
    const color  = resolve(cat.color);
    const status = entry._status;
    const sm     = STATUS_META[status] || STATUS_META.stale;
    const geo    = GEOGRAPHY_META[entry.geography || 'us'] || GEOGRAPHY_META.us;
    const geoHex = resolve(geo.color);

    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.dataset.entryId = entry.id;
    card.style.animationDelay = Math.min(idx * 30, 350) + 'ms';

    const takeawaysHTML = (entry.takeaways || []).map((t, i) => `
      <div class="takeaway-item">
        <span class="ui-chevron sm right takeaway-num" aria-hidden="true"></span>
        <span>${t}</span>
      </div>`).join('');

    const polLinkHTML = '';

    const sourceParts  = entry.source.split(' — ');
    const institution  = sourceParts[sourceParts.length - 1];
    const authors      = sourceParts.length > 1 ? sourceParts.slice(0, -1).join(' — ') : '';
    const instMeta     = INST_META[institution];
    const instHomeUrl  = instMeta?.url || INST_URLS[institution];
    const instLink     = instHomeUrl
      ? `<a href="${instHomeUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${institution}</a>`
      : institution;
    const instDesc     = instMeta
      ? `<span class="inst-meta">${instMeta.type}${instMeta.note ? ` · ${instMeta.note}` : ''}</span>`
      : '';
    const titleInner   = entry.sourceUrl
      ? `<a class="card-title" href="${entry.sourceUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${entry.title}</a>`
      : `<span class="card-title">${entry.title}</span>`;
    const titleEl      = `<h3 class="card-title-h">${titleInner}</h3>`;

    const ev = getEvidenceType(entry);
    const em = EVIDENCE_META[ev] || {};
    const statusInitial = { emergent: 'R', current: 'C', stale: 'O' }[status] || '·';

    card.innerHTML = `
      <div class="card-body">
        <div class="card-meta-col">
          <span class="card-section-slug">${cat.label}</span>
          <div class="card-meta-col-inst">${authors ? `${authors}<br>` : ''}${instLink}</div>
          ${instMeta ? `<div class="card-meta-col-type">${instMeta.type}</div>` : ''}
          <div class="card-meta-col-date">${fmtDate(entry.date)}</div>
        </div>
        <div class="card-content-col">
          ${titleEl}
          <div class="card-finding" style="margin-top:10px">${entry.keyFinding}</div>
          ${polLinkHTML}
          <div class="card-footer" style="margin-top:14px">
            <button class="expand-btn" aria-expanded="false" aria-label="Show takeaways">
              Takeaways
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <button class="cite-btn" aria-expanded="false" aria-controls="citeRow-${entry.id}" aria-label="Citation and link options">Cite</button>
          </div>
          <div class="cite-row" id="citeRow-${entry.id}" hidden>
            <button class="cite-act" data-fmt="apa">Copy APA</button>
            <button class="cite-act" data-fmt="bibtex">Copy BibTeX</button>
            <button class="cite-act" data-fmt="link">Copy link</button>
          </div>
          <div class="takeaways">
            <div class="takeaways-inner">
              ${takeawaysHTML}
            </div>
          </div>
        </div>
      </div>`;

    card.querySelector('.expand-btn').addEventListener('click', e => {
      e.stopPropagation();
      const expanded = card.classList.toggle('expanded');
      e.currentTarget.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      e.currentTarget.setAttribute('aria-label', expanded ? 'Hide takeaways' : 'Show takeaways');
    });
    // R2: cite / copy-link actions
    const citeBtn = card.querySelector('.cite-btn');
    const citeRow = card.querySelector('.cite-row');
    citeBtn.addEventListener('click', e => {
      e.stopPropagation();
      const show = citeRow.hidden;
      citeRow.hidden = !show;
      citeBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
    });
    citeRow.querySelectorAll('.cite-act').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const fmt = b.dataset.fmt;
      const text = fmt === 'apa' ? formatAPAPlain(entry)
                 : fmt === 'bibtex' ? formatBibTeX(entry)
                 : appURL('entry/' + entry.id);
      copyText(text, b);
    }));
    // No theme-badge handler: .paper-theme-badge is never emitted by any
    // template, so this querySelectorAll always came back empty. What it bound
    // handed off to the retired Themes page and threw. Removed 2026-08-01.
    return card;
  }



  // ── render ───────────────────────────────────────────────────
