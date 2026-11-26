/** @jsx jsx */
import GeneNetwork from "./GeneNetwork"
import * as React from "react"
import { Box, jsx } from "theme-ui"
import { Link } from "gatsby"
import HeroChat from "./HeroChat"

const c = { ink: "#141413", sec: "#5E5D59", rule: "#E3E0D8", panel: "#F3F1EB", accent: "#C2522D" }
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

type Row = { tag: string; title: string; note: string; href: string; year: string; external?: boolean }

const research: Row[] = [
  { tag: "Paper", title: "BudgetBench: memory strategy evaluation under a fixed token budget", note: "On LongMemEval (500 questions), retrieval at a 2K budget scored 0.646; truncation needed 8K to reach 0.650. arXiv:2609.13149.", href: "/budgetbench-explained", year: "2026" },
  { tag: "Distillation", title: "Ornith-1.5-9B, two-teacher distillation on MLX", note: "A 4.9 GB build scores +5.5 MMLU and +3.0 HumanEval over the 8.9 GB release it replaces; the gain comes from reasoning termination, not knowledge.", href: "/distilling-ornith-9b-two-teacher-mlx/", year: "2026" },
  { tag: "Inference", title: "Speculative decoding on Apple Silicon", note: "Qwen3.8-27B with a 0.8B draft model peaks at a 119% decode speedup, after patching mlx_lm to accept its hybrid attention cache.", href: "/mlx-speculative-decoding-qwen3-8-apple-silicon/", year: "2026" },
  { tag: "Inference", title: "Why batching does not fix decode", note: "On an M5 Pro, GEMM holds a flat ~80x throughput advantage over GEMV, which is why batching helps prefill and barely touches decode.", href: "/mlx-gemv-gemm-roofline-apple-silicon/", year: "2026" },
  { tag: "Retrieval", title: "Tokens per paper: DocLang vs Docling vs raw PDF", note: "DocLang costs 2.7x markdown tokens on a stock tokenizer and loses on retrieval; 38% of the paper was bibliography and boilerplate.", href: "/tokens-per-paper-doclang-docling-pdf/", year: "2026" },
  { tag: "Numerics", title: "MLX non-determinism on Apple Silicon", note: "Batch-invariance tests from 512 to 4096 matrices, with bfloat16, float16 and float32 error behavior.", href: "/mlx-non-determinism-apple-silicon", year: "2025" },
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

const A = ({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) =>
  external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" sx={linkSx}>{children}</a>
  ) : (
    <Link to={href} sx={linkSx}>{children}</Link>
  )

const Section = ({ title, more, children }: { title: string; more?: React.ReactNode; children: React.ReactNode }) => (
  <Box as="section" sx={{ mt: [6, 7], borderTop: `1px solid ${c.rule}`, pt: 3 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 3 }}>
      <h2 sx={{ ...labelSx, m: 0, fontWeight: 400, fontSize: "12px" }}>{title}</h2>
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
        <span sx={{ ...labelSx, pt: ["0", "4px"], mb: [1, 0] }}>{left === "tag" ? r.tag : r.year}</span>
        <div>
          <div sx={{ fontFamily: serif, fontSize: "1.2rem", lineHeight: 1.3, fontWeight: 500, letterSpacing: "-0.01em" }}>
            <A href={r.href} external={r.external}>{r.title}</A>
            {left === "tag" && r.year ? <span sx={{ ...labelSx, ml: 2 }}>{r.year}</span> : null}
          </div>
          {r.note ? <p sx={{ m: 0, mt: 1, color: c.sec, fontSize: "16px", lineHeight: 1.6, maxWidth: "68ch" }}>{r.note}</p> : null}
        </div>
      </li>
    ))}
  </ul>
)

const HomepageConsole = () => (
  <Box sx={{ color: c.ink, pt: [4, 5], pb: 6, fontSize: "17px", lineHeight: 1.65 }}>
    <div sx={{ display: "grid", gridTemplateColumns: ["1fr", "1fr 260px"], gap: 4, alignItems: "center" }}>
    <div>
    <h1 sx={{ fontFamily: serif, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.12, fontSize: "clamp(2.4rem, 5vw, 3.6rem)", m: 0, maxWidth: "20ch" }}>
      I build the infrastructure layer for reliable agents.
    </h1>
    <p sx={{ mt: 4, mb: 3, maxWidth: "68ch" }}>
      I am an AI researcher and senior software engineer. My work covers agent memory, retrieval, local inference, model routing, evals and agent harnesses.
    </p>
    <p sx={{ m: 0, maxWidth: "68ch", color: c.sec }}>
      Most of it is measured on a laptop: fixed budgets, small models, and numbers I can reproduce. I publish the harnesses and the null results alongside the wins, and fix upstream when I find a bug.
    </p>
    <p sx={{ mt: 3, fontSize: "16px" }}>
      <A href="/ai-research">Research</A> · <A href="/blog">Writing</A> · <A href="/about">About</A> · <a href="#contact" sx={linkSx}>Contact</a>
    </p>
    </div>
    <div sx={{ display: ["none", "block"] }}><GeneNetwork /></div>
    </div>

    <details sx={{ mt: 4, "& > summary": { ...labelSx, cursor: "pointer", "&:hover": { color: c.accent } } }}>
      <summary>Ask my work</summary>
      <Box sx={{ mt: 3 }}>
        <HeroChat />
      </Box>
    </details>

    <Section title="Research" more={<A href="/ai-research">All research</A>}>
      <List rows={research} left="tag" />
    </Section>

    <Section title="Selected writing" more={<A href="/blog">All posts</A>}>
      <List rows={writing} left="year" />
    </Section>

    <Section title="Open source and systems">
      <List rows={systems} left="tag" />
    </Section>

    <Section title="Currently" more={<A href="/now">Now</A>}>
      <p sx={{ m: 0, maxWidth: "68ch" }}>
        Making local agent runtimes observable (subagent-fleet), turning retrieval into durable memory infrastructure (embenx), and keeping the agent-memory map current. Next up: a write-up on why agent memory is not just retrieval.
      </p>
    </Section>

    <Section title="Contact">
      <p id="contact" sx={{ m: 0, maxWidth: "68ch" }}>
        Find me on <A href="https://github.com/adityak74" external>GitHub</A>, <A href="https://www.linkedin.com/in/adityakarnamgrao/" external>LinkedIn</A> or <A href="https://twitter.com/aditya_karnam" external>Twitter</A>.
      </p>
    </Section>
  </Box>
)

export default HomepageConsole
