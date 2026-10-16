// Atlas's signed-in MCP endpoint: /atlas/api/user/mcp. The only door that will
// ever serve a person's own Atlas. Every request needs an access token from
// jakelawrence.xyz/atlas-oauth (src/mcp/auth.js); without one it answers 401
// with the pointer an MCP client follows to sign in. The public demo endpoint
// (api/mcp.js) is unchanged and takes no token.
//
//   ATLAS_PUBLIC_URL    the app's public base; the resource is <base>/api/user/mcp
//   ATLAS_OAUTH_ISSUER  optional; default <origin>/atlas-oauth
import { handleMcpRequest, withCors, CORS } from "../../src/mcp/server.js";
import { authConfig, verifyBearer, challengeHeader } from "../../src/mcp/auth.js";
import { dataFor } from "../../src/mcp/userData.js";

export async function handleUserMcpRequest(request, env = {}, { keySet } = {}) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const cfg = authConfig(env, request.url);
  const auth = await verifyBearer(request, cfg, { keySet });
  if (!auth.ok) {
    const body = { jsonrpc: "2.0", error: { code: -32001, message: auth.status === 403 ? "Forbidden: insufficient scope." : "Unauthorized: sign in to Atlas." }, id: null };
    return withCors(Response.json(body, { status: auth.status, headers: { "WWW-Authenticate": challengeHeader(auth, cfg) } }));
  }
  const privacy = new URL(request.url).searchParams.get("privacy") === "on";
  return handleMcpRequest(request, {
    baseUrl: cfg.resource.replace(/\/api\/user\/mcp$/, ""),
    privacy,
    data: await dataFor(auth.sub),
  });
}

export default {
  fetch(request) {
    return handleUserMcpRequest(request, process.env);
  },
};
