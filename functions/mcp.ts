import { handlePortfolioMcpRequest, portfolioMcpData } from "../src/components/portfolio-mcp"

export const onRequestPost = async (context: { request: Request }): Promise<Response> =>
  handlePortfolioMcpRequest(context.request, portfolioMcpData)

export const onRequestGet = async (): Promise<Response> =>
  new Response(JSON.stringify({ error: "MCP endpoint expects POST JSON-RPC requests.", install: "https://adityakarnam.com/mcp-install/" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  })
