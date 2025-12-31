# Linkly MCP Server

Official Model Context Protocol (MCP) server for [Linkly](https://linklyhq.com) - the URL shortener and link management platform.

## Documentation

For full documentation, setup guides, and examples, visit: **https://linklyhq.com/support/mcp-server**

## Features

- Create, update, and delete short links
- View click analytics and statistics
- Manage custom domains and favicons
- Configure webhooks for click events
- Search and filter links
- Export click data

## Two Ways to Use

### Option 1: Hosted Server (Recommended)

Use Linkly's hosted MCP server with OAuth authentication. No installation required.

**Server URL:** `https://mcp.linklyhq.com`

This is the easiest way to get started - just connect your MCP client to the hosted server and authenticate with your Linkly account.

### Option 2: Self-Hosted (npm)

Run your own instance using your API key.

#### Installation

```bash
npm install -g linkly-mcp-server
```

Or run directly with npx:

```bash
npx linkly-mcp-server
```

#### Configuration

Set the required environment variables:

```bash
export LINKLY_API_KEY="your-api-key"
export LINKLY_WORKSPACE_ID="your-workspace-id"
```

You can find these in your [Linkly dashboard](https://app.linklyhq.com) under Settings > API.

#### Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "linkly": {
      "command": "npx",
      "args": ["linkly-mcp-server"],
      "env": {
        "LINKLY_API_KEY": "your-api-key",
        "LINKLY_WORKSPACE_ID": "your-workspace-id"
      }
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

## License

MIT
