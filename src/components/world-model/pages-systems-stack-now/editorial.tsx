/** @jsx jsx */
import * as React from "react"
import { Link } from "gatsby"
import { jsx } from "theme-ui"

// Editorial helpers for inner pages: text-first, hairline rules, single clay accent.
export const ed = {
  paper: "#FAF9F6",
  ink: "#141413",
  secondary: "#5E5D59",
  hairline: "#E3E0D8",
  panel: "#F3F1EB",
  clay: "#C2522D",
  serif: "Fraunces, 'Source Serif 4', 'Source Serif Pro', Georgia, serif",
  sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'IBM Plex Mono', SFMono-Regular, Consolas, monospace",
}

type Kids = { children: React.ReactNode }

export const Page = ({ children }: Kids) => (
  <div sx={{ maxWidth: 880, mx: `auto`, py: [4, 5], fontFamily: ed.sans, color: ed.ink }}>{children}</div>
)

export const Eyebrow = ({ children }: Kids) => (
  <span
    sx={{
      display: `block`,
      fontFamily: ed.mono,
      fontSize: `12px`,
      letterSpacing: `0.06em`,
      textTransform: `uppercase`,
      color: ed.secondary,
      mb: 3,
    }}
  >
    {children}
  </span>
)

export const Title = ({ eyebrow, children, lede }: { eyebrow?: string; children: React.ReactNode; lede?: React.ReactNode }) => (
  <header sx={{ pb: [4, 5], borderBottom: `1px solid ${ed.hairline}`, mb: [4, 5] }}>
    {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
    <h1
      sx={{
        fontFamily: ed.serif,
        fontWeight: 400,
        fontSize: `clamp(2.4rem, 5vw, 3.6rem)`,
        lineHeight: 1.08,
        letterSpacing: `-0.025em`,
        color: ed.ink,
        m: 0,
        maxWidth: `20ch`,
      }}
    >
      {children}
    </h1>
    {lede ? (
      <p sx={{ fontSize: `19px`, lineHeight: 1.6, color: ed.secondary, maxWidth: `62ch`, mt: 4, mb: 0 }}>{lede}</p>
    ) : null}
  </header>
)

export const Section = ({ label, title, children }: { label?: string; title?: string; children: React.ReactNode }) => (
  <section sx={{ mb: [5, 6] }}>
    {label ? <Eyebrow>{label}</Eyebrow> : null}
    {title ? (
      <h2
        sx={{
          fontFamily: ed.serif,
          fontWeight: 400,
          fontSize: `clamp(1.5rem, 3vw, 2rem)`,
          letterSpacing: `-0.02em`,
          lineHeight: 1.2,
          color: ed.ink,
          mt: 0,
          mb: 3,
        }}
      >
        {title}
      </h2>
    ) : null}
    {children}
  </section>
)

export const Prose = ({ children }: Kids) => (
  <div
    sx={{
      maxWidth: `68ch`,
      fontSize: `17px`,
      lineHeight: 1.65,
      color: ed.ink,
      "p": { mt: 0, mb: 3 },
      "p:last-child": { mb: 0 },
    }}
  >
    {children}
  </div>
)

export const Muted = ({ children }: Kids) => (
  <span sx={{ color: ed.secondary }}>{children}</span>
)

type LinkProps = { to?: string; href?: string; children: React.ReactNode }

const linkSx = {
  color: ed.clay,
  textDecoration: `none`,
  borderBottom: `1px solid transparent`,
  ":hover": { borderBottomColor: ed.clay },
}

export const TextLink = ({ to, href, children }: LinkProps) =>
  to ? (
    <Link to={to} sx={linkSx}>
      {children}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" sx={linkSx}>
      {children}
    </a>
  )

export type RowLink = { label: string; to?: string; href?: string }

export type Row = {
  key: string
  meta?: string // year or date, left column
  tag?: string // mono tag
  title: string
  body?: React.ReactNode
  links?: RowLink[]
}

// Ruled list: meta column | content. Hairlines between rows, no boxes.
export const RuledList = ({ rows }: { rows: Row[] }) => (
  <div sx={{ borderTop: `1px solid ${ed.hairline}` }}>
    {rows.map(r => (
      <div
        key={r.key}
        sx={{
          display: `grid`,
          gridTemplateColumns: [`1fr`, `120px 1fr`],
          columnGap: 4,
          rowGap: 1,
          py: 4,
          borderBottom: `1px solid ${ed.hairline}`,
        }}
      >
        <div sx={{ fontFamily: ed.mono, fontSize: `12px`, letterSpacing: `0.06em`, textTransform: `uppercase`, color: ed.secondary, pt: `5px` }}>
          {r.meta}
        </div>
        <div sx={{ minWidth: 0 }}>
          {r.tag ? (
            <span sx={{ display: `block`, fontFamily: ed.mono, fontSize: `12px`, letterSpacing: `0.06em`, textTransform: `uppercase`, color: ed.clay, mb: 1 }}>
              {r.tag}
            </span>
          ) : null}
          <h3 sx={{ fontFamily: ed.serif, fontWeight: 500, fontSize: `1.25rem`, lineHeight: 1.3, letterSpacing: `-0.01em`, m: 0, mb: 2, color: ed.ink }}>
            {r.title}
          </h3>
          {r.body ? (
            <p sx={{ m: 0, maxWidth: `68ch`, fontSize: `17px`, lineHeight: 1.65, color: ed.secondary }}>{r.body}</p>
          ) : null}
          {r.links && r.links.length ? (
            <div sx={{ display: `flex`, flexWrap: `wrap`, gap: 3, mt: 2, fontSize: `15px` }}>
              {r.links.map(l => (
                <TextLink key={l.label} to={l.to} href={l.href}>
                  {l.label}
                </TextLink>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ))}
  </div>
)

export const Mono = ({ children }: Kids) => (
  <span sx={{ fontFamily: ed.mono, fontSize: `0.88em` }}>{children}</span>
)

export const Pre = ({ children }: Kids) => (
  <pre
    sx={{
      m: 0,
      p: 3,
      bg: `${ed.panel} !important`,
      border: `1px solid ${ed.hairline} !important`,
      borderRadius: `4px !important`,
      boxShadow: `none !important`,
      color: ed.ink,
      fontFamily: ed.mono,
      fontSize: `13px`,
      lineHeight: 1.7,
      overflowX: `auto`,
      whiteSpace: `pre`,
    }}
  >
    {children}
  </pre>
)
