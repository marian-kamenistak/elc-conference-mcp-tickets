# ELC Conference MCP Tickets Server

MCP server that lets Claude users browse and buy ELC Conference tickets via SimpleShop.cz.

## Goal

Build and deploy a simple MCP server that helps people buy tickets for the ELC Conference (https://elc-conference.io/). The purchase experience must be as seamless as possible — minimal friction, minimal steps, guide the user straight to buying.

## What This Is

A remote MCP server deployed on Cloudflare Workers. Users point their Claude config at the URL and can:
1. Ask about the conference (date, venue, speakers, what to expect)
2. See available tickets with live pricing and availability from SimpleShop API
3. Get a purchase link (with optional discount code for MCP buyers)

No local installation needed — users just add the remote URL to their MCP config.

## Tech Stack

- TypeScript
- `@modelcontextprotocol/sdk` — MCP server framework
- Cloudflare Workers — hosting (Streamable HTTP transport)
- `agents` (Cloudflare Agents SDK) — `createMcpHandler()` for stateless MCP over HTTP
- SimpleShop.cz API v2 (`https://api.simpleshop.cz/2.0/`) — ticket data
- Also published as npm package `elc-conference-mcp-tickets` (stdio fallback for local use)

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
No API call needed — hardcoded from conference data.

### `get-available-tickets`
Calls SimpleShop API to get live ticket availability and pricing.
Returns: ticket name, price (CZK + EUR), remaining count, status (available/sold out).

### `buy-ticket`
Returns the purchase URL for the selected ticket type.
Includes discount code if configured.
Payment happens in browser (PCI compliance — cannot process payments via MCP).

## Configuration

### Remote server (Cloudflare Workers — recommended)

Users add the remote URL to their Claude Desktop or Claude Code config:

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

No installation, no API keys, no npm — just a URL. The server handles everything.

### Local fallback (npm/stdio)

For offline use or development:

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

## Conference Data (update before each event)

- **Event:** ELC Conference 2026
- **Date:** April 16, 2026, 9:00 AM – 9:00 PM CEST
- **Venue:** CSOB SHQ (Centrala CSOB), Vymolova 353, 150 00 Praha 5, Czech Republic
- **Transit:** Metro Line B, Bus 118/125/153/196/231/232/271/904, Tram 7
- **Website:** https://elc-conference.io
- **Luma:** https://luma.com/elc26
- **Tickets:** https://form.simpleshop.cz/qGAKO/buy/
- **Capacity:** 350–400
- **Format:** 12 main stage speakers, 16 hands-on workshops, 10 mentors for 1:1 sessions, afterparty
- **Tagline:** "Silicon Valley in Central Europe"
- **Audience:** CTOs, VPs of Engineering, Directors, Engineering Managers, Product Managers, Tech Leads

### Confirmed Speakers (2026)

| Name | Title | Company |
|------|-------|---------|
| Aleodor Tabarcea | Engineering Manager | Stripe |
| Michal Matyjek | Sr. Engineering Manager | Netflix |
| Carol Palombini | Tech Leadership Coach & Consultant | Independent |
| Rizwan Iqbal | Director of Engineering | Superhuman |
| Vojta Vondra | Partner Director of Engineering | Microsoft |
| Tatiana Stantonian | Principal Engineer | Financial Times |
| Jan Zenisek | VP of Product | Apify |
| Tomas Rehor | Head of Engineering | Aisle |
| TBA | — | Google |
| TBA | — | Meta |

### Topics / Themes
1. DevEx, platform engineering, and AI adoption in production
2. Architecture decisions at scale
3. Product-engineering alignment

### Current Ticket Availability

| Tier | Price (CZK) | ~EUR | Status |
|------|-------------|------|--------|
| 1st Wave – Early Adopter | 9,875 | ~390 | Sold out |
| 2nd Wave – The Leader | 12,973 | ~515 | Sold out |
| 3rd Wave – Senior Leader | 12,973 | ~515 | 16 remaining |
| 1st Wave – Early Team Pack (4+1) | 41,625 | ~1,650 | Sold out |
| 2nd Wave – Leader Team Pack (4+1) | 49,375 | ~1,960 | Sold out |
| 3rd Wave – Senior Leader Team Pack (4+1) | 49,375 | ~1,960 | 1 remaining |

### What's Included
Full access to: main stage talks, 16 hands-on workshops, 1:1 mentoring sessions, experience zone, afterparty, networking. All tiers grant the same access — only timing/price differs.

### 2025 Edition (for context)
- 300+ attendees (sold out)
- Speaker rating: 4.76/5
- 4 tracks: Personal Growth & Leadership, Team Building & Culture, Crisis/Risk/Resilience, Tech Strategy & Innovation
- Companies: SpaceX, Netflix, Pure Storage, Ataccama, Dynatrace, Rossum, Better Stack, incident.io, Make, Rohlik Group

## Build & Dev

```bash
npm run build        # Compile TypeScript
npm run dev          # Local dev server (wrangler dev)
npm run deploy       # Deploy to Cloudflare Workers
npm publish          # Publish npm package (stdio fallback)
```

## Deployment (Cloudflare Workers)

### Prerequisites

1. Cloudflare account (free tier is sufficient)
2. `wrangler` CLI installed: `npm install -g wrangler`
3. Logged in: `wrangler login`

### Project setup

Create `wrangler.toml` in project root:

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

### Updating conference data

When ticket availability or speaker list changes:
1. Update `src/conference-data.ts`
2. Update the "Current Ticket Availability" table in this CLAUDE.md
3. `wrangler deploy`

No npm publish needed for the remote server — just redeploy.

### npm package (secondary distribution)

For users who prefer local/stdio:
```bash
npm version patch
npm run build
npm publish
```

## SEO & AI Search Optimization

The goal is to make the conference and this MCP server discoverable by both traditional search engines and AI assistants (ChatGPT, Perplexity, Claude, Google AI Overviews).

### MCP Server Registry Distribution

Register the MCP server across all major directories. Full step-by-step: `REGISTRATION_CHECKLIST.md`.

**Tier 1 (must do):**
- **Official MCP Registry** (registry.modelcontextprotocol.io) — canonical source, other registries aggregate from here. Uses `mcp-publisher` CLI. `mcpName` is set in package.json.
- **Anthropic Connectors Directory** (claude.com/connectors) — appears inside Claude UI for all users. Requires safety annotations on tools (done), OAuth if auth needed, 3+ usage examples, test credentials. Submit via MCP Directory Server Review Form.
- **Smithery** (smithery.ai) — 6,000+ servers. Open submission via CLI.
- **Glama** (glama.ai/mcp/servers) — 10,000+ servers. Auto-indexes from GitHub. `glama.json` is in repo root for ownership claim.

**Tier 2 (high value):**
- mcp.so, PulseMCP, MCP-Get, awesome-mcp-servers (GitHub), mcpservers.org

**Tier 3 (nice to have):**
- Cursor Directory, mcpserverdirectory.org, mcpserverfinder.com, OpenTools

### AI Discoverability Files

These files help AI crawlers and LLMs understand the project:

- **`/llms.txt`** — Markdown "table of contents" for LLMs. Served by the Worker at `/llms.txt` and `/.well-known/llms.txt`. Also exists as a static file in repo root. Contains conference details, speaker list, MCP tools, and connection instructions.
- **`glama.json`** — Glama registry claim file in repo root.
- **`README.md`** — Optimized for npm, GitHub, and registry listings. Includes quick start, tool table, example conversation.

### Tool Safety Annotations

All tools have `ToolAnnotations` (required by Anthropic Connectors Directory):

| Tool | readOnlyHint | destructiveHint | idempotentHint | openWorldHint |
|------|-------------|----------------|---------------|---------------|
| `get-conference-info` | true | false | true | false |
| `get-available-tickets` | true | false | true | true (calls SimpleShop API) |
| `buy-ticket` | true | false | true | false (returns URL only) |

### Conference Website SEO (elc-conference.io)

These optimizations go on the conference website, not the MCP server:

**Structured Data (JSON-LD):**
- `Event` schema on homepage — date, venue, speakers as `Person` objects, ticket offers as `Offer` objects
- `FAQPage` schema — common questions (What is ELC? When? How much? How to get there?)
- `Person` schema on speaker pages — with `sameAs` links to LinkedIn/Twitter

**Meta Tags:**
- `<meta name="description">` — factual, entity-rich: "ELC Conference 2026 — engineering leadership conference, April 16 Prague. Speakers from Stripe, Netflix, Microsoft. 350 attendees. Tickets from 12,973 CZK."
- Open Graph tags (`og:title`, `og:description`, `og:image`)
- `<title>` front-loaded: "ELC Conference 2026 — Engineering Leadership, Prague, April 16"

**robots.txt (allow AI crawlers):**
```
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /
```

**llms.txt on website:**
- Host `/llms.txt` on elc-conference.io with conference details (same content as in this repo)
- Optionally also at `/.well-known/llms.txt`

**Content Best Practices (GEO — Generative Engine Optimization):**
- Lead every section with 1-2 direct-answer sentences (40-60 words "snippet zone")
- Include verifiable stats every 150-200 words (e.g., "300+ attendees in 2025, 4.76/5 speaker rating")
- Use question-based headings ("What is ELC Conference?", "How much are tickets?")
- Server-render all content — AI crawlers cannot render client-side JavaScript
- Get mentioned on 3+ external authoritative sites (tech blogs, engineering leadership publications) for multi-source corroboration

### Updating SEO Assets

When conference data changes:
1. Update `src/conference-data.ts` (MCP server data)
2. Update `src/llms-txt.ts` (Worker-served llms.txt)
3. Update `llms.txt` (static file in repo root)
4. Update JSON-LD on elc-conference.io website
5. `wrangler deploy`

## LinkedIn Campaign

Promotion strategy lives in `marketing/` folder:
- Post 1: Launch announcement (ship day)
- Post 2: Behind the scenes / how we built it (day +2)
- Post 3: Demo video/GIF (day +5)
- Post 4: Last call + urgency (day +10)

Angle: "First conference in Central Europe where you buy tickets by talking to AI."
Discount code for MCP buyers = trackable viral hook.

## TODO

### Build & Deploy
- [ ] Get SimpleShop API key from Marian
- [ ] Confirm venue, time, speaker list
- [ ] Create discount code in SimpleShop admin
- [ ] Build MCP server (Cloudflare Worker + stdio fallback)
- [ ] Test locally with `wrangler dev`
- [ ] Deploy to Cloudflare Workers
- [ ] Set worker secrets (SIMPLESHOP_EMAIL, SIMPLESHOP_API_KEY, DISCOUNT_CODE)
- [ ] Set up custom domain (optional: mcp.elc-conference.io)
- [ ] Publish npm package (stdio fallback)

### MCP Registry Registration (see REGISTRATION_CHECKLIST.md)
- [ ] Push code to GitHub
- [ ] Register on Official MCP Registry (`mcp-publisher publish`)
- [ ] Submit to Anthropic Connectors Directory (claude.com/connectors)
- [ ] Publish on Smithery
- [ ] Claim on Glama (glama.json already in repo)
- [ ] Submit to mcp.so, PulseMCP, MCP-Get, awesome-mcp-servers, mcpservers.org

### SEO & AI Search (elc-conference.io website)
- [ ] Add llms.txt to elc-conference.io
- [ ] Add Event JSON-LD structured data to homepage
- [ ] Add FAQPage JSON-LD for common questions
- [ ] Add Person JSON-LD for each speaker
- [ ] Update robots.txt to allow AI crawlers
- [ ] Write factual meta descriptions (not marketing fluff)
- [ ] Add Open Graph tags
- [ ] Get mentions on external tech/leadership blogs

### Marketing
- [ ] Draft LinkedIn posts
- [ ] Record demo video/GIF
