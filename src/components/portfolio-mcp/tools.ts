import type { PortfolioMcpData, PortfolioRecentWork } from "./schema"
import { searchWork, type SearchWorkInput } from "./search"

type JsonObject = Record<string, unknown>

const normalizeText = (value: string) => value.toLowerCase().replace(/^\/+|\/+$/g, "")

export const createPortfolioTools = (data: PortfolioMcpData) => ({
  get_profile: (_input: JsonObject) => ({
    dataVersion: data.dataVersion,
    generatedAt: data.generatedAt,
    sourceCommit: data.sourceCommit,
    profile: data.profile,
    dataScope: data.dataScope,
    sourceUrls: [data.siteUrl, ...data.profile.publicLinks.map((link) => link.url)],
  }),

  list_projects: (input: { tags?: string[]; status?: string; limit?: number }) => {
    const wantedTags = (input.tags ?? []).map((tag) => tag.toLowerCase())
    const limit = Math.max(1, Math.min(input.limit ?? 20, 50))
    const projects = data.projects
      .filter((project) =>
        wantedTags.length === 0
          ? true
          : wantedTags.some((tag) => project.tags.map((value) => value.toLowerCase()).includes(tag))
      )
      .filter((project) => (input.status ? project.status.toLowerCase().includes(input.status.toLowerCase()) : true))
      .slice(0, limit)

    return { dataVersion: data.dataVersion, projects }
  },

  get_project: (input: { slug_or_name: string }) => {
    const lookup = normalizeText(input.slug_or_name ?? "")
    const project = data.projects.find((entry) => normalizeText(entry.slug) === lookup || normalizeText(entry.name) === lookup)
    if (project) return { found: true, project }

    return {
      found: false,
      error: "Project not found.",
      suggestions: data.projects.slice(0, 5).map((entry) => ({ name: entry.name, slug: entry.slug })),
    }
  },

  search_work: (input: SearchWorkInput) => ({
    dataVersion: data.dataVersion,
    results: searchWork(data, input),
  }),

  get_recent_work: (input: { limit?: number; type?: PortfolioRecentWork["type"] }) => ({
    dataVersion: data.dataVersion,
    recentWork: data.recentWork
      .filter((item) => (input.type ? item.type === input.type : true))
      .slice(0, Math.max(1, Math.min(input.limit ?? 10, 30))),
  }),

  list_thoughts: (input: { tags?: string[]; query?: string; limit?: number }) => {
    const wantedTags = (input.tags ?? []).map((tag) => tag.toLowerCase())
    const query = input.query?.trim().toLowerCase() ?? ""
    const limit = Math.max(1, Math.min(input.limit ?? 20, 50))

    const posts = data.thoughts
      .filter((post) =>
        wantedTags.length === 0 ? true : wantedTags.some((tag) => post.tags.map((value) => value.toLowerCase()).includes(tag))
      )
      .filter((post) =>
        query ? [post.title, post.description, post.excerpt, post.tags.join(" ")].join(" ").toLowerCase().includes(query) : true
      )
      .slice(0, limit)
      .map(({ body: _body, ...summary }) => summary)

    return { dataVersion: data.dataVersion, total: data.thoughts.length, posts }
  },

  get_thought: (input: { slug_or_title: string }) => {
    const lookup = normalizeText(input.slug_or_title ?? "")
    const post = data.thoughts.find(
      (entry) => normalizeText(entry.slug) === lookup || normalizeText(entry.title) === lookup
    )
    if (post) return { found: true, post }

    return {
      found: false,
      error: "Post not found.",
      suggestions: data.thoughts.slice(0, 5).map((entry) => ({ title: entry.title, slug: entry.slug })),
    }
  },

  get_recruiter_brief: (input: { role_description?: string; limit?: number }) => {
    const query = input.role_description?.trim() || "AI infrastructure MCP retrieval memory evals agent runtime"
    const evidence = searchWork(data, { query, audience: "recruiter", limit: input.limit ?? 5 })

    return {
      dataVersion: data.dataVersion,
      fitSummary:
        evidence.length > 0
          ? "Public portfolio evidence shows relevant AI infrastructure, agent systems, MCP, retrieval, memory, local inference, or eval work."
          : "The public portfolio data does not provide strong direct evidence for this role description.",
      evidence,
      interviewTopics: evidence.map((entry) => `Ask about ${entry.title}: ${entry.matchReason}`),
      gaps:
        evidence.length > 0
          ? ["Confirm role-specific production scale, team scope, and domain requirements in interview."]
          : ["No strong public match found in the portfolio data for the supplied role description."],
      sourceUrls: Array.from(new Set(evidence.flatMap((entry) => entry.sourceUrls))),
    }
  },

  open_portfolio_app: (_input: JsonObject) => ({ opened: true }),
})

export type PortfolioToolRegistry = ReturnType<typeof createPortfolioTools>
export type PortfolioToolName = keyof PortfolioToolRegistry
