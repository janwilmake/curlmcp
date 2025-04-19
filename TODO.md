# 1) Make authless curl work

- ✅ Create `/openapi.json`
- ✅ Build out curl and test the CURL itself protected with auth
- ✅ Setup remote mcp (`/sse`) hosted in cloudflare behind my own authwall (Take example from https://github.com/cloudflare/ai/tree/main/demos/remote-mcp-server, but without the auth, as I provide that myself)
- Figure out how to provide the tool params to `AgentMcp` from the package
- Test this from claude and potential mcp playground (without oauth should be fine, auth is optional)

# 2) Add auth and payments

- Add my own X oauth with stripe payments and dashboard where api keys can be created (First make that work at https://github.com/janwilmake/xymake.oauth-stripe-template).
- Perform downstream payments via my own personal API tokens.

# 3) Add needed proxies

- Add firecrawl or similar as fallback scraper

# 4) openapi-to-mcp

Abstract the openapi-to-mcp into a middleware that can be passed the openapi.
