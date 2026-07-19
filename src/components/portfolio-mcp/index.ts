import { buildPortfolioMcpData } from "./build-data"
import { handlePortfolioMcpRequest } from "./protocol"

export const portfolioMcpData = buildPortfolioMcpData({
  sourceCommit: process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA,
})

export { buildPortfolioMcpData, handlePortfolioMcpRequest }
