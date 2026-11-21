# Sparkfolio

![Sparkfolio cover with a red waveform and layered portfolio worksheets](assets/sparkfolio-cover.jpg)

Sparkfolio is a free investing guide for readers in India. It explains topics like emergency savings, insurance, asset allocation and taxes, with worked examples and links to sources.

[Open the guide](https://sparkience-ai.github.io/sparkfolio/) · [Try the readiness check](https://sparkience-ai.github.io/sparkfolio/#agent)

The readiness check uses your answers to flag what to look at next. For example, it can prompt you to check how long your emergency savings would last or whether you can afford a loss before a goal comes due. Tax examples show how the arithmetic works under stated assumptions. The check is educational and gives no personal investment or tax advice. Your answers stay in your browser for the session.

## Run locally

Use Node.js 24. In a checkout of this repo, run:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite and go to `/sparkfolio/`. Before opening a pull request, run `npm run check` to validate the site, decision rules, agent tools and browser interactions.

The site uses HTML, CSS and JavaScript and runs on GitHub Pages. The local MCP server, started with `npm run mcp`, gives compatible clients read-only access to the claims and readiness check. See the [MCP setup and tool reference](docs/AGENT_SURFACE.md).

## Sources and maintenance

- [Facts registry](src/data/framework-facts.json) and [review policy](docs/FACTS_GOVERNANCE.md) explain where claims come from, when they were checked and what they cover.
- [Decision engine](docs/DECISION_ENGINE_MODEL.md) explains the result cards and their assumptions.
- [Project documentation](docs/README.md) collects the release instructions, quality checks and previous content reviews.

Sparkfolio contributors maintain the guide. To report a factual correction, see [support and corrections](SUPPORT.md). For code changes, see [contributing](CONTRIBUTING.md). The project uses the [MIT License](LICENSE).
