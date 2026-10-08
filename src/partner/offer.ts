/**
 * The ELC Conference 2027 partner offer. ONE source: ~/ai/business/elcc/data/conference-offer-2027.json
 * (the same file behind https://www.elc-conference.io/partner/), copied into src/data/offer-2027.ts by
 * scripts/sync-offer.mjs before every build and deploy. Never type a price into this repo by hand.
 */
import raw from "../data/offer-2027.js";

export interface Package {
	id: string;
	name: string;
	price: number;
	seats: number | null;
	tagline: string;
	best_for: string[];
	includes: string[];
}

export interface Addon {
	id: string;
	name: string;
	price: number;
	limit: number;
	/** Package id this add-on needs (category exclusivity: luminary). Absent = any package. */
	requires?: string;
	summary: string;
	includes: string[];
}

export interface Offer {
	version: string;
	updated: string;
	currency: string;
	vat: string;
	event: { name: string; when: string; date?: string; where: string; format: string; organiser: string; principle: string };
	proof: {
		attendees_2026: string;
		attendees_target_2027: string;
		rating: string;
		companies_2026: number;
		programme_2026: { talks: number; workshops: number; speakers: number; mentors: number };
		community_members: string;
		manager_and_above: string;
		newsletter_opens_per_issue: string;
		newsletter_subscribers: string;
		meetups_since_2019: string;
		cities: string[];
		partner_hires_per_month: number;
		attendee_mix_2025: { group: string; share: number }[];
		speaker_companies: string[];
		past_partners: string[];
		speaker_wall: { company: string; speaker: string; role: string; year: number }[];
		headline_claim: string;
		headline_claim_basis: string;
	};
	packages: Package[];
	addons: Addon[];
	pricing_rules: {
		addons_require_package: boolean;
		second_addon_discount: { percent: number; rule: string };
		early_sign_discount: { percent: number; deadline: string; rule: string };
		renewal: string;
		attendee_lists: string;
	};
	links: {
		partner_page: string;
		deck_pdf: string;
		one_pager_pdf: string;
		gallery: string;
		speakers_2026: string;
		recap_2025: string;
		call_for_speakers: string;
		youtube_channel: string;
		videos: { id: string; title: string }[];
		book_a_call: string;
	};
	contacts: { name: string; role: string; email: string }[];
}

export const OFFER: Offer = raw as Offer;

export const PACKAGE_IDS = OFFER.packages.map((p) => p.id) as [string, ...string[]];
export const ADDON_IDS = OFFER.addons.map((a) => a.id) as [string, ...string[]];
