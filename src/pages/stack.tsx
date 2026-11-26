import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title, Section, RuledList, Row, Explore } from "../components/world-model/pages-systems-stack-now/editorial"

const layers: Row[] = [
  {
    key: "runtime",
    meta: "Layer 1",
    title: "Agent runtime",
    body: "Role-aware execution, topology, health and operational control. subagent-fleet is the clearest example: one fleet topology generates routes, agent definitions, warmup flows and dashboard state.",
  },
  {
    key: "memory",
    meta: "Layer 2",
    title: "State and memory",
    body: "Durable context about goals, preferences and prior work. awesome-agentic-memory maps the category; embenx builds temporal and agentic memory primitives.",
  },
  {
    key: "retrieval",
    meta: "Layer 3",
    title: "Retrieval and context",
    body: "Search, filtering, reranking and context assembly without backend lock-in. embenx unifies 15+ backends and adds hybrid search, metadata filtering and reranking hooks.",
  },
  {
    key: "tools",
    meta: "Layer 4",
    title: "Tools and environment",
    body: "Where models meet MCP tools, code interfaces and external systems. embenx ships an MCP server, and subagent-fleet generates assistant-facing agent definitions.",
  },
  {
    key: "routing",
    meta: "Layer 5",
    title: "Model routing and inference",
    body: "Choosing the model and machine for the job. subagent-fleet routes through LiteLLM across local Ollama nodes. My MLX posts measure what that local inference does under load.",
  },
  {
    key: "eval",
    meta: "Layer 6",
    title: "Observability and evaluation",
    body: "Behavior should be inspectable and benchmarkable over time. subagent-fleet has live traces and a published eval; BudgetBench evaluates memory under a fixed token budget.",
  },
  {
    key: "sim",
    meta: "Layer 7",
    title: "Simulation and prediction",
    body: "Testing futures before committing to an action. This one is still early: the embenx roadmap includes trajectory retrieval, and nothing more is built yet.",
  },
]

const StackPage = (_props: PageProps) => (
  <Layout>
    <Page>
      <Title
        eyebrow="Stack"
        lede="Better conversation is not the missing piece. Agents need infrastructure that keeps state, retrieves memory, routes between models, uses tools, and stays inspectable while it acts."
      >
        The systems layer between models and reliable agents
      </Title>
      <Section label="Layers">
        <RuledList rows={layers} />
      </Section>
      <Explore keys={["systems", "research", "now"]} />
    </Page>
  </Layout>
)

export default StackPage

export const Head: HeadFC = () => (
  <Seo
    title="Stack"
    description="An AI agent infrastructure stack mapping runtime, memory, retrieval, routing, interfaces, and evaluation to Aditya Karnam's published work."
    pathname="/stack/"
  />
)
