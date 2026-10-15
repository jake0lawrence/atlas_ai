// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { handleMcpRequest, privacyFor, LIMITS } from '../server';
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
  // These cases read the real names, so the deployment turns privacy off
  // explicitly; the fail-safe default is tested on its own below.
  beforeEach(() => vi.stubEnv('ATLAS_PRIVACY', 'off'));
  afterEach(() => vi.unstubAllEnvs());

  it('lists four read-only tools', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map(t => t.name).sort()).toEqual(['atlas_decisions', 'atlas_drift', 'atlas_search', 'atlas_topic']);
    for (const t of tools) expect(t.annotations?.readOnlyHint, t.name).toBe(true);
    await client.close();
  });

  it("answers PR 2's question, linking back to the app that serves it, under its mount point", async () => {
    const client = await connect();
    const res = await client.callTool({ name: 'atlas_search', arguments: { query: 'courtcollect stack' } });
    const [first] = res.structuredContent.results;
    expect(first.title).toContain('Supabase + Next.js');
    expect(first.url).toBe('https://atlas.example/atlas/topic/courtcollect/conversation/2');
    await client.close();
  });

  it('reports an unknown topic as a tool error, not a failed request', async () => {
    const client = await connect();
    const res = await client.callTool({ name: 'atlas_topic', arguments: { id: 'nope' } });
    expect(res.isError).toBe(true);
    expect(res.structuredContent.error).toMatch(/No topic with that id/);
    expect(res.structuredContent.error).not.toContain('nope');
    await client.close();
  });

  it('serves the stand-ins with ?privacy=on, and their links open in the app', async () => {
    const client = await connect(undefined, `${URL_BASE}?privacy=on`);
    const res = await client.callTool({ name: 'atlas_search', arguments: { query: 'product a stack' } });
    const [first] = res.structuredContent.results;
    expect(first.url).toBe('https://atlas.example/atlas/topic/product-a/conversation/2');
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

  it('keeps the deployment setting as a floor a connector URL cannot lower', () => {
    // The public deployment sets ATLAS_PRIVACY=on; real names must not come back.
    const env = { ATLAS_PRIVACY: 'on' };
    expect(privacyFor(new Request(`${URL_BASE}?privacy=off`), env)).toBe(true);
    expect(privacyFor(new Request(`${URL_BASE}?privacy=`), env)).toBe(true);
  });
});

describe('privacy on the hosted endpoint fails safe', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('serves the stand-ins when the deployment does not set ATLAS_PRIVACY at all', async () => {
    vi.stubEnv('ATLAS_PRIVACY', undefined);
    const client = await connect();
    const res = await client.callTool({ name: 'atlas_search', arguments: { query: 'stack' } });
    expect(res.structuredContent.results.length).toBeGreaterThan(0);
    expect(JSON.stringify(res)).not.toMatch(/CourtCollect|Tyler|TransUnion/i);
    await client.close();
  });

  it('treats any value but "off" as on, an empty string included', async () => {
    vi.stubEnv('ATLAS_PRIVACY', '');
    const client = await connect();
    const res = await client.callTool({ name: 'atlas_search', arguments: { query: 'stack' } });
    expect(JSON.stringify(res)).not.toMatch(/CourtCollect/i);
    await client.close();
  });
});

// Bounds (docs/surfaces/HARDENING.md in jakelawrence.xyz): the endpoint is
// public and unauthenticated by design, so it bounds what a caller
// can send and what an error can say.
const rpc = (body, init = {}) => new Request(URL_BASE, {
  method: 'POST',
  headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...init.headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
const initialize = { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '0' } } };

describe('bounding the public MCP endpoint', () => {
  it('refuses a declared body over the cap without reading it', async () => {
    const res = await handleMcpRequest(rpc('{}', { headers: { 'content-length': String(LIMITS.bodyBytes + 1) } }));
    expect(res.status).toBe(413);
    expect((await res.json()).error.code).toBe(-32600);
  });

  it('refuses a body over the cap that does not declare its length', async () => {
    const big = JSON.stringify({ ...initialize, pad: 'x'.repeat(LIMITS.bodyBytes) });
    const res = await handleMcpRequest(rpc(big));
    expect(res.status).toBe(413);
  });

  it('still answers a request under the cap', async () => {
    const res = await handleMcpRequest(rpc(initialize));
    expect(res.status).toBe(200);
    expect((await res.json()).result.serverInfo.name).toBe('atlas');
  });

  it('rejects a query, topic or id longer than its bound', async () => {
    const client = await connect();
    const long = await client.callTool({ name: 'atlas_search', arguments: { query: 'a'.repeat(LIMITS.query + 1) } });
    expect(long.isError).toBe(true);
    const topic = await client.callTool({ name: 'atlas_decisions', arguments: { topic: 'a'.repeat(LIMITS.id + 1) } });
    expect(topic.isError).toBe(true);
    const id = await client.callTool({ name: 'atlas_topic', arguments: { id: 'a'.repeat(LIMITS.id + 1) } });
    expect(id.isError).toBe(true);
    const ok = await client.callTool({ name: 'atlas_search', arguments: { query: 'a'.repeat(LIMITS.query) } });
    expect(ok.isError).toBeFalsy();
    await client.close();
  });

  it('answers malformed JSON with a protocol error, not a crash', async () => {
    const res = await handleMcpRequest(rpc('{not json'));
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('turns an internal failure into a generic error that quotes nothing', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const secret = 'conversation text that must not leak';
    // A body stream that fails mid-read (a dropped connection) stands in for
    // any failure past the method check.
    const request = rpc(initialize);
    const broken = new Proxy(request, {
      get(target, prop) {
        if (prop === 'arrayBuffer') return () => Promise.reject(new Error(secret));
        const v = Reflect.get(target, prop, target);
        return typeof v === 'function' ? v.bind(target) : v;
      },
    });
    const res = await handleMcpRequest(broken);
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toContain('Internal error.');
    expect(text).not.toContain(secret);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(secret);
    spy.mockRestore();
  });

  it('marks every answer no-store and nosniff', async () => {
    for (const res of [
      await handleMcpRequest(rpc(initialize)),
      await handleMcpRequest(new Request(URL_BASE)),
      await handleMcpRequest(rpc('{}', { headers: { 'content-length': String(LIMITS.bodyBytes + 1) } })),
    ]) {
      expect(res.headers.get('cache-control')).toBe('no-store');
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    }
  });
});
