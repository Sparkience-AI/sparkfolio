# 🏛️ Sparkfolio Investment Framework

The **Sparkfolio Investment Framework** is an independent, institutional-grade, yet beginner-friendly guide to strategic asset allocation, risk insulation, tax-aware investing, and long-term wealth resilience tailored for the Indian ecosystem.

🔗 **Live Website:** [https://sparkience-ai.github.io/sparkfolio/](https://sparkience-ai.github.io/sparkfolio/)

---

## ✨ Features & Architecture

### 1. 🤖 "Where Should Your Next Rupee Go?" Decision Engine (`#agent`)
An interactive, deterministic 7-step decision engine that inputs:
* **Capital Amount (₹)**
* **Tax Regime:** New Tax Regime (`NTR`) vs. Old Tax Regime (`OTR`)
* **Age Bracket:** `20s`, `30s`, `40s`, `50s`
* **Dependents:** `Yes` | `No`
* **Personal Health Cover:** `Personal (Base + Top-Up)` | `Corp Only / None`
* **Pure Term Life Cover:** `Active` | `None`
* **Emergency Fund Status & High-Interest Debt (>9%)**
* **Corporate NPS / EPF Employer Match & PPF Status**

Outputs a definitive next step mapped directly to **Section 3 (Portfolio Hierarchy)** and **Section 7 (Implementation Guide)**.

### 2. 📚 5-Stage Pedagogical Flow
* **Stage 1 — Hero & Framework Principles (`#overview`)**
* **Stage 2 — Portfolio Hierarchy (`#hierarchy`):** Growth vs. Defensive asset classification.
* **Stage 3 — Order of Operations (`#building-order`):** Step-by-step portfolio building sequence.
* **Stage 4 — Templates & Goal Horizons (`#templates`):** Conservative, Moderate, Aggressive, and Glide Path allocations.
* **Stage 5 — Implementation & Review Guide (`#implementation`):** 24 technical accordions covering tax harvesting, SGB secondary market rules, REITs Sec 115UA, Supreme Court nominee rulings, and decumulation strategies.

### 3. 📜 Single Source of Truth (SSoT) Facts Governance
All 34 time-sensitive rates, tax laws, deduction caps, and research citations are cataloged in a central registry: [`src/data/framework-facts.json`](src/data/framework-facts.json).
* **Level 1 (`L1_evergreen`):** Structural math, legal precedents (*Shakti Yezdani Case*), academic research.
* **Level 2 (`L2_annual`):** Tax laws, LTCG/STCG, 80C caps, Sec 80CCD(2) limits (Reviewed post-Union Budget in February).
* **Level 3 (`L3_quarterly`):** Sovereign rates (PPF 7.1%, EPF 8.25%, SSY 8.2%), home loan threshold (8.5%), SEBI circulars (Reviewed end of Q1, Q2, Q3, Q4).
* See [FACTS_GOVERNANCE.md](FACTS_GOVERNANCE.md) for full documentation.

---

## 🌿 Git Branching & Revert Options

For maximum flexibility, the repository maintains dedicated branches:

| Branch Name | Description | Link / Commit |
|:---|:---|:---|
| `main` | **Production Branch.** Contains full SSoT data binding, 34 tagged facts, and verified decision engine. | [`main`](https://github.com/Sparkience-AI/sparkfolio) |
| `feat/ssot-facts-registry` | **SSoT Feature Branch.** Active development branch for SSoT registry features. | [`feat/ssot-facts-registry`](https://github.com/Sparkience-AI/sparkfolio/tree/feat/ssot-facts-registry) |
| `pre-ssot-spans` | **Pre-Tagging Revert Branch.** Clean snapshot of the website prior to adding `<span data-fact="...">` markup wrappers. Use this branch if you ever want to revert or compare without spans. | [`pre-ssot-spans`](https://github.com/Sparkience-AI/sparkfolio/tree/pre-ssot-spans) |

---

## 🛠️ Development & Testing Commands

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build

# 4. Validate HTML syntax
npx html-validate index.html

# 5. Run SSoT 100% Coverage & Build Integrity Test
node tests/verify_facts_coverage.cjs
```

---

## ⚖️ Legal Disclaimer & Research Integrity

**Not Financial Advice:** Sparkfolio is an independent educational framework provided for informational purposes only. The content, frameworks, asset allocation models, and methodologies presented within this repository and on the live website do not constitute personalized investment, financial, legal, or tax advice. All investment strategies involve risk of loss, and past performance is no guarantee of future results. You should consult with a qualified SEBI-registered investment advisor (RIA) or financial professional before making any investment decisions.

**Research Integrity:** Sparkfolio synthesizes concepts from multiple independent sources (such as Vanguard, Morningstar, BlackRock, SPIVA, DALBAR, etc.) into a unified educational resource. Sparkfolio is not affiliated with, endorsed by, or sponsored by any of these organizations. All trademarks belong to their respective owners.

## 📄 License
MIT License