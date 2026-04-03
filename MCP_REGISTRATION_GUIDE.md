# MCP Server Registration Guide

How to register the ELC Conference MCP server across directories, and make `mcp.elc-conference.io` discoverable by AI systems.

## Current State

| Asset | URL | Status |
|-------|-----|--------|
| MCP endpoint | `https://mcp.elc-conference.io/mcp` | Live |
| Health check | `https://mcp.elc-conference.io/` | Live |
| llms.txt | `https://mcp.elc-conference.io/llms.txt` | Live |
| llms.txt (well-known) | `https://mcp.elc-conference.io/.well-known/llms.txt` | Live |
| npm package | `elc-conference-mcp-tickets@0.1.0` | Published |
| GitHub | `github.com/marian-kamenistak/elc-conference-mcp-tickets` | Public |

---

## Part 1: MCP Server Registry Registration

### 1.1 Official MCP Registry (registry.modelcontextprotocol.io)

**Priority:** Highest — canonical source, other registries aggregate from here.

**Prerequisites:**
- `mcp-publisher` CLI installed (`brew install mcp-publisher`) — done
- `server.json` in repo root — done
- GitHub auth

**Steps:**

```bash
# 1. Login (opens browser for GitHub OAuth)
mcp-publisher login github

# 2. Validate (already passing)
mcp-publisher validate

# 3. Publish
mcp-publisher publish

# 4. Verify
# Visit https://registry.modelcontextprotocol.io and search for "elc-conference"
```

**What gets registered:**
- Server name: `io.github.marian-kamenistak/elc-conference-mcp-tickets`
- Remote endpoint: `https://mcp.elc-conference.io/mcp` (streamable-http)
- npm package: `elc-conference-mcp-tickets` (stdio)

---

### 1.2 Anthropic Connectors Directory (claude.com/connectors)

**Priority:** Highest — appears directly inside Claude UI for all users.

**Prerequisites:**
- All tools must have safety annotations (readOnlyHint, destructiveHint, etc.) — done
- 3+ usage examples in documentation
- Remote MCP endpoint accessible

**Steps:**

1. Go to the submission guide: https://support.claude.com/en/articles/12922490-remote-mcp-server-submission-guide
2. Fill in the MCP Directory Server Review Form (linked in the guide)
3. Provide these details:

| Field | Value |
|-------|-------|
| Server name | ELC Conference Tickets |
| Description | Browse and buy ELC Conference 2026 engineering leadership tickets in Prague via AI |
| MCP endpoint URL | `https://mcp.elc-conference.io/mcp` |
| Transport | Streamable HTTP |
| Authentication | None (public) |
| GitHub repo | `https://github.com/marian-kamenistak/elc-conference-mcp-tickets` |
| npm package | `elc-conference-mcp-tickets` |

4. Include these usage examples:

**Example 1 — Conference info:**
> User: "Tell me about the ELC Conference"
> Claude calls `get-conference-info` → returns date, venue, speakers, topics, what's included

**Example 2 — Ticket availability:**
> User: "What tickets are available and how much do they cost?"
> Claude calls `get-available-tickets` → returns live pricing from SimpleShop API with remaining count

**Example 3 — Purchase:**
> User: "I want to buy a ticket for my team"
> Claude calls `buy-ticket` with `ticket_type: "team_pack"` → returns direct checkout URL

5. Tool safety annotations (already implemented):

| Tool | readOnlyHint | destructiveHint | idempotentHint | openWorldHint |
|------|-------------|----------------|---------------|---------------|
| get-conference-info | true | false | true | false |
| get-available-tickets | true | false | true | true |
| buy-ticket | true | false | true | false |

**Note:** Review may take days/weeks. Submit early.

---

### 1.3 Smithery (smithery.ai)

**Priority:** High — 6,000+ servers, large community.

**Steps:**

```bash
# Option A: CLI
npx -y @smithery/cli publish https://mcp.elc-conference.io/mcp \
  --name "elc-conference-mcp-tickets" \
  --description "Browse and buy ELC Conference 2026 tickets via AI"

# Option B: Web
# Go to https://smithery.ai and click "Submit Server"
# Provide the GitHub repo URL: https://github.com/marian-kamenistak/elc-conference-mcp-tickets
```

---

### 1.4 Glama (glama.ai/mcp/servers)

**Priority:** High — 10,000+ servers, auto-indexes from GitHub.

**Steps:**

1. `glama.json` is already in the repo root — Glama should auto-discover it
2. Go to https://glama.ai/mcp/servers
3. Search for "elc-conference" — if listed, claim ownership
4. If not listed yet, submit the GitHub repo URL manually

---

### 1.5 Tier 2 Registries

| Registry | URL | How to submit |
|----------|-----|---------------|
| mcp.so | https://mcp.so | Click "Submit" or create issue at `github.com/chatmcp/mcp-directory/issues/1` |
| PulseMCP | https://pulsemcp.com/servers | Submit at `pulsemcp.com/use-cases/submit` |
| MCP-Get | https://github.com/mcp-get/community-servers | Submit PR to the repo |
| awesome-mcp-servers | https://github.com/wong2/awesome-mcp-servers | Submit PR adding server to list |
| mcpservers.org | https://mcpservers.org | Submit at `mcpservers.org/submit` |

**Submission copy for all registries:**

```
Name: ELC Conference Tickets
Description: Browse and buy ELC Conference 2026 engineering leadership tickets in Prague via AI. Live pricing, speaker info, and direct purchase links.
MCP endpoint: https://mcp.elc-conference.io/mcp
Transport: Streamable HTTP (also available via npm: elc-conference-mcp-tickets)
Auth: None (public)
GitHub: https://github.com/marian-kamenistak/elc-conference-mcp-tickets
Tools: get-conference-info, get-available-tickets, buy-ticket
```

---

## Part 2: AI Discoverability for mcp.elc-conference.io

### 2.1 llms.txt (already done)

The worker serves `llms.txt` at two paths:
- `https://mcp.elc-conference.io/llms.txt`
- `https://mcp.elc-conference.io/.well-known/llms.txt`

Content includes: conference details, speaker list, MCP tool descriptions, and connection instructions.

No registration needed — AI crawlers discover this automatically by fetching `/.well-known/llms.txt`.

### 2.2 llmstxt.org Directory (optional)

Submit `mcp.elc-conference.io` at https://llmstxt.org to get listed among sites supporting the `llms.txt` standard.

### 2.3 What AI crawlers look for

| Crawler | Service | What it checks |
|---------|---------|----------------|
| Claude-SearchBot | Claude (Anthropic) | `/.well-known/llms.txt`, robots.txt |
| OAI-SearchBot | ChatGPT (OpenAI) | `/.well-known/llms.txt`, robots.txt |
| ChatGPT-User | ChatGPT browsing | Page content, structured data |
| PerplexityBot | Perplexity | `/.well-known/llms.txt`, page content |
| Googlebot | Google AI Overviews | Structured data (JSON-LD), meta tags |

The MCP worker does not serve robots.txt currently. All paths are open by default (Cloudflare Workers don't block crawlers unless explicitly configured).

---

## Part 3: What to do on elc-conference.io (main site)

These actions go on the **conference website**, not the MCP server:

### 3.1 Host llms.txt on the main site

Copy the content from `llms.txt` in this repo and serve it at:
- `https://elc-conference.io/llms.txt`
- `https://elc-conference.io/.well-known/llms.txt`

This is where most AI crawlers look first (the main domain, not subdomains).

### 3.2 Allow AI crawlers in robots.txt

Add to `https://elc-conference.io/robots.txt`:

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

### 3.3 Add structured data (JSON-LD)

Add to the homepage `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "ELC Conference 2026",
  "description": "Engineering leadership conference. 12 speakers, 16 workshops, 10 mentors.",
  "startDate": "2026-04-16T09:00:00+02:00",
  "endDate": "2026-04-16T21:00:00+02:00",
  "location": {
    "@type": "Place",
    "name": "CSOB SHQ (Centrala CSOB)",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Vymolova 353",
      "addressLocality": "Praha 5",
      "postalCode": "150 00",
      "addressCountry": "CZ"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "Engineering Leaders Community",
    "url": "https://elc-conference.io"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "3rd Wave – Senior Leader",
      "price": "12973",
      "priceCurrency": "CZK",
      "availability": "https://schema.org/InStock",
      "url": "https://form.simpleshop.cz/qGAKO/buy/"
    },
    {
      "@type": "Offer",
      "name": "3rd Wave – Senior Leader Team Pack (4+1)",
      "price": "49375",
      "priceCurrency": "CZK",
      "availability": "https://schema.org/LimitedAvailability",
      "url": "https://form.simpleshop.cz/qGAKO/buy/"
    }
  ],
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled"
}
</script>
```

### 3.4 Meta tags

```html
<title>ELC Conference 2026 — Engineering Leadership, Prague, April 16</title>
<meta name="description" content="ELC Conference 2026 — engineering leadership conference, April 16 Prague. Speakers from Stripe, Netflix, Microsoft. 350 attendees. Tickets from 12,973 CZK.">
<meta property="og:title" content="ELC Conference 2026 — Engineering Leadership">
<meta property="og:description" content="One-day conference for CTOs, VPs, and engineering managers. April 16, Prague. 12 speakers, 16 workshops.">
<meta property="og:url" content="https://elc-conference.io">
<meta property="og:type" content="website">
```

---

## Registration Order (recommended)

1. **Official MCP Registry** — `mcp-publisher publish` (CLI, do first)
2. **Smithery** — CLI or web submission (do second)
3. **Anthropic Connectors** — form submission (do third, takes longest to review)
4. **Glama** — auto-indexes from GitHub (just verify)
5. **Tier 2 registries** — batch submit to all at once
6. **elc-conference.io updates** — llms.txt, robots.txt, JSON-LD (coordinate with whoever manages the site)
