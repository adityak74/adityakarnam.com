import { describe, expect, it } from "vitest"
import { collectThoughtsPosts } from "../../../../scripts/generate-thoughts-data.mjs"
import { THOUGHTS_POSTS } from "./thoughts-posts"

describe("THOUGHTS_POSTS", () => {
  it("is in sync with content/posts (run `npm run build:mcp-data` after adding, editing, or removing a post)", () => {
    expect(THOUGHTS_POSTS).toEqual(collectThoughtsPosts())
  })

  it("excludes autoblog posts, matching what /blog/ renders", () => {
    for (const post of THOUGHTS_POSTS) {
      expect(post.tags.map((tag) => tag.toLowerCase())).not.toContain("autoblog")
    }
  })

  it("carries the fields MCP clients need", () => {
    expect(THOUGHTS_POSTS.length).toBeGreaterThan(0)
    for (const post of THOUGHTS_POSTS) {
      expect(post.slug).toBeTruthy()
      expect(post.title).toBeTruthy()
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.url).toMatch(/^https:\/\/adityakarnam\.com\//)
      expect(post.body.length).toBeGreaterThan(0)
      expect(post.description.length).toBeGreaterThan(0)
    }
  })

  it("covers posts that derive their slug from the title instead of frontmatter", () => {
    // These three carry no `slug` in frontmatter (and a stale `canonicalUrl` that 404s),
    // so they are only reachable if the generator uses the theme's slugify.
    const slugs = THOUGHTS_POSTS.map((post) => post.slug)
    expect(slugs).toContain("prompt-grader-vs-prompt-libraries-when-to-use-each")
    expect(slugs).toContain("how-to-diagnose-a-bad-prompt-with-free-grader-tool")
    expect(slugs).toContain("unlock-your-true-purpose-ancient-wisdom-for-a-meaningful-life-stop-postponing-yourself")
  })

  it("derives every URL from the published slug", () => {
    for (const post of THOUGHTS_POSTS) {
      expect(post.url).toBe(`https://adityakarnam.com/${post.slug}/`)
    }
  })

  it("is sorted newest first", () => {
    const dates = THOUGHTS_POSTS.map((post) => post.date)
    expect(dates).toEqual([...dates].sort((left, right) => right.localeCompare(left)))
  })

  it("strips MDX imports out of post bodies", () => {
    for (const post of THOUGHTS_POSTS) {
      expect(post.body).not.toMatch(/^\s*import\s.+from\s+["']/m)
    }
  })
})
