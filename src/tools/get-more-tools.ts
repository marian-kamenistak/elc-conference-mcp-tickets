import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getMoreToolsResult } from "@posthog/mcp";
import { getStartedResult } from "./get-started.js";
import { COMMUNITY_PARTNERSHIP_MCP } from "../links.js";
import { OFFER } from "../partner/offer.js";

/** Appended to the SDK's capability-gap acknowledgement, so a real described need still gets the
 *  three answers people most often look for here instead of a dead end (persona test 2026-10-01). */
function routingHints(): string {
  return [
    "The three things people most often look for here:",
    `- A year-round partnership with the Engineering Leaders Community (meetups, newsletter, talent access across the year, not the conference day): a separate MCP server, ${COMMUNITY_PARTNERSHIP_MCP}`,
    `- A paid main-stage talk or the attendee list: neither is for sale. ${OFFER.event.principle} ${OFFER.pricing_rules.attendee_lists}`,
    "- Anything else about the conference, tickets or partnering: call `get-started` for the full menu.",
  ].join("\n");
}

/** Matches a bare liveness/greeting ping — "hi", "test", "are you there" — as opposed to a
 *  real described capability gap. Deliberately an exact (trimmed, punctuation-stripped)
 *  match, not a "starts with": a genuine gap report is a sentence, and a loose prefix match
 *  would swallow real ones that happen to start with a greeting word. */
const GREETING_PING =
  /^(hi+|hello+|hey+|yo+|sup|howdy|hola|ahoy|ping|test(ing)?|are you (there|working|alive)|is (this|anyone) (working|there)|still there|you there|greetings|what('?s| is) up)[.!?\s]*$/i;

/**
 * Overrides `@posthog/mcp`'s auto-injected `get_more_tools` virtual tool (see
 * mcp-usage.ts) with a real registration under the same name. `instrument()`
 * checks whether a real tool already owns that name before injecting the
 * virtual one — when it does, the real registration below runs instead, and
 * a genuine capability report still gets tracked as a normal tool call.
 *
 * Registering it here closes a real gap: a probing agent calling
 * `get_more_tools` with a trivial context like "test" or "hello" (a liveness
 * ping, not a real capability request) previously got the canned "we noted
 * your feedback" dead end instead of the get-started menu.
 */
export function registerGetMoreTools(server: McpServer): void {
  server.tool(
    "get_more_tools",
    "Check for additional tools whenever your task might benefit from specialized capabilities, even if existing tools could work as a fallback. Also the right tool for a bare greeting (hi, hello), a connectivity/liveness test, or any message too general to match a specific tool below — pass it as `context`, or send no arguments at all, and this returns the full menu instead of a dead end.",
    {
      // Optional: this is the tool an agent reaches for first, and answering its bare
      // `{}` with "expected string, received undefined" is the worst possible front door.
      context: z
        .string()
        .optional()
        .describe(
          "A description of your goal and what kind of tool would help accomplish it, OR a plain greeting/liveness ping like 'hi' or 'test'. Omit it for the menu."
        ),
    },
    {
      title: "More tools? Check here first — also answers a plain hello/liveness ping",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async ({ context }) =>
      !context || GREETING_PING.test(context.trim())
        ? getStartedResult()
        : { content: [{ type: "text" as const, text: routingHints() }, ...getMoreToolsResult().content] }
  );
}
