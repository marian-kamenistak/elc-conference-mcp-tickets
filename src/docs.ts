/**
 * GET /mcp (HTML docs, served for EVERY Accept except text/event-stream: curl, crawlers and
 * registry health checks send a wildcard Accept) and GET /mcp/info (JSON). Canonical URL:
 * https://www.elc-conference.io/mcp, whichever host served it.
 */
import { COMMUNITY_PARTNERSHIP_MCP, DOCS_URL, INFO_URL, MCP_ENDPOINT, REPO_URL, SITE_MCP_ENDPOINT } from "./links.js";
import { TOOL_MENU, type MenuItem } from "./menu.js";
import { eur, ref } from "./partner/core.js";
import { OFFER } from "./partner/offer.js";
import { SERVER_NAME, SERVER_TITLE, SERVER_VERSION } from "./server.js";

const KEY = "elc-conference";

export const INSTALL = {
  claude_code: `claude mcp add -t http ${KEY} ${MCP_ENDPOINT}`,
  claude_desktop_and_claude_ai: `Settings → Connectors → Add custom connector → name "ELC Conference", URL ${MCP_ENDPOINT}`,
  cursor: { mcpServers: { [KEY]: { url: MCP_ENDPOINT } } },
  chatgpt: `Developer mode: Settings → Connectors → Add → MCP server URL ${MCP_ENDPOINT}, authentication: none`,
  microsoft_copilot_studio: `Agent → Tools → Add a tool → New tool → Model Context Protocol → Server URL ${MCP_ENDPOINT}`,
  perplexity: `Settings → Connectors → Custom connector → Remote → MCP Server URL ${MCP_ENDPOINT}, transport Streamable HTTP`,
};

const priceRange = () =>
  `${eur(Math.min(...OFFER.packages.map((p) => p.price)))}–${eur(Math.max(...OFFER.packages.map((p) => p.price)))}`;

export const DESCRIPTION = `Ask your AI assistant about ${OFFER.event.name}, the engineering leadership conference in Prague: tickets and what a ticket includes, the team pack, planning the day, and partnering with the conference (packages ${priceRange()} ex VAT, add-ons, exact quotes, audience proof, media, a written-offer request). Free remote MCP server, no sign-up.`;

export function infoJson(): string {
  return JSON.stringify(
    {
      name: SERVER_NAME,
      title: SERVER_TITLE,
      version: SERVER_VERSION,
      description: DESCRIPTION,
      endpoint: MCP_ENDPOINT,
      also_served_at: SITE_MCP_ENDPOINT,
      transport: "streamable-http",
      auth: "none",
      offer_version: OFFER.version,
      tools: TOOL_MENU.map((t) => ({ name: t.name, group: t.group, answers: t.question })),
      resources: ["elc-conference://partnership-guide.md", "elc-conference://offer-2027.json"],
      prompts: ["pitch-elc-conference-partnership"],
      install: INSTALL,
      links: {
        site: "https://www.elc-conference.io/?ref=mcp",
        partner_page: ref(OFFER.links.partner_page),
        deck_pdf: OFFER.links.deck_pdf,
        one_pager_pdf: OFFER.links.one_pager_pdf,
        docs: DOCS_URL,
        source: REPO_URL,
        year_round_community_partnership_mcp: COMMUNITY_PARTNERSHIP_MCP,
      },
      contact: OFFER.contacts[0].email,
    },
    null,
    2
  );
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const rows = (items: MenuItem[]) =>
  items.map((t) => `<tr><td><code>${t.name}</code></td><td>${esc(t.question)}</td><td>${esc(t.description)}</td></tr>`).join("\n");

export function docsHtml(): string {
  const title = `${OFFER.event.name}: tickets, attendee perks and partnerships (MCP server)`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${OFFER.event.name} MCP server`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any (MCP server, streamable HTTP)",
    url: DOCS_URL,
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: 0, priceCurrency: "EUR", description: "Free to connect, no auth." },
    author: { "@type": "Person", name: "Marian Kamenistak", url: "https://www.marian.coach/" },
    publisher: { "@type": "Organization", name: "Engineering Leaders Community", url: "https://www.engineeringleaders.io/" },
  };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(DESCRIPTION)}">
<link rel="canonical" href="${DOCS_URL}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(DESCRIPTION)}">
<meta property="og:url" content="${DOCS_URL}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://www.elc-conference.io/partner/og.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:820px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#1a1a1a}
code,pre{background:#f4f4f4;border-radius:4px;font-size:.9em}code{padding:.1em .35em}pre{padding:.8em 1em;overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:.92em}th,td{border:1px solid #ddd;padding:.5em .7em;text-align:left;vertical-align:top}th{background:#f4f4f4}
.wrap{overflow-x:auto}h1{font-size:1.6em}h2{font-size:1.2em;margin-top:2em}a{color:#0b5fa5}.muted{color:#666;font-size:.9em}
</style>
</head>
<body>
<h1>${esc(title)}</h1>
<p>${esc(DESCRIPTION)}</p>
<p>${esc(OFFER.event.name)}: ${esc(OFFER.event.where)}, ${esc(OFFER.event.when)}. ${esc(OFFER.event.principle)}</p>
<p><strong>Endpoint:</strong> <code>${MCP_ENDPOINT}</code> (streamable HTTP, no auth). The same server also answers at <code>${SITE_MCP_ENDPOINT}</code>. Every partnership price comes from the same offer file as the <a href="${ref(OFFER.links.partner_page)}">partner page</a>.</p>

<h2>Attending: tickets, perks, the day</h2>
<div class="wrap"><table>
<tr><th>Tool</th><th>Answers</th><th>Returns</th></tr>
${rows(TOOL_MENU.filter((t) => t.group === "attend"))}
</table></div>

<h2>Partnering with the conference</h2>
<div class="wrap"><table>
<tr><th>Tool</th><th>Answers</th><th>Returns</th></tr>
${rows(TOOL_MENU.filter((t) => t.group === "partner"))}
</table></div>
<p class="muted">Also: <code>get-started</code> (menu), two resources (the partnership guide as Markdown, the offer as JSON) and the prompt <code>pitch-elc-conference-partnership</code>, which drafts an internal recommendation memo. Looking for a year-round partnership with the Engineering Leaders Community rather than the conference day? That is a separate MCP server: <a href="${COMMUNITY_PARTNERSHIP_MCP}">${COMMUNITY_PARTNERSHIP_MCP}</a>.</p>

<h2>Connect</h2>
<p><strong>Claude.ai / Claude Desktop:</strong> ${esc(INSTALL.claude_desktop_and_claude_ai)}</p>
<p><strong>ChatGPT:</strong> ${esc(INSTALL.chatgpt)}</p>
<p><strong>Microsoft 365 Copilot (Copilot Studio):</strong> ${esc(INSTALL.microsoft_copilot_studio)}</p>
<p><strong>Perplexity:</strong> ${esc(INSTALL.perplexity)}</p>
<p><strong>Claude Code</strong></p>
<pre>${esc(INSTALL.claude_code)}</pre>
<p><strong>Cursor</strong> (<code>.cursor/mcp.json</code>)</p>
<pre>${esc(JSON.stringify(INSTALL.cursor, null, 2))}</pre>
<p>Try: <em>"What does an ELC Conference ticket include, and is there a deal for a team of five?"</em> or <em>"We want to hire senior engineers in Prague. Which ELC Conference 2027 partnership fits a €15,000 budget, and what would it cost with the speakers' dinner?"</em></p>

<h2>No AI assistant at hand?</h2>
<p>See <a href="https://www.elc-conference.io/?ref=mcp">elc-conference.io</a>, the <a href="${ref(OFFER.links.partner_page)}">partner page</a>, the <a href="${OFFER.links.deck_pdf}">deck (PDF)</a> and the <a href="${OFFER.links.one_pager_pdf}">one-pager (PDF)</a>, or <a href="${OFFER.links.book_a_call}">book a call with Marian</a>.</p>
<p class="muted">Machine-readable: <a href="${INFO_URL}">${INFO_URL}</a>. Source: <a href="${REPO_URL}">${REPO_URL}</a> (MIT). Built by <a href="https://www.engineeringleaders.io/">Engineering Leaders Community</a>. Contact: ${esc(OFFER.contacts[0].email)}.</p>
</body>
</html>`;
}
