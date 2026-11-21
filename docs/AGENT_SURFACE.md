# Agent surface

Sparkfolio exposes a local, read-only MCP server and a repo-scoped educational skill. Neither component changes the website, accesses accounts, browses, transmits data, or provides personalized financial advice.

## Start the server

After `npm ci`, run `npm run mcp`. The server uses newline-delimited JSON-RPC over standard input/output and writes no logs to standard output. It exposes:

- `list_claims`: bounded discovery of registered evidence and review status;
- `get_claim`: one claim with its effective period, assumptions and source locators; and
- `review_readiness`: the existing deterministic educational review from complete explicit answers and an explicit `as_of` evidence date.

The skill is at `.agents/skills/sparkfolio-education/`. Its routing and negative cases are recorded in `evals.json`.

## Protocol compatibility

This is a local stdio implementation of the **2025-06-18** MCP revision. `initialize` validates the client's protocol version, capability object and implementation name/version. A supported proposal is returned unchanged; an unsupported proposal receives the supported revision so the client can continue only if it supports that revision. The server version comes from `package.json`.

This follows the [2025-06-18 lifecycle negotiation rules](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle). No support for the different 2026-07-28 per-request protocol, HTTP transport or full third-party conformance certification is claimed. Tests cover initialization parameter errors, fallback negotiation, package identity, declared capabilities, initialized notification, tool discovery and malformed-message recovery.

## Executable evaluation and real agent runs

`tests/agent-evals.test.js` executes the cases against real deterministic tools and tests an offline trace verifier. It covers unknown claims, incomplete inputs, historical/expired evidence, unsupported action tools and injected arguments. These tests **do not run a language model** or prove that an agent will select the correct tool, refuse a request or write a faithful explanation.

For a real agent evaluation, give a capable client the skill, the MCP tools and an exact case prompt from `evals.json`. For the readiness case also supply its `arguments` as explicit user input. Export its actual chronological transcript to an ignored file such as `local/artifacts/agent-trace.json`:

```json
{
  "case_id": "evidence",
  "agent": { "provider": "actual provider", "model": "actual model", "run_id": "actual run identifier" },
  "events": [
    { "type": "user", "text": "Exact case prompt" },
    { "type": "tool_call", "id": "call-1", "name": "get_claim", "arguments": { "id": "rate_epf_interest", "as_of": "2026-11-21" } },
    { "type": "tool_result", "id": "call-1", "result": {} },
    { "type": "assistant", "text": "Actual complete answer" }
  ]
}
```

The example is a format sketch, not passing evidence: replace the prompt, result and response with the unedited run. Readiness user events also require `input` equal to the explicit scenario arguments. Run `node scripts/evaluate-agent-trace.js local/artifacts/agent-trace.json`. It checks tool selection/order, explicit arguments, exact deterministic results, claim classification, recorded/effective statuses, evidence timing, review dates, effective periods, conditions, source URLs/locators, model timing, warnings, limits and readiness card order. Errors use `error` with the tool's exact error message instead of `result`. Preserve source details verbatim in a compact evidence block alongside any plain-language explanation to satisfy this strict rubric.

Run the same cases on each provider/client being assessed and record the model/version and original transcript. The checker neither calls a provider nor authenticates a submitted transcript. Its refusal-pattern checks cannot detect every unsafe or contradictory sentence; a person must review the complete answer for invented claims, recommendations, injection compliance and readable explanations. Synthetic traces in unit tests validate the checker only. No cross-provider behavioural success is claimed until real runs and human review have occurred.

## Boundaries

- No tool selects products, securities, tax regimes or allocations.
- No filesystem path, URL, shell command, free-form code or network target is accepted.
- No answer is inferred. The deterministic review rejects incomplete or invalid inputs.
- Evidence status is computed for the requested `as_of` date; readiness reviews require this date so identical requests remain reproducible and stale evidence is not silently described as current.
- A date before a claim's recorded source review returns `needs_review`, while preserving its recorded status. Review status does not establish legal or rate applicability on that date; the effective period and conditions must be checked separately. Editorial and calculated entries without source-review dates retain their distinct classifications.
- Readiness responses include the model's tax year, review dates, sources and timing status. A date before the model review or after its next review date produces a top-level warning; the returned examples remain explicitly tied to the recorded tax year.
- Tool arguments are validated at runtime, including unknown fields, complete answer choices and amount type/length. Malformed protocol messages return errors without stopping the server; valid notifications produce no response.
- The optional amount is display context only. It is never allocated or treated as income or a deduction.
