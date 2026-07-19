export type VisitorLens =
  | "AI Researcher"
  | "Frontier Lab Recruiter"
  | "Founder"
  | "Engineer"
  | "Open Source Contributor"

export type SourceLink = { label: string; href: string }

export const VISITOR_LENSES: VisitorLens[] = [
  "AI Researcher",
  "Frontier Lab Recruiter",
  "Founder",
  "Engineer",
  "Open Source Contributor",
]

export const LENS_FALLBACKS: Record<VisitorLens, string> = {
  "AI Researcher":
    "Aditya's work sits in the infrastructure layer around stateful agents: retrieval, memory, model routing, and local-first runtimes. The strongest research signal is the shift from prompt chains toward inspectable systems that maintain context over time.",
  "Frontier Lab Recruiter":
    "Aditya's signal is the ability to turn emerging agent-systems ideas into working infrastructure: local routing with subagent-fleet, backend-agnostic retrieval with embenx, and practical workflow tooling through AI Toolkit.",
  Founder:
    "Aditya is building in the gap between AI demos and durable product infrastructure: the memory, routing, and local execution layers teams need when agents become persistent and operational.",
  Engineer:
    "Aditya's work is strongest where systems behavior becomes explicit: control planes for local models, retrieval abstractions that reduce glue code, and tooling that makes LLM workflows easier to inspect and evaluate.",
  "Open Source Contributor":
    "The open-source signal is practical systems work with clear interfaces: subagent-fleet for local agent orchestration, embenx for unified retrieval across backends, and AI Toolkit for usable LLM workflow components.",
}

export const DEFAULT_FALLBACK_SOURCES: SourceLink[] = [
  { label: "Systems", href: "https://adityakarnam.com/systems/" },
  { label: "Thoughts", href: "https://adityakarnam.com/blog/" },
]

const PERSONA_SYSTEM_PROMPTS: Record<VisitorLens, string> = {
  "AI Researcher": "Answer as if speaking to an AI researcher: emphasize research framing, systems tradeoffs, and technical depth.",
  "Frontier Lab Recruiter": "Answer as if speaking to a technical recruiter at a frontier AI lab: emphasize impact, ownership, and the strongest signals from the work.",
  Founder: "Answer as if speaking to a startup founder: emphasize product thinking and what problem the work solves.",
  Engineer: "Answer as if speaking to a software engineer: emphasize implementation details and design decisions.",
  "Open Source Contributor": "Answer as if speaking to an open-source contributor: emphasize what is reusable, documented, and contribution-friendly.",
}

export const buildSystemMessage = (persona: VisitorLens): { role: "system"; content: string } => ({
  role: "system",
  content: [
    "You answer questions about Aditya Karnam's AI infrastructure work using only the provided source context.",
    "Do not invent achievements, roles, metrics, or unavailable projects.",
    "If the context does not support an answer, say you do not have enough source context to answer precisely.",
    "Keep answers under 150 words.",
    PERSONA_SYSTEM_PROMPTS[persona],
  ].join(" "),
})
