import { createMcpHandler } from "agents/mcp";
import { createServer } from "./server.js";
import { LLMS_TXT } from "./llms-txt.js";
import type { Env } from "./types.js";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          name: "elc-conference-mcp-tickets",
          version: "0.1.0",
          mcp_endpoint: "/mcp",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // llms.txt — AI discoverability
    if (
      (url.pathname === "/llms.txt" || url.pathname === "/.well-known/llms.txt") &&
      request.method === "GET"
    ) {
      return new Response(LLMS_TXT, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // MCP endpoint
    if (url.pathname === "/mcp") {
      const server = createServer({
        simpleShopEmail: env.SIMPLESHOP_EMAIL,
        simpleShopApiKey: env.SIMPLESHOP_API_KEY,
        discountCode: env.DISCOUNT_CODE,
      });

      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    return new Response("Not Found", { status: 404 });
  },
};
