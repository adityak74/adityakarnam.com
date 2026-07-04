import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import AskMyWorkPage from "../components/world-model/pages-ask/AskMyWorkPage"

const AskPage = (_props: PageProps) => (
  <Layout>
    <AskMyWorkPage />
  </Layout>
)

export default AskPage

export const Head: HeadFC = () => (
  <Seo
    title="Ask My Work"
    description="Source-grounded research interface for Aditya Karnam’s AI infrastructure work, with adaptive visitor lenses and concise project answers."
    pathname="/ask/"
    canonicalUrl="https://adityakarnam.com/ask/"
  />
)
