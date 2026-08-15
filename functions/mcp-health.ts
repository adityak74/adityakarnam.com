import { buildPortfolioMcpDataForRequest, type PortfolioMcpEnv } from "../src/components/portfolio-mcp"
import { buildPortfolioMcpHealth } from "../src/components/portfolio-mcp/metadata"

type McpHealthFunctionContext = {
  env?: PortfolioMcpEnv
}

export const onRequestGet = async (context: McpHealthFunctionContext): Promise<Response> =>
  new Response(JSON.stringify(buildPortfolioMcpHealth(buildPortfolioMcpDataForRequest(context.env)), null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  })
