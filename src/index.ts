export interface Env {}

function jsonRpcResponse(id: any, result: any) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: any, code: number, message: string) {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message }
  };
}

const TOOLS = [
  {
    name: "ping",
    description: "Returns pong",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/" && request.method === "GET") {
      return new Response("MCP Test Server Running", {
        status: 200
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
                  version: "1.0.0"
                }
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
                nextCursor: null
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
                  isError: false
                })
              ),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify(
              jsonRpcResponse(id, {
                content: [{ type: "text", text: `Unknown tool: ${name}` }],
                isError: true
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
          JSON.stringify(
            jsonRpcError(
              id,
              -32603,
              "Internal error"
            )
          ),
          { status: 500 }
        );
      }
    }

    return new Response("Not found", { status: 404 });
  }
};
