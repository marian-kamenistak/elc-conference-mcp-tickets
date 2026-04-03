import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const server = createServer({
  simpleShopEmail: process.env.SIMPLESHOP_EMAIL,
  simpleShopApiKey: process.env.SIMPLESHOP_API_KEY,
  discountCode: process.env.DISCOUNT_CODE,
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ELC Conference MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
