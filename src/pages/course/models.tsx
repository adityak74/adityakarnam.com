import * as React from "react"
import type { HeadFC } from "gatsby"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { byN } from "../../components/course/chapters"
import Ch3 from "../../components/course/chapters/Ch3"

export default Ch3

export const Head: HeadFC = () => (
  <Seo
    title="Course 3: Training, LoRA and distillation"
    description={byN(3).blurb}
    pathname="/course/models/"
  />
)
