import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: true, open: false } });
const address = server.httpServer.address();
const base = `http://127.0.0.1:${address.port}/sparkfolio/`;
let browser;
try {
  browser = await puppeteer.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const client = await page.createCDPSession();
  await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluateOnNewDocument(() => {
    window.labVitals = { lcpMs: null, cls: 0 };
    new PerformanceObserver(list => { for (const entry of list.getEntries()) window.labVitals.lcpMs = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.labVitals.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  const problems = [], external = [];
  page.on('pageerror', error => problems.push(error.message));
  page.on('console', message => { if (message.type() === 'error') problems.push(message.text()); });
  page.on('requestfailed', request => problems.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('request', request => { if (!request.url().startsWith(base) && !request.url().startsWith('data:')) external.push(request.url()); });
  const metrics = [];
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewport({ width, height: width < 768 ? 844 : 800 });
    await page.goto(base, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => !document.getElementById('de-generate-btn').disabled);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `Overflow at ${width}`);
    assert.equal(await page.$eval('input[type="radio"] + span', e => e.getBoundingClientRect().height >= 44), true);
    if (width < 768) {
      await page.click('.mobile-menu-btn');
      assert.equal(await page.$eval('.mobile-menu-btn', e => e.getAttribute('aria-expanded')), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('.mobile-menu-btn', e => e.getAttribute('aria-expanded')), 'false');
      assert.equal(await page.evaluate(() => document.activeElement.classList.contains('mobile-menu-btn')), true);
    }
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return { domContentLoadedMs: nav.domContentLoadedEventEnd, loadMs: nav.loadEventEnd, resourceBytes: performance.getEntriesByType('resource').reduce((n, r) => n + r.transferSize, 0), ...window.labVitals };
    });
    metrics.push({ width, ...timing });
  }
  // Keep functional checks fast after the controlled cold-load baseline.
  await client.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  // Real form interactions: missing answers, native keyboard selection, valid and invalid values.
  await page.click('#de-generate-btn');
  assert.match(await page.$eval('#de-error', e => e.textContent), /tax regime/);
  await page.focus('input[name="regime"][value="ntr"]');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.$eval('input[name="regime"][value="otr"]', e => e.checked), true);
  const ready = { regime: 'otr', age: '30s', dependents: 'no', health: 'yes', term: 'yes', ef: '6+', debt: 'no', corpPf: 'na', tax: 'yes', taxBracket: '30', horizon: 'long', capacity: 'comfortable' };
  for (const [key, value] of Object.entries(ready)) {
    if (['taxBracket', 'horizon', 'capacity'].includes(key)) await page.select(`select[name="${key}"]`, value);
    else await page.click(`input[name="${key}"][value="${value}"] + span`);
  }
  await page.select('#de-horizon', '');
  await page.click('#de-generate-btn');
  assert.match(await page.$eval('#de-error', e => e.textContent), /when you need the money/);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'de-horizon');
  await page.select('#de-horizon', 'long');
  await page.type('#de-amount', '1e6');
  await page.click('#de-generate-btn');
  assert.equal(await page.$eval('#de-amount', e => e.getAttribute('aria-invalid')), 'true');
  await page.$eval('#de-amount', e => { e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.type('#de-amount', '10000.50');
  await page.click('#de-generate-btn');
  assert.equal(await page.$eval('#de-result-card', e => e.hidden), false, await page.$eval('#de-form', e => JSON.stringify({ error: document.getElementById('de-error').textContent, answers: Object.fromEntries(new FormData(e)) })));
  assert.equal(await page.$eval('#de-step-name', e => e.textContent), 'Make a plan for your longer-term goal');
  assert.match(await page.$eval('#de-rationale', e => e.textContent), /30s.*Old/);
  assert.match(await page.$eval('#de-context', e => e.textContent), /10,000.5/);
  await page.click('input[name="health"][value="no"] + span');
  assert.equal(await page.$eval('#de-result-card', e => e.dataset.stale), 'true');
  assert.match(await page.$eval('#de-status', e => e.textContent), /changed an answer/);
  await page.click('#de-generate-btn');
  assert.equal(await page.$eval('#de-step-name', e => e.textContent), 'Check your health insurance');
  assert.equal(await page.$$eval('#de-output-cards article', els => els.length), 4);
  assert.match(await page.$eval('[data-card-id="tax-illustration"]', e => e.textContent), /6,880/);
  assert.match(await page.$eval('[data-card-id="old-regime"]', e => e.textContent), /3,120/);
  await page.click('input[name="regime"][value="ntr"] + span');
  assert.equal(await page.$eval('#de-tax-bracket', e => e.value), '');
  await page.select('#de-tax-bracket', '25');
  await page.click('#de-generate-btn');
  assert.match(await page.$eval('[data-card-id="tax-illustration"]', e => e.textContent), /7,400/);
  assert.equal(await page.$('[data-card-id="old-regime"]'), null);
  assert.ok(await page.$('[data-card-id="new-regime"]'));
  await page.click('input[name="regime"][value="otr"] + span');
  assert.equal(await page.$eval('#de-tax-bracket option[value="25"]', e => e.disabled && e.hidden), true);
  await page.select('#de-tax-bracket', 'unknown');
  await page.select('#de-horizon', 'soon');
  await page.select('#de-capacity', 'limited');
  await page.click('#de-generate-btn');
  assert.ok(await page.$('[data-card-id="tax-unknown"]'));
  assert.equal(await page.$('[data-card-id="tax-illustration"]'), null);
  assert.ok(await page.$('[data-card-id="near-term"]'));
  assert.ok(await page.$('[data-card-id="protect-essentials"]'));
  assert.equal(await page.$eval('#de-additional', e => e.dataset.stale), 'false');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewport({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Result overflow at ${width}`);
  }
  assert.equal(await page.$eval('.readiness-list', e => getComputedStyle(e).display), 'grid');
  assert.equal(await page.$eval('#de-rationale', e => getComputedStyle(e).textAlign), 'justify');
  // Search, no-results state and direct fragment navigation restore hidden topics.
  await page.type('#topic-search', 'zzzz-no-such-topic');
  assert.equal(await page.$eval('#topic-empty', e => e.hidden), false);
  await page.goto(base + '#topic-cash', { waitUntil: 'networkidle0' });
  assert.equal(await page.$eval('#topic-cash', e => e.open && !e.hidden), true);
  assert.equal(await page.$eval('#topic-search', e => e.value), '');
  await page.click('#topic-reset');
  await page.type('#topic-search', 'healthcare');
  assert.match(await page.$eval('#topic-count', e => e.textContent), /match your search/);
  await page.click('#topic-reset');
  // Touch/keyboard glossary and Escape dismissal.
  // Start this component check without the preceding topic fragment/filter state.
  await page.goto(base, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => { await document.fonts.ready; document.documentElement.style.scrollBehavior = 'auto'; });
  const jargon = await page.$('.jargon');
  await jargon.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  // Let the resulting scroll event dismiss any old explanation before clicking.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await jargon.click();
  await page.waitForFunction(() => document.getElementById('jargon-tooltip').classList.contains('visible'));
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('#jargon-tooltip', e => e.classList.contains('visible')), false);
  await jargon.evaluate(el => el.blur());
  await jargon.focus();
  await page.waitForFunction(() => document.getElementById('jargon-tooltip').classList.contains('visible'));
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('#jargon-tooltip', e => e.classList.contains('visible')), false);
  // Content is available without JavaScript, including open accordions and source notes.
  const plain = await browser.newPage();
  await plain.setJavaScriptEnabled(false);
  await plain.goto(base + '#topic-cash', { waitUntil: 'networkidle0' });
  await plain.click('#topic-cash summary');
  assert.equal(await plain.$eval('#topic-cash .details-content', e => getComputedStyle(e).opacity), '1');
  assert.ok((await plain.$eval('#source-notes-list', e => e.textContent)).includes('PPF'));
  assert.equal(await plain.$eval('#de-generate-btn', e => e.disabled), true);
  // Reduced motion and print do not hide educational material.
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  await page.emulateMediaType('print');
  assert.equal(await page.$eval('#de-form', e => getComputedStyle(e).display), 'none');
  assert.equal(await page.$eval('#source-notes .details-content', e => getComputedStyle(e).display), 'block');
  const output = process.env.AUDIT_OUTPUT_DIR || '.audit';
  fs.mkdirSync(output, { recursive: true });
  await page.pdf({ path: `${output}/sparkfolio-print.pdf`, format: 'A4', printBackground: false, preferCSSPageSize: true });
  await page.emulateMediaType('screen');
  await page.goto(base + '#agent', { waitUntil: 'networkidle0' });
  await page.$eval('#agent', e => e.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.screenshot({ path: `${output}/desktop.png` });
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(base + '#agent', { waitUntil: 'networkidle0' });
  await page.$eval('#agent', e => e.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.screenshot({ path: `${output}/mobile.png` });
  fs.writeFileSync(`${output}/performance.json`, JSON.stringify({ note: 'Cold-cache Chromium lab runs: 4x CPU slowdown, 150 ms latency, 1.6 Mbps download. LCP/CLS are lab observations, not 75th-percentile field Core Web Vitals. INP requires representative real-user interaction data.', metrics }, null, 2));
  assert.deepEqual(problems, [], 'Console, runtime or asset failures');
  assert.deepEqual(external, [], 'Unexpected third-party requests');
  console.log('Browser checks passed: four widths, keyboard, validation, stale results, search, fragments, glossary, no-JS, print and local-only assets.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
