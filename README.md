# Linkly MCP Server

[![Claude connector directory](https://img.shields.io/badge/Claude-connector%20directory-d97757?logo=anthropic&logoColor=white)](https://claude.ai/directory/linkly)
[![smithery badge](https://smithery.ai/badge/linkly/linkly)](https://smithery.ai/servers/linkly/linkly)
[![Glama](https://glama.ai/mcp/servers/Linkly-HQ/linkly-mcp-server/badges/score.svg)](https://glama.ai/mcp/servers/Linkly-HQ/linkly-mcp-server)
[![MCP registry](https://img.shields.io/badge/MCP%20registry-com.linklyhq%2Flinkly-blue)](https://registry.modelcontextprotocol.io/v0/servers?search=linkly)

Official Model Context Protocol (MCP) server for [Linkly](https://linklyhq.com) — the URL shortener and link management platform.

**This repository powers the hosted MCP server at `https://mcp.linklyhq.com`.** That is the only supported way to connect an AI assistant to Linkly via MCP. See https://linklyhq.com/support/mcp-server for setup instructions.

> ⚠️ **The `linkly-mcp-server` npm package is deprecated.** The self-hosted / API-key flow is no longer maintained. All users should migrate to the hosted server — it uses OAuth 2.1 with PKCE, requires no API keys or local install, and always runs the latest tool set. The npm package will continue to exist on the registry for backwards compatibility but will not receive new tools or bug fixes, and may be unpublished in the future.

## Documentation

For full documentation, setup guides, and examples, visit: **https://linklyhq.com/support/mcp-server**

## Features

- Create, update, and delete short links
- View click analytics and statistics
- Manage custom domains and favicons
- Configure webhooks for click events
- Search and filter links
- Export click data

## Using the hosted server

**Server URL:** `https://mcp.linklyhq.com`

Connect your MCP client to the hosted server and sign in to Linkly when your browser opens. That's it — no API keys, no installation, no config drift.

### Claude Desktop

```json
{
  "mcpServers": {
    "linkly": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linklyhq.com"]
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add --transport http linkly https://mcp.linklyhq.com
```

### ChatGPT Desktop

```json
{
  "servers": {
    "linkly": {
      "type": "url",
      "url": "https://mcp.linklyhq.com"
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `create_link` | Create a new short link |
| `update_link` | Update an existing link |
| `delete_link` | Delete a link |
| `get_link` | Get link details |
| `list_links` | List all links in workspace |
| `search_links` | Search links by name, URL, or note |
| `get_analytics` | Get time-series click data |
| `get_analytics_by` | Get clicks grouped by dimension |
| `get_clicks` | Get recent click data |
| `export_clicks` | Export detailed click records |
| `list_domains` | List custom domains |
| `create_domain` | Add a custom domain |
| `delete_domain` | Remove a custom domain |
| `update_domain_favicon` | Update domain favicon |
| `list_webhooks` | List workspace webhooks |
| `subscribe_webhook` | Add a webhook |
| `unsubscribe_webhook` | Remove a webhook |
| `list_link_webhooks` | List link-specific webhooks |
| `subscribe_link_webhook` | Add a link webhook |
| `unsubscribe_link_webhook` | Remove a link webhook |

## Links

- [Linkly Website](https://linklyhq.com)
- [Documentation](https://linklyhq.com/support/mcp-server)
- [API Reference](https://app.linklyhq.com/swaggerui)
- [GitHub Repository](https://github.com/Linkly-HQ/linkly-mcp-server)

## Support

For help and support, visit [Linkly Support](https://linklyhq.com/support) or email support@linklyhq.com.

## Publishing to the MCP Registry (maintainers)

The [`server.json`](server.json) at the repo root is the [official MCP Registry](https://registry.modelcontextprotocol.io) manifest for the `com.linklyhq/linkly` server. It is **remote-only**: it points clients at the hosted server and intentionally ships no package (the deprecated npm distribution was dropped in `v2.0.0`).

Publishing requires DNS access to `linklyhq.com` — the `com.linklyhq` namespace is verified via a DNS TXT record on the domain apex:

```bash
# 1. Generate an Ed25519 key + TXT record (macOS: use openssl@3; system LibreSSL lacks Ed25519)
openssl genpkey -algorithm Ed25519 -out key.pem
PUBLIC_KEY="$(openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64)"
echo "linklyhq.com. IN TXT \"v=MCPv1; k=ed25519; p=${PUBLIC_KEY}\""   # add at the APEX of linklyhq.com

# 2. Authenticate the namespace + publish
PRIVATE_KEY="$(openssl pkey -in key.pem -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n')"
mcp-publisher login dns --domain linklyhq.com --private-key "$PRIVATE_KEY"
mcp-publisher publish
```

See the [registry authentication guide](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/authentication.mdx) for details.

## Updating the ChatGPT app (maintainers)

[`chatgpt-app-submission.json`](chatgpt-app-submission.json) is the OpenAI [Apps SDK submission import](https://developers.openai.com/apps-sdk/schemas/chatgpt-app-submission.v1.json) — it pre-fills the per-tool annotations and the three safety **justifications** (read-only / open-world / destructive) for all 25 tools, so they don't have to be typed by hand in the dashboard.

OpenAI freezes a metadata **snapshot** at publish time and does **not** auto-detect MCP changes, so after deploying server changes you publish a new version:

1. Deploy the worker (push to the connected branch / `wrangler deploy`).
2. [Platform dashboard](https://platform.openai.com/apps-manage) → the Linkly app → **create a new draft version** (keep the same MCP URL `https://mcp.linklyhq.com`).
3. In the **MCP** section, click **Scan Tools** to re-read the live tool list + annotations.
4. Drag `chatgpt-app-submission.json` onto the form (top of the page) to fill the justifications.
5. Review **Testing**, then **Submit**. The published version keeps running against the live server until the new one is approved.

Keep this file in sync with the worker whenever tools are added/removed or their `readOnlyHint`/`destructiveHint` change. The destructive flag is `true` only for the 5 genuinely destructive tools (`delete_link`, `delete_domain`, `batchDeleteLinks`, `unsubscribe_webhook`, `unsubscribe_link_webhook`); creates/updates/subscribes are additive (`false`).

## License

MIT
