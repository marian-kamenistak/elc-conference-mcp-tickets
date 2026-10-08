/**
 * Attendee-side facts about ELC Conference 2027. Every value is sourced; nothing is guessed.
 *
 * Sources (checked 2026-10-01):
 *  - OFFER (src/data/offer-2027.ts, the canonical 2027 offer): event name, "22 April 2027" (Marian,
 *    2026-10-08; venue to be announced), format, 2026 results, 2027 target, past speakers.
 *  - www.elc-conference.io homepage: "April 2027 · Prague, Czechia", "Notify me — ELC 27 tickets"
 *    (→ /subscribe), the ticket cards' inclusions, the FAQ (audience, topics, English, invoices).
 *  - 2026 edition (16 April 2026, SHQ Centrála ČSOB) and 2026 ticket names/prices: SimpleShop
 *    product qGAKO as recorded in this repo, cross-checked against the 2026 budget sheet in
 *    research/2027-offering/01-internal-evidence.md §4.
 *  - 2026 pub quiz: the live quiz app built for the 2026 edition (elcc/ai_kahoot).
 *
 * Not known yet, so never stated: the 2027 date, the 2027 venue, 2027 ticket prices, 2027 speakers.
 */
import { OFFER } from "./partner/offer.js";
import { NOTIFY_URL, SITE } from "./links.js";

const P = OFFER.proof;

export const CONFERENCE = {
  name: OFFER.event.name,
  when: OFFER.event.when,
  /** ISO date of the 2027 edition once announced (Marian, 2026-10-08: 2027-04-22); empty until then. */
  dateIso: OFFER.event.date ?? "",
  city: "Prague, Czechia",
  venue: "to be announced",
  website: SITE,
  notifyUrl: NOTIFY_URL,
  callForSpeakers: OFFER.links.call_for_speakers,
  partnerPage: OFFER.links.partner_page,
  gallery: OFFER.links.gallery,
  tagline: "Own. Lead. Evolve.",
  format: OFFER.event.format,
  language: "English. All talks and official programming are in English.",
  /** "500" — the offer says "500 (target)"; callers label it as a target themselves. */
  attendeesTarget2027: P.attendees_target_2027.replace(/\s*\(target\)\s*$/i, ""),
  audience:
    "Current leaders (CTOs, VPs of Engineering, Engineering Managers, Tech Leads), product and strategy (Product Managers, technical founders) and future leaders (senior engineers preparing to step up).",
  headlineClaim: `${P.headline_claim} (Basis: ${P.headline_claim_basis})`,
  topics: [
    "Engineering leadership",
    "Scaling teams",
    "AI in product development",
    "System architecture",
    "Innovation culture",
    "Technology strategy",
  ],
  principle: OFFER.event.principle,
  speakerSelection: `${OFFER.event.principle} The 2027 speakers are not announced yet; the call for speakers is open at ${OFFER.links.call_for_speakers}.`,
  pastSpeakers: P.speaker_wall.map((w) => ({ name: w.speaker, role: w.role, company: w.company, year: w.year })),
  ticketStatus2027: `Tickets for ${OFFER.event.name} are not on sale yet and no 2027 price has been announced. Get notified when they open: ${NOTIFY_URL}`,
  edition2026: {
    date: "16 April 2026",
    venue: "SHQ Centrála ČSOB, Výmolova 353/3, 150 00 Praha 5",
    attendees: P.attendees_2026,
    rating: P.rating,
    companies: P.companies_2026,
    talks: P.programme_2026.talks,
    workshops: P.programme_2026.workshops,
    speakers: P.programme_2026.speakers,
    mentors: P.programme_2026.mentors,
  },
  edition2025Summary: "300+ attendees (sold out), speaker rating 4.76/5.",
} as const;

/** What a ticket included, as listed on the ticket cards at elc-conference.io (2026 tickets).
 *  Every 2026 ticket type gave the same access; only timing and price differed. */
export const TICKET_INCLUDES_2026 = [
  "Full conference access: every main-stage talk",
  "Deep-dive workshops included (no extra charge)",
  "1:1 mentoring sessions",
  "Experience zones",
  "All-day catering and the afterparty",
] as const;

/** 2026 reference prices (CZK), last wave only: the 3rd-wave prices are the ones confirmed by
 *  both the SimpleShop product and the 2026 budget sheet. Earlier waves were cheaper.
 *  2027 prices are not announced. */
export const TICKETS_2026 = {
  single: { name: "3rd wave, Senior Leader", czk: 12973 },
  teamPack: { name: "3rd wave, Senior Leader Team Pack (sold as \"4+1 free\")", czk: 49375, tickets: 5 },
  czkPerEur: 25.2,
} as const;

export const czkToEur = (czk: number) => Math.round(czk / TICKETS_2026.czkPerEur);

/** Ticket names are wave names ("Senior Leader" is the 3rd wave), not roles; VAT treatment of the
 *  2026 prices is not stated in our records. Said once wherever 2026 prices appear. */
export const PRICE_NOTES_2026 = "Ticket names are wave names, not roles: \"Senior Leader\" was the 3rd and last wave, open to anyone. The VAT treatment of these 2026 prices is not stated in our records.";

/** 2026 reference cost for a group: team packs of 5 plus single last-wave tickets. */
export function groupCost2026(quantity: number): { packs: number; singles: number; czk: number } {
  const packs = Math.floor(quantity / TICKETS_2026.teamPack.tickets);
  const singles = quantity - packs * TICKETS_2026.teamPack.tickets;
  return { packs, singles, czk: packs * TICKETS_2026.teamPack.czk + singles * TICKETS_2026.single.czk };
}

export const INVOICE_CONTACT = "weare@engineeringleaders.io";

/** Last line of every attendee-side answer. */
export const ATTENDEE_ATTRIBUTION = `Source: ELC Conference (Engineering Leaders Community), ${SITE}/?ref=mcp`;

/** The 2027 status lines every attendee tool repeats, so none can contradict another. */
export function statusLines(): string[] {
  return [
    `- When: ${CONFERENCE.when}`,
    `- Where: ${CONFERENCE.city}. Venue: ${CONFERENCE.venue} (2026 edition: ${CONFERENCE.edition2026.venue})`,
    `- Tickets: ${CONFERENCE.ticketStatus2027}`,
  ];
}
