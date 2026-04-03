# LinkedIn Campaign — ELC Conference MCP Server

**Angle:** "First conference in Central Europe where you buy tickets by talking to AI."
**Discount code for MCP buyers** = trackable viral hook.
**Target audience:** CTOs, VPs of Engineering, Directors, Engineering Managers, Tech Leads, AI/MCP enthusiasts.

---

## Post 1: Launch Announcement (Ship Day)

**Goal:** Announce the MCP server. Generate curiosity and shares.

---

We just shipped something that's never been done before in Central Europe.

You can now buy tickets for ELC Conference 2026 by talking to AI.

No forms. No checkout flow. Just open Claude and say: "I want a ticket for ELC Conference."

It checks live availability, shows you pricing, and gives you a purchase link. Done.

How? We built an MCP server — a way for AI assistants to interact with our ticket system in real time.

Here's what it can do:
- Tell you everything about the conference (date, venue, speakers)
- Show live ticket availability and pricing
- Give you a direct purchase link

Setup takes 10 seconds. Add one line to your Claude config:

```
"url": "https://mcp.elc-conference.io/mcp"
```

That's it. No installation, no API keys, no npm.

We believe this is how conferences will sell tickets in 2-3 years. We're doing it now.

ELC Conference 2026: April 16, Prague.
Speakers from Stripe, Netflix, Microsoft, Superhuman, Financial Times.
350 attendees. Limited tickets remaining.

Try it yourself and let me know what you think.

#MCP #AI #EngineeringLeadership #Conference #Prague #Claude #Innovation

---

## Post 2: Behind the Scenes / How We Built It (Day +2)

**Goal:** Technical credibility. Appeal to engineering leaders who appreciate the craft.

---

"How did you actually build an AI ticket system for a conference?"

Here's the honest answer: it took less time than you'd think.

We used MCP (Model Context Protocol) — an open standard by Anthropic that lets AI assistants call external tools. Think of it as an API, but designed for AI to use instead of humans.

Our stack:
- TypeScript
- Cloudflare Workers (serverless, edge-deployed)
- SimpleShop.cz API (our ticket provider)
- @modelcontextprotocol/sdk

The MCP server exposes 3 tools:
1. `get-conference-info` — conference details (static, no API call)
2. `get-available-tickets` — live pricing from SimpleShop
3. `buy-ticket` — returns a purchase URL

The whole thing is stateless. Each request creates a fresh server instance. No database, no sessions, no Durable Objects.

Deployment: one `wrangler deploy` command. It runs on Cloudflare's global edge network.

For users: they add a single URL to their Claude config. No npm, no installation, no API keys.

What surprised me most: the hardest part wasn't the code. It was making the tool descriptions clear enough for the AI to know when and how to use them.

The MCP server is open source. Link in comments.

What would you build with MCP?

#MCP #ModelContextProtocol #CloudflareWorkers #TypeScript #EngineeringLeadership #BuildInPublic

---

## Post 3: Demo Video / GIF (Day +5)

**Goal:** Visual proof. Show it working. Drive FOMO.

---

"I'll believe it when I see it."

Fair. Here's a 30-second demo.

[ATTACH: Screen recording of Claude conversation]
1. "What's ELC Conference?" → Full conference details
2. "Any tickets left?" → Live pricing, 16 remaining
3. "I'll take one." → Direct purchase link, discount code included

That's the entire buying experience. Three messages.

No forms. No dropdown menus. No "select quantity." No cookie banners.

Just: ask, see, buy.

The MCP server talks to our ticket system (SimpleShop.cz) in real time. Prices and availability are always current.

And yes — there's a special discount code for people who buy through AI. Because early adopters should be rewarded.

ELC Conference 2026
April 16 | Prague | 350 attendees
Stripe, Netflix, Microsoft, Superhuman, Financial Times

Only 16 individual tickets and 1 team pack left.

Try it: add this to your Claude config and ask for tickets.
Details in comments.

#ELCConference #MCP #AI #TicketInnovation #EngineeringLeadership

---

## Post 4: Last Call + Urgency (Day +10)

**Goal:** Scarcity. Convert fence-sitters.

---

16 tickets. That's what's left.

ELC Conference 2025 sold out. 300+ attendees. 4.76/5 speaker rating.

This year we expanded to 350-400 seats. But we also expanded the speaker lineup:

- Stripe (Engineering Manager)
- Netflix (Sr. Engineering Manager)
- Microsoft (Partner Director of Engineering)
- Superhuman (Director of Engineering)
- Financial Times (Principal Engineer)
- Google (TBA)
- Meta (TBA)
- + more

Topics: DevEx & platform engineering, architecture at scale, product-engineering alignment.

16 workshops. 10 mentors for 1:1 sessions. Afterparty.

April 16, Prague. One day. Everything included.

3rd Wave pricing: 12,973 CZK (~515 EUR)

And if you want a fun way to buy: open Claude and ask for ELC Conference tickets. We built the first MCP-powered conference ticket system in Central Europe.

Link in comments. Don't wait for the "sold out" post.

#ELCConference #EngineeringLeadership #Prague #CTO #VPEngineering #LastCall

---

## Posting Guidelines

- **Timing:** Post between 8:00-9:00 AM CET (Tuesday-Thursday perform best)
- **Engagement:** Reply to every comment within 2 hours. Ask follow-up questions.
- **Tag speakers:** Tag confirmed speakers in Post 1 and Post 4 for amplification.
- **Hashtags:** Mix broad (#AI, #Engineering) with niche (#MCP, #ModelContextProtocol). Max 5-7 per post.
- **CTA consistency:** Every post should have a clear action (try the MCP server, watch the demo, buy tickets).
- **Discount code:** Only mention in Post 3 (demo) and comments. Creates exclusivity.
- **Cross-post to:** Twitter/X (shorter version), engineering Slack communities, Reddit r/ExperiencedDevs.

## Tracking

- Track discount code usage in SimpleShop admin to measure MCP-driven conversions
- Monitor MCP server request logs in Cloudflare dashboard for usage spikes after each post
- Compare ticket sales velocity before and after campaign launch
