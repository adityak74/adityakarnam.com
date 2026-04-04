/** @jsx jsx */
import * as React from "react"
import { jsx, Box } from "theme-ui"
import { Link } from "gatsby"
import ItemTags from "@lekoarts/gatsby-theme-minimal-blog/src/components/item-tags"

type BlogListItemProps = {
  post: {
    slug: string
    title: string
    date: string
    excerpt: string
    description: string
    timeToRead?: number
    tags?: {
      name: string
      slug: string
    }[]
  }
  showTags?: boolean
}

const BlogListItem = ({ post, showTags = true }: BlogListItemProps) => {
  const isAutoblog = post.tags?.some((t) => t.name === `autoblog`)
  const visibleTags = post.tags?.filter((t) => t.name !== `autoblog`) ?? []

  return (
    <Box mb={4}>
      <div sx={{ display: `flex`, alignItems: `center`, gap: `0.5rem`, flexWrap: `wrap` }}>
        <Link to={post.slug} sx={(t) => ({ ...t.styles?.a, fontSize: [1, 2, 3], color: `text` })}>
          {post.title}
        </Link>
        {isAutoblog && (
          <span sx={{
            fontSize: `0.65rem`,
            fontWeight: `600`,
            letterSpacing: `0.07em`,
            textTransform: `uppercase`,
            color: `secondary`,
            bg: `muted`,
            border: `1px solid`,
            borderColor: `divide`,
            px: `0.45rem`,
            py: `0.1rem`,
            borderRadius: `4px`,
            fontFamily: `monospace`,
            lineHeight: `1.6`,
            flexShrink: 0,
          }}>
            AI Generated
          </span>
        )}
      </div>
      <p sx={{ color: `secondary`, mt: 1, a: { color: `secondary` }, fontSize: [1, 1, 2] }}>
        <time>{post.date}</time>
        {visibleTags.length > 0 && showTags && (
          <React.Fragment>
            {` — `}
            <ItemTags tags={visibleTags} />
          </React.Fragment>
        )}
      </p>
    </Box>
  )
}

export default BlogListItem
