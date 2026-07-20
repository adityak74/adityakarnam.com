import { useApp } from "@modelcontextprotocol/ext-apps/react"

export function PortfolioApp() {
  const { app, error } = useApp({
    appInfo: { name: "Portfolio App", version: "1.0.0" },
    capabilities: {},
  })

  if (error) return <div role="alert">Failed to connect: {error.message}</div>
  if (!app) return <div>Connecting…</div>

  return <div>Portfolio app connected. Tabs coming in a later task.</div>
}
