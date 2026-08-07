/** @jsx jsx */
import { jsx, Link } from "theme-ui"

const Footer = () => {
  return (
    <footer
      sx={{
        boxSizing: `border-box`,
        display: `flex`,
        justifyContent: `space-between`,
        mt: [7, 8],
        pt: 4,
        color: `secondary`,
        borderTop: `1px solid`,
        borderColor: `divide`,
        a: {
          color: `secondary`,
          textDecoration: `none`,
          ":hover": {
            color: `primary`,
          },
        },
        flexDirection: [`column`, `column`, `row`],
        gap: 2,
      }}
    >
      <div>&copy; {new Date().getFullYear()} Aditya Karnam. World Model Infrastructure Lab.</div>
      <div sx={{ display: `flex`, flexWrap: `wrap`, gap: 2, rowGap: 1 }}>
        <Link href="/now/">Now</Link>
        <span aria-hidden>·</span>
        <Link href="/stack/">Stack</Link>
        <span aria-hidden>·</span>
        <Link href="/field-notes/">Field Notes</Link>
        <span aria-hidden>·</span>
        <Link href="/systems/">Current Systems</Link>
        <span aria-hidden>·</span>
        <Link href="/status/">Status</Link>
      </div>
    </footer>
  )
}

export default Footer
