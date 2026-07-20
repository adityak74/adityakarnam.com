# Interactive Portfolio MCP App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an MCP App (interactive iframe UI) to the hosted Portfolio MCP server so recruiters get a live, two-tab dashboard (Fit Check + Projects) inside Claude, driven by the existing six tools plus one new trigger tool.

**Architecture:** A new `open_portfolio_app` tool declares `_meta.ui.resourceUri: "ui://portfolio-app"`. That resource is a single self-contained HTML file (inlined JS/CSS, no external requests) built from a small React app via Vite (`vite-plugin-singlefile`) and generated into a checked-in TS module that `protocol.ts` imports and serves. Inside the iframe, `@modelcontextprotocol/ext-apps/react`'s `useApp()` hook gives the app an `App` bridge object; the app calls `app.callServerTool(...)` for `get_recruiter_brief`, `list_projects`, and `get_project` (all unchanged), and `app.openLink({ url })` for any outbound link. All calls are proxied by the host back through the existing `/mcp` endpoint and its existing rate limiter — no new backend logic.

**Tech Stack:** TypeScript, React 18, `@modelcontextprotocol/ext-apps` (client), Vite + `@vitejs/plugin-react` + `vite-plugin-singlefile` (build-time only), Vitest (existing test runner).

## Global Constraints

- No new backend data or tool logic — the app only calls the six existing tools (`get_profile`, `list_projects`, `get_project`, `search_work`, `get_recent_work`, `get_recruiter_brief`) plus the one new `open_portfolio_app` trigger tool.
- No write actions, no authentication, no recruiter identity/session state.
- Always live tool calls — no client-side duplication of `search.ts` matching logic, no preloaded/offline snapshot mode.
- The app resource must be fully self-contained: inlined JS/CSS, no external script/font/stylesheet origins.
- All external links (project pages, blog posts, GitHub) open via `app.openLink({ url })`, never a raw in-iframe `<a href>` navigation.
- Fit Check starts empty (an instruction, no tool call) until the recruiter submits a role description.
- Opens on the **Fit Check** tab by default.
- A tool-call failure in the app renders as an inline, retryable error scoped to the view that triggered it, not a full-app crash.

---

## Task 1: Scaffold the MCP App build pipeline

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `src/components/portfolio-mcp/app/mcp-app.html`
- Create: `src/components/portfolio-mcp/app/main.tsx`
- Create: `src/components/portfolio-mcp/app/App.tsx`
- Create: `src/components/portfolio-mcp/app/styles.css`
- Create: `src/components/portfolio-mcp/app/vite.config.ts`
- Create: `scripts/generate-portfolio-app-html.mjs`
- Create: `src/components/portfolio-mcp/generated/portfolio-app-html.ts` (generated, then committed)
- Test: `src/components/portfolio-mcp/generated/portfolio-app-html.test.ts`

**Interfaces:**
- Produces: `PORTFOLIO_APP_HTML: string` exported from `src/components/portfolio-mcp/generated/portfolio-app-html.ts` — a self-contained HTML document with inlined JS/CSS. Task 2 imports this constant.
- Produces: npm script `build:mcp-app` that (re)generates `portfolio-app-html.ts` from the current `app/` source. Later tasks re-run this script after changing `app/` source and commit the regenerated file.

- [ ] **Step 1: Add build dependencies to `package.json`**

Add to `dependencies`:

```json
"@modelcontextprotocol/ext-apps": "^1.7.4",
```

Add to `devDependencies` (alongside the existing `vitest`/`wrangler` entries):

```json
"@modelcontextprotocol/sdk": "^1.29.0",
"@vitejs/plugin-react": "^6.0.3",
"vite": "^8.1.5",
"vite-plugin-singlefile": "^2.3.3",
```

Run:

```bash
npm install
```

Expected: `package.json` and `package-lock.json` updated, install succeeds with no peer-dependency errors.

- [ ] **Step 2: Add the Vite entry HTML**

Create `src/components/portfolio-mcp/app/mcp-app.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>Portfolio App</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

- [ ] **Step 3: Add minimal styles**

Create `src/components/portfolio-mcp/app/styles.css`:

```css
:root {
  color-scheme: light dark;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
  padding: 0.75rem;
}

nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

nav button[aria-pressed="true"] {
  font-weight: 600;
  text-decoration: underline;
}

button {
  cursor: pointer;
}

textarea,
input[type="text"] {
  width: 100%;
  box-sizing: border-box;
}

[role="alert"] {
  color: #b3261e;
}
```

- [ ] **Step 4: Add a placeholder root component**

Create `src/components/portfolio-mcp/app/App.tsx`:

```tsx
import { useApp } from "@modelcontextprotocol/ext-apps/react"

export function PortfolioApp() {
  const { app, error } = useApp({
    appInfo: { name: "Portfolio App", version: "1.0.0" },
    capabilities: {},
  })

  if (error) return <div role="alert">Failed to connect: {error.message}</div>
  if (!app) return <div>Connecting…</div>

  return <div>Portfolio app connected. Tabs coming in a later task.</div>
}
```

This placeholder is replaced with the real tab shell in Task 6. It exists now so the build pipeline has something real to compile.

- [ ] **Step 5: Add the entry point**

Create `src/components/portfolio-mcp/app/main.tsx`:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { PortfolioApp } from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PortfolioApp />
  </StrictMode>
)
```

- [ ] **Step 6: Add the Vite build config**

Create `src/components/portfolio-mcp/app/vite.config.ts`:

```ts
import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: dirname,
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: path.join(dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.join(dirname, "mcp-app.html"),
    },
  },
})
```

- [ ] **Step 7: Add the HTML-to-TS generator script**

Create `scripts/generate-portfolio-app-html.mjs`:

```js
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(dirname, "..")
const distHtmlPath = path.join(repoRoot, "src/components/portfolio-mcp/app/dist/mcp-app.html")
const outDir = path.join(repoRoot, "src/components/portfolio-mcp/generated")
const outFile = path.join(outDir, "portfolio-app-html.ts")

const html = await readFile(distHtmlPath, "utf-8")

await mkdir(outDir, { recursive: true })
await writeFile(
  outFile,
  `// Generated by scripts/generate-portfolio-app-html.mjs from src/components/portfolio-mcp/app/. Do not edit by hand.\nexport const PORTFOLIO_APP_HTML = ${JSON.stringify(html)}\n`
)

console.log(`Wrote ${outFile} (${html.length} bytes)`)
```

- [ ] **Step 8: Wire the `build:mcp-app` npm script**

Edit `package.json`'s `scripts` block, adding `build:mcp-app` and making `build` depend on it:

```json
"build": "npm run build:mcp-app && gatsby build",
"build:mcp-app": "vite build --config src/components/portfolio-mcp/app/vite.config.ts && node scripts/generate-portfolio-app-html.mjs",
```

- [ ] **Step 9: Ignore the intermediate Vite output**

Add to `.gitignore` (near the existing `public` / `.cache` entries):

```gitignore
src/components/portfolio-mcp/app/dist
```

The intermediate `dist/mcp-app.html` is not committed; the generated `src/components/portfolio-mcp/generated/portfolio-app-html.ts` is committed instead, so `vitest run` and the Cloudflare Function work from a checked-in artifact without requiring a Vite build step at test or request time.

- [ ] **Step 10: Run the build**

```bash
npm run build:mcp-app
```

Expected: `src/components/portfolio-mcp/generated/portfolio-app-html.ts` is created and logged with a non-zero byte count.

- [ ] **Step 11: Write a sanity test for the generated artifact**

Create `src/components/portfolio-mcp/generated/portfolio-app-html.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { PORTFOLIO_APP_HTML } from "./portfolio-app-html"

describe("PORTFOLIO_APP_HTML", () => {
  it("is a non-empty self-contained HTML document", () => {
    expect(PORTFOLIO_APP_HTML).toContain("<div id=\"root\">")
    expect(PORTFOLIO_APP_HTML).toContain("<script")
  })

  it("does not reference external script or stylesheet origins", () => {
    expect(PORTFOLIO_APP_HTML).not.toMatch(/src="https?:\/\//)
    expect(PORTFOLIO_APP_HTML).not.toMatch(/href="https?:\/\//)
  })
})
```

- [ ] **Step 12: Run the test to verify it passes**

Run: `npx vitest run src/components/portfolio-mcp/generated/portfolio-app-html.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json .gitignore \
  src/components/portfolio-mcp/app \
  scripts/generate-portfolio-app-html.mjs \
  src/components/portfolio-mcp/generated
git commit -m "Scaffold Portfolio MCP App build pipeline"
```

---

## Task 2: Serve the app resource and add the trigger tool

**Files:**
- Modify: `src/components/portfolio-mcp/tools.ts`
- Modify: `src/components/portfolio-mcp/protocol.ts`
- Modify: `src/components/portfolio-mcp/protocol.test.ts`

**Interfaces:**
- Consumes: `PORTFOLIO_APP_HTML` from `./generated/portfolio-app-html` (Task 1).
- Produces: `open_portfolio_app` tool callable via `tools/call`; `ui://portfolio-app` resource readable via `resources/read`, returning `{ mimeType: "text/html;profile=mcp-app", text: PORTFOLIO_APP_HTML }`.

- [ ] **Step 1: Write failing protocol tests**

Add to `src/components/portfolio-mcp/protocol.test.ts` (inside the existing `describe("handlePortfolioMcpRequest", ...)` block, after the `"lists resources"` test):

```ts
  it("lists the open_portfolio_app tool with its UI resource metadata", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 10, method: "tools/list" }), data)
    const body = await response.json()
    const tool = body.result.tools.find((entry: { name: string }) => entry.name === "open_portfolio_app")

    expect(tool).toBeDefined()
    expect(tool._meta.ui.resourceUri).toBe("ui://portfolio-app")
  })

  it("calls open_portfolio_app", async () => {
    const response = await handlePortfolioMcpRequest(
      postJson({ jsonrpc: "2.0", id: 11, method: "tools/call", params: { name: "open_portfolio_app", arguments: {} } }),
      data
    )
    const body = await response.json()

    expect(JSON.parse(body.result.content[0].text)).toEqual({ opened: true })
  })

  it("lists the ui://portfolio-app resource", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 12, method: "resources/list" }), data)
    const body = await response.json()

    expect(body.result.resources.map((resource: { uri: string }) => resource.uri)).toContain("ui://portfolio-app")
  })

  it("reads the ui://portfolio-app resource as self-contained HTML", async () => {
    const response = await handlePortfolioMcpRequest(
      postJson({ jsonrpc: "2.0", id: 13, method: "resources/read", params: { uri: "ui://portfolio-app" } }),
      data
    )
    const body = await response.json()

    expect(body.result.contents[0].mimeType).toBe("text/html;profile=mcp-app")
    expect(body.result.contents[0].text).toContain("<div id=\"root\">")
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/portfolio-mcp/protocol.test.ts`
Expected: FAIL — `open_portfolio_app` not found / `ui://portfolio-app` not found.

- [ ] **Step 3: Add the `open_portfolio_app` tool implementation**

Edit `src/components/portfolio-mcp/tools.ts`, adding this entry to the object returned by `createPortfolioTools` (after `get_recruiter_brief`):

```ts
  open_portfolio_app: (_input: JsonObject) => ({ opened: true }),
```

- [ ] **Step 4: Restructure `protocol.ts` to support a non-JSON resource**

Edit `src/components/portfolio-mcp/protocol.ts`. Add the import at the top:

```ts
import { PORTFOLIO_APP_HTML } from "./generated/portfolio-app-html"
```

Add these constants above `const toolDescriptions = [`:

```ts
const PORTFOLIO_APP_RESOURCE_URI = "ui://portfolio-app"
const PORTFOLIO_APP_MIME_TYPE = "text/html;profile=mcp-app"
```

Append this entry to the `toolDescriptions` array (after the `get_recruiter_brief` entry):

```ts
  {
    name: "open_portfolio_app",
    description: "Open an interactive dashboard to check role fit and browse Aditya Karnam's public projects.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    _meta: {
      ui: { resourceUri: PORTFOLIO_APP_RESOURCE_URI },
      "ui/resourceUri": PORTFOLIO_APP_RESOURCE_URI,
    },
  },
```

Replace the `resources` array and `readResource` function with:

```ts
const resources = [
  { uri: "portfolio://profile", name: "Profile", mimeType: "application/json" },
  { uri: "portfolio://systems", name: "Systems", mimeType: "application/json" },
  { uri: "portfolio://research-agenda", name: "Research Agenda", mimeType: "application/json" },
  { uri: "portfolio://recent-work", name: "Recent Work", mimeType: "application/json" },
  { uri: "portfolio://recruiter-guide", name: "Recruiter Guide", mimeType: "application/json" },
  { uri: PORTFOLIO_APP_RESOURCE_URI, name: "Portfolio App", mimeType: PORTFOLIO_APP_MIME_TYPE },
]

const readJsonResource = (data: PortfolioMcpData, uri: string) => {
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

const readResource = (data: PortfolioMcpData, uri: string): { mimeType: string; text: string } => {
  if (uri === PORTFOLIO_APP_RESOURCE_URI) {
    return { mimeType: PORTFOLIO_APP_MIME_TYPE, text: PORTFOLIO_APP_HTML }
  }

  const jsonResource = readJsonResource(data, uri)
  return { mimeType: "application/json", text: JSON.stringify(jsonResource, null, 2) }
}
```

Replace the `resources/read` handler body with:

```ts
  if (body.method === "resources/read") {
    try {
      const { mimeType, text } = readResource(data, body.params?.uri)
      return ok(body.id, { contents: [{ uri: body.params.uri, mimeType, text }] })
    } catch (_error) {
      return error(body.id, -32602, "Resource not found")
    }
  }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/portfolio-mcp/protocol.test.ts`
Expected: PASS (all tests, including the 4 new ones)

- [ ] **Step 6: Run the full test suite to check for regressions**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/portfolio-mcp/tools.ts src/components/portfolio-mcp/protocol.ts src/components/portfolio-mcp/protocol.test.ts
git commit -m "Add open_portfolio_app tool and ui://portfolio-app resource"
```

---

## Task 3: Add the tool-call bridge (pure parsing logic)

**Files:**
- Create: `src/components/portfolio-mcp/app/bridge.ts`
- Test: `src/components/portfolio-mcp/app/bridge.test.ts`

**Interfaces:**
- Consumes: `PortfolioProject` from `../schema`, `SearchResult` from `../search` (type-only imports, erased at build).
- Produces:
  - `parseToolResult<T>(result: CallToolResult): T`
  - `type RecruiterBrief = { dataVersion: string; fitSummary: string; evidence: SearchResult[]; interviewTopics: string[]; gaps: string[]; sourceUrls: string[] }`
  - `type ProjectListResult = { dataVersion: string; projects: PortfolioProject[] }`
  - `type ProjectLookupResult = { found: true; project: PortfolioProject } | { found: false; error: string; suggestions: Array<{ name: string; slug: string }> }`
  - `getRecruiterBrief(app: App, roleDescription: string): Promise<RecruiterBrief>`
  - `listProjects(app: App): Promise<ProjectListResult>`
  - `getProject(app: App, slugOrName: string): Promise<ProjectLookupResult>`
  - `class ToolCallError extends Error {}`

These four functions and the `ToolCallError` class are what Task 4 and Task 5's components import.

- [ ] **Step 1: Write failing tests for `parseToolResult`**

Create `src/components/portfolio-mcp/app/bridge.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { parseToolResult, ToolCallError } from "./bridge"

describe("parseToolResult", () => {
  it("parses JSON from the first text content entry", () => {
    const result = { content: [{ type: "text" as const, text: JSON.stringify({ ok: true }) }] }
    expect(parseToolResult<{ ok: boolean }>(result)).toEqual({ ok: true })
  })

  it("throws ToolCallError when the result is marked isError", () => {
    const result = { content: [{ type: "text" as const, text: "Rate limit exceeded." }], isError: true }
    expect(() => parseToolResult(result)).toThrow(ToolCallError)
    expect(() => parseToolResult(result)).toThrow("Rate limit exceeded.")
  })

  it("throws ToolCallError when there is no text content", () => {
    const result = { content: [] }
    expect(() => parseToolResult(result)).toThrow(ToolCallError)
  })

  it("throws ToolCallError when the text content is not valid JSON", () => {
    const result = { content: [{ type: "text" as const, text: "not json" }] }
    expect(() => parseToolResult(result)).toThrow(ToolCallError)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/portfolio-mcp/app/bridge.test.ts`
Expected: FAIL with "Failed to resolve import ./bridge"

- [ ] **Step 3: Implement `bridge.ts`**

Create `src/components/portfolio-mcp/app/bridge.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/portfolio-mcp/app/bridge.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio-mcp/app/bridge.ts src/components/portfolio-mcp/app/bridge.test.ts
git commit -m "Add MCP App tool-call bridge with typed result parsing"
```

---

## Task 4: Fit Check tab

**Files:**
- Create: `src/components/portfolio-mcp/app/fitCheckState.ts`
- Test: `src/components/portfolio-mcp/app/fitCheckState.test.ts`
- Create: `src/components/portfolio-mcp/app/FitCheckTab.tsx`

**Interfaces:**
- Consumes: `getRecruiterBrief`, `RecruiterBrief` from `./bridge` (Task 3); `App` type from `@modelcontextprotocol/ext-apps`.
- Produces: `FitCheckTab({ app: App })` React component, imported by `App.tsx` in Task 6.

- [ ] **Step 1: Write failing tests for the reducer**

Create `src/components/portfolio-mcp/app/fitCheckState.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import type { RecruiterBrief } from "./bridge"
import { fitCheckReducer, initialFitCheckState } from "./fitCheckState"

const brief: RecruiterBrief = {
  dataVersion: "1",
  fitSummary: "Strong match.",
  evidence: [],
  interviewTopics: [],
  gaps: [],
  sourceUrls: [],
}

describe("fitCheckReducer", () => {
  it("starts empty", () => {
    expect(initialFitCheckState).toEqual({ status: "empty" })
  })

  it("moves to loading on submit", () => {
    const next = fitCheckReducer(initialFitCheckState, { type: "submit", roleDescription: "Backend role" })
    expect(next).toEqual({ status: "loading", roleDescription: "Backend role" })
  })

  it("moves to results on resolved after loading", () => {
    const loading = fitCheckReducer(initialFitCheckState, { type: "submit", roleDescription: "Backend role" })
    const next = fitCheckReducer(loading, { type: "resolved", brief })
    expect(next).toEqual({ status: "results", roleDescription: "Backend role", brief })
  })

  it("moves to error on rejected after loading", () => {
    const loading = fitCheckReducer(initialFitCheckState, { type: "submit", roleDescription: "Backend role" })
    const next = fitCheckReducer(loading, { type: "rejected", message: "Rate limit exceeded." })
    expect(next).toEqual({ status: "error", roleDescription: "Backend role", message: "Rate limit exceeded." })
  })

  it("ignores a stale resolved action when not loading", () => {
    const next = fitCheckReducer(initialFitCheckState, { type: "resolved", brief })
    expect(next).toEqual(initialFitCheckState)
  })

  it("resets to empty", () => {
    const loading = fitCheckReducer(initialFitCheckState, { type: "submit", roleDescription: "Backend role" })
    expect(fitCheckReducer(loading, { type: "reset" })).toEqual({ status: "empty" })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/portfolio-mcp/app/fitCheckState.test.ts`
Expected: FAIL with "Failed to resolve import ./fitCheckState"

- [ ] **Step 3: Implement `fitCheckState.ts`**

Create `src/components/portfolio-mcp/app/fitCheckState.ts`:

```ts
import type { RecruiterBrief } from "./bridge"

export type FitCheckState =
  | { status: "empty" }
  | { status: "loading"; roleDescription: string }
  | { status: "results"; roleDescription: string; brief: RecruiterBrief }
  | { status: "error"; roleDescription: string; message: string }

export type FitCheckAction =
  | { type: "submit"; roleDescription: string }
  | { type: "resolved"; brief: RecruiterBrief }
  | { type: "rejected"; message: string }
  | { type: "reset" }

export const initialFitCheckState: FitCheckState = { status: "empty" }

export const fitCheckReducer = (state: FitCheckState, action: FitCheckAction): FitCheckState => {
  switch (action.type) {
    case "submit":
      return { status: "loading", roleDescription: action.roleDescription }
    case "resolved":
      if (state.status !== "loading") return state
      return { status: "results", roleDescription: state.roleDescription, brief: action.brief }
    case "rejected":
      if (state.status !== "loading") return state
      return { status: "error", roleDescription: state.roleDescription, message: action.message }
    case "reset":
      return { status: "empty" }
    default:
      return state
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/portfolio-mcp/app/fitCheckState.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Implement `FitCheckTab.tsx`**

Create `src/components/portfolio-mcp/app/FitCheckTab.tsx`:

```tsx
import type { App } from "@modelcontextprotocol/ext-apps"
import { useReducer, useState } from "react"
import { getRecruiterBrief } from "./bridge"
import { fitCheckReducer, initialFitCheckState } from "./fitCheckState"

export function FitCheckTab({ app }: { app: App }) {
  const [state, dispatch] = useReducer(fitCheckReducer, initialFitCheckState)
  const [roleDescription, setRoleDescription] = useState("")

  const runFitCheck = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    dispatch({ type: "submit", roleDescription: trimmed })
    try {
      const brief = await getRecruiterBrief(app, trimmed)
      dispatch({ type: "resolved", brief })
    } catch (err) {
      dispatch({ type: "rejected", message: err instanceof Error ? err.message : "Something went wrong." })
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void runFitCheck(roleDescription)
  }

  const handleRetry = () => {
    const lastRoleDescription = state.status === "error" ? state.roleDescription : roleDescription
    void runFitCheck(lastRoleDescription)
  }

  const handleOpenLink = (url: string) => {
    void app.openLink({ url })
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <textarea
          value={roleDescription}
          onChange={(event) => setRoleDescription(event.target.value)}
          placeholder="Paste a role description..."
          rows={4}
        />
        <button type="submit" disabled={state.status === "loading"}>
          Check fit
        </button>
      </form>

      {state.status === "empty" && <p>Paste a role description to see fit evidence.</p>}
      {state.status === "loading" && <p>Checking fit…</p>}

      {state.status === "error" && (
        <p role="alert">
          {state.message}{" "}
          <button type="button" onClick={handleRetry}>
            Retry
          </button>
        </p>
      )}

      {state.status === "results" && (
        <div>
          <p>{state.brief.fitSummary}</p>

          {state.brief.evidence.length === 0 ? (
            <p>No strong public evidence matched this role.</p>
          ) : (
            <ul>
              {state.brief.evidence.map((item) => (
                <li key={item.url}>
                  <button type="button" onClick={() => handleOpenLink(item.url)}>
                    {item.title}
                  </button>
                  <p>{item.matchReason}</p>
                </li>
              ))}
            </ul>
          )}

          <h3>Interview topics</h3>
          <ul>
            {state.brief.interviewTopics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>

          <h3>Gaps</h3>
          <ul>
            {state.brief.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 6: Run the full test suite to check for regressions**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/portfolio-mcp/app/fitCheckState.ts src/components/portfolio-mcp/app/fitCheckState.test.ts src/components/portfolio-mcp/app/FitCheckTab.tsx
git commit -m "Add Fit Check tab with pure state reducer"
```

---

## Task 5: Projects tab

**Files:**
- Create: `src/components/portfolio-mcp/app/projectsState.ts`
- Test: `src/components/portfolio-mcp/app/projectsState.test.ts`
- Create: `src/components/portfolio-mcp/app/ProjectDetail.tsx`
- Create: `src/components/portfolio-mcp/app/ProjectsTab.tsx`

**Interfaces:**
- Consumes: `listProjects`, `getProject` from `./bridge` (Task 3); `PortfolioProject` from `../schema`.
- Produces: `ProjectsTab({ app: App })` React component, imported by `App.tsx` in Task 6.

- [ ] **Step 1: Write failing tests for the reducer**

Create `src/components/portfolio-mcp/app/projectsState.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import type { PortfolioProject } from "../schema"
import { initialProjectsState, projectsReducer } from "./projectsState"

const project: PortfolioProject = {
  name: "Example System",
  slug: "example-system",
  tags: ["agents"],
  status: "active",
  researchQuestion: "?",
  systemBuilt: "A system.",
  whyItMatters: "It matters.",
  canonicalUrl: "https://adityakarnam.com/example-system/",
  links: [],
  explanationModes: {},
  recruiterFraming: "Evidence of agents work.",
  sourceUrls: ["https://adityakarnam.com/example-system/"],
}

describe("projectsReducer", () => {
  it("starts with the list loading and detail idle", () => {
    expect(initialProjectsState).toEqual({ list: { status: "loading" }, detail: { status: "idle" } })
  })

  it("resolves the list", () => {
    const next = projectsReducer(initialProjectsState, { type: "list/resolved", projects: [project] })
    expect(next.list).toEqual({ status: "results", projects: [project] })
  })

  it("rejects the list", () => {
    const next = projectsReducer(initialProjectsState, { type: "list/rejected", message: "Rate limit exceeded." })
    expect(next.list).toEqual({ status: "error", message: "Rate limit exceeded." })
  })

  it("opens a detail panel while loading", () => {
    const next = projectsReducer(initialProjectsState, { type: "detail/request", slugOrName: "example-system" })
    expect(next.detail).toEqual({ status: "loading", slugOrName: "example-system" })
  })

  it("shows a found project detail", () => {
    const next = projectsReducer(initialProjectsState, { type: "detail/found", project })
    expect(next.detail).toEqual({ status: "found", project })
  })

  it("shows not-found suggestions", () => {
    const suggestions = [{ name: "Example System", slug: "example-system" }]
    const next = projectsReducer(initialProjectsState, { type: "detail/not-found", suggestions })
    expect(next.detail).toEqual({ status: "not-found", suggestions })
  })

  it("closes the detail panel", () => {
    const opened = projectsReducer(initialProjectsState, { type: "detail/found", project })
    expect(projectsReducer(opened, { type: "detail/close" }).detail).toEqual({ status: "idle" })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/portfolio-mcp/app/projectsState.test.ts`
Expected: FAIL with "Failed to resolve import ./projectsState"

- [ ] **Step 3: Implement `projectsState.ts`**

Create `src/components/portfolio-mcp/app/projectsState.ts`:

```ts
import type { PortfolioProject } from "../schema"

export type ProjectListState =
  | { status: "loading" }
  | { status: "results"; projects: PortfolioProject[] }
  | { status: "error"; message: string }

export type ProjectDetailState =
  | { status: "idle" }
  | { status: "loading"; slugOrName: string }
  | { status: "found"; project: PortfolioProject }
  | { status: "not-found"; suggestions: Array<{ name: string; slug: string }> }
  | { status: "error"; message: string }

export type ProjectsState = {
  list: ProjectListState
  detail: ProjectDetailState
}

export type ProjectsAction =
  | { type: "list/request" }
  | { type: "list/resolved"; projects: PortfolioProject[] }
  | { type: "list/rejected"; message: string }
  | { type: "detail/request"; slugOrName: string }
  | { type: "detail/found"; project: PortfolioProject }
  | { type: "detail/not-found"; suggestions: Array<{ name: string; slug: string }> }
  | { type: "detail/rejected"; message: string }
  | { type: "detail/close" }

export const initialProjectsState: ProjectsState = {
  list: { status: "loading" },
  detail: { status: "idle" },
}

export const projectsReducer = (state: ProjectsState, action: ProjectsAction): ProjectsState => {
  switch (action.type) {
    case "list/request":
      return { ...state, list: { status: "loading" } }
    case "list/resolved":
      return { ...state, list: { status: "results", projects: action.projects } }
    case "list/rejected":
      return { ...state, list: { status: "error", message: action.message } }
    case "detail/request":
      return { ...state, detail: { status: "loading", slugOrName: action.slugOrName } }
    case "detail/found":
      return { ...state, detail: { status: "found", project: action.project } }
    case "detail/not-found":
      return { ...state, detail: { status: "not-found", suggestions: action.suggestions } }
    case "detail/rejected":
      return { ...state, detail: { status: "error", message: action.message } }
    case "detail/close":
      return { ...state, detail: { status: "idle" } }
    default:
      return state
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/portfolio-mcp/app/projectsState.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Implement `ProjectDetail.tsx`**

Create `src/components/portfolio-mcp/app/ProjectDetail.tsx`:

```tsx
import type { ProjectDetailState } from "./projectsState"

export function ProjectDetail({
  state,
  onOpenLink,
  onClose,
}: {
  state: ProjectDetailState
  onOpenLink: (url: string) => void
  onClose: () => void
}) {
  if (state.status === "idle") return null

  return (
    <div>
      <button type="button" onClick={onClose}>
        Close
      </button>

      {state.status === "loading" && <p>Loading project…</p>}
      {state.status === "error" && <p role="alert">{state.message}</p>}

      {state.status === "not-found" && (
        <div>
          <p>Project not found.</p>
          <ul>
            {state.suggestions.map((suggestion) => (
              <li key={suggestion.slug}>{suggestion.name}</li>
            ))}
          </ul>
        </div>
      )}

      {state.status === "found" && (
        <div>
          <h2>{state.project.name}</h2>
          <p>{state.project.whyItMatters}</p>
          <p>{state.project.recruiterFraming}</p>
          <ul>
            {state.project.links.map((link) => (
              <li key={link.href}>
                <button type="button" onClick={() => onOpenLink(link.href)}>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Implement `ProjectsTab.tsx`**

Create `src/components/portfolio-mcp/app/ProjectsTab.tsx`:

```tsx
import type { App } from "@modelcontextprotocol/ext-apps"
import { useEffect, useReducer, useState } from "react"
import { getProject, listProjects } from "./bridge"
import { ProjectDetail } from "./ProjectDetail"
import { initialProjectsState, projectsReducer } from "./projectsState"

export function ProjectsTab({ app }: { app: App }) {
  const [state, dispatch] = useReducer(projectsReducer, initialProjectsState)
  const [tagFilter, setTagFilter] = useState("")

  useEffect(() => {
    let cancelled = false
    dispatch({ type: "list/request" })
    listProjects(app)
      .then((result) => {
        if (!cancelled) dispatch({ type: "list/resolved", projects: result.projects })
      })
      .catch((err) => {
        if (!cancelled) dispatch({ type: "list/rejected", message: err instanceof Error ? err.message : "Something went wrong." })
      })
    return () => {
      cancelled = true
    }
  }, [app])

  const handleSelectProject = async (slugOrName: string) => {
    dispatch({ type: "detail/request", slugOrName })
    try {
      const result = await getProject(app, slugOrName)
      if (result.found) {
        dispatch({ type: "detail/found", project: result.project })
      } else {
        dispatch({ type: "detail/not-found", suggestions: result.suggestions })
      }
    } catch (err) {
      dispatch({ type: "detail/rejected", message: err instanceof Error ? err.message : "Something went wrong." })
    }
  }

  const handleOpenLink = (url: string) => {
    void app.openLink({ url })
  }

  const visibleProjects =
    state.list.status === "results"
      ? state.list.projects.filter((project) =>
          tagFilter.trim() === ""
            ? true
            : project.tags.some((tag) => tag.toLowerCase().includes(tagFilter.trim().toLowerCase()))
        )
      : []

  return (
    <section>
      <input
        type="text"
        value={tagFilter}
        onChange={(event) => setTagFilter(event.target.value)}
        placeholder="Filter by tag..."
      />

      {state.list.status === "loading" && <p>Loading projects…</p>}
      {state.list.status === "error" && <p role="alert">{state.list.message}</p>}
      {state.list.status === "results" && visibleProjects.length === 0 && <p>No projects match this filter.</p>}

      {state.list.status === "results" && (
        <ul>
          {visibleProjects.map((project) => (
            <li key={project.slug}>
              <button type="button" onClick={() => void handleSelectProject(project.slug)}>
                {project.name}
              </button>
              <p>{project.systemBuilt}</p>
            </li>
          ))}
        </ul>
      )}

      <ProjectDetail state={state.detail} onOpenLink={handleOpenLink} onClose={() => dispatch({ type: "detail/close" })} />
    </section>
  )
}
```

- [ ] **Step 7: Run the full test suite to check for regressions**

Run: `npm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/components/portfolio-mcp/app/projectsState.ts src/components/portfolio-mcp/app/projectsState.test.ts \
  src/components/portfolio-mcp/app/ProjectDetail.tsx src/components/portfolio-mcp/app/ProjectsTab.tsx
git commit -m "Add Projects tab with pure state reducer"
```

---

## Task 6: Wire the tab shell, rebuild, and verify end-to-end

**Files:**
- Modify: `src/components/portfolio-mcp/app/App.tsx`
- Regenerate: `src/components/portfolio-mcp/generated/portfolio-app-html.ts`

**Interfaces:**
- Consumes: `FitCheckTab` (Task 4), `ProjectsTab` (Task 5).
- Produces: the final `PortfolioApp` component rendering both tabs, replacing Task 1's placeholder.

- [ ] **Step 1: Replace the placeholder `App.tsx` with the real tab shell**

Replace the contents of `src/components/portfolio-mcp/app/App.tsx`:

```tsx
import type { App as McpApp } from "@modelcontextprotocol/ext-apps"
import { useApp } from "@modelcontextprotocol/ext-apps/react"
import { useState } from "react"
import { FitCheckTab } from "./FitCheckTab"
import { ProjectsTab } from "./ProjectsTab"

type TabId = "fit" | "projects"

export function PortfolioApp() {
  const { app, error } = useApp({
    appInfo: { name: "Portfolio App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (createdApp) => {
      createdApp.onerror = console.error
    },
  })

  if (error) return <div role="alert">Failed to connect: {error.message}</div>
  if (!app) return <div>Connecting…</div>

  return <PortfolioAppShell app={app} />
}

function PortfolioAppShell({ app }: { app: McpApp }) {
  const [tab, setTab] = useState<TabId>("fit")

  return (
    <main>
      <nav>
        <button type="button" aria-pressed={tab === "fit"} onClick={() => setTab("fit")}>
          Fit Check
        </button>
        <button type="button" aria-pressed={tab === "projects"} onClick={() => setTab("projects")}>
          Projects
        </button>
      </nav>
      {tab === "fit" ? <FitCheckTab app={app} /> : <ProjectsTab app={app} />}
    </main>
  )
}
```

- [ ] **Step 2: Rebuild the app bundle and regenerate the HTML module**

```bash
npm run build:mcp-app
```

Expected: `src/components/portfolio-mcp/generated/portfolio-app-html.ts` is rewritten with the tab shell's compiled output.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — the Task 1 sanity test on `PORTFOLIO_APP_HTML` and the Task 2 protocol tests still pass against the regenerated HTML.

- [ ] **Step 4: Run a full Gatsby build to confirm the pipeline is wired correctly**

```bash
npm run build
```

Expected: `build:mcp-app` runs first (regenerating the same file, no diff), then `gatsby build` completes successfully.

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio-mcp/app/App.tsx src/components/portfolio-mcp/generated/portfolio-app-html.ts
git commit -m "Wire Fit Check and Projects tabs into the Portfolio App shell"
```

- [ ] **Step 6: Manual verification in a real MCP-Apps-capable client**

Automated tests cover the JSON-RPC contract and the app's pure state logic, but iframe sandboxing and postMessage behavior can only be verified against a real host. After this branch is deployed (or run locally against a client that supports MCP Apps):

1. Call `open_portfolio_app` and confirm the iframe renders with the Fit Check tab active and empty.
2. Paste a role description, submit, and confirm `get_recruiter_brief` results render (fit summary, evidence, interview topics, gaps).
3. Click an evidence item and confirm it opens the source URL via the host (not an in-iframe navigation).
4. Switch to the Projects tab and confirm `list_projects` results render.
5. Filter by a tag and confirm the list narrows.
6. Click a project and confirm the detail panel renders via `get_project`, then close it.
7. Trigger a rate-limit or network error (e.g. by exhausting the existing rate limiter) and confirm the affected view shows a retryable inline error instead of crashing the app.

Record the outcome in the PR description before merging.

---

## Self-Review Notes

- **Spec coverage:** every section of `docs/superpowers/specs/2026-07-19-portfolio-mcp-app-design.md` maps to a task — trigger tool + resource (Task 2), live tool calls via bridge (Task 3), Fit Check behavior including empty-start and retryable errors (Task 4), Projects tab with filters and detail panel (Task 5), `openLink` for all external links (Tasks 4–5), self-contained HTML with no external origins (Task 1 build config + sanity test), tab shell defaulting to Fit Check (Task 6).
- **Type consistency:** `RecruiterBrief`, `ProjectListResult`, and `ProjectLookupResult` are defined once in `bridge.ts` (Task 3) and imported by both `fitCheckState.ts`/`FitCheckTab.tsx` and `projectsState.ts`/`ProjectsTab.tsx` — no duplicate or renamed shapes across tasks. `PortfolioProject` is imported from the existing `../schema` module everywhere it's used.
- **No placeholders:** every step has complete, runnable code; the two "Open Decisions" from the spec (build wiring integration point, and whether `open_portfolio_app` needs more than `{ opened: true }`) are resolved here — integration point is `npm run build`, and `{ opened: true }` is sufficient since the app fetches its own data live rather than relying on the opening tool call's return value.
