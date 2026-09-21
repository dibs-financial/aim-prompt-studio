# 3. JetBrains + ACP wiring for RubyVox

Two layers. AI Assistant is the MCP client. ACP hands the same MCP server to Junie, Claude Agent or Codex running inside the IDE.

## A. AI Assistant as MCP client

**Settings → Tools → AI Assistant → Model Context Protocol → + → As JSON**

### Try the URL first

Paste [config/mcp.rubyvox.url.json](config/mcp.rubyvox.url.json):

```json
{
  "mcpServers": {
    "rubyvox": {
      "url": "https://rubyvox.com/mcp"
    }
  }
}
```

Apply. The row should go green after a browser login.

### If the row stays red or shows 401

JetBrains is not completing RubyVox's OAuth (scope `mcp`, PKCE S256, authorization server `https://rubyvox.com`). Use the stdio proxy so `npx` can open the browser login itself. Paste [config/mcp.rubyvox.stdio.json](config/mcp.rubyvox.stdio.json):

```json
{
  "mcpServers": {
    "rubyvox": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://rubyvox.com/mcp"]
    }
  }
}
```

Needs Node on PATH. The first run pops a RubyVox login. After that the IDE talks stdio to `mcp-remote`, which holds the token.

### Already have a bearer token

Paste [config/mcp.rubyvox.bearer.json](config/mcp.rubyvox.bearer.json) and replace `REPLACE_ME`:

```json
{
  "mcpServers": {
    "rubyvox": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://rubyvox.com/mcp",
        "--header",
        "Authorization: Bearer REPLACE_ME"
      ]
    }
  }
}
```

Keep the token out of git. This file lives in your IDE settings, not in the repo.

### Shortcut for tonight

ChatGPT and Claude connectors accept the raw URL `https://rubyvox.com/mcp` and run the OAuth flow themselves. If you want an operator working before the IDE cooperates, connect there and use file 02.

## B. Hand it to Junie / Claude Agent / Codex (ACP)

File location:

- macOS / Linux: `~/.jetbrains/acp.json`
- Windows: `%USERPROFILE%\.jetbrains\acp.json`

ACP agents are not supported under WSL.

Drop in [config/acp.json](config/acp.json):

```json
{
  "agent_servers": {
    "Claude Agent": {
      "command": "npx",
      "args": ["-y", "@zed-industries/claude-code-acp"],
      "env": {},
      "use_idea_mcp": false,
      "use_custom_mcp": true
    },
    "Codex": {
      "command": "npx",
      "args": ["-y", "@zed-industries/codex-acp"],
      "env": {},
      "use_idea_mcp": false,
      "use_custom_mcp": true
    }
  }
}
```

Then enable **Settings → Tools → AI Assistant → Agents → Pass custom MCP servers**. That is the same flag as `use_custom_mcp: true`: your RubyVox server from section A is copied into `session/new.mcpServers` for the agent. Leave `use_idea_mcp` false unless you want IDE file and terminal tools mixed into the voice-operator session. Restart the agent after saving.

Junie is built in and reads the same pass-through flag. It needs no entry in `acp.json`.

## C. First ACP turn

Paste the identity block from file 02. Expected reply: agent status plus the RubyVox tool names the agent actually sees.

| You see | It means |
|---|---|
| RubyVox tools listed, agent found | Wired. Continue with file 02 |
| IDE tools only, no RubyVox tools | Custom-MCP pass-through is off, or section A auth failed |
| Nothing, or a spawn error | Node not on PATH, or the ACP package failed to install |

## Paste map

| Paste this | Where |
|---|---|
| `https://rubyvox.com/mcp` | MCP client config |
| `https://rubyvox.com/a/542e1ccb-c597-4dd1-bdeb-7f0236ca59cd` | Callers, QR, bios |
| UUID + name | Operator prompts, after MCP is up |

## Related: the plugin jars

If you are debugging the IDE side, the AI Assistant plugin ships its own MCP Kotlin SDK (core, client and server), Koog agent stubs, OkHttp 5 alpha, JGit and kotlin-logging. A red MCP row with a 401 is the IDE's OAuth client, not those libraries. The stdio proxy above sidesteps it.
