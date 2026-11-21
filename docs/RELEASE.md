# Release and rollback

Sparkfolio releases are static-site artifacts, not desktop installers. A release candidate must pass `npm ci` and `npm run check` on Node 24 before the organization release-evidence workflow builds the site again from the locked dependency graph. The check command includes MCP tests; a second invocation is unnecessary.

The evidence workflow produces:

- SHA-256 hashes for every built site file;
- a release manifest recording runtime, commit and artifact sizes; and
- a CycloneDX SBOM generated from the locked npm dependency graph.

The release-candidate workflow validates package, lockfile, expected-version, and tag identity; uploads the site and evidence; and creates GitHub provenance and SBOM attestations. It does not publish a GitHub release. The existing Pages workflow remains the deployment authority for `main`.

Rollback uses the last known-good verified commit or Pages artifact. Revert the faulty commit through a pull request, rerun the complete gate, and confirm the canonical page, topic links, decision review, no-JavaScript content and privacy boundary. Never repair production by editing generated `dist/` files.

The browser evidence workflow requests 30-day retention, and release candidates request 90 days, subject to organization/repository caps. See [quality evidence](QUALITY.md) for what the checks establish and which manual reviews remain.

## Production branch controls

The `main` branch requires a pull request and the GitHub Actions `check` status on a branch current with production. Administrator enforcement is enabled, force pushes and branch deletion are blocked, and review conversations must be resolved. Required approving reviews remain zero while there is a single maintainer; independent review is part of the release process, not a claimed mandatory human approval. `CODEOWNERS` routes reviews to the verified repository administrator and does not itself enforce approval. These are GitHub settings, not guarantees supplied by a tracked file; recheck them when permissions or repository policy change.
