import type { PortfolioMcpData } from "./schema"

export const portfolioToolNames = [
  "get_profile",
  "list_projects",
  "get_project",
  "search_work",
  "get_recent_work",
  "list_thoughts",
  "get_thought",
  "get_recruiter_brief",
]

export const portfolioResourceUris = [
  "portfolio://profile",
  "portfolio://systems",
  "portfolio://thoughts",
  "portfolio://research-agenda",
  "portfolio://recent-work",
  "portfolio://recruiter-guide",
]

export const buildPortfolioMcpManifest = (data: PortfolioMcpData) => ({
  name: data.name,
  displayName: data.displayName,
  description: data.description,
  version: data.dataVersion,
  transport: data.transport,
  mcpUrl: data.mcpUrl,
  installPageUrl: data.installPageUrl,
  healthUrl: data.healthUrl,
  siteUrl: data.siteUrl,
  dataScope: data.dataScope,
})

export const buildPortfolioMcpHealth = (data: PortfolioMcpData) => ({
  ok: true,
  name: data.name,
  mcpUrl: data.mcpUrl,
  version: data.dataVersion,
  generatedAt: data.generatedAt,
  sourceCommit: data.sourceCommit,
  tools: portfolioToolNames,
  resources: portfolioResourceUris,
})
