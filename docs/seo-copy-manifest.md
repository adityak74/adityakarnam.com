# SEO Copy Manifest — intent-matching titles and descriptions

Copy-only deliverable. Nothing in `content/` or `src/` was edited. Each block below is
paste-ready MDX frontmatter.

## Rules used

- The theme renders `<title>` as `` `${title} | Aditya Karnam` `` (`node_modules/@lekoarts/gatsby-theme-minimal-blog/src/components/seo.tsx`, line 34). The suffix costs **16 characters**, so every `title` below is budgeted to keep the rendered title at or under 60 chars. Do **not** add the name yourself.
- When frontmatter has no `description`, the theme falls back to `siteDescription` in `gatsby-config.ts` — the generic bio that is currently killing CTR on `/awesome-agentic-memory/`. Every page below therefore gets an explicit `description`.
- Descriptions are 140–160 chars, lead with what the page concretely contains, and use the language from real GSC queries rather than brand language.
- All counts and claims below were checked against the actual page source.

---

## 1. `/awesome-agentic-memory/` — highest-value fix

File: `content/pages/awesome-agentic-memory/index.mdx`

**Old**
- title: `Awesome Agentic Memory` → rendered `Awesome Agentic Memory | Aditya Karnam`
- description: *(none — inherited the sitewide bio)*

**Strategy change (revised after competitive research — see the positioning note at the
end of this document).** The page is *not* losing on rankings: it sits at position 4.6 for
`awesome agent memory` and 6.2 for `awesome ai memory`. It is losing the click next to
`topoteretes/awesome-ai-memory` (835 stars) and three other established lists. Competing as
"another awesome list, but smaller" is unwinnable, and the word "Papers" in my earlier
draft pointed directly at the competitors' strength — every top-8 competitor is a paper
list. The one thing none of them offers is a verdict on *shipping software*. Both options
below therefore pitch practitioner-comparison intent, where the page is unique and where
the long tail (`agent memory framework`, `agent memory systems`, `ai agent memory
database`) currently sits at position 29–60 with room to move.

### Option A — head-term hedge (RECOMMENDED)

```yaml
title: "Awesome Agent Memory: mem0 vs Letta vs Zep"
description: "mem0, Letta, Graphiti and 7 more agent memory frameworks compared by memory type, backend and MCP support, plus 10 MCP servers and 8 vector DBs."
keywords:
  [
    "mem0 alternatives",
    "mem0 vs letta",
    "mem0 vs letta vs zep",
    "best agent memory for production",
    "agent memory framework comparison",
    "which agent memory system to use",
    "mcp memory server comparison",
    "open source memory layer for ai agents",
    "agent memory framework",
    "agent memory systems",
    "ai agent memory database",
    "agentic memory",
    "awesome agent memory",
    "awesome ai memory",
    "awesome memory for agents",
  ]
canonicalUrl: "https://adityakarnam.com/awesome-agentic-memory/"
```

- title chars: **42** (rendered with suffix: **58**)
- description chars: **144**

### Option B — clean practitioner pitch

```yaml
title: "Agent Memory Tools: mem0 vs Letta vs Zep"
description: "Which memory layer to ship in production: 10 frameworks compared by memory type, backend and MCP support, plus 10 MCP servers and 8 vector databases."
keywords:
  [
    "mem0 alternatives",
    "mem0 vs letta vs zep",
    "best agent memory for production",
    "agent memory framework comparison",
    "which agent memory system to use",
    "mcp memory server comparison",
    "open source memory layer for ai agents",
    "agent memory framework",
    "agent memory systems",
    "ai agent memory database",
    "agentic memory",
    "awesome agent memory",
  ]
canonicalUrl: "https://adityakarnam.com/awesome-agentic-memory/"
```

- title chars: **40** (rendered with suffix: **56**)
- description chars: **149**

### Recommendation: Option A

Option A keeps the exact-match token `Awesome Agent Memory` at the front, so the existing
position-4.6 ranking and its 221 monthly impressions are not gambled on a re-crawl, while
the second half of the title does the work the head term cannot: it promises a comparison
between named products. Against an 835-star list titled "Awesome AI Memory", a title that
says `mem0 vs Letta vs Zep` is the only one on the SERP offering a decision rather than a
bibliography — that is exactly the credibility gap being attacked, and it is won by
specificity, not by star count.

Option B is the cleaner practitioner pitch and I would switch to it if the head-term
traffic proves worthless (it converts at roughly nothing today), but dropping "Awesome"
forfeits a page-1 position for a term the page currently owns, in exchange for long-tail
terms it does not yet rank for. Take that trade in Phase 2, after the on-page opinion and
benchmark work lands and there is something to rank *with*.

**Truthfulness check (counted from the page source):** the page carries a Framework
Comparison table whose columns are Framework / Stars / Memory Types / Backend / MCP / Use
Case — so "compared by memory type, backend and MCP support" describes a table that
literally exists. Its rows include mem0, Letta, Graphiti (Zep), Cognee, LangMem,
Supermemory, OMEGA and A-MEM, so `mem0 vs Letta vs Zep` names three products actually on
the page. Section counts: 10 memory frameworks (mem0, Letta, Graphiti, Cognee, A-MEM,
Supermemory, OMEGA, Hindsight, MemOS, Memoripy) · 10 MCP memory servers · 10 agent
frameworks with memory · 8 vector DBs · 4 knowledge-graph backends · 2 featured projects ·
5 research papers · 1 coding-agent quick-reference table.

**Rationale:** the old pair ("Awesome Agentic Memory" + the sitewide bio) matched no
purchase intent and read as a personal blog post. Both new options re-aim at the question
none of the top-8 competitors answers — *which agent memory system should I actually run
in production* — which is the page's only defensible position and where its unique content
(MCP servers, vector DBs, coding-agent table) actually lives.

---

## 2. `/ai-toolkit/prompt-grader/` — the 18.5% CTR benchmark, tightened

File: `content/pages/ai-toolkit/prompt-grader/index.mdx`

**Old**
- title: `Prompt Grader & Rewriter - Analyze and Improve Your AI Prompts` (rendered 77 chars — truncates)
- description: *(none — inherited the sitewide bio)*

**New**

```yaml
title: "Prompt Grader: Score and Rewrite Prompts"
description: "Free browser tool that scores any prompt out of 100 on goal, constraints, output format, evaluation and guardrails, then rewrites it in structured form."
keywords:
  [
    "prompt grader",
    "ai prompt grader",
    "prompt rater",
    "prompt scoring tool",
    "prompt analyzer",
    "prompt rewriter",
    "grade my prompt",
    "prompt quality score",
    "prompt engineering tool",
  ]
canonicalUrl: "https://adityakarnam.com/ai-toolkit/prompt-grader/"
```

- title chars: **40** (rendered: **56**)
- description chars: **152**

**Why this page already works (the pattern to copy):** exact query term is the first word
of the title, followed by the verb the searcher wants ("score", "rewrite"). Keep that.

**Rationale:** the title stops truncating, and the page finally gets a real description
instead of the bio — it now states the scoring rubric (the five criteria the component
actually scores: goal, constraints, output format, evaluation hint, guardrails) and that
it is free and in-browser.

---

## 3. `/mlx-non-determinism-apple-silicon/`

File: `content/posts/mlx_non_determinism/mlx_non_determinism.mdx`

**Old**
- title: `The Hidden Problem With MLX: Why Your Apple Silicon LLM Isn't Reproducible` (rendered 89 chars — heavily truncated)
- description: *(none)*

**New**

```yaml
title: "MLX Non-Determinism on Apple Silicon"
description: "Why identical MLX inputs give different outputs: batch-invariance tests from 512 to 4096 matrices, plus bfloat16, float32 and float16 error behavior."
keywords:
  [
    "mlx non-determinism",
    "mlx batch inference",
    "mlx reproducibility",
    "apple silicon llm inference",
    "mlx batch invariance",
    "metal matmul nondeterminism",
    "mlx bfloat16 float16 precision",
    "deterministic llm inference",
  ]
canonicalUrl: "https://adityakarnam.com/mlx-non-determinism-apple-silicon/"
```

- title chars: **36** (rendered: **52**)
- description chars: **149**

**Rationale:** ranks for `mlx batch inference` but the old title buried "MLX" behind "The
Hidden Problem With" and truncated before the payoff. New copy leads with the exact
technical phrase and promises measured data (matrix-size error table, per-dtype behavior)
rather than a rhetorical hook.

---

## 4. `/manual-sharding-postgres-sql/`

File: `content/posts/postgres_sharding/postgres_sharding.mdx`

**Old**
- title: `Manual Sharding in PostgreSQL: A Step-by-Step Implementation Guide` (rendered 81 chars)
- description: *(none)*

**New**

```yaml
title: "PostgreSQL Sharding Example With FDW"
description: "Manual sharding in plain PostgreSQL, no Citus: shard tables, routing insert and read functions, a unified view, range reads, and insert/read benchmarks."
keywords:
  [
    "postgresql sharding example",
    "postgres sharding tutorial",
    "manual sharding postgres",
    "postgres_fdw sharding",
    "foreign data wrapper sharding",
    "shard postgres without citus",
    "horizontal partitioning postgresql",
    "postgres sharding benchmark",
  ]
canonicalUrl: "https://adityakarnam.com/manual-sharding-postgres-sql/"
```

- title chars: **36** (rendered: **52**)
- description chars: **152**

**Rationale:** the winning query is `postgresql sharding example` — an example-seeking,
copy-paste intent. The old title said "Step-by-Step Implementation Guide", which reads
generic; the new pair names FDW, names the no-Citus constraint, and lists the exact
artifacts on the page (routing functions, unified view, benchmark scripts).

---

## 5. `/embenx-python-embedding-toolkit/`

File: `content/posts/embenx_python_embedding_toolkit_2026-04-05/embenx_python_embedding_toolkit_2026-04-05.mdx`

**Old**
- title: `embenx Guide: The Ultimate Python Library for Vector Search` (rendered 74 chars)
- description: `Learn how embenx provides a unified API for 15+ vector backends like FAISS and pgvector, featuring temporal memory for 71% better retrieval performance.` (150)

**New**

```yaml
title: "embenx: One Python API for 15+ Vector DBs"
description: "embenx gives one Collection API over 15+ vector backends including FAISS, pgvector and Qdrant, plus hybrid search, temporal memory and a built-in MCP server."
keywords:
  [
    "embenx",
    "python vector search library",
    "unified vector database api",
    "faiss pgvector qdrant python",
    "hybrid search python",
    "temporal memory retrieval",
    "agentic memory python",
    "vector search mcp server",
    "rag retrieval library",
  ]
canonicalUrl: "https://adityakarnam.com/embenx-python-embedding-toolkit/"
```

- title chars: **41** (rendered: **57**)
- description chars: **157**

**Rationale:** drops "Ultimate" (unearned superlative, and it pushed the title past
truncation) and leads with the actual differentiator people search for — one API across
many vector backends. Also drops the "71% better retrieval" claim from the meta, since it
is a paper-derived figure and reads as a marketing number in a SERP.

---

## 6. `/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon/`

File: `content/posts/benchmarking_local_llms_ollama_vllm_sglang_apple_silicon_2026-07-08/benchmarking_local_llms_ollama_vllm_sglang_apple_silicon_2026-07-08.mdx`

**Old**
- title: `I Ran Local LLM Evals on an Apple Silicon Mac` (rendered 60)
- description: `I set up Ollama, vLLM Metal, and SGLang on an Apple M5 Pro MacBook Pro, ran a local-serving benchmark and response-quality eval suite across the runtimes, then followed up with a Qwen 3.5 Ollama model sweep from 0.8B to 9B.` (219 — truncates at ~160)

**New**

```yaml
title: "Ollama vs vLLM vs SGLang on Apple Silicon"
description: "Latency and response-quality results for Ollama, vLLM Metal and SGLang on one M5 Pro Mac, plus a Qwen 3.5 sweep from 0.8B to 9B judged by Gemma 4."
keywords:
  [
    "ollama vs vllm",
    "ollama vs sglang",
    "vllm metal apple silicon",
    "local llm benchmark mac",
    "sglang apple silicon",
    "m5 pro llm inference",
    "qwen 3.5 benchmark",
    "local llm serving comparison",
  ]
canonicalUrl: "https://adityakarnam.com/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon/"
```

- title chars: **41** (rendered: **57**)
- description chars: **146**

**Rationale:** the searchable intent is a head-to-head comparison, not a first-person
diary. The old title started with "I Ran", which matches no query; the new one is the
comparison string people type, and the description fits in the SERP window.

---

## 7. `/ai-toolkit/` (hub)

File: `content/pages/ai-toolkit/index.mdx`

**Old**
- title: `AI Toolkit` → rendered `AI Toolkit | Aditya Karnam`
- description: *(none)*

**New**

```yaml
title: "AI Toolkit: Free Prompt Tools, No Signup"
description: "Four browser-based tools that run without an account: a prompt grader and rewriter, a Fable creative-prompt grader, a prompt composer, and a thread generator."
keywords:
  [
    "free ai prompt tools",
    "prompt engineering tools",
    "prompt grader",
    "prompt composer",
    "tweet thread generator",
    "ai tools no signup",
  ]
canonicalUrl: "https://adityakarnam.com/ai-toolkit/"
```

- title chars: **40** (rendered: **56**)
- description chars: **158**

**Rationale:** two-word title matched nothing; the hub now states the category, the count,
and the friction removal ("no signup") that decides clicks on free-tool queries. Verified:
the page links to exactly four tools.

---

## 8. `/ai-toolkit/fable-prompt-grader/`

File: `content/pages/ai-toolkit/fable-prompt-grader/index.mdx`

**Old**
- title: `Fable Prompt Grader - Optimize Creative Writing Prompts for Claude` (rendered 81 chars)
- description: *(none)*

**New**

```yaml
title: "Fable Prompt Grader for Story Prompts"
description: "Scores creative-writing prompts out of 100 on story goal, voice and POV, structure, constraints and length, then returns concise, structured and scene rewrites."
keywords:
  [
    "fable prompt grader",
    "claude fable prompts",
    "creative writing prompt optimizer",
    "story prompt grader",
    "narrative prompt engineering",
    "screenplay prompt tool",
  ]
canonicalUrl: "https://adityakarnam.com/ai-toolkit/fable-prompt-grader/"
```

- title chars: **37** (rendered: **53**)
- description chars: **160**

**Truthfulness check:** the component scores `hasStoryGoal`, `hasVoiceAndPOV`,
`hasStructureArc`, `hasCreativeConstraints`, `hasFormatLength` out of 100 and emits three
rewrites: "Concise Version", "Structured Version", "Scene-by-Scene Version".

**Rationale:** rides the proven `prompt grader` head term while naming the creative niche,
and the description states the exact rubric and the three outputs rather than "optimize".

---

## 9. `/ai-toolkit/intelligent-prompt-composer/`

File: `content/pages/ai-toolkit/intelligent-prompt-composer/index.mdx`

**Old**
- title: `Intelligent Prompt Composer - Supercharge Your AI Conversations` (rendered 78 chars, "supercharge" is filler)
- description: *(none)*

**New**

```yaml
title: "Prompt Composer: Build Structured Prompts"
description: "Compose prompts from four presets - coding, research, product and creative - by filling in goal, constraints, format and guardrails, then copy the result."
keywords:
  [
    "prompt composer",
    "intelligent prompt composer",
    "structured prompt builder",
    "prompt template generator",
    "json prompt builder",
    "prompt engineering tool",
  ]
canonicalUrl: "https://adityakarnam.com/ai-toolkit/intelligent-prompt-composer/"
```

- title chars: **41** (rendered: **57**)
- description chars: **154**

**Truthfulness check:** the component ships four presets — Coding, Research, Product,
Creative.

**Rationale:** replaces a hype phrase with the job the tool does, and names the four
presets so the searcher can tell before clicking whether their use case is covered.

---

## 10. `/ai-toolkit/tweet-thread-generator/`

File: `content/pages/ai-toolkit/tweet-thread-generator/index.mdx`

**Old**
- title: `Tweet Thread Generator - Create Engaging Twitter Threads with AI` (rendered 79 chars)
- description: *(none)*

**New**

```yaml
title: "Tweet Thread Generator: AI Twitter Threads"
description: "Generate Twitter/X threads from any topic using free models like GPT OSS 20B, DeepSeek R1 and Llama 3.3 70B, with viral, educational and business presets."
keywords:
  [
    "tweet thread generator",
    "twitter thread generator ai",
    "x thread generator",
    "free twitter thread writer",
    "ai thread maker",
    "viral tweet generator",
  ]
canonicalUrl: "https://adityakarnam.com/ai-toolkit/tweet-thread-generator/"
```

- title chars: **42** (rendered: **58**)
- description chars: **154**

**Truthfulness check:** the component offers free models (OpenAI GPT OSS 20B, DeepSeek R1,
DeepSeek Chat V3, GLM 4.5 Air, Kimi K2, Llama 3.3 70B) and style presets Viral Tech,
Educational, Business, Startup.

**Rationale:** "Create Engaging ... with AI" is category filler that every competitor also
writes. Naming the free models and the presets is the differentiator on a crowded
free-tool SERP.

---

## Character count summary

| Page | title | rendered (+16) | description |
| --- | --- | --- | --- |
| `/awesome-agentic-memory/` (Option A, recommended) | 42 | 58 | 144 |
| `/awesome-agentic-memory/` (Option B) | 40 | 56 | 149 |
| `/ai-toolkit/prompt-grader/` | 40 | 56 | 152 |
| `/mlx-non-determinism-apple-silicon/` | 36 | 52 | 149 |
| `/manual-sharding-postgres-sql/` | 36 | 52 | 152 |
| `/embenx-python-embedding-toolkit/` | 41 | 57 | 157 |
| `/benchmarking-local-llms-.../` | 41 | 57 | 146 |
| `/ai-toolkit/` | 40 | 56 | 158 |
| `/ai-toolkit/fable-prompt-grader/` | 37 | 53 | 160 |
| `/ai-toolkit/intelligent-prompt-composer/` | 41 | 57 | 154 |
| `/ai-toolkit/tweet-thread-generator/` | 42 | 58 | 154 |

All rendered titles are ≤ 58 chars. All descriptions are within 140–160.

Every `canonicalUrl` above ends in a trailing slash to match `trailingSlash: 'always'` in
`gatsby-config.ts`. A canonical without the slash points at a URL that redirects, which
wastes the signal.

`/ai-era-technology-leaders-redefining-success-productivity/` was dropped from this
manifest — it is an autoblog post being deleted from the repo, so its copy is moot.

## Implementation note for whoever owns the plumbing

`description` must actually reach `<Seo />` for these to take effect. Post templates pass
it today (`embenx` and the benchmarking post already render custom descriptions); confirm
the **page** template (`content/pages/**`) forwards `description` from frontmatter before
shipping, otherwise `/awesome-agentic-memory/` and the four `/ai-toolkit/` pages will keep
serving the sitewide bio no matter what this manifest says.

---

## Positioning note for `/awesome-agentic-memory/` (input to Phase 2)

Copy alone will not fix this page. The competitive picture:

| Repo | Stars |
| --- | --- |
| topoteretes/awesome-ai-memory | 835 |
| TsinghuaC3I/Awesome-Memory-for-Agents | 631 |
| TeleAI-UAGI/Awesome-Agent-Memory | 575 |
| AgentMemoryWorld/Awesome-Agent-Memory | 183 |
| **aviskaar/awesome-agentic-memory** (the repo this page mirrors) | **0** |

In a live search for "awesome agent memory" the page ranked **last**, below eight GitHub
repos. There are 10+ established competitors, several from research labs.

**This is a credibility gap, not a rankings gap.** GSC says the page is already page 1 for
the head terms (position 4.6 on `awesome agent memory`, 6.2 on `awesome ai memory`). It
gets seen and passed over, because next to an 835-star repo a zero-star mirror reads as the
lesser copy. Meanwhile the practitioner long tail — `agent memory framework`, `agent memory
systems`, `ai agent memory database` — sits at position 29–60, unclaimed.

**The differentiator:** every top competitor is a paper list — taxonomies, architecture,
retrieval, forgetting, consolidation. Purely academic. This page catalogs *shipping
software*: 10 MCP servers, 8 vector DBs, 10 agent frameworks, a coding-agent comparison
table. **Nobody in the top 8 answers "which agent memory system should I actually use in
production, and why."**

**Recommendation for Phase 2:** stop competing on list length and start competing on
judgment. A longer list loses to 835 stars; a verdict does not, because the 835-star list
does not have one. Concretely, the page needs:

1. **An opinion.** A short "what I'd actually ship" verdict at the top — default pick,
   when to pick the graph-backed option instead, what to avoid — with reasons.
2. **Benchmarks or first-hand notes.** Even a small, honest comparison run (recall,
   latency, token cost, setup friction across three or four frameworks) is content no
   competitor on that SERP has. This is the single highest-leverage addition.
3. **Head-to-head sections** on the queries practitioners type: `mem0 vs Letta vs Zep`,
   `mem0 alternatives`, `mcp memory server comparison`. These are the terms the revised
   copy in entry 1 points at, and they need real page sections to land on.
4. **Deprecate the star badge and any "most comprehensive" claim.** Both invite the exact
   comparison the page loses. (On-page badge removal is being handled separately.)

Sequencing matters: ship the entry-1 Option A copy now to recover CTR on traffic the page
already has, then do the opinion-and-benchmark work, and only then consider Option B's
cleaner practitioner title — by that point the page will have something to rank with.
