# Sparkfolio wording review — 30 October 2026

**Status: approved for release.** The user approved publication after review and requested the footer label “Framework updated”. Deployment results are recorded in the release pull request and Actions run.

Baseline commit: `ff425a12b71b0a9b4604231633abdf8ab687885a`. This records the baseline used for the wording review.

## What changed

The decision engine now explains what an answer means, why it matters and what to check next in everyday language. The aim is to help a reader who is new to finance without making the explanation vague for an experienced reader.

The review includes the local wording draft that was already in the workspace. That draft was checked and refined rather than discarded. Comparisons below use the committed production version as the baseline, so you can assess the complete proposed wording change.

- Reworked all **18 output-card families**, including their conditional wording for known/unknown brackets, both regimes and different goal dates.
- Reviewed the questions, help text, button, empty state, result headings, status messages, numerical labels and explanatory notes.
- Reviewed the seven readiness descriptions and the previously changed guide material on tax, insurance, research findings, debt, goals, property, retirement and inheritance.
- Reviewed all **38 registry entries**: 10 display statements and 35 condition/assumption notes were rewritten. Numerical values were preserved. Complex policy exceptions and source-verification details were kept where precision matters.
- Simplified methodology, source-status explanations, privacy and corrections copy. No accordion titles, branch rules or investment percentages were changed by this wording pass.

## Examples worth checking first

| Before | Proposed approach |
| --- | --- |
| “Applicable employer benefits” | “Find out what your employer contributes” — followed by the specific questions to ask payroll. |
| “Protect near-term access” | “Keep money for a goal coming up soon within reach” — explains loss and withdrawal timing in terms of the goal date. |
| “Tax-advantaged allocation reviewed?” | “Checked tax-saving options for your long-term goals?” |
| “Ordinary-income marginal slab” without explanation | Explains that the choice is the rate on the top part of ordinary taxable income, before cess/surcharge, and offers “Not sure”. |
| “30% marginal-bracket illustration” | “What your 30% tax bracket could mean” — a worked example showing tax and interest retained, with the assumptions next to it. |
| “Review next” / “Next Milestone” | “What to do next” — concrete tasks such as listing bills, checking policy terms or asking payroll. |
| Repeated long tax exclusions in the reading flow | A short explanation plus expandable “How this tax example works” notes. The exclusions remain available. |

## All output titles

| Internal card ID | Production title | Proposed title |
| --- | --- | --- |
| baseline | Baseline cash access | Start with money you can reach quickly |
| health | Health protection review | Check your health insurance |
| dependents | Dependent protection review | Protect the people who depend on your income |
| employer | Applicable employer benefits | Find out what your employer contributes |
| debt | Expensive debt review | Take a closer look at costly debt |
| reserve | Emergency reserve review | Check how long your emergency money would last |
| maintenance | Maintain your financial foundations | Keep your basics up to date |
| near-term | Protect near-term access | Keep money for a goal coming up soon within reach |
| medium-term | Balance goal flexibility and loss risk | Plan around your goal’s deadline |
| long-term | Build a diversified long-term plan | Make a plan for your longer-term goal |
| define-goal | Define the goal before choosing investments | Decide what the money is for first |
| protect-essentials | Keep essential needs insulated from losses | Do not put essential bills at risk |
| assess-capacity | Assess loss capacity first | Work out what a loss would mean for you |
| capacity-review | Test your stated capacity against the goal | Check that a loss would not disrupt your plans |
| tax-unknown | Confirm your marginal tax bracket | Find your tax bracket before comparing tax savings |
| tax-illustration | 30% marginal-bracket illustration | What your 30% tax bracket could mean |
| new-regime | Review New Regime eligibility, not an assumed deduction | Know which tax breaks the New Regime allows |
| old-regime | Review unused eligible deductions and lock-ins | Check the tax deductions you still have available |

The internal IDs are included for traceability; readers do not see them. [The full appendix](WORDING_REVIEW_APPENDIX_2026-10-30.md) includes every explanation and action before and after, plus the conditional variants, registry notes and page-text changes.

## Clarity and accuracy decisions

1. **Everyday wording first.** “Money you can withdraw,” “bills you cannot put off” and “what you would keep after tax” replace abstract phrases where they mean the same thing.
2. **Technical terms stay when useful.** NPS, EPF, ordinary taxable income, tax deductions, cess, STT, deductible, benchmark and percentage points remain where precision matters. Surrounding text explains the practical meaning; section numbers and detailed conditions remain in source notes.
3. **No false reassurance.** Passing the basic checks does not prove that reserves or insurance amounts are enough. A long horizon does not make losses harmless. A 0% tax bill after rebate is not necessarily a 0% slab.
4. **No added financial certainty.** Research findings remain tied to their study and period. Tax examples still exclude rebate, surcharge, exemptions, deductions, relief and crossing tax bands. The optional entered amount is not treated as income or a deduction.
5. **No universal instructions disguised as friendliness.** Debt thresholds, example allocations, cash amounts and retirement ranges stay clearly labelled as guides or examples, not rules everyone must follow. The guide’s previous “strict adherence” budgeting language was softened rather than repeated.
6. **Separate dates.** Wording was edited on 30 October 2026. Financial source-review dates remain 25 October 2026 where previously recorded. This pass is not a fresh legal or rate verification.

## One small form correction

A blank dropdown previously reached the general error handler and could send focus to the amount field. It now names and focuses the unanswered question. Valid answers, calculations and decision rules are unchanged. This is a validation/usability correction, separate from the wording edits.

## Verification

- Compared proposed outputs with production for **all 239,616 valid combinations**. Card IDs, priority/checkpoint, number of flagged gaps, source/fact references, tax calculations and numeric metrics matched.
- Checked all 38 registry entries: displayed financial figures, numeric values, statuses, financial review dates, source URLs/locators, effective periods and legal references matched production.
- Ran local unit, calculation, provenance, HTML/build and browser checks, including the clearer empty-dropdown error. Browser and visual results are recorded after the final review below.
- No fresh user-comprehension study or independent financial review was performed. Clearer wording is an editorial judgement; the report gives you the exact text to assess rather than claiming a reading score proves comprehension.

## Suggested review order

Start with the 30% known-bracket example and the “Not sure” example. Then read the cash, insurance and near-term-goal cards without following any source link: each should make sense on its own. Finally, check the Old/New Regime cards and retained technical notes for the detail an experienced reader needs.

The wording draft was held locally until approval to release. The earlier content-change report and model document retain the historical reasoning; this report is the review record for the current wording draft.

## Additional wording corrections to notice

- The term-insurance tooltip no longer implies that an active policy must equal 10–20 times income. It now asks whether cover is active and explains that the amount needed depends on the family.
- A tax-free coupon is distinguished from tax on a bond sale; a tax deduction is distinguished from a tax-free payout.
- ETF pricing copy no longer implies that looking at iNAV guarantees the eventual order price. Stock-sale wording retains the rates and conditions without implying every trade produces tax.
- The retirement explanation avoids implying that using debt investments guarantees safety.

These clarify existing limitations; they do not introduce new financial rates, new research claims or decision branches.

## Final local check results

- Passed: exhaustive comparison with production for all 239,616 valid answer combinations.
- Passed: registry comparison for all 38 entries, including figures and financial source metadata.
- Passed: local unit tests, HTML validation and production build.
- Passed: browser tests at 320, 390, 768 and 1280px, including tax-regime changes, unknown answers, validation focus, stale results, keyboard controls, source notes, no-JavaScript content and print.
- Visually checked the desktop result grid, mobile tax example and readiness cards. Detailed tax assumptions remain expandable rather than filling the main card.
- The review was completed locally before release approval. The approved footer now reads “Framework updated: 30 October 2026”; financial source dates remain separate.
