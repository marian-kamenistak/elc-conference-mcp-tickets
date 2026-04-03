# Implementation Guide

## Tech Stack

- TypeScript
- `@modelcontextprotocol/sdk` — MCP server framework
- Cloudflare Workers — hosting (Streamable HTTP transport)
- `agents` (Cloudflare Agents SDK) — `createMcpHandler()` for stateless MCP over HTTP
- SimpleShop.cz API v2 (`https://api.simpleshop.cz/2.0/`) — ticket data
- Also published as npm package `elc-conference-mcp-tickets` (stdio fallback for local use)

## Project Structure

```
src/
  worker.ts              — Cloudflare Worker entry point (routes /mcp, /llms.txt, /)
  server.ts              — MCP server factory (creates McpServer, registers tools)
  conference-data.ts     — Static conference data (speakers, venue, dates)
  simpleshop-client.ts   — SimpleShop API client (HTTP Basic auth)
  llms-txt.ts            — llms.txt content served by the Worker
  types.ts               — Shared TypeScript types
  tools/
    get-conference-info.ts    — Returns static conference details
    get-available-tickets.ts  — Fetches live pricing from SimpleShop API
    buy-ticket.ts             — Returns purchase URL with optional discount code
  tests/
    conference-info.test.ts
    available-tickets.test.ts
    buy-ticket.test.ts
    server.test.ts
    simpleshop-client.test.ts
```

## SimpleShop API

- **Base URL:** `https://api.simpleshop.cz/2.0/`
- **Auth:** HTTP Basic (email + API key)
- **Key endpoints:**
  - `GET /product/` — list all products (tickets)
  - `GET /product/{id}/` — single product details
  - `GET /invoice/` — search invoices
  - `POST /invoice/{id}/paid` — mark as paid
- **Docs:** https://simpleshopcz.docs.apiary.io/
- **Buy form:** https://form.simpleshop.cz/qGAKO/buy/

## MCP Tools

### `get-conference-info`
Returns static conference details: date, venue, description, speakers, what's included.
No API call needed — hardcoded from `conference-data.ts`.

### `get-available-tickets`
Calls SimpleShop API to get live ticket availability and pricing.
Returns: ticket name, price (CZK + EUR), remaining count, status (available/sold out).
Falls back to static data if API credentials are not configured.

### `buy-ticket`
Returns the purchase URL for the selected ticket type.
Includes discount code if configured via `DISCOUNT_CODE` env var.
Payment happens in browser (PCI compliance — cannot process payments via MCP).

### Tool Safety Annotations

All tools have `ToolAnnotations` (required by Anthropic Connectors Directory):

| Tool | readOnlyHint | destructiveHint | idempotentHint | openWorldHint |
|------|-------------|----------------|---------------|---------------|
| `get-conference-info` | true | false | true | false |
| `get-available-tickets` | true | false | true | true (calls SimpleShop API) |
| `buy-ticket` | true | false | true | false (returns URL only) |

## Worker Endpoints

| Path | Method | Description |
|------|--------|-------------|
| `/mcp` | POST | MCP Streamable HTTP endpoint |
| `/llms.txt` | GET | AI discoverability file |
| `/.well-known/llms.txt` | GET | AI discoverability file (alternate path) |
| `/` | GET | Health check / server info JSON |

## Configuration

### Remote server (Cloudflare Workers — recommended)

```json
{
  "mcpServers": {
    "elc-conference": {
      "type": "url",
      "url": "https://elc-conference-mcp.your-domain.workers.dev/mcp"
    }
  }
}
```

### Local fallback (npm/stdio)

```json
{
  "mcpServers": {
    "elc-conference": {
      "command": "npx",
      "args": ["elc-conference-mcp-tickets"]
    }
  }
}
```

## Environment Variables

Configured as Cloudflare Worker secrets (via `wrangler secret put`):

- `SIMPLESHOP_EMAIL` — SimpleShop login email
- `SIMPLESHOP_API_KEY` — API key from SimpleShop settings
- `DISCOUNT_CODE` — Optional discount code for MCP buyers

## Build & Dev

```bash
npm install            # Install dependencies
npm run build          # Compile TypeScript
npm run dev            # Local dev server (wrangler dev)
npm run test           # Run tests
npm run deploy         # Deploy to Cloudflare Workers
```

## Architecture Decisions

- **Streamable HTTP (not SSE):** SSE transport is deprecated. Streamable HTTP (POST `/mcp`) is the current MCP standard for remote servers.
- **Stateless:** Each request creates a fresh server instance via `createMcpHandler()`. No Durable Objects needed — our tools are simple request/response with no session state.
- **Static fallback:** If SimpleShop API credentials are not configured, `get-available-tickets` returns cached static data rather than failing.
- **No payment processing:** `buy-ticket` only returns a URL. Payment happens in the user's browser for PCI compliance.

## Updating Conference Data

When ticket availability or speaker list changes:
1. Update `src/conference-data.ts`
2. Update `src/llms-txt.ts` (Worker-served llms.txt)
3. Update `llms.txt` (static file in repo root)
4. Update the "Current Ticket Availability" table in `CLAUDE.md`
5. `wrangler deploy`
