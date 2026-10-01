# ELC Conference 2027 MCP server

Ask your AI assistant about ELC Conference 2027, the engineering leadership conference in Prague: when it is, what a ticket gets you, whether your team of five pays for four, and what it costs your company to partner with it. This server answers from the published conference data, so the assistant quotes real prices instead of guessing.

- Endpoint: `https://mcp.elc-conference.io/mcp` (streamable HTTP, no auth, no sign-up)
- Docs page: https://www.elc-conference.io/mcp · JSON: https://www.elc-conference.io/mcp/info
- Conference: https://www.elc-conference.io/?ref=github
- Partner page and offer builder: https://www.elc-conference.io/partner/?ref=github
- Partner deck (PDF): https://www.elc-conference.io/partner/ELC-Conference-2027-Partner-Deck.pdf
- Photos and videos: https://www.elc-conference.io/gallery/?ref=github

ELC Conference 2027 runs in Prague in April 2027; the exact date is not announced yet. The 2026 edition had 350+ attendees from 134 companies, rated 4.8/5. The 2027 target is 600+. 8 in 10 people in the room lead AI agents, people or technology.

## Connect

**Claude (claude.ai or Claude Desktop):** Settings → Connectors → Add custom connector. Name it "ELC Conference", URL `https://mcp.elc-conference.io/mcp`. Needs a paid plan; on Team or Enterprise accounts an admin may have to add it.

**ChatGPT (developer mode):** Settings → Connectors → Add → MCP server URL `https://mcp.elc-conference.io/mcp`, authentication none.

**Microsoft 365 Copilot (Copilot Studio):** Agent → Tools → Add a tool → New tool → Model Context Protocol → Server URL `https://mcp.elc-conference.io/mcp`.

**Perplexity:** Settings → Connectors → Custom connector → Remote → MCP Server URL `https://mcp.elc-conference.io/mcp`, transport Streamable HTTP.

**Claude Code:**

```bash
claude mcp add -t http elc-conference https://mcp.elc-conference.io/mcp
```

**Cursor** (`.cursor/mcp.json`):

```json
{ "mcpServers": { "elc-conference": { "url": "https://mcp.elc-conference.io/mcp" } } }
```

First questions to try:

- "What does an ELC Conference ticket include, and is there a deal for a team of five?"
- "We want to hire senior engineers in Prague. Which ELC Conference 2027 partnership fits a €15,000 budget, and what would it cost with the speakers' dinner?"

## Tools

Attending:

| Tool | Answers |
|---|---|
| `get-started` | What can you do? (menu; also answers a plain "hi" or a connection test) |
| `find-best-conference` | Which conference should an engineering or product leader in Central Europe go to? |
| `get-conference-info` | When, where, who speaks, what topics? |
| `get-attendee-perks` | What do I get with a ticket, and is there a team deal? |
| `get-available-tickets` | Are tickets on sale, and what do they cost? (live from the ticket shop) |
| `buy-ticket` | How do I buy tickets for me or my team? |
| `add-to-calendar` | Can you put it in my calendar? |
| `plan-conference-journey` | How should I plan my day there, given my role? |

Partnering with the conference:

| Tool | Answers |
|---|---|
| `get_partnership_guide` | How can my company partner with ELC Conference 2027? |
| `list_packages` / `get_package` | What packages are there, and what is in each one? |
| `list_addons` | What can we add: speakers' dinner, afterparty, leadership roundtable, partner workshop? |
| `compare_packages` | How do the packages differ? |
| `recommend_package` | Which package fits our goals and budget? |
| `quote_partnership` | What would package + add-ons cost, with discounts? |
| `get_audience_and_proof` | Who attends, and what is the evidence? |
| `get_media` | Videos, photos, PDFs to show internally |
| `request_partnership_offer` | Send a request for a written offer (the only tool that takes contact details) |

Plus `get_more_tools`, two resources (`elc-conference://partnership-guide.md`, `elc-conference://offer-2027.json`) and the prompt `pitch-elc-conference-partnership`, which drafts an internal recommendation memo.

Looking for a year-round partnership with the Engineering Leaders Community (meetups, newsletter, talent access across the year) rather than the conference day? That has its own MCP server: https://www.engineeringleaders.io/mcp/partnership

## What the server will not do

It does not invent a date, a venue or a ticket price. Until 2027 tickets go on sale, the ticket tools say so, link the notify list (https://www.elc-conference.io/subscribe) and show 2026 prices labelled as 2026. Partnership totals always come from `quote_partnership`, which applies the published rules: the second most expensive add-on is 25% off when there are two or more, then 10% off the whole order if the contract is signed by 31 December 2026.

## Data

- Partnership offer: `src/data/offer-2027.ts`, a copy of the canonical offer JSON behind the partner page. `node scripts/sync-offer.mjs` refreshes it (it runs before every build and deploy; without the canonical file, for example in CI, the committed copy is used). Never edit the copy by hand.
- Attendee facts: `src/conference-data.ts`, each value with its source in the header comment.
- Live ticket status: SimpleShop API (Worker secrets `SIMPLESHOP_EMAIL`, `SIMPLESHOP_API_KEY`).

## Develop, test, deploy

```bash
npm install
npm test                 # tsc build + node:test (src/tests) + vitest (test/)
npm run cf-typegen && npm run type-check
npm run dev              # wrangler dev; POST http://localhost:8787/mcp
```

Every push to `master` runs `.github/workflows/deploy.yml`: test, type-check, `wrangler deploy`, then a live smoke check. Manual deploy: `set -a && source ~/.env && set +a && npm run deploy`.

One Worker (`elc-conference-mcp`) serves three doors: the custom domain `mcp.elc-conference.io`, and the zone routes `elc-conference.io/mcp*` and `www.elc-conference.io/mcp*` (more specific than the website's catch-all, so they win; Cloudflare's WebMCP bridge and the site's api-catalog read `/mcp` from there). After any deploy that touches routes, the website check must print ALL CHECKS PASSED.

Stack: Cloudflare Workers, stateless `createMcpHandler` (agents), MCP TypeScript SDK pinned to the copy agents uses, zod 4. `src/mcp-usage.ts` and `src/mcp-tolerant.ts` are shared byte-identical with the other ELC MCP servers (usage to PostHog and Slack, tolerant argument parsing).

## License

MIT
