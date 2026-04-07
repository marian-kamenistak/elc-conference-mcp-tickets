import { createMcpHandler } from "agents/mcp";
import { createServer } from "./server.js";
import { LLMS_TXT } from "./llms-txt.js";
import type { Env } from "./types.js";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          name: "elc-conference-mcp-tickets",
          version: "0.1.0",
          mcp_endpoint: "/mcp",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // llms.txt — AI discoverability
    if (
      (url.pathname === "/llms.txt" || url.pathname === "/.well-known/llms.txt") &&
      request.method === "GET"
    ) {
      return new Response(LLMS_TXT, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // iCal download endpoint
    if (url.pathname === "/ical" && request.method === "GET") {
      const icsContent =
        "BEGIN:VCALENDAR\r\n" +
        "VERSION:2.0\r\n" +
        "PRODID:-//ELC Conference//ELC Conference 2026//EN\r\n" +
        "CALSCALE:GREGORIAN\r\n" +
        "METHOD:PUBLISH\r\n" +
        "BEGIN:VEVENT\r\n" +
        "UID:elc-conference-2026@elc-conference.io\r\n" +
        "DTSTAMP:20260101T000000Z\r\n" +
        "DTSTART:20260416T070000Z\r\n" +
        "DTEND:20260416T190000Z\r\n" +
        "SUMMARY:ELC Conference 2026\r\n" +
        "DESCRIPTION:Engineering leadership conference in Prague. Speakers from Stripe\\,\r\n" +
        " Netflix\\, Microsoft\\, Superhuman\\, Financial Times\\, Google\\, Meta.\\n\r\n" +
        " Workshops\\, 1:1 mentoring\\, afterparty.\\n\\nhttps://elc-conference.io\r\n" +
        "LOCATION:CSOB SHQ\\, Vymolova 353\\, 150 00 Praha 5\\, Czech Republic\r\n" +
        "URL:https://elc-conference.io\r\n" +
        "STATUS:CONFIRMED\r\n" +
        "TRANSP:OPAQUE\r\n" +
        "END:VEVENT\r\n" +
        "END:VCALENDAR\r\n";

      return new Response(icsContent, {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": 'attachment; filename="elc-conference-2026.ics"',
        },
      });
    }

    // MCP endpoint
    if (url.pathname === "/mcp") {
      const server = createServer({
        simpleShopEmail: env.SIMPLESHOP_EMAIL,
        simpleShopApiKey: env.SIMPLESHOP_API_KEY,
        discountCode: env.DISCOUNT_CODE,
      });

      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    return new Response("Not Found", { status: 404 });
  },
};
