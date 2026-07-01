---
name: blog
description: Use as the Codex blog orchestration skill for adityakarnam.com. Routes blog writing, briefs, outlines, rewrites, quality analysis, SEO checks, schema generation, and project-post workflows across the repo-local Codex blog skills.
---

# Blog

Codex-native blog orchestration for `adityakarnam.com`, adapted from the workflow ideas in `AgriciDaniel/claude-blog` for this Gatsby/MDX repo.

## Routing

Use the narrowest matching skill:

- `blog-write`: write a new MDX post from a topic, project repo, brief, or outline.
- `blog-brief`: create a content brief, outline, keyword plan, and source plan.
- `blog-analyze`: score an existing post for content quality, SEO, E-E-A-T, technical quality, and AI citation readiness.
- `blog-seo-check`: run post-writing SEO validation.
- `blog-schema`: generate or review JSON-LD schema recommendations.
- `project-blog-post-writer`: write project announcement/deep-dive posts for this site from local repos.

If the user says "use the blog skill" without a specific action, infer the likely route from their request and proceed. Ask only when the action cannot be inferred.

## Site Defaults

- Site repo: `/Users/adityakarnam/Projects/adityakarnam.com`
- Post root: `content/posts/`
- Most recent style reference: `content/posts/ai-blog-generator-n8n-results/ai-blog-generator-n8n-results.mdx`
- Project-post style reference: use the latest project/tool post when available.
- Frontmatter convention: `title`, `description`, `date`, `slug`, `canonicalUrl`, optional `banner` or `coverImage`, `keywords`, `tags`.
- Validation: run `npm run build`; if Gatsby writes outside the sandbox, rerun with `XDG_CONFIG_HOME` inside the repo and `GATSBY_TELEMETRY_DISABLED=1`.

## Delivery Gates

Before finishing a major blog deliverable, check:

1. **Format**: valid MDX, frontmatter matches the repo, images are local or stable URLs.
2. **Content**: specific, useful, first-hand where possible, no unsupported claims.
3. **SEO**: title/description/slug are clear, internal links are relevant, headings are scan-friendly.
4. **AI Citation**: direct answers, named entities, concise extractable sections, FAQ when appropriate.
5. **Asset Integrity**: referenced files exist; local images build.

Do not include upstream community footers or Claude-specific command text in generated site content.
