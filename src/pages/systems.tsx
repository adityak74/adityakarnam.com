import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { Link } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  ConsoleList,
  Divider,
  InlineLink,
  Panel,
  StatusRow,
  TagList,
  ThreeColumnGrid,
  TwoColumnGrid,
  WorldModelHero,
  WorldModelPageShell,
  WorldModelSection,
  labPalette,
} from "../components/world-model/pages-systems-stack-now/WorldModelPageChrome"

type InternalLinkEntry = {
  label: string
  to: string
}

type ExternalLinkEntry = {
  label: string
  href: string
}

type LinkEntry = InternalLinkEntry | ExternalLinkEntry

type SystemEntry = {
  name: string
  tags: string[]
  researchQuestion: string
  systemBuilt: string
  whyItMatters: string
  status: string
  proof: string[]
  links: LinkEntry[]
}

const systems: SystemEntry[] = [
  {
    name: "subagent-fleet",
    tags: ["local inference", "model routing", "coding agents", "ollama", "litellm"],
    researchQuestion:
      "Can local machines become a coordinated compute fleet for coding agents instead of a pile of disconnected Ollama endpoints?",
    systemBuilt:
      "An open-source control plane that generates LiteLLM routing config, Claude Code-style agent definitions, environment files, model warmup flows, and a live SSE dashboard from one fleet topology.",
    whyItMatters:
      "It turns agent role design into infrastructure. Planner, implementer, reviewer, and summarizer workloads can route to different models and machines with visible runtime behavior.",
    status: "Active experiment · open source",
    proof: [
      "One declarative fleet.yaml drives routes, agent files, and warmup flows.",
      "Live dashboard exposes node health, routing, trace stream, and warm model state.",
      "Published eval compares the local fleet against Sonnet 5 and GPT-4o-mini.",
    ],
    links: [
      { label: "System write-up", to: "/subagent-fleet-local-ai-compute-control-plane" },
      { label: "Docs site", href: "https://adityak74.github.io/subagent-fleet/" },
      { label: "GitHub", href: "https://github.com/adityak74/subagent-fleet" },
    ],
  },
  {
    name: "embenx",
    tags: ["retrieval", "memory layer", "hybrid search", "temporal memory", "mcp"],
    researchQuestion:
      "Can retrieval infrastructure become backend-agnostic without giving up the features agents need for durable memory?",
    systemBuilt:
      "A Python retrieval library with a unified Collection API across 15+ vector backends, plus hybrid search, metadata filtering, reranking, temporal memory, self-healing retrieval, and a built-in MCP server.",
    whyItMatters:
      "AI agent systems need a memory layer that survives backend changes and exposes retrieval behavior explicitly instead of burying it in one-off adapters.",
    status: "Shipping library · active development",
    proof: [
      "One API spans FAISS, pgvector, LanceDB, Milvus, Qdrant, and more.",
      "TemporalCollection adds recency-aware retrieval for session and episodic memory.",
      "The roadmap already points toward state hydration and trajectory retrieval.",
    ],
    links: [
      { label: "Guide", to: "/embenx-python-embedding-toolkit" },
      { label: "Docs site", href: "https://adityak74.github.io/embenx/" },
      { label: "GitHub", href: "https://github.com/adityak74/embenx" },
    ],
  },
  {
    name: "AI Toolkit",
    tags: ["workflow tooling", "prompt evaluation", "prompt rewriting", "interfaces"],
    researchQuestion:
      "What lightweight tooling helps make LLM workflows more inspectable before they become larger agent systems?",
    systemBuilt:
      "A practical tool suite with an Intelligent Prompt Composer, a Prompt Grader & Rewriter, and a Tweet Thread Generator for shaping prompts, checking quality dimensions, and creating repeatable outputs.",
    whyItMatters:
      "Even small tools reinforce the same thesis: useful agent systems need explicit structure, evaluation hints, guardrails, and visible operator control.",
    status: "Live product page",
    proof: [
      "Prompt Grader scores prompts across goals, constraints, output format, evaluation hints, and guardrails.",
      "Composer exposes role, tone, output format, verbosity, and thinking mode as controllable inputs.",
      "The toolkit acts as a low-friction proving ground for runtime ergonomics.",
    ],
    links: [
      { label: "Toolkit page", to: "/ai-toolkit" },
      { label: "Prompt Composer", to: "/ai-toolkit/intelligent-prompt-composer" },
      { label: "Prompt Grader", to: "/ai-toolkit/prompt-grader/" },
    ],
  },
  {
    name: "awesome-agentic-memory",
    tags: ["memory research", "mcp", "knowledge graphs", "field mapping"],
    researchQuestion:
      "What does the current memory landscape look like when you compare agent frameworks, MCP servers, vector databases, and temporal-memory approaches side by side?",
    systemBuilt:
      "A curated, continuously updated landscape page covering agent memory frameworks, MCP memory servers, vector backends, and research directions relevant to long-horizon agents.",
    whyItMatters:
      "Owning a category requires mapping the space, not just shipping one project. This page makes the memory layer legible and helps place new work in context.",
    status: "Public resource · active curation",
    proof: [
      "Includes a framework comparison across memory types, backends, and MCP support.",
      "Highlights embenx inside a wider ecosystem instead of treating it in isolation.",
      "Connects production tooling to research-oriented memory patterns.",
    ],
    links: [
      { label: "Resource page", to: "/awesome-agentic-memory/" },
      { label: "GitHub", href: "https://github.com/aviskaar/awesome-agentic-memory" },
    ],
  },
]

const SystemsPage = (_props: PageProps) => (
  <Layout>
    <WorldModelPageShell>
      <WorldModelHero
        eyebrow="Current Systems"
        title="Research artifacts, not portfolio cards."
        description="These systems map to the infrastructure layer behind reliable AI agents: runtime control, memory, retrieval, interface design, and practical evaluation. Each one is grounded in work already published in this codebase."
        aside={
          <div>
            <div
              style={{
                color: labPalette.slate,
                fontFamily:
                  "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
                fontSize: "0.76rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Observe → Model → Simulate → Act → Evaluate → Update
            </div>
            <ConsoleList
              items={[
                "runtime control through subagent-fleet",
                "retrieval and memory abstractions through embenx",
                "prompt shaping and review loops through AI Toolkit",
                "ecosystem mapping through awesome-agentic-memory",
              ]}
            />
          </div>
        }
      />

      <Divider />

      <WorldModelSection
        eyebrow="Stack Fit"
        title="The systems ladder"
        description="The projects do different jobs, but they fit together as one thesis. Local runtime control, durable retrieval, operator-facing interfaces, and memory research are separate layers of the same emerging stack."
      >
        <ThreeColumnGrid>
          <Panel accent="cyan">
            <h3 style={{ marginTop: 0, color: labPalette.heading }}>Runtime + routing</h3>
            <p style={{ color: labPalette.body }}>
              <InlineLink to="/subagent-fleet-local-ai-compute-control-plane">
                subagent-fleet
              </InlineLink>{" "}
              is the clearest runtime artifact: role-aware routing, warmup, health checks, and a
              visible control plane for local coding agents.
            </p>
          </Panel>
          <Panel accent="green">
            <h3 style={{ marginTop: 0, color: labPalette.heading }}>Memory + retrieval</h3>
            <p style={{ color: labPalette.body }}>
              <InlineLink to="/embenx-python-embedding-toolkit">embenx</InlineLink> and{" "}
              <InlineLink to="/awesome-agentic-memory/">awesome-agentic-memory</InlineLink> cover
              the retrieval and memory layer from two sides: implementation and landscape mapping.
            </p>
          </Panel>
          <Panel accent="slate">
            <h3 style={{ marginTop: 0, color: labPalette.heading }}>Interfaces + eval hints</h3>
            <p style={{ color: labPalette.body }}>
              <InlineLink to="/ai-toolkit">AI Toolkit</InlineLink> keeps human operators in the
              loop with explicit structure, scoring heuristics, and reproducible prompt surfaces.
            </p>
          </Panel>
        </ThreeColumnGrid>
      </WorldModelSection>

      <WorldModelSection
        eyebrow="Artifact Index"
        title="Current systems"
        description="Each page below is framed as a system with a question, a build artifact, and a claim about what the next AI infrastructure layer needs."
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          {systems.map(system => (
            <Panel key={system.name} accent={system.name === "embenx" ? "green" : "cyan"}>
              <div
                style={{
                  alignItems: "flex-start",
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                }}
              >
                <div>
                  <h3
                    style={{
                      color: labPalette.heading,
                      fontSize: "1.7rem",
                      letterSpacing: "-0.04em",
                      margin: "0 0 0.8rem",
                    }}
                  >
                    {system.name}
                  </h3>
                  <TagList items={system.tags} />
                  <div style={{ marginTop: "1rem" }}>
                    <StatusRow label="Research question" value={system.researchQuestion} />
                    <StatusRow label="System built" value={system.systemBuilt} />
                    <StatusRow label="Why it matters" value={system.whyItMatters} />
                    <StatusRow label="Status" value={system.status} />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      color: labPalette.slate,
                      fontFamily:
                        "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
                      fontSize: "0.76rem",
                      letterSpacing: "0.06em",
                      marginBottom: "0.85rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Proof points
                  </div>
                  <ConsoleList items={system.proof} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", marginTop: "1rem" }}>
                    {system.links.map(link =>
                      "to" in link ? (
                        <Link
                          key={link.label}
                          to={link.to}
                          style={{
                            color: labPalette.cyan,
                            fontSize: "0.95rem",
                            textDecoration: "none",
                          }}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          key={link.label}
                          href={link.href}
                          rel="noreferrer"
                          target="_blank"
                          style={{
                            color: labPalette.green,
                            fontSize: "0.95rem",
                            textDecoration: "none",
                          }}
                        >
                          {link.label}
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </WorldModelSection>

      <WorldModelSection
        eyebrow="Next Reads"
        title="Continue through the lab"
        description="The systems page is the artifact index. The other two pages in this slice explain the architecture and what is currently being pushed forward."
      >
        <TwoColumnGrid>
          <Panel accent="cyan">
            <h3 style={{ marginTop: 0, color: labPalette.heading }}>Read the stack</h3>
            <p style={{ color: labPalette.body }}>
              The <InlineLink to="/stack/">stack page</InlineLink> turns the thesis into a concrete
              systems map: runtime, memory, retrieval, simulation, tools, routing, and evaluation.
            </p>
          </Panel>
          <Panel accent="green">
            <h3 style={{ marginTop: 0, color: labPalette.heading }}>Read the now board</h3>
            <p style={{ color: labPalette.body }}>
              The <InlineLink to="/now/">now page</InlineLink> captures the current active fronts:
              local compute orchestration, memory infrastructure, and practical builder tooling.
            </p>
          </Panel>
        </TwoColumnGrid>
      </WorldModelSection>
    </WorldModelPageShell>
  </Layout>
)

export default SystemsPage

export const Head: HeadFC = () => (
  <Seo
    title="Systems"
    description="Current systems by Aditya Karnam across runtime control, retrieval, memory infrastructure, and operator-facing AI tooling."
    pathname="/systems/"
  />
)
