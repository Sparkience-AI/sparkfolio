import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from 'node-html-parser';
import { transformContent } from '../scripts/content.js';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const built = parse(transformContent(source));
const base = 'https://sparkience-ai.github.io/sparkfolio/';

test('discovery document points to existing evidence and local-agent documents', () => {
  const text = fs.readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');
  assert.match(text, /^# Sparkfolio\r?\n/);
  assert.match(text, /not a hosted endpoint/);
  assert.match(text, /not crawler authorization/);
  assert.match(text, /source locators, effective periods, assumptions and limitations/);
  const paths = [...text.matchAll(/https:\/\/github\.com\/Sparkience-AI\/sparkfolio\/blob\/main\/([^\s)]+)/g)].map(match => match[1]);
  assert.ok(paths.length >= 5);
  for (const path of paths) assert.ok(fs.existsSync(new URL('../' + path, import.meta.url)), `Missing discovery target: ${path}`);
  assert.equal(built.querySelector('link[rel="describedby"]').getAttribute('href'), '/sparkfolio/llms.txt');
});

test('structured data describes the actual educational tool and publisher without personal credentials', () => {
  const graph = JSON.parse(built.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  const publisher = graph.find(item => item['@type'] === 'Organization');
  const page = graph.find(item => Array.isArray(item['@type']) && item['@type'].includes('LearningResource'));
  const app = graph.find(item => item['@type'] === 'WebApplication');
  assert.equal(publisher.name, 'Sparkfolio');
  assert.equal(page.url, base);
  assert.equal(app.url, base + '#agent');
  assert.equal(app.maintainer['@id'], publisher['@id']);
  assert.equal(page.hasPart['@id'], app['@id']);
  assert.match(app.description, /Does not select products, allocate money, assess suitability/);
  assert.match(app.browserRequirements, /JavaScript required/);
  assert.ok(app.audience.audienceType);
  assert.ok(!graph.some(item => item['@type'] === 'Person' || item.review || item.aggregateRating));
});

test('static guide treats mixes, age and investment choices as educational examples', () => {
  const text = built.textContent;
  assert.doesNotMatch(text, /Suitable for investors with|should strictly follow|Younger investors can take more risk|we recommend a|is optimal when|4 or 5-star rating|Annihilate high-interest|Invested in Direct Plans only/);
  assert.match(text, /Age alone does not determine capacity for loss/);
  assert.match(text, /None establishes what is suitable for your circumstances/);
  assert.match(text, /not a product prescription/);
  assert.match(text, /not a required destination or allocation/);
});
