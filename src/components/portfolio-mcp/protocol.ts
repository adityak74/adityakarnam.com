import { buildPortfolioMcpData } from "./build-data"
import { PORTFOLIO_APP_HTML } from "./generated/portfolio-app-html"
import type { PortfolioMcpData } from "./schema"
import { createPortfolioTools, type PortfolioToolName } from "./tools"

type JsonRpcRequest = {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  params?: any
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })

const ok = (id: JsonRpcRequest["id"], result: unknown) => json({ jsonrpc: "2.0", id: id ?? null, result })
const error = (id: JsonRpcRequest["id"], code: number, message: string) =>
  json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } })

const SUPPORTED_PROTOCOL_VERSION = "2025-06-18"

const PORTFOLIO_APP_RESOURCE_URI = "ui://portfolio-app"
const PORTFOLIO_APP_MIME_TYPE = "text/html;profile=mcp-app"

const toolDescriptions = [
  {
    name: "get_profile",
    description: "Get Aditya Karnam's public profile, focus areas, links, and data scope.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "list_projects",
    description: "List public portfolio projects with tags, status, summaries, and source URLs.",
    inputSchema: {
      type: "object",
      properties: {
        tags: { type: "array", items: { type: "string" }, description: "Filter to projects matching any of these tags." },
        status: { type: "string", description: "Filter to projects whose status contains this text." },
        limit: { type: "number", description: "Max projects to return (1-50, default 20)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_project",
    description: "Get one public project by slug or name with source URLs and recruiter framing.",
    inputSchema: {
      type: "object",
      properties: {
        slug_or_name: { type: "string", description: "The project's slug or name." },
      },
      required: ["slug_or_name"],
      additionalProperties: false,
    },
  },
  {
    name: "search_work",
    description: "Search public work deterministically by query and optional audience.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search terms." },
        audience: {
          type: "string",
          enum: ["recruiter", "engineer", "researcher", "founder"],
          description: "Optional audience framing to bias results.",
        },
        limit: { type: "number", description: "Max results to return." },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "get_recent_work",
    description: "Get recent public work across systems and field notes.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max items to return (1-30, default 10)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_recruiter_brief",
    description: "Map public portfolio evidence to a role description with citations and gaps.",
    inputSchema: {
      type: "object",
      properties: {
        role_description: { type: "string", description: "Free-text role description to match against." },
        limit: { type: "number", description: "Max evidence items to return (default 5)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "open_portfolio_app",
    description: "Open an interactive dashboard to check role fit and browse Aditya Karnam's public projects.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    _meta: {
      ui: { resourceUri: PORTFOLIO_APP_RESOURCE_URI },
      "ui/resourceUri": PORTFOLIO_APP_RESOURCE_URI,
    },
  },
]

const resources = [
  { uri: "portfolio://profile", name: "Profile", mimeType: "application/json" },
  { uri: "portfolio://systems", name: "Systems", mimeType: "application/json" },
  { uri: "portfolio://research-agenda", name: "Research Agenda", mimeType: "application/json" },
  { uri: "portfolio://recent-work", name: "Recent Work", mimeType: "application/json" },
  { uri: "portfolio://recruiter-guide", name: "Recruiter Guide", mimeType: "application/json" },
  { uri: PORTFOLIO_APP_RESOURCE_URI, name: "Portfolio App", mimeType: PORTFOLIO_APP_MIME_TYPE },
]

const readJsonResource = (data: PortfolioMcpData, uri: string) => {
  if (uri === "portfolio://profile") return data.profile
  if (uri === "portfolio://systems") return data.projects
  if (uri === "portfolio://research-agenda") return data.researchAgenda
  if (uri === "portfolio://recent-work") return data.recentWork
  if (uri === "portfolio://recruiter-guide") {
    return {
      summary: data.profile.recruiterSummary,
      bestUsedFor: ["AI infrastructure fit", "agent systems", "MCP", "retrieval", "memory", "local inference", "evals"],
      notFor: data.dataScope.doesNotExpose,
      sourceUrls: [data.siteUrl, data.installPageUrl],
    }
  }
  throw new Error("Resource not found")
}

const readResource = (data: PortfolioMcpData, uri: string): { mimeType: string; text: string } => {
  if (uri === PORTFOLIO_APP_RESOURCE_URI) {
    return { mimeType: PORTFOLIO_APP_MIME_TYPE, text: PORTFOLIO_APP_HTML }
  }

  const jsonResource = readJsonResource(data, uri)
  return { mimeType: "application/json", text: JSON.stringify(jsonResource, null, 2) }
}

export const handlePortfolioMcpRequest = async (request: Request, data = buildPortfolioMcpData()): Promise<Response> => {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405)

  const body = (await request.json().catch(() => null)) as JsonRpcRequest | null
  if (!body || body.jsonrpc !== "2.0" || !body.method) return error(null, -32600, "Invalid Request")

  const protocolVersion = request.headers.get("MCP-Protocol-Version")?.trim()
  if (body.method !== "initialize" && protocolVersion && protocolVersion !== SUPPORTED_PROTOCOL_VERSION) {
    return error(body.id, -32600, "Unsupported protocol version")
  }

  if (body.method === "initialize") {
    return ok(body.id, {
      protocolVersion: SUPPORTED_PROTOCOL_VERSION,
      capabilities: { tools: {}, resources: {} },
      serverInfo: { name: data.name, version: data.dataVersion },
    })
  }

  if (body.method === "tools/list") return ok(body.id, { tools: toolDescriptions })

  if (body.method === "tools/call") {
    const tools = createPortfolioTools(data)
    const name = body.params?.name as PortfolioToolName
    if (!name || !(name in tools)) return error(body.id, -32602, "Unknown tool")
    try {
      const result = tools[name](body.params?.arguments ?? {})
      return ok(body.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] })
    } catch (toolError) {
      const message = toolError instanceof Error ? toolError.message : "Invalid tool arguments."
      return error(body.id, -32602, message)
    }
  }

  if (body.method === "resources/list") return ok(body.id, { resources })

  if (body.method === "resources/read") {
    try {
      const { mimeType, text } = readResource(data, body.params?.uri)
      return ok(body.id, { contents: [{ uri: body.params.uri, mimeType, text }] })
    } catch (_error) {
      return error(body.id, -32602, "Resource not found")
    }
  }

  return error(body.id, -32601, "Method not found")
}
