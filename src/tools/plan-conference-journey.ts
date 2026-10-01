import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ATTENDEE_ATTRIBUTION, CONFERENCE, statusLines } from "../conference-data.js";
import {
  ignoredNotice,
  parseArgs,
  permissiveShape,
  type ParseResult,
} from "../mcp-tolerant.js";

const ROLE_FOCUS: Record<string, { themes: string[]; tip: string }> = {
  CTO: {
    themes: ["Technology strategy", "System architecture", "AI in product development"],
    tip: "As a CTO, prioritise the strategy and architecture talks for perspective, and use a 1:1 mentoring slot for a peer conversation with a leader one stage ahead of your company.",
  },
  "VP of Engineering": {
    themes: ["Scaling teams", "AI in product development", "Engineering leadership"],
    tip: "As a VP of Engineering, focus on scaling teams and AI adoption: they shape your productivity roadmap. The workshops give you frameworks you can take back on Monday.",
  },
  "Director of Engineering": {
    themes: ["Scaling teams", "Engineering leadership", "System architecture"],
    tip: "As a Director, the hands-on workshops are your highest-value sessions: structured frameworks for problems you are solving right now. Plan two workshops and one mentoring slot.",
  },
  "Engineering Manager": {
    themes: ["Engineering leadership", "Scaling teams", "Innovation culture"],
    tip: "As an EM, pick workshops that give you team-level tools, and use the afterparty to meet EMs from companies you admire.",
  },
  "Product Manager": {
    themes: ["AI in product development", "Innovation culture", "Technology strategy"],
    tip: "As a PM, bring specific friction points from your team: a mentoring session is the place to get an outside engineering view on them.",
  },
  "Tech Lead": {
    themes: ["System architecture", "AI in product development", "Engineering leadership"],
    tip: "As a Tech Lead, the architecture and AI talks are home base. Use a 1:1 mentoring slot to talk through one technical or people decision you are wrestling with.",
  },
  Other: {
    themes: ["Engineering leadership", "AI in product development", "Scaling teams"],
    tip: "Start with the main-stage talks to find the theme that resonates, then double down on workshops in that area. The afterparty is the best place for unstructured conversations.",
  },
};

/* The real argument contract. `server.tool` advertises `permissiveShape(JOURNEY_SHAPE)` — the
 * field optional and the enum widened to a plain string, with the seven values moved into the
 * description — and the handler enforces the shape below through `parseArgs`, which also maps
 * a near-miss like `cto` or `vp_of_engineering` onto the real value. See
 * `src/mcp-tolerant.ts` for why. */
const JOURNEY_SHAPE = {
  role: z
    .enum(["CTO", "VP of Engineering", "Director of Engineering", "Engineering Manager", "Product Manager", "Tech Lead", "Other"])
    .describe("The user's role — used to prioritize tracks, sessions, and workshops"),
};

/** Renders a `parseArgs` failure through the same `{ content: [text] }` envelope every other
 *  answer here uses, so a caller never has to parse a second result shape.
 *
 *  `probe` is the difference between a caller asking what the tool wants and a caller getting
 *  it wrong, and the two deserve different answers. A bare `{}` is a question and is answered
 *  as a normal result carrying the field menu; arguments that were supplied and rejected stay
 *  an error. */
function guidance(parsed: Extract<ParseResult<unknown>, { ok: false }>) {
  const result = { content: [{ type: "text" as const, text: parsed.message }] };
  return parsed.probe ? result : { ...result, isError: true as const };
}

export function registerPlanConferenceJourney(server: McpServer): void {
  server.tool(
    "plan-conference-journey",
    `Help the user plan their ELC Conference 2027 day based on their role: priority themes, workshops, 1:1 mentoring and a game plan. The 2027 agenda is not published yet, so the plan uses the conference's topics and the 2026 format.
IMPORTANT: Before calling this tool, always ask the user what their role is (CTO, VP of Engineering, Director of Engineering, Engineering Manager, Product Manager, Tech Lead, or Other).`,
    permissiveShape(JOURNEY_SHAPE),
    {
      title: "Plan Conference Journey",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async (raw) => {
      const parsed = parseArgs("plan-conference-journey", JOURNEY_SHAPE, raw);
      if (!parsed.ok) return guidance(parsed);
      const { role } = parsed.data;

      const focus = ROLE_FOCUS[role] ?? ROLE_FOCUS["Other"];
      const e = CONFERENCE.edition2026;

      const text = [
        `# Your ${CONFERENCE.name} plan: ${role}`,
        "",
        ...statusLines(),
        "",
        "## Your priority themes",
        `Ranked for a ${role}, from the topics the conference covers:`,
        focus.themes.map((t, i) => `${i + 1}. ${t}`).join("\n"),
        "",
        "## Talks and speakers",
        `The 2027 programme and speakers are not announced yet. ${CONFERENCE.principle} For a feel of the level, past speakers include ${CONFERENCE.pastSpeakers.slice(0, 4).map((s) => `${s.name} (${s.role})`).join(", ")}.`,
        "",
        "## Workshops",
        `In 2026 there were ${e.workshops} hands-on workshops alongside ${e.talks} main-stage talks, all included in the ticket. Workshops fill up, so register as soon as the schedule opens. For your role, look for: ${focus.themes.join(", ")}.`,
        `The 2026 agenda shows the format: ${CONFERENCE.website}/agenda26`,
        "",
        "## 1:1 mentoring",
        `${e.mentors} mentors held 1:1 sessions in the 2026 mentoring zone. Come with one specific challenge, not a general question: a short session is worth most when you ask about a decision you are already working through.`,
        "",
        "## Your game plan",
        focus.tip,
        "",
        `Tickets: \`get-available-tickets\`. What a ticket includes: \`get-attendee-perks\`. Get notified: ${CONFERENCE.notifyUrl}`,
        "",
        ATTENDEE_ATTRIBUTION,
      ].join("\n") +
        ignoredNotice("plan-conference-journey", parsed.ignored, JOURNEY_SHAPE);

      return { content: [{ type: "text" as const, text }] };
    }
  );
}
