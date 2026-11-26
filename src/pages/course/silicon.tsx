import * as React from "react"
import type { HeadFC } from "gatsby"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { byN } from "../../components/course/chapters"
import Ch1 from "../../components/course/chapters/Ch1"

export default Ch1

export const Head: HeadFC = () => (
  <Seo
    title="Course 1: What the hardware actually does"
    description={byN(1).blurb}
    pathname="/course/silicon/"
  />
)
