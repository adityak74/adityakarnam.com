import { describe, it, expect, beforeAll, afterAll } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { discoverPosts, loadProjectPages, discoverSources } from "./discover-content.mjs"

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

describe("loadProjectPages", () => {
  it("loads the real project-pages fixture with 5 entries", () => {
    const pages = loadProjectPages()

    expect(pages).toHaveLength(5)
    expect(pages.map((page) => page.slug)).toContain("subagent-fleet-local-ai-compute-control-plane")
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
    expect(sources.some((source) => source.slug === "subagent-fleet-local-ai-compute-control-plane")).toBe(true)
  })
})
