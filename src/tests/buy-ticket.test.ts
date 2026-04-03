import { describe, it } from "node:test";
import assert from "node:assert";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBuyTicket } from "../tools/buy-ticket.js";

describe("buy-ticket", () => {
  it("should register without a discount code", () => {
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerBuyTicket(server, null);
    assert.ok(true);
  });

  it("should register with a discount code", () => {
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerBuyTicket(server, "MCP2026");
    assert.ok(true);
  });
});
