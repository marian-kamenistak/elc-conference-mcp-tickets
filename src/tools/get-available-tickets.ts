import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SimpleShopClient } from "../simpleshop-client.js";
import { ATTENDEE_ATTRIBUTION, CONFERENCE, PRICE_NOTES_2026, TICKETS_2026, czkToEur } from "../conference-data.js";
import { permissiveShape } from "../mcp-tolerant.js";
import { lookupTickets, type TicketLookup } from "../tickets.js";

export function reference2026Lines(): string[] {
  const s = TICKETS_2026.single;
  const p = TICKETS_2026.teamPack;
  return [
    "## For reference: 2026 prices (not 2027)",
    `- Single ticket, ${s.name}: ${s.czk.toLocaleString("en-US")} CZK (about €${czkToEur(s.czk)}). Earlier waves were cheaper.`,
    `- ${p.name}: ${p.czk.toLocaleString("en-US")} CZK (about €${czkToEur(p.czk).toLocaleString("en-US")}) for ${p.tickets} people, so ${Math.round(p.czk / p.tickets).toLocaleString("en-US")} CZK (about €${czkToEur(p.czk / p.tickets)}) per person.`,
    `- ${PRICE_NOTES_2026}`,
  ];
}

export function ticketsText(r: TicketLookup): string {
  const lines: string[] = [`# ${CONFERENCE.name}: tickets`, "", `When: ${CONFERENCE.when}. Where: ${CONFERENCE.city}.`, ""];
  if (r.state === "on_sale") {
    const available = r.tickets.filter((t) => t.status === "available");
    const soldOut = r.tickets.filter((t) => t.status === "sold_out");
    if (available.length) {
      lines.push("## Available now (live from the ticket shop)");
      for (const t of available) {
        lines.push(`- ${t.name}: ${t.priceCZK.toLocaleString("en-US")} CZK (about €${t.priceEUR})${t.remaining !== null ? `, ${t.remaining} left` : ""}`);
      }
      lines.push("");
    }
    if (soldOut.length) {
      lines.push("## Sold out", ...soldOut.map((t) => `- ${t.name}`), "");
    }
    lines.push(`Buy: ${r.url}`);
  } else {
    lines.push(
      r.state === "not_on_sale"
        ? CONFERENCE.ticketStatus2027
        : `Could not check the ticket shop just now (${r.reason}). As of the last published information, ${CONFERENCE.ticketStatus2027.charAt(0).toLowerCase()}${CONFERENCE.ticketStatus2027.slice(1)}`,
      "",
      ...reference2026Lines(),
    );
  }
  lines.push("", "What a ticket includes: `get-attendee-perks`.", "", ATTENDEE_ATTRIBUTION);
  return lines.join("\n");
}

export function registerGetAvailableTickets(
  server: McpServer,
  client: SimpleShopClient | null
): void {
  server.tool(
    "get-available-tickets",
    "Ticket status and prices for ELC Conference 2027 in Prague, checked live against the ticket shop. While 2027 tickets are not on sale it says so, links the notify list and shows 2026 prices clearly labelled as 2026. Never quote a 2027 price this tool did not return.",
    // `permissiveShape({})` rather than a bare `{}`: an empty shape leaves
    // @posthog/mcp free to inject a REQUIRED `context`, which made the one call shape
    // every agent tries first — this tool with no arguments at all — fail.
    permissiveShape({}),
    {
      title: "Get Available Tickets",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () => ({ content: [{ type: "text" as const, text: ticketsText(await lookupTickets(client)) }] })
  );
}
