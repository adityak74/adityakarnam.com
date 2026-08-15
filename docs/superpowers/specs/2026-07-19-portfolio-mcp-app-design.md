# Interactive Portfolio MCP App Design

Date: 2026-07-19

## Goal

Add an [MCP App](https://apps.extensions.modelcontextprotocol.io) to the existing hosted Portfolio MCP server (`https://adityakarnam.com/mcp`) so recruiters get an interactive, in-conversation dashboard instead of reading raw tool-call JSON. The app renders inside a sandboxed iframe in the Claude conversation and drives the same six existing MCP tools live.

This builds directly on the hosted MCP shipped in `docs/superpowers/specs/2026-07-19-portfolio-mcp-design.md` (PR #72, merged). That server, its tools, its data pipeline, and its rate limiting are unchanged by this design — this is a UI layer added on top.

## Non-Goals

- No new backend data or business logic. The app is a client of the six existing tools (`get_profile`, `list_projects`, `get_project`, `search_work`, `get_recent_work`, `get_recruiter_brief`) plus one new trigger tool.
- No write actions, no authentication, no recruiter identity or session state.
- No offline or preloaded-snapshot mode. The app always calls tools live; there is no client-side duplication of `search.ts` matching logic.
- No changes to rate limiting, CORS, or the JSON-RPC transport beyond what's needed to serve one new tool and one new resource.
- No npm package or local install path for the app itself — it ships as part of the same hosted `/mcp` endpoint.

## Users

Same as the base MCP: recruiters using an MCP-Apps-capable Claude client, and secondarily engineering/research agents (who will typically ignore the UI resource and keep using the plain tools, since `_meta.ui` is additive and doesn't change tool semantics).

## Product Shape

A new tool, `open_portfolio_app`, launches a two-tab interactive dashboard inside the conversation:

```text
┌─────────────────────────────────────────┐
│ [ Fit Check ]  [ Projects ]              │
├─────────────────────────────────────────┤
│  (Fit Check, default tab)                │
│  Paste a role description...             │
│  [                              ]        │
│  [ Check fit ]                           │
│                                           │
│  → fit summary, evidence cards,          │
│    interview topics, gaps                │
└─────────────────────────────────────────┘
```

```text
┌─────────────────────────────────────────┐
│ [ Fit Check ]  [ Projects ]              │
├─────────────────────────────────────────┤
│  (Projects tab)                          │
│  tag/status filters                      │
│  project cards (name, tags, summary) →   │
│  click → detail panel (get_project)      │
└─────────────────────────────────────────┘
```

- Opens on **Fit Check** by default — that's the primary recruiter workflow.
- **Fit Check** starts empty (a short instruction, e.g. "Paste a role description to see fit evidence.") — no tool call fires until the recruiter submits. Submitting calls `get_recruiter_brief` with the typed text and renders its existing response shape unchanged: `fitSummary`, `evidence`, `interviewTopics`, `gaps`, `sourceUrls`.
- **Projects** calls `list_projects` on first activation. Tag/status filter controls re-call `list_projects` (or `search_work` if a free-text query is entered) as they change. Clicking a project card calls `get_project` for a detail panel.
- Any source URL (project links, blog posts, GitHub, live demos) opens via the host's `sendOpenLink` capability — never a raw in-iframe `<a href>` navigation, since the iframe has no top-level navigation of its own.

## Architecture

```text
Claude conversation
  → tools/call open_portfolio_app
  → tool descriptor carries _meta.ui.resourceUri = "ui://portfolio-app"
  → Claude fetches resources/read for that uri → HTML resource
  → renders it in a sandboxed iframe

Inside the iframe (React, via @modelcontextprotocol/ext-apps App class):
  - Fit Check tab → tools/call get_recruiter_brief (existing, unchanged)
  - Projects tab → tools/call list_projects / search_work / get_project
    (existing, unchanged)
  - Link clicks → ui/sendOpenLink (new capability usage, no server change)
```

All tool calls the app makes are proxied by the host back through the same `/mcp` JSON-RPC endpoint and the same `checkRateLimit` path already in `functions/mcp.ts`. There is no separate backend surface for the app — it is a new client of the existing endpoint, gated by the same per-IP rate limit as any other MCP client.

The Gatsby build produces the app's HTML the same way it already produces `portfolioMcpData`: a build step generates a static artifact that the Cloudflare Pages Function imports and serves. No runtime bundling, no external script/style loads — the resource is fully self-contained per the MCP Apps sandboxing model.

## Components

1. **`open_portfolio_app` tool** — new entry in `tools.ts` (`createPortfolioTools`) and `toolDescriptions` in `protocol.ts`. Takes no required arguments, returns a minimal confirmation payload (e.g. `{ opened: true }`), and its descriptor includes `_meta.ui.resourceUri: "ui://portfolio-app"`.
2. **`ui://portfolio-app` resource** — new entry in `resources` and `readResource` in `protocol.ts`. `mimeType: "text/html"`. Content is the single self-contained HTML bundle produced by the build step.
3. **React app source** — new directory `src/components/portfolio-mcp/app/`:
   - `App.tsx` — tab state, mounts the `App` bridge from `@modelcontextprotocol/ext-apps`.
   - `FitCheckTab.tsx` — textarea, submit handler, evidence rendering, empty/loading/error states.
   - `ProjectsTab.tsx` — filters, project card list, loading/error states.
   - `ProjectDetail.tsx` — detail panel driven by `get_project`.
4. **Build step** — an esbuild invocation (parallel to `build-data.ts`'s role in the existing pipeline) bundles the React app into one inlined-JS/CSS HTML file, written to a generated module (e.g. `app/generated/portfolio-app-html.ts`) that exports the HTML as a string constant. This runs as part of the existing site build so the deployed Function always ships current HTML; it is not computed at request time.

## Tool and Resource Contracts

`open_portfolio_app` tool descriptor:

```json
{
  "name": "open_portfolio_app",
  "description": "Open an interactive dashboard to check role fit and browse Aditya Karnam's public projects.",
  "inputSchema": { "type": "object", "properties": {}, "additionalProperties": false },
  "_meta": { "ui": { "resourceUri": "ui://portfolio-app" } }
}
```

`ui://portfolio-app` resource, returned from `resources/read`:

```json
{
  "uri": "ui://portfolio-app",
  "mimeType": "text/html",
  "text": "<!-- self-contained HTML, inlined JS/CSS -->"
}
```

The five other existing tools (`get_profile`, `list_projects`, `get_project`, `search_work`, `get_recent_work`, `get_recruiter_brief`) keep their current descriptors and input/output contracts exactly as-is — the app calls them unchanged.

## Error Handling

- A tool-call failure inside the app (including a 429 from the shared rate limiter) renders as an inline, retryable error state scoped to the view that triggered it (Fit Check or Projects), not a full-app crash.
- If `open_portfolio_app` itself is rate-limited or fails, the host falls back to its normal text/error rendering for a failed tool call — no special-casing needed beyond what `functions/mcp.ts` already does.
- Empty results (e.g. no evidence matched, no projects matched filters) render an explicit "no matches" state rather than a blank panel.

## Security and Safety

- The app runs in the host's sandboxed iframe per the MCP Apps spec — no access to the parent page, no cookies, no local storage beyond what the sandbox permits.
- No external script, font, or stylesheet origins are used; everything is inlined at build time, so no `_meta.ui.csp` allowlist is needed beyond the default.
- The app only ever calls the six read-only tools already exposed by this server. It requests no permissions beyond tool-calling and `sendOpenLink`.
- Same data-scope boundary as the base MCP: no private data, no analytics, no recruiter identity is ever sent to or requested by the app.

## Testing

- `protocol.test.ts`: `tools/list` includes `open_portfolio_app` with the correct `_meta.ui.resourceUri`; `resources/list` includes `ui://portfolio-app`; `resources/read` for that uri returns `mimeType: "text/html"` and non-empty `text`.
- React app: unit tests per tab component covering state transitions (empty → loading → results → error), using a mocked `App`/host bridge so tests don't require a real iframe/postMessage channel.
- Manual verification in an actual MCP-Apps-capable Claude client before calling this done — iframe sandboxing and postMessage behavior can't be fully verified by unit tests alone.

## Rollout

- Ships as part of the same `/mcp` endpoint and the same deploy pipeline as the base MCP (Cloudflare Pages Functions). No separate deploy step.
- No banner or install-page changes needed — clients that already have the connector installed pick up the new tool and resource automatically on their next `tools/list`/`resources/list` call.

## Open Decisions for Implementation Planning

- Exact directory/build wiring for the esbuild step (standalone script vs. integrated into the existing Gatsby build command).
- Whether `open_portfolio_app`'s confirmation payload needs any fields beyond `{ opened: true }` (e.g. a data version, for cache-busting the app's first render).
