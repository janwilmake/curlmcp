# curl MCP v2 - The last MCP you'll need

A powerful, lightweight MCP built on HTTP standards with X OAuth integration.

## Features

- 🔐 **X OAuth Integration** - Seamless authentication with your X account
- 🌐 **Universal HTTP Client** - Make requests to any URL with curl-like syntax
- 🔄 **Smart Proxies** - Automatic routing to LLM-optimized versions of popular sites
- 📝 **Markdown-First** - Responses optimized for LLM consumption
- 🚀 **Cloudflare Workers** - Fast, global edge deployment
- 🛡️ **Secure** - OAuth 2.1 compliant with PKCE

## Quick Start

### MCP Usage

Add to your MCP client config:

```json
{
  "mcpServers": {
    "curlmcp": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-fetch", "https://curlmcp.com/mcp"]
    }
  }
}
```

### Local Development

```bash
# Clone and install
git clone https://github.com/janwilmake/curlmcp-v2
cd curlmcp-v2
npm install

# Start local development (requires x-oauth-provider running on :8787)
npm run dev

# Test with MCP Inspector
npx @modelcontextprotocol/inspector
```

## Usage Examples

### Basic Request
```
GET /curl/api.github.com/users/janwilmake
```

### With Headers
```
GET /curl/api.example.com/data?header=Accept:application/json&header=User-Agent:curl-mcp
```

### POST with Data
```
GET /curl/api.example.com/submit?request=POST&data=name=test&data=value=123
```

### X/GitHub Integration
```
GET /curl/x.com/janwilmake
# Automatically routes to xymake.com with markdown headers

GET /curl/github.com/janwilmake/curlmcp
# Automatically routes to uithub.com with markdown headers
```

## Proxy Configurations

- `x.com` → `xymake.com` (markdown-optimized X)
- `github.com` → `uithub.com` (markdown-optimized GitHub)

## Authentication

The MCP requires X OAuth authentication. On first use, you'll be redirected to authenticate with your X account. The access token is automatically used for requests that need authentication.

## API Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `request` | HTTP method | `POST`, `GET`, etc. |
| `header` | Custom headers | `Accept:application/json` |
| `data` | Request data | `key=value` |
| `user` | Basic auth | `username:password` |
| `access_token` | OAuth token | Uses authenticated user's token by default |
| `include` | Include response headers | `true` |
| `location` | Follow redirects | `true` |

## Architecture

Built using:
- **simplerauth-client** - OAuth integration
- **with-mcp** - OpenAPI to MCP conversion
- **Cloudflare Workers** - Edge deployment

This version eliminates the complexity of the original curlmcp while adding proper authentication and a cleaner architecture.