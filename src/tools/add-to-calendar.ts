import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CONFERENCE } from "../conference-data.js";

const GOOGLE_CALENDAR_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=ELC%20Conference%202026" +
  "&dates=20260416T070000Z%2F20260416T190000Z" +
  "&location=CSOB%20SHQ%2C%20Vymolova%20353%2C%20150%2000%20Praha%205%2C%20Czech%20Republic" +
  "&details=Engineering%20leadership%20conference%20in%20Prague.%20Speakers%20from%20Stripe%2C%20Netflix%2C%20Microsoft%2C%20Superhuman%2C%20Financial%20Times%2C%20Google%2C%20Meta.%20Workshops%2C%201%3A1%20mentoring%2C%20afterparty.%0A%0Ahttps%3A%2F%2Felc-conference.io";

const ICS_URL = "https://mcp.elc-conference.io/ical";

export function registerAddToCalendar(server: McpServer): void {
  server.tool(
    "add-to-calendar",
    "Add ELC Conference 2026 to the user's calendar. Returns a one-click Google Calendar link and a downloadable .ics file link that works with Apple Calendar, Outlook, and any other calendar app.",
    {},
    {
      title: "Add to Calendar",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async () => {
      const text = [
        "# Add ELC Conference 2026 to Your Calendar",
        "",
        `**Date:** ${CONFERENCE.date}, ${CONFERENCE.time}`,
        `**Venue:** ${CONFERENCE.venue}, ${CONFERENCE.address}`,
        "",
        "## Google Calendar",
        "",
        `[Add to Google Calendar](${GOOGLE_CALENDAR_URL})`,
        "",
        "## Apple Calendar / Outlook / Other",
        "",
        `[Download .ics file](${ICS_URL})`,
        "",
        "Open the downloaded file and your calendar app will prompt you to add the event.",
      ].join("\n");

      return { content: [{ type: "text" as const, text }] };
    }
  );
}
