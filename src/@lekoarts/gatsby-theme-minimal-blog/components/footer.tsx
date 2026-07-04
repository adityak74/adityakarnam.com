/** @jsx jsx */
import { jsx, Link } from "theme-ui"

const Footer = () => {
  return (
    <footer
      sx={{
        boxSizing: `border-box`,
        display: `flex`,
        justifyContent: `space-between`,
        mt: [6],
        pt: 3,
        color: `secondary`,
        borderTop: `1px solid rgba(111, 255, 233, 0.12)`,
        a: {
          color: `accent`,
        },
        flexDirection: [`column`, `column`, `row`],
        gap: 2,
      }}
    >
      <div>&copy; {new Date().getFullYear()} Aditya Karnam. World Model Infrastructure Lab.</div>
      <div>
        <Link href="/field-notes/">Field Notes</Link>
        {` · `}
        <Link href="/systems/">Current Systems</Link>
        {` · `}
        <Link href="/ask/">Ask My Work</Link>
      </div>
    </footer>
  )
}

export default Footer
