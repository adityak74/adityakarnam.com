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
  page: "#FAF9F7",
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

export const monospaceFamily =
  "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"
export const sansFamily =
  "'Styrene A', 'Styrene B', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const themeStyles = {
  label: {
    color: palette.cyan,
    display: "block",
    fontFamily: monospaceFamily,
    fontSize: "0.72rem",
    letterSpacing: "0.06em",
    marginBottom: "0.75rem",
    textTransform: "uppercase",
  } satisfies React.CSSProperties,
  sectionHeading: {
    color: palette.heading,
    fontFamily: sansFamily,
    fontSize: "clamp(1.55rem, 5vw, 2.25rem)",
    fontWeight: 500,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    margin: 0,
  } satisfies React.CSSProperties,
  body: {
    color: palette.body,
    fontFamily: sansFamily,
    fontSize: "1rem",
    lineHeight: 1.65,
    margin: 0,
  } satisfies React.CSSProperties,
  cardGrid: {
    display: "grid",
    gap: "1rem",
  } satisfies React.CSSProperties,
}

export const PageShell = ({ children }: ShellProps) => (
  <div
    style={{
      background:
        `radial-gradient(circle at top left, ${palette.pageGlow}, transparent 26%), ` +
        `radial-gradient(circle at top right, ${palette.pageGlowSecondary}, transparent 22%), ` +
        palette.page,
      color: palette.text,
      fontFamily: sansFamily,
      minHeight: "100vh",
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
        backgroundSize: "72px 72px",
        inset: 0,
        opacity: 0.18,
        pointerEvents: "none",
        position: "absolute",
      }}
    />
    <div
      style={{
        display: "grid",
        gap: "1rem",
        padding: "clamp(1rem, 3vw, 1.6rem)",
        position: "relative",
      }}
    >
      {children}
    </div>
  </div>
)

export const Panel = ({ children, accent = "slate", style }: PanelProps) => {
  const accentColor = accent === "cyan" ? palette.cyan : accent === "green" ? palette.green : palette.slate

  return (
    <div
      style={{
        background: palette.panel,
        border: `1px solid ${palette.border}`,
        borderRadius: "12px",
        boxShadow: "0 1px 2px rgba(26,26,24,0.06)",
        padding: "1.25rem",
        position: "relative",
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          background: accentColor,
          borderRadius: "999px",
          height: "6px",
          left: "1.25rem",
          opacity: 0.55,
          position: "absolute",
          top: "1rem",
          width: "44px",
        }}
      />
      <div style={{ paddingTop: "0.75rem" }}>{children}</div>
    </div>
  )
}

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
          fontSize: "1rem",
          gap: "0.7rem",
          lineHeight: 1.65,
        }}
      >
        <span style={{ color: palette.cyan }}>•</span>
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
