import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import openapi from "./openapi.json";

type Env = {
  MCP_OBJECT: DurableObjectNamespace<MyMCP>;
};

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "Demo",
    version: "1.0.0",
  });

  async init() {
    this.server.tool(
      "add",
      { a: z.number(), b: z.number() },
      async ({ a, b }) => ({
        content: [{ type: "text", text: String(a + b) }],
      }),
    );
  }
}

// Export the OAuth handler as the default
export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
    const url = new URL(request.url);

    if (url.pathname === "/sse") {
      // Serve the MCP
      return MyMCP.mount("/sse").fetch(
        request,
        { MCP_OBJECT: env.MCP_OBJECT },
        ctx,
      );
    }
  },
};
