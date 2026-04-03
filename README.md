# ELC Conference MCP Tickets

MCP server that lets AI assistants browse and buy [ELC Conference 2026](https://elc-conference.io) tickets. The first conference in Central Europe where you can buy tickets by talking to AI.

Connect your AI assistant (Claude, ChatGPT, or any MCP-compatible client) and ask about the conference, check live ticket availability, and get a purchase link — all through natural conversation.

## What is ELC Conference?

**ELC Conference 2026** — "Silicon Valley in Central Europe" — is a one-day engineering leadership conference on **April 16, 2026** in **Prague, Czech Republic**.

- **350–400 attendees** — CTOs, VPs of Engineering, Directors, Engineering Managers, Tech Leads
- **12 main stage speakers** from Stripe, Netflix, Microsoft, Superhuman, Financial Times, Google, Meta
- **16 hands-on workshops** + 10 mentors for 1:1 sessions + afterparty
- **2025 edition:** 300+ attendees (sold out), 4.76/5 speaker rating

## Quick Start

### Remote server (recommended — no installation needed)

Add to your Claude Desktop or Claude Code config:

```json
{
  "mcpServers": {
    "elc-conference": {
      "type": "url",
      "url": "https://mcp.elc-conference.io/mcp"
    }
  }
}
```

### Local installation (npm)

```bash
npx elc-conference-mcp-tickets
```

Or add to your MCP config:

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

## Available Tools

| Tool | Description |
|------|-------------|
| `get-conference-info` | Conference details: date, venue, speakers, format, what's included |
| `get-available-tickets` | Live ticket availability and pricing from SimpleShop API |
| `buy-ticket` | Purchase URL for selected ticket type (payment in browser) |

## Example Conversation

> **You:** What's ELC Conference?
>
> **AI:** ELC Conference 2026 is a one-day engineering leadership event on April 16 in Prague. Speakers from Stripe, Netflix, Microsoft...
>
> **You:** Any tickets left?
>
> **AI:** 3rd Wave Senior Leader tickets are available at 12,973 CZK (~515 EUR). There's also 1 Senior Leader Team Pack left at 49,375 CZK...
>
> **You:** I'll take a Senior Leader ticket.
>
> **AI:** Here's your purchase link: https://form.simpleshop.cz/qGAKO/buy/

## Tech Stack

- TypeScript
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Cloudflare Workers](https://workers.cloudflare.com/) — remote hosting (Streamable HTTP transport)
- [Cloudflare Agents SDK](https://developers.cloudflare.com/agents/) — `createMcpHandler()`
- [SimpleShop.cz API](https://simpleshopcz.docs.apiary.io/) — live ticket data

## Development

```bash
npm install
npm run build        # Compile TypeScript
npm run dev          # Local dev server (wrangler dev)
npm run deploy       # Deploy to Cloudflare Workers
```

## Links

- [ELC Conference Website](https://elc-conference.io)
- [Buy Tickets Directly](https://form.simpleshop.cz/qGAKO/buy/)
- [Luma Event Page](https://luma.com/elc26)

## License

MIT
