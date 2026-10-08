import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ATTENDEE_ATTRIBUTION, CONFERENCE } from "../conference-data.js";
import { permissiveShape } from "../mcp-tolerant.js";

/** Calendar links are built only from CONFERENCE.dateIso (the announced date, from the canonical
 *  offer). With no date there is no calendar entry: a guessed date in someone's calendar is worse
 *  than none. Venue is "to be announced" until the offer carries one. */
export function calendarText(): string {
  if (!CONFERENCE.dateIso) {
    return [
      `# Add ${CONFERENCE.name} to your calendar`,
      "",
      `The date is not announced yet: ${CONFERENCE.when}, ${CONFERENCE.city}. There is no calendar entry to add until it is, and a guessed date would only mislead.`,
      "",
      `- Get the date, and the first ticket wave, by email: ${CONFERENCE.notifyUrl}`,
      "",
      ATTENDEE_ATTRIBUTION,
    ].join("\n");
  }
  const d = CONFERENCE.dateIso.replace(/-/g, "");
  const next = new Date(CONFERENCE.dateIso + "T00:00:00Z");
  next.setUTCDate(next.getUTCDate() + 1);
  const d2 = next.toISOString().slice(0, 10).replace(/-/g, "");
  const title = encodeURIComponent(CONFERENCE.name);
  const details = encodeURIComponent(`${CONFERENCE.name}, Prague. Tickets and programme: https://www.elc-conference.io/`);
  const location = encodeURIComponent(`${CONFERENCE.city} (venue to be announced)`);
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${d}/${d2}&details=${details}&location=${location}`;
  return [
    `# Add ${CONFERENCE.name} to your calendar`,
    "",
    `${CONFERENCE.when}, ${CONFERENCE.city}. Venue: ${CONFERENCE.venue}. All-day entry; the programme times follow once the agenda is out (the 2026 edition ran 9:00 to 21:00 including the afterparty).`,
    "",
    `- Google Calendar: ${google}`,
    "- Other calendars: save this as elc-conference-2027.ics",
    "",
    "```",
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ELC Conference//2027//EN",
    "BEGIN:VEVENT",
    `UID:elc-conference-${CONFERENCE.dateIso}@elc-conference.io`,
    `DTSTART;VALUE=DATE:${d}`,
    `DTEND;VALUE=DATE:${d2}`,
    `SUMMARY:${CONFERENCE.name}`,
    `LOCATION:${CONFERENCE.city} (venue to be announced)`,
    "URL:https://www.elc-conference.io/",
    "END:VEVENT",
    "END:VCALENDAR",
    "```",
    "",
    `- Tickets: ${CONFERENCE.ticketStatus2027}`,
    "",
    ATTENDEE_ATTRIBUTION,
  ].join("\n");
}

export function registerAddToCalendar(server: McpServer): void {
  server.tool(
    "add-to-calendar",
    "Add ELC Conference 2027 (22 April 2027, Prague) to the user's calendar: a Google Calendar link and an .ics entry built from the announced date. Venue to be announced.",
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
