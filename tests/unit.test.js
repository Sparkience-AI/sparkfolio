import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from 'node-html-parser';
import { answerOptions, evaluateDecision, parseAmount, illustrateTax, validBrackets, decisionPolicy } from '../src/decision.js';
import { futureValue, yearsToTarget, illustrations } from '../src/calculations.js';
import { reviewStatus } from '../src/facts.js';
import { facts, registry, transformContent, validateRegistry } from '../scripts/content.js';

const ready = { regime: 'ntr', age: '20s', dependents: 'no', health: 'yes', term: 'yes', ef: '6+', debt: 'no', corpPf: 'yes', tax: 'yes', taxBracket: '30', horizon: 'long', capacity: 'comfortable' };
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
test('all 239616 valid combinations produce complete, consistent independent reviews', () => {
  let total = 0;
  const reached = new Set();
  function walk(keys, state = {}) {
    if (!keys.length) {
      total++;
      const result = evaluateDecision(state);
      const expected = state.ef === 'none' ? 1 : state.health === 'no' ? 2 : state.dependents === 'yes' && state.term === 'no' ? 3 : state.corpPf === 'no' ? 4 : state.debt === 'yes' ? 5 : state.ef === '<3' || ['40s', '50s'].includes(state.age) && state.ef === '3-6' ? 6 : null;
      assert.equal(result.step, expected);
      assert.ok(result.assumptions.includes(state.age));
      assert.ok(result.assumptions.includes(state.regime === 'ntr' ? 'New' : 'Old'));
      const ids = new Set(result.cards.map(c => c.id));
      assert.equal(ids.size, result.cards.length);
      for (const card of result.cards) {
        reached.add(card.id);
        assert.ok(card.explanation && card.action && card.sourceIds.length);
        for (const id of card.sourceIds) assert.ok(decisionPolicy.sources[id]);
        for (const id of card.factIds) assert.ok(facts[id]);
        assert.doesNotMatch(card.explanation, /Deploy the entire|30% upfront|80.100% equity/);
      }
      for (const category of ['Goal & liquidity', 'Loss capacity', 'Tax context', 'Regime review']) assert.equal(result.cards.filter(c => c.category === category).length, 1);
      assert.equal(ids.has('baseline'), state.ef === 'none');
      assert.equal(ids.has('health'), state.health === 'no');
      assert.equal(ids.has('dependents'), state.dependents === 'yes' && state.term === 'no');
      assert.equal(ids.has('employer'), state.corpPf === 'no');
      assert.equal(ids.has('debt'), state.debt === 'yes');
      assert.equal(ids.has('reserve'), state.ef === '<3' || ['40s', '50s'].includes(state.age) && state.ef === '3-6');
      assert.equal(ids.has('new-regime'), state.regime === 'ntr');
      assert.equal(ids.has('old-regime'), state.regime === 'otr');
      assert.equal(ids.has('tax-unknown'), state.taxBracket === 'unknown');
      assert.equal(result.illustration === null, state.taxBracket === 'unknown');
      if (result.illustration) assert.equal(result.illustration.tax, Number(state.taxBracket) * 104);
      assert.equal(ids.has('protect-essentials'), state.capacity === 'limited');
      assert.equal(ids.has('assess-capacity'), state.capacity === 'unsure');
      assert.equal(ids.has('define-goal'), state.horizon === 'unsure');
      return;
    }
    const key = keys[0];
    for (const value of key === 'taxBracket' ? validBrackets(state.regime) : answerOptions[key]) walk(keys.slice(1), { ...state, [key]: value });
  }
  walk(Object.keys(answerOptions));
  assert.equal(total, 239616);
  assert.equal(reached.size, 18, 'Every output-card family must be reachable');
  assert.throws(() => evaluateDecision({ ...ready, health: '' }));
  assert.equal(evaluateDecision({ ...ready, corpPf: 'na' }).gapCount, 0);
});
test('tax illustrations respect the selected band, regime and explicit exclusions', () => {
  assert.deepEqual(illustrateTax('30'), { gross: 10000, rate: 0.3, effectiveRate: 0.312, tax: 3120, retained: 6880 });
  assert.equal(illustrateTax('0').retained, 10000);
  assert.equal(illustrateTax('unknown'), null);
  for (const rate of ['10', '15', '25']) assert.throws(() => evaluateDecision({ ...ready, regime: 'otr', taxBracket: rate }));
  assert.throws(() => illustrateTax('40'));
  const first = evaluateDecision(ready, '100');
  const second = evaluateDecision(ready, '999999');
  assert.deepEqual(first.illustration, second.illustration, 'Optional amount never becomes taxable income');
  assert.match(first.context, /not used as taxable income or an eligible deduction/);
  const old = evaluateDecision({ ...ready, regime: 'otr', tax: 'no' });
  assert.match(old.cards.find(c => c.id === 'old-regime').explanation, /fully eligible, unused/);
  assert.match(first.cards.find(c => c.id === 'new-regime').explanation, /unavailable/);
  assert.match(decisionPolicy.illustration_assumptions, /no surcharge, rebate/);
  const gaps = evaluateDecision({ ...ready, ef: 'none', health: 'no', dependents: 'yes', term: 'no', debt: 'yes', corpPf: 'no' });
  assert.equal(gaps.gapCount, 5, 'Concurrent gaps must not be suppressed by the first checkpoint');
  assert.ok(gaps.cards.some(c => c.category === 'Tax context'));
  const independent = evaluateDecision({ ...ready, horizon: 'soon', capacity: 'limited' });
  assert.equal(independent.step, null);
  assert.equal(independent.id, 'near-term');
  assert.ok(independent.cards.some(c => c.id === 'protect-essentials'));
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
  const badPolicy = structuredClone(registry);
  badPolicy._decision_model.cess_rate = -1;
  assert.throws(() => validateRegistry(badPolicy));
  badPolicy._decision_model.cess_rate = 0.04;
  badPolicy._decision_model.sources.tax.locator = '';
  assert.throws(() => validateRegistry(badPolicy));
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
  assert.equal(root.querySelectorAll('.topic-permalink, #topic-index, #start-here').length, 0);
  assert.equal(root.querySelectorAll('#about-framework h2').length, 1);
  assert.equal(root.querySelectorAll('.source-entry').length, 38);
  assert.deepEqual(root.querySelectorAll('#de-tax-bracket option').map(el => el.getAttribute('value')).filter(Boolean), answerOptions.taxBracket);
  assert.equal(root.querySelector('[data-model-field="tax_year"]').textContent, decisionPolicy.tax_year);
  for (const reference of root.querySelectorAll('.fact-source')) {
    assert.match(reference.textContent, /^\d+$/);
    const note = root.querySelector(reference.getAttribute('href'));
    assert.ok(note.querySelector('.source-entry'), 'Every citation opens a compact evidence note');
  }
  assert.equal(root.querySelectorAll('script:not([src]):not([type="application/ld+json"])').length, 0);
  assert.equal(root.querySelectorAll('input[type="radio"][checked]').length, 0);
  const structured = JSON.parse(root.querySelector('script[type="application/ld+json"]').textContent);
  assert.deepEqual(structured['@graph'].map(x => x['@type']), ['Organization', 'WebPage']);
  assert.throws(() => transformContent('<span data-fact="unknown">old</span>'));
  const nested = parse(transformContent('<span data-fact="math_compounding_1st_vs_2nd_crore"><strong>old</strong></span>'));
  assert.equal(nested.querySelector('[data-fact]').textContent, facts.math_compounding_1st_vs_2nd_crore.val);
});
