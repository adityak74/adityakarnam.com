/** @jsx jsx */
import * as React from "react"
import { HeadFC, Link } from "gatsby"
import { Box, Flex, Grid, Heading, Text, jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  ConsoleCard,
  ConsoleShell,
  HeroStat,
  SectionBlock,
  SignalPill,
  ThreeColumnGrid,
  TwoColumnGrid,
  consoleColors,
} from "../components/world-model/pages-field-notes-about/primitives"

const operatingLoop = [
  {
    step: "Observe",
    detail: "Capture signals from users, tools, files, environments, and execution traces before acting.",
  },
  {
    step: "Model",
    detail: "Maintain an explicit state of goals, constraints, resources, and prior decisions instead of relying on one prompt window.",
  },
  {
    step: "Simulate",
    detail: "Evaluate routes, tool choices, and likely outcomes before spending tokens, time, or trust.",
  },
  {
    step: "Act",
    detail: "Use runtimes, tools, and model interfaces that make agent behavior legible rather than mysterious.",
  },
  {
    step: "Evaluate",
    detail: "Score outputs over time: correctness, traceability, cost, recovery behavior, and system drift.",
  },
  {
    step: "Update",
    detail: "Write learnings back into memory and routing policy so the system gets better with use.",
  },
]

const proofPoints = [
  {
    title: "subagent-fleet",
    href: "/subagent-fleet-local-ai-compute-control-plane/",
    label: "Local inference + routing",
    description:
      "A local AI compute control plane for Claude Code-style subagents, Ollama nodes, LiteLLM routing, model warmup, and runtime visibility.",
  },
  {
    title: "embenx",
    href: "/embenx-python-embedding-toolkit/",
    label: "Retrieval + memory",
    description:
      "A unified retrieval layer across vector backends, with temporal memory, filtering, reranking, and an MCP interface for agent use.",
  },
  {
    title: "MLX non-determinism",
    href: "/mlx-non-determinism-apple-silicon/",
    label: "Inference reliability",
    description:
      "A reproducibility investigation into Apple Silicon LLM inference and the batch-invariance failures that make local evaluation harder than it looks.",
  },
  {
    title: "AI Toolkit",
    href: "/ai-toolkit/",
    label: "Workflow instrumentation",
    description:
      "Prompt and workflow utilities that translate abstract LLM advice into concrete tooling, grading, and repeatable interfaces.",
  },
  {
    title: "awesome-agentic-memory",
    href: "/awesome-agentic-memory/",
    label: "Memory landscape",
    description:
      "A curated map of agent memory patterns, systems, and open questions that informs how I think about long-horizon agent state.",
  },
  {
    title: "ERBGA paper",
    href: "https://profiles.umsl.edu/en/publications/efficient-reduced-bias-genetic-algorithm-erbga-for-generic-commun-2",
    label: "Research grounding",
    description:
      "Earlier published work on reduced-bias genetic algorithms for community detection, which still shapes how I think about search, structure, and system behavior.",
  },
]

const principles = [
  "Useful AI systems need inspectable memory, not hidden context glued together by luck.",
  "Model choice is a systems problem. Routing, locality, latency, and failure modes matter as much as raw benchmark scores.",
  "Agent infrastructure should expose state transitions, tool calls, and evaluation traces so behavior can be audited over time.",
  "Local-first capability matters because serious experimentation gets easier when builders can control cost, privacy, and iteration speed.",
]

const AboutPage = () => {
  return (
    <Layout>
      <Box sx={{ display: `grid`, gap: [4, 5], my: [4, 5] }}>
        <ConsoleShell>
          <Grid sx={{ gridTemplateColumns: [`1fr`, `1fr`, `1.45fr 0.95fr`], gap: 4, alignItems: `start` }}>
            <Box>
              <SignalPill>Aditya Karnam - World Model Infrastructure Builder</SignalPill>
              <Heading
                as="h1"
                sx={{
                  color: consoleColors.text,
                  fontSize: [5, 6, 7],
                  mt: 3,
                  mb: 3,
                  maxWidth: `12ch`,
                }}
              >
                Building the systems layer for agents that remember, simulate, and act.
              </Heading>
              <Text sx={{ color: consoleColors.muted, fontSize: [2, 2, 3], maxWidth: `60ch`, mb: 3 }}>
                I work on the infrastructure between foundation models and real-world agency: state, memory,
                retrieval, routing, evaluation, local inference, and the runtimes that make agent behavior more
                reliable over time.
              </Text>
              <Text sx={{ color: consoleColors.soft, fontSize: [1, 2], maxWidth: `62ch` }}>
                World model infrastructure is the systems layer that lets AI maintain state, retrieve memory,
                simulate outcomes, route between models, use tools, and interact with environments without collapsing
                back into a one-shot prompt.
              </Text>
            </Box>

            <Box
              sx={{
                border: `1px solid ${consoleColors.border}`,
                borderRadius: 20,
                p: 3,
                bg: `rgba(7, 11, 10, 0.38)`,
              }}
            >
              <Text sx={{ display: `block`, color: consoleColors.accentAlt, fontFamily: `monospace`, fontSize: 0, mb: 2 }}>
                boot.log
              </Text>
              <Box as="pre" sx={{ m: 0, p: 0, bg: `transparent`, border: `none`, color: consoleColors.text, fontSize: 1 }}>
                <code>
                  {`initializing world model stack...
loading memory layer...
attaching retrieval interfaces...
routing local + cloud models...
starting evaluation loop...
status: ready`}
                </code>
              </Box>
            </Box>
          </Grid>

          <Grid sx={{ gridTemplateColumns: [`repeat(2, minmax(0, 1fr))`, `repeat(4, minmax(0, 1fr))`], gap: 3, mt: 4 }}>
            <HeroStat label="Primary wedge" value="Memory + routing + evals" />
            <HeroStat label="Mode" value="Research-driven engineering" />
            <HeroStat label="Bias" value="Local-first systems" />
            <HeroStat label="Throughline" value="Explicit runtime behavior" />
          </Grid>
        </ConsoleShell>

        <SectionBlock
          eyebrow="Research Position"
          title="The infrastructure layer I care about"
          description="I am less interested in AI as a chat interface and more interested in the systems that make agents durable, inspectable, and composable."
        >
          <ThreeColumnGrid>
            <ConsoleCard title="State + memory" accent={consoleColors.accent}>
              <Text sx={{ color: consoleColors.muted }}>
                Agents need a durable working model of users, goals, tasks, tools, failures, and environments. That
                means memory should be explicit, updatable, and debuggable.
              </Text>
            </ConsoleCard>
            <ConsoleCard title="Retrieval + routing" accent={consoleColors.accentAlt}>
              <Text sx={{ color: consoleColors.muted }}>
                The right context and the right model are both routing problems. Retrieval, backend abstraction, local
                inference, and multi-model orchestration are part of the same systems question.
              </Text>
            </ConsoleCard>
            <ConsoleCard title="Evaluation + observability" accent={consoleColors.warning}>
              <Text sx={{ color: consoleColors.muted }}>
                If an agent operates over time, it should be scored over time. I care about traces, failure modes,
                repeatability, and evals that reflect system behavior rather than one isolated answer.
              </Text>
            </ConsoleCard>
          </ThreeColumnGrid>
        </SectionBlock>

        <SectionBlock
          eyebrow="Operating Loop"
          title="Observe -> Model -> Simulate -> Act -> Evaluate -> Update"
          description="This is the recurring frame behind the site. It is how I think agent systems move from prompt chains toward world-model behavior."
        >
          <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`, `repeat(3, minmax(0, 1fr))`], gap: 3 }}>
            {operatingLoop.map(item => (
              <ConsoleCard key={item.step} title={item.step}>
                <Text sx={{ color: consoleColors.muted }}>{item.detail}</Text>
              </ConsoleCard>
            ))}
          </Grid>
        </SectionBlock>

        <SectionBlock
          eyebrow="Public Proof"
          title="What already exists in public"
          description="These artifacts are the clearest public evidence of the direction: memory systems, local routing, inference reliability, workflow tooling, and earlier research."
        >
          <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`], gap: 3 }}>
            {proofPoints.map(item => {
              const isInternal = item.href.startsWith(`/`)

              return (
                <ConsoleCard key={item.title} title={item.label} accent={consoleColors.accentAlt}>
                  <Heading as="h3" sx={{ color: consoleColors.text, fontSize: [2, 3], mb: 2 }}>
                    {item.title}
                  </Heading>
                  <Text sx={{ color: consoleColors.muted, mb: 3 }}>{item.description}</Text>
                  {isInternal ? (
                    <Link
                      to={item.href}
                      sx={{
                        color: consoleColors.accent,
                        fontFamily: `monospace`,
                        textDecoration: `none`,
                      }}
                    >
                      Open artifact
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        color: consoleColors.accent,
                        fontFamily: `monospace`,
                        textDecoration: `none`,
                      }}
                    >
                      Open source
                    </a>
                  )}
                </ConsoleCard>
              )
            })}
          </Grid>
        </SectionBlock>

        <SectionBlock
          eyebrow="Principles"
          title="How I evaluate this space"
          description="The site thesis is not that bigger models solve everything. It is that better systems design will decide which AI products actually hold up."
        >
          <TwoColumnGrid>
            {principles.map(principle => (
              <ConsoleCard key={principle} title="Operating principle">
                <Text sx={{ color: consoleColors.muted }}>{principle}</Text>
              </ConsoleCard>
            ))}
          </TwoColumnGrid>
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
            Current focus
          </Heading>
          <Text sx={{ color: `secondary`, maxWidth: `70ch` }}>
            Right now the strongest threads are local-first agent infrastructure, memory and retrieval abstractions,
            runtime visibility for coding agents, and evaluation layers that reflect behavior over time instead of just
            prompt quality in isolation.
          </Text>
          <Flex sx={{ gap: 2, flexWrap: `wrap`, mt: 2 }}>
            <Link to="/field-notes/" sx={{ fontFamily: `monospace`, color: `accent`, textDecoration: `none` }}>
              Read field notes
            </Link>
            <Link to="/subagent-fleet-local-ai-compute-control-plane/" sx={{ fontFamily: `monospace`, color: `accent`, textDecoration: `none` }}>
              Explore subagent-fleet
            </Link>
          </Flex>
        </Box>
      </Box>
    </Layout>
  )
}

export default AboutPage

export const Head: HeadFC = () => (
  <Seo
    title="About"
    description="Aditya Karnam builds world model infrastructure: memory, retrieval, routing, local inference, and evaluation systems for agents that operate over time."
    pathname="/about/"
  />
)
