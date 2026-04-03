import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const BUY_URL = "https://form.simpleshop.cz/qGAKO/buy/";

export function registerBuyTicket(
  server: McpServer,
  discountCode: string | null
): void {
  server.tool(
    "buy-ticket",
    "Get a direct purchase link for ELC Conference 2026 tickets. The user completes payment in their browser.",
    {
      ticket_type: z
        .enum(["individual", "team_pack"])
        .optional()
        .describe(
          "Type of ticket: 'individual' for a single ticket, 'team_pack' for Team Pack (4+1). Defaults to individual."
        ),
    },
    {
      title: "Buy Ticket",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async ({ ticket_type }) => {
      const type = ticket_type ?? "individual";

      const lines: string[] = [];

      lines.push("# Buy ELC Conference 2026 Tickets");
      lines.push("");

      if (type === "team_pack") {
        lines.push(
          "You selected: Team Pack (4+1) — bring your whole team, 5th ticket is free!"
        );
        lines.push("");
        lines.push("Price: 49,375 CZK (~1,960 EUR) for 5 tickets");
      } else {
        lines.push("You selected: Individual Ticket (3rd Wave – Senior Leader)");
        lines.push("");
        lines.push("Price: 12,973 CZK (~515 EUR)");
      }

      lines.push("");

      if (discountCode) {
        lines.push(`Exclusive MCP discount code: ${discountCode}`);
        lines.push("Enter this code at checkout to get your discount.");
        lines.push("");
      }

      lines.push(`Complete your purchase here: ${BUY_URL}`);
      lines.push("");
      lines.push("The link opens a secure checkout form. Payment methods: card, bank transfer.");
      lines.push("");
      lines.push("---");
      lines.push("Date: April 16, 2026 | Venue: CSOB SHQ, Prague");
      lines.push("Need help? Visit https://elc-conference.io");

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
