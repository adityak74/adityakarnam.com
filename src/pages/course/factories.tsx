import * as React from "react"
import type { HeadFC } from "gatsby"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { byN } from "../../components/course/chapters"
import Ch7 from "../../components/course/chapters/Ch7"

export default Ch7

export const Head: HeadFC = () => (
  <Seo
    title="Course 7: Software factories: running it all"
    description={byN(7).blurb}
    pathname="/course/factories/"
  />
)
