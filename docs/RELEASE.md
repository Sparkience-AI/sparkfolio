# Release and rollback

Sparkfolio releases are static-site artifacts, not desktop installers. A release candidate must pass `npm ci`, `npm run check`, `npm run test:mcp`, and `npm run release:evidence` on Node 24.

The evidence command produces:

- SHA-256 hashes for every built site file;
- a release manifest recording runtime, commit and artifact sizes; and
- a CycloneDX SBOM generated from the locked npm dependency graph.

The release-candidate workflow uploads the site and evidence and creates GitHub provenance and SBOM attestations. It does not publish a GitHub release. The existing Pages workflow remains the deployment authority for `main`.

Rollback uses the last known-good verified commit or Pages artifact. Revert the faulty commit through a pull request, rerun the complete gate, and confirm the canonical page, topic links, decision review, no-JavaScript content and privacy boundary. Never repair production by editing generated `dist/` files.
