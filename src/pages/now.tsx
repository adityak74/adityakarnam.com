import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
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

type ActiveTrack = {
  title: string
  status: string
  detail: string
  links: LinkEntry[]
}

const activeTracks: ActiveTrack[] = [
  {
    title: "Local agent runtime control",
    status: "Active",
    detail:
      "The freshest published signal is subagent-fleet, dated July 1, 2026. The work centers on role-aware routing, local node health, warmup, and observability for Claude Code-style subagents.",
    links: [
      { label: "Read subagent-fleet", to: "/subagent-fleet-local-ai-compute-control-plane" },
      { label: "Docs site", href: "https://adityak74.github.io/subagent-fleet/" },
    ],
  },
  {
    title: "Retrieval becoming memory infrastructure",
    status: "Shipping",
    detail:
      "embenx is the clearest retrieval-layer artifact: one API across many backends, with hybrid search, temporal memory, reranking hooks, and MCP-native long-term memory support.",
    links: [
      { label: "Read embenx guide", to: "/embenx-python-embedding-toolkit" },
      { label: "Project docs", href: "https://adityak74.github.io/embenx/" },
    ],
  },
  {
    title: "Memory landscape mapping",
    status: "Ongoing",
    detail:
      "awesome-agentic-memory is the ecosystem map. It keeps the memory layer legible by comparing frameworks, MCP servers, and backend patterns instead of treating memory as one product feature.",
    links: [{ label: "Open the memory map", to: "/awesome-agentic-memory/" }],
  },
  {
    title: "Operator tooling and prompt surfaces",
    status: "Live",
    detail:
      "AI Toolkit remains a practical sandbox for prompt composition, grading, rewriting, and output shaping. It is smaller than the other systems but useful as an interface-design proving ground.",
    links: [
      { label: "Open AI Toolkit", to: "/ai-toolkit" },
      { label: "Prompt Grader", to: "/ai-toolkit/prompt-grader/" },
    ],
  },
]

const plannedArtifacts = [
  "Missing infrastructure layer for world-model AI",
  "From RAG to state: why agent memory is not just retrieval",
  "Local-first AI infrastructure for agent builders",
]

const NowPage = (_props: PageProps) => (
  <Layout>
    <WorldModelPageShell>
      <WorldModelHero
        eyebrow="Now"
        title="Current experiments and active fronts."
        description="This page is a working board for what matters right now in the lab. It stays grounded in the artifacts already published here instead of turning into a vague status page."
        aside={
          <div>
            <div
              style={{
                color: labPalette.slate,
                fontFamily:
                  "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
                fontSize: "0.76rem",
                letterSpacing: "0.18em",
                marginBottom: "0.85rem",
                textTransform: "uppercase",
              }}
            >
              Current focus
            </div>
            <ConsoleList
              items={[
                "making local agent runtimes observable",
                "turning retrieval into durable memory infrastructure",
                "mapping the memory ecosystem with MCP in view",
                "keeping human-facing tooling explicit and inspectable",
              ]}
            />
          </div>
        }
      />

      <Divider />

      <WorldModelSection
        eyebrow="Active Board"
        title="What is in motion"
        description="The active board emphasizes specific published work and the concrete system questions it is pushing on."
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          {activeTracks.map(track => (
            <Panel key={track.title} accent={track.status === "Shipping" ? "green" : "cyan"}>
              <div
                style={{
                  alignItems: "start",
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                }}
              >
                <div>
                  <h3
                    style={{
                      color: labPalette.heading,
                      fontSize: "1.35rem",
                      letterSpacing: "-0.03em",
                      margin: "0 0 0.75rem",
                    }}
                  >
                    {track.title}
                  </h3>
                  <TagList items={[track.status, "world model infrastructure"]} />
                </div>
                <div>
                  <p style={{ color: labPalette.body, lineHeight: 1.75, margin: 0 }}>{track.detail}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", marginTop: "0.9rem" }}>
                    {track.links.map(link =>
                      "to" in link ? (
                        <InlineLink key={link.label} to={link.to}>
                          {link.label}
                        </InlineLink>
                      ) : (
                        <a
                          key={link.label}
                          href={link.href}
                          rel="noreferrer"
                          target="_blank"
                          style={{ color: labPalette.green, textDecoration: "none" }}
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
        eyebrow="System Questions"
        title="Questions that feel live right now"
        description="These are not generic AI questions. They are the concrete design tensions implied by the current codebase and writing."
      >
        <ThreeColumnGrid>
          <Panel accent="cyan">
            <StatusRow
              label="Routing"
              value="When should a planner, implementer, and reviewer share a model, and when should runtime topology force specialization?"
            />
          </Panel>
          <Panel accent="green">
            <StatusRow
              label="Memory"
              value="What belongs in retrieval, what belongs in persistent state, and how should recency and feedback alter ranking over time?"
            />
          </Panel>
          <Panel accent="slate">
            <StatusRow
              label="Evaluation"
              value="How much visibility is enough for operators to trust multi-step agent behavior without drowning in traces?"
            />
          </Panel>
        </ThreeColumnGrid>
      </WorldModelSection>

      <WorldModelSection
        eyebrow="Reading Path"
        title="If you want to understand the current wedge"
        description="This is the shortest path through the existing work if you want the thesis before the broader site catches up."
      >
        <TwoColumnGrid>
          <Panel accent="cyan">
            <ConsoleList
              items={[
                "Start with subagent-fleet for runtime orchestration and local model routing.",
                "Read embenx next for retrieval, temporal memory, and MCP-native long-term context.",
                "Use awesome-agentic-memory to place both projects inside the wider memory landscape.",
                "Finish with AI Toolkit to see the smaller operator-facing interfaces that inform the bigger systems.",
              ]}
            />
          </Panel>
          <Panel accent="green">
            <h3 style={{ marginTop: 0, color: labPalette.heading }}>Planned field notes</h3>
            <p style={{ color: labPalette.body, lineHeight: 1.75 }}>
              These are still planned, not published. They are listed here to show where the
              writing likely expands next.
            </p>
            <ConsoleList items={plannedArtifacts.map(item => `planned field note: ${item}`)} />
          </Panel>
        </TwoColumnGrid>
      </WorldModelSection>

      <WorldModelSection
        eyebrow="Cross Links"
        title="Other pages in this lab slice"
        description="The new pages are designed to work together rather than exist as isolated navigational stubs."
      >
        <TwoColumnGrid>
          <Panel accent="cyan">
            <p style={{ color: labPalette.body }}>
              <InlineLink to="/systems/">Systems</InlineLink> is the artifact index. It reframes
              projects into runtime, retrieval, memory, and operator-surface layers.
            </p>
          </Panel>
          <Panel accent="green">
            <p style={{ color: labPalette.body }}>
              <InlineLink to="/stack/">Stack</InlineLink> defines the world model infrastructure
              category and maps each layer to the existing body of work.
            </p>
          </Panel>
        </TwoColumnGrid>
      </WorldModelSection>
    </WorldModelPageShell>
  </Layout>
)

export default NowPage

export const Head: HeadFC = () => (
  <Seo
    title="Now"
    description="Current experiments, active research fronts, and reading paths across local agent runtimes, retrieval, memory systems, and AI tooling."
    pathname="/now/"
  />
)
