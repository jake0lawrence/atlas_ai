// The hosted Atlas MCP endpoint (issue #87): a Vercel function at /api/mcp
// serving the read tools over the demo fixtures. The logic lives in
// src/mcp/server.js, which the local prototype shares.
//
//   ATLAS_PUBLIC_URL  base for result links (default: this deployment's origin)
//   ATLAS_PRIVACY=on  privacy mode for every caller (#86); ?privacy=on per connector
import { handleMcpRequest, privacyFor } from "../src/mcp/server.js";

export default {
  fetch(request) {
    return handleMcpRequest(request, {
      baseUrl: process.env.ATLAS_PUBLIC_URL,
      privacy: privacyFor(request, process.env),
    });
  },
};
