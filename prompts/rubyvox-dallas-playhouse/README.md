# RubyVox operator pack: The Dallas Play House

Everything pinned to one voice agent.

| Item | Value |
|---|---|
| Agent name | The Dallas Play House |
| Agent UUID | `542e1ccb-c597-4dd1-bdeb-7f0236ca59cd` |
| Caller page | https://rubyvox.com/a/542e1ccb-c597-4dd1-bdeb-7f0236ca59cd |
| Phone | (509) 808-8801 |
| MCP endpoint | `https://rubyvox.com/mcp` |

| File | Who it is for |
|---|---|
| [01-caller-walkthrough.md](01-caller-walkthrough.md) | Anyone who will call or test the agent |
| [02-operator-prompt-pack.md](02-operator-prompt-pack.md) | You, in any MCP-capable chat, after RubyVox is connected |
| [03-jetbrains-acp-wiring.md](03-jetbrains-acp-wiring.md) | Wiring AI Assistant, Junie, Claude Agent or Codex to RubyVox |
| [config/mcp.rubyvox.url.json](config/mcp.rubyvox.url.json) | AI Assistant MCP entry, direct URL (OAuth in the IDE) |
| [config/mcp.rubyvox.stdio.json](config/mcp.rubyvox.stdio.json) | AI Assistant MCP entry via the `mcp-remote` stdio proxy |
| [config/mcp.rubyvox.bearer.json](config/mcp.rubyvox.bearer.json) | Same proxy with a bearer token you already hold |
| [config/acp.json](config/acp.json) | Drop-in for `~/.jetbrains/acp.json` |

## Which string goes where

| Paste this | Where |
|---|---|
| `https://rubyvox.com/mcp` | MCP client config only |
| `https://rubyvox.com/a/542e1ccb-c597-4dd1-bdeb-7f0236ca59cd` | Callers, QR codes, bios |
| UUID + agent name | Operator prompts, after MCP is up |

The caller page is never an MCP server. The MCP endpoint is never a caller link.

## Not verified from this side

RubyVox does not publish a tool catalog. Tool names in the prompt pack are the verbs RubyVox documents in prose (list / update / manage agents, pull leads, text a caller, book a slot). The operator prompts tell the model to discover tools first and refuse to invent any. The OAuth details in file 03 (scope `mcp`, PKCE S256, authorization server `https://rubyvox.com`) are as supplied by the builder and were not re-fetched when this pack was written.
