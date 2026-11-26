/** @jsx jsx */
import { jsx } from "theme-ui"
import useMinimalBlogConfig from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-minimal-blog-config"

const mono = {
  fontFamily: `monospace`,
  fontSize: `12px`,
  letterSpacing: `0.06em`,
  textTransform: `uppercase` as const,
}

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
        a: { color: `secondary`, textDecoration: `none`, ":hover": { color: `primary` } },
      }}
    >
      <div>&copy; {new Date().getFullYear()} Aditya Karnam</div>
      <div sx={{ display: `flex`, flexWrap: `wrap`, columnGap: 3, rowGap: 1 }}>
        {(externalLinks || []).map((l: { name: string; url: string }) => (
          <a key={l.url} href={l.url} {...(l.url.startsWith(`http`) ? { target: `_blank`, rel: `noopener noreferrer` } : {})}>
            {l.name}
          </a>
        ))}
        <a href="/now/">Now</a>
        <a href="/field-notes/">Field Notes</a>
        <a href="/quecto/">Quecto</a>
        <a href="/value-lab/">Value Lab</a>
        <a href="/status/">Status</a>
      </div>
    </footer>
  )
}

export default Footer
