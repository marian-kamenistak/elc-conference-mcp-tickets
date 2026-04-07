import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CONFERENCE } from "../conference-data.js";

const BUY_URL = "https://form.simpleshop.cz/qGAKO/buy/";

export function registerBuyTicket(
  server: McpServer,
  discountCode: string | null
): void {
  server.tool(
    "buy-ticket",
    "Get a direct purchase link for ELC Conference 2026 tickets. IMPORTANT: Before calling this tool, always ask the user how many people they are buying tickets for. Use that number as the 'quantity' argument. The tool returns an order summary with price, date, venue, and purchase URL.",
    {
      quantity: z
        .number()
        .int()
        .min(1)
        .describe("Number of people attending"),
    },
    {
      title: "Buy Ticket",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async ({ quantity }) => {
      const isTeamPack = quantity >= 5;

      const lines: string[] = [];

      lines.push("# Order Summary — ELC Conference 2026");
      lines.push("");

      if (isTeamPack) {
        lines.push(`**Tickets:** Team Pack (4+1 Free) — best value for ${quantity} people`);
        lines.push("**Price:** 49,375 CZK (~1,960 EUR) for 5 tickets (~392 EUR/person)");
        lines.push("**Availability:** 1 Team Pack remaining");
      } else {
        const totalCzk = (12973 * quantity).toLocaleString("cs-CZ");
        const totalEur = 515 * quantity;
        lines.push(`**Tickets:** ${quantity}× Individual — 3rd Wave Senior Leader`);
        if (quantity > 1) {
          lines.push(`**Price:** 12,973 CZK (~515 EUR) per ticket — total ~${totalCzk} CZK (~${totalEur} EUR)`);
        } else {
          lines.push("**Price:** 12,973 CZK (~515 EUR)");
        }
        lines.push("**Availability:** 15 individual tickets remaining");
      }

      lines.push("");
      lines.push("---");
      lines.push("");
      lines.push(`**Date:** ${CONFERENCE.date}, ${CONFERENCE.time}`);
      lines.push(`**Venue:** ${CONFERENCE.venue}, ${CONFERENCE.address}`);
      lines.push(`**Getting there:** ${CONFERENCE.transit}`);
      lines.push("**Included:** Main stage talks, 16 workshops, 1:1 mentoring, afterparty & networking");
      lines.push("");
      lines.push("---");
      lines.push("");

      if (discountCode) {
        lines.push(`**Discount code:** \`${discountCode}\` — enter this at checkout`);
        lines.push("");
      }

      lines.push(`**Purchase link:** ${BUY_URL}`);
      lines.push("");
      lines.push("Payment methods: card or bank transfer.");

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
