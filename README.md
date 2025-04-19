# [curl mcp](https://curlmcp.com) - the last MCP you'll need

[![janwilmake/curlmcp context](https://badge.forgithub.com/janwilmake/curlmcp)](https://uithub.com/janwilmake/curlmcp?tab=readme-ov-file) [![Thread](https://badge.xymake.com/NathanWilbanks_/status/1898169822573175179?label=Inspiration_SLOP&a)](https://xymake.com/NathanWilbanks_/status/1898169822573175179) [![Thread](https://badge.xymake.com/janwilmake/status/1903372996128960928?label=Inspiration_Sam)](https://xymake.com/janwilmake/status/1903372996128960928)

> [!IMPORTANT]
> WORK IN PROGRESS

Requirements:

- Exposes simple REST API (with OpenAPI) as well as Remote MCP
- Easy to use through any MCP client, through API, and through browsers.
- X & GitHub OAuth
- Stripe credit deposit
- Contextual Instructions
- Markdown Transformation Proxy for popular websites such as X and GitHub
- Capped free use (per-hour ratelimit), pay as you go after hitting cap.
- Shareable instruction templates

# My principles for making the LLM actually work well with tons of tools:

1. As the LLM knows popular websites, instruct it to simply use the web like normal.
2. Under water, ensure every input is somehow routed to the right substitute website(s).
3. Ensure every response is markdown and contains very few tokens, ideally less than 1000! This ensures we can do many steps.
4. Ensure the dead ends guide the LLM back on track.
5. Ensure every step in a multi-step process contains instructions about what to do next.
6. Ensure the path the LLM visit is the same as the path the user or crawler visits. Respond well on accept header and other information to distinguish.

How should product builders of today become ready to allow for this?

1. Most APIs use POST, but GET is easier to be instructed about, as it can be done in markdown. Let's promote making APIs GET and promote super easy to understand URL structures with minimal token length.
2. Ensure to use OpenAPI to show the possible endpoints and routing. Your API should be the first-class citizen, not your website.
3. Ensure to make your openapi explorable by either putting it right on the root at `/openapi.json`, or by putting redirecting to it from `/.well-known/openapi` if that's not possible.
4. Ensure all your pages that are exposed as text/html also expose a non-html variant (preferably markdown, or yaml if structured data can also be useful) that is under 1000 tokens with the same/similar functionality.
5. Hitting errors in your API should always guide the agent back on track, just like we do with humans. Try buildling these UX pathways on the API level!

Is it somehow possible to provide this as a middleware to APIs? For sure! The one tool to rule them all is curl (or fetch), and it could be made safe in the following way:

- Ensure to route away from human-first websites to ai-optimised websites.
- Ensure to truncate the response to never be above a certain limit
- Ensure to prefer accepting markdown

# Usage

## MCP Usage:

Install it into your MCP Client by adding the following to your config:

```json
{
  "mcpServers": {
    "curlmcp": {
      "command": "npx",
      "args": ["mcp-remote", "https://curlmcp.com/sse"]
    }
  }
}
```

## Browser Usage

The curlmcp api is easy to use from the browser too. Authentication is automatically handled.

## CLI Usage

You can simply use curl yourself, or to have the curl mcp proxy:

- use `curl -c cookies.txt https://curlmcp.com/login` to login and store cookies
- use `curl -b cookies.txt https://curlmcp.com/curl/{your-request}`

## API Usage: `/curl/{url}` Endpoint

The `/curl/{url}` endpoint allows you to send HTTP requests to any URL, mimicking the behavior of the `curl` command-line tool. It supports long-form query parameters to specify request details, such as the HTTP method, headers, and data.

Certain urls are configured to be proxied based on your configured template (defaults to [default-proxy.yaml](default-proxy.yaml))

### API Specification

```
GET /curl/{url}?request={method}&header={header}&data={data}&...
```

NB: {url} uses the `https` protocol by default.

#### Supported Query Parameters

| Parameter        | Type             | Description                                                                                              | Example                                       |
| ---------------- | ---------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `request`        | string           | Specifies the HTTP method. Valid values: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS`.     | `request=POST`                                |
| `header`         | array of strings | Adds custom HTTP headers. Repeat for multiple headers.                                                   | `header=Content-Type:application/json`        |
| `data`           | array of strings | Sends data in the request body (POST) or query string (with `get=true`). Repeat for multiple data pairs. | `data=key=value`                              |
| `data-urlencode` | array of strings | Sends URL-encoded data in the request.                                                                   | `data-urlencode=comment=this%20is%20awesome`  |
| `get`            | boolean          | Forces data to be sent as a GET request query string.                                                    | `get=true`                                    |
| `include`        | boolean          | Includes response headers in the output.                                                                 | `include=true`                                |
| `head`           | boolean          | Sends a HEAD request.                                                                                    | `head=true`                                   |
| `user`           | string           | Specifies credentials for authentication (format: `username:password`).                                  | `user=user:pass`                              |
| `location`       | boolean          | Follows HTTP redirects.                                                                                  | `location=true`                               |
| `verbose`        | boolean          | Enables verbose output for debugging.                                                                    | `verbose=true`                                |
| `access_token`   | string           | Injects an OAuth token for X or GitHub authentication.                                                   | `access_token=xyz`                            |
| `instructions`   | string           | Specifies contextual instructions for the request.                                                       | `instructions=transform_response_to_markdown` |

# Links

- Previous attempt (curl api): https://github.com/janwilmake/curlapi
- Previous attempt (fetch mcp): https://github.com/janwilmake/fetch-mcp
