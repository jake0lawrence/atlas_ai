// @vitest-environment node
// The signed-in MCP endpoint (api/user/mcp.js): nothing without a valid access
// token from the Atlas authorization server, and never the demo persona's data.
import { describe, it, expect, beforeAll } from 'vitest';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { handleUserMcpRequest } from '../../../api/user/mcp';
import endpointPRM from '../../../api/oauth-protected-resource';
import { authConfig, protectedResourceMetadata, MAX_TOKEN_LENGTH } from '../auth';

const ENV = { ATLAS_PUBLIC_URL: 'https://www.jakelawrence.xyz/atlas' };
const URL_USER = 'https://www.jakelawrence.xyz/atlas/api/user/mcp';
const ISSUER = 'https://www.jakelawrence.xyz/atlas-oauth';
const INIT = { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '0' } } };

let key;
let otherKey;
let keySet;

beforeAll(async () => {
  key = await generateKeyPair('RS256');
  otherKey = await generateKeyPair('RS256');
  keySet = createLocalJWKSet({ keys: [{ ...(await exportJWK(key.publicKey)), kid: 'k1', alg: 'RS256' }] });
});

async function token({ sub = 'sub-alice', aud = URL_USER, iss = ISSUER, scope = 'atlas:read', typ = 'at+jwt', exp = '1h', signWith } = {}) {
  return new SignJWT({ scope, client_id: 'c1' }).setProtectedHeader({ alg: 'RS256', kid: 'k1', typ })
    .setIssuer(iss).setAudience(aud).setSubject(sub).setIssuedAt().setExpirationTime(exp)
    .sign((signWith || key).privateKey);
}

const call = (auth, body = INIT) => handleUserMcpRequest(new Request(URL_USER, {
  method: 'POST',
  headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...(auth ? { authorization: auth } : {}) },
  body: JSON.stringify(body),
}), ENV, { keySet });

describe('the signed-in MCP endpoint', () => {
  it('derives its resource, issuer and metadata from ATLAS_PUBLIC_URL', () => {
    const cfg = authConfig(ENV, URL_USER);
    expect(cfg).toEqual({
      issuer: ISSUER,
      jwksUrl: `${ISSUER}/jwks`,
      resource: URL_USER,
      resourceMetadataUrl: 'https://www.jakelawrence.xyz/atlas/api/oauth-protected-resource',
    });
    expect(protectedResourceMetadata(cfg)).toMatchObject({ resource: URL_USER, authorization_servers: [ISSUER], scopes_supported: ['atlas:read'], bearer_methods_supported: ['header'] });
  });

  it('answers 401 with the sign-in pointer when there is no token', async () => {
    const res = await call(null);
    expect(res.status).toBe(401);
    const www = res.headers.get('www-authenticate');
    expect(www).toMatch(/^Bearer /);
    expect(www).toContain('resource_metadata="https://www.jakelawrence.xyz/atlas/api/oauth-protected-resource"');
    expect(www).toContain('scope="atlas:read"');
    expect(res.headers.get('access-control-expose-headers')).toMatch(/WWW-Authenticate/);
    expect((await res.json()).result).toBeUndefined();
  });

  it('refuses a malformed header or an oversized token without verifying it', async () => {
    for (const auth of ['Basic dXNlcjpwYXNz', 'Bearer', 'Bearer a b', `Bearer ${'a'.repeat(MAX_TOKEN_LENGTH + 1)}`]) {
      const res = await call(auth);
      expect(res.status, auth.slice(0, 20)).toBe(401);
      expect(res.headers.get('www-authenticate')).toContain('error="invalid_request"');
    }
  });

  it('refuses a token from another key, issuer or audience, an expired one, and the wrong type', async () => {
    const cases = {
      'other key': await token({ signWith: otherKey }),
      'other issuer': await token({ iss: 'https://evil.example/atlas-oauth' }),
      'demo endpoint audience': await token({ aud: 'https://www.jakelawrence.xyz/atlas/api/mcp' }),
      'issuer audience': await token({ aud: ISSUER }),
      expired: await token({ exp: Math.floor(Date.now() / 1000) - 120 }),
      'id token type': await token({ typ: 'JWT' }),
      garbage: 'abc.def.ghi',
    };
    for (const [name, t] of Object.entries(cases)) {
      const res = await call(`Bearer ${t}`);
      expect(res.status, name).toBe(401);
      expect(res.headers.get('www-authenticate'), name).toContain('error="invalid_token"');
    }
  });

  it('refuses an HS256 token made with the public key as its secret (algorithm confusion)', async () => {
    const pub = await exportJWK(key.publicKey);
    const secret = new TextEncoder().encode(JSON.stringify(pub));
    const forged = await new SignJWT({ scope: 'atlas:read' }).setProtectedHeader({ alg: 'HS256', typ: 'at+jwt' })
      .setIssuer(ISSUER).setAudience(URL_USER).setSubject('sub-x').setIssuedAt().setExpirationTime('1h').sign(secret);
    expect((await call(`Bearer ${forged}`)).status).toBe(401);
  });

  it('answers 403 insufficient_scope for a token without atlas:read', async () => {
    const res = await call(`Bearer ${await token({ scope: 'something:else' })}`);
    expect(res.status).toBe(403);
    expect(res.headers.get('www-authenticate')).toContain('error="insufficient_scope"');
  });

  it("serves a valid token's own Atlas, which is empty until storage lands, never the demo persona", async () => {
    const t = await token();
    const client = new Client({ name: 'atlas-test', version: '0.0.1' });
    await client.connect(new StreamableHTTPClientTransport(new URL(URL_USER), {
      fetch: (u, init) => handleUserMcpRequest(new Request(u, { ...init, headers: { ...Object.fromEntries(new Headers(init?.headers)), authorization: `Bearer ${t}` } }), ENV, { keySet }),
    }));
    const { tools } = await client.listTools();
    expect(tools.map(x => x.name).sort()).toEqual(['atlas_decisions', 'atlas_drift', 'atlas_search', 'atlas_topic']);
    const search = await client.callTool({ name: 'atlas_search', arguments: { query: 'stack' } });
    expect(search.structuredContent.results).toEqual([]);
    const topic = await client.callTool({ name: 'atlas_topic', arguments: { id: 'courtcollect' } });
    expect(topic.structuredContent.error).toBe('This Atlas has no topics yet.');
    const decisions = await client.callTool({ name: 'atlas_decisions', arguments: {} });
    expect(decisions.structuredContent.results).toEqual([]);
    expect(JSON.stringify([search, topic, decisions])).not.toMatch(/CourtCollect|Supabase/i);
    await client.close();
  });

  it('answers a CORS preflight and serves the metadata document', async () => {
    const pre = await handleUserMcpRequest(new Request(URL_USER, { method: 'OPTIONS' }), ENV, { keySet });
    expect(pre.status).toBe(204);
    expect(pre.headers.get('access-control-allow-headers')).toMatch(/Authorization/);
    const prm = await endpointPRM.fetch(new Request('https://www.jakelawrence.xyz/atlas/api/oauth-protected-resource'));
    expect(prm.status).toBe(200);
    expect((await prm.json()).resource).toMatch(/\/atlas\/api\/user\/mcp$/);
  });
});
