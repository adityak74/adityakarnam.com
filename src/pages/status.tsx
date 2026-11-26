import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title, Section, RuledList, Row } from "../components/world-model/pages-systems-stack-now/editorial"

const services: Row[] = [
  { key: "site", meta: "Operational", title: "Website", body: "Static pages and navigation render normally." },
  {
    key: "chat",
    meta: "Operational",
    title: "Hero chat",
    body: "Multi-turn chat on the homepage, grounded through Cloudflare AI Search. Falls back to curated copy when retrieval or generation is unavailable.",
  },
  {
    key: "content",
    meta: "Operational",
    title: "Content system",
    body: "Posts and pages are generated from the Gatsby source tree. No external CMS.",
  },
  {
    key: "build",
    meta: "Operational",
    title: "Build pipeline",
    body: "Production builds complete. Gatsby still prints the known configstore EPERM warning in this sandbox; the output is produced and checked in preview.",
  },
]

const knownIssues = [
  "Gatsby build in this sandbox ends with the existing ~/.config/gatsby/config.json EPERM warning.",
  "Hero chat answers fall back to curated copy unless the AI Search route can reach its backend.",
  "This is a manual status page, not a live uptime monitor. There are no external probes.",
]

const StatusPage = (_props: PageProps) => (
  <Layout>
    <Page>
      <Title eyebrow="Status" lede="What is running on this site, and what is known to be imperfect. Last checked with a local build and preview.">
        Site status
      </Title>
      <Section label="Services">
        <RuledList rows={services} />
      </Section>
      <Section label="Known issues">
        <RuledList rows={knownIssues.map((t, i) => ({ key: String(i), meta: `Open`, title: t }))} />
      </Section>
    </Page>
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
