import { describe, expect, it } from "vitest";
import { compareMarkdown, guideMarkdown, quotePartnership, recommendPackage, todayPrague } from "../src/partner/core.js";
import { requestOffer } from "../src/partner/request.js";

const TODAY = "2026-10-01";

function total(input: Parameters<typeof quotePartnership>[0], today = TODAY) {
	const r = quotePartnership(input, today);
	if (!r.ok) throw new Error(r.error);
	return r.quote;
}

describe("quote_partnership — pricing_rules applied exactly", () => {
	it("luminary + category exclusivity + roundtable signed 2026-11-01: 20000 + 18000 + 6000×0.75 = 42500, ×0.9 = 38250", () => {
		const q = total({ package: "luminary", addons: ["category-exclusivity", "roundtable"], sign_date: "2026-11-01" });
		expect(q.subtotal).toBe(42500);
		expect(q.addon_discount).toBe(1500);
		expect(q.early_sign).toMatchObject({ applies: true, percent: 10, amount: 4250 });
		expect(q.total_ex_vat).toBe(38250);
		const rt = q.lines.find((l) => l.id === "roundtable")!;
		expect(rt).toMatchObject({ discount_percent: 25, price: 4500 });
		expect(q.lines.find((l) => l.id === "category-exclusivity")).toMatchObject({ discount_percent: 0, price: 18000 });
		expect(q.renewal_note).toMatch(/renewal price/);
	});
	it("category exclusivity needs Luminary: navigator + category-exclusivity is refused", () => {
		expect(quotePartnership({ package: "navigator", addons: ["category-exclusivity"] }, TODAY)).toMatchObject({ ok: false });
	});

	it("package only, signed after the deadline: list price, no discounts", () => {
		const q = total({ package: "navigator", sign_date: "2027-01-05" });
		expect(q.total_ex_vat).toBe(12000);
		expect(q.early_sign.applies).toBe(false);
	});

	it("signed exactly on the deadline still gets 10%", () => {
		expect(total({ package: "pioneer", sign_date: "2026-12-31" }).total_ex_vat).toBe(4500);
	});

	it("one add-on is full price (the 25% needs two or more)", () => {
		const q = total({ package: "luminary", addons: ["roundtable"], sign_date: "2027-02-01" });
		expect(q.total_ex_vat).toBe(26000);
		expect(q.addon_discount).toBe(0);
	});

	it("three add-ons: only the SECOND most expensive is 25% off", () => {
		// category exclusivity 18000, roundtable 6000, workshop 4000
		const q = total({ package: "luminary", addons: ["partner-workshop", "roundtable", "category-exclusivity"], sign_date: "2027-03-01" });
		expect(q.lines.filter((l) => l.discount_percent > 0).map((l) => l.id)).toEqual(["roundtable"]);
		expect(q.subtotal).toBe(20000 + 18000 + 4500 + 4000);
		expect(q.total_ex_vat).toBe(46500);
	});

	it("default sign_date is today, and a past sign_date cannot back-date the early-sign discount", () => {
		expect(total({ package: "pioneer" }, "2026-10-01").early_sign.applies).toBe(true);
		const q = total({ package: "pioneer", sign_date: "2026-11-01" }, "2027-01-10");
		expect(q.sign_date).toBe("2027-01-10");
		expect(q.total_ex_vat).toBe(5000);
	});

	it("add-ons require a package; unknown ids and bad dates are rejected", () => {
		expect(quotePartnership({ addons: ["afterparty"] }, TODAY)).toMatchObject({ ok: false });
		expect(quotePartnership({ package: "gold" }, TODAY)).toMatchObject({ ok: false });
		expect(quotePartnership({ package: "luminary", addons: ["tshirt"] }, TODAY)).toMatchObject({ ok: false });
		expect(quotePartnership({ package: "luminary", sign_date: "31.12.2026" }, TODAY)).toMatchObject({ ok: false });
	});

	it("duplicate add-ons are counted once", () => {
		const q = total({ package: "luminary", addons: ["roundtable", "roundtable"], sign_date: "2027-02-01" });
		expect(q.total_ex_vat).toBe(26000);
	});
});

describe("recommend_package — deterministic", () => {
	it("hiring with €15,000: Navigator (Luminary does not fit)", () => {
		const r = recommendPackage(["hiring"], 15000, TODAY);
		expect(r.pick).toBe("navigator");
	});
	it("hiring, no budget: Luminary first, deterministic", () => {
		expect(recommendPackage(["hiring", "grow_leaders"], undefined, TODAY).pick).toBe("luminary");
	});
	it("early adopters: Pioneer", () => {
		expect(recommendPackage(["early_adopters"], 6000, TODAY).pick).toBe("pioneer");
	});
	it("budget fit uses the early-sign price before the deadline only", () => {
		expect(recommendPackage(["hiring"], 10800, "2026-10-01").pick).toBe("navigator");
		expect(recommendPackage(["hiring"], 10800, "2027-01-02").pick).toBe(null);
	});
});

describe("the live-test quote Marian checks by hand", () => {
	it("navigator + partner-workshop + roundtable signed 2026-10-01: 12000 + 6000 + 4000×0.75 = 21000, ×0.9 = 18900", () => {
		expect(total({ package: "navigator", addons: ["partner-workshop", "roundtable"], sign_date: "2026-10-01" }).total_ex_vat).toBe(18900);
	});
});

describe("copy rules", () => {
	it("never says sponsor in user-facing text", () => {
		for (const t of [guideMarkdown(), compareMarkdown()]) expect(t).not.toMatch(/sponsor/i);
	});
	it("todayPrague is an ISO date", () => {
		expect(todayPrague(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
	});
});

describe("request_partnership_offer — never claims sent unless the API said ok", () => {
	const req = { name: "Jana Test", email: "jana@example.com", company: "Acme", package: "luminary", addons: ["roundtable"] };
	const fake = (status: number, body: string) => (async () => new Response(body, { status })) as unknown as typeof fetch;

	it("404 → NOT SENT with fallback", async () => {
		const r = await requestOffer(req, fake(404, "nope"));
		expect(r.text).toMatch(/^NOT SENT/);
		expect(r.text).toContain("https://www.elc.space/meet-marian");
		expect(r.text).toContain("marian@engineeringleaders.io");
	});
	it("200 HTML (not the API) → NOT SENT", async () => {
		expect((await requestOffer(req, fake(200, "<html></html>"))).text).toMatch(/^NOT SENT/);
	});
	it("200 {ok:true} → Sent", async () => {
		expect((await requestOffer(req, fake(200, '{"ok":true}'))).text).toMatch(/^Sent\./);
	});
	it("network error → NOT SENT", async () => {
		const boom = (async () => {
			throw new TypeError("fetch failed");
		}) as unknown as typeof fetch;
		expect((await requestOffer(req, boom)).text).toMatch(/^NOT SENT/);
	});
});
