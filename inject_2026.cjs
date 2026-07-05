const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// TASK 1: Update Existing Sections

// 1.1 TAX-AWARE INVESTING
html = html.replace(
  /<summary><svg[^>]*>[\s\S]*?TAX-AWARE INVESTING \(NEW 2024 RULES\)<\/summary>/,
  `<summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> TAX-AWARE INVESTING & PASS-THROUGH ENTITIES (2026)</summary>`
);

html = html.replace(
  /<span class="text-muted pl-5">LTCG \(holding > 12 months\) is taxed at <strong>12\.5%<\/strong>\. Exemption limit increased to <strong>₹1\.25 Lakh<\/strong> per year\. STCG is taxed at <strong>20%<\/strong>\.<\/span>\s*<\/li>\s*<li class="flex flex-col gap-1">\s*<div class="flex items-center gap-2 font-bold"><span class="text-blue">●<\/span> Debt Mutual Funds<\/div>\s*<span class="text-muted pl-5">Taxed at your applicable <strong>income tax slab rate<\/strong>\. Indexation benefits have been completely removed\.<\/span>\s*<\/li>/,
  `<span class="text-muted pl-5">LTCG (holding > 12 months) is taxed at <strong>12.5%</strong>. Exemption limit is <strong>₹1.25 Lakh</strong> per year. STCG is taxed at <strong>20%</strong>.</span>
                    </li>
                    <li class="flex flex-col gap-1">
                      <div class="flex items-center gap-2 font-bold"><span class="text-blue">●</span> Debt Mutual Funds</div>
                      <span class="text-muted pl-5">Taxed at your applicable <strong>income tax slab rate</strong>. Indexation benefits have been completely removed.</span>
                    </li>
                    <li class="flex flex-col gap-1 mt-2">
                      <div class="flex items-center gap-2 font-bold"><span class="text-red">●</span> Share Buybacks (Post April 1, 2026)</div>
                      <span class="text-muted pl-5">No longer treated as dividend income. Now taxed as <strong>capital gains</strong> (12.5% LTCG or 20% STCG) on the profit (buyback price minus cost of acquisition).</span>
                    </li>
                    <li class="flex flex-col gap-1 mt-2">
                      <div class="flex items-center gap-2 font-bold"><span class="text-navy">●</span> REITs & InvITs (Pass-Through Entities)</div>
                      <span class="text-muted pl-5 block mb-1">Tax treatment is component-based under Section 115UA:</span>
                      <ul class="plain-list bullet-list text-xs text-muted pl-5 space-y-1">
                        <li><strong>Dividends:</strong> Taxable at slab rate if SPV opted for 115BAA concessional tax, else exempt.</li>
                        <li><strong>Interest/Rent:</strong> Fully taxable at your marginal slab rate.</li>
                        <li><strong>Debt Repayment:</strong> May trigger tax liabilities under Sec 56(2)(xii) (no longer automatically tax-free).</li>
                        <li><strong>TDS Friction:</strong> 10% TDS (Sec 194LBA) applies to distributions with no minimum threshold.</li>
                      </ul>
                    </li>`
);

// 1.2 FUND EVALUATION METRICS (BER & Expected Shortfall)
html = html.replace(
  /<tr><td data-label="Metric" class="p-2"><strong class="text-navy">Expense Ratio<\/strong><br><span class="text-muted" style="font-size:0\.7rem">Annual cost\.<\/span><\/td><td data-label="Result" class="text-right-md font-bold text-green p-2">Lower<br><span class="text-xs font-normal">= Better<\/span><\/td><\/tr>/,
  `<tr><td data-label="Metric" class="p-2"><strong class="text-navy">Base Expense Ratio (BER)</strong><br><span class="text-muted" style="font-size:0.7rem">As of 2026, SEBI capped brokerage at 6bps (cash)/2bps (derivatives), now excluded from base TER.</span></td><td data-label="Result" class="text-right-md font-bold text-green p-2">Lower<br><span class="text-xs font-normal">= Better</span></td></tr>`
);

html = html.replace(
  /<tr><td data-label="Metric" class="p-2"><strong class="text-navy">Sortino Ratio<\/strong><br><span class="text-muted" style="font-size:0\.7rem">Risk-adjusted return using downside deviation\.<\/span><\/td><td data-label="Result" class="text-right-md font-bold text-green p-2">Higher<br><span class="text-xs font-normal">= Better<\/span><\/td><\/tr>/,
  `<tr><td data-label="Metric" class="p-2"><strong class="text-navy">Sortino Ratio</strong><br><span class="text-muted" style="font-size:0.7rem">Risk-adjusted return using downside deviation.</span></td><td data-label="Result" class="text-right-md font-bold text-green p-2">Higher<br><span class="text-xs font-normal">= Better</span></td></tr>
                        <tr><td data-label="Metric" class="p-2"><strong class="text-navy">Expected Shortfall (CVaR)</strong><br><span class="text-muted" style="font-size:0.7rem">Averages worst fraction of tail distribution ("How severe is the crash?"). Avoids VaR false comfort.</span></td><td data-label="Result" class="text-right-md font-bold text-green p-2">Lower<br><span class="text-xs font-normal">= Better</span></td></tr>`
);

// 1.3 Alternative Assets & Risks (P2P / Real Estate) in DEBT & HYBRID
html = html.replace(
  /<div class="p-3 rounded text-left border-l-4 mx-4 mt-0 mb-3 callout-tip" style="border-left-color: var\(--status-red\);">\s*<strong class="text-red">⚠️ REITs & InvITs Warning:/,
  `<div class="p-3 rounded text-left border-l-4 mx-4 mt-0 mb-3 callout-tip" style="border-left-color: var(--status-red);">
                    <strong class="text-red">⚠️ Alternative Assets & Risk:</strong><br>
                    <span class="text-xs"><strong>P2P Lending:</strong> RBI has prohibited guarantees (lender bears 100% loss risk), capped exposure at ₹50L, and requires a CA net-worth cert for >₹10L. Treat as high-risk unsecured credit, not fixed-income.<br>
                    <strong>Tier-1 Real Estate:</strong> Beware momentum investing (e.g., Hyderabad Neopolis layout auctions reaching ₹151Cr/acre). A massive supply pipeline threatens rental yields and secondary market liquidity.</span>
                  </div>
                  <div class="p-3 rounded text-left border-l-4 mx-4 mt-0 mb-3 callout-tip" style="border-left-color: var(--status-red);">
                    <strong class="text-red">⚠️ REITs & InvITs Warning:`
);

// 1.4 SEBI Gold Rule
html = html.replace(
  /<p class="text-xs m-0">As of Budget 2026 \(effective April 1, 2026\), SGB tax exemption at maturity is now restricted to original RBI-issue subscribers only\. Secondary market buyers, even if held to maturity, must pay 12\.5% LTCG\.<\/p>\s*<\/div>\s*<\/div>\s*<\/div>/,
  `<p class="text-xs m-0">As of Budget 2026 (effective April 1, 2026), SGB tax exemption at maturity is now restricted to original RBI-issue subscribers only. Secondary market buyers, even if held to maturity, must pay 12.5% LTCG.</p>
                    </div>
                  </div>
                  <div class="p-3 rounded text-left border-l-4 mb-4 callout-tip" style="border-left-color: var(--primary-blue);">
                    <strong>💡 SEBI Hedging Rule (2026):</strong> Equity mutual funds are now permitted to allocate up to 35% of their non-equity portfolio into alternative assets like gold and silver ETFs. This allows for downside risk mitigation without losing equity taxation status.
                  </div>
                </div>`
);

// 1.5 WEALTH ACCELERATION (Prepay vs Invest)
html = html.replace(
  /<div class="p-3 rounded text-left border-l-4 callout-tip">\s*<strong>💡 Beginner Shortcut:[\s\S]*?<\/div>\s*<\/div>/,
  `<div class="p-3 rounded text-left border-l-4 callout-tip mb-4">
                    <strong>💡 Beginner Shortcut:</strong> Almost all brokers and AMCs offer an automated "Step-Up" or "Top-Up" SIP feature. Turn this on once, set it to 10% annually, and let automation build your wealth without any manual intervention.
                  </div>
                  <div class="grid grid-cols-1 gap-4">
                    <div class="inner-box text-center">
                      <strong class="text-xs uppercase block mb-2 text-navy">STRATEGIC DEBT OPTIMIZATION (PREPAY VS. INVEST)</strong>
                      <p class="text-xs text-muted mb-3">The dilemma of prepaying a home loan vs. investing surplus capital in equity SIPs.</p>
                      <ul class="plain-list text-xs text-left text-navy space-y-2">
                        <li><strong>When to Prepay:</strong> Aggressive prepayment is mandated if the loan is in its early phase (Years 1 to 7), the effective post-tax interest rate exceeds 8.5–9.0% (especially under the New Tax Regime, which lacks Section 24b deductions), or if the EMI consumes over 40% of household income.</li>
                        <li><strong>When to Invest:</strong> Redirecting capital to equity SIPs is optimal when the loan is mature, the effective cost of debt is low, and you have a 10-to-15-year horizon.</li>
                        <li><strong>⚠️ The SWP Fallacy:</strong> Using an equity SWP to pay a home loan EMI is highly destructive. A market crash early in the loan tenure forces the liquidation of a massive number of units at depressed NAVs, permanently destroying compounding potential.</li>
                      </ul>
                    </div>
                  </div>
                </div>`
);

// TASK 2: Inject New Sections before KEY TERMS GLOSSARY
const newSections = `
              <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> NON-TAXABLE INVESTMENT OPTIONS (NEW TAX REGIME)</summary>
                <div class="details-content">
                  <p class="text-sm text-muted mb-4">Under the New Tax Regime (Section 115BAC), identifying assets that generate completely tax-free interest and maturity proceeds is paramount as most 80C upfront deductions are eliminated.</p>
                  
                  <strong class="text-xs uppercase text-navy block mb-2">EEE INSTRUMENTS (PPF & SSY)</strong>
                  <p class="text-xs text-muted mb-4">The Exempt-Exempt-Exempt (EEE) status remains universally valid across both regimes. PPF offers a sovereign-backed 7.1% interest rate, which for a 30% tax bracket investor is mathematically equivalent to a pre-tax FD return of >10%. (Annual cap: ₹1.5 Lakh).</p>

                  <strong class="text-xs uppercase text-navy block mb-2">PROVIDENT FUNDS (EPF & VPF) CEILINGS</strong>
                  <p class="text-xs text-muted mb-4">Maturity proceeds are tax-free if you maintain 5 years of continuous service. However, interest accrued on the employee's contribution exceeding <strong>₹2.5 Lakh</strong> in a single financial year is fully taxable at slab rate.</p>

                  <strong class="text-xs uppercase text-navy block mb-2">SECONDARY MARKET TAX-FREE BONDS</strong>
                  <p class="text-xs text-muted mb-4">Govt-backed PSU bonds (NHAI, REC, PFC, IRFC) pay 100% tax-free annual coupons. <strong>The Catch:</strong> Selling them on the secondary market prior to maturity triggers capital gains (12.5% LTCG without indexation if held > 12 months).</p>

                  <strong class="text-xs uppercase text-navy block mb-2">LIFE INSURANCE & ULIPS (SECTION 10(10D) LIMITS)</strong>
                  <ul class="plain-list text-xs text-muted space-y-2 mb-2">
                    <li><strong>ULIPs:</strong> Issued post Feb 1, 2021 are tax-free only if aggregate annual premium ≤ ₹2.5 lakh.</li>
                    <li><strong>Traditional Life:</strong> Issued post April 1, 2023 are tax-free only if aggregate premium ≤ ₹5 lakh (and premium ≤ 10% of sum assured).</li>
                    <li><strong>Death Benefits:</strong> Any sum received by a nominee upon death remains completely tax-free regardless of premium size or policy type.</li>
                  </ul>
                </div>
              </details>

              <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> HEALTHCARE LIABILITY INSULATION</summary>
                <div class="details-content">
                  <p class="text-sm text-muted mb-4">Purchasing massive primary health insurance policies (e.g., ₹50L base plans) is highly capital-inefficient. The optimized approach utilizes a dual-layer strategy.</p>
                  <ul class="plain-list text-sm text-navy space-y-3 mb-4">
                    <li class="flex flex-col gap-1">
                      <div class="flex items-center gap-2 font-bold"><span class="text-blue">●</span> Regular Top-Up</div>
                      <span class="text-muted pl-5 text-xs">Operates on a <strong>per-claim deductible</strong>. If the deductible is ₹5L, a single hospitalization bill must exceed ₹5L before the policy pays. Multiple smaller claims won't trigger it.</span>
                    </li>
                    <li class="flex flex-col gap-1">
                      <div class="flex items-center gap-2 font-bold"><span class="text-green">●</span> Super Top-Up</div>
                      <span class="text-muted pl-5 text-xs">Operates on an <strong>aggregate deductible</strong> over the entire policy year. It combines all medical expenses; once the cumulative total breaches the deductible, it covers all subsequent expenses.</span>
                    </li>
                  </ul>
                  <div class="p-3 rounded text-left border-l-4 callout-tip" style="border-left-color: var(--primary-navy);">
                    <strong>💡 Recommendation:</strong> Tier-1 city residents should hold a Base Cover of ₹10 Lakh paired with a Super Top-Up of ₹30 Lakh to ₹50 Lakh (carrying a ₹10 Lakh deductible) to protect against severe oncological treatments or organ transplants efficiently.
                  </div>
                </div>
              </details>

              <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> ESTATE PLANNING: THE SUPREME COURT MANDATE</summary>
                <div class="details-content">
                  <p class="text-sm text-muted mb-3">A critical failure point in conventional planning is assuming that designating a "Nominee" transfers absolute legal ownership of an asset.</p>
                  <div class="p-3 rounded text-left border-l-4 mb-3 callout-tip" style="border-left-color: var(--status-red);">
                    <strong class="text-red">⚠️ The 2023 Supreme Court Judgment (Shakti Yezdani Case):</strong> The SC ruled definitively that corporate law and nomination processes do not create a "third mode of succession". 
                  </div>
                  <ul class="plain-list text-xs text-navy space-y-2">
                    <li><strong>Nominee is a Fiduciary:</strong> A nominee is strictly an agent or trustee appointed for administrative convenience. Once they receive the assets, they hold them in a strictly fiduciary capacity until rightful legal heirs establish their claim.</li>
                    <li><strong>The Mandate:</strong> The framework mandates the drafting and registration of a formal Will as a non-negotiable pillar of portfolio architecture. Without it, assets follow intestate succession laws regardless of nominations.</li>
                  </ul>
                </div>
              </details>

              <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> AGE-SPECIFIC LIFECYCLE GUIDANCE</summary>
                <div class="details-content">
                  <p class="text-sm text-muted mb-4">Static asset allocation models critically ignore changing human capital and fixed liabilities across different life stages. Note: SEBI replaced solution-oriented schemes with "Life Cycle Funds" in 2026 to automatically calibrate this shift.</p>
                  
                  <strong class="text-sm text-navy block mb-2 border-b pb-1">Initiating in the 20s: The Foundation Phase</strong>
                  <ul class="plain-list text-xs text-muted space-y-2 mb-4">
                    <li><strong>The Math of Early Action:</strong> A ₹20k monthly SIP at 12% takes ~15.5 years for the first ₹1 Crore, but the second ₹1 Crore is generated in just over 5 years.</li>
                    <li><strong>Allocation:</strong> Ideal baseline is 70% Equity, 25% Debt, 5% Gold. Aggressive investors can stomach 80-100% equity due to the 30-40 yr horizon.</li>
                    <li><strong>Priorities:</strong> Annihilate high-interest unsecured debt. 3-6 month emergency fund. Lock in an individual health policy. (Term life is unnecessary unless supporting dependents).</li>
                  </ul>

                  <strong class="text-sm text-navy block mb-2 border-b pb-1">Initiating in the 30s: The Fortification Phase</strong>
                  <ul class="plain-list text-xs text-muted space-y-2 mb-2">
                    <li><strong>The Catch-Up Penalty:</strong> Starting a ₹10k SIP at age 30 can generate ~₹41k/mo passive SWP income by age 50. Delaying to age 45 requires a staggering ₹1.2 Lakh/mo to match it.</li>
                    <li><strong>Allocation:</strong> Transition to "Growth with Stability" (60-70% Equity, 25-40% Debt). Dialing back from 100% equity significantly trims maximum drawdowns (e.g. from 57% to 33% in worst-case periods).</li>
                    <li><strong>Priorities:</strong> Expand emergency fund to 6-9 months due to mortgages/dependents. Pure Term Life Insurance becomes an absolute non-negotiable necessity. Shift to Family Floater health insurance.</li>
                  </ul>
                </div>
              </details>

              <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> THE HYBRID SEQUENCE (ORDER OF OPERATIONS)</summary>
                <div class="details-content">
                  <p class="text-sm text-muted mb-4">This sequence maps the globally recognized "Order of Operations" (advocated by financial educators like Nischa and Nick Invests) to the Indian ecosystem, mathematically minimizing risk and capturing "free money" before exposing capital to market volatility.</p>
                  
                  <div class="grid grid-cols-1 gap-2 text-xs">
                    <div class="p-3 bg-surface rounded border-l-4" style="border-left-color: var(--status-gold);">
                      <strong class="text-navy block mb-1">Step 1: The Safety Net (Cushion Fund)</strong>
                      <span class="text-muted">Before investing, build an immediate baseline cash buffer of ₹50,000 to ₹1,00,000 in a liquid fund. Prevents minor emergencies from forcing credit card debt.</span>
                    </div>
                    <div class="p-3 bg-surface rounded border-l-4" style="border-left-color: var(--status-green);">
                      <strong class="text-navy block mb-1">Step 2: Match the Match (Free Money)</strong>
                      <span class="text-muted">Capture full employer matches. EPF receives a mandatory 12% employer match. Opt into Corporate NPS (up to 10/14% basic) for pre-tax wealth under Sec 80CCD(2).</span>
                    </div>
                    <div class="p-3 bg-surface rounded border-l-4" style="border-left-color: var(--status-red);">
                      <strong class="text-navy block mb-1">Step 3: Say Bye to High (Eradicate Toxic Debt)</strong>
                      <span class="text-muted">Aggressively eliminate debt >9-10% (credit cards, personal loans). Paying off a 15% loan is mathematically identical to earning a guaranteed, risk-free 15% post-tax return.</span>
                    </div>
                    <div class="p-3 bg-surface rounded border-l-4" style="border-left-color: var(--status-gold);">
                      <strong class="text-navy block mb-1">Step 4: The Full Emergency Fund (Sparkfolio Step 1)</strong>
                      <span class="text-muted">Expand the Step 1 cushion into a full 3-to-6-month emergency fund parked in Liquid/Arbitrage funds.</span>
                    </div>
                    <div class="p-3 bg-surface rounded border-l-4" style="border-left-color: var(--primary-blue);">
                      <strong class="text-navy block mb-1">Step 5: The Triple Tax Break (Max Tax-Advantaged)</strong>
                      <span class="text-muted">Deploy capital into EEE instruments: Max out PPF (₹1.5L), SSY, and utilize VPF (staying under the ₹2.5L taxable threshold). Shields wealth from 12.5% LTCG.</span>
                    </div>
                    <div class="p-3 bg-surface rounded border-l-4" style="border-left-color: var(--primary-navy);">
                      <strong class="text-navy block mb-1">Step 6: The Long Game (Sparkfolio Growth Engine)</strong>
                      <span class="text-muted">Once tax-free/matched accounts are maxed, surplus flows into standard taxable accounts for unrestricted compounding (Broad-market Nifty 50, Flexicap, Mid/Smallcap).</span>
                    </div>
                    <div class="p-3 bg-surface rounded border-l-4" style="border-left-color: var(--muted-text);">
                      <strong class="text-navy block mb-1">Step 7: Advanced Defensives (Sparkfolio Step 6)</strong>
                      <span class="text-muted">For remaining capital (especially investors in 30s/40s balancing growth/stability), deploy into SGBs, Tax-Free Secondary Market Bonds, and Arbitrage Funds.</span>
                    </div>
                  </div>
                </div>
              </details>

`;

html = html.replace(
  '              <details>\r\n                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> KEY TERMS GLOSSARY</summary>',
  newSections + '              <details>\r\n                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> KEY TERMS GLOSSARY</summary>'
);

// Fallback if line endings are different
if (html.indexOf(newSections) === -1) {
  html = html.replace(
    '              <details>\n                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> KEY TERMS GLOSSARY</summary>',
    newSections + '              <details>\n                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> KEY TERMS GLOSSARY</summary>'
  );
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully injected 2026 updates into index.html');
