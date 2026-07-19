import { portfolioMcpData } from "../src/components/portfolio-mcp"
import { buildPortfolioMcpHealth } from "../src/components/portfolio-mcp/metadata"

export const onRequestGet = async (): Promise<Response> =>
  new Response(JSON.stringify(buildPortfolioMcpHealth(portfolioMcpData), null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
