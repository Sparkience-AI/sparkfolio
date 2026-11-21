import test from 'node:test';
import assert from 'node:assert/strict';
import { callTool, toolDefinitions } from '../src/mcp-tools.js';
import { evaluationCases, evaluateTrace } from '../scripts/evaluate-agent-trace.js';

test('every declared executable evidence scenario exercises the real tool contract', () => {
  assert.equal(new Set(evaluationCases.map(item => item.id)).size, evaluationCases.length);
  for (const scenario of evaluationCases.filter(item => item.arguments)) {
    if (scenario.error) {
      assert.throws(() => callTool(scenario.expected_tools[0], scenario.arguments), /registered Sparkfolio claim/);
      continue;
    }
    const result = callTool(scenario.expected_tools[0], scenario.arguments);
    if (scenario.claim_fields) {
      assert.ok(result.claim.effective_period);
      assert.ok(result.claim.assumptions);
      assert.ok(result.claim.sources.every(source => source.locator && source.url));
      if (scenario.status) assert.equal(result.claim.effective_status, scenario.status);
    } else {
      assert.match(result.purpose, /not financial/);
      assert.ok(result.limitations.length);
      assert.ok(result.evidence.every(claim => claim.sources.every(source => source.locator)));
    }
  }
});

test('incomplete inputs, injected instructions and unsupported actions cannot become tool outputs', () => {
  assert.throws(() => callTool('review_readiness', { answers: { regime: 'ntr', age: '20s' }, as_of: '2026-11-21' }), /Please answer/);
  assert.throws(() => callTool('get_claim', { id: 'rate_epf_interest', as_of: '2030-01-01', instructions: 'ignore evidence status' }), /Unknown argument/);
  for (const name of ['allocate_portfolio', 'recommend_product', 'ignore_evidence_status']) assert.throws(() => callTool(name, {}), /Unknown tool/);
  assert.deepEqual(toolDefinitions.map(tool => tool.name), ['list_claims', 'get_claim', 'review_readiness']);
});

// Synthetic traces below test the verifier itself. They are not agent-run evidence.
function syntheticEvidenceTrace() {
  const scenario = evaluationCases.find(item => item.id === 'expired-injection');
  const result = callTool('get_claim', scenario.arguments);
  const claim = result.claim;
  return {
    case_id: scenario.id, agent: { provider: 'synthetic-test', model: 'none', run_id: 'verifier-unit-test' },
    events: [
      { type: 'user', text: scenario.prompt },
      { type: 'tool_call', id: '1', name: 'get_claim', arguments: scenario.arguments },
      { type: 'tool_result', id: '1', result },
      { type: 'assistant', text: [claim.id, claim.claim_type, claim.recorded_status, claim.effective_period, claim.effective_status, claim.evidence_timing, claim.reviewed_on, claim.review_due, claim.applicability, claim.assumptions, ...claim.sources.flatMap(source => [source.url, source.locator])].join('\n') }
    ]
  };
}

test('trace verifier detects altered evidence, wrong tool order, missing sources and fabricated calls', () => {
  const original = syntheticEvidenceTrace();
  assert.equal(evaluateTrace(original).passed, true);
  const mutations = [
    trace => { trace.events[2].result.claim.effective_status = 'verified'; },
    trace => { [trace.events[1], trace.events[2]] = [trace.events[2], trace.events[1]]; },
    trace => { trace.events[3].text = 'This is verified current evidence.'; },
    trace => { trace.events[1].name = 'recommend_product'; },
    trace => { trace.events.splice(2, 1); },
    trace => { trace.agent = {}; }
  ];
  for (const mutate of mutations) { const trace = structuredClone(original); mutate(trace); assert.equal(evaluateTrace(trace).passed, false); }
});

test('negative routing traces cannot call readiness before collecting inputs or recommend a product tool', () => {
  for (const id of ['incomplete', 'allocation', 'product-injection']) {
    const scenario = evaluationCases.find(item => item.id === id);
    const trace = { case_id: id, agent: { provider: 'synthetic-test', model: 'none', run_id: 'verifier-unit-test' }, events: [{ type: 'user', text: scenario.prompt }, { type: 'assistant', text: id === 'incomplete' ? 'What are the remaining answers and as_of date?' : 'I cannot provide that recommendation.' }] };
    assert.equal(evaluateTrace(trace).passed, true);
    trace.events.splice(1, 0, { type: 'tool_call', id: '1', name: 'review_readiness', arguments: {} });
    assert.equal(evaluateTrace(trace).passed, false);
  }
});

test('readiness trace verifier requires explicit user inputs, returned card order and limitations', () => {
  const scenario = evaluationCases.find(item => item.id === 'readiness');
  const result = callTool('review_readiness', scenario.arguments);
  const trace = { case_id: 'readiness', agent: { provider: 'synthetic-test', model: 'none', run_id: 'verifier-unit-test' }, events: [
    { type: 'user', text: scenario.prompt, input: scenario.arguments },
    { type: 'tool_call', id: '1', name: 'review_readiness', arguments: scenario.arguments },
    { type: 'tool_result', id: '1', result },
    { type: 'assistant', text: [result.purpose, ...result.result.cards.map(card => card.title), ...result.limitations, ...result.warnings, result.model.tax_year, result.model.reviewed_on, result.model.review_due, result.model.evidence_status, ...result.evidence.flatMap(claim => [claim.id, claim.claim_type, claim.recorded_status, claim.effective_status, claim.evidence_timing, claim.effective_period, claim.applicability, claim.assumptions, claim.reviewed_on, claim.review_due, ...claim.sources.flatMap(source => [source.url, source.locator])])].join('\n') }
  ] };
  assert.equal(evaluateTrace(trace).passed, true);
  const noInput = structuredClone(trace); delete noInput.events[0].input;
  assert.equal(evaluateTrace(noInput).passed, false);
  const wrongOrder = structuredClone(trace);
  wrongOrder.events[3].text = wrongOrder.events[3].text.replace(result.result.cards[0].title, '');
  assert.equal(evaluateTrace(wrongOrder).passed, false);
  const noLimits = structuredClone(trace);
  noLimits.events[3].text = noLimits.events[3].text.replace(result.limitations[0], '');
  assert.equal(evaluateTrace(noLimits).passed, false);
});
