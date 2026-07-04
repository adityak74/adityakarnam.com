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
  page: "#071116",
  pageGlow: "rgba(38, 214, 211, 0.08)",
  pageGlowSecondary: "rgba(93, 214, 154, 0.06)",
  panel: "rgba(7, 20, 27, 0.82)",
  panelSoft: "rgba(10, 25, 34, 0.68)",
  border: "rgba(128, 163, 180, 0.24)",
  text: "#E6F4F1",
  body: "#A5C0C2",
  heading: "#F3FFFD",
  cyan: "#64E9E2",
  green: "#8DEA9B",
  slate: "#8BA6AD",
  grid: "rgba(120, 157, 166, 0.09)",
}

const monospaceFamily =
  "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"
const sansFamily =
  "'Inter', 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const labPalette = palette

export const styles = {
  label: {
    color: palette.cyan,
    display: "block",
    fontFamily: monospaceFamily,
    fontSize: "0.72rem",
    letterSpacing: "0.22em",
    marginBottom: "0.9rem",
    textTransform: "uppercase" as const,
  },
  sectionHeading: {
    color: palette.heading,
    fontFamily: sansFamily,
    fontSize: "clamp(1.7rem, 3vw, 2.6rem)",
    fontWeight: 600,
    letterSpacing: "-0.04em",
    lineHeight: 1.05,
    margin: 0,
  },
  sectionBody: {
    color: palette.body,
    fontFamily: sansFamily,
    fontSize: "1rem",
    lineHeight: 1.75,
    margin: "1rem 0 0",
    maxWidth: "52rem",
  },
}

export const WorldModelPageShell = ({ children }: ShellProps) => (
  <div
    style={{
      background:
        `radial-gradient(circle at top left, ${palette.pageGlow}, transparent 30%), ` +
        `radial-gradient(circle at top right, ${palette.pageGlowSecondary}, transparent 28%), ` +
        palette.page,
      backgroundAttachment: "fixed",
      border: `1px solid ${palette.border}`,
      borderRadius: "28px",
      color: palette.text,
      fontFamily: sansFamily,
      marginTop: "2rem",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      aria-hidden="true"
      style={{
        backgroundImage:
          `linear-gradient(${palette.grid} 1px, transparent 1px), ` +
          `linear-gradient(90deg, ${palette.grid} 1px, transparent 1px)`,
        backgroundPosition: "center center",
        backgroundSize: "36px 36px",
        inset: 0,
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.35))",
        pointerEvents: "none",
        position: "absolute",
      }}
    />
    <div style={{ padding: "clamp(1.1rem, 2vw, 1.5rem)" }}>
      <div
        style={{
          backgroundColor: "rgba(4, 14, 20, 0.56)",
          border: `1px solid rgba(128, 163, 180, 0.16)`,
          borderRadius: "22px",
          padding: "clamp(1rem, 2.2vw, 1.6rem)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  </div>
)

export const WorldModelHero = ({
  eyebrow,
  title,
  description,
  aside,
}: HeroProps) => (
  <section
    style={{
      display: "grid",
      gap: "1.5rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      padding: "clamp(1rem, 2vw, 1.5rem)",
    }}
  >
    <div>
      <span style={styles.label}>{eyebrow}</span>
      <h1
        style={{
          color: palette.heading,
          fontFamily: sansFamily,
          fontSize: "clamp(2.5rem, 7vw, 4.8rem)",
          fontWeight: 600,
          letterSpacing: "-0.06em",
          lineHeight: 0.95,
          margin: 0,
          maxWidth: "12ch",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          color: palette.body,
          fontSize: "1.08rem",
          lineHeight: 1.8,
          margin: "1.4rem 0 0",
          maxWidth: "44rem",
        }}
      >
        {description}
      </p>
    </div>
    <Panel accent="cyan">
      {aside}
    </Panel>
  </section>
)

export const WorldModelSection = ({
  eyebrow,
  title,
  description,
  children,
}: SectionProps) => (
  <section style={{ padding: "1.5rem 1rem 1rem" }}>
    {eyebrow ? <span style={styles.label}>{eyebrow}</span> : null}
    <h2 style={styles.sectionHeading}>{title}</h2>
    {description ? <p style={styles.sectionBody}>{description}</p> : null}
    <div style={{ marginTop: "1.5rem" }}>{children}</div>
  </section>
)

export const Panel = ({ children, accent = "slate" }: PanelProps) => {
  const accentColor =
    accent === "cyan" ? palette.cyan : accent === "green" ? palette.green : palette.slate

  return (
    <div
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), ${palette.panel}`,
        border: `1px solid ${palette.border}`,
        borderTop: `1px solid ${accentColor}55`,
        borderRadius: "18px",
        boxShadow: `inset 0 1px 0 ${accentColor}20`,
        height: "100%",
        padding: "1rem",
      }}
    >
      {children}
    </div>
  )
}

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
      backgroundColor: palette.panelSoft,
      border: `1px solid ${palette.border}`,
      borderRadius: "14px",
      display: "grid",
      gap: "0.7rem",
      padding: "1rem",
    }}
  >
    {items.map(item => (
      <div
        key={item}
        style={{
          color: palette.body,
          display: "flex",
          fontFamily: monospaceFamily,
          fontSize: "0.88rem",
          gap: "0.7rem",
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: palette.green }}>›</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
)

export const TagList = ({ items }: TagListProps) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
    {items.map(item => (
      <span
        key={item}
        style={{
          border: `1px solid ${palette.border}`,
          borderRadius: "999px",
          color: palette.body,
          fontFamily: monospaceFamily,
          fontSize: "0.75rem",
          letterSpacing: "0.04em",
          padding: "0.3rem 0.6rem",
          textTransform: "lowercase",
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
      color: palette.cyan,
      fontWeight: 500,
      textDecoration: "none",
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

export const StatusRow = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      gap: "0.85rem",
      justifyContent: "space-between",
      padding: "0.65rem 0",
    }}
  >
    <span
      style={{
        color: palette.slate,
        fontFamily: monospaceFamily,
        fontSize: "0.78rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <span style={{ color: palette.text, fontSize: "0.94rem", textAlign: "right" }}>
      {value}
    </span>
  </div>
)

