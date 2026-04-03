# SEO & AI Search Optimization

The goal is to make the conference and the MCP server discoverable by both traditional search engines and AI assistants (ChatGPT, Perplexity, Claude, Google AI Overviews).

Two separate surfaces to optimize:
1. **MCP server** — found by AI clients via MCP registries
2. **Conference website** (elc-conference.io) — found by AI search engines and traditional SEO

---

## Part 1: MCP Server Registry Distribution

Register the MCP server across all major directories. Full step-by-step with links: `REGISTRATION_CHECKLIST.md`.

### Tier 1 — Must Do (highest impact)

| Registry | URL | Why | How |
|----------|-----|-----|-----|
| **Official MCP Registry** | registry.modelcontextprotocol.io | Canonical source. Other registries aggregate from here. | `mcp-publisher` CLI. `mcpName` already set in package.json. |
| **Anthropic Connectors Directory** | claude.com/connectors | Appears inside Claude UI for all users. Highest visibility. | Submit via MCP Directory Server Review Form. Requires safety annotations (done), 3+ usage examples, test credentials. |
| **Smithery** | smithery.ai | 6,000+ servers. Large community. | `smithery mcp publish <url>` — open submission. |
| **Glama** | glama.ai/mcp/servers | 10,000+ servers. Auto-indexes from GitHub. | `glama.json` already in repo root. Push to GitHub, then claim ownership on Glama. |

### Tier 2 — High Value

| Registry | URL | How |
|----------|-----|-----|
| **mcp.so** | mcp.so | Submit button on site or GitHub issue |
| **PulseMCP** | pulsemcp.com/servers | Submit at pulsemcp.com/use-cases/submit |
| **MCP-Get** | github.com/mcp-get/community-servers | Submit PR |
| **awesome-mcp-servers** | github.com/wong2/awesome-mcp-servers | Submit PR |
| **mcpservers.org** | mcpservers.org/submit | Form submission |

### Tier 3 — Nice to Have

Cursor Directory, mcpserverdirectory.org, mcpserverfinder.com, OpenTools

### AI Discoverability Files (already created)

| File | Location | Purpose |
|------|----------|---------|
| `llms.txt` | Repo root + served at `/llms.txt` by Worker | Markdown "table of contents" for LLMs |
| `src/llms-txt.ts` | Worker source | llms.txt content served at `/llms.txt` and `/.well-known/llms.txt` |
| `glama.json` | Repo root | Glama registry claim file |
| `README.md` | Repo root | Optimized for npm, GitHub, and registry listings |

### Tool Safety Annotations (already added)

All tools have `ToolAnnotations` (required by Anthropic Connectors Directory):

| Tool | readOnlyHint | destructiveHint | idempotentHint | openWorldHint |
|------|-------------|----------------|---------------|---------------|
| `get-conference-info` | true | false | true | false |
| `get-available-tickets` | true | false | true | true (calls SimpleShop API) |
| `buy-ticket` | true | false | true | false (returns URL only) |

---

## Part 2: Conference Website SEO (elc-conference.io)

These optimizations go on the **conference website**, not the MCP server.

### Structured Data (JSON-LD)

Add to the `<head>` of elc-conference.io:

**Event schema** (homepage):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "ELC Conference 2026",
  "description": "One-day engineering leadership conference — Silicon Valley in Central Europe. 12 speakers, 16 workshops, 1:1 mentoring, afterparty.",
  "startDate": "2026-04-16T09:00:00+02:00",
  "endDate": "2026-04-16T21:00:00+02:00",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
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
    "name": "Engineering Leaders Czech",
    "url": "https://elc-conference.io"
  },
  "performer": [
    {
      "@type": "Person",
      "name": "Aleodor Tabarcea",
      "jobTitle": "Engineering Manager",
      "worksFor": { "@type": "Organization", "name": "Stripe" }
    },
    {
      "@type": "Person",
      "name": "Michal Matyjek",
      "jobTitle": "Sr. Engineering Manager",
      "worksFor": { "@type": "Organization", "name": "Netflix" }
    },
    {
      "@type": "Person",
      "name": "Vojta Vondra",
      "jobTitle": "Partner Director of Engineering",
      "worksFor": { "@type": "Organization", "name": "Microsoft" }
    },
    {
      "@type": "Person",
      "name": "Rizwan Iqbal",
      "jobTitle": "Director of Engineering",
      "worksFor": { "@type": "Organization", "name": "Superhuman" }
    },
    {
      "@type": "Person",
      "name": "Tatiana Stantonian",
      "jobTitle": "Principal Engineer",
      "worksFor": { "@type": "Organization", "name": "Financial Times" }
    },
    {
      "@type": "Person",
      "name": "Jan Zenisek",
      "jobTitle": "VP of Product",
      "worksFor": { "@type": "Organization", "name": "Apify" }
    },
    {
      "@type": "Person",
      "name": "Tomas Rehor",
      "jobTitle": "Head of Engineering",
      "worksFor": { "@type": "Organization", "name": "Aisle" }
    },
    {
      "@type": "Person",
      "name": "Carol Palombini",
      "jobTitle": "Tech Leadership Coach & Consultant"
    }
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "3rd Wave – Senior Leader",
      "price": "12973",
      "priceCurrency": "CZK",
      "availability": "https://schema.org/InStock",
      "url": "https://form.simpleshop.cz/qGAKO/buy/",
      "validFrom": "2025-01-01"
    },
    {
      "@type": "Offer",
      "name": "3rd Wave – Senior Leader Team Pack (4+1)",
      "price": "49375",
      "priceCurrency": "CZK",
      "availability": "https://schema.org/LimitedAvailability",
      "url": "https://form.simpleshop.cz/qGAKO/buy/",
      "validFrom": "2025-01-01"
    }
  ],
  "image": "https://elc-conference.io/og-image.jpg",
  "url": "https://elc-conference.io"
}
</script>
```

**FAQPage schema:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is ELC Conference?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ELC Conference is a one-day engineering leadership event in Prague, Czech Republic. It brings together CTOs, VPs of Engineering, Directors, and Engineering Managers for 12 main stage talks, 16 hands-on workshops, 1:1 mentoring sessions, and an afterparty. The 2025 edition sold out with 300+ attendees and a 4.76/5 speaker rating."
      }
    },
    {
      "@type": "Question",
      "name": "When and where is ELC Conference 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "April 16, 2026, 9:00 AM – 9:00 PM CEST at CSOB SHQ (Centrala CSOB), Vymolova 353, 150 00 Praha 5, Czech Republic. Accessible via Metro Line B, Bus 118/125/153/196/231/232/271/904, Tram 7."
      }
    },
    {
      "@type": "Question",
      "name": "How much are tickets for ELC Conference 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "3rd Wave Senior Leader individual tickets are 12,973 CZK (~515 EUR). Team Pack (4+1) is 49,375 CZK (~1,960 EUR). Earlier waves are sold out. All tiers grant the same access: main stage talks, workshops, 1:1 mentoring, experience zone, afterparty, and networking."
      }
    },
    {
      "@type": "Question",
      "name": "Who are the speakers at ELC Conference 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Confirmed speakers include leaders from Stripe, Netflix, Microsoft, Superhuman, Financial Times, Apify, and Aisle. Additional speakers from Google and Meta are TBA. Topics cover DevEx, platform engineering, AI adoption in production, architecture at scale, and product-engineering alignment."
      }
    },
    {
      "@type": "Question",
      "name": "Can I buy ELC Conference tickets through AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ELC Conference is the first conference in Central Europe with an MCP (Model Context Protocol) server for AI-powered ticket purchasing. Add the MCP server URL to your Claude config and ask about tickets, availability, and pricing — all through natural conversation. The AI will give you a direct purchase link."
      }
    }
  ]
}
</script>
```

### Meta Tags

```html
<title>ELC Conference 2026 — Engineering Leadership, Prague, April 16</title>
<meta name="description" content="ELC Conference 2026 — engineering leadership conference, April 16 Prague. Speakers from Stripe, Netflix, Microsoft. 350 attendees. Tickets from 12,973 CZK (~515 EUR). Workshops, mentoring, afterparty.">
<meta property="og:title" content="ELC Conference 2026 — Silicon Valley in Central Europe">
<meta property="og:description" content="One-day engineering leadership conference in Prague. 12 speakers from Stripe, Netflix, Microsoft. 16 workshops. 1:1 mentoring. Afterparty. April 16, 2026.">
<meta property="og:image" content="https://elc-conference.io/og-image.jpg">
<meta property="og:url" content="https://elc-conference.io">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### robots.txt

Allow AI search crawlers to index the conference website:

```
User-agent: *
Allow: /

# AI Search Crawlers — explicitly allowed
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /

# AI Training Crawlers — block if desired
# User-agent: GPTBot
# Disallow: /
# User-agent: Google-Extended
# Disallow: /
# User-agent: CCBot
# Disallow: /

Sitemap: https://elc-conference.io/sitemap.xml
```

### llms.txt on Website

Host `/llms.txt` on elc-conference.io with conference details. Copy content from `llms.txt` in this repo.
Optionally also serve at `/.well-known/llms.txt`.

---

## Part 3: Content Best Practices (GEO — Generative Engine Optimization)

GEO = optimizing content to be cited in AI-generated responses (ChatGPT, Perplexity, Google AI Overviews, Claude).

### Writing for AI Citation

- **Direct answers first:** Lead every section with 1-2 sentences that directly answer the heading's question. Aim for 40-60 words in this "snippet zone."
- **Fact density:** Include a verifiable stat every 150-200 words. Original data gets cited more ("300+ attendees in 2025", "4.76/5 speaker rating").
- **Question-based headings:** "What is ELC Conference?", "How much are tickets?", "Who speaks at ELC?" — AI Overviews trigger on question queries.
- **Server-render content:** AI crawlers cannot render client-side JavaScript. All key content must be in the initial HTML.
- **Modular structure:** Clear H2/H3 headings as gateways to discrete factual answers. AI uses passage-level indexing.

### External Authority Signals

AI engines assign higher confidence to entities mentioned across multiple independent domains:

- [ ] Get mentioned on 3+ external authoritative sites (tech blogs, engineering leadership publications)
- [ ] Publish speaker interviews or guest posts on external platforms
- [ ] Get listed on event aggregators (Luma, Eventbrite, Meetup)
- [ ] Encourage attendee reviews and social mentions

### Content Pages to Create on elc-conference.io

| Page | Purpose | Key Schema |
|------|---------|-----------|
| Homepage | Conference overview with all key facts | Event |
| /speakers | Individual speaker bios with credentials | Person |
| /tickets | Pricing, availability, FAQ | Offer, FAQPage |
| /about or /faq | Common questions in Q&A format | FAQPage |
| /mcp | "Buy tickets via AI" — explains MCP integration | HowTo |
| /blog/2025-recap | 2025 edition results with original stats | Article |

---

## Updating SEO Assets

When conference data changes:
1. Update `src/conference-data.ts` (MCP server data)
2. Update `src/llms-txt.ts` (Worker-served llms.txt)
3. Update `llms.txt` (static file in repo root)
4. Update JSON-LD on elc-conference.io website
5. Update meta descriptions if pricing/availability changed
6. `wrangler deploy`
