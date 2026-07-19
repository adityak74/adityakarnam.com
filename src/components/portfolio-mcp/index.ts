import { buildPortfolioMcpData } from "./build-data"
import { handlePortfolioMcpRequest } from "./protocol"

const nodeEnv = typeof process === "undefined" ? undefined : process.env

export const portfolioMcpData = buildPortfolioMcpData({
  sourceCommit: nodeEnv?.CF_PAGES_COMMIT_SHA ?? nodeEnv?.GITHUB_SHA,
})

export { buildPortfolioMcpData, handlePortfolioMcpRequest }
