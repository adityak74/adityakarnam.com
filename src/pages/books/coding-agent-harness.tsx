/** @jsx jsx */
import * as React from "react"
import type { HeadFC } from "gatsby"
import { jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title, Section, Prose, TextLink, RuledList, ed } from "../../components/world-model/pages-systems-stack-now/editorial"

const BOOK_BASE = "/books/building-a-coding-agent-harness"
const PDF_URL = `${BOOK_BASE}.pdf`
const HTML_URL = `${BOOK_BASE}.html`
const ZIP_URL = `${BOOK_BASE}-edition-1.zip`
const COVER_URL = `${BOOK_BASE}-cover.png`

const chapters = [
  "The Harness Is the System",
  "One Model Call, No Framework",
  "The Bounded Agent Loop",
  "Typed, Unsafe-Free Communication",
  "Execution Policy and Approval Gates",
  "Verification as a Completion Gate",
  "Context and Instruction Loading",
  "Sessions and State Management",
  "Profiles and Security Gates",
  "MCP: Model Context Protocol",
  "Observability and Telemetry",
  "Evaluation and Benchmarks",
  "The Complete Reference Harness",
  "Appendix: The Quecto Reference",
]

const CodingAgentHarnessBookPage = () => (
  <Layout>
    <Page>
      <Title
        eyebrow="Book · Edition 1"
        lede="From model calls to a safe, observable, evaluable runtime. Written with Arjun Jaggi: 75 pages, 14 chapters, a runnable Rust core, MIT licensed."
      >
        Building a Coding Agent Harness
      </Title>

      <Section>
        <div sx={{ display: `grid`, gridTemplateColumns: [`1fr`, `1fr 200px`], gap: 4, alignItems: `start` }}>
          <Prose>
            <p>
              Chapters 2 to 5 develop a compact teaching harness you can run. Chapters 6 to 12 cover production
              concerns (verification, sessions, MCP, telemetry, evaluation) and are marked as design studies where the
              small crate does not implement them. Quecto is the larger open-source Rust system I use as the reference.
            </p>
            <p sx={{ display: `flex`, gap: 3, flexWrap: `wrap`, fontSize: `15px` }}>
              <a href={PDF_URL} download sx={{ color: ed.clay, textDecoration: `none` }}>Download the PDF</a>
              <a href={HTML_URL} target="_blank" rel="noreferrer" sx={{ color: ed.clay, textDecoration: `none` }}>HTML edition</a>
              <a href={ZIP_URL} download sx={{ color: ed.clay, textDecoration: `none` }}>Source and examples (.zip)</a>
              <a href="https://github.com/adityak74/quecto" target="_blank" rel="noreferrer" sx={{ color: ed.clay, textDecoration: `none` }}>Quecto on GitHub</a>
            </p>
          </Prose>
          <img
            src={COVER_URL}
            alt="Cover of Building a Coding Agent Harness by Aditya Karnam and Arjun Jaggi"
            sx={{ display: `block`, width: `100%`, maxWidth: 200, border: `1px solid ${ed.hairline}`, borderRadius: `2px` }}
          />
        </div>
      </Section>

      <Section label="Read" title="The full book">
        <iframe
          src={PDF_URL}
          title="Building a Coding Agent Harness, complete 75-page book"
          sx={{ display: `block`, width: `100%`, height: [`72vh`, `80vh`, `86vh`], minHeight: 520, border: `1px solid ${ed.hairline}`, borderRadius: `2px` }}
        />
      </Section>

      <Section label="Contents" title="Fourteen chapters">
        <RuledList rows={chapters.map((c, i) => ({ key: c, meta: String(i + 1).padStart(2, `0`), title: c }))} />
      </Section>
    </Page>
  </Layout>
)

export default CodingAgentHarnessBookPage

export const Head: HeadFC = () => (
  <Seo
    title="Building a Coding Agent Harness (free book)"
    description="A free 75-page practical guide to building a safe coding-agent harness in Rust, with a runnable reference implementation and a source map to Quecto."
    pathname="/books/coding-agent-harness/"
  />
)
