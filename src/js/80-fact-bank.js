  /* ═══════════════════════════════════════════════════════════
     FACT BANK MODULE
     Self-contained in its own closure so its helpers (esc, dots,
     formatAPACitation, paperMap, …) don't collide with the engine's.
     Exposes only factBankEnabled + initFactBank to the engine.
     The DOM for the two views is built lazily on the first tab open.
     ═══════════════════════════════════════════════════════════ */
  /* The 880 KB payload is fetched on first open of the tab rather than at page
     load (see 05-lazy.js). So the tab is enabled optimistically here and this
     module is set up only once the data has arrived. If the fetch fails, or the
     file is absent from a partial checkout, the tab removes itself then instead
     of at load; the router's `guard` keeps #fact-bank from resolving after that.

     initFactBank is called by setView on every open and must stay idempotent:
     the promise cache in loadPayload plus the _built flag make repeat opens a
     no-op, and the real builder is assigned over this one once it exists. */
  factBankEnabled = true;
  initFactBank = function () {
    loadPayload('data/fact-bank-data.js')
      .then(() => { setupFactBank(); initFactBank(); })
      .catch(() => {
        console.warn('fact-bank: payload failed to load — hiding the Fact Bank tab.');
        document.getElementById('viewFactBank')?.remove();
        factBankEnabled = false;
      });
  };

  function setupFactBank() {
    if (typeof FACT_BANK === 'undefined' || !Array.isArray(FACT_BANK) || FACT_BANK.length === 0) {
      console.warn('fact-bank: FACT_BANK not loaded — hiding the Fact Bank tab.');
      document.getElementById('viewFactBank')?.remove();
      factBankEnabled = false;
      initFactBank = function () {};
      return;
    }
    factBankEnabled = true;

    const paperMap = Object.fromEntries(RESEARCH_DATA.map(p => [p.id, p]));

    const EV_LABELS = {
      'rct': 'Randomized experiment', 'natural-experiment': 'Natural experiment',
      'administrative-data': 'Administrative data', 'audit-study': 'Audit study',
      'survey': 'Survey', 'model-projection': 'Projection / model', 'meta-analysis': 'Meta-analysis',
      'descriptive-statistics': 'Descriptive statistics', 'investigative': 'Investigative journalism',
      'legal-policy-analysis': 'Legal / policy analysis'
    };
    const KW_LABELS = {
      'inequality': 'Inequality', 'corporate-power': 'Corporate power', 'tech-democracy': 'Tech & democracy',
      'environment-energy': 'Environment & energy', 'displacement': 'Displacement', 'worker-power': 'Worker power',
      'wages': 'Wages', 'surveillance': 'Surveillance', 'discrimination': 'Discrimination', 'gender': 'Gender',
      'race': 'Race', 'gig-work': 'Gig work', 'healthcare': 'Healthcare', 'housing': 'Housing',
      'education': 'Education', 'safety-net': 'Safety net', 'global-south': 'Global South', 'solutions': 'Solutions'
    };

    function kfFormatAPACitation(p) {
      const year = p.date ? p.date.slice(0, 4) : 'n.d.';
      const src = (p.source || '').trim();
      let author = src, org = '';
      if (src.includes(' — ')) {
        const parts = src.split(' — ');
        author = parts[0].trim();
        org = parts.slice(1).join(' — ').trim();
      }
      const orgPart = org && org.toLowerCase() !== author.toLowerCase() ? ` ${org}.` : '';
      const authorDot = author.endsWith('.') ? '' : '.';
      const titleDot = /[.?!]$/.test(p.title) ? '' : '.';
      return `${author}${authorDot} (${year}). <em>${p.title}</em>${titleDot}${orgPart}`;
    }
    function apaPlain(p) { return kfFormatAPACitation(p).replace(/<\/?em>/g, ''); }

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    function pubDateOf(f) { return f.pubDate || (paperMap[f.paperId] || {}).date || ''; }
    function formatPubDate(d) {
      if (!d) return '';
      const parts = d.split('-');
      const y = parts[0];
      const mi = parts[1] ? parseInt(parts[1], 10) - 1 : null;
      return (mi != null && MONTHS[mi]) ? `${MONTHS[mi]} ${y}` : y;
    }
    function esc(s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function dots(n) { return '●'.repeat(n) + '○'.repeat(5 - n); }

    /* ── State ── */
    let q = '', evType = 'all', minPol = 1, minTruth = 1, sortBy = 'date', mode = 'paper', onlyFoundational = false;
    const activeKw = new Set();

    const byPaperView = document.getElementById('byPaperView');
    const allFactsView = document.getElementById('allFactsView');
    const emptyState = document.getElementById('kfEmptyState');
    const resultLine = document.getElementById('kfResultLine');
    const modePaperBtn = document.getElementById('modePaper');
    const modeAllBtn = document.getElementById('modeAll');

    /* ── Shared card fragments ── */
    function ratingDescHTML(f) {
      return `
      <div class="rating-desc">
        <div class="rd-row"><span class="rd-head">Political <span class="dots" aria-hidden="true">${dots(f.political)}</span><span class="sr-only">${f.political} of 5</span> ${f.political}/5</span> — ${esc(f.politicalWhy)}</div>
        <div class="rd-row"><span class="rd-head">Truth <span class="dots" aria-hidden="true">${dots(f.truth)}</span><span class="sr-only">${f.truth} of 5</span> ${f.truth}/5</span> — ${esc(f.truthWhy)}</div>
        <div class="rd-row"><span class="rd-head">Evidence: ${esc(EV_LABELS[f.evidenceType] || f.evidenceType)}</span> — ${esc(f.methodNote)}</div>
      </div>`;
    }
    function kwChipsHTML(f) {
      return (f.keywords || []).map(k => `<span class="chip chip-kw">${esc(KW_LABELS[k] || k)}</span>`).join('');
    }
    function statusChipsHTML(f) {
      const caution = f.truth <= 2 ? `<span class="chip chip-caution">Use with caution</span>` : '';
      const access = f.sourceAccess && f.sourceAccess !== 'full'
        ? `<span class="chip chip-access">Quote from ${esc(f.sourceAccess)}</span>` : '';
      const foundational = f.foundational
        ? `<span class="chip chip-foundational" title="${esc(f.foundationalWhy || 'This source contains many more citable facts than the ones extracted.')}">Foundational source</span>` : '';
      return caution + access + foundational;
    }
    function metaHTML(f, opts) {
      const rows = [];
      if (!opts || !opts.skipMethod) rows.push(`<strong>Method:</strong> ${esc(f.methodNote)}`);
      rows.push(`<strong>Where it comes from:</strong> ${esc(f.provenance)}`);
      if (f.suggestedUse) rows.push(`<strong>Suggested use:</strong> ${esc(f.suggestedUse)}`);
      if (f.foundational && f.foundationalWhy) rows.push(`<strong>Foundational source:</strong> ${esc(f.foundationalWhy)}`);
      rows.push(`<strong>Extracted and rated by:</strong> ${esc(f.model || 'unrecorded')}, ${esc(f.added || '')}`);
      return `<p class="fact-meta">${rows.join('<br>')}</p>`;
    }
    function contextHTML(f) {
      return `<div class="fact-context"><span class="lbl-grot">Surrounding paragraph from the source</span>${esc(f.context)}</div>`;
    }
    function caveatHTML(f) {
      return `<div class="fact-caveat${f.truth <= 2 ? ' warn' : ''}"><span class="lbl-grot">Take note</span>${esc(f.caveat)}</div>`;
    }
    function citeHTML(p, f) {
      const pd = formatPubDate(pubDateOf(f));
      return `<a class="cite-link" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">${kfFormatAPACitation(p)}</a>
              ${pd ? `<span class="cite-date">Published ${esc(pd)}</span>` : ''}`;
    }

    /* ── MODE 1: By-paper view ── */
    function simpleCardHTML(f) {
      const p = paperMap[f.paperId];
      return `
      <div class="cwrap" data-fid="${esc(f.id)}"><div class="cinner">
        <div class="simple-card" id="kf-card-${esc(f.id)}" tabindex="0" role="button" aria-expanded="false">
          <div class="sc-top">
            <p class="sc-plain">${esc(f.factPlain)}</p>
            <span class="expand-hint"><span class="ui-chevron chev" aria-hidden="true"></span></span>
          </div>
          <div class="details"><div class="dinner"><div class="sc-body">
            <div class="fc-quote-block">
              <span class="lbl-grot">Full quote</span>
              <blockquote class="fact-quote">${esc(f.fact)}</blockquote>
            </div>
            ${caveatHTML(f)}
            ${ratingDescHTML(f)}
            <div class="chips" style="margin-top:10px">${statusChipsHTML(f)}${kwChipsHTML(f)}</div>
            <div style="margin-top:12px">${metaHTML(f, { skipMethod: true })}</div>
            ${contextHTML(f)}
            <div class="sc-actions">
              <a class="act-btn" href="#entry/${esc(p.id)}">View in tracker</a>
              <button class="act-btn" data-copy="${esc(f.id)}">Copy fact + citation</button>
            </div>
          </div></div></div>
        </div>
      </div></div>`;
    }
    function paperGroupHTML(pid, facts) {
      const p = paperMap[pid];
      const n = facts.length;
      return `
      <div class="cwrap pg-wrap" data-pid="${esc(String(pid))}"><div class="cinner">
        <section class="paper-group" aria-label="${esc(p.title)}">
          <div class="pg-facts">${facts.map(simpleCardHTML).join('')}</div>
          <div class="pg-footer">
            <div class="pg-cite">${citeHTML(p, facts[0])}</div>
            <span class="pg-count">${facts.some(f => f.foundational) ? `<span class="chip chip-foundational" title="${esc((facts.find(f => f.foundational) || {}).foundationalWhy || '')}">Foundational source</span> &middot; ` : ''}${n} fact${n === 1 ? '' : 's'} &middot; <a class="cite-link" href="#entry/${esc(p.id)}">View in tracker</a></span>
          </div>
        </section>
      </div></div>`;
    }

    /* ── MODE 2: All-facts view ── */
    function factCardHTML(f) {
      const p = paperMap[f.paperId];
      return `
      <div class="cwrap" data-fid="${esc(f.id)}"><div class="cinner">
        <article class="fact-card" id="kf-all-${esc(f.id)}" tabindex="0" role="button" aria-expanded="false">
          <p class="fc-plain">${esc(f.factPlain)}</p>
          <div class="fc-quote-block">
            <span class="lbl-grot">Full quote</span>
            <blockquote class="fact-quote">${esc(f.fact)}</blockquote>
          </div>
          ${caveatHTML(f)}
          <div class="details"><div class="dinner"><div class="fc-details-body">
            <div class="chips">
              <span class="chip chip-rating">Political <span class="dots" aria-hidden="true">${dots(f.political)}</span><span class="sr-only">${f.political} of 5</span></span>
              <span class="chip chip-rating">Truth <span class="dots" aria-hidden="true">${dots(f.truth)}</span><span class="sr-only">${f.truth} of 5</span></span>
              <span class="chip">${esc(EV_LABELS[f.evidenceType] || f.evidenceType)}</span>
              ${statusChipsHTML(f)}${kwChipsHTML(f)}
            </div>
            ${metaHTML(f)}
            ${contextHTML(f)}
          </div></div></div>
          <div class="fact-footer">
            <div class="fc-cite">${citeHTML(p, f)}</div>
            <div class="fact-actions">
              <a class="act-btn" href="#entry/${esc(p.id)}">View in tracker</a>
              <button class="act-btn" data-copy="${esc(f.id)}">Copy fact + citation</button>
              <span class="expand-hint"><span class="ui-chevron chev" aria-hidden="true"></span> Details</span>
            </div>
          </div>
        </article>
      </div></div>`;
    }

    /* ── Sorting / grouping ── */
    function factSorter(a, b) {
      const da = pubDateOf(a), db = pubDateOf(b);
      if (sortBy === 'political') return b.political - a.political || b.truth - a.truth || db.localeCompare(da);
      if (sortBy === 'truth') return b.truth - a.truth || b.political - a.political || db.localeCompare(da);
      return db.localeCompare(da) || b.political - a.political;
    }

    const byPaper = {};
    FACT_BANK.forEach(f => { (byPaper[f.paperId] = byPaper[f.paperId] || []).push(f); });
    let paperOrder = Object.keys(byPaper);
    paperOrder.sort((a, b) => {
      const da = byPaper[a].map(f => pubDateOf(f)).sort().pop() || '';
      const db = byPaper[b].map(f => pubDateOf(f)).sort().pop() || '';
      return db.localeCompare(da);
    });

    function resortAll() {
      const wraps = Object.fromEntries([...allFactsView.children].map(w => [w.dataset.fid, w]));
      [...FACT_BANK].sort(factSorter).forEach(f => allFactsView.appendChild(wraps[f.id]));
    }
    function resortPapers() {
      const metric = pid => {
        const fs = byPaper[pid];
        if (sortBy === 'political') return Math.max(...fs.map(f => f.political));
        if (sortBy === 'truth') return Math.max(...fs.map(f => f.truth));
        return 0;
      };
      const latest = pid => byPaper[pid].map(f => pubDateOf(f)).sort().pop() || '';
      const wraps = Object.fromEntries([...byPaperView.children].map(w => [w.dataset.pid, w]));
      [...paperOrder].sort((a, b) => metric(b) - metric(a) || latest(b).localeCompare(latest(a)))
        .forEach(pid => byPaperView.appendChild(wraps[pid]));
    }

    /* ── Filtering ── */
    function matches(f) {
      if (f.political < minPol || f.truth < minTruth) return false;
      if (onlyFoundational && !f.foundational) return false;
      if (evType !== 'all' && f.evidenceType !== evType) return false;
      if (activeKw.size && ![...activeKw].every(k => (f.keywords || []).includes(k))) return false;
      if (q) {
        const p = paperMap[f.paperId] || {};
        const hay = [f.fact, f.factPlain, f.caveat, f.provenance, f.suggestedUse, f.foundationalWhy, (f.keywords || []).join(' '), p.title, p.source].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }
    function applyFilters() {
      const shown = new Set(FACT_BANK.filter(matches).map(f => f.id));
      [...allFactsView.querySelectorAll(':scope > .cwrap')].forEach(w => {
        w.classList.toggle('hidden', !shown.has(w.dataset.fid));
      });
      let visiblePapers = 0;
      [...byPaperView.querySelectorAll(':scope > .pg-wrap')].forEach(gw => {
        let any = 0;
        [...gw.querySelectorAll('.cwrap[data-fid]')].forEach(w => {
          const on = shown.has(w.dataset.fid);
          w.classList.toggle('hidden', !on);
          if (on) any++;
        });
        gw.classList.toggle('hidden', any === 0);
        if (any) visiblePapers++;
      });
      const nPapers = mode === 'paper' ? visiblePapers : new Set(FACT_BANK.filter(matches).map(f => f.paperId)).size;
      resultLine.textContent = `${shown.size} of ${FACT_BANK.length} facts, drawn from ${nPapers} sources.`;
      emptyState.hidden = shown.size !== 0;
    }

    function setMode(m) {
      mode = m;
      modePaperBtn.setAttribute('aria-pressed', String(m === 'paper'));
      modeAllBtn.setAttribute('aria-pressed', String(m === 'all'));
      byPaperView.hidden = m !== 'paper';
      allFactsView.hidden = m !== 'all';
      applyFilters();
    }

    function toggleCard(card) {
      const open = card.classList.toggle('open');
      card.setAttribute('aria-expanded', String(open));
    }
    function handleCardEvents(root) {
      root.addEventListener('click', e => {
        const cp = e.target.closest('[data-copy]');
        if (cp) {
          const f = FACT_BANK.find(x => x.id === cp.dataset.copy);
          const p = paperMap[f.paperId];
          const text = `"${f.fact}"\n\nSource: ${apaPlain(p)} ${p.sourceUrl}`;
          navigator.clipboard.writeText(text).then(() => {
            cp.textContent = 'Copied';
            cp.classList.add('copied');
            setTimeout(() => { cp.textContent = 'Copy fact + citation'; cp.classList.remove('copied'); }, 1600);
          });
          return;
        }
        if (e.target.closest('a, select, input')) return;
        const card = e.target.closest('.simple-card, .fact-card');
        if (card) toggleCard(card);
      });
      root.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.simple-card, .fact-card')) {
          e.preventDefault();
          toggleCard(e.target);
        }
      });
    }

    let kfBuilt = false;
    initFactBank = function () {
      if (kfBuilt) return;
      kfBuilt = true;

      // Populate the evidence-type select.
      const evSelect = document.getElementById('kfEvidence');
      [...new Set(FACT_BANK.map(f => f.evidenceType))].sort().forEach(t => {
        const o = document.createElement('option');
        o.value = t; o.textContent = EV_LABELS[t] || t;
        evSelect.appendChild(o);
      });

      // Build keyword pills.
      const kwCounts = {};
      FACT_BANK.forEach(f => (f.keywords || []).forEach(k => { kwCounts[k] = (kwCounts[k] || 0) + 1; }));
      const pillWrap = document.getElementById('kwPills');
      const kwActiveCount = document.getElementById('kwActiveCount');
      Object.keys(kwCounts).sort((a, b) => kwCounts[b] - kwCounts[a]).forEach(k => {
        const b = document.createElement('button');
        b.className = 'kw-pill';
        b.setAttribute('aria-pressed', 'false');
        b.dataset.kw = k;
        b.innerHTML = `${esc(KW_LABELS[k] || k)} <span class="kw-count">${kwCounts[k]}</span>`;
        b.addEventListener('click', () => {
          if (activeKw.has(k)) { activeKw.delete(k); b.setAttribute('aria-pressed', 'false'); }
          else { activeKw.add(k); b.setAttribute('aria-pressed', 'true'); }
          kwActiveCount.hidden = activeKw.size === 0;
          kwActiveCount.textContent = activeKw.size;
          applyFilters();
        });
        pillWrap.appendChild(b);
      });

      const kwToggle = document.getElementById('kwToggle');
      const kwPanel = document.getElementById('kwPanel');
      kwToggle.addEventListener('click', () => {
        const open = kwPanel.classList.toggle('open');
        kwToggle.setAttribute('aria-expanded', String(open));
      });

      document.getElementById('kfSearch').addEventListener('input', e => { q = e.target.value.toLowerCase(); applyFilters(); });
      evSelect.addEventListener('change', e => { evType = e.target.value; applyFilters(); });
      document.getElementById('kfMinPol').addEventListener('change', e => { minPol = +e.target.value; applyFilters(); });
      document.getElementById('kfMinTruth').addEventListener('change', e => { minTruth = +e.target.value; applyFilters(); });
      document.getElementById('kfFoundational').addEventListener('change', e => { onlyFoundational = e.target.checked; applyFilters(); });
      document.getElementById('kfSort').addEventListener('change', e => { sortBy = e.target.value; resortAll(); resortPapers(); applyFilters(); });

      byPaperView.innerHTML = paperOrder.map(pid => paperGroupHTML(pid, byPaper[pid])).join('');
      allFactsView.innerHTML = [...FACT_BANK].sort(factSorter).map(factCardHTML).join('');

      handleCardEvents(byPaperView);
      handleCardEvents(allFactsView);

      modePaperBtn.addEventListener('click', () => setMode('paper'));
      modeAllBtn.addEventListener('click', () => setMode('all'));

      setMode('paper');
    };
  }   // setupFactBank

  // ── Research sub-tabs: Database / What's New ─────────────────
  document.getElementById('resSubviewDatabase')?.addEventListener('click', () => {
    setResearchSubview('database');
    setView('cards');
  });
  document.getElementById('resSubviewChangelog')?.addEventListener('click', () => {
    setResearchSubview('changelog');
    setView('cards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  // Entry links inside the log route through the hash router, which drops
  // back to the database sub-tab and flashes the card.
  document.getElementById('changelogArea')?.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#entry/"]');
    if (!a) return;
    e.preventDefault();
    location.hash = a.getAttribute('href').slice(1);
  });

  // ── init ─────────────────────────────────────────────────────
  // Adoption chain prev/next controls, built before routing so a
  // #adoption/<link> deep link lands on a finished panel.
  buildAdSteps();

  // R2: honor a deep link if one is present; otherwise land on About (home).
  if (!applyHashRoute()) setView('about');
  window.addEventListener('hashchange', applyHashRoute);

  // What's new: pulse the count pill once per page load when there is
  // something unseen (skipped if a #changelog deep link already cleared it).
  updateWhatsChangedPill();
  (() => {
    const pill = document.getElementById('whatsChangedPill');
    if (!pill || pill.hidden) return;
    pill.classList.add('pulse');
    pill.addEventListener('animationend', () => pill.classList.remove('pulse'), { once: true });
  })();

