/* ═══════════════════════════════════════════════════════════════════════════
   jobs-charts.js — shared chart engine for the Job-displacement prototypes.

   Draws every chart behind the "is AI displacing workers?" story as inline SVG
   (no chart library, works over file://). Every render function targets
   canonical element IDs so any layout that provides those IDs gets the same
   charts:

     renderOkun()     -> #okunChart     (+ #okunSub #okunLegend #okunNote)
     renderLFP()      -> #lfpChart      (+ #lfpLegend)
     renderAgeGap()   -> #ageGapChart   (+ #ageGapSub #ageGapLegend #ageGapNote)
     renderAges()     -> #ageChart      (+ #ageSub #ageLegend #ageNote #distFlag?)
     renderAgeTime()  -> #ageTimeChart  (+ #ageTimeSub #ageTimeLegend #ageTimeNote)
     renderTercile()  -> #tercChart     (+ #tercSub #tercLegend #tercNote #tercMembers)
     renderFlows()    -> #flowGrid      (+ #flowLegend #flowNote #flowMembers)
     renderEarlyT4()  -> #t4Chart       (+ #t4Sub #t4Note)
     renderEarlyQtr() -> #t4EventChart  (+ #t4EventSub #t4EventNote)

   THREE data sources, and each renderer must tolerate its own being absent —
   the page loads three separate <script src="data/*.js"> files and one missing
   file must not take the whole tab down:

     window.JOBS_DISPLACEMENT_DATA  data/jobs-displacement-data.js   sections 01-02
     window.BTOS_JOBS_MONITOR       data/btos-jobs-monitor-data.js   sections 03-04
     window.JOBS_YOUNG_WORKERS      data/jobs-young-workers-data.js  section 05

   Derived numbers are exposed on window.JOBS_CHARTS.facts for the summary
   panels, so no figure quoted in the prose is typed by hand. Animation is
   CSS-driven via the classes anim-line / anim-bar / anim-pop — pages that omit
   the keyframes simply get static charts.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const D = window.JOBS_DISPLACEMENT_DATA;
  if (!D) { console.error('JOBS_DISPLACEMENT_DATA not found'); return; }
  // Sections 03-05 read these. Absent = those renderers no-op and say so once.
  const J = window.BTOS_JOBS_MONITOR || null;
  const M = window.JOBS_YOUNG_WORKERS || null;
  if (!J) console.warn('BTOS_JOBS_MONITOR not found — sections 03 and 04 will be empty.');
  if (!M) console.warn('JOBS_YOUNG_WORKERS not found — section 05 will be empty.');

  const C = {
    navy: '#2c3254', navyMute: '#9498b4', green: '#70ad8f', gold: '#c99a3f',
    goldLine: '#ebc382', pink: '#ff9d7d', terra: '#b06a4f', purple: '#472b51',
    muted: '#6d7091', grid: '#e6e2d1', text: '#3c4164', headline: '#232849',
    // --surface, for knocked-out marker fills; band = neutral "normal range" fill
    surface: '#fffdf2', band: '#d8d3c0'
  };
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const byId = id => document.getElementById(id);
  const esc = s => encodeURIComponent(s);
  const lin = (d0, d1, r0, r1) => { const m = (r1 - r0) / (d1 - d0); return v => r0 + (v - d0) * m; };
  const sgn = (v, dp) => (v >= 0 ? '+' : '') + v.toFixed(dp == null ? 1 : dp);
  const fmtDate = s => { const p = s.split('-'); return MON[+p[1] - 1] + ' ' + p[0]; };
  // isFinite(null) is true, because Number(null) is 0, and run_jobs.R/run_micro.R
  // both write JSON nulls for quantities that do not exist. Always use fin().
  const fin = v => v != null && v !== '' && isFinite(v);
  const num = (v, dp) => !fin(v) ? '—' : (+v).toFixed(dp == null ? 2 : dp);
  const arr = x => x == null ? [] : (Array.isArray(x) ? x : [x]);

  // Enough decimals that adjacent tick labels never print identically
  // (0.5-unit steps rendered at 0 dp read as "+2, +2, +1").
  const dpFor = a => { const st = a.length > 1 ? Math.abs(a[1] - a[0]) : 1; return st < 0.5 ? 2 : st < 1 ? 1 : 0; };

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

  /* ── DEPTH 02 ────────────────────────────────────────────────────────────
     Three views of one finding, drawn in the order the section reads:

       renderAgeGap()  -> #ageGapChart   what each group has vs what is predicted
       renderAges()    -> #ageChart      the same excess across the age range
       renderAgeTime() -> #ageTimeChart  when the excess opened up

     All three plot `adj`: the residual net of the placebo bias the method
     reports in periods when nothing happened. See age_bands.value_definition.
     ──────────────────────────────────────────────────────────────────────── */

  const GRP_SHORT = l => l.replace('HS+ (no BA)', 'No degree').replace('College+', 'Graduates');
  const AGE_COL = { 'College+': C.navy, 'HS+ (no BA)': C.green };

  // 02a. Actual versus predicted, one row per pooled band. Levels rather than
  // residuals, so the reader compares two unemployment rates directly.
  function renderAgeGap() {
    const A = D.age_bands, svg = byId('ageGapChart');
    if (!svg || !A.latest) return;
    const rows = A.latest;
    const W = 640, H = 300, mL = 174, mR = 56, mT = 14, mB = 44, pw = W - mL - mR, ph = H - mT - mB;
    const xmax = Math.max(...rows.map(r => Math.max(r.actual, r.pred))) * 1.12 * 100;
    const X = lin(0, xmax, mL, mL + pw), rowH = ph / rows.length;
    const BIG = 0.5;   // pp; below this the gap is inside the method's own noise

    let s = '';
    ticks(0, xmax, 5).forEach(t => { const x = X(t);
      s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}"/>` +
           `<text x="${x}" y="${mT + ph + 17}" text-anchor="middle" font-size="11" fill="${C.muted}">${t}%</text>`; });
    s += `<text x="${mL + pw / 2}" y="${H - 5}" text-anchor="middle" font-size="11.5" fill="${C.text}">Unemployment rate</text>`;

    rows.forEach((r, i) => {
      const cy = mT + i * rowH + rowH / 2, xa = X(r.actual * 100), xp = X(r.pred * 100);
      const col = AGE_COL[r.edu_group] || C.muted, wide = Math.abs(r.adj * 100) >= BIG;
      const tipTxt = `${r.label}<br><b>Actual ${(r.actual * 100).toFixed(2)}%</b><br>` +
        `Predicted ${(r.pred * 100).toFixed(2)}%<br>Excess <b>${sgn(r.adj * 100, 2)} pp</b> after bias adjustment<br>` +
        `Actual is <b>${r.ratio.toFixed(2)}&times;</b> predicted`;
      s += `<line class="anim-bar" style="transform-box:view-box;transform-origin:${xp}px ${cy}px" x1="${xp}" y1="${cy}" x2="${xa}" y2="${cy}" stroke="${wide ? C.terra : C.band}" stroke-width="${wide ? 3.4 : 2.4}" stroke-linecap="round"/>`;
      s += `<circle cx="${xp}" cy="${cy}" r="5" fill="${C.surface}" stroke="${C.muted}" stroke-width="1.6" data-tip="${esc(tipTxt)}"/>`;
      s += `<circle cx="${xa}" cy="${cy}" r="6" fill="${col}" data-tip="${esc(tipTxt)}"/>`;
      s += `<text x="${mL - 14}" y="${cy - 1}" text-anchor="end" font-size="12.5" fill="${C.text}" font-weight="${wide ? 700 : 500}">${GRP_SHORT(r.label)}</text>`;
      s += `<text x="${mL - 14}" y="${cy + 13}" text-anchor="end" font-size="10.5" fill="${C.muted}" font-family="ui-monospace,Menlo,monospace">${(r.pred * 100).toFixed(1)} &rarr; ${(r.actual * 100).toFixed(1)}</text>`;
      if (wide) s += `<text x="${xa + 11}" y="${cy + 4}" font-size="11.5" font-weight="700" fill="${C.terra}">${sgn(r.adj * 100, 1)}</text>`;
    });
    svg.innerHTML = s;
    bindTips(svg);
    if (byId('ageGapSub')) byId('ageGapSub').textContent =
      `12-month average through ${fmtDate(rows[0].date + '-01')}. The bar is the gap; only gaps of ${BIG} pp or more are highlighted.`;
    if (byId('ageGapLegend')) byId('ageGapLegend').innerHTML =
      `<span><i style="background:transparent;border:1.6px solid ${C.muted};border-radius:50%;width:11px;height:11px"></i>Predicted by the overall rate</span>` +
      `<span><i style="background:${C.navy};border-radius:50%;width:11px;height:11px"></i>Actual, graduates</span>` +
      `<span><i style="background:${C.green};border-radius:50%;width:11px;height:11px"></i>Actual, no degree</span>`;
    if (byId('ageGapNote')) byId('ageGapNote').textContent =
      'Predicted values come from a log-log fit of each band’s 12-month-average unemployment rate on the overall rate, trained through 2019. Gap figures are net of placebo bias.';
  }

  // 02b. The same excess across the whole age range, with the band inside
  // which the measure cannot be told apart from its own bias shaded out.
  function renderAges() {
    const A = D.age_bands, svg = byId('ageChart');
    if (!svg) return;
    const W = 640, H = 360, mL = 62, mR = 104, mT = 22, mB = 46, pw = W - mL - mR, ph = H - mT - mB;
    let all = [];
    A.series.forEach(g => g.points.forEach(p => all.push(p)));
    const xmin = Math.min(...all.map(p => p.age)), xmax = Math.max(...all.map(p => p.age));
    let ymin = Math.min(0, ...all.map(p => p.adj)) * 100, ymax = Math.max(...all.map(p => p.adj)) * 100;
    const yp = (ymax - ymin) * 0.10; ymin -= yp; ymax += yp;
    const X = lin(xmin, xmax, mL, mL + pw), Y = lin(ymin, ymax, mT + ph, mT);
    const nMax = Math.max(...all.map(p => p.n));
    // upper quartile of the per-band placebo estimates: a fair "this much is
    // bias" line rather than the single largest value
    const bs = all.map(p => p.bias * 100).sort((a, b) => a - b);
    const bTop = bs[Math.floor(bs.length * 0.75)];

    let s = '';
    // the pre-specified headline range, replacing the old argmax callout
    s += `<rect x="${X(22)}" y="${mT}" width="${X(27) - X(22)}" height="${ph}" fill="${C.goldLine}" opacity="0.26"/>`;
    s += `<text x="${(X(22) + X(27)) / 2}" y="${mT + 12}" text-anchor="middle" font-size="10" fill="${C.gold}" font-weight="700">HEADLINE RANGE</text>`;
    s += `<rect x="${mL}" y="${Y(bTop)}" width="${pw}" height="${Y(-bTop) - Y(bTop)}" fill="${C.band}" opacity="0.5"/>`;

    const T = ticks(ymin, ymax, 6), tdp = dpFor(T);
    T.forEach(t => { const y = Y(t);
      s += `<line x1="${mL}" y1="${y}" x2="${mL + pw}" y2="${y}" stroke="${C.grid}" opacity="0.8"/>` +
           `<text x="${mL - 8}" y="${y + 3.5}" text-anchor="end" font-size="11" fill="${C.muted}">${sgn(t, tdp)}</text>`; });
    for (let a = 25; a <= xmax; a += 5) { const x = X(a);
      s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}" opacity="0.7"/>` +
           `<text x="${x}" y="${mT + ph + 17}" text-anchor="middle" font-size="11" fill="${C.muted}">${a}</text>`; }
    s += `<line x1="${mL}" y1="${Y(0)}" x2="${mL + pw}" y2="${Y(0)}" stroke="${C.muted}" stroke-width="1.2"/>`;
    s += `<text x="${mL + pw / 2}" y="${H - 5}" text-anchor="middle" font-size="11.5" fill="${C.text}">Centre of five-year age band</text>`;
    s += `<text transform="translate(13,${mT + ph / 2}) rotate(-90)" text-anchor="middle" font-size="11.5" fill="${C.text}">Excess unemployment (pp)</text>`;

    A.series.forEach(g => {
      const c = AGE_COL[g.group] || C.muted, pts = g.points.slice().sort((a, b) => a.age - b.age);
      s += `<path class="anim-line" pathLength="1" d="M${pts.map(p => X(p.age).toFixed(1) + ',' + Y(p.adj * 100).toFixed(1)).join(' L')}" fill="none" stroke="${c}" stroke-width="2.3"/>`;
      pts.forEach(p => {
        const r = 2 + 2.6 * Math.sqrt(p.n / nMax);   // area ~ sample size
        s += `<circle cx="${X(p.age)}" cy="${Y(p.adj * 100)}" r="${r.toFixed(2)}" fill="${c}" data-tip="${esc(
          `Ages ${p.band}, ${g.group}<br>Excess <b>${sgn(p.adj * 100, 2)} pp</b> after bias adjustment<br>` +
          `Raw ${sgn(p.raw * 100, 2)} pp, less bias ${sgn(p.bias * 100, 2)} pp<br>` +
          `Actual is <b>${p.ratio.toFixed(2)}&times;</b> predicted<br>~${p.n.toLocaleString()} in the labor force each month`)}"/>`;
      });
      const lp = pts[pts.length - 1];
      s += `<text x="${mL + pw + 8}" y="${Y(lp.adj * 100) + 4}" font-size="11.5" fill="${c}" font-weight="700">${g.group}</text>`;
    });
    svg.innerHTML = s;
    bindTips(svg);
    if (byId('ageSub')) byId('ageSub').textContent =
      'Dot size shows the monthly CPS labor-force sample behind each band; the youngest graduate cells are the thinnest.';
    if (byId('ageLegend')) byId('ageLegend').innerHTML =
      A.group_order.map(g => `<span><i style="background:${AGE_COL[g]}"></i>${g}</span>`).join('') +
      `<span><i style="background:${C.band};opacity:.6;height:11px"></i>Not distinguishable from method bias</span>` +
      `<span><i style="background:${C.goldLine};opacity:.45;height:11px"></i>Pre-specified headline range</span>`;
    if (byId('ageNote')) byId('ageNote').innerHTML =
      `Each point is one five-year age band, plotted at its centre. Positive means more unemployment than that band’s own pre-2020 relationship to the overall rate predicts, after subtracting the bias the same method shows in placebo periods. ` +
      `<span class="jd-src">Computed from IPUMS CPS microdata by <code>analysis/src/exhibits/jobs_02_age_bands.R</code>; method descends from this <a href="https://github.com/mtkonczal/Blog-Posts-Presentations-and-Testimony/tree/main/blogs_2026/01_education_young_unrate" target="_blank" rel="noopener">education and young-unemployment analysis</a>.</span>`;
    const h = A.headline.young_grad;
    if (byId('distFlag')) byId('distFlag').innerHTML =
      `Graduates aged 22&ndash;27 carry <b>${sgn(h.adj * 100, 1)} pp</b> more unemployment than predicted`;
  }

  // 02c. The time path. The shaded band is the full range this measure covered
  // over 2005-2019, so "outside anything the pre-pandemic era produced" is
  // something the reader can see rather than take on trust.
  function renderAgeTime() {
    const A = D.age_bands, svg = byId('ageTimeChart');
    if (!svg || !A.timeseries || A.timeseries.length < 2) return;
    const gSer = A.timeseries.find(t => t.edu_group === 'College+');
    const nSer = A.timeseries.find(t => t.edu_group !== 'College+');
    if (!gSer || !nSer) return;
    const pts = gSer.points.map(p => ({ d: p.date, v: p.adj * 100 }));
    const npts = nSer.points.map(p => ({ d: p.date, v: p.adj * 100 }));
    const pre = pts.filter(p => p.d < '2020-03');
    const loB = Math.min(...pre.map(p => p.v)), hiB = Math.max(...pre.map(p => p.v));

    const W = 640, H = 330, mL = 52, mR = 108, mT = 20, mB = 42, pw = W - mL - mR, ph = H - mT - mB;
    const all = pts.concat(npts);
    let ymin = Math.min(...all.map(p => p.v)), ymax = Math.max(...all.map(p => p.v));
    const yp = (ymax - ymin) * 0.10; ymin -= yp; ymax += yp;
    const X = lin(0, pts.length - 1, mL, mL + pw), Y = lin(ymin, ymax, mT + ph, mT);
    const ix = d => pts.findIndex(p => p.d === d);
    // first month after the pandemic window that clears the pre-2020 ceiling
    const post = pts.filter(p => p.d > '2022-12');
    const brk = post.find(p => p.v > hiB);

    let s = '';
    s += `<rect x="${mL}" y="${Y(hiB)}" width="${pw}" height="${Y(loB) - Y(hiB)}" fill="${C.band}" opacity="0.42"/>`;
    const T = ticks(ymin, ymax, 6), tdp = dpFor(T);
    T.forEach(t => { const y = Y(t);
      s += `<line x1="${mL}" y1="${y}" x2="${mL + pw}" y2="${y}" stroke="${C.grid}" opacity="0.75"/>` +
           `<text x="${mL - 8}" y="${y + 3.5}" text-anchor="end" font-size="11" fill="${C.muted}">${sgn(t, tdp)}</text>`; });
    for (let yr = 2006; yr <= 2026; yr += 4) { const i = ix(yr + '-01'); if (i < 0) continue; const x = X(i);
      s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}"/>` +
           `<text x="${x}" y="${mT + ph + 17}" text-anchor="middle" font-size="11" fill="${C.muted}">${yr}</text>`; }
    s += `<line x1="${mL}" y1="${Y(0)}" x2="${mL + pw}" y2="${Y(0)}" stroke="${C.muted}" stroke-width="1.2"/>`;
    s += `<text transform="translate(13,${mT + ph / 2}) rotate(-90)" text-anchor="middle" font-size="11.5" fill="${C.text}">Excess unemployment (pp)</text>`;
    s += `<text x="${mL + 7}" y="${Y(hiB) - 6}" font-size="10.5" fill="${C.muted}" font-style="italic">Range over 2005&ndash;2019, Great Recession included</text>`;

    const path = a => 'M' + a.map((p, i) => X(i).toFixed(1) + ',' + Y(p.v).toFixed(1)).join(' L');
    s += `<path class="anim-line" pathLength="1" d="${path(npts)}" fill="none" stroke="${C.green}" stroke-width="1.7" opacity="0.85"/>`;
    s += `<path class="anim-line" pathLength="1" d="${path(pts)}" fill="none" stroke="${C.navy}" stroke-width="2.5"/>`;

    if (brk) { const x = X(ix(brk.d));
      s += `<line x1="${x}" y1="${mT + 4}" x2="${x}" y2="${mT + ph}" stroke="${C.terra}" stroke-width="1" stroke-dasharray="3 3"/>`;
      s += `<text x="${x + 6}" y="${mT + 14}" font-size="10.5" fill="${C.terra}" font-weight="600">${fmtDate(brk.d + '-01')}: above the</text>`;
      s += `<text x="${x + 6}" y="${mT + 26}" font-size="10.5" fill="${C.terra}" font-weight="600">pre-2020 range, and stays</text>`;
    }
    const lp = pts[pts.length - 1], ln = npts[npts.length - 1];
    s += `<circle cx="${X(pts.length - 1)}" cy="${Y(lp.v)}" r="4" fill="${C.navy}"/>`;
    s += `<text x="${mL + pw + 8}" y="${Y(lp.v) - 2}" font-size="11.5" font-weight="700" fill="${C.navy}">Graduates</text>`;
    s += `<text x="${mL + pw + 8}" y="${Y(lp.v) + 11}" font-size="11.5" font-weight="700" fill="${C.navy}">22&ndash;27 &nbsp;${sgn(lp.v, 1)}</text>`;
    s += `<circle cx="${X(npts.length - 1)}" cy="${Y(ln.v)}" r="3.4" fill="${C.green}"/>`;
    s += `<text x="${mL + pw + 8}" y="${Y(ln.v) + 1}" font-size="11.5" font-weight="600" fill="${C.green}">No degree</text>`;
    s += `<text x="${mL + pw + 8}" y="${Y(ln.v) + 14}" font-size="11.5" font-weight="600" fill="${C.green}">20&ndash;27 &nbsp;${sgn(ln.v, 1)}</text>`;
    s += `<rect x="${mL}" y="${mT}" width="${pw}" height="${ph}" fill="transparent" id="ageTimeOv"/>`;
    svg.innerHTML = s;

    // crosshair readout
    const ov = byId('ageTimeOv');
    const guide = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    guide.setAttribute('stroke', C.muted); guide.setAttribute('stroke-width', '1');
    guide.setAttribute('opacity', '0');
    guide.setAttribute('y1', mT); guide.setAttribute('y2', mT + ph);
    svg.appendChild(guide);
    ensureTip();
    ov.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * W;
      let i = Math.round((vx - mL) / pw * (pts.length - 1));
      i = Math.max(0, Math.min(pts.length - 1, i));
      guide.setAttribute('x1', X(i)); guide.setAttribute('x2', X(i));
      guide.setAttribute('opacity', '0.5');
      tip.innerHTML = `${fmtDate(pts[i].d + '-01')}<br>Graduates 22&ndash;27 <b>${sgn(pts[i].v, 2)} pp</b>` +
        `<br>No degree 20&ndash;27 <b>${sgn(npts[i].v, 2)} pp</b>`;
      tip.style.opacity = 1; placeTip(e);
    });
    ov.addEventListener('mouseleave', () => { tip.style.opacity = 0; guide.setAttribute('opacity', '0'); });

    if (byId('ageTimeSub')) byId('ageTimeSub').textContent =
      `Bias-adjusted excess, monthly, ${fmtDate(pts[0].d + '-01')} to ${fmtDate(lp.d + '-01')}`;
    if (byId('ageTimeLegend')) byId('ageTimeLegend').innerHTML =
      `<span><i style="background:${C.navy}"></i>Graduates 22&ndash;27</span>` +
      `<span><i style="background:${C.green}"></i>No degree 20&ndash;27</span>` +
      `<span><i style="background:${C.band};opacity:.6;height:11px"></i>Full 2005&ndash;2019 range for graduates</span>`;
    if (byId('ageTimeNote')) byId('ageTimeNote').innerHTML =
      `Over the fifteen years to February 2020 this measure never rose above <b>${sgn(hiB, 2)} pp</b> for young graduates. ` +
      `It is <b>${sgn(lp.v, 2)} pp</b> now${brk ? `, and has been outside that range every month since ${fmtDate(brk.d + '-01')}` : ''}. ` +
      `Young non-graduates stay inside it throughout, including now.`;
  }

  /* ── SHARED PRIMITIVES FOR DEPTHS 03-05 ─────────────────────────────────────
     frame/axes/domainFor/tickDp/scatterPanel/eventPanel are ported verbatim in
     behaviour from micro-charts.js in the job_displacement_AI repo, so the
     exhibits render identically to the source page. tsPanel is new: the source
     drew a1/a2 with an index-based x-axis, which cannot express "start in
     2019" or a clipped panel.
     ──────────────────────────────────────────────────────────────────────── */
  const tickDp = t => t.length < 2 ? 1 : Math.max(0, Math.min(3, Math.ceil(-Math.log10(Math.abs(t[1] - t[0]) + 1e-12))));

  // ticks() returns multiples of the step INSIDE [min,max], so the outermost
  // tick sits within the data range. Using ticks as the scale domain would clip
  // anything beyond it. Widen the domain to cover both.
  const domainFor = (t, lo, hi) => [
    Math.min(t[0], fin(lo) ? lo : t[0]),
    Math.max(t[t.length - 1], fin(hi) ? hi : t[t.length - 1])
  ];

  function frame(svg, o) {
    const W = o.w || 640, H = o.h || 360;
    const m = Object.assign({ t: 18, r: 18, b: 44, l: 58 }, o.m || {});
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    return { W, H, m, iw: W - m.l - m.r, ih: H - m.t - m.b };
  }

  function axes(f, xs, ys, ydp, xlab, ylab, xfmt) {
    const { m, iw, ih, H } = f;
    let s = '';
    ys.forEach(v => {
      const y = f.sy(v);
      s += `<line x1="${m.l}" y1="${y}" x2="${m.l + iw}" y2="${y}" stroke="${C.grid}" stroke-width="1"/>` +
           `<text x="${m.l - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${C.muted}">${num(v, ydp)}</text>`;
    });
    xs.forEach(v => {
      s += `<text x="${f.sx(v)}" y="${m.t + ih + 18}" text-anchor="middle" font-size="11" fill="${C.muted}">${xfmt ? xfmt(v) : num(v, 0)}</text>`;
    });
    s += `<line x1="${m.l}" y1="${m.t + ih}" x2="${m.l + iw}" y2="${m.t + ih}" stroke="${C.navyMute}" stroke-width="1"/>`;
    if (xlab) s += `<text x="${m.l + iw / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="${C.text}">${xlab}</text>`;
    if (ylab) s += `<text transform="translate(13,${m.t + ih / 2}) rotate(-90)" text-anchor="middle" font-size="11" fill="${C.text}">${ylab}</text>`;
    return s;
  }

  // Scatter with an OLS fit computed from the plotted points. For the T4 panel
  // that fit IS the reported bivariate coefficient — verified equal to
  // t4.coefs["b: age-diff hires"] to five decimal places — so the line a reader
  // sees and the number in the table cannot drift apart.
  function scatterPanel(svg, pts, o) {
    o = o || {}; const f = frame(svg, o);
    pts = pts.filter(p => fin(p.x) && fin(p.y));
    if (!pts.length) { svg.innerHTML = `<text x="20" y="30" font-size="12" fill="${C.muted}">No data</text>`; return; }
    const xr = [Math.min(...pts.map(p => p.x)), Math.max(...pts.map(p => p.x))];
    const yr = [Math.min(...pts.map(p => p.y)), Math.max(...pts.map(p => p.y))];
    const px = (xr[1] - xr[0]) * 0.06 || 1, py = (yr[1] - yr[0]) * 0.10 || 1;
    const xt = ticks(xr[0] - px, xr[1] + px, 6), yt = ticks(yr[0] - py, yr[1] + py, 5);
    const xd = domainFor(xt, xr[0] - px, xr[1] + px), yd = domainFor(yt, yr[0] - py, yr[1] + py);
    f.sx = lin(xd[0], xd[1], f.m.l, f.m.l + f.iw);
    f.sy = lin(yd[0], yd[1], f.m.t + f.ih, f.m.t);

    let s = axes(f, xt, yt, tickDp(yt), o.xlab, o.ylab);
    if (yt[0] < 0 && yt[yt.length - 1] > 0)
      s += `<line x1="${f.m.l}" y1="${f.sy(0)}" x2="${f.m.l + f.iw}" y2="${f.sy(0)}" stroke="${C.navyMute}" stroke-width="1" stroke-dasharray="3,3"/>`;

    const n = pts.length, mx = pts.reduce((a, p) => a + p.x, 0) / n, my = pts.reduce((a, p) => a + p.y, 0) / n;
    let sxy = 0, sxx = 0; pts.forEach(p => { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; });
    const b = sxx ? sxy / sxx : 0, a = my - b * mx;
    s += `<line class="anim-line" pathLength="1" x1="${f.sx(xd[0])}" y1="${f.sy(a + b * xd[0])}" x2="${f.sx(xd[1])}" y2="${f.sy(a + b * xd[1])}" stroke="${C.terra}" stroke-width="2"/>`;
    pts.forEach(p => {
      s += `<circle cx="${f.sx(p.x)}" cy="${f.sy(p.y)}" r="4" fill="${C.navy}" fill-opacity="0.55" stroke="#fff" stroke-width="0.8" data-tip="${esc(p.tip || '')}"/>`;
    });
    svg.innerHTML = s; bindTips(svg);
    return { slope: b, intercept: a, n: n };
  }

  // Event study: point path with a shaded 95% band. Separate from a line chart
  // because the band, the zero line and the era shading are the whole exhibit —
  // a reader has to be able to see that the path is flat before 2020 and that
  // nothing happens at the ChatGPT line.
  function eventPanel(svg, pts, o) {
    o = o || {}; const f = frame(svg, Object.assign({ h: 360 }, o));
    pts = pts.filter(p => fin(p.x) && fin(p.y)).sort((a, b) => a.x - b.x);
    if (!pts.length) { svg.innerHTML = `<text x="20" y="30" font-size="12" fill="${C.muted}">No data</text>`; return; }
    const xr = [Math.min(...pts.map(p => p.x)), Math.max(...pts.map(p => p.x))];
    const lo = Math.min(...pts.map(p => fin(p.lo) ? p.lo : p.y));
    const hi = Math.max(...pts.map(p => fin(p.hi) ? p.hi : p.y));
    const py = (hi - lo) * 0.10 || 1;
    const yt = ticks(Math.min(lo - py, 0), Math.max(hi + py, 0), 5);
    const xt = ticks(xr[0], xr[1], 6);
    const yd = domainFor(yt, Math.min(lo - py, 0), Math.max(hi + py, 0));
    f.sx = lin(xr[0], xr[1], f.m.l, f.m.l + f.iw);
    f.sy = lin(yd[0], yd[1], f.m.t + f.ih, f.m.t);

    let s = '';
    (o.eras || []).forEach(e => {
      const a = f.sx(Math.max(e.from, xr[0])), b = f.sx(Math.min(e.to, xr[1]));
      if (b <= a) return;
      s += `<rect x="${a}" y="${f.m.t}" width="${b - a}" height="${f.ih}" fill="${e.color}" fill-opacity="0.10"/>`;
      if (e.label) s += `<text x="${(a + b) / 2}" y="${f.m.t + 13}" text-anchor="middle" font-size="10" fill="${e.color}">${e.label}</text>`;
    });
    s += axes(f, xt, yt, tickDp(yt), o.xlab, o.ylab, v => String(Math.round(v)));
    s += `<line x1="${f.m.l}" y1="${f.sy(0)}" x2="${f.m.l + f.iw}" y2="${f.sy(0)}" stroke="${C.navyMute}" stroke-width="1.2" stroke-dasharray="3,3"/>`;
    if (fin(pts[0].lo)) {
      const up = pts.map(p => `${f.sx(p.x)} ${f.sy(p.hi)}`).join(' L ');
      const dn = pts.slice().reverse().map(p => `${f.sx(p.x)} ${f.sy(p.lo)}`).join(' L ');
      s += `<path d="M ${up} L ${dn} Z" fill="${C.navy}" fill-opacity="0.13" stroke="none"/>`;
    }
    s += `<path class="anim-line" pathLength="1" d="${pts.map((p, i) => (i ? 'L' : 'M') + f.sx(p.x) + ' ' + f.sy(p.y)).join(' ')}" fill="none" stroke="${C.navy}" stroke-width="2"/>`;
    (o.vlines || []).forEach(v => {
      if (v.at < xr[0] || v.at > xr[1]) return;
      const x = f.sx(v.at);
      s += `<line x1="${x}" y1="${f.m.t}" x2="${x}" y2="${f.m.t + f.ih}" stroke="${v.color || C.purple}" stroke-width="1.4" stroke-dasharray="4,3"/>` +
           `<text x="${x + 4}" y="${f.m.t + f.ih - 6}" font-size="10" fill="${v.color || C.purple}">${v.label || ''}</text>`;
    });
    pts.forEach(p => {
      const sig = fin(p.p) && p.p < 0.05;
      s += `<circle cx="${f.sx(p.x)}" cy="${f.sy(p.y)}" r="${sig ? 3.2 : 2.4}" fill="${sig ? C.terra : C.navyMute}" stroke="#fff" stroke-width="0.6" data-tip="${esc(p.tip || '')}"/>`;
    });
    svg.innerHTML = s; bindTips(svg);
  }

  /* Monthly time series, one or more lines, real date axis.
     opts: {w,h,m, title, unit, dp, yCap, endLabels, xTickYears}
     yCap fixes the top of the y-scale and clips the paths to the plot area, for
     the one panel (layoffs) where a pandemic spike five times the height of the
     rest of the series would otherwise flatten it. Clipping is marked in the
     panel, never silent. */
  let tsSeq = 0;
  function tsPanel(svg, lines, o) {
    o = o || {};
    const f = frame(svg, Object.assign({ h: 320, m: { t: o.title ? 26 : 14, r: 16, b: 26, l: 38 } }, o));
    const all = lines.flatMap(l => l.pts).filter(p => fin(p.v));
    if (!all.length) { svg.innerHTML = `<text x="18" y="26" font-size="12" fill="${C.muted}">No data</text>`; return; }
    const tms = all.map(p => Date.parse(p.d));
    const xmin = Math.min(...tms), xmax = Math.max(...tms);
    const vis = fin(o.yCap) ? all.filter(p => p.v <= o.yCap) : all;
    const ymin = Math.min(...vis.map(p => p.v));
    const ymaxRaw = Math.max(...vis.map(p => p.v));
    const pad = (ymaxRaw - ymin) * 0.10 || 0.5;
    const yt = ticks(ymin - pad, fin(o.yCap) ? o.yCap : ymaxRaw + pad, o.yTicks || 4);
    const yd = domainFor(yt, ymin - pad, fin(o.yCap) ? o.yCap : ymaxRaw + pad);
    f.sx = lin(xmin, xmax, f.m.l, f.m.l + f.iw);
    f.sy = lin(yd[0], yd[1], f.m.t + f.ih, f.m.t);

    // Year ticks, thinned so a 400px panel does not print eight of them.
    // Thin the years that actually fall inside the range, not the calendar
    // span: a three-month moving average starts in March, so there is no
    // 1 January of the first year to label, and thinning the span first
    // silently drops the whole left-hand end of the axis.
    const y0 = new Date(xmin).getUTCFullYear(), y1 = new Date(xmax).getUTCFullYear();
    const inRange = [];
    for (let y = y0; y <= y1; y++) { const t = Date.parse(y + '-01-01'); if (t >= xmin && t <= xmax) inRange.push(y); }
    const step = Math.max(1, Math.ceil(inRange.length / (o.xTickYears || 5)));
    const years = inRange.filter((_, i) => i % step === 0);
    const short = f.W < 520;

    const clip = 'tsclip' + (++tsSeq);
    let s = `<defs><clipPath id="${clip}"><rect x="${f.m.l}" y="${f.m.t}" width="${f.iw}" height="${f.ih}"/></clipPath></defs>`;
    yt.forEach(v => {
      const y = f.sy(v);
      s += `<line x1="${f.m.l}" y1="${y}" x2="${f.m.l + f.iw}" y2="${y}" stroke="${C.grid}"/>` +
           `<text x="${f.m.l - 7}" y="${y + 4}" text-anchor="end" font-size="10.5" fill="${C.muted}">${num(v, o.dp == null ? tickDp(yt) : o.dp)}${o.unit || ''}</text>`;
    });
    const yrLab = y => short ? '’' + String(y).slice(2) : String(y);
    years.forEach(y => {
      const x = f.sx(Date.parse(y + '-01-01'));
      if (x < f.m.l - 1 || x > f.m.l + f.iw + 1) return;
      s += `<line x1="${x}" y1="${f.m.t}" x2="${x}" y2="${f.m.t + f.ih}" stroke="${C.grid}"/>` +
           `<text x="${x}" y="${f.m.t + f.ih + 16}" text-anchor="middle" font-size="10.5" fill="${C.muted}">${yrLab(y)}</text>`;
    });
    // A series that starts mid-year has no January to label, which leaves the
    // left end of the axis blank. Label the start itself, without a gridline.
    if (years.length && f.sx(Date.parse(years[0] + '-01-01')) - f.m.l > f.iw * 0.09)
      s += `<text x="${f.m.l}" y="${f.m.t + f.ih + 16}" text-anchor="start" font-size="10.5" fill="${C.muted}">${yrLab(y0)}</text>`;
    if (o.title) s += `<text x="${f.m.l - 4}" y="14" font-size="11.5" font-weight="600" fill="${C.headline}">${o.title}</text>`;

    let g = `<g clip-path="url(#${clip})">`;
    lines.forEach(l => {
      const pts = l.pts.filter(p => fin(p.v)).slice().sort((a, b) => Date.parse(a.d) - Date.parse(b.d));
      if (!pts.length) return;
      g += `<path class="anim-line" pathLength="1" d="${pts.map((p, i) => (i ? 'L' : 'M') + f.sx(Date.parse(p.d)).toFixed(1) + ' ' + f.sy(p.v).toFixed(1)).join(' ')}" fill="none" stroke="${l.color}" stroke-width="${o.lw || 2}"/>`;
      // where a clipped series leaves the top of the panel, say so
      if (fin(o.yCap)) pts.forEach((p, i) => {
        if (i === 0 || !(p.v > o.yCap) || pts[i - 1].v > o.yCap) return;
        const x = f.sx(Date.parse(p.d));
        g += `<path d="M${x - 4},${f.m.t + 7} L${x},${f.m.t + 1} L${x + 4},${f.m.t + 7} Z" fill="${l.color}"/>`;
      });
    });
    g += '</g>';
    s += g;

    if (o.endLabels) {
      const ends = lines.map(l => {
        const pts = l.pts.filter(p => fin(p.v)).slice().sort((a, b) => Date.parse(a.d) - Date.parse(b.d));
        const last = pts[pts.length - 1];
        return last ? { name: l.name, color: l.color, y: f.sy(last.v) + 4, v: last.v } : null;
      }).filter(Boolean).sort((a, b) => a.y - b.y);
      ends.forEach((e, i) => { if (i && e.y - ends[i - 1].y < 13) e.y = ends[i - 1].y + 13; });
      ends.forEach(e => {
        s += `<text x="${f.m.l + f.iw + 7}" y="${e.y}" font-size="11" font-weight="600" fill="${e.color}">${e.name} ${num(e.v, o.dp == null ? 1 : o.dp)}${o.unit || ''}</text>`;
      });
    }

    // crosshair: one readout for every series at the nearest observed date
    const dates = Array.from(new Set(all.map(p => p.d))).sort();
    const maps = lines.map(l => { const mp = new Map(); l.pts.forEach(p => mp.set(p.d, p.v)); return { name: l.name, color: l.color, mp }; });
    const ovId = clip + '-ov', guideId = clip + '-guide';
    s += `<line id="${guideId}" y1="${f.m.t}" y2="${f.m.t + f.ih}" stroke="${C.muted}" opacity="0"/>`;
    s += `<rect id="${ovId}" x="${f.m.l}" y="${f.m.t}" width="${f.iw}" height="${f.ih}" fill="transparent"/>`;
    svg.innerHTML = s;

    ensureTip();
    const ov = byId(ovId), guide = byId(guideId);
    ov.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * f.W;
      let best = dates[0], bd = Infinity;
      dates.forEach(d => { const dd = Math.abs(f.sx(Date.parse(d)) - vx); if (dd < bd) { bd = dd; best = d; } });
      guide.setAttribute('x1', f.sx(Date.parse(best))); guide.setAttribute('x2', f.sx(Date.parse(best)));
      guide.setAttribute('opacity', 0.5);
      tip.innerHTML = `<b>${fmtDate(best)}</b>` + maps.map(m2 => m2.mp.has(best)
        ? `<br><span style="color:${m2.color}">■</span> ${m2.name} <b>${num(m2.mp.get(best), o.tipDp == null ? 2 : o.tipDp)}${o.unit || ''}</b>` : '').join('');
      tip.style.opacity = 1; placeTip(e);
    });
    ov.addEventListener('mouseleave', () => { tip.style.opacity = 0; guide.setAttribute('opacity', 0); });
  }

  /* ── DEPTH 03-04: BTOS adoption groups × CES and JOLTS ──────────────────────
     Group labels come from the data, not from here. The pre-2026-07-31 payload
     split JOLTS at the median ("Higher"/"Lower"); it now uses the same tercile
     as CES. Both vocabularies are coloured, so the page renders either way. */
  const GRP_COLOR = {
    'High adoption': C.navy, 'Middle': C.gold, 'Low adoption': C.green,
    'Higher adoption': C.navy, 'Lower adoption': C.green
  };
  const GRP_ORDER = ['High adoption', 'Higher adoption', 'Middle', 'Low adoption', 'Lower adoption'];
  const byGrpOrder = (a, b) => GRP_ORDER.indexOf(a) - GRP_ORDER.indexOf(b);
  const grpShort = g => g.replace(' adoption', '');

  // cols: [{h, r?}] where r right-aligns; rows: arrays of pre-formatted cells
  function table(el, cols, rows) {
    if (!el) return;
    const cls = c => c.r ? ' class="r"' : '';
    el.innerHTML = '<table class="memtable"><thead><tr>' +
      cols.map(c => `<th${cls(c)}>${c.h}</th>`).join('') + '</tr></thead><tbody>' +
      rows.map(r => '<tr>' + r.map((v, i) => `<td${cls(cols[i])}>${v}</td>`).join('') + '</tr>').join('') +
      '</tbody></table>';
  }

  function membersTable(el, head, rows) {
    table(el, [{ h: head }, { h: 'Adoption (%)', r: true }, { h: 'Group' }],
      rows.map(r => [r.title, num(r.adoption, 1), r.grp]));
  }

  function legendHTML(groups) {
    return groups.map(g => `<span><i style="background:${GRP_COLOR[g] || C.muted}"></i>${g}</span>`).join('');
  }

  // 03. CES employment by adoption tercile, indexed to the 2019 average.
  function renderTercile() {
    const svg = byId('tercChart');
    if (!svg || !J || !J.a1) return;
    const groups = arr(J.a1.groups).slice().sort((a, b) => byGrpOrder(a.grp, b.grp));
    tsPanel(svg, groups.map(g => ({
      name: grpShort(g.grp), color: GRP_COLOR[g.grp] || C.muted,
      pts: arr(g.points).map(p => ({ d: p.date, v: p.index }))
    })), { w: 640, h: 330, m: { t: 14, r: 92, b: 26, l: 40 }, endLabels: true, dp: 0, tipDp: 1, yTicks: 5 });

    const latest = groups.map(g => ({ grp: g.grp, v: g.points[g.points.length - 1].index }));
    const hi = latest.find(x => /High/.test(x.grp)), lo = latest.find(x => /Low/.test(x.grp));
    if (byId('tercSub')) byId('tercSub').textContent =
      `CES all-employee payrolls, seasonally adjusted, January 2019 to ${fmtDate(J.ces_latest)}`;
    if (byId('tercLegend')) byId('tercLegend').innerHTML = legendHTML(groups.map(g => g.grp));
    if (byId('tercNote')) byId('tercNote').innerHTML =
      `Employment is summed across the sectors in each group and indexed to that group's 2019 average = 100, so the lines ` +
      `compare growth rates rather than levels. Terciles are cut on each sector's mean BTOS adoption before the November 2025 ` +
      `question change &mdash; one consistent definition of "AI use" throughout &mdash; across ${arr(J.a1.members).length} ` +
      `sectors, six per group. ${hi && lo ? `The high-adoption third stands at <b>${num(hi.v, 1)}</b> against <b>${num(lo.v, 1)}</b> for the low-adoption third.` : ''}`;
    membersTable(byId('tercMembers'), 'CES sector',
      arr(J.a1.members).slice().sort((a, b) => b.adoption - a.adoption));
  }

  // 04. JOLTS flows by adoption tercile, 2019 on, four panels.
  const FLOWS = [['openings', 'Job openings rate'], ['hires', 'Hires rate'],
                 ['quits', 'Quits rate'], ['layoffs', 'Layoffs and discharges rate']];
  // The three-month average of the layoffs rate peaks near 10% in spring 2020,
  // five to eight times anything since. Left unclipped it compresses the whole
  // post-2021 range — which is the part this section is about — into a few
  // pixels. Cap is derived from the data outside that window, never hardcoded.
  const SPIKE = ['2020-03', '2020-12'];

  function renderFlows() {
    const wrap = byId('flowGrid');
    if (!wrap || !J || !J.a2) return;
    const series = arr(J.a2.series);
    const groups = Array.from(new Set(series.map(s => s.grp))).sort(byGrpOrder);

    wrap.innerHTML = FLOWS.map(([k, lab]) =>
      `<div class="sm-cell"><svg class="jd-svg" id="flow-${k}" role="img" aria-label="${lab} by AI-adoption tercile"></svg></div>`).join('');

    let capNote = '';
    FLOWS.forEach(([k, lab]) => {
      const svg = byId('flow-' + k);
      const ser = groups.map(g => series.find(s => s.outcome === k && s.grp === g)).filter(Boolean);
      if (!svg || !ser.length) return;
      let yCap = null;
      if (k === 'layoffs') {
        const off = ser.flatMap(s => s.points).filter(p => {
          const ym = p.date.slice(0, 7); return ym < SPIKE[0] || ym > SPIKE[1];
        });
        yCap = Math.ceil(Math.max(...off.map(p => p.rate)) * 1.08 * 10) / 10;
        const peaks = ser.map(s => {
          const mx = s.points.reduce((a, p) => p.rate > a.rate ? p : a, s.points[0]);
          return `<b>${num(mx.rate, 1)}%</b> for ${grpShort(s.grp).toLowerCase()} adoption in ${fmtDate(mx.date)}`;
        });
        capNote = ` The layoffs panel is clipped at ${num(yCap, 1)}%; the three-month average peaks at ` +
                  `${peaks.join(', ')}, and each line is marked with a caret where it leaves the panel.`;
      }
      tsPanel(svg, ser.map(s => ({
        name: grpShort(s.grp), color: GRP_COLOR[s.grp] || C.muted,
        pts: arr(s.points).map(p => ({ d: p.date, v: p.rate }))
      })), { w: 420, h: 240, m: { t: 26, r: 14, b: 26, l: 34 }, title: lab, unit: '%',
              dp: 1, tipDp: 2, yCap: yCap, xTickYears: 4, lw: 1.7 });
    });

    if (byId('flowLegend')) byId('flowLegend').innerHTML = legendHTML(groups);
    if (byId('flowNote')) byId('flowNote').innerHTML =
      `JOLTS rates, seasonally adjusted, three-month trailing average, employment-weighted within each group, ` +
      `January 2019 through ${fmtDate(J.jolts_latest)}. Groups are ${arr(J.a2.members).length} JOLTS supersectors cut on ` +
      `pre-break BTOS adoption. Hires, quits and layoffs are a percent of employment; openings are a percent of employment ` +
      `plus openings.${capNote}`;
    membersTable(byId('flowMembers'), 'JOLTS supersector',
      arr(J.a2.members).slice().sort((a, b) => b.adoption - a.adoption));
  }

  /* ── DEPTH 05: early-career hiring (QWI × BTOS) ─────────────────────────────
     T4 from the microdata pipeline, plus the quarter-by-quarter version of the
     same regression, which is what tells you when the gap opened. */
  const qdec = z => Math.floor(z / 10) + ((z % 10) - 1) / 4;   // 20231 -> 2023.0
  const qlab = z => `${Math.floor(z / 10)}Q${z % 10}`;
  const CHATGPT = 2022.75;                                      // shipped 2022-11-30

  function renderEarlyT4() {
    const svg = byId('t4Chart');
    if (!svg || !M || !M.t4) return;
    const ad = arr(M.t4.agediff);
    const fit = scatterPanel(svg, ad.map(d => ({
      x: d.adopt_z, y: 100 * d.diff_hires,
      tip: `<b>NAICS ${d.naics}</b><br>Adoption ${sgn(d.adopt_z, 2)} SD<br>` +
           `22&ndash;24 hires ${sgn(100 * d.hires_2224, 1)}%<br>35&ndash;44 hires ${sgn(100 * d.hires_3544, 1)}%<br>` +
           `<b>Difference ${sgn(100 * d.diff_hires, 1)} log points</b>`
    })), { w: 640, h: 360, xlab: 'BTOS adoption, standard deviations from the mean',
           ylab: 'Δ log hires, 22–24 minus 35–44 (log points)' });
    const b = arr(M.t4.coefs).find(c => c.spec === 'b: age-diff hires');
    if (byId('t4Sub')) byId('t4Sub').textContent =
      `${ad.length} NAICS subsectors · change from calendar 2019 to the four quarters ending ${(M.qwi && M.qwi.meta && M.qwi.meta.coverage_quarter) || ''}`.trim();
    if (byId('t4Note')) byId('t4Note').innerHTML =
      `Each point is a subsector. The vertical axis is the change in log hires for 22&ndash;24 year olds <em>minus</em> the change ` +
      `for 35&ndash;44 year olds in the same industry, so anything that hit every age group in an industry equally &mdash; a demand ` +
      `shock, an industry-wide correction &mdash; cannot produce a slope here. The fitted line is the bivariate regression on these ` +
      `points${b ? `: <b>${sgn(100 * b.est, 1)} log points</b> per standard deviation of adoption, p = ${num(b.p, 4)}, n = ${b.n}` : ''}.`;

    // Every specification the pipeline estimated, not only the one plotted.
    // The levels spec is much weaker than the age-differenced one, and a
    // reader who cannot see that cannot judge the exhibit.
    const stars = p => !fin(p) ? '' : p < 0.01 ? '***' : p < 0.05 ? '**' : p < 0.1 ? '*' : '';
    table(byId('t4Table'),
      [{ h: 'Specification' }, { h: 'Outcome' }, { h: '% per SD', r: true }, { h: 'SE', r: true },
       { h: 'p', r: true }, { h: 'n', r: true }],
      arr(M.t4.coefs).map(c => [c.spec, c.outcome_label || c.outcome,
        sgn(100 * c.est, 1) + stars(c.p), num(100 * c.se, 1), num(c.p, 4), c.n]));
  }

  function renderEarlyQtr() {
    const svg = byId('t4EventChart');
    if (!svg || !M || !M.qwi) return;
    const h = arr(M.qwi.event).filter(d => d.outcome === 'hires' && d.spec === 'agediff');
    if (!h.length) return;
    eventPanel(svg, h.map(d => ({
      x: qdec(d.yqi), y: d.est_pct, lo: d.lo_pct, hi: d.hi_pct, p: d.p,
      tip: `<b>${qlab(d.yqi)}</b><br>${sgn(d.est_pct, 1)}% per SD of adoption<br>` +
           `95% CI ${sgn(d.lo_pct, 1)} to ${sgn(d.hi_pct, 1)}<br>p = ${num(d.p, 4)}`
    })), {
      w: 640, h: 380,
      xlab: 'Quarter (trailing four-quarter window, 2019 = 0)',
      ylab: '% change in hires per SD of adoption, 22–24 minus 35–44',
      eras: [{ from: 2020.0, to: 2021.0, color: C.gold, label: 'pandemic' },
             { from: 2023.25, to: 2025.25, color: C.terra, label: 'AI era' }],
      vlines: [{ at: CHATGPT, label: 'ChatGPT', color: C.purple }]
    });
    const last = h[h.length - 1];
    if (byId('t4EventSub')) byId('t4EventSub').textContent =
      `${qlab(h[0].yqi)} to ${qlab(last.yqi)} · one cross-sectional regression per quarter across ${last.n} subsectors`;
    if (byId('t4EventNote')) byId('t4EventNote').innerHTML =
      `Each point is the same regression as the chart above, re-run against the same 2019 base for one quarter at a time. ` +
      `Shaded band is the 95% interval; <b>filled points are significant at 5%</b>. Hires are trailing four-quarter sums, so ` +
      `seasonality is removed without an adjustment model. The flat stretch through 2019 is the pre-trend, and it is the part ` +
      `of this chart that supports the design. At ${qlab(last.yqi)} the coefficient is <b>${sgn(last.est_pct, 1)}%</b>, which ` +
      `reproduces the cross-section above &mdash; the build asserts that equality, so if this chart is wrong the pipeline fails.`;
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
  const facts = {
    level: {
      unrate: D.okun.level.unrate, nrou: D.okun.level.nrou, gap: D.okun.level.gap,
      month: D.okun.level.unrate_month, lfpr: D.okun.prime_age.lfpr_now,
      lfprVsFeb: D.okun.prime_age.lfpr_vs_feb2020, residMean: D.okun.recent.residual_mean,
      verdict: D.okun.verdict
    },
    distribution: (() => {
      const h = D.age_bands.headline;
      return {
        month:     h.latest_month,
        // young graduates, ages 22-27: the pre-specified headline band
        youngPP:   h.young_grad.adj * 100,
        youngRaw:  h.young_grad.raw * 100,
        youngBias: h.young_grad.bias * 100,
        actual:    h.young_grad.actual * 100,
        pred:      h.young_grad.pred * 100,
        ratio:     h.young_grad.actual / h.young_grad.pred,
        pctMore:   (h.young_grad.actual / h.young_grad.pred - 1) * 100,
        primePP:   h.prime_grad.adj * 100,      // graduates 45-54
        nongradPP: h.young_nongrad.adj * 100,   // no degree, 20-27
        verdict:   D.age_bands.verdict
      };
    })(),
    /* 03-05 read two other payloads, either of which can be missing on a bad
       deploy. Each block is null in that case and the page prints an em dash
       rather than "undefined". */
    terciles: (() => {
      if (!J || !J.a1) return null;
      const at = re => {
        const g = arr(J.a1.groups).find(x => re.test(x.grp));
        return g ? g.points[g.points.length - 1].index : null;
      };
      return { high: at(/High/), middle: at(/Middle/), low: at(/Low/),
               nSectors: arr(J.a1.members).length, latest: J.ces_latest,
               breakDate: J.windows && J.windows.break_date,
               noCes: J.dropped && J.dropped.sectors_no_ces };
    })(),
    /* Every flow, for every group, as {now, base19, chg}. The 2019 mean is the
       comparison the section actually makes, and computing it here means the
       prose cannot quote a level as "up" or "flat" that the series disagrees
       with. base19 is the mean of the observations before January 2020, which
       for a three-month trailing average starts in March 2019. */
    flows: (() => {
      if (!J || !J.a2) return null;
      const by = {};
      arr(J.a2.series).forEach(s => {
        const pts = arr(s.points), pre = pts.filter(p => p.date < '2020-01-01');
        const base19 = pre.length ? pre.reduce((a, p) => a + p.rate, 0) / pre.length : null;
        const now = pts.length ? pts[pts.length - 1].rate : null;
        (by[s.outcome] = by[s.outcome] || {})[s.grp] =
          { now, base19, chg: fin(now) && fin(base19) ? now - base19 : null };
      });
      const get = (out, re) => {
        const g = Object.keys(by[out] || {}).find(k => re.test(k));
        return g ? by[out][g] : { now: null, base19: null, chg: null };
      };
      // groups whose layoffs rate is above where it sat in 2019
      const aboveBase = Object.entries(by.layoffs || {})
        .filter(([, v]) => fin(v.chg) && v.chg > 0).map(([g]) => g);
      return { by, get, aboveBase, nGroups: arr(J.a2.members).length, latest: J.jolts_latest };
    })(),
    early: (() => {
      if (!M || !M.t4) return null;
      const b = arr(M.t4.coefs).find(c => c.spec === 'b: age-diff hires') || {};
      const legs = arr(M.qwi && M.qwi.legs);
      // Anchor the pattern: the leg list opens with "pre-pandemic 2016Q1-2019Q4",
      // which is the placebo leg, is excluded from the total and carries a null
      // share. An unanchored /pandemic/ matches it first and reports 0%.
      const share = re => {
        const l = legs.find(x => re.test(x.leg) && x.in_total && fin(x.share_of_total));
        return l ? l.share_of_total : null;
      };
      return {
        estPct: fin(b.est) ? 100 * b.est : null, p: b.p, n: b.n,
        pandemicShare: share(/^pandemic/), aiShare: share(/AI era/), plateauShare: share(/plateau/),
        mde: M.t4.mde_pct_per_sd, preRegistered: !!(M.qwi && M.qwi.pre_registered)
      };
    })(),
    generated: D.generated
  };

  // recent participation series (last ~24 months) for a sparkline
  const paSeries = D.okun.prime_age.series.filter(d => d.lfpr != null).map(d => d.lfpr);
  facts.level.lfprSpark = paSeries.slice(-24);
  // recent Okun residuals (last 12 quarters) for a sparkline
  facts.level.residSpark = D.okun.scatter.filter(p => !p.is_pandemic).slice(-12).map(p => p.residual);
  // college excess-unemployment curve by age for a sparkline
  const collegeSeries = (D.age_bands.series.find(g => g.group === 'College+') || { points: [] }).points
    .slice().sort((a, b) => a.age - b.age).map(p => p.adj * 100);
  facts.distribution.collegeSpark = collegeSeries;

  window.JOBS_CHARTS = {
    C, sgn, num, fmtDate, sparkline, facts, data: D, jobsData: J, microData: M,
    renderOkun, renderLFP, renderAgeGap, renderAges, renderAgeTime,
    renderTercile, renderFlows, renderEarlyT4, renderEarlyQtr
  };
})();
