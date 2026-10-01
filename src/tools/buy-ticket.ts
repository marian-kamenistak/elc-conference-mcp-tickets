import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CONFERENCE } from "../conference-data.js";
import {
  ignoredNotice,
  parseArgs,
  permissiveShape,
  type ParseResult,
} from "../mcp-tolerant.js";

const BUY_URL = "https://form.simpleshop.cz/qGAKO/buy/";

/* The real argument contract. `server.tool` advertises `permissiveShape(BUY_TICKET_SHAPE)` —
 * the field optional, the number widened to accept `"2"` as well as 2 — and the handler
 * enforces the shape below through `parseArgs`. See `src/mcp-tolerant.ts` for why. */
const BUY_TICKET_SHAPE = {
  quantity: z
    .number()
    .int()
    .min(1)
    .describe("Number of people attending"),
};

/** Renders a `parseArgs` failure through the same `{ content: [text] }` envelope every other
 *  answer here uses, so a caller never has to parse a second result shape.
 *
 *  `probe` is the difference between a caller asking what the tool wants and a caller getting
 *  it wrong, and the two deserve different answers. A bare `{}` is a question and is answered
 *  as a normal result carrying the field menu; arguments that were supplied and rejected stay
 *  an error. */
function guidance(parsed: Extract<ParseResult<unknown>, { ok: false }>) {
  const result = { content: [{ type: "text" as const, text: parsed.message }] };
  return parsed.probe ? result : { ...result, isError: true as const };
}

export function registerBuyTicket(
  server: McpServer,
  discountCode: string | null
): void {
  server.tool(
    "buy-ticket",
    "Get a direct purchase link for ELC Conference 2026 tickets. IMPORTANT: Before calling this tool, always ask the user how many people they are buying tickets for. Use that number as the 'quantity' argument. The tool returns an order summary with price, date, venue, and purchase URL.",
    permissiveShape(BUY_TICKET_SHAPE),
    {
      title: "Buy Ticket",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async (raw) => {
      const parsed = parseArgs("buy-ticket", BUY_TICKET_SHAPE, raw);
      if (!parsed.ok) return guidance(parsed);
      const { quantity } = parsed.data;

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

      return {
        content: [
          {
            type: "text" as const,
            text:
              lines.join("\n") +
              ignoredNotice("buy-ticket", parsed.ignored, BUY_TICKET_SHAPE),
          },
        ],
      };
    }
  );
}
