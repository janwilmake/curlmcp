/// <reference types="@cloudflare/workers-types" />
/// <reference lib="esnext" />

import { env } from "cloudflare:workers";
import { withSimplerAuth } from "simplerauth-client";
import { withMcp } from "with-mcp";
//@ts-ignore
import openapi from "./openapi.json";
type Env = {
  PORT: string;
  OAUTH_PROVIDER_HOST: string;
};

// Proxy configurations for popular sites
const PROXY_CONFIGS: Record<
  string,
  {
    targetUrl?: string | ((url: string) => string);
    headers?: Record<string, string>;
  }
> = {
  "x.com": {
    targetUrl: (url: string) => url.replace("x.com", "xymake.com"),
    headers: { Accept: "text/markdown" },
  },
  "github.com": {
    targetUrl: (url: string) => url.replace("github.com", "uithub.com"),
    headers: { Accept: "text/markdown" },
  },
};

const curlHandler = async (request: Request, env: Env, ctx: any) => {
  if (!ctx.authenticated || !ctx.user) {
    return new Response("Not authorized", { status: 401 });
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  console.log({ pathname });
  // Extract the target URL from the /curl/{url} path
  if (!pathname.startsWith("/curl/")) {
    return new Response("Invalid curl endpoint", { status: 400 });
  }

  // Extract the target URL (everything after /curl/)
  let targetUrl = decodeURIComponent(pathname.substring(6)); // Remove "/curl/"

  // Default to https protocol if not specified
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  console.log({ targetUrl, user: ctx.user.username });

  // Parse query parameters
  const params = new URLSearchParams(url.search);

  // Build request options
  const options: RequestInit = {
    method: params.get("request") || "GET",
    headers: {} as Record<string, string>,
    redirect: params.get("location") === "true" ? "follow" : "manual",
  };

  // Process headers
  params.getAll("header").forEach((header) => {
    const [name, value] = header.split(":", 2);
    if (name && value) {
      options.headers![name.trim()] = value.trim();
    }
  });

  // Handle authentication
  const user = params.get("user");
  if (user) {
    const [username, password] = user.split(":", 2);
    const authHeader = "Basic " + btoa(username + ":" + (password || ""));
    options.headers!.Authorization = authHeader;
  }

  // OAuth token handling - use the authenticated user's token if available
  const accessToken = params.get("access_token");
  if (accessToken) {
    options.headers!.Authorization = `Bearer ${accessToken}`;
  }

  // Handle request body data
  if (params.has("data") || params.has("data-urlencode")) {
    const formData = new FormData();

    // Process regular data
    params.getAll("data").forEach((data) => {
      const [key, value] = data.split("=", 2);
      if (key) formData.append(key, value || "");
    });

    // Process URL-encoded data
    params.getAll("data-urlencode").forEach((data) => {
      const [key, value] = data.split("=", 2);
      if (key) formData.append(key, decodeURIComponent(value || ""));
    });

    // If GET is forced or if it's a GET request
    if (params.get("get") === "true" || options.method === "GET") {
      // Append form data to URL as query string
      const searchParams = new URLSearchParams();
      formData.forEach((value, key) => {
        searchParams.append(key, value.toString());
      });

      // Update target URL with query parameters
      const urlObj = new URL(targetUrl);
      const existingParams = new URLSearchParams(urlObj.search);
      searchParams.forEach((value, key) => {
        existingParams.append(key, value);
      });
      urlObj.search = existingParams.toString();
      targetUrl = urlObj.toString();
    } else {
      // For non-GET requests, set the body
      options.body = formData;
    }
  }

  // Force HEAD method if specified
  if (params.get("head") === "true") {
    options.method = "HEAD";
  }

  // Check for proxy configuration based on URL
  const urlObj = new URL(targetUrl);
  const proxyConfig = PROXY_CONFIGS[urlObj.hostname];
  if (proxyConfig) {
    // Apply proxy transformations
    if (proxyConfig.targetUrl) {
      targetUrl =
        typeof proxyConfig.targetUrl === "function"
          ? proxyConfig.targetUrl(targetUrl)
          : proxyConfig.targetUrl;
    }

    // Apply additional headers from proxy config
    if (proxyConfig.headers) {
      Object.entries(proxyConfig.headers).forEach(([name, value]) => {
        options.headers![name] = value;
      });
    }
  }

  try {
    // Log request without exposing credentials
    const safeOptions = {
      ...options,
      headers: Object.fromEntries(
        Object.entries(options.headers!).map(([key, value]) =>
          key.toLowerCase() === "authorization"
            ? [key, "[REDACTED]"]
            : [key, value]
        )
      ),
    };
    console.log({ targetUrl, options: safeOptions });

    // Make the actual request
    const response = await fetch(targetUrl, options);

    // Prepare response
    let responseBody: string;
    const contentType = response.headers.get("Content-Type") || "";

    // Limit response size to avoid excessive token usage
    const maxResponseSize = 100 * 1024; // 100KB limit

    responseBody = await response.text();

    // Truncate if too large
    if (responseBody.length > maxResponseSize) {
      responseBody =
        responseBody.substring(0, maxResponseSize) +
        "\n\n... Response truncated due to size limits. Full size: " +
        responseBody.length +
        " bytes";
    }

    const responseHeaders: HeadersInit = { "Content-Type": contentType };

    // Include original headers if requested
    if (params.get("include") === "true") {
      responseBody =
        formatResponseHeaders(response.headers) + "\n\n" + responseBody;
    }

    return new Response(responseBody, {
      headers: responseHeaders,
      status: response.status,
    });
  } catch (error: any) {
    return new Response(`Error making request: ${error.message}`, {
      status: 500,
    });
  }
};

// Helper function to format response headers
function formatResponseHeaders(headers: Headers): string {
  let result = "### Response Headers\n\n```\n";
  headers.forEach((value, key) => {
    result += `${key}: ${value}\n`;
  });
  result += "```";
  return result;
}

const handler = withSimplerAuth(curlHandler, {
  isLoginRequired: true,
  oauthProviderHost: (env as Env).OAUTH_PROVIDER_HOST,
  scope: "profile",
  sameSite: "Lax",
});

export default {
  fetch: withMcp(handler, openapi, {
    authEndpoint: "/me",
    toolOperationIds: ["curlRequest"],
  }),
};
