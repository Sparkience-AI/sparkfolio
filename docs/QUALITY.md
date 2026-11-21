# Quality evidence and limits

## Automated release evidence

`npm run check` covers the decision matrix, amount validation, calculations, registry provenance, MCP contract, source/built HTML and browser regressions. Browser checks exercise keyboard interactions, four viewport widths, a 200% browser-zoom reflow approximation, forced-colors emulation, no-JavaScript reading, reduced motion and print. These checks are regression evidence, not WCAG certification.

The zoom check halves the CSS viewport at unchanged physical dimensions and increases device scale, representing the reflow dimensions of 200% zoom. It does not substitute for testing an actual browser zoom control. Forced-colors emulation checks selected controls and content; it is not a complete Windows High Contrast review.

Browser artifacts are requested for 30 days; release-candidate evidence is requested for 90 days. Hosting limits can shorten effective retention, and new settings do not restore expired artifacts. Keep evidence tied to its commit and workflow run. See [GitHub retention guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository).

## Manual review still required

No full manual keyboard, screen-reader, native browser zoom or operating-system high-contrast review is claimed by the automated suite. Record actual results with commit, date, reviewer, browser/OS and assistive-technology versions before marking a manual review complete.

For the next manual accessibility review:

- Complete the engine using only Tab, Shift+Tab, arrows, Space/Enter and Escape. Check focus order, visibility and return after dismissal.
- With a screen reader, check headings/landmarks, control labels/groups, validation errors, stale-result messages and result announcements. Read source notes and glossary explanations.
- At actual 200% browser zoom, check navigation, accordions, forms and results for clipping or lost actions. Repeat with the operating system's high-contrast theme.
- Record problems, reproducible steps and fixes, including any combinations not tested. Do not infer completion from a screenshot or a DOM attribute alone.

## Performance and independent review

`local/artifacts/performance.json` records controlled lab timings. It does not supply field INP or the 75th-percentile Core Web Vitals for real readers. Field targets remain LCP ≤2.5 seconds, INP ≤200 milliseconds and CLS ≤0.1 when meaningful field data becomes available. See [Core Web Vitals](https://web.dev/articles/vitals). No analytics installation is required or implied.

Request independent source/content review for material financial wording or rule changes, and an independent code review before release. Record scope and unresolved limits; no external expert endorsement is implied. This quality pass does not advance financial source-review dates or alter their scheduled review cycle.
