# Coding Harness Article and Portfolio Publishing Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the completed book, a standalone technical article, and coherent discovery paths across the portfolio.

**Architecture:** Shared book metadata drives the landing page and its tests. The article is an MDX tutorial with local assets, while small targeted links connect the existing Quecto project and prior articles to the book without creating a duplicate project entry.

**Tech Stack:** Gatsby 5, React 18, TypeScript, Theme UI, MDX, Vitest, existing portfolio primitives and content-generation scripts.

**Spec:** `docs/superpowers/specs/2026-10-02-building-a-coding-agent-harness-book-design.md`

## Global Constraints

- Execute after the final PDF plan passes.
- Reuse `ConsoleShell`, `SectionBlock`, `ConsoleCard`, `HeroStat`, `SignalPill`, and existing site colors.
- Keep the direct PDF open/download path usable without the embedded reader.
- Do not add a duplicate Quecto project; update the existing `/quecto/` page and links.
- The companion article is a useful 2,500-3,500 word tutorial, not a launch announcement or condensed table of contents.
- Use local cover/diagram assets and meaningful alternative text.
- No global navigation, homepage, account, email gate, checkout, or custom JavaScript PDF renderer.

## Review Focus

- Mobile browsers that cannot embed PDFs must still expose obvious open and download actions; Task 2 pins link presence outside the iframe.
- Missing PDF or cover assets must fail a site-content test before Gatsby build; Task 1 pins both.
- The article must not duplicate more than brief passages from existing posts; Task 3 includes a similarity/editorial audit.
- Every book route must use one canonical trailing-slash URL and correct metadata; Tasks 2-3 pin canonical paths.
- Generated portfolio/RAG data must remain in sync after adding the article; Task 4 regenerates and tests it.

---

## File Structure

```text
src/components/books/coding-agent-harness.ts
src/components/books/coding-agent-harness.test.ts
src/pages/building-a-coding-agent-harness.tsx
content/posts/building_coding_agent_harness_2026-10-02/
├── building-coding-agent-harness.mdx
└── coding-agent-harness-loop.svg
```

Existing files modified:

```text
src/pages/quecto.tsx
src/pages/ai-research.tsx
content/posts/what_is_an_ai_agent_harness_2026-07-22/what-is-an-ai-agent-harness.mdx
content/posts/building_quecto_from_minimal_harness_to_evaluable_agent_2026-07-25/building_quecto_from_minimal_harness_to_evaluable_agent_2026-07-25.mdx
src/components/portfolio-mcp/generated/thoughts-posts.ts
```

### Task 1: Synchronize Baseline and Add Shared Book Metadata

**Files:**
- Create: `src/components/books/coding-agent-harness.ts`
- Create: `src/components/books/coding-agent-harness.test.ts`
- Modify: `src/components/portfolio-mcp/generated/thoughts-posts.ts` through its generator.

**Interfaces:**
- Produces: `CODING_HARNESS_BOOK` with title, subtitle, description, pathname, PDF URL, cover URL, article pathname, repository URL, page count, edition, chapters, and audience.

- [ ] **Step 1: Regenerate the already-stale portfolio post index**

Run: `npm run build:mcp-data`
Expected: the existing sync test returns to green before book content is added.

- [ ] **Step 2: Write failing metadata and asset tests**

Assert canonical paths, final PDF and cover existence, 70-80 page metadata matching `pdfinfo` output, unique chapter numbers, and all action URLs.

- [ ] **Step 3: Run focused tests and confirm RED**

Run: `npx vitest run src/components/books/coding-agent-harness.test.ts`
Expected: test fails because metadata module is absent.

- [ ] **Step 4: Implement shared metadata**

Export a frozen object and typed chapter records; page and edition values must come from the built artifact/release metadata, not placeholder copy.

- [ ] **Step 5: Run tests and commit**

Run: `npm test`
Expected: all site tests pass.

```bash
git add src/components/books src/components/portfolio-mcp/generated/thoughts-posts.ts
git commit -m "feat(book): add shared publishing metadata"
```

### Task 2: Book Landing and Reading Page

**Files:**
- Create: `src/pages/building-a-coding-agent-harness.tsx`
- Modify: `src/components/books/coding-agent-harness.test.ts`

**Interfaces:**
- Consumes: `CODING_HARNESS_BOOK` and existing console primitives.
- Produces: `/building-a-coding-agent-harness/` with cover, promise, audience, TOC, actions, PDF reader, mobile fallback, and SEO.

- [ ] **Step 1: Extend tests for page content contracts**

Assert the source uses metadata constants, contains direct open and download anchors outside the iframe, names all five actions, and provides the iframe title.

- [ ] **Step 2: Implement the page**

Follow the existing field-guide page's native iframe approach, but add a cover-led hero, chapter list, reader outcome, edition/page metadata, and action hierarchy.

- [ ] **Step 3: Run focused tests and Gatsby build**

Run: `npx vitest run src/components/books/coding-agent-harness.test.ts && npm run build`
Expected: page is generated at the canonical route and assets resolve.

- [ ] **Step 4: Inspect desktop and mobile renders**

Check 1440px and 375px widths for cover scale, CTA wrapping, TOC readability, and reader fallback.

- [ ] **Step 5: Commit**

```bash
git add src/pages/building-a-coding-agent-harness.tsx src/components/books/coding-agent-harness.test.ts
git commit -m "feat(book): add coding harness reader page"
```

### Task 3: Standalone Companion Tutorial

**Files:**
- Create: `content/posts/building_coding_agent_harness_2026-10-02/building-coding-agent-harness.mdx`
- Create: `content/posts/building_coding_agent_harness_2026-10-02/coding-agent-harness-loop.svg`

**Interfaces:**
- Consumes: completed manuscript, final cover, reference-harness source, and existing related articles.
- Produces: canonical article `/building-a-coding-agent-harness-from-scratch/`.

- [ ] **Step 1: Use the blog-write workflow to draft the 2,500-3,500 word tutorial**

Cover the bounded loop, typed tools, policy gate, verification gate, one runnable excerpt, one diagram, and a compact end-to-end mental model. Link to the PDF, book page, Quecto repository, and existing foundational/deep-dive posts.

- [ ] **Step 2: Audit specificity and duplication**

Confirm claims are supported by the book or pinned Quecto source and that the article does not reproduce long passages from existing posts.

- [ ] **Step 3: Run blog SEO and schema workflows**

Validate title, description, slug, headings, keywords, internal links, FAQ usefulness, and Article/TechArticle schema recommendations.

- [ ] **Step 4: Run content tests and build**

Run: `npm run build:mcp-data && npm test && npm run build`
Expected: MDX compiles, assets exist, and generated content stays in sync.

- [ ] **Step 5: Commit**

```bash
git add content/posts/building_coding_agent_harness_2026-10-02 src/components/portfolio-mcp/generated/thoughts-posts.ts
git commit -m "docs(blog): publish coding harness tutorial"
```

### Task 4: Quecto and Research Discovery Links

**Files:**
- Modify: `src/pages/quecto.tsx`
- Modify: `src/pages/ai-research.tsx`
- Modify: `content/posts/what_is_an_ai_agent_harness_2026-07-22/what-is-an-ai-agent-harness.mdx`
- Modify: `content/posts/building_quecto_from_minimal_harness_to_evaluable_agent_2026-07-25/building_quecto_from_minimal_harness_to_evaluable_agent_2026-07-25.mdx`
- Modify: `src/components/books/coding-agent-harness.test.ts`
- Modify: `src/components/portfolio-mcp/generated/thoughts-posts.ts` through its generator.

**Interfaces:**
- Consumes: final book and article routes.
- Produces: prominent, non-duplicative discovery paths from Quecto, AI Research, and both existing posts.

- [ ] **Step 1: Add failing discovery-link tests**

Read the four source files and assert each contains the canonical book route; assert `/quecto/` and `/ai-research/` also contain the article route where the context calls for it.

- [ ] **Step 2: Add the links with context-specific copy**

Use one featured book card on AI Research, one book CTA on Quecto, and short editorial notes in the two posts. Do not add a duplicate project record.

- [ ] **Step 3: Regenerate derived content and run the complete site validation**

Run: `npm run build:mcp-data && npm test && npm run build`
Expected: all tests pass and Gatsby emits the book and article routes.

- [ ] **Step 4: Verify built output**

Check generated HTML for canonical metadata, cover alt text, direct PDF link, article link, Quecto link, and no broken local asset references.

- [ ] **Step 5: Commit**

```bash
git add src/pages/quecto.tsx src/pages/ai-research.tsx content/posts/what_is_an_ai_agent_harness_2026-07-22 content/posts/building_quecto_from_minimal_harness_to_evaluable_agent_2026-07-25 src/components/books/coding-agent-harness.test.ts src/components/portfolio-mcp/generated/thoughts-posts.ts
git commit -m "feat(book): connect coding harness publishing paths"
```

### Task 5: Whole-Project Release Verification

**Files:**
- Modify only files implicated by verification defects.

**Interfaces:**
- Consumes: all four implementation plans.
- Produces: a release-ready book branch with one verified PDF, article, page, reference harness, and discovery graph.

- [ ] **Step 1: Run reference implementation validation**

Run: `cargo fmt --manifest-path books/building-a-coding-agent-harness/examples/reference-harness/Cargo.toml --check && cargo clippy --manifest-path books/building-a-coding-agent-harness/examples/reference-harness/Cargo.toml --all-targets -- -D warnings && cargo test --manifest-path books/building-a-coding-agent-harness/examples/reference-harness/Cargo.toml`
Expected: all checks pass.

- [ ] **Step 2: Run manuscript, PDF, and site validation**

Run: `npm run validate:book && python3 -m unittest discover -s books/building-a-coding-agent-harness/tests && python3 books/building-a-coding-agent-harness/pdf/preflight.py static/books/building-a-coding-agent-harness.pdf && npm test && npm run build`
Expected: all validators, tests, preflight checks, and Gatsby build pass.

- [ ] **Step 3: Perform final visual checks**

Inspect every PDF page plus the book page and article at desktop/mobile sizes; fix and repeat the relevant complete validation command after any change.

- [ ] **Step 4: Confirm git scope and commit final corrections**

Run: `git status --short && git diff --check`
Expected: only intentional book, article, and publishing files are present; whitespace check passes.

```bash
git add <only corrected files>
git commit -m "chore(book): complete release verification"
```
