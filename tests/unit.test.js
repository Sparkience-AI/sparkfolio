import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from 'node-html-parser';
import { answerOptions, evaluateDecision, parseAmount } from '../src/decision.js';
import { futureValue, yearsToTarget, illustrations } from '../src/calculations.js';
import { reviewStatus } from '../src/facts.js';
import { facts, registry, transformContent, validateRegistry } from '../scripts/content.js';

const ready = { regime: 'ntr', age: '20s', dependents: 'no', health: 'yes', term: 'yes', ef: '6+', debt: 'no', corpPf: 'yes', tax: 'yes' };
test('17-claim follow-up keeps checked scope and material qualifications visible', () => {
  const audited = Object.values(facts).filter(f => f.verification_scope);
  assert.equal(audited.length, 17);
  for (const fact of audited) {
    assert.equal(fact.review_status, 'verified');
    assert.equal(fact.reviewed_on, '2026-10-25');
    assert.ok(fact.legal_reference);
    assert.ok(fact.sources.every(s => /incometaxindia\.gov\.in|epfindia\.gov\.in|pib\.gov\.in|sebi\.gov\.in|newsonair\.gov\.in|www\.sgcms\.com/.test(new URL(s.url).hostname)));
  }
  assert.match(facts.rate_epf_interest.val, /FY 2025–26 declared rate/);
  assert.match(facts.rate_epf_interest.assumptions, /third-party-hosted reproduction/);
  assert.match(facts.tax_sec_80ccd2_private.assumptions, /otherwise.*10%/);
  assert.match(facts.cap_sec_80ccd1b_nps.assumptions, /Not available.*New Regime/);
  assert.match(facts.tax_sec_56_2_xii_reit_repayment.assumptions, /max\(A − B − C, 0\)/);
  assert.match(facts.sebi_brokerage_cap_cash.assumptions, /Excess brokerage falls within BER/);
  const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const root = parse(transformContent(source));
  for (const [id, fact] of Object.entries(facts).filter(([, f]) => f.verification_scope)) {
    const note = root.querySelector(`#source-${id}`).textContent;
    assert.ok(note.includes(fact.verification_scope));
    assert.ok(note.includes(fact.legal_reference));
  }
  assert.doesNotMatch(source, /regardless of premium size or policy type|Secondary market buyers, even if held to maturity, must pay 12.5%/);
});
test('amount validation never truncates or silently changes invalid input', () => {
  assert.equal(parseAmount(''), null);
  assert.equal(parseAmount('10000.50'), 10000.5);
  assert.equal(parseAmount(String(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER);
  for (const raw of ['0', '-1', '1e6', '100.999', '1,000', 'Infinity', 'NaN', '9007199254740992', '9007199254740991.01', '<script>']) assert.throws(() => parseAmount(raw));
  assert.match(evaluateDecision(ready, '9007199254740990.99').context, /\.99/);
});
test('all 3072 explicit answer combinations respect precedence and context', () => {
  let total = 0;
  function walk(keys, state = {}) {
    if (!keys.length) {
      total++;
      const result = evaluateDecision(state);
      const expected = state.ef === 'none' ? 1 : state.health === 'no' ? 2 : state.dependents === 'yes' && state.term === 'no' ? 3 : state.corpPf === 'no' ? 4 : state.debt === 'yes' ? 5 : state.ef === '<3' || ['40s', '50s'].includes(state.age) && state.ef !== '6+' ? 6 : 7;
      assert.equal(result.step, expected);
      assert.ok(result.assumptions.includes(state.age));
      assert.ok(result.assumptions.includes(state.regime === 'ntr' ? 'New' : 'Old'));
      assert.doesNotMatch(result.explanation, /80.100%|Deploy the entire|30% upfront/);
      return;
    }
    for (const value of answerOptions[keys[0]]) walk(keys.slice(1), { ...state, [keys[0]]: value });
  }
  walk(Object.keys(answerOptions));
  assert.equal(total, 3072);
  assert.throws(() => evaluateDecision({ ...ready, health: '' }));
  assert.equal(evaluateDecision({ ...ready, corpPf: 'na' }).step, 7);
});
test('projection convention matches independently calculated targets', () => {
  assert.ok(Math.abs(futureValue() - 16170898.564479) < 0.01);
  assert.ok(Math.abs(futureValue({ stepUp: 0.1 }) - 33620172.274635) < 0.01);
  assert.equal(futureValue({ monthly: 100, years: 1, annualReturn: 0 }), 1200);
  assert.equal(yearsToTarget(1e7), 15.5);
  assert.equal(illustrations.fixed_sip, '₹1.62 Cr');
  assert.equal(illustrations.stepped_sip, '₹3.36 Cr');
  assert.throws(() => futureValue({ years: -1 }));
});
test('provenance rejects fabricated dates and missing sources', () => {
  validateRegistry();
  const broken = structuredClone(registry);
  broken.L1_evergreen.rule_swr_india.reviewed_on = '2026-10-25';
  assert.throws(() => validateRegistry(broken));
  broken.L1_evergreen.rule_swr_india.reviewed_on = null;
  broken.L1_evergreen.rule_swr_india.sources = [];
  assert.throws(() => validateRegistry(broken));
  assert.equal(reviewStatus({ review_status: 'verified', review_due: '2026-09-30' }, '2026-10-25'), 'needs_review');
});
test('build resolves nested facts, calculation values, source links and topic IDs', () => {
  const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const html = transformContent(source), root = parse(html);
  assert.equal(Object.keys(facts).length, 38);
  for (const [id, fact] of Object.entries(facts)) assert.ok(root.querySelector(`#source-${id}`), `Missing source ${id}`);
  for (const element of root.querySelectorAll('[data-fact]')) assert.equal(element.textContent, facts[element.getAttribute('data-fact')].val);
  for (const node of root.querySelectorAll('[data-calculation]')) assert.equal(node.textContent, illustrations[node.getAttribute('data-calculation')]);
  for (const a of root.querySelectorAll('a[href^="#"]')) {
    const id = a.getAttribute('href').slice(1);
    if (id) assert.ok(root.querySelector(`[id="${id}"]`), `Broken anchor ${id}`);
  }
  const ids = root.querySelectorAll('[id]').map(n => n.id);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs');
  assert.ok(root.querySelector('#goal-based'));
  assert.ok(root.querySelector('#topic-cash'));
  assert.equal(root.querySelectorAll('script:not([src]):not([type="application/ld+json"])').length, 0);
  assert.equal(root.querySelectorAll('input[type="radio"][checked]').length, 0);
  const structured = JSON.parse(root.querySelector('script[type="application/ld+json"]').textContent);
  assert.deepEqual(structured['@graph'].map(x => x['@type']), ['Organization', 'WebPage']);
  assert.throws(() => transformContent('<span data-fact="unknown">old</span>'));
  const nested = parse(transformContent('<span data-fact="math_compounding_1st_vs_2nd_crore"><strong>old</strong></span>'));
  assert.equal(nested.querySelector('[data-fact]').textContent, facts.math_compounding_1st_vs_2nd_crore.val);
});
