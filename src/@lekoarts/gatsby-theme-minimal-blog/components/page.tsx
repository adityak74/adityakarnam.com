/** @jsx jsx */
import type { HeadFC, PageProps } from "gatsby"
import * as React from "react"
import { jsx, Heading } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"

export type MBPageProps = {
  page: {
    title: string
    slug: string
    excerpt: string
    description?: string
    keywords?: string[]
    canonicalUrl?: string
    hideTitle?: boolean
  }
}

const Page: React.FC<React.PropsWithChildren<PageProps<MBPageProps>>> = ({ data: { page }, children }) => (
  <Layout>
    {page.hideTitle ? null : (
      <Heading as="h1" variant="styles.h1">
        {page.title}
      </Heading>
    )}
    <section sx={{ my: 5, variant: `layout.content` }}>{children}</section>
  </Layout>
)

export default Page

export const Head: HeadFC<MBPageProps> = ({ data: { page } }) => (
  <Seo
    title={page.title}
    description={page.description || page.excerpt}
    pathname={page.slug.endsWith(`/`) ? page.slug : `${page.slug}/`}
    canonicalUrl={page.canonicalUrl}
  >
    {page.keywords?.length ? <meta name="keywords" content={page.keywords.join(`, `)} /> : null}
  </Seo>
)
