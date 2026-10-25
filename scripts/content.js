import fs from 'node:fs';
import { parse } from 'node-html-parser';
import { illustrations } from '../src/calculations.js';
import { reviewStatus } from '../src/facts.js';

export const registry = JSON.parse(fs.readFileSync(new URL('../src/data/framework-facts.json', import.meta.url), 'utf8'));
export const facts = Object.assign({}, registry.L1_evergreen, registry.L2_annual, registry.L3_quarterly);
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const topicId = text => 'topic-' + text.toLowerCase().replace(/â†’/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function validateRegistry(data = registry) {
  const seen = new Set();
  for (const group of ['L1_evergreen', 'L2_annual', 'L3_quarterly']) {
    for (const [id, entry] of Object.entries(data[group])) {
      if (seen.has(id)) throw new Error(`Duplicate fact: ${id}`);
      seen.add(id);
      if (!entry.val || !entry.label || !['law', 'research', 'calculation', 'editorial', 'rate'].includes(entry.claim_type)) throw new Error(`Invalid fact: ${id}`);
      if (!['verified', 'needs_review', 'editorial', 'calculated'].includes(entry.review_status)) throw new Error(`Missing review status: ${id}`);
      if (!entry.effective_period || !entry.assumptions || !Array.isArray(entry.sources) || !entry.sources.length) throw new Error(`Missing provenance: ${id}`);
      if (entry.review_status === 'verified' && !/^\d{4}-\d{2}-\d{2}$/.test(entry.reviewed_on || '')) throw new Error(`Missing review date: ${id}`);
      if (entry.review_status !== 'verified' && entry.reviewed_on !== null) throw new Error(`Unverified claim has a verification date: ${id}`);
      for (const source of entry.sources) if (!source.title || !source.locator || !/^https:\/\//.test(source.url)) throw new Error(`Invalid source: ${id}`);
    }
  }
}

function renderGlossary(text, glossary) {
  const terms = [...glossary.keys()].filter(term => term.length > 1).sort((a, b) => b.length - a.length);
  if (!terms.length) return escapeHtml(text);
  const pattern = new RegExp('\\b(' + terms.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'g');
  let cursor = 0, output = '';
  for (const match of text.matchAll(pattern)) {
    output += escapeHtml(text.slice(cursor, match.index));
    output += `<span class="jargon" tabindex="0" data-tip="${escapeHtml(glossary.get(match[0]))}">${escapeHtml(match[0])}</span>`;
    cursor = match.index + match[0].length;
  }
  return output + escapeHtml(text.slice(cursor));
}

export function transformContent(html) {
  validateRegistry();
  const root = parse(html);
  const glossary = new Map(root.querySelectorAll('.jargon[data-tip]').map(el => [el.textContent.trim(), el.getAttribute('data-tip')]));
  for (const el of root.querySelectorAll('[data-fact]')) {
    const id = el.getAttribute('data-fact'), fact = facts[id];
    if (!fact) throw new Error(`Unknown fact: ${id}`);
    el.set_content(renderGlossary(fact.val, glossary));
    const status = reviewStatus(fact);
    el.setAttribute('data-review-status', status);
    if (fact.reviewed_on) el.setAttribute('data-reviewed-on', fact.reviewed_on);
    el.setAttribute('title', `${fact.label}: ${status === 'verified' ? 'source checked ' + fact.reviewed_on : status.replaceAll('_', ' ')}. See source notes.`);
    el.insertAdjacentHTML('afterend', `<a class="fact-source" href="#source-${id}" aria-label="Source and ${escapeHtml(status.replaceAll('_', ' '))} status for ${escapeHtml(fact.label)}">[source${status === 'needs_review' ? ': review pending' : ''}]</a>`);
  }
  for (const el of root.querySelectorAll('[data-calculation]')) {
    const id = el.getAttribute('data-calculation');
    if (!(id in illustrations)) throw new Error(`Unknown calculation: ${id}`);
    el.set_content(escapeHtml(illustrations[id]));
  }
  const topics = [];
  for (const detail of root.querySelectorAll('#implementation details:not(.topic-directory)')) {
    const summary = detail.querySelector('summary');
    const title = summary.textContent.replace(/\s+/g, ' ').trim();
    const id = detail.id || topicId(title);
    detail.setAttribute('id', id);
    topics.push({ id, title });
    const body = detail.querySelector('.details-content');
    body.insertAdjacentHTML('afterbegin', `<a class="topic-permalink" href="#${id}">Link to this topic</a>`);
  }
  root.querySelector('#topic-index')?.set_content(topics.map(t => `<li><a href="#${t.id}">${escapeHtml(t.title)}</a></li>`).join('\n'));
  root.querySelector('#source-notes-list')?.set_content(Object.entries(facts).map(([id, f]) => `<li id="source-${id}"><h4>${escapeHtml(f.label)}</h4><p><strong>${escapeHtml(f.claim_type)}</strong> Â· ${escapeHtml(reviewStatus(f).replaceAll('_', ' '))}${f.reviewed_on ? ' Â· source checked ' + escapeHtml(f.reviewed_on) : ''}${f.review_due ? ' Â· review due ' + escapeHtml(f.review_due) : ''}</p><p>${escapeHtml(f.val)}</p>${f.legal_reference ? `<p>Provision: ${escapeHtml(f.legal_reference)}</p>` : ''}${f.verification_scope ? `<p>Verification scope: ${escapeHtml(f.verification_scope)}</p>` : ''}<p>${escapeHtml(f.effective_period)}. ${escapeHtml(f.assumptions)}</p><ul>${f.sources.map(s => `<li><a href="${escapeHtml(s.url)}" rel="noopener noreferrer">${escapeHtml(s.title)}</a> â€” ${escapeHtml(s.locator)}</li>`).join('')}</ul></li>`).join('\n'));
  return root.toString();
}
