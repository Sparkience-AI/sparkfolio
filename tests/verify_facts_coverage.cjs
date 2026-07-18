const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function runAudit() {
  console.log('=== 🧪 RUNNING SSoT FRAMEWORK FACTS COVERAGE & INTEGRITY TEST ===\n');

  // 1. Load framework-facts.json
  const factsPath = path.join(__dirname, '../src/data/framework-facts.json');
  if (!fs.existsSync(factsPath)) {
    throw new Error('❌ FAILED: framework-facts.json missing!');
  }
  const factsData = JSON.parse(fs.readFileSync(factsPath, 'utf8'));
  
  const allKeys = [
    ...Object.keys(factsData.L1_evergreen || {}),
    ...Object.keys(factsData.L2_annual || {}),
    ...Object.keys(factsData.L3_quarterly || {})
  ];

  console.log(`✅ Loaded ${allKeys.length} total facts from SSoT Registry (L1, L2, L3).`);

  // 2. Read index.html and check data-fact occurrences
  const htmlPath = path.join(__dirname, '../index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const boundKeys = new Set();
  const dataFactRegex = /data-fact="([^"]+)"/g;
  let match;
  while ((match = dataFactRegex.exec(htmlContent)) !== null) {
    boundKeys.add(match[1]);
  }

  console.log(`✅ Found ${boundKeys.size} unique data-fact elements bound in index.html.`);

  // 3. Verify 100% match between Registry and HTML
  const missingInHtml = allKeys.filter(key => !boundKeys.has(key));
  if (missingInHtml.length > 0) {
    throw new Error(`❌ COVERAGE FAILURE: Registry keys not bound in index.html: ${missingInHtml.join(', ')}`);
  }

  console.log('✅ 100% SSoT Registry Keys are actively bound in index.html!');

  // 4. Validate HTML & Build
  console.log('\n--- Running HTML Validation & Vite Production Build ---');
  const rootDir = path.join(__dirname, '..');
  execSync('npx html-validate index.html', { cwd: rootDir, stdio: 'inherit' });
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  console.log('\n🎉 ALL SSoT COVERAGE AND INTEGRITY TESTS PASSED PERFECTLY!');
}

runAudit();
