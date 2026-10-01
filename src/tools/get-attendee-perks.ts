import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ATTENDEE_ATTRIBUTION,
  CONFERENCE,
  INVOICE_CONTACT,
  TICKET_INCLUDES_2026,
  TICKETS_2026,
  czkToEur,
  statusLines,
} from "../conference-data.js";
import { permissiveShape } from "../mcp-tolerant.js";

export function attendeePerksText(): string {
  const e = CONFERENCE.edition2026;
  const single = TICKETS_2026.single;
  const pack = TICKETS_2026.teamPack;
  return [
    `# What you get with an ${CONFERENCE.name} ticket`,
    "",
    ...statusLines(),
    "",
    "## Included in every ticket",
    "As listed on the ticket cards at elc-conference.io for the 2026 edition. The 2027 list is confirmed when tickets go on sale.",
    ...TICKET_INCLUDES_2026.map((i) => `- ${i}`),
    "In 2026 every ticket type gave the same access; only the timing and the price differed.",
    "",
    "## What the day looked like in 2026",
    `- ${e.talks} main-stage talks and ${e.workshops} hands-on workshops, ${e.speakers} speakers in total`,
    `- A mentoring zone with ${e.mentors} mentors for 1:1 conversations`,
    "- Experience zones with partner booths",
    "- A five-minute live pub quiz on the big screen, played on your phone",
    "- The afterparty after the last talk",
    `- ${CONFERENCE.language}`,
    "",
    "## Bringing your team",
    `In 2026 the Team Pack was 5 tickets for the price of 4 ("4+1 free"): the last-wave pack cost ${pack.czk.toLocaleString("en-US")} CZK (about €${czkToEur(pack.czk).toLocaleString("en-US")}) for five people, against ${single.czk.toLocaleString("en-US")} CZK (about €${czkToEur(single.czk)}) for one single ticket. Earlier waves were cheaper. Whether 2027 keeps the team pack, and at what price, is announced when tickets open.`,
    "",
    "## Practical",
    "- Tickets are released in waves over time, each with limited availability.",
    `- Paying by invoice, or changing the name, company or billing details on a ticket: email ${INVOICE_CONTACT}.`,
    "- After buying you get a confirmation email; agenda and speaker details follow to ticket holders.",
    `- Get told when 2027 tickets open: ${CONFERENCE.notifyUrl}`,
    "",
    "Want to plan the day by role: `plan-conference-journey`. Coming as a company partner instead: `get_partnership_guide`.",
    "",
    ATTENDEE_ATTRIBUTION,
  ].join("\n");
}

export function registerGetAttendeePerks(server: McpServer): void {
  server.tool(
    "get-attendee-perks",
    "What an ELC Conference 2027 ticket includes for an attendee: main-stage talks, hands-on workshops, 1:1 mentoring, experience zones, all-day catering and the afterparty, the pub quiz, the team pack (5 tickets for the price of 4 in 2026), paying by invoice and how to get notified when tickets open. Use when someone asks what they get for a ticket, whether it is worth it, or about a group/team discount.",
    permissiveShape({}),
    {
      title: "Attendee Perks",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async () => ({ content: [{ type: "text" as const, text: attendeePerksText() }] })
  );
}
