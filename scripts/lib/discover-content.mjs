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
