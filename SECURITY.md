# Security policy

Security fixes target the current `main` branch. There is no separate supported backport series or guaranteed response time.

Do not publish exploit details, credentials or household information in an issue. Use [Report a vulnerability](https://github.com/Sparkience-AI/sparkfolio/security/advisories/new) when GitHub offers that option. Its availability depends on repository settings; a private channel is not promised by this document.

If private reporting is unavailable, follow the [organization security policy](https://github.com/Sparkience-AI/.github/blob/main/SECURITY.md): open a minimal issue titled `Private security contact requested`, mention `@Nitin-Sagar-B`, and include only the repository name and a safe impact category. Wait for a private channel before sharing reproduction details. Do not post secrets or proof-of-concept payloads.

Once a private channel exists, include the affected commit, expected and observed behavior, impact and a minimal reproduction using test data. Do not access other people's data or disrupt hosting. Ordinary factual corrections belong in [SUPPORT.md](SUPPORT.md).

Sparkfolio is a static educational site with a local read-only MCP process. See [the threat model](docs/THREAT_MODEL.md) for boundaries and residual risks.
