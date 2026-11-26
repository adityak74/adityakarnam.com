/** @jsx jsx */
import type { HeadFC, PageProps } from "gatsby"
import * as React from "react"
import { jsx, Heading } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import ItemTags from "@lekoarts/gatsby-theme-minimal-blog/src/components/item-tags"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import PostFooter from "@lekoarts/gatsby-theme-minimal-blog/src/components/post-footer"

export type MBPostProps = {
  post: {
    slug: string
    title: string
    date: string
    dateISO?: string
    tags?: {
      name: string
      slug: string
    }[]
    description?: string
    canonicalUrl?: string
    excerpt: string
    timeToRead?: number
    banner?: {
      childImageSharp: {
        resize: {
          src: string
        }
      }
    }
  }
}

const mono = {
  fontFamily: `monospace`,
  fontSize: `12px`,
  letterSpacing: `0.06em`,
  textTransform: `uppercase` as const,
  color: `secondary`,
}

const Post: React.FC<React.PropsWithChildren<PageProps<MBPostProps>>> = ({ data: { post }, children }) => (
  <Layout>
    <article sx={{ maxWidth: `68ch` }}>
      <header sx={{ mb: 5 }}>
        <p
          sx={{ ...mono, m: 0, mb: 3, display: `flex`, flexWrap: `wrap`, gap: `0.5rem 1rem`, a: { color: `secondary`, textDecoration: `none`, ":hover": { color: `primary` } } }}
        >
          <time>{post.date}</time>
          {post.tags && post.tags.filter((t) => t.name !== `autoblog`).length > 0 && (
            <span>
              <ItemTags tags={post.tags.filter((t) => t.name !== `autoblog`)} />
            </span>
          )}
          {post.timeToRead ? <span>{post.timeToRead} min read</span> : null}
          {post.tags?.some((t) => t.name === `autoblog`) && <span sx={{ color: `primary` }}>AI generated</span>}
        </p>
        <Heading as="h1" variant="styles.h1" sx={{ mt: 0, mb: 0 }}>
          {post.title}
        </Heading>
      </header>
      <section
        sx={{
          mb: 5,
          ".gatsby-resp-image-wrapper": { my: 4, borderRadius: `4px` },
          "h2, h3": { scrollMarginTop: `1rem` },
          variant: `layout.content`,
        }}
      >
        {children}
      </section>
      <PostFooter post={post} />
    </article>
  </Layout>
)

export default Post

export const Head: HeadFC<MBPostProps> = ({ data: { post } }) => {
  const canonicalUrl = post.canonicalUrl || `https://adityakarnam.com${post.slug}`
  const description = post.description || post.excerpt

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    datePublished: post.dateISO || post.date,
    url: canonicalUrl,
    author: {
      "@type": "Person",
      name: "Aditya Karnam",
      url: "https://adityakarnam.com",
    },
    publisher: {
      "@type": "Person",
      name: "Aditya Karnam",
      url: "https://adityakarnam.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    ...(post.banner?.childImageSharp?.resize?.src && {
      image: `https://adityakarnam.com${post.banner.childImageSharp.resize.src}`,
    }),
  }

  return (
    <React.Fragment>
      <Seo
        title={post.title}
        description={description}
        image={post.banner ? post.banner?.childImageSharp?.resize?.src : undefined}
        pathname={post.slug}
        canonicalUrl={post.canonicalUrl}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
    </React.Fragment>
  )
}
