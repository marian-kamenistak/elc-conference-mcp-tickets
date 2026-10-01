import { CONFERENCE } from "./conference-data.js";
import { COMMUNITY_PARTNERSHIP_MCP, DOCS_URL, MCP_ENDPOINT, REPO_URL } from "./links.js";
import { TOOL_MENU } from "./menu.js";
import { OFFER } from "./partner/offer.js";

const tools = (group: "attend" | "partner") =>
  TOOL_MENU.filter((t) => t.group === group).map((t) => `- ${t.name}: ${t.question}`).join("\n");

export const LLMS_TXT = `# ${CONFERENCE.name}: MCP server (tickets, attendee perks, partnerships)

> ${CONFERENCE.name} is the engineering leadership conference in ${CONFERENCE.city}, ${CONFERENCE.when}, run by the Engineering Leaders Community. This MCP server answers attendee questions (tickets, what a ticket includes, planning the day) and partnership questions (packages, add-ons, exact quotes, audience proof, a written-offer request) from the published data.

## Status
- Date: ${CONFERENCE.when}
- Venue: ${CONFERENCE.venue}
- Tickets: ${CONFERENCE.ticketStatus2027}
- 2026 edition: ${CONFERENCE.edition2026.attendees} attendees from ${CONFERENCE.edition2026.companies} companies, rated ${CONFERENCE.edition2026.rating}/5. Attendance target 2027: ${CONFERENCE.attendeesTarget2027}.
- ${CONFERENCE.headlineClaim}

## Tools: attending
${tools("attend")}

## Tools: partnering with the conference
${tools("partner")}

## Connect
- Endpoint: ${MCP_ENDPOINT} (streamable HTTP, no auth)
- Docs: ${DOCS_URL}
- Source: ${REPO_URL}
- Claude Code: claude mcp add -t http elc-conference ${MCP_ENDPOINT}

## Links
- [Conference site](https://www.elc-conference.io/)
- [Partner page](${OFFER.links.partner_page})
- [Partner deck (PDF)](${OFFER.links.deck_pdf})
- [Year-round community partnership MCP server](${COMMUNITY_PARTNERSHIP_MCP})
`;
