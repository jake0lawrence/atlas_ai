// The v8 Atlas MCP server's read side, run locally (V8_PLAN.md, PR 2; issue
// #87). The same server is hosted at /api/mcp on the app's Vercel deployment;
// both come from src/mcp/server.js. Nothing is stored and nothing is written.
//
//   node read-server.mjs                 stdio, for Claude Code, Cursor and the smoke test
//   node read-server.mjs --http 8787     Streamable HTTP at http://localhost:8787/mcp
//
//   ATLAS_PUBLIC_URL  base for result links (default http://localhost:5173)
//   ATLAS_PRIVACY=on  privacy mode (#86): results carry the stand-ins
import { createServer } from "node:http";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildServer, handleMcpRequest, privacyFor } from "../../src/mcp/server.js";
import { createReadTools } from "../../src/mcp/readTools.js";

const baseUrl = process.env.ATLAS_PUBLIC_URL || "http://localhost:5173";

const httpAt = process.argv.indexOf("--http");
if (httpAt === -1) {
  await buildServer(createReadTools({ baseUrl, privacy: process.env.ATLAS_PRIVACY === "on" })).connect(new StdioServerTransport());
} else {
  const port = Number(process.argv[httpAt + 1] || 8787);
  // The hosted handler behind a plain Node server: Node request in, web
  // Request to the handler, web Response back out.
  createServer(async (req, res) => {
    if (!req.url.startsWith("/mcp")) { res.writeHead(404).end(); return; }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(`http://localhost:${port}${req.url}`, {
      method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks),
    });
    const response = await handleMcpRequest(request, { baseUrl, privacy: privacyFor(request, process.env) });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  }).listen(port, () => console.error(`Atlas read server on http://localhost:${port}/mcp`));
}
