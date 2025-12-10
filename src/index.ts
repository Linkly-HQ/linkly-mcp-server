import { DurableObject } from "cloudflare:workers";

const API_BASE = "https://app.linklyhq.com";

/** Generic Linkly API request */
async function apiRequest(
  env: Env,
  method: string,
  path: string,
  body: any = null
) {
  const url = `${API_BASE}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-WORKSPACE-ID": env.WORKSPACE_ID,
      "X-API-KEY": env.API_KEY,
    },
  };

  if (body) {
    options.body = JSON.stringify({
      ...body,
      workspace_id: env.WORKSPACE_ID,
      api_key: env.API_KEY,
    });
  }

  const resp = await fetch(url, options);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Linkly API ${resp.status}: ${text}`);
  }

  const contentType = resp.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return resp.json();
  } else {
    return resp.text();
  }
}

/** Available MCP tools */
const tools = [
  {
    name: "create_link",
    description: "Create a new Linkly short link.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Destination URL" },
        name: { type: "string", description: "Name/nickname for the link" },
        note: { type: "string", description: "A private note about this link" },
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
        utm_source: { type: "string", description: "UTM source parameter" },
        utm_medium: { type: "string", description: "UTM medium parameter" },
        utm_campaign: { type: "string", description: "UTM campaign parameter" },
        utm_term: { type: "string", description: "UTM term parameter" },
        utm_content: { type: "string", description: "UTM content parameter" },
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
] as const;

/** Handle MCP tool calls */
async function handleToolCall(env: Env, name: string, args: any) {
  switch (name) {
    case "create_link": {
      const normalized = { ...args };

      // Auto-format slug if provided
      if (normalized.slug && !normalized.slug.startsWith("/")) {
        normalized.slug = "/" + normalized.slug;
      }

      const result = await apiRequest(
        env,
        "POST",
        `/api/v1/workspace/${env.WORKSPACE_ID}/links`,
        normalized
      );

      // MCP tool result content
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: false,
      };
    }

    default:
      // Protocol error: unknown tool
      const err: Error & { code?: number } = new Error(
        `Unknown tool: ${name}`
      );
      err.code = -32601;
      throw err;
  }
}

/** Helper: send JSON-RPC response/notification */
function sendJSONRPC(socket: WebSocket, payload: any) {
  try {
    socket.send(
      JSON.stringify({
        jsonrpc: "2.0",
        ...payload,
      })
    );
  } catch (e) {
    console.error("WebSocket send error:", e);
  }
}

/** Helper: send JSON-RPC error */
function sendJSONRPCError(
  socket: WebSocket,
  id: string | number | null,
  code: number,
  message: string,
  data?: any
) {
  sendJSONRPC(socket, {
    id,
    error: {
      code,
      message,
      ...(data !== undefined ? { data } : {}),
    },
  });
}

/** Durable Object implementing the MCP server over WebSocket */
export class MyDurableObject extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade") || "";
    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Linkly MCP server is running. Connect via WebSocket.", {
        status: 200,
      });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket; MCP will talk JSON-RPC over this
    server.accept();

    server.addEventListener("message", async (evt: MessageEvent) => {
      let data: any;
      try {
        const raw = typeof evt.data === "string" ? evt.data : evt.data.toString();
        data = JSON.parse(raw);
      } catch (err) {
        // JSON parse error
        sendJSONRPCError(server, null, -32700, "Parse error");
        return;
      }

      const id = data.id ?? null;
      const method = data.method as string | undefined;
      const params = (data.params ?? {}) as Record<string, any>;

      if (data.jsonrpc !== "2.0") {
        sendJSONRPCError(server, id, -32600, "Invalid JSON-RPC version");
        return;
      }

      if (!method) {
        sendJSONRPCError(server, id, -32600, "Missing method");
        return;
      }

      try {
        // 1) Initialization handshake
        if (method === "initialize") {
          const clientProtocol = params.protocolVersion as string | undefined;

          sendJSONRPC(server, {
            id,
            result: {
              // Echo client version if given, else fall back to a known revision
              protocolVersion: clientProtocol ?? "2025-06-18",
              capabilities: {
                tools: {
                  // We don't emit tools/list_changed notifications yet
                  listChanged: false,
                },
                // You could add resources/prompts capabilities here in the future
              },
              serverInfo: {
                name: "linkly-mcp-server",
                version: "1.0.0",
              },
            },
          });

          return;
        }

        // 2) Optional notification when client finished its setup
        if (method === "notifications/initialized") {
          // No response for notifications
          return;
        }

        // 3) MCP ping utility
        if (method === "ping") {
          sendJSONRPC(server, {
            id,
            result: {}, // Empty result is fine
          });
          return;
        }

        // 4) List tools
        if (method === "tools/list") {
          // Pagination via params.cursor is ignored for now
          sendJSONRPC(server, {
            id,
            result: {
              tools,
              nextCursor: null,
            },
          });
          return;
        }

        // 5) Call tool
        if (method === "tools/call") {
          const name =
            params.name || params.tool?.name || params?.toolName || null;
          const args =
            params.arguments || params.args || params?.arguments || {};

          if (!name || typeof name !== "string") {
            sendJSONRPCError(
              server,
              id,
              -32602,
              "Missing or invalid tool name"
            );
            return;
          }

          try {
            const toolResult = await handleToolCall(this.env, name, args);

            sendJSONRPC(server, {
              id,
              result: {
                content: toolResult.content,
                // isError indicates tool-level failure vs protocol error
                isError: !!toolResult.isError,
              },
            });
          } catch (err: any) {
            // Tool-level failure -> return as successful result with isError: true
            const message =
              err?.message || `Tool '${name}' failed with unknown error`;
            sendJSONRPC(server, {
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: message,
                  },
                ],
                isError: true,
              },
            });
          }

          return;
        }

        // 6) Unknown method
        sendJSONRPCError(server, id, -32601, `Method not found: ${method}`);
      } catch (err: any) {
        console.error("Unexpected MCP handler error:", err);
        sendJSONRPCError(
          server,
          id,
          -32603,
          "Internal error",
          err?.message ?? String(err)
        );
      }
    });

    server.addEventListener("close", () => {
      // You could clean up per-connection state here
    });

    server.addEventListener("error", (evt) => {
      console.error("WebSocket error:", evt);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}

/** Exported Worker handler that routes to the Durable Object MCP server */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (!env.API_KEY || !env.WORKSPACE_ID) {
      return new Response(
        "Error: API_KEY and WORKSPACE_ID environment variables are required",
        { status: 400 }
      );
    }

    const objectId = env.MY_DURABLE_OBJECT.idFromName(env.WORKSPACE_ID);
    const object = env.MY_DURABLE_OBJECT.get(objectId);
    return object.fetch(request);
  },
} satisfies ExportedHandler<Env>;
