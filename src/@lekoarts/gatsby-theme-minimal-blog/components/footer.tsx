/** @jsx jsx */
import { jsx } from "theme-ui"
import useMinimalBlogConfig from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-minimal-blog-config"

const mono = {
  fontFamily: `monospace`,
  fontSize: `12px`,
  letterSpacing: `0.06em`,
  textTransform: `uppercase` as const,
}

const KEEP = [`Resume`, `GitHub`, `LinkedIn`, `Google Scholar`, `Twitter`]

const Footer = () => {
  const { externalLinks } = useMinimalBlogConfig()
  return (
    <footer
      sx={{
        mt: [6, 7],
        pt: 3,
        pb: 4,
        borderTop: `1px solid`,
        borderColor: `divide`,
        color: `secondary`,
        display: `flex`,
        flexDirection: [`column`, `row`],
        justifyContent: `space-between`,
        gap: 3,
        ...mono,
        a: { color: `secondary`, textDecoration: `none`, display: `inline-block`, py: `8px`, ":hover": { color: `primary` } },
      }}
    >
      <div>
        &copy; {new Date().getFullYear()} Aditya Karnam{` `}
        <span
          aria-hidden="true"
          sx={{
            display: `inline-block`,
            width: `8px`,
            height: `12px`,
            ml: 1,
            bg: `primary`,
            verticalAlign: `-1px`,
            "@media (prefers-reduced-motion: no-preference)": { animation: `blink 1.1s steps(1) infinite` },
            "@keyframes blink": { "50%": { opacity: 0 } },
          }}
        />
      </div>
      <div sx={{ display: `flex`, flexWrap: `wrap`, columnGap: 3, rowGap: 0 }}>
        {(externalLinks || []).filter((l: { name: string }) => KEEP.includes(l.name)).map((l: { name: string; url: string }) => (
          <a key={l.url} href={l.url} {...(l.url.startsWith(`http`) ? { target: `_blank`, rel: `noopener noreferrer` } : {})}>
            {l.name}
          </a>
        ))}
        <a href="/now/">Now</a>
      </div>
    </footer>
  )
}

export default Footer
