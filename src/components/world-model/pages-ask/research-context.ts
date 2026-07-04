export type VisitorLens =
  | "AI Researcher"
  | "Frontier Lab Recruiter"
  | "Founder"
  | "Engineer"
  | "Open Source Contributor"

export type ResearchSource = {
  label: string
  href: string
  summary: string
}

export type ProjectRecord = {
  slug: string
  name: string
  tags: string[]
  summary: string
  whyItMatters: string
  sources: ResearchSource[]
}

export const VISITOR_LENSES: VisitorLens[] = [
  "AI Researcher",
  "Frontier Lab Recruiter",
  "Founder",
  "Engineer",
  "Open Source Contributor",
]

export const PROJECTS: ProjectRecord[] = [
  {
    slug: "subagent-fleet",
    name: "subagent-fleet",
    tags: ["local inference", "model routing", "agent runtime", "observability"],
    summary:
      "A local AI compute control plane for Claude Code-style subagents that routes work across Ollama nodes, generates LiteLLM config, warms models, and exposes a live dashboard.",
    whyItMatters:
      "It makes local-first agent infrastructure more inspectable and reproducible by turning a set of machines and models into an explicit runtime.",
    sources: [
      {
        label: "subagent-fleet post",
        href: "/subagent-fleet-local-ai-compute-control-plane/",
        summary:
          "Explains the fleet.yaml control plane, LiteLLM generation, health checks, warmup flow, and dashboard.",
      },
    ],
  },
  {
    slug: "embenx",
    name: "embenx",
    tags: ["retrieval", "memory", "vector databases", "MCP"],
    summary:
      "A Python retrieval library with a unified Collection API across 15+ vector backends, plus hybrid search, temporal memory, agentic self-healing, and a built-in MCP server.",
    whyItMatters:
      "It treats retrieval and memory as infrastructure that should be backend-agnostic, inspectable, and reusable across agent systems.",
    sources: [
      {
        label: "embenx guide",
        href: "/embenx-python-embedding-toolkit/",
        summary:
          "Covers the unified API, hybrid dense+sparse search, temporal memory, and MCP memory interface.",
      },
      {
        label: "awesome-agentic-memory",
        href: "/awesome-agentic-memory/",
        summary:
          "Places embenx in the broader memory tooling landscape and highlights its backend coverage.",
      },
    ],
  },
  {
    slug: "ai-toolkit",
    name: "AI Toolkit",
    tags: ["LLM workflows", "prompt evaluation", "practical tooling"],
    summary:
      "A collection of interactive LLM workflow tools, including prompt composition, grading, and writing utilities.",
    whyItMatters:
      "It shows a bias toward operational tooling that makes model behavior easier to shape and evaluate in practice.",
    sources: [
      {
        label: "AI Toolkit",
        href: "/ai-toolkit/",
        summary:
          "Landing page for the toolkit and its interactive prompt tools.",
      },
    ],
  },
]

const BASE_POSITIONING =
  "Aditya Karnam is positioning his work around world model infrastructure: agents, memory, retrieval, model routing, local inference, tool interfaces, and evaluation systems."

export const ASK_MY_WORK_FALLBACK =
  "I could not generate a live answer right now, but the strongest grounded summary is that Aditya’s work focuses on world-model AI infrastructure: agents, memory, retrieval, model routing, local inference, and evals."

export const RESEARCH_LENS_FALLBACK =
  "Aditya builds infrastructure for world-model-driven AI: memory, retrieval, model routing, local inference, and evaluation systems that help agents become more reliable, stateful, and useful."

export const EXAMPLE_QUESTIONS = [
  "What is Aditya’s strongest AI infrastructure signal?",
  "How does his work relate to world models?",
  "Which project best shows agent systems depth?",
  "Explain subagent-fleet to a Staff Engineer.",
  "What should a frontier AI lab interview him for?",
]

export const LENS_FALLBACKS: Record<VisitorLens, string> = {
  "AI Researcher":
    "Aditya’s work sits in the infrastructure layer around stateful agents: retrieval, memory, model routing, and local-first runtimes. The strongest research signal is the shift from prompt chains toward inspectable systems that maintain context over time.",
  "Frontier Lab Recruiter":
    "Aditya’s signal is the ability to turn emerging agent-systems ideas into working infrastructure: local routing with subagent-fleet, backend-agnostic retrieval with embenx, and practical workflow tooling through AI Toolkit.",
  Founder:
    "Aditya is building in the gap between AI demos and durable product infrastructure: the memory, routing, and local execution layers teams need when agents become persistent and operational.",
  Engineer:
    "Aditya’s work is strongest where systems behavior becomes explicit: control planes for local models, retrieval abstractions that reduce glue code, and tooling that makes LLM workflows easier to inspect and evaluate.",
  "Open Source Contributor":
    "The open-source signal is practical systems work with clear interfaces: subagent-fleet for local agent orchestration, embenx for unified retrieval across backends, and AI Toolkit for usable LLM workflow components.",
}

export const FIXED_CONTEXT = [BASE_POSITIONING]
  .concat(
    PROJECTS.map((project) => {
      const sources = project.sources
        .map((source) => `- ${source.label}: ${source.href} — ${source.summary}`)
        .join("\n")

      return [
        `Project: ${project.name}`,
        `Tags: ${project.tags.join(", ")}`,
        `Summary: ${project.summary}`,
        `Why it matters: ${project.whyItMatters}`,
        `Sources:\n${sources}`,
      ].join("\n")
    })
  )
  .join("\n\n")

export const getSourcesForProject = (slug: string): ResearchSource[] =>
  PROJECTS.find((project) => project.slug === slug)?.sources ?? []

export const collectSources = (slugs: string[]): ResearchSource[] => {
  const seen = new Set<string>()

  return slugs
    .flatMap((slug) => getSourcesForProject(slug))
    .filter((source) => {
      if (seen.has(source.href)) {
        return false
      }

      seen.add(source.href)
      return true
    })
}

const includesAny = (value: string, terms: string[]) =>
  terms.some((term) => value.includes(term))

export const selectProjectSlugsForQuestion = (question: string): string[] => {
  const normalized = question.toLowerCase()
  const slugs = new Set<string>()

  if (includesAny(normalized, ["subagent", "fleet", "ollama", "local inference", "routing", "control plane"])) {
    slugs.add("subagent-fleet")
  }

  if (includesAny(normalized, ["embenx", "retrieval", "memory", "vector", "mcp", "rag"])) {
    slugs.add("embenx")
  }

  if (includesAny(normalized, ["toolkit", "prompt", "grader", "workflow", "eval"])) {
    slugs.add("ai-toolkit")
  }

  if (slugs.size === 0 && includesAny(normalized, ["world model", "signal", "research wedge", "frontier", "interview"])) {
    slugs.add("subagent-fleet")
    slugs.add("embenx")
    slugs.add("ai-toolkit")
  }

  return Array.from(slugs)
}

export const buildAskFallback = (question: string) => {
  const slugs = selectProjectSlugsForQuestion(question)
  const sources = collectSources(slugs.length > 0 ? slugs : ["subagent-fleet", "embenx"])

  if (slugs.includes("subagent-fleet") && slugs.length === 1) {
    return {
      text:
        "subagent-fleet is the clearest proof of local-first agent infrastructure work here. It turns a group of Ollama machines into an explicit control plane with declarative topology, LiteLLM config generation, model warmup, and a live dashboard for routing visibility.",
      sources,
    }
  }

  if (slugs.includes("embenx") && slugs.length === 1) {
    return {
      text:
        "embenx maps most directly to the memory and retrieval layer. The repo-backed write-up describes a unified Collection API across 15+ vector backends, plus hybrid search, temporal memory, agentic self-healing, and an MCP server for long-term memory access.",
      sources,
    }
  }

  if (slugs.includes("ai-toolkit") && slugs.length === 1) {
    return {
      text:
        "AI Toolkit is the practical workflow layer in this codebase. It is less about world modeling directly and more about shaping and evaluating model behavior through usable prompt tools, which supports the broader evals and operations side of the stack.",
      sources,
    }
  }

  if (includesAny(question.toLowerCase(), ["strongest", "signal", "best shows", "research wedge"])) {
    return {
      text:
        "The strongest infrastructure signal is the combination of subagent-fleet and embenx. subagent-fleet covers local runtime orchestration and routing, while embenx covers retrieval and memory abstraction. Together they show systems work below the chatbot surface.",
      sources,
    }
  }

  if (includesAny(question.toLowerCase(), ["world model", "relate"])) {
    return {
      text:
        "The current work maps to world-model infrastructure indirectly rather than claiming a full world model stack. embenx addresses memory and retrieval, subagent-fleet addresses runtime and local routing, and AI Toolkit contributes workflow and evaluation scaffolding around model behavior.",
      sources,
    }
  }

  if (includesAny(question.toLowerCase(), ["interview", "recruit", "frontier lab"])) {
    return {
      text:
        "A frontier AI lab would likely care most about the systems layer signals: local agent runtimes in subagent-fleet, backend-agnostic memory and retrieval in embenx, and the practical evaluation/tooling orientation visible in AI Toolkit.",
      sources,
    }
  }

  return {
    text: `${ASK_MY_WORK_FALLBACK} I do not have enough source context to answer more precisely than that.`,
    sources,
  }
}

export const buildLensFallback = (lens: VisitorLens) => ({
  text: LENS_FALLBACKS[lens] ?? RESEARCH_LENS_FALLBACK,
  sources: collectSources(["subagent-fleet", "embenx", "ai-toolkit"]),
})

