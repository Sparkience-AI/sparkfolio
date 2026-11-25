import assert from 'node:assert/strict';
import { test } from 'node:test';
import registry from '../src/data/framework-facts.json' with { type: 'json' };
import { reviewStatus } from '../src/facts.js';
import { badgeMismatches, checklistBody, reviewBatches, syncReviewIssues, refreshBadges } from '../scripts/review-maintenance.js';

const facts = Object.entries(registry).filter(([group]) => !group.startsWith('_')).flatMap(([, group]) => Object.entries(group));
const verifiedFact = facts.find(([, fact]) => fact.review_status === 'verified' && fact.review_due)[1];
const validDate = verifiedFact.review_due;
const overdueDate = new Date(Date.parse(validDate) + 86_400_000).toISOString().slice(0, 10);

test('review batches open fourteen days ahead and include the tax model', () => {
  const due = registry._decision_model.review_due;
  const time = Date.parse(due);
  const fourteenDaysBefore = new Date(time - 14 * 86_400_000).toISOString().slice(0, 10);
  const fifteenDaysBefore = new Date(time - 15 * 86_400_000).toISOString().slice(0, 10);
  assert.equal(reviewBatches(fifteenDaysBefore).has(due), false);
  const items = reviewBatches(fourteenDaysBefore).get(due);
  assert.deepEqual(items.find(item => item.id === '_decision_model').sources, Object.values(registry._decision_model.sources));
});

test('checklist preserves checked rows, deferred rows and notes when the deadline passes', () => {
  const entry = (id, label = id) => ({ id, label, val: '7.1%', effective_period: 'Current quarter', sources: [{ title: 'Source', url: 'https://example.com', locator: 'Passage' }] });
  const due = '2026-12-31';
  const first = checklistBody(due, [entry('test_1'), entry('test_2')], due);
  const edited = first.replace('- [ ]', '- [x]') + '\nMaintainer notes.\n';
  const next = checklistBody(due, [entry('test_1', 'Revised label'), entry('test_3')], '2027-01-01', edited);
  assert.match(next, /- \[x\] \*\*Revised label\*\*/);
  assert.match(next, /7\.1% � Current quarter � \[Source\]\(<https:\/\/example\.com>\) � Passage/);
  assert.match(next, /- \[ \] \*\*test\\_2\*\*/);
  assert.match(next, /- \[ \] \*\*test\\_3\*\*/);
  assert.match(next, /Review deadline has passed/);
  assert.ok(next.endsWith('\nMaintainer notes.\n'));
  assert.equal(checklistBody(due, [entry('test_1', 'Revised label'), entry('test_3')], '2027-01-01', next), next);
});

test('issue sync reuses an existing bot checklist and leaves closed batches closed', async () => {
  const due = registry._decision_model.review_due;
  const items = reviewBatches(due).get(due);
  const dates = [...reviewBatches(due).keys()];
  const issues = dates.map((date, index) => ({
    number: index + 1,
    user: { login: 'github-actions[bot]' },
    state: date === due ? 'open' : 'closed',
    body: checklistBody(date, date === due ? items : [], date)
  }));
  const requests = [];
  const request = async (...args) => {
    requests.push(args);
    return args.length === 1 ? issues : null;
  };
  await syncReviewIssues(request, due);
  assert.equal(requests.length, 1);
  const next = new Date(Date.parse(due) + 86_400_000).toISOString().slice(0, 10);
  await syncReviewIssues(request, next);
  const mutations = requests.filter(args => args.length > 1);
  assert.equal(mutations.length, 1);
  assert.equal(mutations[0][0], '/issues/' + issues.find(issue => issue.state === 'open').number);
  assert.equal(mutations[0][1], 'PATCH');
  assert.match(mutations[0][2].body, /Review deadline has passed/);
});

function renderedBadges(today) {
  return facts.map(([id, fact]) => '<li id="source-' + id + '"><details><summary><span class="source-status" data-status="' + reviewStatus(fact, today) + '">Badge</span></summary></details></li>').join('\n');
}

test('badge comparison catches overdue and missing badges without refreshing a matching site', () => {
  const html = renderedBadges(validDate);
  assert.deepEqual(badgeMismatches(html, validDate), []);
  const later = renderedBadges(overdueDate);
  const overdue = badgeMismatches(html, overdueDate);
  assert.ok(overdue.length > 0);
  assert.deepEqual(badgeMismatches(later, overdueDate), []);
  assert.deepEqual(badgeMismatches(html.split('\n').slice(1).join('\n'), validDate), [facts[0][0]]);
  assert.throws(() => badgeMismatches('<h1>Service unavailable</h1>', validDate), /no recognizable source badges/);
});

test('badge refresh dispatches once a mismatched site has no active production run', async t => {
  const commands = [];
  const request = async (path, method, body) => {
    commands.push([path, method, body]);
    return { workflow_runs: commands.length === 1 ? [{ event: 'push', status: 'in_progress' }] : [] };
  };
  t.mock.method(globalThis, 'fetch', async () => new Response(renderedBadges(validDate)));
  const url = 'https://sparkience-ai.github.io/sparkfolio/';
  await refreshBadges(request, validDate, url, 'main');
  assert.equal(commands.length, 0);
  await refreshBadges(request, overdueDate, url, 'main');
  assert.equal(commands.length, 1);
  await refreshBadges(request, overdueDate, url, 'main');
  assert.deepEqual(commands.at(-1), ['/actions/workflows/deploy.yml/dispatches', 'POST', { ref: 'main' }]);
});
