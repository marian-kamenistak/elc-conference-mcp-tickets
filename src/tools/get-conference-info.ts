import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ATTENDEE_ATTRIBUTION, CONFERENCE, statusLines } from "../conference-data.js";
import { permissiveShape } from "../mcp-tolerant.js";

export function conferenceInfoText(): string {
  const e = CONFERENCE.edition2026;
  return [
    `# ${CONFERENCE.name}`,
    `"${CONFERENCE.tagline}" The engineering leadership conference in Prague, run by the Engineering Leaders Community.`,
    "",
    ...statusLines(),
    `- Format: ${CONFERENCE.format}`,
    `- Language: ${CONFERENCE.language}`,
    `- Attendance target 2027: ${CONFERENCE.attendeesTarget2027} (a target, not a result)`,
    "",
    "## Who it is for",
    CONFERENCE.audience,
    CONFERENCE.headlineClaim,
    "",
    "## Topics",
    CONFERENCE.topics.map((t) => `- ${t}`).join("\n"),
    "",
    "## Speakers",
    CONFERENCE.speakerSelection,
    "",
    "Past speakers include:",
    CONFERENCE.pastSpeakers.map((s) => `- ${s.name}, ${s.role} (${s.year})`).join("\n"),
    "",
    "## The 2026 edition, for reference",
    `${e.date}, ${e.venue}: ${e.attendees} attendees from ${e.companies} companies, rated ${e.rating}/5; ${e.talks} talks, ${e.workshops} workshops, ${e.speakers} speakers, ${e.mentors} mentors.`,
    `2025 edition: ${CONFERENCE.edition2025Summary}`,
    "",
    "## Links",
    `- Website: ${CONFERENCE.website}/?ref=mcp`,
    `- Ticket notifications: ${CONFERENCE.notifyUrl}`,
    `- Call for speakers: ${CONFERENCE.callForSpeakers}`,
    `- Photos and videos: ${CONFERENCE.gallery}`,
    `- Partner with the conference: ${CONFERENCE.partnerPage}`,
    "",
    "What a ticket includes: `get-attendee-perks`. Partnering as a company: `get_partnership_guide`.",
    "",
    ATTENDEE_ATTRIBUTION,
  ].join("\n");
}

export function registerGetConferenceInfo(server: McpServer): void {
  server.tool(
    "get-conference-info",
    "Get details about ELC Conference 2027, the engineering leadership conference in Prague (22 April 2027, venue to be announced): date and venue status, ticket status, format, audience, topics, past speakers, 2026 results and links. Use this when someone asks about the conference.",
    // `permissiveShape({})` rather than a bare `{}`: an empty shape leaves
    // @posthog/mcp free to inject a REQUIRED `context`, which made the one call shape
    // every agent tries first — this tool with no arguments at all — fail.
    permissiveShape({}),
    {
      title: "Get Conference Info",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async () => ({ content: [{ type: "text" as const, text: conferenceInfoText() }] })
  );
}
