/**
 * Local persona-test harness: the same createServer() the Worker uses, through a real MCP client.
 * Mutating side effects are stubbed: request_partnership_offer's POST and the SimpleShop API never
 * leave this process.
 *
 *   npx tsx scripts/tool.mts list
 *   npx tsx scripts/tool.mts <tool_name> '<json args>'
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
	const url = String(input instanceof Request ? input.url : input);
	// Production today: no 2027 ticket product exists in the shop.
	if (url.includes("simpleshop.cz")) return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
	if (url.includes("/partner/api/offer")) return new Response('{"ok":true}', { status: 200, headers: { "content-type": "application/json" } });
	throw new Error(`harness: blocked outbound fetch to ${url}`);
	void realFetch;
}) as typeof fetch;

const [name, rawArgs] = process.argv.slice(2);
const server = createServer({ simpleShopEmail: "harness@example.com", simpleShopApiKey: "harness" });
const [a, b] = InMemoryTransport.createLinkedPair();
await server.connect(a);
const client = new Client({ name: "persona-test", version: "0" });
await client.connect(b);

if (!name || name === "list") {
	const { tools } = await client.listTools();
	for (const t of tools) console.log(`## ${t.name}\n${t.description}\nargs: ${JSON.stringify(Object.keys((t.inputSchema as { properties?: object }).properties ?? {}))}\n`);
} else {
	let args: Record<string, unknown> = {};
	try {
		args = rawArgs ? JSON.parse(rawArgs) : {};
	} catch {
		console.log("harness: the second argument must be JSON, e.g. '{\"quantity\": 2}'");
		process.exit(1);
	}
	const r = (await client.callTool({ name, arguments: args })) as { content: { text: string }[]; isError?: boolean };
	console.log(r.content.map((c) => c.text).join("\n"));
	if (r.isError) console.log("\n[isError: true]");
	if (name === "request_partnership_offer") console.log("\n[TEST HARNESS: request_partnership_offer is stubbed. Nothing was sent to anyone.]");
}
await client.close();
