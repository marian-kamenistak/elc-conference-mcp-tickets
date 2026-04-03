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

## Detailed Docs

| Document | Contents |
|----------|----------|
| [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) | Tech stack, project structure, SimpleShop API, MCP tools, safety annotations, architecture decisions |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Cloudflare Workers setup, secrets, local dev, custom domain, npm publishing |
| [`docs/SEO_AND_AI_MARKETING.md`](docs/SEO_AND_AI_MARKETING.md) | MCP registry distribution, JSON-LD schemas, meta tags, robots.txt, GEO best practices |
| [`REGISTRATION_CHECKLIST.md`](REGISTRATION_CHECKLIST.md) | Step-by-step checklist for all MCP registries with links |
| [`marketing/LINKEDIN_POSTS.md`](marketing/LINKEDIN_POSTS.md) | 4 LinkedIn posts (launch, behind-the-scenes, demo, last call) + posting guidelines |

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

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full deployment instructions.

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
