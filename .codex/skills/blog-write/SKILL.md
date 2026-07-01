---
name: blog-write
description: Use to write a new adityakarnam.com Gatsby/MDX blog post from a topic, project repo, brief, outline, or source material, with SEO-aware frontmatter, practical first-person writing, internal links, and build validation.
---

# Blog Write

Write complete MDX posts for `adityakarnam.com`. Adapted from `AgriciDaniel/claude-blog` writing workflow, but customized for Codex and this Gatsby repo.

## Workflow

1. Read repo instructions and inspect the latest relevant post for style.
2. Gather source material:
   - local project README/docs/examples for project posts
   - user-provided notes, URLs, screenshots, or metrics
   - existing posts for internal link opportunities
3. Choose post type:
   - project deep dive
   - technical tutorial
   - experiment/results post
   - opinion/thought-leadership
   - tool launch/update
4. Create the post under `content/posts/<slug>_YYYY-MM-DD/<slug>_YYYY-MM-DD.mdx`.
5. Use frontmatter matching the site:

```mdx
---
title: "Clear, Specific Title"
description: "One sentence with the post's concrete value."
date: YYYY-MM-DD
slug: "/short-readable-slug"
canonicalUrl: "https://adityakarnam.com/short-readable-slug/"
banner: "./image.png"
keywords:
  [
    "primary keyword",
    "secondary keyword",
  ]
tags:
  - ai
  - agents
---
```

6. Write in a first-person, practical style:
   - explain the real problem
   - show what was built or learned
   - include commands, architecture, screenshots, or numbers when available
   - make limitations explicit
   - avoid press-release phrasing
7. Use fenced code blocks for commands/configs; ensure the site builds.
8. Run `npm run build`; use sandbox-safe Gatsby env vars if needed.

## Quality Bar

- Do not invent metrics, release numbers, benchmarks, or install commands.
- Prefer original observations over generic SEO prose.
- Include a direct GitHub/docs link when writing about a project.
- Use local screenshots/assets when available.
- Keep title, slug, and description aligned.
