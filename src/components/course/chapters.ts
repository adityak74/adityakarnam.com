export type Source = { label: string; to?: string; href?: string }
export type Chapter = {
  n: number
  slug: string
  layer: string
  title: string
  blurb: string
  minutes: number
  outcomes: string[]
  sources: Source[]
}

// Single source of truth for the course. Chapter components must only use facts from the linked sources.
export const CHAPTERS: Chapter[] = [
  {
    n: 1, slug: "silicon", layer: "Silicon", title: "What the hardware actually does",
    blurb: "A model is arithmetic plus memory traffic. Start at the chip and learn why decode is slow and prefill is fast.",
    minutes: 25,
    outcomes: ["Explain the roofline idea: compute-bound versus memory-bound", "See why matrix-vector (decode) and matrix-matrix (prefill) behave so differently", "Understand why the same input can give different outputs on the same machine"],
    sources: [
      { label: "GEMV versus GEMM roofline study", to: "/mlx-gemv-gemm-roofline-apple-silicon/" },
      { label: "MLX non-determinism", to: "/mlx-non-determinism-apple-silicon" },
      { label: "Batch concurrency and the memory wall", to: "/mlx-batch-concurrency-memory-wall-apple-silicon/" },
      { label: "MLX error troubleshooting", to: "/mlx-errors-apple-silicon-troubleshooting/" },
    ],
  },
  {
    n: 2, slug: "inference", layer: "Inference", title: "Making a model answer fast",
    blurb: "Tokens, the KV cache, quantization and speculative decoding: where the time goes and what each trick buys you.",
    minutes: 30,
    outcomes: ["Trace one request through prefill and decode", "Explain what the KV cache stores and why long context slows decode", "Reason about speculative decoding with a draft model, and when it fails"],
    sources: [
      { label: "Why MLX decode slows at long context", to: "/mlx-long-context-kv-cache-apple-silicon/" },
      { label: "Speculative decoding on Apple Silicon", to: "/mlx-speculative-decoding-qwen3-8-apple-silicon/" },
      { label: "Benchmarking local LLMs: Ollama, vLLM, SGLang", to: "/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon/" },
    ],
  },
  {
    n: 3, slug: "models", layer: "Models", title: "Training, LoRA and distillation",
    blurb: "How a small model gets better: fine-tuning with LoRA, mixture-of-experts quirks, and distilling from two teachers.",
    minutes: 30,
    outcomes: ["Explain LoRA in one picture", "Understand distillation and why a smaller model can beat the larger one it replaces", "Read a bug fix in an open-source trainer and know what went wrong"],
    sources: [
      { label: "Distilling Ornith-1.5-9B with two teachers", to: "/distilling-ornith-9b-two-teacher-mlx/" },
      { label: "mlx-lm PR #1795: LoRA on MoE models", to: "/mlx-lm-lora-moe-stop-gradient-fix/" },
      { label: "MEDFIT-LLM explained", to: "/medfit-llm-explained/" },
      { label: "Ornith-9B reviewing Quecto code", to: "/ornith-9b-local-model-quecto-code-review-claude-sonnet-5/" },
    ],
  },
  {
    n: 4, slug: "retrieval", layer: "Retrieval", title: "Retrieval and memory",
    blurb: "Embeddings, vector search, hybrid retrieval and memory: how a model gets the right context into a small window.",
    minutes: 30,
    outcomes: ["Explain embeddings and nearest-neighbour search visually", "Compare chunking and retrieval strategies under a token budget", "Know what a retrieval pipeline for a real site looks like"],
    sources: [
      { label: "embenx: Python embedding toolkit", to: "/embenx-python-embedding-toolkit/" },
      { label: "Hero RAG chat architecture", to: "/hero-rag-chat-architecture/" },
      { label: "Tokens per paper: Docling and DocLang", to: "/tokens-per-paper-doclang-docling-pdf/" },
      { label: "CAG: chunked augmented generation (arXiv:2412.18708)", href: "https://arxiv.org/abs/2412.18708" },
    ],
  },
  {
    n: 5, slug: "agents", layer: "Agents", title: "Agents and harnesses",
    blurb: "An agent is a loop around a model. Learn the harness: tools, permissions, context, and what makes one auditable.",
    minutes: 35,
    outcomes: ["Draw the agent loop and name its parts", "Explain approval gating, session persistence and tool design", "See how a minimal harness (Quecto) is put together"],
    sources: [
      { label: "What is an AI agent harness", to: "/ai-research/what-is-an-ai-agent-harness/" },
      { label: "Building a coding agent harness", to: "/building-a-coding-agent-harness/" },
      { label: "Building Quecto", to: "/ai-research/building-quecto-from-minimal-harness-to-evaluable-agent/" },
      { label: "Agent Plugins spec v1", to: "/agent-plugins-spec-v1/" },
      { label: "Portfolio MCP server", to: "/portfolio-mcp-server/" },
    ],
  },
  {
    n: 6, slug: "evals", layer: "Evals", title: "How you know it worked",
    blurb: "Benchmarks, budgets, null results and measurement mistakes. The skill that separates a demo from evidence.",
    minutes: 30,
    outcomes: ["Design a fair comparison with one independent variable", "Read a results table, including the null results, without fooling yourself", "Understand budget-tiered evaluation (BudgetBench)"],
    sources: [
      { label: "BudgetBench explained", to: "/budgetbench-explained/" },
      { label: "BudgetBench on arXiv (2609.13149)", href: "https://arxiv.org/abs/2609.13149" },
      { label: "locobench", href: "https://github.com/adityak74/locobench" },
      { label: "local-code-review", href: "https://github.com/adityak74/local-code-review" },
      { label: "Prompt Grader", to: "/ai-toolkit/prompt-grader/" },
    ],
  },
  {
    n: 7, slug: "factories", layer: "Factories", title: "Software factories: running it all",
    blurb: "Put the stack to work: routing subagents across machines, a local lab, and an infrastructure layer for agents.",
    minutes: 30,
    outcomes: ["Explain a control plane that routes agents across local compute", "Compare local and cloud economics honestly", "Plan your own small software factory"],
    sources: [
      { label: "subagent-fleet: local AI compute control plane", to: "/subagent-fleet-local-ai-compute-control-plane/" },
      { label: "The agent infrastructure layer", to: "/india-agent-infrastructure-layer/" },
      { label: "Overkill ML lab: homelab versus AWS", to: "/overkill-ml-lab-homelab-rivals-aws/" },
      { label: "Live: running software", to: "/live/" },
    ],
  },
]

export const bySlug = (slug: string) => CHAPTERS.find(c => c.slug === slug)!
export const byN = (n: number) => CHAPTERS.find(c => c.n === n)!
