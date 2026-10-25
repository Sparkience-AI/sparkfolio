# Sparkfolio claims and evidence governance

## One source, distinct kinds of assurance

The 38 entries in `src/data/framework-facts.json` distinguish `law`, `rate`, `research`, `calculation` and `editorial` claims. Registry coverage does not verify a financial or legal claim. The public source notes expose the value, provenance, effective period, assumptions and review status of each entry.

The JSON retains L1/L2/L3 groups for compatibility. Those groups describe editorial review queues; they do not imply that a rate such as EPF is legally set quarterly. EPF declarations apply by financial year.

## Status rules

- `verified`: an actual source check supports the limited statement and effective period recorded. Requires a real ISO review date. Never infer verification from an authority name or a URL.
- `needs_review`: retained as a conditional legacy reference or awaiting a specific provision, current notification or legal mapping. No verification date is claimed.
- `editorial`: a Sparkfolio illustration or heuristic, not a statutory rule or externally established numerical requirement.
- `calculated`: reproducible arithmetic with explicit assumptions, not a verified forecast or legal conclusion. Legal inputs can themselves remain under review.

Historical `2026-Q4` labels live in `legacy_verification_label`, not `reviewed_on`. They are not converted into precise review dates. Entries with a passed `review_due` date display as needing review both in the built page and dynamic source notes. Review queues are end-of-quarter for L3 and post-Budget for L2; a future law or notification may require earlier review. No scheduled automation is configured.

Every entry requires `claim_type`, `review_status`, `reviewed_on`, `effective_period`, `assumptions` and sources with `title`, `url` and a passage locator. Numeric inputs are separate where used. Unknown markers, duplicate IDs, missing provenance and fabricated verification dates fail validation.

## Rendering and calculations

Vite's `transformIndexHtml` uses `scripts/content.js` to render tagged passages, calculation outputs, topic IDs, links and source notes. Text is escaped and known glossary terms are enhanced safely; nested markup never causes a registered passage to be silently skipped. Raw HTML fallbacks are retained for readability; the production build resolves authoritative registry values before delivery. The transform does not write back to `index.html`.

Decision results are plain DOM text from `src/decision.js`. Any linked registry values use the same JSON and review-status function as the build. There is no separate FAQ-content copy or JSON-LD updater. Metadata describes an educational WebPage and its publisher.

Projection convention: effective annual return converted to monthly rate `(1 + annualReturn) ** (1/12) - 1`; deposits at month-end; contribution increases after every 12 deposits. The 20-year illustration excludes fees, tax and inflation. It is tested against independently calculated expected values.

## Audit record: 25 October 2026

All 38 entries were classified and reviewed for scope. Source-checked entries are limited to the provider listing, court decision, circular, tax mapping or research result actually inspected. No blanket current-law verification is claimed.

- PPF and SSY: provider listing checked; confirm the applicable quarterly notification before use.
- EPF: the 1 July 2026 circular declares 8.25% for FY 2025–26, following Ministry approval dated 17 June. A third-party-hosted reproduction was visually inspected and corroborated with Akashvani’s government news report; unsuccessful EPFO-host retrieval is disclosed. No FY 2026–27 rate is asserted.
- Life Cycle Funds: the February 2026 category circular does not prescribe every individual's allocation.
- SPIVA: the inspected Mid-Year 2026 page reports 74% ten-year large-cap underperformance; category and period are explicit.
- Vanguard: the 2023 available-lump-sum comparison is distinct from salary-funded monthly SIPs.
- Shakti Yezdani: scope is shares/securities under the provisions considered; no universal statement about every nominee or asset.
- Tax follow-up: all 17 formerly pending entries were confirmed, corrected or narrowed against primary sources. The current Act as amended by Finance Act 2026 provides the checked statutory mappings and conditions. See [the full claim audit](CLAIM_AUDIT_2026-10-25.md).
- SGB: the official consolidated Act supplies enacted section 70(1)(x), including the Finance Act 2026 amendment. The individual must hold from original issue until maturity for the exclusion. No uniform tax rate is asserted for all other SGB receipts. Separate Gazette retrieval was unsuccessful; consolidated-law inspection is the evidence used.
- Withdrawal rates, cash buffers, cover amounts, debt screens, rebalancing bands and exit intervals are editorial illustrations with limits, not universal mandates.
- Unregistered property-price forecasts, drawdown claims, star-rating shortcuts and unsupported retirement-income comparisons were removed or replaced with qualified explanations.

Each entry's full audit trail is in the registry and public source notes. No named expert review is claimed. Corrections use the public repository issue channel; private household information must not be included.

## Required checks

`npm run check` runs unit/decision/calculation/provenance tests, DOM checks, source and built HTML validation, production build and browser regressions. CI blocks deployment on failure. Browser checks include mobile reflow, keyboard controls, amount errors, stale results, topic filtering, fragments, glossary dismissal, no-JavaScript reading, reduced motion, print and absence of third-party requests.

`.audit/performance.json` is a local lab baseline, not 75th-percentile field Core Web Vitals. Field targets are LCP <= 2.5 s, INP <= 200 ms and CLS <= 0.1, evaluated with real-user data when available. Search Console submission and production smoke checks require a release and owner access; they are not fabricated by local tests.

## Follow-up audit closure

The SSoT now records 25 verified entries, 10 editorial entries and 3 calculated illustrations. All 17 original pending entries have dated source inspection, provision locators, verification scope and conditions. Verified means the specific recorded statement is supported. EPF’s original circular was inspected as a third-party-hosted reproduction and corroborated by the government broadcaster; its hosting limitation remains explicit. See `CLAIM_AUDIT_2026-10-25.md`.

## Independent decision-model data

`_decision_model` is the shared source for tax-year context, valid marginal brackets, cess, a fixed illustrative interest amount, model assumptions, question labels and primary source references. It is configuration alongside the existing 38 registered claims, not an extra set of verified claims. See `DECISION_ENGINE_MODEL.md` for all 18 card families and exhaustive coverage of 239,616 valid answer combinations. Horizon bins, ordering and loss-capacity interpretation remain bounded editorial rules. Never infer a personal tax bill, deduction entitlement or optimal regime from a bracket alone.
