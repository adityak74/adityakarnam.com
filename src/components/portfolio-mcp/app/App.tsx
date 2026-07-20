import type { App as McpApp } from "@modelcontextprotocol/ext-apps"
import { useApp } from "@modelcontextprotocol/ext-apps/react"
import { useState } from "react"
import { FitCheckTab } from "./FitCheckTab"
import { ProjectsTab } from "./ProjectsTab"

type TabId = "fit" | "projects"

export function PortfolioApp() {
  const { app, error } = useApp({
    appInfo: { name: "Portfolio App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (createdApp) => {
      createdApp.onerror = console.error
    },
  })

  if (error) return <div role="alert">Failed to connect: {error.message}</div>
  if (!app) return <div>Connecting…</div>

  return <PortfolioAppShell app={app} />
}

function PortfolioAppShell({ app }: { app: McpApp }) {
  const [tab, setTab] = useState<TabId>("fit")

  return (
    <main>
      <nav>
        <button type="button" aria-pressed={tab === "fit"} onClick={() => setTab("fit")}>
          Fit Check
        </button>
        <button type="button" aria-pressed={tab === "projects"} onClick={() => setTab("projects")}>
          Projects
        </button>
      </nav>
      {tab === "fit" ? <FitCheckTab app={app} /> : <ProjectsTab app={app} />}
    </main>
  )
}
