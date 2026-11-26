import * as React from "react"
import { Link } from "gatsby"

type ShellProps = {
  children: React.ReactNode
}

type HeroProps = {
  eyebrow: string
  title: string
  description: string
  aside?: React.ReactNode
}

type SectionProps = {
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
}

type PanelProps = {
  children: React.ReactNode
  accent?: "cyan" | "green" | "slate"
}

type InlineLinkProps = {
  to: string
  children: React.ReactNode
}

type TagListProps = {
  items: string[]
}

const palette = {
  page: "#FAF9F6",
  pageGlow: "rgba(212, 165, 116, 0.12)",
  pageGlowSecondary: "rgba(194, 82, 45, 0.06)",
  panel: "#FFFFFF",
  panelSoft: "#F2F0EC",
  border: "#D8D4CC",
  text: "#1A1A18",
  body: "#6B6B63",
  heading: "#1A1A18",
  cyan: "#C2522D",
  green: "#D4A574",
  slate: "#8A857C",
  grid: "rgba(216, 212, 204, 0.55)",
}

const monospaceFamily =
  "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"
const serifFamily = "Fraunces, 'Source Serif 4', Georgia, serif"
const sansFamily =
  "'Styrene A', 'Styrene B', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const labPalette = palette

export const styles = {
  label: {
    color: palette.body,
    display: "block",
    fontFamily: monospaceFamily,
    fontSize: "0.72rem",
    letterSpacing: "0.06em",
    marginBottom: "0.9rem",
    textTransform: "uppercase" as const,
  },
  sectionHeading: {
    color: palette.heading,
    fontFamily: serifFamily,
    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    margin: 0,
  },
  sectionBody: {
    color: palette.body,
    fontFamily: sansFamily,
    fontSize: "17px",
    lineHeight: 1.65,
    margin: "1rem 0 0",
    maxWidth: "52rem",
  },
}

export const WorldModelPageShell = ({ children }: ShellProps) => (
  <div style={{ background: palette.page, color: palette.text, fontFamily: sansFamily, margin: "2rem auto 0", maxWidth: "880px" }}>
    {children}
  </div>
)

export const WorldModelHero = ({ eyebrow, title, description, aside }: HeroProps) => (
  <section
    style={{
      display: "grid",
      gap: "2rem",
      gridTemplateColumns: "1fr",
      paddingBottom: "1.5rem",
    }}
  >
    <div>
      <span style={styles.label}>{eyebrow}</span>
      <h1
        style={{
          color: palette.heading,
          fontFamily: serifFamily,
          fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.12,
          margin: 0,
          maxWidth: "20ch",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          color: palette.body,
          fontSize: "17px",
          lineHeight: 1.65,
          margin: "1.4rem 0 0",
          maxWidth: "46rem",
        }}
      >
        {description}
      </p>
    </div>
    <Panel accent="slate">{aside}</Panel>
  </section>
)

export const WorldModelSection = ({ eyebrow, title, description, children }: SectionProps) => (
  <section style={{ padding: "2.5rem 0 0", marginTop: "2.5rem", borderTop: `1px solid ${palette.border}` }}>
    {eyebrow ? <span style={styles.label}>{eyebrow}</span> : null}
    <h2 style={styles.sectionHeading}>{title}</h2>
    {description ? <p style={styles.sectionBody}>{description}</p> : null}
    <div style={{ marginTop: "1.5rem" }}>{children}</div>
  </section>
)

export const Panel = ({ children }: PanelProps) => (
  <div style={{ borderTop: `1px solid ${palette.border}`, height: "100%", padding: "1rem 0 0" }}>{children}</div>
)

export const TwoColumnGrid = ({ children }: ShellProps) => (
  <div
    style={{
      display: "grid",
      gap: "1rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    }}
  >
    {children}
  </div>
)

export const ThreeColumnGrid = ({ children }: ShellProps) => (
  <div
    style={{
      display: "grid",
      gap: "1rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    }}
  >
    {children}
  </div>
)

export const ConsoleList = ({ items }: TagListProps) => (
  <div
    style={{
      display: "grid",
      gap: "0.85rem",
    }}
  >
    {items.map((item) => (
      <div
        key={item}
        style={{
          color: palette.body,
          display: "flex",
          fontFamily: sansFamily,
          fontSize: "17px",
          gap: "0.7rem",
          lineHeight: 1.65,
        }}
      >
        <span style={{ color: palette.slate }}>–</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
)

export const TagList = ({ items }: TagListProps) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
    {items.map((item) => (
      <span
        key={item}
        style={{
          border: `1px solid ${palette.border}`,
          borderRadius: "3px",
          color: palette.body,
          fontFamily: monospaceFamily,
          fontSize: "0.75rem",
          letterSpacing: "0.02em",
          padding: "0.35rem 0.7rem",
          textTransform: "lowercase",
          background: palette.panelSoft,
        }}
      >
        {item}
      </span>
    ))}
  </div>
)

export const InlineLink = ({ to, children }: InlineLinkProps) => (
  <Link
    to={to}
    style={{
      color: palette.text,
      textDecoration: "underline",
      textDecorationColor: palette.border,
      textUnderlineOffset: "3px",
    }}
  >
    {children}
  </Link>
)

export const Divider = () => (
  <div
    style={{
      borderTop: `1px solid ${palette.border}`,
      margin: "0.5rem 0 0",
    }}
  />
)

export const StatusRow = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      display: "grid",
      gap: "0.35rem",
      padding: "0.8rem 0",
      borderTop: `1px solid ${palette.border}`,
    }}
  >
    <span
      style={{
        color: palette.slate,
        fontFamily: monospaceFamily,
        fontSize: "0.74rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <span style={{ color: palette.text, lineHeight: 1.65 }}>{value}</span>
  </div>
)
