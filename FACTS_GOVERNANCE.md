# 📜 Sparkfolio Single Source of Truth (SSoT) Facts Governance

This document outlines the **Single Source of Truth (SSoT) Architecture** for managing, updating, and auditing all time-sensitive rates, tax laws, regulatory caps, legal mandates, and empirical research citations across the Sparkfolio Framework.

---

## 🏛️ Architecture Overview

To eliminate discrepancies across `index.html`, decision tools, tooltips, and JSON-LD structured data, all time-sensitive information lives in a single central registry:

* **Central Registry:** `src/data/framework-facts.json`
* **HTML Markup:** `<span data-fact="<fact_id>">Fallback Value</span>`
* **Auto-Binder:** `syncFrameworkFacts()` in `src/main.js` (syncs `framework-facts.json` to the DOM on load)
* **Automated Coverage Test:** `tests/verify_facts_coverage.cjs`

---

## 📊 3-Level Volatility Classification

All facts are categorized into 3 distinct review levels:

### 🟢 Level 1: Evergreen & Structural Foundations (`L1_evergreen`)
* **Review Cycle:** Rarely changes / No regular review required.
* **Scope:** Financial mathematics, fundamental asset allocation laws, landmark court rulings, and academic research.
* **Examples:**
  * `math_compounding_1st_vs_2nd_crore` (15.5 yrs for 1st Cr vs 5 yrs for 2nd Cr)
  * `legal_sc_nominee_judgment` (2023 Supreme Court *Shakti Yezdani Case*)
  * `study_vanguard_lumpsum_vs_sip` (Lump sum beats SIP 67% of time)
  * `rule_swr_india` (3%–3.5% SWR for India)

### 🟡 Level 2: Annual Budget Review (`L2_annual`)
* **Review Cycle:** Annual (Post-Union Budget / Finance Act passed in February).
* **Scope:** Income Tax slabs, deduction caps, capital gains tax rates, and tax section rules.
* **Examples:**
  * `tax_ltcg_rate` (12.5%) & `tax_stcg_rate` (20%)
  * `cap_sec_80c` (₹1.5 Lakh) & `cap_epf_tax_free_employee` (₹2.5 Lakh)
  * `tax_sec_80ccd2_private` (10% Private) / `tax_sec_80ccd2_govt` (14% Govt)
  * `tax_sgb_secondary_rule` (Secondary market SGB 12.5% LTCG under Budget 2026)

### 🔴 Level 3: Quarterly Rate Review (`L3_quarterly`)
* **Review Cycle:** Quarterly (At the end of March, June, September, and December).
* **Scope:** Sovereign small savings interest rates, EPFO rates, and SEBI regulatory circulars.
* **Examples:**
  * `rate_ppf_interest` (7.1%)
  * `rate_epf_interest` (8.25%)
  * `rate_ssy_interest` (8.2%)
  * `sebi_brokerage_cap_cash` (6bps) & `sebi_brokerage_cap_derivatives` (2bps)
  * `sebi_rule_lifecycle_funds` (SEBI 2026 Life Cycle Funds auto-derisking)

---

## 🛠️ Maintenance & Audit Commands

### 1. Run SSoT Coverage & Integrity Test
```bash
node tests/verify_facts_coverage.cjs
```
This test asserts:
* 100% of keys in `src/data/framework-facts.json` are actively bound in `index.html`.
* `npx html-validate index.html` passes with 0 errors.
* `npm run build` succeeds cleanly.

### 2. How to Request an Update from the AI Assistant
* **Quarterly Audit:** Ask *"Audit all Level 3 (L3) quarterly rates"*.
* **Annual Budget Audit:** Ask *"Audit Level 2 (L2) tax laws for the post-Budget update"*.
* **Single Value Update:** Ask *"Update PPF rate (`rate_ppf_interest`) to 7.2%"*.

Editing `src/data/framework-facts.json` will automatically refresh every corresponding text instance across `index.html`, decision logic, tooltips, and JSON-LD structured data simultaneously.
