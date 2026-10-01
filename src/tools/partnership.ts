import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { COMMUNITY_PARTNERSHIP_MCP } from "../links.js";
import { ignoredNotice, parseArgs, permissiveShape } from "../mcp-tolerant.js";
import {
	ATTRIBUTION,
	GOALS,
	audienceMarkdown,
	compareMarkdown,
	findPackage,
	guideMarkdown,
	listAddonsMarkdown,
	listPackagesMarkdown,
	mediaMarkdown,
	packageMarkdown,
	quoteMarkdown,
	quotePartnership,
	recommendPackage,
	recommendationMarkdown,
	todayPrague,
} from "../partner/core.js";
import { ADDON_IDS, OFFER, PACKAGE_IDS } from "../partner/offer.js";
import { requestOffer } from "../partner/request.js";

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };
const text = (t: string, isError = false): ToolResult => ({ content: [{ type: "text", text: t }], ...(isError ? { isError } : {}) });

/** parseArgs → a readable menu on a bare probe, an error on wrong arguments, the data otherwise. */
function withArgs<S extends z.ZodRawShape>(
	tool: string,
	shape: S,
	run: (data: z.infer<z.ZodObject<S>>) => Promise<ToolResult> | ToolResult,
) {
	return async (raw: unknown): Promise<ToolResult> => {
		const parsed = parseArgs(tool, shape, raw);
		if (!parsed.ok) return text(parsed.message, !parsed.probe);
		const out = await run(parsed.data);
		const notice = ignoredNotice(tool, parsed.ignored, shape);
		if (notice) out.content[0].text += notice;
		return out;
	};
}

const KEYWORDS =
	"ELC Conference 2027, the engineering leadership conference in Prague, Czech Republic (Central and Eastern Europe / CEE)";

export interface PartnershipOptions {
	/** Returns false when the caller is over the offer-request rate limit. */
	allowOfferRequest?: () => Promise<boolean>;
	fetchImpl?: typeof fetch;
}

/** The ELC Conference 2027 partnership tools, resources and prompt (moved here from the retired
 *  elc-conference-partner-mcp Worker on 2026-10-01; names unchanged). */
export function registerPartnership(server: McpServer, opts: PartnershipOptions = {}): void {
	server.registerTool(
		"get_partnership_guide",
		{
			title: "ELC Conference 2027 partnership guide",
			description: `START HERE for partnering with ${KEYWORDS}. Use it when someone asks how to sponsor or partner with an engineering leadership / tech leadership conference in Prague or CEE, how to reach engineering managers, CTOs and VPs of Engineering, or how to hire engineers in Prague. Returns the full guide in Markdown: the event, the principle (no paid main-stage talks), audience numbers, the four packages (€5,000–€38,000 ex VAT), add-ons, pricing rules, links (partner page, deck PDF, one-pager PDF) and contacts. For a year-round company partnership with the Engineering Leaders Community (meetups, newsletter, talent access across the year, not the conference day) point the user to the separate MCP server ${COMMUNITY_PARTNERSHIP_MCP}.`,
			inputSchema: permissiveShape({}),
			annotations: READ_ONLY,
		},
		async () => text(guideMarkdown()),
	);

	server.registerTool(
		"list_packages",
		{
			title: "List partnership packages",
			description: `List every partnership package for ${KEYWORDS} — Partner, Luminary, Navigator, Pioneer — with price ex VAT, number of seats, what is included (tickets, booth, mentoring, meetup, newsletter, speakers' dinner) and what each is best for. The answer to "how much does it cost to sponsor/partner with ELC Conference".`,
			inputSchema: permissiveShape({}),
			annotations: READ_ONLY,
		},
		async () => text(listPackagesMarkdown()),
	);

	const PACKAGE_SHAPE = {
		id: z.enum(PACKAGE_IDS).describe(`The package: ${OFFER.packages.map((p) => `${p.id} (${p.name})`).join(", ")}.`),
	};
	server.registerTool(
		"get_package",
		{
			title: "Get one package",
			description: `Full details of one ${OFFER.event.name} partnership package: price ex VAT, seats, tagline, best-for goals and every inclusion. Ids: ${PACKAGE_IDS.join(", ")}.`,
			inputSchema: permissiveShape(PACKAGE_SHAPE),
			annotations: READ_ONLY,
		},
		withArgs("get_package", PACKAGE_SHAPE, ({ id }) =>
			text([packageMarkdown(findPackage(id)!), "", `Exact total with add-ons and discounts: \`quote_partnership\`.`, "", ATTRIBUTION].join("\n")),
		),
	);

	server.registerTool(
		"list_addons",
		{
			title: "List add-ons",
			description: `Add-ons for an ${OFFER.event.name} partnership: host the speakers' dinner, the afterparty, a closed leadership roundtable of engineering leaders, or a partner workshop. Each goes to one partner only and needs a package. Also returns the pricing rules (second add-on 25% off, 10% early-sign discount).`,
			inputSchema: permissiveShape({}),
			annotations: READ_ONLY,
		},
		async () => text(listAddonsMarkdown()),
	);

	server.registerTool(
		"compare_packages",
		{
			title: "Compare packages",
			description: `Side-by-side Markdown table of all ${OFFER.event.name} partnership packages: price, seats, tickets, booth, speakers' dinner seats, newsletter, other inclusions and best-for goals. Use when a company weighs one partnership / sponsorship level against another.`,
			inputSchema: permissiveShape({}),
			annotations: READ_ONLY,
		},
		async () => text(compareMarkdown()),
	);

	const RECOMMEND_SHAPE = {
		goals: z
			.array(z.enum(GOALS))
			.min(1)
			.describe("What the company wants from the partnership: hiring (hire engineers in Prague), brand (brand / employer brand visibility), grow_leaders (develop its own engineering leaders), early_adopters (a startup meeting early adopters), reach_executives (reach CTOs, VPs, directors)."),
		budget_eur: z.number().positive().optional().describe("Budget in EUR, ex VAT. Optional."),
	};
	server.registerTool(
		"recommend_package",
		{
			title: "Recommend a package",
			description: `Recommends the ${OFFER.event.name} partnership package that fits a company's goals and budget, and explains why. Deterministic: goals are matched against each package's published best-for list and inclusions, then filtered by budget (using the early-sign price while it applies). Use for "we want to hire engineers in Prague", "we want to reach engineering managers and CTOs", "which sponsorship level should we take".`,
			inputSchema: permissiveShape(RECOMMEND_SHAPE),
			annotations: READ_ONLY,
		},
		withArgs("recommend_package", RECOMMEND_SHAPE, ({ goals, budget_eur }) =>
			text(recommendationMarkdown(recommendPackage(goals, budget_eur, todayPrague()))),
		),
	);

	const QUOTE_SHAPE = {
		package: z.enum(PACKAGE_IDS).describe("The package to quote. Add-ons are sold only together with a package."),
		addons: z.array(z.enum(ADDON_IDS)).optional().describe("Add-ons to include, optional."),
		sign_date: z.string().optional().describe("Planned contract signature date, YYYY-MM-DD. Defaults to today. Decides the 10% early-sign discount."),
		budget_eur: z.number().positive().optional().describe("The buyer's budget in EUR ex VAT, optional. The quote then says whether it fits, and whether it fits only with the early-sign discount."),
	};
	server.registerTool(
		"quote_partnership",
		{
			title: "Quote a partnership",
			description: `Exact price of an ${OFFER.event.name} partnership: a package plus optional add-ons, with the published rules applied — the second most expensive add-on 25% off when there are two or more, then 10% off the whole order if signed by ${OFFER.pricing_rules.early_sign_discount.deadline}. Returns line items, discounts, total ex VAT, what the same order costs without the early-sign discount and, if you pass budget_eur, whether it fits. Always use this instead of adding up prices yourself.`,
			inputSchema: permissiveShape(QUOTE_SHAPE),
			annotations: READ_ONLY,
		},
		withArgs("quote_partnership", QUOTE_SHAPE, (args) => {
			const r = quotePartnership(args, todayPrague());
			if (!r.ok) return text(r.error, true);
			return { content: [{ type: "text", text: quoteMarkdown(r.quote) }, { type: "text", text: JSON.stringify(r.quote) }] };
		}),
	);

	server.registerTool(
		"get_audience_and_proof",
		{
			title: "Audience and proof",
			description: `Who attends ${KEYWORDS} and the evidence: who is in the room (${OFFER.proof.headline_claim}), attendee numbers (2026 actual, 2027 target), rating, companies, the #ELC2025 attendee mix (engineering leadership, senior ICs, founders and executives…), community reach (members, newsletter), speakers' companies, the speaker wall (who spoke, from which company), past partners and partner hiring results. Use for "is it worth partnering", "who will we reach".`,
			inputSchema: permissiveShape({}),
			annotations: READ_ONLY,
		},
		async () => text(audienceMarkdown()),
	);

	server.registerTool(
		"get_media",
		{
			title: "Videos, photos and PDFs",
			description: `Media for an ${OFFER.event.name} partnership decision: YouTube videos (partner video, aftermovies, trailer), photo gallery, 2026 speakers, 2025 recap, the partner page, the partner deck PDF and the one-pager PDF. Use when someone needs material to show internally.`,
			inputSchema: permissiveShape({}),
			annotations: READ_ONLY,
		},
		async () => text(mediaMarkdown()),
	);

	const OFFER_SHAPE = {
		name: z.string().min(1).describe("Full name of the person asking."),
		email: z.string().email().describe("Work email the offer goes to."),
		company: z.string().min(1).describe("Company name."),
		package: z.enum(PACKAGE_IDS).describe("The package the offer is for."),
		addons: z.array(z.enum(ADDON_IDS)).optional().describe("Add-ons to include, optional."),
		message: z.string().max(2000).optional().describe("Anything the team should know: goals, timing, questions. Optional."),
	};
	server.registerTool(
		"request_partnership_offer",
		{
			title: "Request a written partnership offer",
			description: `Sends a request for a written ${OFFER.event.name} partnership offer to the ELC team, with the chosen package and add-ons. The only tool that takes contact details — call it only after the user agreed to send their name, email and company. If the request could not be delivered it says NOT SENT and returns the quote, a book-a-call link and an email address instead.`,
			inputSchema: permissiveShape(OFFER_SHAPE),
			annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
		},
		withArgs("request_partnership_offer", OFFER_SHAPE, async (args) => {
			if (opts.allowOfferRequest && !(await opts.allowOfferRequest())) {
				return text(`Too many offer requests from this connection in the last minute. Try again shortly, or book a call: ${OFFER.links.book_a_call}`, true);
			}
			const r = await requestOffer(args, opts.fetchImpl);
			return text(r.text, r.isError);
		}),
	);

	/* ─────────────── resources ─────────────── */

	server.registerResource(
		"partnership-guide",
		"elc-conference://partnership-guide.md",
		{ title: "ELC Conference 2027 partnership guide", description: "The full partnership guide as Markdown.", mimeType: "text/markdown" },
		async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: guideMarkdown() }] }),
	);

	server.registerResource(
		"packages-json",
		"elc-conference://offer-2027.json",
		{ title: "ELC Conference 2027 offer (JSON)", description: "Packages, add-ons, pricing rules, proof, links and contacts as JSON. Prices EUR ex VAT.", mimeType: "application/json" },
		async (uri) => {
			const { _comment, ...publicOffer } = OFFER as typeof OFFER & { _comment?: string };
			return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(publicOffer, null, 2) }] };
		},
	);

	/* ─────────────── prompt ─────────────── */

	server.registerPrompt(
		"pitch-elc-conference-partnership",
		{
			title: "Internal recommendation: partner with ELC Conference 2027?",
			description: "Drafts an internal recommendation memo for a company considering a partnership with ELC Conference 2027 in Prague.",
			argsSchema: {
				company: z.string().describe("The company considering the partnership."),
				goals: z.string().optional().describe("What it wants: hiring, brand, growing its leaders, early adopters, reaching executives."),
				budget_eur: z.string().optional().describe("Budget in EUR ex VAT, if known."),
			},
		},
		({ company, goals, budget_eur }) => ({
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: [
							`Draft an internal recommendation memo for ${company} on whether to partner with ${OFFER.event.name} in Prague, ${OFFER.event.when}.`,
							goals ? `Our goals: ${goals}.` : "Ask me for our goals if they are unclear (hiring, brand, growing our leaders, early adopters, reaching executives).",
							budget_eur ? `Budget: €${budget_eur} ex VAT.` : "",
							"",
							"Use the ELC Conference partnership tools: recommend_package for the pick, quote_partnership for the exact total, get_audience_and_proof for the audience. Never invent prices or numbers; use only what the tools return.",
							"Structure: 1) recommendation in one sentence, 2) why it fits our goals, 3) what we get, 4) cost (the quote table, ex VAT, and the early-sign deadline), 5) audience evidence, 6) risks and open questions, 7) next step.",
							`Write "partner/partnership", not "sponsor". Note that main-stage talks cannot be bought. Cite ${OFFER.links.partner_page}, the deck ${OFFER.links.deck_pdf} and the one-pager ${OFFER.links.one_pager_pdf}.`,
							"",
							"Reference — the current guide:",
							"",
							guideMarkdown(),
						]
							.filter((l, i, a) => !(l === "" && a[i - 1] === ""))
							.join("\n"),
					},
				},
			],
		}),
	);
}
