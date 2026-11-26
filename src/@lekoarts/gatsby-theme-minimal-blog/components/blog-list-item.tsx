/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
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
    tags?: { name: string; slug: string }[]
  }
  showTags?: boolean
}

const meta = {
  fontFamily: `monospace`,
  fontSize: `12px`,
  letterSpacing: `0.06em`,
  textTransform: `uppercase` as const,
  color: `secondary`,
  a: { color: `secondary`, textDecoration: `none`, ":hover": { color: `primary` } },
}

const BlogListItem = ({ post, showTags = true }: BlogListItemProps) => {
  const visibleTags = post.tags?.filter((t) => t.name !== `autoblog`) ?? []
  return (
    <article sx={{ py: 3, borderBottom: `1px solid`, borderColor: `divide`, display: `grid`, gridTemplateColumns: [`1fr`, `9rem 1fr`], gap: [1, 4] }}>
      <div sx={meta}>
        <time>{post.date}</time>
      </div>
      <div>
        <Link
          to={post.slug}
          sx={{ fontFamily: `heading`, fontSize: [`1.2rem`, `1.35rem`], lineHeight: 1.25, letterSpacing: `-0.015em`, color: `heading`, textDecoration: `none`, ":hover": { color: `primary` } }}
        >
          {post.title}
        </Link>
        {visibleTags.length > 0 && showTags && (
          <div sx={{ ...meta, mt: 1 }}>
            <ItemTags tags={visibleTags} />
          </div>
        )}
      </div>
    </article>
  )
}

export default BlogListItem
