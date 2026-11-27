/** @jsx jsx */
import GrowthLadder from "./GrowthLadder"
import HeroStack from "./HeroStack"
import PixelSprite from "../PixelSprite"
import * as React from "react"
import { Box, jsx } from "theme-ui"
import { Link } from "gatsby"
import HeroChat from "./HeroChat"
import { NebulaBackdrop } from "./Nebula"

const c = { blue: "#2F5D8C", ink: "#141413", sec: "#5E5D59", rule: "#E3E0D8", panel: "#F3F1EB", accent: "#C2522D" }
const mono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
const serif = "'Fraunces', 'Source Serif 4', Georgia, serif"

const linkSx = {
  color: "inherit",
  textDecoration: "underline",
  textDecorationColor: c.rule,
  textUnderlineOffset: "3px",
  transition: "color .15s, text-decoration-color .15s",
  "&:hover": { color: c.accent, textDecorationColor: c.accent },
}
const labelSx = { fontFamily: mono, fontSize: "12px", letterSpacing: ".06em", textTransform: "uppercase" as const, color: c.sec }

type Row = { tag: string; title: string; note: string; href: string; year: string; limit?: string; big?: string; external?: boolean }

const research: Row[] = [
  { tag: "Paper", title: "BudgetBench: memory strategy evaluation under a fixed token budget", note: "On LongMemEval (500 questions), retrieval at a 2K budget scored 0.646; truncation needed 8K to reach 0.650. arXiv:2609.13149.", href: "/budgetbench-explained", big: "0.646", year: "2026", limit: "Whether a budgeted strategy matches full context is unresolved: no paired interval on either model establishes equivalence." },
  { tag: "Distillation", title: "Ornith-1.5-9B, two-teacher distillation on MLX", note: "A 4.9 GB build scores +5.5 MMLU and +3.0 HumanEval over the 8.9 GB release it replaces; the gain comes from reasoning termination, not knowledge.", href: "/distilling-ornith-9b-two-teacher-mlx/", big: "+5.5 MMLU", year: "2026", limit: "One model, one machine. None of the original MMLU, TruthfulQA or HumanEval targets were reached." },
  { tag: "Inference", title: "Speculative decoding on Apple Silicon", note: "Qwen3.8-27B with a 0.8B draft model peaks at a 119% decode speedup, after patching mlx_lm to accept its hybrid attention cache.", href: "/mlx-speculative-decoding-qwen3-8-apple-silicon/", big: "+119%", year: "2026", limit: "Depends on unmerged upstream PR #1486. One draft-to-target ratio (0.8B:27B) tested." },
  { tag: "Inference", title: "Why batching does not fix decode", note: "On an M5 Pro, GEMM holds a flat ~80x throughput advantage over GEMV, which is why batching helps prefill and barely touches decode.", href: "/mlx-gemv-gemm-roofline-apple-silicon/", big: "~80x", year: "2026", limit: "One chip, one framework (mlx 0.32.0, float16). Per-size ratios ran about 64x to 108x; nothing measured below 1,024." },
  { tag: "Retrieval", title: "Tokens per paper: DocLang vs Docling vs raw PDF", note: "DocLang costs 2.7x markdown tokens on a stock tokenizer and loses on retrieval; 38% of the paper was bibliography and boilerplate.", href: "/tokens-per-paper-doclang-docling-pdf/", big: "2.7x", year: "2026", limit: "Two papers and one small embedder. The recall difference is within noise at this sample size." },
  { tag: "Numerics", title: "MLX non-determinism on Apple Silicon", note: "The same matrix multiply, computed two ways on an M2, differs by a relative error of 1.6e-5 at 512x512 and 8.9e-4 at 4096x4096.", href: "/mlx-non-determinism-apple-silicon", big: "8.9e-4", year: "2025", limit: "One chip, an M2 MacBook Pro. Values are approximate and the post reports no run-to-run variance." },
]

const writing: Row[] = [
  { tag: "", title: "I wrote the practical systems guide I wanted for building coding agents", note: "", href: "/building-a-coding-agent-harness/", year: "2026-10" },
  { tag: "", title: "BudgetBench explained", note: "", href: "/budgetbench-explained", year: "2026-09" },
  { tag: "", title: "LoRA fine-tuning crashed on three MoE models in mlx-lm. The fix was one line, three times.", note: "", href: "/mlx-lm-lora-moe-stop-gradient-fix/", year: "2026-09" },
  { tag: "", title: "The batch size that breaks local LLM serving on Apple Silicon", note: "", href: "/mlx-batch-concurrency-memory-wall-apple-silicon/", year: "2026-08" },
  { tag: "", title: "Building Quecto: from minimal harness to evaluable agent", note: "", href: "/ai-research/building-quecto-from-minimal-harness-to-evaluable-agent", year: "2026-07" },
  { tag: "", title: "What is an AI agent harness?", note: "", href: "/ai-research/what-is-an-ai-agent-harness", year: "2026-07" },
]

const systems: Row[] = [
  { tag: "mlx-lm", title: "PR #1795, merged", note: "Added mx.stop_gradient to MoE router indices so LoRA training no longer crashes on granitemoe, granitemoehybrid and lfm2_moe.", href: "https://github.com/ml-explore/mlx-lm/pull/1795", year: "", external: true },
  { tag: "embenx", title: "Retrieval library for agent memory", note: "One Collection API across 15+ vector backends, with hybrid search, temporal memory and an MCP server.", href: "/embenx-python-embedding-toolkit/", year: "" },
  { tag: "subagent-fleet", title: "Local compute control plane", note: "Routes coding-agent subagents across local Ollama machines with health checks, warmup and a live dashboard.", href: "/subagent-fleet-local-ai-compute-control-plane", year: "" },
  { tag: "quecto", title: "Minimal Rust coding-agent harness", note: "A ~1.3 MB synchronous core with two direct dependencies, SQLite-backed sessions and an approval-gated sandbox.", href: "/quecto/", year: "" },
  { tag: "awesome-agentic-memory", title: "Map of agent memory frameworks", note: "mem0, Letta, Zep, A-MEM and others compared by memory type, backend and MCP support.", href: "/awesome-agentic-memory/", year: "" },
]

const stats = [
  { value: "15+", label: "Vector backends behind one embenx API", href: "/embenx-python-embedding-toolkit/" },
  { value: "~1.3 MB", label: "Quecto agent core, two direct dependencies", href: "/quecto/" },
  { value: "7.8K", label: "Stars on mlx-lm (1.2K forks), where my merged PR fixed LoRA on 3 MoE models", href: "https://github.com/ml-explore/mlx-lm/pull/1795" },
]

const reach = [
  { value: "185", label: "GitHub stars on mcp-scholarly, a paper-search MCP server (27 forks)", href: "https://github.com/adityak74/mcp-scholarly" },
  { value: "2", label: "arXiv preprints: BudgetBench and CAG", href: "/ai-research" },
  { value: "10", label: "Papers, theses and journal articles on my Scholar profile", href: "/ai-research" },
]

const areas = [
  { title: "Hardware and inference", body: "What serving stacks do on real silicon: roofline limits, batching, memory walls and numerical reproducibility on Apple Silicon." },
  { title: "Models and distillation", body: "Small-model fine-tuning and distillation, measured against the larger models they are meant to replace." },
  { title: "Agents and software factories", body: "Harnesses, runtimes and orchestration for coding agents, built so their behavior can be inspected." },
  { title: "Retrieval and memory", body: "Vector backends, temporal memory and context budgets: how agents remember within a fixed cost." },
  { title: "Evaluation", body: "Protocols and harnesses that score behavior under constraints, including the null results." },
  { title: "Applied ML", body: "Machine learning for healthcare and evolutionary methods for network analysis, from earlier published work." },
]

const principles = [
  { title: "Measure first", body: "Write down the number before changing anything, then change one thing." },
  { title: "Publish the nulls", body: "Negative results and bugs in my own measurements go in the write-up." },
  { title: "Small and inspectable", body: "Prefer systems whose traces, tool calls and evals someone else can read." },
]

const A = ({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) =>
  external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" sx={linkSx}>{children}</a>
  ) : (
    <Link to={href} sx={linkSx}>{children}</Link>
  )

const Section = ({ title, more, children }: { title: string; more?: React.ReactNode; children: React.ReactNode }) => (
  <Box as="section" sx={{ mt: [6, 7], borderTop: `1px solid ${c.rule}`, pt: 3 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 3 }}>
      <h2 sx={{ ...labelSx, m: 0, fontWeight: 400, fontSize: "12px", color: c.blue, "&::before": { content: '""', display: "inline-block", width: "6px", height: "6px", bg: c.blue, mr: 2, verticalAlign: "1px" } }}>{title}</h2>
      {more ? <span sx={{ fontSize: "14px" }}>{more}</span> : null}
    </Box>
    {children}
  </Box>
)

const List = ({ rows, left }: { rows: Row[]; left: "tag" | "year" }) => (
  <ul sx={{ listStyle: "none", m: 0, p: 0 }}>
    {rows.map((r) => (
      <li
        key={r.href}
        sx={{ display: "grid", gridTemplateColumns: ["1fr", "130px 1fr"], columnGap: 4, py: 3, borderBottom: `1px solid ${c.rule}`, "&:last-child": { borderBottom: 0 } }}
      >
        <span sx={{ ...labelSx, color: left === "tag" ? c.blue : c.sec, pt: ["0", "4px"], mb: [1, 0] }}>{left === "tag" ? r.tag : r.year}</span>
        <div>
          <div sx={{ fontFamily: serif, fontSize: "1.2rem", lineHeight: 1.3, fontWeight: 500, letterSpacing: "-0.01em" }}>
            <A href={r.href} external={r.external}>{r.title}</A>
            {left === "tag" && r.year ? <span sx={{ ...labelSx, ml: 2 }}>{r.year}</span> : null}
          </div>
          {r.note ? <p sx={{ m: 0, mt: 1, color: c.sec, fontSize: "16px", lineHeight: 1.6, maxWidth: "68ch" }}>{r.note}</p> : null}
          {r.limit ? <p sx={{ m: 0, mt: 1, color: c.sec, fontSize: "14px", lineHeight: 1.5, maxWidth: "68ch" }}><span sx={{ ...labelSx, mr: 2, color: c.accent }}>Limit</span>{r.limit}</p> : null}
        </div>
      </li>
    ))}
  </ul>
)

const Cards = ({ rows }: { rows: Row[] }) => (
  <div sx={{ display: "grid", gridTemplateColumns: ["1fr", "1fr 1fr"], gap: 3 }}>
    {rows.map((r) => (
      <Link key={r.href} to={r.href} sx={{ display: "flex", flexDirection: "column", p: 3, border: `1px solid ${c.rule}`, bg: c.panel, textDecoration: "none", color: "inherit", "&:hover .t": { color: c.accent } }}>
        <span sx={{ ...labelSx, color: c.blue }}>{r.tag} · {r.year}</span>
        {r.big ? <span sx={{ fontFamily: serif, fontSize: "clamp(2.2rem, 5vw, 3rem)", lineHeight: 1, letterSpacing: "-0.03em", color: c.blue, mt: 2 }}>{r.big}</span> : null}
        <span className="t" sx={{ fontFamily: serif, fontSize: "1.15rem", lineHeight: 1.3, fontWeight: 500, mt: 2, transition: "color .15s" }}>{r.title}</span>
        <span sx={{ color: c.sec, fontSize: "15px", lineHeight: 1.55, mt: 1, mb: 3 }}>{r.note}</span>
        {r.limit ? <span sx={{ color: c.sec, fontSize: "13px", lineHeight: 1.5, mt: "auto", pt: 2, borderTop: `1px solid ${c.rule}`, display: "block" }}><span sx={{ ...labelSx, mr: 2, color: c.accent }}>Limit</span>{r.limit}</span> : null}
      </Link>
    ))}
  </div>
)

const tiles = (items: { value: string; label: string; href: string }[]) => (
      <div sx={{ display: "grid", gridTemplateColumns: ["1fr 1fr", "repeat(3, 1fr)"], borderTop: `2px solid ${c.blue}` }}>
        {items.map((st, i) => (
          <Box
            as={st.href.startsWith("http") ? "a" : (Link as any)}
            key={st.label}
            {...(st.href.startsWith("http") ? { href: st.href, target: "_blank", rel: "noopener noreferrer" } : { to: st.href })}
            sx={{ display: "block", py: 4, pr: 3, pl: [i % 2 ? 3 : 0, i % 3 ? 3 : 0], borderLeft: [i % 2 ? `1px solid ${c.rule}` : 0, i % 3 ? `1px solid ${c.rule}` : 0], borderBottom: `1px solid ${c.rule}`, textDecoration: "none", color: "inherit", "&:hover .v": { color: c.accent } }}
          >
            <div className="v" sx={{ fontFamily: serif, fontSize: "clamp(2rem, 4vw, 2.8rem)", lineHeight: 1, letterSpacing: "-0.02em", color: c.blue, transition: "color .15s" }}>{st.value}</div>
            <div sx={{ ...labelSx, mt: 2, lineHeight: 1.5 }}>{st.label}</div>
          </Box>
        ))}
      </div>
)

const HomepageConsole = () => (
  <Box sx={{ color: c.ink, pt: [4, 5], pb: 6, fontSize: "17px", lineHeight: 1.65 }}>
    <div sx={{ display: "grid", gridTemplateColumns: ["1fr", "1fr", "1fr 400px"], gap: 4, alignItems: "center", position: "relative", isolation: "isolate" }}>
    <NebulaBackdrop strength={0.9} bleed={90} salt={1} />
    <div>
    <h1 sx={{ fontFamily: serif, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.12, fontSize: "clamp(2.4rem, 5vw, 3.6rem)", m: 0, maxWidth: "20ch", textWrap: "balance" }}>
      I work across <em sx={{ fontStyle: "italic", color: "#C2522D" }}>the AI stack</em>, from <em sx={{ fontStyle: "italic", color: "#2F5D8C" }}>silicon to software factories</em>.
    </h1>
    <p sx={{ mt: 4, mb: 3, maxWidth: "68ch" }}>
      I am an AI research engineer. I work on the full path from hardware to product: inference performance on Apple Silicon, small-model training and distillation, agent systems and harnesses, retrieval and memory, evals, and the software factories that put them to work.
    </p>
    <p sx={{ m: 0, maxWidth: "68ch", color: c.sec }}>
      The work runs the whole stack: roofline and decode studies on Apple Silicon, a 6,000-row LongMemEval benchmark, a Rust coding agent, and a retrieval library over 15+ backends. Every result ships with its harness and its limits, and bugs I find get fixed upstream.
    </p>
    <p sx={{ mt: 3, fontSize: "16px" }}>
      <A href="/ai-research">Research</A> · <A href="/blog">Writing</A> · <A href="/live">Live</A> · <A href="/about">About</A> · <a href="#contact" sx={linkSx}>Contact</a>
    </p>
    </div>
    <div><HeroStack /></div>
    </div>

    <Section title="Pace and depth">
      <GrowthLadder />
      <Link to="/frameworks/" sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 3, rowGap: 1, mt: 3, px: [3, 4], py: 3, border: "1px solid", borderColor: "divide", borderLeft: "3px solid #E07A55", textDecoration: "none", color: "text", "&:hover span:last-of-type": { color: "#E07A55" } }}>
        <span sx={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#E07A55" }}>Thought leadership</span>
        <span sx={{ fontSize: "16px" }}>14 frameworks, 8 books and 2 white papers on governing AI agents, co-authored with Arjun Jaggi</span>
        <span sx={{ fontSize: "16px" }}>Read the frameworks →</span>
      </Link>
    </Section>

    <Section title="Wins and reach">
      {tiles([...stats, ...reach])}
    </Section>

    <Section title="Research" more={<A href="/ai-research">All research</A>}>
      <Cards rows={research} />
    </Section>

    <details sx={{ mt: 4, "& > summary": { ...labelSx, cursor: "pointer", "&:hover": { color: c.accent } } }}>
      <summary>Ask my work</summary>
      <Box sx={{ mt: 3 }}>
        <HeroChat />
      </Box>
    </details>

    <Section title="Research areas">
      <div sx={{ display: "grid", gridTemplateColumns: ["1fr", "1fr 1fr"], columnGap: 5 }}>
        {areas.map((a) => (
          <div key={a.title} sx={{ py: 3, borderTop: `1px solid ${c.rule}` }}>
            <div sx={{ fontFamily: serif, fontSize: "1.2rem", fontWeight: 500, letterSpacing: "-0.01em" }}>{a.title}</div>
            <p sx={{ m: 0, mt: 1, color: c.sec, fontSize: "16px", lineHeight: 1.6 }}>{a.body}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Selected writing" more={<A href="/blog">All posts</A>}>
      <List rows={writing} left="year" />
    </Section>

    <Section title="Open source and systems">
      <List rows={systems} left="tag" />
    </Section>

    <Section title="Principles">
      <div sx={{ display: "grid", gridTemplateColumns: ["1fr", "repeat(3, 1fr)"], gap: 4 }}>
        {principles.map((p, i) => (
          <div key={p.title}>
            <div sx={{ ...labelSx, color: c.blue }}>{String(i + 1).padStart(2, "0")}</div>
            <div sx={{ fontFamily: serif, fontSize: "1.2rem", fontWeight: 500, mt: 1 }}>{p.title}</div>
            <p sx={{ m: 0, mt: 1, color: c.sec, fontSize: "16px", lineHeight: 1.6 }}>{p.body}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Off the clock">
      <div sx={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
        <div sx={{ display: "flex", gap: 3 }}>
          <PixelSprite name="cartridge" size={44} label="Game cartridge" />
          <PixelSprite name="pot" size={44} label="Cooking pot" />
          <PixelSprite name="chef" size={44} label="Chef hat" />
        </div>
        <p sx={{ m: 0, maxWidth: "52ch", flex: "1 1 260px" }}>
          I love old NES games and I cook. Both are lessons in constraints: a few kilobytes of RAM, one pan, whatever is in the fridge. I bring the same habit to benchmarks.
        </p>
      </div>
    </Section>

    <Section title="Currently" more={<A href="/now">Now</A>}>
      <p sx={{ m: 0, maxWidth: "68ch" }}>
        Making local agent runtimes observable (subagent-fleet), turning retrieval into durable memory infrastructure (embenx), and keeping the agent-memory map current. Next up: a write-up on why agent memory is not just retrieval.
      </p>
    </Section>

    <Section title="Explore the site">
      <div sx={{ display: "grid", gridTemplateColumns: ["1fr 1fr", "repeat(3, 1fr)"], gap: [3, 4] }}>
        {[
          ["/ai-research", "Research", "Papers, experiments, questions"],
          ["/blog", "Writing", "Agents, memory, local inference"],
          ["/systems", "Systems", "Runtimes, retrieval, tooling"],
          ["/live", "Live", "Try paper search and running tools"],
          ["/quecto", "Quecto", "A 1.3 MB agent harness in Rust"],
          ["/ai-toolkit", "Toolkit", "Prompt tools, memory frameworks"],
          ["/about", "About", "From genetics to AI systems"],
        ].map(([to, t, d]) => (
          <Box as={Link as any} key={to} {...{ to }} sx={{ display: "block", textDecoration: "none", color: "inherit", py: 2, "&:hover .t": { color: c.accent }, "&:hover .a": { transform: "translateX(6px)", color: c.accent } }}>
            <span className="t" sx={{ fontFamily: serif, fontSize: "1.35rem", letterSpacing: "-0.015em", transition: "color .15s" }}>{t} <span className="a" sx={{ display: "inline-block", color: c.sec, transition: "transform .2s, color .15s" }}>→</span></span>
            <span sx={{ display: "block", mt: 1, fontSize: "15px", lineHeight: 1.5, color: c.sec }}>{d}</span>
          </Box>
        ))}
      </div>
    </Section>

    <Section title="Contact">
      <div sx={{ position: "relative", isolation: "isolate", py: 5 }}>
      <NebulaBackdrop strength={0.8} bleed={70} salt={3} />
      <p id="contact" sx={{ m: 0, maxWidth: "68ch" }}>
        Find me on <A href="https://github.com/adityak74" external>GitHub</A>, <A href="https://www.linkedin.com/in/adityakarnamgrao/" external>LinkedIn</A> or <A href="https://twitter.com/aditya_karnam" external>Twitter</A>.
      </p>
      </div>
    </Section>
  </Box>
)

export default HomepageConsole
