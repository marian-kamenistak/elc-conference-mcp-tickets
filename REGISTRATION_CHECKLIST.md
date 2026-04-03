# MCP Server Registration Checklist

Step-by-step guide to register the ELC Conference MCP server across all major directories and optimize for AI search.

## Prerequisites

- [ ] Push code to GitHub at `github.com/mariankamenistak/elc-conference-mcp-tickets`
- [ ] Deploy to Cloudflare Workers (`wrangler deploy`)
- [ ] Publish npm package (`npm publish`)
- [ ] Confirm final MCP server URL (e.g., `https://mcp.elc-conference.io/mcp`)

---

## Tier 1 — Must Do (highest impact)

### 1. Official MCP Registry
**URL:** https://registry.modelcontextprotocol.io
**Why:** Canonical source. Other registries aggregate from here.

Steps:
- [ ] Install `mcp-publisher` CLI: `brew install mcp-publisher` (or download binary)
- [ ] Run `mcp-publisher init` in repo root to generate `server.json`
- [ ] Authenticate: `mcp-publisher login github`
- [ ] Publish: `mcp-publisher publish`
- [ ] Verify listing at registry.modelcontextprotocol.io

Note: `mcpName` is already set in package.json as `io.github.mariankamenistak/elc-conference-mcp-tickets`.

Docs: https://modelcontextprotocol.io/registry/quickstart

### 2. Anthropic Connectors Directory (Claude built-in)
**URL:** https://claude.com/connectors
**Why:** Appears directly inside Claude UI for all users. Highest visibility.

Steps:
- [ ] Review requirements: https://support.claude.com/en/articles/12922490-remote-mcp-server-submission-guide
- [ ] Ensure all tools have safety annotations (`readOnlyHint: true` on get-conference-info, get-available-tickets; buy-ticket can be `readOnlyHint: true` since it only returns a URL)
- [ ] Prepare 3+ usage examples in documentation
- [ ] Submit via the MCP Directory Server Review Form (linked in the guide above)
- [ ] Provide test credentials for SimpleShop API

Note: Review process may take time. Submit early.

### 3. Smithery
**URL:** https://smithery.ai
**Why:** 6,000+ servers listed. Large community.

Steps:
- [ ] Install Smithery CLI or use web submission
- [ ] Publish: `smithery mcp publish <url> -n mariankamenistak/elc-conference-mcp-tickets`
- [ ] Verify listing at smithery.ai

### 4. Glama
**URL:** https://glama.ai/mcp/servers
**Why:** 10,000+ servers indexed. Auto-discovers from GitHub.

Steps:
- [ ] Push `glama.json` to GitHub repo root (already created)
- [ ] Go to glama.ai and claim ownership of the server listing
- [ ] Verify listing and edit details if needed

---

## Tier 2 — High Value

### 5. mcp.so
**URL:** https://mcp.so
Steps:
- [ ] Click "Submit" on mcp.so or create an issue at https://github.com/chatmcp/mcp-directory/issues/1
- [ ] Provide: server name, description, features, connection info

### 6. PulseMCP
**URL:** https://www.pulsemcp.com/servers
Steps:
- [ ] Submit at https://www.pulsemcp.com/use-cases/submit
- [ ] May also auto-index from Official MCP Registry

### 7. MCP-Get
**URL:** https://github.com/mcp-get/community-servers
Steps:
- [ ] Submit PR to the community-servers repo
- [ ] Follow their CONTRIBUTING guide

### 8. awesome-mcp-servers
**URL:** https://github.com/wong2/awesome-mcp-servers
Steps:
- [ ] Submit PR adding the server to the appropriate category

### 9. mcpservers.org
**URL:** https://mcpservers.org
Steps:
- [ ] Submit at https://mcpservers.org/submit

---

## Tier 3 — Nice to Have

- [ ] **Cursor Directory** — https://cursor.directory/plugins (if relevant to Cursor users)
- [ ] **mcpserverdirectory.org** — https://mcpserverdirectory.org/submit
- [ ] **mcpserverfinder.com** — https://www.mcpserverfinder.com
- [ ] **OpenTools** — https://opentools.com/registry

---

## AI Search Optimization (for elc-conference.io website)

These go on the **conference website**, not the MCP server:

### llms.txt
- [ ] Host `/llms.txt` on elc-conference.io with conference details (copy content from `llms.txt` in this repo)
- [ ] Optionally host at `/.well-known/llms.txt` too

### Structured Data (JSON-LD)
- [ ] Add `Event` schema to homepage (date, venue, speakers, ticket offers)
- [ ] Add `FAQPage` schema for common questions
- [ ] Add `Person` schema for each speaker page

### robots.txt
- [ ] Allow AI search crawlers in robots.txt:
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

### Meta Tags
- [ ] Write factual meta descriptions (not marketing fluff):
  `"ELC Conference 2026 — engineering leadership conference, April 16 Prague. Speakers from Stripe, Netflix, Microsoft. 350 attendees. Tickets from 12,973 CZK."`
- [ ] Add Open Graph tags (og:title, og:description, og:image)

### Content
- [ ] Publish original stats on the website ("300+ attendees in 2025, 4.76/5 speaker rating")
- [ ] Create FAQ page with question-based headings
- [ ] Get mentions on external tech blogs / engineering leadership publications

---

## Marketing Angle

**Key message:** "First conference in Central Europe where you buy tickets by talking to AI."

When submitting to registries, emphasize:
- Real-world commercial use case (not a demo/toy)
- Live ticket data from SimpleShop API
- Zero-install remote MCP server (just a URL)
- Discount code for MCP buyers (trackable viral hook)
