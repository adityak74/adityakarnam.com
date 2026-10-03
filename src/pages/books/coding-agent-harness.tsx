/** @jsx jsx */
import * as React from "react"
import type { HeadFC } from "gatsby"
import { Box, Grid, Heading, Text, jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  ConsoleShell,
  HeroStat,
  SectionBlock,
  SignalPill,
  consoleColors,
} from "../../components/world-model/pages-field-notes-about/primitives"

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
    <Box sx={{ display: "grid", gap: [3, 4], my: [3, 4] }}>
      <ConsoleShell>
        <Grid sx={{ gridTemplateColumns: ["1fr", "1fr", "1.35fr 0.65fr"], gap: 4, alignItems: "center" }}>
          <Box>
            <SignalPill>Free practical systems guide · Edition 1</SignalPill>
            <Heading
              as="h1"
              sx={{ color: consoleColors.text, fontSize: [5, 6, 7], mt: 3, mb: 3, maxWidth: "14ch", lineHeight: 1.02 }}
            >
              Building a Coding Agent Harness
            </Heading>
            <Text sx={{ display: "block", color: consoleColors.muted, fontSize: [2, 2, 3], maxWidth: "58ch", mb: 3 }}>
              From model calls to a safe, observable, evaluable runtime. Build the runnable Rust core, then study how its boundaries map to Quecto in production.
            </Text>
            <Text sx={{ display: "block", color: consoleColors.soft, fontSize: [1, 2], maxWidth: "62ch" }}>
              By Aditya Karnam and Arjun Jaggi. Chapters 2–5 develop a compact teaching harness you can run; Chapters 6–12 clearly mark production-runtime concerns as design studies.
            </Text>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 4 }}>
              <a
                href={PDF_URL}
                download
                sx={{ background: consoleColors.accent, borderRadius: 8, color: "#171816", fontWeight: 700, px: 3, py: 2, textDecoration: "none" }}
              >
                Download the PDF
              </a>
              <a href={HTML_URL} target="_blank" rel="noreferrer" sx={{ color: consoleColors.accent, fontFamily: "monospace", py: 2, textDecoration: "none" }}>
                Open the accessible HTML edition ↗
              </a>
              <a href={ZIP_URL} download sx={{ color: consoleColors.accentAlt, fontFamily: "monospace", py: 2, textDecoration: "none" }}>
                Get source + examples (.zip)
              </a>
            </Box>
          </Box>
          <Box sx={{ justifySelf: ["center", null, "end"], maxWidth: "280px" }}>
            <img
              src={COVER_URL}
              alt="Cover of Building a Coding Agent Harness by Aditya Karnam and Arjun Jaggi"
              sx={{ display: "block", width: "100%", borderRadius: 8, boxShadow: "0 18px 48px rgba(0,0,0,0.3)" }}
            />
          </Box>
        </Grid>

        <Grid sx={{ gridTemplateColumns: ["repeat(2, minmax(0, 1fr))", "repeat(4, minmax(0, 1fr))"], gap: 3, mt: 4 }}>
          <HeroStat label="Pages" value="75" />
          <HeroStat label="Chapters" value="14" />
          <HeroStat label="Implementation" value="Rust" />
          <HeroStat label="License" value="MIT" />
        </Grid>
      </ConsoleShell>

      <SectionBlock
        eyebrow="Read Online"
        title="Preview the complete book"
        description="The PDF is embedded below. If your browser does not display it inline, use Download the PDF above or open the standalone HTML edition."
      >
        <Box sx={{ border: `1px solid ${consoleColors.border}`, borderRadius: 12, overflow: "hidden", bg: consoleColors.panelAlt }}>
          <iframe
            src={PDF_URL}
            title="Building a Coding Agent Harness — complete 75-page book"
            sx={{ display: "block", width: "100%", height: ["72vh", "80vh", "86vh"], minHeight: 520, border: "none" }}
          />
        </Box>
      </SectionBlock>

      <SectionBlock
        eyebrow="What You Will Build"
        title="A small, testable harness — one boundary at a time"
        description="The reference crate keeps the executable core deliberately small, then uses the production Quecto project to ground the wider runtime architecture."
      >
        <Grid sx={{ gridTemplateColumns: ["1fr", "1fr", "1fr 1fr"], gap: 3 }}>
          {[
            ["Runnable core", "Model transport, a bounded tool loop, typed tools, repository context, and execution policy, assembled and tested in the book's Rust crate."],
            ["Production concerns", "Verification, sessions, configuration, MCP, telemetry, and evaluation—explicitly labeled as design extensions where the compact crate does not implement them."],
            ["Quecto as evidence", "A source-mapped tour of the larger open-source Rust system, including the production crates, features, and boundaries behind the examples."],
            ["For working engineers", "Short code excerpts, failure modes, invariants, build checkpoints, and exercises make the guide useful at the terminal, not just on the shelf."],
          ].map(([title, description]) => (
            <Box key={title} sx={{ border: `1px solid ${consoleColors.border}`, borderRadius: 10, p: 3, bg: consoleColors.panelAlt }}>
              <Text sx={{ display: "block", color: consoleColors.accent, fontFamily: "monospace", fontSize: 0, mb: 2 }}>{title}</Text>
              <Text sx={{ display: "block", color: consoleColors.soft, lineHeight: 1.65 }}>{description}</Text>
            </Box>
          ))}
        </Grid>
      </SectionBlock>

      <SectionBlock eyebrow="Contents" title="Fourteen chapters, from API boundary to production system">
        <Grid as="ol" sx={{ gridTemplateColumns: ["1fr", "1fr 1fr"], gap: 0, pl: 3, m: 0 }}>
          {chapters.map((chapter, index) => (
            <li key={chapter} style={{ borderBottom: `1px solid ${consoleColors.border}`, padding: "0.7rem 0.5rem 0.7rem 0" }}>
              <span style={{ color: consoleColors.accent, fontFamily: "monospace", marginRight: "0.5rem" }}>{String(index + 1).padStart(2, "0")}</span>
              <span style={{ color: consoleColors.soft }}>{chapter}</span>
            </li>
          ))}
        </Grid>
      </SectionBlock>

      <Box sx={{ border: `1px solid ${consoleColors.border}`, borderRadius: 12, p: [3, 4], bg: consoleColors.panelAlt }}>
        <Text sx={{ display: "block", color: consoleColors.accent, fontFamily: "monospace", fontSize: 0, mb: 2 }}>The proof project</Text>
        <Heading as="h2" sx={{ color: consoleColors.text, fontSize: [3, 4], mb: 2 }}>Quecto: the system behind the examples</Heading>
        <Text sx={{ display: "block", color: consoleColors.soft, lineHeight: 1.65, maxWidth: "70ch", mb: 3 }}>
          The book is a general guide to harness design, with Rust as its implementation language and Quecto as a production reference—not a claim that the compact teaching crate duplicates every Quecto feature.
        </Text>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <a href="https://github.com/adityak74/quecto" target="_blank" rel="noreferrer" sx={{ color: consoleColors.accent, fontFamily: "monospace", textDecoration: "none" }}>Explore Quecto on GitHub ↗</a>
          <a href={ZIP_URL} download sx={{ color: consoleColors.accentAlt, fontFamily: "monospace", textDecoration: "none" }}>Download the reference source package ↓</a>
        </Box>
      </Box>
    </Box>
  </Layout>
)

export default CodingAgentHarnessBookPage

export const Head: HeadFC = () => (
  <Seo
    title="Building a Coding Agent Harness — Free Book"
    description="A free 75-page practical systems guide to building a safe coding-agent harness in Rust, with a runnable reference implementation and production Quecto source map."
    pathname="/books/coding-agent-harness/"
  />
)
