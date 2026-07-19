# Hosted Portfolio MCP Design

Date: 2026-07-19

## Goal

Expose `adityakarnam.com` as a public, read-only remote MCP server at:

```text
https://adityakarnam.com/mcp
```

The MCP should let recruiters and AI agents query Aditya Karnam's recent work, systems, research agenda, and public proof points without scraping the website or installing a local package.

The initial target clients are Claude custom connectors and agent workflows that support remote MCP over Streamable HTTP.

## Non-Goals

- No npm package for v1.
- No local MCP install flow for v1.
- No private data, hidden notes, analytics, email, or authenticated recruiter state.
- No write tools.
- No LLM-backed answer synthesis in v1 unless a later implementation plan explicitly adds cost controls and abuse protections.

## Users

### Recruiters

Recruiters should be able to install the connector in Claude, paste a role description, and ask whether Aditya is a strong fit. The answer should be grounded in public projects, posts, and links.

### Research or Engineering Agents

Agents should be able to inspect the portfolio as a structured knowledge source: list systems, retrieve a project, search work by topic, and cite source URLs.

## Product Shape

The site gets three public surfaces:

```text
https://adityakarnam.com/mcp
```

Protocol endpoint for MCP clients.

```text
https://adityakarnam.com/mcp-install/
```

Human install and documentation page. This page explains that the connector is read-only and gives Claude setup instructions. It intentionally uses a separate path so Gatsby trailing-slash behavior cannot collide with the protocol endpoint.

```text
site-wide top banner
```

A compact announcement banner appears at the top of the website after the MCP is live. It should make the connector visible to recruiters and agents without turning the portfolio into a landing page.

Banner copy:

```text
Portfolio MCP is live. Add Aditya's work to Claude.
```

Primary action:

```text
Install in Claude
```

The action links to `/mcp-install/`, not directly to `/mcp`, so human visitors see clear setup instructions before copying the connector URL.

The banner should be dismissible for the current browser session and should not obscure navigation, mobile content, or the first viewport's core portfolio signal.

## Architecture

The current Gatsby site remains the source of truth. Portfolio data is normalized into a static data contract during build, then served through a Cloudflare Pages Function.

```text
Gatsby content + world-model data
        |
        v
Build-time portfolio MCP JSON
        |
        v
Cloudflare Pages Function at /mcp
        |
        v
Remote MCP tools and resources
        |
        v
Claude custom connector / agent clients
```

## Data Sources

Use existing public repo content first:

- `src/components/world-model/data.ts`
  - `siteIdentity`
  - `systems`
  - `researchAgenda`
  - `fieldNotes`
  - `currentInvestigations`
  - `operatingPrinciples`
- `content/rag-project-pages.json`
  - compact searchable descriptions and URLs for project pages
- `content/posts/**`
  - recent public posts and system notes, normalized from frontmatter and paths
- `gatsby-config.ts`
  - site title, URL, description, and public social links

The implementation should generate one normalized JSON artifact that the MCP handler can import or load without parsing MDX at request time.

## Tools

### `get_profile`

Returns public identity, positioning, focus areas, site links, and social links.

Output should include:

- name
- title
- lab name
- tagline
- current focus
- public links
- one short recruiter summary
- one short engineering summary

### `list_projects`

Lists public systems and artifacts.

Inputs:

- `tags?: string[]`
- `status?: string`
- `limit?: number`

Output should include:

- name
- slug
- tags
- status
- research question
- one-sentence system summary
- canonical URL

### `get_project`

Returns one project by slug or name.

Inputs:

- `slug_or_name: string`

Output should include:

- name
- URL
- tags
- status
- research question
- system built
- why it matters
- links
- explanation modes
- recruiter framing

### `search_work`

Searches projects, field notes, recent posts, and compact RAG project pages.

Inputs:

- `query: string`
- `audience?: "recruiter" | "engineer" | "researcher" | "founder"`
- `limit?: number`

Search should be deterministic for v1. A simple weighted lexical search is enough:

- exact title/name match
- tag match
- query term overlap in summaries
- recency boost for recent work
- project/system boost over generic blog posts

Each result must include a source URL and a short reason it matched.

### `get_recent_work`

Returns recent public work across posts, field notes, and active systems.

Inputs:

- `limit?: number`

Output should include:

- title
- type
- date or status
- URL
- summary
- related tags

### `get_recruiter_brief`

Maps public work to a role or hiring prompt.

Inputs:

- `role_description?: string`
- `limit?: number`

Output should include:

- concise fit summary
- strongest evidence
- relevant projects
- topics to ask about in an interview
- source URLs
- honest gaps if the role asks for skills not represented in the public portfolio data

This tool should not claim private employment details, compensation preferences, citizenship, visa status, or availability unless those are intentionally added to the public data contract later.

## Resources

Expose stable MCP resources:

```text
portfolio://profile
portfolio://systems
portfolio://research-agenda
portfolio://recent-work
portfolio://recruiter-guide
```

Resources should be readable, compact, and safe to quote. They should not duplicate the full website or long post bodies.

## Claude Install UX

The documentation page should provide concise setup steps, a Claude Code quick-install command, and copy-ready prompts.

Primary install block:

```text
Install Aditya Karnam's Portfolio MCP in Claude

Connector URL:
https://adityakarnam.com/mcp
```

Claude app setup:

```text
1. Open Claude.
2. Go to Settings / Customize.
3. Open Connectors.
4. Choose Add custom connector.
5. Paste https://adityakarnam.com/mcp.
6. Save the connector.
```

For team accounts, the page should say that an organization owner may need to add the connector first.

Claude Code quick install:

```bash
claude mcp add --transport http aditya-portfolio https://adityakarnam.com/mcp
```

The install page should make this command copyable and label it for developers and agent users. It should also include a short verification command:

```bash
claude mcp list
```

The page should provide copy-ready recruiter prompts:

- "Use Aditya Karnam's portfolio connector. Is he a fit for this AI infrastructure role?"
- "Which projects show agent runtime or MCP experience?"
- "Give me a recruiter brief with evidence and source links."
- "What is his recent work around local inference and evals?"
- "Compare his work to this role description and list the strongest evidence."

The page should also include a short explanation for non-technical recruiters:

```text
This connector lets Claude read structured public information from Aditya's portfolio: systems, projects, recent work, research agenda, and source links. It is read-only and does not access private data.
```

## Error Handling

- Unknown project: return a structured not-found response and suggest close matches.
- Empty search query: return a validation error.
- No search matches: return an empty result list plus suggested tags.
- Unsupported method or malformed MCP payload: return protocol-appropriate JSON-RPC errors.
- Internal error: return a generic error without leaking stack traces or environment details.

## Security and Safety

- Public read-only endpoint.
- No secrets required for v1.
- No write tools.
- No arbitrary URL fetches.
- No dynamic code execution.
- Rate-limit requests at the Cloudflare edge.
- Add conservative CORS headers only if required by target clients.
- Treat indexed post content as untrusted text. Tool descriptions and system-level instructions must not be derived from indexed content.

## Testing

Implementation should include:

- Unit tests for portfolio data normalization.
- Unit tests for search ranking and filtering.
- Unit tests for recruiter brief behavior with matching and non-matching role descriptions.
- Protocol-level tests for MCP initialize, tools/list, tools/call, resources/list, and resources/read.
- UI checks for the top banner on desktop and mobile viewports.
- A local smoke test using an MCP inspector or direct Streamable HTTP calls.
- Build verification with `npm run build`.

## Rollout

1. Add the normalized data contract.
2. Add the MCP Pages Function at `/mcp`.
3. Add the human install page at `/mcp-install/`.
4. Add the site-wide top banner that links to `/mcp-install/`.
5. Add tests and local smoke verification.
6. Deploy through the existing Cloudflare Pages flow.
7. Install in Claude as a custom connector and verify the recruiter prompts.
8. Enable or confirm the banner only after the production MCP endpoint responds successfully.

## Open Decisions for Implementation Planning

- Whether to use Cloudflare's MCP helper package or a minimal direct MCP handler.
- Whether the MCP route should live beside existing Pages Functions or in a separate Cloudflare Worker if routing conflicts with Gatsby static pages.
- Exact shape of the build-time JSON generator for MDX post metadata.
- Whether the first version includes post search or only project/system search.
