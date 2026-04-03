# ELC Conference MCP Server — Test Plan

## 1. Unit Tests (automated)

Run with: `npm test`

### Conference Info (`conference-info.test.ts`)
- [x] Tool registers on the server without errors
- [x] Conference data has all required fields (name, date, venue, website, ticketsUrl)
- [x] All speakers have name, title, and company
- [x] Tickets URL points to SimpleShop form
- [x] Website uses HTTPS

### Available Tickets (`available-tickets.test.ts`)
- [x] Tool registers without an API client (static fallback mode)
- [x] Tool registers with an API client
- [x] Static fallback data includes buy URL

### Buy Ticket (`buy-ticket.test.ts`)
- [x] Tool registers without a discount code
- [x] Tool registers with a discount code

### Server (`server.test.ts`)
- [x] Creates server with no config (public mode)
- [x] Creates server with full config (email + API key + discount)
- [x] Creates server with partial config (no discount code)

### SimpleShop Client (`simpleshop-client.test.ts`)
- [x] Creates client with email and API key
- [x] Has `listProducts` method
- [x] Has `getProduct` method

---

## 2. Integration Tests (manual — stdio)

### Prerequisites
- Built project: `npm run build`
- SimpleShop API credentials (for live data tests)

### Test: Initialize
```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}\n' | node dist/index.js 2>/dev/null
```
**Expected:** JSON response with `serverInfo.name = "elc-conference-mcp-tickets"` and `capabilities.tools`

### Test: List Tools
```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n' | node dist/index.js 2>/dev/null
```
**Expected:** Response with 3 tools: `get-conference-info`, `get-available-tickets`, `buy-ticket`

### Test: Call get-conference-info
```bash
printf '...(init)...\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get-conference-info","arguments":{}}}\n' | node dist/index.js 2>/dev/null
```
**Expected:** Text content with conference name, date, venue, speakers, buy link

### Test: Call get-available-tickets (no API key — static fallback)
```bash
printf '...(init)...\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get-available-tickets","arguments":{}}}\n' | node dist/index.js 2>/dev/null
```
**Expected:** Static ticket data with "cached data" note and buy URL

### Test: Call get-available-tickets (with API key — live data)
```bash
SIMPLESHOP_EMAIL="..." SIMPLESHOP_API_KEY="..." printf '...(init)...\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get-available-tickets","arguments":{}}}\n' | node dist/index.js 2>/dev/null
```
**Expected:** Live ticket data from SimpleShop API

### Test: Call buy-ticket (individual)
**Expected:** Purchase URL, price 12,973 CZK, link to form.simpleshop.cz

### Test: Call buy-ticket (team_pack)
**Expected:** Purchase URL, price 49,375 CZK, "4+1" mentioned

### Test: Call buy-ticket (with discount code)
```bash
DISCOUNT_CODE="MCP2026" printf '...(init)...\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"buy-ticket","arguments":{}}}\n' | node dist/index.js 2>/dev/null
```
**Expected:** Discount code "MCP2026" included in response

---

## 3. Integration Tests (manual — Cloudflare Worker)

### Prerequisites
- `wrangler dev` running locally

### Test: Health check
```bash
curl http://localhost:8787/
```
**Expected:** JSON with `name`, `version`, `mcp_endpoint: "/mcp"`

### Test: MCP initialize
```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}'
```
**Expected:** SSE response with initialize result (server name, capabilities)

### Test: 404 for unknown paths
```bash
curl http://localhost:8787/unknown
```
**Expected:** 404 Not Found

### Test: 406 without proper Accept header
```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```
**Expected:** 406 Not Acceptable (missing `text/event-stream` in Accept)

---

## 4. End-to-End Tests (manual — Claude)

### Test: Claude Desktop / Claude Code with remote URL
1. Add to MCP config:
   ```json
   {
     "mcpServers": {
       "elc-conference": {
         "type": "url",
         "url": "https://elc-conference-mcp.<subdomain>.workers.dev/mcp"
       }
     }
   }
   ```
2. Ask: "Tell me about the ELC Conference"
   - **Expected:** Conference details from `get-conference-info`
3. Ask: "What tickets are available?"
   - **Expected:** Ticket tiers with prices and availability
4. Ask: "I want to buy a ticket"
   - **Expected:** Direct purchase link with price info
5. Ask: "I want tickets for my team of 5"
   - **Expected:** Team Pack option with link

### Test: Claude with stdio (npx)
1. Add to MCP config:
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
2. Run same conversation tests as above

---

## 5. Error Handling Tests

| Scenario | How to Test | Expected |
|----------|------------|----------|
| Invalid API credentials | Set wrong SIMPLESHOP_API_KEY | Error message + fallback buy URL |
| SimpleShop API down | Disconnect network during API call | Error message + fallback buy URL |
| No env vars set | Run without any env vars | Static ticket data (graceful fallback) |
| Invalid tool arguments | Call buy-ticket with `ticket_type: "vip"` | Zod validation error |
| Unknown tool name | Call `tools/call` with `name: "nonexistent"` | MCP error response |
