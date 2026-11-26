import * as React from "react"
import { C, Note, label } from "./Ch5_ui"

// Every number is from the BudgetBench explainer post.
const CASES = [
  { k: "near", t: "Near-null", lazy: "RAG at 8K (0.34) beats full context at 32K (0.32), so retrieval wins.", honest: "The paired difference is +0.02 with an interval of [-0.08, +0.12] on 50 items. That includes zero, and it is too wide to claim equivalence either.", src: "Local 1.5B model, 50 LongBench v2 items" },
  { k: "bump", t: "Curve that wiggles", lazy: "Pick one budget column and report a winner.", honest: "On 89 LongBench v2 items RAG peaks at 8K (0.35) and falls to 0.31 at 32K; summary drops from 0.30 to 0.24 at 4K. Intervals overlap heavily, so the post says this is not a ranking.", src: "qwen2.5:1.5b, 89 items" },
  { k: "full", t: "A score that is too good", lazy: "Full context scored 0.979 at 2K, the best result.", honest: "Only 48 of 500 prompts fit in 2K. The enforcer rejected the other 452, so that number covers only the short, easy histories. The paper labels it a feasibility diagnostic.", src: "LongMemEval oracle study" },
  { k: "bug", t: "A bug in your own measurement", lazy: "Every row reported a violation rate of 0.00, so the budget was respected.", honest: "The pilot counted tokens with tiktoken, not the served model's tokenizer. Recounted, 14, 35, 53, 65 and 50 of 89 prompts would have been over budget at 2K, 4K, 8K, 16K and 32K. The paper downgraded its own table.", src: "Early local pilot, tokenizer audit" },
]

export default function Ch6_NullGallery() {
  const [k, setK] = React.useState("near")
  const c = CASES.find(x => x.k === k)!
  return (
    <div style={{ fontFamily: C.sans, color: C.ink }}>
      <div role="group" aria-label="Examples" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
        {CASES.map(x => (
          <button key={x.k} type="button" aria-pressed={x.k === k} onClick={() => setK(x.k)} style={{ textAlign: "left", cursor: "pointer", padding: "10px", minHeight: 48, borderRadius: 4, border: `1px solid ${x.k === k ? C.clay : C.line}`, background: x.k === k ? C.paper : "transparent", color: x.k === k ? C.clay : C.ink, fontFamily: C.sans, fontSize: 14, fontWeight: 600 }}>{x.t}</button>
        ))}
      </div>
      <div aria-live="polite" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 12 }}>
        <div style={{ border: `1px solid ${C.line}`, borderRadius: 4, padding: 12, background: C.paper }}>
          <div style={{ ...label, color: C.clay }}>The tempting claim</div>
          <Note>{c.lazy}</Note>
        </div>
        <div style={{ border: `1px solid ${C.blue}`, borderRadius: 4, padding: 12, background: C.paper }}>
          <div style={{ ...label, color: C.blue }}>What the data supports</div>
          <Note>{c.honest}</Note>
        </div>
      </div>
      <div style={{ ...label, marginTop: 8 }}>Source: BudgetBench explainer, {c.src}</div>
    </div>
  )
}
