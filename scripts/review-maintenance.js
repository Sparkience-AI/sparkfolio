import registry from '../src/data/framework-facts.json' with { type: 'json' };
import { pathToFileURL } from 'node:url';
import { reviewStatus } from '../src/facts.js';

const facts = Object.entries(registry)
  .filter(([group]) => !group.startsWith('_'))
  .flatMap(([, group]) => Object.entries(group));
const model = registry._decision_model;
const leadDays = 14;
const dayMs = 86_400_000;
const blockStart = '<!-- sparkfolio-review:start -->';
const blockEnd = '<!-- sparkfolio-review:end -->';
const issueMarker = date => '<!-- sparkfolio-review:' + date + ' -->';
const rowMarker = id => '<!-- sparkfolio-review-item:' + id + ' -->';

export function reviewBatches(today) {
  const cutoff = new Date(Date.parse(today) + leadDays * dayMs).toISOString().slice(0, 10);
  const batches = new Map();
  const modelEntry = {
    label: 'Decision engine tax model (' + model.tax_year + ')',
    effective_period: model.tax_year,
    review_due: model.review_due,
    sources: Object.values(model.sources)
  };
  for (const [id, entry] of [...facts, ['_decision_model', modelEntry]]) {
    const due = entry.review_due;
    if (!due || due > cutoff) continue;
    if (!batches.has(due)) batches.set(due, []);
    batches.get(due).push({ id, ...entry });
  }
  return new Map([...batches].sort(([left], [right]) => left.localeCompare(right)));
}

function markdownText(value) {
  return value.replace(/[\\<>\[\]_*]/g, '\\$&').replace(/\s+/g, ' ').trim();
}

function renderRow(item, checked) {
  const { id, label, val, effective_period: period, sources } = item;
  const valueText = val ? ' � ' + markdownText(val) : '';
  const periodText = period ? ' � ' + markdownText(period) : '';
  const links = sources.map(source => '[' + markdownText(source.title) + '](<' + source.url + '>) � ' + markdownText(source.locator));
  return '- [' + (checked ? 'x' : ' ') + '] **' + markdownText(label) + '** (' + id + ')' + valueText + periodText + ' � ' + links.join(' � ') + ' ' + rowMarker(id);
}

export function checklistBody(date, items, today, existingBody = '') {
  const start = existingBody.indexOf(blockStart);
  const end = existingBody.indexOf(blockEnd);
  if (existingBody && (start < 0 || end < start)) throw new Error('Review issue has no managed checklist block: ' + date);
  const block = existingBody.slice(start + blockStart.length, end);
  const rows = new Map();
  for (const line of block.split('\n')) {
    const matched = /^- \[([ xX])\].*<!-- sparkfolio-review-item:([a-z0-9_]+) -->$/.exec(line);
    if (matched) rows.set(matched[2], line);
  }
  for (const item of items) {
    const checked = /^- \[[xX]\]/.test(rows.get(item.id) ?? '');
    rows.set(item.id, renderRow(item, checked));
  }
  const status = today > date ? '**Review deadline has passed.**' : '**Review deadline is ' + date + '.**';
  const managed = [blockStart, status, '', ...rows.values(), blockEnd].join('\n');
  if (existingBody) return existingBody.slice(0, start) + managed + existingBody.slice(end + blockEnd.length);
  return [
    issueMarker(date),
    'Check each applicable source and record the outcome in a pull request. Tick an item when its review is complete, then close this issue when the batch is resolved.',
    '',
    'Keep notes outside the generated checklist so reruns preserve them.',
    '',
    managed,
    ''
  ].join('\n');
}

export function badgeMismatches(html, today) {
  const live = new Map();
  for (const [, id, status] of html.matchAll(/<li id="source-([a-z0-9_]+)">(?:(?!<\/li>)[\s\S])*?<span class="source-status" data-status="([a-z_]+)">/g)) {
    live.set(id, status);
  }
  if (!facts.some(([id]) => live.has(id))) throw new Error('Live guide has no recognizable source badges.');
  return facts.flatMap(([id, fact]) => live.get(id) === reviewStatus(fact, today) ? [] : [id]);
}

function githubRequest({ GITHUB_API_URL: api, GITHUB_REPOSITORY: repo, GH_TOKEN: token }) {
  if (!api || !repo || !token) throw new Error('Missing GitHub Actions repository or token context.');
  return async (path, method = 'GET', data) => {
    const result = await fetch(api + '/repos/' + repo + path, {
      method,
      headers: {
        accept: 'application/vnd.github+json',
        authorization: 'Bearer ' + token,
        'content-type': 'application/json'
      },
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: AbortSignal.timeout(20_000)
    });
    if (!result.ok) throw new Error(method + ' ' + path + ' failed: HTTP ' + result.status);
    return result.status === 204 ? null : result.json();
  };
}

export async function syncReviewIssues(request, today) {
  const batches = reviewBatches(today);
  if (!batches.size) return;
  const issues = [];
  for (let page = 1; ; page++) {
    const entries = await request('/issues?state=all&per_page=100&page=' + page);
    issues.push(...entries.filter(issue => !issue.pull_request && issue.user?.login === 'github-actions[bot]'));
    if (entries.length < 100) break;
  }
  for (const [date, items] of batches) {
    const existing = issues.find(issue => issue.body?.startsWith(issueMarker(date)));
    if (existing?.state === 'closed') continue;
    const body = checklistBody(date, items, today, existing?.body);
    if (!existing) {
      await request('/issues', 'POST', { title: 'Evidence review due ' + date, body });
    } else if (body !== existing.body) {
      await request('/issues/' + existing.number, 'PATCH', { body });
    }
  }
}

export async function refreshBadges(request, today, siteUrl, branch) {
  const page = await fetch(siteUrl, { cache: 'no-store', signal: AbortSignal.timeout(20_000) });
  if (!page.ok) throw new Error('Live guide fetch failed: HTTP ' + page.status);
  const mismatches = badgeMismatches(await page.text(), today);
  if (!mismatches.length) {
    console.log('All deployed source badges match the registry.');
    return;
  }
  const workflow = '/actions/workflows/deploy.yml';
  const { workflow_runs: runs } = await request(workflow + '/runs?per_page=20&branch=' + encodeURIComponent(branch));
  if (runs.some(run => run.event !== 'pull_request' && run.status !== 'completed')) {
    console.log('A production deployment is already queued or running.');
    return;
  }
  console.log('Dispatching deployment for badge mismatches: ' + mismatches.join(', '));
  await request(workflow + '/dispatches', 'POST', { ref: branch });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const today = new Date().toISOString().slice(0, 10);
  const request = githubRequest(process.env);
  const task = process.argv[2];
  if (task === 'issues') await syncReviewIssues(request, today);
  else if (task === 'badges') await refreshBadges(request, today, process.env.SITE_URL, process.env.GITHUB_REF_NAME);
  else throw new Error('Choose issues or badges.');
}
