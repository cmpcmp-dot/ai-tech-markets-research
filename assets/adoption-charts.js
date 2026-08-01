/* ═══════════════════════════════════════════════════════════════════════════
   adoption-charts.js — chart engine for the ADOPTION tab of index.html.

   Census Business Trends and Outlook Survey (BTOS) AI adoption, plus the
   employment-weighted occupational-exposure join. Inline SVG, no chart
   library, no CDN, works over file://. Ported from the job_displacement_AI
   research repo (assets/btos-charts.js + the T1 half of assets/micro-charts.js)
   and merged into one isolated IIFE.

   Data globals:
     window.BTOS_DATA      — data/btos-data.js          (biweekly + AI supplement)
     window.BTOS_EXPOSURE  — data/btos-exposure-data.js (exposure x adoption, T1)
     window.US_ALBERS      — data/us-albers-data.js     (state outlines + MSA points)

   Renderers target canonical element IDs, all prefixed `ad`:
     renderExposure()   -> #adExposureScatter #adExposureTime #adExposureTable
     renderHeadline()   -> #adHeadline
     renderSize()       -> #adSize
     renderSupSize()    -> #adSupSize
     renderSupSector()  -> #adSupSector
     renderSubsector()  -> #adSubsector
     renderDiffusion()  -> #adDiffusion
     renderStateMap()   -> #adStateMap #adMapNote (significance choropleth + metros)
     renderSupFunctions()  -> #adSupFunctions
     renderSupGenai()      -> #adSupGenai
     renderSupBarriers()   -> #adSupBarriers
     renderSupEmpEffect()  -> #adSupEmpEffect

   Every biweekly series is the FIRM-WEIGHTED "Yes" share. The Nov-2025 wording
   break and the Oct-Nov 2025 shutdown gap are drawn explicitly and never
   crossed. Suppressed cells are kept and marked, never dropped silently.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const D = window.BTOS_DATA;
  const E = window.BTOS_EXPOSURE;
  if (!D) { console.error('BTOS_DATA not found — Adoption tab will be empty.'); return; }

  // ESP C3 tokens, mirrored here because SVG attributes cannot read CSS vars
  // on every browser we support over file://.
  const C = {
    navy: '#2c3254', navyMute: '#9498b4', green: '#70ad8f', gold: '#c99a3f',
    goldLine: '#ebc382', pink: '#ffbfa7', terra: '#b0503a', purple: '#472b51',
    muted: '#6d7091', grid: '#caccd4', text: '#3c4164', headline: '#232849'
  };
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const byId  = id => document.getElementById(id);
  const esc   = s => encodeURIComponent(s);
  const lin   = (d0, d1, r0, r1) => { const m = (r1 - r0) / (d1 - d0); return v => r0 + (v - d0) * m; };
  const pdate = s => Date.parse(s);
  const fmtDate = s => { const p = String(s).split('-'); return MON[+p[1] - 1] + ' ' + p[0]; };
  const arr   = x => x == null ? [] : (Array.isArray(x) ? x : [x]);
  // isFinite(null) is true because Number(null) is 0. Nulls in these feeds are
  // suppressed cells or coefficients that do not exist; an unguarded isFinite()
  // plots them as a precise zero. Always use fin().
  const fin   = v => v != null && v !== '' && isFinite(v);
  const num   = (v, dp) => !fin(v) ? '—' : (+v).toFixed(dp == null ? 2 : dp);
  // Rounded percentages. Whole numbers from 10 up; one decimal below, because
  // at the low end rounding erases differences that carry the argument — the
  // gap between adopters reporting an employment increase (2.3%) and a
  // decrease (2.0%) is the case in point, and both round to "2%".
  const pct   = v => !fin(v) ? '—' : Math.abs(v) >= 10 ? String(Math.round(v)) : (+v).toFixed(1);
  const sgn   = (v, dp) => !fin(v) ? '—' : (v >= 0 ? '+' : '') + (+v).toFixed(dp == null ? 1 : dp);
  const stars = p => p == null ? '' : p < 0.01 ? '***' : p < 0.05 ? '**' : p < 0.1 ? '*' : '';

  function ticks(min, max, n) {
    if (!(isFinite(min) && isFinite(max)) || min === max) return [min];
    const raw = (max - min) / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const nn = raw / mag; const step = (nn < 1.5 ? 1 : nn < 3 ? 2 : nn < 7 ? 5 : 10) * mag;
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) out.push(+v.toFixed(6));
    return out;
  }
  const tickDp = t => t.length < 2 ? 1 : Math.max(0, Math.min(3, Math.ceil(-Math.log10(Math.abs(t[1] - t[0]) + 1e-12))));
  // ticks() returns values strictly inside [min,max], so using the first and last
  // as the scale domain clips anything past the outermost tick. Widen to cover both.
  const domainFor = (t, lo, hi) => [
    Math.min(t[0], isFinite(lo) ? lo : t[0]),
    Math.max(t[t.length - 1], isFinite(hi) ? hi : t[t.length - 1])
  ];

  // ── shared tooltip (reuses the .jd-tooltip element if the jobs tab made one) ──
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

  /* ══ PRIMITIVE 1 — time-series line panel ═════════════════════════════════
     lines: [{pts:[{date,est,se}], color, width?, dash?, label?, dot?, tipLabel?}]
     opts:  {vrule:{date,label}, gap:{start,end}, ymin?, ymax?, mR?, H?, unit?}

     `unit` suffixes the y-axis ticks and the tooltip value, and defaults to '%'
     so every pre-existing call is unchanged. assets/tracker-charts.js passes
     '' for index series (payroll employment, 2019 = 100), which are not
     percentages. Everything else on both tabs is a rate.                       */
  function timePanel(svg, lines, opts) {
    opts = opts || {};
    const U = opts.unit != null ? opts.unit : '%';
    const W = 700, H = opts.H || 360, mL = 44, mR = opts.mR || 118, mT = 18, mB = 40;
    const pw = W - mL - mR, ph = H - mT - mB;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const allPts = lines.flatMap(l => l.pts).filter(p => fin(p.est));
    if (!allPts.length) { svg.innerHTML = `<text x="20" y="30" font-size="12" fill="${C.muted}">No data</text>`; return; }
    const xs = allPts.map(p => pdate(p.date)), ys = allPts.map(p => p.est);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ymin = opts.ymin != null ? opts.ymin : Math.min(0, ...ys);
    const ymax = opts.ymax != null ? opts.ymax : Math.max(...ys) * 1.08;
    const X = lin(xmin, xmax, mL, mL + pw), Y = lin(ymin, ymax, mT + ph, mT);

    let s = '';
    if (opts.gap) {                                   // collection gap band
      const gx1 = X(pdate(opts.gap.start)), gx2 = X(pdate(opts.gap.end));
      if (gx2 > mL && gx1 < mL + pw) {
        const a = Math.max(gx1, mL), b = Math.min(gx2, mL + pw);
        s += `<rect x="${a}" y="${mT}" width="${b - a}" height="${ph}" fill="${C.terra}" opacity="0.06"/>`;
      }
    }
    ticks(ymin, ymax, 5).forEach(t => { const y = Y(t);
      s += `<line x1="${mL}" y1="${y}" x2="${mL + pw}" y2="${y}" stroke="${C.grid}"/>` +
           `<text x="${mL - 7}" y="${y + 3.5}" text-anchor="end" font-size="11" fill="${C.muted}">${t}${U}</text>`; });
    const yr0 = new Date(xmin).getFullYear(), yr1 = new Date(xmax).getFullYear();
    for (let yr = yr0; yr <= yr1 + 1; yr++) {
      for (const mo of ['01', '07']) {
        const x = X(pdate(yr + '-' + mo + '-01')); if (x < mL || x > mL + pw) continue;
        s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}" opacity="${mo === '01' ? 1 : 0.5}"/>` +
             (mo === '01' ? `<text x="${x}" y="${mT + ph + 16}" text-anchor="middle" font-size="11" fill="${C.muted}">${yr}</text>` : '');
      }
    }
    if (opts.vrule) {                                 // wording-break rule
      const vx = X(pdate(opts.vrule.date));
      if (vx > mL && vx < mL + pw) {
        s += `<line x1="${vx}" y1="${mT}" x2="${vx}" y2="${mT + ph}" stroke="${C.terra}" stroke-width="1.3" stroke-dasharray="4 3"/>` +
             `<text x="${vx - 5}" y="${mT + 11}" text-anchor="end" font-size="10" fill="${C.terra}">${opts.vrule.label}</text>`;
      }
    }
    lines.forEach(l => {
      const pts = l.pts.filter(p => fin(p.est)).slice().sort((a, b) => pdate(a.date) - pdate(b.date));
      if (!pts.length) return;
      if (pts.length > 1) {
        const d = 'M' + pts.map(p => X(pdate(p.date)).toFixed(1) + ',' + Y(p.est).toFixed(1)).join(' L');
        s += `<path d="${d}" fill="none" stroke="${l.color}" stroke-width="${l.width || 2.2}"${l.dash ? ` stroke-dasharray="${l.dash}"` : ''}/>`;
      }
      if (l.dot !== false) pts.forEach(p => {
        const tp = `${fmtDate(p.date)}<br><b>${(+p.est).toFixed(1)}${U}</b>${fin(p.se) ? ` ±${(+p.se).toFixed(2)}` : ''}${l.tipLabel ? '<br>' + l.tipLabel : ''}`;
        s += `<circle cx="${X(pdate(p.date))}" cy="${Y(p.est)}" r="2.4" fill="${l.color}" data-tip="${esc(tp)}"/>`;
      });
      if (l.label) {
        const last = pts[pts.length - 1];
        s += `<text x="${Math.min(X(pdate(last.date)) + 6, mL + pw + 4)}" y="${Y(last.est) + 3.5}" font-size="11" fill="${l.color}" font-weight="600">${l.label}</text>`;
      }
    });
    svg.innerHTML = s;
    bindTips(svg);
  }

  /* ══ PRIMITIVE 2 — horizontal bar panel ═══════════════════════════════════
     rows: [{label, value, value2?, color, color2?, tip, suppressed?}]
     opts: {unit, mL?, rowH?, signed?, mT?}                                     */
  function hbarPanel(svg, rows, opts) {
    opts = opts || {};
    const mLl = opts.mL || 150, W = 700, mR = 34, mT = opts.mT || 12, mB = 34;
    const rowH = opts.rowH || 22, ph = rows.length * rowH, H = mT + ph + mB, pw = W - mLl - mR;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    if (!rows.length) { svg.innerHTML = `<text x="20" y="30" font-size="12" fill="${C.muted}">No data</text>`; return; }
    const vals = rows.flatMap(r => [r.value, r.value2].filter(fin));
    let xmin = Math.min(0, ...vals), xmax = Math.max(0, ...vals);
    const xp = (xmax - xmin) * 0.12 || 1; xmax += xp; if (xmin < 0) xmin -= xp;
    const X = lin(xmin, xmax, mLl, mLl + pw), zX = X(0);

    let s = '';
    ticks(xmin, xmax, 6).forEach(t => { const x = X(t);
      s += `<line x1="${x}" y1="${mT}" x2="${x}" y2="${mT + ph}" stroke="${C.grid}"/>` +
           `<text x="${x}" y="${mT + ph + 16}" text-anchor="middle" font-size="10.5" fill="${C.muted}">${opts.signed ? sgn(t, 0) : t + (opts.unit || '')}</text>`; });
    if (xmin < 0) s += `<line x1="${zX}" y1="${mT}" x2="${zX}" y2="${mT + ph}" stroke="${C.muted}" stroke-width="1.2"/>`;

    rows.forEach((r, i) => {
      const cy = mT + i * rowH + rowH / 2;
      const twoBar = fin(r.value2);
      const bh = twoBar ? Math.min(rowH * 0.34, 8) : Math.min(rowH * 0.62, 15);
      const drawBar = (v, color, yoff) => {
        if (!fin(v)) return '';
        const x2 = X(v), bx = Math.min(zX, x2), bw = Math.abs(x2 - zX);
        return `<rect x="${bx}" y="${yoff}" width="${bw}" height="${bh}" rx="1.5" fill="${color}"${r.suppressed ? ' opacity="0.35"' : ''} data-tip="${esc(r.tip)}"/>`;
      };
      if (twoBar) {
        s += drawBar(r.value,  r.color, cy - bh - 1);
        s += drawBar(r.value2, r.color2 || C.goldLine, cy + 1);
      } else {
        s += drawBar(r.value, r.color, cy - bh / 2);
        if (fin(r.value)) s += `<text x="${X(r.value) + (r.value < 0 ? -4 : 4)}" y="${cy + 3}" text-anchor="${r.value < 0 ? 'end' : 'start'}" font-size="10" font-weight="600" fill="${r.color}">${opts.signed ? sgn(r.value, 1) : pct(r.value)}</text>`;
      }
      s += `<text x="${mLl - 8}" y="${cy + 3.5}" text-anchor="end" font-size="10.5" fill="${C.text}">${r.label}${r.suppressed ? ' †' : ''}</text>`;
    });
    svg.innerHTML = s;
    bindTips(svg);
  }

  /* ══ PRIMITIVE 3 — scatter with an OLS fit ════════════════════════════════ */
  function frame(svg, o) {
    const W = o.w || 700, H = o.h || 360;
    const m = Object.assign({ t: 18, r: 18, b: 44, l: 58 }, o.m || {});
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    return { W, H, m, iw: W - m.l - m.r, ih: H - m.t - m.b };
  }
  function axes(f, xs, ys, xdp, ydp, xlab, ylab, xfmt) {
    const { m, iw, ih, H } = f;
    let s = '';
    ys.forEach(v => { const y = f.sy(v);
      s += `<line x1="${m.l}" y1="${y}" x2="${m.l + iw}" y2="${y}" stroke="${C.grid}" stroke-width="1"/>` +
           `<text x="${m.l - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${C.muted}">${num(v, ydp)}</text>`; });
    xs.forEach(v => { const x = f.sx(v);
      s += `<text x="${x}" y="${m.t + ih + 18}" text-anchor="middle" font-size="11" fill="${C.muted}">${xfmt ? xfmt(v) : num(v, xdp)}</text>`; });
    s += `<line x1="${m.l}" y1="${m.t + ih}" x2="${m.l + iw}" y2="${m.t + ih}" stroke="${C.navyMute}" stroke-width="1"/>`;
    if (xlab) s += `<text x="${m.l + iw / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="${C.text}">${xlab}</text>`;
    if (ylab) s += `<text transform="translate(13,${m.t + ih / 2}) rotate(-90)" text-anchor="middle" font-size="11" fill="${C.text}">${ylab}</text>`;
    return s;
  }
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

    let s = axes(f, xt, yt, tickDp(xt), tickDp(yt), o.xlab, o.ylab);
    // OLS fit, computed here rather than passed in, so the line always matches
    // the points actually drawn.
    const n = pts.length, mx = pts.reduce((a, p) => a + p.x, 0) / n, my = pts.reduce((a, p) => a + p.y, 0) / n;
    let sxy = 0, sxx = 0; pts.forEach(p => { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; });
    const b = sxx ? sxy / sxx : 0, a = my - b * mx;
    s += `<line x1="${f.sx(xd[0])}" y1="${f.sy(a + b * xd[0])}" x2="${f.sx(xd[1])}" y2="${f.sy(a + b * xd[1])}" stroke="${C.terra}" stroke-width="2"/>`;
    pts.forEach(p => {
      s += `<circle cx="${f.sx(p.x)}" cy="${f.sy(p.y)}" r="${p.hi ? 5 : 4}" fill="${p.hi ? C.gold : C.navy}" fill-opacity="${p.hi ? 0.95 : 0.55}" stroke="#fff" stroke-width="0.8" data-tip="${esc(p.tip || p.label || '')}"/>`;
    });
    (o.labels || []).forEach(L => {
      const p = pts.find(q => String(q.label) === String(L)); if (!p) return;
      s += `<text x="${f.sx(p.x) + 7}" y="${f.sy(p.y) - 6}" font-size="10" fill="${C.headline}">${p.labelText || L}</text>`;
    });
    svg.innerHTML = s; bindTips(svg);
  }

  /* ══ PRIMITIVE 4 — indexed multi-line (non-date x axis) ═══════════════════ */
  function linePanel(svg, lines, o) {
    o = o || {}; const f = frame(svg, o);
    const all = lines.flatMap(l => l.pts).filter(p => fin(p.y));
    if (!all.length) { svg.innerHTML = `<text x="20" y="30" font-size="12" fill="${C.muted}">No data</text>`; return; }
    const xr = [Math.min(...all.map(p => p.x)), Math.max(...all.map(p => p.x))];
    const yr = [Math.min(...all.map(p => (fin(p.lo) ? p.lo : p.y))), Math.max(...all.map(p => (fin(p.hi) ? p.hi : p.y)))];
    const py = (yr[1] - yr[0]) * 0.10 || 1;
    const yt = ticks(yr[0] - py, yr[1] + py, 5), xt = ticks(xr[0], xr[1], 6);
    const yd = domainFor(yt, yr[0] - py, yr[1] + py);
    f.sx = lin(xr[0], xr[1], f.m.l, f.m.l + f.iw);
    f.sy = lin(yd[0], yd[1], f.m.t + f.ih, f.m.t);
    let s = axes(f, xt, yt, 0, tickDp(yt), o.xlab, o.ylab, o.xfmt || (v => String(Math.round(v))));
    lines.forEach(l => {
      const pts = l.pts.filter(p => fin(p.y)).sort((a, b) => a.x - b.x);
      if (!pts.length) return;
      if (l.band && fin(pts[0].lo)) {
        const up = pts.map(p => `${f.sx(p.x)} ${f.sy(p.hi)}`).join(' L ');
        const dn = pts.slice().reverse().map(p => `${f.sx(p.x)} ${f.sy(p.lo)}`).join(' L ');
        s += `<path d="M ${up} L ${dn} Z" fill="${l.color}" fill-opacity="0.13" stroke="none"/>`;
      }
      s += `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + f.sx(p.x) + ' ' + f.sy(p.y)).join(' ')}" fill="none" stroke="${l.color}" stroke-width="${l.dash ? 1.6 : 2}"${l.dash ? ' stroke-dasharray="5,4"' : ''}/>`;
      pts.forEach(p => { if (p.tip) s += `<circle cx="${f.sx(p.x)}" cy="${f.sy(p.y)}" r="2.6" fill="${l.color}" data-tip="${esc(p.tip)}"/>`; });
    });
    (o.hlines || []).forEach(h => {
      if (h.at < yd[0] || h.at > yd[1]) return;
      const y = f.sy(h.at);
      s += `<line x1="${f.m.l}" y1="${y}" x2="${f.m.l + f.iw}" y2="${y}" stroke="${h.color || C.navyMute}" stroke-width="1.2" stroke-dasharray="4,3"/>`;
      if (h.label) s += `<text x="${f.m.l + f.iw - 4}" y="${y - 5}" text-anchor="end" font-size="10" fill="${h.color || C.navyMute}">${h.label}</text>`;
    });
    svg.innerHTML = s; bindTips(svg);
  }

  function htmlTable(el, cols, rows) {
    if (!el) return;
    const al = c => c.num ? ' style="text-align:right"' : '';
    el.innerHTML = '<table class="ad-table"><thead><tr>' +
      cols.map(c => `<th${al(c)}>${c.h}</th>`).join('') + '</tr></thead><tbody>' +
      rows.map(r => '<tr>' + r.map((v, i) => `<td${al(cols[i])}>${v}</td>`).join('') + '</tr>').join('') +
      '</tbody></table>';
  }
  function setHTML(id, v) { const e = byId(id); if (e) e.innerHTML = v; }

  const supRange = () => (D.supplement && D.supplement.meta && D.supplement.meta.date_range) || 'Nov 2025 – Feb 2026';
  const supHead  = () => (D.supplement && D.supplement.headline && fin(D.supplement.headline.current))
    ? (+D.supplement.headline.current).toFixed(1) : '';

  /* ══ 01 — EXPOSURE PREDICTS ADOPTION ══════════════════════════════════════
     The bridge between the occupational-exposure literature and what firms
     actually report doing. Exposure is built from occupation-level scores
     (Felten-Raj-Seamans, Eloundou et al., Eisfeldt et al., Microsoft) collapsed
     to 3-digit NAICS with CPS occupation-by-industry EMPLOYMENT weights, then
     matched to the BTOS pre-break adoption mean for the same industry.        */
  function renderExposure() {
    if (!E || !E.t1) return;
    const t1 = E.t1, sc = arr(t1.scatter);
    const pca = arr(t1.coefs).find(c => c.metric === 'pca_score');

    const sv = byId('adExposureScatter');
    if (sv) scatterPanel(sv, sc.map(d => ({
      x: d.exposure_z, y: d.adopt, label: d.naics,
      tip: `<b>NAICS ${d.naics}</b><br>exposure ${sgn(d.exposure_z, 2)} SD<br>adoption <b>${num(d.adopt, 1)}%</b>${d.pooled ? '<br><i>pooled from two BTOS subsectors</i>' : ''}`
    })), {
      xlab: 'Employment-weighted AI exposure (z-score, PCA composite)',
      ylab: 'BTOS adoption, pre-break mean (%)',
      labels: [518, 541, 511, 722, 484],
      h: 380
    });

    // The design is Tucker's; this is a replication on different exposure
    // inputs, so the benchmark line reads as "ours vs the original", not as
    // two independent teams agreeing.
    if (pca) setHTML('adExposureHead',
      `This replication: <b>${sgn(pca.slope_pp_per_sd, 1)} pp</b> of adoption per standard deviation of exposure &middot; ` +
      `R<sup>2</sup> = <b>${num(pca.r2, 2)}</b> &middot; n = ${pca.n} industries&nbsp;&nbsp;` +
      `<span class="ad-bench">Tucker (2025), the original design: ${num(t1.tucker_slope, 1)} pp, ` +
      `R<sup>2</sup> &asymp; ${num(t1.tucker_r2, 2)}.</span>`);

    // Headline composite first, then the components by explanatory power, so
    // the first row (which the CSS emphasises) is the metric the text quotes.
    const coefs = arr(t1.coefs).slice().sort((a, b) =>
      (a.metric === 'pca_score' ? -1 : b.metric === 'pca_score' ? 1 : (b.r2 || 0) - (a.r2 || 0)));
    htmlTable(byId('adExposureTable'),
      [{ h: 'Exposure metric' }, { h: 'Source' }, { h: 'pp per SD', num: 1 }, { h: 'SE', num: 1 }, { h: 'R²', num: 1 }],
      coefs.map(c => [METRIC_LABEL[c.metric] || c.metric, METRIC_SRC[c.metric] || '', sgn(c.slope_pp_per_sd, 2) + stars(c.p), num(c.se, 2), num(c.r2, 3)]));

    const tm = arr(t1.over_time);
    const lv = byId('adExposureTime');
    if (lv && tm.length) linePanel(lv, [{
      color: C.terra, band: true,
      pts: tm.map((d, i) => ({
        x: i, y: d.slope, lo: d.slope - 1.96 * d.se, hi: d.slope + 1.96 * d.se,
        tip: `${fmtDate(d.date)}<br>slope <b>${num(d.slope, 2)}</b> pp/SD<br>R² ${num(d.r2, 2)} &middot; n ${d.n}`
      }))
    }], {
      xlab: 'BTOS collection period, pre-break, in order (Sep 2023 → Sep 2025)',
      ylab: 'pp of adoption per SD of exposure', h: 300,
      hlines: [{ at: t1.tucker_slope, color: C.navy, label: 'Tucker: 6.7' }]
    });

    if (tm.length) {
      const first = tm[0], last = tm[tm.length - 1];
      setHTML('adExposureTimeNote',
        `The exposure–adoption gradient re-estimated on each collection period separately. It starts at ` +
        `<b>${num(first.slope, 1)} pp</b> per SD (${fmtDate(first.date)}) and reaches <b>${num(last.slope, 1)} pp</b> ` +
        `by ${fmtDate(last.date)} — diffusion is not spreading evenly, it is widening the gap between exposed and ` +
        `unexposed industries. Shaded band is the 95% interval. Pre-break periods only; the ${fmtDate(D.break_date)} ` +
        `rewording resets the level and the series is not carried across it.`);
    }
  }
  const METRIC_LABEL = {
    pca_score: 'PCA composite (headline)',
    genaiexp_estz_core: 'GenAI exposure, core tasks',
    genaiexp_estz_total: 'GenAI exposure, all tasks',
    dv_rating_beta: 'GPT-4 rating (beta)',
    human_rating_beta: 'Human rating (beta)',
    AIOE: 'AI Occupational Exposure',
    ai_applicability_score: 'AI applicability (Copilot logs)'
  };
  const METRIC_SRC = {
    pca_score: 'Budget Lab composite',
    genaiexp_estz_core: 'Eisfeldt, Schubert &amp; Zhang (2023)',
    genaiexp_estz_total: 'Eisfeldt, Schubert &amp; Zhang (2023)',
    dv_rating_beta: 'Eloundou et al. (2024)',
    human_rating_beta: 'Eloundou et al. (2024)',
    AIOE: 'Felten, Raj &amp; Seamans (2021)',
    ai_applicability_score: 'Tomlinson et al. (2025)'
  };

  /* ══ 02 — THE AGGREGATE ═══════════════════════════════════════════════════ */
  function renderHeadline() {
    const svg = byId('adHeadline'); if (!svg) return;
    const h = D.headline;
    timePanel(svg, [
      { pts: h.current_old, color: C.navyMute, tipLabel: 'AI use (old wording)' },
      { pts: h.current_new, color: C.navy, width: 2.6, label: 'AI use', tipLabel: 'AI use (new wording)' },
      { pts: h.future_old,  color: C.goldLine, dash: '4 3', dot: false },
      { pts: h.future_new,  color: C.gold, dash: '4 3', label: '6-mo expectation', tipLabel: 'Expected within six months' }
    ].filter(l => l.pts && l.pts.length),
      { vrule: { date: D.break_date, label: 'reworded' }, gap: D.shutdown_gap, ymin: 0 });

    setHTML('adHeadlineLegend',
      `<span><i style="background:${C.navy}"></i>AI use, "any business function" (from Nov 2025)</span>` +
      `<span><i style="background:${C.navyMute}"></i>AI use, "producing goods or services" (through Oct 2025)</span>` +
      `<span><i style="background:${C.gold}"></i>Six-month expectation</span>`);
    setHTML('adHeadlineNote',
      `Firm-weighted share answering "Yes," ${D.n_periods} collection periods. The dashed rule marks the ` +
      `${fmtDate(D.break_date)} rewording: the question moved from AI use "in producing goods or services" to ` +
      `"in any business function." The two solid segments are <b>not the same series</b> and must not be spliced. ` +
      `The shaded band is the Oct–Nov 2025 collection gap (funding lapse), left open rather than interpolated. ` +
      `Latest reading (${fmtDate(D.latest_date)}): <b>${num(D.headline_now.current, 1)}%</b> use AI, ` +
      `<b>${num(D.headline_now.future, 1)}%</b> expect to within six months.`);
  }

  /* ══ 03 — WHO IS ADOPTING ═════════════════════════════════════════════════ */
  const SIZE_RAMP = ['#c9d0c8', '#a7c2ad', '#84b39a', '#5f9e86', '#3f7d6a', '#345f6b', '#2c3254'];

  function renderSize() {
    const svg = byId('adSize'); if (!svg) return;
    const classes = arr(D.size_class), lines = [];
    classes.forEach((c, i) => {
      const col = SIZE_RAMP[i] || C.navy;
      const oldPts = c.series.filter(p => p.wording === 'old' && fin(p.est));
      const newPts = c.series.filter(p => p.wording === 'new' && fin(p.est));
      if (oldPts.length) lines.push({ pts: oldPts, color: col, width: 1.6, dot: false, tipLabel: c.label + ' employees (old wording)' });
      if (newPts.length) lines.push({ pts: newPts, color: col, width: 2.2, label: c.label, dot: false, tipLabel: c.label + ' employees' });
    });
    timePanel(svg, lines, { vrule: { date: D.break_date, label: 'reworded' }, gap: D.shutdown_gap, ymin: 0, mR: 70 });
    setHTML('adSizeLegend', classes.map((c, i) => `<span><i style="background:${SIZE_RAMP[i] || C.navy}"></i>${c.label}</span>`).join(''));
    setHTML('adSizeNote',
      `Firm-weighted adoption by employment size class, in employees. The size gradient is the single most robust ` +
      `fact in this dataset: it holds in every period, on both sides of the rewording, and in the separate AI ` +
      `supplement. Lines are segmented at the ${fmtDate(D.break_date)} rewording.`);
  }

  function renderSupSize() {
    const svg = byId('adSupSize'); if (!svg) return;
    const d = arr(D.supplement && D.supplement.size_gradient);
    if (!d.length) { svg.innerHTML = `<text x="20" y="30" font-size="12" fill="${C.muted}">Supplement not loaded.</text>`; return; }
    const ramp = ['#3a4066', '#455a6e', '#4f7476', '#5a8e7e', '#659b83', '#6ca589', '#70ad8f'];
    hbarPanel(svg, d.map((r, i) => ({
      label: `${r.label} emp.`, value: r.share, color: ramp[Math.min(i, ramp.length - 1)], suppressed: !fin(r.share),
      tip: `${r.label} employees<br><b>${fin(r.share) ? num(r.share, 1) + '%' : 'suppressed'}</b>${fin(r.se) ? ` ±${num(r.se, 2)}` : ''} use AI<br>firm-weighted, within this size class`
    })), { mL: 96, unit: '%', rowH: 26 });
    const sm = d.find(r => r.class === 'A'), lg = d.find(r => r.class === 'G');
    if (sm && lg) setHTML('adSupSizeNote',
      `Firm-weighted current AI use within each employment size class (AI supplement, ${supRange()}). Adoption climbs ` +
      `from <b>${num(sm.share, 1)}%</b> at the smallest firms (1–4 employees) to <b>${num(lg.share, 1)}%</b> at the ` +
      `largest (250+), roughly <b>${num(+lg.share / +sm.share, 1)}×</b> higher. This is why every firm-weighted ` +
      `number on this page understates <i>worker</i> exposure: the businesses using AI employ a disproportionate share ` +
      `of workers. BTOS publishes no employment-weighted headline and we do not invent one — the gradient is the ` +
      `honest public substitute.`);
  }

  function supBars(svgId, noteId, rows, opts) {
    const svg = byId(svgId); if (!svg) return;
    rows = arr(rows);
    if (!rows.length) { svg.innerHTML = `<text x="20" y="30" font-size="12" fill="${C.muted}">Supplement not loaded.</text>`; return; }
    opts = opts || {};
    hbarPanel(svg, rows.map(r => ({
      label: r.label.length > 40 ? r.label.slice(0, 39) + '…' : r.label,
      value: r.share,
      color: opts.color ? opts.color(r) : C.purple,
      tip: `${r.label}<br><b>${num(r.share, 1)}%</b>${fin(r.se) ? ` ±${num(r.se, 2)}` : ''}${opts.tipSuffix || ''}`
    })), { mL: opts.mL || 210, unit: '%', rowH: opts.rowH || 22 });
    if (noteId) setHTML(noteId, opts.note || '');
  }

  function renderSupSector() {
    supBars('adSupSector', 'adSupSectorNote',
      arr(D.supplement && D.supplement.sector_adoption).map(r => ({ label: r.name, share: r.share, se: r.se })), {
      mL: 250, color: () => C.navy,
      note: `Firm-weighted current AI use by 2-digit NAICS sector (AI supplement, ${supRange()}). Information, ` +
        `Professional &amp; Technical Services and Educational Services lead; Agriculture, Transportation and Mining ` +
        `trail. The top-to-bottom spread is several times the ${supHead()}% national headline — that dispersion, not ` +
        `the average, is where the diffusion story lives. Multi-sector ("XX") filers are excluded.`
    });
  }

  function renderSubsector() {
    const svg = byId('adSubsector'); if (!svg) return;
    const rows = arr(D.subsector).filter(d => fin(d.current)).slice(0, 22).map(d => ({
      label: d.name.length > 32 ? d.name.slice(0, 31) + '…' : d.name,
      value: d.current, value2: d.future, color: C.navy, color2: C.goldLine, suppressed: d.suppressed,
      tip: `${d.name} (NAICS ${d.naics3})<br>Current AI use: <b>${fin(d.current) ? num(d.current, 1) + '%' : 'n/a'}</b>` +
           (fin(d.current_se) ? ` ±${num(d.current_se, 2)}` : '') +
           `<br>Expected in 6 mo: <b>${fin(d.future) ? num(d.future, 1) + '%' : 'n/a'}</b>`
    }));
    hbarPanel(svg, rows, { mL: 220, unit: '%', rowH: 22 });
    setHTML('adSubsectorNote',
      `Top ${rows.length} three-digit NAICS subsectors by current adoption, latest period (${fmtDate(D.latest_date)}). ` +
      `Dark bar = current use, light bar = six-month expectation. Cells marked <b>†</b> are Census-suppressed and ` +
      `shown at reduced opacity rather than dropped. BTOS aggregate codes are excluded. These are the same industry ` +
      `cells that carry the exposure regression above.`);
  }

  function renderDiffusion() {
    const svg = byId('adDiffusion'); if (!svg) return;
    const rows = arr(D.diffusion).filter(d => fin(d.chg6)).sort((a, b) => b.chg6 - a.chg6).map(d => ({
      label: d.name.length > 30 ? d.name.slice(0, 29) + '…' : d.name,
      value: d.chg6, color: d.chg6 >= 0 ? C.green : C.terra,
      tip: `${d.name}<br>Latest adoption: <b>${num(d.latest, 1)}%</b><br>Change, trailing 6 mo: <b>${sgn(d.chg6, 1)} pp</b>` +
           (fin(d.chg12) ? `<br>Change, 12 mo: <b>${sgn(d.chg12, 1)} pp</b>` : `<br>12-mo change: n/a (crosses the wording break)`)
    }));
    hbarPanel(svg, rows, { mL: 210, signed: true, rowH: 20 });
    setHTML('adDiffusionNote',
      `Change in the firm-weighted adoption rate over the trailing six months by 2-digit NAICS sector, new-wording ` +
      `period only. Twelve-month change is withheld wherever the window would cross the ${fmtDate(D.break_date)} ` +
      `rewording. Positive almost everywhere: this is still a diffusion phase, not a plateau.`);
  }

  /* ══ 05 — GEOGRAPHY: GRADIENT CHOROPLETH + METRO OVERLAY ══════════════════
     A straight sequential choropleth of the published levels. Every state with
     an estimate gets a shade on one continuous ramp, so the whole distribution
     is visible even though the range is narrow; no binning, no significance
     testing, no editorial overlay. Hover gives the estimate and its standard
     error, and the note says plainly that these are imprecise.

     Geometry comes from data/us-albers-data.js (pre-projected Albers USA,
     975x610), so there is no projection maths at runtime and no CDN. Metro
     circles are the 25 largest MSAs at their principal city, on the same ramp
     and sized by adoption. Puerto Rico has an estimate but no polygon in that
     file, and ten small states plus DC are unreadable at this scale, so all of
     them get a labelled square in the strip beneath the map.
     ═════════════════════════════════════════════════════════════════════════ */
  const NAT_STRIP = ['MA','MD','DE','NJ','CT','RI','NH','VT','DC','PR'];
  const NO_DATA_FILL = '#e0ddd0';

  // Sequential ramp, light warm stone -> Warm Navy. Interpolated in sRGB,
  // which is fine for a two-stop single-hue scale.
  const RAMP = [[240, 235, 216], [44, 50, 84]];
  function rampColor(t) {
    t = Math.max(0, Math.min(1, t));
    // Slight gamma so the crowded middle of a narrow range still separates.
    const e = Math.pow(t, 0.85);
    const c = RAMP[0].map((a, i) => Math.round(a + (RAMP[1][i] - a) * e));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }
  // Luminance-aware label colour so values stay legible at both ends. The
  // switch is deliberately early (0.45, not 0.5) because dark ink on a
  // mid-navy fill is the worst case and light ink on a mid fill still reads.
  const inkOn = t => Math.pow(Math.max(0, Math.min(1, t)), 0.85) > 0.45 ? '#fffdf2' : C.headline;

  function renderStateMap() {
    const svg = byId('adStateMap'); if (!svg) return;
    const U = window.US_ALBERS;
    if (!U) { svg.innerHTML = `<text x="20" y="30" font-size="12" fill="${C.muted}">Map geometry not loaded.</text>`; return; }

    const stRows = arr(D.geography && D.geography.states);
    const msRows = arr(D.geography && D.geography.msas);
    const byCode = {}; stRows.forEach(s => byCode[s.code] = s);

    // One ramp domain across both layers so a state and a metro of the same
    // shade mean the same adoption rate.
    const all = stRows.concat(msRows).filter(r => fin(r.est)).map(r => r.est);
    const lo = Math.floor(Math.min(...all)), hi = Math.ceil(Math.max(...all));
    const t = v => (v - lo) / ((hi - lo) || 1);

    const W = 975, MAPH = 610, STRIP = 72, LEG = 38, H = MAPH + STRIP + LEG;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const tipFor = (name, v, se, extra) =>
      `${name}<br>AI use: <b>${fin(v) ? pct(v) + '%' : 'no estimate'}</b>` +
      `${fin(se) ? ` &plusmn;${num(se, 1)}` : ''}${extra || ''}`;

    let s = `<defs><linearGradient id="adRampGrad" x1="0" y1="0" x2="1" y2="0">` +
      [0, .25, .5, .75, 1].map(p => `<stop offset="${p * 100}%" stop-color="${rampColor(p)}"/>`).join('') +
      `</linearGradient></defs>`;

    /* ── states ── */
    U.states.forEach(g => {
      const r = byCode[g.code], has = r && fin(r.est);
      s += `<path d="${g.d}" fill="${has ? rampColor(t(r.est)) : NO_DATA_FILL}"` +
           ` stroke="${C.grid}" stroke-width="0.6"` +
           ` data-tip="${esc(tipFor(g.name, r && r.est, r && r.se))}" style="cursor:default"/>`;
    });

    /* Value labels on the states with room for one, so the map can be read
       without hovering. Small states are covered by the strip below. */
    stRows.forEach(r => {
      if (!fin(r.est) || NAT_STRIP.indexOf(r.code) >= 0) return;
      const a = U.labelAnchors[r.code]; if (!a) return;
      s += `<text x="${a[0]}" y="${a[1] + 3}" text-anchor="middle" font-size="9.5" font-weight="600"` +
           ` fill="${inkOn(t(r.est))}" pointer-events="none">${pct(r.est)}</text>`;
    });

    /* ── metros: same ramp, sized by adoption ── */
    const mvals = msRows.filter(m => fin(m.est)).map(m => m.est);
    const rlo = Math.sqrt(Math.min(...mvals)), rhi = Math.sqrt(Math.max(...mvals));
    const rad = v => 4 + (Math.sqrt(v) - rlo) / ((rhi - rlo) || 1) * 5.5;
    msRows.slice().sort((a, b) => (b.est || 0) - (a.est || 0)).forEach(m => {
      const xy = U.metros[String(m.code)]; if (!xy || !fin(m.est)) return;
      s += `<circle cx="${xy[0]}" cy="${xy[1]}" r="${num(rad(m.est), 1)}"` +
           ` fill="${rampColor(t(m.est))}" stroke="#fffdf2" stroke-width="1.6"` +
           ` data-tip="${esc(tipFor(m.name, m.est, m.se, '<br><span style="opacity:.8">metro area</span>'))}"/>`;
    });

    /* ── strip: entities the map cannot show at this scale ── */
    const sy = MAPH + 12, sq = 26;
    s += `<text x="0" y="${sy + 2}" font-size="10.5" font-weight="600" fill="${C.headline}">` +
         `Too small to read at this scale, plus Puerto Rico (no polygon in the Albers projection)</text>`;
    NAT_STRIP.forEach((code, i) => {
      const r = byCode[code], has = r && fin(r.est);
      const x = i * (sq + 34) + 1, y = sy + 12;
      s += `<rect x="${x}" y="${y}" width="${sq}" height="${sq}" rx="2"` +
           ` fill="${has ? rampColor(t(r.est)) : NO_DATA_FILL}" stroke="${C.grid}" stroke-width="0.8"` +
           ` data-tip="${esc(tipFor((r && r.code) || code, r && r.est, r && r.se))}"/>`;
      s += `<text x="${x + sq / 2}" y="${y + sq / 2 + 3.6}" text-anchor="middle" font-size="10" font-weight="600"` +
           ` fill="${has ? inkOn(t(r.est)) : C.headline}" pointer-events="none">${code}</text>`;
      s += `<text x="${x + sq + 5}" y="${y + sq / 2 + 3.6}" font-size="9.5" fill="${C.muted}" pointer-events="none">` +
           `${has ? pct(r.est) : '—'}</text>`;
    });

    /* ── legend: continuous ramp bar with ticks, then the size key ── */
    const ly = MAPH + STRIP + 8, bw = 240, bh = 11;
    s += `<text x="0" y="${ly + bh - 1}" font-size="10.5" fill="${C.text}">Share of businesses using AI</text>`;
    const bx = 172;
    s += `<rect x="${bx}" y="${ly}" width="${bw}" height="${bh}" fill="url(#adRampGrad)" stroke="${C.grid}" stroke-width="0.6"/>`;
    [lo, Math.round((lo + hi) / 2), hi].forEach((v, i) => {
      const x = bx + [0, bw / 2, bw][i];
      s += `<text x="${x}" y="${ly + bh + 12}" text-anchor="${i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}"` +
           ` font-size="9.5" fill="${C.muted}">${v}%</text>`;
    });
    let lx = bx + bw + 26;
    s += `<rect x="${lx}" y="${ly}" width="${bh}" height="${bh}" rx="2" fill="${NO_DATA_FILL}" stroke="${C.grid}" stroke-width="0.6"/>`;
    s += `<text x="${lx + bh + 6}" y="${ly + bh - 1}" font-size="10.5" fill="${C.text}">No estimate</text>`;
    lx += bh + 90;
    s += `<text x="${lx}" y="${ly + bh - 1}" font-size="10.5" fill="${C.text}">Metros, sized by adoption:</text>`;
    lx += 152;
    [Math.min(...mvals), Math.max(...mvals)].forEach(v => {
      s += `<circle cx="${lx + rad(v)}" cy="${ly + bh / 2}" r="${num(rad(v), 1)}" fill="${rampColor(t(v))}" stroke="#fffdf2" stroke-width="1.6"/>`;
      s += `<text x="${lx + rad(v)}" y="${ly + bh + 12}" text-anchor="middle" font-size="9.5" fill="${C.muted}">${pct(v)}%</text>`;
      lx += rad(v) * 2 + 30;
    });

    svg.innerHTML = s;
    bindTips(svg);

    const withData = stRows.filter(r => fin(r.est));
    const top = withData.slice().sort((a, b) => b.est - a.est)[0];
    const bot = withData.slice().sort((a, b) => a.est - b.est)[0];
    const ses = withData.filter(r => fin(r.se)).map(r => r.se).sort((a, b) => a - b);
    setHTML('adMapNote',
      `Firm-weighted share of businesses reporting AI use, latest collection period (${fmtDate(D.latest_date)}), ` +
      `against a national rate of ${pct(D.headline_now.current)}%. States run from <b>${top.code} ${pct(top.est)}%</b> ` +
      `down to <b>${bot.code} ${pct(bot.est)}%</b>; circles are the 25 largest metro areas, on the same colour scale ` +
      `and sized by their rate. Hover anything for its estimate and standard error. ` +
      `These are state and metro subsamples of a firm survey, so the estimates are imprecise — the median state ` +
      `standard error is ${num(ses[Math.floor(ses.length / 2)], 1)} percentage points, which is large next to the ` +
      `spread across states, so individual ranks are less reliable than the broad pattern. ` +
      `Alaska and Rhode Island are suppressed by Census; multi-state ("XX") filers are excluded.`);
  }

  /* ══ 04 — WHAT AI IS DOING, AND WHY FIRMS SAY NO ══════════════════════════ */
  function renderSupFunctions() {
    supBars('adSupFunctions', 'adSupFunctionsNote', D.supplement && D.supplement.business_functions, {
      mL: 232, color: () => C.purple,
      note: `Share of <b>all</b> businesses using AI in each function (firm-weighted; AI supplement, ${supRange()}). ` +
        `AI enters through commercial functions — sales and marketing, strategy, IT, R&amp;D — well ahead of ` +
        `production and distribution. Bars sum to more than the ${supHead()}% headline because adopters use AI in ` +
        `several functions at once.`
    });
  }
  function renderSupGenai() {
    supBars('adSupGenai', 'adSupGenaiNote', D.supplement && D.supplement.genai_tasks, {
      mL: 250, color: () => C.green, tipSuffix: '<br>of GenAI-using firms',
      note: `Among businesses whose employees use <b>generative</b> AI, the share using it for each task ` +
        `(firm-weighted, multiple responses allowed). Writing and editing dominates, then searching for information ` +
        `and summarizing documents — language work, not coding or data analysis. This is the clearest public read ` +
        `on <i>what</i> generative AI is actually doing inside firms, and it maps onto tasks rather than whole jobs.`
    });
  }
  function renderSupBarriers() {
    supBars('adSupBarriers', 'adSupBarriersNote', D.supplement && D.supplement.barriers, {
      mL: 250, color: () => C.gold,
      note: `Why firms <b>not</b> planning to use AI in the next six months say so (firm-weighted, multiple responses ` +
        `allowed). Most cite <i>relevance</i> — "not applicable to this business" — and knowledge gaps, not cost, ` +
        `not regulation, not workforce resistance. The binding constraint on diffusion is perceived applicability, ` +
        `which is a demand-side ceiling that falls as capabilities broaden.`
    });
  }

  /* ══ 05 — WHAT ADOPTERS SAY IT DID TO EMPLOYMENT ══════════════════════════ */
  function renderSupEmpEffect() {
    const d = arr(D.supplement && D.supplement.employment_effect);
    supBars('adSupEmpEffect', 'adSupEmpEffectNote', d, {
      mL: 150, rowH: 30, tipSuffix: '<br>of AI-using firms',
      color: r => /decreas/i.test(r.label) ? C.terra : /increas/i.test(r.label) ? C.green : C.navyMute,
      note: (() => {
        const dec = d.find(r => /decreas/i.test(r.label)), inc = d.find(r => /increas/i.test(r.label));
        const noc = d.find(r => /no change/i.test(r.label));
        return `Self-reported effect of AI on <b>total employment</b>, among firms that use AI (firm-weighted). ` +
          `<b>${num(dec && dec.share, 1)}%</b> report a decrease, <b>${num(inc && inc.share, 1)}%</b> an increase — ` +
          `more adopters say AI <i>raised</i> their headcount than say it cut it — and <b>${num(noc && noc.share, 1)}%</b> ` +
          `report no change at all. Read this as a bound on <i>attributed</i> layoffs and ` +
          `nothing more: it is silent on forgone hiring, firms need not attribute headcount decisions to AI, and it ` +
          `covers only the adopters. It is not a measure of displacement.`;
      })()
    });
    // Headline stat cards. Lead with "no change" because that is the finding.
    const dec = d.find(r => /decreas/i.test(r.label)), inc = d.find(r => /increas/i.test(r.label));
    if (dec && inc) setHTML('adEmpStats',
      `<div class="jd-stat"><div class="n">${num(100 - (+dec.share) - (+inc.share), 1)}<small>%</small></div><div class="l">of AI-using firms report <b>no change</b> in employment</div></div>` +
      `<div class="jd-stat"><div class="n">${num(dec.share, 1)}<small>%</small></div><div class="l">say AI <b>decreased</b> their employment</div></div>` +
      `<div class="jd-stat"><div class="n">${num(inc.share, 1)}<small>%</small></div><div class="l">say it <b>increased</b> employment</div></div>`);
  }

  /* ══ top-of-page stat cards + vintage ═════════════════════════════════════ */
  function renderMeta() {
    const sg = arr(D.supplement && D.supplement.size_gradient);
    const lg = sg.find(r => r.class === 'G'), sm = sg.find(r => r.class === 'A');
    const pca = E && E.t1 ? arr(E.t1.coefs).find(c => c.metric === 'pca_score') : null;
    setHTML('adTopStats',
      `<div class="jd-stat"><div class="n">${num(D.headline_now.current, 1)}<small>%</small></div><div class="l">of firms report using AI, ${fmtDate(D.latest_date)}<br>firm-weighted</div></div>` +
      (lg && sm ? `<div class="jd-stat"><div class="n">${num(lg.share, 1)}<small>%</small></div><div class="l">of firms with 250+ employees, against ${num(sm.share, 1)}% of firms with under five</div></div>` : '') +
      (pca ? `<div class="jd-stat"><div class="n">${sgn(pca.slope_pp_per_sd, 1)}<small> pp</small></div><div class="l">more adoption per SD of employment-weighted occupational exposure</div></div>` : ''));
    setHTML('adVintage',
      `BTOS vintage ${D.vintage} &middot; ${D.n_periods} collection periods through ${fmtDate(D.latest_date)}` +
      (E ? ` &middot; exposure join ${E.vintage}` : '') +
      ` &middot; source: ${D.source.api}`);
  }

  /* ══ THE CHAIN — headline number on each of the six spine links ═══════════
     The link labels are editorial and live in index.html; the numbers are
     filled here so the spine can never disagree with the charts below it. */
  function renderChain() {
    const nat = D.headline_now.current;
    const sz = arr(D.size_class);
    const last = s => arr(s && s.series).filter(p => fin(p.est)).slice(-1)[0];
    const big = last(sz[sz.length - 1]), small = last(sz[0]);
    const pca = E && E.t1 ? arr(E.t1.coefs).find(c => c.metric === 'pca_score') : null;
    const genai = arr(D.supplement && D.supplement.genai_tasks).slice()
      .sort((a, b) => b.share - a.share)[0];
    const noChange = arr(D.supplement && D.supplement.employment_effect)
      .find(r => /no change/i.test(r.label));
    const stVals = arr(D.geography && D.geography.states).filter(r => fin(r.est)).map(r => r.est);

    // Spacing is explicit (&nbsp;) rather than left to CSS margins, so the
    // number and its unit never collide and never wrap apart.
    const u = t => `<span class="u">${t}</span>`;
    const put = (id, html) => setHTML('adChainV-' + id, html == null ? '&mdash;' : html);

    put('aggregate', pct(nat) + u('%'));
    put('exposure', pca ? sgn(pca.slope_pp_per_sd, 1) + u('&nbsp;pp per SD') : null);
    put('who', big && small
      ? pct(big.est) + u('%&nbsp;vs') + '&nbsp;' + pct(small.est) + u('%') : null);
    put('what-for', genai ? pct(genai.share) + u('%') : null);
    put('where', stVals.length
      ? pct(Math.max(...stVals)) + u('%&nbsp;to') + '&nbsp;' + pct(Math.min(...stVals)) + u('%') : null);
    put('jobs', noChange ? pct(noChange.share) + u('%') : null);
  }

  /* Every renderer no-ops when its target element is absent, so the markup in
     index.html decides which figures the tab shows. Two renderers were deleted
     in the analysis/ refactor rather than left dormant: renderExpect() targeted
     #adExpect and renderGeography() targeted #adStates / #adMSA, and none of
     those elements has ever existed in index.html. renderExpect() also read
     `expectations_vs_realized`, which src/publish/btos.R no longer emits.
     renderStateMap() is the geography chart that actually draws. The one slot
     still kept live is #adExposureTime (the gradient over time); #adTopStats is
     gone too, since the chain spine carries those three numbers now. */
  function renderAll() {
    try { renderExposure(); }   catch (e) { console.error('adoption: exposure', e); }
    try { renderHeadline(); }   catch (e) { console.error('adoption: headline', e); }
    try { renderSize(); }       catch (e) { console.error('adoption: size', e); }
    try { renderSupSize(); }    catch (e) { console.error('adoption: supSize', e); }
    try { renderSupSector(); }  catch (e) { console.error('adoption: supSector', e); }
    try { renderSubsector(); }  catch (e) { console.error('adoption: subsector', e); }
    try { renderDiffusion(); }  catch (e) { console.error('adoption: diffusion', e); }
    try { renderStateMap(); }   catch (e) { console.error('adoption: stateMap', e); }
    try { renderSupFunctions(); } catch (e) { console.error('adoption: functions', e); }
    try { renderSupGenai(); }     catch (e) { console.error('adoption: genai', e); }
    try { renderSupBarriers(); }  catch (e) { console.error('adoption: barriers', e); }
    try { renderSupEmpEffect(); } catch (e) { console.error('adoption: empEffect', e); }
    try { renderMeta(); }         catch (e) { console.error('adoption: meta', e); }
    try { renderChain(); }        catch (e) { console.error('adoption: chain', e); }
  }

  /* Primitives are exported so assets/tracker-charts.js can draw the other
     Data Tracker sub-tabs in exactly this vocabulary rather than carrying a
     second chart engine. Anything exported here is a public contract: check
     tracker-charts.js before changing a signature. */
  window.ADOPTION_CHARTS = {
    C, data: D, exposure: E, renderAll, renderStateMap, renderChain,
    timePanel, hbarPanel, ticks, fmtDate, bindTips, lin, pdate, fin, num, pct, sgn,
  };
  // Fixed-viewBox SVGs lay out correctly even while the tab is hidden, so render
  // eagerly rather than on first tab activation.
  if (document.readyState !== 'loading') renderAll();
  else document.addEventListener('DOMContentLoaded', renderAll);
})();
