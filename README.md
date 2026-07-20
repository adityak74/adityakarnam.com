# adityakarnam.com

Source for [adityakarnam.com](https://adityakarnam.com) — Aditya Karnam's personal site and running lab notebook. It's built less like a portfolio and more like a "world model": a set of linked pages (`/systems`, `/stack`, `/field-notes`, `/now`, `/about`) that track what's being built, the research questions behind it, and how it's evolving over time.

---

## What's on the site

- **[Systems](https://adityakarnam.com/systems/)** — public projects framed as evidence: research question, what was built, why it matters, with source links, not just a list of repos.
- **[Stack](https://adityakarnam.com/stack/)** and **[Field Notes](https://adityakarnam.com/field-notes/)** — the current research agenda and in-progress investigations, kept current rather than archived once-and-done.
- **[Now](https://adityakarnam.com/now/)** / **[About](https://adityakarnam.com/about/)** — current focus and background.
- **Hero chat** — a retrieval-augmented chat assistant on the homepage (`functions/api/hero-chat.ts`) that answers questions about the work using the site's own content as grounding, with persona support and multi-turn conversation.
- **[AI Toolkit](https://adityakarnam.com/ai-toolkit/)** — small standalone tools: an [Intelligent Prompt Composer](https://adityakarnam.com/ai-toolkit/intelligent-prompt-composer), a [Prompt Grader & Rewriter](https://adityakarnam.com/ai-toolkit/prompt-grader), and a [Tweet Thread Generator](https://adityakarnam.com/ai-toolkit/tweet-thread-generator).
- **[Portfolio MCP](https://adityakarnam.com/mcp-install/)** — a hosted, read-only [Model Context Protocol](https://modelcontextprotocol.io) server (`/mcp`) that lets MCP clients query the site's projects and recent work as structured data.
- **Blog** — technical writing on AI/ML, agentic systems, Rust, and distributed systems, syndicated to [DZone](https://dzone.com/users/5236541/adityakarnam.html), [Medium](https://medium.com/@adityakarnam), and [Level Up Coding](https://levelup.gitconnected.com/@adityakarnam).

## Architecture

- **[Gatsby 5](https://www.gatsbyjs.com/)** + **TypeScript** on top of [`@lekoarts/gatsby-theme-minimal-blog`](https://github.com/LekoArts/gatsby-themes/tree/main/themes/gatsby-theme-minimal-blog), with the theme's components shadowed under `src/@lekoarts/` where custom behavior is needed.
- Content lives in `content/posts` (MDX blog posts) and `content/pages`; structured "world model" data (systems, research agenda, field notes) lives in `src/components/world-model/data.ts` as typed, versionable data rather than freeform MDX.
- Deployed on **Cloudflare Pages**, git-integrated — every push builds and deploys automatically. Server-side behavior (hero chat, RAG retrieval) runs as **Cloudflare Pages Functions** under `functions/`.
- An **AI Search / RAG corpus** is synced from site content (systems, project pages, posts) to Cloudflare's managed AI Search via `scripts/sync-rag-corpus.mjs`, which backs the hero chat assistant with retrieval over the site's own public content.

## Research

- **ERBGA** (Efficient Reduced-Bias Genetic Algorithm) — a novel genetic algorithm for generic community detection objectives; winner of a Master's research prize at UMSL.
- Published as "Efficient Reduced-Bias Genetic Algorithm (ERBGA) for Generic Community Detection Objectives."

## Local development

```bash
npm install
npm run develop  # dev server at localhost:8000
npm run build    # production build
npm run serve    # serve the production build locally
npm test         # vitest
```

Other scripts:

```bash
npm run clean            # clear the Gatsby cache
npm run sync:rag-corpus  # manually trigger a RAG corpus sync (requires Cloudflare credentials)
```

## Connect

- [LinkedIn](https://www.linkedin.com/in/adityakarnamgrao/)
- [X (Twitter)](https://twitter.com/aditya_karnam)
- [GitHub](https://github.com/adityak74)
- [Google Scholar](https://scholar.google.com/citations?user=WujCeDkAAAAJ&hl=en)

---

© 2026 Aditya Karnam
