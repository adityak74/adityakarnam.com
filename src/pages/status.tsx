import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  ConsoleList,
  Divider,
  InlineLink,
  Panel,
  StatusRow,
  ThreeColumnGrid,
  TwoColumnGrid,
  WorldModelHero,
  WorldModelPageShell,
  WorldModelSection,
  labPalette,
} from "../components/world-model/pages-systems-stack-now/WorldModelPageChrome"

type ComponentStatus = {
  name: string
  status: string
  detail: string
  note: string
}

type HealthTile = {
  name: string
  state: string
  detail: string
}

const healthTiles: HealthTile[] = [
  {
    name: "Research paper",
    state: "Green",
    detail: "The published thesis and field notes are online and reachable.",
  },
  {
    name: "Building tools",
    state: "Green",
    detail: "The hero chat and supporting routes are available.",
  },
  {
    name: "Tools",
    state: "Green",
    detail: "The systems pages, stack maps, and project artifacts are intact.",
  },
]

const serviceStatus: ComponentStatus[] = [
  {
    name: "Website",
    status: "Operational",
    detail: "Static pages, navigation, and shared lab chrome are rendering normally.",
    note: "Updated from the latest local build and previewed in browser QA.",
  },
  {
    name: "Hero chat",
    status: "Operational",
    detail: "The multi-turn, persona-adaptive chat on the homepage is grounded via Cloudflare AI Search.",
    note: "Falls back to curated copy when retrieval or generation is unavailable.",
  },
  {
    name: "Content system",
    status: "Operational",
    detail: "Field notes, systems pages, and project write-ups are generated from the Gatsby source tree.",
    note: "No external CMS dependency.",
  },
  {
    name: "Build pipeline",
    status: "Operational",
    detail: "Production builds complete successfully; Gatsby still emits the known configstore EPERM warning in this sandbox.",
    note: "The build output is still produced and verified in preview.",
  },
  {
    name: "Local preview",
    status: "Operational",
    detail: "The static preview server is the fastest way to inspect the published output in this workspace.",
    note: "Use it for visual QA after each significant UI change.",
  },
]

const recentChecks = [
  "Desktop and mobile layout checked for the homepage, systems, field notes, about, and stack pages.",
  "Shared card and section spacing tightened so content reads like a status dashboard, not a loose landing page.",
  "Navigation footer now includes the status page for quick access.",
]

const knownIssues = [
  "Gatsby build in this sandbox still ends with the existing `~/.config/gatsby/config.json` EPERM warning.",
  "Hero chat answers fall back to curated copy unless the AI Search route can reach the retrieval and generation backend.",
  "This page is a status-style view, not a live uptime monitor with external probes yet.",
]

const StatusPage = (_props: PageProps) => (
  <Layout>
    <WorldModelPageShell>
      <WorldModelHero
        eyebrow="Status"
        title="Service status for the lab."
        description="A status-page view for the site, APIs, and publishing system. It is intentionally modeled like a product status console, but stays honest about what is actually running in this repo."
        aside={
          <div>
            <div
              style={{
                color: labPalette.slate,
                fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
                fontSize: "0.76rem",
                letterSpacing: "0.06em",
                marginBottom: "0.85rem",
                textTransform: "uppercase",
              }}
            >
              Overall state
            </div>
            <StatusRow label="Primary status" value="Operational" />
            <StatusRow label="Last checked" value="Local preview and build verification" />
            <StatusRow label="Scope" value="Website, APIs, content, and preview pipeline" />
          </div>
        }
      />

      <Divider />

      <WorldModelSection
        eyebrow="Current State"
        title="All monitored site surfaces are green"
        description="The status board highlights the pieces the site actually depends on: published content, tools, APIs, and the build/publish path."
      >
        <ThreeColumnGrid>
          {healthTiles.map((tile) => (
            <Panel key={tile.name} accent="green">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  marginBottom: "0.8rem",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "999px",
                    background: "#2f8f4e",
                    boxShadow: "0 0 0 4px rgba(47, 143, 78, 0.12)",
                    flexShrink: 0,
                  }}
                />
                <StatusRow label={tile.name} value={tile.state} />
              </div>
              <p style={{ color: labPalette.body, lineHeight: 1.7, margin: 0 }}>{tile.detail}</p>
            </Panel>
          ))}
        </ThreeColumnGrid>
      </WorldModelSection>

      <WorldModelSection
        eyebrow="Service Map"
        title="What is up right now"
        description="These are the components that matter for visitors and for the publication workflow behind the site."
      >
        <TwoColumnGrid>
          {serviceStatus.map((service) => (
            <Panel key={service.name} accent={service.status === "Operational" ? "green" : "cyan"}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  marginBottom: "0.35rem",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "999px",
                    background: service.status === "Operational" ? "#2f8f4e" : "#C2522D",
                    boxShadow:
                      service.status === "Operational"
                        ? "0 0 0 4px rgba(47, 143, 78, 0.12)"
                        : "0 0 0 4px rgba(194, 82, 45, 0.12)",
                    flexShrink: 0,
                  }}
                />
                <StatusRow label={service.name} value={service.status} />
              </div>
              <p style={{ color: labPalette.body, lineHeight: 1.7, margin: "0.9rem 0 0" }}>{service.detail}</p>
              <p style={{ color: labPalette.slate, lineHeight: 1.65, margin: "0.75rem 0 0" }}>{service.note}</p>
            </Panel>
          ))}
        </TwoColumnGrid>
      </WorldModelSection>

      <WorldModelSection
        eyebrow="Recent Checks"
        title="What was verified most recently"
        description="This section summarizes the last manual verification pass across the website and the lab pages."
      >
        <TwoColumnGrid>
          <Panel accent="cyan">
            <ConsoleList items={recentChecks} />
          </Panel>
          <Panel accent="green">
            <ConsoleList items={knownIssues} />
          </Panel>
        </TwoColumnGrid>
      </WorldModelSection>

      <WorldModelSection
        eyebrow="Related"
        title="Where to go next"
        description="The status page is a lightweight operations view. The other pages explain the systems and the active work behind it."
      >
        <TwoColumnGrid>
          <Panel accent="cyan">
            <p style={{ color: labPalette.body, marginTop: 0 }}>
              Read <InlineLink to="/systems/">Systems</InlineLink> for the artifact index and research-backed project map.
            </p>
          </Panel>
          <Panel accent="green">
            <p style={{ color: labPalette.body, marginTop: 0 }}>
              Read <InlineLink to="/now/">Now</InlineLink> for the active fronts and current wedges in motion.
            </p>
          </Panel>
        </TwoColumnGrid>
      </WorldModelSection>
    </WorldModelPageShell>
  </Layout>
)

export default StatusPage

export const Head: HeadFC = () => (
  <Seo
    title="Status"
    description="Service status page for Aditya Karnam, AI researcher."
    pathname="/status/"
  />
)
