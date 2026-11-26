import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import FleetRouter from "../components/world-model/anim/FleetRouter"
import { Page, Title, Section, RuledList, Row } from "../components/world-model/pages-systems-stack-now/editorial"

const systems: Row[] = [
  {
    key: "fleet",
    meta: "Open source",
    tag: "local inference · routing · ollama · litellm",
    title: "subagent-fleet",
    body: "Question: can local machines act as one compute fleet for coding agents, instead of a pile of disconnected Ollama endpoints? One declarative fleet.yaml generates LiteLLM routes, Claude Code-style agent files, env files and warmup flows. A live dashboard shows node health, routing, the trace stream and warm models. The published eval compares the fleet against Sonnet 5 and GPT-4o-mini.",
    links: [
      { label: "Write-up", to: "/subagent-fleet-local-ai-compute-control-plane" },
      { label: "Docs", href: "https://adityak74.github.io/subagent-fleet/" },
      { label: "GitHub", href: "https://github.com/adityak74/subagent-fleet" },
    ],
  },
  {
    key: "embenx",
    meta: "Library",
    tag: "retrieval · memory · hybrid search · mcp",
    title: "embenx",
    body: "Question: can retrieval be backend-agnostic without losing the features agents need for durable memory? A Collection API spans 15+ backends including FAISS, pgvector, LanceDB, Milvus and Qdrant, with hybrid search, metadata filtering, reranking, a TemporalCollection for recency-aware memory, and a built-in MCP server.",
    links: [
      { label: "Guide", to: "/embenx-python-embedding-toolkit" },
      { label: "Docs", href: "https://adityak74.github.io/embenx/" },
      { label: "GitHub", href: "https://github.com/adityak74/embenx" },
    ],
  },
  {
    key: "quecto",
    meta: "Open source",
    tag: "harness · coding agent · rust",
    title: "Quecto",
    body: "Question: how small can an agent harness be and still be evaluable? A 1.3 MB core and a 5.5 MB coding agent, with approval gating, a sandbox denylist, post-edit verification gates and SQLite session persistence.",
    links: [
      { label: "Project", to: "/quecto/" },
      { label: "GitHub", href: "https://github.com/adityak74/quecto" },
    ],
  },
  {
    key: "toolkit",
    meta: "Live",
    tag: "prompt evaluation · tooling",
    title: "AI Toolkit",
    body: "Question: what lightweight tooling makes LLM workflows inspectable before they become agent systems? A Prompt Composer, a Prompt Grader and Rewriter that scores goals, constraints, output format, evaluation hints and guardrails, and a thread generator.",
    links: [
      { label: "Toolkit", to: "/ai-toolkit" },
      { label: "Prompt Grader", to: "/ai-toolkit/prompt-grader/" },
    ],
  },
  {
    key: "memory",
    meta: "Resource",
    tag: "memory research · mcp",
    title: "awesome-agentic-memory",
    body: "A curated, regularly updated map of agent memory frameworks, MCP memory servers, vector backends and research directions, with a framework comparison across memory types and MCP support.",
    links: [
      { label: "Page", to: "/awesome-agentic-memory/" },
      { label: "GitHub", href: "https://github.com/aviskaar/awesome-agentic-memory" },
    ],
  },
]

const SystemsPage = (_props: PageProps) => (
  <Layout>
    <Page>
      <Title
        eyebrow="Systems"
        lede="Software I have built for the infrastructure behind reliable agents: runtime control, retrieval and memory, evaluation, and tooling."
      >
        Systems
      </Title>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem 3rem", alignItems: "center", margin: "0 0 3rem" }}>
        <div style={{ flex: "1 1 280px", maxWidth: "46ch", fontSize: 17, lineHeight: 1.65 }}>
          <p style={{ margin: 0 }}>
            The animation shows how subagent-fleet treats a set of local machines as one compute pool: requests
            enter a router, the router picks a healthy node with spare capacity, and traffic moves when a node
            drops.
          </p>
          <p style={{ margin: "1rem 0 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#5E5D59", lineHeight: 1.7 }}>
            Hover a node to label it.<br />Click a node to take it down and watch traffic re-route.
          </p>
        </div>
        <div style={{ flex: "0 1 400px", width: "100%", maxWidth: 400, marginLeft: "auto" }}>
          <FleetRouter />
        </div>
      </div>
      <Section label="Index">
        <RuledList rows={systems} />
      </Section>
    </Page>
  </Layout>
)

export default SystemsPage

export const Head: HeadFC = () => (
  <Seo
    title="Systems: Agent Runtimes and Retrieval"
    description="Software systems by Aditya Karnam: subagent-fleet (local compute control plane), embenx (retrieval), Quecto (Rust agent harness) and agent memory tooling."
    pathname="/systems/"
  />
)
