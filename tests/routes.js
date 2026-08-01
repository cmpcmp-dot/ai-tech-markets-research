#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   routes.js — snapshot every route's observable state, and fail on drift.

       node tests/routes.js            compare against the stored snapshot
       node tests/routes.js --write    re-record the snapshot

   WHY THIS EXISTS. Phase 1 of the src/ refactor could prove itself by being
   byte-identical to the file it replaced. The router refactor cannot: it
   deliberately rewrites the code. This is the substitute. It pins what a reader
   can actually observe -- which view is on, which tab is selected, which panel
   is visible, what the address bar says, whether the charts drew -- so a
   refactor that changes none of that is provably safe, and one that changes
   some of it has to say so out loud by re-recording.

   WHEN THE SNAPSHOT LEGITIMATELY CHANGES. Rebuilding a data contract moves the
   chart node counts, and adding a view or tab adds rows. Both are real changes:
   re-record with --write and let the diff show up in review. Do not re-record
   to make a red test go away without reading the diff first.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const { load, settle, ROOT } = require('./dom.js');

const SNAP = path.join(__dirname, 'snapshots', 'routes.json');

/* Routes worth pinning: one per view, every tracker sub-tab, the chain, both
   legacy aliases, a parameterised route, and two that should not match. */
const ROUTES = [
  '', '#about', '#research', '#changelog', '#fact-bank', '#policy', '#solutions',
  '#job-displacement',
  '#tracker', '#tracker/jobs', '#tracker/jolts', '#tracker/gdp',
  '#tracker/productivity', '#tracker/btos',
  '#tracker/btos/aggregate', '#tracker/btos/exposure', '#tracker/btos/who',
  '#tracker/btos/what-for', '#tracker/btos/where', '#tracker/btos/jobs',
  '#adoption', '#adoption/exposure', '#adoption/who',
  '#tracker/nonsense', '#nonsense',
];

const NAV_IDS   = ['viewCards', 'viewFactBank', 'viewPolicy', 'viewTracker', 'viewJobs', 'viewSolutions'];
const TRK_TABS  = ['jobs', 'jolts', 'gdp', 'productivity', 'btos'];
const AD_LINKS  = ['aggregate', 'exposure', 'who', 'what-for', 'where', 'jobs'];
const CHART_IDS = [
  'adHeadline', 'adSize', 'adSupSector', 'adSubsector', 'adDiffusion', 'adStateMap',
  'adSupFunctions', 'adSupGenai', 'adSupBarriers', 'adSupEmpEffect', 'adExposureScatter',
  'trkPrimeAge', 'trkCes', 'trkJoltsQuits', 'trkJoltsHires', 'trkJoltsLayoffs',
  'trkJoltsOpenings', 'trkGdp',
];

const txt = el => (el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : null);

/* Async because the page is not finished when parsing is. A route that
   triggers a lazy payload during init (any #tracker/btos/where deep link)
   makes the browser defer the remaining <script src> tags to the next tick,
   so reading synchronously catches the charts before they draw. Settle first
   and measure the state a reader would actually see. */
async function capture(hash) {
  const { w, d, errors } = load('index.html', hash);
  await settle(10);
  const on = (id, attr) => { const e = d.getElementById(id); return e ? e.getAttribute(attr) : null; };

  return {
    errors,
    bodyClasses: [...d.body.classList].sort(),
    // Which top nav button reads as current
    nav: NAV_IDS.filter(id => { const e = d.getElementById(id); return e && e.classList.contains('active'); }),
    navSelected: NAV_IDS.filter(id => on(id, 'aria-selected') === 'true'),
    panelLabelledBy: on('viewPanel', 'aria-labelledby'),
    announce: txt(d.getElementById('viewAnnounce')),
    // Tracker sub-tabs: selected button, and every panel that is not hidden
    trackerTab: TRK_TABS.find(t => on('trkTab-' + t, 'aria-selected') === 'true') || null,
    trackerVisible: TRK_TABS.filter(t => { const p = d.getElementById('trkPanel-' + t); return p && !p.hidden; }),
    // BTOS chain
    chainLink: AD_LINKS.find(k => { const b = d.getElementById('adLink-' + k); return b && b.classList.contains('on'); }) || null,
    chainVisible: AD_LINKS.filter(k => { const p = d.getElementById('adPanel-' + k); return p && !p.hidden; }),
    chainValues: AD_LINKS.map(k => txt(d.getElementById('adChainV-' + k))),
    // Address bar after the route settled
    hash: w.location.hash,
    // Did each chart draw, and to what size
    charts: Object.fromEntries(CHART_IDS.map(id => {
      const e = d.getElementById(id);
      return [id, e ? e.childNodes.length : -1];
    })),
    // Tracker stat tiles, values included: these are published numbers on screen
    stats: Object.fromEntries(['trkJobsStats', 'trkJoltsStats', 'trkGdpStats'].map(id => {
      const e = d.getElementById(id);
      return [id, e ? [...e.querySelectorAll('.trk-stat-v')].map(x => txt(x)) : null];
    })),
    // The empty state must stay empty
    productivityEmpty: (() => {
      const p = d.getElementById('trkPanel-productivity');
      if (!p) return null;
      return { svgs: p.querySelectorAll('svg').length, stats: p.querySelectorAll('.trk-stat').length,
               marked: /Not built yet/.test(p.textContent) };
    })(),
  };
}

async function main() {
  const write = process.argv.includes('--write');

  /* --slice a:b runs a contiguous chunk of ROUTES. Each capture parses the
     whole 393 KB document plus 2.3 MB of payloads, so the full sweep takes a
     couple of minutes; slicing keeps it inside a short command timeout and
     lets the halves run in parallel. Comparison is per-route, so a partial run
     checks the routes it covers and reports the rest as skipped. */
  const sliceArg = (process.argv.find(a => a.startsWith('--slice=')) || '').split('=')[1];
  const [lo, hi] = sliceArg ? sliceArg.split(':').map(Number) : [0, ROUTES.length];
  const subset = ROUTES.slice(lo, hi);

  const now = {};
  for (const r of subset) now[r || '(none)'] = await capture(r);

  // Standalone page: fewer moving parts, but it must load clean and render.
  if (!sliceArg || hi >= ROUTES.length) {
    const { d, errors } = load('jobs_displacement.html', '#level');
    await settle(4);
    now['[standalone]'] = {
      errors,
      sections: d.querySelectorAll('#jobDisplacementArea .sec').length,
      answers: (d.getElementById('answers') || { children: [] }).children.length,
      wrapper: !!d.getElementById('jobDisplacementArea'),
      embedded: !!d.getElementById('viewPanel'),
    };
  }

  if (write) {
    fs.mkdirSync(path.dirname(SNAP), { recursive: true });
    // A sliced --write updates only the routes it captured, so two half runs
    // compose into one complete snapshot.
    const merged = fs.existsSync(SNAP) && sliceArg
      ? Object.assign(JSON.parse(fs.readFileSync(SNAP, 'utf8')), now) : now;
    fs.writeFileSync(SNAP, JSON.stringify(merged, null, 2) + '\n');
    console.log(`routes.js: recorded ${Object.keys(now).length} routes -> tests/snapshots/routes.json`);
    return 0;
  }

  if (!fs.existsSync(SNAP)) {
    console.error('routes.js: no snapshot. Record one first:\n  node tests/routes.js --write');
    return 1;
  }

  const was = JSON.parse(fs.readFileSync(SNAP, 'utf8'));
  const keys = Object.keys(now);
  const skipped = Object.keys(was).filter(k => !(k in now));
  const diffs = [];
  for (const k of keys) {
    const a = JSON.stringify(was[k], null, 1), b = JSON.stringify(now[k], null, 1);
    if (a !== b) diffs.push(k);
  }

  // Errors are a hard failure even if the snapshot happens to match.
  const noisy = keys.filter(k => (now[k] || {}).errors && now[k].errors.length);

  for (const k of keys) {
    const bad = diffs.includes(k) || noisy.includes(k);
    console.log(`  ${bad ? 'CHANGED' : 'same   '}  ${k}`);
  }
  if (noisy.length) {
    console.error('\nroutes.js: console errors on ' + noisy.length + ' route(s):');
    for (const k of noisy) console.error(`  ${k}: ${now[k].errors[0]}`);
  }
  if (diffs.length) {
    console.error(`\nroutes.js: ${diffs.length} route(s) changed observable state.`);
    for (const k of diffs.slice(0, 4)) {
      console.error(`\n--- ${k}\n  was: ${JSON.stringify(was[k])}\n  now: ${JSON.stringify(now[k])}`);
    }
    console.error('\nIf every change above is intended, re-record:\n  node tests/routes.js --write');
  }
  if (!diffs.length && !noisy.length) {
    console.log(`\nroutes.js: ${keys.length} routes unchanged, no console errors.` +
                (skipped.length ? ` ${skipped.length} not in this slice.` : ''));
  }
  return (diffs.length || noisy.length) ? 1 : 0;
}

main().then(code => process.exit(code));
