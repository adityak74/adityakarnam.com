export type WorldModelLayer = {
  name: string
  description: string
  relevantWork: string[]
}

export type ResearchTrack = {
  title: string
  question: string
}

export type SystemArtifact = {
  name: string
  slug: string
  tags: string[]
  researchQuestion: string
  systemBuilt: string
  whyItMatters: string
  status: string
  links: {
    label: string
    href: string
  }[]
  explanationModes: Record<string, string>
}

export type FieldNote = {
  title: string
  href?: string
  status: string
  thesis: string
}

export const siteIdentity = {
  name: "Aditya Karnam",
  title: "World Model Infrastructure Builder",
  labName: "World Model Infrastructure Lab",
  tagline: "Building the infrastructure layer for world-model-driven AI.",
  supportingLine: "Building the systems layer for agents that remember, simulate, and act.",
  subtitle: "Agents · Memory · Retrieval · Simulation · Local Inference · Evals",
  loop: ["Observe", "Model", "Simulate", "Act", "Evaluate", "Update"],
}

export const heroBootSequence = [
  "initializing world model stack...",
  "loading memory layer...",
  "routing local + cloud models...",
  "attaching tool interfaces...",
  "starting simulation loop...",
  "ready",
]

export const worldModelStack: WorldModelLayer[] = [
  {
    name: "World-Model Applications",
    description: "Interfaces where persistent, stateful AI systems surface to users and operators.",
    relevantWork: ["Applied agent workflows", "AI Toolkit utilities", "Research notes"],
  },
  {
    name: "Agent Runtime",
    description: "Execution layer for planners, implementers, reviewers, and agent role orchestration.",
    relevantWork: ["subagent-fleet", "Claude Code workflows", "MCP exploration"],
  },
  {
    name: "State + Memory Layer",
    description: "Durable context about tasks, users, tools, and prior outcomes over long horizons.",
    relevantWork: ["awesome-agentic-memory", "agentic memory research", "photographic memory ideas"],
  },
  {
    name: "Retrieval + Context Layer",
    description: "Backend-agnostic search, filtering, and recall for relevant context at runtime.",
    relevantWork: ["embenx", "RAG workflows", "vector backend abstraction"],
  },
  {
    name: "Simulation / Prediction Layer",
    description: "Pre-action reasoning loops, sandboxed what-if evaluation, and future-state planning.",
    relevantWork: ["Evaluation prototypes", "research agenda", "planned field notes"],
  },
  {
    name: "Tool + Environment Interface",
    description: "Connectors and protocols that let agents observe, read, write, and act safely.",
    relevantWork: ["MCP", "Claude skills", "AI Toolkit", "automation workflows"],
  },
  {
    name: "Model Routing + Local/Cloud Inference",
    description: "Routing policies across local Ollama nodes, hosted models, and specialized backends.",
    relevantWork: ["subagent-fleet", "Ollama", "LiteLLM", "OpenRouter workflows"],
  },
  {
    name: "Observability + Evaluation",
    description: "Operational visibility and behavior measurement for systems acting over time.",
    relevantWork: ["Prompt grader", "structured agent evaluation", "trace-driven workflows"],
  },
]

export const researchAgenda: ResearchTrack[] = [
  {
    title: "Agent State",
    question: "How should AI agents maintain a durable model of users, tasks, tools, goals, and environments?",
  },
  {
    title: "Memory Infrastructure",
    question: "How should agents retrieve, compress, forget, and update knowledge over long horizons?",
  },
  {
    title: "Simulation Loops",
    question: "How can agents test possible actions before acting?",
  },
  {
    title: "Model Routing",
    question: "How should AI systems route between language models, vision models, local models, specialized tools, and simulators?",
  },
  {
    title: "Evals for Agency",
    question: "How do we evaluate systems that act over time instead of answering one prompt?",
  },
  {
    title: "Local-First Intelligence",
    question: "How can builders run powerful AI infrastructure without depending entirely on closed platforms?",
  },
]

export const systems: SystemArtifact[] = [
  {
    name: "quecto",
    slug: "/quecto-rust-ai-harness/",
    tags: ["agent runtime", "local inference", "Rust", "zero-dependency", "coding agent"],
    researchQuestion: "Can a fully functional AI coding agent harness be statically-linked, zero-async, and fit under 4 MB without sacrificing core functionality?",
    systemBuilt:
      "A Rust-native AI harness with a 1.2 MB core and a 3.3 MB coding agent, compiled to a single statically-linked binary with zero async overhead and no runtime dependencies.",
    whyItMatters:
      "Most AI agent frameworks bring heavy runtimes, async schedulers, and bloated dependency trees. quecto explores the opposite: minimal, auditable, locally-deployable harness infrastructure that can run anywhere a binary can run.",
    status: "Active experiment",
    links: [
      { label: "GitHub", href: "https://github.com/adityak74/quecto" },
    ],
    explanationModes: {
      "Research Idea":
        "quecto asks whether the AI agent harness layer can be radically compressed: a statically-linked binary under 4 MB that still exposes the core primitives needed to drive a coding agent.",
      "System Design":
        "The harness separates a 1.2 MB core (model interface, tool dispatch, state) from a 3.3 MB coding agent shell, compiled with no async executor so the execution model is fully predictable.",
      "Business Value":
        "A zero-dependency binary means agents can be embedded in CI pipelines, edge systems, or airgapped machines without Python runtimes, async event loops, or platform-specific installs.",
      "Code Walkthrough":
        "Start with the Rust core crate, then inspect the tool dispatch layer, the agent shell that wraps it, and the static linking configuration that produces the final binary.",
    },
  },
  {
    name: "locobench",
    slug: "/locobench-local-coding-model-benchmark/",
    tags: ["evals", "benchmarks", "local inference", "coding models", "observability"],
    researchQuestion: "How do local coding models actually compare on real coding tasks when measured with a standardized, reproducible benchmark?",
    systemBuilt:
      "LoCoBench, an open benchmark harness for evaluating local coding language models across standardized code-generation and problem-solving tasks with structured result output.",
    whyItMatters:
      "Choosing a local coding model today means guessing from blog posts. LoCoBench makes the tradeoffs measurable so builders can select the right model for their local-first agent stack based on real task performance.",
    status: "Active experiment",
    links: [
      { label: "GitHub", href: "https://github.com/adityak74/locobench" },
    ],
    explanationModes: {
      "Research Idea":
        "LoCoBench asks whether a lightweight, reproducible harness can produce actionable comparisons between local coding models so teams pick based on evidence instead of benchmarks run on different hardware.",
      "System Design":
        "It defines a task corpus, a structured eval loop, and a result schema so benchmark runs are comparable across model versions, quantization levels, and inference runtimes.",
      "Business Value":
        "Teams building local-first agent stacks can use LoCoBench output directly to choose the model-size-to-quality tradeoff that fits their hardware budget and latency requirements.",
      "Code Walkthrough":
        "Start with the task definitions, then inspect the eval loop, runtime adapters, and the output schema that captures pass rate, latency, and token throughput per model.",
    },
  },
  {
    name: "learn-anything-24h",
    slug: "/learn-anything-24h-claude-code-skill/",
    tags: ["agent skills", "Claude Code", "active learning", "education", "prompt engineering"],
    researchQuestion: "Can an AI agent scaffold a complete, structured 24-hour active-learning curriculum from any complex topic using only a single skill invocation?",
    systemBuilt:
      "A Claude Code / Codex skill that transforms any topic into a structured 24-hour sprint with active recall exercises, curated materials, and research paper integration.",
    whyItMatters:
      "Learning infrastructure for AI builders is underexplored. This skill bridges LLM tool-use and structured pedagogy, turning a model's knowledge synthesis capability into a repeatable onboarding harness for any technical domain.",
    status: "Shipping",
    links: [
      { label: "GitHub", href: "https://github.com/adityak74/learn-anything-24h" },
    ],
    explanationModes: {
      "Research Idea":
        "learn-anything-24h explores whether agent skills can compress expert-level topic onboarding into a reproducible workflow, using active recall and spaced repetition principles rather than passive reading.",
      "System Design":
        "The skill decomposes a topic into learning modules, generates active-recall prompts per module, identifies canonical research papers, and structures the output as a timed 24-hour sprint.",
      "Business Value":
        "Builders entering a new technical domain (a new model architecture, a new backend, a new protocol) can use the skill to accelerate productive contribution from days to hours.",
      "Code Walkthrough":
        "Start with the skill entry point, then inspect the topic decomposition prompt, the active-recall generation step, the research paper lookup, and the final sprint structure assembly.",
    },
  },
  {
    name: "subagent-fleet",
    slug: "/subagent-fleet-local-ai-compute-control-plane/",
    tags: ["local inference", "model routing", "coding agents", "Ollama", "LiteLLM"],
    researchQuestion: "Can local machines become a practical compute fleet for AI coding agents?",
    systemBuilt:
      "An open-source local AI compute control plane that generates agent definitions, LiteLLM routing config, warmup flows, and a live dashboard from one declarative fleet topology.",
    whyItMatters:
      "Persistent agent systems get expensive fast. Local-first routing turns spare Macs, workstations, and Ollama nodes into inspectable infrastructure instead of one opaque endpoint.",
    status: "Active experiment",
    links: [
      { label: "Write-up", href: "/subagent-fleet-local-ai-compute-control-plane/" },
      { label: "GitHub", href: "https://github.com/adityak74/subagent-fleet" },
      { label: "Docs", href: "https://adityak74.github.io/subagent-fleet/" },
    ],
    explanationModes: {
      "Research Idea":
        "subagent-fleet explores whether local compute can become a practical substrate for coding agents by routing roles like planner, implementer, and reviewer to different local models.",
      "System Design":
        "The system treats a fleet topology as source of truth, then generates LiteLLM config, Claude-style agent files, warmup commands, and a live operations dashboard around that topology.",
      "Business Value":
        "It reduces dependence on hosted coding-agent platforms and creates a path toward cheaper, private, local-first agent infrastructure for engineering teams.",
      "Code Walkthrough":
        "Start with fleet topology and model aliases, then inspect config generation, node health checks, warmup routines, and the trace stream that shows how requests move across machines.",
    },
  },
  {
    name: "embenx",
    slug: "/embenx-python-embedding-toolkit/",
    tags: ["retrieval", "memory layer", "vector backends", "MCP", "hybrid search"],
    researchQuestion: "Can retrieval infrastructure for agents become backend-agnostic without losing practical control?",
    systemBuilt:
      "A Python retrieval library with a unified Collection API across 15+ vector backends, plus metadata filtering, reranking, hybrid search, temporal recall, and an MCP server.",
    whyItMatters:
      "World-model-driven agents need a swappable and inspectable memory substrate. embenx reduces retrieval glue code while preserving the ability to choose the right storage backend per workload.",
    status: "Shipping / active",
    links: [
      { label: "Write-up", href: "/embenx-python-embedding-toolkit/" },
      { label: "GitHub", href: "https://github.com/adityak74/embenx" },
      { label: "PyPI", href: "https://pypi.org/project/embenx/" },
    ],
    explanationModes: {
      "Research Idea":
        "embenx explores whether agent memory infrastructure can be portable, so retrieval logic stays stable even as teams swap FAISS, pgvector, LanceDB, or other backends.",
      "System Design":
        "It exposes one Collection interface and pushes backend differences behind adapters, while adding higher-level behaviors like filters, hybrid search, temporal retrieval, and reranking.",
      "Business Value":
        "Teams can migrate retrieval backends without rewriting application logic, which cuts vendor lock-in and reduces the hidden integration cost inside AI products.",
      "Code Walkthrough":
        "Start with Collection creation, then inspect backend adapters, metadata filtering, hybrid sparse-dense fusion, and temporal search classes that bias toward recent state.",
    },
  },
  {
    name: "AI Toolkit",
    slug: "/ai-toolkit/",
    tags: ["tool interface", "prompt systems", "evals", "workflow tooling"],
    researchQuestion: "What lightweight tools make LLM workflows more inspectable and repeatable for builders?",
    systemBuilt:
      "A set of practical prompt and workflow tools including a prompt grader, intelligent prompt composer, and thread generator for turning vague inputs into more structured model interactions.",
    whyItMatters:
      "Reliable AI systems need a disciplined interface layer. These tools sharpen prompts, evaluation criteria, and operator workflows before heavier agent runtime infrastructure is added.",
    status: "Shipping",
    links: [
      { label: "Toolkit", href: "/ai-toolkit/" },
      { label: "Prompt Grader", href: "/ai-toolkit/prompt-grader/" },
      { label: "Prompt Composer", href: "/ai-toolkit/intelligent-prompt-composer/" },
    ],
    explanationModes: {
      "Research Idea":
        "AI Toolkit looks at the pre-runtime layer: how better prompting, grading, and workflow scaffolding can make model behavior easier to steer and audit.",
      "System Design":
        "The toolkit packages focused UI tools that each structure one part of the interaction loop, such as prompt specification, quality review, or output formatting.",
      "Business Value":
        "It gives teams immediate leverage on model quality without waiting for a full platform build, and it helps standardize prompting across operators.",
      "Code Walkthrough":
        "Inspect the prompt transformers and grading dimensions first, then review how the UI captures user input, applies structured heuristics, and renders actionable guidance.",
    },
  },
  {
    name: "awesome-agentic-memory",
    slug: "/awesome-agentic-memory/",
    tags: ["memory research", "MCP", "ecosystem map", "agent frameworks"],
    researchQuestion: "What does the current memory ecosystem reveal about the missing systems layer for agentic AI?",
    systemBuilt:
      "A curated research and tooling map across agent memory frameworks, MCP servers, vector stores, graph backends, and emerging papers.",
    whyItMatters:
      "Thought leadership in an emerging category requires ecosystem compression. This project translates a fragmented memory landscape into a clearer infrastructure map.",
    status: "Active knowledge base",
    links: [
      { label: "Guide", href: "/awesome-agentic-memory/" },
      { label: "GitHub", href: "https://github.com/aviskaar/awesome-agentic-memory" },
    ],
    explanationModes: {
      "Research Idea":
        "The guide asks whether agent memory is becoming a real infrastructure category with identifiable layers, standards, and tradeoffs instead of a grab bag of vector stores.",
      "System Design":
        "It organizes memory systems by framework, backend, and protocol so builders can compare persistent context patterns without sifting through disconnected repos.",
      "Business Value":
        "It shortens evaluation time for teams deciding how to add memory to agent workflows and positions memory as a systems problem rather than a feature checkbox.",
      "Code Walkthrough":
        "This artifact is more map than codebase; start with the category tables, then compare MCP support, memory types, and backend tradeoffs across the listed tools.",
    },
  },
]

export const fieldNotes: FieldNote[] = [
  {
    title: "The Missing Infrastructure Layer for World-Model AI",
    status: "planned field note",
    thesis:
      "Foundation models are not enough for reliable real-world agency. The next category is the infrastructure around them: state, memory, routing, simulation, and evals.",
  },
  {
    title: "From RAG to State: Why Agent Memory Is Not Just Retrieval",
    status: "planned field note",
    thesis:
      "RAG retrieves facts. Agent memory needs to maintain evolving state about users, tools, goals, failures, and plans across time.",
  },
  {
    title: "Local-First AI Infrastructure for Agent Builders",
    status: "planned field note",
    thesis:
      "As agent workflows become persistent and expensive, local inference and routing become an infrastructure advantage rather than a hobbyist optimization.",
  },
  {
    title: "subagent-fleet: Local AI Compute Control Plane for Coding Agents",
    href: "/subagent-fleet-local-ai-compute-control-plane/",
    status: "published system note",
    thesis:
      "A local AI control plane can get materially closer to frontier coding quality than most people expect, while preserving privacy and operator control.",
  },
  {
    title: "I Ran Local LLM Evals on an Apple Silicon Mac",
    href: "/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon/",
    status: "published eval note",
    thesis:
      "Local inference decisions should be based on measured runtime behavior, memory pressure, visible answer quality, and model-size tradeoffs, not just architecture claims.",
  },
  {
    title: "embenx Guide: The Ultimate Python Library for Vector Search",
    href: "/embenx-python-embedding-toolkit/",
    status: "published system note",
    thesis:
      "Retrieval logic should outlive any single vector backend, especially for agent memory systems that will evolve as workloads change.",
  },
]

export const lensOptions = [
  "AI Researcher",
  "Frontier Lab Recruiter",
  "Founder",
  "Engineer",
  "Open Source Contributor",
]

export const lensFallbacks: Record<string, string> = {
  "AI Researcher":
    "Aditya's work sits in the infrastructure layer around world-model agents: memory, retrieval, model routing, local inference, and tool orchestration. The strongest research signal is the push from prompt chains toward inspectable, stateful systems.",
  "Frontier Lab Recruiter":
    "Aditya's signal is the ability to turn emerging AI infrastructure ideas into usable systems: agent runtimes, retrieval layers, model routing, and local-first inference tooling grounded in real code.",
  Founder:
    "Aditya is building in the gap between AI demos and AI-native infrastructure: the layer teams will need when agents become persistent, stateful, and operational.",
  Engineer:
    "Aditya's work is strongest where systems engineering meets applied AI: routing, retrieval, observability, tooling, and infrastructure that make agent workflows less brittle in practice.",
  "Open Source Contributor":
    "Aditya contributes practical infrastructure artifacts that help other builders experiment with agent memory, retrieval, local inference, and coding-agent workflows without starting from scratch.",
}

export const askPromptSuggestions = [
  "What is Aditya's strongest AI infrastructure signal?",
  "How does his work relate to world models?",
  "Which project best shows agent systems depth?",
  "Explain subagent-fleet to a Staff Engineer.",
  "What should a frontier AI lab interview him for?",
  "What is his research wedge?",
]

export const operatingPrinciples = [
  "Useful AI systems need more than better prompts.",
  "They need memory that can be inspected.",
  "They need tools that can be audited.",
  "They need models that can be routed.",
  "They need state that can be updated.",
  "They need evals that measure behavior over time.",
  "They need local-first infrastructure so builders can experiment without waiting for permission.",
]

export const currentInvestigations = [
  {
    label: "Memory",
    detail: "Backend-agnostic retrieval, temporal recall, and agent memory abstractions that stay portable across storage layers.",
  },
  {
    label: "Routing",
    detail: "Local-plus-cloud model routing policies for planner / implementer / reviewer agent roles and cost-aware execution.",
  },
  {
    label: "Observability",
    detail: "Tracing, warmup visibility, and evaluation loops that make long-running agent behavior auditable.",
  },
]
