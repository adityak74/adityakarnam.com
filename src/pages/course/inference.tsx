import * as React from "react"
import type { HeadFC } from "gatsby"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { byN } from "../../components/course/chapters"
import Ch2 from "../../components/course/chapters/Ch2"

export default Ch2

export const Head: HeadFC = () => (
  <Seo
    title="Course 2: Making a model answer fast"
    description={byN(2).blurb}
    pathname="/course/inference/"
  />
)
