/* ═══════════════════════════════════════════════════════════════════════════
   Job Displacement view: readings, section wiring, scroll behaviour.

   ONE source, TWO pages. build.py includes this file in both index.html (where
   the view is a tab inside the single-page shell) and jobs_displacement.html
   (where it is the whole page, for drafting). Two behaviours have to differ
   between them, and both are decided at RUNTIME off the EMBEDDED flag below
   rather than by rewriting this file at build time. Anything else you add that
   differs between the two contexts belongs behind the same flag.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const JC = window.JOBS_CHARTS;
  if (!JC) { console.error('JOBS_CHARTS not found'); return; }
  const { sgn, fmtDate, facts, data } = JC;
  const L = facts.level, DI = facts.distribution;
  const TE = facts.terciles, FL = facts.flows, EA = facts.early;
  const byId = id => document.getElementById(id);
  const set = (id, html) => { const el = byId(id); if (el) el.innerHTML = html; };

  /* True inside index.html's single-page shell, false in the standalone
     preview. #viewPanel is the shell's view container and exists nowhere else,
     so this needs no cooperation from the main engine and no build-time flag. */
  const EMBEDDED = !!document.getElementById('viewPanel');

  /* ── SECTIONS ────────────────────────────────────────────────────
     One entry per section, in reading order. `q` is the question the
     section asks and `read` answers it in a sentence. There is no
     verdict word and no colour coding: a chip reading "No" flattens a
     conditional finding into a score. `lab` is the plain label the
     sticky rail carries.

     Sections 03-05 read payloads that are separate <script> files, so
     each `read` degrades to an em dash rather than "undefined" if one
     of them fails to load.                                             */
  const q1 = (v, dp, unit) => JC.num(v, dp == null ? 1 : dp) + (unit || '');
  const dpp2 = v => v == null ? '&mdash;' : sgn(v, 2) + ' pp';
  const SECS = [
    { id:'level', n:'01', lab:'The level',
      q:'Is unemployment higher than growth predicts?',
      read:`No. It is <b>${L.unrate}%</b>, at or below CBO&rsquo;s <b>${L.nrou}%</b> natural rate, and its path tracks growth about as Okun&rsquo;s law predicts.` },
    { id:'workers', n:'02', lab:'Across workers',
      q:'Is the weakness spread evenly across workers?',
      read:`No. Graduates aged 22&ndash;27 carry <b>${sgn(DI.youngPP,1)} pp</b> more unemployment than their own pre-2020 norm. Non-graduates the same age: <b>${sgn(DI.nongradPP,1)} pp</b>.` },
    { id:'industries', n:'03', lab:'Across industries',
      q:'Are the industries adopting AI the ones losing jobs?',
      read: TE
        ? `The opposite, so far. The high-adoption third of industries stands at <b>${q1(TE.high)}</b> against <b>${q1(TE.low)}</b> for the low-adoption third, on 2019 = 100.`
        : '&mdash;' },
    { id:'flows', n:'04', lab:'Hiring and firing',
      q:'Is the slowdown in hiring, or in firing?',
      read: FL
        ? `Mostly hiring. Hires and quits are below 2019 in every group and furthest below in the high-adoption third, at <b>${dpp2(FL.get('hires',/High/).chg)}</b> and <b>${dpp2(FL.get('quits',/High/).chg)}</b> &mdash; but that third is also the only one whose layoffs rate is back above its 2019 level.`
        : '&mdash;' },
    { id:'early', n:'05', lab:'Early careers',
      q:'Does a sharper test find anything the aggregates miss?',
      read: EA
        ? `Yes, and its timing is the problem. Early-career hiring is <b>${sgn(EA.estPct,1)}%</b> weaker per standard deviation of adoption, but ${EA.pandemicShare == null ? 'most' : `<b>${JC.num(100*EA.pandemicShare,0)}%</b>`} of that gap opened before generative AI shipped.`
        : '&mdash;' }
  ];

  /* ── masthead meta ───────────────────────────────────────────── */
  set('vintage', `Data generated <b>${facts.generated}</b> &middot; latest labor market data ${L.month}`);

  /* ── the short version, as editorial answer rows ──────────────── */
  byId('answers').innerHTML = SECS.map(s => `
    <button class="answer-row" data-go="${s.id}" aria-label="${s.q} Jump to section.">
      <span class="ar-num">${s.n}</span>
      <span class="ar-body">
        <span class="ar-q">${s.q}</span>
        <span class="ar-a">${s.read}</span>
        <span class="ar-go">Read the section &rarr;</span>
      </span>
    </button>`).join('');
  byId('answers').querySelectorAll('[data-go]').forEach(b =>
    b.addEventListener('click', () => byId(b.dataset.go).scrollIntoView({ block:'start' })));

  /* No score. Said once, plainly, so the absence reads as a choice. */
  set('svNote',
    `Three views of the same labor market, not a score &mdash; they draw on overlapping data and are not independent tests. ` +
    `The first is the coarsest measure here and the last place displacement would surface, so its quiet reading carries little weight. ` +
    `The concentration in 02 and 03 is real, but neither section can separate an AI effect from the alternatives, and each says so.`);

  /* ── interpolated figures ────────────────────────────────────── */
  set('vLevel',      `${L.unrate}%`);
  set('vWorkers',    `${sgn(DI.youngPP,1)} pp`);

  set('lfpRead',
    `Prime-age participation is <b>${L.lfpr}%</b>, ${sgn(L.lfprVsFeb,1)} pp against February 2020, so the headline rate is not ` +
    `being flattered by people quietly leaving the labor force. Over the last four quarters, unemployment has run ` +
    `${sgn(L.residMean,2)} pp from what Okun&rsquo;s law predicts &mdash; well inside the ordinary range.`);

  set('ageRead',
    `Graduates aged 22&ndash;27 face <b>${DI.actual.toFixed(1)}%</b> unemployment against the <b>${DI.pred.toFixed(1)}%</b> their own ` +
    `pre-2020 relationship to the national rate predicts. That is <b>${sgn(DI.youngPP,1)} pp</b> more, or about ` +
    `<b>${DI.pctMore.toFixed(0)}%</b> more unemployment than predicted, once the ${sgn(DI.youngBias,1)} pp the method reports in ` +
    `placebo periods is netted out. Graduates aged 45&ndash;54 come in at <b>${sgn(DI.primePP,1)} pp</b> and non-graduates aged ` +
    `20&ndash;27 at <b>${sgn(DI.nongradPP,1)} pp</b>: both indistinguishable from nothing.`);

  /* ── technical spec, filled from the same payload the charts read ─── */
  const AB = data.age_bands, ABd = AB.diagnostics, X = ABd.extrapolation;
  set('mAgeRange', AB.source.cps_range.replace(' to ', '&ndash;'));
  set('mAgeRecords', AB.source.cps_missing_months
    ? `October 2025 is absent from the extract: the survey was not collected.` : '');
  set('mAgeTrain', String(2019));
  set('mAgeWindow', String(AB.months_window));
  set('mAgeLatest', fmtDate(AB.headline.latest_month + '-01'));
  set('mAgePlacebo', AB.placebo.mean_bias_pp.map(r => {
    const cells = AB.placebo.scenarios.map(s => {
      const lab = s.replace('train_','trained through ').replace('_test_',', measured over ')
                   .replace(/_(\d{4})$/,'&ndash;$1');
      return `${lab}: <b>${sgn(r[s],2)} pp</b>`;
    }).join('; ');
    return `<li>${r.edu_group} &mdash; ${cells}. Mean applied: <b>${sgn(r.placebo_bias,2)} pp</b>.</li>`;
  }).join(''));
  set('mAgeDiag',
    `The prediction is out of sample in time but inside the support of the regressor, which is the ` +
    `condition for reading it at all: the current 12-month-average national rate is ` +
    `<b>${(X.overall_ma12_now*100).toFixed(2)}%</b>, inside the ` +
    `<b>${(X.train_min*100).toFixed(2)}&ndash;${(X.train_max*100).toFixed(2)}%</b> range the fit was trained on. ` +
    `Re-running at three-year bands and a three-month window instead of five and ${AB.months_window} gives ` +
    ABd.sensitivity.map(r => `${r.edu_group} r = <b>${r.cor.toFixed(2)}</b>`).join(' and ') +
    `. College+ is robust to that choice; HS+ (no BA) is not, but it is noise around zero rather than a ` +
    `disagreement about shape, so no structure should be read into that line.`);

  /* ── 03-05: every figure quoted in the prose comes from the payload ──
     If a payload is missing the section still renders, with em dashes
     where its numbers would be, rather than "undefined" or "NaN". */
  if (TE) {
    set('vTercHigh', JC.num(TE.high, 1));
    set('vTercLow',  JC.num(TE.low, 1));
    set('mTercSample',
      `${TE.nSectors} BTOS sectors matched to CES, January 2019 to ${fmtDate(TE.latest)}. ` +
      (TE.breakDate ? `Adoption is averaged over collection periods before the ${fmtDate(TE.breakDate)} question change. ` : '') +
      (TE.noCes ? `${TE.noCes} sectors have no matching CES series and are dropped, so the sample is not a random subset.`
                : `Sectors with no matching CES series are dropped, so the sample is not a random subset.`));
  }
  if (FL) {
    /* pp = a rate; dpp = a change in a rate against its own 2019 mean. Every
       "below 2019" or "above 2019" in this section is FL.get(...).chg, so the
       claim and the line in the panel cannot disagree. */
    const pp  = v => v == null ? '&mdash;' : `${JC.num(v, 2)}%`;
    const dpp = v => v == null ? '&mdash;' : `${sgn(v, 2)} pp`;
    const hiH = FL.get('hires', /High/), hiL = FL.get('hires', /Low/);
    const quH = FL.get('quits', /High/), quL = FL.get('quits', /Low/);
    const lyH = FL.get('layoffs', /High/);
    set('vLayHigh', pp(lyH.now));
    set('flowRead',
      `Hiring is where the weakness is. The hires rate in the high-adoption group is <b>${pp(hiH.now)}</b>, ` +
      `<b>${dpp(hiH.chg)}</b> against its own 2019 average, and quits are <b>${dpp(quH.chg)}</b>. Both are the ` +
      `largest shortfalls of the three groups: the low-adoption group is <b>${dpp(hiL.chg)}</b> on hires and ` +
      `<b>${dpp(quL.chg)}</b> on quits. Quits falling hardest where AI use is highest is a statement about ` +
      `workers' outside options, not about anyone being let go.`);
    set('flowLayoffRead',
      `The high-adoption layoffs rate is <b>${pp(lyH.now)}</b>, <b>${dpp(lyH.chg)}</b> against its 2019 average, ` +
      `and it is ${FL.aboveBase.length === 1 ? 'the only one of the three groups above its own 2019 level'
        : `one of ${FL.aboveBase.length} groups above its own 2019 level`}. ` +
      `That is the single reading on this page that points the way the displacement story predicts, and it is ` +
      `worth about a tenth of a percentage point. Weigh it against the caveat below before carrying it anywhere.`);
    set('mFlowSample',
      `${FL.nGroups} JOLTS supersectors, January 2019 to ${fmtDate(FL.latest)}, three-month trailing average. ` +
      `"Against 2019" compares with the mean of the observations before January 2020.`);
  }
  if (EA) {
    set('vEarly', `${JC.num(Math.abs(EA.estPct), 1)}%`);
    set('earlyFlag',
      `Written <b>after</b> seeing the cross-section, so it is a weaker evidentiary standard than the rest of this page`);
    /* Both shares come from the leg decomposition, never typed in. They do not
       sum to 100: the plateau leg is negative, because the gap narrowed. */
    const pct = v => v == null ? '&mdash;' : `${JC.num(100 * v, 0)}%`;
    set('earlyLegs',
      `The gap opened between 2019Q4 and 2021Q1, which accounts for <b>${pct(EA.pandemicShare)}</b> of the total, ` +
      `before generative AI was available to anyone. The coefficient then flattens for two years and slightly ` +
      `<em>narrows</em> across the ChatGPT release. The stretch since 2023Q2 accounts for <b>${pct(EA.aiShare)}</b>, ` +
      `and it is the only leg whose timing is even consistent with AI diffusion.`);
    set('t4Mde',
      `This design detects <b>${JC.num(EA.mde, 1)}%</b> per standard deviation at 80% power. The estimate is ` +
      `<b>${sgn(EA.estPct, 1)}%</b>, so it clears the detection floor. That is the exception on this page: the ` +
      `industry-level tests above cannot detect effects the size of those the literature reports.`);
    set('t4Status',
      EA.preRegistered
        ? `Pre-registered in <code>plan_microdata.md</code> before estimation.`
        : `The cross-section (T4) was pre-registered in <code>plan_microdata.md</code> before anything ran. The ` +
          `quarterly version was not: it was written after seeing T4's result, because the pre-registered list had ` +
          `a hole in it, and a two-window comparison can say nothing about timing. It changes no specification and ` +
          `replaces no headline, and it is labelled rather than quietly folded in with the rest.`);
  }

  const fit = data.okun.fit;
  set('mOkunSample',
    `${fit.sample_start.slice(0,4)}&ndash;${fit.sample_end.slice(0,4)}, quarterly, excluding ${fit.excluded.join(' and ')} ` +
    `as pandemic outliers. Breakeven growth ${fit.breakeven_growth}%.`);
  set('mOkunCaveat',
    `The fit explains r&sup2; = ${fit.r2} of the variation, so residuals of a few tenths of a point are ordinary noise. ` +
    `Only a shock large enough to be a macroeconomic event would clear it.`);
  set('closingA',
    `The aggregate reads quiet, and the industries buying the most AI are the ones that have added the most jobs. ` +
    `What sits against that is thin and specific: hiring and quits are furthest below their 2019 levels in those ` +
    `same industries, and their layoffs rate is the only one back above where it started, by about a tenth of a ` +
    `point in a group whose largest member contains temporary help. Then there is the sharpest finding here &mdash; ` +
    `young graduates carrying ` +
    `<b>${sgn(DI.youngPP,1)} pp</b> more unemployment than their own history predicts, and early-career hiring ` +
    `<b>${EA ? sgn(EA.estPct,1) + '%' : '&mdash;'}</b> weaker per standard deviation of adoption. Neither ` +
    `establishes a cause, and the sharpest of them opened mostly in 2020. Note the order that runs through this ` +
    `page: the coarser the instrument, the quieter the reading. That is what you would expect either from an ` +
    `effect too small and too concentrated for aggregates to see, or from no effect at all.`);

  /* ── rail ────────────────────────────────────────────────────── */
  byId('rail').innerHTML =
    `<div class="rail-t">Sections</div>` +
    SECS.map(s => `<a href="#${s.id}" data-s="${s.id}"><span class="rn">${s.n}</span><span>${s.lab}</span></a>`).join('') +
    `<a class="rail-back" href="#top">&uarr; The short version</a>`;
  byId('rail').querySelector('.rail-back').addEventListener('click', e => {
    e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' });
  });

  /* ── lazy chart render ───────────────────────────────────────── */
  const CHARTS = {
    level:      ['renderOkun','renderLFP'],
    workers:    ['renderAgeGap','renderAges','renderAgeTime'],
    industries: ['renderTercile'],
    flows:      ['renderFlows'],
    early:      ['renderEarlyT4','renderEarlyQtr']
  };
  const drawn = {};
  const drawFor = id => (CHARTS[id] || []).forEach(fn => {
    if (!drawn[fn] && typeof JC[fn] === 'function') { JC[fn](); drawn[fn] = true; }
  });

  const drawObs = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    drawFor(en.target.id);
    en.target.classList.add('in');
    drawObs.unobserve(en.target);
  }), { rootMargin:'250px 0px' });
  document.querySelectorAll('.sec').forEach(el => drawObs.observe(el));

  /* ── rail active state + citable anchors ─────────────────────── */
  const links = {};
  document.querySelectorAll('.rail a[data-s]').forEach(a => links[a.dataset.s] = a);
  let cur = null;
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting || en.target.id === cur) return;
    cur = en.target.id;
    Object.values(links).forEach(a => a.classList.remove('here'));
    if (links[cur]) links[cur].classList.add('here');
    /* Standalone, writing the section into the hash makes every section
       citable. Embedded, index.html owns location.hash for its tab router
       (applyHashRoute), and the two would fight over the address bar on every
       scroll. Also guarded because replaceState throws SecurityError under
       file://, which is how the preview usually gets opened. */
    if (!EMBEDDED) { try { history.replaceState(null, '', '#' + cur); } catch (_) {} }
    if (links[cur] && window.innerWidth <= 980) links[cur].scrollIntoView({ block:'nearest', inline:'center' });
  }), { rootMargin:'-15% 0px -70% 0px' });
  document.querySelectorAll('.sec').forEach(el => spy.observe(el));

  /* Arriving on a deep link to a section: draw it immediately.

     The hash is only a section id when it is a plain identifier. Embedded, the
     app router owns location.hash and uses slash-separated routes
     (#tracker/jolts, #tracker/btos/who, #entry/214), and passing one of those to
     querySelector throws `SyntaxError: Invalid selector`. That threw here
     before the guard existed, which aborted the rest of this IIFE -- including
     the first-paint block below -- on every slashed route. Test the shape
     first rather than catching, so a genuinely malformed id is still loud. */
  if (/^#[A-Za-z][\w-]*$/.test(location.hash)) {
    const el = document.querySelector(location.hash);
    if (el && el.classList.contains('sec')) {
      drawFor(el.id); el.classList.add('in');
      requestAnimationFrame(() => el.scrollIntoView());
    }
  }

  /* ── first paint inside the shell ──────────────────────────────────────
     Embedded, #jobDisplacementArea sits under display:none until the Jobs
     tab is selected (.jobs-view on <body>), and an IntersectionObserver can
     miss that display:none -> block transition. Without this, the first
     section's charts stay blank until the reader happens to scroll. Force one
     draw pass the moment the tab becomes visible; the observers above take
     over for every section reached by scrolling after that.

     Standalone, nothing is hidden, the observers fire normally on load, and
     <body> never carries .jobs-view -- so this is skipped entirely.

     Note on the history here: sync_jobs_displacement.py used to APPEND this
     block after the closing `})();` below, which put it outside the scope
     that declares drawFor. `const drawFor` is block-scoped to this IIFE, so
     the call threw ReferenceError inside the MutationObserver callback on
     every tab open, and the charts it exists to draw were in fact being drawn
     later by the scroll observer. Living inside the IIFE is the fix; keep it
     here. */
  if (EMBEDDED) {
    const firstSec = document.querySelector('#jobDisplacementArea .sec');
    if (firstSec) {
      const reveal = () => {
        if (!document.body.classList.contains('jobs-view')) return;
        drawFor(firstSec.id);            // idempotent: drawFor tracks `drawn`
        firstSec.classList.add('in');
      };
      reveal();
      new MutationObserver(reveal)
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
  }
})();
