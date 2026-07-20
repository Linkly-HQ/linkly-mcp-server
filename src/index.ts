type Tool = (typeof TOOLS)[number];

type ToolInputMap = {
  [T in Tool as T["name"]]: T["inputSchema"]["properties"];
};
type ToolCall = {
  [K in keyof ToolInputMap]: {
    name: K;
    args: ToolInputMap[K];
  };
}[keyof ToolInputMap];

interface OAuthState {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes?: string[];
}

const LINK_OUTPUT = {
  type: "object",
  additionalProperties: true,
  description: "A Linkly link (mirrors the OpenAPI Link schema)",
  properties: {
    id: { type: ["integer", "null"], description: "Link ID" },
    url: { type: ["string", "null"], format: "uri", description: "Destination URL" },
    full_url: { type: ["string", "null"], format: "uri", description: "Full short-link URL" },
    domain: { type: ["string", "null"] },
    slug: { type: ["string", "null"] },
    name: { type: ["string", "null"] },
    note: { type: ["string", "null"] },
    workspace_id: { type: ["integer", "null"] },
    created_by_user_id: { type: ["integer", "null"] },
    enabled: { type: ["boolean", "null"] },
    deleted: { type: ["boolean", "null"] },
    cloaking: { type: ["boolean", "null"] },
    forward_params: { type: ["boolean", "null"] },
    hide_referrer: { type: ["boolean", "null"] },
    block_bots: { type: ["boolean", "null"] },
    public_analytics: { type: ["boolean", "null"] },
    head_tags: { type: ["string", "null"] },
    body_tags: { type: ["string", "null"] },
    linkify_words: { type: ["string", "null"] },
    replacements: { type: ["string", "null"] },
    rules: {
      type: ["array", "null"],
      items: {
        type: "object",
        additionalProperties: true,
        properties: {
          what: { type: "string" },
          url: { type: "string" },
          rule_url: { type: "string" },
          matches: { type: "string" },
          percentage: { type: "string" },
        },
      },
    },
    utm_source: { type: ["string", "null"] },
    utm_medium: { type: ["string", "null"] },
    utm_campaign: { type: ["string", "null"] },
    utm_term: { type: ["string", "null"] },
    utm_content: { type: ["string", "null"] },
    og_title: { type: ["string", "null"] },
    og_description: { type: ["string", "null"] },
    og_image: { type: ["string", "null"] },
    fb_pixel_id: { type: ["string", "null"] },
    tiktok_pixel_id: { type: ["string", "null"] },
    linkedin_partner_id: { type: ["string", "null"] },
    twitter_pixel_id: { type: ["string", "null"] },
    pinterest_tag_id: { type: ["string", "null"] },
    microsoft_uet_tag_id: { type: ["string", "null"] },
    snapchat_pixel_id: { type: ["string", "null"] },
    reddit_pixel_id: { type: ["string", "null"] },
    gtm_id: { type: ["string", "null"] },
    ga4_tag_id: { type: ["string", "null"] },
    expiry_datetime: { type: ["string", "null"] },
    expiry_destination: { type: ["string", "null"], format: "uri" },
    expiry_clicks: { type: ["integer", "null"] },
    skip_social_crawler_tracking: { type: ["boolean", "null"] },
    password: { type: ["string", "null"] },
    qr_styles: { type: ["object", "null"], additionalProperties: true },
    webhooks: { type: ["array", "null"], items: { type: "string" } },
    notify_user_ids: { type: ["array", "null"], items: { type: "integer" } },
    notify_slack: { type: ["boolean", "null"] },
  },
};

const DOMAIN_OUTPUT = {
  type: "object",
  additionalProperties: true,
  description: "A custom domain (mirrors the OpenAPI Domain schema)",
  properties: {
    name: { type: ["string", "null"] },
    workspace_id: { type: ["integer", "null"] },
  },
};

const WORKSPACE_OUTPUT = {
  type: "object",
  additionalProperties: true,
  properties: {
    id: { type: "integer", description: "Workspace ID" },
    name: { type: "string", description: "Workspace name" },
  },
};

const LINKS_OUTPUT = { type: "object", additionalProperties: true, properties: { results: { type: "array", items: LINK_OUTPUT } } };
const DOMAINS_OUTPUT = { type: "object", additionalProperties: true, properties: { results: { type: "array", items: DOMAIN_OUTPUT } } };
const WORKSPACES_OUTPUT = { type: "object", additionalProperties: true, properties: { results: { type: "array", items: WORKSPACE_OUTPUT } } };
const WEBHOOKS_OUTPUT = { type: "object", additionalProperties: true, properties: { results: { type: "array", items: { type: "string", format: "uri" } } } };
const CLICKS_OUTPUT = { type: "object", additionalProperties: true, description: "Time-series click data", properties: { results: { type: "array" } } };
const OBJECT_OUTPUT = { type: "object", additionalProperties: true };

function toolResult(id: any, result: any) {
  const structuredContent =
    result && typeof result === "object" && !Array.isArray(result)
      ? result
      : { results: result };
  return new Response(
    JSON.stringify(
      jsonRpcResponse(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent,
        isError: false,
      })
    ),
    { headers: { "Content-Type": "application/json" } }
  );
}

const TOOLS = [
  {
    name: "test_authentication",
    description: "Test API Authentication",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    annotations: {
      title: "Test authentication",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  {
    name: "list_workspaces",
    description: "Return details of authenticated workspace",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    annotations: {
      title: "Get workspace details",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: WORKSPACES_OUTPUT,
  },
  {
    name: "batchDeleteLinks",
    description: "Batch delete multiple links",
    inputSchema: {
      type: "object",
      properties: {
        ids: {
          type: "array",
          items: {
            type: "integer",
          },
          description: "Array of link IDs to delete",
        },
      },
      required: ["ids"],
    },
    annotations: {
      title: "Batch delete links",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  {
    name: "update_workspace",
    description: "Update workspace settings",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Workspace name",
        },
        webhooks: {
          type: "string",
          description: "Webhook URL for notifications",
        },
      },
      required: ["name", "webhooks"],
    },
    annotations: {
      title: "Update workspace settings",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  {
    name: "list_links",
    description: "List links with sorting and search",
    inputSchema: {
      type: "object",
      properties: {
        page: {
          type: "integer",
        },
        page_size: {
          type: "integer",
        },
        search: {
          type: "string",
          description: "Search Query",
        },
        sort_by: {
          type: "string",
          description: "Field to sort by",
        },
        sort_dir: {
          type: "string",
          enum: ["asc", "desc"],
          description: "Sort direction",
        },
      },
      required: [],
    },
    annotations: {
      title: "List links",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: LINKS_OUTPUT,
  },
  {
    name: "ping",
    description: "Health check",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "a message to ping , default to Hello From Linkkly",
        },
      },
      required: ["message"],
    },
    annotations: {
      title: "Ping server",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
  },
  {
    name: "create_link",
    description:
      "Create short links and URL shorteners. Use this when the user asks to shorten a URL, create a short link, or make a link shorter.",
    annotations: {
      title: "Create short link",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The destination URL for the link (required)",
        },
        name: {
          type: "string",
          description: "A nickname for the link to identify it later",
        },
        note: {
          type: "string",
          description: "A private note about this link",
        },
        domain: {
          type: "string",
          description:
            "Custom domain for the short link (without trailing /). Must be a domain that already belongs to this workspace — call list_domains to get valid values. Required whenever slug is set.",
        },
        slug: {
          type: "string",
          description:
            "Custom slug/suffix for the link (must start with /). Only valid together with domain: setting slug without a workspace-owned domain is rejected by the API.",
        },
        enabled: {
          type: "boolean",
          description: "Whether the link is active (default: true)",
        },
        utm_source: {
          type: "string",
          description: "UTM source parameter",
        },
        utm_medium: {
          type: "string",
          description: "UTM medium parameter",
        },
        utm_campaign: {
          type: "string",
          description: "UTM campaign parameter",
        },
        utm_term: {
          type: "string",
          description: "UTM term parameter",
        },
        utm_content: {
          type: "string",
          description: "UTM content parameter",
        },
        og_title: {
          type: "string",
          description: "Open Graph title for social media previews",
        },
        og_description: {
          type: "string",
          description: "Open Graph description for social media previews",
        },
        og_image: {
          type: "string",
          description: "Open Graph image URL for social media previews",
        },
        fb_pixel_id: {
          type: "string",
          description: "Meta/Facebook Pixel ID for tracking",
        },
        ga4_tag_id: {
          type: "string",
          description: "Google Analytics 4 tag ID",
        },
        gtm_id: {
          type: "string",
          description: "Google Tag Manager container ID",
        },
        cloaking: {
          type: "boolean",
          description: "Hide destination URL by opening in an iframe",
        },
        forward_params: {
          type: "boolean",
          description: "Forward URL parameters to the destination",
        },
        block_bots: {
          type: "boolean",
          description: "Block known bots and spiders from following the link",
        },
        hide_referrer: {
          type: "boolean",
          description: "Hide referrer information when users click",
        },
        expiry_datetime: {
          type: "string",
          description: "ISO 8601 datetime when the link should expire",
        },
        expiry_destination: {
          type: "string",
          description: "Fallback URL after expiry (404 if blank)",
        },
      },
      required: ["url"],
    },
    outputSchema: LINK_OUTPUT,
  },
  {
    name: "update_link",
    description: "Update an existing Linkly link by its ID",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link to update (required)",
        },
        url: {
          type: "string",
          description: "New destination URL",
        },
        name: {
          type: "string",
          description: "New nickname for the link",
        },
        note: {
          type: "string",
          description: "New private note",
        },
        enabled: {
          type: "boolean",
          description: "Whether the link is active",
        },
        utm_source: { type: "string", description: "UTM source parameter" },
        utm_medium: { type: "string", description: "UTM medium parameter" },
        utm_campaign: { type: "string", description: "UTM campaign parameter" },
        utm_term: { type: "string", description: "UTM term parameter" },
        utm_content: { type: "string", description: "UTM content parameter" },
        og_title: { type: "string", description: "Open Graph title" },
        og_description: {
          type: "string",
          description: "Open Graph description",
        },
        og_image: { type: "string", description: "Open Graph image URL" },
        fb_pixel_id: { type: "string", description: "Meta Pixel ID" },
        ga4_tag_id: {
          type: "string",
          description: "Google Analytics 4 tag ID",
        },
        gtm_id: { type: "string", description: "Google Tag Manager ID" },
        cloaking: { type: "boolean", description: "Enable URL cloaking" },
        forward_params: {
          type: "boolean",
          description: "Forward URL parameters",
        },
        block_bots: { type: "boolean", description: "Block bots" },
        hide_referrer: { type: "boolean", description: "Hide referrer" },
        expiry_datetime: {
          type: "string",
          description: "Expiry datetime (ISO 8601)",
        },
        expiry_destination: {
          type: "string",
          description: "Fallback URL after expiry",
        },
      },
      required: ["link_id"],
    },
    annotations: {
      title: "Update link",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
    outputSchema: LINK_OUTPUT,
  },
  {
    name: "delete_link",
    description: "Delete a Linkly link by its ID",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link to delete",
        },
      },
      required: ["link_id"],
    },
    annotations: {
      title: "Delete link",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  {
    name: "get_link",
    description: "Get details of a specific Linkly link by its ID",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link to retrieve",
        },
      },
      required: ["link_id"],
    },
    annotations: {
      title: "Get link details",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: LINK_OUTPUT,
  },
  {
    name: "get_clicks",
    description: "Get recent click data for the workspace",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "Optional: filter clicks by link ID",
        },
      },
      required: [],
    },
    annotations: {
      title: "Get recent clicks",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: CLICKS_OUTPUT,
  },
  {
    name: "get_analytics",
    description:
      "Get time-series click analytics data for charting. Returns click counts over time.",
    inputSchema: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (default: 30 days ago)",
        },
        end: {
          type: "string",
          description: "End date in YYYY-MM-DD format (default: today)",
        },
        link_id: {
          type: "integer",
          description: "Filter by specific link ID",
        },
        frequency: {
          type: "string",
          enum: ["day", "hour"],
          description: "Time granularity: 'day' (default) or 'hour'",
        },
        country: {
          type: "string",
          description: "Filter by country code (e.g., 'US', 'GB')",
        },
        platform: {
          type: "string",
          description:
            "Filter by platform (e.g., 'desktop', 'mobile', 'tablet')",
        },
        browser: {
          type: "string",
          description: "Filter by browser name",
        },
        unique: {
          type: "boolean",
          description: "Count unique clicks only (by IP)",
        },
        bots: {
          type: "string",
          enum: ["include", "exclude", "only"],
          description: "Bot filtering: include (default), exclude, or only",
        },
      },
      required: [],
    },
    annotations: {
      title: "Get click analytics",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  {
    name: "get_analytics_by",
    description:
      "Get click counts grouped by a dimension (country, platform, browser, etc.). Useful for breakdowns and top-N reports.",
    inputSchema: {
      type: "object",
      properties: {
        counter: {
          type: "string",
          enum: [
            "country",
            "platform",
            "browser_name",
            "referer",
            "isp",
            "link_id",
            "destination",
            "bot_name",
          ],
          description: "Dimension to group by (required)",
        },
        start: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (default: 30 days ago)",
        },
        end: {
          type: "string",
          description: "End date in YYYY-MM-DD format (default: today)",
        },
        link_id: {
          type: "integer",
          description: "Filter by specific link ID",
        },
        country: {
          type: "string",
          description: "Filter by country code",
        },
        platform: {
          type: "string",
          description: "Filter by platform",
        },
        unique: {
          type: "boolean",
          description: "Count unique clicks only",
        },
        bots: {
          type: "string",
          enum: ["include", "exclude", "only"],
          description: "Bot filtering",
        },
      },
      required: ["counter"],
    },
    annotations: {
      title: "Get analytics by dimension",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  {
    name: "export_clicks",
    description:
      "Export detailed click records with full information (timestamp, browser, country, URL, platform, referer, bot, ISP, params).",
    inputSchema: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (default: 30 days ago)",
        },
        end: {
          type: "string",
          description: "End date in YYYY-MM-DD format (default: yesterday)",
        },
        link_id: {
          type: "integer",
          description: "Filter by specific link ID",
        },
        country: {
          type: "string",
          description: "Filter by country code",
        },
        platform: {
          type: "string",
          description: "Filter by platform",
        },
        bots: {
          type: "string",
          enum: ["include", "exclude", "only"],
          description: "Bot filtering",
        },
      },
      required: [],
    },
    annotations: {
      title: "Export click records",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: CLICKS_OUTPUT,
  },
  // Domain Management
  {
    name: "list_domains",
    description: "List all custom domains in the workspace.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    annotations: {
      title: "List custom domains",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: DOMAINS_OUTPUT,
  },
  {
    name: "create_domain",
    description:
      "Add a custom domain to the workspace. The domain must be configured to point to Linkly's servers.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The domain name (e.g., 'links.example.com')",
        },
      },
      required: ["name"],
    },
    annotations: {
      title: "Add custom domain",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
    outputSchema: DOMAIN_OUTPUT,
  },
  {
    name: "delete_domain",
    description: "Remove a custom domain from the workspace.",
    inputSchema: {
      type: "object",
      properties: {
        domain_id: {
          type: "integer",
          description: "The ID of the domain to delete",
        },
      },
      required: ["domain_id"],
    },
    annotations: {
      title: "Delete custom domain",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  {
    name: "update_domain_favicon",
    description: "Update the favicon URL for a custom domain.",
    inputSchema: {
      type: "object",
      properties: {
        domain_id: {
          type: "integer",
          description: "The ID of the domain to update",
        },
        favicon_url: {
          type: "string",
          description: "URL to the favicon image",
        },
      },
      required: ["domain_id", "favicon_url"],
    },
    annotations: {
      title: "Update domain favicon",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: true,
      destructiveHint: true,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  // Link Search
  {
    name: "search_links",
    description:
      "Search for links by name, URL, or note. Returns matching links with click statistics.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search query to match against link names, URLs, and notes",
        },
      },
      required: ["query"],
    },
    annotations: {
      title: "Search links",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: LINKS_OUTPUT,
  },
  // Workspace Webhooks
  {
    name: "list_webhooks",
    description:
      "List all webhook URLs subscribed to the workspace. These receive click events for all links.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    annotations: {
      title: "List webhooks",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: WEBHOOKS_OUTPUT,
  },
  {
    name: "subscribe_webhook",
    description:
      "Subscribe a webhook URL to receive click events for all links in the workspace.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The webhook URL to receive click event notifications",
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "Add workspace webhook",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  {
    name: "unsubscribe_webhook",
    description: "Unsubscribe a webhook URL from workspace click events.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The webhook URL to unsubscribe",
        },
      },
      required: ["url"],
    },
    annotations: {
      title: "Remove workspace webhook",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
  },
  // Link Webhooks
  {
    name: "list_link_webhooks",
    description: "List all webhook URLs subscribed to a specific link.",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link",
        },
      },
      required: ["link_id"],
    },
    annotations: {
      title: "List link webhooks",
      openWorldHint: false,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
    outputSchema: WEBHOOKS_OUTPUT,
  },
  {
    name: "subscribe_link_webhook",
    description:
      "Subscribe a webhook URL to receive click events for a specific link.",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link",
        },
        url: {
          type: "string",
          description: "The webhook URL to receive click event notifications",
        },
      },
      required: ["link_id", "url"],
    },
    annotations: {
      title: "Add link webhook",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
    outputSchema: OBJECT_OUTPUT,
  },
  {
    name: "unsubscribe_link_webhook",
    description:
      "Unsubscribe a webhook URL from a specific link's click events.",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
          description: "The ID of the link",
        },
        url: {
          type: "string",
          description: "The webhook URL to unsubscribe",
        },
      },
      required: ["link_id", "url"],
    },
    annotations: {
      title: "Remove link webhook",
      openWorldHint: false,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
  },
] as const;

function jsonRpcResponse(id: any, result: any) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: any, code: number, message: string) {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message },
  };
}

// Get OAuth state from meta parameters
function getOAuthState(meta?: any): OAuthState | null {
  if (!meta?._meta?.oauth) {
    return null;
  }

  const oauth = meta._meta.oauth;
  return {
    accessToken: oauth.access_token,
    refreshToken: oauth.refresh_token,
    expiresAt: oauth.expires_at,
    scopes: oauth.scopes,
  };
}

// Check if user is authenticated
function isAuthenticated(oauthState: OAuthState | null): boolean {
  if (!oauthState?.accessToken) {
    return false;
  }

  // Check if token is expired
  if (oauthState.expiresAt && oauthState.expiresAt < Date.now()) {
    return false;
  }

  return true;
}

/** Error from the upstream Linkly API, carrying the parsed response body. */
class LinklyApiError extends Error {
  status?: number;
  body?: unknown;
}

async function apiRequest(
  token: string,
  method: RequestInit["method"],
  path: string,
  body: any = null
) {
  const url = `https://app.linklyhq.com${path}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
    },
  };

  if (body) options.body = JSON.stringify(body);
  const resp = await fetch(url, options);

  if (!resp.ok) {
    const text = await resp.text();
    // Carry the API's validation body as structured data rather than
    // concatenating it into the message. Better Stack then indexes the
    // field names (e.g. slug, domain), so failures can be grouped and
    // alerted on per-field instead of by string-matching a message.
    const err = new LinklyApiError(`Linkly API ${resp.status}:`);
    err.status = resp.status;
    try {
      err.body = JSON.parse(text);
    } catch {
      err.body = text;
    }
    throw err;
  }
  return resp.json();
}

// Handle tool execution
async function handleToolCall(
  id: string,
  { name, args }: ToolCall,
  token: string
) {
  // const { workspaceId: WORKSPACE_ID } = env;
  switch (name) {
    case "ping": {
      const { message } = args;
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: `Hello , its working fine with message : ${message}`,
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    case "test_authentication": {
      const result = await apiRequest(token, "POST", "/api/v1/test");
      return toolResult(id, result);
    }
    case "update_workspace": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "PATCH",
        `/api/v1/workspace/${workspaceID[0].id}`,
        args
      );
      return toolResult(id, result);
    }
    case "create_link": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "POST",
        `/api/v1/workspace/${workspaceID[0].id}/links`,
        args
      );
      return toolResult(id, result);
    }
    case "update_link": {
      const { link_id, ...updateData } = args;
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "POST",
        `/api/v1/workspace/${workspaceID[0].id}/links`,
        { id: link_id, ...updateData }
      );
      return toolResult(id, result);
    }
    case "list_links": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const listParams = new URLSearchParams();
      if (args.page != null) listParams.append("page", `${args.page}`);
      if (args.page_size != null)
        listParams.append("page_size", `${args.page_size}`);
      if (args.search != null) listParams.append("search", `${args.search}`);
      if (args.sort_by != null) listParams.append("sort_by", `${args.sort_by}`);
      if (args.sort_dir != null)
        listParams.append("sort_dir", `${args.sort_dir}`);
      const listQs = listParams.toString();
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/workspace/${workspaceID[0].id}/list_links${
          listQs ? `?${listQs}` : ""
        }`
      );
      return toolResult(id, result);
    }
    case "batchDeleteLinks": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "DELETE",
        `/api/v1/workspace/${workspaceID[0].id}/links`,
        args
      );
      return toolResult(id, result);
    }
    case "delete_link": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "DELETE",
        `/api/v1/workspace/${workspaceID[0].id}/links/${args.link_id}`
      );
      return toolResult(id, result);
    }
    case "get_link": {
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/get_link/${args.link_id}`
      );
      return toolResult(id, result);
    }
    case "list_workspaces": {
      const result = await apiRequest(token, "GET", `/api/v1/workspaces`);
      return toolResult(id, result);
    }
    case "get_clicks": {
      const params = new URLSearchParams();
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      params.append("format", "json");
      if (args.link_id) params.append("link_id", `${args.link_id}`);
      const url = `/api/v1/workspace/${
        workspaceID[0].id
      }/clicks/export?${params.toString()}`;

      const result = await apiRequest(token, "GET", url);

      return toolResult(id, result);
    }
    case "get_analytics": {
      const params = new URLSearchParams();
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      if (args.start) params.append("start", `${args.start}`);
      if (args.end) params.append("end", `${args.end}`);
      if (args.link_id) params.append("link_id", `${args.link_id}`);
      if (args.frequency) params.append("frequency", `${args.frequency}`);
      if (args.country) params.append("country", `${args.country}`);
      if (args.platform) params.append("platform", `${args.platform}`);
      if (args.browser) params.append("browser", `${args.browser}`);
      if (args.unique) params.append("unique", `${args.unique}`);
      if (args.bots) params.append("bots", `${args.bots}`);

      const queryString = params.toString();
      const url = `/api/v1/workspace/${workspaceID[0].id}/clicks${
        queryString ? `?${queryString}` : ""
      }`;
      const result = await apiRequest(token, "GET", url);

      return toolResult(id, result);
    }
    case "get_analytics_by": {
      const params = new URLSearchParams();
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      params.append("counter", `${args.counter}`);
      if (args.start) params.append("start", `${args.start}`);
      if (args.end) params.append("end", `${args.end}`);
      if (args.link_id) params.append("link_id", `${args.link_id}`);
      if (args.country) params.append("country", `${args.country}`);
      if (args.platform) params.append("platform", `${args.platform}`);
      if (args.unique) params.append("unique", `${args.unique}`);
      if (args.bots) params.append("bots", `${args.bots}`);

      const url = `/api/v1/workspace/${workspaceID[0].id}/clicks/counters/${
        args.counter
      }?${params.toString()}`;
      const result = await apiRequest(token, "GET", url);

      return toolResult(id, result);
    }
    case "export_clicks": {
      const params = new URLSearchParams();
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      params.append("format", "json");
      if (args.start) params.append("start", `${args.start}`);
      if (args.end) params.append("end", `${args.end}`);
      if (args.link_id) params.append("link_id", `${args.link_id}`);
      if (args.country) params.append("country", `${args.country}`);
      if (args.platform) params.append("platform", `${args.platform}`);
      if (args.bots) params.append("bots", `${args.bots}`);

      const url = `/api/v1/workspace/${
        workspaceID[0].id
      }/clicks/export?${params.toString()}`;
      const result = await apiRequest(token, "GET", url);
      return toolResult(id, result);
    }

    // Domain Management
    case "list_domains": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/workspace/${workspaceID[0].id}/domains`
      );
      return toolResult(id, result);
    }
    case "create_domain": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "POST",
        `/api/v1/workspace/${workspaceID[0].id}/domains`,
        { name: args.name }
      );
      return toolResult(id, result);
    }
    case "delete_domain": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "DELETE",
        `/api/v1/workspace/${workspaceID[0].id}/domains/${args.domain_id}`
      );
      return toolResult(id, result);
    }
    case "update_domain_favicon": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "PATCH",
        `/api/v1/workspace/${workspaceID[0].id}/domains/${args.domain_id}/favicon`,
        { favicon_url: args.favicon_url }
      );
      return toolResult(id, result);
    }

    // Link Search
    case "search_links": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const params = new URLSearchParams();
      params.append("search", `${args.query}`);
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/workspace/${
          workspaceID[0].id
        }/links/export?${params.toString()}`
      );
      return toolResult(id, result);
    }

    // Workspace Webhooks
    case "list_webhooks": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/workspace/${workspaceID[0].id}/webhooks`
      );
      return toolResult(id, result);
    }
    case "subscribe_webhook": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "POST",
        `/api/v1/workspace/${workspaceID[0].id}/webhooks`,
        { url: args.url }
      );
      return toolResult(id, result);
    }
    case "unsubscribe_webhook": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const encodedUrl = encodeURIComponent(`${args.url}`);
      await apiRequest(
        token,
        "DELETE",
        `/api/v1/workspace/${workspaceID[0].id}/webhooks/${encodedUrl}`
      );
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true }, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    // Link Webhooks
    case "list_link_webhooks": {
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/link/${args.link_id}/webhooks`
      );
      return toolResult(id, result);
    }
    case "subscribe_link_webhook": {
      const result = await apiRequest(
        token,
        "POST",
        `/api/v1/link/${args.link_id}/webhooks`,
        { url: args.url }
      );
      return toolResult(id, result);
    }
    case "unsubscribe_link_webhook": {
      const encodedUrl = encodeURIComponent(`${args.url}`);
      await apiRequest(
        token,
        "DELETE",
        `/api/v1/link/${args.link_id}/webhooks/${encodedUrl}`
      );
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true }, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    default:
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
  }
}

// ============================================================================
// OAuth proxy helpers
// ============================================================================
//
// The Linkly Phoenix app at app.linklyhq.com only supports OAuth 2.0
// authorization_code grant with pre-registered confidential clients — no DCR,
// no PKCE, no refresh_token, and no localhost redirect URIs. The MCP SDK needs
// all of those. So this Worker stands in as a self-contained OAuth proxy:
//
//   1. /register   — RFC 7591 dynamic client registration (returns a synthetic
//                    public client_id; we don't track it).
//   2. /authorize  — Wraps the MCP client's redirect_uri + PKCE challenge into
//                    a signed `state`, then redirects to the upstream Linkly
//                    authorize page using the worker's pre-registered
//                    confidential client (LINKLY_CLIENT_ID/SECRET).
//   3. /oauth/callback — Receives the upstream code, exchanges it for an
//                    upstream access_token, mints its own signed authorization
//                    code wrapping the access_token, and redirects to the
//                    original MCP client redirect_uri.
//   4. /token      — Verifies the worker's auth code + PKCE code_verifier,
//                    returns the wrapped upstream access_token.
//
// Worker-issued auth codes embed the token directly so no server-side state is
// needed. They're HMAC-signed with SIGNING_SECRET and short-lived.

interface MCPEnv {
  LINKLY_CLIENT_ID: string;
  LINKLY_CLIENT_SECRET: string;
  SIGNING_SECRET: string;
  // Optional Better Stack (Telemetry) log shipping — see logToBetterStack.
  // BETTERSTACK_INGEST_URL is a committed plaintext var; the source token is
  // an encrypted secret (`wrangler secret put BETTERSTACK_SOURCE_TOKEN`).
  BETTERSTACK_INGEST_URL?: string;
  BETTERSTACK_SOURCE_TOKEN?: string;
}

/**
 * Ship a structured log event to Better Stack via its HTTP ingestion
 * endpoint. Fire-and-forget through ctx.waitUntil so it never blocks or
 * fails the MCP response — a logging outage must not take the server down.
 * No-ops when the source isn't configured, so the worker still runs in
 * local dev and forks without Better Stack credentials.
 */
function logToBetterStack(
  env: MCPEnv,
  ctx: ExecutionContext,
  event: Record<string, unknown>
): void {
  const url = env.BETTERSTACK_INGEST_URL;
  const token = env.BETTERSTACK_SOURCE_TOKEN;
  if (!url || !token) return;

  const body = JSON.stringify({ dt: new Date().toISOString(), ...event });
  ctx.waitUntil(
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    }).catch(() => {
      // Swallow — a failed log must never surface on the request path.
    })
  );
}

function b64uEncode(data: Uint8Array | string): string {
  const bytes =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64uDecode(str: string): Uint8Array {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return b64uEncode(new Uint8Array(sig));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function signPayload<T>(secret: string, payload: T): Promise<string> {
  const encoded = b64uEncode(JSON.stringify(payload));
  const sig = await hmacSign(secret, encoded);
  return `${encoded}.${sig}`;
}

async function verifyPayload<T = any>(
  secret: string,
  token: string
): Promise<T | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = await hmacSign(secret, encoded);
  if (!constantTimeEqual(expected, sig)) return null;
  try {
    const json = new TextDecoder().decode(b64uDecode(encoded));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

async function verifyPKCE(
  verifier: string,
  challenge: string,
  method: string
): Promise<boolean> {
  if (method === "plain") return verifier === challenge;
  if (method === "S256") {
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(verifier)
    );
    return b64uEncode(new Uint8Array(hash)) === challenge;
  }
  return false;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

const UPSTREAM = "https://app.linklyhq.com";
const SELF_ORIGIN = "https://mcp.linklyhq.com";
const CALLBACK_PATH = "/oauth/callback";

interface AuthState {
  rd: string; // MCP client redirect_uri
  st?: string; // MCP client state
  cc?: string; // PKCE code_challenge
  ccm?: string; // PKCE code_challenge_method
  exp: number;
}

interface AuthCodePayload {
  at: string; // upstream access_token
  rd: string; // MCP client redirect_uri (for binding)
  cc?: string;
  ccm?: string;
  exp: number;
}

export default {
  async fetch(request: Request, env: MCPEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Fail loud if the upstream OAuth credentials are missing, instead of
    // silently forwarding `client_id=undefined` to Linkly (which returns
    // invalid_client and looks like an upstream fault). This masked a 3-week
    // outage in June 2026 after the creds were moved from hardcoded to env
    // but never set on the deployment. A 500 here surfaces in observability.
    if (
      (url.pathname === "/authorize" || url.pathname === CALLBACK_PATH) &&
      (!env.LINKLY_CLIENT_ID || !env.LINKLY_CLIENT_SECRET)
    ) {
      return jsonResponse(
        {
          error: "server_error",
          error_description:
            "MCP OAuth is misconfigured: LINKLY_CLIENT_ID / LINKLY_CLIENT_SECRET not set",
        },
        500
      );
    }

    // ------------------------------------------------------------------
    // OAuth callback — Linkly redirects here after the user approves
    // ------------------------------------------------------------------
    if (url.pathname === CALLBACK_PATH && request.method === "GET") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const upstreamError = url.searchParams.get("error");

      if (upstreamError) {
        return new Response(
          `OAuth error from Linkly: ${upstreamError}`,
          { status: 400, headers: { "Content-Type": "text/plain" } }
        );
      }
      if (!code || !state) {
        return new Response("Missing code or state", { status: 400 });
      }

      const authState = await verifyPayload<AuthState>(
        env.SIGNING_SECRET,
        state
      );
      if (!authState || authState.exp < Date.now()) {
        return new Response("Invalid or expired state", { status: 400 });
      }

      // Exchange the upstream code for an upstream access token using the
      // worker's pre-registered client credentials.
      const tokenForm = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${SELF_ORIGIN}${CALLBACK_PATH}`,
        client_id: env.LINKLY_CLIENT_ID,
        client_secret: env.LINKLY_CLIENT_SECRET,
      });

      const upstreamResp = await fetch(`${UPSTREAM}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenForm.toString(),
      });

      if (!upstreamResp.ok) {
        const text = await upstreamResp.text();
        console.log("Upstream token exchange failed:", upstreamResp.status, text);
        logToBetterStack(env, ctx, {
          level: "error",
          message: "upstream_token_exchange_failed",
          status: upstreamResp.status,
          detail: text,
        });
        return new Response(
          `Upstream token exchange failed (${upstreamResp.status}): ${text}`,
          { status: 502, headers: { "Content-Type": "text/plain" } }
        );
      }

      const upstreamToken = (await upstreamResp.json()) as {
        access_token: string;
        token_type?: string;
        scope?: string;
      };

      // Mint a worker auth code wrapping the upstream token. Short TTL since
      // the MCP client should redeem it within seconds.
      const authCode = await signPayload<AuthCodePayload>(env.SIGNING_SECRET, {
        at: upstreamToken.access_token,
        rd: authState.rd,
        cc: authState.cc,
        ccm: authState.ccm,
        exp: Date.now() + 5 * 60 * 1000,
      });

      // Redirect back to the MCP client's original redirect_uri.
      const finalRedirect = new URL(authState.rd);
      finalRedirect.searchParams.set("code", authCode);
      if (authState.st) finalRedirect.searchParams.set("state", authState.st);
      return Response.redirect(finalRedirect.toString(), 302);
    }

    // ------------------------------------------------------------------
    // ChatGPT app verification challenge (unchanged)
    // ------------------------------------------------------------------
    if (
      url.pathname === "/.well-known/openai-apps-challenge" &&
      request.method === "GET"
    ) {
      return new Response("cIb4e-RR-9Sn82Ewkgjp6OcJrN1BvPcdLEtYUjUzDBA");
    }

    // ------------------------------------------------------------------
    // RFC 9728 — OAuth 2.0 Protected Resource Metadata
    // ------------------------------------------------------------------
    if (
      url.pathname === "/.well-known/oauth-protected-resource" &&
      request.method === "GET"
    ) {
      return jsonResponse({
        resource: SELF_ORIGIN,
        authorization_servers: [SELF_ORIGIN],
        scopes_supported: ["full_access"],
        bearer_methods_supported: ["header"],
      });
    }

    // ------------------------------------------------------------------
    // RFC 8414 — OAuth 2.0 Authorization Server Metadata
    // ------------------------------------------------------------------
    if (
      url.pathname === "/.well-known/oauth-authorization-server" &&
      request.method === "GET"
    ) {
      return jsonResponse({
        issuer: SELF_ORIGIN,
        authorization_endpoint: `${SELF_ORIGIN}/authorize`,
        token_endpoint: `${SELF_ORIGIN}/token`,
        registration_endpoint: `${SELF_ORIGIN}/register`,
        revocation_endpoint: `${UPSTREAM}/oauth/revoke`,
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code"],
        token_endpoint_auth_methods_supported: [
          "none",
          "client_secret_post",
          "client_secret_basic",
        ],
        code_challenge_methods_supported: ["S256"],
        scopes_supported: ["full_access"],
      });
    }

    // ------------------------------------------------------------------
    // RFC 7591 — Dynamic Client Registration
    //
    // We don't actually track per-client metadata; PKCE is the security
    // boundary. We hand back a synthetic public client_id so the MCP SDK
    // can move past discovery.
    // ------------------------------------------------------------------
    if (url.pathname === "/register" && request.method === "POST") {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        // tolerate empty body
      }
      const clientId = `mcp-${crypto.randomUUID()}`;
      return jsonResponse(
        {
          client_id: clientId,
          client_id_issued_at: Math.floor(Date.now() / 1000),
          redirect_uris: body.redirect_uris ?? [],
          grant_types: ["authorization_code"],
          response_types: ["code"],
          token_endpoint_auth_method: "none",
          client_name: body.client_name ?? "Linkly MCP Client",
        },
        201
      );
    }

    // ------------------------------------------------------------------
    // /authorize — wrap MCP redirect + PKCE in a signed state and forward
    // to upstream Linkly using our pre-registered client_id.
    // ------------------------------------------------------------------
    if (url.pathname === "/authorize" && request.method === "GET") {
      const redirectUri = url.searchParams.get("redirect_uri");
      const responseType = url.searchParams.get("response_type") ?? "code";
      const codeChallenge = url.searchParams.get("code_challenge") ?? undefined;
      const codeChallengeMethod =
        url.searchParams.get("code_challenge_method") ?? undefined;
      const mcpState = url.searchParams.get("state") ?? undefined;

      if (!redirectUri) {
        return new Response("Missing redirect_uri", { status: 400 });
      }
      if (responseType !== "code") {
        return new Response("Only response_type=code is supported", {
          status: 400,
        });
      }
      if (codeChallenge && codeChallengeMethod && codeChallengeMethod !== "S256") {
        return new Response("Only S256 code_challenge_method is supported", {
          status: 400,
        });
      }

      const authState = await signPayload<AuthState>(env.SIGNING_SECRET, {
        rd: redirectUri,
        st: mcpState,
        cc: codeChallenge,
        ccm: codeChallengeMethod,
        exp: Date.now() + 10 * 60 * 1000,
      });

      const target = new URL(`${UPSTREAM}/oauth/authorize`);
      target.searchParams.set("client_id", env.LINKLY_CLIENT_ID);
      target.searchParams.set("redirect_uri", `${SELF_ORIGIN}${CALLBACK_PATH}`);
      target.searchParams.set("response_type", "code");
      target.searchParams.set("state", authState);
      const scope = url.searchParams.get("scope");
      if (scope) target.searchParams.set("scope", scope);

      return Response.redirect(target.toString(), 302);
    }

    // ------------------------------------------------------------------
    // /token — exchange the worker's signed auth code (verifying PKCE) for
    // the upstream access_token wrapped inside.
    // ------------------------------------------------------------------
    if (url.pathname === "/token" && request.method === "POST") {
      const ctype = request.headers.get("Content-Type") || "";
      let params: URLSearchParams;
      if (ctype.includes("application/json")) {
        const body = (await request.json()) as Record<string, string>;
        params = new URLSearchParams(body as any);
      } else {
        params = new URLSearchParams(await request.text());
      }

      const grantType = params.get("grant_type");
      if (grantType !== "authorization_code") {
        return jsonResponse(
          {
            error: "unsupported_grant_type",
            error_description: "Only authorization_code is supported",
          },
          400
        );
      }
      const code = params.get("code");
      const redirectUri = params.get("redirect_uri");
      const codeVerifier = params.get("code_verifier");
      if (!code || !redirectUri) {
        return jsonResponse(
          {
            error: "invalid_request",
            error_description: "Missing code or redirect_uri",
          },
          400
        );
      }

      const payload = await verifyPayload<AuthCodePayload>(
        env.SIGNING_SECRET,
        code
      );
      if (!payload || payload.exp < Date.now()) {
        return jsonResponse(
          {
            error: "invalid_grant",
            error_description: "Invalid or expired authorization code",
          },
          400
        );
      }
      if (payload.rd !== redirectUri) {
        return jsonResponse(
          {
            error: "invalid_grant",
            error_description: "redirect_uri does not match",
          },
          400
        );
      }
      if (payload.cc) {
        if (!codeVerifier) {
          return jsonResponse(
            {
              error: "invalid_request",
              error_description: "Missing code_verifier",
            },
            400
          );
        }
        const ok = await verifyPKCE(
          codeVerifier,
          payload.cc,
          payload.ccm || "S256"
        );
        if (!ok) {
          return jsonResponse(
            {
              error: "invalid_grant",
              error_description: "PKCE verification failed",
            },
            400
          );
        }
      }

      // Linkly issues no expires_in or refresh_token. Advertise a long TTL so
      // MCP clients don't try to refresh prematurely; if the underlying token
      // is rejected, the client will re-run the full auth flow.
      return jsonResponse({
        access_token: payload.at,
        token_type: "Bearer",
        expires_in: 60 * 60 * 24 * 365,
        scope: "full_access",
      });
    }

    // ------------------------------------------------------------------
    // CORS preflight (browsers + some MCP clients send this)
    // ------------------------------------------------------------------
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Authorization, Content-Type, Mcp-Session-Id, MCP-Protocol-Version",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const apiKey = url.searchParams.get("apiKey") || "";
    const workspaceId = url.searchParams.get("workspaceId") || "";

    // ------------------------------------------------------------------
    // GET / — MCP Streamable HTTP optionally lets clients open a long
    // lived SSE stream via GET. We don't initiate server→client messages,
    // so per spec we return 405 with Accept-Post so the client falls back
    // to POST cleanly. Browsers without an event-stream Accept get the
    // human-readable welcome text.
    // ------------------------------------------------------------------
    if (url.pathname === "/" && request.method === "GET") {
      const accept = request.headers.get("Accept") || "";
      if (accept.includes("text/event-stream")) {
        return new Response(null, {
          status: 405,
          headers: {
            Allow: "POST",
            "Accept-Post": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      return new Response(
        "Linkly MCP Server. For documentation please visit https://linklyhq.com/support/mcp-server",
        {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Accept-Post": "application/json",
          },
        }
      );
    }

    // if (!apiKey || !workspaceId) {
    //   return new Response(
    //     JSON.stringify({ error: "Missing api key or workspaceId" }),
    //     { status: 400, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    // MCP endpoint
    if (request.method === "POST") {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return new Response(
          JSON.stringify(jsonRpcError(null, -32700, "Parse error")),
          { status: 400 }
        );
      }

      const { id, method, params } = body;
      logToBetterStack(env, ctx, {
        level: "info",
        message: "mcp_request",
        method,
        tool: method === "tools/call" ? params?.name : undefined,
      });
      try {
        const oauthState = getOAuthState(params);
        // ---- initialize ----
        if (method === "initialize") {
          // Per the MCP spec, the server should echo back the client's
          // requested protocolVersion when it can support it. We support
          // the two most-deployed revisions; anything else falls back to
          // the latest we know.
          const SUPPORTED_PROTOCOL_VERSIONS = [
            "2025-06-18",
            "2025-03-26",
            "2024-11-05",
          ];
          const requested = params?.protocolVersion;
          const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
            ? requested
            : "2025-06-18";

          return new Response(
            JSON.stringify(
              jsonRpcResponse(id, {
                protocolVersion,
                capabilities: {
                  tools: { listChanged: false },
                },
                serverInfo: {
                  name: "linkly",
                  title: "Linkly",
                  version: "2.0.0",
                  websiteUrl: "https://linklyhq.com",
                  icons: [
                    { src: "https://mcp.linklyhq.com/icons/icon-16x16.png", mimeType: "image/png", size: "16x16" },
                    { src: "https://mcp.linklyhq.com/icons/icon-32x32.png", mimeType: "image/png", size: "32x32" },
                    { src: "https://mcp.linklyhq.com/icons/icon-48x48.png", mimeType: "image/png", size: "48x48" },
                    { src: "https://mcp.linklyhq.com/icons/icon-64x64.png", mimeType: "image/png", size: "64x64" },
                    { src: "https://mcp.linklyhq.com/icons/icon-128x128.png", mimeType: "image/png", size: "128x128" },
                    { src: "https://mcp.linklyhq.com/icons/icon-256x256.png", mimeType: "image/png", size: "256x256" },
                  ],
                },
                instructions:
                  "Linkly is a link-management and analytics platform. Use these tools to create, update, search, and delete short links; manage custom domains and favicons; configure click webhooks; and read click analytics and exports for the authenticated user's workspace. All actions run against the current OAuth-authenticated workspace (see list_workspaces). Find a link's id with search_links or list_links before calling get_link, update_link, or delete_link.",
              })
            ),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        // ---- notifications/initialized ----
        if (method === "notifications/initialized") {
          return new Response("", { status: 204 });
        }

        // ---- tools/list ----
        if (method === "tools/list") {
          return new Response(
            JSON.stringify(
              jsonRpcResponse(id, {
                tools: TOOLS,
              })
            ),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        // ---- tools/call ----
        if (method === "tools/call") {
          const name = params?.name;
          const args = params?.arguments || {};
          if (request.headers.get("Authorization") === null) {
            // RFC 9728 §5.1: WWW-Authenticate must point at the protected
            // resource metadata so the MCP SDK can start the OAuth flow.
            return new Response(
              JSON.stringify(jsonRpcError(null, -32001, "Unauthenticated")),
              {
                status: 401,
                headers: {
                  "Content-Type": "application/json",
                  "WWW-Authenticate": `Bearer error="invalid_token", error_description="No access token provided", resource_metadata="${SELF_ORIGIN}/.well-known/oauth-protected-resource"`,
                  "Access-Control-Allow-Origin": "*",
                },
              }
            );
          }

          return await handleToolCall(
            id,
            { name, args },
            request.headers.get("Authorization")!
          );
        }

        // ---- method not found ----
        return new Response(
          JSON.stringify(jsonRpcError(id, -32601, "Method not found")),
          { status: 404 }
        );
      } catch (e: any) {
        console.log(e);
        logToBetterStack(env, ctx, {
          level: "error",
          message: "mcp_error",
          method,
          tool: method === "tools/call" ? params?.name : undefined,
          error: String(e?.message ?? e),
          // Present only for upstream API failures (see LinklyApiError).
          error_json: e instanceof LinklyApiError ? e.body : undefined,
          status: e instanceof LinklyApiError ? e.status : undefined,
          stack: e?.stack,
        });
        return new Response(
          JSON.stringify(jsonRpcError(id, -32603, "Internal error")),
          { status: 500 }
        );
      }
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env & MCPEnv>;
