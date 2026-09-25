// Smoke test for the Atlas read server over MCP itself (stdio, then Streamable
// HTTP): list the tools, then ask PR 2's done-when question the way a client
// would. Given a URL, it checks that endpoint instead, such as the hosted one.
//   node read-smoke.mjs                                   (needs `npm install` here and at the root)
//   node read-smoke.mjs https://<deployment>/api/mcp
import { spawn } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const here = new URL(".", import.meta.url).pathname;
const fail = (msg) => { console.error(`FAIL ${msg}`); process.exitCode = 1; };

async function exercise(label, transport, env = {}) {
  const client = new Client({ name: "atlas-smoke", version: "0.0.1" });
  await client.connect(transport);
  const { tools } = await client.listTools();
  console.log(`${label}: ${tools.map(t => `${t.name} (${t.annotations?.readOnlyHint ? "read-only" : "WRITES"})`).join(", ")}`);
  if (tools.length !== 4 || tools.some(t => !t.annotations?.readOnlyHint)) fail(`${label}: expected four read-only tools`);

  // "What did I decide about CourtCollect's stack?"
  const res = await client.callTool({ name: "atlas_search", arguments: { query: env.privacy ? "product a stack" : "courtcollect stack" } });
  const first = res.structuredContent?.results?.[0];
  console.log(`${label}: atlas_search -> ${first?.title} <${first?.url}>`);
  if (!first?.title?.includes("Supabase + Next.js")) fail(`${label}: the stack decision did not come first`);

  const bad = await client.callTool({ name: "atlas_topic", arguments: { id: "nope" } });
  if (!bad.isError) fail(`${label}: an unknown topic should be an error result`);
  await client.close();
}

const remote = process.argv[2];
if (remote) {
  await exercise(remote, new StreamableHTTPClientTransport(new URL(remote)));
  const url = new URL(remote);
  url.searchParams.set("privacy", "on");
  await exercise(`${remote} (privacy on)`, new StreamableHTTPClientTransport(url), { privacy: true });
  console.log(process.exitCode ? "smoke: FAILED" : "smoke: ok");
  process.exit();
}

await exercise("stdio", new StdioClientTransport({ command: process.execPath, args: [`${here}read-server.mjs`] }));
await exercise("stdio, privacy on", new StdioClientTransport({ command: process.execPath, args: [`${here}read-server.mjs`], env: { ...process.env, ATLAS_PRIVACY: "on" } }), { privacy: true });

const port = 8700 + Math.floor(Math.random() * 90);
const server = spawn(process.execPath, [`${here}read-server.mjs`, "--http", String(port)], { stdio: ["ignore", "ignore", "pipe"] });
await new Promise(resolve => server.stderr.once("data", resolve));
try {
  await exercise("http", new StreamableHTTPClientTransport(new URL(`http://localhost:${port}/mcp`)));
} finally {
  server.kill();
}
console.log(process.exitCode ? "smoke: FAILED" : "smoke: ok");
