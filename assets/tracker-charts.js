/* ═══════════════════════════════════════════════════════════════════════════
   tracker-charts.js — charts for the Data Tracker sub-tabs of index.html
   other than Census BTOS, which assets/adoption-charts.js still owns.

   EVERY NUMBER HERE COMES FROM AN ALREADY-PUBLISHED CONTRACT. Nothing is
   fetched, computed or estimated in the browser; nothing is hard-coded. If a
   payload is absent the panel says so rather than drawing something plausible.

   Data globals, and the contract that regenerates each:
     window.JOBS_DISPLACEMENT_DATA   Rscript analysis/run.R jobs-displacement
       .okun.level        unemployment rate, CBO natural rate, gap
       .okun.prime_age    25-54 LFPR and EPOP, monthly from 2000
       .okun.scatter      real GDP growth by quarter, 1948Q2 onward
       .okun.fit          Okun regression, incl. breakeven growth
       .age_bands         actual vs predicted unemployment by age x education
     window.BTOS_JOBS_MONITOR        Rscript analysis/run.R btos-jobs-monitor
       .a1.groups         CES payroll employment index by AI-adoption group
       .a2.series         JOLTS hires/openings/layoffs/quits by adoption group

   Drawing primitives come from ADOPTION_CHARTS rather than being duplicated
   here, so both tabs share one visual vocabulary and one tooltip layer. That
   makes adoption-charts.js load-order-critical: it must come first.

   Renderers target canonical ids, all prefixed `trk`:
     renderJobs()  -> #trkPrimeAge #trkCes  + #trkJobsStats
     renderJolts() -> #trkJoltsQuits #trkJoltsHires #trkJoltsLayoffs
                      #trkJoltsOpenings + #trkJoltsStats
     renderGdp()   -> #trkGdp + #trkGdpStats
   Productivity has no renderer because it has no data; see next_phases.md.

   Fixed viewBox everywhere, no clientWidth: sub-tab panels are in the DOM but
   hidden until selected, and a hidden element measures zero.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const A = window.ADOPTION_CHARTS;
  if (!A) { console.error('tracker: ADOPTION_CHARTS not found — load adoption-charts.js first'); return; }

  const { C, timePanel, fmtDate, fin, num, sgn } = A;
  const JD = window.JOBS_DISPLACEMENT_DATA;
  const JM = window.BTOS_JOBS_MONITOR;

  const byId = id => document.getElementById(id);
  const set  = (id, html) => { const el = byId(id); if (el) el.innerHTML = html; };

  /* An absent payload is a missing build, not a rendering bug. Say which
     command fixes it instead of leaving an empty frame. */
  function missing(svgId, global, contract) {
    const el = byId(svgId);
    if (!el) return;
    el.innerHTML =
      `<text x="16" y="26" font-size="12" fill="${C.terra}">${global} not loaded.</text>` +
      `<text x="16" y="46" font-size="11" fill="${C.muted}">Rebuild: Rscript analysis/run.R ${contract}</text>`;
  }

  /* Stat tiles. `sub` carries the units and the vintage, because a number on a
     screenshot without them is the thing this whole repo exists to avoid. */
  const stats = rows => rows.map(r => `
    <div class="trk-stat${r.weak ? ' weak' : ''}">
      <div class="trk-stat-v">${r.value}</div>
      <div class="trk-stat-l">${r.label}</div>
      ${r.sub ? `<div class="trk-stat-s">${r.sub}</div>` : ''}
    </div>`).join('');

  const GROUP_COLOR = {
    'High adoption': C.terra,
    'Middle':        C.navyMute,
    'Low adoption':  C.navy,
  };
  const GROUP_ORDER = ['High adoption', 'Middle', 'Low adoption'];

  /* ── JOBS ────────────────────────────────────────────────────────────────
     Two charts: labour force attachment for the prime-age population, and
     payroll employment split by how much AI its industry reports using. */
  function renderJobs() {
    if (!JD || !JD.okun) { missing('trkPrimeAge', 'JOBS_DISPLACEMENT_DATA', 'jobs-displacement'); return; }
    const o = JD.okun, lv = o.level, pa = o.prime_age;

    const ab = JD.age_bands && JD.age_bands.headline;
    const yg = ab && ab.young_grad;

    set('trkJobsStats', stats([
      { value: num(lv.unrate, 1) + '%', label: 'Unemployment rate',
        sub: lv.unrate_month + ' &middot; CBO natural rate ' + num(lv.nrou, 1) + '%' },
      { value: sgn(lv.gap, 1) + ' pp', label: 'Gap to the natural rate',
        sub: 'negative means unemployment is below it' },
      { value: num(pa.epop_now, 1) + '%', label: 'Prime-age employment rate',
        sub: '25&ndash;54 &middot; ' + sgn(pa.epop_vs_feb2020, 1) + ' pp vs Feb 2020' },
      { value: num(pa.lfpr_now, 1) + '%', label: 'Prime-age participation',
        sub: '25&ndash;54 &middot; ' + sgn(pa.lfpr_vs_feb2020, 1) + ' pp vs Feb 2020' },
    ].concat(yg ? [{
      value: num(yg.ratio, 2) + '&times;', label: 'Young graduate unemployment',
      sub: 'actual vs predicted, ' + ab.latest_month + ' &middot; ' + num(yg.actual * 100, 1) + '% vs ' + num(yg.pred * 100, 1) + '%',
      weak: true,
    }] : [])));

    /* Prime-age LFPR and EPOP, monthly since 2000. Both are percentages of
       the 25-54 population, so one axis serves both. */
    const svg = byId('trkPrimeAge');
    if (svg) timePanel(svg, [
      { pts: pa.series.map(p => ({ date: p.date, est: p.lfpr })), color: C.navy,
        width: 2.2, dot: false, label: 'Participation', tipLabel: 'Labour force participation, 25-54' },
      { pts: pa.series.map(p => ({ date: p.date, est: p.epop })), color: C.green,
        width: 2.2, dot: false, label: 'Employment', tipLabel: 'Employment-population ratio, 25-54' },
    ], { H: 320, ymin: 74, ymax: 86 });
    set('trkPrimeAgeNote',
      'Monthly, seasonally adjusted, ' + pa.series.length + ' observations from ' +
      fmtDate(pa.series[0].date) + ' to ' + pa.latest_month +
      '. Prime age isolates labour supply from the ageing of the population, which drags the headline participation rate down regardless of the cycle.');

    /* Payroll employment by adoption group. Index, not a rate: unit ''. */
    const ces = byId('trkCes');
    if (ces && JM && JM.a1) {
      timePanel(ces, GROUP_ORDER.filter(g => JM.a1.groups.some(x => x.grp === g)).map(g => {
        const grp = JM.a1.groups.find(x => x.grp === g);
        return { pts: grp.points.map(p => ({ date: p.date, est: p.index })), color: GROUP_COLOR[g],
                 width: g === 'Middle' ? 1.8 : 2.4, dot: false, label: g, tipLabel: g + ' industries' };
      }), { H: 320, unit: '', mR: 130 });
      set('trkCesNote',
        'CES payroll employment, seasonally adjusted, indexed to January 2019 = 100, through ' +
        fmtDate(JM.ces_latest) + '. Industries are sorted into thirds by the share of their firms reporting AI use in BTOS before the November 2025 question change. ' +
        'Sorting industries by adoption is not a treatment: high-adoption industries differ from low-adoption ones in many ways, and this chart identifies nothing.');
    } else if (ces) {
      missing('trkCes', 'BTOS_JOBS_MONITOR', 'btos-jobs-monitor');
    }
  }

  /* ── JOLTS ───────────────────────────────────────────────────────────────
     Four flows, each split three ways by adoption. What is published is the
     adoption split, NOT the national headline rate; the copy says so. */
  function renderJolts() {
    if (!JM || !JM.a2) { missing('trkJoltsQuits', 'BTOS_JOBS_MONITOR', 'btos-jobs-monitor'); return; }
    const S = JM.a2.series;

    const panel = (outcome, svgId) => {
      const svg = byId(svgId);
      if (!svg) return null;
      const lines = GROUP_ORDER
        .map(g => S.find(s => s.outcome === outcome && s.grp === g))
        .filter(Boolean)
        .map(s => ({
          pts: s.points.map(p => ({ date: p.date, est: p.rate })),
          color: GROUP_COLOR[s.grp], width: s.grp === 'Middle' ? 1.6 : 2.2,
          dot: false, label: s.grp, tipLabel: s.grp + ' industries, ' + outcome + ' rate',
        }));
      if (!lines.length) { missing(svgId, 'BTOS_JOBS_MONITOR.a2', 'btos-jobs-monitor'); return null; }
      timePanel(svg, lines, { H: 260, mR: 130 });
      return lines;
    };

    panel('quits', 'trkJoltsQuits');
    panel('hires', 'trkJoltsHires');
    panel('layoffs', 'trkJoltsLayoffs');
    panel('openings', 'trkJoltsOpenings');

    /* Latest reading per flow, high vs low, straight off the series. */
    const latest = (outcome, grp) => {
      const s = S.find(x => x.outcome === outcome && x.grp === grp);
      if (!s || !s.points.length) return null;
      return s.points[s.points.length - 1];
    };
    const row = outcome => {
      const hi = latest(outcome, 'High adoption'), lo = latest(outcome, 'Low adoption');
      if (!hi || !lo) return null;
      return { value: num(hi.rate, 1) + '%', label: 'High-adoption ' + outcome + ' rate',
               sub: 'low-adoption ' + num(lo.rate, 1) + '% &middot; gap ' + sgn(hi.rate - lo.rate, 1) + ' pp' };
    };
    set('trkJoltsStats', stats(['quits', 'hires', 'layoffs', 'openings'].map(row).filter(Boolean)));

    const any = S.find(s => s.points && s.points.length);
    set('trkJoltsNote', !any ? '' :
      'JOLTS rates, seasonally adjusted, monthly, ' + fmtDate(any.points[0].date) + ' to ' +
      fmtDate(JM.jolts_latest) + '. Rates are shares of employment, so they are comparable across groups of different size. ' +
      'These are the adoption-split series the published contract carries; the national headline rates are a separate build that is not wired up yet.');
  }

  /* ── GDP ─────────────────────────────────────────────────────────────────
     Real GDP growth by quarter, from the same payload the Okun fit uses.
     Quarters are dated to their first month, which is the convention the
     chart's x axis needs and is stated in the note. */
  function renderGdp() {
    if (!JD || !JD.okun) { missing('trkGdp', 'JOBS_DISPLACEMENT_DATA', 'jobs-displacement'); return; }
    const o = JD.okun, f = o.fit, r = o.recent;

    const QM = { Q1: '01', Q2: '04', Q3: '07', Q4: '10' };
    const toDate = label => {
      const m = /^(\d{4})(Q[1-4])$/.exec(label);
      return m ? `${m[1]}-${QM[m[2]]}-01` : null;
    };

    /* The tracker view shows 2015 onward for legibility. The Okun fit behind
       the breakeven number still uses the whole 1948Q2-2026Q2 sample; the note
       says both, because a truncated chart beside a full-sample statistic is
       exactly the sort of thing that gets misread. */
    const FROM = 2015;
    const pts = o.scatter
      .filter(p => fin(p.gdp_growth) && p.year >= FROM && toDate(p.label))
      .map(p => ({ date: toDate(p.label), est: p.gdp_growth, label: p.label }));

    const svg = byId('trkGdp');
    if (svg && pts.length) {
      timePanel(svg, [{ pts, color: C.navy, width: 2.2, label: 'Real GDP', tipLabel: 'Annualised quarterly growth' }],
        { H: 320, ymin: Math.min(-4, ...pts.map(p => p.est)) });
    } else if (svg) {
      missing('trkGdp', 'JOBS_DISPLACEMENT_DATA.okun.scatter', 'jobs-displacement');
    }

    set('trkGdpStats', stats([
      { value: num(r.last_gdp_growth, 1) + '%', label: 'Real GDP growth',
        sub: r.last_quarter + ' &middot; annualised quarterly rate' },
      { value: num(f.breakeven_growth, 2) + '%', label: 'Okun breakeven growth',
        sub: 'growth that holds unemployment flat' },
      { value: sgn(r.last_gdp_growth - f.breakeven_growth, 1) + ' pp', label: 'Growth vs breakeven',
        sub: 'negative implies rising unemployment, other things equal' },
      { value: sgn(r.residual_mean, 2) + ' pp', label: 'Okun residual, last 4 quarters',
        sub: 'actual minus predicted change in unemployment', weak: true },
    ]));

    set('trkGdpNote',
      'Bureau of Economic Analysis real GDP, annualised quarterly growth. Chart shows ' +
      FROM + ' onward (' + pts.length + ' quarters). The Okun relationship behind the breakeven figure is fitted over ' +
      f.sample_start.slice(0, 4) + '&ndash;' + f.sample_end.slice(0, 4) +
      ' (' + o.scatter.length + ' quarters, excluding ' + (f.excluded || []).join(' and ') +
      '), slope ' + num(f.slope, 4) + ', R&sup2; ' + num(f.r2, 2) +
      '. Quarters are plotted at their first month.');
  }

  function renderAll() {
    try { renderJobs(); }  catch (e) { console.error('tracker: jobs', e); }
    try { renderJolts(); } catch (e) { console.error('tracker: jolts', e); }
    try { renderGdp(); }   catch (e) { console.error('tracker: gdp', e); }
  }

  window.TRACKER_CHARTS = { renderAll, renderJobs, renderJolts, renderGdp };
  if (document.readyState !== 'loading') renderAll();
  else document.addEventListener('DOMContentLoaded', renderAll);
})();
