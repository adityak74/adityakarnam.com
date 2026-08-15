import { buildPortfolioMcpData } from "./build-data"
import { handlePortfolioMcpRequest } from "./protocol"
import type { PortfolioMcpData } from "./schema"

export type PortfolioMcpEnv = {
  CF_PAGES_COMMIT_SHA?: string
  GITHUB_SHA?: string
}

const nonEmpty = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Builds the MCP payload inside a request handler.
 *
 * This must not be hoisted to module scope: Cloudflare Workers freeze `Date.now()`
 * outside request context (which pins `generatedAt` to the epoch), and Pages Functions
 * only expose env vars via `context.env`, never as a global `process.env`.
 */
export const buildPortfolioMcpDataForRequest = (env: PortfolioMcpEnv = {}): PortfolioMcpData =>
  buildPortfolioMcpData({
    generatedAt: new Date().toISOString(),
    sourceCommit: nonEmpty(env.CF_PAGES_COMMIT_SHA) ?? nonEmpty(env.GITHUB_SHA),
  })

export { buildPortfolioMcpData, handlePortfolioMcpRequest }
