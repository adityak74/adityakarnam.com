/** @jsx jsx */
import * as React from "react"
import { HeadFC } from "gatsby"
import { jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title, Section, Prose, RuledList, TextLink, Row, Explore } from "../components/world-model/pages-systems-stack-now/editorial"

// Co-authored with Arjun Jaggi. Source: arjunjaggi.com /papers/ index, /books/, /whitepapers/.
const AJ = "https://arjunjaggi.com/"
const paper = (id: string, mo: string, title: string, body: string, path: string): Row => ({
  key: id,
  meta: mo,
  tag: `Concept paper · ${id}`,
  title,
  body,
  links: [{ label: "Read the paper", href: `${AJ}papers/${path}.html` }],
})

const groups: { label: string; title: string; rows: Row[] }[] = [
  {
    label: "Agent security",
    title: "What an agent can be made to do",
    rows: [
      paper("ACS-2026-012", "Aug 2026", "The Agent Compromise Surface", "A formal framework for enterprise AI agent security.", "agent-compromise-surface"),
      paper("ADC-2026-014", "Sep 2026", "Agent Deception Containment", "A formal framework for the behavioral audit gap in enterprise AI deployments.", "agent-deception-containment"),
      paper("EAIF-2026-005", "Aug 2026", "The Enterprise Agent Identity Framework", "Authority bleed, agent identity envelopes, and delegation chain governance for autonomous agents.", "enterprise-agent-identity"),
    ],
  },
  {
    label: "Governance",
    title: "Who controls the agents, and how",
    rows: [
      paper("EACP-2026-001", "Aug 2026", "The Enterprise AI Control Plane", "A governance and orchestration framework for LLM deployments at scale.", "enterprise-ai-control-plane"),
      paper("EAGF-2026-002", "Aug 2026", "The Enterprise AI Agent Governance Framework", "Action blast radius, delegation boundaries, and reversibility budgets for agentic AI.", "enterprise-ai-agent-governance"),
      paper("MATGF-2026-003", "Aug 2026", "Multi-Agent Trust Governance", "Trust inheritance, privilege cascade, and agent trust chains in orchestration systems.", "multi-agent-trust-governance"),
      paper("MAGT-2026-008", "Aug 2026", "The Governance Topology of Enterprise Multi-Agent Systems", "How the shape of a multi-agent system decides what can be governed.", "multiagent-governance-topology"),
    ],
  },
  {
    label: "Accountability",
    title: "Who answers for the output, and what it was worth",
    rows: [
      paper("AIFG-2026-007", "Aug 2026", "The AI Fiduciary Gap", "Accountability vacuum, outcome attribution failure, and a governance architecture for AI fiduciary duty.", "ai-fiduciary-gap"),
      paper("AVAL-2026-006", "Aug 2026", "The AI Value Accounting Layer", "Token-value displacement, consumption decoupling, and financial accountability for enterprise AI.", "enterprise-ai-value-accounting"),
      paper("CRF-2026-009", "Aug 2026", "The Contribution Ratio Framework", "Continuous authorship attribution and the provenance collapse property for AI-assisted work.", "contribution-ratio-authorship-framework"),
      paper("AOGF-2026-004", "Aug 2026", "Output Genealogy", "A formal framework for enterprise AI audit provenance.", "ai-output-provenance"),
    ],
  },
  {
    label: "Memory and measurement",
    title: "What agents remember, and how to measure the gain",
    rows: [
      paper("EMGF-2026-004", "Aug 2026", "The Enterprise Memory Governance Framework", "Memory drift, recall boundaries, and provenance chains for persistent AI memory at scale.", "enterprise-memory-governance"),
      paper("EAEF-2026-010", "Aug 2026", "Enterprise AI Ensembles", "Multi-model routing, output arbitration, and ensemble governance.", "enterprise-ai-ensembles"),
      paper("ICR-2026-013", "Sep 2026", "The Innovation Compression Ratio", "Measuring and optimizing AI-induced cycle-time reduction in enterprise R&D.", "innovation-compression-ratio"),
    ],
  },
]

const book = (slug: string, title: string, body: string): Row => ({
  key: slug,
  meta: "2026",
  tag: "Book",
  title,
  body,
  links: [{ label: "Book", href: `${AJ}books/${slug}.html` }],
})
const books: Row[] = [
  book("the-trust-stack", "The Trust Stack", "A framework for building verifiable trust in enterprise AI."),
  book("the-model-decision", "The Model Decision", "How enterprise leaders choose, deploy, and govern AI models in 2026."),
  book("the-harness-engineer", "The Harness Engineer", "Building the infrastructure layer that makes enterprise AI actually work."),
  book("the-inference-budget", "The Inference Budget", "A governance framework for enterprise AI inference cost accountability."),
  book("the-contained-agent", "The Contained Agent", "An executive playbook for AI agent security."),
  book("the-memory-layer", "The Memory Layer", "How enterprises build AI that remembers."),
  book("the-command-layer", "The Command Layer", "How enterprise teams build, deploy, and govern AI-powered command-line tools."),
  book("the-local-model", "The Local Model", "On-premise AI infrastructure for regulated industries."),
]
const whitepapers: Row[] = [
  { key: "wp-local", meta: "Oct 2026", tag: "White paper No. 03", title: "The Future Is Local", links: [{ label: "Read", href: `${AJ}whitepapers/the-future-is-local.html` }] },
  { key: "wp-defensibility", meta: "Oct 2026", tag: "White paper", title: "The Defensibility Gap", links: [{ label: "Read", href: `${AJ}whitepapers/defensibility-gap.html` }] },
]

const PAPER_COUNT = groups.reduce((n, g) => n + g.rows.length, 0)

const FrameworksPage = () => (
  <Layout>
    <Page>
      <Title
        eyebrow="Frameworks"
        lede={`${PAPER_COUNT} concept papers, ${books.length} books and ${whitepapers.length} white papers on how enterprises should secure, govern and account for AI agents. Co-authored with Arjun Jaggi.`}
      >
        Frameworks for enterprise AI
      </Title>

      <Section label="Why" title="The engineering is the easy part">
        <Prose>
          <p>
            Most of my work is measuring what models and agents actually do on real hardware. These frameworks take the
            other side of that question: once an agent can act, who is allowed to let it, who answers for the result,
            and how anyone would know it went wrong. Each paper names a failure mode and gives a structure to govern it.
          </p>
        </Prose>
      </Section>

      {groups.map((g) => (
        <Section key={g.label} label={g.label} title={g.title}>
          <RuledList rows={g.rows} />
        </Section>
      ))}

      <Section label="Books" title="Books">
        <RuledList rows={books} />
      </Section>

      <Section label="White papers" title="White papers">
        <RuledList rows={whitepapers} />
        <p sx={{ mt: 4, mb: 0, fontSize: `15px` }}>
          Full series on <TextLink href={`${AJ}papers/`}>arjunjaggi.com</TextLink>. Peer-reviewed papers and experiments are on the{` `}
          <TextLink to="/ai-research/">research page</TextLink>.
        </p>
      </Section>
      <Explore keys={["research", "writing", "about"]} />
    </Page>
  </Layout>
)

export default FrameworksPage

export const Head: HeadFC = () => (
  <Seo
    title="Frameworks for Enterprise AI: Concept Papers and Books"
    description="14 concept papers, 8 books and 2 white papers by Aditya Karnam and Arjun Jaggi on AI agent security, governance, accountability and memory."
    pathname="/frameworks/"
  />
)
