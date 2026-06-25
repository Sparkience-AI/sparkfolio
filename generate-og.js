import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// No external font imports – use system fonts to avoid network timeouts
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      background-color: #0C2340;
      background-image:
        radial-gradient(ellipse at 80% 20%, rgba(42,157,143,0.25) 0%, transparent 55%),
        radial-gradient(ellipse at 20% 80%, rgba(212,163,115,0.2) 0%, transparent 55%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #ffffff;
      position: relative;
      overflow: hidden;
    }

    /* subtle grid */
    body::before {
      content: '';
      position: absolute;
      inset: 0;
      background-size: 48px 48px;
      background-image:
        linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
    }

    .content {
      position: relative;
      z-index: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 0 80px;
    }

    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
      padding: 10px 28px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #D4A373;
    }

    h1 {
      font-size: 72px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.01em;
      color: #ffffff;
    }

    h1 span { color: #2A9D8F; }

    .subtitle {
      font-size: 24px;
      color: rgba(255,255,255,0.7);
      font-weight: 400;
      max-width: 780px;
      line-height: 1.5;
    }

    .footer {
      position: absolute;
      bottom: 40px;
      left: 60px;
      right: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo-box {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #2A9D8F, #0C5280);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid rgba(255,255,255,0.15);
    }

    .brand-name {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: rgba(255,255,255,0.9);
    }

    .url-pill {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 13px;
      color: rgba(255,255,255,0.55);
      letter-spacing: 0.04em;
    }

    /* decorative accent bar */
    .accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #2A9D8F 0%, #D4A373 50%, #0C2340 100%);
    }
  </style>
</head>
<body>
  <div class="accent-bar"></div>

  <div class="content">
    <div class="badge">Investment Framework</div>
    <h1>The <span>Sparkfolio</span><br>Framework</h1>
    <p class="subtitle">Strategic Asset Allocation for Modern Wealth Resilience.</p>
  </div>

  <div class="footer">
    <div class="brand">
      <div class="logo-box">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      </div>
      <div class="brand-name">SPARKIENCE AI</div>
    </div>
    <div class="url-pill">sparkience-ai.github.io/sparkfolio</div>
  </div>
</body>
</html>
`;

async function generate() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Exactly 1200x630 — no deviceScaleFactor scaling that bloats the file
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  console.log('Rendering HTML...');
  // No networkidle — fonts are system fonts, no network needed
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  // Output: og-image.jpg — clean name, no query strings needed
  const outputPath = path.resolve('public/og-image.jpg');
  console.log('Taking screenshot...');
  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 85 });

  const stats = fs.statSync(outputPath);
  console.log('Generated: ' + outputPath + ' (' + Math.round(stats.size / 1024) + ' KB)');
  await browser.close();
}

generate().catch(console.error);
