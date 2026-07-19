import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  ConsoleList,
  Panel,
  ThreeColumnGrid,
  TwoColumnGrid,
  WorldModelHero,
  WorldModelPageShell,
  WorldModelSection,
  labPalette,
} from "../components/world-model/pages-systems-stack-now/WorldModelPageChrome"
import {
  CLAUDE_CODE_INSTALL_COMMAND,
  CLAUDE_CODE_VERIFY_COMMAND,
  PORTFOLIO_MCP_INSTALL_MARKDOWN,
} from "../components/portfolio-mcp/install-copy"

const connectorUrl = "https://adityakarnam.com/mcp"

const buttonStyle: React.CSSProperties = {
  background: "#1A1A18",
  border: "1px solid #1A1A18",
  borderRadius: "6px",
  color: "#FAF9F7",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 600,
  padding: "0.55rem 0.8rem",
}

const codeBlockStyle: React.CSSProperties = {
  background: "#1A1A18",
  borderRadius: "8px",
  color: "#FAF9F7",
  fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
  fontSize: "0.9rem",
  lineHeight: 1.6,
  overflowX: "auto",
  padding: "1rem",
  whiteSpace: "pre-wrap",
}

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
      <WorldModelPageShell>
        <WorldModelHero
          eyebrow="Portfolio MCP"
          title="Install Aditya Karnam's Portfolio MCP"
          description="This connector lets Claude read structured public information from Aditya's portfolio: systems, projects, recent work, research agenda, and source links. It is read-only and does not access private data."
          aside={
            <div>
              <div style={{ color: labPalette.slate, fontFamily: "monospace", fontSize: "0.78rem", marginBottom: "0.75rem" }}>
                Connector URL
              </div>
              <pre style={codeBlockStyle}>{connectorUrl}</pre>
              <button type="button" onClick={() => copyToClipboard(connectorUrl, "Connector URL")} style={buttonStyle}>
                {copiedLabel === "Connector URL" ? "Copied" : "Copy URL"}
              </button>
            </div>
          }
        />

        <WorldModelSection
          eyebrow="Claude Setup"
          title="Add the custom connector"
          description="For Team or Enterprise accounts, an organization owner may need to add the connector first."
        >
          <TwoColumnGrid>
            <Panel accent="cyan">
              <ol style={{ color: labPalette.body, lineHeight: 1.7, margin: 0, paddingLeft: "1.35rem" }}>
                {setupSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Panel>
            <Panel accent="green">
              <h2 style={{ color: labPalette.heading, fontSize: "1.25rem", marginTop: 0 }}>Claude Code</h2>
              <pre style={codeBlockStyle}>{CLAUDE_CODE_INSTALL_COMMAND}</pre>
              <button
                type="button"
                onClick={() => copyToClipboard(CLAUDE_CODE_INSTALL_COMMAND, "Claude Code command")}
                style={buttonStyle}
              >
                {copiedLabel === "Claude Code command" ? "Copied" : "Copy Command"}
              </button>
              <p style={{ color: labPalette.body, lineHeight: 1.6 }}>Verify with:</p>
              <pre style={codeBlockStyle}>{CLAUDE_CODE_VERIFY_COMMAND}</pre>
            </Panel>
          </TwoColumnGrid>
        </WorldModelSection>

        <WorldModelSection
          eyebrow="Guide"
          title="Copy the Markdown install guide"
          description="Use this for Codex, Cursor, Antigravity, or any agent that supports remote MCP servers."
        >
          <Panel accent="slate">
            <button
              type="button"
              onClick={() => copyToClipboard(PORTFOLIO_MCP_INSTALL_MARKDOWN, "Markdown guide")}
              style={buttonStyle}
            >
              {copiedLabel === "Markdown guide" ? "Copied" : "Copy Markdown Guide"}
            </button>
            <pre style={{ ...codeBlockStyle, marginTop: "1rem", maxHeight: "22rem" }}>{PORTFOLIO_MCP_INSTALL_MARKDOWN}</pre>
          </Panel>
        </WorldModelSection>

        <WorldModelSection eyebrow="Prompts" title="Start with evidence-seeking prompts">
          <ThreeColumnGrid>
            <Panel accent="cyan">
              <h2 style={{ color: labPalette.heading, fontSize: "1.15rem", marginTop: 0 }}>Recruiters</h2>
              <ConsoleList items={recruiterPrompts} />
            </Panel>
            <Panel accent="green">
              <h2 style={{ color: labPalette.heading, fontSize: "1.15rem", marginTop: 0 }}>Agents</h2>
              <ConsoleList items={agentPrompts} />
            </Panel>
            <Panel accent="slate">
              <h2 style={{ color: labPalette.heading, fontSize: "1.15rem", marginTop: 0 }}>Scope</h2>
              <ConsoleList
                items={[
                  "Best used for AI infrastructure fit, systems work, MCP, retrieval, memory, local inference, and evals.",
                  "Not for private files, email, analytics, personal data, availability, compensation, immigration status, or references.",
                  "Every work claim returned by tools includes source URLs.",
                ]}
              />
            </Panel>
          </ThreeColumnGrid>
        </WorldModelSection>
      </WorldModelPageShell>
    </Layout>
  )
}

export default McpInstallPage

export const Head: HeadFC = () => (
  <Seo
    title="Install Aditya Karnam's Portfolio MCP"
    description="Install the public, read-only Aditya Karnam Portfolio MCP connector for Claude and agent workflows."
    pathname="/mcp-install/"
  />
)
