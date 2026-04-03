import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CONFERENCE } from "../conference-data.js";

export function registerGetConferenceInfo(server: McpServer): void {
  server.tool(
    "get-conference-info",
    "Get details about the ELC Conference 2026 — date, venue, speakers, topics, what's included, and ticket link. Use this when someone asks about the conference.",
    {},
    {
      title: "Get Conference Info",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async () => {
      const speakerList = CONFERENCE.speakers
        .map((s) =>
          s.name === "TBA"
            ? `  - TBA (${s.company})`
            : `  - ${s.name} — ${s.title}, ${s.company}`
        )
        .join("\n");

      const topicList = CONFERENCE.topics
        .map((t) => `  - ${t}`)
        .join("\n");

      const text = [
        `# ${CONFERENCE.name}`,
        `"${CONFERENCE.tagline}"`,
        "",
        `Date: ${CONFERENCE.date}, ${CONFERENCE.time}`,
        `Venue: ${CONFERENCE.venue}`,
        `Address: ${CONFERENCE.address}`,
        `Getting there: ${CONFERENCE.transit}`,
        `Capacity: ${CONFERENCE.capacity}`,
        "",
        "## What to expect",
        CONFERENCE.format,
        "",
        "## Who should attend",
        CONFERENCE.audience,
        "",
        "## Confirmed Speakers",
        speakerList,
        "",
        "## Topics & Themes",
        topicList,
        "",
        "## What's Included",
        CONFERENCE.whatsIncluded,
        "",
        "## 2025 Edition Highlights",
        CONFERENCE.edition2025Summary,
        "",
        "## Links",
        `Website: ${CONFERENCE.website}`,
        `Event page: ${CONFERENCE.lumaUrl}`,
        `Buy tickets: ${CONFERENCE.ticketsUrl}`,
      ].join("\n");

      return { content: [{ type: "text" as const, text }] };
    }
  );
}
