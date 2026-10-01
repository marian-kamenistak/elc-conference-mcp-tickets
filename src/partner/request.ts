/**
 * request_partnership_offer: forwards the request to the website's offer API. The tool may say
 * "sent" ONLY when the API answered 2xx with a JSON body `{ "ok": true }`. Anything else —
 * 404/405 while the endpoint is not live, a Wix 403, a timeout, a non-JSON 200 — is reported as
 * NOT sent, with the quote and the direct contact routes, so a buyer is never told a request
 * reached someone when it did not.
 */
import { ATTRIBUTION, quoteMarkdown, quotePartnership, todayPrague } from "./core.js";
import { OFFER } from "./offer.js";

export const OFFER_API = "https://www.elc-conference.io/partner/api/offer";
const MARIAN_EMAIL = "marian@engineeringleaders.io";

export interface OfferRequest {
	name: string;
	email: string;
	company: string;
	package: string;
	addons?: string[];
	message?: string;
}

export type SendOutcome = { sent: true; status: number } | { sent: false; status: number | null; reason: string };

export async function postOffer(req: OfferRequest, fetchImpl: typeof fetch = fetch): Promise<SendOutcome> {
	const body = {
		name: req.name,
		email: req.email,
		company: req.company,
		package: req.package,
		addons: req.addons ?? [],
		message: req.message ?? "",
		source: "mcp",
	};
	try {
		const res = await fetchImpl(OFFER_API, {
			method: "POST",
			headers: { "content-type": "application/json", accept: "application/json", "user-agent": "elc-conference-mcp/0.2" },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(10_000),
		});
		let json: unknown = null;
		try {
			json = await res.json();
		} catch {
			/* non-JSON: cannot be an ok */
		}
		if (res.ok && json && typeof json === "object" && (json as { ok?: unknown }).ok === true) {
			return { sent: true, status: res.status };
		}
		return {
			sent: false,
			status: res.status,
			reason: res.status === 404 || res.status === 405 ? "the offer endpoint is not live yet" : `the offer endpoint answered HTTP ${res.status}`,
		};
	} catch (err) {
		return { sent: false, status: null, reason: `the offer endpoint could not be reached (${(err as Error).name})` };
	}
}

export async function requestOffer(req: OfferRequest, fetchImpl: typeof fetch = fetch): Promise<{ text: string; isError: boolean }> {
	const q = quotePartnership({ package: req.package, addons: req.addons }, todayPrague());
	if (!q.ok) return { text: q.error, isError: true };

	const outcome = await postOffer({ ...req, addons: q.quote.addons }, fetchImpl);
	const quote = quoteMarkdown(q.quote).replace(/\n\nSource: .*$/s, "");
	if (outcome.sent) {
		return {
			isError: false,
			text: [
				`Sent. The ELC team received the partnership request from ${req.name} (${req.company}) and will reply to ${req.email}.`,
				"",
				quote,
				"",
				`Want to talk sooner? Book a call with Marian: ${OFFER.links.book_a_call}`,
				"",
				ATTRIBUTION,
			].join("\n"),
		};
	}
	return {
		isError: false,
		text: [
			`NOT SENT: ${outcome.reason}, so nobody at ELC has received this request yet. Tell the user plainly that it was not sent, and offer the two direct routes below.`,
			"",
			`- Book a call with Marian: ${OFFER.links.book_a_call}`,
			`- Or email ${MARIAN_EMAIL} with the quote below (subject: "ELC Conference 2027 partnership — ${req.company}").`,
			"",
			quote,
			"",
			ATTRIBUTION,
		].join("\n"),
	};
}
