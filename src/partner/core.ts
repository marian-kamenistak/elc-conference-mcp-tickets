/**
 * Pure tool logic: no network, no MCP types. Everything a tool says is built from OFFER
 * (src/partner/offer.ts → src/data/offer-2027.ts). Brand rule: user-facing text says
 * "partner" / "partnership", never "sponsor".
 */
import { COMMUNITY_PARTNERSHIP_MCP } from "../links.js";
import { OFFER, type Addon, type Package } from "./offer.js";

/** Appends ?ref=mcp so traffic from agents is attributable. Not for YouTube links. */
export function ref(url: string): string {
	return url + (url.includes("?") ? "&" : "?") + "ref=mcp";
}

export const ATTRIBUTION = `Source: ELC Conference (Engineering Leaders Community), ${ref(OFFER.links.partner_page)} · deck: ${ref(OFFER.links.deck_pdf)}`;

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
export function eur(n: number): string {
	return `€${NUM.format(n)}`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Today's date in Prague (the contract is Czech), as YYYY-MM-DD. */
export function todayPrague(now: Date = new Date()): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Prague",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
}

export function findPackage(id: string): Package | undefined {
	return OFFER.packages.find((p) => p.id === id);
}
export function findAddon(id: string): Addon | undefined {
	return OFFER.addons.find((a) => a.id === id);
}

function seatsLabel(p: Package): string {
	return p.seats === null ? "open to any number of companies" : `${p.seats} partner places (up to ${p.seats} companies can take this package)`;
}

/* ─────────────────────────── packages and add-ons ─────────────────────────── */

export function packageMarkdown(p: Package): string {
	return [
		`### ${p.name} — ${eur(p.price)} ex VAT`,
		`*${p.tagline}*`,
		`- Partner places: ${seatsLabel(p)}`,
		`- Best for: ${p.best_for.join(", ")}`,
		`- Includes:`,
		...p.includes.map((i) => `  - ${i}`),
		`- Package id: \`${p.id}\``,
	].join("\n");
}

export function addonMarkdown(a: Addon): string {
	return [
		`### ${a.name} — ${eur(a.price)} ex VAT`,
		a.summary,
		...a.includes.map((i) => `- ${i}`),
		`- Availability: ${a.limit === 1 ? "one partner only" : `${a.limit} partners`}`,
		`- Add-on id: \`${a.id}\``,
	].join("\n");
}

export function pricingRulesMarkdown(): string {
	const r = OFFER.pricing_rules;
	return [
		`- Add-ons are sold only together with a package.`,
		`- ${r.second_addon_discount.rule}`,
		`- ${r.early_sign_discount.rule}`,
		`- Renewal: ${r.renewal}`,
		`- Attendee data: ${r.attendee_lists}`,
		`- ${OFFER.vat} Currency: ${OFFER.currency}.`,
	].join("\n");
}

export function listPackagesMarkdown(): string {
	return [
		`# ${OFFER.event.name} — partnership packages`,
		`${OFFER.vat} Offer version ${OFFER.version}, updated ${OFFER.updated}.`,
		"",
		...OFFER.packages.map(packageMarkdown).flatMap((s) => [s, ""]),
		`Add-ons (category exclusivity for Luminary, leadership roundtable, partner workshop) come on top of a package — see \`list_addons\`. The speakers' dinner and the afterparty are not sold separately: Luminary hosts the dinner and names the afterparty. Exact totals with discounts: \`quote_partnership\`.`,
		"",
		ATTRIBUTION,
	].join("\n");
}

export function listAddonsMarkdown(): string {
	return [
		`# ${OFFER.event.name} — add-ons`,
		`Add-ons are only sold together with a package. Each one goes to a single partner.`,
		"",
		...OFFER.addons.map(addonMarkdown).flatMap((s) => [s, ""]),
		`## Pricing rules`,
		pricingRulesMarkdown(),
		"",
		ATTRIBUTION,
	].join("\n");
}

/* ─────────────────────────── comparison ─────────────────────────── */

const pick = (p: Package, re: RegExp) => p.includes.find((i) => re.test(i));

export function compareMarkdown(): string {
	const ps = OFFER.packages;
	const rows: [string, (p: Package) => string][] = [
		["Price (ex VAT)", (p) => eur(p.price)],
		["Partner places (companies)", (p) => (p.seats === null ? "open" : String(p.seats))],
		["Tickets", (p) => pick(p, /tickets?$/i)?.replace(/ tickets?$/i, "") ?? "—"],
		["Booth in the Experience Zone", (p) => (pick(p, /booth/i) ? "yes" : "—")],
		["Speakers' dinner", (p) => {
			const s = pick(p, /speakers' dinner/i);
			if (!s) return "—";
			const n = s.match(/^(\d+) seats? at the speakers' dinner/i);
			return n ? n[1] : "on request";
		}],
		["Newsletter", (p) => pick(p, /newsletter/i) ?? "—"],
		["Listed on website and partner boards", (p) => (pick(p, /listed on the website/i) ? "yes" : "—")],
		["Also included", (p) =>
			p.includes
				.filter((i) => !/tickets?$|booth|speakers' dinner|newsletter|listed on the website/i.test(i))
				.join("; ") || "—"],
		["Best for", (p) => p.best_for.join(", ")],
	];
	const esc = (s: string) => s.replace(/\|/g, "\\|");
	const head = `| | ${ps.map((p) => p.name).join(" | ")} |`;
	const sep = `|---|${ps.map(() => "---").join("|")}|`;
	const body = rows.map(([label, f]) => `| ${label} | ${ps.map((p) => esc(f(p))).join(" | ")} |`);
	return [
		`# ${OFFER.event.name} — package comparison`,
		"",
		head,
		sep,
		...body,
		"",
		`Add-ons on top of any package: ${OFFER.addons.map((a) => `${a.name} ${eur(a.price)}`).join(", ")}. ${OFFER.pricing_rules.second_addon_discount.rule} ${OFFER.pricing_rules.early_sign_discount.rule}`,
		"",
		ATTRIBUTION,
	].join("\n");
}

/* ─────────────────────────── quote ─────────────────────────── */

export interface QuoteInput {
	package?: string;
	addons?: string[];
	sign_date?: string;
	budget_eur?: number;
}

export interface QuoteLine {
	kind: "package" | "addon";
	id: string;
	name: string;
	list_price: number;
	discount_percent: number;
	price: number;
	note?: string;
}

export interface Quote {
	package: string;
	addons: string[];
	sign_date: string;
	/** true when the caller gave no (or a past) sign_date and the quote assumes signing today. */
	sign_date_assumed: boolean;
	budget_eur: number | null;
	lines: QuoteLine[];
	list_total: number;
	addon_discount: number;
	subtotal: number;
	early_sign: { applies: boolean; percent: number; deadline: string; amount: number };
	total_ex_vat: number;
	currency: string;
	renewal_note: string;
	notes: string[];
}

export type QuoteResult = { ok: true; quote: Quote } | { ok: false; error: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
function isValidIsoDate(s: string): boolean {
	if (!ISO_DATE.test(s)) return false;
	const d = new Date(`${s}T00:00:00Z`);
	return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/**
 * Applies OFFER.pricing_rules exactly:
 *  1. add-ons require a package;
 *  2. with 2+ add-ons, the second most expensive add-on is 25% off (ties keep catalogue order);
 *  3. 10% off the whole order, after step 2, if sign_date <= the deadline.
 * `today` is injected so tests are deterministic; a sign_date before today is treated as today
 * (a past date cannot back-date the early-sign discount).
 */
export function quotePartnership(input: QuoteInput, today: string): QuoteResult {
	const rules = OFFER.pricing_rules;
	const addonIds = [...new Set(input.addons ?? [])];
	const notes: string[] = [];
	if ((input.addons?.length ?? 0) !== addonIds.length) notes.push("Duplicate add-ons were removed: each add-on goes to one partner only.");

	if (!input.package) {
		return {
			ok: false,
			error: rules.addons_require_package
				? `Add-ons are sold only together with a package. Pick one of: ${OFFER.packages.map((p) => `\`${p.id}\` (${eur(p.price)})`).join(", ")}.`
				: "A package is required.",
		};
	}
	const pkg = findPackage(input.package);
	if (!pkg) {
		return { ok: false, error: `Unknown package \`${input.package}\`. Valid ids: ${OFFER.packages.map((p) => p.id).join(", ")}.` };
	}
	const unknown = addonIds.filter((id) => !findAddon(id));
	if (unknown.length) {
		return { ok: false, error: `Unknown add-on${unknown.length > 1 ? "s" : ""} ${unknown.map((u) => `\`${u}\``).join(", ")}. Valid ids: ${OFFER.addons.map((a) => a.id).join(", ")}.` };
	}
	// Category exclusivity is sold with Luminary only (offer v2027.3, Marian 2026-10-08).
	const wrongPkg = addonIds.map((id) => findAddon(id)!).filter((a) => a.requires && a.requires !== pkg.id);
	if (wrongPkg.length) {
		return { ok: false, error: `${wrongPkg.map((a) => `\`${a.id}\``).join(", ")} is an add-on to the \`${wrongPkg[0].requires}\` package only, not to \`${pkg.id}\`.` };
	}

	let signDate = input.sign_date?.trim() || today;
	let assumed = !input.sign_date?.trim();
	if (!isValidIsoDate(signDate)) {
		return { ok: false, error: `sign_date must be a real calendar date in YYYY-MM-DD format, e.g. 2026-11-15 (got \`${input.sign_date}\`).` };
	}
	if (signDate < today) {
		notes.push(`sign_date ${signDate} is in the past, so the quote uses today (${today}).`);
		signDate = today;
		assumed = true;
	}

	const lines: QuoteLine[] = [
		{ kind: "package", id: pkg.id, name: pkg.name, list_price: pkg.price, discount_percent: 0, price: pkg.price },
	];

	// Catalogue order is the tiebreak, so sort a copy by price desc with a stable sort.
	const addons = OFFER.addons.filter((a) => addonIds.includes(a.id));
	const byPrice = [...addons].sort((a, b) => b.price - a.price);
	const discounted = byPrice.length >= 2 ? byPrice[1].id : null;
	const pct = rules.second_addon_discount.percent;
	for (const a of byPrice) {
		const off = a.id === discounted ? pct : 0;
		lines.push({
			kind: "addon",
			id: a.id,
			name: a.name,
			list_price: a.price,
			discount_percent: off,
			price: round2(a.price * (1 - off / 100)),
			...(off ? { note: `second most expensive add-on, ${off}% off${byPrice[0].price === a.price ? " (equal prices: catalogue order decides)" : ""}` } : {}),
		});
	}

	const listTotal = lines.reduce((s, l) => s + l.list_price, 0);
	const subtotal = round2(lines.reduce((s, l) => s + l.price, 0));
	const early = rules.early_sign_discount;
	const applies = signDate <= early.deadline;
	const earlyAmount = applies ? round2(subtotal * (early.percent / 100)) : 0;
	const total = round2(subtotal - earlyAmount);

	if (!applies) notes.push(`Signed after ${early.deadline}, so the ${early.percent}% early-sign discount does not apply.`);

	return {
		ok: true,
		quote: {
			package: pkg.id,
			addons: byPrice.map((a) => a.id),
			sign_date: signDate,
			sign_date_assumed: assumed,
			budget_eur: input.budget_eur ?? null,
			lines,
			list_total: listTotal,
			addon_discount: round2(listTotal - subtotal),
			subtotal,
			early_sign: { applies, percent: early.percent, deadline: early.deadline, amount: earlyAmount },
			total_ex_vat: total,
			currency: OFFER.currency,
			renewal_note: rules.renewal,
			notes,
		},
	};
}

export function quoteMarkdown(q: Quote): string {
	const rows = q.lines.map(
		(l) =>
			`| ${l.kind === "package" ? "Package" : "Add-on"}: ${l.name} | ${eur(l.list_price)} | ${l.discount_percent ? `−${l.discount_percent}%` : "—"} | ${eur(l.price)} |`,
	);
	return [
		`# Quote — ${OFFER.event.name} partnership`,
		"",
		`| Item | List price | Discount | Price |`,
		`|---|---|---|---|`,
		...rows,
		`| **Subtotal** | ${eur(q.list_total)} | ${q.addon_discount ? `−${eur(q.addon_discount)}` : "—"} | **${eur(q.subtotal)}** |`,
		q.early_sign.applies
			? `| Early-sign discount (contract signed by ${q.early_sign.deadline}${q.sign_date_assumed ? `; this quote assumes signing today, ${q.sign_date}` : `; planned signature ${q.sign_date}`}) | | −${q.early_sign.percent}% | −${eur(q.early_sign.amount)} |`
			: `| Early-sign discount (deadline ${q.early_sign.deadline}) | | not applicable | ${eur(0)} |`,
		`| **Total ex VAT** | | | **${eur(q.total_ex_vat)}** |`,
		"",
		...(q.early_sign.applies ? [`- Nothing is signed yet. Signed after ${q.early_sign.deadline}, the same order costs ${eur(q.subtotal)} ex VAT.`] : []),
		...(q.budget_eur !== null
			? [q.total_ex_vat <= q.budget_eur
				? `- Budget ${eur(q.budget_eur)}: this fits, ${eur(round2(q.budget_eur - q.total_ex_vat))} to spare.${q.early_sign.applies && q.subtotal > q.budget_eur ? ` Only if signed by ${q.early_sign.deadline}: without the early-sign discount it is ${eur(round2(q.subtotal - q.budget_eur))} over.` : ""}`
				: `- Budget ${eur(q.budget_eur)}: this is ${eur(round2(q.total_ex_vat - q.budget_eur))} over.${q.lines.length > 1 && q.lines[0].price * (q.early_sign.applies ? 1 - q.early_sign.percent / 100 : 1) <= q.budget_eur ? ` The ${q.lines[0].name} package alone is ${eur(round2(q.lines[0].price * (q.early_sign.applies ? 1 - q.early_sign.percent / 100 : 1)))} and fits.` : ""}`]
			: []),
		...q.lines.filter((l) => l.note).map((l) => `- ${l.name}: ${l.note}.`),
		...q.notes.map((n) => `- ${n}`),
		`- Renewal: ${q.renewal_note}`,
		`- The discounts above are the only published ones; anything else is a conversation on a call: ${OFFER.links.book_a_call}`,
		`- ${OFFER.vat} This is an indicative quote computed from the published offer; the contract is the binding document.`,
		"",
		`Next step: \`request_partnership_offer\` sends this to the ELC team, or book a call: ${OFFER.links.book_a_call}`,
		"",
		ATTRIBUTION,
	]
		.filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
		.join("\n");
}

/* ─────────────────────────── recommendation ─────────────────────────── */

export const GOALS = ["hiring", "brand", "grow_leaders", "early_adopters", "reach_executives"] as const;
export type Goal = (typeof GOALS)[number];

/** Deterministic: a goal matches a package's best_for (2 points) or, failing that, one of its
 *  inclusions (1 point). Add-on hints are fixed per goal and quoted with their own summaries. */
const GOAL_RULES: Record<Goal, { label: string; bestFor: RegExp | null; includes: RegExp | null; addons: string[] }> = {
	hiring: { label: "hiring engineers", bestFor: /hiring/i, includes: /ELC Jobs/i, addons: ["partner-workshop"] },
	brand: { label: "brand / employer brand", bestFor: /brand|name on the day|partner of the day/i, includes: /booth|newsletter|afterparty/i, addons: ["category-exclusivity"] },
	grow_leaders: { label: "growing your own engineering leaders", bestFor: /growing your own leaders/i, includes: /mentoring sessions|workshop or mentor slot/i, addons: ["category-exclusivity", "roundtable"] },
	early_adopters: { label: "meeting early adopters (startups)", bestFor: /early adopters|startups/i, includes: null, addons: ["partner-workshop"] },
	reach_executives: { label: "reaching CTOs, VPs and engineering directors", bestFor: /meeting buyers/i, includes: /speakers' dinner|introductions by name/i, addons: ["roundtable"] },
};

export interface Recommendation {
	goals: Goal[];
	budget_eur: number | null;
	early_sign_applies: boolean;
	ranked: { id: string; name: string; price: number; effective_price: number; score: number; fits_budget: boolean; reasons: string[] }[];
	pick: string | null;
	addon_ideas: { id: string; name: string; price: number; why: string }[];
}

export function recommendPackage(goals: Goal[], budget: number | undefined, today: string): Recommendation {
	const uniqueGoals = [...new Set(goals)];
	const early = OFFER.pricing_rules.early_sign_discount;
	const earlyApplies = today <= early.deadline;
	const factor = earlyApplies ? 1 - early.percent / 100 : 1;

	const ranked = OFFER.packages
		.map((p) => {
			let score = 0;
			const reasons: string[] = [];
			for (const g of uniqueGoals) {
				const rule = GOAL_RULES[g];
				const bf = rule.bestFor ? p.best_for.find((b) => rule.bestFor!.test(b)) : undefined;
				if (bf) {
					score += 2;
					reasons.push(`${rule.label}: listed as best for "${bf}"`);
					continue;
				}
				const inc = rule.includes ? p.includes.find((i) => rule.includes!.test(i)) : undefined;
				if (inc) {
					score += 1;
					reasons.push(`${rule.label}: includes "${inc}"`);
				}
			}
			const effective = Math.round(p.price * factor * 100) / 100;
			return { id: p.id, name: p.name, price: p.price, effective_price: effective, score, fits_budget: budget === undefined || effective <= budget, reasons };
		})
		.sort((a, b) => Number(b.fits_budget) - Number(a.fits_budget) || b.score - a.score || b.price - a.price);

	const top = ranked.find((r) => r.fits_budget && r.score > 0) ?? null;
	const remaining = budget === undefined || !top ? undefined : budget - top.effective_price;
	const addonIds = [...new Set(uniqueGoals.flatMap((g) => GOAL_RULES[g].addons))];
	const addon_ideas = addonIds
		.map((id) => findAddon(id)!)
		.filter((a) => remaining === undefined || a.price * factor <= remaining)
		.map((a) => ({ id: a.id, name: a.name, price: a.price, why: a.summary }));

	return { goals: uniqueGoals, budget_eur: budget ?? null, early_sign_applies: earlyApplies, ranked, pick: top?.id ?? null, addon_ideas };
}

export function recommendationMarkdown(r: Recommendation): string {
	const early = OFFER.pricing_rules.early_sign_discount;
	const top = r.ranked.find((x) => x.id === r.pick);
	const alt = r.ranked.find((x) => x.id !== r.pick && x.fits_budget && x.score > 0);
	const lines: string[] = [`# Recommended ${OFFER.event.name} partnership`, ""];
	lines.push(`Goals: ${r.goals.map((g) => GOAL_RULES[g].label).join("; ")}. Budget: ${r.budget_eur === null ? "not given" : `${eur(r.budget_eur)} ex VAT`}.`);
	if (r.early_sign_applies) lines.push(`Budget fit uses the ${early.percent}% early-sign price (contract signed by ${early.deadline}).`);
	lines.push("");
	if (!top) {
		const cheapest = [...OFFER.packages].sort((a, b) => a.price - b.price)[0];
		const anyMatch = r.ranked.filter((x) => x.score > 0);
		lines.push(
			r.budget_eur !== null && anyMatch.length
				? `No package matching these goals fits ${eur(r.budget_eur)}. Closest match${anyMatch.length > 1 ? "es" : ""}: ${anyMatch.map((x) => `${x.name} ${eur(x.price)}${r.early_sign_applies ? ` (${eur(x.effective_price)} if signed by ${early.deadline})` : ""}`).join(", ")}. The smallest package is ${cheapest.name} at ${eur(cheapest.price)}.`
				: `No package matches these goals directly. The smallest package is ${cheapest.name} at ${eur(cheapest.price)}; a call is the fastest way to shape something: ${OFFER.links.book_a_call}`,
		);
		lines.push(
			"",
			`If what you want is year-round (meetups, newsletter, talent access across the year) rather than the conference day, that is a separate offer with its own MCP server and smaller entry points: ${COMMUNITY_PARTNERSHIP_MCP}`,
			"Just want to be there? Tickets are the cheapest way: `get-available-tickets`.",
		);
	} else {
		lines.push(`## Pick: ${top.name} — ${eur(top.price)} ex VAT${r.early_sign_applies ? ` (${eur(top.effective_price)} if signed by ${early.deadline})` : ""}`);
		lines.push("Why:", ...top.reasons.map((x) => `- ${x}`));
		lines.push("", packageMarkdown(findPackage(top.id)!));
		if (alt) {
			lines.push("", `## Alternative: ${alt.name} — ${eur(alt.price)} ex VAT`, ...alt.reasons.map((x) => `- ${x}`));
		}
	}
	if (r.addon_ideas.length && top) {
		lines.push("", "## Add-ons worth a look", ...r.addon_ideas.map((a) => `- ${a.name} (${eur(a.price)}, \`${a.id}\`): ${a.why}`));
		if (r.addon_ideas.length >= 2) lines.push(`${OFFER.pricing_rules.second_addon_discount.rule} Each add-on above fits the remaining budget on its own; check a combination with \`quote_partnership\` and \`budget_eur\`.`);
	}
	if (r.goals.includes("brand") || r.goals.includes("reach_executives")) {
		lines.push("", `Note: ${OFFER.event.principle} ${OFFER.pricing_rules.attendee_lists}`);
	}
	if (top) lines.push("", `Exact total: \`quote_partnership\` with package \`${top.id}\`.`);
	lines.push("", ATTRIBUTION);
	return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}

/* ─────────────────────────── audience, media, guide ─────────────────────────── */

export function audienceMarkdown(): string {
	const p = OFFER.proof;
	return [
		`# ${OFFER.event.name} — audience and proof`,
		"",
		`## The conference`,
		`- Attendees, ELC Conference 2026: ${p.attendees_2026}`,
		`- Attendees, ELC Conference 2027: ${p.attendees_target_2027}`,
		`- Attendee rating (2026): ${p.rating} / 5`,
		`- Companies represented at ELC Conference 2026: ${p.companies_2026}`,
		`- Programme 2026: ${p.programme_2026.talks} talks, ${p.programme_2026.workshops} workshops, ${p.programme_2026.speakers} speakers, ${p.programme_2026.mentors} mentors`,
		"",
		`## Who is in the room`,
		`${p.headline_claim} (Basis: ${p.headline_claim_basis})`,
		"",
		`## Attendee mix, #ELC2025`,
		`| Group | Share (#ELC2025) |`,
		`|---|---|`,
		...p.attendee_mix_2025.map((m) => `| ${m.group} | ${m.share}% |`),
		"",
		`## The community behind it (Engineering Leaders Community)`,
		`- Community members: ${p.community_members}, of whom ${p.manager_and_above} are manager level and above`,
		`- Newsletter: ${p.newsletter_subscribers} subscribers, ${p.newsletter_opens_per_issue} opens per issue`,
		`- Meetups since 2019: ${p.meetups_since_2019}, in ${p.cities.join(", ")}`,
		`- Partners hire ${p.partner_hires_per_month} people a month from the ELC community`,
		"",
		`## Speakers have come from`,
		p.speaker_companies.join(", "),
		"",
		...p.speaker_wall.map((w) => `- ${w.company}: ${w.speaker}, ${w.role} (spoke in ${w.year})`),
		"",
		`## Past partners`,
		p.past_partners.join(", "),
		"",
		`Principle: ${OFFER.event.principle}`,
		"",
		ATTRIBUTION,
	].join("\n");
}

export const youtube = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export function mediaMarkdown(): string {
	const l = OFFER.links;
	return [
		`# ${OFFER.event.name} — media for partners`,
		"",
		`## Videos`,
		...l.videos.map((v) => `- ${v.title}: ${youtube(v.id)}`),
		`- All videos: ${l.youtube_channel}`,
		"",
		`## Pages`,
		`- Partner page (packages, add-ons, FAQ): ${ref(l.partner_page)}`,
		`- 2026 speakers: ${ref(l.speakers_2026)}`,
		`- 2025 recap: ${ref(l.recap_2025)}`,
		`- Photo gallery: ${ref(l.gallery)}`,
		`- Call for speakers: ${ref(l.call_for_speakers)}`,
		"",
		`## PDFs`,
		`- Partner deck (PDF): ${l.deck_pdf}`,
		`- One-pager (PDF): ${l.one_pager_pdf}`,
		"",
		ATTRIBUTION,
	].join("\n");
}

export function contactsMarkdown(): string {
	return OFFER.contacts.map((c) => `- ${c.name}, ${c.role}: ${c.email}`).join("\n");
}

export function guideMarkdown(): string {
	const e = OFFER.event;
	const p = OFFER.proof;
	const l = OFFER.links;
	return [
		`# ${e.name} — partnership guide`,
		"",
		`${e.name} is the engineering leadership conference in ${e.where}, run by ${e.organiser}. ${e.when}. ${e.format}.`,
		"",
		`**Principle:** ${e.principle}`,
		"",
		`## Audience`,
		`- ${p.headline_claim}`,
		`- ${p.attendees_2026} attendees at ELC Conference 2026, rated ${p.rating} / 5, from ${p.companies_2026} companies; ${p.attendees_target_2027} for 2027`,
		`- #ELC2025 attendee mix: ${p.attendee_mix_2025.map((m) => `${m.group} ${m.share}%`).join(", ")}`,
		`- Community behind it: ${p.community_members} members (${p.manager_and_above} manager and above), newsletter ${p.newsletter_subscribers} subscribers`,
		`- Speakers have come from ${p.speaker_companies.join(", ")}`,
		`- Partners hire ${p.partner_hires_per_month} people a month from the ELC community`,
		"",
		`## Packages (${OFFER.vat.toLowerCase().replace(/\.$/, "")})`,
		`| Package | Price | Seats | Best for | Headline inclusions |`,
		`|---|---|---|---|---|`,
		...OFFER.packages.map(
			(pk) => `| ${pk.name} (\`${pk.id}\`) | ${eur(pk.price)} | ${pk.seats ?? "open"} | ${pk.best_for.join(", ")} | ${pk.includes.slice(0, 3).join("; ")} |`,
		),
		"",
		`## Add-ons (with a package, one partner each)`,
		...OFFER.addons.map((a) => `- ${a.name} (\`${a.id}\`) ${eur(a.price)}: ${a.summary}`),
		"",
		`## Pricing rules`,
		pricingRulesMarkdown(),
		"",
		`## Links`,
		`- Partner page: ${ref(l.partner_page)}`,
		`- Partner deck (PDF): ${l.deck_pdf}`,
		`- One-pager (PDF): ${l.one_pager_pdf}`,
		`- Video, Become a Partner of ELC 27: ${youtube(l.videos[0].id)}`,
		`- Book a call with Marian: ${l.book_a_call}`,
		"",
		`## Contacts`,
		contactsMarkdown(),
		"",
		`Tools for the next step: \`compare_packages\`, \`recommend_package\`, \`quote_partnership\`, \`request_partnership_offer\`.`,
		"",
		`Looking for a year-round partnership with the Engineering Leaders Community (meetups, newsletter, talent access, all year) rather than the conference day? That is a separate offer with its own MCP server: ${COMMUNITY_PARTNERSHIP_MCP}`,
		"",
		ATTRIBUTION,
	].join("\n");
}
