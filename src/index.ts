export interface Env {}

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

const TOOLS = [
  {
    name: "ping",
    description: "Returns pong",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "create_link",
    description:
      "Create a new Linkly short link. Returns the created link with its short URL.",
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
  },
];

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/" && request.method === "GET") {
      return new Response("MCP Test Server Running", {
        status: 200,
      });
    }

    // MCP endpoint
    if (url.pathname === "/mcp" && request.method === "POST") {
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
        // ---- initialize ----
        if (method === "initialize") {
          return new Response(
            JSON.stringify(
              jsonRpcResponse(id, {
                protocolVersion: "2024-11-05",
                capabilities: { tools: { listChanged: false } },
                serverInfo: {
                  name: "mcp-minimal",
                  version: "1.0.0",
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
                nextCursor: null,
              })
            ),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        // ---- tools/call ----
        if (method === "tools/call") {
          const name = params?.name;

          if (name === "ping") {
            return new Response(
              JSON.stringify(
                jsonRpcResponse(id, {
                  content: [{ type: "text", text: "pong" }],
                  isError: false,
                })
              ),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          if(name === "create_link"){
            return new Response(
              JSON.stringify(
                jsonRpcResponse(id,{
                  content:[{type:'text',text:"This will create a new linkly link"}],
                  isError:false
                })
              ),
              {headers:{"Content-Type":"application/json"}}
            )
          }

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

        // ---- method not found ----
        return new Response(
          JSON.stringify(jsonRpcError(id, -32601, "Method not found")),
          { status: 404 }
        );
      } catch (e: any) {
        return new Response(
          JSON.stringify(jsonRpcError(id, -32603, "Internal error")),
          { status: 500 }
        );
      }
    }

    return new Response("Not found", { status: 404 });
  },
};
