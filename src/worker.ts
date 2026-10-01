import { createMcpHandler } from "agents/mcp";
import { createServer, SERVER_NAME, SERVER_VERSION } from "./server.js";
import { docsHtml, infoJson } from "./docs.js";
import { LLMS_TXT } from "./llms-txt.js";
import type { Env } from "./types.js";
import {
  geoFromRequest,
  instrumentMcpUsage,
  type McpUsageConfig,
  type McpUsageEnv,
} from "./mcp-usage.js";
import { normalizeMcpRequest } from "./mcp-tolerant.js";

/**
 * See src/mcp-usage.ts. One thing differs from the other four MCP servers here:
 * elc-conference.io has no PostHog project of its own, so these events go to the ELC
 * project alongside elc-toolkit and elc-partnership-builder. They stay separable by
 * `$mcp_server_name`. Move the key if the conference ever gets its own project.
 *
 * Instrumented here in the Worker, deliberately NOT inside createServer() — that factory is
 * shared with the stdio entrypoint (src/index.ts), which must stay free of network sinks.
 */
const USAGE_CONFIG: McpUsageConfig = {
  serverName: SERVER_NAME,
  domain: "elc-conference.io",
  posthogKey: "phc_waN4oTJtyBpZyMFNDNkk54QmmqmePyRDghKGcTkPfWPY",
};

/** Docs page canonical host. The Worker answers on three hosts:
 *  mcp.elc-conference.io (custom domain, the endpoint to install) and elc-conference.io/mcp* +
 *  www.elc-conference.io/mcp* (zone routes, more specific than elc-conference-ai's /* catch-all;
 *  Cloudflare's WebMCP bridge and the site's api-catalog read /mcp same-origin from there). */
const CANONICAL_SITE_HOST = "www.elc-conference.io";
const APEX_HOST = "elc-conference.io";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const isGet = request.method === "GET" || request.method === "HEAD";

    if (path === "/mcp" || path === "/mcp/" || path === "/mcp/info") {
      const wantsStream = (request.headers.get("accept") ?? "").includes("text/event-stream");
      if (isGet && !wantsStream) {
        // The bare apex and the trailing slash redirect, as before the merge. POSTs never do.
        if (url.hostname === APEX_HOST || path === "/mcp/") {
          const host = url.hostname === APEX_HOST ? CANONICAL_SITE_HOST : url.hostname;
          return Response.redirect(`https://${host}${path === "/mcp/info" ? "/mcp/info" : "/mcp"}`, 301);
        }
        if (path === "/mcp/info") {
          return new Response(request.method === "HEAD" ? null : infoJson(), {
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300", "access-control-allow-origin": "*" },
          });
        }
        // Served on every host with rel=canonical → www.elc-conference.io/mcp. GET with any
        // Accept but text/event-stream gets HTML: curl, crawlers and registry checks send */*.
        return new Response(request.method === "HEAD" ? null : docsHtml(), {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
        });
      }
      if (path !== "/mcp") return new Response("Not Found", { status: 404 });

      const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
      const server = createServer({
        simpleShopEmail: env.SIMPLESHOP_EMAIL,
        simpleShopApiKey: env.SIMPLESHOP_API_KEY,
        discountCode: env.DISCOUNT_CODE,
        allowOfferRequest: async () =>
          env.OFFER_RATE_LIMITER ? (await env.OFFER_RATE_LIMITER.limit({ key: ip })).success : true,
      });

      // geoFromRequest MUST read the original request: `request.cf` is where the geo bag
      // comes from, and normalizeMcpRequest below rebuilds the Request, which drops it.
      instrumentMcpUsage({
        server,
        config: USAGE_CONFIG,
        env: env as McpUsageEnv,
        geo: geoFromRequest(request),
        waitUntil: (p) => ctx.waitUntil(p),
      });

      // The MCP spec makes `params.arguments` optional on tools/call; the SDK does not, so a
      // spec-compliant client calling a no-argument tool got "expected object, received
      // undefined". See normalizeToolCallBody in src/mcp-tolerant.ts.
      const normalized = await normalizeMcpRequest(request);

      const handler = createMcpHandler(server);
      return handler(normalized, env, ctx);
    }

    // Everything below exists only on mcp.elc-conference.io: the zone routes are /mcp*.
    if (url.hostname !== CANONICAL_SITE_HOST && url.hostname !== APEX_HOST) {
      if (path === "/" && isGet) {
        return new Response(
          JSON.stringify({ name: SERVER_NAME, version: SERVER_VERSION, mcp_endpoint: "/mcp", docs: "https://www.elc-conference.io/mcp" }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
      if ((path === "/llms.txt" || path === "/.well-known/llms.txt") && isGet) {
        return new Response(LLMS_TXT, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
      if (path === "/ical" && isGet) {
        // No calendar file until the 2027 date is announced (see tools/add-to-calendar.ts).
        return new Response(
          "The ELC Conference 2027 date is not announced yet, so there is no calendar file. Get notified: https://www.elc-conference.io/subscribe\n",
          { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
