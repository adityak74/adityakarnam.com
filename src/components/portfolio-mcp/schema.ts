export const PORTFOLIO_MCP_NAME = "aditya-portfolio"
export const PORTFOLIO_MCP_DISPLAY_NAME = "Aditya Karnam Portfolio MCP"
export const PORTFOLIO_MCP_TRANSPORT = "http"
export const PORTFOLIO_MCP_URL = "https://adityakarnam.com/mcp"
export const PORTFOLIO_MCP_INSTALL_URL = "https://adityakarnam.com/mcp-install/"
export const PORTFOLIO_MCP_HEALTH_URL = "https://adityakarnam.com/mcp-health"
export const PORTFOLIO_MCP_MANIFEST_URL = "https://adityakarnam.com/.well-known/aditya-portfolio-mcp.json"
export const PORTFOLIO_SITE_URL = "https://adityakarnam.com"
export const PORTFOLIO_DATA_VERSION = "2026.07.26"

export type PublicDataScope = {
  exposes: string[]
  doesNotExpose: string[]
}

export type PortfolioProfile = {
  name: string
  title: string
  labName: string
  tagline: string
  currentFocus: string[]
  publicLinks: Array<{ label: string; url: string }>
  recruiterSummary: string
  engineeringSummary: string
}

export type PortfolioProject = {
  name: string
  slug: string
  tags: string[]
  status: string
  researchQuestion: string
  systemBuilt: string
  whyItMatters: string
  canonicalUrl: string
  links: Array<{ label: string; href: string }>
  explanationModes: Record<string, string>
  recruiterFraming: string
  sourceUrls: string[]
}

/** A curated "Thoughts" blog post (everything on /blog/, i.e. excluding autoblog entries). */
export type PortfolioThought = {
  slug: string
  title: string
  date: string
  description: string
  excerpt: string
  tags: string[]
  url: string
  wordCount: number
  body: string
}

export type PortfolioRecentWork = {
  title: string
  type: "project" | "field-note" | "post" | "project-page"
  slug: string
  dateOrStatus: string
  url: string
  summary: string
  tags: string[]
  sourceUrls: string[]
}

export type PortfolioMcpData = {
  name: string
  displayName: string
  description: string
  transport: "http"
  mcpUrl: string
  installPageUrl: string
  manifestUrl: string
  healthUrl: string
  siteUrl: string
  dataVersion: string
  generatedAt: string
  sourceCommit: string
  dataScope: PublicDataScope
  profile: PortfolioProfile
  projects: PortfolioProject[]
  thoughts: PortfolioThought[]
  researchAgenda: Array<{ title: string; question: string; sourceUrls: string[] }>
  recentWork: PortfolioRecentWork[]
  operatingPrinciples: string[]
}
