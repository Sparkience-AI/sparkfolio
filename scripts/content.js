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
  const sourceNumbers = new Map(Object.keys(facts).map((id, index) => [id, index + 1]));
  for (const el of root.querySelectorAll('[data-fact]')) {
    const id = el.getAttribute('data-fact'), fact = facts[id];
    if (!fact) throw new Error(`Unknown fact: ${id}`);
    el.set_content(renderGlossary(fact.val, glossary));
    const status = reviewStatus(fact);
    el.setAttribute('data-review-status', status);
    if (fact.reviewed_on) el.setAttribute('data-reviewed-on', fact.reviewed_on);
    el.setAttribute('title', `${fact.label}: ${status === 'verified' ? 'source checked ' + fact.reviewed_on : status.replaceAll('_', ' ')}. See source notes.`);
    el.insertAdjacentHTML('afterend', `<sup class="fact-reference"><a class="fact-source" href="#source-${id}" aria-label="Reference ${sourceNumbers.get(id)}: ${escapeHtml(fact.label)}, ${escapeHtml(status.replaceAll('_', ' '))}">${sourceNumbers.get(id)}</a></sup>`);
  }
  for (const el of root.querySelectorAll('[data-calculation]')) {
    const id = el.getAttribute('data-calculation');
    if (!(id in illustrations)) throw new Error(`Unknown calculation: ${id}`);
    el.set_content(escapeHtml(illustrations[id]));
  }
  for (const detail of root.querySelectorAll('#implementation details')) {
    const summary = detail.querySelector('summary');
    const title = summary.textContent.replace(/\s+/g, ' ').trim();
    const id = detail.id || topicId(title);
    detail.setAttribute('id', id);
  }
  root.querySelector('#source-notes-list')?.set_content(Object.entries(facts).map(([id, f]) => {
    const status = reviewStatus(f);
    const label = { verified: 'Source checked', editorial: 'Editorial', calculated: 'Calculated', needs_review: 'Needs review' }[status];
    return `<li id="source-${id}"><details class="source-entry"><summary><span class="source-number">${sourceNumbers.get(id).toString().padStart(2, '0')}</span><span class="source-heading">${escapeHtml(f.label)}</span><span class="source-status" data-status="${status}">${label}</span></summary><div class="details-content"><p class="source-value">${escapeHtml(f.val)}</p><p class="source-period">${escapeHtml(f.effective_period)}</p>${f.verification_scope ? `<p>${escapeHtml(f.verification_scope)}</p>` : ''}<p>${escapeHtml(f.assumptions)}</p>${f.legal_reference ? `<p class="source-provision">${escapeHtml(f.legal_reference)}</p>` : ''}<ul class="source-links">${f.sources.map(s => `<li><a href="${escapeHtml(s.url)}" rel="noopener noreferrer">${escapeHtml(s.title)} <span aria-hidden="true">↗</span></a><span class="source-locator">${escapeHtml(s.locator)}</span></li>`).join('')}</ul>${f.reviewed_on ? `<p class="source-review">Checked ${escapeHtml(f.reviewed_on)}${f.review_due ? ' · next review ' + escapeHtml(f.review_due) : ''}</p>` : ''}</div></details></li>`;
  }).join('\n'));
  return root.toString();
}
