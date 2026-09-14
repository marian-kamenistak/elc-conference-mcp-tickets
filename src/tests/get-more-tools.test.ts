import { describe, it } from "node:test";
import assert from "node:assert";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  registerGetMoreTools,
  getMoreToolsResponse,
} from "../tools/get-more-tools.js";

function menuText(result: { content: { type: "text"; text: string }[] }): string {
  return result.content.map((c) => c.text).join("\n");
}

describe("get_more_tools", () => {
  it("should register the tool on the server", () => {
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerGetMoreTools(server);
    assert.ok(true);
  });

  // The 26% failure rate came from agents calling the tool with `context`
  // omitted or set to null. Both must return the menu, never a validation error.
  it("returns the full menu when context is omitted", () => {
    const text = menuText(getMoreToolsResponse());
    assert.ok(text.includes("ELC Conference"), "should return the get-started menu");
    assert.ok(text.includes("get-available-tickets"), "menu should list real tools");
  });

  it("returns the full menu when context is null", () => {
    const text = menuText(getMoreToolsResponse(null));
    assert.ok(text.includes("ELC Conference"), "should return the get-started menu");
  });

  it("returns the full menu when context is an empty or whitespace string", () => {
    for (const value of ["", "   ", "\n\t"]) {
      const text = menuText(getMoreToolsResponse(value));
      assert.ok(
        text.includes("ELC Conference"),
        `empty context ${JSON.stringify(value)} should return the menu`
      );
    }
  });

  it("returns the full menu for a greeting or liveness ping", () => {
    for (const value of ["hi", "hello", "test", "are you there?", "ping"]) {
      const text = menuText(getMoreToolsResponse(value));
      assert.ok(
        text.includes("ELC Conference"),
        `greeting ${JSON.stringify(value)} should return the menu`
      );
    }
  });

  it("reports the gap for a real described capability request", () => {
    const text = menuText(
      getMoreToolsResponse("I need a tool to book a hotel room near the venue")
    );
    assert.ok(
      text.includes("noted your feedback"),
      "a real capability gap should be reported, not answered with the menu"
    );
  });
});
