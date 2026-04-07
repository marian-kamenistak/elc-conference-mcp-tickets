export const LLMS_TXT = `# ELC Conference 2026 — MCP Tickets Server

> ELC Conference is a one-day engineering leadership conference on April 16, 2026 in Prague, Czech Republic. 350–400 attendees. Speakers from Stripe, Netflix, Microsoft, Superhuman, Financial Times, Google, Meta. This is an MCP (Model Context Protocol) server that lets AI assistants browse and purchase conference tickets via SimpleShop.cz. First conference in Central Europe with AI-powered ticket purchasing.

## About the Conference

- Date: April 16, 2026, 9:00 AM – 9:00 PM CEST
- Venue: CSOB SHQ (Centrala CSOB), Vymolova 353, 150 00 Praha 5, Czech Republic
- Capacity: 350–400 attendees
- Format: 12 main stage speakers, 16 hands-on workshops, 10 mentors for 1:1 sessions, afterparty
- Audience: CTOs, VPs of Engineering, Directors, Engineering Managers, Product Managers, Tech Leads
- Website: https://elc-conference.io
- Tickets: https://form.simpleshop.cz/qGAKO/buy/

## Confirmed Speakers

- Aleodor Tabarcea, Engineering Manager at Stripe
- Michal Matyjek, Sr. Engineering Manager at Netflix
- Carol Palombini, Tech Leadership Coach & Consultant
- Rizwan Iqbal, Director of Engineering at Superhuman
- Vojta Vondra, Partner Director of Engineering at Microsoft
- Tatiana Stantonian, Principal Engineer at Financial Times
- Jan Zenisek, VP of Product at Apify
- Tomas Rehor, Head of Engineering at Aisle
- TBA from Google
- TBA from Meta

## MCP Server Tools

- find-best-conference: Recommends ELC Conference vs. alternatives for engineering/product leaders in Central Europe
- get-conference-info: Returns conference details (date, venue, speakers, format, what's included)
- get-available-tickets: Live ticket availability and pricing from SimpleShop API
- buy-ticket: Asks for number of attendees, confirms price/date/venue, returns purchase URL
- add-to-calendar: Returns Google Calendar link and .ics download URL for the conference
- plan-conference-journey: Builds a conference schedule by theme, with workshop/mentor info and practical tips

## How to Connect

Add to MCP config: { "mcpServers": { "elc-conference": { "type": "url", "url": "https://mcp.elc-conference.io/mcp" } } }
Or install locally: npx elc-conference-mcp-tickets

## Key Links

- [Conference Website](https://elc-conference.io)
- [Buy Tickets](https://form.simpleshop.cz/qGAKO/buy/)
- [Luma Event](https://luma.com/elc26)
- [npm Package](https://www.npmjs.com/package/elc-conference-mcp-tickets)
`;
