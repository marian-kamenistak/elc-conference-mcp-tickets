import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SimpleShopClient } from "../simpleshop-client.js";
import type { Ticket } from "../types.js";

const CZK_TO_EUR = 25.2;
const BUY_URL = "https://form.simpleshop.cz/qGAKO/buy/";
const PRODUCT_CODE = "qGAKO"; // ELC Conference 2026 form code

export function registerGetAvailableTickets(
  server: McpServer,
  client: SimpleShopClient | null
): void {
  server.tool(
    "get-available-tickets",
    "Get live ticket availability and pricing for ELC Conference 2026. Shows ticket tiers, prices in CZK and EUR, remaining count, and a direct purchase link.",
    {},
    {
      title: "Get Available Tickets",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () => {
      if (!client) {
        return {
          content: [{ type: "text" as const, text: getStaticTicketInfo() }],
        };
      }

      try {
        const products = await client.listProducts();

        // Find the active 2026 conference product by form code
        const conference = products.find(
          (p) => p.code === PRODUCT_CODE && !p.archived
        );

        if (!conference) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Conference product not found in SimpleShop. Check directly: ${BUY_URL}`,
              },
            ],
          };
        }

        const tickets: Ticket[] = conference.variants.map((v) => {
          const priceCZK = Math.round(parseFloat(v.price));
          // API returns quantity as string "0" for sold-out, number for available
          const remaining =
            v.quantity === null ? null : Number(v.quantity);
          return {
            name: v.name,
            priceCZK,
            priceEUR: Math.round(priceCZK / CZK_TO_EUR),
            remaining,
            status:
              (remaining === 0 ? "sold_out" : "available") as Ticket["status"],
          };
        });

        const available = tickets.filter((t) => t.status === "available");
        const soldOut = tickets.filter((t) => t.status === "sold_out");

        const lines: string[] = ["# ELC Conference 2026 — Tickets", ""];

        if (available.length > 0) {
          lines.push("## Available");
          for (const t of available) {
            const remaining =
              t.remaining !== null ? `${t.remaining} remaining` : "Available";
            lines.push(
              `- ${t.name}: ${t.priceCZK.toLocaleString()} CZK (~${t.priceEUR} EUR) — ${remaining}`
            );
          }
          lines.push("");
        }

        if (soldOut.length > 0) {
          lines.push("## Sold Out");
          for (const t of soldOut) {
            lines.push(`- ~~${t.name}~~: SOLD OUT`);
          }
          lines.push("");
        }

        lines.push(`Buy now: ${BUY_URL}`);

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to fetch live ticket data: ${msg}\n\nCheck availability directly: ${BUY_URL}`,
            },
          ],
        };
      }
    }
  );
}

function getStaticTicketInfo(): string {
  return [
    "# ELC Conference 2026 — Tickets",
    "",
    "## Available",
    "- 3rd Wave – Senior Leader: 12,973 CZK (~515 EUR) — 16 remaining",
    "- 3rd Wave – Senior Leader Team Pack (4+1 Free): 49,375 CZK (~1,960 EUR) — 1 remaining",
    "",
    "## Sold Out",
    "- ~~1st Wave – Early Adopter~~: SOLD OUT",
    "- ~~2nd Wave – The Leader~~: SOLD OUT",
    "- ~~1st Wave – Early Team Pack (4+1 Free)~~: SOLD OUT",
    "- ~~2nd Wave – Leader Team Pack (4+1 Free)~~: SOLD OUT",
    "",
    "Note: This is cached data. Live data requires SimpleShop API credentials.",
    "",
    `Buy now: ${BUY_URL}`,
  ].join("\n");
}
