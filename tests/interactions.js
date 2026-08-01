#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   interactions.js — clicking and keyboard, which the route snapshot cannot see.

       node tests/interactions.js

   tests/routes.js loads each URL and pins the result, so it proves routing.
   It says nothing about what happens when a reader actually clicks something,
   and the router refactor replaced six per-button click listeners with one
   delegated listener plus data-view attributes. A typo in an attribute would
   leave every route green and every button dead. Hence this file.
   ═══════════════════════════════════════════════════════════════════════════ */
const { load, settle } = require('./dom.js');

let failed = 0;
const ok = (name, cond, detail) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name + (cond || !detail ? '' : '\n           ' + detail));
  if (!cond) failed++;
};

const TRK = ['jobs', 'jolts', 'gdp', 'productivity', 'btos'];
const AD  = ['aggregate', 'exposure', 'who', 'what-for', 'where', 'jobs'];

const click = (w, d, id) => {
  const el = d.getElementById(id);
  if (!el) throw new Error('no element #' + id);
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
};
const key = (w, el, k) => el.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true }));
const bodyView = d => (d.body.className.match(/([\w-]+)-view/) || [])[1] || null;
const trkOpen = d => TRK.filter(t => !d.getElementById('trkPanel-' + t).hidden);
const adOpen  = d => AD.filter(k => !d.getElementById('adPanel-' + k).hidden);

/* ── the view nav ─────────────────────────────────────────────────────── */
{
  const { w, d } = load('index.html', '#about');
  const cases = [
    ['viewCards', 'cards', '#research'],
    ['viewFactBank', 'fact-bank', '#fact-bank'],
    ['viewPolicy', 'policy', '#policy'],
    ['viewTracker', 'tracker', '#tracker/btos'],
    ['viewJobs', 'jobs', '#job-displacement'],
    ['viewSolutions', 'solutions', '#solutions'],
  ];
  for (const [id, view, hash] of cases) {
    click(w, d, id);
    ok(`click #${id} -> ${view} view`, bodyView(d) === view, `body view was ${bodyView(d)}`);
    ok(`click #${id} -> hash ${hash}`, w.location.hash === hash, `hash was ${w.location.hash}`);
    const btn = d.getElementById(id);
    ok(`click #${id} -> button marked active`,
       btn.classList.contains('active') && btn.getAttribute('aria-selected') === 'true');
  }
}

/* Clicking Papers must reset the research sub-view, but routing to #changelog
   must not. Both go through setView('cards'), so this is the pair that keeps
   the reset on the click rather than in the view switch. */
{
  const { w, d } = load('index.html', '#changelog');
  ok('#changelog opens the changelog sub-view',
     d.body.classList.contains('changelog-subview'));
  click(w, d, 'viewCards');
  ok('clicking Papers leaves the changelog sub-view',
     !d.body.classList.contains('changelog-subview'));
  ok('clicking Papers writes #research', w.location.hash === '#research', w.location.hash);
}

/* ── Data Tracker sub-tabs ────────────────────────────────────────────── */
{
  const { w, d } = load('index.html', '#tracker/btos');
  for (const t of TRK) {
    click(w, d, 'trkTab-' + t);
    ok(`click tracker tab ${t}`, trkOpen(d).join() === t, `open: ${trkOpen(d).join()}`);
    const expect = t === 'btos' ? '#tracker/btos' : '#tracker/' + t;
    ok(`tracker tab ${t} writes ${expect}`, w.location.hash === expect, w.location.hash);
  }
}

/* ── BTOS chain, now driven by makeTabGroup ───────────────────────────── */
{
  const { w, d } = load('index.html', '#tracker/btos');
  for (const k of AD) {
    click(w, d, 'adLink-' + k);
    ok(`click chain link ${k}`, adOpen(d).join() === k, `open: ${adOpen(d).join()}`);
  }
  click(w, d, 'adLink-exposure');
  ok('chain link writes the third segment', w.location.hash === '#tracker/btos/exposure', w.location.hash);
  click(w, d, 'adLink-aggregate');
  ok('first chain link drops the third segment', w.location.hash === '#tracker/btos', w.location.hash);
}

/* Prev/next buttons inside each chain panel. */
{
  const { w, d } = load('index.html', '#tracker/btos');
  const next = d.querySelector('#adPanel-aggregate .ad-step-btn[data-goto]');
  ok('chain panels have prev/next controls', !!next);
  if (next) {
    next.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    ok('next control advances the chain', adOpen(d).join() === 'exposure', adOpen(d).join());
  }
}

/* ── keyboard, per the tablist pattern ────────────────────────────────── */
{
  const { w, d } = load('index.html', '#tracker/jobs');
  key(w, d.getElementById('trkTab-jobs'), 'ArrowRight');
  ok('ArrowRight moves to the next tracker tab', trkOpen(d).join() === 'jolts', trkOpen(d).join());
  key(w, d.getElementById('trkTab-jolts'), 'End');
  ok('End moves to the last tracker tab', trkOpen(d).join() === 'btos', trkOpen(d).join());
  key(w, d.getElementById('trkTab-btos'), 'Home');
  ok('Home moves to the first tracker tab', trkOpen(d).join() === 'jobs', trkOpen(d).join());
}
{
  const { w, d } = load('index.html', '#tracker/btos');
  key(w, d.getElementById('adLink-aggregate'), 'ArrowRight');
  ok('ArrowRight moves along the BTOS chain', adOpen(d).join() === 'exposure', adOpen(d).join());
  key(w, d.getElementById('adLink-exposure'), 'ArrowLeft');
  ok('ArrowLeft moves back along the BTOS chain', adOpen(d).join() === 'aggregate', adOpen(d).join());
}

/* Arrow keys in one group must not move the other. */
{
  const { w, d } = load('index.html', '#tracker/btos');
  key(w, d.getElementById('adLink-aggregate'), 'ArrowRight');
  ok('chain keys do not move the tracker tabs', trkOpen(d).join() === 'btos', trkOpen(d).join());
  key(w, d.getElementById('trkTab-btos'), 'ArrowLeft');
  ok('tracker keys do not move the chain', adOpen(d).join() === 'exposure', adOpen(d).join());
}

/* ── lazy payloads ────────────────────────────────────────────────────────
   The two biggest payloads are fetched on first use rather than at page load.
   Assert both halves: absent at load, and present and rendered after the view
   that needs them is opened. Without the disk interceptor in dom.js these
   would silently no-op, so the "absent at load" half is the guard against a
   test that passes for the wrong reason. */
(async () => {
  const { w, d, errors } = load('index.html', '#about');

  ok('Fact Bank payload is NOT loaded at page load', typeof w.FACT_BANK_LOADED === 'undefined' &&
     d.getElementById('byPaperView').children.length === 0);
  ok('US_ALBERS is NOT loaded at page load', typeof w.US_ALBERS === 'undefined');
  ok('Fact Bank tab is present anyway (enabled optimistically)', !!d.getElementById('viewFactBank'));
  ok('state map shows a placeholder, not a crash',
     /Map geometry not loaded/.test(d.getElementById('adStateMap').textContent || ''));

  click(w, d, 'viewFactBank');
  await settle(10);
  ok('opening Fact Bank fetches its payload and builds the view',
     d.getElementById('byPaperView').children.length > 0,
     'byPaperView children: ' + d.getElementById('byPaperView').children.length);
  ok('Fact Bank tab survives the lazy load', !!d.getElementById('viewFactBank'));

  click(w, d, 'viewTracker');
  click(w, d, 'adLink-where');
  await settle(10);
  ok('opening the Where panel fetches the map geometry', typeof w.US_ALBERS === 'object');
  ok('state map draws once the geometry arrives',
     d.getElementById('adStateMap').childNodes.length > 50,
     'nodes: ' + d.getElementById('adStateMap').childNodes.length);
  ok('no console errors across the lazy paths', errors.length === 0, errors[0]);

  console.log(failed ? `\ninteractions.js: ${failed} FAILING` : '\ninteractions.js: all interactions pass');
  process.exit(failed ? 1 : 0);
})();
