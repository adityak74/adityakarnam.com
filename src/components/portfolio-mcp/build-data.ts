import {
  currentInvestigations,
  fieldNotes,
  operatingPrinciples,
  researchAgenda,
  siteIdentity,
  systems,
} from "../world-model/data"
import { THOUGHTS_POSTS } from "./generated/thoughts-posts"
import {
  PORTFOLIO_DATA_VERSION,
  PORTFOLIO_MCP_DISPLAY_NAME,
  PORTFOLIO_MCP_HEALTH_URL,
  PORTFOLIO_MCP_INSTALL_URL,
  PORTFOLIO_MCP_MANIFEST_URL,
  PORTFOLIO_MCP_NAME,
  PORTFOLIO_MCP_TRANSPORT,
  PORTFOLIO_MCP_URL,
  PORTFOLIO_SITE_URL,
  type PortfolioMcpData,
} from "./schema"

export const SOURCE_COMMIT_FALLBACK = "unknown"

export type PortfolioMcpBuildInput = {
  generatedAt?: string
  sourceCommit?: string
}

const absoluteUrl = (slugOrUrl: string): string => {
  if (slugOrUrl.startsWith("http://") || slugOrUrl.startsWith("https://")) return slugOrUrl
  const normalized = slugOrUrl.startsWith("/") ? slugOrUrl : `/${slugOrUrl}`
  return `${PORTFOLIO_SITE_URL}${normalized}`
}

export const buildPortfolioMcpData = (input: PortfolioMcpBuildInput = {}): PortfolioMcpData => {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const sourceCommit = input.sourceCommit ?? SOURCE_COMMIT_FALLBACK
  const profileUrl = `${PORTFOLIO_SITE_URL}/about/`
  const systemsUrl = `${PORTFOLIO_SITE_URL}/systems/`

  const projects = systems.map((system) => {
    const canonicalUrl = absoluteUrl(system.slug)
    const externalLinks = system.links.map((link) => ({
      label: link.label,
      href: absoluteUrl(link.href),
    }))

    return {
      name: system.name,
      slug: system.slug.replace(/^\/+|\/+$/g, ""),
      tags: system.tags,
      status: system.status,
      researchQuestion: system.researchQuestion,
      systemBuilt: system.systemBuilt,
      whyItMatters: system.whyItMatters,
      canonicalUrl,
      links: externalLinks,
      explanationModes: system.explanationModes,
      recruiterFraming: `${system.name} is evidence of ${system.tags.slice(0, 3).join(", ")} work: ${system.whyItMatters}`,
      sourceUrls: [canonicalUrl, ...externalLinks.map((link) => link.href)],
    }
  })

  const thoughts = THOUGHTS_POSTS

  const recentWork = [
    ...projects.map((project) => ({
      title: project.name,
      type: "project" as const,
      slug: project.slug,
      dateOrStatus: project.status,
      url: project.canonicalUrl,
      summary: project.systemBuilt,
      tags: project.tags,
      sourceUrls: project.sourceUrls,
    })),
    ...thoughts.map((post) => ({
      title: post.title,
      type: "post" as const,
      slug: post.slug,
      dateOrStatus: post.date,
      url: post.url,
      summary: post.description,
      tags: post.tags.length > 0 ? post.tags : ["thoughts"],
      sourceUrls: [post.url],
    })),
    ...fieldNotes.map((note) => ({
      title: note.title,
      type: "field-note" as const,
      slug: note.href
        ? note.href.replace(/^\/+|\/+$/g, "")
        : note.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      dateOrStatus: note.status,
      url: absoluteUrl(note.href ?? "/field-notes/"),
      summary: note.thesis,
      tags: ["field note", "research agenda"],
      sourceUrls: [absoluteUrl(note.href ?? "/field-notes/")],
    })),
  ]

  return {
    name: PORTFOLIO_MCP_NAME,
    displayName: PORTFOLIO_MCP_DISPLAY_NAME,
    description:
      "Public read-only MCP server for Aditya Karnam's portfolio, recent work, systems, blog posts, research agenda, and source links.",
    transport: PORTFOLIO_MCP_TRANSPORT,
    mcpUrl: PORTFOLIO_MCP_URL,
    installPageUrl: PORTFOLIO_MCP_INSTALL_URL,
    manifestUrl: PORTFOLIO_MCP_MANIFEST_URL,
    healthUrl: PORTFOLIO_MCP_HEALTH_URL,
    siteUrl: PORTFOLIO_SITE_URL,
    dataVersion: PORTFOLIO_DATA_VERSION,
    generatedAt,
    sourceCommit,
    dataScope: {
      exposes: [
        "public projects",
        "public blog posts (Thoughts), including full post text",
        "public systems",
        "research agenda",
        "source links",
      ],
      doesNotExpose: [
        "private files",
        "email",
        "analytics",
        "personal data",
        "availability",
        "compensation",
        "immigration status",
        "references",
      ],
    },
    profile: {
      name: siteIdentity.name,
      title: siteIdentity.title,
      labName: siteIdentity.labName,
      tagline: siteIdentity.tagline,
      currentFocus: currentInvestigations.map((entry) => `${entry.label}: ${entry.detail}`),
      publicLinks: [
        { label: "Website", url: PORTFOLIO_SITE_URL },
        { label: "Systems", url: systemsUrl },
        { label: "About", url: profileUrl },
        { label: "GitHub", url: "https://github.com/adityak74" },
        { label: "LinkedIn", url: "https://www.linkedin.com/in/adityakarnamgrao/" },
      ],
      recruiterSummary:
        "Aditya Karnam builds AI infrastructure across agent runtimes, MCP, retrieval, memory, local inference, and evals.",
      engineeringSummary:
        "The strongest engineering signal is practical systems work around local-first agent infrastructure, backend-agnostic retrieval, model routing, and evaluation tooling.",
    },
    projects,
    thoughts,
    researchAgenda: researchAgenda.map((track) => ({ ...track, sourceUrls: [`${PORTFOLIO_SITE_URL}/stack/`] })),
    recentWork,
    operatingPrinciples,
  }
}
