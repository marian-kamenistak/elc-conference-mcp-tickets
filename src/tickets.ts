import type { SimpleShopClient } from "./simpleshop-client.js";
import type { SimpleShopProduct, Ticket } from "./types.js";
import { TICKETS_2026 } from "./conference-data.js";

/** A 2027 ticket product in SimpleShop: not archived, not in test mode, and named for 2027.
 *  The 2026 form (qGAKO) is archived, so until a 2027 product exists this finds nothing and
 *  every ticket tool says tickets are not on sale yet. It never falls back to an old form. */
export function isTicketProduct2027(p: SimpleShopProduct): boolean {
  const label = `${p.name ?? ""} ${p.title ?? ""}`.toLowerCase();
  return !p.archived && !p.test_mode && /2027|elc\s?27\b/.test(label);
}

export const buyUrl = (p: SimpleShopProduct) => `https://form.simpleshop.cz/${p.code}/buy/`;

export type TicketLookup =
  | { state: "on_sale"; product: SimpleShopProduct; url: string; tickets: Ticket[] }
  | { state: "not_on_sale" }
  | { state: "unknown"; reason: string };

export async function lookupTickets(client: SimpleShopClient | null): Promise<TicketLookup> {
  if (!client) return { state: "unknown", reason: "live shop data is not available from this copy of the server" };
  try {
    const product = (await client.listProducts()).find(isTicketProduct2027);
    if (!product) return { state: "not_on_sale" };
    const tickets: Ticket[] = product.variants.map((v) => {
      const priceCZK = Math.round(parseFloat(v.price));
      // The API returns quantity as the string "0" when sold out, a number when available.
      const remaining = v.quantity === null ? null : Number(v.quantity);
      return {
        name: v.name,
        priceCZK,
        priceEUR: Math.round(priceCZK / TICKETS_2026.czkPerEur),
        remaining,
        status: remaining === 0 ? "sold_out" : "available",
      };
    });
    return { state: "on_sale", product, url: buyUrl(product), tickets };
  } catch (error) {
    return { state: "unknown", reason: `the ticket shop did not answer (${error instanceof Error ? error.message.slice(0, 80) : "error"})` };
  }
}
