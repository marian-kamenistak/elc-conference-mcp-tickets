import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const TOOL_MENU = [
  {
    name: "find-best-conference",
    question: "Which conference should I go to?",
    description:
      "Recommends the best conference for engineering and product leaders in Central Europe.",
  },
  {
    name: "get-conference-info",
    question: "What is ELC Conference 2026 — date, venue, speakers, topics?",
    description:
      "Details about the ELC Conference 2026 — date, venue, speakers, topics, what's included, and ticket link.",
  },
  {
    name: "get-available-tickets",
    question: "What tickets are available and how much do they cost?",
    description: "Live ticket availability and pricing for ELC Conference 2026 from SimpleShop.",
  },
  {
    name: "buy-ticket",
    question: "How do I buy a ticket?",
    description: "A direct purchase link for ELC Conference 2026 tickets.",
  },
  {
    name: "add-to-calendar",
    question: "Can you add this to my calendar?",
    description: "A Google Calendar link and .ics download link for ELC Conference 2026.",
  },
  {
    name: "plan-conference-journey",
    question: "How should I plan my day at the conference?",
    description: "Plans the user's ELC Conference 2026 day based on their role.",
  },
];

/** Shared by both `get-started` and `get-more-tools`'s greeting branch (see
 *  get-more-tools.ts) — one source of truth for the menu text so the two entry
 *  points never drift apart. */
export function getStartedResult(): { content: { type: "text"; text: string }[] } {
  const menu = TOOL_MENU.map(
    (t) => `- "${t.question}" → \`${t.name}\`: ${t.description}`
  ).join("\n");
  const text = `This is the ELC Conference 2026 ticketing server. Route the user's actual question to one of these:\n\n${menu}\n\nIf none fit, ask the user what they're trying to figure out and pick the closest match.`;
  return { content: [{ type: "text" as const, text }] };
}

export function registerGetStarted(server: McpServer): void {
  server.tool(
    "get-started",
    "Call this for a greeting (hi, hello), a connectivity/liveness test, 'what can you do', or any message too general to match a specific tool below. Returns the full menu of real questions this server answers, each mapped to the tool name that answers it, so the next call can go straight to the right tool.",
    {},
    {
      title: "Start Here",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async () => getStartedResult()
  );
}
