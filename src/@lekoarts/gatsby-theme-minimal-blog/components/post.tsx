/** @jsx jsx */
import type { HeadFC, PageProps } from "gatsby"
import * as React from "react"
import { jsx, Heading } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import ItemTags from "@lekoarts/gatsby-theme-minimal-blog/src/components/item-tags"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import PostFooter from "@lekoarts/gatsby-theme-minimal-blog/src/components/post-footer"
import PostHeader from "./post-header"

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

const px = [`16px`, `8px`, `4px`]
const shadow = px.map((v) => `rgba(0, 0, 0, 0.1) 0px ${v} ${v} 0px`)

const Post: React.FC<React.PropsWithChildren<PageProps<MBPostProps>>> = ({ data: { post }, children }) => (
  <Layout>
    <Heading as="h1" variant="styles.h1">
      {post.title}
    </Heading>
    <p sx={{ color: `secondary`, mt: 3, a: { color: `secondary` }, fontSize: [1, 1, 2], display: `flex`, alignItems: `center`, flexWrap: `wrap`, gap: `0.5rem` }}>
      {post.tags?.some((t) => t.name === `autoblog`) && (
        <span sx={{
          fontSize: `0.7rem`,
          fontWeight: `600`,
          letterSpacing: `0.07em`,
          textTransform: `uppercase`,
          color: `#8B949E`,
          backgroundColor: (t: any) => t.colors?.modes?.dark ? `rgba(255,255,255,0.06)` : `rgba(0,0,0,0.05)`,
          bg: `muted`,
          border: `1px solid`,
          borderColor: `divide`,
          px: `0.5rem`,
          py: `0.15rem`,
          borderRadius: `4px`,
          fontFamily: `monospace`,
          lineHeight: `1.6`,
        }}>
          AI Generated
        </span>
      )}
      <time>{post.date}</time>
      {post.tags && (
        <React.Fragment>
          {` — `}
          <ItemTags tags={post.tags.filter((t) => t.name !== `autoblog`)} />
        </React.Fragment>
      )}
      {post.timeToRead && ` — `}
      {post.timeToRead && <span>{post.timeToRead} min read</span>}
    </p>
    <PostHeader post={post} />
    <section
      sx={{
        my: 5,
        ".gatsby-resp-image-wrapper": {
          my: [4, 4, 5],
          borderRadius: `4px`,
          boxShadow: shadow.join(`, `),
          ".gatsby-resp-image-image": {
            borderRadius: `4px`,
          },
        },
        variant: `layout.content`,
      }}
    >
      {children}
    </section>
    <PostFooter post={post} />
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
