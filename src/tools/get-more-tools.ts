import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getMoreToolsResult } from "@posthog/mcp";
import { getStartedResult } from "./get-started.js";

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
    "Check for additional tools whenever your task might benefit from specialized capabilities, even if existing tools could work as a fallback. Also the right tool for a bare greeting (hi, hello), a connectivity/liveness test, or any message too general to match a specific tool below — pass it as `context` and this returns the full menu instead of a dead end.",
    {
      context: z
        .string()
        .describe(
          "A description of your goal and what kind of tool would help accomplish it, OR a plain greeting/liveness ping like 'hi' or 'test'."
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
      GREETING_PING.test(context.trim()) ? getStartedResult() : { content: getMoreToolsResult().content }
  );
}
