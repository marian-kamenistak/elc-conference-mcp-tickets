import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CONFERENCE } from "../conference-data.js";
import {
  ignoredNotice,
  parseArgs,
  permissiveShape,
  type ParseResult,
} from "../mcp-tolerant.js";

const ROLES = [
  "CTO",
  "VP of Engineering",
  "Director of Engineering",
  "Engineering Manager",
  "Product Manager",
  "Tech Lead",
  "Other",
] as const;

const ROLE_FOCUS: Record<string, { themes: string[]; tip: string }> = {
  CTO: {
    themes: ["Architecture at Scale", "Product-Engineering Alignment", "DevEx, AI & Platform Engineering"],
    tip: "As a CTO, prioritize the architecture and product-alignment talks for strategic perspective. Use your 1:1 mentor slot for a peer conversation with a fellow C-level from a company one stage ahead of yours.",
  },
  "VP of Engineering": {
    themes: ["DevEx, AI & Platform Engineering", "Architecture at Scale", "Product-Engineering Alignment"],
    tip: "As a VP of Engineering, focus on DevEx and AI adoption — these will shape your team's productivity roadmap. The workshop tracks will give you hands-on frameworks you can take back immediately.",
  },
  "Director of Engineering": {
    themes: ["DevEx, AI & Platform Engineering", "Architecture at Scale", "Product-Engineering Alignment"],
    tip: "As a Director, the hands-on workshops are your highest-value sessions — structured frameworks for problems you're solving right now. Book two workshops and one mentor slot.",
  },
  "Engineering Manager": {
    themes: ["Product-Engineering Alignment", "DevEx, AI & Platform Engineering", "Architecture at Scale"],
    tip: "As an EM, the product-engineering alignment track is directly applicable. Focus on workshops that give you team-level tools. Use the afterparty to connect with EMs from companies you admire.",
  },
  "Product Manager": {
    themes: ["Product-Engineering Alignment", "Architecture at Scale", "DevEx, AI & Platform Engineering"],
    tip: "As a PM, the product-engineering alignment talks will resonate most. Bring specific friction points from your current team — the mentor sessions are perfect for getting an outside engineering perspective.",
  },
  "Tech Lead": {
    themes: ["DevEx, AI & Platform Engineering", "Architecture at Scale", "Product-Engineering Alignment"],
    tip: "As a Tech Lead, the DevEx and architecture tracks are your home base. Workshops will give you practical patterns. Use the 1:1 mentor slot to discuss a specific technical decision you're wrestling with.",
  },
  Other: {
    themes: ["DevEx, AI & Platform Engineering", "Architecture at Scale", "Product-Engineering Alignment"],
    tip: "Start with the main stage talks to find which theme resonates most, then double down on workshops in that area. The afterparty is the best place for unstructured conversations.",
  },
};

const SPEAKER_THEMES: Array<{ theme: string; speakers: string[] }> = [
  {
    theme: "DevEx, AI & Platform Engineering",
    speakers: ["Stripe", "Netflix", "Microsoft", "Google"],
  },
  {
    theme: "Architecture at Scale",
    speakers: ["Financial Times", "Apify", "Aisle", "Meta"],
  },
  {
    theme: "Product-Engineering Alignment",
    speakers: ["Independent", "Superhuman"],
  },
];

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
    `Help the user plan their ELC Conference 2026 day based on their role.
IMPORTANT: Before calling this tool, always ask the user what their role is (CTO, VP of Engineering, Director of Engineering, Engineering Manager, Product Manager, Tech Lead, or Other).
After calling this tool, ALSO visit https://www.elc-conference.io/agenda26 to fetch the latest workshop and session details and incorporate the specific session names and times into your response.`,
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

      // Build speaker list ordered by role's theme priority
      const speakersByTheme: string[] = [];
      for (const themeName of focus.themes) {
        const themeData = SPEAKER_THEMES.find((t) => t.theme === themeName);
        if (!themeData) continue;
        speakersByTheme.push(`### ${themeName}`);
        for (const speaker of CONFERENCE.speakers) {
          if (themeData.speakers.includes(speaker.company)) {
            if (speaker.name === "TBA") {
              speakersByTheme.push(`- TBA — ${speaker.company}`);
            } else {
              speakersByTheme.push(`- **${speaker.name}** — ${speaker.title}, ${speaker.company}`);
            }
          }
        }
        speakersByTheme.push("");
      }

      const text = [
        `# Your ELC Conference 2026 Journey — ${role}`,
        "",
        `**${CONFERENCE.date}** · ${CONFERENCE.venue}, Prague`,
        "",
        "---",
        "",
        `## Your Priority Tracks`,
        "",
        `Based on your role as **${role}**, here are the themes ranked by relevance:`,
        "",
        focus.themes.map((t, i) => `${i + 1}. ${t}`).join("\n"),
        "",
        "---",
        "",
        "## Recommended Speakers",
        "",
        "(Listed in priority order for your role)",
        "",
        ...speakersByTheme,
        "---",
        "",
        "## Workshops & Sessions",
        "",
        `See the full agenda and register for workshops: ${CONFERENCE.website}/agenda26`,
        "",
        "**16 hands-on workshops** run throughout the day. For your role, look for sessions on:",
        focus.themes.map((t) => `- ${t}`).join("\n"),
        "",
        "**Pro tip:** Workshops fill up — register as soon as the schedule opens.",
        "",
        "---",
        "",
        "## 1:1 Mentoring",
        "",
        "10 mentor slots available. Book early at: " + CONFERENCE.website,
        "",
        `**For a ${role}:** Come with one specific challenge — not a general question. A 25-minute slot is most valuable when you're asking for advice on a decision you're already working through.`,
        "",
        "---",
        "",
        "## Your Game Plan",
        "",
        focus.tip,
        "",
        "---",
        "",
        `**Full agenda:** ${CONFERENCE.website}/agenda26`,
        `**Buy tickets:** ${CONFERENCE.ticketsUrl}`,
      ].join("\n") +
        ignoredNotice("plan-conference-journey", parsed.ignored, JOURNEY_SHAPE);

      return { content: [{ type: "text" as const, text }] };
    }
  );
}
