// Prototype of the v8 Atlas MCP server's read side (V8_PLAN.md, PR 2; issue #87):
// four read-only tools over the demo fixtures, the same logic the app's tests
// cover (src/mcp/readTools.js). Nothing is stored and nothing is written.
//
//   node read-server.mjs                 stdio, for Claude Code, Cursor and the smoke test
//   node read-server.mjs --http 8787     Streamable HTTP at http://localhost:8787/mcp
//
// Chat apps (Claude.ai, ChatGPT, Gemini, Vibe, Grok) only reach a public HTTPS
// URL (CLIENTS.md), so trying it from one needs a tunnel in front of --http.
// No auth: this serves the public demo persona only. Real data needs OAuth
// with CIMD and DCR first (INTEGRATIONS.md, section 2).
//
//   ATLAS_PUBLIC_URL  base for result links (default http://localhost:5173)
//   ATLAS_PRIVACY=on  privacy mode (#86): results carry the stand-ins
import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { createReadTools } from "../../src/mcp/readTools.js";

const tools = createReadTools({
  baseUrl: process.env.ATLAS_PUBLIC_URL || "http://localhost:5173",
  privacy: process.env.ATLAS_PRIVACY === "on",
});

// Descriptions say when to call each tool: FINDINGS.md measured that this,
// not the tool name, is what gets models to use them.
const READ = { readOnlyHint: true, openWorldHint: false };
const date = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).describe("ISO date, YYYY-MM or YYYY-MM-DD");

// Structured content for clients that read it, the same JSON as text for the
// ones that don't (the MCP spec's advice for compatibility).
const reply = (data) => ({ structuredContent: data, content: [{ type: "text", text: JSON.stringify(data) }], ...(data.error ? { isError: true } : {}) });

function build() {
  const server = new McpServer({ name: "atlas", version: "0.1.0" });

  server.registerTool("atlas_search", {
    title: "Search Atlas",
    description: "Search the user's Atlas, their knowledge base built from past AI conversations: decisions, pivots and conversation summaries across every topic. Use it when the user asks what they decided, said, tried or worked on before. Every word of the query must match. Results link back to Atlas; cite them.",
    inputSchema: { query: z.string().min(1), topic: z.string().optional().describe("topic id from atlas_topic"), since: date.optional(), limit: z.number().int().min(1).max(50).optional() },
    annotations: READ,
  }, async (args) => reply(tools.search(args)));

  server.registerTool("atlas_topic", {
    title: "Open an Atlas topic",
    description: "Get one topic from the user's Atlas: its timeline of conversations and decisions, and the topics it connects to. Use it when the user asks about a project or area of their work as a whole.",
    inputSchema: { id: z.string().min(1).describe("topic id, e.g. courtcollect") },
    annotations: READ,
  }, async (args) => reply(tools.topic(args)));

  server.registerTool("atlas_decisions", {
    title: "List decisions in Atlas",
    description: "List the decisions, pivots and milestones the user made, oldest first, optionally for one topic or since a date. Use it when the user asks what they decided about something, or how a decision changed over time.",
    inputSchema: { topic: z.string().optional(), since: date.optional(), type: z.enum(["decision", "pivot", "milestone"]).optional() },
    annotations: READ,
  }, async (args) => reply(tools.decisions(args)));

  server.registerTool("atlas_drift", {
    title: "Check Atlas for drift",
    description: "List where the user's recent conversations contradict a decision they made earlier, with both positions and dates. Use it before the user builds on an old decision, or when they ask whether they have changed their mind.",
    inputSchema: {},
    annotations: READ,
  }, async () => reply(tools.drift()));

  return server;
}

const httpAt = process.argv.indexOf("--http");
if (httpAt === -1) {
  await build().connect(new StdioServerTransport());
} else {
  const port = Number(process.argv[httpAt + 1] || 8787);
  // Stateless: a fresh server and transport per request, no session ids.
  createServer(async (req, res) => {
    if (!req.url.startsWith("/mcp")) { res.writeHead(404).end(); return; }
    const server = build();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => { transport.close(); server.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res);
  }).listen(port, () => console.error(`Atlas read server on http://localhost:${port}/mcp`));
}
