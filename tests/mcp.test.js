import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { handleRequest } from '../src/mcp-server.js';
import { callTool, getClaim, listClaims, reviewReadiness } from '../src/mcp-tools.js';

const ready = { regime: 'ntr', age: '20s', dependents: 'no', health: 'yes', term: 'yes', ef: '6+', debt: 'no', corpPf: 'yes', tax: 'yes', taxBracket: '30', horizon: 'long', capacity: 'comfortable' };

test('claim tools retain evidence status and reject unregistered claims', () => {
  const listed = listClaims({ status: 'verified', as_of: '2026-11-07', limit: 3 });
  assert.equal(listed.count, 3);
  assert.ok(listed.claims.every(claim => claim.sources.every(source => source.locator)));
  assert.equal(getClaim({ id: 'rate_epf_interest', as_of: '2026-11-07' }).claim.effective_status, 'verified');
  assert.throws(() => getClaim({ id: '../secrets' }));
  assert.throws(() => listClaims({ limit: 51 }));
});

test('readiness tool is deterministic, non-advisory and requires every answer', () => {
  const first = reviewReadiness({ answers: ready, amount: '10000', as_of: '2026-11-07' });
  const second = reviewReadiness({ answers: ready, amount: '10000', as_of: '2026-11-07' });
  assert.deepEqual(first, second);
  assert.equal(first.as_of, '2026-11-07');
  assert.match(first.purpose, /not financial/);
  assert.match(first.result.context, /No part of it has been allocated/);
  assert.throws(() => reviewReadiness({ answers: ready }), /as_of is required/);
  assert.throws(() => reviewReadiness({ answers: ready, as_of: null }), /ISO date/);
  assert.throws(() => reviewReadiness({ answers: ready, as_of: '2026-02-30' }), /ISO date/);
  assert.throws(() => reviewReadiness({ answers: { regime: 'ntr' }, as_of: '2026-11-07' }));
});

test('readiness evidence status uses the explicit evidence clock', () => {
  const current = reviewReadiness({ answers: ready, as_of: '2026-11-07' });
  const later = reviewReadiness({ answers: ready, as_of: '2027-03-01' });
  const currentClaim = current.evidence.find(claim => claim.id === 'cap_sec_80c');
  const laterClaim = later.evidence.find(claim => claim.id === 'cap_sec_80c');
  assert.equal(currentClaim.effective_status, 'verified');
  assert.equal(laterClaim.effective_status, 'needs_review');
});

test('MCP request boundary lists only three read-only tools', () => {
  const response = handleRequest({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
  assert.deepEqual(response.result.tools.map(tool => tool.name), ['list_claims', 'get_claim', 'review_readiness']);
  assert.deepEqual(response.result.tools[2].inputSchema.required, ['answers', 'as_of']);
  assert.equal(handleRequest({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'unknown' } }).result.isError, true);
});

test('stdio server completes initialize and tool-list exchange', async () => {
  const child = spawn(process.execPath, ['src/mcp-server.js'], { stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } })}\n`);
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' })}\n`);
  child.stdin.end();
  await once(child, 'exit');
  const lines = stdout.trim().split('\n').map(JSON.parse);
  assert.equal(child.exitCode, 0);
  assert.equal(lines[0].result.serverInfo.name, 'sparkfolio');
  assert.equal(lines[1].result.tools.length, 3);
  assert.equal(stderr, '');
});

test('historical dates cannot claim a source was already reviewed', () => {
  const historical = getClaim({ id: 'rate_epf_interest', as_of: '2000-01-01' }).claim;
  assert.equal(historical.recorded_status, 'verified');
  assert.equal(historical.effective_status, 'needs_review');
  assert.equal(historical.evidence_timing, 'before_recorded_review');
  assert.match(historical.applicability, /Not inferred/);
  assert.equal(getClaim({ id: 'rate_epf_interest', as_of: '2026-10-25' }).claim.effective_status, 'verified');
  const editorial = listClaims({ status: 'editorial', as_of: '2026-11-21' }).claims[0];
  assert.equal(editorial.evidence_timing, 'no_source_review_date');
});

test('model timing is explicit at both review boundaries and outside them', () => {
  for (const date of ['2026-10-25', '2027-02-28']) {
    const review = reviewReadiness({ answers: ready, as_of: date });
    assert.equal(review.model.evidence_status, 'within_recorded_review_window');
    assert.deepEqual(review.warnings, []);
    assert.ok(review.model.sources.rates.url);
  }
  for (const [date, status] of [['2026-10-24', 'before_recorded_review'], ['2030-01-01', 'review_overdue']]) {
    const review = reviewReadiness({ answers: ready, as_of: date });
    assert.equal(review.model.evidence_status, status);
    assert.equal(review.warnings.length, 1);
    assert.ok(review.model.tax_year);
    assert.ok(review.result.cards.length);
  }
});

test('runtime tool arguments enforce advertised types and allowed fields', () => {
  for (const name of ['list_claims', 'get_claim', 'review_readiness']) {
    for (const args of [null, [], 'text', { unexpected: true }]) assert.throws(() => callTool(name, args), TypeError);
  }
  for (const id of ['toString', 'constructor', '__proto__']) assert.throws(() => getClaim({ id }), /registered Sparkfolio claim/);
  for (const args of [{ status: 'made-up' }, { status: null }, { category: 10 }, { limit: '2' }]) assert.throws(() => listClaims(args));
  for (const amount of [null, 100, '1'.repeat(33)]) assert.throws(() => reviewReadiness({ answers: ready, amount, as_of: '2026-11-21' }), /amount must/);
  assert.throws(() => reviewReadiness({ answers: { ...ready, extra: true }, as_of: '2026-11-21' }), /Unknown argument/);
  assert.throws(() => reviewReadiness({ answers: Object.create(ready), as_of: '2026-11-21' }), /Please answer/);
});

test('invalid envelopes return protocol errors and notifications stay silent', () => {
  for (const request of [null, [], 1, {}, { jsonrpc: '2.0', id: 1, method: 123 }, { jsonrpc: '2.0', id: {}, method: 'ping' }, { jsonrpc: '2.0', id: 1, method: 'initialize', params: null }]) {
    assert.equal(handleRequest(request).error.code, -32600);
  }
  assert.equal(handleRequest({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
  assert.equal(handleRequest({ jsonrpc: '2.0', method: 'ping' }), null);
  assert.equal(handleRequest({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'list_claims', arguments: null } }).result.isError, true);
});

test('stdio survives malformed messages and processes the next valid request', { timeout: 10000 }, async () => {
  const child = spawn(process.execPath, ['src/mcp-server.js'], { stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  child.stdin.end('null\n{"jsonrpc":"2.0","id":1,"method":123}\n{bad json\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":2,"method":"ping"}\n');
  await once(child, 'close');
  const responses = stdout.trim().split('\n').map(JSON.parse);
  assert.equal(child.exitCode, 0);
  assert.equal(stderr, '');
  assert.deepEqual(responses.slice(0, 3).map(response => response.error.code), [-32600, -32600, -32700]);
  assert.deepEqual(responses[3], { jsonrpc: '2.0', id: 2, result: {} });
  assert.equal(responses.length, 4);
});
