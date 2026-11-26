import type { App as McpApp } from "@modelcontextprotocol/ext-apps"
import { useApp } from "@modelcontextprotocol/ext-apps/react"
import { useState } from "react"
import { FitCheckTab } from "./FitCheckTab"
import { ProjectsTab } from "./ProjectsTab"
import { BodyText, EyebrowLabel, PageShell, Panel, SectionHeading, palette } from "./theme"

type TabId = "fit" | "projects"

export function PortfolioApp() {
  const { app, error } = useApp({
    appInfo: { name: "Portfolio App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (createdApp) => {
      createdApp.onerror = console.error
    },
  })

  if (error) {
    return (
      <PageShell>
        <Panel accent="cyan">
          <BodyText style={{ color: palette.cyan }} role="alert">
            Failed to connect: {error.message}
          </BodyText>
        </Panel>
      </PageShell>
    )
  }
  if (!app) {
    return (
      <PageShell>
        <Panel accent="green">
          <BodyText>Connecting...</BodyText>
        </Panel>
      </PageShell>
    )
  }

  return <PortfolioAppShell app={app} />
}

function PortfolioAppShell({ app }: { app: McpApp }) {
  const [tab, setTab] = useState<TabId>("fit")

  return (
    <PageShell>
      <main style={{ display: "grid", gap: "1rem", margin: "0 auto", maxWidth: "880px", width: "100%" }}>
        <header
          style={{
            alignItems: "end",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
          }}
        >
          <div>
            <EyebrowLabel>Portfolio MCP</EyebrowLabel>
            <SectionHeading style={{ fontSize: "clamp(2rem, 7vw, 3.35rem)" }}>Fit check</SectionHeading>
          </div>
          <nav
            aria-label="Portfolio app tabs"
            style={{
              borderBottom: `1px solid ${palette.border}`,
              display: "flex",
              gap: "0.25rem",
              maxWidth: "100%",
              overflowX: "auto",
                          }}
          >
            <button className="tab-button" type="button" aria-pressed={tab === "fit"} onClick={() => setTab("fit")}>
              Fit Check
            </button>
            <button
              className="tab-button"
              type="button"
              aria-pressed={tab === "projects"}
              onClick={() => setTab("projects")}
            >
              Projects
            </button>
          </nav>
        </header>
        {tab === "fit" ? <FitCheckTab app={app} /> : <ProjectsTab app={app} />}
      </main>
    </PageShell>
  )
}
