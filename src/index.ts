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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
  },
  {
    name: "list_links_paginated",
    description: "List links with pagination",
    inputSchema: {
      type: "object",
      properties: {
        page: {
          type: "integer",
          description: "Page number",
        },
        page_size: {
          type: "integer",
          description: "Items per page",
        },
      },
    },
    annotations: {
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
  },
  {
    name: "get_link_OAuth",
    description: "Get link details (OAuth flow)",
    inputSchema: {
      type: "object",
      properties: {
        link_id: {
          type: "integer",
        },
      },
      required: ["link_id"],
    },
    annotations: {
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
  },
  {
    name: "create_or_update_linkOAuth",
    description: "Create or update a link (OAuth flow)",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          description: "Link ID (include to update existing link)",
        },
        url: {
          type: "string",
          description: "The destination URL",
        },
        name: { type: "string", description: "Nickname for the link" },
        note: {
          type: "string",
          description: "Private note about this link",
        },
        domain: {
          type: "string",
          description: "Custom domain (without trailing /)",
        },
        domain_id: {
          type: "integer",
          description: "Domain ID (alternative to domain name)",
        },
        slug: {
          type: "string",
          description: "Custom slug (must start with /)",
        },
        enabled: { type: "boolean", description: "Whether the link is active" },
        utm_source: { type: "string" },
        utm_medium: { type: "string" },
        utm_campaign: { type: "string" },
        utm_term: { type: "string" },
        utm_content: { type: "string" },
      },
      required: ["url"],
    },
    annotations: {
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
  },
  {
    name: "list_links_advanced",
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
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
      openWorldHint: true,
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
          description: "Custom domain for the short link (without trailing /)",
        },
        slug: {
          type: "string",
          description: "Custom slug/suffix for the link (must start with /)",
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
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
  },
  {
    name: "list_links",
    description:
      "List all links in the workspace. Returns links with click statistics.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    annotations: {
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: true,
    },
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
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
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
      openWorldHint: true,
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
      openWorldHint: true,
      readOnlyHint: true,
      idempotentHint: true,
      destructiveHint: false,
    },
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
      openWorldHint: true,
      readOnlyHint: false,
      idempotentHint: false,
      destructiveHint: false,
    },
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
      openWorldHint: true,
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
    throw new Error(`Linkly API ${resp.status}: ${text}`);
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
      const result = await apiRequest(token, "POST", "api/v1/test");
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    case "list_links_paginated": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/workspace/${workspaceID[0].id}/links`
      );

      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    case "get_link_OAuth": {
      const { link_id } = args;
      const result = await apiRequest(token, "GET", `/api/v1/link/${link_id}`);
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    case "create_or_update_linkOAuth": {
      const result = await apiRequest(token, "POST", "api/v1/link", args);

      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",

                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    case "list_links_advanced": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/workspace/${workspaceID[0].id}/list_links`,
        args
      );
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    case "get_link": {
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/get_link/${args.link_id}`
      );
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    case "list_workspaces": {
      const result = await apiRequest(token, "GET", `/api/v1/workspaces`);
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    case "list_links": {
      const workspaceID = (await apiRequest(
        token,
        "GET",
        `/api/v1/workspaces`
      )) as { id: number; name: string }[];
      const result = await apiRequest(
        token,
        "GET",
        `/api/v1/workspace/${workspaceID[0].id}/links/export`
      );
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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

      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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

      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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

      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    case "subscribe_link_webhook": {
      const result = await apiRequest(
        token,
        "POST",
        `/api/v1/link/${args.link_id}/webhooks`,
        { url: args.url }
      );
      return new Response(
        JSON.stringify(
          jsonRpcResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          })
        ),
        { headers: { "Content-Type": "application/json" } }
      );
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

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);

    // OAuth callback endpoint
    if (url.pathname === "/oauth/callback" && request.method === "GET") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      if (!code) {
        return new Response(
          JSON.stringify({ error: "Missing authorization code" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Decode client_id and client_secret from the OAuth state parameter
      let clientId: string | undefined;
      let clientSecret: string | undefined;
      if (state) {
        try {
          const decoded = JSON.parse(atob(state));
          clientId = decoded.client_id;
          clientSecret = decoded.client_secret;
        } catch {
          // state may not carry credentials — fall through
        }
      }

      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ error: "Missing client_id or client_secret in OAuth state" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Exchange code for token
      try {
        const tokenResponse = await fetch(
          "https://app.linklyhq.com/oauth/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              grant_type: "authorization_code",
              code,
              redirect_uri: `${url.origin}/oauth/callback`,
              client_id: clientId,
              client_secret: clientSecret,
            }),
          }
        );

        if (!tokenResponse.ok) {
          throw new Error("Token exchange failed");
        }

        const tokenData = (await tokenResponse.json()) as unknown as {
          access_token: string;
          refresh_token: string;
          expires_in: string | number;
        };

        return new Response(
          JSON.stringify({
            success: true,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (
      url.pathname === "/.well-known/openai-apps-challenge" &&
      request.method === "GET"
    ) {
      return new Response("cIb4e-RR-9Sn82Ewkgjp6OcJrN1BvPcdLEtYUjUzDBA");
    }

    if (
      url.pathname === "/.well-known/oauth-protected-resource" &&
      request.method === "GET"
    ) {
      return new Response(
        JSON.stringify({
          resource: "https://mcp.linklyhq.com",
          authorization_servers: ["https://app.linklyhq.com"],
          scopes_supported: ["full_access"],
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Authorize proxy — redirect to app.linklyhq.com with all params forwarded
    if (url.pathname === "/authorize" && request.method === "GET") {
      const target = new URL("https://app.linklyhq.com/oauth/authorize");
      url.searchParams.forEach((value, key) => target.searchParams.set(key, value));
      return Response.redirect(target.toString(), 302);
    }

    if (
      url.pathname === "/.well-known/oauth-authorization-server" &&
      request.method === "GET"
    ) {
      return new Response(
        JSON.stringify({
          issuer: "https://mcp.linklyhq.com",
          authorization_endpoint: "https://mcp.linklyhq.com/authorize",
          token_endpoint: "https://app.linklyhq.com/oauth/token",
          revocation_endpoint: "https://app.linklyhq.com/oauth/revoke",

          response_types_supported: ["code"],
          grant_types_supported: ["authorization_code"],

          token_endpoint_auth_methods_supported: [
            "client_secret_post",
            "client_secret_basic",
          ],

          scopes_supported: ["full_access"],
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = url.searchParams.get("apiKey") || "";
    const workspaceId = url.searchParams.get("workspaceId") || "";

    // Health check
    if (url.pathname === "/" && request.method === "GET") {
      return new Response("Linkly MCP Server. For documentation please visit https://linklyhq.com/support/mcp-server", {
        status: 200,
      });
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
      try {
        const oauthState = getOAuthState(params);
        // ---- initialize ----
        if (method === "initialize") {
          return new Response(
            JSON.stringify(
              jsonRpcResponse(id, {
                protocolVersion: "2024-11-05",
                capabilities: {
                  tools: { listChanged: false },
                },
                serverInfo: {
                  name: "linkly",
                  version: "1.0.0",
                  icons: [
                    { src: "https://mcp.linklyhq.com/icons/icon-16x16.png", mimeType: "image/png", size: "16x16" },
                    { src: "https://mcp.linklyhq.com/icons/icon-32x32.png", mimeType: "image/png", size: "32x32" },
                    { src: "https://mcp.linklyhq.com/icons/icon-48x48.png", mimeType: "image/png", size: "48x48" },
                    { src: "https://mcp.linklyhq.com/icons/icon-64x64.png", mimeType: "image/png", size: "64x64" },
                    { src: "https://mcp.linklyhq.com/icons/icon-128x128.png", mimeType: "image/png", size: "128x128" },
                    { src: "https://mcp.linklyhq.com/icons/icon-256x256.png", mimeType: "image/png", size: "256x256" },
                  ],
                },
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
            return new Response(
              JSON.stringify(jsonRpcError(null, -32001, "Unauthenticated")),
              { status: 401 }
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
        return new Response(
          JSON.stringify(jsonRpcError(id, -32603, "Internal error")),
          { status: 500 }
        );
      }
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
