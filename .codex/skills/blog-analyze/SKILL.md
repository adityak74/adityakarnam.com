---
name: blog-analyze
description: Use to audit an existing adityakarnam.com blog post for quality, SEO, E-E-A-T, technical correctness, AI citation readiness, and concrete improvement recommendations.
---

# Blog Analyze

Review a post as an editor and technical reviewer. Prioritize fixes over praise.

## Scoring

Score out of 100:

| Category | Points | What to Check |
| --- | ---: | --- |
| Content Quality | 30 | useful thesis, clarity, originality, concrete examples, paragraph length |
| SEO | 25 | title, description, slug, headings, keyword fit, internal links |
| E-E-A-T | 15 | first-hand experience, named sources, author/project credibility |
| Technical | 15 | MDX validity, images, tables, code blocks, schema/frontmatter |
| AI Citation Readiness | 15 | answer-first sections, entity clarity, quotable passages, FAQ/table structure |

## Workflow

1. Read the target post and nearby/latest posts for style context.
2. Check frontmatter fields and slug/canonical consistency.
3. Review headings, links, images, tables, and code blocks.
4. Flag unsupported claims, invented numbers, generic phrasing, and stale details.
5. Produce:

```markdown
## Blog Quality Report

**Score:** X/100

### Findings
| Severity | Issue | Location | Fix |
| --- | --- | --- | --- |

### Recommended Edits
1. ...

### Build/Validation Notes
...
```

Use file/line references where possible.
