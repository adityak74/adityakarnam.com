import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title, Section, RuledList, Row, Explore } from "../components/world-model/pages-systems-stack-now/editorial"
import NowOrbit from "../components/world-model/anim/NowOrbit"

const tracks: Row[] = [
  {
    key: "fleet",
    meta: "Active",
    title: "Local agent runtime control",
    body: "subagent-fleet: role-aware routing, node health, model warmup and observability for Claude Code-style subagents across local machines.",
    links: [
      { label: "Write-up", to: "/subagent-fleet-local-ai-compute-control-plane" },
      { label: "Docs", href: "https://adityak74.github.io/subagent-fleet/" },
    ],
  },
  {
    key: "embenx",
    meta: "Shipping",
    title: "Retrieval as memory infrastructure",
    body: "embenx: one API across many backends, with hybrid search, temporal memory, reranking hooks and MCP-native long-term memory.",
    links: [
      { label: "Guide", to: "/embenx-python-embedding-toolkit" },
      { label: "Docs", href: "https://adityak74.github.io/embenx/" },
    ],
  },
  {
    key: "memory",
    meta: "Ongoing",
    title: "Mapping the memory landscape",
    body: "awesome-agentic-memory compares frameworks, MCP servers and backend patterns, so memory is not treated as one product feature.",
    links: [{ label: "Open the map", to: "/awesome-agentic-memory/" }],
  },
  {
    key: "toolkit",
    meta: "Live",
    title: "Prompt tooling",
    body: "AI Toolkit: prompt composition, grading and rewriting. Smaller than the other systems, and a useful place to test interface ideas.",
    links: [{ label: "AI Toolkit", to: "/ai-toolkit" }],
  },
]

const NowPage = (_props: PageProps) => (
  <Layout>
    <Page>
      <Title
        eyebrow="Now"
        lede="What I am working on at the moment. It only lists things that have already been published here."
      >
        Current work
      </Title>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem 3rem", alignItems: "center", marginBottom: 48 }}>
        <div style={{ flex: "1 1 280px", maxWidth: "46ch", fontSize: 17, lineHeight: 1.65 }}>
          <p style={{ margin: 0 }}>
            Four threads of work are in orbit around what I am doing now: the subagent-fleet runtime, embenx
            retrieval, the agent-memory map, and the harness write-up. The inner ones move fastest.
          </p>
          <p style={{ margin: "1rem 0 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#5E5D59", lineHeight: 1.7 }}>
            Point at a ring to slow it down<br />and read its label.
          </p>
        </div>
        <div style={{ flex: "0 1 400px", width: "100%", maxWidth: 400, marginLeft: "auto" }}>
          <NowOrbit />
        </div>
      </div>
      <Section label="In motion">
        <RuledList rows={tracks} />
      </Section>
      <Section label="Reading order" title="If you want the thesis">
        <ol style={{ maxWidth: "68ch", fontSize: 17, lineHeight: 1.65, paddingLeft: "1.2rem", margin: 0 }}>
          <li>subagent-fleet, for runtime orchestration and local model routing.</li>
          <li>embenx, for retrieval, temporal memory and MCP-native context.</li>
          <li>awesome-agentic-memory, to place both in the wider landscape.</li>
          <li>AI Toolkit, for the smaller interfaces that inform the larger systems.</li>
        </ol>
      </Section>
      <Explore keys={["about", "systems", "writing"]} />
    </Page>
  </Layout>
)

export default NowPage

export const Head: HeadFC = () => (
  <Seo
    title="Now: Current Research and Experiments"
    description="What Aditya Karnam is working on now: local agent runtimes, retrieval, agent memory infrastructure and evaluation, with a suggested reading order."
    pathname="/now/"
  />
)
