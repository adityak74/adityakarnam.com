import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  Divider,
  InlineLink,
  Panel,
  ThreeColumnGrid,
  TwoColumnGrid,
  WorldModelPageShell,
  WorldModelSection,
  labPalette,
} from "../components/world-model/pages-systems-stack-now/WorldModelPageChrome"

const mono = "'JetBrains Mono', 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"
const sans = "'Styrene A', 'Styrene B', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const eyebrowStyle: React.CSSProperties = {
  color: labPalette.cyan,
  fontFamily: mono,
  fontSize: "0.72rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
}

// The SI-prefix ladder, taken directly from quecto's own stated philosophy:
// the project treats "quecto" (10⁻³⁰) as the literal smallest unit, and
// argues that composing from that floor scales all the way up to a full
// coding agent. This ladder is the page's signature element.
const ladder: { label: string; exp: string; isQuecto?: boolean }[] = [
  { label: "mega", exp: "10⁶" },
  { label: "kilo", exp: "10³" },
  { label: "base", exp: "10⁰" },
  { label: "milli", exp: "10⁻³" },
  { label: "micro", exp: "10⁻⁶" },
  { label: "nano", exp: "10⁻⁹" },
  { label: "pico", exp: "10⁻¹²" },
  { label: "femto", exp: "10⁻¹⁵" },
  { label: "atto", exp: "10⁻¹⁸" },
  { label: "zepto", exp: "10⁻²¹" },
  { label: "yocto", exp: "10⁻²⁴" },
  { label: "ronto", exp: "10⁻²⁷" },
  { label: "quecto", exp: "10⁻³⁰", isQuecto: true },
]

const QuectoScale = () => (
  <div
    style={{
      background: labPalette.panel,
      border: `1px solid ${labPalette.border}`,
      borderRadius: "12px",
      overflowX: "auto",
      padding: "1.5rem 1.25rem 1.25rem",
    }}
  >
    <div style={{ ...eyebrowStyle, marginBottom: "1.1rem" }}>The quecto scale</div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0", minWidth: "780px" }}>
      {ladder.map((step, i) => (
        <div
          key={step.label}
          style={{
            alignItems: "center",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              background: step.isQuecto ? labPalette.cyan : labPalette.border,
              borderRadius: "999px",
              height: step.isQuecto ? "14px" : "8px",
              transition: "height 0.2s ease",
              width: step.isQuecto ? "14px" : "8px",
              boxShadow: step.isQuecto ? `0 0 0 6px rgba(194,82,45,0.14)` : "none",
            }}
          />
          <div
            style={{
              background: labPalette.border,
              height: "1px",
              position: "absolute",
              top: "6px",
              left: i === 0 ? "50%" : 0,
              right: i === ladder.length - 1 ? "50%" : 0,
              zIndex: 0,
            }}
          />
          <span
            style={{
              color: step.isQuecto ? labPalette.cyan : labPalette.slate,
              fontFamily: mono,
              fontSize: "0.68rem",
              fontWeight: step.isQuecto ? 700 : 400,
              marginTop: "0.75rem",
              textTransform: "lowercase",
              whiteSpace: "nowrap",
            }}
          >
            {step.label}
          </span>
          <span
            style={{
              color: labPalette.slate,
              fontFamily: mono,
              fontSize: "0.62rem",
              marginTop: "0.15rem",
              opacity: 0.75,
            }}
          >
            {step.exp}
          </span>
        </div>
      ))}
    </div>
    <p style={{ color: labPalette.body, fontFamily: sans, fontSize: "0.92rem", lineHeight: 1.65, marginTop: "1.4rem", marginBottom: 0 }}>
      Kilo is 10³. Quecto is 10⁻³⁰ — the smallest unit in the metric system. The project takes that
      literally: break any task down to its smallest composable piece, then compose it back up. The
      primitives decide nothing; every opinion is optional sugar you can bypass.
    </p>
  </div>
)

const SizeRuler = ({ label, valueLabel, pct, accent }: { label: string; valueLabel: string; pct: number; accent: string }) => (
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
      <span style={{ color: labPalette.text, fontFamily: sans, fontSize: "0.9rem", fontWeight: 500 }}>{label}</span>
      <span style={{ color: accent, fontFamily: mono, fontSize: "0.85rem", fontWeight: 700 }}>{valueLabel}</span>
    </div>
    <div style={{ background: labPalette.panelSoft, borderRadius: "999px", height: "10px", overflow: "hidden" }}>
      <div style={{ background: accent, borderRadius: "999px", height: "100%", width: `${pct}%` }} />
    </div>
  </div>
)

const byocItems = [
  {
    title: "System prompt",
    body: (
      <>
        <code>QUECTO_SYSTEM</code> overrides the default persona entirely — repo rules and seed context
        still get appended after it for quecto-agent.
      </>
    ),
  },
  {
    title: "Model & endpoint",
    body: (
      <>
        <code>QUECTO_BASE_URL</code> + <code>QUECTO_MODEL</code> point at any OpenAI-compatible server:
        local (Ollama, LM Studio, vLLM) or cloud (OpenAI, or anything speaking the same API shape).
      </>
    ),
  },
  {
    title: "Behavior presets",
    body: (
      <>
        <code>.quecto/flavors/*.toml</code> manifests bundle a system prompt, tool policy, and defaults
        into a named, trust-on-first-use profile you switch between per project.
      </>
    ),
  },
  {
    title: "Verification gate",
    body: (
      <>
        <code>QUECTO_VERIFY</code> runs your own shell commands — tests, linters, type checks — as a
        post-edit gate before the agent calls a step done.
      </>
    ),
  },
  {
    title: "Storage locations",
    body: (
      <>
        <code>QUECTO_STATE_DB</code> and <code>QUECTO_TRUST_FILE</code> relocate session and trust state
        anywhere: ephemeral, encrypted volume, shared path.
      </>
    ),
  },
]

const agentCapabilities = [
  { title: "Tool use", body: "File read/write/patch, search, git, and shell — multi-step tool use in a single agent loop." },
  { title: "Approval gating", body: "Edits and commands gated by a configurable approval preset before anything touches disk." },
  { title: "Sandbox denylist", body: "Hard-denylist blocks sudo, rm -rf /, git push, and other destructive actions even under --yes." },
  { title: "Verification gates", body: "QUECTO_VERIFY runs your own tests, linters, and type checks as a post-edit gate." },
  { title: "Session persistence", body: "SQLite-backed sessions power resume, undo, and diff across runs." },
  { title: "Flavor manifests", body: "Named .quecto/flavors/*.toml profiles with content-hash trust-on-first-use." },
]

const TerminalPanel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: "#1A1A18",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 12px 32px rgba(26,26,24,0.18)",
    }}
  >
    <div style={{ alignItems: "center", background: "#232320", display: "flex", gap: "0.4rem", padding: "0.7rem 1rem" }}>
      {["#E5675F", "#E5B85F", "#5FBF6E"].map(c => (
        <span key={c} style={{ background: c, borderRadius: "999px", height: "10px", width: "10px" }} />
      ))}
      <span style={{ color: "#8A857C", fontFamily: mono, fontSize: "0.72rem", marginLeft: "0.6rem" }}>
        zsh — quecto
      </span>
    </div>
    <pre
      style={{
        color: "#E5E1D8",
        fontFamily: mono,
        fontSize: "0.82rem",
        lineHeight: 1.75,
        margin: 0,
        overflowX: "auto",
        padding: "1.25rem 1.5rem",
        whiteSpace: "pre",
        // Overrides the theme's global `html pre{}` reset (background,
        // border, border-radius, box-shadow) which otherwise paints a
        // light "muted" background over this dark terminal block.
        background: "transparent",
        border: "none",
        borderRadius: 0,
        boxShadow: "none",
      }}
    >
      {children}
    </pre>
  </div>
)

const QuectoPage = (_props: PageProps) => (
  <Layout>
    <WorldModelPageShell>
      {/* Hero */}
      <section style={{ paddingBottom: "1.5rem" }}>
        <span style={eyebrowStyle}>Runtime · Coding Agent</span>
        <h1
          style={{
            color: labPalette.heading,
            fontFamily: sans,
            fontSize: "clamp(2.8rem, 8vw, 5.2rem)",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1.02,
            margin: "0.9rem 0 0",
          }}
        >
          quecto
        </h1>
        <p
          style={{
            color: labPalette.text,
            fontFamily: sans,
            fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
            lineHeight: 1.5,
            margin: "1.1rem 0 0",
            maxWidth: "36ch",
          }}
        >
          The leanest, fastest, smallest AI harness — and the coding agent built on it.
        </p>
        <p style={{ color: labPalette.body, fontFamily: sans, fontSize: "17px", lineHeight: 1.65, margin: "1rem 0 0", maxWidth: "46rem" }}>
          One endpoint. Zero async. A 1.2 MB core, a 3.3 MB agent — both shipped, both statically linked,
          neither carrying a runtime.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", marginTop: "1.6rem" }}>
          <a
            href="https://github.com/adityak74/quecto"
            target="_blank"
            rel="noreferrer"
            style={{
              background: labPalette.text,
              borderRadius: "8px",
              color: labPalette.page,
              fontFamily: sans,
              fontSize: "0.92rem",
              fontWeight: 600,
              padding: "0.75rem 1.4rem",
              textDecoration: "none",
            }}
          >
            View on GitHub →
          </a>
          <a
            href="#quick-start"
            style={{
              border: `1px solid ${labPalette.border}`,
              borderRadius: "8px",
              color: labPalette.text,
              fontFamily: sans,
              fontSize: "0.92rem",
              fontWeight: 600,
              padding: "0.75rem 1.4rem",
              textDecoration: "none",
            }}
          >
            Quick start
          </a>
        </div>
      </section>

      {/* Signature: the SI-prefix ladder */}
      <QuectoScale />

      <Divider />

      {/* The Moat */}
      <WorldModelSection
        eyebrow="The Moat"
        title="1.2 MB core, 3.3 MB agent"
        description="Both binaries are self-contained: no runtime, no interpreter, statically-linked rustls TLS. Two direct dependencies on the core (ureq + serde_json), ~30 transitive crates, no tokio, no reqwest, no async runtime. The agent adds a full tool loop, sandbox, SQLite-backed session store, and manifest parsing, and still fits in 3.3 MB."
      >
        <Panel accent="cyan">
          <SizeRuler label="quecto — default --release" valueLabel="2.6 MB" pct={40} accent={labPalette.slate} />
          <SizeRuler label="quecto — stripped" valueLabel="2.3 MB" pct={35} accent={labPalette.slate} />
          <SizeRuler label="quecto — size-optimized (shipped)" valueLabel="~1.2 MB" pct={18} accent={labPalette.cyan} />
          <SizeRuler label="quecto-agent — size-optimized (shipped)" valueLabel="~3.3 MB" pct={50} accent={labPalette.green} />
        </Panel>
      </WorldModelSection>

      {/* Demo */}
      <WorldModelSection
        eyebrow="Demo"
        title="One-shot and REPL"
        description="Real output, captured live against a local qwen3.6:35b-mlx model on Ollama — no API key."
      >
        <TwoColumnGrid>
          <Panel accent="slate">
            <img
              src="https://raw.githubusercontent.com/adityak74/quecto/main/docs/assets/demo-oneshot.svg"
              alt="quecto one-shot: a haiku streamed from a local model"
              style={{ borderRadius: "8px", display: "block", width: "100%" }}
            />
          </Panel>
          <Panel accent="slate">
            <img
              src="https://raw.githubusercontent.com/adityak74/quecto/main/docs/assets/demo-repl.svg"
              alt="quecto interactive REPL answering a question"
              style={{ borderRadius: "8px", display: "block", width: "100%" }}
            />
          </Panel>
        </TwoColumnGrid>
      </WorldModelSection>

      {/* BYOC */}
      <WorldModelSection
        eyebrow="BYOC"
        title="Bring your own config"
        description="Nothing in quecto is hardcoded to a vendor, a model, or a persona. Every layer is swappable via plain env vars and files, no forking required — because the core primitives shape nothing and discard nothing, none of this is a special case."
      >
        <ThreeColumnGrid>
          {byocItems.map(item => (
            <Panel key={item.title} accent="cyan">
              <h3 style={{ color: labPalette.heading, fontSize: "1.05rem", margin: "0 0 0.6rem" }}>{item.title}</h3>
              <p style={{ color: labPalette.body, fontSize: "0.92rem", lineHeight: 1.65, margin: 0 }}>{item.body}</p>
            </Panel>
          ))}
        </ThreeColumnGrid>
      </WorldModelSection>

      {/* quecto-agent capabilities */}
      <WorldModelSection
        eyebrow="quecto-agent"
        title="The coding agent"
        description="Built entirely on the core's quecto_raw primitive: same zero-async, statically-linked philosophy, scaled up to a full agent loop."
      >
        <ThreeColumnGrid>
          {agentCapabilities.map(item => (
            <Panel key={item.title} accent="green">
              <h3 style={{ color: labPalette.heading, fontSize: "1.05rem", margin: "0 0 0.6rem" }}>{item.title}</h3>
              <p style={{ color: labPalette.body, fontSize: "0.92rem", lineHeight: 1.65, margin: 0 }}>{item.body}</p>
            </Panel>
          ))}
        </ThreeColumnGrid>
      </WorldModelSection>

      {/* Quick start */}
      <section id="quick-start" style={{ padding: "2rem 0 0" }}>
        <span style={eyebrowStyle}>Quick Start</span>
        <h2
          style={{
            color: labPalette.heading,
            fontFamily: sans,
            fontSize: "clamp(2rem, 4vw, 3.25rem)",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            margin: "0.6rem 0 0",
          }}
        >
          Build it, run it
        </h2>
        <div style={{ marginTop: "1.5rem" }}>
          <TerminalPanel>
{`$ git clone https://github.com/adityak74/quecto && cd quecto
$ cargo build --release              # -> target/release/quecto (~1.2 MB)
$ cargo install --path . --force
$ quecto "write me a haiku about small things"

$ export QUECTO_BASE_URL="http://localhost:11434/v1"
$ export QUECTO_MODEL="qwen2.5-coder"
$ quecto "refactor this function"    # local, no API key

$ cargo build --release -p quecto-agent   # -> target/release/quecto-agent (~3.3 MB)
$ quecto-agent "add a test for the parse_args function"
$ quecto-agent chat`}
          </TerminalPanel>
        </div>
      </section>

      <Divider />

      {/* Continue through the lab */}
      <WorldModelSection
        eyebrow="Next Reads"
        title="Continue through the lab"
        description="quecto is the runtime-control end of the same thesis behind subagent-fleet and embenx: small, legible, operator-controlled infrastructure."
      >
        <TwoColumnGrid>
          <Panel accent="cyan">
            <h3 style={{ marginTop: 0, color: labPalette.heading }}>Read the systems index</h3>
            <p style={{ color: labPalette.body }}>
              The <InlineLink to="/systems/">systems page</InlineLink> places quecto alongside
              subagent-fleet, embenx, and the other artifacts in the current infrastructure slice.
            </p>
          </Panel>
          <Panel accent="green">
            <h3 style={{ marginTop: 0, color: labPalette.heading }}>Read the stack</h3>
            <p style={{ color: labPalette.body }}>
              The <InlineLink to="/stack/">stack page</InlineLink> turns the thesis into a concrete
              systems map: runtime, memory, retrieval, simulation, tools, routing, and evaluation.
            </p>
          </Panel>
        </TwoColumnGrid>
      </WorldModelSection>
    </WorldModelPageShell>
  </Layout>
)

export default QuectoPage

export const Head: HeadFC = () => (
  <Seo
    title="Quecto"
    description="quecto: the leanest, fastest, smallest AI harness, and quecto-agent, the coding agent built on it — a 1.2 MB core and a 3.3 MB agent, both statically linked with zero async runtime."
    pathname="/quecto/"
  />
)
