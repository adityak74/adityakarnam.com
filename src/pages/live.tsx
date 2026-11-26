import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import ArxivSearch from "../components/ArxivSearch"
import { Page, Title, Section, Prose, RuledList, TextLink, Row, Explore } from "../components/world-model/pages-systems-stack-now/editorial"

const running: Row[] = [
  {
    key: "fleet",
    tag: "Local inference · routing · ollama · litellm",
    title: "subagent-fleet",
    body: "A control plane that routes Claude Code-style subagents across local Ollama machines. One fleet.yaml generates LiteLLM routes, agent files and warmup flows, and a live dashboard shows node health, routing and the trace stream.",
    links: [
      { label: "Docs", href: "https://adityak74.github.io/subagent-fleet/" },
      { label: "Write-up", to: "/subagent-fleet-local-ai-compute-control-plane/" },
      { label: "GitHub", href: "https://github.com/adityak74/subagent-fleet" },
    ],
  },
  {
    key: "embenx",
    tag: "Retrieval · memory · MCP",
    title: "embenx",
    body: "One Collection API over 15+ vector backends, with hybrid search, temporal memory and a built-in MCP server.",
    links: [
      { label: "Docs", href: "https://adityak74.github.io/embenx/" },
      { label: "Guide", to: "/embenx-python-embedding-toolkit/" },
      { label: "GitHub", href: "https://github.com/adityak74/embenx" },
    ],
  },
  {
    key: "quecto",
    tag: "Rust · agent harness",
    title: "Quecto",
    body: "A 1.3 MB core and 5.5 MB coding agent with approval gating and session persistence, built to be evaluated.",
    links: [
      { label: "Project", to: "/quecto/" },
      { label: "GitHub", href: "https://github.com/adityak74/quecto" },
    ],
  },
  {
    key: "ask",
    tag: "RAG · live on this site",
    title: "Ask my work",
    body: "The chat on the homepage answers questions from this site's writing and research.",
    links: [
      { label: "Open", to: "/" },
      { label: "How it works", to: "/hero-rag-chat-architecture/" },
    ],
  },
]

const reach: Row[] = [
  {
    key: "scholarly",
    meta: "185 stars",
    tag: "MCP · arXiv · Google Scholar",
    title: "mcp-scholarly",
    body: "An MCP server for searching academic articles, the most starred of my repositories.",
    links: [{ label: "GitHub", href: "https://github.com/adityak74/mcp-scholarly" }],
  },
  {
    key: "review",
    tag: "Local AI review · Apple Silicon",
    title: "local-code-review",
    body: "A parallel council of local AI reviewers (correctness, security, regression) routed by a deterministic code graph and gated by a verifier, running entirely on a laptop at no API cost.",
    links: [{ label: "GitHub", href: "https://github.com/adityak74/local-code-review" }],
  },
  {
    key: "locobench",
    tag: "Benchmark · Ollama",
    title: "locobench",
    body: "Local coding-model benchmarks using the Harbor harness, the Terminus-2 agent and Ollama.",
    links: [{ label: "GitHub", href: "https://github.com/adityak74/locobench" }],
  },
  {
    key: "mlx",
    meta: "7.8K stars on the project",
    tag: "Upstream contribution",
    title: "mlx-lm",
    body: "My merged PR #1795 fixed LoRA training on three MoE model families.",
    links: [{ label: "PR", href: "https://github.com/ml-explore/mlx-lm/pull/1795" }],
  },
]

const row: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem 1.5rem", margin: "1.5rem 0 0" }

const LivePage = (_props: PageProps) => (
  <Layout>
    <Page>
      <Title eyebrow="Live" lede="These are running tools you can open and use, not slides about them.">
        Software you can run
      </Title>
      <Section label="Try it now" title="Search the literature from this page">
        <Prose>
          <p>
            This is a browser version of the search in <TextLink href="https://github.com/adityak74/mcp-scholarly">mcp-scholarly</TextLink>, an MCP
            server that lets agents search academic papers. Here the same idea runs against OpenAlex's open index, which covers arXiv preprints, called straight from your browser.
          </p>
        </Prose>
        <div style={{ marginTop: "1.5rem" }}>
          <ArxivSearch />
        </div>
        <div style={row}>
          <TextLink to="/">Ask my work chat on the homepage</TextLink>
          <TextLink to="/ai-toolkit/prompt-grader/">Prompt Grader</TextLink>
          <TextLink to="/ai-toolkit/">Prompt Composer</TextLink>
          <TextLink to="/mcp-install/">Install the portfolio MCP</TextLink>
        </div>
      </Section>
      <Section label="Running software" title="Docs, dashboards and agents">
        <RuledList rows={running} />
      </Section>
      <Section label="Reach" title="Used and starred">
        <RuledList rows={reach} />
      </Section>
      <Explore keys={["systems", "research", "writing"]} />
    </Page>
  </Layout>
)

export default LivePage

export const Head: HeadFC = () => (
  <Seo
    title="Live: Running AI Research Tools and Demos"
    description="Running AI research software by Aditya Karnam: a live paper-search demo, subagent-fleet, embenx, Quecto and mcp-scholarly, with docs, dashboards and code."
    pathname="/live/"
  />
)
