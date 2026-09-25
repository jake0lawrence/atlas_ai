// The Atlas MCP server's read side, shared by the hosted endpoint (api/mcp.js,
// on Vercel) and the local prototype (research/v8-mcp/read-server.mjs): four
// read-only tools over the demo fixtures (readTools.js). Nothing is stored and
// nothing is written.
//
// Hosted, it is stateless Streamable HTTP with JSON responses: every POST gets
// a fresh server and transport, and nothing outlives the request, which is
// what a serverless function allows. No auth: it serves the public demo
// persona only. Real data needs OAuth first (INTEGRATIONS.md, section 2).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { createReadTools } from "./readTools.js";

// Descriptions say when to call each tool: FINDINGS.md measured that this,
// not the tool name, is what gets models to use them.
const READ = { readOnlyHint: true, openWorldHint: false };
const date = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).describe("ISO date, YYYY-MM or YYYY-MM-DD");

// Structured content for clients that read it, the same JSON as text for the
// ones that don't (the MCP spec's advice for compatibility).
const reply = (data) => ({ structuredContent: data, content: [{ type: "text", text: JSON.stringify(data) }], ...(data.error ? { isError: true } : {}) });

export function buildServer(tools) {
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

// Read-only public data, so any origin may call it (browser-based clients
// such as the MCP Inspector need this; the chat apps call server to server).
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID",
};

const withCors = (response) => {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

// Privacy mode (#86) for a caller: the deployment's setting, or ?privacy=on
// on the connector URL. It changes what the tools return, not who may call.
export const privacyFor = (request, env = {}) =>
  env.ATLAS_PRIVACY === "on" || new URL(request.url).searchParams.get("privacy") === "on";

// One MCP request in, one Response out. Result links point at `baseUrl`, the
// app that serves this endpoint unless told otherwise.
export async function handleMcpRequest(request, { baseUrl, privacy = false } = {}) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  // Stateless: no server-initiated stream to open (GET) or session to end
  // (DELETE). The spec's answer is 405, which clients read as "POST only".
  if (request.method !== "POST") {
    return withCors(Response.json(
      { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed: this server takes POST only." }, id: null },
      { status: 405, headers: { Allow: "POST, OPTIONS" } },
    ));
  }
  const server = buildServer(createReadTools({ baseUrl: baseUrl || new URL(request.url).origin, privacy }));
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    return withCors(await transport.handleRequest(request));
  } finally {
    await server.close();
  }
}
