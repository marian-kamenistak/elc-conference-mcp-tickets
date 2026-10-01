import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ATTENDEE_ATTRIBUTION, CONFERENCE, INVOICE_CONTACT } from "../conference-data.js";
import { SimpleShopClient } from "../simpleshop-client.js";
import { lookupTickets, type TicketLookup } from "../tickets.js";
import { reference2026Lines } from "./get-available-tickets.js";
import {
  ignoredNotice,
  parseArgs,
  permissiveShape,
  type ParseResult,
} from "../mcp-tolerant.js";

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

export function buyTicketText(quantity: number, r: TicketLookup, discountCode: string | null): string {
  const team = quantity >= 5;
  const lines: string[] = [`# ${CONFERENCE.name}: tickets for ${quantity} ${quantity === 1 ? "person" : "people"}`, ""];
  if (r.state === "on_sale") {
    const available = r.tickets.filter((t) => t.status === "available");
    lines.push("## On sale now (live from the ticket shop)");
    lines.push(...(available.length ? available.map((t) => `- ${t.name}: ${t.priceCZK.toLocaleString("en-US")} CZK (about €${t.priceEUR})${t.remaining !== null ? `, ${t.remaining} left` : ""}`) : ["- Every ticket type is sold out right now."]));
    if (team) lines.push("", "For 5 or more people, look for a team pack in the list above: in 2026 it was 5 tickets for the price of 4.");
    if (discountCode) lines.push("", `Discount code: \`${discountCode}\` (enter it at checkout).`);
    lines.push("", `Buy: ${r.url}`, "Payment: card or bank transfer.");
  } else {
    lines.push(
      r.state === "not_on_sale"
        ? CONFERENCE.ticketStatus2027
        : `Could not check the ticket shop just now (${r.reason}). As of the last published information, 2027 tickets are not on sale yet. Notify list: ${CONFERENCE.notifyUrl}`,
      "",
      `Nothing can be bought yet, so there is no purchase link. Join the notify list (${CONFERENCE.notifyUrl}) to hear when the first, cheapest wave opens.`,
    );
    if (team) lines.push("", `For a group of ${quantity}: in 2026 the Team Pack gave 5 tickets for the price of 4. Ask about a team deal when tickets open.`);
    lines.push("", ...reference2026Lines());
  }
  lines.push(
    "",
    `Invoice payment or changes to ticket details: ${INVOICE_CONTACT}.`,
    `When: ${CONFERENCE.when}. Where: ${CONFERENCE.city}.`,
    "",
    "What a ticket includes: `get-attendee-perks`.",
    "",
    ATTENDEE_ATTRIBUTION,
  );
  return lines.join("\n");
}

export function registerBuyTicket(
  server: McpServer,
  client: SimpleShopClient | null,
  discountCode: string | null
): void {
  server.tool(
    "buy-ticket",
    "Buy ELC Conference 2027 tickets: returns the live purchase link when tickets are on sale, otherwise says plainly that they are not on sale yet and gives the notify list, with the team pack (5 for the price of 4 in 2026) for groups of 5+. IMPORTANT: before calling, ask the user how many people the tickets are for and pass that as 'quantity'.",
    permissiveShape(BUY_TICKET_SHAPE),
    {
      title: "Buy Ticket",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async (raw) => {
      const parsed = parseArgs("buy-ticket", BUY_TICKET_SHAPE, raw);
      if (!parsed.ok) return guidance(parsed);
      const text = buyTicketText(parsed.data.quantity, await lookupTickets(client), discountCode);
      return {
        content: [{ type: "text" as const, text: text + ignoredNotice("buy-ticket", parsed.ignored, BUY_TICKET_SHAPE) }],
      };
    }
  );
}
