import fs from 'fs';
import { parse } from 'node-html-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, '..', 'index.html');

console.log('--- RUNNING DOM INTEGRITY TESTS ---');

try {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const root = parse(html, {
    lowerCaseTagName: false,
    comment: false,
    blockTextElements: {
      script: true,
      noscript: true,
      style: true,
      pre: true
    }
  });

  let errors = 0;

  // 1. Check for unclosed/mismatched tags using regex as a naive backup to the parser
  const divOpens = (html.match(/<div\b/gi) || []).length;
  const divCloses = (html.match(/<\/div>/gi) || []).length;
  
  console.log(`DIV Tags: ${divOpens} open, ${divCloses} close`);
  if (divOpens !== divCloses) {
    console.error(`❌ ERROR: Unbalanced <div> tags! (Open: ${divOpens}, Close: ${divCloses})`);
    errors++;
  } else {
    console.log('✅ DIV tags are perfectly balanced.');
  }

  // 2. Check if critical sections are in the DOM (not dropped due to parsing errors)
  const criticalSections = [
    { id: 'templates', name: 'Strategic Templates' },
    { id: 'goal-based', name: 'Goal-Based Investing' },
    { id: 'implementation', name: 'Implementation' }
  ];

  criticalSections.forEach(sec => {
    const el = root.querySelector(`#${sec.id}`);
    if (!el) {
      console.error(`❌ ERROR: Missing critical section: #${sec.id}`);
      errors++;
    } else {
      console.log(`✅ Found critical section: ${sec.name} (#${sec.id})`);
    }
  });

  // 3. Verify internal anchor links
  const links = root.querySelectorAll('a[href^="#"]');
  const ids = Array.from(root.querySelectorAll('[id]')).map(el => el.id);
  
  links.forEach(link => {
    const href = link.getAttribute('href').substring(1); // remove '#'
    if (href !== '' && !ids.includes(href)) {
      console.error(`❌ ERROR: Broken internal link points to non-existent ID: #${href}`);
      errors++;
    }
  });
  console.log(`✅ Checked ${links.length} internal links.`);

  if (errors > 0) {
    console.error(`\nTest Suite Failed with ${errors} error(s).`);
    process.exit(1);
  } else {
    console.log('\nAll DOM Integrity Tests Passed! 🚀');
  }

} catch (err) {
  console.error('Test script encountered an error:', err);
  process.exit(1);
}
