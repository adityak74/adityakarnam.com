/** @jsx jsx */
import { jsx, Box, Flex, Grid, Heading, Link as ThemeLink, Text } from "theme-ui"
import { HeadFC, Link } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  ConsoleCard,
  ConsoleShell,
  SectionBlock,
  SignalPill,
  consoleColors,
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
      <Box sx={{ display: `grid`, gap: [3, 4], my: [3, 4] }}>
        <ConsoleShell>
          <SignalPill>Thoughts / AI Research Notes</SignalPill>
          <Heading
            as="h1"
            sx={{
              color: consoleColors.text,
              fontSize: [5, 6, 7],
              mt: 3,
              mb: 3,
              maxWidth: `14ch`,
              lineHeight: 1.02,
            }}
          >
            Every post, in one place.
          </Heading>
          <Text sx={{ color: consoleColors.muted, fontSize: [2, 2, 3], maxWidth: `60ch` }}>
            {posts.length} posts on agents, memory, local inference, and the infrastructure layer behind AI
            systems.
          </Text>
        </ConsoleShell>

        <ThemeLink
          href="https://calltothink.com"
          target="_blank"
          rel="noreferrer"
          sx={{
            display: `block`,
            textDecoration: `none`,
            borderRadius: 12,
            border: `1px solid rgba(194, 82, 45, 0.24)`,
            bg: `rgba(194, 82, 45, 0.05)`,
            p: [3, 4],
            transition: `border-color 0.15s ease, background-color 0.15s ease`,
            ":hover": {
              borderColor: consoleColors.accent,
              bg: `rgba(194, 82, 45, 0.09)`,
            },
          }}
        >
          <Flex
            sx={{
              gap: 3,
              alignItems: [`flex-start`, `flex-start`, `center`],
              justifyContent: `space-between`,
              flexDirection: [`column`, `column`, `row`],
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Text
                sx={{
                  display: `block`,
                  fontFamily: `monospace`,
                  fontSize: 0,
                  color: consoleColors.accent,
                  textTransform: `uppercase`,
                  letterSpacing: `0.06em`,
                  mb: 2,
                }}
              >
                Also Writing
              </Text>
              <Heading
                as="h2"
                sx={{ color: consoleColors.text, fontSize: [3, 4], m: 0, mb: 2, fontWeight: 500, lineHeight: 1.15 }}
              >
                Call to Think
              </Heading>
              <Text sx={{ color: consoleColors.muted, fontSize: `17px`, lineHeight: 1.65, maxWidth: `60ch` }}>
                The posts here are about systems. Call to Think is the other half — essays on technology, AI, and
                society, and how these tools change the way we think. Written slowly, on purpose.
              </Text>
            </Box>
            <Text
              sx={{
                color: consoleColors.accent,
                fontFamily: `monospace`,
                fontSize: 0,
                whiteSpace: `nowrap`,
                flexShrink: 0,
              }}
            >
              calltothink.com ↗
            </Text>
          </Flex>
        </ThemeLink>

        <SectionBlock eyebrow="All Posts" title="Latest first">
          <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`, `repeat(3, minmax(0, 1fr))`], gap: 3 }}>
            {posts.map(post => (
              <ConsoleCard key={post.slug} title={post.date} accent={consoleColors.accentAlt}>
                <Heading as="h2" sx={{ color: consoleColors.text, fontSize: [2, 3], m: 0, lineHeight: 1.15 }}>
                  {post.title}
                </Heading>
                <Text sx={{ color: consoleColors.muted, mb: 2 }}>{post.description || post.excerpt}</Text>
                <Link
                  to={`${post.slug}/`}
                  sx={{ color: consoleColors.accent, fontFamily: `monospace`, textDecoration: `none` }}
                >
                  Read post
                </Link>
              </ConsoleCard>
            ))}
          </Grid>
        </SectionBlock>
      </Box>
    </Layout>
  )
}

export const Head: HeadFC = () => (
  <Seo
    title="Thoughts"
    description="Every post from Aditya Karnam, AI researcher: agents, memory, retrieval, local inference, model routing, and evals."
    pathname="/blog/"
  />
)
