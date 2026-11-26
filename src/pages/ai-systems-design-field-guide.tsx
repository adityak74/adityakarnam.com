/** @jsx jsx */
import * as React from "react"
import { HeadFC } from "gatsby"
import { jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title, Section, Prose, TextLink, ed } from "../components/world-model/pages-systems-stack-now/editorial"

const PDF_URL = "/books/ai-systems-design-field-guide.pdf"

const AiSystemsDesignFieldGuidePage = () => (
  <Layout>
    <Page>
      <Title
        eyebrow="Field guide · PDF, 37 pages"
        lede="Notes on model APIs, agent runtimes, MCP, A2A, and production engineering."
      >
        AI Systems Design Field Guide
      </Title>
      <Section>
        <Prose>
          <p>
            Read it below, or <TextLink href={PDF_URL}>open it in a new tab</TextLink> if your browser can't render it
            inline. <a href={PDF_URL} download sx={{ color: ed.clay, textDecoration: `none` }}>Download the PDF</a> (about 300 KB).
          </p>
        </Prose>
      </Section>
      <Section>
        <iframe
          src={PDF_URL}
          title="AI Systems Design Field Guide"
          sx={{ display: `block`, width: `100%`, height: [`70vh`, `80vh`, `85vh`], border: `1px solid ${ed.hairline}`, borderRadius: `2px` }}
        />
      </Section>
    </Page>
  </Layout>
)

export default AiSystemsDesignFieldGuidePage

export const Head: HeadFC = () => (
  <Seo
    title="AI Systems Design Field Guide"
    description="Notes on model APIs, agent runtimes, MCP, A2A, and production engineering. Read online, free."
    pathname="/ai-systems-design-field-guide/"
  />
)
