import * as React from "react"
import type { PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import { Page, Title, Section, Prose, TextLink } from "../components/world-model/pages-systems-stack-now/editorial"

const NotFound = (_props: PageProps) => (
  <Layout>
    <Page>
      <Title eyebrow="404">Game over. This page does not exist.</Title>
      <Section>
        <Prose>
          <p>
            The link may be old or mistyped. Try <TextLink to="/ai-research/">Research</TextLink> or{` `}
            <TextLink to="/blog">Writing</TextLink>. Continue? Press any link.
          </p>
        </Prose>
      </Section>
    </Page>
  </Layout>
)

export default NotFound
