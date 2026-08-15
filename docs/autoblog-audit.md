# Autoblog Audit — Phase 1 of the search growth plan

_Audit run 2026-08-11. Source of truth: YAML frontmatter of every `.mdx` under `content/posts/`._
_Companion to `docs/seo-growth-plan-2026.md`._

> **Status: audit complete, removal NOT yet applied.** The recommendation below is hard deletion
> (`git rm -r`, recoverable from history), superseding an earlier reversible-`noindex` plan.
> The deletion itself was blocked by the local permission system and needs the repo owner to run it
> or grant approval. See [Execution status](#execution-status).

## Summary

| Metric | Count |
| --- | --- |
| Total posts (`.mdx` under `content/posts/`) | 186 |
| Tagged `autoblog` — **recommended for deletion** | **166** |
| Curated — **KEEP** | **20** |

| Recommendation | Count |
| --- | --- |
| KEEP | 20 |
| CONSOLIDATE | 0 |
| DELETE | 166 |

No post was marked CONSOLIDATE. Every autoblog post that had enough search signal to be worth merging
(the seven URLs with any impressions at all) converts at **0 clicks**, so there is no demonstrated demand
to consolidate *toward*. Rewriting the topic from scratch later is strictly better than salvaging this prose.

<a id="count-discrepancy"></a>
## Count discrepancy: 166, not 168

The brief specified 168 autoblog / 18 curated. The correct figures are **166 autoblog / 20 curated**.

`grep -rl autoblog content/` returns 168 files, which is where 168 came from. Two of those files are
**curated posts that merely mention the word `autoblog` in their prose** and are not tagged with it:

| File | Why it matched | Verdict |
| --- | --- | --- |
| `content/posts/ai-blog-generator-n8n-results/` | The post is *about* the autoblog experiment; the word appears in body text and in a `keywords:` entry | **KEEP** — curated, 362 impressions |
| `content/posts/hero_rag_chat_architecture_2026-07-20/` | Body text and an inline SVG label read "skip autoblog-tagged" | **KEEP** — curated |

Deleting on the grep count would have destroyed two curated posts, including the site's
second-highest-impression page. The tag-based selector (`autoblog` present in the frontmatter `tags:` list)
is the correct one and yields 166.

One further note: `content/posts/ml_lab_self_host_overkill/` contains a `.md` file, not `.mdx`, so it is not
sourced as a post at all. It is untagged and out of scope here.

## Duplicate clusters

The corpus is not 166 distinct topics. It is roughly one topic — "AI is advancing fast" — restated 166 times.

| Cluster | Posts | Directories |
| --- | --- | --- |
| `quantum_ai_future_*` | 10 | `quantum_ai_future_hype_2025-10-02`<br>`quantum_ai_future_impact_2025-09-30`<br>`quantum_ai_future_intelligence_2025-10-01`<br>`quantum_ai_future_paradox_2025-10-12`<br>`quantum_ai_future_reasoning_2025-09-08`<br>`quantum_ai_future_revolution_2025-09-28`<br>`quantum_ai_future_safety_2025-10-06`<br>`quantum_ai_future_science_2025-09-24`<br>`quantum_ai_future_tech_2025-09-26`<br>`quantum_ai_future_world_2025-09-10` |
| `ai_bubble_quantum_*` | 4 | `ai_bubble_quantum_ai_future_2025-10-22`<br>`ai_bubble_quantum_bci_2025-10-26`<br>`ai_bubble_quantum_energy_2025-10-20`<br>`ai_bubble_quantum_future_2025-10-30` |
| `ai_exponential_leap_*` | 4 | `ai_exponential_leap_agents_future_2025-08-30`<br>`ai_exponential_leap_future_2025-08-17`<br>`ai_exponential_leap_future_2025-08-21`<br>`ai_exponential_leap_future_2025-08-30` |
| `ai_cognitive_impact_*` | 3 | `ai_cognitive_impact_blog_2025-11-16`<br>`ai_cognitive_impact_brains_2025-11-26`<br>`ai_cognitive_impact_future_2025-11-27` |
| `ai_future_tech_*` | 3 | `ai_future_tech_breakthroughs_2025-10-28`<br>`ai_future_tech_insights_2025-10-21`<br>`ai_future_tech_outlook_2025-10-21` |
| `ai_quantum_future_*` | 3 | `ai_quantum_future_discoveries_2025-09-09`<br>`ai_quantum_future_now_2025-10-01`<br>`ai_quantum_future_ready_2025-09-09` |
| `quantum_ai_bci_*` | 3 | `quantum_ai_bci_future_2025-10-25`<br>`quantum_ai_bci_future_2025-10-31`<br>`quantum_ai_bci_reshaping_2025-09-08` |
| `quantum_ai_next_*` | 3 | `quantum_ai_next_frontier_power_2025-10-05`<br>`quantum_ai_next_gen_tech_2025-09-29`<br>`quantum_ai_next_leap_2025-10-07` |
| `ai_brain_interfaces_*` | 2 | `ai_brain_interfaces_future_2025-09-11`<br>`ai_brain_interfaces_protocols_2025-10-19` |
| `ai_bubble_future_*` | 2 | `ai_bubble_future_safety_2025-10-17`<br>`ai_bubble_future_tech_2025-10-20` |
| `ai_friend_foe_*` | 2 | `ai_friend_foe_applications_2025-09-14`<br>`ai_friend_foe_quantum_2025-10-03` |
| `ai_future_impact_*` | 2 | `ai_future_impact_challenges_2025-08-31`<br>`ai_future_impact_gpt5_2025-09-02` |
| `ai_future_quantum_*` | 2 | `ai_future_quantum_ethics_2025-10-18`<br>`ai_future_quantum_ethics_2025-11-07` |
| `ai_quantum_leap_*` | 2 | `ai_quantum_leap_future_2025-09-25`<br>`ai_quantum_leap_power_2025-11-02` |
| `ai_reasoning_future_*` | 2 | `ai_reasoning_future_impact_2025-09-05`<br>`ai_reasoning_future_risk_2025-08-27` |
| `ai_reasoning_quantum_*` | 2 | `ai_reasoning_quantum_impact_2025-09-24`<br>`ai_reasoning_quantum_mlcommons_2025-11-23` |
| `ai_revolution_future_*` | 2 | `ai_revolution_future_impact_2025-08-24`<br>`ai_revolution_future_impact_2025-10-18` |
| `ai_wild_ride_*` | 2 | `ai_wild_ride`<br>`ai_wild_ride_quantum_ai_2025-09-12` |
| `google_ai_chips_*` | 2 | `google_ai_chips_models_2025-12-04`<br>`google_ai_chips_reasoning_impact_2025-12-02` |
| `quantum_ai_advanced_*` | 2 | `quantum_ai_advanced_reasoning_future_2025-10-04`<br>`quantum_ai_advanced_reasoning_reality_2025-09-22` |
| `quantum_ai_revolution_*` | 2 | `quantum_ai_revolution_future_2025-09-25`<br>`quantum_ai_revolution_safety_2025-10-06` |
| `quantum_ai_supremacy_*` | 2 | `quantum_ai_supremacy_future_2025-09-23`<br>`quantum_ai_supremacy_future_2025-09-28` |

**22 clusters account for 61 posts; 105 are singletons.**
Word counts across the autoblog corpus: min **14**, max **1549**, mean **668**.
Even the cluster names repeat: `quantum_ai_future_*` alone has 10 members.

## Search Console signal

Only these autoblog URLs have any measurable signal at all (YTD 2026-01-01 → 2026-08-10). Every one converts at 0%.

| URL | Signal | In deletion set? |
| --- | --- | --- |
| `/ai-era-technology-leaders-redefining-success-productivity/` | 661 impr, 0 clicks, pos 3.6 | Yes — highest-ranking autoblog page |
| `/ai-blog-generator-n8n-results/` | 362 impr, 0 clicks, pos 17.2 | **No — curated, kept** |
| `/ai-unleashed-self-improving-code-mind-reading-tech/` | 18 impr YTD, 452 lifetime | Yes |
| `/beyond-chatgpt-ai-innovation-world/` | 121 lifetime impr | Yes |
| `/ai-rapid-evolution-smarter-models-real-world-impact/` | 55 impr, 0 clicks | Yes |
| `/ai-exponential-leap-gpt5-agentic-ai-autonomous-vehicles/` | 32 impr, 0 clicks | Yes |
| `/ai-unleashed-from-self-improving-code-to-mind-bending-innovation/` | 23 impr, 0 clicks | Yes |
| `/ais-accelerating-evolution-from-autonomous-agents-to-brain-computer-interfaces/` | 22 impr, 0 clicks | Yes |

Lifetime impression figures for the last two rows come from the GSC screenshots documented in
`content/posts/ai-blog-generator-n8n-results/`. Those are the only deleted URLs above 100 lifetime impressions,
alongside `/ai-era-technology-leaders-redefining-success-productivity/`.

## Fallout analysis (references from kept content to deleted slugs)

| Reference | Location | Renders as | Action |
| --- | --- | --- | --- |
| `/ais-wild-ride-autonomous-agents-advanced-reasoning` | `content/posts/embenx_python_embedding_toolkit_2026-04-05/…mdx:33` | Literal bracketed text, **not** an anchor | Remove the line |
| `/ai-exponential-leap-advanced-reasoning-ai-agents` | `content/posts/embenx_python_embedding_toolkit_2026-04-05/…mdx:287` | Literal bracketed text, **not** an anchor | Remove the line |
| `/ai-unleashed-self-improving-code-mind-reading-tech`, `/beyond-chatgpt-ai-innovation-world` | `content/posts/ai-blog-generator-n8n-results/…mdx:122` | Inside `<code>`, prose about GSC results | **Leave** — historical record, no link |
| `/ai-toolkit/intelligent-prompt-composer` | `content/pages/ai-toolkit/index.mdx`, `src/pages/systems.tsx`, `src/components/world-model/data.ts`, two kept posts | Real links | **Safe** — see slug collision below |
| Various autoblog slugs | `src/components/portfolio-mcp/generated/thoughts-posts.ts` | Generated artifact | **Auto-heals** — regenerated by `npm run build:mcp-data`; `scripts/generate-thoughts-data.mjs` already skips `autoblog` |

`content/rag-project-pages.json` contains no references to any deleted slug.

### Slug collision (resolved by deletion)

`content/posts/generic_prompt_composer_2025-08-23/` is tagged `autoblog` but declares
`slug: /ai-toolkit/intelligent-prompt-composer` — the same slug as the curated page
`content/pages/ai-toolkit/intelligent-prompt-composer/index.mdx`. The page wins the route, so the URL that
actually ships is curated content. Deleting the post removes the duplicate and the live URL is unaffected.
This was the one case where a naive tag-driven sweep needed a manual exception.

## Curated posts — KEEP (20)

| Path | Slug | Date | Words | GSC signal |
| --- | --- | --- | --- | --- |
| `content/posts/agent_plugins_spec_v1_2026-08-10/agent_plugins_spec_v1_2026-08-10.mdx` | `/agent-plugins-spec-v1` | 2026-08-10 | 2612 | — |
| `content/posts/ai-blog-generator-n8n-results/ai-blog-generator-n8n-results.mdx` | `/ai-blog-generator-n8n-results` | 2026-04-11 | 1528 | 362 impr / 0 clicks / pos 17.2 |
| `content/posts/benchmarking_local_llms_ollama_vllm_sglang_apple_silicon_2026-07-08/benchmarking_local_llms_ollama_vllm_sglang_apple_silicon_2026-07-08.mdx` | `/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon` | 2026-07-08 | 2018 | — |
| `content/posts/building_quecto_from_minimal_harness_to_evaluable_agent_2026-07-25/building_quecto_from_minimal_harness_to_evaluable_agent_2026-07-25.mdx` | `/ai-research/building-quecto-from-minimal-harness-to-evaluable-agent` | 2026-07-25 | 4714 | — |
| `content/posts/embenx_python_embedding_toolkit_2026-04-05/embenx_python_embedding_toolkit_2026-04-05.mdx` | `/embenx-python-embedding-toolkit` | 2026-04-05 | 2406 | — |
| `content/posts/first_post/first_post.mdx` | `/30th-birthday-reflections` | 2025-04-01 | 752 | — |
| `content/posts/friday_coffee/friday_coffee.mdx` | `/friday-coffee-or-beer` | 2025-04-11 | 595 | — |
| `content/posts/hero_rag_chat_architecture_2026-07-20/hero_rag_chat_architecture_2026-07-20.mdx` | `/hero-rag-chat-architecture` | 2026-07-20 | 2802 | — |
| `content/posts/how-to-diagnose-bad-prompt-2025-08-25/how-to-diagnose-bad-prompt-2025-08-25.mdx` | `(derived from filename)` | 2025-08-25 | 1964 | — |
| `content/posts/india_agent_infrastructure_layer_2026-07-18/india-agent-infrastructure-layer.mdx` | `/india-agent-infrastructure-layer` | 2026-07-18 | 2075 | — |
| `content/posts/medfit_llm_explained_2026-07-22/medfit_llm_explained_2026-07-22.mdx` | `/medfit-llm-explained` | 2026-07-22 | 2531 | — |
| `content/posts/mlx_non_determinism/mlx_non_determinism.mdx` | `/mlx-non-determinism-apple-silicon` | 2025-09-15 | 1172 | — |
| `content/posts/portfolio_mcp_server_2026-07-20/portfolio_mcp_server_2026-07-20.mdx` | `/portfolio-mcp-server` | 2026-07-20 | 1186 | — |
| `content/posts/postgres_sharding/postgres_sharding.mdx` | `/manual-sharding-postgres-sql` | 2025-04-25 | 1175 | — |
| `content/posts/prompt-grader-vs-libraries-2025-08-25/prompt-grader-vs-libraries-2025-08-25.mdx` | `(derived from filename)` | 2025-08-25 | 2190 | — |
| `content/posts/subagent_fleet_local_ai_compute_control_plane_2026-07-01/subagent_fleet_local_ai_compute_control_plane_2026-07-01.mdx` | `/subagent-fleet-local-ai-compute-control-plane` | 2026-07-01 | 1688 | — |
| `content/posts/the_hike/the_hike.mdx` | `/the-hike-to-hanuman` | 2025-04-12 | 1753 | — |
| `content/posts/the_motivation/the_motivation.mdx` | `/the-motivation-from-suffering-to-spiritual-awakening` | 2025-04-04 | 581 | — |
| `content/posts/unlock_true_purpose_ancient_wisdom_2025-09-04/unlock_true_purpose_ancient_wisdom_2025-09-04.mdx` | `(derived from filename)` | 2025-09-04 | 595 | — |
| `content/posts/what_is_an_ai_agent_harness_2026-07-22/what_is_an_ai_agent_harness_2026-07-22.mdx` | `/ai-research/what-is-an-ai-agent-harness` | 2026-07-22 | 2242 | — |

## Autoblog posts — DELETE (166)

| Path | Slug | Cluster | Date | Words | GSC signal | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `content/posts/ai_evolution_bci/ai_evolution_bci.mdx` | `/ais-accelerating-evolution-from-autonomous-agents-to-brain-computer-interfaces` | `ai_evolution_bci` (1) | 2025-08-17 | 987 | 22 impr / 0 clicks | Highest-signal autoblog URL in its group (22 impr / 0 clicks) but a 0% click-through rate. Ranking without clicks is itself a negative quality signal. |
| `content/posts/ai_evolution_impact/ai_evolution_impact.mdx` | `/ai-rapid-evolution-smarter-models-real-world-impact` | `ai_evolution_impact` (1) | 2025-08-08 | 1188 | 55 impr / 0 clicks | Highest-signal autoblog URL in its group (55 impr / 0 clicks) but a 0% click-through rate. Ranking without clicks is itself a negative quality signal. |
| `content/posts/ai_exponential_leap_future_2025-08-21/ai_exponential_leap_future_2025-08-21.mdx` | `/ai-exponential-leap-gpt5-agentic-ai-autonomous-vehicles` | `ai_exponential_leap` (4) | 2025-08-21 | 812 | 32 impr / 0 clicks | Highest-signal autoblog URL in its group (32 impr / 0 clicks) but a 0% click-through rate. Ranking without clicks is itself a negative quality signal. |
| `content/posts/ai_innovation_world/ai_innovation_world.mdx` | `/beyond-chatgpt-ai-innovation-world` | `ai_innovation_world` (1) | 2025-08-05 | 1010 | **121 lifetime impr** | Highest-signal autoblog URL in its group (121 lifetime impr) but a 0% click-through rate. Ranking without clicks is itself a negative quality signal. |
| `content/posts/ai_tech_leaders_predict_future/ai_tech_leaders_predict_future.mdx` | `/ai-era-technology-leaders-redefining-success-productivity` | `ai_tech_leaders` (1) | 2025-08-10 | 1549 | **661 impr / 0 clicks / pos 3.6** | Highest-signal autoblog URL in its group (661 impr / 0 clicks / pos 3.6) but a 0% click-through rate. Ranking without clicks is itself a negative quality signal. |
| `content/posts/ai_unleashed_future/ai_unleashed_future.mdx` | `/ai-unleashed-self-improving-code-mind-reading-tech` | `ai_unleashed_future` (1) | 2025-08-03 | 1040 | 18 impr YTD / **452 lifetime** | Highest-signal autoblog URL in its group (18 impr YTD / 452 lifetime) but a 0% click-through rate. Ranking without clicks is itself a negative quality signal. |
| `content/posts/ai_unleashed_innovation/ai_unleashed_innovation.mdx` | `/ai-unleashed-from-self-improving-code-to-mind-bending-innovation` | `ai_unleashed_innovation` (1) | 2025-08-04 | 960 | 23 impr / 0 clicks | Highest-signal autoblog URL in its group (23 impr / 0 clicks) but a 0% click-through rate. Ranking without clicks is itself a negative quality signal. |
| `content/posts/ai_advanced_reasoning_impact_world_2025-09-10/ai_advanced_reasoning_impact_world_2025-09-10.mdx` | `/beyond-the-hype-is-ais-advanced-reasoning-capability-quietly-reshaping-our-world` | `ai_advanced_reasoning` (1) | 2025-09-10 | 709 | none / negligible | Thin single-shot AI news recap (709 words). Zero measurable search demand. |
| `content/posts/ai_agents_future_readiness_2025-08-18/ai_agents_future_readiness_2025-08-18.mdx` | `/ais-wild-ride-autonomous-agents-advanced-reasoning` | `ai_agents_future` (1) | 2025-08-18 | 887 | none / negligible | Thin single-shot AI news recap (887 words). Zero measurable search demand. |
| `content/posts/ai_agents_reasoning_future_2025-09-01/ai_agents_reasoning_future_2025-09-01.mdx` | `/ai-exponential-leap-advanced-reasoning-ai-agents` | `ai_agents_reasoning` (1) | 2025-09-01 | 904 | none / negligible | Thin single-shot AI news recap (904 words). Zero measurable search demand. |
| `content/posts/ai_bci_future_selves_2025-09-06/ai_bci_future_selves_2025-09-06.mdx` | `/mind-blown-ai-brain-computer-interfaces-unlocking-our-future-selves` | `ai_bci_future` (1) | 2025-09-06 | 551 | none / negligible | Thin single-shot AI news recap (551 words). Zero measurable search demand. |
| `content/posts/ai_bci_quantum_reality_2025-09-03/ai_bci_quantum_reality_2025-09-03.mdx` | `/mind-bending-ai-bci-quantum-leaps` | `ai_bci_quantum` (1) | 2025-09-03 | 510 | none / negligible | Thin single-shot AI news recap (510 words). Zero measurable search demand. |
| `content/posts/ai_blunting_minds_future_2025-11-30/ai_blunting_minds_future_2025-11-30.mdx` | `/ai-blunting-minds-or-supercharging-future` | `ai_blunting_minds` (1) | 2025-11-30 | 562 | none / negligible | Thin single-shot AI news recap (562 words). Zero measurable search demand. |
| `content/posts/ai_brain_interfaces_future_2025-09-11/ai_brain_interfaces_future_2025-09-11.mdx` | `/ai-getting-inside-our-heads-brain-computer-interfaces-advanced-reasoning` | `ai_brain_interfaces` (2) | 2025-09-11 | 568 | none / negligible | Duplicate pair (`ai_brain_interfaces_*`). No impressions, no clicks. |
| `content/posts/ai_brain_interfaces_protocols_2025-10-19/ai_brain_interfaces_protocols_2025-10-19.mdx` | `/ai-smarter-or-different-brain-computer-interfaces-ai-agent-protocols` | `ai_brain_interfaces` (2) | 2025-10-19 | 549 | none / negligible | Duplicate pair (`ai_brain_interfaces_*`). No impressions, no clicks. |
| `content/posts/ai_bubble_future_safety_2025-10-17/ai_bubble_future_safety_2025-10-17.mdx` | `/is-the-ai-bubble-bursting-or-just-reshaping-our-future-exploring-ai-chips-quantum-leaps-and-proactive-safety` | `ai_bubble_future` (2) | 2025-10-17 | 684 | none / negligible | Duplicate pair (`ai_bubble_future_*`). No impressions, no clicks. |
| `content/posts/ai_bubble_future_tech_2025-10-20/ai_bubble_future_tech_2025-10-20.mdx` | `/the-ai-bubble-is-it-popping-or-just-powering-up-for-advanced-reasoning-capabilities` | `ai_bubble_future` (2) | 2025-10-20 | 617 | none / negligible | Duplicate pair (`ai_bubble_future_*`). No impressions, no clicks. |
| `content/posts/ai_bubble_quantum_ai_future_2025-10-22/ai_bubble_quantum_ai_future_2025-10-22.mdx` | `/is-the-ai-bubble-about-to-pop-why-advanced-reasoning-and-quantum-ai-are-just-getting-started` | `ai_bubble_quantum` (4) | 2025-10-22 | 590 | none / negligible | Member of a 4-post near-duplicate cluster (`ai_bubble_quantum_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_bubble_quantum_bci_2025-10-26/ai_bubble_quantum_bci_2025-10-26.mdx` | `/ai-bubble-bursting-quantum-ai-bci-future` | `ai_bubble_quantum` (4) | 2025-10-26 | 568 | none / negligible | Member of a 4-post near-duplicate cluster (`ai_bubble_quantum_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_bubble_quantum_energy_2025-10-20/ai_bubble_quantum_energy_2025-10-20.mdx` | `/ai-future-bubble-quantum-energy-use` | `ai_bubble_quantum` (4) | 2025-10-20 | 819 | none / negligible | Member of a 4-post near-duplicate cluster (`ai_bubble_quantum_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_bubble_quantum_future_2025-10-30/ai_bubble_quantum_future_2025-10-30.mdx` | `/ai-bubble-burst-quantum-ai-advanced-reasoning` | `ai_bubble_quantum` (4) | 2025-10-30 | 477 | none / negligible | Member of a 4-post near-duplicate cluster (`ai_bubble_quantum_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_bubble_tech_safety_2025-10-17/ai_bubble_tech_safety_2025-10-17.mdx` | `/ai-bubble-pop-data-center-chips-quantum-ai-safety` | `ai_bubble_tech` (1) | 2025-10-17 | 671 | none / negligible | Thin single-shot AI news recap (671 words). Zero measurable search demand. |
| `content/posts/ai_buzz_future_reasoning_2025-12-03/ai_buzz_future_reasoning_2025-12-03.mdx` | `/feeling-the-ai-buzz-from-custom-chips-to-self-training-agents-is-this-the-future-of-advanced-reasoning` | `ai_buzz_future` (1) | 2025-12-03 | 521 | none / negligible | Thin single-shot AI news recap (521 words). Zero measurable search demand. |
| `content/posts/ai_capabilities_future_agents_2025-08-20/ai_capabilities_future_agents_2025-08-20.mdx` | `/ai-capabilities-doubling-future-agents` | `ai_capabilities_future` (1) | 2025-08-20 | 653 | none / negligible | Thin single-shot AI news recap (653 words). Zero measurable search demand. |
| `content/posts/ai_capabilities_redefining_future_2025-09-04/ai_capabilities_redefining_future_2025-09-04.mdx` | `/from-black-holes-to-brains-is-ais-advanced-reasoning-capabilities-redefining-our-future` | `ai_capabilities_redefining` (1) | 2025-09-04 | 527 | none / negligible | Thin single-shot AI news recap (527 words). Zero measurable search demand. |
| `content/posts/ai_cognitive_impact_blog_2025-11-16/ai_cognitive_impact_blog_2025-11-16.mdx` | `/feeling-dumber-lately-how-ai-might-be-blunting-our-thinking-skills-and-what-to-do` | `ai_cognitive_impact` (3) | 2025-11-16 | 481 | none / negligible | Member of a 3-post near-duplicate cluster (`ai_cognitive_impact_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_cognitive_impact_brains_2025-11-26/ai_cognitive_impact_brains_2025-11-26.mdx` | `/ai-advanced-reasoning-smarter-or-blunting-brains` | `ai_cognitive_impact` (3) | 2025-11-26 | 499 | none / negligible | Member of a 3-post near-duplicate cluster (`ai_cognitive_impact_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_cognitive_impact_future_2025-11-27/ai_cognitive_impact_future_2025-11-27.mdx` | `/ai-supercharging-minds-or-blunting-unseen-impact` | `ai_cognitive_impact` (3) | 2025-11-27 | 567 | none / negligible | Member of a 3-post near-duplicate cluster (`ai_cognitive_impact_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_deepresearch_agent_overview_2025-09-22/ai_deepresearch_agent_overview_2025-09-22.mdx` | `/is-ai-our-new-deepresearch-agent-for-everything-or-just-getting-started` | `ai_deepresearch_agent` (1) | 2025-09-22 | 726 | none / negligible | Thin single-shot AI news recap (726 words). Zero measurable search demand. |
| `content/posts/ai_ethics_kids_future_2025-09-07/ai_ethics_kids_future_2025-09-07.mdx` | `/ai-advanced-reasoning-kids-future` | `ai_ethics_kids` (1) | 2025-09-07 | 546 | none / negligible | Thin single-shot AI news recap (546 words). Zero measurable search demand. |
| `content/posts/ai_exponential_leap_agents_future_2025-08-30/ai_exponential_leap_agents_future_2025-08-30.mdx` | `/ais-wild-ride-exponential-leap-advanced-reasoning-agentic-ai` | `ai_exponential_leap` (4) | 2025-08-30 | 825 | none / negligible | Member of a 4-post near-duplicate cluster (`ai_exponential_leap_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_exponential_leap_future_2025-08-17/ai_exponential_leap_future_2025-08-17.mdx` | `/ai-exponential-leap-autonomous-vehicles-bci-agents` | `ai_exponential_leap` (4) | 2025-08-17 | 856 | none / negligible | Member of a 4-post near-duplicate cluster (`ai_exponential_leap_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_exponential_leap_future_2025-08-30/ai_exponential_leap_future_2025-08-30.mdx` | `/ais-exponential-leap-advanced-reasoning-agentic-rag-autonomous-vehicles` | `ai_exponential_leap` (4) | 2025-08-30 | 693 | none / negligible | Member of a 4-post near-duplicate cluster (`ai_exponential_leap_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_filmmaking_jobs/ai_filmmaking_jobs.mdx` | `/lights-camera-ai-how-new-tools-are-reshaping-filmmaking-and-the-job-market` | `ai_filmmaking_jobs` (1) | 2025-07-20 | 489 | none / negligible | Thin single-shot AI news recap (489 words). Zero measurable search demand. |
| `content/posts/ai_friend_foe_applications_2025-09-14/ai_friend_foe_applications_2025-09-14.mdx` | `/ai-friend-or-foe-why-its-wildest-new-applications-are-redefining-our-world` | `ai_friend_foe` (2) | 2025-09-14 | 734 | none / negligible | Duplicate pair (`ai_friend_foe_*`). No impressions, no clicks. |
| `content/posts/ai_friend_foe_quantum_2025-10-03/ai_friend_foe_quantum_2025-10-03.mdx` | `/ai-friend-or-foe-unpacking-latest-quantum-leaps-cybersecurity-advanced-reasoning` | `ai_friend_foe` (2) | 2025-10-03 | 563 | none / negligible | Duplicate pair (`ai_friend_foe_*`). No impressions, no clicks. |
| `content/posts/ai_frontier_coding/ai_frontier_coding.mdx` | `/the-ai-frontier-coding-showdowns-global-debates-and-whats-next` | `ai_frontier_coding` (1) | 2025-07-26 | 646 | none / negligible | Thin single-shot AI news recap (646 words). Zero measurable search demand. |
| `content/posts/ai_frontier_impact/ai_frontier_impact.mdx` | `/ai-frontier-advanced-reasoning-impact` | `ai_frontier_impact` (1) | 2025-08-12 | 772 | none / negligible | Thin single-shot AI news recap (772 words). Zero measurable search demand. |
| `content/posts/ai_future_advanced_reasoning_impact_2025-12-01/ai_future_advanced_reasoning_impact_2025-12-01.mdx` | `/ai-powered-future-advanced-reasoning` | `ai_future_advanced` (1) | 2025-12-01 | 743 | none / negligible | Thin single-shot AI news recap (743 words). Zero measurable search demand. |
| `content/posts/ai_future_autonomous_ethics_2025-08-19/ai_future_autonomous_ethics_2025-08-19.mdx` | `/ai-blazing-fast-future-self-improving-autonomous-vehicles` | `ai_future_autonomous` (1) | 2025-08-19 | 827 | none / negligible | Thin single-shot AI news recap (827 words). Zero measurable search demand. |
| `content/posts/ai_future_capabilities_impact_2025-08-23/ai_future_capabilities_impact_2025-08-23.mdx` | `/ai-wild-ride-advanced-reasoning-agentic-ai` | `ai_future_capabilities` (1) | 2025-08-23 | 709 | none / negligible | Thin single-shot AI news recap (709 words). Zero measurable search demand. |
| `content/posts/ai_future_chips_agents_2025-08-28/ai_future_chips_agents_2025-08-28.mdx` | `/ai-too-smart-gpt5-ai-agents-data-center-chips` | `ai_future_chips` (1) | 2025-08-28 | 761 | none / negligible | Thin single-shot AI news recap (761 words). Zero measurable search demand. |
| `content/posts/ai_future_gpt5_agents_2025-08-31/ai_future_gpt5_agents_2025-08-31.mdx` | `/ais-wild-ride-gpt5-advanced-reasoning-agentic-ai` | `ai_future_gpt5` (1) | 2025-08-31 | 967 | none / negligible | Thin single-shot AI news recap (967 words). Zero measurable search demand. |
| `content/posts/ai_future_impact_challenges_2025-08-31/ai_future_impact_challenges_2025-08-31.mdx` | `/ais-wild-ride-exponential-leap-worthy-successor-or-pandoras-box` | `ai_future_impact` (2) | 2025-08-31 | 942 | none / negligible | Duplicate pair (`ai_future_impact_*`). No impressions, no clicks. |
| `content/posts/ai_future_impact_gpt5_2025-09-02/ai_future_impact_gpt5_2025-09-02.mdx` | `/beyond-gpt5-ai-advanced-reasoning-capabilities-utopia-chaos` | `ai_future_impact` (2) | 2025-09-02 | 1010 | none / negligible | Duplicate pair (`ai_future_impact_*`). No impressions, no clicks. |
| `content/posts/ai_future_quantum_ethics_2025-10-18/ai_future_quantum_ethics_2025-10-18.mdx` | `/feeling-the-ai-buzz-from-quantum-leaps-to-ethical-quagmires-whats-next-for-ai` | `ai_future_quantum` (2) | 2025-10-18 | 603 | none / negligible | Duplicate pair (`ai_future_quantum_*`). No impressions, no clicks. |
| `content/posts/ai_future_quantum_ethics_2025-11-07/ai_future_quantum_ethics_2025-11-07.mdx` | `/ais-double-edged-sword-quantum-ai-ethical-challenges` | `ai_future_quantum` (2) | 2025-11-07 | 764 | none / negligible | Duplicate pair (`ai_future_quantum_*`). No impressions, no clicks. |
| `content/posts/ai_future_reasoning_cybersecurity_2025-10-14/ai_future_reasoning_cybersecurity_2025-10-14.mdx` | `/ai-smarter-workslop-future` | `ai_future_reasoning` (1) | 2025-10-14 | 731 | none / negligible | Thin single-shot AI news recap (731 words). Zero measurable search demand. |
| `content/posts/ai_future_safety_deepfakes_2025-10-11/ai_future_safety_deepfakes_2025-10-11.mdx` | `/feeling-uneasy-about-ai-deepfakes-daily-chats` | `ai_future_safety` (1) | 2025-10-11 | 576 | none / negligible | Thin single-shot AI news recap (576 words). Zero measurable search demand. |
| `content/posts/ai_future_sustainability_ethics_2025-11-10/ai_future_sustainability_ethics_2025-11-10.mdx` | `/ai-future-sustainable-energy-drain-ethical-dilemmas` | `ai_future_sustainability` (1) | 2025-11-10 | 686 | none / negligible | Thin single-shot AI news recap (686 words). Zero measurable search demand. |
| `content/posts/ai_future_tech_breakthroughs_2025-10-28/ai_future_tech_breakthroughs_2025-10-28.mdx` | `/feeling-the-future-are-brain-computer-interfaces-quantum-ai-and-ai-data-center-chips-the-keys-to-tomorrows-world` | `ai_future_tech` (3) | 2025-10-28 | 611 | none / negligible | Member of a 3-post near-duplicate cluster (`ai_future_tech_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_future_tech_insights_2025-10-21/ai_future_tech_insights_2025-10-21.mdx` | `/ai-bubble-burst-quantum-ai-bci-chips-future` | `ai_future_tech` (3) | 2025-10-21 | 656 | none / negligible | Member of a 3-post near-duplicate cluster (`ai_future_tech_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_future_tech_outlook_2025-10-21/ai_future_tech_outlook_2025-10-21.mdx` | `/ai-bubble-burst-quantum-ai-brain-computer-interfaces` | `ai_future_tech` (3) | 2025-10-21 | 802 | none / negligible | Member of a 3-post near-duplicate cluster (`ai_future_tech_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_future_training_ethics_2025-11-08/ai_future_training_ethics_2025-11-08.mdx` | `/ai-next-leap-advanced-reasoning-training-impact` | `ai_future_training` (1) | 2025-11-08 | 673 | none / negligible | Thin single-shot AI news recap (673 words). Zero measurable search demand. |
| `content/posts/ai_future_trust_challenges_2025-08-29/ai_future_trust_challenges_2025-08-29.mdx` | `/ais-wild-ride-gpt5-autonomous-vehicles-trustworthy-ai` | `ai_future_trust` (1) | 2025-08-29 | 891 | none / negligible | Thin single-shot AI news recap (891 words). Zero measurable search demand. |
| `content/posts/ai_genius_menace/ai_genius_menace.mdx` | `/is-ai-a-genius-or-a-menace-this-weeks-news-says-yes` | `ai_genius_menace` (1) | 2025-07-22 | 713 | none / negligible | Thin single-shot AI news recap (713 words). Zero measurable search demand. |
| `content/posts/ai_golden_age_education_future_2025-10-19/ai_golden_age_education_future_2025-10-19.mdx` | `/are-we-entering-an-ai-golden-age-or-a-golden-age-of-stupidity-the-future-of-ai-in-higher-education-and-beyond` | `ai_golden_age` (1) | 2025-10-19 | 653 | none / negligible | Thin single-shot AI news recap (653 words). Zero measurable search demand. |
| `content/posts/ai_growth_gpt5_trustworthy_2025-08-25/ai_growth_gpt5_trustworthy_2025-08-25.mdx` | `/ai-exponential-growth-gpt5-autonomous-vehicles-trustworthy-ai` | `ai_growth_gpt5` (1) | 2025-08-25 | 902 | none / negligible | Thin single-shot AI news recap (902 words). Zero measurable search demand. |
| `content/posts/ai_hope_worry_future_2025-09-15/ai_hope_worry_future_2025-09-15.mdx` | `/ai-greatest-hope-or-biggest-worry` | `ai_hope_worry` (1) | 2025-09-15 | 592 | none / negligible | Thin single-shot AI news recap (592 words). Zero measurable search demand. |
| `content/posts/ai_human_connection_support_2025-10-29/ai_human_connection_support_2025-10-29.mdx` | `/ai-human-connection-customer-support` | `ai_human_connection` (1) | 2025-10-29 | 538 | none / negligible | Thin single-shot AI news recap (538 words). Zero measurable search demand. |
| `content/posts/ai_hype_reality_check_2025-09-21/ai_hype_reality_check_2025-09-21.mdx` | `/from-quantum-ai-to-questionable-claims-is-ais-hype-outpacing-its-reality` | `ai_hype_reality` (1) | 2025-09-21 | 631 | none / negligible | Thin single-shot AI news recap (631 words). Zero measurable search demand. |
| `content/posts/ai_impact_hidden_costs_world_2025-11-15/ai_impact_hidden_costs_world_2025-11-15.mdx` | `/is-ai-making-us-dumber-unpacking-the-hidden-costs-of-our-smart-new-world` | `ai_impact_hidden` (1) | 2025-11-15 | 650 | none / negligible | Thin single-shot AI news recap (650 words). Zero measurable search demand. |
| `content/posts/ai_impact_human_cognition_2025-11-24/ai_impact_human_cognition_2025-11-24.mdx` | `/is-ai-making-us-less-smart-advanced-reasoning-capabilities-ai-agent-protocols` | `ai_impact_human` (1) | 2025-11-24 | 500 | none / negligible | Thin single-shot AI news recap (500 words). Zero measurable search demand. |
| `content/posts/ai_jobs_talent/ai_jobs_talent.mdx` | `/future-shock-ai-impact-jobs-talent-war` | `ai_jobs_talent` (1) | 2025-07-23 | 496 | none / negligible | Thin single-shot AI news recap (496 words). Zero measurable search demand. |
| `content/posts/ai_massive_upgrade_race_2025-11-01/ai_massive_upgrade_race_2025-11-01.mdx` | `/is-ai-about-to-get-a-massive-upgrade-the-race-for-faster-greener-ai-advanced-reasoning-capabilities-is-on` | `ai_massive_upgrade` (1) | 2025-11-01 | 560 | none / negligible | Thin single-shot AI news recap (560 words). Zero measurable search demand. |
| `content/posts/ai_multimodal_quantum_impact_2025-11-21/ai_multimodal_quantum_impact_2025-11-21.mdx` | `/is-ai-making-us-smarter-or-scared-multimodal-quantum-ai-evolving-minds` | `ai_multimodal_quantum` (1) | 2025-11-21 | 797 | none / negligible | Thin single-shot AI news recap (797 words). Zero measurable search demand. |
| `content/posts/ai_new_roles_education_science_2025-09-13/ai_new_roles_education_science_2025-09-13.mdx` | `/ai-new-roles-super-teacher-detective` | `ai_new_roles` (1) | 2025-09-13 | 711 | none / negligible | Thin single-shot AI news recap (711 words). Zero measurable search demand. |
| `content/posts/ai_next_frontier/ai_next_frontier.mdx` | `/ais-next-frontier-smarter-brains-real-world-impact-and-ethical-crossroads` | `ai_next_frontier` (1) | 2025-08-02 | 735 | none / negligible | Thin single-shot AI news recap (735 words). Zero measurable search demand. |
| `content/posts/ai_next_level/ai_next_level.mdx` | `/ais-next-level-from-curating-your-tunes-to-healing-minds` | `ai_next_level` (1) | 2025-07-30 | 538 | none / negligible | Thin single-shot AI news recap (538 words). Zero measurable search demand. |
| `content/posts/ai_paradox_ethics_future_2025-09-04/ai_paradox_ethics_future_2025-09-04.mdx` | `/ai-paradox-advanced-reasoning-quantum-ai` | `ai_paradox_ethics` (1) | 2025-09-04 | 522 | none / negligible | Thin single-shot AI news recap (522 words). Zero measurable search demand. |
| `content/posts/ai_paradox_future_safety_2025-10-08/ai_paradox_future_safety_2025-10-08.mdx` | `/the-ai-paradox-advanced-reasoning-capabilities` | `ai_paradox_future` (1) | 2025-10-08 | 589 | none / negligible | Thin single-shot AI news recap (589 words). Zero measurable search demand. |
| `content/posts/ai_policy_innovation/ai_policy_innovation.mdx` | `/ai-takes-center-stage-from-policy-battles-to-inclusive-innovation` | `ai_policy_innovation` (1) | 2025-07-24 | 510 | none / negligible | Thin single-shot AI news recap (510 words). Zero measurable search demand. |
| `content/posts/ai_quantum_bci_future_2025-10-27/ai_quantum_bci_future_2025-10-27.mdx` | `/mind-blowing-ai-quantum-brain-computer-interfaces` | `ai_quantum_bci` (1) | 2025-10-27 | 748 | none / negligible | Thin single-shot AI news recap (748 words). Zero measurable search demand. |
| `content/posts/ai_quantum_computing_future_chips_2025-11-03/ai_quantum_computing_future_chips_2025-11-03.mdx` | `/ai-data-center-chips-quantum-ai-future-mind-blown` | `ai_quantum_computing` (1) | 2025-11-03 | 736 | none / negligible | Thin single-shot AI news recap (736 words). Zero measurable search demand. |
| `content/posts/ai_quantum_cybersecurity_future_2025-10-02/ai_quantum_cybersecurity_future_2025-10-02.mdx` | `/ais-wild-ride-quantum-ai-and-ai-cybersecurity` | `ai_quantum_cybersecurity` (1) | 2025-10-02 | 511 | none / negligible | Thin single-shot AI news recap (511 words). Zero measurable search demand. |
| `content/posts/ai_quantum_education_future_2025-09-11/ai_quantum_education_future_2025-09-11.mdx` | `/ais-wild-ride-are-we-ready-for-its-quantum-leaps-and-classroom-takeovers` | `ai_quantum_education` (1) | 2025-09-11 | 602 | none / negligible | Thin single-shot AI news recap (602 words). Zero measurable search demand. |
| `content/posts/ai_quantum_future_discoveries_2025-09-09/ai_quantum_future_discoveries_2025-09-09.mdx` | `/ai-quantum-ai-unlocking-future-brain-computer-interfaces-cosmic-discoveries` | `ai_quantum_future` (3) | 2025-09-09 | 754 | none / negligible | Member of a 3-post near-duplicate cluster (`ai_quantum_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_quantum_future_now_2025-10-01/ai_quantum_future_now_2025-10-01.mdx` | `/stolen-em-dashes-quantum-ai-supremacy-ais-future-here` | `ai_quantum_future` (3) | 2025-10-01 | 561 | none / negligible | Member of a 3-post near-duplicate cluster (`ai_quantum_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_quantum_future_ready_2025-09-09/ai_quantum_future_ready_2025-09-09.mdx` | `/ai-and-quantum-ai-is-the-future-already-here-and-are-we-ready` | `ai_quantum_future` (3) | 2025-09-09 | 499 | none / negligible | Member of a 3-post near-duplicate cluster (`ai_quantum_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/ai_quantum_leap_future_2025-09-25/ai_quantum_leap_future_2025-09-25.mdx` | `/feeling-the-quantum-leap-how-ai-is-redefining-whats-possible` | `ai_quantum_leap` (2) | 2025-09-25 | 592 | none / negligible | Duplicate pair (`ai_quantum_leap_*`). No impressions, no clicks. |
| `content/posts/ai_quantum_leap_power_2025-11-02/ai_quantum_leap_power_2025-11-02.mdx` | `/ai-quantum-leap-sustainable-power` | `ai_quantum_leap` (2) | 2025-11-02 | 610 | none / negligible | Duplicate pair (`ai_quantum_leap_*`). No impressions, no clicks. |
| `content/posts/ai_quantum_multimodal_ethics_2025-09-03/ai_quantum_multimodal_ethics_2025-09-03.mdx` | `/ais-next-frontier-quantum-multimodal-ethical-maze` | `ai_quantum_multimodal` (1) | 2025-09-03 | 486 | none / negligible | Thin single-shot AI news recap (486 words). Zero measurable search demand. |
| `content/posts/ai_quantum_reasoning_trust_2025-09-23/ai_quantum_reasoning_trust_2025-09-23.mdx` | `/ai-next-leap-black-holes-wildebeest-advanced-reasoning-quantum-ai` | `ai_quantum_reasoning` (1) | 2025-09-23 | 735 | none / negligible | Thin single-shot AI news recap (735 words). Zero measurable search demand. |
| `content/posts/ai_quantum_valuations_future_2025-11-06/ai_quantum_valuations_future_2025-11-06.mdx` | `/ai-quantum-leaps-mind-boggling-valuations` | `ai_quantum_valuations` (1) | 2025-11-06 | 590 | none / negligible | Thin single-shot AI news recap (590 words). Zero measurable search demand. |
| `content/posts/ai_quiet_takeover_impact_analysis_2025-09-12/ai_quiet_takeover_impact_analysis_2025-09-12.mdx` | `/from-black-holes-to-classrooms-is-ais-quiet-takeover-already-underway` | `ai_quiet_takeover` (1) | 2025-09-12 | 578 | none / negligible | Thin single-shot AI news recap (578 words). Zero measurable search demand. |
| `content/posts/ai_race_future/ai_race_future.mdx` | `/the-trillion-dollar-ai-race` | `ai_race_future` (1) | 2025-07-29 | 727 | none / negligible | Thin single-shot AI news recap (727 words). Zero measurable search demand. |
| `content/posts/ai_rapid_evolution/ai_rapid_evolution.mdx` | `/ais-rapid-evolution-from-advanced-reasoning-to-autonomous-futures` | `ai_rapid_evolution` (1) | 2025-08-14 | 902 | none / negligible | Thin single-shot AI news recap (902 words). Zero measurable search demand. |
| `content/posts/AI_real_impact/AI_real_impact.mdx` | `/beyond-the-hype-ais-real-world-impact-from-chips-to-chatbots` | `AI_real_impact` (1) | 2025-07-28 | 620 | none / negligible | Thin single-shot AI news recap (620 words). Zero measurable search demand. |
| `content/posts/ai_reality_impact_future_2025-12-06/ai_reality_impact_future_2025-12-06.mdx` | `/is-ai-reshaping-reality-from-influencing-voters-to-powering-the-future-heres-the-buzz` | `ai_reality_impact` (1) | 2025-12-06 | 664 | none / negligible | Thin single-shot AI news recap (664 words). Zero measurable search demand. |
| `content/posts/ai_reasoning_deepresearch_threat_2025-11-28/ai_reasoning_deepresearch_threat_2025-11-28.mdx` | `/ai-advanced-reasoning-superpower-or-threat` | `ai_reasoning_deepresearch` (1) | 2025-11-28 | 490 | none / negligible | Thin single-shot AI news recap (490 words). Zero measurable search demand. |
| `content/posts/ai_reasoning_education_impact_2025-09-15/ai_reasoning_education_impact_2025-09-15.mdx` | `/ais-next-frontier-advanced-reasoning-capabilities-and-impact-on-education` | `ai_reasoning_education` (1) | 2025-09-15 | 544 | none / negligible | Thin single-shot AI news recap (544 words). Zero measurable search demand. |
| `content/posts/ai_reasoning_future_impact_2025-09-05/ai_reasoning_future_impact_2025-09-05.mdx` | `/ai-advanced-reasoning-capabilities-changing-everything` | `ai_reasoning_future` (2) | 2025-09-05 | 516 | none / negligible | Duplicate pair (`ai_reasoning_future_*`). No impressions, no clicks. |
| `content/posts/ai_reasoning_future_risk_2025-08-27/ai_reasoning_future_risk_2025-08-27.mdx` | `/ai-advanced-reasoning-capabilities-future-risk` | `ai_reasoning_future` (2) | 2025-08-27 | 705 | none / negligible | Duplicate pair (`ai_reasoning_future_*`). No impressions, no clicks. |
| `content/posts/ai_reasoning_impact_future_2025-11-16/ai_reasoning_impact_future_2025-11-16.mdx` | `/is-ai-making-us-smarter-or-just-blunting-our-advanced-reasoning-capabilities` | `ai_reasoning_impact` (1) | 2025-11-16 | 789 | none / negligible | Thin single-shot AI news recap (789 words). Zero measurable search demand. |
| `content/posts/ai_reasoning_quantum_impact_2025-09-24/ai_reasoning_quantum_impact_2025-09-24.mdx` | `/feeling-overwhelmed-by-ai-news-advanced-reasoning-ai-and-quantum-ai-are-changing-everything` | `ai_reasoning_quantum` (2) | 2025-09-24 | 570 | none / negligible | Duplicate pair (`ai_reasoning_quantum_*`). No impressions, no clicks. |
| `content/posts/ai_reasoning_quantum_mlcommons_2025-11-23/ai_reasoning_quantum_mlcommons_2025-11-23.mdx` | `/advanced-reasoning-ai-blessing-curse-mlcommons-quantum-ai-breakthroughs` | `ai_reasoning_quantum` (2) | 2025-11-23 | 738 | none / negligible | Duplicate pair (`ai_reasoning_quantum_*`). No impressions, no clicks. |
| `content/posts/ai_reasoning_universe_secrets_2025-09-20/ai_reasoning_universe_secrets_2025-09-20.mdx` | `/beyond-the-hype-is-ais-advanced-reasoning-capability-really-unlocking-the-universes-secrets` | `ai_reasoning_universe` (1) | 2025-09-20 | 566 | none / negligible | Thin single-shot AI news recap (566 words). Zero measurable search demand. |
| `content/posts/ai_reshaping_art_algorithms_2025-11-09/ai_reshaping_art_algorithms_2025-11-09.mdx` | `/feeling-disposable-how-ai-is-reshaping-everything-from-art-to-our-algorithms` | `ai_reshaping_art` (1) | 2025-11-09 | 599 | none / negligible | Thin single-shot AI news recap (599 words). Zero measurable search demand. |
| `content/posts/ai_reshaping_our_minds_world_2025-11-11/ai_reshaping_our_minds_world_2025-11-11.mdx` | `/are-our-advanced-reasoning-capabilities-at-risk-the-surprising-ways-ai-is-reshaping-our-minds-and-our-world` | `ai_reshaping_our` (1) | 2025-11-11 | 541 | none / negligible | Thin single-shot AI news recap (541 words). Zero measurable search demand. |
| `content/posts/ai_reshaping_world_cosmos_2025-09-06/ai_reshaping_world_cosmos_2025-09-06.mdx` | `/is-ai-reshaping-our-world-faster-than-we-think-from-classrooms-to-cosmos` | `ai_reshaping_world` (1) | 2025-09-06 | 506 | none / negligible | Thin single-shot AI news recap (506 words). Zero measurable search demand. |
| `content/posts/ai_revolution_accelerates/ai_revolution_accelerates.mdx` | `/the-ai-revolution-accelerates-smarter-systems-faster-chips-and-deeper-integration` | `ai_revolution_accelerates` (1) | 2025-08-07 | 974 | none / negligible | Thin single-shot AI news recap (974 words). Zero measurable search demand. |
| `content/posts/ai_revolution_brains_future_2025-11-27/ai_revolution_brains_future_2025-11-27.mdx` | `/ai-revolution-advanced-reasoning-quantum-ai` | `ai_revolution_brains` (1) | 2025-11-27 | 709 | none / negligible | Thin single-shot AI news recap (709 words). Zero measurable search demand. |
| `content/posts/ai_revolution_breakthroughs/ai_revolution_breakthroughs.mdx` | `/the-ai-revolution-unpacking-the-latest-breakthroughs-in-coding-agents-ai-in-higher-education-and-ai-data-center-chips` | `ai_revolution_breakthroughs` (1) | 2025-08-11 | 709 | none / negligible | Thin single-shot AI news recap (709 words). Zero measurable search demand. |
| `content/posts/ai_revolution_future_impact_2025-08-24/ai_revolution_future_impact_2025-08-24.mdx` | `/the-ai-revolution-worthy-successor-or-systemic-blowback` | `ai_revolution_future` (2) | 2025-08-24 | 949 | none / negligible | Duplicate pair (`ai_revolution_future_*`). No impressions, no clicks. |
| `content/posts/ai_revolution_future_impact_2025-10-18/ai_revolution_future_impact_2025-10-18.mdx` | `/feeling-the-ai-hype-why-the-real-ai-revolution-is-just-getting-started` | `ai_revolution_future` (2) | 2025-10-18 | 630 | none / negligible | Duplicate pair (`ai_revolution_future_*`). No impressions, no clicks. |
| `content/posts/ai_rewiring_understanding_reality_2025-09-07/ai_rewiring_understanding_reality_2025-09-07.mdx` | `/from-black-holes-to-brainwaves-is-ai-rewiring-our-understanding-of-reality` | `ai_rewiring_understanding` (1) | 2025-09-07 | 546 | none / negligible | Thin single-shot AI news recap (546 words). Zero measurable search demand. |
| `content/posts/ai_safety_reasoning_systems_2025-11-25/ai_safety_reasoning_systems_2025-11-25.mdx` | `/feeling-overwhelmed-by-ai-advanced-reasoning-capabilities-demand-proactive-safety-systems-now` | `ai_safety_reasoning` (1) | 2025-11-25 | 682 | none / negligible | Thin single-shot AI news recap (682 words). Zero measurable search demand. |
| `content/posts/ai_science_future_discoveries_2025-10-12/ai_science_future_discoveries_2025-10-12.mdx` | `/mind-blown-is-ai-unlocking-the-universes-deepest-secrets-and-our-biggest-fears` | `ai_science_future` (1) | 2025-10-12 | 891 | none / negligible | Thin single-shot AI news recap (891 words). Zero measurable search demand. |
| `content/posts/ai_smarter_lazier_impact_2025-11-22/ai_smarter_lazier_impact_2025-11-22.mdx` | `/ai-smarter-lazier-advanced-reasoning-quantum-impact` | `ai_smarter_lazier` (1) | 2025-11-22 | 669 | none / negligible | Thin single-shot AI news recap (669 words). Zero measurable search demand. |
| `content/posts/ai_superpower_changing_everything_2025-09-05/ai_superpower_changing_everything_2025-09-05.mdx` | `/is-ai-our-new-superpower-from-cosmic-discoveries-to-classroom-debates-its-changing-everything` | `ai_superpower_changing` (1) | 2025-09-05 | 534 | none / negligible | Thin single-shot AI news recap (534 words). Zero measurable search demand. |
| `content/posts/ai_superpower_headache_future_2025-09-14/ai_superpower_headache_future_2025-09-14.mdx` | `/ai-superpower-headache-quantum-classroom` | `ai_superpower_headache` (1) | 2025-09-14 | 579 | none / negligible | Thin single-shot AI news recap (579 words). Zero measurable search demand. |
| `content/posts/ai_superpower_quantum_reasoning_2025-09-21/ai_superpower_quantum_reasoning_2025-09-21.mdx` | `/is-ai-our-new-superpower-or-still-learning-to-walk-quantum-ai-advanced-reasoning` | `ai_superpower_quantum` (1) | 2025-09-21 | 678 | none / negligible | Thin single-shot AI news recap (678 words). Zero measurable search demand. |
| `content/posts/ai_superpowers_changing_everything_2025-09-02/ai_superpowers_changing_everything_2025-09-02.mdx` | `/ai-superpowers-changing-everything` | `ai_superpowers_changing` (1) | 2025-09-02 | 596 | none / negligible | Thin single-shot AI news recap (596 words). Zero measurable search demand. |
| `content/posts/ai_thinking_google_chips_2025-11-29/ai_thinking_google_chips_2025-11-29.mdx` | `/ai-blunting-thinking-skills-google-ai-chips` | `ai_thinking_google` (1) | 2025-11-29 | 470 | none / negligible | Thin single-shot AI news recap (470 words). Zero measurable search demand. |
| `content/posts/ai_thinking_skills_impact_2025-12-01/ai_thinking_skills_impact_2025-12-01.mdx` | `/ai-smarter-or-blunting-thinking-skills` | `ai_thinking_skills` (1) | 2025-12-01 | 549 | none / negligible | Thin single-shot AI news recap (549 words). Zero measurable search demand. |
| `content/posts/ai_unleashed_breakthroughs/ai_unleashed_breakthroughs.mdx` | `/ai-unleashed-latest-breakthroughs` | `ai_unleashed_breakthroughs` (1) | 2025-08-01 | 855 | none / negligible | Thin single-shot AI news recap (855 words). Zero measurable search demand. |
| `content/posts/ai_unleashed_impact/ai_unleashed_impact.mdx` | `/ai-unleashed-self-improving-models-real-world-impact-and-beyond` | `ai_unleashed_impact` (1) | 2025-08-10 | 911 | none / negligible | Thin single-shot AI news recap (911 words). Zero measurable search demand. |
| `content/posts/ai_unleashed_tech/ai_unleashed_tech.mdx` | `/ai-unleashed-self-improving-models-mind-bending-tech` | `ai_unleashed_tech` (1) | 2025-08-09 | 791 | none / negligible | Thin single-shot AI news recap (791 words). Zero measurable search demand. |
| `content/posts/ai_unseen_hand/ai_unseen_hand.mdx` | `/ais-unseen-hand-shaping-policy-health-and-history` | `ai_unseen_hand` (1) | 2025-07-25 | 782 | none / negligible | Thin single-shot AI news recap (782 words). Zero measurable search demand. |
| `content/posts/ai_utopia_blowback_analysis_2025-09-01/ai_utopia_blowback_analysis_2025-09-01.mdx` | `/ais-wild-ride-advanced-reasoning-capabilities-utopia-or-systemic-blowback` | `ai_utopia_blowback` (1) | 2025-09-01 | 1074 | none / negligible | Thin single-shot AI news recap (1074 words). Zero measurable search demand. |
| `content/posts/ai_valuations_quantum_revolution_2025-11-05/ai_valuations_quantum_revolution_2025-11-05.mdx` | `/is-ai-taking-over-unpacking-mind-boggling-valuations-and-quantum-ai-revolution` | `ai_valuations_quantum` (1) | 2025-11-05 | 553 | none / negligible | Thin single-shot AI news recap (553 words). Zero measurable search demand. |
| `content/posts/ai_wild_ride/ai_wild_ride.mdx` | `/beyond-gpt5-ai-wild-ride` | `ai_wild_ride` (2) | 2025-08-13 | 814 | none / negligible | Duplicate pair (`ai_wild_ride_*`). No impressions, no clicks. |
| `content/posts/ai_wild_ride_quantum_ai_2025-09-12/ai_wild_ride_quantum_ai_2025-09-12.mdx` | `/ais-wild-ride-are-we-ready-for-quantum-ai-advanced-reasoning-and-ai-in-our-schools` | `ai_wild_ride` (2) | 2025-09-12 | 554 | none / negligible | Duplicate pair (`ai_wild_ride_*`). No impressions, no clicks. |
| `content/posts/generic_prompt_composer_2025-08-23/generic_prompt_composer_2025-08-23.mdx` | `/ai-toolkit/intelligent-prompt-composer` | `generic_prompt_composer` (1) | 2025-08-23 | 14 | none / negligible | Thin single-shot AI news recap (14 words). Zero measurable search demand. |
| `content/posts/google_ai_chips_models_2025-12-04/google_ai_chips_models_2025-12-04.mdx` | `/is-googles-ai-the-real-deal-unpacking-the-hype-around-advanced-reasoning-capabilities-and-ai-data-center-chips` | `google_ai_chips` (2) | 2025-12-04 | 602 | none / negligible | Duplicate pair (`google_ai_chips_*`). No impressions, no clicks. |
| `content/posts/google_ai_chips_reasoning_impact_2025-12-02/google_ai_chips_reasoning_impact_2025-12-02.mdx` | `/google-ai-chips-reasoning-reshaping-minds` | `google_ai_chips` (2) | 2025-12-02 | 761 | none / negligible | Duplicate pair (`google_ai_chips_*`). No impressions, no clicks. |
| `content/posts/google_ai_gemini_chips_2025-12-03/google_ai_gemini_chips_2025-12-03.mdx` | `/is-ai-training-itself-google-gemini-3-custom-chips` | `google_ai_gemini` (1) | 2025-12-03 | 614 | none / negligible | Thin single-shot AI news recap (614 words). Zero measurable search demand. |
| `content/posts/gpt5_coding_agents_robotaxis_ai_2025-08-22/gpt5_coding_agents_robotaxis_ai_2025-08-22.mdx` | `/gpt5-coding-agents-robotaxis-ai-evolution` | `gpt5_coding_agents` (1) | 2025-08-22 | 678 | none / negligible | Thin single-shot AI news recap (678 words). Zero measurable search demand. |
| `content/posts/health_tracking_big_tech/health_tracking_big_tech.mdx` | `/your-health-digitized-unpacking-the-new-big-tech-health-tracking-initiative` | `health_tracking_big` (1) | 2025-07-31 | 519 | none / negligible | Thin single-shot AI news recap (519 words). Zero measurable search demand. |
| `content/posts/human_level_ai/human_level_ai.mdx` | `/human-level-ai-why-were-still-in-the-drivers-seat` | `human_level_ai` (1) | 2025-07-22 | 459 | none / negligible | Thin single-shot AI news recap (459 words). Zero measurable search demand. |
| `content/posts/master_deep_work_productivity_2025-09-02/master_deep_work_productivity_2025-09-02.mdx` | `/master-deep-work-unlock-ultimate-productivity-without-burnout` | `master_deep_work` (1) | 2025-09-02 | 419 | none / negligible | Thin single-shot AI news recap (419 words). Zero measurable search demand. |
| `content/posts/mind_blowing_ai_future_2025-08-26/mind_blowing_ai_future_2025-08-26.mdx` | `/mind-blowing-ai-gpt5-brain-chips-and-agentic-ai` | `mind_blowing_ai` (1) | 2025-08-26 | 750 | none / negligible | Thin single-shot AI news recap (750 words). Zero measurable search demand. |
| `content/posts/quantum_ai_advanced_reasoning_future_2025-10-04/quantum_ai_advanced_reasoning_future_2025-10-04.mdx` | `/feeling-the-quantum-leap-ai-advanced-reasoning` | `quantum_ai_advanced` (2) | 2025-10-04 | 474 | none / negligible | Duplicate pair (`quantum_ai_advanced_*`). No impressions, no clicks. |
| `content/posts/quantum_ai_advanced_reasoning_reality_2025-09-22/quantum_ai_advanced_reasoning_reality_2025-09-22.mdx` | `/mind-blown-how-quantum-ai-and-advanced-reasoning-are-redefining-reality` | `quantum_ai_advanced` (2) | 2025-09-22 | 661 | none / negligible | Duplicate pair (`quantum_ai_advanced_*`). No impressions, no clicks. |
| `content/posts/quantum_ai_analogue_future_threat_2025-11-12/quantum_ai_analogue_future_threat_2025-11-12.mdx` | `/quantum-ai-analogue-power-future-threat` | `quantum_ai_analogue` (1) | 2025-11-12 | 698 | none / negligible | Thin single-shot AI news recap (698 words). Zero measurable search demand. |
| `content/posts/quantum_ai_bci_future_2025-10-25/quantum_ai_bci_future_2025-10-25.mdx` | `/feeling-the-future-quantum-ai-and-brain-computer-interfaces-redefining-our-reality` | `quantum_ai_bci` (3) | 2025-10-25 | 641 | none / negligible | Member of a 3-post near-duplicate cluster (`quantum_ai_bci_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_bci_future_2025-10-31/quantum_ai_bci_future_2025-10-31.mdx` | `/quantum-ai-bci-future-dreamed-of` | `quantum_ai_bci` (3) | 2025-10-31 | 700 | none / negligible | Member of a 3-post near-duplicate cluster (`quantum_ai_bci_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_bci_reshaping_2025-09-08/quantum_ai_bci_reshaping_2025-09-08.mdx` | `/mind-blown-yet-how-quantum-ai-and-brain-computer-interfaces-are-reshaping-our-world` | `quantum_ai_bci` (3) | 2025-09-08 | 702 | none / negligible | Member of a 3-post near-duplicate cluster (`quantum_ai_bci_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_bioweapon_dilemma_2025-10-04/quantum_ai_bioweapon_dilemma_2025-10-04.mdx` | `/feeling-the-future-shock-quantum-ais-breakthroughs-bring-both-hope-and-a-bioweapon-dilemma` | `quantum_ai_bioweapon` (1) | 2025-10-04 | 650 | none / negligible | Thin single-shot AI news recap (650 words). Zero measurable search demand. |
| `content/posts/quantum_ai_future_hype_2025-10-02/quantum_ai_future_hype_2025-10-02.mdx` | `/quantum-ai-mind-bending-future-or-just-more-ai-hype-and-headaches` | `quantum_ai_future` (10) | 2025-10-02 | 483 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_future_impact_2025-09-30/quantum_ai_future_impact_2025-09-30.mdx` | `/quantum-ai-unprecedented-leaps-future-implications` | `quantum_ai_future` (10) | 2025-09-30 | 822 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_future_intelligence_2025-10-01/quantum_ai_future_intelligence_2025-10-01.mdx` | `/feeling-skeptical-about-ai-why-quantum-ai-might-just-blow-your-mind` | `quantum_ai_future` (10) | 2025-10-01 | 698 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_future_paradox_2025-10-12/quantum_ai_future_paradox_2025-10-12.mdx` | `/are-we-building-our-future-or-our-demise-the-quantum-ai-and-advanced-reasoning-paradox` | `quantum_ai_future` (10) | 2025-10-12 | 757 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_future_reasoning_2025-09-08/quantum_ai_future_reasoning_2025-09-08.mdx` | `/mind-blown-are-quantum-ai-and-advanced-reasoning-capabilities-reshaping-our-future` | `quantum_ai_future` (10) | 2025-09-08 | 511 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_future_revolution_2025-09-28/quantum_ai_future_revolution_2025-09-28.mdx` | `/is-quantum-ai-the-ultimate-upgrade-for-our-future-get-ready-for-a-revolution` | `quantum_ai_future` (10) | 2025-09-28 | 646 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_future_safety_2025-10-06/quantum_ai_future_safety_2025-10-06.mdx` | `/quantum-ai-power-peril-tomorrows-tech` | `quantum_ai_future` (10) | 2025-10-06 | 502 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_future_science_2025-09-24/quantum_ai_future_science_2025-09-24.mdx` | `/mind-blown-yet-how-quantum-ai-and-cutting-edge-science-are-rewriting-our-future` | `quantum_ai_future` (10) | 2025-09-24 | 620 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_future_tech_2025-09-26/quantum_ai_future_tech_2025-09-26.mdx` | `/feeling-the-quantum-leap-how-quantum-ai-is-redefining-whats-possible` | `quantum_ai_future` (10) | 2025-09-26 | 637 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_future_world_2025-09-10/quantum_ai_future_world_2025-09-10.mdx` | `/feeling-the-future-quantum-ai-advanced-reasoning-reshaping-world` | `quantum_ai_future` (10) | 2025-09-10 | 657 | none / negligible | Member of a 10-post near-duplicate cluster (`quantum_ai_future_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_game_changer_reasoning_2025-09-27/quantum_ai_game_changer_reasoning_2025-09-27.mdx` | `/quantum-ai-ultimate-game-changer-advanced-reasoning` | `quantum_ai_game` (1) | 2025-09-27 | 607 | none / negligible | Thin single-shot AI news recap (607 words). Zero measurable search demand. |
| `content/posts/quantum_ai_next_frontier_power_2025-10-05/quantum_ai_next_frontier_power_2025-10-05.mdx` | `/quantum-ai-beyond-mind-bending-power-next-frontier` | `quantum_ai_next` (3) | 2025-10-05 | 555 | none / negligible | Member of a 3-post near-duplicate cluster (`quantum_ai_next_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_next_gen_tech_2025-09-29/quantum_ai_next_gen_tech_2025-09-29.mdx` | `/feeling-immortal-quantum-ai-next-gen-tech-rewriting-future` | `quantum_ai_next` (3) | 2025-09-29 | 714 | none / negligible | Member of a 3-post near-duplicate cluster (`quantum_ai_next_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_next_leap_2025-10-07/quantum_ai_next_leap_2025-10-07.mdx` | `/quantum-ai-beyond-is-humanity-ready-for-ais-next-big-leap` | `quantum_ai_next` (3) | 2025-10-07 | 691 | none / negligible | Member of a 3-post near-duplicate cluster (`quantum_ai_next_*`); these cannibalise each other for one undifferentiated topic. |
| `content/posts/quantum_ai_power_dangers_2025-10-05/quantum_ai_power_dangers_2025-10-05.mdx` | `/quantum-ai-future-mind-bending-power-hidden-dangers` | `quantum_ai_power` (1) | 2025-10-05 | 596 | none / negligible | Thin single-shot AI news recap (596 words). Zero measurable search demand. |
| `content/posts/quantum_ai_reasoning_safety_systems_2025-11-06/quantum_ai_reasoning_safety_systems_2025-11-06.mdx` | `/quantum-ai-advanced-reasoning-proactive-safety-systems` | `quantum_ai_reasoning` (1) | 2025-11-06 | 704 | none / negligible | Thin single-shot AI news recap (704 words). Zero measurable search demand. |
| `content/posts/quantum_ai_revolution_future_2025-09-25/quantum_ai_revolution_future_2025-09-25.mdx` | `/feeling-the-quantum-leap-our-world-is-on-the-brink-of-a-quantum-ai-revolution` | `quantum_ai_revolution` (2) | 2025-09-25 | 525 | none / negligible | Duplicate pair (`quantum_ai_revolution_*`). No impressions, no clicks. |
| `content/posts/quantum_ai_revolution_safety_2025-10-06/quantum_ai_revolution_safety_2025-10-06.mdx` | `/are-we-ready-for-the-quantum-ai-revolution-unpacking-advanced-reasoning-and-proactive-safety` | `quantum_ai_revolution` (2) | 2025-10-06 | 590 | none / negligible | Duplicate pair (`quantum_ai_revolution_*`). No impressions, no clicks. |
| `content/posts/quantum_ai_safety_future_2025-10-09/quantum_ai_safety_future_2025-10-09.mdx` | `/quantum-ai-cybersecurity-safety-future` | `quantum_ai_safety` (1) | 2025-10-09 | 648 | none / negligible | Thin single-shot AI news recap (648 words). Zero measurable search demand. |
| `content/posts/quantum_ai_science_secrets_2025-09-29/quantum_ai_science_secrets_2025-09-29.mdx` | `/mind-blown-yet-quantum-ai-science-universe-secrets` | `quantum_ai_science` (1) | 2025-09-29 | 734 | none / negligible | Thin single-shot AI news recap (734 words). Zero measurable search demand. |
| `content/posts/quantum_ai_supremacy_future_2025-09-23/quantum_ai_supremacy_future_2025-09-23.mdx` | `/quantum-ai-unconditional-supremacy-advanced-reasoning` | `quantum_ai_supremacy` (2) | 2025-09-23 | 492 | none / negligible | Duplicate pair (`quantum_ai_supremacy_*`). No impressions, no clicks. |
| `content/posts/quantum_ai_supremacy_future_2025-09-28/quantum_ai_supremacy_future_2025-09-28.mdx` | `/mind-blown-yet-quantum-ai-just-achieved-supremacy-what-does-that-mean-for-you` | `quantum_ai_supremacy` (2) | 2025-09-28 | 618 | none / negligible | Duplicate pair (`quantum_ai_supremacy_*`). No impressions, no clicks. |
| `content/posts/quantum_ai_tech_secrets_2025-09-30/quantum_ai_tech_secrets_2025-09-30.mdx` | `/mind-blown-yet-how-quantum-ai-and-cutting-edge-tech-are-unlocking-the-universes-deepest-secrets` | `quantum_ai_tech` (1) | 2025-09-30 | 491 | none / negligible | Thin single-shot AI news recap (491 words). Zero measurable search demand. |
| `content/posts/quantum_ai_today_future_2025-09-26/quantum_ai_today_future_2025-09-26.mdx` | `/are-we-ready-for-quantum-ai-why-todays-ai-still-has-us-scratching-our-heads` | `quantum_ai_today` (1) | 2025-09-26 | 689 | none / negligible | Thin single-shot AI news recap (689 words). Zero measurable search demand. |
| `content/posts/quantum_ai_trust_current_2025-09-27/quantum_ai_trust_current_2025-09-27.mdx` | `/mind-blown-quantum-ai-is-here-but-can-we-trust-our-current-ai` | `quantum_ai_trust` (1) | 2025-09-27 | 629 | none / negligible | Thin single-shot AI news recap (629 words). Zero measurable search demand. |
| `content/posts/tech_future_ai_quantum_2025-10-03/tech_future_ai_quantum_2025-10-03.mdx` | `/quantum-ai-future-mind-boggling-pace` | `tech_future_ai` (1) | 2025-10-03 | 555 | none / negligible | Thin single-shot AI news recap (555 words). Zero measurable search demand. |
| `content/posts/tech_science_innovations/tech_science_innovations.mdx` | `/future-forward-innovations-tech-science` | `tech_science_innovations` (1) | 2025-08-01 | 560 | none / negligible | Thin single-shot AI news recap (560 words). Zero measurable search demand. |

<a id="execution-status"></a>
## Execution status

The audit above is complete and verified. The removal was **not** applied:

- A branch was cut and the 166-directory delete list was assembled and re-validated against frontmatter.
- The local permission system blocked the bulk-deletion commands. The branch was discarded and the working
  tree returned to `main` unchanged; **no content was deleted or modified**.
- To proceed, the repo owner should run the deletion directly, or grant Bash approval for it.

### Verified fallback: reversible `noindex`

Before the directive changed to deletion, a reversible deindexing mechanism was implemented and
**proven working against a real production build**, then reverted. It is worth recording because it
achieves most of the SEO benefit with zero data loss, and can be reinstated quickly:

- `src/utils/noindex.ts` — single source of truth keyed on the existing `autoblog` tag, plus an
  `INDEX_ALLOWLIST` escape hatch (needed for the `/ai-toolkit/intelligent-prompt-composer` collision).
- `src/@lekoarts/gatsby-theme-minimal-blog/components/post.tsx` — `Head` emits
  `<meta name="robots" content="noindex, follow" />` (plus a `googlebot` twin). `follow`, not `nofollow`,
  so internal links keep passing equity.
- `gatsby-config.ts` — `gatsby-plugin-sitemap` gains a custom `query` + `resolvePages` that drops every
  `allPost` node tagged `autoblog` from `sitemap-0.xml`.

Build verification results (exit 0): 165/165 targeted posts carried the robots meta, 0 leaked into the
sitemap, 0 curated posts were wrongly noindexed, and all 17 curated slugs remained in the sitemap.
The tag was chosen over a new `noindex:` frontmatter flag because `tags` is already on the theme's `Post`
GraphQL interface (no schema customization needed), it is already the site's marker for AI-generated
content, and it avoids a second field that could drift out of sync across 166 files.
