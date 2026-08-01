  /* ── What's new (count pill on the Research sub-tab) ─────────── */
  // The pill counts entries added since the log was last opened (day
  // granularity), falling back to the 30-day window for first-time visitors.
  // Reads the old banner's wnbSeen marker so existing visitors migrate cleanly.
  function whatsChangedState() {
    const fallback = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const seen = localStorage.getItem('wcSeen') || localStorage.getItem('wnbSeen') || fallback;
    const count = RESEARCH_DATA.filter(e => (e.added || e.date) > seen).length;
    const newest = RESEARCH_DATA.reduce((m, e) => { const d = e.added || e.date; return d > m ? d : m; }, '');
    return { count, newest };
  }

  function markChangesSeen() {
    const { newest } = whatsChangedState();
    if (newest) localStorage.setItem('wcSeen', newest);
    updateWhatsChangedPill();
  }

  function updateWhatsChangedPill() {
    const btn  = document.getElementById('resSubviewChangelog');
    const pill = document.getElementById('whatsChangedPill');
    if (!btn || !pill) return;
    const { count } = whatsChangedState();
    if (count > 0) {
      pill.textContent = count;
      pill.hidden = false;
      btn.setAttribute('aria-label', `What's New, ${count} new ${count === 1 ? 'entry' : 'entries'}`);
    } else {
      pill.hidden = true;
      btn.setAttribute('aria-label', "What's New");
    }
  }


