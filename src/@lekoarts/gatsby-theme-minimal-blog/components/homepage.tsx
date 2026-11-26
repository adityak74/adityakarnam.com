/** @jsx jsx */
import { jsx } from "theme-ui"
import { HeadFC } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import HomepageConsole from "../../../components/world-model/HomepageConsole"

const Homepage = () => (
  <Layout>
    <HomepageConsole />
  </Layout>
)

export default Homepage

export const Head: HeadFC = () => (
  <Seo
    title="AI Research Engineer"
    description="Aditya Karnam is an AI research engineer building infrastructure for reliable agents: memory, retrieval, local inference, model routing, evals and agent harnesses."
    pathname="/"
  />
)
