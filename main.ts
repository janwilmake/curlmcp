import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import openapi from "./openapi.json";

type Env = {
  MCP_OBJECT: DurableObjectNamespace<MyMCP>;
};

const curl = async (request: Request) => {
  return new Response("Result");
};

type OpenapiOperation = any;

/**
TODO: I've done this before, let's find that and keep it simple (not merging the different rest params)
 */
const operationToSchema = (operation: OpenapiOperation) => {
  // input params going into the tool
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      headers: { type: "object" },
      query: { type: "object" },
      body: { type: "object" },
    },
  };
};

export class MyMCP extends McpAgent {
  server = new McpServer(
    {
      name: openapi.info.title,
      version: openapi.info.version,
    },
    {
      instructions: openapi.info.description,
      capabilities: {
        tools: {
          // Is this where the schema goes of input params? For now, can do it manually, but for OpenAPI to MCP, we can do this.
          // operationToSchema(openapi.paths["/curl/{url}"].get);
          curl: {},
        },
      },
    },
  );

  async init() {
    // this can be done iterated over the operations

    this.server.tool(
      openapi.paths["/curl/{url}"].get.operationId,
      // this must be zod-defined so the next one is typed. is this what's provided to the tool, or can i provide it upthere in McpServer.capabilities?
      {} as any,
      // Execute the tool
      async ({ headers, query, body, path }, extra) => {
        // Build the request from the tool input
        const request = new Request(
          `http://dummy-url${path}${
            query ? `?` + new URLSearchParams(query).toString() : ""
          }`,
          { headers, body: body ? JSON.stringify(body) : undefined },
        );
        // does this contain header info?
        // extra.authInfo
        const result = await curl(request);

        if (!result.ok) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `${result.status} error - ${await result.text()}`,
              },
            ],
          };
        }

        // 20X response assumed to have text. However, I could also parse the other types here based on the response content-type
        const contentType = result.headers.get("content-type");
        if (!contentType || contentType.startsWith("text/")) {
          try {
            const text = await result.text();
            return { content: [{ type: "text", text }] };
          } catch (e) {
            return {
              content: [{ type: "text", text: `Error 500 - ${e.message}` }],
              isError: true,
            };
          }
        }

        // TODO: Parse other types
        return {
          content: [
            {
              type: "text",
              text: `Error 500 - Type not supported yet. Tool returned ${contentType}`,
            },
          ],
          isError: true,
        };
      },
    );
  }
}

// Export the OAuth handler as the default
export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
    const url = new URL(request.url);

    // TODO: Integrate oauth2 server

    if (url.pathname.startsWith("/curl/")) {
      // regular rest-based execution of the endpoint
      return curl(request);
    }

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
