# Sparkfolio independent educational review model

Source review: 25 October 2026. Tax context: tax year 2026–27. Model version: 1.0.0.

## Purpose and boundary

The module produces a complete set of educational review cards for the answers supplied. It is independent of the guide’s seven-checkpoint presentation: it does not need a guide link to explain an outcome, and several outputs have no checkpoint number. It remains a bounded questionnaire, not a complete financial plan, suitability assessment, tax-return calculator or recommendation to purchase a product.

It does not collect annual income, exact liabilities, existing portfolio holdings, residency, surcharge status, deductible headroom or full policy terms. Consequently it cannot determine a personal annual tax liability, optimal tax regime, insurance sum assured or suitable allocation percentage. All inputs remain in browser memory. The optional amount is context only, never assumed to be income or an eligible deduction.

## Primary research and its implementation

| Evidence | What it supports | What the engine does with it |
| --- | --- | --- |
| [Income-tax Act, 2025, amended by Finance Act 2026](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf#page=265), section 202; sections 124 and 156 separately located in the same consolidated Act | New Regime marginal bands; restrictions on personal deductions; employer/own NPS distinction; rebate conditions | Offers only supported regime-specific marginal rates. No personal section 123/124(3) deduction saving is assigned under the New Regime. Rebates are explicitly excluded from the simple illustration. |
| [Income Tax Department: individual tax computation](https://www.incometaxindia.gov.in/w/computation-of-tax-for-individual-1), normal Old Regime rates and cess sections | Ordinary versus special-rate income; Old Regime rates 0/5/20/30%; 4% health and education cess; separate rebate/surcharge stages | Uses the selected ordinary-income rate with cess for a conditional illustration. The guide has legacy labels and mixed historical assessment years; it is not used to infer a current rebate threshold or as a substitute for section 202. |
| [Investor.gov: asset allocation and diversification](https://www.investor.gov/introduction-investing/getting-started/asset-allocation) | Time horizon and ability/willingness to bear losses matter to an allocation decision | Adds explicit horizon and loss-capacity questions. Avoids deriving an equity percentage from age or bracket. These are general principles, not India-specific tax or product rules. |
| [MoneySense: putting together an investment portfolio](https://www.moneysense.gov.sg/investments/investment-portfolio/) | Available funds depend on essential expenses, reserves, insurance and debt; liquidity and goal flexibility matter | Shows concurrent foundation gaps and self-contained next-review actions. Singapore product examples are not imported into Indian outputs. |

The current 2025 Act’s section 202 table was located in the consolidated primary source and corroborated against the official published Act text. Some subsequent direct PDF requests and Gazette retrieval timed out; these are not claimed as additional independent document inspections. The department’s individual-computation guide contains historical and mixed-year sections, including inconsistent rebate wording, so no numeric rebate threshold from that guide is embedded in the model.

### Tax illustration

The user chooses a **base marginal slab**, not an average rate or a nil tax bill after rebate. New Regime choices are 0%, 5%, 10%, 15%, 20%, 25%, 30% and “Not sure”; Old Regime choices are 0%, 5%, 20%, 30% and “Not sure”. Changing regime clears the earlier selection.

The fixed illustration assumes an additional ₹10,000 of ordinary taxable interest falls entirely within the selected band:

`illustrative tax = ₹10,000 × selected marginal rate × (1 + 0.04)`

| Selected base rate | Rate with 4% cess, no surcharge | Illustrative tax | Retained interest |
| --- | --- | --- | --- |
| 0% | 0% | ₹0 | ₹10,000 |
| 5% | 5.2% | ₹520 | ₹9,480 |
| 10% | 10.4% | ₹1,040 | ₹8,960 |
| 15% | 15.6% | ₹1,560 | ₹8,440 |
| 20% | 20.8% | ₹2,080 | ₹7,920 |
| 25% | 26% | ₹2,600 | ₹7,400 |
| 30% | 31.2% | ₹3,120 | ₹6,880 |
| Not sure | No assumption | No number computed | No number computed |

This deliberately excludes rebate, surcharge, marginal relief, exemptions, deductions, special-rate gains and band crossing. Actual tax effects can differ or be nil. No residential status or actual rebate eligibility is inferred. A higher bracket never overrides immediate liquidity, protection or loss-capacity needs.

Under the Old Regime, a **separate, hypothetical** fully eligible, unused ₹10,000 deduction entirely within that same band produces the same illustrative tax reduction, subject to the same exclusions. It is not the entered amount, a verified deduction entitlement or a reason to buy a product. The New Regime card instead explains unavailable personal deductions and the separate employer NPS exception. A chosen 0% band shows no marginal saving; an unknown band yields no estimate.

## All 18 output-card families

Cards are composed from independent rules. The first applicable foundation gap becomes the priority; other gaps remain visible. When no foundation-gap rule fires, the goal card becomes the independent priority and a maintenance card is also included. A missing gap is not a verified finding of adequacy.

| ID | Trigger | Checkpoint relationship |
| --- | --- | --- |
| `baseline` | No emergency reserve | Foundation 1 |
| `health` | Employer-only/no personal health cover reported | Foundation 2 |
| `dependents` | Financial dependents and no term cover | Foundation 3 |
| `employer` | Applicable employer benefits not reviewed | Foundation 4 |
| `debt` | Debt above the questionnaire’s 9% editorial screen | Foundation 5 |
| `reserve` | Reserve under 3 months; or 3–6 months in the displayed 40s/50s brackets | Foundation 6; editorial screen, not an age-based mandate |
| `maintenance` | None of the foundation-gap rules fires | Independent maintenance review |
| `near-term` | Goal under 3 years | Independent liquidity review |
| `medium-term` | Goal 3–7 years | Independent goal-flexibility review |
| `long-term` | Goal over 7 years | Independent diversification/cost review |
| `define-goal` | Goal horizon unknown | Independent goal-definition review |
| `protect-essentials` | A loss would affect essentials | Independent loss-capacity constraint |
| `assess-capacity` | Loss capacity unassessed | Independent information gap |
| `capacity-review` | User reports capacity to absorb losses | Independent consistency check; does not override a short horizon |
| `tax-unknown` | Marginal bracket unknown | Independent tax information gap; no estimate |
| `tax-illustration` | A supported marginal bracket is selected | Independent conditional arithmetic |
| `new-regime` | New Regime selected | Independent eligibility review |
| `old-regime` | Old Regime selected | Independent deduction/headroom review |

Every valid result contains one goal card, one loss-capacity card, one tax-context card and one regime card, plus all applicable foundation gaps or a maintenance card. The original seventh investment-planning checkpoint is represented by the independent goal/capacity/tax review rather than forcing every result into “checkpoint 7”.

The horizon bins (3 and 7 years), 9% debt screen, age-linked reserve screen and foundation ordering are **Sparkfolio editorial conventions**. No regulator is represented as prescribing these exact rules. “Can absorb losses” is not interpreted as unlimited risk tolerance. “Not applicable” employer benefits never triggers an employer gap. No dependents means a missing term policy does not itself trigger dependent protection.

## Exhaustive modeling and checks

The original non-regime questions supply 1,536 answer combinations. For each, there are 8 valid New Regime or 5 valid Old Regime brackets, 4 horizon choices and 3 loss-capacity choices:

`1,536 × (8 + 5) × 4 × 3 = 239,616 valid combinations`

Unit tests enumerate every valid combination and assert first-gap precedence, concurrent gaps, unique cards, all four independent review categories, correct regime and unknown-bracket handling, mathematical tax outputs, source/fact references, and reachability of all 18 families. Unsupported Old Regime 10/15/25% selections and incomplete answers are rejected. Amount validation remains separate and never substitutes an amount into a tax calculation.

Browser tests cover real form selections, clearing and filtering brackets after regime changes, tax arithmetic, switching Old/New/unknown outcomes without stale cards, live announcements, all result widths, native keyboard operation, stale results, no-JavaScript reading, print and local-only asset requests. Mathematical/branch coverage is not financial certification or an independently validated advisory model.

## Single source and future maintenance

`src/data/framework-facts.json` now includes `_decision_model` alongside the existing 38 registered claims. It supplies supported brackets, cess, the illustrative base, assumptions, question labels, source URLs, tax year and review dates. This model configuration is not counted as additional verified registry entries. `src/decision.js` contains pure composition rules; rendering uses DOM text rather than HTML strings. The optional amount is safely formatted independently.

Any law change requires checking the sources and updating both model data and affected explanations. Registry validation checks policy provenance, numeric inputs and option integrity; exhaustive tests guard against losing outcome families. Review dates are actual source-review metadata, not scheduled future verification. The model does not fetch laws automatically.
