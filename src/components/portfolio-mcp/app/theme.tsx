import type React from "react"

type ShellProps = {
  children: React.ReactNode
}

type PanelProps = ShellProps & {
  accent?: "cyan" | "green" | "slate"
  style?: React.CSSProperties
}

type TagListProps = {
  items: string[]
}

export const palette = {
  page: "#FAF9F6",
  panel: "#FAF9F6",
  panelSoft: "#F3F1EB",
  border: "#E3E0D8",
  text: "#141413",
  body: "#5E5D59",
  heading: "#141413",
  cyan: "#C2522D", // clay accent: small marks only
  green: "#5E5D59",
  slate: "#5E5D59",
}

export const monospaceFamily =
  "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"
export const sansFamily = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
export const serifFamily = "Fraunces, 'Source Serif 4', 'Source Serif Pro', Georgia, serif"

export const themeStyles = {
  label: {
    color: palette.body,
    display: "block",
    fontFamily: monospaceFamily,
    fontSize: "12px",
    letterSpacing: "0.06em",
    marginBottom: "0.75rem",
    textTransform: "uppercase",
  } satisfies React.CSSProperties,
  sectionHeading: {
    color: palette.heading,
    fontFamily: serifFamily,
    fontSize: "clamp(1.55rem, 5vw, 2.25rem)",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    margin: 0,
  } satisfies React.CSSProperties,
  body: {
    color: palette.body,
    fontFamily: sansFamily,
    fontSize: "17px",
    lineHeight: 1.65,
    margin: 0,
  } satisfies React.CSSProperties,
  cardGrid: {
    display: "grid",
    gap: "0",
  } satisfies React.CSSProperties,
}

export const PageShell = ({ children }: ShellProps) => (
  <div
    style={{
      background: palette.page,
      color: palette.text,
      fontFamily: sansFamily,
      minHeight: "100vh",
    }}
  >
    <div style={{ padding: "clamp(1rem, 3vw, 1.6rem)" }}>{children}</div>
  </div>
)

// Hairline-ruled block, no box. `accent` is kept for call-site compatibility.
export const Panel = ({ children, style }: PanelProps) => (
  <div
    style={{
      borderTop: `1px solid ${palette.border}`,
      padding: "1.25rem 0",
      ...style,
    }}
  >
    {children}
  </div>
)

export const EyebrowLabel = ({ children }: ShellProps) => <span style={themeStyles.label}>{children}</span>

export const SectionHeading = ({ children, style }: ShellProps & { style?: React.CSSProperties }) => (
  <h2 style={{ ...themeStyles.sectionHeading, ...style }}>{children}</h2>
)

export const BodyText = ({
  children,
  style,
  ...props
}: ShellProps & React.HTMLAttributes<HTMLParagraphElement>) => (
  <p style={{ ...themeStyles.body, ...style }} {...props}>
    {children}
  </p>
)

export const TagList = ({ items }: TagListProps) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
    {items.map((item) => (
      <span className="mcp-pill" key={item}>
        {item}
      </span>
    ))}
  </div>
)

export const ConsoleList = ({ items }: TagListProps) => (
  <div style={{ display: "grid", gap: "0.75rem" }}>
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
        <span style={{ color: palette.cyan }}>–</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
)

export const StatusRow = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      borderTop: `1px solid ${palette.border}`,
      display: "grid",
      gap: "0.35rem",
      padding: "0.8rem 0 0",
    }}
  >
    <span
      style={{
        color: palette.slate,
        fontFamily: monospaceFamily,
        fontSize: "12px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <span style={{ color: palette.text, lineHeight: 1.65 }}>{value}</span>
  </div>
)
