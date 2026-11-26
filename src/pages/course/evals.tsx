import * as React from "react"
import type { HeadFC } from "gatsby"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { byN } from "../../components/course/chapters"
import Ch6 from "../../components/course/chapters/Ch6"

export default Ch6

export const Head: HeadFC = () => (
  <Seo
    title="Course 6: How you know it worked"
    description={byN(6).blurb}
    pathname="/course/evals/"
  />
)
