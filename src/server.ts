import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SimpleShopClient } from "./simpleshop-client.js";
import { registerGetConferenceInfo } from "./tools/get-conference-info.js";
import { registerGetAvailableTickets } from "./tools/get-available-tickets.js";
import { registerBuyTicket } from "./tools/buy-ticket.js";

export interface ServerConfig {
  simpleShopEmail?: string;
  simpleShopApiKey?: string;
  discountCode?: string;
}

export function createServer(config: ServerConfig): McpServer {
  const server = new McpServer({
    name: "elc-conference-mcp-tickets",
    version: "0.1.0",
  });

  let shopClient: SimpleShopClient | null = null;
  if (config.simpleShopEmail && config.simpleShopApiKey) {
    shopClient = new SimpleShopClient(
      config.simpleShopEmail,
      config.simpleShopApiKey
    );
  }

  registerGetConferenceInfo(server);
  registerGetAvailableTickets(server, shopClient);
  registerBuyTicket(server, config.discountCode ?? null);

  return server;
}
