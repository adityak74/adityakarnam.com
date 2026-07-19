# Hosted Portfolio MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, read-only remote MCP server at `https://adityakarnam.com/mcp` with install UX, discovery, health, source citations, and recruiter/agent-friendly portfolio tools.

**Architecture:** Generate one static portfolio MCP data bundle from existing Gatsby/site sources, then serve deterministic MCP tools/resources through Cloudflare Pages Functions. Add a human install page, copyable Markdown guide, discovery manifest, health endpoint, and a site-wide banner that points visitors to installation.

**Tech Stack:** Gatsby 5, React 18, TypeScript, Cloudflare Pages Functions, Vitest, Node ESM scripts, existing world-model page primitives.

## Global Constraints

- Endpoint URL must be `https://adityakarnam.com/mcp`.
- Install docs page must be `/mcp-install/`.
- Discovery manifest must be `/.well-known/aditya-portfolio-mcp.json`.
- Health endpoint must be `/mcp-health`.
- MCP name must be `aditya-portfolio`.
- MCP transport must be `http`.
- Claude Code quick install command must be `claude mcp add --transport http aditya-portfolio https://adityakarnam.com/mcp`.
- V1 is public, read-only, and unauthenticated.
- V1 must not expose private files, email, analytics, personal data, availability, compensation, immigration status, references, or non-public employment history.
- V1 must not add an npm package or local MCP install flow.
- V1 must not add LLM-backed answer synthesis.
- Every tool that returns claims about work must include source URLs.
- Site-wide banner must link to `/mcp-install/`, not directly to `/mcp`.
- Banner should be dismissible for the current browser session.
- Use existing Gatsby and Cloudflare Pages patterns.

---

## File Structure

- Create `src/components/portfolio-mcp/schema.ts`: shared data types, constants, public scope copy, install guide copy.
- Create `src/components/portfolio-mcp/build-data.ts`: pure functions that normalize `siteIdentity`, `systems`, `researchAgenda`, `fieldNotes`, `currentInvestigations`, project pages, and posts into the MCP data contract.
- Create `src/components/portfolio-mcp/search.ts`: deterministic weighted lexical search and recruiter matching helpers.
- Create `src/components/portfolio-mcp/tools.ts`: pure MCP tool implementations over the generated data bundle.
- Create `src/components/portfolio-mcp/protocol.ts`: small JSON-RPC MCP request handler for initialize, tools/list, tools/call, resources/list, and resources/read.
- Create `src/components/portfolio-mcp/index.ts`: exports `portfolioMcpData`, manifest, health payload, tools, and protocol handler.
- Create tests next to each module under `src/components/portfolio-mcp/*.test.ts`.
- Create `functions/mcp.ts`: Cloudflare Pages Function for the MCP protocol endpoint.
- Create `functions/mcp-health.ts`: Cloudflare Pages Function for health JSON.
- Create `static/.well-known/aditya-portfolio-mcp.json`: build-time/static discovery manifest for Gatsby to publish.
- Create `src/pages/mcp-install.tsx`: human installation page with copyable Claude Code command and Markdown guide.
- Create `src/components/PortfolioMcpBanner.tsx`: dismissible site-wide banner.
- Modify `src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx`: render the banner at the top of the site chrome.
- Modify `package.json`: add test scripts only if needed; prefer existing `npm test` and `npm run build`.

---

### Task 1: Portfolio MCP Data Contract

**Files:**
- Create: `src/components/portfolio-mcp/schema.ts`
- Create: `src/components/portfolio-mcp/build-data.ts`
- Create: `src/components/portfolio-mcp/build-data.test.ts`
- Modify: none

**Interfaces:**
- Consumes: `siteIdentity`, `systems`, `researchAgenda`, `fieldNotes`, `currentInvestigations`, `operatingPrinciples` from `src/components/world-model/data.ts`.
- Produces: `buildPortfolioMcpData(input?: Partial<PortfolioMcpBuildInput>): PortfolioMcpData`.

- [x] **Step 1: Write the failing schema/data tests**

Create `src/components/portfolio-mcp/build-data.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData, SOURCE_COMMIT_FALLBACK } from "./build-data"

describe("buildPortfolioMcpData", () => {
  it("builds the public MCP identity and version metadata", () => {
    const data = buildPortfolioMcpData({
      generatedAt: "2026-07-19T12:00:00.000Z",
      sourceCommit: "abc1234",
    })

    expect(data.name).toBe("aditya-portfolio")
    expect(data.transport).toBe("http")
    expect(data.mcpUrl).toBe("https://adityakarnam.com/mcp")
    expect(data.installPageUrl).toBe("https://adityakarnam.com/mcp-install/")
    expect(data.healthUrl).toBe("https://adityakarnam.com/mcp-health")
    expect(data.dataVersion).toMatch(/^\d{4}\.\d{2}\.\d{2}$/)
    expect(data.generatedAt).toBe("2026-07-19T12:00:00.000Z")
    expect(data.sourceCommit).toBe("abc1234")
  })

  it("declares public data scope and private exclusions", () => {
    const data = buildPortfolioMcpData()

    expect(data.dataScope.exposes).toContain("public projects")
    expect(data.dataScope.doesNotExpose).toContain("private files")
    expect(data.dataScope.doesNotExpose).toContain("compensation")
    expect(data.dataScope.doesNotExpose).toContain("immigration status")
  })

  it("normalizes systems into source-cited projects", () => {
    const data = buildPortfolioMcpData()
    const project = data.projects.find((entry) => entry.name === "embenx")

    expect(project).toBeDefined()
    expect(project?.canonicalUrl).toBe("https://adityakarnam.com/embenx-python-embedding-toolkit/")
    expect(project?.sourceUrls).toContain(project?.canonicalUrl)
    expect(project?.tags).toContain("retrieval")
  })

  it("falls back to unknown source commit", () => {
    const data = buildPortfolioMcpData({ sourceCommit: undefined })

    expect(data.sourceCommit).toBe(SOURCE_COMMIT_FALLBACK)
  })
})
```

- [x] **Step 2: Run the failing test**

Run: `rtk npm test -- src/components/portfolio-mcp/build-data.test.ts`

Expected: FAIL because `src/components/portfolio-mcp/build-data.ts` does not exist.

- [x] **Step 3: Implement schema and data normalization**

Create `src/components/portfolio-mcp/schema.ts`:

```ts
export const PORTFOLIO_MCP_NAME = "aditya-portfolio"
export const PORTFOLIO_MCP_DISPLAY_NAME = "Aditya Karnam Portfolio MCP"
export const PORTFOLIO_MCP_TRANSPORT = "http"
export const PORTFOLIO_MCP_URL = "https://adityakarnam.com/mcp"
export const PORTFOLIO_MCP_INSTALL_URL = "https://adityakarnam.com/mcp-install/"
export const PORTFOLIO_MCP_HEALTH_URL = "https://adityakarnam.com/mcp-health"
export const PORTFOLIO_MCP_MANIFEST_URL = "https://adityakarnam.com/.well-known/aditya-portfolio-mcp.json"
export const PORTFOLIO_SITE_URL = "https://adityakarnam.com"
export const PORTFOLIO_DATA_VERSION = "2026.07.19"

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
  researchAgenda: Array<{ title: string; question: string; sourceUrls: string[] }>
  recentWork: PortfolioRecentWork[]
  operatingPrinciples: string[]
}
```

Create `src/components/portfolio-mcp/build-data.ts`:

```ts
import {
  currentInvestigations,
  fieldNotes,
  operatingPrinciples,
  researchAgenda,
  siteIdentity,
  systems,
} from "../world-model/data"
import {
  PORTFOLIO_DATA_VERSION,
  PORTFOLIO_MCP_DISPLAY_NAME,
  PORTFOLIO_MCP_HEALTH_URL,
  PORTFOLIO_MCP_INSTALL_URL,
  PORTFOLIO_MCP_MANIFEST_URL,
  PORTFOLIO_MCP_NAME,
  PORTFOLIO_MCP_TRANSPORT,
  PORTFOLIO_MCP_URL,
  PORTFOLIO_SITE_URL,
  type PortfolioMcpData,
} from "./schema"

export const SOURCE_COMMIT_FALLBACK = "unknown"

export type PortfolioMcpBuildInput = {
  generatedAt?: string
  sourceCommit?: string
}

const absoluteUrl = (slugOrUrl: string): string => {
  if (slugOrUrl.startsWith("http://") || slugOrUrl.startsWith("https://")) return slugOrUrl
  const normalized = slugOrUrl.startsWith("/") ? slugOrUrl : `/${slugOrUrl}`
  return `${PORTFOLIO_SITE_URL}${normalized}`
}

export const buildPortfolioMcpData = (input: PortfolioMcpBuildInput = {}): PortfolioMcpData => {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const sourceCommit = input.sourceCommit ?? SOURCE_COMMIT_FALLBACK
  const profileUrl = `${PORTFOLIO_SITE_URL}/about/`
  const systemsUrl = `${PORTFOLIO_SITE_URL}/systems/`

  const projects = systems.map((system) => {
    const canonicalUrl = absoluteUrl(system.slug)
    const externalLinks = system.links.map((link) => ({
      label: link.label,
      href: absoluteUrl(link.href),
    }))

    return {
      name: system.name,
      slug: system.slug.replace(/^\/+|\/+$/g, ""),
      tags: system.tags,
      status: system.status,
      researchQuestion: system.researchQuestion,
      systemBuilt: system.systemBuilt,
      whyItMatters: system.whyItMatters,
      canonicalUrl,
      links: externalLinks,
      explanationModes: system.explanationModes,
      recruiterFraming: `${system.name} is evidence of ${system.tags.slice(0, 3).join(", ")} work: ${system.whyItMatters}`,
      sourceUrls: [canonicalUrl, ...externalLinks.map((link) => link.href)],
    }
  })

  const recentWork = [
    ...projects.map((project) => ({
      title: project.name,
      type: "project" as const,
      slug: project.slug,
      dateOrStatus: project.status,
      url: project.canonicalUrl,
      summary: project.systemBuilt,
      tags: project.tags,
      sourceUrls: project.sourceUrls,
    })),
    ...fieldNotes.map((note) => ({
      title: note.title,
      type: "field-note" as const,
      slug: note.href ? note.href.replace(/^\/+|\/+$/g, "") : note.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      dateOrStatus: note.status,
      url: absoluteUrl(note.href ?? "/field-notes/"),
      summary: note.thesis,
      tags: ["field note", "research agenda"],
      sourceUrls: [absoluteUrl(note.href ?? "/field-notes/")],
    })),
  ]

  return {
    name: PORTFOLIO_MCP_NAME,
    displayName: PORTFOLIO_MCP_DISPLAY_NAME,
    description:
      "Public read-only MCP server for Aditya Karnam's portfolio, recent work, systems, research agenda, and source links.",
    transport: PORTFOLIO_MCP_TRANSPORT,
    mcpUrl: PORTFOLIO_MCP_URL,
    installPageUrl: PORTFOLIO_MCP_INSTALL_URL,
    manifestUrl: PORTFOLIO_MCP_MANIFEST_URL,
    healthUrl: PORTFOLIO_MCP_HEALTH_URL,
    siteUrl: PORTFOLIO_SITE_URL,
    dataVersion: PORTFOLIO_DATA_VERSION,
    generatedAt,
    sourceCommit,
    dataScope: {
      exposes: ["public projects", "public posts", "public systems", "research agenda", "source links"],
      doesNotExpose: [
        "private files",
        "email",
        "analytics",
        "personal data",
        "availability",
        "compensation",
        "immigration status",
        "references",
      ],
    },
    profile: {
      name: siteIdentity.name,
      title: siteIdentity.title,
      labName: siteIdentity.labName,
      tagline: siteIdentity.tagline,
      currentFocus: currentInvestigations.map((entry) => `${entry.label}: ${entry.detail}`),
      publicLinks: [
        { label: "Website", url: PORTFOLIO_SITE_URL },
        { label: "Systems", url: systemsUrl },
        { label: "About", url: profileUrl },
        { label: "GitHub", url: "https://github.com/adityak74" },
        { label: "LinkedIn", url: "https://www.linkedin.com/in/adityakarnamgrao/" },
      ],
      recruiterSummary:
        "Aditya Karnam builds AI infrastructure across agent runtimes, MCP, retrieval, memory, local inference, and evals.",
      engineeringSummary:
        "The strongest engineering signal is practical systems work around local-first agent infrastructure, backend-agnostic retrieval, model routing, and evaluation tooling.",
    },
    projects,
    researchAgenda: researchAgenda.map((track) => ({ ...track, sourceUrls: [`${PORTFOLIO_SITE_URL}/stack/`] })),
    recentWork,
    operatingPrinciples,
  }
}
```

- [x] **Step 4: Run tests**

Run: `rtk npm test -- src/components/portfolio-mcp/build-data.test.ts`

Expected: PASS.

- [x] **Step 5: Commit**

Run:

```bash
rtk git add src/components/portfolio-mcp/schema.ts src/components/portfolio-mcp/build-data.ts src/components/portfolio-mcp/build-data.test.ts
rtk git commit -m "Add portfolio MCP data contract"
```

---

### Task 2: Search and Tool Implementations

**Files:**
- Create: `src/components/portfolio-mcp/search.ts`
- Create: `src/components/portfolio-mcp/search.test.ts`
- Create: `src/components/portfolio-mcp/tools.ts`
- Create: `src/components/portfolio-mcp/tools.test.ts`

**Interfaces:**
- Consumes: `PortfolioMcpData` from Task 1.
- Produces:
  - `searchWork(data: PortfolioMcpData, input: SearchWorkInput): SearchResult[]`
  - `createPortfolioTools(data: PortfolioMcpData): PortfolioToolRegistry`

- [x] **Step 1: Write failing search tests**

Create `src/components/portfolio-mcp/search.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData } from "./build-data"
import { searchWork } from "./search"

describe("searchWork", () => {
  const data = buildPortfolioMcpData({ generatedAt: "2026-07-19T12:00:00.000Z" })

  it("finds project matches by tag and summary", () => {
    const results = searchWork(data, { query: "MCP retrieval memory", audience: "engineer", limit: 3 })

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].sourceUrls.length).toBeGreaterThan(0)
    expect(results[0].matchReason).toMatch(/matched/i)
  })

  it("returns an empty list for unrelated queries", () => {
    const results = searchWork(data, { query: "marine biology aquarium", limit: 5 })

    expect(results).toEqual([])
  })

  it("rejects empty queries", () => {
    expect(() => searchWork(data, { query: "   " })).toThrow("query is required")
  })
})
```

- [x] **Step 2: Write failing tool tests**

Create `src/components/portfolio-mcp/tools.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData } from "./build-data"
import { createPortfolioTools } from "./tools"

describe("portfolio tools", () => {
  const data = buildPortfolioMcpData({ generatedAt: "2026-07-19T12:00:00.000Z", sourceCommit: "abc1234" })
  const tools = createPortfolioTools(data)

  it("returns profile metadata with data version", () => {
    const result = tools.get_profile({})

    expect(result.dataVersion).toBe(data.dataVersion)
    expect(result.profile.name).toBe("Aditya Karnam")
    expect(result.dataScope.doesNotExpose).toContain("private files")
  })

  it("lists projects with source URLs", () => {
    const result = tools.list_projects({ tags: ["MCP"], limit: 10 })

    expect(result.projects.length).toBeGreaterThan(0)
    expect(result.projects.every((project) => project.sourceUrls.length > 0)).toBe(true)
  })

  it("returns a structured not found project response with suggestions", () => {
    const result = tools.get_project({ slug_or_name: "does-not-exist" })

    expect(result.found).toBe(false)
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it("returns recruiter brief evidence with citations and gaps", () => {
    const result = tools.get_recruiter_brief({ role_description: "AI infrastructure engineer MCP retrieval evals" })

    expect(result.evidence.length).toBeGreaterThan(0)
    expect(result.evidence.every((entry) => entry.sourceUrls.length > 0)).toBe(true)
    expect(Array.isArray(result.gaps)).toBe(true)
  })
})
```

- [x] **Step 3: Run failing tests**

Run: `rtk npm test -- src/components/portfolio-mcp/search.test.ts src/components/portfolio-mcp/tools.test.ts`

Expected: FAIL because `search.ts` and `tools.ts` do not exist.

- [x] **Step 4: Implement deterministic search**

Create `src/components/portfolio-mcp/search.ts`:

```ts
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
      const titleBoost = queryTokens.some((token) => item.title.toLowerCase().includes(token)) ? 5 : 0
      const projectBoost = item.type === "project" ? 2 : 0
      const audienceBoost = input.audience === "recruiter" && item.type === "project" ? 2 : 0
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
```

- [x] **Step 5: Implement tools**

Create `src/components/portfolio-mcp/tools.ts`:

```ts
import type { PortfolioMcpData } from "./schema"
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
        wantedTags.length === 0 ? true : wantedTags.some((tag) => project.tags.map((value) => value.toLowerCase()).includes(tag))
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

  get_recent_work: (input: { limit?: number }) => ({
    dataVersion: data.dataVersion,
    recentWork: data.recentWork.slice(0, Math.max(1, Math.min(input.limit ?? 10, 30))),
  }),

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
})

export type PortfolioToolRegistry = ReturnType<typeof createPortfolioTools>
export type PortfolioToolName = keyof PortfolioToolRegistry
```

- [x] **Step 6: Run tests**

Run: `rtk npm test -- src/components/portfolio-mcp/search.test.ts src/components/portfolio-mcp/tools.test.ts`

Expected: PASS.

- [x] **Step 7: Commit**

Run:

```bash
rtk git add src/components/portfolio-mcp/search.ts src/components/portfolio-mcp/search.test.ts src/components/portfolio-mcp/tools.ts src/components/portfolio-mcp/tools.test.ts
rtk git commit -m "Add portfolio MCP search and tools"
```

---

### Task 3: MCP Protocol Handler and `/mcp` Function

**Files:**
- Create: `src/components/portfolio-mcp/protocol.ts`
- Create: `src/components/portfolio-mcp/protocol.test.ts`
- Create: `src/components/portfolio-mcp/index.ts`
- Create: `functions/mcp.ts`

**Interfaces:**
- Consumes: `createPortfolioTools(data)` and `PortfolioMcpData`.
- Produces: `handlePortfolioMcpRequest(request: Request, data?: PortfolioMcpData): Promise<Response>`.

- [x] **Step 1: Write failing protocol tests**

Create `src/components/portfolio-mcp/protocol.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData } from "./build-data"
import { handlePortfolioMcpRequest } from "./protocol"

const postJson = (body: unknown) =>
  new Request("https://adityakarnam.com/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

describe("handlePortfolioMcpRequest", () => {
  const data = buildPortfolioMcpData({ generatedAt: "2026-07-19T12:00:00.000Z" })

  it("handles initialize", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }), data)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result.serverInfo.name).toBe("aditya-portfolio")
  })

  it("lists tools", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 2, method: "tools/list" }), data)
    const body = await response.json()

    expect(body.result.tools.map((tool: { name: string }) => tool.name)).toContain("get_recruiter_brief")
  })

  it("calls get_profile", async () => {
    const response = await handlePortfolioMcpRequest(
      postJson({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_profile", arguments: {} } }),
      data
    )
    const body = await response.json()

    expect(body.result.content[0].type).toBe("text")
    expect(body.result.content[0].text).toContain("Aditya Karnam")
  })

  it("lists resources", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 4, method: "resources/list" }), data)
    const body = await response.json()

    expect(body.result.resources.map((resource: { uri: string }) => resource.uri)).toContain("portfolio://profile")
  })

  it("rejects unsupported methods with JSON-RPC error", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 5, method: "unknown/method" }), data)
    const body = await response.json()

    expect(body.error.code).toBe(-32601)
  })
})
```

- [x] **Step 2: Run failing protocol tests**

Run: `rtk npm test -- src/components/portfolio-mcp/protocol.test.ts`

Expected: FAIL because `protocol.ts` does not exist.

- [x] **Step 3: Implement MCP protocol handler**

Create `src/components/portfolio-mcp/protocol.ts` with JSON-RPC handling for `initialize`, `tools/list`, `tools/call`, `resources/list`, and `resources/read`. Tool results should be JSON stringified into MCP text content.

Implement these exact exports:

```ts
import { buildPortfolioMcpData } from "./build-data"
import type { PortfolioMcpData } from "./schema"
import { createPortfolioTools, type PortfolioToolName } from "./tools"

type JsonRpcRequest = {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  params?: any
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })

const ok = (id: JsonRpcRequest["id"], result: unknown) => json({ jsonrpc: "2.0", id: id ?? null, result })
const error = (id: JsonRpcRequest["id"], code: number, message: string) =>
  json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } })

const toolDescriptions = [
  { name: "get_profile", description: "Get Aditya Karnam's public profile, focus areas, links, and data scope." },
  { name: "list_projects", description: "List public portfolio projects with tags, status, summaries, and source URLs." },
  { name: "get_project", description: "Get one public project by slug or name with source URLs and recruiter framing." },
  { name: "search_work", description: "Search public work deterministically by query and optional audience." },
  { name: "get_recent_work", description: "Get recent public work across systems and field notes." },
  { name: "get_recruiter_brief", description: "Map public portfolio evidence to a role description with citations and gaps." },
]

const resources = [
  { uri: "portfolio://profile", name: "Profile", mimeType: "application/json" },
  { uri: "portfolio://systems", name: "Systems", mimeType: "application/json" },
  { uri: "portfolio://research-agenda", name: "Research Agenda", mimeType: "application/json" },
  { uri: "portfolio://recent-work", name: "Recent Work", mimeType: "application/json" },
  { uri: "portfolio://recruiter-guide", name: "Recruiter Guide", mimeType: "application/json" },
]

const readResource = (data: PortfolioMcpData, uri: string) => {
  if (uri === "portfolio://profile") return data.profile
  if (uri === "portfolio://systems") return data.projects
  if (uri === "portfolio://research-agenda") return data.researchAgenda
  if (uri === "portfolio://recent-work") return data.recentWork
  if (uri === "portfolio://recruiter-guide") {
    return {
      summary: data.profile.recruiterSummary,
      bestUsedFor: ["AI infrastructure fit", "agent systems", "MCP", "retrieval", "memory", "local inference", "evals"],
      notFor: data.dataScope.doesNotExpose,
      sourceUrls: [data.siteUrl, data.installPageUrl],
    }
  }
  throw new Error("Resource not found")
}

export const handlePortfolioMcpRequest = async (request: Request, data = buildPortfolioMcpData()): Promise<Response> => {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405)

  const body = (await request.json().catch(() => null)) as JsonRpcRequest | null
  if (!body || body.jsonrpc !== "2.0" || !body.method) return error(null, -32600, "Invalid Request")

  if (body.method === "initialize") {
    return ok(body.id, {
      protocolVersion: "2025-06-18",
      capabilities: { tools: {}, resources: {} },
      serverInfo: { name: data.name, version: data.dataVersion },
    })
  }

  if (body.method === "tools/list") return ok(body.id, { tools: toolDescriptions })

  if (body.method === "tools/call") {
    const tools = createPortfolioTools(data)
    const name = body.params?.name as PortfolioToolName
    if (!name || !(name in tools)) return error(body.id, -32602, "Unknown tool")
    const result = tools[name](body.params?.arguments ?? {})
    return ok(body.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] })
  }

  if (body.method === "resources/list") return ok(body.id, { resources })

  if (body.method === "resources/read") {
    try {
      const resource = readResource(data, body.params?.uri)
      return ok(body.id, { contents: [{ uri: body.params.uri, mimeType: "application/json", text: JSON.stringify(resource, null, 2) }] })
    } catch (_error) {
      return error(body.id, -32602, "Resource not found")
    }
  }

  return error(body.id, -32601, "Method not found")
}
```

Create `src/components/portfolio-mcp/index.ts`:

```ts
import { buildPortfolioMcpData } from "./build-data"
import { handlePortfolioMcpRequest } from "./protocol"

export const portfolioMcpData = buildPortfolioMcpData({
  sourceCommit: process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA,
})

export { buildPortfolioMcpData, handlePortfolioMcpRequest }
```

Create `functions/mcp.ts`:

```ts
import { handlePortfolioMcpRequest, portfolioMcpData } from "../src/components/portfolio-mcp"

export const onRequestPost = async (context: { request: Request }): Promise<Response> =>
  handlePortfolioMcpRequest(context.request, portfolioMcpData)

export const onRequestGet = async (): Promise<Response> =>
  new Response(JSON.stringify({ error: "MCP endpoint expects POST JSON-RPC requests.", install: "https://adityakarnam.com/mcp-install/" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  })
```

- [x] **Step 4: Run tests**

Run: `rtk npm test -- src/components/portfolio-mcp/protocol.test.ts`

Expected: PASS.

- [x] **Step 5: Commit**

Run:

```bash
rtk git add src/components/portfolio-mcp/protocol.ts src/components/portfolio-mcp/protocol.test.ts src/components/portfolio-mcp/index.ts functions/mcp.ts
rtk git commit -m "Add hosted portfolio MCP endpoint"
```

---

### Task 4: Discovery Manifest and Health Endpoint

**Files:**
- Create: `src/components/portfolio-mcp/metadata.ts`
- Create: `src/components/portfolio-mcp/metadata.test.ts`
- Create: `functions/mcp-health.ts`
- Create: `static/.well-known/aditya-portfolio-mcp.json`

**Interfaces:**
- Consumes: `PortfolioMcpData`.
- Produces:
  - `buildPortfolioMcpManifest(data: PortfolioMcpData)`
  - `buildPortfolioMcpHealth(data: PortfolioMcpData)`

- [x] **Step 1: Write failing metadata tests**

Create `src/components/portfolio-mcp/metadata.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData } from "./build-data"
import { buildPortfolioMcpHealth, buildPortfolioMcpManifest } from "./metadata"

describe("portfolio MCP metadata", () => {
  const data = buildPortfolioMcpData({ generatedAt: "2026-07-19T12:00:00.000Z", sourceCommit: "abc1234" })

  it("builds the discovery manifest", () => {
    const manifest = buildPortfolioMcpManifest(data)

    expect(manifest.name).toBe("aditya-portfolio")
    expect(manifest.mcpUrl).toBe("https://adityakarnam.com/mcp")
    expect(manifest.transport).toBe("http")
    expect(manifest.dataScope.doesNotExpose).toContain("private files")
  })

  it("builds the health response", () => {
    const health = buildPortfolioMcpHealth(data)

    expect(health.ok).toBe(true)
    expect(health.version).toBe(data.dataVersion)
    expect(health.generatedAt).toBe("2026-07-19T12:00:00.000Z")
    expect(health.tools).toContain("get_recruiter_brief")
    expect(health.resources).toContain("portfolio://profile")
  })
})
```

- [x] **Step 2: Run failing tests**

Run: `rtk npm test -- src/components/portfolio-mcp/metadata.test.ts`

Expected: FAIL because `metadata.ts` does not exist.

- [x] **Step 3: Implement metadata helpers and health function**

Create `src/components/portfolio-mcp/metadata.ts`:

```ts
import type { PortfolioMcpData } from "./schema"

export const portfolioToolNames = [
  "get_profile",
  "list_projects",
  "get_project",
  "search_work",
  "get_recent_work",
  "get_recruiter_brief",
]

export const portfolioResourceUris = [
  "portfolio://profile",
  "portfolio://systems",
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
```

Create `functions/mcp-health.ts`:

```ts
import { portfolioMcpData } from "../src/components/portfolio-mcp"
import { buildPortfolioMcpHealth } from "../src/components/portfolio-mcp/metadata"

export const onRequestGet = async (): Promise<Response> =>
  new Response(JSON.stringify(buildPortfolioMcpHealth(portfolioMcpData), null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
```

Create `static/.well-known/aditya-portfolio-mcp.json`:

```json
{
  "name": "aditya-portfolio",
  "displayName": "Aditya Karnam Portfolio MCP",
  "description": "Public read-only MCP server for Aditya Karnam's portfolio, recent work, systems, research agenda, and source links.",
  "version": "2026.07.19",
  "transport": "http",
  "mcpUrl": "https://adityakarnam.com/mcp",
  "installPageUrl": "https://adityakarnam.com/mcp-install/",
  "healthUrl": "https://adityakarnam.com/mcp-health",
  "siteUrl": "https://adityakarnam.com",
  "dataScope": {
    "exposes": ["public projects", "public posts", "public systems", "research agenda", "source links"],
    "doesNotExpose": ["private files", "email", "analytics", "personal data", "availability", "compensation", "immigration status"]
  }
}
```

- [x] **Step 4: Run tests**

Run: `rtk npm test -- src/components/portfolio-mcp/metadata.test.ts`

Expected: PASS.

- [x] **Step 5: Commit**

Run:

```bash
rtk git add src/components/portfolio-mcp/metadata.ts src/components/portfolio-mcp/metadata.test.ts functions/mcp-health.ts static/.well-known/aditya-portfolio-mcp.json
rtk git commit -m "Add portfolio MCP manifest and health endpoint"
```

---

### Task 5: Install Page with Copyable Markdown Guide

**Files:**
- Create: `src/components/portfolio-mcp/install-copy.ts`
- Create: `src/components/portfolio-mcp/install-copy.test.ts`
- Create: `src/pages/mcp-install.tsx`

**Interfaces:**
- Produces:
  - `CLAUDE_CODE_INSTALL_COMMAND`
  - `CLAUDE_CODE_VERIFY_COMMAND`
  - `PORTFOLIO_MCP_INSTALL_MARKDOWN`

- [x] **Step 1: Write failing copy tests**

Create `src/components/portfolio-mcp/install-copy.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { CLAUDE_CODE_INSTALL_COMMAND, PORTFOLIO_MCP_INSTALL_MARKDOWN } from "./install-copy"

describe("install copy", () => {
  it("contains the exact Claude Code install command", () => {
    expect(CLAUDE_CODE_INSTALL_COMMAND).toBe(
      "claude mcp add --transport http aditya-portfolio https://adityakarnam.com/mcp"
    )
  })

  it("contains generic agent instructions and privacy scope", () => {
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("## Other Agents")
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("Codex")
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("Cursor")
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("Antigravity")
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("does not expose private files")
  })
})
```

- [x] **Step 2: Run failing copy tests**

Run: `rtk npm test -- src/components/portfolio-mcp/install-copy.test.ts`

Expected: FAIL because `install-copy.ts` does not exist.

- [x] **Step 3: Implement install copy constants**

Create `src/components/portfolio-mcp/install-copy.ts`:

```ts
export const CLAUDE_CODE_INSTALL_COMMAND =
  "claude mcp add --transport http aditya-portfolio https://adityakarnam.com/mcp"

export const CLAUDE_CODE_VERIFY_COMMAND = "claude mcp list"

export const PORTFOLIO_MCP_INSTALL_MARKDOWN = `# Install Aditya Karnam's Portfolio MCP

Use this public, read-only MCP server to query Aditya Karnam's portfolio, recent work, systems, research agenda, and source links.

MCP name: \`aditya-portfolio\`
Transport: \`http\`
URL: \`https://adityakarnam.com/mcp\`
Discovery manifest: \`https://adityakarnam.com/.well-known/aditya-portfolio-mcp.json\`
Health check: \`https://adityakarnam.com/mcp-health\`

This MCP exposes only public portfolio data: projects, posts, systems, research agenda, and source links. It does not expose private files, email, analytics, personal data, availability, compensation, immigration status, or references.

## Claude App

1. Open Claude.
2. Go to Settings / Customize.
3. Open Connectors.
4. Choose Add custom connector.
5. Paste \`https://adityakarnam.com/mcp\`.
6. Save the connector.

For Team or Enterprise accounts, an organization owner may need to add the connector first.

## Claude Code

Run:

\`\`\`bash
${CLAUDE_CODE_INSTALL_COMMAND}
\`\`\`

Verify:

\`\`\`bash
${CLAUDE_CODE_VERIFY_COMMAND}
\`\`\`

## Other Agents

For Codex, Cursor, Antigravity, or any agent that supports remote MCP servers, add:

- Name: \`aditya-portfolio\`
- Transport: \`http\`
- URL: \`https://adityakarnam.com/mcp\`

If your agent supports custom instructions but not direct MCP installation, ask it:

> Use the remote MCP server at \`https://adityakarnam.com/mcp\` as \`aditya-portfolio\`. If you can install MCP servers, add it with HTTP transport. If you cannot install MCP servers directly, tell me the exact setup steps for this client.

## Try These Prompts

- Use Aditya Karnam's portfolio connector. Is he a fit for this AI infrastructure role?
- Which projects show agent runtime or MCP experience?
- Give me a recruiter brief with evidence and source links.
- What is his recent work around local inference and evals?
- Compare his work to this role description and list the strongest evidence.
- Act as a hiring manager. What should I ask him about based on public evidence?
- Act as an engineer. Which systems should I inspect first?
- Act as a researcher. What is his clearest research wedge?
`
```

- [x] **Step 4: Implement the Gatsby install page**

Create `src/pages/mcp-install.tsx` using existing `Layout`, `Seo`, and `WorldModelPageChrome` primitives. Include:

- H1: `Install Aditya Karnam's Portfolio MCP`
- copy button for `CLAUDE_CODE_INSTALL_COMMAND`
- copy button for `PORTFOLIO_MCP_INSTALL_MARKDOWN`
- visible connector URL `https://adityakarnam.com/mcp`
- Claude app steps
- Claude Code command
- audience prompt sections
- best used for / not for copy

Use this clipboard handler pattern in the component:

```tsx
const copyToClipboard = async (value: string, label: string) => {
  await navigator.clipboard.writeText(value)
  setCopiedLabel(label)
  window.setTimeout(() => setCopiedLabel(null), 2000)
}
```

- [x] **Step 5: Run tests**

Run: `rtk npm test -- src/components/portfolio-mcp/install-copy.test.ts`

Expected: PASS.

- [x] **Step 6: Commit**

Run:

```bash
rtk git add src/components/portfolio-mcp/install-copy.ts src/components/portfolio-mcp/install-copy.test.ts src/pages/mcp-install.tsx
rtk git commit -m "Add portfolio MCP install page"
```

---

### Task 6: Site-Wide Banner

**Files:**
- Create: `src/components/PortfolioMcpBanner.tsx`
- Modify: `src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx`

**Interfaces:**
- Produces: `PortfolioMcpBanner` component with session-scoped dismissal.

- [x] **Step 1: Inspect current header**

Run: `rtk sed -n '1,220p' src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx`

Expected: note where the header root component returns site chrome and where the banner can be rendered before nav.

- [x] **Step 2: Implement banner component**

Create `src/components/PortfolioMcpBanner.tsx`:

```tsx
import * as React from "react"
import { Link } from "gatsby"

const DISMISS_KEY = "portfolio-mcp-banner-dismissed"

export const PortfolioMcpBanner = () => {
  const [dismissed, setDismissed] = React.useState(true)

  React.useEffect(() => {
    setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "true")
  }, [])

  if (dismissed) return null

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, "true")
    setDismissed(true)
  }

  return (
    <div
      style={{
        alignItems: "center",
        background: "#1A1A18",
        color: "#FAF9F7",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        justifyContent: "center",
        padding: "0.7rem 1rem",
        position: "relative",
        zIndex: 20,
      }}
    >
      <span style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>Portfolio MCP is live. Add Aditya's work to Claude.</span>
      <Link
        to="/mcp-install/"
        style={{
          background: "#FAF9F7",
          borderRadius: "6px",
          color: "#1A1A18",
          fontSize: "0.85rem",
          fontWeight: 600,
          padding: "0.35rem 0.65rem",
          textDecoration: "none",
        }}
      >
        Install in Claude
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss Portfolio MCP banner"
        style={{
          background: "transparent",
          border: "1px solid rgba(250,249,247,0.35)",
          borderRadius: "6px",
          color: "#FAF9F7",
          cursor: "pointer",
          fontSize: "0.8rem",
          padding: "0.3rem 0.5rem",
        }}
      >
        Dismiss
      </button>
    </div>
  )
}
```

- [x] **Step 3: Render banner in header**

Modify `src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx`:

```tsx
import { PortfolioMcpBanner } from "../../../components/PortfolioMcpBanner"
```

Render `<PortfolioMcpBanner />` as the first element returned by the header component.

- [x] **Step 4: Run build**

Run: `rtk npm run build`

Expected: PASS or the known existing Gatsby configstore EPERM warning after build output. There must be no TypeScript or Gatsby page error from the banner.

- [x] **Step 5: Commit**

Run:

```bash
rtk git add src/components/PortfolioMcpBanner.tsx src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx
rtk git commit -m "Add portfolio MCP install banner"
```

---

### Task 7: Full Verification

**Files:**
- Modify only if verification reveals defects in files from Tasks 1-6.

**Interfaces:**
- Consumes all previous tasks.
- Produces verified build and local endpoint smoke results.

- [ ] **Step 1: Run all unit tests**

Run: `rtk npm test`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `rtk npm run build`

Expected: PASS or known configstore EPERM warning with build output produced. Any new compile, route, or type error must be fixed before continuing.

- [ ] **Step 3: Start local preview**

Run: `rtk npm run serve`

Expected: Gatsby serves the built site. Keep the session running only long enough for smoke checks, then stop it.

- [ ] **Step 4: Smoke test static pages and endpoints**

Run these in another shell while preview is running:

```bash
rtk curl -i http://localhost:9000/mcp-install/
rtk curl -i http://localhost:9000/.well-known/aditya-portfolio-mcp.json
rtk curl -i http://localhost:9000/mcp-health
```

Expected:

- `/mcp-install/` returns HTML containing `Install Aditya Karnam`.
- manifest returns JSON containing `"name": "aditya-portfolio"`.
- health returns JSON containing `"ok": true`.

- [ ] **Step 5: Smoke test MCP JSON-RPC**

Run:

```bash
rtk curl -s -X POST http://localhost:9000/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Expected: JSON response includes `get_profile`, `search_work`, and `get_recruiter_brief`.

- [ ] **Step 6: Verify Claude Code command is present**

Run:

```bash
rtk rg "claude mcp add --transport http aditya-portfolio https://adityakarnam.com/mcp" public src
```

Expected: command is present in generated page output or source.

- [ ] **Step 7: Commit fixes if needed**

If verification required code changes:

```bash
rtk git add src/components/portfolio-mcp functions src/pages/mcp-install.tsx src/components/PortfolioMcpBanner.tsx src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx static/.well-known/aditya-portfolio-mcp.json
rtk git commit -m "Fix portfolio MCP verification issues"
```

If no fixes were needed, do not create an empty commit.

---

### Task 8: Abuse and DDoS Safety Hardening

**Why:** `/mcp` and `/mcp-health` are public and unauthenticated. Cloudflare's always-on network-level DDoS protection covers every proxied zone automatically (not something this code controls), but the Function itself should still reject oversized/malformed requests cheaply, avoid doing unbounded work per request, and let static responses be cached at the edge so most traffic never reaches the Function at all. A Cloudflare KV namespace named `portfolio-mcp-rate-limit` (id `6ed8c837ed8d409babc2c3745241f77b`) has already been created in the `Akarnam37@gmail.com` account for optional per-IP throttling; binding it to the Pages project is a manual dashboard step (Pages project → Settings → Functions → KV namespace bindings → bind as `RATE_LIMIT_KV`) that happens after this PR merges, so all code that uses it must fail open (allow the request) when the binding is absent.

**Files:**
- Modify: `functions/mcp.ts`
- Modify: `functions/mcp-health.ts`
- Create: `functions/_lib/rate-limit.ts`
- Create: `functions/_lib/rate-limit.test.ts` (or colocate under `src/components/portfolio-mcp/` if the project's Vitest config does not cover `functions/`, matching existing test conventions)
- Modify: `src/components/portfolio-mcp/protocol.ts` only if needed to surface a 413/415 before JSON-RPC parsing

**Interfaces:**
- Produces: `checkRateLimit(kv: KVNamespace | undefined, clientId: string, opts?: { limit?: number; windowSeconds?: number }): Promise<{ allowed: boolean; remaining: number }>`

- [ ] **Step 1: Write failing rate-limit unit tests**

Create `functions/_lib/rate-limit.test.ts` covering:
- returns `{ allowed: true }` immediately when `kv` is `undefined` (fail-open, no binding configured yet).
- allows requests under the limit and increments a counter keyed by `clientId` + current time window.
- denies requests once the count for the current window meets/exceeds the limit, using a minimal in-memory fake implementing the `KVNamespace` `get`/`put` surface used by the function (no real network calls in tests).

Run: `npm test -- functions/_lib/rate-limit.test.ts`

Expected: FAIL because `rate-limit.ts` does not exist.

- [ ] **Step 2: Implement the fail-open KV rate limiter**

Create `functions/_lib/rate-limit.ts` implementing a fixed-window counter: key `ratelimit:{clientId}:{windowStart}`, default `limit = 60` requests per `windowSeconds = 60`, using `kv.get`/`kv.put` with an expiration around the window boundary. Any thrown error from KV access must be caught and treated as `allowed: true` (never let a KV outage take down the endpoint).

- [ ] **Step 3: Wire the limiter and request hardening into the MCP function**

Modify `functions/mcp.ts`:
- Read the client IP from `request.headers.get("CF-Connecting-IP")` (fallback to `"unknown"`) as `clientId`.
- Reject with `413` and a small JSON error body if `request.headers.get("Content-Length")` is present and exceeds `16384` bytes, before reading the body.
- Reject with `415` and a small JSON error body if the `Content-Type` header is present and does not include `application/json`.
- Call `checkRateLimit(context.env.RATE_LIMIT_KV, clientId)`; if `allowed` is `false`, return `429` with `Retry-After` and a small JSON error body.
- Set `Cache-Control: no-store` on all responses from this function (JSON-RPC responses are per-request and must not be cached).
- Keep existing JSON-RPC behavior otherwise unchanged.

Modify `functions/mcp-health.ts`:
- Add `Cache-Control: public, max-age=300` to the response headers so the health check can be served from Cloudflare's edge cache instead of invoking the Function on every request.

- [ ] **Step 4: Run tests**

Run: `npm test -- functions/_lib/rate-limit.test.ts && npm test`

Expected: PASS, and no regressions in existing `portfolio-mcp` tests.

- [ ] **Step 5: Run build**

Run: `npm run build`

Expected: PASS or the known configstore EPERM warning only.

- [ ] **Step 6: Document the manual KV binding step**

In `src/components/portfolio-mcp/install-copy.ts` or a short section of `src/pages/mcp-install.tsx`, no visitor-facing text is needed for this (it is an operator step, not a client install step). Instead, add a one-paragraph note to this plan file's top-level summary (or a `docs/superpowers/plans/2026-07-19-hosted-portfolio-mcp.md` "Post-Merge Manual Step" note) stating: bind KV namespace `portfolio-mcp-rate-limit` (id `6ed8c837ed8d409babc2c3745241f77b`) to the `adityakarnam` Pages project as `RATE_LIMIT_KV` in Cloudflare dashboard → Settings → Functions, to activate per-IP throttling. The endpoint is safe to ship without this step (fail-open + Cloudflare's always-on edge DDoS protection + fully static/deterministic compute with no external calls or costs), but binding it hardens against sustained single-IP abuse.

- [ ] **Step 7: Commit**

Run:

```bash
git add functions/mcp.ts functions/mcp-health.ts functions/_lib/rate-limit.ts functions/_lib/rate-limit.test.ts docs/superpowers/plans/2026-07-19-hosted-portfolio-mcp.md
git commit -m "Add abuse and DDoS safety hardening to portfolio MCP endpoint"
```

---

### Task 9: Streamable HTTP Compliance and Legacy Client Fallback

**Why:** Cloudflare's official remote-MCP guide (https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/) recommends the `McpAgent`/Durable-Objects/OAuth stack on Workers for stateful, authenticated servers with per-user tool gating. That stack does not apply here — this server is deliberately stateless, public, and unauthenticated (see Global Constraints), so it is correctly built as a minimal JSON-RPC handler on Pages Functions rather than migrated to Workers + Durable Objects + OAuth. Two things from that guide are still worth adopting because they are cheap and improve real client compatibility:
1. The MCP transport spec includes an `MCP-Protocol-Version` request header clients may send on requests after `initialize`; a compliant server should reject a request that names a protocol version it does not support, rather than silently ignoring it.
2. Not all current MCP clients support remote HTTP servers natively yet. Cloudflare highlights the third-party `mcp-remote` npm adapter (`npx mcp-remote <url>`) as the standard bridge for clients that only support local/stdio MCP servers (this does not conflict with the "no npm package for v1" constraint, which is about not shipping our own package — `mcp-remote` is an existing, unrelated third-party tool we only document).

**Files:**
- Modify: `src/components/portfolio-mcp/protocol.ts`
- Modify: `src/components/portfolio-mcp/protocol.test.ts`
- Modify: `src/components/portfolio-mcp/install-copy.ts`
- Modify: `src/components/portfolio-mcp/install-copy.test.ts`

- [ ] **Step 1: Write failing protocol-version tests**

Add to `protocol.test.ts`: a request with header `MCP-Protocol-Version: 1999-01-01` (or similar unsupported value) on any method should get a JSON-RPC error response with code `-32600` and a message mentioning the unsupported protocol version. A request with no `MCP-Protocol-Version` header, or with the header set to `2025-06-18` (or omitted on `initialize`, which is exempt per spec), should behave exactly as before.

Run: `npm test -- src/components/portfolio-mcp/protocol.test.ts`

Expected: FAIL on the new case.

- [ ] **Step 2: Implement protocol version validation**

In `handlePortfolioMcpRequest`, before dispatching on `body.method`, read `request.headers.get("MCP-Protocol-Version")`. If present, non-empty, and not equal to `"2025-06-18"`, return `error(body.id, -32600, "Unsupported protocol version")` immediately. Skip this check when `body.method === "initialize"` (a client's first request may predate version negotiation).

- [ ] **Step 3: Write failing install-copy test for the mcp-remote fallback**

Add to `install-copy.test.ts`: `PORTFOLIO_MCP_INSTALL_MARKDOWN` contains a section mentioning `mcp-remote` and the exact command `npx mcp-remote https://adityakarnam.com/mcp`.

Run: `npm test -- src/components/portfolio-mcp/install-copy.test.ts`

Expected: FAIL because the markdown does not yet mention it.

- [ ] **Step 4: Add the fallback section to the install markdown**

In `install-copy.ts`, add a new `## If Your Client Only Supports Local MCP Servers` section after `## Other Agents`, explaining that clients without native remote MCP support can bridge through the `mcp-remote` adapter:

```bash
npx mcp-remote https://adityakarnam.com/mcp
```

Keep this brief — one paragraph plus the command — and note it is a third-party bridge tool, not something this site hosts.

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: PASS, full suite green.

- [ ] **Step 6: Run build**

Run: `npm run build`

Expected: PASS or the known configstore EPERM warning only.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/portfolio-mcp/protocol.ts src/components/portfolio-mcp/protocol.test.ts src/components/portfolio-mcp/install-copy.ts src/components/portfolio-mcp/install-copy.test.ts docs/superpowers/plans/2026-07-19-hosted-portfolio-mcp.md
git commit -m "Add MCP protocol version validation and mcp-remote fallback docs"
```
