// Bearer-token verification for Atlas's signed-in MCP endpoint
// (api/user/mcp.js), the resource server half of the sign-in. The
// authorization server is jakelawrence.xyz/atlas-oauth: it signs RS256 access
// tokens (RFC 9068) whose audience is this endpoint, and publishes the public
// key at its /jwks. Nothing secret is shared between the two projects.
//
// A request is let through only with a token that is:
//   signed by that key (RS256 pinned, never the token's own choice),
//   issued by that issuer, for this resource (aud), unexpired,
//   typed at+jwt, and carrying the atlas:read scope.
// Anything else answers 401 (or 403 for a missing scope) with a
// WWW-Authenticate header pointing at the protected resource metadata, which
// is how an MCP client discovers where to sign in (RFC 9728).
import { createRemoteJWKSet, jwtVerify } from "jose";
import { BASE_PATH } from "../routes.js";

export const SCOPE = "atlas:read";
export const MAX_TOKEN_LENGTH = 4096;

const trim = (u) => String(u).replace(/\/+$/, "");

// Where everything lives. ATLAS_PUBLIC_URL is the app's public base
// (https://www.jakelawrence.xyz/atlas); without it, the request's own origin.
export function authConfig(env = {}, requestUrl = "http://localhost") {
  const publicUrl = trim(env.ATLAS_PUBLIC_URL || new URL(BASE_PATH, requestUrl).toString());
  const issuer = trim(env.ATLAS_OAUTH_ISSUER || `${new URL(publicUrl).origin}/atlas-oauth`);
  return {
    issuer,
    jwksUrl: `${issuer}/jwks`,
    resource: `${publicUrl}/api/user/mcp`,
    resourceMetadataUrl: `${publicUrl}/api/oauth-protected-resource`,
  };
}

// RFC 9728 protected resource metadata.
export const protectedResourceMetadata = (cfg) => ({
  resource: cfg.resource,
  authorization_servers: [cfg.issuer],
  scopes_supported: [SCOPE],
  bearer_methods_supported: ["header"],
  resource_name: "Atlas",
  resource_documentation: cfg.resource.replace(/\/api\/user\/mcp$/, "/"),
});

// One remote key set per JWKS URL per instance; jose caches the keys and
// refetches on an unknown kid (a rotation), with its own cooldown.
const keySets = new Map();
const remoteKeySet = (url) => {
  if (!keySets.has(url)) keySets.set(url, createRemoteJWKSet(new URL(url), { timeoutDuration: 5000 }));
  return keySets.get(url);
};

const reject = (status, error, description) => ({ ok: false, status, error, description });

// -> { ok: true, sub, scope, clientId } or { ok: false, status, error, description }.
// `keySet` is injectable for tests; production fetches the issuer's JWKS.
export async function verifyBearer(request, cfg, { keySet } = {}) {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer ([A-Za-z0-9\-._~+/]+=*)$/.exec(header);
  if (!header) return reject(401, null, "sign-in required");
  if (!match || match[1].length > MAX_TOKEN_LENGTH) return reject(401, "invalid_request", "malformed Authorization header");

  let payload;
  try {
    ({ payload } = await jwtVerify(match[1], keySet || remoteKeySet(cfg.jwksUrl), {
      issuer: cfg.issuer,
      audience: cfg.resource,
      algorithms: ["RS256"],
      typ: "at+jwt",
      requiredClaims: ["sub", "exp", "iat"],
    }));
  } catch {
    // The reason stays here: a caller learns only that the token is not good.
    return reject(401, "invalid_token", "the access token is invalid or expired");
  }
  const scopes = String(payload.scope || "").split(/\s+/);
  if (!scopes.includes(SCOPE)) return reject(403, "insufficient_scope", `requires ${SCOPE}`);
  return { ok: true, sub: String(payload.sub), scope: payload.scope, clientId: payload.client_id || null };
}

// The 401/403 an MCP client reads to find the sign-in (RFC 6750 section 3).
export function challengeHeader(result, cfg) {
  const parts = [`resource_metadata="${cfg.resourceMetadataUrl}"`, `scope="${SCOPE}"`];
  if (result.error) parts.push(`error="${result.error}"`, `error_description="${result.description}"`);
  return `Bearer ${parts.join(", ")}`;
}
