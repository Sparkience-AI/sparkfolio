import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      width: 1200px;
      height: 630px;
      background-color: #0C2340;
      background-image: radial-gradient(circle at top right, rgba(42, 157, 143, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at bottom left, rgba(212, 163, 115, 0.15) 0%, transparent 50%);
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #ffffff;
      position: relative;
      overflow: hidden;
    }
    
    .grid-bg {
      position: absolute;
      inset: 0;
      background-size: 40px 40px;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      z-index: 0;
    }

    .content {
      z-index: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .badge {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 12px 24px;
      border-radius: 100px;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #D4A373;
      backdrop-filter: blur(10px);
      margin-bottom: 20px;
    }

    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 80px;
      margin: 0;
      line-height: 1.1;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      text-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .subtitle {
      font-size: 32px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
      max-width: 900px;
      line-height: 1.4;
      margin-top: 10px;
    }

    .logo-container {
      position: absolute;
      bottom: 40px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-mark {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #2A9D8F 0%, #0C2340 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255,255,255,0.1);
    }
    
    .logo-text {
      font-weight: 700;
      font-size: 28px;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  
  <div class="content">
    <div class="badge">V2.0 Framework</div>
    <h1>The Sparkfolio<br>Investment Framework</h1>
    <div class="subtitle">Strategic Asset Allocation for Modern Wealth Resilience.</div>
  </div>

  <div class="logo-container">
    <div class="logo-mark">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    </div>
    <div class="logo-text">SPARKIENCE AI</div>
  </div>
</body>
</html>
`;

async function generate() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 }); // High-res
  
  console.log('Rendering HTML...');
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  const outputPath = path.resolve('public/og-image.png');
  console.log('Taking screenshot...');
  await page.screenshot({ path: outputPath, type: 'png' });
  
  console.log('Successfully generated OG image at ' + outputPath);
  await browser.close();
}

generate().catch(console.error);
