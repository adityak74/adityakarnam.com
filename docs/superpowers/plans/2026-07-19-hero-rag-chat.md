# Hero RAG Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the standalone `/ask` page with a multi-turn, persona-adaptive chat embedded in the homepage hero, grounded via Cloudflare AI Search (managed RAG) over curated blog posts and project pages.

**Architecture:** A CI script syncs curated markdown (human-written posts + fixed project blurbs) to a Cloudflare R2 bucket and triggers an AI Search re-index on every content push. A Gatsby/Cloudflare Pages Function (`/api/hero-chat`) calls the AI Search instance's REST endpoint with the full conversation + a persona system message, and returns a grounded answer plus source links built from the returned citation chunks. A React chat component in the homepage hero drives it, replacing `/ask` entirely.

**Tech Stack:** Gatsby 5 + TypeScript + theme-ui, Cloudflare Pages Functions, Cloudflare AI Search (R2 data source), Node ESM scripts (`gray-matter` for frontmatter), Vitest for unit tests, GitHub Actions for the sync trigger.

## Global Constraints

- Corpus = all `content/posts/**` entries whose frontmatter `tags` do **not** include `autoblog`, plus the 3 fixed project pages in `content/rag-project-pages.json` (ai-toolkit, leanlearn, cc-creativity-skills — subagent-fleet and embenx are deliberately excluded from this fixture since they already have their own, richer blog posts with the same slug; `discoverSources` dedupes by slug so a colliding entry here would silently overwrite the real post).
- Sync trigger: GitHub Actions on push to `main`, scoped to `paths: ["content/posts/**"]` only — config/CI/tooling changes must never trigger a sync.
- Embedding model: `@cf/qwen/qwen3-embedding-0.6b` ($0.012/M input tokens, 1024 dims, 4096-token context — `bge-small-en-v1.5` is not in AI Search's supported embedding model list).
- Generation model: `@cf/meta/llama-3.1-8b-instruct-fp8` (small instruct model, not deprecated, cheaper than the non-fp8 variant).
- Chat is multi-turn, client-side conversation state only — no server persistence.
- `/ask` route is removed and redirects to `/`.
- All new Node scripts are plain ESM (`.mjs`), no build step required to run them.
- No placeholders: every fallback path returns real, grounded-sounding text, never a raw error to the visitor.

---

### Task 1: Test runner + frontmatter parsing dependency

**Files:**
- Modify: `package.json`
- Create: `scripts/lib/render-corpus-doc.mjs`
- Test: `scripts/lib/render-corpus-doc.test.mjs`

**Interfaces:**
- Produces: `renderCorpusDoc({ title: string, body: string }): string` — used by Task 5's sync script.

- [ ] **Step 1: Add `vitest` and `gray-matter` as devDependencies**

Run: `npm install --save-dev vitest gray-matter`

Expected: `package.json` devDependencies now include `"vitest"` and `"gray-matter"` entries.

- [ ] **Step 2: Pin `wrangler` as a devDependency**

Task 4's sync script and the GitHub Actions workflow in Task 5 both shell out to `npx wrangler`. Without a pinned version, `npx` in a clean CI checkout resolves whatever the npm registry considers current at that moment, which can be an older cached version that predates commands this plan depends on (e.g. `wrangler ai-search jobs create`, added to wrangler after 4.86.0). Pinning avoids that class of failure entirely.

Run: `npm install --save-dev wrangler@4.112.0`

Expected: `package.json` devDependencies now include `"wrangler": "^4.112.0"`. Note: wrangler 4.112.0 requires Node >= 22 — this is why Task 5's workflow uses `node-version: 22`, not 20.

- [ ] **Step 3: Add a `test` script to `package.json`**

In `package.json`, inside `"scripts"`, add:

```json
    "test": "vitest run",
```

- [ ] **Step 4: Write the failing test for `renderCorpusDoc`**

Create `scripts/lib/render-corpus-doc.test.mjs`:

```js
import { describe, it, expect } from "vitest"
import { renderCorpusDoc } from "./render-corpus-doc.mjs"

describe("renderCorpusDoc", () => {
  it("renders title as an H1 followed by the body", () => {
    const result = renderCorpusDoc({ title: "Example Title", body: "Example body text." })

    expect(result).toBe("# Example Title\n\nExample body text.\n")
  })
})
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run scripts/lib/render-corpus-doc.test.mjs`
Expected: FAIL — `Cannot find module './render-corpus-doc.mjs'` or similar.

- [ ] **Step 6: Write the minimal implementation**

Create `scripts/lib/render-corpus-doc.mjs`:

```js
export function renderCorpusDoc({ title, body }) {
  return `# ${title}\n\n${body}\n`
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run scripts/lib/render-corpus-doc.test.mjs`
Expected: PASS — 1 test passed.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json scripts/lib/render-corpus-doc.mjs scripts/lib/render-corpus-doc.test.mjs
git commit -m "Add vitest + gray-matter + wrangler, first RAG corpus doc renderer"
```

---

### Task 2: Content discovery — human-written posts

**Files:**
- Create: `scripts/lib/discover-content.mjs`
- Test: `scripts/lib/discover-content.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `discoverPosts(postsDir?: string): Array<{ slug: string, title: string, url: string, body: string }>` and `loadProjectPages(projectPagesFile?: string): Array<{ slug, title, url, body }>` and `discoverSources(postsDir?, projectPagesFile?): Array<{ slug, title, url, body }>` — all consumed by Task 5's sync script.

- [ ] **Step 1: Write the failing tests**

Create `scripts/lib/discover-content.test.mjs`:

```js
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { discoverPosts } from "./discover-content.mjs"

let tempDir

beforeAll(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rag-posts-"))

  fs.mkdirSync(path.join(tempDir, "human-post"))
  fs.writeFileSync(
    path.join(tempDir, "human-post", "human-post.mdx"),
    [
      "---",
      'title: "Human Post"',
      'slug: "/human-post"',
      "tags:",
      "  - ai",
      "  - agents",
      "---",
      "",
      "This is the body of the human post.",
      "",
    ].join("\n")
  )

  fs.mkdirSync(path.join(tempDir, "autoblog-post"))
  fs.writeFileSync(
    path.join(tempDir, "autoblog-post", "autoblog-post.mdx"),
    [
      "---",
      'title: "Autoblog Post"',
      'slug: "/autoblog-post"',
      "tags:",
      "  - autoblog",
      "---",
      "",
      "This should be excluded.",
      "",
    ].join("\n")
  )

  fs.mkdirSync(path.join(tempDir, "no-slug-post"))
  fs.writeFileSync(
    path.join(tempDir, "no-slug-post", "no-slug-post.mdx"),
    ["---", 'title: "No Slug Post"', "---", "", "Body without a slug.", ""].join("\n")
  )
})

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
})

describe("discoverPosts", () => {
  it("includes posts not tagged autoblog", () => {
    const posts = discoverPosts(tempDir)
    const slugs = posts.map((post) => post.slug)

    expect(slugs).toContain("human-post")
  })

  it("excludes posts tagged autoblog", () => {
    const posts = discoverPosts(tempDir)
    const slugs = posts.map((post) => post.slug)

    expect(slugs).not.toContain("autoblog-post")
  })

  it("excludes posts with no slug in frontmatter", () => {
    const posts = discoverPosts(tempDir)
    const titles = posts.map((post) => post.title)

    expect(titles).not.toContain("No Slug Post")
  })

  it("strips leading and trailing slashes from slug", () => {
    const posts = discoverPosts(tempDir)
    const humanPost = posts.find((post) => post.title === "Human Post")

    expect(humanPost.slug).toBe("human-post")
  })

  it("derives a canonical URL when canonicalUrl is missing", () => {
    const posts = discoverPosts(tempDir)
    const humanPost = posts.find((post) => post.title === "Human Post")

    expect(humanPost.url).toBe("https://adityakarnam.com/human-post/")
  })

  it("trims the markdown body", () => {
    const posts = discoverPosts(tempDir)
    const humanPost = posts.find((post) => post.title === "Human Post")

    expect(humanPost.body).toBe("This is the body of the human post.")
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run scripts/lib/discover-content.test.mjs`
Expected: FAIL — `Cannot find module './discover-content.mjs'`.

- [ ] **Step 3: Write the minimal implementation**

Create `scripts/lib/discover-content.mjs`:

```js
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, "..", "..")
const DEFAULT_POSTS_DIR = path.join(REPO_ROOT, "content", "posts")
const DEFAULT_PROJECT_PAGES_FILE = path.join(REPO_ROOT, "content", "rag-project-pages.json")

export function discoverPosts(postsDir = DEFAULT_POSTS_DIR) {
  const entries = fs.readdirSync(postsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  const posts = []

  for (const entry of entries) {
    const dirPath = path.join(postsDir, entry.name)
    const files = fs.readdirSync(dirPath)
    const sourceFile = files.find((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    if (!sourceFile) continue

    const raw = fs.readFileSync(path.join(dirPath, sourceFile), "utf8")
    const { data, content } = matter(raw)
    const tags = Array.isArray(data.tags) ? data.tags : []

    if (tags.includes("autoblog")) continue

    const slug = String(data.slug || "").replace(/^\/+|\/+$/g, "")
    if (!slug) continue

    posts.push({
      slug,
      title: String(data.title || slug),
      url: String(data.canonicalUrl || `https://adityakarnam.com/${slug}/`),
      body: content.trim(),
    })
  }

  return posts
}

export function loadProjectPages(projectPagesFile = DEFAULT_PROJECT_PAGES_FILE) {
  const raw = fs.readFileSync(projectPagesFile, "utf8")
  return JSON.parse(raw)
}

export function discoverSources(postsDir = DEFAULT_POSTS_DIR, projectPagesFile = DEFAULT_PROJECT_PAGES_FILE) {
  return [...discoverPosts(postsDir), ...loadProjectPages(projectPagesFile)]
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run scripts/lib/discover-content.test.mjs`
Expected: PASS — 6 tests passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/discover-content.mjs scripts/lib/discover-content.test.mjs
git commit -m "Add curated-post discovery for RAG corpus sync"
```

---

### Task 3: Fixed project-page corpus data

**Files:**
- Create: `content/rag-project-pages.json`
- Test: `scripts/lib/discover-content.test.mjs` (extend)

**Interfaces:**
- Consumes: `loadProjectPages` from Task 2.
- Produces: the on-disk `content/rag-project-pages.json` fixture that `discoverSources` reads by default.

- [ ] **Step 1: Write the failing test**

Append to `scripts/lib/discover-content.test.mjs` (add import and new `describe` block):

```js
import { loadProjectPages, discoverSources } from "./discover-content.mjs"
```

(replace the existing `import { discoverPosts } from "./discover-content.mjs"` line with the line above, since this test file now covers all three exports)

Add at the end of the file:

```js
describe("loadProjectPages", () => {
  it("loads the real project-pages fixture with 3 entries", () => {
    const pages = loadProjectPages()

    expect(pages).toHaveLength(3)
    expect(pages.map((page) => page.slug)).toContain("ai-toolkit")
  })

  it("every entry has slug, title, url, and body", () => {
    const pages = loadProjectPages()

    for (const page of pages) {
      expect(typeof page.slug).toBe("string")
      expect(typeof page.title).toBe("string")
      expect(typeof page.url).toBe("string")
      expect(typeof page.body).toBe("string")
      expect(page.body.length).toBeGreaterThan(0)
    }
  })
})

describe("discoverSources", () => {
  it("combines discovered posts and project pages", () => {
    const sources = discoverSources(tempDir)

    expect(sources.some((source) => source.slug === "human-post")).toBe(true)
    expect(sources.some((source) => source.slug === "ai-toolkit")).toBe(true)
  })

  it("dedupes sources by slug, keeping the post over a colliding project page", () => {
    const projectPagesFile = path.join(tempDir, "colliding-project-pages.json")
    fs.writeFileSync(
      projectPagesFile,
      JSON.stringify([
        {
          slug: "human-post",
          title: "Human Post Blurb",
          url: "https://adityakarnam.com/human-post/",
          body: "This is a short blurb that should not overwrite the full post.",
        },
      ])
    )

    const sources = discoverSources(tempDir, projectPagesFile)
    const matches = sources.filter((source) => source.slug === "human-post")

    expect(matches).toHaveLength(1)
    expect(matches[0].body).toBe("This is the body of the human post.")
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run scripts/lib/discover-content.test.mjs`
Expected: FAIL — `ENOENT: no such file or directory, open '.../content/rag-project-pages.json'`.

- [ ] **Step 3: Create the project-pages fixture**

Create `content/rag-project-pages.json`. **Note:** `subagent-fleet` and `embenx` are deliberately excluded here — both already have their own, richer blog posts under `content/posts/**` with the exact same slug (`subagent-fleet-local-ai-compute-control-plane`, `embenx-python-embedding-toolkit`). Including a blurb entry for either here would collide with the real post and — since project pages are appended after posts and uploaded in that order — silently overwrite the full post content with the short blurb in R2. `discoverSources` (Step 5, `discover-content.mjs`) dedupes by slug and keeps the first occurrence (posts before project pages) specifically to guard against this, but the fixture itself should never rely on that safety net for entries that have a real post.

```json
[
  {
    "slug": "ai-toolkit",
    "title": "AI Toolkit",
    "url": "https://adityakarnam.com/ai-toolkit/",
    "body": "AI Toolkit is a collection of interactive LLM workflow tools, including prompt composition, grading, and writing utilities. It is less about world-modeling directly and more about the practical operations layer: shaping and evaluating model behavior through usable, repeatable prompt tools rather than ad-hoc prompting."
  },
  {
    "slug": "leanlearn",
    "title": "leanlearn",
    "url": "https://github.com/adityak74/leanlearn",
    "body": "leanlearn is a modern, high-performance learning management system built for speed and simplicity on a Cloudflare-native stack: Pages, D1, Workers, and React Router v7. It provides edge-hosted courses with real-time progress tracking, automated certificate generation, and Google OAuth, built lean so learners get fast pages and teams can ship without heavy infrastructure overhead."
  },
  {
    "slug": "cc-creativity-skills",
    "title": "cc-creativity-skills",
    "url": "https://github.com/adityak74/cc-creativity-skills",
    "body": "cc-creativity-skills is a growing library of composable skills for Claude Code that cover creative and interactive generation workflows Claude Code does not ship with out of the box: generative art, interactive experiences, and creative tooling. It reduces from-scratch prompting time for teams building AI-driven creative features."
  }
]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run scripts/lib/discover-content.test.mjs`
Expected: PASS — 10 tests passed.

- [ ] **Step 5: Add a defensive dedupe-by-slug to `discoverSources`**

In `scripts/lib/discover-content.mjs`, replace the `discoverSources` function:

```js
export function discoverSources(postsDir = DEFAULT_POSTS_DIR, projectPagesFile = DEFAULT_PROJECT_PAGES_FILE) {
  const combined = [...discoverPosts(postsDir), ...loadProjectPages(projectPagesFile)]
  const seenSlugs = new Set()
  const deduped = []

  for (const source of combined) {
    if (seenSlugs.has(source.slug)) continue
    seenSlugs.add(source.slug)
    deduped.push(source)
  }

  return deduped
}
```

Run: `npx vitest run scripts/lib/discover-content.test.mjs`
Expected: PASS — 10 tests passed (the dedupe test from Step 1 now exercises real logic instead of trivially passing).

- [ ] **Step 6: Commit**

```bash
git add content/rag-project-pages.json scripts/lib/discover-content.mjs scripts/lib/discover-content.test.mjs
git commit -m "Add fixed project-page corpus fixture for RAG sync"
```

---

### Task 4: RAG corpus sync script

**Files:**
- Create: `scripts/sync-rag-corpus.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `discoverSources` from Task 2, `renderCorpusDoc` from Task 1.
- Produces: an executable `node scripts/sync-rag-corpus.mjs` entry point (no exported functions consumed by later tasks — this is the CI-facing script).

- [ ] **Step 1: Write the script**

Create `scripts/sync-rag-corpus.mjs`:

```js
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { discoverSources } from "./lib/discover-content.mjs"
import { renderCorpusDoc } from "./lib/render-corpus-doc.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, "..")
const OUT_DIR = path.join(REPO_ROOT, ".rag-corpus")

const BUCKET = process.env.RAG_CORPUS_BUCKET || "adityakarnam-rag-corpus"
const AI_SEARCH_INSTANCE = process.env.AI_SEARCH_INSTANCE || "hero-chat"

function writeCorpusFiles(sources) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })

  return sources.map((source) => {
    const fileName = `${source.slug}.md`
    const filePath = path.join(OUT_DIR, fileName)
    fs.writeFileSync(filePath, renderCorpusDoc(source))
    return { fileName, filePath }
  })
}

function uploadToR2(fileName, filePath) {
  execFileSync("npx", ["wrangler", "r2", "object", "put", `${BUCKET}/${fileName}`, "--file", filePath, "--remote"], {
    stdio: "inherit",
  })
}

function triggerAiSearchSync() {
  execFileSync("npx", ["wrangler", "ai-search", "jobs", "create", AI_SEARCH_INSTANCE], { stdio: "inherit" })
}

function main() {
  const sources = discoverSources()
  const files = writeCorpusFiles(sources)

  for (const { fileName, filePath } of files) {
    uploadToR2(fileName, filePath)
  }

  triggerAiSearchSync()

  console.log(`Synced ${sources.length} sources to r2://${BUCKET} and triggered an AI Search sync job for ${AI_SEARCH_INSTANCE}.`)
}

main()
```

- [ ] **Step 2: Add a `sync:rag-corpus` script to `package.json`**

In `package.json`, inside `"scripts"`, add:

```json
    "sync:rag-corpus": "node scripts/sync-rag-corpus.mjs",
```

- [ ] **Step 3: Verify the script runs against real content (dry check, no credentials yet)**

Run: `node -e "import('./scripts/lib/discover-content.mjs').then(m => console.log(m.discoverSources().length))"`
Expected: prints `15` (12 human posts with a `slug` field + 3 project pages) — confirms `discoverSources()` works against the real `content/posts` directory before wiring in the network calls.

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-rag-corpus.mjs package.json
git commit -m "Add RAG corpus sync script (R2 upload + AI Search job trigger)"
```

Note: this script cannot be fully exercised until Task 6 provisions the R2 bucket and AI Search instance — running it before that will fail on the `wrangler r2 object put` step with a "bucket not found" error, which is expected at this point.

---

### Task 5: GitHub Actions workflow to trigger sync on content changes

**Files:**
- Create: `.github/workflows/sync-rag-corpus.yml`

**Interfaces:**
- Consumes: `npm run sync:rag-corpus` from Task 4.
- Produces: nothing consumed by later tasks — this is the CI trigger.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/sync-rag-corpus.yml`:

```yaml
name: Sync RAG Corpus

on:
  push:
    branches: [main]
    paths:
      - "content/posts/**"
  workflow_dispatch: {}

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run sync:rag-corpus
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

`workflow_dispatch: {}` allows manually re-running the sync from the GitHub Actions UI or `gh workflow run sync-rag-corpus.yml` — useful for verification and for re-syncing after an infra-only change that doesn't touch `content/posts/**`. It does not weaken the automatic path-based gating: manual runs are opt-in, not something that fires on unrelated pushes.

- [ ] **Step 2: Validate the workflow YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/sync-rag-corpus.yml'))" && echo "valid"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/sync-rag-corpus.yml
git commit -m "Trigger RAG corpus sync via GitHub Actions on content changes"
```

Note: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets must be added in GitHub repo settings (Settings > Secrets and variables > Actions) before this workflow can succeed — this is a manual dashboard step, not scriptable from here, and should happen alongside Task 6.

---

### Task 6: One-time Cloudflare infra provisioning (manual, requires user go-ahead)

**This task creates real cloud resources in the user's Cloudflare account. Do not run these commands without the user's explicit confirmation at execution time — this is exactly the kind of external, billed, side-effecting action the project's safety guidance requires a check-in for.**

**Files:** none (infra-only task, no repo changes except verifying the sync script end-to-end).

- [ ] **Step 1: Confirm Cloudflare authentication and scopes**

Run: `npx wrangler whoami`
Expected: prints the logged-in Cloudflare account email/ID and a list of OAuth scopes. If not logged in, run `npx wrangler login` first (interactive browser flow — requires the user). If the scope list is missing `ai-search:write` / `ai-search:run` (common if the token predates AI Search), run `npx wrangler login` again to refresh it — wrangler requests the full current scope set on every login, so a fresh login picks up new scopes automatically.

- [ ] **Step 2: Enable R2 on the account (one-time, dashboard-only)**

If R2 has never been used on this Cloudflare account, `wrangler r2 bucket create` fails with `Please enable R2 through the Cloudflare Dashboard. [code: 10042]`. If that happens, have the user enable R2 from the Cloudflare dashboard (**R2** in the left sidebar) before continuing — this can't be scripted from the CLI.

- [ ] **Step 3: Create the R2 bucket**

Run: `npx wrangler r2 bucket create adityakarnam-rag-corpus`
Expected: `Created bucket 'adityakarnam-rag-corpus'`

- [ ] **Step 4: Create the AI Search instance connected to that bucket**

Run:
```bash
npx wrangler ai-search create hero-chat \
  --type r2 \
  --source adityakarnam-rag-corpus \
  --embedding-model @cf/qwen/qwen3-embedding-0.6b \
  --generation-model @cf/meta/llama-3.1-8b-instruct-fp8
```
Expected: instance created; if this is the account's first R2-backed AI Search instance, the create command fails with `No AI Search API token found. Create one at: https://dash.cloudflare.com/<account_id>/ai/ai-search/tokens` — have the user open that URL, create the token (this is a Cloudflare-managed token AI Search uses internally to read the R2 bucket, separate from the `CLOUDFLARE_API_TOKEN` used in Step 6), then re-run the `create` command.

- [ ] **Step 5: Add GitHub repo secrets**

In the GitHub repo, go to **Settings > Secrets and variables > Actions** and add:
- `CLOUDFLARE_API_TOKEN` — an API token with `AI Search:Edit`, `AI Search:Run`, `Workers R2 Storage:Edit` permissions.
- `CLOUDFLARE_ACCOUNT_ID` — the account ID from Step 1.

- [ ] **Step 6: Run the sync script for real**

Run: `CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account-id> npm run sync:rag-corpus`
Expected: uploads 15 markdown files to R2 (12 human posts + 3 project pages, deduped by slug) and prints `Synced 15 sources to r2://adityakarnam-rag-corpus and triggered an AI Search sync job for hero-chat.`

- [ ] **Step 7: Wait for indexing and check stats**

Run: `npx wrangler ai-search stats hero-chat`
Expected: `Queued: 0, Processing: 0, Indexed: 15, Errors: 0` once the sync job finishes (may take a minute — re-run if Processing is still nonzero).

- [ ] **Step 8: Smoke-test a real query from the CLI**

Run: `npx wrangler ai-search search hero-chat --query "What is subagent-fleet?"`
Expected: a response mentioning subagent-fleet's local Ollama routing, confirming the instance is indexed and queryable. Note: `wrangler ai-search search` calls the retrieval-only `/search` endpoint (chunks, no generated answer) — this is fine for this smoke test, but Task 8 must use `/chat/completions` instead (see Step 9).

- [x] **Step 9: Record the exact REST response shape for Task 8 (already confirmed live)**

Confirmed against the real instance: the generation endpoint is **`/ai-search/instances/{name}/chat/completions`**, not `/search` (`/search` is retrieval-only — it returns `{success, result: {chunks}}` with no generated answer). `/chat/completions` returns the answer directly, with **no `.result` envelope**:

```json
{
  "id": "id-...",
  "object": "chat.completion",
  "choices": [{ "index": 0, "message": { "role": "assistant", "content": "..." }, "finish_reason": "stop" }],
  "usage": { "prompt_tokens": 682, "completion_tokens": 53, "total_tokens": 735 },
  "chunks": [
    { "id": "...", "score": 0.62, "text": "...", "item": { "key": "subagent-fleet-local-ai-compute-control-plane.md", "timestamp": 1784446260000, "metadata": {} }, "scoring_details": { "vector_score": 0.62 } }
  ]
}
```

So the answer is at `.choices[0].message.content` and citations at `.chunks[].item.key` / `.chunks[].score` — exactly matching Task 7's `buildSourcesFromChunks` and Task 8's `extractAnswer`/`extractChunks`, **except Task 8's endpoint must be `/chat/completions`, not `/search`** (fixed in Task 8 below).

No commit for this task — it is pure infra setup plus a manual verification note to carry into Task 8.

---

### Task 7: Persona types, system-prompt builder, source-URL mapper, rate limiter

**Files:**
- Create: `src/components/world-model/hero-chat/hero-chat-types.ts`
- Create: `src/components/world-model/hero-chat/map-source-url.ts`
- Create: `src/components/world-model/hero-chat/rate-limiter.ts`
- Test: `src/components/world-model/hero-chat/hero-chat-types.test.ts`
- Test: `src/components/world-model/hero-chat/map-source-url.test.ts`
- Test: `src/components/world-model/hero-chat/rate-limiter.test.ts`

**Interfaces:**
- Produces:
  - `VisitorLens` type, `VISITOR_LENSES: VisitorLens[]`, `LENS_FALLBACKS: Record<VisitorLens, string>`, `DEFAULT_FALLBACK_SOURCES: SourceLink[]`, `buildSystemMessage(persona: VisitorLens): { role: "system", content: string }`
  - `SourceLink = { label: string, href: string }`, `mapChunkKeyToUrl(key: string): string`, `buildSourcesFromChunks(chunks: Array<{ item?: { key?: string }, score?: number }>, scoreThreshold?: number): SourceLink[]`
  - `checkRateLimit(clientId: string, now?: number): boolean`
- All four are consumed by Task 8's `/api/hero-chat.ts`.

- [ ] **Step 1: Write the failing tests for persona types**

Create `src/components/world-model/hero-chat/hero-chat-types.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { VISITOR_LENSES, LENS_FALLBACKS, DEFAULT_FALLBACK_SOURCES, buildSystemMessage } from "./hero-chat-types"

describe("hero-chat-types", () => {
  it("has a fallback for every visitor lens", () => {
    for (const lens of VISITOR_LENSES) {
      expect(LENS_FALLBACKS[lens]).toBeTruthy()
    }
  })

  it("provides at least one default fallback source", () => {
    expect(DEFAULT_FALLBACK_SOURCES.length).toBeGreaterThan(0)
  })

  it("builds a system message that mentions the persona's guidance and grounded-answer rules", () => {
    const message = buildSystemMessage("Frontier Lab Recruiter")

    expect(message.role).toBe("system")
    expect(message.content).toContain("recruiter")
    expect(message.content.toLowerCase()).toContain("do not invent")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/world-model/hero-chat/hero-chat-types.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `hero-chat-types.ts`**

Create `src/components/world-model/hero-chat/hero-chat-types.ts`:

```ts
export type VisitorLens =
  | "AI Researcher"
  | "Frontier Lab Recruiter"
  | "Founder"
  | "Engineer"
  | "Open Source Contributor"

export type SourceLink = { label: string; href: string }

export const VISITOR_LENSES: VisitorLens[] = [
  "AI Researcher",
  "Frontier Lab Recruiter",
  "Founder",
  "Engineer",
  "Open Source Contributor",
]

export const LENS_FALLBACKS: Record<VisitorLens, string> = {
  "AI Researcher":
    "Aditya's work sits in the infrastructure layer around stateful agents: retrieval, memory, model routing, and local-first runtimes. The strongest research signal is the shift from prompt chains toward inspectable systems that maintain context over time.",
  "Frontier Lab Recruiter":
    "Aditya's signal is the ability to turn emerging agent-systems ideas into working infrastructure: local routing with subagent-fleet, backend-agnostic retrieval with embenx, and practical workflow tooling through AI Toolkit.",
  Founder:
    "Aditya is building in the gap between AI demos and durable product infrastructure: the memory, routing, and local execution layers teams need when agents become persistent and operational.",
  Engineer:
    "Aditya's work is strongest where systems behavior becomes explicit: control planes for local models, retrieval abstractions that reduce glue code, and tooling that makes LLM workflows easier to inspect and evaluate.",
  "Open Source Contributor":
    "The open-source signal is practical systems work with clear interfaces: subagent-fleet for local agent orchestration, embenx for unified retrieval across backends, and AI Toolkit for usable LLM workflow components.",
}

export const DEFAULT_FALLBACK_SOURCES: SourceLink[] = [
  { label: "Systems", href: "https://adityakarnam.com/systems/" },
  { label: "Thoughts", href: "https://adityakarnam.com/blog/" },
]

const PERSONA_SYSTEM_PROMPTS: Record<VisitorLens, string> = {
  "AI Researcher": "Answer as if speaking to an AI researcher: emphasize research framing, systems tradeoffs, and technical depth.",
  "Frontier Lab Recruiter": "Answer as if speaking to a technical recruiter at a frontier AI lab: emphasize impact, ownership, and the strongest signals from the work.",
  Founder: "Answer as if speaking to a startup founder: emphasize product thinking and what problem the work solves.",
  Engineer: "Answer as if speaking to a software engineer: emphasize implementation details and design decisions.",
  "Open Source Contributor": "Answer as if speaking to an open-source contributor: emphasize what is reusable, documented, and contribution-friendly.",
}

export const buildSystemMessage = (persona: VisitorLens): { role: "system"; content: string } => ({
  role: "system",
  content: [
    "You answer questions about Aditya Karnam's AI infrastructure work using only the provided source context.",
    "Do not invent achievements, roles, metrics, or unavailable projects.",
    "If the context does not support an answer, say you do not have enough source context to answer precisely.",
    "Keep answers under 150 words.",
    PERSONA_SYSTEM_PROMPTS[persona],
  ].join(" "),
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/world-model/hero-chat/hero-chat-types.test.ts`
Expected: PASS — 3 tests passed.

- [ ] **Step 5: Write the failing tests for the source-URL mapper**

Create `src/components/world-model/hero-chat/map-source-url.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { mapChunkKeyToUrl, buildSourcesFromChunks } from "./map-source-url"

describe("mapChunkKeyToUrl", () => {
  it("strips the .md extension and builds a full URL", () => {
    expect(mapChunkKeyToUrl("india-agent-infrastructure-layer.md")).toBe(
      "https://adityakarnam.com/india-agent-infrastructure-layer/"
    )
  })
})

describe("buildSourcesFromChunks", () => {
  it("dedupes chunks from the same source document", () => {
    const chunks = [
      { item: { key: "embenx-python-embedding-toolkit.md" }, score: 0.9 },
      { item: { key: "embenx-python-embedding-toolkit.md" }, score: 0.8 },
    ]

    expect(buildSourcesFromChunks(chunks)).toHaveLength(1)
  })

  it("drops chunks below the score threshold", () => {
    const chunks = [{ item: { key: "ai-toolkit.md" }, score: 0.1 }]

    expect(buildSourcesFromChunks(chunks, 0.4)).toHaveLength(0)
  })

  it("drops chunks with no item key", () => {
    const chunks = [{ score: 0.9 }]

    expect(buildSourcesFromChunks(chunks)).toHaveLength(0)
  })
})
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `npx vitest run src/components/world-model/hero-chat/map-source-url.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `map-source-url.ts`**

Create `src/components/world-model/hero-chat/map-source-url.ts`:

```ts
export type { SourceLink } from "./hero-chat-types"
import type { SourceLink } from "./hero-chat-types"

export const mapChunkKeyToUrl = (key: string): string => {
  const slug = key.replace(/\.mdx?$/i, "")
  return `https://adityakarnam.com/${slug}/`
}

type Chunk = { item?: { key?: string }; score?: number }

export const buildSourcesFromChunks = (chunks: Chunk[], scoreThreshold = 0.4): SourceLink[] => {
  const seen = new Set<string>()
  const sources: SourceLink[] = []

  for (const chunk of chunks) {
    const key = chunk.item?.key
    if (!key) continue
    if (typeof chunk.score === "number" && chunk.score < scoreThreshold) continue

    const href = mapChunkKeyToUrl(key)
    if (seen.has(href)) continue
    seen.add(href)

    sources.push({ label: key.replace(/\.mdx?$/i, ""), href })
  }

  return sources
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run src/components/world-model/hero-chat/map-source-url.test.ts`
Expected: PASS — 4 tests passed.

- [ ] **Step 9: Write the failing tests for the rate limiter**

Create `src/components/world-model/hero-chat/rate-limiter.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { checkRateLimit } from "./rate-limiter"

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const clientId = "client-a"
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(clientId)).toBe(true)
    }
  })

  it("blocks the 21st request within the same window", () => {
    const clientId = "client-b"
    for (let i = 0; i < 20; i++) {
      checkRateLimit(clientId)
    }
    expect(checkRateLimit(clientId)).toBe(false)
  })

  it("allows requests again once the window has passed", () => {
    const clientId = "client-c"
    const start = Date.now()
    for (let i = 0; i < 20; i++) {
      checkRateLimit(clientId, start)
    }
    expect(checkRateLimit(clientId, start)).toBe(false)
    expect(checkRateLimit(clientId, start + 1000 * 60 * 11)).toBe(true)
  })
})
```

- [ ] **Step 10: Run tests to verify they fail**

Run: `npx vitest run src/components/world-model/hero-chat/rate-limiter.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 11: Implement `rate-limiter.ts`**

Create `src/components/world-model/hero-chat/rate-limiter.ts`:

```ts
const WINDOW_MS = 1000 * 60 * 10
const MAX_REQUESTS_PER_WINDOW = 20

const requestLog = new Map<string, number[]>()

export const checkRateLimit = (clientId: string, now: number = Date.now()): boolean => {
  const timestamps = (requestLog.get(clientId) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS)

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(clientId, timestamps)
    return false
  }

  timestamps.push(now)
  requestLog.set(clientId, timestamps)
  return true
}
```

- [ ] **Step 12: Run tests to verify they pass**

Run: `npx vitest run src/components/world-model/hero-chat/rate-limiter.test.ts`
Expected: PASS — 3 tests passed.

- [ ] **Step 13: Commit**

```bash
git add src/components/world-model/hero-chat/hero-chat-types.ts src/components/world-model/hero-chat/hero-chat-types.test.ts src/components/world-model/hero-chat/map-source-url.ts src/components/world-model/hero-chat/map-source-url.test.ts src/components/world-model/hero-chat/rate-limiter.ts src/components/world-model/hero-chat/rate-limiter.test.ts
git commit -m "Add persona system prompts, source-URL mapping, and per-IP rate limiter for hero chat"
```

---

### Task 8: AI Search REST client + `/api/hero-chat` Pages Function

**Files:**
- Create: `src/components/world-model/hero-chat/ai-search-client.ts`
- Create: `src/api/hero-chat.ts`

**Interfaces:**
- Consumes: `buildSystemMessage`, `VISITOR_LENSES`, `LENS_FALLBACKS`, `DEFAULT_FALLBACK_SOURCES`, `VisitorLens` (Task 7 `hero-chat-types.ts`); `buildSourcesFromChunks`, `SourceLink` (Task 7 `map-source-url.ts`); `checkRateLimit` (Task 7 `rate-limiter.ts`).
- Produces: the live `/api/hero-chat` POST endpoint consumed by Task 9's UI.

- [ ] **Step 1: Implement the AI Search REST client**

Create `src/components/world-model/hero-chat/ai-search-client.ts`. **Before writing this file, re-check the response shape recorded in Task 6 Step 8** — the `extractAnswer`/`extractChunks` helpers below assume Cloudflare's standard `.result` envelope; adjust the property paths if the live response differs.

```ts
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

export type AiSearchChunk = {
  item?: { key?: string; metadata?: Record<string, unknown> }
  text?: string
  score?: number
}

export type AiSearchResult = {
  choices?: Array<{ message?: { content?: string } }>
  chunks?: AiSearchChunk[]
}

const AI_SEARCH_INSTANCE = "hero-chat"

export const hasAiSearchCredentials = (): boolean =>
  Boolean(process.env.CLOUDFLARE_API_TOKEN) && Boolean(process.env.CLOUDFLARE_ACCOUNT_ID)

export const queryAiSearch = async (messages: ChatMessage[]): Promise<AiSearchResult | null> => {
  if (!hasAiSearchCredentials()) {
    return null
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai-search/instances/${AI_SEARCH_INSTANCE}/chat/completions`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    return null
  }

  const payload = await response.json()
  const result: AiSearchResult = payload?.result ?? payload

  return result ?? null
}

export const extractAnswer = (result: AiSearchResult | null): string | null =>
  result?.choices?.[0]?.message?.content?.trim() || null

export const extractChunks = (result: AiSearchResult | null): AiSearchChunk[] => result?.chunks ?? []
```

- [ ] **Step 2: Implement the Pages Function**

Create `src/api/hero-chat.ts`:

```ts
import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby"
import {
  VISITOR_LENSES,
  LENS_FALLBACKS,
  DEFAULT_FALLBACK_SOURCES,
  buildSystemMessage,
  type VisitorLens,
} from "../components/world-model/hero-chat/hero-chat-types"
import { buildSourcesFromChunks, type SourceLink } from "../components/world-model/hero-chat/map-source-url"
import { checkRateLimit } from "../components/world-model/hero-chat/rate-limiter"
import {
  queryAiSearch,
  extractAnswer,
  extractChunks,
  type ChatMessage,
} from "../components/world-model/hero-chat/ai-search-client"

type HeroChatMessage = { role: "user" | "assistant"; content: string }

type HeroChatBody = {
  messages?: HeroChatMessage[]
  persona?: string
}

type HeroChatPayload = {
  text: string
  sources: SourceLink[]
  fallback: boolean
}

const TTL_MS = 1000 * 60 * 10
const cache = new Map<string, { expiresAt: number; payload: HeroChatPayload }>()

const normalizePersona = (value: unknown): VisitorLens =>
  (VISITOR_LENSES as string[]).includes(value as string) ? (value as VisitorLens) : "AI Researcher"

const normalizeMessages = (value: unknown): HeroChatMessage[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter(
      (entry): entry is HeroChatMessage =>
        Boolean(entry) &&
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.trim().length > 0
    )
    .map((entry) => ({ role: entry.role, content: entry.content.slice(0, 2000) }))
    .slice(-10)
}

const buildFallback = (persona: VisitorLens): HeroChatPayload => ({
  text: LENS_FALLBACKS[persona],
  sources: DEFAULT_FALLBACK_SOURCES,
  fallback: true,
})

export default async function handler(
  req: GatsbyFunctionRequest<HeroChatBody>,
  res: GatsbyFunctionResponse<HeroChatPayload | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." })
  }

  const clientIp = String(req.headers["cf-connecting-ip"] ?? req.headers["x-forwarded-for"] ?? "unknown")
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: "Too many questions. Try again in a bit." })
  }

  const persona = normalizePersona(req.body?.persona)
  const messages = normalizeMessages(req.body?.messages)

  if (messages.length === 0) {
    return res.status(400).json({ error: "At least one user message is required." })
  }

  const cacheKey = `${persona}:${messages.map((message) => `${message.role}:${message.content}`).join("|")}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json(cached.payload)
  }

  try {
    const aiSearchMessages: ChatMessage[] = [buildSystemMessage(persona), ...messages]
    const result = await queryAiSearch(aiSearchMessages)
    const text = extractAnswer(result)
    const chunks = extractChunks(result)
    const sources = buildSourcesFromChunks(chunks)

    const payload: HeroChatPayload =
      text && sources.length > 0 ? { text, sources, fallback: false } : buildFallback(persona)

    cache.set(cacheKey, { expiresAt: Date.now() + TTL_MS, payload })
    return res.status(200).json(payload)
  } catch (_error) {
    return res.status(200).json(buildFallback(persona))
  }
}

export const config = {
  bodyParser: {
    json: {
      limit: "32kb",
    },
  },
}
```

- [ ] **Step 3: Type-check the new files**

Run: `npx tsc --noEmit`
Expected: no errors referencing `ai-search-client.ts` or `hero-chat.ts`.

- [ ] **Step 4: Manual integration check against the real instance (requires Task 6 complete)**

Run:
```bash
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account-id> npx gatsby develop
```
then in another terminal:
```bash
curl -s -X POST http://localhost:8000/api/hero-chat \
  -H "Content-Type: application/json" \
  -d '{"persona":"Engineer","messages":[{"role":"user","content":"What is subagent-fleet?"}]}' | python3 -m json.tool
```
Expected: `{"text": "...", "sources": [...], "fallback": false}` with sources pointing at `https://adityakarnam.com/subagent-fleet-local-ai-compute-control-plane/`. If `fallback` is `true`, re-check the response-shape assumptions from Task 6 Step 8 against `queryAiSearch`'s parsing in Step 1.

- [ ] **Step 5: Commit**

```bash
git add src/components/world-model/hero-chat/ai-search-client.ts src/api/hero-chat.ts
git commit -m "Add AI Search REST client and /api/hero-chat Pages Function"
```

---

### Task 9: Hero Chat UI component

**Files:**
- Create: `src/components/world-model/HeroChat.tsx`

**Interfaces:**
- Consumes: `VISITOR_LENSES`, `VisitorLens` from Task 7 `hero-chat-types.ts`; the `/api/hero-chat` endpoint from Task 8.
- Produces: default-exported `HeroChat` React component, consumed by Task 10's `HomepageConsole.tsx`.

- [ ] **Step 1: Implement the component**

Create `src/components/world-model/HeroChat.tsx`:

```tsx
/** @jsx jsx */
import * as React from "react"
import { Box, Flex, Text, jsx } from "theme-ui"
import { VISITOR_LENSES, type VisitorLens } from "./hero-chat/hero-chat-types"

type SourceLink = { label: string; href: string }
type ChatMessage = { role: "user" | "assistant"; content: string; sources?: SourceLink[] }

const HeroChat = () => {
  const [persona, setPersona] = React.useState<VisitorLens>("AI Researcher")
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/hero-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Hero chat request failed with ${response.status}`)
      }

      const payload = await response.json()
      setMessages((current) => [...current, { role: "assistant", content: payload.text, sources: payload.sources }])
    } catch (_error) {
      setError("Could not reach the assistant. Try again in a moment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divide",
        borderRadius: "16px",
        background: "#FFFFFF",
        p: [4, 5],
        mb: [6, 7],
      }}
    >
      <Text
        sx={{
          display: "inline-block",
          color: "primary",
          fontFamily: "monospace",
          fontSize: 0,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          mb: 3,
        }}
      >
        Ask about the work
      </Text>

      <Flex sx={{ gap: 2, flexWrap: "wrap", mb: 3 }}>
        {VISITOR_LENSES.map((lens) => (
          <Box
            as="button"
            key={lens}
            type="button"
            onClick={() => setPersona(lens)}
            sx={{
              borderRadius: "999px",
              border: "1px solid",
              borderColor: lens === persona ? "primary" : "divide",
              background: lens === persona ? "primary" : "transparent",
              color: lens === persona ? "#ffffff" : "secondary",
              px: 3,
              py: 1,
              fontSize: 0,
              cursor: "pointer",
            }}
          >
            {lens}
          </Box>
        ))}
      </Flex>

      <Box sx={{ display: "grid", gap: 3, mb: 3, minHeight: "8rem" }}>
        {messages.length === 0 ? (
          <Text sx={{ color: "secondary", fontSize: "17px", lineHeight: 1.65 }}>
            Ask about projects, research direction, or what a recruiter, engineer, or researcher should know about
            this work.
          </Text>
        ) : (
          messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                justifySelf: message.role === "user" ? "end" : "start",
                maxWidth: "80%",
                background: message.role === "user" ? "primary" : "muted",
                color: message.role === "user" ? "#ffffff" : "text",
                borderRadius: "12px",
                p: 3,
              }}
            >
              <Text sx={{ fontSize: "17px", lineHeight: 1.6 }}>{message.content}</Text>
              {message.sources && message.sources.length > 0 ? (
                <Flex sx={{ gap: 2, flexWrap: "wrap", mt: 2 }}>
                  {message.sources.map((source) => (
                    <a
                      key={source.href}
                      href={source.href}
                      sx={{
                        fontSize: "0.8rem",
                        color: message.role === "user" ? "#ffffff" : "primary",
                        textDecoration: "underline",
                      }}
                    >
                      {source.label}
                    </a>
                  ))}
                </Flex>
              ) : null}
            </Box>
          ))
        )}
      </Box>

      {error ? <Text sx={{ color: "primary", fontSize: 0, mb: 2 }}>{error}</Text> : null}

      <Flex sx={{ gap: 2 }}>
        <Box
          as="input"
          value={input}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              void sendMessage()
            }
          }}
          placeholder="Ask about the work..."
          sx={{
            flex: 1,
            border: "1px solid",
            borderColor: "divide",
            borderRadius: "8px",
            px: 3,
            py: 2,
            fontSize: "17px",
            background: "transparent",
            color: "text",
          }}
        />
        <Box
          as="button"
          type="button"
          onClick={() => void sendMessage()}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            border: "none",
            background: "primary",
            color: "#ffffff",
            px: 4,
            py: 2,
            fontSize: "17px",
            cursor: loading ? "progress" : "pointer",
          }}
        >
          {loading ? "..." : "Ask"}
        </Box>
      </Flex>
    </Box>
  )
}

export default HeroChat
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `HeroChat.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/world-model/HeroChat.tsx
git commit -m "Add HeroChat multi-turn persona-adaptive chat component"
```

---

### Task 10: Wire HeroChat into the homepage, remove the old Ask My Work CTA

**Files:**
- Modify: `src/components/world-model/HomepageConsole.tsx`

**Interfaces:**
- Consumes: default-exported `HeroChat` from Task 9.

- [ ] **Step 1: Import HeroChat and remove the "Ask My Work" link**

In `src/components/world-model/HomepageConsole.tsx`, add the import near the top (after the existing `data` import):

```ts
import HeroChat from "./HeroChat"
```

Then find this block (the second `<Link>` inside the hero's button `<Flex>`):

```tsx
              <Link
                to="/ask/"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "text",
                  border: "1px solid",
                  borderColor: "divide",
                  px: 3,
                  py: 2,
                  borderRadius: "8px",
                  textDecoration: "none",
                  bg: "transparent",
                  ":hover": {
                    bg: "muted",
                  },
                }}
              >
                Ask My Work
              </Link>
```

Delete that entire `<Link to="/ask/">...</Link>` block, leaving only the `Explore Current Systems` link inside the `<Flex>`.

- [ ] **Step 2: Insert HeroChat right after the hero box**

Find the closing of the hero's outer `<Box>` (the one with the `radial-gradient` background) — it ends with:

```tsx
        </Grid>
      </Box>

      <Grid columns={[1, null, "1.1fr 0.9fr"]} gap={[5, 6]} sx={{ mb: [6, 7] }}>
```

Insert `<HeroChat />` between those two blocks:

```tsx
        </Grid>
      </Box>

      <HeroChat />

      <Grid columns={[1, null, "1.1fr 0.9fr"]} gap={[5, 6]} sx={{ mb: [6, 7] }}>
```

- [ ] **Step 3: Type-check and build**

Run: `npx tsc --noEmit && npx gatsby build`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/world-model/HomepageConsole.tsx
git commit -m "Embed HeroChat in the homepage hero, remove Ask My Work CTA"
```

---

### Task 11: Remove the standalone /ask page and dead code, add a redirect

**Files:**
- Delete: `src/pages/ask.tsx`
- Delete: `src/components/world-model/pages-ask/AskMyWorkPage.tsx`
- Delete: `src/components/world-model/pages-ask/research-context.ts`
- Delete: `src/components/world-model/pages-ask/openrouter.ts`
- Delete: `src/api/ask-my-work.ts`
- Delete: `src/api/research-lens.ts`
- Create: `gatsby-node.ts`

**Interfaces:** none — this task removes superseded code and adds a redirect; nothing later depends on it.

- [ ] **Step 1: Confirm nothing else references the files being deleted**

Run: `grep -rl "pages-ask\|ask-my-work\|research-lens\|AskMyWorkPage" src/ --include="*.ts" --include="*.tsx" | grep -v "src/components/world-model/pages-ask/" | grep -v "src/api/ask-my-work.ts" | grep -v "src/api/research-lens.ts" | grep -v "src/pages/ask.tsx"`
Expected: **`src/components/world-model/ResearchLensPanel.tsx`** — a pre-existing homepage component (unrelated to this plan's Ask My Work removal) that calls `fetch("/api/research-lens", ...)` at runtime via a plain string literal, so it can't be caught by TypeScript imports or a build. Its backing endpoint is deleted in Step 2, so it must be removed too — see Step 6.

- [ ] **Step 2: Delete the superseded files**

```bash
git rm src/pages/ask.tsx
git rm -r src/components/world-model/pages-ask
git rm src/api/ask-my-work.ts
git rm src/api/research-lens.ts
```

- [ ] **Step 3: Add the redirect**

Create `gatsby-node.ts`:

```ts
import type { GatsbyNode } from "gatsby"

export const createPages: GatsbyNode["createPages"] = async ({ actions }) => {
  actions.createRedirect({
    fromPath: "/ask/",
    toPath: "/",
    isPermanent: true,
  })
}
```

- [ ] **Step 4: Build and verify**

Run: `npx gatsby build`
Expected: build succeeds with no errors about missing `/ask` references.

- [ ] **Step 5: Commit**

```bash
git add gatsby-node.ts
git commit -m "Remove standalone /ask page and superseded OpenRouter-based Q&A code, redirect /ask/ to /"
```

- [ ] **Step 6: Remove `ResearchLensPanel`, whose backing API was just deleted**

In `src/components/world-model/HomepageConsole.tsx`, remove the import `import ResearchLensPanel from "./ResearchLensPanel"` and remove the `<ResearchLensPanel />` element (it sits at the top of the "Box" containing the "Research Agenda" card — delete just that line, keeping the surrounding `<Box>...</Box>` and its `Research Agenda` content intact).

Then delete the component file:

```bash
git rm src/components/world-model/ResearchLensPanel.tsx
```

Run: `grep -rn "ResearchLensPanel\|/api/research-lens" src/` — expected: no output.
Run: `npx gatsby build` — expected: succeeds, and the function list no longer includes `research-lens` or `ask-my-work`.

```bash
git add src/components/world-model/HomepageConsole.tsx
git commit -m "Remove ResearchLensPanel: its backing API was deleted in Task 11"
```

---

### Task 12: End-to-end manual verification

**Files:** none — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all tests pass (Tasks 1, 2, 3, 7 test files).

- [ ] **Step 2: Start the dev server**

Run: `CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account-id> npx gatsby develop`
Expected: starts on `http://localhost:8000` with no build errors.

- [ ] **Step 3: Browser check — chat renders and answers**

Open `http://localhost:8000/`. Confirm:
- The HeroChat panel renders below the hero intro, above the "World Model Infrastructure Stack" section.
- Persona chips (AI Researcher, Frontier Lab Recruiter, Founder, Engineer, Open Source Contributor) are visible and clickable.
- Typing "What is embenx?" and pressing Enter returns an answer with at least one source chip linking to `/embenx-python-embedding-toolkit/`.

- [ ] **Step 4: Browser check — multi-turn follow-up**

In the same session, ask a follow-up like "How does that compare to subagent-fleet?" without re-stating context. Confirm the answer references both projects coherently (proves conversation history is being sent).

- [ ] **Step 5: Browser check — persona switch mid-conversation**

Switch persona to "Frontier Lab Recruiter" mid-conversation and ask another question. Confirm the response tone shifts (more impact/signal-oriented) without losing prior conversation context.

- [ ] **Step 6: Browser check — out-of-corpus fallback**

Ask something unrelated, e.g. "What's your favorite pizza topping?" Confirm the response is a graceful fallback (persona fallback text + default source links), not a raw error or a hallucinated answer.

- [ ] **Step 7: Browser check — /ask redirect**

Navigate to `http://localhost:8000/ask/`. Confirm it redirects to `/`.

- [ ] **Step 8: No commit for this task** — if any check fails, fix the relevant earlier task's code and re-verify before considering the plan complete.
