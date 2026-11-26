/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { ed, Page, Title, Section, Prose, Pre } from "../components/world-model/pages-systems-stack-now/editorial"
import {
  CLAUDE_CODE_INSTALL_COMMAND,
  CLAUDE_CODE_VERIFY_COMMAND,
  PORTFOLIO_MCP_INSTALL_MARKDOWN,
} from "../components/portfolio-mcp/install-copy"

const connectorUrl = "https://adityakarnam.com/mcp"

const buttonStyle: React.CSSProperties = {
  background: "transparent",
  border: `1px solid ${ed.hairline}`,
  borderRadius: "4px",
  color: ed.ink,
  cursor: "pointer",
  fontFamily: ed.mono,
  fontSize: "12px",
  letterSpacing: "0.06em",
  marginTop: "0.75rem",
  padding: "0.5rem 0.8rem",
  textTransform: "uppercase",
}

const listSx = { color: ed.ink, fontSize: "17px", lineHeight: 1.65, m: 0, maxWidth: "68ch", pl: "1.2rem", li: { mb: 2 } }

const setupSteps = [
  "Open Claude.",
  "Go to Settings / Customize.",
  "Open Connectors.",
  "Choose Add custom connector.",
  "Paste https://adityakarnam.com/mcp.",
  "Save the connector.",
]

const recruiterPrompts = [
  "Use Aditya Karnam's portfolio connector. Is he a fit for this AI infrastructure role?",
  "Which projects show agent runtime or MCP experience?",
  "Give me a recruiter brief with evidence and source links.",
  "What is his recent work around local inference and evals?",
  "Compare his work to this role description and list the strongest evidence.",
]

const agentPrompts = [
  "Act as an engineer. Which systems should I inspect first?",
  "Act as a researcher. What is his clearest research wedge?",
  "Search the portfolio for retrieval, memory, local inference, and eval work.",
]

const McpInstallPage = (_props: PageProps) => {
  const [copiedLabel, setCopiedLabel] = React.useState<string | null>(null)

  const copyToClipboard = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedLabel(label)
    window.setTimeout(() => setCopiedLabel(null), 2000)
  }

  return (
    <Layout>
      <Page>
        <Title
          eyebrow="Portfolio MCP"
          lede="A read-only connector that lets Claude query the public information on this site: systems, projects, recent work, research agenda and source links. It cannot reach private data."
        >
          Install the portfolio MCP
        </Title>

        <Section label="Connector" title="URL">
          <Pre>{connectorUrl}</Pre>
          <button type="button" onClick={() => copyToClipboard(connectorUrl, "Connector URL")} style={buttonStyle}>
            {copiedLabel === "Connector URL" ? "Copied" : "Copy URL"}
          </button>
        </Section>

        <Section label="Claude" title="Add the custom connector">
          <Prose>
            <p>For Team or Enterprise accounts, an organization owner may need to add the connector first.</p>
          </Prose>
          <ol sx={listSx}>
            {setupSteps.map(step => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Section>

        <Section label="Claude Code" title="Add from the command line">
          <Pre>{CLAUDE_CODE_INSTALL_COMMAND}</Pre>
          <button
            type="button"
            onClick={() => copyToClipboard(CLAUDE_CODE_INSTALL_COMMAND, "Claude Code command")}
            style={buttonStyle}
          >
            {copiedLabel === "Claude Code command" ? "Copied" : "Copy command"}
          </button>
          <p sx={{ mt: 4, mb: 2, color: ed.secondary }}>Verify with:</p>
          <Pre>{CLAUDE_CODE_VERIFY_COMMAND}</Pre>
        </Section>

        <Section label="Other agents" title="Markdown install guide">
          <Prose>
            <p>For Codex, Cursor, Antigravity, or any agent that supports remote MCP servers.</p>
          </Prose>
          <button
            type="button"
            onClick={() => copyToClipboard(PORTFOLIO_MCP_INSTALL_MARKDOWN, "Markdown guide")}
            style={{ ...buttonStyle, marginBottom: "1rem" }}
          >
            {copiedLabel === "Markdown guide" ? "Copied" : "Copy Markdown guide"}
          </button>
          <div sx={{ maxHeight: "22rem", overflowY: `auto` }}>
            <Pre>{PORTFOLIO_MCP_INSTALL_MARKDOWN}</Pre>
          </div>
        </Section>

        <Section label="Prompts" title="Things to ask">
          <h3 sx={{ fontFamily: ed.serif, fontWeight: 500, fontSize: `1.25rem`, mt: 0, mb: 2 }}>As a recruiter</h3>
          <ul sx={listSx}>
            {recruiterPrompts.map(p => <li key={p}>{p}</li>)}
          </ul>
          <h3 sx={{ fontFamily: ed.serif, fontWeight: 500, fontSize: `1.25rem`, mt: 4, mb: 2 }}>As an agent</h3>
          <ul sx={listSx}>
            {agentPrompts.map(p => <li key={p}>{p}</li>)}
          </ul>
        </Section>

        <Section label="Scope" title="What it covers">
          <ul sx={listSx}>
            <li>AI infrastructure fit, systems work, MCP, retrieval, memory, local inference and evals.</li>
            <li>Not private files, email, analytics, personal data, availability, compensation, immigration status or references.</li>
            <li>Every work claim returned by the tools includes source URLs.</li>
          </ul>
        </Section>
      </Page>
    </Layout>
  )
}

export default McpInstallPage

export const Head: HeadFC = () => (
  <Seo
    title="Install the Portfolio MCP Connector"
    description="Install the public, read-only Portfolio MCP connector for Claude and other agent clients to query Aditya Karnam's projects, writing and research with sources."
    pathname="/mcp-install/"
  />
)
