  /* ── Policy Map ─────────────────────────────────────────────── */
  let polLevelFilter = 'all';
  let polViewMode    = 'grid';

  // R3: curated evidence first. A policy's hand-picked `paperIds` (order preserved)
  // are the visible research basis; the category-derived list is demoted to a
  // deduplicated "related" set behind the toggle. Policies without paperIds keep
  // the old behavior (top few category matches visible, rest behind the toggle).
  function getResearchBasis(pol) {
    const paperMap = Object.fromEntries(RESEARCH_DATA.map(r => [r.id, r]));
    const curated = (pol.paperIds || []).map(id => paperMap[id]).filter(Boolean);
    const curatedIds = new Set(curated.map(r => r.id));
    const cats = POL_TO_RESEARCH_CATS[pol.category] || [];
    const related = cats.length
      ? RESEARCH_DATA
          .filter(r => cats.includes(r.category) && !curatedIds.has(r.id))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 16)
      : [];
    return { curated, related };
  }

  // Build the policy "Research basis" reference list.
  function buildPolicyBasis(basis) {
    const curated = (basis && basis.curated) || [];
    const related = (basis && basis.related) || [];
    if (!curated.length && !related.length) return '';
    const renderRef = r => {
      const href = r.sourceUrl ? ` href="${r.sourceUrl}" target="_blank" rel="noopener"` : '';
      return `<a class="pol-basis-ref"${href} onclick="event.stopPropagation()">${formatAPACitation(r)}</a>`;
    };
    const SHOWN = 4;
    const shown = curated.length ? curated : related.slice(0, SHOWN);
    const rest  = curated.length ? related : related.slice(SHOWN);
    const restLabel = curated.length ? 'related' : 'more related';
    return `<div class="pol-basis"><div class="pol-basis-label">Research basis</div>`
      + `<div class="pol-basis-refs">${shown.map(renderRef).join('')}</div>`
      + (rest.length ? `<button class="pol-basis-toggle" type="button" aria-expanded="false"><span class="ui-chevron pol-basis-chevron" aria-hidden="true"></span><span class="pol-basis-toggle-text">Show ${rest.length} ${restLabel} ${rest.length === 1 ? 'study' : 'studies'}</span></button>`
        + `<div class="pol-basis-refs pol-basis-related" style="display:none">${rest.map(renderRef).join('')}</div>` : '')
      + `</div>`;
  }

  // APA-style citation: Author. (Year). Title. Organization.
  // The `source` field stores "Author — Organization"; a bare organization stands alone.
  function formatAPACitation(p) {
    const year = p.date ? p.date.slice(0, 4) : 'n.d.';
    const src = (p.source || '').trim();
    let author = src, org = '';
    if (src.includes(' — ')) {
      const parts = src.split(' — ');
      author = parts[0].trim();
      org = parts.slice(1).join(' — ').trim();
    }
    const orgPart = org && org.toLowerCase() !== author.toLowerCase() ? ` ${org}.` : '';
    const authorDot = author.endsWith('.') ? '' : '.';
    const titleDot = /[.?!]$/.test(p.title) ? '' : '.';
    return `${author}${authorDot} (${year}). <em>${p.title}</em>${titleDot}${orgPart}`;
  }

  // Inline citations: {{cite:ID}} renders a hyperlinked (Year) after an author
  // named in the prose; {{citep:ID}} renders a parenthetical (Author, Year).
  function injectCitations(html, paperMap) {
    if (!html) return html;
    return html.replace(/ ?\{\{(citep?):(\d+)\}\}/g, (m, kind, id) => {
      const p = paperMap[+id];
      if (!p || !p.sourceUrl) return '';
      const year = p.date ? p.date.slice(0, 4) : 'n.d.';
      let label = year;
      if (kind === 'citep') {
        const authorPart = (p.source || '').split(' — ')[0].trim();
        const author = authorPart.includes(',')
          ? authorPart.split(',')[0].trim() + ' et al.'
          : authorPart;
        label = `${author}, ${year}`;
      }
      const aria = `${(p.source || '').replace(/\s*—\s*/g, ', ')}, ${year}. Opens in new tab.`.replace(/"/g, '&quot;');
      return ` (<a class="syn-cite" href="${p.sourceUrl}" target="_blank" rel="noopener noreferrer" aria-label="${aria}">${label}</a>)`;
    });
  }

  // Policy prose links. Runs inline paper citations ({{cite}}/{{citep}}), then
  // resolves cross-reference tokens {{pol:id|text}} into inline links that open
  // the named policy's modal. Tokens with no matching policy degrade to plain text.
  function injectPolicyLinks(html, paperMap) {
    if (!html) return html;
    return injectCitations(html, paperMap)
      .replace(/\{\{pol:([a-z0-9-]+)\|([^}]+)\}\}/g, (m, id, text) => {
        const target = POLICY_DATA.find(p => p.id === id);
        if (!target) return text;
        return `<a class="pol-xref" data-pol-id="${id}" role="link" tabindex="0" title="See policy: ${target.title.replace(/"/g, '&quot;')}">${text}</a>`;
      });
  }

  // Open a policy modal given only its id (used by cross-reference links).
  function openPolModalById(id) {
    const p = POLICY_DATA.find(x => x.id === id);
    if (!p) return;
    const lvl = DISRUPTION_LEVELS.find(l => l.id === p.level) || {};
    const catLabel = POLICY_CATEGORIES[p.category] || '';
    const basisHTML = buildPolicyBasis(getResearchBasis(p));
    openPolModal(p, lvl, catLabel, basisHTML);
  }

