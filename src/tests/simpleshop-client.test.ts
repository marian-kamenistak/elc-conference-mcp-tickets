import { describe, it } from "node:test";
import assert from "node:assert";
import { SimpleShopClient } from "../simpleshop-client.js";

describe("SimpleShopClient", () => {
  it("should create a client with email and API key", () => {
    const client = new SimpleShopClient("test@example.com", "test-key-123");
    assert.ok(client, "client should be created");
  });

  it("should have listProducts method", () => {
    const client = new SimpleShopClient("test@example.com", "test-key-123");
    assert.strictEqual(typeof client.listProducts, "function");
  });
});
