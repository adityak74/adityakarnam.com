/** @jsx jsx */
import * as React from "react"
import { HeadFC, Link } from "gatsby"
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

type MyPaper = {
  title: string
  venue: string
  year: string
  status: string
  detail: string
  url: string
  explainerSlug?: string
  pdfUrl?: string
}

const myPapers: MyPaper[] = [
  {
    title: "MEDFIT-LLM: Medical Enhancements through Domain-Focused Fine Tuning of Small Language Models",
    venue: "2025 2nd International Conference on Research Methodologies in Knowledge Management, AI and Telecommunication Engineering",
    year: "2025",
    status: "Published · 5 citations",
    detail:
      "Domain-focused fine-tuning of small language models for medical use cases, evaluated against generic baselines.",
    url: "https://ieeexplore.ieee.org/abstract/document/11042816",
    explainerSlug: "/medfit-llm-explained/",
  },
  {
    title: "Efficient Reduced-BIAS Genetic Algorithm for Generic Community Detection Objectives",
    venue: "Master's Thesis, University of Missouri–St. Louis",
    year: "2018",
    status: "Published · 5 citations",
    detail:
      "A genetic algorithm framework for community detection in complex networks that removes structural assumptions and requires no prior knowledge of community count, applied to benchmark datasets and Alzheimer's disease genetic networks.",
    url: "https://irl.umsl.edu/thesis/331/",
    pdfUrl: "/papers/efficient-reduced-bias-genetic-algorithm-community-detection.pdf",
  },
]

const inProgressPapers = [
  {
    title: "In progress",
    detail: "Additional papers currently in progress or submitted to arXiv will be added here as they land.",
  },
]

const AiResearchPage = () => {
  return (
    <Layout>
      <Box sx={{ display: `grid`, gap: [3, 4], my: [3, 4] }}>
        <ConsoleShell>
          <Grid sx={{ gridTemplateColumns: [`1fr`, `1fr`, `1.35fr 0.95fr`], gap: 3, alignItems: `start` }}>
            <Box>
              <SignalPill>AI Research Explained</SignalPill>
              <Heading
                as="h1"
                sx={{
                  color: consoleColors.text,
                  fontSize: [5, 6, 7],
                  mt: 3,
                  mb: 3,
                  maxWidth: `14ch`,
                  lineHeight: 1.02,
                }}
              >
                AI Research Explained
              </Heading>
              <Text sx={{ color: consoleColors.muted, fontSize: [2, 2, 3], maxWidth: `60ch`, mb: 3 }}>
                Making AI papers, experiments, and engineering ideas easier to understand.
              </Text>
              <Text sx={{ color: consoleColors.soft, fontSize: [1, 2], maxWidth: `62ch` }}>
                This section covers my own published research, explainers of other researchers' papers, hands-on
                experiments, and the engineering ideas that connect them.
              </Text>
            </Box>

            <Box sx={{ border: `1px solid ${consoleColors.border}`, borderRadius: 12, p: 3, bg: consoleColors.panelAlt }}>
              <Text sx={{ display: `block`, fontFamily: `monospace`, color: consoleColors.accent, fontSize: 0, mb: 2 }}>
                Coverage
              </Text>
              <Box as="pre" sx={{ m: 0, p: 0, bg: `transparent`, border: `none`, color: consoleColors.text, fontSize: 1 }}>
                <code>
                  {`my papers
papers I'm explaining
experiments
engineering notes`}
                </code>
              </Box>
            </Box>
          </Grid>

          <Grid sx={{ gridTemplateColumns: [`repeat(2, minmax(0, 1fr))`, `repeat(4, minmax(0, 1fr))`], gap: 3, mt: 4 }}>
            <HeroStat label="Published papers" value={`${myPapers.length}`} />
            <HeroStat label="In progress" value="1+" />
            <HeroStat label="Citations" value="10" />
            <HeroStat label="Mode" value="Publishing + explaining" />
          </Grid>
        </ConsoleShell>

        <SectionBlock
          eyebrow="Foundational Guides"
          title="Start here"
          description="Systems-level explainers that teach the fundamentals behind the research below."
        >
          <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`], gap: 3 }}>
            <ConsoleCard title="Guide" accent={consoleColors.accent}>
              <Heading as="h3" sx={{ color: consoleColors.text, fontSize: [3, 4], mt: 0, mb: 2, lineHeight: 1.15 }}>
                What Is an AI Agent Harness?
              </Heading>
              <Text sx={{ color: consoleColors.soft, fontSize: 1, mb: 2 }}>
                A Systems Guide to Building and Evaluating Reliable AI Agents
              </Text>
              <Text sx={{ color: consoleColors.muted, mb: 3 }}>
                How models, tools, memory, context, verification, and runtime policies combine to determine agent
                behavior — with examples from QuECTO, BudgetBench, and AgentABI.
              </Text>
              <Link
                to="/ai-research/what-is-an-ai-agent-harness/"
                sx={{ color: consoleColors.accent, fontFamily: `monospace`, textDecoration: `none` }}
              >
                Read the guide
              </Link>
            </ConsoleCard>

            <ConsoleCard title="Build Series · Part 2" accent={consoleColors.accentAlt}>
              <Heading as="h3" sx={{ color: consoleColors.text, fontSize: [3, 4], mt: 0, mb: 2, lineHeight: 1.15 }}>
                Building QuECTO
              </Heading>
              <Text sx={{ color: consoleColors.soft, fontSize: 1, mb: 2 }}>
                From Minimal Agent Harness to Evaluable Coding Agent
              </Text>
              <Text sx={{ color: consoleColors.muted, mb: 3 }}>
                How QuECTO grew into a small but measurable coding-agent runtime with reasoning controls, telemetry,
                subagents, multimodal input, releases, and native evals.
              </Text>
              <Link
                to="/ai-research/building-quecto-from-minimal-harness-to-evaluable-agent/"
                sx={{ color: consoleColors.accentAlt, fontFamily: `monospace`, textDecoration: `none` }}
              >
                Read part two
              </Link>
            </ConsoleCard>
          </Grid>
        </SectionBlock>

        <SectionBlock
          eyebrow="Books"
          title="AI Systems Design Field Guide"
          description="A field guide to model APIs, agent runtimes, MCP, A2A, and production engineering — free to read online."
        >
          <ConsoleCard title="Book · 2026" accent={consoleColors.accent}>
            <Heading as="h3" sx={{ color: consoleColors.text, fontSize: [3, 4], mt: 0, mb: 2, lineHeight: 1.15 }}>
              AI Systems Design Field Guide
            </Heading>
            <Text sx={{ display: `block`, color: consoleColors.muted, mb: 3 }}>
              A short field guide covering model APIs, agent runtimes, MCP, A2A, and the production engineering that
              ties them together.
            </Text>
            <Link
              to="/ai-systems-design-field-guide/"
              sx={{ display: `inline-block`, color: consoleColors.accent, fontFamily: `monospace`, textDecoration: `none` }}
            >
              Read the field guide
            </Link>
          </ConsoleCard>
        </SectionBlock>

        <SectionBlock
          eyebrow="My Papers"
          title="Published and in-progress research"
          description="Peer-reviewed and academic work I've authored, with more papers in progress or submitted to arXiv on the way."
        >
          <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`], gap: 3 }}>
            {myPapers.map(paper => (
              <ConsoleCard key={paper.url} title={`${paper.status} · ${paper.year}`} accent={consoleColors.accent}>
                <Heading as="h3" sx={{ color: consoleColors.text, fontSize: [2, 3], mt: 0, mb: 2, lineHeight: 1.15 }}>
                  {paper.title}
                </Heading>
                <Text sx={{ color: consoleColors.soft, fontSize: 0, fontFamily: `monospace`, mb: 2 }}>
                  {paper.venue}
                </Text>
                <Text sx={{ color: consoleColors.muted, mb: 3 }}>{paper.detail}</Text>
                <Box sx={{ display: `flex`, gap: 3, flexWrap: `wrap` }}>
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: consoleColors.accent, fontFamily: `monospace`, textDecoration: `none` }}
                  >
                    Read the paper
                  </a>
                  {paper.explainerSlug ? (
                    <Link
                      to={paper.explainerSlug}
                      sx={{ color: consoleColors.accentAlt, fontFamily: `monospace`, textDecoration: `none` }}
                    >
                      Read the explainer
                    </Link>
                  ) : null}
                  {paper.pdfUrl ? (
                    <a
                      href={paper.pdfUrl}
                      download
                      sx={{ color: consoleColors.accentAlt, fontFamily: `monospace`, textDecoration: `none` }}
                    >
                      Download PDF
                    </a>
                  ) : null}
                </Box>
              </ConsoleCard>
            ))}
            {inProgressPapers.map(paper => (
              <ConsoleCard key={paper.title} title="Coming soon" accent={consoleColors.warning}>
                <Heading as="h3" sx={{ color: consoleColors.text, fontSize: [2, 3], mt: 0, mb: 2, lineHeight: 1.15 }}>
                  {paper.title}
                </Heading>
                <Text sx={{ color: consoleColors.muted }}>{paper.detail}</Text>
              </ConsoleCard>
            ))}
          </Grid>
        </SectionBlock>

        <SectionBlock
          eyebrow="Papers I'm Explaining"
          title="Other researchers' work, made accessible"
          description="Plain-language breakdowns of papers I find worth understanding deeply, not just my own."
        >
          <ThreeColumnGrid>
            <ConsoleCard title="Coming soon" accent={consoleColors.accentAlt}>
              <Text sx={{ color: consoleColors.muted }}>
                First explainer of an external paper is in the works. Check back soon.
              </Text>
            </ConsoleCard>
          </ThreeColumnGrid>
        </SectionBlock>

        <SectionBlock
          eyebrow="Experiments & Engineering"
          title="Hands-on work behind the ideas"
          description="Practical experiments and engineering notes that ground the research in something buildable."
        >
          <ThreeColumnGrid>
            <ConsoleCard title="Coming soon" accent={consoleColors.warning}>
              <Text sx={{ color: consoleColors.muted }}>
                First experiment write-up is in progress. Related engineering work also lives on{` `}
                <Link to="/field-notes/" sx={{ color: consoleColors.accent }}>
                  Field Notes
                </Link>
                .
              </Text>
            </ConsoleCard>
          </ThreeColumnGrid>
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
            More papers, explainers, and experiments are on the way. In the meantime, see the full publication record
            or read the related infrastructure notes.
          </Text>
          <Box sx={{ display: `flex`, gap: 3, flexWrap: `wrap`, mt: 2 }}>
            <a
              href="https://scholar.google.com/citations?user=WujCeDkAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontFamily: `monospace`, color: `accent`, textDecoration: `none` }}
            >
              View Google Scholar profile
            </a>
            <Link to="/field-notes/" sx={{ fontFamily: `monospace`, color: `accent`, textDecoration: `none` }}>
              Read Field Notes
            </Link>
          </Box>
        </Box>
      </Box>
    </Layout>
  )
}

export default AiResearchPage

export const Head: HeadFC = () => (
  <Seo
    title="AI Research Explained: Papers, Experiments & Engineering"
    description="Making AI papers, experiments, and engineering ideas easier to understand — my own research, explainers of other papers, and hands-on experiments from Aditya Karnam."
    pathname="/ai-research/"
  />
)
