import type { App } from "@modelcontextprotocol/ext-apps"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import type { PortfolioProject } from "../schema"
import type { SearchResult } from "../search"

export class ToolCallError extends Error {}

export const parseToolResult = <T>(result: CallToolResult): T => {
  const textContent = result.content?.find((entry) => entry.type === "text")
  if (!textContent || textContent.type !== "text") {
    throw new ToolCallError("Tool result did not include text content.")
  }
  if (result.isError) {
    throw new ToolCallError(textContent.text)
  }
  try {
    return JSON.parse(textContent.text) as T
  } catch {
    throw new ToolCallError("Tool result was not valid JSON.")
  }
}

export type RecruiterBrief = {
  dataVersion: string
  fitSummary: string
  evidence: SearchResult[]
  interviewTopics: string[]
  gaps: string[]
  sourceUrls: string[]
}

export type ProjectListResult = { dataVersion: string; projects: PortfolioProject[] }

export type ProjectLookupResult =
  | { found: true; project: PortfolioProject }
  | { found: false; error: string; suggestions: Array<{ name: string; slug: string }> }

export const getRecruiterBrief = async (app: App, roleDescription: string): Promise<RecruiterBrief> => {
  const result = await app.callServerTool({
    name: "get_recruiter_brief",
    arguments: { role_description: roleDescription },
  })
  return parseToolResult<RecruiterBrief>(result)
}

export const listProjects = async (app: App): Promise<ProjectListResult> => {
  const result = await app.callServerTool({ name: "list_projects", arguments: {} })
  return parseToolResult<ProjectListResult>(result)
}

export const getProject = async (app: App, slugOrName: string): Promise<ProjectLookupResult> => {
  const result = await app.callServerTool({
    name: "get_project",
    arguments: { slug_or_name: slugOrName },
  })
  return parseToolResult<ProjectLookupResult>(result)
}
