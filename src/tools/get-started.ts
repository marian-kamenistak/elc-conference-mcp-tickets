import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { permissiveShape } from "../mcp-tolerant.js";
import { getStartedText } from "../menu.js";

/** Shared by both `get-started` and `get_more_tools`'s greeting branch (see
 *  get-more-tools.ts). The menu itself lives in src/menu.ts, which the docs page reads too. */
export function getStartedResult(): { content: { type: "text"; text: string }[] } {
  return { content: [{ type: "text" as const, text: getStartedText() }] };
}

export function registerGetStarted(server: McpServer): void {
  server.tool(
    "get-started",
    "Call this for a greeting (hi, hello), a connectivity/liveness test, 'what can you do', or any message too general to match a specific tool below. Returns the full menu of real questions this server answers (tickets, attendee perks, partnerships with ELC Conference 2027), each mapped to the tool name that answers it, so the next call can go straight to the right tool.",
    // `permissiveShape({})` rather than a bare `{}`: an empty shape leaves
    // @posthog/mcp free to inject a REQUIRED `context`, so the front door of this
    // server rejected the one call shape every agent tries first — `get-started`
    // with no arguments at all.
    permissiveShape({}),
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
