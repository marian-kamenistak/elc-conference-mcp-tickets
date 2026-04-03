import type { ConferenceInfo } from "./types.js";

export const CONFERENCE: ConferenceInfo = {
  name: "ELC Conference 2026",
  date: "April 16, 2026",
  time: "9:00 AM – 9:00 PM CEST",
  venue: "CSOB SHQ (Centrala CSOB)",
  address: "Vymolova 353, 150 00 Praha 5, Czech Republic",
  transit: "Metro Line B, Bus 118/125/153/196/231/232/271/904, Tram 7",
  website: "https://elc-conference.io",
  lumaUrl: "https://luma.com/elc26",
  ticketsUrl: "https://form.simpleshop.cz/qGAKO/buy/",
  capacity: "350–400",
  format:
    "12 main stage speakers, 16 hands-on workshops, 10 mentors for 1:1 sessions, afterparty",
  tagline: "Silicon Valley in Central Europe",
  audience:
    "CTOs, VPs of Engineering, Directors, Engineering Managers, Product Managers, Tech Leads",
  speakers: [
    { name: "Aleodor Tabarcea", title: "Engineering Manager", company: "Stripe" },
    { name: "Michal Matyjek", title: "Sr. Engineering Manager", company: "Netflix" },
    { name: "Carol Palombini", title: "Tech Leadership Coach & Consultant", company: "Independent" },
    { name: "Rizwan Iqbal", title: "Director of Engineering", company: "Superhuman" },
    { name: "Vojta Vondra", title: "Partner Director of Engineering", company: "Microsoft" },
    { name: "Tatiana Stantonian", title: "Principal Engineer", company: "Financial Times" },
    { name: "Jan Zenisek", title: "VP of Product", company: "Apify" },
    { name: "Tomas Rehor", title: "Head of Engineering", company: "Aisle" },
    { name: "TBA", title: "—", company: "Google" },
    { name: "TBA", title: "—", company: "Meta" },
  ],
  topics: [
    "DevEx, platform engineering, and AI adoption in production",
    "Architecture decisions at scale",
    "Product-engineering alignment",
  ],
  whatsIncluded:
    "Full access to: main stage talks, 16 hands-on workshops, 1:1 mentoring sessions, experience zone, afterparty, networking. All tiers grant the same access — only timing/price differs.",
  edition2025Summary:
    "300+ attendees (sold out), speaker rating 4.76/5. Companies: SpaceX, Netflix, Pure Storage, Ataccama, Dynatrace, Rossum, Better Stack, incident.io, Make, Rohlik Group.",
};
