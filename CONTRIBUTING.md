# Contributing

Sparkfolio is a static educational resource. Contributions must preserve the distinction between recorded evidence, editorial examples and personal advice. Discuss substantial features in an issue before implementation. The [organization contribution guidance](https://github.com/Sparkience-AI/.github/blob/main/CONTRIBUTING.md) also applies.

1. Branch from current `main`; use a focused pull request. Do not push changes directly to production.
2. Use Node 24 and `npm ci`, then run `npm run check`. This includes registry, calculation, decision, MCP, HTML/build and browser checks. Run additional focused checks for changed behavior.
3. Preserve CRLF formatting and the existing visual design. Keep generated evidence and personal utilities in ignored `local/`; never commit credentials or household data.
4. Update documentation when behavior, setup, privacy or limitations change. Describe material AI assistance in the pull request and remain responsible for the result.
5. Request independent review and keep required checks passing before merging. A passing test does not establish financial accuracy or full accessibility conformance.

Financial changes start in [the SSoT registry](src/data/framework-facts.json). Cite the precise primary source and passage, record scope and effective period, and use an actual source-inspection date. Do not turn a code or wording edit into a new financial verification date. Follow [facts governance](docs/FACTS_GOVERNANCE.md); keep editorial heuristics labelled and avoid product selections or personal allocations.

See [SUPPORT.md](SUPPORT.md) for corrections and [SECURITY.md](SECURITY.md) for private vulnerability reporting. Project code and documentation use the [MIT License](LICENSE); third-party font files retain their accompanying licenses in `public/fonts/`.
