  /* ── generic tab group ──────────────────────────────────────────────────
     One implementation of "a row of buttons, one panel visible at a time,
     reflected in the hash, keyboard-navigable per the WAI-ARIA tablist
     pattern." Declare the tabs, get the behaviour.

     THIS IS THE SEED OF THE PHASE 3 ROUTER. Today only the Data Tracker's
     sub-tabs use it. The two older tab systems predate it and still work the
     old way:

       - the view nav (Papers / Fact Bank / Data Tracker / ...) is VIEW_TAB_IDS
         plus setView() plus six hand-written click listeners, in 70-render.js
       - the BTOS chain inside the tracker is AD_LINKS plus setAdLink(), in
         50-tracker-tabs.js

     Phase 3 migrates both onto this, deletes their bespoke copies, and moves
     route parsing here too. Until then, resist adding a fourth pattern: if you
     need tabs, call makeTabGroup.

     makeTabGroup({
       name,        // for errors, and the data-tabgroup attribute
       tabs,        // [{id, label}] in display order
       btn,         // id => element id of the button for that tab
       panel,       // id => element id of the panel for that tab
       onChange,    // optional (id, prevId) after the switch is applied
       container,   // optional selector for the button row, for key handling
     })
     -> { set(id, opts), get(), ids, has(id) }
     opts: {focus: true} moves focus to the button, {scroll: true} scrolls the
     row into view, {silent: true} suppresses onChange (used when applying a
     route, so applying a hash does not immediately rewrite it).            */
  function makeTabGroup(cfg) {
    const ids = cfg.tabs.map(t => t.id);
    let active = ids[0];

    function set(id, opts) {
      opts = opts || {};
      if (ids.indexOf(id) < 0) return false;
      const prev = active;
      active = id;
      ids.forEach(k => {
        const btn = document.getElementById(cfg.btn(k));
        const pan = document.getElementById(cfg.panel(k));
        const on = k === id;
        if (btn) {
          btn.classList.toggle('on', on);
          btn.setAttribute('aria-selected', on ? 'true' : 'false');
          btn.tabIndex = on ? 0 : -1;
        }
        // Both: the class carries the CSS transition, `hidden` keeps the panel
        // out of the accessibility tree and out of find-in-page.
        if (pan) { pan.classList.toggle('on', on); pan.hidden = !on; }
      });
      if (opts.focus) { const b = document.getElementById(cfg.btn(id)); if (b) b.focus(); }
      if (opts.scroll && cfg.container) {
        const c = document.querySelector(cfg.container);
        if (c) c.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
      if (!opts.silent && cfg.onChange) cfg.onChange(id, prev);
      return true;
    }

    if (cfg.container) {
      document.addEventListener('keydown', e => {
        if (!e.target.closest || !e.target.closest(cfg.container)) return;
        const i = ids.indexOf(active);
        const go = j => { e.preventDefault(); set(ids[Math.max(0, Math.min(j, ids.length - 1))], { focus: true }); };
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(i + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(i - 1);
        else if (e.key === 'Home') go(0);
        else if (e.key === 'End') go(ids.length - 1);
      });
    }

    return { set, get: () => active, ids, has: id => ids.indexOf(id) >= 0 };
  }

