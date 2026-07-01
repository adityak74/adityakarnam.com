---
name: blog-schema
description: Use to recommend or generate JSON-LD structured data for adityakarnam.com blog posts, including BlogPosting, Person, Organization, BreadcrumbList, FAQPage, and ImageObject where appropriate.
---

# Blog Schema

Generate schema recommendations for Gatsby/MDX blog posts. The site may not currently inject per-post JSON-LD, so treat this as a recommendation or implementation task depending on the user's request.

## Extract

From the target post, collect:

- title/headline
- description
- date published and modified
- canonical URL
- author name and sameAs links
- banner/cover image
- tags/keywords
- FAQ questions and answers, if present
- word count estimate

## Preferred Graph

Use a single JSON-LD `@graph` with stable IDs:

- `BlogPosting`
- `Person`
- `Organization`
- `WebPage`
- `BreadcrumbList`
- `ImageObject`
- `FAQPage` only when the post has a real FAQ section

## Validation Rules

- `headline` under 110 characters.
- `datePublished` and `dateModified` use ISO dates.
- `mainEntityOfPage` points at canonical URL.
- `author` and `publisher` use stable `@id` references.
- Image URL should be absolute in published schema.
- Do not add fake FAQ items only for schema.

If asked to implement schema in Gatsby, inspect the existing theme/head setup first and keep changes scoped.
