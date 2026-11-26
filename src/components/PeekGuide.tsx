import * as React from "react"
import { Link } from "gatsby"
import PixelSprite from "./PixelSprite"

// A small pixel chef that peeks in from the corner once per page, after the visitor has
// scrolled a little, and points at one related page. Dismissible; stays dismissed for the session.
type Hint = { to: string; text: string }
const H = (to: string, text: string): Hint => ({ to, text })
const HINTS: Record<string, Hint[]> = {
  "/": [H("/about/", "Psst. My thesis is an animation."), H("/quecto/", "A whole agent in 1.3 MB. Peek inside."), H("/ai-research/", "Fresh papers, still warm."), H("/blog/", "Fresh from the kitchen: new posts."), H("/live/", "Want to poke something? Try Live.")],
  "/ai-research/": [H("/systems/", "Also check out what I built."), H("/blog/", "The long versions live in Writing."), H("/about/", "Want the origin story? Genetics, then AI."), H("/live/", "Try the paper-search demo.")],
  "/systems/": [H("/quecto/", "Quecto is the fun one. Try it."), H("/ai-research/", "The experiments behind these are here."), H("/now/", "Currently simmering: see Now."), H("/live/", "These run. See them live.")],
  "/quecto/": [H("/now/", "See what I'm cooking up now."), H("/systems/", "More tools like this one in Systems."), H("/blog/", "I wrote up how it was built.")],
  "/about/": [H("/blog/", "Also check out my writing."), H("/ai-research/", "Curious what came after the thesis?"), H("/systems/", "Wanna see the things I shipped?"), H("/live/", "From thesis to running software: Live.")],
  "/now/": [H("/ai-research/", "The research behind this is here."), H("/about/", "Meet the person behind the pixels."), H("/quecto/", "Insert coin: try Quecto.")],
  "/blog/": [H("/ai-research/", "Hungry for papers? Try Research."), H("/systems/", "Prefer code? Systems has it."), H("/about/", "Psst. The About page animates.")],
}
const FALLBACKS = [H("/ai-research/", "Also check out my research."), H("/systems/", "Psst. Systems is worth a look."), H("/about/", "Say hi on the About page.")]
const EXTRA_PAGES = [
  H("/live/", "Psst. Search research papers right on the page."),
  H("/live/", "Running software, not slides. Live."),
  H("/ai-toolkit/", "Free prompt tools, fresh off the grill."),
  H("/awesome-agentic-memory/", "A map of agent memory frameworks. Bring snacks."),
  H("/field-notes/", "Short notes, no filler. Field notes."),
  H("/stack/", "Curious what I cook with? The stack."),
]
const ARTICLES = [
  H("/distilling-ornith-9b-two-teacher-mlx/", "A 4.9 GB model that beats the 8.9 GB one. Recipe inside."),
  H("/mlx-speculative-decoding-qwen3-8-apple-silicon/", "119% faster decode on a laptop. Yes, really."),
  H("/mlx-long-context-kv-cache-apple-silicon/", "Why does decode slow down at long context? Read this."),
  H("/mlx-gemv-gemm-roofline-apple-silicon/", "Batching does not fix decode. Here is the roofline math."),
  H("/mlx-non-determinism-apple-silicon/", "Same input, different output. Why? Read on."),
  H("/mlx-lm-lora-moe-stop-gradient-fix/", "One missing stop_gradient crashed three models."),
  H("/mlx-batch-concurrency-memory-wall-apple-silicon/", "Where exactly does Apple Silicon hit the memory wall?"),
  H("/mlx-errors-apple-silicon-troubleshooting/", "Stuck on an MLX error? Recipes inside."),
  H("/embenx-python-embedding-toolkit/", "15+ vector backends, one API. Taste test."),
  H("/subagent-fleet-local-ai-compute-control-plane/", "Turn your spare Macs into one compute fleet."),
  H("/budgetbench-explained/", "Memory under a token budget: the paper, explained."),
  H("/medfit-llm-explained/", "Small models, medical tasks. How it went."),
  H("/ai-research/building-quecto-from-minimal-harness-to-evaluable-agent/", "How Quecto grew from tiny harness to evaluable agent."),
  H("/ai-research/what-is-an-ai-agent-harness/", "What even is an AI agent harness? Start here."),
  H("/building-a-coding-agent-harness/", "Building a coding agent harness, step by step."),
  H("/tokens-per-paper-doclang-docling-pdf/", "How many tokens is a research paper? I counted."),
  H("/agent-plugins-spec-v1/", "A spec for agent plugins, v1."),
  H("/india-agent-infrastructure-layer/", "A look at India's agent infrastructure layer."),
  H("/portfolio-mcp-server/", "You can query my portfolio over MCP."),
  H("/hero-rag-chat-architecture/", "How the Ask my work chat on the homepage works."),
  H("/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon/", "Ollama vs vLLM vs SGLang on Apple Silicon."),
  H("/overkill-ml-lab-homelab-rivals-aws/", "The homelab that accidentally rivals AWS."),
  H("/ai-toolkit/prompt-grader/", "Grade your prompt for free. Be brave."),
  H("/ornith-9b-local-model-quecto-code-review-claude-sonnet-5/", "A local 9B model reviews code against Claude. Verdict inside."),
]
const norm = (x: string) => (x.endsWith("/") ? x : x + "/")
const pick = (path: string): Hint => {
  const here = norm(path)
  const pool = [...(HINTS[here] || []), ...EXTRA_PAGES, ...ARTICLES].filter((h) => norm(h.to) !== here)
  return pool[Math.floor(Math.random() * pool.length)] || FALLBACKS[0]
}
const SKIP = ["/404", "/box-breathing", "/status", "/mcp-install", "/live"]

const PeekGuide = ({ pathname }: { pathname: string }) => {
  const [open, setOpen] = React.useState(false)
  const path = pathname.endsWith("/") ? pathname : pathname + "/"
  const [hint, setHint] = React.useState<Hint>(FALLBACKS[0])

  React.useEffect(() => {
    setOpen(false)
    const h = pick(path)
    setHint(h)
    let off = false
    try { off = sessionStorage.getItem("peek-off") === "1" } catch (e) { /* ignore */ }
    if (off || SKIP.some((s) => path.startsWith(s)) || norm(h.to) === path) return
    const show = () => setOpen(true)
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (h > 0 && window.scrollY / h > 0.35) { show(); window.removeEventListener("scroll", onScroll) }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    const timer = window.setTimeout(show, 14000)
    return () => { window.removeEventListener("scroll", onScroll); window.clearTimeout(timer) }
  }, [path])

  const dismiss = () => {
    setOpen(false)
    try { sessionStorage.setItem("peek-off", "1") } catch (e) { /* ignore */ }
  }

  return (
    <div
      aria-hidden={!open}
      style={{
        position: "fixed", right: 14, bottom: 0, zIndex: 90, display: "flex", alignItems: "flex-end", gap: 8,
        transform: open ? "translateY(0)" : "translateY(110%)", transition: "transform .55s cubic-bezier(.2,.9,.3,1.25)",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div className="peek-card" style={{ position: "relative", background: "#FAF9F6", border: "1px solid #141413", borderRadius: 2, padding: "9px 12px", marginBottom: 14, maxWidth: 210, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.5, letterSpacing: ".02em" }}>
        <button type="button" onClick={dismiss} aria-label="Dismiss" tabIndex={open ? 0 : -1} style={{ position: "absolute", top: 0, right: 0, background: "none", border: 0, cursor: "pointer", color: "#5E5D59", fontSize: 16, lineHeight: 1, padding: "8px 10px" }}>×</button>
        <span style={{ display: "block", paddingRight: 12 }}>{hint.text}</span>
        <Link to={hint.to} tabIndex={open ? 0 : -1} style={{ color: "#C2522D", textDecoration: "none", display: "inline-block", marginTop: 2, padding: "8px 0" }}>Go there →</Link>
      </div>
      <div className="peek-sprite" style={{ animation: open ? "peek-bob 2.4s ease-in-out infinite" : "none", transformOrigin: "bottom" }}>
        <PixelSprite name="chefFace" size={56} />
      </div>
      <style>{"@keyframes peek-bob{0%,100%{transform:translateY(6px)}50%{transform:translateY(0)}}@media (max-width:480px){.peek-card{max-width:150px!important;font-size:10px!important;padding:7px 9px!important}.peek-sprite{zoom:.7;margin-left:-14px}}@media (prefers-reduced-motion: reduce){div[aria-hidden]{transition:none!important}}"}</style>
    </div>
  )
}

export default PeekGuide
