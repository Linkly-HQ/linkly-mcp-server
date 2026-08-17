# Installing the Linkly MCP server

Linkly is a **hosted remote MCP server**. There is nothing to clone, build, or run locally, and no API key to configure.

## Endpoint

    https://mcp.linklyhq.com

Transport: Streamable HTTP. Authentication: OAuth 2.0 (authorization code + PKCE, dynamic client registration). The first time a client connects it opens a browser window to sign in to Linkly and pick a workspace.

## Client configuration

Add the server to the client's MCP settings as a remote/HTTP server:

```json
{
  "mcpServers": {
    "linkly": {
      "type": "http",
      "url": "https://mcp.linklyhq.com"
    }
  }
}
```

Some clients call the key `transport` or use `"type": "streamable-http"`; either works. Do **not** add `command`, `args`, or `env` — this is not a stdio server.

### Client-specific commands

- **Claude Code**: `claude mcp add --transport http linkly https://mcp.linklyhq.com`
- **Cline / Cursor / VS Code / Windsurf**: add the JSON block above to the client's MCP settings file, then reload.
- **Claude.ai / Claude Desktop**: connect via the directory — https://claude.ai/directory/linkly

## Verify

After connecting and completing the sign-in, call the `test_authentication` tool (or ask "list my Linkly links"). A successful response confirms the OAuth token is working. `list_workspaces` returns the workspace the token is scoped to.

## Requirements

- A Linkly account: https://linklyhq.com (free plan works)
- Outbound HTTPS to `mcp.linklyhq.com` and `app.linklyhq.com`

## Troubleshooting

- **Browser didn't open / auth stuck** — remove and re-add the server; the client will start a fresh OAuth flow.
- **`invalid_client`** — stale client registration; same fix.
- **Wrong workspace** — disconnect and reconnect, choose a different workspace at the Linkly consent screen.

Docs: https://linklyhq.com/support/mcp-server · Support: support@linklyhq.com
