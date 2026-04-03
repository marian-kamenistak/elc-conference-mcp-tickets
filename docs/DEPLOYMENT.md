# Deployment Guide

## Cloudflare Workers (primary)

### Prerequisites

1. Cloudflare account (free tier is sufficient)
2. `wrangler` CLI installed: `npm install -g wrangler`
3. Logged in: `wrangler login`

### Project setup

`wrangler.toml` in project root:

```toml
name = "elc-conference-mcp"
main = "src/worker.ts"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
```

### Worker entry point

The worker (`src/worker.ts`) uses Cloudflare's `createMcpHandler()` to serve the MCP server over Streamable HTTP transport on a single `/mcp` endpoint.

Key architecture:
- **Transport:** Streamable HTTP (POST `/mcp`) — the current MCP standard for remote servers. SSE is deprecated.
- **Stateless:** Each request creates a fresh server instance via `createMcpHandler()`. No Durable Objects needed — our tools are simple request/response with no session state.
- **Secrets:** SimpleShop credentials and discount code are stored as Worker secrets, accessed via `env` bindings.

### Set secrets

```bash
wrangler secret put SIMPLESHOP_EMAIL
wrangler secret put SIMPLESHOP_API_KEY
wrangler secret put DISCOUNT_CODE     # optional
```

### Local development

```bash
wrangler dev
# Server runs at http://localhost:8787/mcp
```

Test with Claude Code by pointing to local URL:
```json
{
  "mcpServers": {
    "elc-conference": {
      "type": "url",
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

### Deploy to production

```bash
wrangler deploy
# Deploys to https://elc-conference-mcp.<your-subdomain>.workers.dev
```

The MCP endpoint will be at: `https://elc-conference-mcp.<your-subdomain>.workers.dev/mcp`

### Custom domain (optional)

1. Add a custom domain in Cloudflare dashboard → Workers → your worker → Settings → Domains
2. e.g., `mcp.elc-conference.io` → endpoint becomes `https://mcp.elc-conference.io/mcp`

### Verify deployment

```bash
curl -X POST https://elc-conference-mcp.<your-subdomain>.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Should return the three tool definitions.

### End-user setup

Users add one line to their Claude config — no installation, no npm, no API keys:

```json
{
  "mcpServers": {
    "elc-conference": {
      "type": "url",
      "url": "https://elc-conference-mcp.<your-subdomain>.workers.dev/mcp"
    }
  }
}
```

## npm Package (secondary distribution)

For users who prefer local/stdio:

```bash
npm version patch
npm run build
npm publish
```

Users install with:
```bash
npx elc-conference-mcp-tickets
```

## Deployment Checklist

- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm run test`
- [ ] Secrets configured: `SIMPLESHOP_EMAIL`, `SIMPLESHOP_API_KEY`, `DISCOUNT_CODE`
- [ ] Deploy: `wrangler deploy`
- [ ] Verify: `curl -X POST <url>/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`
- [ ] Custom domain set (optional): `mcp.elc-conference.io`
- [ ] npm published (optional): `npm publish`
