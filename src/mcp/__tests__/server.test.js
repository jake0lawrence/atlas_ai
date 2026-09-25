// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { handleMcpRequest, privacyFor } from '../server';
import endpoint from '../../../api/mcp';

const URL_BASE = 'https://atlas.example/api/mcp';

// A real MCP client talking to the hosted handler, with fetch pointed at the
// handler instead of the network: the same requests Claude.ai sends.
async function connect(handle = (request) => endpoint.fetch(request), url = URL_BASE) {
  const client = new Client({ name: 'atlas-test', version: '0.0.1' });
  await client.connect(new StreamableHTTPClientTransport(new URL(url), { fetch: (u, init) => handle(new Request(u, init)) }));
  return client;
}

describe('the hosted MCP endpoint (api/mcp.js)', () => {
  it('lists four read-only tools', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map(t => t.name).sort()).toEqual(['atlas_decisions', 'atlas_drift', 'atlas_search', 'atlas_topic']);
    for (const t of tools) expect(t.annotations?.readOnlyHint, t.name).toBe(true);
    await client.close();
  });

  it("answers PR 2's question, linking back to the app that serves it", async () => {
    const client = await connect();
    const res = await client.callTool({ name: 'atlas_search', arguments: { query: 'courtcollect stack' } });
    const [first] = res.structuredContent.results;
    expect(first.title).toContain('Supabase + Next.js');
    expect(first.url).toBe('https://atlas.example/topic/courtcollect/conversation/2');
    await client.close();
  });

  it('reports an unknown topic as a tool error, not a failed request', async () => {
    const client = await connect();
    const res = await client.callTool({ name: 'atlas_topic', arguments: { id: 'nope' } });
    expect(res.isError).toBe(true);
    expect(res.structuredContent.error).toMatch(/No topic "nope"/);
    await client.close();
  });

  it('serves the stand-ins with ?privacy=on, and their links open in the app', async () => {
    const client = await connect(undefined, `${URL_BASE}?privacy=on`);
    const res = await client.callTool({ name: 'atlas_search', arguments: { query: 'product a stack' } });
    const [first] = res.structuredContent.results;
    expect(first.url).toBe('https://atlas.example/topic/product-a/conversation/2');
    expect(JSON.stringify(res)).not.toMatch(/CourtCollect|Tyler|TransUnion/i);
    await client.close();
  });

  it('takes POST only, and answers a CORS preflight', async () => {
    const get = await handleMcpRequest(new Request(URL_BASE));
    expect(get.status).toBe(405);
    expect(get.headers.get('allow')).toBe('POST, OPTIONS');
    const pre = await handleMcpRequest(new Request(URL_BASE, { method: 'OPTIONS' }));
    expect(pre.status).toBe(204);
    expect(pre.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('turns privacy on from the deployment or the connector URL, never by default', () => {
    expect(privacyFor(new Request(URL_BASE))).toBe(false);
    expect(privacyFor(new Request(`${URL_BASE}?privacy=on`))).toBe(true);
    expect(privacyFor(new Request(URL_BASE), { ATLAS_PRIVACY: 'on' })).toBe(true);
  });
});
