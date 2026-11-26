import * as React from "react"
import type { HeadFC } from "gatsby"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { byN } from "../../components/course/chapters"
import Ch4 from "../../components/course/chapters/Ch4"

export default Ch4

export const Head: HeadFC = () => (
  <Seo
    title="Course 4: Retrieval and memory"
    description={byN(4).blurb}
    pathname="/course/retrieval/"
  />
)
