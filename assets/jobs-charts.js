/* ═══════════════════════════════════════════════════════════════════════════
   jobs-charts.js — shared chart engine for the Job-displacement prototypes.

   Draws the four charts behind the three-part "is AI displacing workers?"
   story as inline SVG (no chart library, works over file://). Every render
   function targets canonical element IDs so any layout that provides those
   IDs gets the same charts:

     renderOkun()   -> #okunChart  (+ #okunSub #okunLegend #okunNote)
     renderLFP()    -> #lfpChart   (+ #lfpLegend)
     renderAges()   -> #ageChart   (+ #ageLegend #ageNote #distFlag?)
     renderCES()    -> #cesChart   (+ #cesSub #cesNote)

   Data comes from window.JOBS_DISPLACEMENT_DATA (data/jobs-displacement-data.js).
   Reads/derived numbers are exposed on window.JOBS_CHARTS for the summary
   panels. Animation is CSS-driven via the classes anim-line / anim-bar /
   anim-pop — pages that omit the keyframes simply get static charts.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const D = window.JOBS_DISPLACEMENT_DATA;
  if (!D) { console.error('JOBS_DISPLACEMENT_DATA not found'); return; }

  const C = {
    navy: '#2c3254', green: '#70ad8f', gold: '#c99a3f', goldLine: '#ebc382',
    pink: '#ff9d7d', terra: '#b06a4f', purple: '#472b51', muted: '#6d7091',
    grid: '#e6e2d1', text: '#3c4164', headline: '#232849'
  };
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const byId = id => document.getElementById(id);
  const esc = s => encodeURIComponent(s);
  const lin = (d0, d1, r0, r1) => { const m = (r1 - r0) / (d1 - d0); return v => r0 + (v - d0) * m; };
  const sgn = (v, dp) => (v >= 0 ? '+' : '') + v.toFixed(dp == null ? 1 : dp);
  const fmtDate = s => { const p = s.split('-'); return MON[+p[1] - 1] + ' ' + p[0]; };

  function ticks(min, max, n) {
    const span = max - min, raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag; let step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
    step *= mag;
    const out = [], start = Math.ceil(min / step) * step;
    for (let v = start; v <= max + step * 1e-6; v += step) out.push(+v.toFixed(6));
    return out;
  }

  // Shared tooltip (created once)
  let tip;
  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'jd-tooltip';
    document.body.appendChild(tip);
    return tip;
  }
  function placeTip(e) {
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + 260 > window.innerWidth) x = e.clientX - 250;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function bindTips(svg) {
    ensureTip();
    svg.addEventListener('mousemove', e => {
      const t = e.target.closest('[data-tip]');
      if (t) { tip.innerHTML = decodeURIComponent(t.getAttribute('data-tip')); tip.style.opacity = 1; placeTip(e); }
      else tip.style.opacity = 0;
    });
    svg.addEventListener('mouseleave', () => tip.style.opacity = 0);
  }

  // ── DEPTH 01a: Okun scatter (+ recent-quarter trajectory) ──────────────────
  function renderOkun() {
    const o = D.okun, svg = byId('okunChart');
    if (!svg) return;
    const W = 640, H = 410, mL = 56, mR = 20, mT = 16, mB = 48, pw = W - mL - mR, ph = H - mT - mB;
    const vis = o.scatter.filter(p => !p.is_pandemic);
    const recentSet = new Set(o.recent.quarters);
    let xmin = Math.min(...vis.map(p => p.gdp_growth)), xmax = Math.max(...vis.map(p => p.gdp_growth));
    let ymin = Math.min(...vis.map(p => p.d_unrate)), ymax = Math.max(...vis.map(p => p.d_unrate));
    const xp = (xmax - xmin) * 0.05, yp = (ymax - ymin) * 0.08;
    xmin -= xp; xmax += xp; ymin -= yp; ymax += yp;
    const X = lin(xmin, xmax, mL, mL + pw), Y = lin(ymin, ymax, mT + ph, mT);

    let s = `<defs><clipPath id="okClip"><rect x="${mL}" y="${mT}" width="${pw}" height="${ph}"/></clipPath>
      <marker id="okArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${C.terra}"/></marker></defs>`;
    ticks(xmin, xmax, 7).forEach(t => { const x = X(t); s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}"/><text x="${x}" y="${mT + ph + 16}" text-anchor="middle" font-size="11" fill="${C.muted}">${t}%</text>`; });
    ticks(ymin, ymax, 6).forEach(t => { const y = Y(t); s += `<line x1="${mL}" y1="${y}" x2="${mL + pw}" y2="${y}" stroke="${C.grid}"/><text x="${mL - 8}" y="${y + 3.5}" text-anchor="end" font-size="11" fill="${C.muted}">${sgn(t, 1)}</text>`; });
    if (0 > xmin && 0 < xmax) s += `<line x1="${X(0)}" y1="${mT}" x2="${X(0)}" y2="${mT + ph}" stroke="${C.muted}" stroke-width="1.2"/>`;
    if (0 > ymin && 0 < ymax) s += `<line x1="${mL}" y1="${Y(0)}" x2="${mL + pw}" y2="${Y(0)}" stroke="${C.muted}" stroke-width="1.2"/>`;
    s += `<text x="${mL + pw / 2}" y="${H - 8}" text-anchor="middle" font-size="11.5" fill="${C.text}">Real GDP growth (annualized, %)</text>`;
    s += `<text transform="translate(14,${mT + ph / 2}) rotate(-90)" text-anchor="middle" font-size="11.5" fill="${C.text}">Change in unemployment (pp)</text>`;

    let g = `<g clip-path="url(#okClip)">`;
    const b0 = o.fit.intercept, b1 = o.fit.slope;
    g += `<line class="anim-line" pathLength="1" x1="${X(xmin)}" y1="${Y(b0 + b1 * xmin)}" x2="${X(xmax)}" y2="${Y(b0 + b1 * xmax)}" stroke="${C.navy}" stroke-width="2.2"/>`;
    const draw = p => {
      const x = X(p.gdp_growth), y = Y(p.d_unrate), r = recentSet.has(p.label);
      const t = `${p.label}<br>GDP growth <b>${p.gdp_growth}%</b> SAAR<br>&Delta; unemployment <b>${sgn(p.d_unrate, 2)} pp</b><br>vs Okun line <b>${sgn(p.residual, 2)} pp</b>`;
      return r
        ? `<circle class="anim-pop" cx="${x}" cy="${y}" r="5" fill="${C.pink}" stroke="${C.navy}" stroke-width="1.6" data-tip="${esc(t)}"/>`
        : `<circle cx="${x}" cy="${y}" r="2.7" fill="${C.muted}" fill-opacity="0.4" data-tip="${esc(t)}"/>`;
    };
    vis.filter(p => !recentSet.has(p.label)).forEach(p => g += draw(p));
    const recentPts = o.recent.quarters.map(q => vis.find(p => p.label === q)).filter(Boolean);
    if (recentPts.length > 1) {
      const dPath = recentPts.map(p => X(p.gdp_growth).toFixed(1) + ',' + Y(p.d_unrate).toFixed(1)).join(' L');
      g += `<path class="anim-pop" d="M${dPath}" fill="none" stroke="${C.terra}" stroke-width="1.6" stroke-dasharray="1 3" stroke-linecap="round" marker-end="url(#okArrow)" opacity="0.85"/>`;
    }
    vis.filter(p => recentSet.has(p.label)).forEach(p => g += draw(p));
    g += `</g>`;
    svg.innerHTML = s + g;
    bindTips(svg);

    if (byId('okunSub')) byId('okunSub').textContent = `Fit on ${o.fit.sample_start.slice(0, 4)}–${o.fit.sample_end.slice(0, 4)}, excluding 2020 Q2–Q3 · R² = ${o.fit.r2}`;
    if (byId('okunLegend')) byId('okunLegend').innerHTML =
      `<span><i class="dot" style="background:${C.muted};opacity:.5"></i>Quarter (1948–present)</span>` +
      `<span><i class="dot" style="background:${C.pink};border:1.5px solid ${C.navy}"></i>Last 4 quarters</span>` +
      `<span><i style="background:${C.terra}"></i>Recent trajectory</span>` +
      `<span><i style="background:${C.navy}"></i>Okun fit</span>`;
    if (byId('okunNote')) byId('okunNote').textContent =
      `Breakeven growth (unemployment holds steady): about ${o.fit.breakeven_growth}% annualized. Points above the horizontal zero line mean unemployment rose that quarter. The two pandemic quarters (2020 Q2–Q3) are off-scale and excluded from the fit.`;
  }

  // ── DEPTH 01b: prime-age participation & EPOP (crosshair) ──────────────────
  function renderLFP() {
    const pa = D.okun.prime_age, svg = byId('lfpChart');
    if (!svg) return;
    const data = pa.series.filter(d => d.lfpr != null && d.epop != null);
    const W = 640, H = 300, mL = 42, mR = 74, mT = 14, mB = 34, pw = W - mL - mR, ph = H - mT - mB;
    const tt = data.map(d => Date.parse(d.date));
    const xmin = Math.min(...tt), xmax = Math.max(...tt);
    let ymin = Math.min(...data.map(d => d.epop)), ymax = Math.max(...data.map(d => d.lfpr));
    const yp = (ymax - ymin) * 0.12; ymin -= yp; ymax += yp;
    const X = lin(xmin, xmax, mL, mL + pw), Y = lin(ymin, ymax, mT + ph, mT);

    let s = '';
    ticks(ymin, ymax, 5).forEach(t => { const y = Y(t); s += `<line x1="${mL}" y1="${y}" x2="${mL + pw}" y2="${y}" stroke="${C.grid}"/><text x="${mL - 7}" y="${y + 3.5}" text-anchor="end" font-size="11" fill="${C.muted}">${t}%</text>`; });
    for (let yr = 2000; yr <= 2026; yr += 4) { const x = X(Date.parse(yr + '-01-01')); if (x < mL || x > mL + pw) continue; s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}"/><text x="${x}" y="${mT + ph + 16}" text-anchor="middle" font-size="11" fill="${C.muted}">${yr}</text>`; }
    const fx = X(Date.parse('2020-02-01'));
    s += `<line x1="${fx}" y1="${mT}" x2="${fx}" y2="${mT + ph}" stroke="${C.muted}" stroke-dasharray="3 3" opacity="0.6"/><text x="${fx}" y="${mT + 10}" text-anchor="middle" font-size="10" fill="${C.muted}">Feb 2020</text>`;

    const path = key => 'M' + data.map(d => X(Date.parse(d.date)).toFixed(1) + ',' + Y(d[key]).toFixed(1)).join(' L');
    s += `<path class="anim-line" pathLength="1" d="${path('lfpr')}" fill="none" stroke="${C.navy}" stroke-width="2.2"/>`;
    s += `<path class="anim-line" pathLength="1" d="${path('epop')}" fill="none" stroke="${C.green}" stroke-width="2.2"/>`;
    const last = data[data.length - 1];
    s += `<text x="${mL + pw + 6}" y="${Y(last.lfpr) + 3}" font-size="11.5" fill="${C.navy}" font-weight="600">Participation</text>`;
    s += `<text x="${mL + pw + 6}" y="${Y(last.epop) + 3}" font-size="11.5" fill="${C.green}" font-weight="600">Emp–pop</text>`;
    s += `<line id="lfpGuide" y1="${mT}" y2="${mT + ph}" stroke="${C.muted}" opacity="0"/>`;
    s += `<circle id="lfpD1" r="4" fill="${C.navy}" opacity="0"/><circle id="lfpD2" r="4" fill="${C.green}" opacity="0"/>`;
    s += `<rect id="lfpOv" x="${mL}" y="${mT}" width="${pw}" height="${ph}" fill="transparent"/>`;
    svg.innerHTML = s;

    ensureTip();
    const arr = data.map(d => ({ px: X(Date.parse(d.date)), l: d.lfpr, e: d.epop, d: d.date }));
    const guide = byId('lfpGuide'), d1 = byId('lfpD1'), d2 = byId('lfpD2'), ov = byId('lfpOv');
    ov.addEventListener('mousemove', e => {
      const rect = svg.getBoundingClientRect(), sx = (e.clientX - rect.left) / rect.width * W;
      let best = arr[0], bd = 1e9;
      arr.forEach(a => { const dd = Math.abs(a.px - sx); if (dd < bd) { bd = dd; best = a; } });
      guide.setAttribute('x1', best.px); guide.setAttribute('x2', best.px); guide.setAttribute('opacity', 1);
      d1.setAttribute('cx', best.px); d1.setAttribute('cy', Y(best.l)); d1.setAttribute('opacity', 1);
      d2.setAttribute('cx', best.px); d2.setAttribute('cy', Y(best.e)); d2.setAttribute('opacity', 1);
      tip.innerHTML = `${fmtDate(best.d)}<br><b>Participation ${best.l}%</b><br><b>Emp–pop ${best.e}%</b>`;
      tip.style.opacity = 1; placeTip(e);
    });
    ov.addEventListener('mouseleave', () => { tip.style.opacity = 0; [guide, d1, d2].forEach(el => el.setAttribute('opacity', 0)); });
    if (byId('lfpLegend')) byId('lfpLegend').innerHTML =
      `<span><i style="background:${C.navy}"></i>Labor force participation, 25–54</span>` +
      `<span><i style="background:${C.green}"></i>Employment–population ratio, 25–54</span>`;
  }

  // ── DEPTH 02: residual unemployment by age (with spike callout) ─────────────
  function renderAges() {
    const A = D.age_bands, svg = byId('ageChart');
    if (!svg) return;
    const col = { 'College+': C.navy, 'HS+ (no BA)': C.green, '< HS': C.gold };
    const W = 640, H = 380, mL = 54, mR = 96, mT = 22, mB = 44, pw = W - mL - mR, ph = H - mT - mB;
    let all = [];
    A.series.forEach(g => g.points.forEach(p => all.push(p)));
    const xmin = Math.min(...all.map(p => p.age)), xmax = Math.max(...all.map(p => p.age));
    let ymin = Math.min(0, ...all.map(p => p.value)), ymax = Math.max(...all.map(p => p.value));
    const yp = (ymax - ymin) * 0.08; ymin -= yp; ymax += yp;
    const X = lin(xmin, xmax, mL, mL + pw), Y = lin(ymin, ymax, mT + ph, mT);

    let s = '';
    ticks(ymin, ymax, 6).forEach(t => { const y = Y(t); s += `<line x1="${mL}" y1="${y}" x2="${mL + pw}" y2="${y}" stroke="${C.grid}"/><text x="${mL - 8}" y="${y + 3.5}" text-anchor="end" font-size="11" fill="${C.muted}">${sgn(t * 100, 0)} pp</text>`; });
    for (let a = 20; a <= xmax; a += 5) { const x = X(a); s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}"/><text x="${x}" y="${mT + ph + 16}" text-anchor="middle" font-size="11" fill="${C.muted}">${a}</text>`; }
    if (0 > ymin && 0 < ymax) s += `<line x1="${mL}" y1="${Y(0)}" x2="${mL + pw}" y2="${Y(0)}" stroke="${C.muted}" stroke-width="1.3"/>`;
    s += `<text x="${mL + pw / 2}" y="${H - 6}" text-anchor="middle" font-size="11.5" fill="${C.text}">Age</text>`;
    s += `<text transform="translate(13,${mT + ph / 2}) rotate(-90)" text-anchor="middle" font-size="11.5" fill="${C.text}">Excess unemployment (pp)</text>`;

    let hot = null;
    A.series.forEach(g => g.points.forEach(p => { if (!hot || p.value > hot.value) hot = { age: p.age, value: p.value, group: g.group }; }));

    A.series.forEach(g => {
      const c = col[g.group] || C.muted, pts = g.points.slice().sort((a, b) => a.age - b.age);
      s += `<path class="anim-line" pathLength="1" d="M${pts.map(p => X(p.age).toFixed(1) + ',' + Y(p.value).toFixed(1)).join(' L')}" fill="none" stroke="${c}" stroke-width="2.2"/>`;
      pts.forEach(p => { s += `<circle cx="${X(p.age)}" cy="${Y(p.value)}" r="3" fill="${c}" data-tip="${esc(`Age ${p.age}, ${g.group}<br>Excess unemployment <b>${sgn(p.value * 100, 1)} pp</b>`)}"/>`; });
      const lastP = pts[pts.length - 1];
      s += `<text x="${mL + pw + 6}" y="${Y(lastP.value) + 3.5}" font-size="11.5" fill="${c}" font-weight="600">${g.group}</text>`;
    });

    if (hot) {
      const hx = X(hot.age), hy = Y(hot.value);
      const lx = Math.min(hx + 16, mL + pw - 150), ly = Math.max(hy - 34, mT + 6);
      s += `<g class="anim-pop">`;
      s += `<circle cx="${hx}" cy="${hy}" r="6.5" fill="none" stroke="${C.terra}" stroke-width="2"/>`;
      s += `<line x1="${hx}" y1="${hy}" x2="${lx}" y2="${ly + 22}" stroke="${C.terra}" stroke-width="1"/>`;
      s += `<text x="${lx}" y="${ly + 10}" font-size="12" font-weight="700" fill="${C.terra}">Age ${hot.age}, ${hot.group}</text>`;
      s += `<text x="${lx}" y="${ly + 25}" font-size="11.5" fill="${C.text}">${sgn(hot.value * 100, 1)} pp above normal</text>`;
      s += `</g>`;
    }

    svg.innerHTML = s;
    bindTips(svg);
    if (byId('ageLegend')) byId('ageLegend').innerHTML = A.group_order.map(g => `<span><i style="background:${col[g]}"></i>${g}</span>`).join('');
    if (byId('ageNote')) byId('ageNote').innerHTML =
      `Positive = more unemployment than the group’s own pre-2020 relationship to the overall rate predicts. Residual averaged over the latest 6 months; log-log prediction trained through 2019. ` +
      `<span class="jd-src">Method &amp; data: <a href="https://github.com/mtkonczal/Blog-Posts-Presentations-and-Testimony/tree/main/blogs_2026/01_education_young_unrate" target="_blank" rel="noopener">education / young unemployment analysis</a> (snapshot; IPUMS regeneration to come).</span>`;
    const h = D.age_bands.headline;
    if (byId('distFlag')) byId('distFlag').innerHTML = `Young college graduates (age ${h.peak_age}) carry <b>${sgn(h.peak_college_resid * 100, 1)} pp</b> more unemployment than normal`;
  }

  // ── DEPTH 03: sector slowdown bars (sharpest decelerator highlighted) ───────
  function renderCES() {
    const Cd = D.ces_slowdown, svg = byId('cesChart');
    if (!svg) return;
    const short = {
      'Trade, transportation, and utilities': 'Trade, transport & utilities',
      'Professional and business services': 'Professional & business svcs',
      'Private education and health services': 'Private education & health',
      'Leisure and hospitality': 'Leisure & hospitality',
      'Mining and logging': 'Mining & logging'
    };
    const bars = Cd.bars;
    const W = 640, H = 430, mL = 168, mR = 30, mT = 12, mB = 40, pw = W - mL - mR, ph = H - mT - mB;
    let xmin = Math.min(0, ...bars.map(b => b.slowdown)), xmax = Math.max(0, ...bars.map(b => b.slowdown));
    const xp = (xmax - xmin) * 0.14; xmin -= xp; xmax += xp;
    const X = lin(xmin, xmax, mL, mL + pw), rowH = ph / bars.length, zX = X(0);
    const worst = bars.reduce((a, b) => b.slowdown < a.slowdown ? b : a, bars[0]);

    let s = '';
    ticks(xmin, xmax, 6).forEach(t => { const x = X(t); s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}"/><text x="${x}" y="${mT + ph + 16}" text-anchor="middle" font-size="11" fill="${C.muted}">${sgn(t, 0)}</text>`; });
    s += `<line x1="${zX}" y1="${mT}" x2="${zX}" y2="${mT + ph}" stroke="${C.muted}" stroke-width="1.3"/>`;
    s += `<text x="${mL + pw / 2}" y="${H - 6}" text-anchor="middle" font-size="11.5" fill="${C.text}">Slowdown vs 2015–19 pace (percentage points)</text>`;

    bars.forEach((b, i) => {
      const cy = mT + i * rowH + rowH / 2, bh = Math.min(rowH * 0.6, 22);
      const x2 = X(b.slowdown), bx = Math.min(zX, x2), bw = Math.abs(x2 - zX);
      const isWorst = b === worst;
      const c = b.slowdown < 0 ? (isWorst ? C.terra : C.navy) : C.green;
      const t = `${b.sector}<br>Past year: <b>${b.recent_yoy}%</b><br>2015–19 pace: <b>${b.baseline_yoy}%</b><br>Slowdown: <b>${sgn(b.slowdown, 1)} pp</b><br>Net jobs, 12mo: <b>${(b.jobs_chg_12 >= 0 ? '+' : '') + b.jobs_chg_12}k</b>`;
      s += `<rect class="anim-bar" style="transform-box:view-box;transform-origin:${zX}px ${cy}px" x="${bx}" y="${cy - bh / 2}" width="${bw}" height="${bh}" rx="2" fill="${c}" data-tip="${esc(t)}"/>`;
      s += `<text x="${mL - 8}" y="${cy + 3.5}" text-anchor="end" font-size="11" fill="${isWorst ? C.terra : C.text}" font-weight="${isWorst ? 700 : 400}">${short[b.sector] || b.sector}</text>`;
      const neg = b.slowdown < 0;
      s += `<text x="${x2 + (neg ? -5 : 5)}" y="${cy + 3.5}" text-anchor="${neg ? 'end' : 'start'}" font-size="10.5" font-weight="600" fill="${c}">${sgn(b.slowdown, 1)}</text>`;
    });
    svg.innerHTML = s;
    bindTips(svg);
    if (byId('cesSub')) byId('cesSub').textContent = `Past-year growth vs 2015–19 average · latest data: ${Cd.latest_month}`;
    if (byId('cesNote')) byId('cesNote').textContent = `${Cd.method} Eleven major supersectors (they sum to total nonfarm). Blue = slower than the pre-pandemic pace; green = faster; the sharpest decelerator is highlighted.`;
  }

  // ── tiny inline sparkline helper (for summary/dashboard tiles) ──────────────
  // values: array of numbers; opts: {w,h,color,fill,zero:boolean}
  function sparkline(values, opts) {
    opts = opts || {};
    const w = opts.w || 120, h = opts.h || 34, pad = 2, color = opts.color || C.navy;
    const min = Math.min(...values), max = Math.max(...values);
    const lo = opts.zero ? Math.min(0, min) : min, hi = max;
    const X = lin(0, values.length - 1, pad, w - pad), Y = lin(lo, hi, h - pad, pad);
    const d = 'M' + values.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join(' L');
    let extra = '';
    if (opts.zero && lo < 0 && hi > 0) extra += `<line x1="${pad}" y1="${Y(0)}" x2="${w - pad}" y2="${Y(0)}" stroke="${C.muted}" stroke-opacity="0.4" stroke-width="1"/>`;
    if (opts.fill) extra += `<path d="${d} L${X(values.length - 1)},${h - pad} L${X(0)},${h - pad} Z" fill="${color}" fill-opacity="0.12"/>`;
    const last = values[values.length - 1];
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none" aria-hidden="true">${extra}<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${X(values.length - 1)}" cy="${Y(last)}" r="2.6" fill="${color}"/></svg>`;
  }

  // ── derived headline numbers for summary panels ─────────────────────────────
  const worstSector = D.ces_slowdown.bars.reduce((a, b) => b.slowdown < a.slowdown ? b : a, D.ces_slowdown.bars[0]);
  const facts = {
    level: {
      unrate: D.okun.level.unrate, nrou: D.okun.level.nrou, gap: D.okun.level.gap,
      month: D.okun.level.unrate_month, lfpr: D.okun.prime_age.lfpr_now,
      lfprVsFeb: D.okun.prime_age.lfpr_vs_feb2020, residMean: D.okun.recent.residual_mean,
      verdict: D.okun.verdict
    },
    distribution: {
      peakAge: D.age_bands.headline.peak_age,
      peakPP: D.age_bands.headline.peak_college_resid * 100,
      primePP: D.age_bands.headline.prime_college_resid * 100,
      verdict: D.age_bands.verdict
    },
    sectors: {
      sector: worstSector.sector, recent: worstSector.recent_yoy,
      baseline: worstSector.baseline_yoy, slowdown: worstSector.slowdown,
      jobs: worstSector.jobs_chg_12, verdict: D.ces_slowdown.verdict
    },
    generated: D.generated
  };

  // recent participation series (last ~24 months) for a sparkline
  const paSeries = D.okun.prime_age.series.filter(d => d.lfpr != null).map(d => d.lfpr);
  facts.level.lfprSpark = paSeries.slice(-24);
  // recent Okun residuals (last 12 quarters) for a sparkline
  facts.level.residSpark = D.okun.scatter.filter(p => !p.is_pandemic).slice(-12).map(p => p.residual);
  // college residual curve by age for a sparkline
  const collegeSeries = (D.age_bands.series.find(g => g.group === 'College+') || { points: [] }).points
    .slice().sort((a, b) => a.age - b.age).map(p => p.value * 100);
  facts.distribution.collegeSpark = collegeSeries;
  // sector slowdowns for a sparkline (worst-first already)
  facts.sectors.spark = D.ces_slowdown.bars.map(b => b.slowdown);

  window.JOBS_CHARTS = {
    C, sgn, fmtDate, sparkline, facts, data: D,
    renderOkun, renderLFP, renderAges, renderCES
  };
})();
