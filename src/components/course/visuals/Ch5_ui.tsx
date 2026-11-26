import * as React from "react"

// Shared look for the Ch5 and Ch6 visuals. Site palette only, radius <= 4px, no shadows.
export const C = {
  paper: "#FAF9F6", ink: "#141413", sec: "#5E5D59", line: "#E3E0D8", panel: "#F3F1EB", clay: "#C2522D", blue: "#2F5D8C",
  sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  serif: "Fraunces, 'Source Serif 4', Georgia, serif",
  mono: "'JetBrains Mono', 'IBM Plex Mono', SFMono-Regular, Consolas, monospace",
}

export const label: React.CSSProperties = { fontFamily: C.mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: C.sec }

export const Btn = ({ on, onClick, children, disabled, accent }: { on?: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; accent?: string }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={on === undefined ? undefined : on}
    style={{
      ...label, cursor: disabled ? "default" : "pointer", padding: "9px 12px", minHeight: 40, borderRadius: 4,
      border: `1px solid ${on ? accent || C.clay : C.line}`, background: on ? C.paper : "transparent",
      color: disabled ? C.line : on ? accent || C.clay : C.ink,
    }}
  >
    {children}
  </button>
)

export const Row = ({ children, gap = 8 }: { children: React.ReactNode; gap?: number }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap, alignItems: "center" }}>{children}</div>
)

export const Note = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: C.sans, fontSize: 15, lineHeight: 1.55, margin: "12px 0 0", color: C.ink, minHeight: 46 }}>{children}</p>
)

export const Schematic = () => <div style={{ ...label, marginTop: 8 }}>Schematic, not to scale</div>
