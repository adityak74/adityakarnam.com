import type { PortfolioMcpData, PortfolioRecentWork } from "./schema"

export type SearchWorkInput = {
  query: string
  audience?: "recruiter" | "engineer" | "researcher" | "founder"
  limit?: number
}

export type SearchResult = {
  title: string
  type: PortfolioRecentWork["type"]
  url: string
  summary: string
  tags: string[]
  score: number
  matchReason: string
  sourceUrls: string[]
}

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1)

export const searchWork = (data: PortfolioMcpData, input: SearchWorkInput): SearchResult[] => {
  const query = input.query.trim()
  if (!query) throw new Error("query is required")

  const queryTokens = tokenize(query)
  const limit = Math.max(1, Math.min(input.limit ?? 5, 20))

  return data.recentWork
    .map((item) => {
      const haystack = [item.title, item.summary, item.tags.join(" "), item.type].join(" ").toLowerCase()
      const tagMatches = item.tags.filter((tag) => queryTokens.some((token) => tag.toLowerCase().includes(token)))
      const tokenMatches = queryTokens.filter((token) => haystack.includes(token))
      const titleMatches = queryTokens.some((token) => item.title.toLowerCase().includes(token))
      const hasLexicalMatch = titleMatches || tagMatches.length > 0 || tokenMatches.length > 0
      const titleBoost = titleMatches ? 5 : 0
      const projectBoost = hasLexicalMatch && item.type === "project" ? 2 : 0
      const audienceBoost = hasLexicalMatch && input.audience === "recruiter" && item.type === "project" ? 2 : 0
      const score = titleBoost + tagMatches.length * 4 + tokenMatches.length * 2 + projectBoost + audienceBoost

      return {
        title: item.title,
        type: item.type,
        url: item.url,
        summary: item.summary,
        tags: item.tags,
        score,
        matchReason: `Matched ${tokenMatches.length} query terms and ${tagMatches.length} tags.`,
        sourceUrls: item.sourceUrls,
      }
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, limit)
}
