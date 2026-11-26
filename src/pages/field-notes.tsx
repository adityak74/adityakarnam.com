import * as React from "react"
import { graphql, HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title, Section, RuledList, Row, Explore } from "../components/world-model/pages-systems-stack-now/editorial"

type PostNode = {
  slug: string
  title: string
  date: string
  description?: string | null
  excerpt: string
}

type FieldNotesData = {
  allPost: { nodes: PostNode[] }
}

const highlightedSlugs = [
  "/budgetbench-explained",
  "/distilling-ornith-9b-two-teacher-mlx",
  "/mlx-lm-lora-moe-stop-gradient-fix",
  "/subagent-fleet-local-ai-compute-control-plane",
  "/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon",
  "/mlx-speculative-decoding-qwen3-8-apple-silicon",
  "/mlx-batch-concurrency-memory-wall-apple-silicon",
  "/mlx-gemv-gemm-roofline-apple-silicon",
  "/mlx-long-context-kv-cache-apple-silicon",
  "/embenx-python-embedding-toolkit",
  "/mlx-non-determinism-apple-silicon",
  "/ai-blog-generator-n8n-results",
]

const FieldNotesPage = ({ data }: PageProps<FieldNotesData>) => {
  const bySlug = new Map(data.allPost.nodes.map(p => [p.slug.replace(/\/$/, ``), p]))
  const rows: Row[] = highlightedSlugs
    .map(s => bySlug.get(s))
    .filter(Boolean)
    .map(p => ({
      key: p!.slug,
      meta: p!.date.replace(/ \d{2},/, `,`),
      title: p!.title,
      body: p!.description || p!.excerpt,
      links: [{ label: `Read`, to: `${p!.slug.replace(/\/$/, ``)}/` }],
    }))

  return (
    <Layout>
      <Page>
        <Title
          eyebrow="Field notes"
          lede="Measurements and write-ups from building agent infrastructure: what I ran, what I saw, and what I got wrong."
        >
          Field notes
        </Title>
        <Section label="Notes">
          <RuledList rows={rows} />
        </Section>
        <Explore keys={["writing", "research", "about"]} />
      </Page>
    </Layout>
  )
}

export default FieldNotesPage

export const Head: HeadFC = () => (
  <Seo
    title="Field Notes"
    description="Field notes from Aditya Karnam, AI research engineer: essays and source-grounded notes on memory, routing, local inference, and agent systems."
    pathname="/field-notes/"
  />
)

export const query = graphql`
  query FieldNotesPage {
    allPost(sort: { date: DESC }, limit: 40) {
      nodes {
        slug
        title
        date(formatString: "MMMM DD, YYYY")
        description
        excerpt
        tags {
          name
          slug
        }
      }
    }
  }
`
