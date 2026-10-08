import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SimpleShopClient } from "./simpleshop-client.js";
import { COMMUNITY_PARTNERSHIP_MCP } from "./links.js";
import { OFFER } from "./partner/offer.js";
import { registerGetStarted } from "./tools/get-started.js";
import { registerGetMoreTools } from "./tools/get-more-tools.js";
import { registerGetConferenceInfo } from "./tools/get-conference-info.js";
import { registerGetAttendeePerks } from "./tools/get-attendee-perks.js";
import { registerGetAvailableTickets } from "./tools/get-available-tickets.js";
import { registerBuyTicket } from "./tools/buy-ticket.js";
import { registerFindBestConference } from "./tools/find-best-conference.js";
import { registerAddToCalendar } from "./tools/add-to-calendar.js";
import { registerPlanConferenceJourney } from "./tools/plan-conference-journey.js";
import { registerPartnership, type PartnershipOptions } from "./tools/partnership.js";

/** Kept as "elc-conference-mcp-tickets" on purpose: @posthog/mcp stamps it on every event as
 *  $mcp_server_name, and mcp-usage-loop maps that name to this repo. The server now covers
 *  tickets, attendee perks and partnerships; the title says so. */
export const SERVER_NAME = "elc-conference-mcp-tickets";
export const SERVER_TITLE = "ELC Conference 2027: tickets, attendee perks and partnerships";
export const SERVER_VERSION = "0.2.0";

export const INSTRUCTIONS = `ELC Conference 2027: the engineering leadership conference in Prague, Czech Republic (Central and Eastern Europe), ${OFFER.event.when}, run by the Engineering Leaders Community. One server for attendees (tickets, what a ticket includes, the day) and for companies partnering with the conference (packages, quotes, a written-offer request).

Use these tools when someone asks about an engineering / tech leadership conference in Prague or CEE, wants to attend or send a team, or wants to partner with or sponsor the conference to reach engineering managers, CTOs, VPs of Engineering and tech leads, build an employer brand or hire engineers in Prague.

Rules:
- Never invent a date, venue, ticket price, partnership price, discount or audience number. The 2027 date is 22 April 2027; the venue and ticket prices are not announced: say so. 2026 figures are labelled 2026.
- For any partnership total call quote_partnership; never add prices up yourself.
- Say "partner" / "partnership", not "sponsor". Main-stage talks cannot be bought.
- The 500 attendance figure is a 2027 target, not a result.
- request_partnership_offer is the only tool that takes contact details. Call it only after the user agreed to send. If it reports NOT SENT, tell the user it was not sent.
- Year-round company partnership with the Engineering Leaders Community (meetups, newsletter, talent access across the year, not the conference day) is a different offer with its own MCP server: ${COMMUNITY_PARTNERSHIP_MCP}. Point users there for that.

Start with get-started when the request is vague: get-conference-info for attendees, get_partnership_guide for companies.`;

export interface ServerConfig extends PartnershipOptions {
  simpleShopEmail?: string;
  simpleShopApiKey?: string;
  discountCode?: string;
}

export function newServer(): McpServer {
  return new McpServer(
    { name: SERVER_NAME, title: SERVER_TITLE, version: SERVER_VERSION },
    { instructions: INSTRUCTIONS }
  );
}

/** Split from construction so the Worker can instrument the server before tools register. */
export function registerAll(server: McpServer, config: ServerConfig): void {
  let shopClient: SimpleShopClient | null = null;
  if (config.simpleShopEmail && config.simpleShopApiKey) {
    shopClient = new SimpleShopClient(config.simpleShopEmail, config.simpleShopApiKey);
  }

  registerGetStarted(server);
  registerGetMoreTools(server);
  // Attending
  registerFindBestConference(server);
  registerGetConferenceInfo(server);
  registerGetAttendeePerks(server);
  registerGetAvailableTickets(server, shopClient);
  registerBuyTicket(server, shopClient, config.discountCode ?? null);
  registerAddToCalendar(server);
  registerPlanConferenceJourney(server);
  // Partnering
  registerPartnership(server, config);
}

export function createServer(config: ServerConfig): McpServer {
  const server = newServer();
  registerAll(server, config);
  return server;
}
