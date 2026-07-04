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
    title="World Model Infrastructure Lab"
    description="Aditya Karnam builds the infrastructure layer for world-model-driven AI: agents, memory, retrieval, local inference, model routing, and evals."
    pathname="/"
  />
)
