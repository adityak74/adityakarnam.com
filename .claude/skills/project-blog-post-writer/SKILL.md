---
name: project-blog-post-writer
description: Use when writing a new project blog post for Aditya Karnam's Gatsby/MDX site, especially when the user provides adityakarnam.com plus a local project repo, GitHub URL, docs URL, or asks to create a blog post and PR without repeating publishing details.
---

# Project Blog Post Writer

## Purpose

Write original project announcement/deep-dive posts for `adityakarnam.com` without asking the user to repeat the site structure, style, or validation workflow.

## Workflow

1. Read local instructions first, especially `AGENTS.md` and `/Users/adityakarnam/.codex/RTK.md` when referenced. Use `rtk` for shell commands.
2. Confirm the target site path. Default to `/Users/adityakarnam/Projects/adityakarnam.com` and posts under `content/posts/`.
3. Inspect the most recent hand-written/reference post before drafting. Prefer:
   - `content/posts/ai-blog-generator-n8n-results/ai-blog-generator-n8n-results.mdx`
   - then other recent project posts if needed.
4. Inspect the project being written about:
   - `README.md`, `docs/index.md`, `mkdocs.yml`, examples, screenshots, and release/status notes.
   - Use provided GitHub/docs URLs in the post, but rely on local repo content first when available.
5. Create a new dated post directory under `content/posts/`:
   - folder/file pattern: `<topic_slug>_YYYY-MM-DD/<topic_slug>_YYYY-MM-DD.mdx`
   - slug pattern: `/short-readable-project-slug`
6. Reuse a real project image when available:
   - copy one relevant screenshot into the post directory.
   - use `banner: "./image.png"` in frontmatter when suitable.
   - include the image in the post body with descriptive alt text.
7. Draft MDX in Aditya's project-post style:
   - first-person build story
   - clear problem, why it matters, what was built, how it works, current status, quickstart, and next steps
   - practical technical details over generic marketing copy
   - links to GitHub, docs, and relevant internal pages when useful
   - concise but substantial, usually 1,500-2,500 words
8. Validate:
   - run `npm run build`.
   - if Gatsby tries to write outside the sandbox, rerun with `XDG_CONFIG_HOME` inside the repo and `GATSBY_TELEMETRY_DISABLED=1`.
   - report existing non-blocking warnings separately from actual failures.
9. If the user asks for a PR:
   - create a branch scoped to the post, commit only the new post assets and requested skill files, push, and open a GitHub PR.
   - do not include temporary validation folders in the commit.

## Frontmatter Template

```mdx
---
title: "Project Name: Concrete Value Proposition"
description: "One sentence describing what was built, who it is for, and why it matters."
date: YYYY-MM-DD
slug: "/project-name-readable-slug"
canonicalUrl: "https://adityakarnam.com/project-name-readable-slug/"
banner: "./screenshot.png"
keywords:
  [
    "project name",
    "primary topic",
    "technology",
    "use case",
  ]
tags:
  - ai
  - agents
  - open-source
---
```

Use `coverImage`/`ogImage` instead of `banner` only if the reference post pattern clearly calls for it.

## Quality Bar

- Make the post sound like the project author, not a press release.
- Do not invent metrics, release numbers, tests, or installation commands. Verify from the project.
- Prefer concrete architecture, commands, generated files, and screenshots.
- Keep claims defensible and link to the project repo/docs.
- Build before finishing.
