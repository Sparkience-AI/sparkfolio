# Threat model

## Protected properties

Sparkfolio must preserve the integrity and provenance of its facts registry, keep the decision engine deterministic, avoid collecting household data, and prevent educational output from being presented as personalized advice.

## Trust boundaries

The public site is static. Browser answers remain in memory. The local MCP process reads only versioned in-package data and accepts typed JSON values through standard input. It has no network, account, credential, write, browsing or arbitrary-file tool.

## Threats and controls

| Threat | Control | Evidence |
| --- | --- | --- |
| Prompt requests trades or allocations | Skill negative-routing boundary and non-advisory tool descriptions | Skill eval cases and MCP tests |
| Fabricated or stale evidence | Registry validation, explicit effective period and date-derived status | `npm run validate`, `get_claim` tests |
| Tool/path injection | MCP schemas expose no path, URL, shell or code arguments | Tool-list contract test |
| Incomplete answers produce plausible output | Decision engine validates every enumerated answer | Exhaustive unit suite and MCP negative test |
| Private answers leak to a provider | No provider client or network capability exists | Dependency and server inspection |
| Protocol garbage corrupts the process | Parse errors are bounded JSON-RPC errors; no stack traces on stdout | stdio integration test |

Residual risks include incorrect source material, legal or rate changes after a review date, and users ignoring the educational notice. Automated validation does not replace independent financial, legal, accessibility or security review.
