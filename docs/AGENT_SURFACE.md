# Agent surface

Sparkfolio exposes a local, read-only MCP server and a repo-scoped educational skill. Neither component changes the website, accesses accounts, browses, transmits data, or provides personalized financial advice.

## Start the server

After `npm ci`, run `npm run mcp`. The server uses newline-delimited JSON-RPC over standard input/output and writes no logs to standard output. It exposes:

- `list_claims`: bounded discovery of registered evidence and review status;
- `get_claim`: one claim with its effective period, assumptions and source locators; and
- `review_readiness`: the existing deterministic educational review from complete explicit answers and an explicit `as_of` evidence date.

The skill is at `.agents/skills/sparkfolio-education/`. Its routing and negative cases are recorded in `evals.json`.

## Boundaries

- No tool selects products, securities, tax regimes or allocations.
- No filesystem path, URL, shell command, free-form code or network target is accepted.
- No answer is inferred. The deterministic review rejects incomplete or invalid inputs.
- Evidence status is computed for the requested `as_of` date; readiness reviews require this date so identical requests remain reproducible and stale evidence is not silently described as current.
- A date before a claim's recorded source review returns `needs_review`, while preserving its recorded status. Review status does not establish legal or rate applicability on that date; the effective period and conditions must be checked separately. Editorial and calculated entries without source-review dates retain their distinct classifications.
- Readiness responses include the model's tax year, review dates, sources and timing status. A date before the model review or after its next review date produces a top-level warning; the returned examples remain explicitly tied to the recorded tax year.
- Tool arguments are validated at runtime, including unknown fields, complete answer choices and amount type/length. Malformed protocol messages return errors without stopping the server; valid notifications produce no response.
- The optional amount is display context only. It is never allocated or treated as income or a deduction.
