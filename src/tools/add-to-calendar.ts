import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ATTENDEE_ATTRIBUTION, CONFERENCE } from "../conference-data.js";
import { permissiveShape } from "../mcp-tolerant.js";

/** No calendar file until the 2027 date is announced: a guessed date in someone's calendar is
 *  worse than none. When the date is set, add it to CONFERENCE and build the links from it. */
export function calendarText(): string {
  return [
    `# Add ${CONFERENCE.name} to your calendar`,
    "",
    `The date is not announced yet: ${CONFERENCE.when}, ${CONFERENCE.city}. There is no calendar entry to add until it is, and a guessed date would only mislead.`,
    "",
    `- Get the date, and the first ticket wave, by email: ${CONFERENCE.notifyUrl}`,
    `- If you want a placeholder now, add a reminder for April 2027 titled "${CONFERENCE.name}, Prague (date TBA)" and replace it once the date is out.`,
    "",
    "For reference, the 2026 edition ran on 16 April 2026, 9:00 to 21:00 including the afterparty.",
    "",
    ATTENDEE_ATTRIBUTION,
  ].join("\n");
}

export function registerAddToCalendar(server: McpServer): void {
  server.tool(
    "add-to-calendar",
    "Add ELC Conference 2027 to the user's calendar. The exact 2027 date is not announced yet, so this explains that and how to get notified, instead of creating an entry with a guessed date.",
    // `permissiveShape({})` rather than a bare `{}`: an empty shape leaves
    // @posthog/mcp free to inject a REQUIRED `context`, which made the one call shape
    // every agent tries first — this tool with no arguments at all — fail.
    permissiveShape({}),
    {
      title: "Add to Calendar",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async () => ({ content: [{ type: "text" as const, text: calendarText() }] })
  );
}
