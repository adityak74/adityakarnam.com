/** @jsx jsx */
import { jsx, Box, Link as ThemeLink, Text } from "theme-ui"
import { HeadFC, Link } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  PageTitle,
  RuledList,
  consoleColors,
  monoLabelSx,
} from "../../../components/world-model/pages-field-notes-about/primitives"

type PostNode = {
  slug: string
  title: string
  date: string
  description?: string | null
  excerpt: string
  tags?: Array<{ name: string; slug: string }>
}

type BlogData = {
  allPost: {
    nodes: PostNode[]
  }
}

export default function Blog({ data }: { data: BlogData }) {
  const posts = data.allPost.nodes.filter(post => !post.tags?.some(t => t.name === `autoblog`))

  return (
    <Layout>
      <PageTitle
        eyebrow="Writing"
        title="Writing"
        lede={`${posts.length} posts on agents, memory, retrieval, local inference, and evals.`}
      />
      <RuledList>
        {posts.map(post => (
          <Box
            key={post.slug}
            sx={{ display: `grid`, gridTemplateColumns: [`1fr`, `9rem 1fr`], gap: [1, 4] }}
          >
            <Text sx={{ ...monoLabelSx }}>{post.date}</Text>
            <Box>
              <Link
                to={`${post.slug}/`}
                sx={{ fontFamily: `heading`, fontSize: [`1.2rem`, `1.4rem`], lineHeight: 1.25, letterSpacing: `-0.015em`, color: `heading`, textDecoration: `none`, ":hover": { color: `primary` } }}
              >
                {post.title}
              </Link>
              <Text as="p" sx={{ color: consoleColors.muted, m: 0, mt: 1, fontSize: `15px`, maxWidth: `62ch` }}>
                {post.description || post.excerpt}
              </Text>
            </Box>
          </Box>
        ))}
      </RuledList>
      <Text as="p" sx={{ mt: 4, color: consoleColors.muted, fontSize: `15px` }}>
        Essays on technology and society live at{` `}
        <ThemeLink href="https://calltothink.com" target="_blank" rel="noreferrer">
          calltothink.com
        </ThemeLink>
        .
      </Text>
    </Layout>
  )
}

export const Head: HeadFC = () => (
  <Seo
    title="Thoughts"
    description="Every post from Aditya Karnam, AI research engineer: agents, memory, retrieval, local inference, model routing, and evals."
    pathname="/blog/"
  />
)
