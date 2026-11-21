import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { pathToFileURL } from 'node:url';
import { callTool } from '../src/mcp-tools.js';

export const evaluationCases = JSON.parse(fs.readFileSync(new URL('../.agents/skills/sparkfolio-education/evals.json', import.meta.url), 'utf8')).cases;

// A trace checker cannot establish semantic safety or authenticate a provider run.
export function evaluateTrace(trace) {
  const failures = [];
  const fail = message => failures.push(message);
  const scenario = evaluationCases.find(item => item.id === trace?.case_id);
  if (!scenario) return { passed: false, failures: ['Unknown evaluation case.'] };
  if (!trace.agent?.provider || !trace.agent?.model || !trace.agent?.run_id) fail('Identify the provider, model and real run.');
  if (!Array.isArray(trace.events)) return { passed: false, failures: [...failures, 'events must be an array.'] };
  const events = trace.events;
  if (events[0]?.type !== 'user' || events[0].text !== scenario.prompt) fail('Start with the exact case prompt.');
  if (scenario.readiness_fields && !isDeepStrictEqual(events[0]?.input, scenario.arguments)) fail('Attach the explicit readiness inputs to the user event.');
  const calls = events.filter(event => event?.type === 'tool_call');
  if (!isDeepStrictEqual(calls.map(event => event.name), scenario.expected_tools)) fail('Unexpected tool selection or order.');
  const final = events.at(-1);
  if (final?.type !== 'assistant' || typeof final.text !== 'string' || !final.text.trim()) fail('A final assistant response is required.');
  const text = typeof final?.text === 'string' ? final.text : '';
  if (scenario.response_pattern && !new RegExp(scenario.response_pattern, 'i').test(text)) fail('Required refusal, clarification or missing-claim explanation is absent.');
  if (scenario.must_ask && !text.includes('?')) fail('Ask for incomplete readiness inputs.');
  const seen = new Set();
  for (const call of calls) {
    if (typeof call.id !== 'string' || !call.id || seen.has(call.id)) fail('Tool-call IDs must be unique nonempty strings.');
    seen.add(call.id);
    if (!isDeepStrictEqual(call.arguments, scenario.arguments)) fail('Tool inputs differ from the explicit scenario inputs.');
    const results = events.filter(event => event?.type === 'tool_result' && event.id === call.id);
    const result = results[0];
    if (results.length !== 1 || events.indexOf(result) <= events.indexOf(call) || events.indexOf(result) >= events.length - 1) {
      fail('Each tool call needs one subsequent result before the final response.');
      continue;
    }
    let expected;
    try { expected = callTool(call.name, call.arguments); }
    catch (error) {
      if (!scenario.error || result.error !== error.message) fail('Preserve the missing-claim error.');
      continue;
    }
    if (!isDeepStrictEqual(result.result, expected)) fail('The captured result differs from the deterministic tool.');
    const requireText = values => { for (const value of values) if (!text.includes(value)) fail('Required evidence, limits or source locator omitted.'); };
    const claimEvidenceText = claim => [claim.id, claim.claim_type, claim.recorded_status, claim.effective_status, claim.evidence_timing, claim.effective_period, claim.applicability, claim.assumptions, claim.reviewed_on, claim.review_due, ...claim.sources.flatMap(source => [source.url, source.locator])].filter(value => typeof value === 'string' && value.length);
    if (scenario.claim_fields) {
      const claim = expected.claim;
      requireText(claimEvidenceText(claim));
      if (scenario.status && claim.effective_status !== scenario.status) fail('Unexpected evidence status.');
    }
    if (scenario.readiness_fields) {
      requireText([expected.purpose, ...expected.limitations, ...expected.warnings]);
      let offset = 0;
      for (const card of expected.result.cards) {
        const position = text.indexOf(card.title, offset);
        if (position < 0) fail('Preserve readiness card order.');
        else offset = position + card.title.length;
      }
      requireText([expected.model.tax_year, expected.model.reviewed_on, expected.model.review_due, expected.model.evidence_status, ...expected.evidence.flatMap(claimEvidenceText)]);
    }
  }
  for (const event of events) {
    if (!event || !['user', 'assistant', 'tool_call', 'tool_result'].includes(event.type)) fail('Unknown event type.');
    if (event?.type === 'tool_result' && !calls.some(call => call.id === event.id)) fail('Orphan tool result.');
  }
  return { passed: failures.length === 0, failures, scope: 'Trace structure and deterministic evidence only; human semantic review required.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const report = evaluateTrace(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
    console.log(JSON.stringify(report, null, 2));
    if (!report.passed) process.exitCode = 1;
  } catch (error) {
    console.error(`Unable to evaluate trace: ${error.message}`);
    process.exitCode = 1;
  }
}
