import { describe, it } from "node:test";
import assert from "node:assert";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetConferenceInfo } from "../tools/get-conference-info.js";
import { CONFERENCE } from "../conference-data.js";

describe("get-conference-info", () => {
  it("should register the tool on the server", () => {
    const server = new McpServer({ name: "test", version: "0.0.1" });
    registerGetConferenceInfo(server);
    // No error thrown = tool registered successfully
    assert.ok(true);
  });

  it("conference data should have all required fields", () => {
    assert.ok(CONFERENCE.name, "name is required");
    assert.ok(CONFERENCE.date, "date is required");
    assert.ok(CONFERENCE.venue, "venue is required");
    assert.ok(CONFERENCE.website, "website is required");
    assert.ok(CONFERENCE.ticketsUrl, "ticketsUrl is required");
    assert.ok(CONFERENCE.speakers.length > 0, "at least one speaker");
    assert.ok(CONFERENCE.topics.length > 0, "at least one topic");
  });

  it("all speakers should have name, title, and company", () => {
    for (const speaker of CONFERENCE.speakers) {
      assert.ok(speaker.name, `speaker missing name`);
      assert.ok(speaker.title, `speaker ${speaker.name} missing title`);
      assert.ok(speaker.company, `speaker ${speaker.name} missing company`);
    }
  });

  it("ticketsUrl should point to SimpleShop form", () => {
    assert.ok(
      CONFERENCE.ticketsUrl.includes("form.simpleshop.cz"),
      "ticketsUrl should be a SimpleShop form URL"
    );
  });

  it("website should be HTTPS", () => {
    assert.ok(
      CONFERENCE.website.startsWith("https://"),
      "website should use HTTPS"
    );
  });
});
