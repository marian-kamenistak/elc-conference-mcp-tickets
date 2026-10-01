/**
 * The unified server end to end, through a real MCP client over an in-memory transport:
 * every tool is listed, every tool answers a bare {} in prose (never a Zod dump), and the
 * 2027 refresh holds (no invented date/price, no stale speaker, 2026 numbers labelled).
 */
import { describe, expect, it, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createServer } from "../src/server.js";
import { TOOL_MENU } from "../src/menu.js";
import { docsHtml, infoJson } from "../src/docs.js";
import { isTicketProduct2027 } from "../src/tickets.js";
import type { SimpleShopProduct } from "../src/types.js";

let client: Client;
const call = async (name: string, args?: Record<string, unknown>) => {
	const r = (await client.callTool({ name, arguments: args ?? {} })) as { content: { type: string; text: string }[]; isError?: boolean };
	return { text: r.content.map((c) => c.text).join("\n"), isError: r.isError };
};

beforeAll(async () => {
	const server = createServer({});
	const [a, b] = InMemoryTransport.createLinkedPair();
	await server.connect(a);
	client = new Client({ name: "unit-test", version: "0" });
	await client.connect(b);
});

describe("tools/list", () => {
	it("lists every menu tool plus get-started and get_more_tools, once each", async () => {
		const names = (await client.listTools()).tools.map((t) => t.name);
		expect(new Set(names).size).toBe(names.length);
		expect(names.sort()).toEqual([...TOOL_MENU.map((t) => t.name), "get-started", "get_more_tools"].sort());
		expect(names).toHaveLength(19);
	});
	it("keeps the ticket tool names and the partnership tool names unchanged", async () => {
		const names = (await client.listTools()).tools.map((t) => t.name);
		for (const n of ["get-started", "get_more_tools", "get-conference-info", "get-available-tickets", "buy-ticket", "find-best-conference", "plan-conference-journey", "add-to-calendar"]) expect(names).toContain(n);
		for (const n of ["get_partnership_guide", "list_packages", "get_package", "list_addons", "compare_packages", "recommend_package", "quote_partnership", "get_audience_and_proof", "get_media", "request_partnership_offer"]) expect(names).toContain(n);
	});
	it("exposes the partnership resources and prompt", async () => {
		expect((await client.listResources()).resources.map((r) => r.uri).sort()).toEqual(["elc-conference://offer-2027.json", "elc-conference://partnership-guide.md"]);
		expect((await client.listPrompts()).prompts.map((p) => p.name)).toEqual(["pitch-elc-conference-partnership"]);
	});
});

describe("every tool answers a bare call in prose", () => {
	it.each([...TOOL_MENU.map((t) => t.name), "get-started", "get_more_tools"])("%s with {}", async (name) => {
		const r = await call(name, {});
		expect(r.text).not.toMatch(/"code":|expected .* received/);
		expect(r.text.length).toBeGreaterThan(40);
	});
	it("get_more_tools greets on 'test' and still records a real gap", async () => {
		expect((await call("get_more_tools", { context: "test" })).text).toContain("get-attendee-perks");
		expect((await call("get_more_tools", { context: "I need hotel booking near the venue" })).text).not.toContain("get-attendee-perks");
	});
});

describe("2027 refresh: nothing invented, nothing stale", () => {
	it("no invented 2027 date or venue, no 'TBA Google', no 2026 form link", async () => {
		const all = (await Promise.all(TOOL_MENU.filter((t) => t.group === "attend").map((t) => call(t.name, t.name === "buy-ticket" ? { quantity: 2 } : t.name === "plan-conference-journey" ? { role: "CTO" } : {})))).map((r) => r.text).join("\n");
		expect(all).toContain("April 2027 (exact date to be announced)");
		expect(all).not.toMatch(/TBA \(Google\)|TBA — Google|TBA from Google/);
		expect(all).not.toContain("qGAKO");
		expect(all).not.toMatch(/April \d{1,2}, 2027|\d{1,2} April 2027/);
		expect(all).not.toMatch(/ELC Conference 2026 —|Your ELC Conference 2026/);
	});
	it("2026 prices only ever appear labelled as 2026", async () => {
		const t = (await call("get-available-tickets")).text;
		expect(t).toContain("not on sale yet");
		expect(t).toMatch(/2026 prices \(not 2027\)/);
	});
	it("perks: what a ticket includes, the team pack and invoices", async () => {
		const t = (await call("get-attendee-perks")).text;
		for (const s of ["workshops", "1:1 mentoring", "afterparty", "4+1 free", "pub quiz", "weare@engineeringleaders.io"]) expect(t).toContain(s);
	});
	it("audience proof carries the headline claim and the speaker wall", async () => {
		const t = (await call("get_audience_and_proof")).text;
		expect(t).toContain("8 in 10 people in the room lead AI agents, people or technology.");
		expect(t).toContain("Rizwan Iqbal");
		expect((await call("get_partnership_guide")).text).toContain("8 in 10 people in the room");
	});
	it("points year-round community partnerships to the builder", async () => {
		expect((await call("get_partnership_guide")).text).toContain("https://www.engineeringleaders.io/mcp/partnership");
		expect((await call("get-started")).text).toContain("https://www.engineeringleaders.io/mcp/partnership");
	});
	it("quote: navigator + partner-workshop + roundtable signed today (2026-10-01) is €18,900", async () => {
		const t = (await call("quote_partnership", { package: "navigator", addons: ["partner-workshop", "roundtable"], sign_date: "2026-10-01" })).text;
		expect(t).toContain("€18,900");
	});
	it("never says sponsor in the attendee or partner menus", () => {
		expect(TOOL_MENU.map((t) => t.question + t.description).join(" ")).not.toMatch(/sponsor/i);
	});
});

describe("ticket product detection", () => {
	const p = (over: Partial<SimpleShopProduct>) => ({ name: "", title: "", archived: false, test_mode: false, code: "x", variants: [], ...over }) as SimpleShopProduct;
	it("takes a live 2027 product, never the archived 2026 one or a test product", () => {
		expect(isTicketProduct2027(p({ name: "ELC Conference 2027" }))).toBe(true);
		expect(isTicketProduct2027(p({ title: "ELC 27 tickets" }))).toBe(true);
		expect(isTicketProduct2027(p({ name: "ELC Conference 2026" }))).toBe(false);
		expect(isTicketProduct2027(p({ name: "ELC Conference 2027", archived: true }))).toBe(false);
		expect(isTicketProduct2027(p({ name: "ELC Conference 2027", test_mode: true }))).toBe(false);
	});
});

describe("docs page and /mcp/info", () => {
	it("HTML lists every tool, canonical to www, five clients", () => {
		const h = docsHtml();
		for (const t of TOOL_MENU) expect(h).toContain(`<code>${t.name}</code>`);
		expect(h).toContain('<link rel="canonical" href="https://www.elc-conference.io/mcp">');
		for (const c of ["Claude", "ChatGPT", "Cursor", "Copilot Studio", "Perplexity"]) expect(h).toContain(c);
	});
	it("info JSON names the install endpoint and every tool", () => {
		const j = JSON.parse(infoJson());
		expect(j.endpoint).toBe("https://mcp.elc-conference.io/mcp");
		expect(j.tools).toHaveLength(TOOL_MENU.length);
	});
});

describe("offer copy", () => {
	const canonical = join(homedir(), "ai/business/elcc/data/conference-offer-2027.json");
	it.skipIf(!existsSync(canonical))("src/data/offer-2027.ts matches the canonical JSON", () => {
		execFileSync("node", ["scripts/sync-offer.mjs", "--check"], { stdio: "pipe" });
	});
});

describe("persona test 2026-10-01 regressions", () => {
	it("Lenka/Richard: a quote without sign_date says it ASSUMES signing today, and shows the post-deadline price", async () => {
		const t = (await call("quote_partnership", { package: "navigator", addons: ["partner-workshop"] })).text;
		expect(t).toMatch(/assumes signing today/);
		expect(t).not.toMatch(/\(signed \d{4}-/);
		expect(t).toContain("Signed after 2026-12-31, the same order costs €16,000");
	});
	it("Lenka/Ondrej/Jana: budget_eur says fits / over / fits only with early-sign", async () => {
		expect((await call("quote_partnership", { package: "navigator", addons: ["partner-workshop"], sign_date: "2026-10-01", budget_eur: 15000 })).text).toMatch(/fits.*Only if signed by 2026-12-31/);
		expect((await call("quote_partnership", { package: "pioneer", addons: ["partner-workshop"], budget_eur: 6000 })).text).toMatch(/over\./);
	});
	it("Martin/Richard/Tomasz: a real described need in get_more_tools still gets routing, not a dead end", async () => {
		const t = (await call("get_more_tools", { context: "we want to partner with the community all year, not just the conference" })).text;
		expect(t).toContain("https://www.engineeringleaders.io/mcp/partnership");
		expect(t).toMatch(/main-stage talk or the attendee list: neither is for sale/);
	});
	it("Martin: no package fits → the year-round server and tickets are offered", async () => {
		const t = (await call("recommend_package", { goals: ["grow_leaders"], budget_eur: 20000 })).text;
		expect(t).toContain("https://www.engineeringleaders.io/mcp/partnership");
	});
	it("Petra/Tomasz: team pack is never claimed as exact 5-for-4 arithmetic; a group of 6 gets a 2026 sum", async () => {
		const t = (await call("buy-ticket", { quantity: 6 })).text;
		expect(t).toContain("1 team pack of 5 + 1 single ticket = 62,348 CZK");
		for (const n of ["get-attendee-perks", "get-available-tickets"]) expect((await call(n)).text).not.toMatch(/price of 4/);
	});
	it("Petra/Tomasz/Jana: no 'small enough' next to a 600+ target; target labelled once", async () => {
		const t = (await call("find-best-conference")).text;
		expect(t).not.toMatch(/small enough/);
		expect(t).not.toMatch(/\(target\) attendees|600\+ \(target\) \(/);
	});
	it("Jana/Ondrej/Martin: enum help text is not duplicated", async () => {
		expect((await call("quote_partnership", {})).text).not.toMatch(/One of: partner, luminary, navigator, pioneer\.\s*One of/);
	});
	it("Richard: a sent offer restates the no-paid-stage and no-attendee-list rules", async () => {
		const { requestOffer } = await import("../src/partner/request.js");
		const ok = (async () => new Response('{"ok":true}', { status: 200 })) as unknown as typeof fetch;
		const r = await requestOffer({ name: "R", email: "r@example.com", company: "X", package: "partner", message: "keynote or no deal" }, ok);
		expect(r.text).toMatch(/A paid slot on the main stage does not exist/);
		expect(r.text).toMatch(/does not share attendee lists/);
		expect(r.text).not.toMatch(/Next step: `request_partnership_offer`/);
	});
});
