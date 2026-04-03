import { describe, it } from "node:test";
import assert from "node:assert";
import { createServer } from "../server.js";

describe("createServer", () => {
  it("should create a server with no config", () => {
    const server = createServer({});
    assert.ok(server, "server should be created");
  });

  it("should create a server with full config", () => {
    const server = createServer({
      simpleShopEmail: "test@example.com",
      simpleShopApiKey: "test-key",
      discountCode: "MCP2026",
    });
    assert.ok(server, "server should be created");
  });

  it("should create a server with partial config (no discount)", () => {
    const server = createServer({
      simpleShopEmail: "test@example.com",
      simpleShopApiKey: "test-key",
    });
    assert.ok(server, "server should be created");
  });
});
