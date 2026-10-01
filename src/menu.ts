/**
 * The one list of tools, phrased as the question each answers. Read by `get-started`,
 * `get_more_tools` (greeting branch), the GET /mcp docs page, /mcp/info and /llms.txt,
 * so the menus can never drift apart.
 */
import { COMMUNITY_PARTNERSHIP_MCP } from "./links.js";
import { OFFER } from "./partner/offer.js";

export type MenuGroup = "attend" | "partner";
export interface MenuItem {
  name: string;
  group: MenuGroup;
  question: string;
  description: string;
}

export const TOOL_MENU: MenuItem[] = [
  // Attending: tickets, perks, the day
  { name: "find-best-conference", group: "attend", question: "Which conference should an engineering or product leader in Central Europe go to?", description: "ELC Conference 2027 against the alternatives, with the 2026 results." },
  { name: "get-conference-info", group: "attend", question: "What is ELC Conference 2027: when, where, who speaks, what topics?", description: "Date status, city, format, audience, topics, past speakers, 2026 results, links." },
  { name: "get-attendee-perks", group: "attend", question: "What do I get with a ticket, and is there a team deal?", description: "What a ticket includes (talks, workshops, 1:1 mentoring, experience zones, catering, afterparty), the 2026 team pack (sold as 4+1 free), invoices." },
  { name: "get-available-tickets", group: "attend", question: "Are tickets on sale, and what do they cost?", description: "Live ticket status from the shop; 2026 prices for reference while 2027 prices are not out." },
  { name: "buy-ticket", group: "attend", question: "How do I buy tickets for me or my team?", description: "Purchase link when tickets are on sale, otherwise the notify list; team pack for 5+." },
  { name: "add-to-calendar", group: "attend", question: "Can you put it in my calendar?", description: "Calendar status: the 2027 date is not announced yet, so it says how to get notified." },
  { name: "plan-conference-journey", group: "attend", question: "How should I plan my day there, given my role?", description: "Role-based plan: themes, workshops, mentoring, networking." },
  // Partnering: packages, quotes, offer request
  { name: "get_partnership_guide", group: "partner", question: "How can my company partner with ELC Conference 2027 in Prague?", description: "The whole guide: event, principle, audience, packages, add-ons, pricing rules, links, contacts." },
  { name: "list_packages", group: "partner", question: "What partnership packages are there and what do they cost?", description: "All four packages with price, seats and inclusions." },
  { name: "get_package", group: "partner", question: "What exactly is in the Partner / Luminary / Navigator / Pioneer package?", description: "One package in full." },
  { name: "list_addons", group: "partner", question: "What can we add on top (speakers' dinner, afterparty, roundtable, workshop)?", description: "Add-ons, availability and pricing rules." },
  { name: "compare_packages", group: "partner", question: "How do the packages differ?", description: "Side-by-side table across all packages." },
  { name: "recommend_package", group: "partner", question: "Which package fits our goal (hiring, brand, growing leaders, early adopters, reaching executives) and budget?", description: "Deterministic pick with the reasons." },
  { name: "quote_partnership", group: "partner", question: "What would package + add-ons cost us, with discounts?", description: "Line items, add-on discount, early-sign discount, total ex VAT." },
  { name: "get_audience_and_proof", group: "partner", question: "Who attends, and how do we know it works?", description: "Who is in the room, attendance, rating, #ELC2025 attendee mix, speaker wall, community reach, past partners." },
  { name: "get_media", group: "partner", question: "Do you have videos, photos or a deck we can show internally?", description: "YouTube videos, gallery, speakers, 2025 recap, partner page, PDFs." },
  { name: "request_partnership_offer", group: "partner", question: "How do we get a written offer?", description: "Sends the request to the ELC team (the only tool that takes contact details)." },
];

export function getStartedText(): string {
  const line = (t: MenuItem) => `- "${t.question}" → \`${t.name}\`: ${t.description}`;
  return [
    `This is the ${OFFER.event.name} server: tickets, attendee perks and partnerships for the engineering leadership conference in Prague, ${OFFER.event.when}. Route the user's question to one of these:`,
    "",
    "## Attending",
    ...TOOL_MENU.filter((t) => t.group === "attend").map(line),
    "",
    "## Partnering with the conference",
    ...TOOL_MENU.filter((t) => t.group === "partner").map(line),
    "",
    `Year-round company partnership with the Engineering Leaders Community (not the conference day): that is a separate MCP server, ${COMMUNITY_PARTNERSHIP_MCP}`,
    "",
    "If none fit: `get-conference-info` for attendees, `get_partnership_guide` for companies.",
  ].join("\n");
}
