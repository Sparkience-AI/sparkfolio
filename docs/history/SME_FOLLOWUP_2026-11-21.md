# SME follow-up — 21 November 2026

## Scope

This pass addresses the SME's points 1, 2 and 4–9. Point 3 (the upcoming financial evidence-review cycle and suggested automation) is deliberately deferred at the owner's request. No registered financial values, financial source-review dates or decision rules are changed.

## Changes

| SME point | Result |
| --- | --- |
| 1 — Prescriptive language | Static examples no longer claim suitability from age, horizon or risk labels. Removed unsupported fund-rating shortcuts, optimum rebalancing claims and assured-income comparisons. Existing design and illustrative template percentages remain. The footer records the actual copy-update date separately from financial source dates. |
| 2 — Protect production | GitHub settings now require PRs, the GitHub Actions `check` result on an up-to-date branch, resolved conversations, and administrator enforcement. Force pushes and deletion are blocked. Zero required approving reviews avoids claiming a second maintainer exists; independent review remains part of the release process. Settings were read back after application. |
| 4 — Agent evaluations | Executable tool-contract scenarios and a provider-neutral trace verifier replace static-only evaluation definitions. Synthetic verifier fixtures are explicitly labelled; no real model or cross-provider behavior is certified. |
| 5 — MCP compatibility | Server version comes from the npm package. Initialization negotiates an explicitly supported protocol revision and validates required client fields. This is not a claim of support for every MCP revision. |
| 6 — Discovery | Added project-scoped `llms.txt` and factual educational resource/tool metadata. No root crawler policy or AI-discoverability guarantee is claimed. |
| 7 — Governance | Added MIT license, contribution, support and security guidance, and CODEOWNERS for a verified repository administrator. Existing organization guidance is linked. |
| 8 — Quality evidence | Browser artifacts request 30-day retention and release evidence 90 days. Added 200% zoom reflow approximation and forced-colors regressions, with explicit limits and a manual review checklist. |
| 9 — Release instructions | Removed redundant separate MCP test instructions; the complete check command runs the required suites. |

## Evidence limits

The trace verifier checks recorded structure and deterministic evidence; it cannot authenticate a provider run or certify semantic safety. Actual agent runs and human review are needed for those claims. Automated accessibility checks are not a screen-reader audit or native OS high-contrast/browser-zoom review. Field Core Web Vitals require meaningful real-user evidence. No such results or independent financial credentials are invented.

`main` protection is an active repository setting. The site and code changes are prepared on a feature branch for local validation and independent review. They must not be treated as deployed until a later approved merge and successful deployment.
