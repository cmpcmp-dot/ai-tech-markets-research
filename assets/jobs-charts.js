/* ═══════════════════════════════════════════════════════════════════════════
   jobs-charts.js — shared chart engine for the Job-displacement prototypes.

   Draws the four charts behind the three-part "is AI displacing workers?"
   story as inline SVG (no chart library, works over file://). Every render
   function targets canonical element IDs so any layout that provides those
   IDs gets the same charts:

     renderOkun()    -> #okunChart     (+ #okunSub #okunLegend #okunNote)
     renderLFP()     -> #lfpChart      (+ #lfpLegend)
     renderAgeGap()  -> #ageGapChart   (+ #ageGapSub #ageGapLegend #ageGapNote)
     renderAges()    -> #ageChart      (+ #ageSub #ageLegend #ageNote #distFlag?)
     renderAgeTime() -> #ageTimeChart  (+ #ageTimeSub #ageTimeLegend #ageTimeNote)
     renderCES()     -> #cesChart      (+ #cesSub #cesNote)

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
    grid: '#e6e2d1', text: '#3c4164', headline: '#232849',
    // --surface, for knocked-out marker fills; band = neutral "normal range" fill
    surface: '#fffdf2', band: '#d8d3c0'
  };
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const byId = id => document.getElementById(id);
  const esc = s => encodeURIComponent(s);
  const lin = (d0, d1, r0, r1) => { const m = (r1 - r0) / (d1 - d0); return v => r0 + (v - d0) * m; };
  const sgn = (v, dp) => (v >= 0 ? '+' : '') + v.toFixed(dp == null ? 1 : dp);
  const fmtDate = s => { const p = s.split('-'); return MON[+p[1] - 1] + ' ' + p[0]; };

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
      `<span class="jd-src">Computed from IPUMS CPS microdata by <code>data_analysis/micro/07_age_bands_cps.R</code>; method descends from this <a href="https://github.com/mtkonczal/Blog-Posts-Presentations-and-Testimony/tree/main/blogs_2026/01_education_young_unrate" target="_blank" rel="noopener">education and young-unemployment analysis</a>.</span>`;
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
  // college excess-unemployment curve by age for a sparkline
  const collegeSeries = (D.age_bands.series.find(g => g.group === 'College+') || { points: [] }).points
    .slice().sort((a, b) => a.age - b.age).map(p => p.adj * 100);
  facts.distribution.collegeSpark = collegeSeries;
  // sector slowdowns for a sparkline (worst-first already)
  facts.sectors.spark = D.ces_slowdown.bars.map(b => b.slowdown);

  window.JOBS_CHARTS = {
    C, sgn, fmtDate, sparkline, facts, data: D,
    renderOkun, renderLFP, renderAgeGap, renderAges, renderAgeTime, renderCES
  };
})();
