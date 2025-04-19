# [curl MCP](https://curlmcp.com) - the last MCP you'll need

[![janwilmake/curlmcp context](https://badge.forgithub.com/janwilmake/curlmcp?tab=readme-ov-file)](https://uithub.com/janwilmake/curlmcp?tab=readme-ov-file) [![Thread](https://badge.xymake.com/NathanWilbanks_/status/1898169822573175179?label=Inspiration_X_Thread)](https://xymake.com/NathanWilbanks_/status/1898169822573175179)

> [!IMPORTANT]
> WORK IN PROGRESS

Requirements:

- Exposes simple REST OpenAPI as well as Remote MCP
- X & GitHub OAuth
- Stripe credit deposit
- Contextual Instructions
- Markdown Transformation Proxy for popular websites such as X and GitHub
- Capped free use (per-hour ratelimit), pay as you go after hitting cap.
- Shareable instruction templates

## API Usage: /curl/{url} Endpoint

The `/curl/{url}` endpoint allows you to send HTTP requests to any URL, mimicking the behavior of the `curl` command-line tool. It supports long-form query parameters to specify request details, such as the HTTP method, headers, and data.

Certain urls are configured to be proxied based on your configured template (defaults to [proxy.json](proxy.json))

### Endpoint Syntax

```
GET /curl/{url}?request={method}&header={header}&data={data}&...
```

### Supported Query Parameters

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
| `transform`      | string           | Applies transformations to the response (e.g., `markdown` for X/GitHub compatibility).                   | `transform=markdown`                          |
| `instructions`   | string           | Specifies contextual instructions for the request.                                                       | `instructions=transform_response_to_markdown` |
| `template_id`    | string           | Applies a predefined template of parameters.                                                             | `template_id=abc123`                          |

# Links

- Previous attempt: https://github.com/janwilmake/curlapi
