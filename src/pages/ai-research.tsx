/** @jsx jsx */
import * as React from "react"
import { HeadFC } from "gatsby"
import { jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  Page,
  Title,
  Section,
  Prose,
  RuledList,
  TextLink,
  Row,
  Explore,
} from "../components/world-model/pages-systems-stack-now/editorial"
import BudgetTiers from "../components/world-model/anim/BudgetTiers"

const publications: Row[] = [
  {
    key: "budgetbench",
    meta: "2026",
    tag: "Preprint · arXiv:2609.13149",
    title: "BudgetBench: a budget-tiered protocol for memory strategy evaluation in local LLM agents",
    body: "Treats the per-call input-token budget as the independent variable, sweeping 2K to 32K. The pilot includes null results and a tokenizer bug we caught in our own numbers.",
    links: [
      { label: "arXiv", href: "https://arxiv.org/abs/2609.13149" },
      { label: "Walkthrough", to: "/budgetbench-explained/" },
    ],
  },
  {
    key: "ornith",
    meta: "2026",
    tag: "Distillation · MLX",
    title: "Distilling Ornith-1.5-9B with two teachers",
    body: "A 4.9 GB build scores +5.5 MMLU and +3.0 HumanEval over the 8.9 GB stock release it replaces, trained on one M4 Pro. The gain came from reasoning termination, not new knowledge.",
    links: [
      { label: "Write-up", to: "/distilling-ornith-9b-two-teacher-mlx/" },
      { label: "GitHub", href: "https://github.com/adityak74/ornith-1.5-9b-distil" },
    ],
  },
  {
    key: "pr1795",
    meta: "2026",
    tag: "Upstream · mlx-lm",
    title: "mlx-lm PR #1795: LoRA training on MoE models",
    body: "mlx_lm.lora crashed on granitemoe, granitemoehybrid and lfm2_moe because integer routing indices reached the VJP. A missing mx.stop_gradient, fixed three times and merged upstream.",
    links: [
      { label: "Pull request", href: "https://github.com/ml-explore/mlx-lm/pull/1795" },
      { label: "Write-up", to: "/mlx-lm-lora-moe-stop-gradient-fix/" },
    ],
  },
  {
    key: "speculative",
    meta: "2026",
    tag: "Inference · Apple Silicon",
    title: "Speculative decoding on Apple Silicon",
    body: "A 0.8B draft model gives a 119% peak decode speedup on Qwen3.8-27B, but mlx_lm refuses to run it against the hybrid attention cache without a patch.",
    links: [{ label: "Write-up", to: "/mlx-speculative-decoding-qwen3-8-apple-silicon/" }],
  },
  {
    key: "kv",
    meta: "2026",
    tag: "Inference · Apple Silicon",
    title: "Why MLX decode slows at long context",
    body: "Quantizing the KV cache halves how fast decode degrades with context, and halves prefill throughput too. Break-even math included.",
    links: [{ label: "Write-up", to: "/mlx-long-context-kv-cache-apple-silicon/" }],
  },
  {
    key: "roofline",
    meta: "2026",
    tag: "Inference · Roofline",
    title: "Why batching does not fix decode: GEMV versus GEMM",
    body: "On an M5 Pro, batched matmul holds a flat ~80x throughput advantage over matrix-vector ops at every size tested. That gap is why batching helps prefill and barely touches decode.",
    links: [{ label: "Write-up", to: "/mlx-gemv-gemm-roofline-apple-silicon/" }],
  },
  {
    key: "nondeterminism",
    meta: "2025",
    tag: "Reproducibility",
    title: "MLX non-determinism on Apple Silicon",
    body: "Identical inputs give different outputs. Batch-invariance tests from 512 to 4096 matrices, across bfloat16, float32 and float16.",
    links: [{ label: "Write-up", to: "/mlx-non-determinism-apple-silicon" }],
  },
  {
    key: "embenx",
    meta: "2026",
    tag: "Software · Retrieval",
    title: "embenx",
    body: "One Collection API over 15+ vector backends, with hybrid search, temporal memory and a built-in MCP server.",
    links: [
      { label: "Guide", to: "/embenx-python-embedding-toolkit" },
      { label: "GitHub", href: "https://github.com/adityak74/embenx" },
    ],
  },
  {
    key: "fleet",
    meta: "2026",
    tag: "Software · Runtime",
    title: "subagent-fleet",
    body: "A control plane that routes Claude Code-style subagents across local Ollama machines. One fleet.yaml generates the LiteLLM routes, agent files and warmup flows. The published eval compares the local fleet against Sonnet 5 and GPT-4o-mini.",
    links: [
      { label: "Write-up", to: "/subagent-fleet-local-ai-compute-control-plane" },
      { label: "GitHub", href: "https://github.com/adityak74/subagent-fleet" },
    ],
  },
  {
    key: "quecto",
    meta: "2026",
    tag: "Software · Harness",
    title: "Quecto",
    body: "A minimal agent harness and coding agent in Rust: a 1.3 MB core, a 5.5 MB agent, no async runtime. Built to be evaluated, with verification gates and session persistence.",
    links: [
      { label: "Project", to: "/quecto/" },
      { label: "Build notes", to: "/ai-research/building-quecto-from-minimal-harness-to-evaluable-agent/" },
    ],
  },
  {
    key: "medfit",
    meta: "2025",
    tag: "Paper · IEEE",
    title: "MEDFIT-LLM: domain-focused fine-tuning of small language models for medicine",
    body: "Fine-tuned small models evaluated against generic baselines on medical tasks. Published at a 2025 IEEE conference.",
    links: [
      { label: "Paper", href: "https://ieeexplore.ieee.org/abstract/document/11042816" },
      { label: "Walkthrough", to: "/medfit-llm-explained/" },
    ],
  },
  {
    key: "erbga",
    meta: "2018",
    tag: "Thesis · UMSL",
    title: "Efficient Reduced-BIAS Genetic Algorithm (ERBGA) for generic community detection",
    body: "A genetic algorithm that drops structural assumptions and needs no prior community count. Applied to benchmark graphs and Alzheimer's disease genetic networks.",
    links: [
      { label: "Thesis", href: "https://irl.umsl.edu/thesis/331/" },
      { label: "PDF", href: "/papers/efficient-reduced-bias-genetic-algorithm-community-detection.pdf" },
    ],
  },
]

// Submitted to arXiv, on hold in moderation as of Nov 2026. Add the link when it is announced.
const upcoming: Row[] = [
  { key: "halt", meta: "2026", tag: "Preprint · arXiv, submitted", title: "HALT: quantized reasoning models don't stop, and a harness-applied limit on thinking repairs them", body: "Link coming once the preprint is public." },
]

// Source: Google Scholar profile (WujCeDkAAAAJ). Order: newest first.
const papers: Row[] = [
  { key: "p-budgetbench", meta: "2026", tag: "arXiv", title: "BudgetBench: a budget-tiered protocol and pilot harness for memory strategy evaluation in local LLM agents", body: "With A. Jaggi.", links: [{ label: "arXiv:2609.13149", href: "https://arxiv.org/abs/2609.13149" }] },
  { key: "p-control-plane", meta: "2026", tag: "Concept paper", title: "The Enterprise AI Control Plane: a governance and orchestration framework for LLM deployments at scale", body: "With A. Jaggi. First of 14 concept papers on enterprise agent governance, trust, identity and security.", links: [{ label: "All 14 frameworks", to: "/frameworks/" }] },
  { key: "p-medfit", meta: "2025", tag: "Conference", title: "MEDFIT-LLM: medical enhancements through domain-focused fine-tuning of small language models", body: "With A. Jaggi and S. Naidu.", links: [{ label: "Paper", href: "https://ieeexplore.ieee.org/abstract/document/11042816" }] },
  { key: "p-glucose", meta: "2025", tag: "Journal", title: "Automated analysis of glucose response patterns in type 1 diabetes using machine learning and computer vision", body: "International Journal of Advanced Computer Science and Applications 16(5)." },
  { key: "p-breathwork", meta: "2025", tag: "Journal", title: "Neural network-enabled diagnostic framework for correlating Ayurvedic breathwork protocols with adaptive skin microbiome dynamics", body: "Mathematical Modelling of Engineering Problems 12(6)." },
  { key: "p-governance", meta: "2025", tag: "Study", title: "Quantifying adaptive governance success: a mixed-methods analysis of 500 organizations", body: "With A. Jaggi." },
  { key: "p-cag", meta: "2024", tag: "arXiv", title: "CAG: chunked augmented generation for Google Chrome's built-in Gemini Nano", body: "With V. Vellaiyappan Surulimuthu.", links: [{ label: "arXiv:2412.18708", href: "https://arxiv.org/abs/2412.18708" }] },
  { key: "p-cardiac", meta: "2024", tag: "Journal", title: "AI-enhanced neural network framework for cardiac arrest prognostics", body: "Frontiers in Health Informatics 13(3)." },
  { key: "p-erbga-paper", meta: "2018", tag: "Thesis", title: "Efficient reduced-bias genetic algorithm (ERBGA) for generic community detection objectives", body: "With C. Janikow, S. Bhatia and S. Climer. University of Missouri-St. Louis." },
  { key: "p-benes", meta: "2016", tag: "Journal", title: "Transmission in Benes network", body: "International Journal of Pure and Applied Mathematics 109(8)." },
]

const AiResearchPage = () => (
  <Layout>
    <Page>
      <Title
        eyebrow="Research"
        lede="I work across the AI stack: how models run on real hardware, how they are trained and distilled, how agents are built around them, and how anyone knows it worked."
      >
        Research and engineering notes
      </Title>

      <div sx={{ display: `grid`, gridTemplateColumns: [`1fr`, null, `minmax(0, 1fr) 400px`], gap: [4, 5], alignItems: `center`, mb: [5, 6] }}>
        <p sx={{ m: 0, fontSize: `17px`, lineHeight: 1.65, maxWidth: `46ch` }}>
          BudgetBench holds the per-call token budget fixed and asks which memory strategy spends it best. Retrieval at 2K
          scored 0.646; truncation needed 8K to reach 0.650. Hover a column, or switch the budget.
        </p>
        <BudgetTiers />
      </div>

      <Section label="Agenda" title="What I am trying to find out">
        <Prose>
          <p>
            Most agent failures I see are not model failures. They come from context that was truncated without
            anyone noticing, a runtime that gave different answers for the same input, or an eval that scored one
            answer instead of the behavior over time.
          </p>
          <p>
            The work follows three questions, and each reaches from the hardware up. How should memory be evaluated when the context budget is the
            constraint? What do local inference stacks actually do under load, and where are they not reproducible?
            What does a harness need to expose so its behavior can be audited? Each item below is an attempt to
            answer one of them with a measurement.
          </p>
        </Prose>
      </Section>

      <Section label="Upcoming" title="In submission">
        {/* Link to the preprint goes here once it is public. */}
        <RuledList rows={upcoming} />
      </Section>

      <Section label="Papers" title="Publications">
        <RuledList rows={papers} />
      </Section>

      <Section label="Work" title="Experiments and software">
        <RuledList rows={publications} />
        <p sx={{ mt: 4, mb: 0, fontSize: `15px` }}>
          Full citation record on{` `}
          <TextLink href="https://scholar.google.com/citations?user=WujCeDkAAAAJ&hl=en">Google Scholar</TextLink>.
          Longer pieces: <TextLink to="/ai-research/what-is-an-ai-agent-harness/">What is an AI agent harness</TextLink>
          {` `}and <TextLink to="/ai-systems-design-field-guide/">the AI Systems Design Field Guide</TextLink>.
        </p>
      </Section>
      <Explore keys={["frameworks", "writing", "systems"]} />
    </Page>
  </Layout>
)

export default AiResearchPage

export const Head: HeadFC = () => (
  <Seo
    title="AI Research: Papers and Experiments"
    description="Research by Aditya Karnam: BudgetBench (arXiv:2609.13149), Ornith-1.5-9B distillation, MLX inference studies, and agent memory and retrieval systems."
    pathname="/ai-research/"
  />
)
