  /* ── R5: changelog — a dated feed of database additions & policy reviews ── */
  function buildChangelogHTML() {
    const fmtD = s => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const groups = {};
    RESEARCH_DATA.forEach(e => {
      const d = e.added || e.date;
      (groups[d] = groups[d] || { entries: [], policies: 0 }).entries.push(e);
    });
    POLICY_DATA.forEach(p => {
      if (!p.lastReviewed) return;
      (groups[p.lastReviewed] = groups[p.lastReviewed] || { entries: [], policies: 0 }).policies++;
    });
    const dates = Object.keys(groups).sort().reverse();
    const firstDate = dates[dates.length - 1];
    const html = dates.map(d => {
      const g = groups[d];
      const parts = [`<h3 class="clog-date">${fmtD(d)}</h3>`];
      if (g.policies) parts.push(`<div class="clog-line">Policy Map: ${g.policies === POLICY_DATA.length ? 'all ' : ''}${g.policies} ${g.policies === 1 ? 'policy' : 'policies'} reviewed</div>`);
      if (g.entries.length > 20) {
        parts.push(`<div class="clog-line">${g.entries.length} research entries added${d === firstDate ? ' (initial database import)' : ''}</div>`);
      } else if (g.entries.length) {
        g.entries
          .slice()
          .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
          .forEach(e => parts.push(
            `<div class="clog-entry"><a href="#entry/${e.id}">${e.title}</a><span class="clog-entry-src"> — ${e.source}</span></div>`
          ));
      }
      return `<div class="clog-group">${parts.join('')}</div>`;
    }).join('');
    return `<div class="clog-intro">Every dated change to the tracker: research entries added (by intake date) and Policy Map review passes. Click an entry to jump to it.</div>${html}`;
  }

  /* What's New is a sub-tab of Research rather than a modal: it renders
     inline into #changelogArea, so it can be linked, scrolled and printed
     like any other section. Built lazily and cached. */
  let _changelogBuilt = false;

  function setResearchSubview(sub) {
    researchSubview = sub === 'changelog' ? 'changelog' : 'database';
    const dbBtn  = document.getElementById('resSubviewDatabase');
    const clBtn  = document.getElementById('resSubviewChangelog');
    const isClog = researchSubview === 'changelog';
    if (dbBtn) {
      dbBtn.classList.toggle('active', !isClog);
      dbBtn.setAttribute('aria-pressed', isClog ? 'false' : 'true');
    }
    if (clBtn) {
      clBtn.classList.toggle('active', isClog);
      clBtn.setAttribute('aria-pressed', isClog ? 'true' : 'false');
    }
    document.body.classList.toggle('changelog-subview', isClog && activeView === 'cards');
    if (isClog) {
      const area = document.getElementById('changelogArea');
      if (area && !_changelogBuilt) { area.innerHTML = buildChangelogHTML(); _changelogBuilt = true; }
      markChangesSeen();
    }
    applyMastheadCopy();
  }

  function applyPolFilters() {}

