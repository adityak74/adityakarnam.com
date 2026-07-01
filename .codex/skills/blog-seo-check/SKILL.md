---
name: blog-seo-check
description: Use after drafting an adityakarnam.com blog post to validate title, description, slug, headings, links, image alt text, canonical URL, frontmatter, and AI citation structure.
---

# Blog SEO Check

Run a focused post-publication readiness check.

## Checklist

| Area | Pass Criteria |
| --- | --- |
| Title | specific, non-generic, readable in search results |
| Description | concrete value prop, roughly 140-170 chars, no stuffing |
| Slug | lowercase, hyphenated, concise, no date segment |
| Canonical | absolute `https://adityakarnam.com/.../` and matches slug |
| Headings | logical H2/H3 hierarchy, scan-friendly, no skipped levels |
| Internal Links | relevant links to existing site pages/posts when natural |
| External Links | GitHub/docs/source links are accurate and stable |
| Images | local assets exist, descriptive alt text, useful captions if needed |
| Code Blocks | fenced blocks render as blocks, not inline-code pills |
| AI Citation | sections include direct answers, named entities, tables/FAQ where helpful |

## Output

```markdown
## SEO Validation Report

**Overall:** PASS / NEEDS WORK / FAIL

| Check | Status | Details | Fix |
| --- | --- | --- | --- |

### Priority Fixes
1. ...
```

For this repo, always run `npm run build` after structural/frontmatter/image changes.
