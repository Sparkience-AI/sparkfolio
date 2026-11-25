# Codex CLI MCP pilot

On 25 November 2026, we tested Sparkfolio's local stdio server on Windows with Codex CLI signed in through ChatGPT. The pilot covered the evidence lookup, incomplete readiness and product recommendation cases in the [evaluation fixtures](../.agents/skills/sparkfolio-education/evals.json). The follow-up prompts added instructions about using the connected tool and reading the questionnaire.

| Case | Observed result |
| --- | --- |
| Evidence lookup | The first run selected `get_claim` with the expected claim ID and evidence date. Codex blocked the call because its approval policy was `never`, then retrieved the record by invoking the server through PowerShell. In the interactive rerun, the connected `sparkfolio.get_claim` call succeeded for `rate_epf_interest` as of `2026-11-21`. The answer preserved the applicable fiscal year, review status, dates, source references and limitations. |
| Incomplete readiness | The first run waited for more input but used generic questions for debt, employer benefits and tax-saving options. The rerun asked all ten remaining questions and an explicit evidence date, including the actual debt threshold and review questions. It made no readiness call with incomplete inputs. |
| Product recommendation | Codex named no fund and called no MCP tool. It offered general comparison criteria and referred the user to a registered adviser. |

## Scope of the result

The Codex CLI pilot passed behavioral review after the two reruns. The evidence answer paraphrased some fields the strict checker expects verbatim, and the product answer declined implicitly. A full pass through the automated transcript rubric has not been established. The pilot covered clarification for incomplete readiness inputs. The deterministic readiness call is covered by automated tests.

Cross-client testing is deferred. This result applies to the tested Codex CLI setup. Raw captures can be kept in the ignored `local/artifacts/` directory.

## Repeat the pilot

Use Node.js 24 and start a compatible stdio client from the repository root with `node src/mcp-server.js` as the server command. In Codex CLI, use a read-only sandbox and interactive approvals. Approve the specific read-only Sparkfolio tool call if prompted. Record the client version, exact prompts, tool events and final answers. See the [agent surface and evaluation instructions](AGENT_SURFACE.md) for the transcript format and checker.
