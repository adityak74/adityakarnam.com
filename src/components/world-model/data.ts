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
  {
    name: "mcp-scholarly",
    slug: "/mcp-scholarly/",
    tags: ["MCP", "research retrieval", "academic search", "tool interface"],
    researchQuestion: "Can AI agents retrieve verified academic knowledge without hallucinating citations?",
    systemBuilt:
      "An MCP server that lets agents search and retrieve accurate academic articles from scholarly databases, giving agents a direct path to peer-reviewed literature.",
    whyItMatters:
      "Research-grounded agents need a reliable retrieval path to scholarly knowledge. mcp-scholarly closes the gap between LLM training data and verifiable, up-to-date academic sources.",
    status: "Shipping / active",
    links: [
      { label: "GitHub", href: "https://github.com/adityak74/mcp-scholarly" },
    ],
    explanationModes: {
      "Research Idea":
        "mcp-scholarly explores whether agents can cite and reason over real academic literature rather than relying on potentially stale or hallucinated training knowledge.",
      "System Design":
        "It exposes a standard MCP interface that any compatible agent can call to search scholarly indexes, returning structured article metadata that agents can cite and reason over.",
      "Business Value":
        "It gives research-adjacent AI workflows a credibility layer, making agent outputs grounded in verifiable sources rather than model priors.",
      "Code Walkthrough":
        "Start with the MCP server entry point, inspect the search handler and result schema, then review how article metadata is normalized for agent consumption.",
    },
  },
  {
    name: "locobench",
    slug: "/locobench/",
    tags: ["evals", "local inference", "coding models", "benchmarking"],
    researchQuestion: "How do local coding models actually compare on real tasks when evaluated systematically instead of guessed at?",
    systemBuilt:
      "LoCoBench — a local coding model benchmark that runs a reproducible evaluation suite against locally-hosted models to expose performance differences that spec sheets hide.",
    whyItMatters:
      "Local coding agents need trusted eval data. LoCoBench makes the comparison ground truth available for builders selecting models for local agent fleets instead of relying on benchmark marketing.",
    status: "Early experiment",
    links: [
      { label: "GitHub", href: "https://github.com/adityak74/locobench" },
    ],
    explanationModes: {
      "Research Idea":
        "LoCoBench asks whether a lightweight, reproducible benchmark can expose the real performance gap between local coding models that all claim to be competitive.",
      "System Design":
        "It runs a fixed task suite against locally-served models via a shell harness, collecting pass/fail rates, latency, and output quality to generate a comparable scorecard.",
      "Business Value":
        "Teams choosing between local models for coding agents can run LoCoBench on their own hardware and get a decision-ready comparison rather than guessing from leaderboard numbers.",
      "Code Walkthrough":
        "Start with the task definitions, then inspect the runner script, model invocation layer, and output normalizer that feeds the final comparison report.",
    },
  },
  {
    name: "learn-anything-24h",
    slug: "/learn-anything-24h/",
    tags: ["agent skills", "active learning", "claude-code", "LLM", "education"],
    researchQuestion: "Can a single structured skill turn any complex topic into a rigorous 24-hour active-learning sprint using AI agents?",
    systemBuilt:
      "A Claude Code / Codex skill that decomposes any topic into spaced-repetition tasks, active recall prompts, and a timed learning sequence with LLM-guided evaluation.",
    whyItMatters:
      "AI agents are increasingly used for self-directed learning, but few systems encode pedagogical rigor into the agent workflow itself. This skill closes the gap by making the learning loop agent-executable.",
    status: "Active experiment",
    links: [
      { label: "GitHub", href: "https://github.com/adityak74/learn-anything-24h" },
    ],
    explanationModes: {
      "Research Idea":
        "learn-anything-24h explores whether deliberate practice techniques — spaced repetition, active recall, interleaving — can be codified as an agent skill instead of a static study guide.",
      "System Design":
        "The skill accepts a topic, generates a structured 24-hour task sequence, and uses an LLM evaluation loop to grade recall and adjust difficulty across sessions.",
      "Business Value":
        "It gives developers and researchers a fast ramp to any new technical domain, with the structure of a designed curriculum rather than an open-ended chat session.",
      "Code Walkthrough":
        "Start with the skill entry point and topic decomposer, then inspect the task generator, recall evaluation loop, and session state tracker that carries progress across checkpoints.",
    },
  },
  {
    name: "quecto",
    slug: "/quecto/",
    tags: ["Rust", "agent runtime", "local inference", "coding agent", "zero async"],
    researchQuestion: "How small and fast can a fully capable AI agent harness be when built in Rust with zero async overhead?",
    systemBuilt:
      "A minimal Rust AI interface framework: a ~1.2 MB synchronous core library for OpenAI-compatible endpoints, plus quecto-agent — a full coding agent with multi-step tool use, SQLite-backed session persistence, and an approval-gated sandbox.",
    whyItMatters:
      "Most agent runtimes carry heavyweight async stacks and large dependency trees. quecto proves that a self-contained, statically-linked binary with only two direct dependencies can still deliver a complete coding agent with resume, undo, and diff.",
    status: "Shipped / active",
    links: [
      { label: "GitHub", href: "https://github.com/adityak74/quecto" },
    ],
    explanationModes: {
      "Research Idea":
        "quecto asks whether agent runtime complexity is accidental or essential — and whether stripping async, eliminating hidden dependencies, and going synchronous-first changes what's possible at the infrastructure edge.",
      "System Design":
        "The core is a four-function library (buffered + streaming modes) over ureq + serde_json. quecto-agent layers tool use, a hard-denylist sandbox, trust-on-first-use manifests, and SQLite session state on top.",
      "Business Value":
        "A ~1 MB statically-linked agent binary that works with Ollama, LM Studio, or OpenAI and needs no runtime installation is a practical primitive for embedding agents in constrained or air-gapped environments.",
      "Code Walkthrough":
        "Start with the core four-function API and streaming path, then move to quecto-agent's tool dispatch loop, sandbox denylist, manifest flavor loading, and SQLite session resume/undo flow.",
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
