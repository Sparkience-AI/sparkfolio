import re

file_path = r'C:\Users\nitin\Documents\antigravity\mysterious-volta\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# C1: Direct vs Regular
c1 = """
            <div class="card p-6 mt-4 border border-red-100 bg-red-50 rounded-lg">
              <h3 class="font-bold text-lg mb-2 text-navy flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                The Compounding Tax on Wealth (Direct vs Regular)
              </h3>
              <p class="text-sm text-gray-700">Regular mutual fund plans charge an extra 1-1.5% in distributor commissions every year compared to Direct plans. Over a 20-year period, this seemingly small 1% fee drag compounds, potentially eating away 20-30% of your total wealth. Always invest in Direct plans to keep your returns yours.</p>
            </div>
"""
for i, line in enumerate(lines):
    if line.strip() == "</section>" and i > 850:
        lines.insert(i-3, c1)
        break


# C6: Goal-Based Investing
c6 = """
    <section id="goal-based" class="section">
      <div class="container">
        <h2 class="section-title">GOAL-BASED INVESTING</h2>
        <div class="card p-6 border-t-4" style="border-top-color: var(--primary-blue)">
          <p class="text-sm text-muted mb-4">Your asset allocation should strictly follow your investment time horizon:</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-navy">
            <div class="bg-surface p-4 rounded border-l-2 border-red-500">
              <strong class="block mb-2">&lt; 3 Years</strong>
              <p class="text-xs text-muted mb-2">Focus on capital protection.</p>
              <span class="font-bold">Debt funds, FDs, Liquid funds</span>
            </div>
            <div class="bg-surface p-4 rounded border-l-2 border-yellow-500">
              <strong class="block mb-2">3 - 7 Years</strong>
              <p class="text-xs text-muted mb-2">Balance of growth and stability.</p>
              <span class="font-bold">Aggressive Hybrid, BAF</span>
            </div>
            <div class="bg-surface p-4 rounded border-l-2 border-green-500">
              <strong class="block mb-2">&gt; 7 Years</strong>
              <p class="text-xs text-muted mb-2">Focus on wealth creation.</p>
              <span class="font-bold">Index funds, Flexi-cap</span>
            </div>
          </div>
        </div>
      </div>
    </section>
"""
for i, line in enumerate(lines):
    if line.strip() == "</section>" and 430 < i < 450:
        lines.insert(i+1, c6)
        break

# C8: Emergency Fund Sizing
c8 = """
                  <div class="table-container border-0 mt-4">
                    <div class="text-center bg-navy text-inverse text-xs font-bold uppercase p-1">EMERGENCY FUND SIZING</div>
                    <table class="responsive-table text-xs">
                      <thead><tr><th>Income Stability</th><th>Recommended Buffer</th></tr></thead>
                      <tbody>
                        <tr><td data-label="Income Stability" class="font-bold">Salaried (Stable)</td><td data-label="Recommended Buffer">3 - 6 months</td></tr>
                        <tr><td data-label="Income Stability" class="font-bold">Family (Dependents)</td><td data-label="Recommended Buffer">6 - 9 months</td></tr>
                        <tr><td data-label="Income Stability" class="font-bold">Freelancer / Business</td><td data-label="Recommended Buffer">9 - 12 months</td></tr>
                      </tbody>
                    </table>
                  </div>
"""
for i, line in enumerate(lines):
    if "EMERGENCY FUND" in line and 300 < i < 400:
        for j in range(i, i+20):
            if "</ul>" in lines[j]:
                lines.insert(j+1, c8)
                break
        break


# C2+C3: Retirement Playbook
c23 = """
              <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> THE RETIREMENT PLAYBOOK</summary>
                <div class="details-content">
                  <ul class="plain-list bullet-list text-sm text-navy space-y-2">
                    <li><strong>The 3% Rule:</strong> Unlike the US 4% rule, India's higher inflation makes a Safe Withdrawal Rate (SWR) of 3-3.5% more sustainable for a 30-year retirement.</li>
                    <li><strong>The Bucket Strategy:</strong> Divide your corpus. Immediate (0-3 yrs) stays in liquid/cash. Medium (3-7 yrs) in hybrid/debt. Long-term (7+ yrs) in equity.</li>
                    <li><strong>Sequence of Returns Risk:</strong> Experiencing a market crash early in retirement can permanently deplete your portfolio. The bucket strategy mitigates this by securing early years in debt.</li>
                  </ul>
                </div>
              </details>
"""
for i, line in enumerate(lines):
    if "WEALTH ACCELERATION (STEP-UP SIP)" in line:
        for j in range(i, i+40):
            if "</details>" in lines[j]:
                lines.insert(j+1, c23)
                break
        break

# C5: International Diversification
c5 = """
              <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> INTERNATIONAL DIVERSIFICATION</summary>
                <div class="details-content">
                  <p class="text-sm text-muted mb-2">Indian investors suffer from massive "Home Bias," keeping roughly 98% of wealth in domestic assets. However, India represents only a fraction of global market cap.</p>
                  <p class="text-sm text-muted">To hedge against country-specific risks and currency depreciation, we recommend a <strong>15% to 30% allocation</strong> of your equity portfolio to the US market (e.g., S&P 500 or Nasdaq 100).</p>
                </div>
              </details>
"""
for i, line in enumerate(lines):
    if "GROWTH ASSETS" in line and 400 < i < 500:
        for j in range(i, i+40):
            if "</details>" in lines[j]:
                lines.insert(j+1, c5)
                break
        break

# C7: Lump Sum vs SIP
c7 = """
                  <div class="callout-tip flex gap-3 mt-4">
                    <div>
                      <strong class="block mb-1">💡 Lump Sum vs SIP</strong>
                      <p class="text-xs m-0">Vanguard studies show that investing a Lump Sum immediately beats spreading it out (SIP) about 67% of the time because markets rise more than they fall. However, SIPs are highly recommended for the peace of mind they provide.</p>
                    </div>
                  </div>
"""
for i, line in enumerate(lines):
    if "BEHAVIORAL GUARDRAILS" in line:
        for j in range(i, i+40):
            if "</div>" in lines[j] and "</details>" in lines[j+1]:
                lines.insert(j, c7)
                break
        break


# C9: NPS Tax Efficiency
c9 = """
                  <div class="callout-tip flex gap-3 mt-4">
                    <div>
                      <strong class="block mb-1">💡 NPS Tax Efficiency</strong>
                      <p class="text-xs m-0">The National Pension System (NPS) offers an exclusive ₹50,000 tax deduction under section 80CCD(1B). This is over and above the standard ₹1.5L limit of 80C.</p>
                    </div>
                  </div>
"""
for i, line in enumerate(lines):
    if "TAX-AWARE INVESTING" in line:
        for j in range(i, i+40):
            if "</div>" in lines[j] and "</details>" in lines[j+1]:
                lines.insert(j, c9)
                break
        break


# C10: Insurance vs Investment
c10 = """
                  <div class="callout-tip flex gap-3 mt-4">
                    <div>
                      <strong class="block mb-1">💡 Insurance vs. Investment</strong>
                      <p class="text-xs m-0">Never mix the two. Endowment and ULIP plans often generate a dismal 4-6% IRR while offering poor life cover. Buy pure Term Insurance for coverage and invest the rest in mutual funds.</p>
                    </div>
                  </div>
"""
for i, line in enumerate(lines):
    if "EMERGENCY FUND" in line and 300 < i < 400:
        for j in range(i, i+40):
            if "</div>" in lines[j] and "</details>" in lines[j+1]:
                lines.insert(j, c10)
                break
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Insertion successful.")
