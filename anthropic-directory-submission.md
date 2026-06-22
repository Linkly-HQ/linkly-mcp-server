# Linkly — Anthropic Connectors Directory submission packet

Ready-to-paste content for submitting the Linkly remote MCP server to the **Claude Connectors Directory**.
Submit via the public form **https://clau.de/mcp-directory-submission** (works on any Claude plan) or, with a
Team/Enterprise Claude org, the in-app portal **https://claude.ai/admin-settings/directory/submissions/new**.

> `<FILL IN>` markers are the only items still needed (see "Reviewer test account").

---

## Connector basics

| Field | Value |
|-------|-------|
| Name | **Linkly** |
| Short description | Create and manage short links, track click analytics, and automate URL management. |
| Category | Productivity (alt: Marketing / Business) |
| Developer / company | Linkly |
| Website | https://linklyhq.com |
| Documentation | https://linklyhq.com/support/mcp-server |
| Support contact | support@linklyhq.com |
| Privacy policy | https://linklyhq.com/privacy |
| Terms of service | https://linklyhq.com/support/terms |

**Long description**

> Linkly is a link-management and analytics platform. Connect it to Claude to create branded short links,
> look up and search your links, read click analytics (time-series, broken down by country / device / referrer,
> plus raw exports), manage custom domains, and configure click webhooks — all within your authenticated Linkly
> workspace. Sign in with Linkly via OAuth; no API keys to copy or paste.

---

## MCP server

| Field | Value |
|-------|-------|
| Server URL | **https://mcp.linklyhq.com** |
| Transport | Streamable HTTP (POST to the root URL; `GET` with `Accept: text/event-stream` returns 405 — no server-initiated stream) |
| Authentication | **OAuth 2.0** (Authorization Code + PKCE). Discovery: `/.well-known/oauth-protected-resource` + `/.well-known/oauth-authorization-server`. No API keys. |
| Branding icon | https://mcp.linklyhq.com/icons/icon-256x256.png (square PNG; also 16/32/48/64/128 px) |
| App type | Plain tools connector — **no interactive UI**, so no screenshots required |

---

## Tools (25)

All tools carry a `title` and the correct `readOnlyHint` / `destructiveHint`. **5 destructive** tools
(deletes + unsubscribes) are flagged `destructiveHint: true`; reads are `readOnlyHint: true`; creates/updates
are additive writes. Each tool is single-purpose (no tool mixes safe + unsafe operations). All call the
first-party Linkly API (`linklyhq.com`). Most read tools also expose an `outputSchema`.

**Links**
- `create_link` *(write)* — Create a short link
- `update_link` *(write)* — Update an existing link
- `get_link` *(read)* — Get a link's details
- `list_links` *(read)* — List links, with optional search/sort/filter
- `search_links` *(read)* — Search links by keyword
- `delete_link` *(destructive)* — Permanently delete a link
- `batchDeleteLinks` *(destructive)* — Permanently delete multiple links

**Analytics**
- `get_clicks` *(read)* — Recent click data for the workspace
- `get_analytics` *(read)* — Time-series click analytics
- `get_analytics_by` *(read)* — Analytics grouped by a dimension (country, platform, browser, …)
- `export_clicks` *(read)* — Export detailed click records

**Domains**
- `list_domains` *(read)* — List custom domains
- `create_domain` *(write)* — Add a custom domain
- `delete_domain` *(destructive)* — Remove a custom domain
- `update_domain_favicon` *(write)* — Update a domain's favicon

**Webhooks**
- `list_webhooks` *(read)* — List workspace webhooks
- `subscribe_webhook` *(write)* — Add a workspace webhook
- `unsubscribe_webhook` *(destructive)* — Remove a workspace webhook
- `list_link_webhooks` *(read)* — List a link's webhooks
- `subscribe_link_webhook` *(write)* — Add a link-specific webhook
- `unsubscribe_link_webhook` *(destructive)* — Remove a link-specific webhook

**Workspace & utility**
- `list_workspaces` *(read)* — List / get the authenticated workspace
- `update_workspace` *(write)* — Update workspace settings
- `test_authentication` *(read)* — Verify API authentication
- `ping` *(read)* — Health check

---

## Setup & usage (for the listing)

**To connect:** add a custom connector pointing at `https://mcp.linklyhq.com`, then sign in to Linkly when the
browser opens. No API keys, no installation.

**Example prompts**
- "Shorten https://example.com/a/very/long/url and put it on my brand domain."
- "Show me click analytics for my top links over the last 7 days."
- "Which countries are my clicks coming from this month?"
- "Create three campaign links with UTM tags for the spring launch."
- "Export the raw click log for link 12345."

---

## Reviewer test account  `<FILL IN>`

Anthropic reviewers functionally test **every** tool, so the account must be populated.

- **Sign-in:** non-expiring magic link to a pre-populated test workspace — `<MAGIC LINK URL>`
- **Pre-populated with:** `<N>` short links across `<N>` domains (incl. one custom domain), recent click history,
  and at least one webhook subscription.
- **Reviewer steps:** add the connector (`https://mcp.linklyhq.com`) → click connect → the OAuth window opens
  already signed in via the magic link → Authorize the test workspace → all 25 tools become available.

---

## Compliance notes (for the reviewer)

- **First-party API** — every tool calls the documented Linkly API at `linklyhq.com`; the server domain matches the service.
- **No blocked use cases** — URL shortening + analytics only; no money/crypto transfers, no AI-generated media.
- **Read/write split** — each tool is single-purpose; destructive operations (`delete_*`, `batchDeleteLinks`,
  `unsubscribe_*`) carry `destructiveHint: true`; read tools carry `readOnlyHint: true`.
- **External links** — tools return short-link URLs (on `linklyhq.com` or the user's own custom domains) and the
  destination URLs the user supplies; nothing is auto-opened inside Claude.
- **No access** to Claude memory, chat history, or user files.

---

*This connector is also published on the open MCP Registry as `com.linklyhq/linkly` and is the same server behind the
Linkly ChatGPT app. Keep this packet in sync with the worker's tools (see `chatgpt-app-submission.json`).*
