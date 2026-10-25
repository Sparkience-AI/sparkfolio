# Sparkfolio content change report

Prepared 25 October 2026. This report covers the content changes made in this working session, from production commit `343b7f5` through the correctness/evidence release and the subsequent UI cleanup. It does not attribute earlier Antigravity work to this session.

The report describes the final content. The first release was merged in PR #1 at `b3eff5a`; the UI cleanup and this report form the follow-up release. Git history remains the authoritative implementation record.

## 1. Purpose and editorial stance

The site remains an educational portfolio framework for Indian readers. Its name, broad subject coverage, static architecture and overall design are retained.

- Replaced definitive decision-tool wording with educational checkpoint wording and explicit limits.
- Removed automatic instructions to deploy the entered amount and age-only equity prescriptions from generated results.
- Qualified allocation examples, withdrawal-rate ranges, cash buffers, debt screens, cover amounts, rebalancing bands and exit intervals as editorial illustrations rather than universal rules.
- Made satellite allocations explicitly optional. Composition illustrations distinguish asset roles from the financial-readiness sequence.
- Replaced the claim that a disclaimer supplies a “legal safe harbor” with a regulatory and educational notice.
- Kept the SEBI registration disclosure, educational-purpose statement and market-risk notice.

## 2. Decision-tool content

The former generic fallback could refer to the wrong age bracket or tax regime. The new outcome text reflects the actual selected bracket and regime, with self-reporting and suitability limitations alongside the result.

| Area | Change |
| --- | --- |
| Intro and button | Educational exploration replaces definitive strategy language. |
| Answers | Explicit selections are required; coverage and employer benefits are no longer silently assumed. |
| Employer benefits | Actual payroll terms and eligibility replace employer-match assumptions; “Not applicable” is available. |
| Tax-advantaged allocation | Replaced ambiguous “PPF maxed?” wording with whether the applicable long-term allocation has been reviewed. |
| Amount | Optional illustrative context; positive amounts with up to two decimals. Invalid input produces an explanatory error instead of deployment instructions. |
| Result | Checkpoint, explanation, assumptions, milestone and relevant evidence. No assumed personal deduction benefit. |
| Edits after generation | Existing results are explicitly marked outdated until regenerated. |
| Privacy | Explains that answers and amounts are processed in the browser. |

The seven final checkpoints are baseline cash access, health protection, dependent protection, applicable employer benefits, expensive debt, emergency reserve and investment planning. They are review prompts, not a personal suitability assessment. The new investment-planning outcome asks readers to consider goals, dates, liquidity and capacity for loss before comparing allocation examples.

## 3. Calculations and numerical presentation

| Illustration | Before | Final treatment |
| --- | --- | --- |
| Fixed monthly SIP | ₹1.75 crore | Approximately ₹1.62 crore. |
| Annual step-up SIP | ₹2.82 crore | Approximately ₹3.36 crore. |
| SIP assumptions | Brief 20-year/11% note | ₹20,000 deposited at month-end, 20 years, 11% effective annual growth converted to monthly growth; step-up contributions increase 10% after each completed year. Excludes fees, tax and inflation. |
| Compounding milestones | Static numerical claim | Shared, tested illustration with contribution and effective-return assumptions. |
| Rebalancing drift | “5% / 10%” | “5 / 10 percentage points,” explicitly an editorial review illustration. |
| Tax harvesting | Guaranteed-sounding recurring saving | ₹15,625 is arithmetic from an unused qualifying ₹1.25 lakh threshold at 12.5% base tax; eligibility, costs, cess, surcharge and future effects matter. |

These are constant-return illustrations, not forecasts. Values used by the built page and dynamic results come from shared data/calculations.

## 4. Tax, insurance and regulatory corrections

All 17 originally pending registry entries were checked and either confirmed with conditions, corrected or narrowed. The full provision-by-provision evidence record is [CLAIM_AUDIT_2026-10-25.md](CLAIM_AUDIT_2026-10-25.md).

| Topic | Content correction |
| --- | --- |
| Equity capital gains | Retained 12.5% LTCG and 20% qualifying STCG base rates while recording instrument scope, STT conditions, exceptions, surcharge and cess. |
| Equity LTCG threshold | Clarified that ₹1.25 lakh is an aggregate annual qualifying-gain threshold, not an allowance per fund or account. |
| Current tax references | Added applicable-period context and current 2025 Act references while retaining clearly labelled legacy mappings. Earlier years retain their applicable law. |
| EPF employee contribution thresholds | ₹2.5 lakh / ₹5 lakh concern interest attributable to excess employee contributions under the applicable conditions; the full balance does not thereby become taxable. Withdrawal exemptions are separate. |
| EPF interest rate | Replaced the undated 8.25% with the FY 2025–26 declared rate. Inspected the July circular reproduction and corroborated its declaration with the government broadcaster; disclosed unsuccessful direct EPFO-host retrieval. This is not a FY 2026–27 rate. |
| ULIPs | Added issue-date applicability, aggregation and the point that a ₹2.5 lakh premium threshold alone does not establish exemption. |
| Other life insurance | Added the ₹5 lakh aggregate threshold’s issue-date scope and other premium/sum-assured conditions and exceptions. |
| Death benefits | Removed the blanket claim that all policy types are exempt regardless of premium; retained statutory exclusions, including Keyman and specified receipts. |
| Employer NPS | Explained private-sector 14% New Regime versus 10% outside that regime, the Central/State Government 14% ceiling, defined salary and the difference between a deduction ceiling and a promised employer contribution. |
| Own-contribution NPS | Explained the additional ₹50,000 Old Regime deduction, shared eligible minor-account ceiling, no double counting and New Regime exclusion. |
| SGBs | Used the enacted original-issue-to-maturity condition for an individual’s redemption exclusion. Removed the assertion that every secondary purchase/redemption necessarily incurs 12.5% tax. |
| Tax-free PSU bonds | Restricted coupon exemption to qualifying notified issues and conditions; PSU ownership alone establishes neither exemption nor a sovereign guarantee. Sale gains are separate. |
| REIT/InvIT repayments | Replaced broad repayment-tax language with the cumulative `max(A − B − C, 0)` calculation, distinguishing unit issue price from secondary purchase cost. |
| REIT/InvIT TDS | Limited the resident 10% nil-threshold statement to covered components, with the dividend exception, separate non-resident rules and withholding-versus-final-tax distinction. |
| Debt funds | Removed a blanket slab-rate/no-indexation conclusion; classification and acquisition date must be checked. |
| Asset location | Removed instructions suggesting arbitrary debt investments can simply be placed inside PPF/EPF wrappers. Added product, liquidity, contribution and withdrawal constraints. |
| SEBI brokerage | Explained 6 bps cash / 2 bps derivatives as allowances outside BER; excess brokerage falls within BER, with transaction costs and levies separate. They are not universal trading-cost caps. |

## 5. Investment education and research qualifications

- **PPF and SSY:** linked the inspected provider listing, recorded review periods and warned that future quarters require checking. No future rate guarantee or assumed personal taxable-equivalent return is supplied.
- **Cash and emergency reserves:** distinguished immediate cash access from invested reserves; added fluctuation, settlement and liquidity considerations. Arbitrage funds are not described as instant cash.
- **Insurance:** framed cover structures and income-replacement needs around household circumstances, exclusions, deductibles and policy terms.
- **Goal horizons:** replaced the unconditional three-year “Golden Rule” with a goal-horizon review; debt/liquid funds also carry risks.
- **Debt prepayment:** changed mandatory repayment language to a review of effective cost, penalties, liquidity and household needs.
- **SPIVA:** specified the inspected Mid-Year 2026 category and period for the large-cap underperformance statistic rather than presenting a universal active-fund failure rate.
- **Vanguard:** contextualized the 2023 lump-sum research and distinguished staging an already available lump sum from regular salary-funded contributions.
- **Investor behavior:** removed the suggestion that return-gap studies establish one universal cause of underperformance; methodology and attribution matter.
- **Automation:** changed “automate everything” to reviewing affordability and goals alongside automation.
- **Active-fund exits:** changed an automatic sale instruction after underperformance into a review of mandate, risk, costs and alternatives.
- **Fund selection:** removed unsupported shortcut language and qualified category examples; institution/fund names do not constitute endorsements.
- **Property and retirement:** removed unsupported price, drawdown and retirement-income comparisons or replaced them with qualified explanations. Withdrawal-rate ranges remain illustrations, not guaranteed safe rates.
- **P2P lending:** removed unverified numerical regulatory caps and emphasized default, platform and liquidity risk.
- **Nomination:** narrowed the Shakti Yezdani discussion to the shares/securities provisions considered, rather than generalizing to every asset type.

## 6. Sources, accountability and privacy

The existing 38 IDs were preserved. The SSoT now distinguishes legal provisions, rates, published research, calculations and editorial statements, with real source locators, effective periods, assumptions and review status.

- 25 entries are verified within their recorded scope, 10 editorial and 3 calculated.
- Historical quarter labels remain historical metadata; they were not converted into invented source-check dates.
- Expired review dates display a review-needed status.
- Public notes explain evidence limits, including the EPFO reproduction’s hosting limitation.
- Sparkfolio is identified as the editorial publisher. No named reviewer, external professional review, affiliation or credentials were invented.
- Added an accessible public corrections route and a warning against including personal financial information in public issues.
- Added accurate privacy wording: answers, search terms and amounts remain in browser memory; no analytics or application backend was added; hosting and destination websites have their own policies.
- Replaced duplicated long FAQ structured data with concise page/publisher metadata.

## 7. Latest UI/content consolidation

This follow-up removes presentation duplication introduced by the first release and trims older duplicated material:

| Removed or consolidated | Final presentation |
| --- | --- |
| “Start here” section-link list and extra about/source/update links | Existing main navigation remains. |
| “Browse all implementation topics” link directory | Local topic search and the actual topic accordions remain. |
| “Link to this topic” in every accordion | Stable fragment IDs still work without repeated visible permalinks. |
| Related-topic/“Maps to” link in each generated result | The result and relevant source references remain. |
| Older institution-by-institution reference cards and second methodology | One “Methodology & sources” section, with claim-specific evidence instead of broad institutional name lists. |
| Bulky repeated “[source]” labels | Small, consistent numbered references opening the corresponding evidence note. |
| Long expanded source list | Compact individual source accordions with values, conditions, dates and direct documents retained inside. |
| Standalone lengthy tax mapping/update-log paragraphs | Concise tax-period context in methodology; detailed mappings remain with each claim and in the audit record. |
| Separate privacy/corrections prose blocks | One compact expandable disclosure. |

The closing section, search controls, source links and result references now use the existing navy/gold palette, editorial typography, borders and paper surfaces. The latest UI cleanup does not alter the underlying SSoT claim values.

## 8. Detailed audit trail and limits

[CONTENT_CHANGES_APPENDIX.md](CONTENT_CHANGES_APPENDIX.md) contains a mechanically generated before/after comparison of page text and all 38 registry values/statuses. It compares the pre-session page at `343b7f5` with the final source page. It excludes executable scripts, styles and metadata; it is not a simulated historical browser execution. The registered-value table separately captures values resolved during builds. Generated checkpoint templates are described in section 2 and preserved in `src/decision.js`.

The initial report and latest polish are deliberately distinguished: some navigation and explanatory copy was added in the first release and subsequently removed or consolidated at your request. The appendix shows the net difference; this report explains those intermediate decisions.

Financial source checking covers the recorded claims and conditions; it is not a complete audit of every remaining financial sentence, independent professional review, legal opinion or full accessibility certification. Existing content that was not changed is not represented as newly verified. The remaining source conditions are retained even when their presentation is compact.

Validation includes all 3,072 decision combinations, amount handling, calculations, provenance, rendered consistency, HTML/build checks and browser flows. Release completion and deployment results are recorded in the pull request and GitHub Actions rather than asserted in advance here.
