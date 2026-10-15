// RFC 9728 protected resource metadata for the signed-in MCP endpoint:
// /atlas/api/oauth-protected-resource, named in its 401s. The main site also
// serves it at /.well-known/oauth-protected-resource/atlas/api/user/mcp by a
// rewrite, for clients that look there first.
import { authConfig, protectedResourceMetadata } from "../src/mcp/auth.js";
import { CORS } from "../src/mcp/server.js";

export default {
  fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const doc = protectedResourceMetadata(authConfig(process.env, request.url));
    return Response.json(doc, { headers: { ...CORS, "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" } });
  },
};
