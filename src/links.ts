/** URLs every module agrees on. */

/** The MCP endpoint to install (streamable HTTP, no auth). */
export const MCP_ENDPOINT = "https://mcp.elc-conference.io/mcp";

/** The same server on the conference site itself. Cloudflare's WebMCP bridge
 *  (/.webmcp/bridge.js) and the site's api-catalog read it same-origin from here. */
export const SITE_MCP_ENDPOINT = "https://www.elc-conference.io/mcp";

/** Canonical URL of the human docs page (GET /mcp) and its JSON twin. */
export const DOCS_URL = SITE_MCP_ENDPOINT;
export const INFO_URL = `${SITE_MCP_ENDPOINT}/info`;

/** Year-round company partnerships with the Engineering Leaders Community live in a
 *  separate MCP server; conference packages and tickets live here. */
export const COMMUNITY_PARTNERSHIP_MCP = "https://www.engineeringleaders.io/mcp/partnership";

export const SITE = "https://www.elc-conference.io";
export const NOTIFY_URL = "https://www.elc-conference.io/subscribe";
export const REPO_URL = "https://github.com/marian-kamenistak/elc-conference-mcp-tickets";
