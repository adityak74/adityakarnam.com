/** @jsx jsx */
import * as React from "react"
import { graphql, HeadFC, Link, PageProps } from "gatsby"
import { Box, Grid, Heading, Text, jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  ConsoleCard,
  ConsoleShell,
  HeroStat,
  SectionBlock,
  SignalPill,
  ThreeColumnGrid,
  consoleColors,
} from "../components/world-model/pages-field-notes-about/primitives"

type PostNode = {
  slug: string
  title: string
  date: string
  description?: string | null
  excerpt: string
  tags?: Array<{ name: string; slug: string }>
}

type FieldNotesData = {
  allPost: {
    nodes: PostNode[]
  }
}

const plannedEssays = [
  {
    title: "The Missing Infrastructure Layer for Reliable AI Agents",
    status: "Priority draft",
    thesis:
      "Foundation models are not enough for real-world agency. The next category is the infrastructure around them: state, memory, simulation, routing, and evaluation.",
    linkedSignals: ["subagent-fleet", "embenx"],
  },
  {
    title: "From RAG to State: Why Agent Memory Is Not Just Retrieval",
    status: "Priority draft",
    thesis:
      "Retrieval gets facts back. Memory systems need to track evolving goals, tool use, environment state, and the consequences of prior actions.",
    linkedSignals: ["embenx", "awesome-agentic-memory"],
  },
  {
    title: "Local-First AI Infrastructure for Agent Builders",
    status: "Priority draft",
    thesis:
      "As agent workflows get longer and more expensive, local inference, model routing, and hybrid compute become infrastructure advantages rather than hobbies.",
    linkedSignals: ["subagent-fleet", "MLX non-determinism"],
  },
  {
    title: "Why LLM Agents Need State",
    status: "Planned field note",
    thesis: "Stateless prompting breaks down once tasks span time, tools, retries, and user-specific context.",
    linkedSignals: ["subagent-fleet", "awesome-agentic-memory"],
  },
  {
    title: "Why Model Routing Matters for Agentic Systems",
    status: "Planned field note",
    thesis: "Routing is where cost, latency, capability, locality, and reliability meet. One model endpoint is not a systems strategy.",
    linkedSignals: ["subagent-fleet", "AI Toolkit"],
  },
  {
    title: "World Models Will Need Observability",
    status: "Planned field note",
    thesis: "If agents simulate and act, builders need traces that expose why they chose a route, tool, or memory update.",
    linkedSignals: ["subagent-fleet", "MLX non-determinism"],
  },
]

const readingPaths = [
  {
    topic: "World models",
    steps: [
      "Start with the infrastructure thesis below.",
      "Read subagent-fleet for the runtime and routing angle.",
      "Follow with embenx for retrieval and memory interfaces.",
      "Use the Apple Silicon eval note for the local-serving and runtime-behavior layer.",
      "Treat the remaining essays as the planned research map.",
    ],
  },
  {
    topic: "Local inference",
    steps: [
      "Begin with subagent-fleet for fleet orchestration and model routing.",
      "Read the Ollama vs vLLM vs SGLang eval note for measured serving behavior on Apple Silicon.",
      "Use MLX non-determinism as the reliability counterweight.",
      "Then connect both to the planned local-first infrastructure essay.",
    ],
  },
]

const highlightedSlugs = [
  "/subagent-fleet-local-ai-compute-control-plane",
  "/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon",
  "/embenx-python-embedding-toolkit",
  "/mlx-non-determinism-apple-silicon",
  "/ai-blog-generator-n8n-results",
]

const signalNotes: Record<string, string> = {
  "/subagent-fleet-local-ai-compute-control-plane":
    "Strongest public proof of the runtime, routing, and local-compute thesis.",
  "/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon":
    "Measured evals of local serving stacks on Apple Silicon, then an Ollama-only Qwen 3.5 size sweep, including latency, memory contention, warmed response-quality checks, and LLM-as-judge scoring.",
  "/embenx-python-embedding-toolkit":
    "Best current artifact for memory, retrieval abstraction, and MCP-facing context systems.",
  "/mlx-non-determinism-apple-silicon":
    "A useful note on why local inference and evaluation need better reliability assumptions.",
  "/ai-blog-generator-n8n-results":
    "Shows workflow automation instincts and a willingness to instrument outcomes instead of hand-waving them.",
}

const FieldNotesPage = ({ data }: PageProps<FieldNotesData>) => {
  const postsBySlug = new Map(data.allPost.nodes.map(post => [post.slug.replace(/\/$/, ``), post]))
  const groundedPosts = highlightedSlugs.map(slug => postsBySlug.get(slug)).filter(Boolean) as PostNode[]

  return (
    <Layout>
      <Box sx={{ display: `grid`, gap: [3, 4], my: [3, 4] }}>
        <ConsoleShell>
          <Grid sx={{ gridTemplateColumns: [`1fr`, `1fr`, `1.35fr 0.95fr`], gap: 3, alignItems: `start` }}>
            <Box>
              <SignalPill>Field Notes / AI Research</SignalPill>
              <Heading
                as="h1"
                sx={{
                  color: consoleColors.text,
                  fontSize: [5, 6, 7],
                  mt: 3,
                  mb: 3,
                  maxWidth: `10ch`,
                  lineHeight: 1.02,
                }}
              >
                Thought leadership notes for the systems layer behind AI agents.
              </Heading>
              <Text sx={{ color: consoleColors.muted, fontSize: [2, 2, 3], maxWidth: `60ch`, mb: 3 }}>
                This section reframes the site around the infrastructure needed for agents that maintain state,
                retrieve memory, route across models, simulate outcomes, and act with more reliability over time.
              </Text>
              <Text sx={{ color: consoleColors.soft, fontSize: [1, 2], maxWidth: `62ch` }}>
                Some of these essays already exist indirectly in project write-ups and technical notes. Others are
                planned field notes that make the research agenda explicit.
              </Text>
            </Box>

            <Box sx={{ border: `1px solid ${consoleColors.border}`, borderRadius: 12, p: 3, bg: consoleColors.panelAlt }}>
              <Text sx={{ display: `block`, fontFamily: `monospace`, color: consoleColors.accent, fontSize: 0, mb: 2 }}>
                Research Scope
              </Text>
              <Box as="pre" sx={{ m: 0, p: 0, bg: `transparent`, border: `none`, color: consoleColors.text, fontSize: 1 }}>
                <code>
                  {`state + memory
retrieval + context
simulation loops
model routing
local inference
observability + evals`}
                </code>
              </Box>
            </Box>
          </Grid>

          <Grid sx={{ gridTemplateColumns: [`repeat(2, minmax(0, 1fr))`, `repeat(4, minmax(0, 1fr))`], gap: 3, mt: 4 }}>
            <HeroStat label="Published signals" value={`${groundedPosts.length}`} />
            <HeroStat label="Priority essays" value="3" />
            <HeroStat label="Research threads" value="6" />
            <HeroStat label="Mode" value="Planned + grounded" />
          </Grid>
        </ConsoleShell>

        <SectionBlock
          eyebrow="Publishing Thesis"
          title="What this section is for"
          description="Field Notes replaces a generic blog framing. The goal is to make the site read like an engineering research notebook rather than a list of disconnected posts."
        >
          <ThreeColumnGrid>
            <ConsoleCard title="Thesis" accent={consoleColors.accent}>
              <Text sx={{ color: consoleColors.muted }}>
                The next frontier of AI is not conversation alone. It is systems that can model the world: maintain
                state, remember context, route choices, and act through tools with less brittleness.
              </Text>
            </ConsoleCard>
            <ConsoleCard title="Why now" accent={consoleColors.accentAlt}>
              <Text sx={{ color: consoleColors.muted }}>
                Bigger base models keep improving, but the missing layer is increasingly obvious when teams try to ship
                persistent, multi-step, tool-using agents in practice.
              </Text>
            </ConsoleCard>
            <ConsoleCard title="Editorial bar" accent={consoleColors.warning}>
              <Text sx={{ color: consoleColors.muted }}>
                Each note should make one strong claim, tie it to system design, and point back to public artifacts or
                experiments already visible on the site.
              </Text>
            </ConsoleCard>
          </ThreeColumnGrid>
        </SectionBlock>

        <SectionBlock
          eyebrow="Grounded Signals"
          title="Existing posts that already support the story"
          description="These are the current notes and project write-ups that map most directly to the AI-researcher framing."
        >
          <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`], gap: 3 }}>
            {groundedPosts.map(post => (
              <ConsoleCard key={post.slug} title={post.date} accent={consoleColors.accentAlt}>
                <Heading as="h3" sx={{ color: consoleColors.text, fontSize: [2, 3], mt: 0, mb: 2, lineHeight: 1.15 }}>
                  {post.title}
                </Heading>
                <Text sx={{ color: consoleColors.muted, mb: 2 }}>{post.description || post.excerpt}</Text>
                <Text sx={{ color: consoleColors.soft, mb: 3 }}>{signalNotes[post.slug.replace(/\/$/, ``)]}</Text>
                <Link to={`${post.slug}/`} sx={{ color: consoleColors.accent, fontFamily: `monospace`, textDecoration: `none` }}>
                  Open note
                </Link>
              </ConsoleCard>
            ))}
          </Grid>
        </SectionBlock>

        <SectionBlock
          eyebrow="Planned Essays"
          title="The first field notes to publish"
          description="The first three are the core essays. The rest are the adjacent notes that help complete the research program."
        >
          <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`], gap: 3 }}>
            {plannedEssays.map(essay => (
              <ConsoleCard
                key={essay.title}
                title={essay.status}
                accent={essay.status === "Priority draft" ? consoleColors.accent : consoleColors.warning}
              >
                <Heading as="h3" sx={{ color: consoleColors.text, fontSize: [2, 3], mt: 0, mb: 2, lineHeight: 1.15 }}>
                  {essay.title}
                </Heading>
                <Text sx={{ color: consoleColors.muted, mb: 3 }}>{essay.thesis}</Text>
                <Text sx={{ color: consoleColors.soft, fontFamily: `monospace`, fontSize: 0 }}>
                  Linked signals: {essay.linkedSignals.join(" / ")}
                </Text>
              </ConsoleCard>
            ))}
          </Grid>
        </SectionBlock>

        <SectionBlock
          eyebrow="Reading Paths"
          title="How to navigate the material"
          description="Static reading paths keep the section useful before any dynamic AI layer or RAG interface is added."
        >
          <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`], gap: 3 }}>
            {readingPaths.map(path => (
              <ConsoleCard key={path.topic} title={path.topic}>
                <Box as="ol" sx={{ pl: 3, my: 0, color: consoleColors.muted }}>
                  {path.steps.map(step => (
                    <li key={step} sx={{ mb: 2, pl: 1 }}>
                      <Text sx={{ color: consoleColors.muted }}>{step}</Text>
                    </li>
                  ))}
                </Box>
              </ConsoleCard>
            ))}
          </Grid>
        </SectionBlock>

        <Box
          sx={{
            borderTop: `1px solid`,
            borderColor: `divide`,
            pt: 4,
            display: `grid`,
            gap: 2,
          }}
        >
          <Heading as="h2" sx={{ fontSize: [3, 4] }}>
            Next moves
          </Heading>
          <Text sx={{ color: `secondary`, maxWidth: `70ch` }}>
            The highest-leverage publication sequence is the infrastructure thesis, then memory/state, then local-first
            routing. That creates a coherent narrative arc before expanding into observability, MCP, or evaluation.
          </Text>
          <Box sx={{ display: `flex`, gap: 3, flexWrap: `wrap`, mt: 2 }}>
            <Link to="/about/" sx={{ fontFamily: `monospace`, color: `accent`, textDecoration: `none` }}>
              Read the positioning
            </Link>
            <Link to="/subagent-fleet-local-ai-compute-control-plane/" sx={{ fontFamily: `monospace`, color: `accent`, textDecoration: `none` }}>
              Start with subagent-fleet
            </Link>
          </Box>
        </Box>
      </Box>
    </Layout>
  )
}

export default FieldNotesPage

export const Head: HeadFC = () => (
  <Seo
    title="Field Notes"
    description="Field notes from Aditya Karnam, AI researcher: essays and source-grounded notes on memory, routing, local inference, and agent systems."
    pathname="/field-notes/"
  />
)

export const query = graphql`
  query FieldNotesPage {
    allPost(sort: { date: DESC }, limit: 40) {
      nodes {
        slug
        title
        date(formatString: "MMMM DD, YYYY")
        description
        excerpt
        tags {
          name
          slug
        }
      }
    }
  }
`
