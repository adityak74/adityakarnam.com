import * as React from "react"
import type { HeadFC } from "gatsby"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { byN } from "../../components/course/chapters"
import Ch5 from "../../components/course/chapters/Ch5"

export default Ch5

export const Head: HeadFC = () => (
  <Seo
    title="Course 5: Agents and harnesses"
    description={byN(5).blurb}
    pathname="/course/agents/"
  />
)
