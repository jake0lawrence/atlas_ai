// A stub of the v8 Atlas MCP server, for measuring behavior rather than storing
// anything. It exposes the read and write tools V8_PLAN.md proposes, logs every
// call as one JSON line to $ATLAS_LOG, and answers with canned results.
//
// $ATLAS_VARIANT sets how much the server tells the model about capturing:
//   bare       - tool names and one-line descriptions, no server instructions
//   described  - tool descriptions say when to call them
//   instructed - described, plus server-level instructions asking the model to
//                capture decisions without being asked
import { appendFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const VARIANT = process.env.ATLAS_VARIANT || "bare";
const LOG = process.env.ATLAS_LOG;

export const DESCRIPTIONS = {
  bare: {
    search: "Search Atlas.",
    capture: "Save a conversation to Atlas.",
    decision: "Log a decision in Atlas.",
  },
  described: {
    search: "Search the user's Atlas, their personal knowledge base built from past AI conversations. Use it when the user asks what they decided, said or worked on before.",
    capture: "Save the current conversation to the user's Atlas so it becomes part of their knowledge base. Call it when a conversation reaches something worth keeping: a decision, a plan, or a conclusion. Captures land in a review inbox; nothing is published without the user's review.",
    decision: "Record a decision, pivot or milestone the user just made, in one sentence in their words, so it appears on their Atlas timeline. Call it when the user commits to a choice. It lands in a review inbox for the user to confirm.",
  },
};
DESCRIPTIONS.instructed = DESCRIPTIONS.described;

export const INSTRUCTIONS = "Atlas is the user's personal knowledge base of their past AI conversations. The user has asked for their conversations to be kept in it. When a conversation produces a decision, a pivot, a plan or a conclusion, record it with atlas_log_decision or atlas_capture without waiting to be asked, then mention in one short line that you saved it. Do not capture small talk, quick lookups or one-off questions. Everything saved lands in a review inbox the user checks later, so a borderline capture costs little.";

const log = (tool, args) => {
  if (LOG) appendFileSync(LOG, JSON.stringify({ t: Date.now(), variant: VARIANT, tool, args }) + "\n");
};

const d = DESCRIPTIONS[VARIANT] || DESCRIPTIONS.bare;
const server = new McpServer(
  { name: "atlas", version: "0.0.1" },
  VARIANT === "instructed" ? { instructions: INSTRUCTIONS } : {},
);

server.registerTool("atlas_search", {
  description: d.search,
  inputSchema: { query: z.string() },
  annotations: { readOnlyHint: true },
}, async (args) => {
  log("atlas_search", args);
  return { content: [{ type: "text", text: "No matching entries in Atlas yet." }] };
});

server.registerTool("atlas_capture", {
  description: d.capture,
  inputSchema: { title: z.string(), summary: z.string() },
  annotations: { readOnlyHint: false, destructiveHint: false },
}, async (args) => {
  log("atlas_capture", args);
  return { content: [{ type: "text", text: "Saved to the Atlas review inbox." }] };
});

server.registerTool("atlas_log_decision", {
  description: d.decision,
  inputSchema: { decision: z.string(), topic: z.string().optional() },
  annotations: { readOnlyHint: false, destructiveHint: false },
}, async (args) => {
  log("atlas_log_decision", args);
  return { content: [{ type: "text", text: "Decision saved to the Atlas review inbox." }] };
});

await server.connect(new StdioServerTransport());
