# Which clients can use an Atlas MCP server

Researched 2026-09-23 from vendor documentation. MCP support changes month to month,
so recheck this before building against it. `n/s` means the source does not say.
help.openai.com, openai.com and perplexity.ai blocked automated reading (403 or a
challenge page). Claims about those vendors come from developers.openai.com or from
search excerpts of the official page, and are marked that way.

> **Corrections, 2026-09-24** (details and sources in `INTEGRATIONS.md`):
> Microsoft 365 Copilot is not read-only. Its custom federated connectors are, but a
> declarative agent with an MCP plugin can create, update and delete data, with
> confirmation. And Le Chat is now **Mistral Vibe**: same site and accounts, connectors
> under "Vibe Work", docs at docs.mistral.ai/vibe/work/connectors/mcp-connectors.

## The finding that matters

**Chat apps connect to MCP from the vendor's cloud, over public HTTPS. None of them can
start a local stdio process.** That covers Claude web and mobile, ChatGPT, the Gemini app,
Le Chat, Perplexity web, Grok and Microsoft 365 Copilot.

Only desktop and developer tools can run a local stdio server: Claude Desktop, Claude
Code, Codex, IDE assistants, LM Studio, and the Perplexity Mac app through a helper.

So a stdio-only, local-first Atlas would reach Claude Desktop and developer tools, and
none of the places most people actually chat. To reach those, Atlas needs a hosted remote
endpoint, or a relay or tunnel to the user's machine. OpenAI's Secure MCP Tunnel is one
example of the tunnel pattern, but it only serves OpenAI surfaces.

## Write tools, which saving a conversation needs

- **Claude (web, desktop, mobile):** writes are allowed, with tool approval. Free plans
  are limited to **one** custom connector.
- **ChatGPT:** writes only in **developer mode**, which is **web only** and **paid plans
  only**. Each write asks for confirmation, and approvals reset in every new conversation.
  Deep research and company knowledge use read-only `search`/`fetch` tools.
- **Gemini app:** writes are allowed, but every write asks for manual confirmation.
  Available only to US users aged 18+ with a personal account.
- **Microsoft 365 Copilot:** custom federated connectors are **read-only** and admin-built,
  so saving to Atlas would not work there.
- **Le Chat:** writes are allowed, including on the Free plan.

## Table

| Client | MCP client? | Surfaces | Local stdio | Remote HTTP | Custom servers | Write tools | Plan limits | Source |
|---|---|---|---|---|---|---|---|---|
| Claude.ai web | Yes | Web | No | Yes. Anthropic's cloud connects; streamable HTTP, SSE legacy | Yes, by URL | Yes, with approval; per-tool blocking | Free: 1 custom connector. Team/Ent: an Owner adds it | support.claude.com/en/articles/11175166 (2026-08-11) |
| Claude Desktop | Yes | Desktop | Yes (config or `.mcpb` extensions) | Yes | Yes | Yes, with approval | Team/Ent owners can allowlist | support.claude.com/en/articles/10949351 (2026-06-30) |
| Claude mobile | Yes, remote only | iOS, Android | No | Yes | Uses connectors already added; adding on mobile unverified | Yes | Same as web | support.claude.com/en/articles/11725091 (2026-08-06) |
| Claude Code | Yes | CLI, IDEs, desktop | Yes | Yes (HTTP, SSE, WebSocket) | Yes | Yes | Unverified | code.claude.com/docs/en/mcp |
| ChatGPT, developer mode | Yes | **Web only** | Only through Secure MCP Tunnel | Yes (SSE, streamable HTTP; OAuth or none) | Yes | Yes, with confirmation | Plus, Pro, Business, Enterprise, Edu; **not Free** | developers.openai.com/api/docs/guides/developer-mode |
| ChatGPT, outside developer mode | Partial | Web | No | Yes | Published plugins or workspace distribution | **Read-only `search`/`fetch`** | n/s | developers.openai.com/api/docs/mcp |
| OpenAI Codex | Yes | CLI, IDE, ChatGPT desktop | Yes | Yes | Yes | Yes, with approval modes | Unverified | learn.chatgpt.com/docs/extend/mcp |
| Gemini app | Yes ("custom apps") | Connect on web; use on web and mobile | No | Yes | Yes | Yes, confirm every write | 18+, US, personal account, English | support.google.com/gemini/answer/17209137 |
| Gemini CLI / Antigravity CLI | Yes | CLI, desktop | Yes | Yes | Yes | Yes | Gemini CLI stopped serving consumer plans on 2026-06-18; they move to Antigravity | developers.googleblog.com (2026-05-19) |
| Microsoft Copilot (consumer) | Not found | — | — | — | — | — | — | No official source found |
| Microsoft 365 Copilot | Yes, admin-built | M365 | No | Yes | Admins only | **Read-only** | Tenant admin | learn.microsoft.com/…/set-up-custom-federated-connectors (2026-09-22) |
| Copilot Studio | Yes | Studio agents | No | Streamable HTTP only | Yes | Yes | Maker access | learn.microsoft.com/…/mcp-add-existing-server-to-agent (2026-05-28) |
| GitHub Copilot (VS Code) | Yes | VS Code, JetBrains, Visual Studio, CLI | Yes | Yes | Yes | Yes | Business/Ent: org policy off by default | code.visualstudio.com/docs/copilot/customization/mcp-servers (2026-09-16) |
| Cursor | Yes | Desktop | Yes | Yes | Yes | Yes | n/s | cursor.com/docs/context/mcp |
| Windsurf / Devin Desktop | Yes | Desktop | Yes | Yes | Yes | Yes | 100-tool cap; Enterprise must enable | docs.devin.ai/desktop/cascade/mcp |
| Zed | Yes | Desktop | Yes | Yes | Yes | Yes, per-tool confirm | n/s | zed.dev/docs/ai/mcp |
| Perplexity | Yes | Web; Mac app for local servers | Mac app only (search excerpt) | Yes, HTTPS | Yes | Unverified | Pro, Max, Enterprise (search excerpt) | perplexity.ai/help-center/en/articles/13915507 (403) |
| Mistral Le Chat | Yes | Web | No | Yes (HTTPS with a valid certificate) | Yes | Yes | **Free included** | docs.mistral.ai/le-chat/knowledge-integrations/connectors/mcp-connectors |
| LM Studio | Yes | Desktop | Yes | Yes | Yes | Yes | n/s | lmstudio.ai/docs/app/mcp |
| xAI Grok | Yes ("Bring Your Own MCP") | Web, iOS, Android | No; use a tunnel | Yes, publicly reachable | Yes | Custom-server writes unverified | Unverified | x.ai/news/grok-connectors (2026-05-06) |

## Not verified

- ChatGPT outside developer mode: whether Plus or Pro users can add custom connectors,
  and whether plugins work on mobile.
- Whether Claude mobile can add a connector, as opposed to using one added on web.
- Plan requirements for Claude Code, Codex, Cursor, Zed and LM Studio.
- Perplexity details, which come from search excerpts only.
- Le Chat connectors on mobile.
- Grok's plan requirement and whether custom servers can write.
- Whether the Gemini app requires a paid plan (the official page names none).
