import { handlePortfolioMcpRequest, portfolioMcpData } from "../src/components/portfolio-mcp"
import { checkRateLimit } from "./_lib/rate-limit"

type McpFunctionContext = {
  request: Request
  env: {
    RATE_LIMIT_KV?: Parameters<typeof checkRateLimit>[0]
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version",
}

const json = (body: unknown, status: number, extraHeaders: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...corsHeaders,
      ...extraHeaders,
    },
  })

const withNoStore = async (responsePromise: Promise<Response>) => {
  const response = await responsePromise
  const headers = new Headers(response.headers)
  headers.set("Cache-Control", "no-store")
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, { status: 204, headers: corsHeaders })

export const onRequestPost = async (context: McpFunctionContext): Promise<Response> => {
  const contentLength = context.request.headers.get("Content-Length")
  if (contentLength && Number.parseInt(contentLength, 10) > 16384) {
    return json({ error: "Request body too large." }, 413)
  }

  const contentType = context.request.headers.get("Content-Type")
  if (contentType && !contentType.includes("application/json")) {
    return json({ error: "Unsupported media type. Expected application/json." }, 415)
  }

  const clientId = context.request.headers.get("CF-Connecting-IP") ?? "unknown"
  const rateLimit = await checkRateLimit(context.env.RATE_LIMIT_KV, clientId)
  if (!rateLimit.allowed) {
    return json({ error: "Rate limit exceeded." }, 429, { "Retry-After": "60" })
  }

  return withNoStore(handlePortfolioMcpRequest(context.request, portfolioMcpData)).then((response) => {
    response.headers.set("X-Debug-Kv-Bound", String(Boolean(context.env.RATE_LIMIT_KV)))
    return response
  })
}

export const onRequestGet = async (): Promise<Response> =>
  json({ error: "MCP endpoint expects POST JSON-RPC requests.", install: "https://adityakarnam.com/mcp-install/" }, 405)
