# Phase 2 Content Plan — Apple Silicon / Local Inference Cluster

Date: 2026-08-11
Scope: the MLX / Apple Silicon / local-LLM-serving topic cluster only.
Status: plan. No articles written, no content files touched.

---

## 0. Premise

This cluster is the site's only proven organic vein. `mlx_non_determinism` did 11,919 lifetime
impressions (the post says so itself) and the cluster surfaces for eleven distinct MLX queries
without any promotion. All eleven show 0 clicks, which is attributable to the now-fixed sitewide
meta-description bug, so **position is the signal and impressions are the demand estimate**.

Two structural facts about the demand shape drive this plan:

1. **The queries are engineering-shaped, not buyer-shaped.** `mlx long context performance drop
   apple silicon kv cache` is a hypothesis, not a keyword. People typing that already know what a
   KV cache is. Generic "how to run LLMs on your Mac" content will not convert them.
2. **The incumbent answers live in GitHub Discussions and arXiv preprints, not articles.** That is
   the entire opportunity. See §1.

There is also a hard timing factor: **Ollama switched its Apple Silicon backend to MLX in v0.19
(March 30, 2026)**, which merges two previously separate topics on this site — the Ollama
benchmarking post and the MLX posts are now about the same runtime. That is a freshness window
worth moving on.

---

## 1. Competitive findings, query by query

### 1.1 `mlx long context performance drop apple silicon kv cache` — 36 imp, pos 13.5

**Highest demand in the cluster. Weakly served. This is the flagship gap.**

What currently occupies this space:

| Source | Type | Quality | Gap |
|---|---|---|---|
| [mlx Discussion #3209](https://github.com/ml-explore/mlx/discussions/3209) — "Systematic inference benchmarks: 5 models x 6 quants x 7 context lengths on M3 Ultra" | GitHub Discussion | Genuinely excellent data, 276 runs | Forum-shaped, M3 Ultra 512GB only, batch size 1 only, no M5 tensor path, poor discoverability |
| [mlx Discussion #3134](https://github.com/ml-explore/mlx/discussions/3134) — "UMA-Native KV-Cache Benchmarks on M4 Pro 64GB, kv4 outperforms unquantized" | GitHub Discussion | Good, narrower | Single machine, KV-quant only, no long-context sweep |
| [arXiv 2511.05502](https://arxiv.org/pdf/2511.05502) "Production-Grade Local LLM Inference on Apple Silicon" | Preprint | Academic, thorough | Not written for practitioners, pre-M5 |
| [arXiv 2601.19139](https://arxiv.org/html/2601.19139v2) "Native LLM and MLLM Inference at Scale on Apple Silicon" | Preprint | Academic | Same |
| Michael Hannecke's Medium series (MLX memory management, TurboQuant integration paths) | Blog | Actually decent, first-hand | Anecdotal, no systematic sweep |
| sitepoint / local-llm.net / thinksmart.life / branch8 / modelfit / promptquorum / willitrunai / contracollective | SEO/affiliate blogs | Thin, largely synthesized, no original measurement | They rank on generic terms, they do not answer this query |

**Verdict: genuinely underserved.** Nobody has published a readable, practitioner-facing article on
this. The two good sources are GitHub Discussions that Google ranks reluctantly and that most
readers will never find. Position 13.5 with an under-optimized page confirms the SERP is soft.

### 1.2 `mlx apple silicon optimization` — 17 imp, pos 9.3

**Crowded, but crowded with low-quality content.** The SERP is dominated by AI-generated
affiliate/SEO sites (modelfit.io, promptquorum.com, willitrunai.com, contracollective.com,
thinksmart.life, branch8.com, blog.starmorph.com) plus Apple's own MLX pages and a WWDC session
writeup. None of these carry original measurement; they recycle the same four claims (unified
memory, quantize to 4-bit, speculative decoding, cap the KV cache).

**Verdict: winnable but not on generic-guide terms.** Do not write another "complete guide." The
only defensible angle is a measured checklist where every recommendation has a number attached and
at least one common recommendation is shown to be wrong on this hardware. Treat as a hub page, not
a demand play.

### 1.3 `mlx batch inference` (2 imp, pos 7) + `mlx concurrency` (1 imp, pos 6)

**Low raw impressions, but the best position in the cluster and the best content gap.** Low
impressions here are a symptom of low query volume, not low value — these are high-intent queries
from people building serving infrastructure.

What exists: [willccbb/mlx_parallm](https://github.com/willccbb/mlx_parallm) (a repo, now partly
superseded), one [Medium post on MLX_LM continuous batching](https://medium.com/@clnaveen/mlx-lm-continuous-batching-e060c73e7d98),
[jundot/omlx](https://github.com/jundot/omlx) and [mlx Discussion #3203](https://github.com/ml-explore/mlx/discussions/3203)
(oMLX, paged SSD caching), LM Studio's parallel-requests doc, and the mlx-lm README. Scattered
numbers exist (441 → 1642 tok/s from 1 → 16 concurrent on Qwen3-0.6B; "4.3x scaling at 16
concurrent"), but they come from different machines, models, and harnesses.

**Verdict: strongly underserved and directly measurable.** mlx-lm now ships `BatchGenerator` and
continuous batching with a configurable max-concurrency and `--kv-bits`. Nobody has published a
clean scaling curve on one machine with the interaction between concurrency and KV-cache bits.

### 1.4 `mlx vs ollama performance apple silicon 2025` (2 imp, pos 9) + `ollama mlx models` (1 imp, pos 6)

**Well-covered in volume, badly covered in accuracy, and the facts just changed.** There are at
least five 2026 comparison posts (modelfit, promptquorum, contracollective, willitrunai, yage.ai)
quoting mutually inconsistent numbers: "MLX beats Ollama 15-30%", "3x on Qwen3-Coder-30B-A3B MoE",
"Ollama 0.19 with MLX reaches 85% of pure MLX."

Meanwhile [Ollama's own announcement](https://ollama.com/blog/mlx) says the MLX backend is a
**preview**, needs **>32GB unified memory**, and at launch accelerates **only Qwen3.5 and Gemma 4**
architectures. Independent reports say Qwen3.6 sees almost no change while Qwen3.5-9B gains ~65%.

**Verdict: the framing "MLX vs Ollama" is now partly obsolete and that is the story.** The gap is
not another comparison table — it is the architecture-conditional truth: the backend only helps if
your model is on the supported list. The author is running `qwen3.6:27b`, which is reportedly one of
the architectures that does *not* benefit. That is a publishable first-hand finding.

### 1.5 `"dtype(val, size)" mlx vulnerability` — 6 imp, pos 7.3

**Odd query, weak SERP, cheap win.** Nothing on the web addresses this string directly; results are
just MLX API docs (`mlx.core.array`, `mlx.core.Dtype`) and unrelated issues. The searcher is almost
certainly hitting an MLX dtype construction/conversion error and reaching for the word
"vulnerability" loosely (possibly a non-native speaker, consistent with the "fehler" query below).

The existing `mlx_non_determinism` post already ranks here because it discusses dtype error
behavior. **Do not write a security post** — there is no known CVE and claiming one would be
irresponsible. Serve it as a troubleshooting/reference section instead.

### 1.6 `mlx llm_server.py unknown model fehler apple silicon m5` — 3 imp, pos 10

**Classic error-shaped long tail, zero good incumbents.** The real cause is well understood
(mlx-lm raises on unsupported `model_type`; the fix is an `mlx-community/*` conversion or a model
architecture mlx-lm supports), but there is no canonical page for it — just scattered GitHub issues
and third-party server repos (`mlx-serve`, `mlxsh`, aider issue #4526).

Two signals worth noting: **"fehler"** (German) and **"m5"**. Non-English searchers with brand new
hardware hitting model-support gaps is a recurring, renewable query pattern every time a new
architecture ships.

**Verdict: underserved, zero benchmark cost, ships immediately.**

### 1.7 `siliconllm` — 2 imp, pos 10 — **DEPRIORITIZE**

SiliconLLM is [SiliconFlow's](https://siliconflow.cn/siliconllm) commercial inference engine — a
Chinese cloud AI-infra product, unrelated to Apple Silicon. The site ranks for it by accidental
token overlap ("silicon" + "llm"). Intent mismatch. **Do not chase this.** Any traffic would bounce.

### 1.8 `mlx framework apple silicon llm inference performance 2026` (1 imp, pos 8) and `mlx llm performance metrics` (1 imp, pos 11)

Generic head-adjacent variants of §1.2. They will be picked up by the hub page and by the
long-context post. No dedicated post needed.

---

## 2. Deep dive: what is actually happening with long context + KV cache on Apple Silicon

The task asked for a specific assessment. Here it is.

### 2.1 The phenomenon

There are **three separate effects** that get conflated into "MLX gets slow at long context," and
the conflation is precisely why no existing article answers the query well:

**(a) Prefill is compute-bound and quadratic.** Attention is O(n²) in sequence length. A 32k-token
prompt costs far more than 8x a 4k prompt. This dominates time-to-first-token and is the effect most
users actually feel — reports of "51 tok/s decode but 3 tok/s effective throughput" at 8.5k context
on an M1 Max are entirely a prefill artifact, not a decode regression.

**(b) Decode is memory-bandwidth-bound, and the KV cache eats the bandwidth.** During decode you
re-read the whole KV cache every token. The MLX Discussion #3209 sweep on M3 Ultra found **~70%+ of
memory bandwidth consumed reading the FP16 KV cache at long context.** The consequence is the
counterintuitive headline finding: **weight quantization stops mattering as context grows.** Q2 is
4.5-4.6x faster than F16 at 1k context but only 1.7x faster at 128k, because at 128k you are no
longer bandwidth-limited by weights, you are bandwidth-limited by cache. Qwen 32B went 10.4 → 5.5
TPS from 1k → 128k on F16.

**(c) Unified memory is a shared, contended resource.** This is Apple-specific and the site has
already touched it: the existing benchmarking post recorded `[METAL] Command buffer execution
failed: Insufficient Memory` when SGLang's MLX KV pool starved vLLM Metal. KV cache growth is linear
in sequence length, so at long context the cache is competing with weights, other runtimes, and the
OS for the same pool. MLX has a configurable **rotating KV cache** (default 4k) that bounds growth
but silently changes semantics, and **no paged attention**.

### 2.2 Is it documented anywhere?

**Partially, and only in places practitioners will not find.** Discussions #3209 and #3134 have the
best numbers. The two arXiv preprints have the framework comparison. No practitioner-facing article
ties (a), (b), and (c) together, and critically:

**Nothing published covers M5.** The M5's GPU Neural Accelerators route prompt GEMM, MoE expert
GEMM, and prefill attention through the Metal 4 tensor path, giving a reported
[3.65x prefill speedup on Qwen3-8B at ~20k tokens (158 → 579 tok/s)](https://machinelearning.apple.com/research/exploring-llms-mlx-m5)
and up to 4x TTFT improvement over M4, while decode gains only 19-27% (bandwidth). MLX's support for
the accelerators was still described as preliminary as of the Apple ML writeup.

**This asymmetry is the story.** On M5, effect (a) has been largely bought down by hardware while
effects (b) and (c) have not. The shape of the long-context curve on M5 should be *qualitatively
different* from every published M1/M3/M4 measurement. Nobody has shown that.

### 2.3 The measurements that would settle it

A definitive answer requires a 2D sweep on the M5 Pro, reporting prefill and decode **separately**
(the single biggest methodological failure in existing content is reporting a blended tok/s):

- **Axis 1 — context length:** 1k, 4k, 8k, 16k, 32k, 64k, 128k (cap by what 48GB sustains).
- **Axis 2 — KV cache config:** fp16 baseline, `--kv-bits 8`, `--kv-bits 4`, plus rotating-cache on/off.
- **Metrics per cell:** prefill tok/s, TTFT, decode tok/s, peak unified-memory footprint, and a
  quality check at kv4 vs fp16 so the compression claim is not taken on faith.
- **Controls:** one model family, one weight quant, fixed prompt corpus, `mx.metal` memory stats
  captured per run, thermal state noted (48GB laptop, not a 512GB Mac Studio — say so).
- **The specific claims to confirm or refute on M5:**
  1. Does the Q2-vs-F16 advantage still collapse from ~4.5x to ~1.7x across 1k→128k when prefill is
     tensor-accelerated?
  2. Does kv4 reproduce the #3134 finding that it is free-or-better (3.2x more context at zero or
     negative perf cost)?
  3. Where exactly is the knee — the context length at which the KV cache overtakes weights as the
     bandwidth consumer on 48GB?

That is a genuinely publishable original result, and it is producible on hardware the author owns.

---

## 3. Proposed posts, ranked

Priority key: **P0** ship first, **P1** next, **P2** opportunistic.

---

### P0-1 — "MLX Long-Context Performance on M5 Pro: Where the KV Cache Eats Your Bandwidth"

- **Target queries:** `mlx long context performance drop apple silicon kv cache` (36 imp, pos 13.5,
  primary); `mlx llm performance metrics`; `mlx framework apple silicon llm inference performance 2026`;
  `mlx apple silicon optimization` (secondary).
- **Gap it fills:** The only two good data sources are GitHub Discussions on M3 Ultra 512GB and M4
  Pro 64GB, batch size 1, pre-M5. No practitioner article separates prefill from decode. No
  published data exists for the M5 tensor path, where prefill economics changed and decode
  economics did not.
- **Data needed:** the full §2.3 sweep. Report prefill/decode separately. Include the
  memory-footprint column — that is what makes it actionable on a 48GB laptop rather than a
  512GB Mac Studio.
- **Differentiator:** first M5-generation long-context KV sweep on a *laptop-class* machine, and an
  explicit "here is where the published M3 Ultra conclusions stop holding" section.
- **Length:** 2,200–2,800 words. Three tables minimum, one curve.
- **Risk:** highest benchmark cost in the plan (est. 276-cell-class sweep is overkill; ~40-60 runs
  is enough). Budget a full day of machine time. 128k on 48GB may not be reachable — say so
  honestly and cap the axis, that itself is a finding.

---

### P0-2 — "MLX Concurrency and Batch Inference: A Scaling Curve on One Machine"

- **Target queries:** `mlx concurrency` (pos 6); `mlx batch inference` (pos 7); `mlx llm performance metrics`.
- **Gap it fills:** mlx-lm now ships continuous batching via `BatchGenerator` with configurable max
  concurrency and `--kv-bits`. Every published number is from a different machine, model, and
  harness (441→1642 tok/s on Qwen3-0.6B; "4.3x at 16 concurrent"; LM Studio's parallel-request docs;
  omlx's SSD paging). Nobody has published a controlled single-machine curve, and **nobody has
  published the concurrency × KV-bits interaction**, which is exactly the tradeoff you hit on a
  memory-constrained Mac.
- **Data needed:** throughput and per-request latency at concurrency 1, 2, 4, 8, 16 (and to failure);
  crossed with `--kv-bits` fp16/8/4; peak memory per cell; the concurrency at which the machine
  falls over. Reuse the existing `llm-serving-bench-lab` harness — the six workloads already exist.
- **Differentiator:** it is a scaling curve, not a scaling anecdote, and it extends a harness the
  author already published and can point at.
- **Length:** 1,800–2,200 words.
- **Why P0 despite 3 total impressions:** best average position in the cluster (6–7), highest intent,
  lowest competition, and it reuses existing tooling. Cheapest strong post in the plan.

---

### P1-3 — "Ollama's MLX Backend on Apple Silicon: What Actually Got Faster"

- **Target queries:** `ollama mlx models` (pos 6); `mlx vs ollama performance apple silicon 2025`
  (pos 9); pulls the whole `mlx vs ollama` head term.
- **Gap it fills:** The SERP is full of 2026 "MLX vs Ollama" posts that are already stale, because
  as of Ollama 0.19 the answer is architecture-conditional: the MLX backend is a preview, requires
  >32GB unified memory, and at launch only accelerates Qwen3.5 and Gemma 4. The published gains
  (prefill +57%, decode +93% on Qwen3.5-35B-A3B per Ollama's own blog) do not transfer to unsupported
  architectures — and reports say **Qwen3.6 sees almost no change**, which is exactly what the author
  is running.
- **Data needed:** same six workloads, MLX backend on vs off, on at least one supported architecture
  (Qwen3.5) and one unsupported/unimproved one (`qwen3.6:27b`). Prefill and decode separately.
  Memory footprint. Note the >32GB gate against the 48GB machine.
- **Differentiator:** a falsification. Every competitor implies "turn on MLX, get 2x." Showing a
  measured near-zero delta on a popular model is information gain and is the kind of honest negative
  result that earns links.
- **Length:** 1,600–2,000 words.
- **Bonus:** this is the natural sequel to the existing Ollama vs vLLM vs SGLang post, which is
  already the site's strongest cluster asset. Publish it as an explicit follow-up.

---

### P1-4 — "MLX Errors on Apple Silicon: A Troubleshooting Reference"

- **Target queries:** `mlx llm_server.py unknown model fehler apple silicon m5` (pos 10);
  `"dtype(val, size)" mlx vulnerability` (pos 7.3); plus a long tail of error strings not yet in
  Search Console.
- **Gap it fills:** Error-shaped queries with no canonical answer. Everything lives in scattered
  GitHub issues. A single reference page organized **by literal error string** captures a renewable
  long tail — every new model architecture regenerates the "unknown model type" query.
- **Data needed:** **none new.** Assembled from the author's existing MLX experience plus the dtype
  material already in `mlx_non_determinism`, plus reproducing a handful of errors deliberately.
- **Structure:** one H2 or H3 per error string, each with: verbatim message, what actually causes it,
  the fix, and how to avoid it. Cover at minimum: `unknown model` / unsupported `model_type` in
  `mlx_lm.server`; dtype construction and conversion failures; `[METAL] Command buffer execution
  failed: Insufficient Memory` (already witnessed in the benchmarking post); NaN under float16 with
  wide value ranges (already measured in the non-determinism post).
- **Honesty requirement:** explicitly state there is **no known MLX security vulnerability** behind
  the `dtype(val, size)` query, and explain what the searcher is probably actually hitting. Do not
  imply a CVE.
- **Length:** 1,400–1,800 words, scannable, heavy on verbatim strings.
- **Why P1 not P0:** modest demand. But it is the fastest post to ship, needs zero machine time, and
  its structure compounds — it can absorb new error strings indefinitely.

---

### P2-5 — "Apple Silicon MLX Optimization: The Measured Checklist"

- **Target queries:** `mlx apple silicon optimization` (17 imp, pos 9.3);
  `mlx framework apple silicon llm inference performance 2026`.
- **Gap it fills:** The SERP for this head term is thin AI-generated guides recycling four
  recommendations with no numbers behind any of them. The differentiator must be that **every item
  carries a measured delta from this site's own posts**, and that at least one popular
  recommendation is shown not to hold.
- **Data needed:** **little to none new** — this is a hub that aggregates P0-1, P0-2, P1-3, and the
  two existing benchmark posts. Optionally add one small original test (speculative decoding on/off)
  if time allows.
- **Role:** cluster **hub page**. Every spoke links up to it; it links down to all spokes.
- **Length:** 2,000–2,400 words.
- **Sequencing:** must ship **after** P0-1 and P0-2, or it has nothing to aggregate and becomes
  exactly the thin guide it is meant to beat.
- **Honest risk:** this is the most contested SERP in the plan and the incumbents, while low quality,
  are numerous and topically focused. Ranking here is a 6-month play riding cluster authority, not a
  quick win. **Demand-backed but competitively speculative.**

---

### P2-6 (optional) — "Prompt Caching in mlx-lm: Making Long System Prompts Free for Coding Agents"

- **Target queries:** no direct Search Console evidence. Adjacent to the KV-cache query and to the
  site's agent-infrastructure cluster.
- **Gap it fills:** `mlx_lm.cache_prompt`, the server's in-memory LRU prompt cache, and the newer
  `--prompt-cache-dir` disk persistence are barely written about outside the repo. Known live issue:
  [prefix cache reuse is broken for hybrid-architecture models (sliding window, SSM/Mamba)](https://github.com/ml-explore/mlx-lm/issues/980).
- **Data needed:** TTFT with and without a warm prompt cache on a realistic ~8-16k agent system
  prompt; cache-hit behavior across server restarts with and without `--prompt-cache-dir`;
  confirmation of the hybrid-architecture breakage.
- **Length:** 1,400–1,800 words.
- **Status: SPECULATIVE.** No demand data. Justified only by strategic fit — it is the bridge between
  the MLX cluster and the `subagent_fleet` / coding-agent cluster. Ship only if the first four land.

---

### Ranked summary

| # | Post | Priority | Primary query (imp / pos) | New benchmarks? | Words |
|---|---|---|---|---|---|
| 1 | MLX long-context / KV cache on M5 Pro | **P0** | 36 / 13.5 | Heavy | 2,200–2,800 |
| 2 | MLX concurrency & batch inference scaling curve | **P0** | 2 / 7 + 1 / 6 | Moderate (reuses harness) | 1,800–2,200 |
| 3 | Ollama's MLX backend measured | **P1** | 1 / 6 + 2 / 9 | Moderate | 1,600–2,000 |
| 4 | MLX error troubleshooting reference | **P1** | 3 / 10 + 6 / 7.3 | **None** | 1,400–1,800 |
| 5 | Measured optimization checklist (hub) | **P2** | 17 / 9.3 | None (aggregates) | 2,000–2,400 |
| 6 | mlx-lm prompt caching for agents | **P2 / speculative** | — | Light | 1,400–1,800 |

**Suggested ship order:** 4 → 2 → 1 → 3 → 5 → (6).
Post 4 ships this week with zero machine time and starts the cluster signal. Post 2 is next because
it reuses the existing harness. Post 1 is the flagship but needs the most machine time. Post 5 must
come last of the core five.

---

## 4. Internal linking architecture

### Cluster shape

`P2-5 (Measured Optimization Checklist)` is the **hub**. Everything else is a spoke. Every spoke
links up to the hub with descriptive anchor text; the hub links down to every spoke.

```
                    ┌───────────────────────────────────┐
                    │  HUB: Measured Optimization       │
                    │  Checklist (P2-5)                 │
                    └───────────────┬───────────────────┘
        ┌──────────────┬────────────┼────────────┬──────────────┐
        │              │            │            │              │
  ┌─────▼─────┐  ┌─────▼─────┐ ┌────▼─────┐ ┌────▼─────┐  ┌─────▼─────┐
  │ P0-1      │  │ P0-2      │ │ P1-3     │ │ P1-4     │  │ EXISTING  │
  │ Long ctx  │◄─┤ Concurr-  │ │ Ollama   │ │ Errors   │  │ Ollama vs │
  │ + KV cache│─►│ ency      │ │ MLX      │ │ ref      │  │ vLLM vs   │
  └─────┬─────┘  └─────┬─────┘ └────┬─────┘ └────┬─────┘  │ SGLang    │
        │              │            │            │        └─────┬─────┘
        └──────────────┴────────────┴────────────┴──────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ EXISTING: MLX      │
                    │ Non-Determinism    │
                    └────────────────────┘
```

### Specific links to place

**Into existing posts (edit later, in a separate pass — not part of this plan's execution):**

| From | To | Anchor / context |
|---|---|---|
| `benchmarking_local_llms_...` (Metal OOM section) | P0-1 | "why unified memory pressure gets worse at long context" |
| `benchmarking_local_llms_...` (conclusion) | P1-3 | "Ollama's MLX backend changed these numbers — I re-ran them" |
| `benchmarking_local_llms_...` (SGLang/JSON section) | P0-2 | "how continuous batching in mlx-lm compares" |
| `mlx_non_determinism` (dtype section) | P1-4 | "the dtype errors people actually hit" |
| `mlx_non_determinism` (quantization/determinism conclusion) | P0-1 | "what quantization costs you at long context" |
| `subagent_fleet_...` | P0-2, P2-6 | "how many concurrent subagents one Mac can actually serve" |
| `ml_lab_self_host_overkill` | hub P2-5 | "how I tune these machines now" |

**Between new posts:**

- P0-1 ↔ P0-2 — reciprocal. Both are about the same resource (unified memory bandwidth) under two
  different pressures (sequence length vs. request count). This is the strongest semantic pair in the
  cluster; make the reciprocal link explicit and explanatory, not a bare "see also."
- P0-1 → P1-4 — link the `[METAL] Insufficient Memory` discussion to the error reference.
- P0-2 → P1-3 — concurrency behavior differs between Ollama's MLX backend and raw mlx-lm.
- P1-3 → existing `benchmarking_local_llms_...` — mandatory, it is the direct predecessor.
- P1-4 → P0-1 and → `mlx_non_determinism` — errors reference cites the posts with the underlying data.
- P2-6 → P0-1 (KV cache mechanics) and → `subagent_fleet_...` (the agent use case).

**Rules:**
1. Every new post links to **at least two existing posts** — that is how the existing pages' authority
   flows into the new ones and vice versa.
2. Anchor text should be the descriptive claim, not the title. `mlx_non_determinism` already models
   this well with its inline link to the n8n post.
3. The hub is the only page allowed to be a pure index. Everything else earns its links contextually.
4. Do not cross-link into the unrelated clusters (medfit, portfolio, ancient wisdom, postgres). This
   cluster should read as a coherent body of work.

---

## 5. Ships without new benchmarks

Items that need **zero machine time** and could be drafted immediately:

1. **P1-4, the error reference — entirely.** Built from the author's existing experience plus data
   already published in `mlx_non_determinism` (float16 NaN, dtype behavior) and
   `benchmarking_local_llms_...` (the verbatim Metal OOM string). Highest ratio of value to effort in
   the plan.
2. **P2-5, the hub — structurally**, though it should wait for its spokes to exist so it has real
   numbers to aggregate.
3. **A `mlx_non_determinism` refresh (not a new post).** It is the site's biggest asset, dated
   2025-09-15, and now nearly a year stale. It says "switch to Ollama for determinism" — advice that
   needs revisiting now that Ollama's Apple Silicon backend *is* MLX. Update that recommendation,
   add the `m5` and `mlx-lm` terms it currently lacks, and add outbound links to the new posts.
   This is likely the single highest-ROI action in the whole plan and costs no benchmarks.
4. **Meta-description / keyword pass across all four existing posts.** The meta-description bug is
   fixed; verify the four cluster posts actually have compelling, query-matched descriptions. The
   `ml_lab_self_host_overkill` post has **no `description` field at all** in its frontmatter — that
   is a live gap.
5. **Add `m5` / `m5 pro` terms.** Search Console shows `m5` appearing in queries. Only the
   benchmarking post mentions M5 prominently. Cheap, legitimate on-page win across the cluster.

---

## 6. Honesty ledger — demand-backed vs. speculative

**Demand-backed (impressions + ranking position both observed):**
- P0-1 long context / KV cache — 36 impressions, strongest evidence in the cluster.
- P2-5 optimization hub — 17 impressions. Demand is real; *ranking* is the speculative part.
- P1-4 error reference — 9 combined impressions across two error-shaped queries at good positions.

**Position-backed but low-volume (good intent, small absolute demand):**
- P0-2 concurrency / batch — 3 combined impressions, but positions 6 and 7. Ranked P0 on quality of
  gap and cheapness, not on volume. If judged purely on impressions it would be P2. Stated plainly.
- P1-3 Ollama MLX backend — 3 combined impressions, but the head term `mlx vs ollama` is large and
  the news hook is fresh. Partly a bet on timing.

**Speculative:**
- P2-6 prompt caching — no query evidence at all. Strategic-fit only. Ship last or not at all.

**Explicitly rejected:**
- `siliconllm` — intent mismatch (a Chinese cloud inference product, not Apple Silicon). Accidental
  ranking. Chasing it would produce a bounce-heavy page and dilute the cluster.
- Any "MLX security vulnerability" angle — no CVE exists. The query is a misworded troubleshooting
  search and must be served as such.

**Biggest execution risk:** P0-1 is the flagship and also the most benchmark-expensive. If the 48GB
M5 Pro cannot sustain the upper context lengths, the sweep truncates and the post becomes a weaker
"here is where a laptop stops" piece. That is still publishable and still original — but plan the
axis so the post works even if the top two context cells fail.
