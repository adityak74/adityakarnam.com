import * as React from "react"
import type { HeadFC } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Page, Title } from "../../components/world-model/pages-systems-stack-now/editorial"

// STUB: replaced by the index author.
const CoursePage = () => (
  <Layout>
    <Page>
      <Title eyebrow="Course">Learn AI, from silicon to software factories</Title>
    </Page>
  </Layout>
)
export default CoursePage

export const Head: HeadFC = () => (
  <Seo title="Free Course: Learn AI From Silicon to Software" description="A free course." pathname="/course/" />
)
