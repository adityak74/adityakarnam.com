import * as React from "react"

const c = { paper: "#FAF9F6", ink: "#141413", sec: "#5E5D59", hair: "#E3E0D8", panel: "#F3F1EB", clay: "#C2522D", blue: "#2F5D8C" }
const mono = "'JetBrains Mono', 'IBM Plex Mono', SFMono-Regular, Consolas, monospace"
const sans = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// Every number below is from the overkill-lab post.
const ELECTRICITY = 1.73
const LINES = [
  { id: "cpu", label: "c5.4xlarge for CPU", usd: 196 },
  { id: "gpu", label: "GPU instances for training", usd: 300 },
  { id: "s3", label: "S3 storage and transfer", usd: 50 },
]
const money = (v: number) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: v < 100 ? 2 : 0, maximumFractionDigits: v < 100 ? 2 : 0 })

const CostExplorer = () => {
  const [months, setMonths] = React.useState(6)
  const [share, setShare] = React.useState(100)
  const [hw, setHw] = React.useState(0)
  const [on, setOn] = React.useState<Record<string, boolean>>({ cpu: true, gpu: true, s3: true })
  const monthly = LINES.reduce((s, l) => s + (on[l.id] ? l.usd : 0), 0) * (share / 100)
  const cloud = monthly * months
  const local = hw + ELECTRICITY * months
  const gap = monthly - ELECTRICITY
  const be = hw > 0 && gap > 0 ? hw / gap : null
  const max = Math.max(cloud, local, 1)
  const lab: React.CSSProperties = { fontFamily: mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: c.sec }
  const slider = (id: string, label: string, val: number, min: number, maxV: number, step: number, set: (n: number) => void, shown: string) => (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={id} style={{ ...lab, display: "flex", justifyContent: "space-between" }}><span>{label}</span><span style={{ color: c.ink }}>{shown}</span></label>
      <input id={id} type="range" min={min} max={maxV} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: "100%", accentColor: c.clay, margin: "6px 0 0" }} />
    </div>
  )
  const bar = (name: string, v: number, col: string) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ ...lab, display: "flex", justifyContent: "space-between" }}><span>{name}</span><span style={{ color: c.ink }}>{money(v)}</span></div>
      <div style={{ height: 18, background: c.paper, border: `1px solid ${c.hair}`, borderRadius: 3, marginTop: 4 }}>
        <div style={{ height: "100%", width: `${(v / max) * 100}%`, background: col, borderRadius: 2, transition: "width .2s" }} />
      </div>
    </div>
  )
  return (
    <div style={{ fontFamily: sans, color: c.ink }} role="group" aria-label="Local versus cloud cost explorer">
      {slider("cx-m", "Months of use", months, 1, 12, 1, setMonths, String(months))}
      {slider("cx-s", "Share of the post's cloud bill you would really rent", share, 10, 100, 10, setShare, share + "%")}
      {slider("cx-h", "Hardware you paid up front", hw, 0, 4000, 50, setHw, money(hw))}
      <fieldset style={{ border: 0, padding: 0, margin: "0 0 14px" }}>
        <legend style={{ ...lab, marginBottom: 6, padding: 0 }}>Cloud line items per month</legend>
        {LINES.map(l => (
          <label key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, minHeight: 32 }}>
            <input type="checkbox" checked={on[l.id]} onChange={e => setOn({ ...on, [l.id]: e.target.checked })} style={{ accentColor: c.clay, width: 18, height: 18 }} />
            {l.label}: {money(l.usd)}
          </label>
        ))}
      </fieldset>
      {bar("Local (electricity " + money(ELECTRICITY) + "/month + hardware)", local, c.blue)}
      {bar("Cloud equivalent (" + money(monthly) + "/month)", cloud, c.clay)}
      <p aria-live="polite" style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.6 }}>
        {hw === 0
          ? "With hardware set to $0 the local side is only electricity, which is how the post counts its monthly cost. Move the hardware slider to what a machine really costs and watch the gap shrink."
          : be !== null
            ? `Hardware pays for itself after about ${be.toFixed(1)} months at this cloud bill. If you would use it for fewer months than that, renting is cheaper.`
            : "At this cloud bill the hardware never pays for itself."}
      </p>
      <p style={{ ...lab, margin: "10px 0 0", lineHeight: 1.6 }}>Figures from the overkill-lab post: author's own estimate, one Mac mini M2 Pro with 64 GB. Schematic, not a quote.</p>
    </div>
  )
}
export default CostExplorer
