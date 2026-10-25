# Sparkfolio Investment Framework

An independent educational resource for Indian readers learning about financial readiness, portfolio composition, investment risks and tax-year context.

Production: https://sparkience-ai.github.io/sparkfolio/

## Architecture

- Static HTML, custom utility CSS and vanilla JavaScript, built with Vite for `/sparkfolio/` and deployed on GitHub Pages.
- `src/decision.js` is a pure educational checkpoint evaluator. It does not allocate money or assess investment suitability.
- `src/calculations.js` contains reproducible illustrations: effective annual return converted to monthly growth, month-end deposits and annual step-ups after each completed year.
- `scripts/content.js` resolves registered claims, glossary markup, calculations, source notes and stable topic links during Vite's HTML transformation. It does not rewrite the source page during development or build.
- `src/ui.js` handles accessible form interactions, stale results, navigation, local topic search and glossary explanations.
- Fonts are self-hosted in `public/fonts/` with their original SIL Open Font Licenses. There are no remote font requests or analytics integrations.

## Develop and verify

Use Node 24, matching CI. Install with `npm ci`; the existing Puppeteer dependency installs its supported Chromium browser. If browser provisioning is unavailable locally, set `CHROME_PATH` to an already installed compatible browser executable.

```sh
npm run dev
npm test
npm run validate
npm run test:browser
npm run check
npm run preview
```

`validate` checks the decision matrix, amount validation, calculations, provenance, DOM structure, source HTML, production build and built HTML. `test:browser` tests the built site at 320, 390, 768 and 1280px and writes screenshots, a print PDF and lab timings to ignored `.audit/`. Run `validate` before browser tests to avoid testing an outdated build. `check` runs both in order. The legacy `node tests/verify_facts_coverage.cjs` entry point runs full validation.

The HTML validator configuration and all tests are versioned. Validation does not certify financial accuracy or full WCAG conformance. Source checking is an editorial task; automated tests prevent inconsistent display and invalid provenance claims.

## Content change history

See [CONTENT_CHANGES_REPORT.md](CONTENT_CHANGES_REPORT.md) for the complete session change report, and [CONTENT_CHANGES_APPENDIX.md](CONTENT_CHANGES_APPENDIX.md) for the before/after page-text comparison and all 38 registry values.

## Claims, sources and methodology

There are 38 registered claims, including legislation, research, rates, calculated illustrations and editorial heuristics. See [FACTS_GOVERNANCE.md](FACTS_GOVERNANCE.md) for statuses and review rules. A linked source does not automatically mean that a claim is verified. The 17 formerly pending entries were checked against primary sources on 25 October 2026: 25 entries are now verified within recorded scope, 10 editorial and 3 calculated. EPF uses the FY 2025–26 declared rate: the July circular reproduction was inspected and corroborated by the government broadcaster, with its hosting limitation disclosed. See [the claim audit](CLAIM_AUDIT_2026-10-25.md) for findings, conditions and evidence limits. The legacy quarter labels are historical metadata only.

The 20-year SIP example uses â‚¹20,000 monthly at 11% effective annual growth. It produces approximately â‚¹1.62 crore with fixed contributions and â‚¹3.36 crore with a 10% annual contribution increase, before fees, tax and inflation. These are constant-return models, not forecasts. Readiness checkpoints and allocation examples are editorial educational illustrations, not personal financial advice.

## Release checks

Pull requests run validation and browser checks. A push to `main` deploys only after those checks pass. CI stores browser evidence separately from the Pages artifact. No backend, chat widget, accounts, portfolio uploads or analytics are included.

The canonical URL and sitemap remain under `/sparkfolio/`. A robots file at that subpath does not control the domain; root-level crawler policy belongs to the GitHub Pages host. Search Console submission and field Core Web Vitals require owner access and are not performed by the build.

## Working conventions

Keep edits focused and preserve existing CRLF line endings. Retain the regulatory and educational notice and illustrative-scheme qualifiers. `main` is the production branch; `pre-ssot-spans` is a historical rollback reference. The existing `feat/ssot-facts-registry` branch can be synchronized only as part of an explicitly authorized release. Local implementation does not push or deploy automatically.

## Publisher, corrections and privacy

Sparkfolio is the editorial identity; no professional credentials, institutional endorsement or external expert review are claimed. Report corrections at https://github.com/Sparkience-AI/sparkfolio/issues with the topic and evidence, without private financial information.

Answers, amounts and search terms remain in browser memory. Sparkfolio does not transmit or persist them. GitHub Pages processes hosting requests under its own policies, and external destinations have separate policies. There are no affiliate or paid-placement integrations in this release.

## Educational notice

Sparkfolio and its authors are not registered with SEBI as an Investment Adviser, Research Analyst, Portfolio Manager or Broker-Dealer. Content is for financial literacy and does not constitute financial, investment, insurance, legal or tax advice. Investments may lose value; consult qualified professionals about personal decisions. No disclaimer is represented as a legal exemption or safe harbor.

License: MIT (third-party font files retain their accompanying licenses).
