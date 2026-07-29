/* ═══════════════════════════════════════════════════════════════════════════
   jobs-monitor-charts.js — the descriptive CES/JOLTS section of the JOB
   DISPLACEMENT tab. Inline SVG, no chart library, works over file://.

   Data: window.BTOS_JOBS_MONITOR (data/btos-jobs-monitor-data.js), a slice of
   the Tier-4 build in data_analysis/btos/03_jobs_join.R. BTOS adoption is used
   only to split industries into higher- and lower-adoption groups; everything
   plotted is BLS.

   Renderers:
     renderBoard()   -> #jdmBoard    (5 gap cards with sparklines)
     renderDecomp()  -> #jdmDecomp   (net hiring change split hires vs seps)
     renderQuad()    -> #jdmQuad     (freeze-or-shed scatter)
     renderMde()     -> #jdmMde      (what this design can and cannot detect)

   Organised around hires-versus-separations rather than the employment level,
   because the displacement result this literature turns on attributes almost
   all of the decline to reduced hiring. Payroll counts are the wrong variable
   at the wrong frequency.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const J = window.BTOS_JOBS_MONITOR;
  if (!J) { console.error('BTOS_JOBS_MONITOR not found — monitor section will be empty.'); return; }

  const C = {
    navy: '#2c3254', navyMute: '#9498b4', green: '#70ad8f', gold: '#c99a3f',
    goldLine: '#ebc382', terra: '#b06a4f', purple: '#472b51',
    muted: '#6d7091', grid: '#e6e2d1', text: '#3c4164', headline: '#232849'
  };
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const byId = id => document.getElementById(id);
  const esc  = s => encodeURIComponent(s);
  const lin  = (d0, d1, r0, r1) => { const m = (r1 - r0) / (d1 - d0); return v => r0 + (v - d0) * m; };
  const fin  = v => v != null && v !== '' && isFinite(v);
  const num  = (v, dp) => !fin(v) ? '—' : (+v).toFixed(dp == null ? 2 : dp);
  const sgn  = (v, dp) => !fin(v) ? '—' : (v >= 0 ? '+' : '') + (+v).toFixed(dp == null ? 2 : dp);
  const arr  = x => x == null ? [] : (Array.isArray(x) ? x : [x]);
  const fmtDate = s => { const p = String(s).split('-'); return MON[+p[1] - 1] + ' ' + p[0]; };
  const setHTML = (id, v) => { const e = byId(id); if (e) e.innerHTML = v; };

  function ticks(min, max, n) {
    if (!(isFinite(min) && isFinite(max)) || min === max) return [min];
    const raw = (max - min) / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const nn = raw / mag; const step = (nn < 1.5 ? 1 : nn < 3 ? 2 : nn < 7 ? 5 : 10) * mag;
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) out.push(+v.toFixed(6));
    return out;
  }

  let tip;
  function bindTips(svg) {
    if (!tip) {
      tip = document.querySelector('.jd-tooltip');
      if (!tip) { tip = document.createElement('div'); tip.className = 'jd-tooltip'; document.body.appendChild(tip); }
    }
    svg.addEventListener('mousemove', e => {
      const t = e.target.closest('[data-tip]');
      if (t) {
        tip.innerHTML = decodeURIComponent(t.getAttribute('data-tip'));
        tip.style.opacity = 1;
        let x = e.clientX + 14; if (x + 260 > window.innerWidth) x = e.clientX - 250;
        tip.style.left = x + 'px'; tip.style.top = (e.clientY + 14) + 'px';
      } else tip.style.opacity = 0;
    });
    svg.addEventListener('mouseleave', () => { if (tip) tip.style.opacity = 0; });
  }

  /* ══ status board ═════════════════════════════════════════════════════════
     Five higher-minus-lower-adoption gaps. Each card carries a post-2021
     sparkline: the 2020 spikes are two orders of magnitude larger than
     anything since and would flatten every later movement to a straight line. */
  function spark(pts, w, h) {
    pts = pts.filter(p => fin(p.v) && Date.parse(p.date) >= Date.parse('2022-01-01'));
    if (pts.length < 2) return '';
    const xs = pts.map(p => Date.parse(p.date)), ys = pts.map(p => p.v);
    let lo = Math.min(0, ...ys), hi = Math.max(0, ...ys);
    const pad = (hi - lo) * 0.15 || 0.2; lo -= pad; hi += pad;
    const X = lin(Math.min(...xs), Math.max(...xs), 1, w - 1), Y = lin(lo, hi, h - 1, 1);
    const last = pts[pts.length - 1];
    return `<svg class="jdm-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">` +
      `<line x1="0" y1="${Y(0)}" x2="${w}" y2="${Y(0)}" stroke="${C.navyMute}" stroke-width="0.8" stroke-dasharray="2,2"/>` +
      `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + X(Date.parse(p.date)).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join(' ')}" ` +
      `fill="none" stroke="${C.navy}" stroke-width="1.4"/>` +
      `<circle cx="${X(Date.parse(last.date)).toFixed(1)}" cy="${Y(last.v).toFixed(1)}" r="2" fill="${C.terra}"/></svg>`;
  }

  function renderBoard() {
    const el = byId('jdmBoard'); if (!el) return;
    const board = arr(J.monitor && J.monitor.board);
    if (!board.length) { el.innerHTML = ''; return; }
    el.innerHTML = board.map(b => {
      const sign = b.latest >= 0 ? 'pos' : 'neg';
      return `<div class="jdm-card">
        <div class="jdm-card-name">${b.name}</div>
        <div class="jdm-card-val ${sign}">${sgn(b.latest, 2)}<small> ${b.unit.split(',')[0]}</small></div>
        ${spark(arr(b.spark), 150, 34)}
        <div class="jdm-card-foot">12-mo change ${sgn(b.chg12, 2)} &middot; as of ${fmtDate(b.as_of)}</div>
        <div class="jdm-card-note">${b.note}</div>
      </div>`;
    }).join('');
  }

  /* ══ hires-vs-separations decomposition ══════════════════════════════════ */
  function renderDecomp() {
    const svg = byId('jdmDecomp'); if (!svg) return;
    const rows = arr(J.monitor && J.monitor.decomp)
      .filter(r => fin(r.d_net))
      .sort((a, b) => a.d_net - b.d_net);
    if (!rows.length) { svg.innerHTML = ''; return; }
    const W = 700, mL = 210, mR = 40, mT = 14, mB = 40, rowH = 26;
    const ph = rows.length * rowH, H = mT + ph + mB, pw = W - mL - mR;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const vals = rows.flatMap(r => [r.hires_term, -r.seps_term, r.d_net]).filter(fin);
    let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
    const pad = (hi - lo) * 0.12 || 0.5; lo -= pad; hi += pad;
    const X = lin(lo, hi, mL, mL + pw), zX = X(0);

    let s = '';
    ticks(lo, hi, 6).forEach(t => { const x = X(t);
      s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}"/>` +
           `<text x="${x}" y="${mT + ph + 16}" text-anchor="middle" font-size="10.5" fill="${C.muted}">${sgn(t, 1)}</text>`; });
    s += `<line x1="${zX}" y1="${mT}" x2="${zX}" y2="${mT + ph}" stroke="${C.muted}" stroke-width="1.2"/>`;

    rows.forEach((r, i) => {
      const cy = mT + i * rowH + rowH / 2;
      // hires term above, separations term below. A negative separations term
      // RAISES net hiring, so plot its contribution with the sign it makes.
      const bars = [
        { v: r.hires_term, col: C.terra, y: cy - 9, lab: 'hires' },
        { v: -r.seps_term, col: C.navyMute, y: cy + 1, lab: 'separations' }
      ];
      bars.forEach(bar => {
        if (!fin(bar.v)) return;
        const x2 = X(bar.v);
        s += `<rect x="${Math.min(zX, x2)}" y="${bar.y}" width="${Math.abs(x2 - zX)}" height="8" rx="1.5" fill="${bar.col}" ` +
             `data-tip="${esc(`<b>${r.title}</b><br>adoption ${num(r.adoption, 1)}%<br>hires term ${sgn(r.hires_term, 2)} pp<br>separations term ${sgn(-r.seps_term, 2)} pp<br><b>net hiring ${sgn(r.d_net, 2)} pp</b>`)}"/>`;
      });
      s += `<circle cx="${X(r.d_net)}" cy="${cy}" r="3.4" fill="${C.headline}" stroke="#fff" stroke-width="1"/>`;
      const t = r.title.length > 30 ? r.title.slice(0, 29) + '…' : r.title;
      s += `<text x="${mL - 8}" y="${cy + 3.5}" text-anchor="end" font-size="10.5" fill="${C.text}">${t}</text>`;
    });
    s += `<text x="${mL + pw / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="${C.text}">Change in rate since 2015–19 average (pp)</text>`;
    svg.innerHTML = s; bindTips(svg);

    setHTML('jdmDecompLegend',
      `<span><i style="background:${C.terra}"></i>hires contribution</span>` +
      `<span><i style="background:${C.navyMute}"></i>separations contribution</span>` +
      `<span><i class="dot" style="background:${C.headline}"></i>net hiring rate, total change</span>`);

    const neg = rows.filter(r => r.hires_term < 0).length;
    setHTML('jdmDecompNote',
      `For each JOLTS supersector, the change in the net hiring rate since its 2015–19 average, split into the part ` +
      `coming from hires and the part coming from separations. <b>${neg} of ${rows.length}</b> supersectors show a ` +
      `negative hires contribution. The separations side barely moves. Whatever is cooling the labor market is ` +
      `working through the hiring door, not the firing door. Sorted by total change. JOLTS through ` +
      `${fmtDate(J.jolts_latest)}.`);
  }

  /* ══ freeze-or-shed quadrant ══════════════════════════════════════════════
     The strongest caveat on the whole exercise, so it gets its own exhibit
     rather than a footnote: the hiring freeze is economy-wide, not confined
     to the AI-exposed industries.                                            */
  function renderQuad() {
    const svg = byId('jdmQuad'); if (!svg) return;
    const rows = arr(J.monitor && J.monitor.quad).filter(r => fin(r.x) && fin(r.y));
    if (!rows.length) { svg.innerHTML = ''; return; }
    const W = 700, H = 400, mL = 58, mR = 22, mT = 18, mB = 48, pw = W - mL - mR, ph = H - mT - mB;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const xs = rows.map(r => r.x), ys = rows.map(r => r.y);
    let x0 = Math.min(0, ...xs), x1 = Math.max(0, ...xs), y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys);
    const xp = (x1 - x0) * 0.12 || 0.3, yp = (y1 - y0) * 0.12 || 0.3;
    x0 -= xp; x1 += xp; y0 -= yp; y1 += yp;
    const X = lin(x0, x1, mL, mL + pw), Y = lin(y0, y1, mT + ph, mT);
    const rmax = Math.max(...rows.map(r => r.emp_w || 1));

    let s = '';
    ticks(y0, y1, 5).forEach(t => { const y = Y(t);
      s += `<line x1="${mL}" y1="${y}" x2="${mL + pw}" y2="${y}" stroke="${C.grid}"/>` +
           `<text x="${mL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${C.muted}">${sgn(t, 1)}</text>`; });
    ticks(x0, x1, 6).forEach(t => { const x = X(t);
      s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}"/>` +
           `<text x="${x}" y="${mT + ph + 18}" text-anchor="middle" font-size="11" fill="${C.muted}">${sgn(t, 1)}</text>`; });
    s += `<line x1="${X(0)}" y1="${mT}" x2="${X(0)}" y2="${mT + ph}" stroke="${C.navyMute}" stroke-width="1.2"/>`;
    s += `<line x1="${mL}" y1="${Y(0)}" x2="${mL + pw}" y2="${Y(0)}" stroke="${C.navyMute}" stroke-width="1.2"/>`;
    s += `<text x="${mL + 6}" y="${mT + 13}" font-size="10" fill="${C.muted}">freezing and shedding</text>`;
    s += `<text x="${mL + pw - 6}" y="${mT + ph - 6}" text-anchor="end" font-size="10" fill="${C.muted}">hiring and holding</text>`;
    rows.forEach(r => {
      const rad = 4 + 9 * Math.sqrt((r.emp_w || 1) / rmax);
      s += `<circle cx="${X(r.x)}" cy="${Y(r.y)}" r="${rad.toFixed(1)}" fill="${C.navy}" fill-opacity="0.45" stroke="#fff" stroke-width="0.9" ` +
           `data-tip="${esc(`<b>${r.title}</b><br>AI adoption ${num(r.adoption, 1)}%<br>Δ hires rate ${sgn(r.x, 2)} pp<br>Δ layoffs rate ${sgn(r.y, 2)} pp<br>${num((r.emp_w || 0) / 1000, 1)}m employees`)}"/>`;
    });
    s += `<text x="${mL + pw / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="${C.text}">Change in hires rate since 2015–19 (pp)</text>`;
    s += `<text transform="translate(14,${mT + ph / 2}) rotate(-90)" text-anchor="middle" font-size="11" fill="${C.text}">Change in layoffs rate since 2015–19 (pp)</text>`;
    svg.innerHTML = s; bindTips(svg);

    const left = rows.filter(r => r.x < 0).length, up = rows.filter(r => r.y > 0).length;
    setHTML('jdmQuadNote',
      `Each bubble is a JOLTS supersector, sized by employment. <b>${left} of ${rows.length}</b> sit left of the ` +
      `vertical axis — hiring below its pre-pandemic pace — while only <b>${up}</b> sit above the horizontal axis on ` +
      `layoffs. That is the freeze-not-shed pattern, and it is the honest complication in this analysis: it is ` +
      `<i>economy-wide</i>, not concentrated in the AI-adopting industries. A hiring freeze this general is not, on ` +
      `its own, evidence of AI displacement.`);
  }

  /* ══ what this design can detect ══════════════════════════════════════════ */
  function renderMde() {
    const m = arr(J.monitor && J.monitor.mde).find(r => r.level === 'subsector');
    if (!m) return;
    setHTML('jdmMde',
      `<div class="jd-stat"><div class="n">${(Math.abs(m.mde) / 1000).toFixed(0)}<small>k jobs</small></div>` +
      `<div class="l">smallest effect this cross-section could reliably detect, at n = ${m.n} subsectors</div></div>` +
      `<div class="jd-stat"><div class="n">159<small>k jobs</small></div>` +
      `<div class="l">the size of the effect the leading displacement estimate reports</div></div>`);
    const jobs = v => Math.abs(v) >= 1e6 ? (Math.abs(v) / 1e6).toFixed(2) + ' million' : Math.round(Math.abs(v) / 1000) + ',000';
    setHTML('jdmMdeNote',
      `Scaling the subsector employment coefficient by the jobs it covers gives a point estimate of about ` +
      `<b>${jobs(m.est)} jobs</b>, with a 95% interval running from ${jobs(m.hi)} to ${jobs(m.lo)} — wide enough to be ` +
      `consistent with almost any story. The same arithmetic shows the design can only distinguish an effect larger ` +
      `than roughly <b>${jobs(m.mde)} jobs</b> from zero. A null result here is therefore close to uninformative about ` +
      `a displacement effect of the size the microdata literature actually estimates. This belongs on the page, not ` +
      `in a footnote.`);
  }

  function renderAll() {
    try { renderBoard(); }  catch (e) { console.error('monitor: board', e); }
    try { renderDecomp(); } catch (e) { console.error('monitor: decomp', e); }
    try { renderQuad(); }   catch (e) { console.error('monitor: quad', e); }
    try { renderMde(); }    catch (e) { console.error('monitor: mde', e); }
    setHTML('jdmVintage',
      `CES through ${fmtDate(J.ces_latest)} &middot; JOLTS through ${fmtDate(J.jolts_latest)} &middot; ` +
      `${J.counts.jolts} JOLTS supersectors, ${J.counts.subsector} BTOS subsectors matched to CES &middot; build ${J.vintage}`);
  }

  window.JOBS_MONITOR_CHARTS = { C, data: J, renderAll };
  if (document.readyState !== 'loading') renderAll();
  else document.addEventListener('DOMContentLoaded', renderAll);
})();
