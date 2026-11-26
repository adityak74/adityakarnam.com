/** @jsx jsx */
import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import AgentLoop from "../components/world-model/anim/AgentLoop"
import {
  Page,
  Title,
  Section,
  Prose,
  RuledList,
  TextLink,
  Mono,
  Pre,
  Row,
  ed,
  Explore,
} from "../components/world-model/pages-systems-stack-now/editorial"

const sizes = [
  ["quecto, default --release", "2.6 MB"],
  ["quecto, stripped", "2.3 MB"],
  ["quecto, size-optimized (shipped)", "~1.3 MB"],
  ["quecto-agent, size-optimized (shipped)", "~5.5 MB"],
]

const byoc: Row[] = [
  { key: "sys", title: "System prompt", body: <span><Mono>QUECTO_SYSTEM</Mono> replaces the default persona. Repo rules and seed context are still appended for quecto-agent.</span> },
  { key: "model", title: "Model and endpoint", body: <span><Mono>QUECTO_BASE_URL</Mono> and <Mono>QUECTO_MODEL</Mono> point at any OpenAI-compatible server, local (Ollama, LM Studio, vLLM) or cloud.</span> },
  { key: "flavors", title: "Behavior presets", body: <span><Mono>.quecto/flavors/*.toml</Mono> bundle a system prompt, tool policy and defaults into a named profile, trusted on first use by content hash.</span> },
  { key: "verify", title: "Verification gate", body: <span><Mono>QUECTO_VERIFY</Mono> runs your own tests, linters or type checks after each edit, before the agent calls a step done.</span> },
  { key: "state", title: "Storage", body: <span><Mono>QUECTO_STATE_DB</Mono> and <Mono>QUECTO_TRUST_FILE</Mono> relocate session and trust state anywhere.</span> },
]

const capabilities: Row[] = [
  { key: "tools", title: "Tool use", body: "File read, write and patch, search, git and shell, in a single multi-step agent loop." },
  { key: "approval", title: "Approval gating", body: "Edits and commands go through a configurable approval preset before anything touches disk." },
  { key: "sandbox", title: "Sandbox denylist", body: "Blocks sudo, rm -rf /, git push and other destructive actions, even under --yes." },
  { key: "sessions", title: "Session persistence", body: "SQLite-backed sessions support resume, undo and diff across runs." },
]

const QuectoPage = (_props: PageProps) => (
  <Layout>
    <Page>
      <Title
        eyebrow="Project · Rust"
        lede="A minimal AI harness and the coding agent built on it. One endpoint, no async runtime, statically linked: a 1.3 MB core and a 5.5 MB agent."
      >
        Quecto
      </Title>

      <div sx={{ display: `flex`, gap: 4, flexWrap: `wrap`, mb: [4, 5], fontSize: `15px`, mt: `-1.5rem` }}>
        <TextLink href="https://github.com/adityak74/quecto">GitHub</TextLink>
        <a href="#quick-start" sx={{ color: ed.clay, textDecoration: `none` }}>Quick start</a>
        <TextLink to="/ai-research/building-quecto-from-minimal-harness-to-evaluable-agent/">Build notes</TextLink>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem 3rem", alignItems: "center", marginBottom: "3rem" }}>
        <div style={{ flex: "1 1 280px", maxWidth: "46ch", fontSize: 17, lineHeight: 1.65 }}>
          <p style={{ margin: 0 }}>
            A coding agent is a loop: prompt the model, run the tool call it asks for, feed the result back. Quecto
            keeps that loop small and puts an approval gate in front of every tool call, so its behavior can be
            inspected and evaluated.
          </p>
          <p style={{ margin: "1rem 0 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#5E5D59", lineHeight: 1.7 }}>
            Click the APPROVE? box to block the tool call<br />and watch the loop stop.
          </p>
        </div>
        <div style={{ flex: "0 1 400px", width: "100%", maxWidth: 400, marginLeft: "auto" }}>
          <AgentLoop />
        </div>
      </div>

      <Section label="Size" title="1.3 MB core, 5.5 MB agent">
        <Prose>
          <p>
            Both binaries are self-contained, with statically linked rustls TLS. The core has two direct
            dependencies (ureq and serde_json) and about 30 transitive crates, with no tokio and no reqwest. The agent
            adds the tool loop, sandbox, SQLite session store and manifest parsing, and still fits in 5.5 MB. The
            name comes from the SI prefix quecto (10⁻³⁰): break a task into its smallest composable piece, then
            compose back up.
          </p>
        </Prose>
        <div sx={{ mt: 4, borderTop: `1px solid ${ed.hairline}`, maxWidth: 680 }}>
          {sizes.map(([label, value]) => (
            <div
              key={label}
              sx={{ display: `flex`, justifyContent: `space-between`, gap: 3, py: 2, borderBottom: `1px solid ${ed.hairline}`, fontSize: `15px` }}
            >
              <span>{label}</span>
              <span sx={{ fontFamily: ed.mono, fontSize: `13px` }}>{value}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Demo" title="One-shot and REPL">
        <Prose>
          <p>Captured live against a local qwen3.6:35b-mlx model on Ollama, with no API key.</p>
        </Prose>
        <div sx={{ display: `grid`, gridTemplateColumns: [`1fr`, `1fr 1fr`], gap: 3, mt: 3 }}>
          <img
            src="https://raw.githubusercontent.com/adityak74/quecto/main/docs/assets/demo-oneshot.svg"
            alt="quecto one-shot: a haiku streamed from a local model"
            sx={{ display: `block`, width: `100%`, border: `1px solid ${ed.hairline}`, borderRadius: `4px` }}
          />
          <img
            src="https://raw.githubusercontent.com/adityak74/quecto/main/docs/assets/demo-repl.svg"
            alt="quecto interactive REPL answering a question"
            sx={{ display: `block`, width: `100%`, border: `1px solid ${ed.hairline}`, borderRadius: `4px` }}
          />
        </div>
      </Section>

      <Section label="Configuration" title="Bring your own config">
        <Prose>
          <p>Nothing is hardcoded to a vendor, a model or a persona. Every layer is an environment variable or a file.</p>
        </Prose>
        <div sx={{ mt: 3 }}>
          <RuledList rows={byoc} />
        </div>
      </Section>

      <Section label="quecto-agent" title="The coding agent">
        <Prose>
          <p>Built on the core&apos;s quecto_raw primitive, with the same design scaled up to a full agent loop.</p>
        </Prose>
        <div sx={{ mt: 3 }}>
          <RuledList rows={capabilities} />
        </div>
      </Section>

      <section id="quick-start" sx={{ mb: [5, 6] }}>
        <Section label="Quick start" title="Build it, run it">
          <Pre>
{`$ git clone https://github.com/adityak74/quecto && cd quecto
$ cargo build --release              # -> target/release/quecto (~1.3 MB)
$ cargo install --path . --force
$ quecto "write me a haiku about small things"

$ export QUECTO_BASE_URL="http://localhost:11434/v1"
$ export QUECTO_MODEL="qwen2.5-coder"
$ quecto "refactor this function"    # local, no API key

$ cargo build --release -p quecto-agent   # -> target/release/quecto-agent (~5.5 MB)
$ quecto-agent "add a test for the parse_args function"
$ quecto-agent chat`}
          </Pre>
        </Section>
      </section>

      <Section label="Related">
        <Prose>
          <p>
            Quecto is the runtime end of the same thread as subagent-fleet and embenx. See{` `}
            <TextLink to="/systems/">systems</TextLink> and <TextLink to="/stack/">the stack</TextLink>.
          </p>
        </Prose>
      </Section>
      <Explore keys={["systems", "writing", "now"]} />
    </Page>
  </Layout>
)

export default QuectoPage

export const Head: HeadFC = () => (
  <Seo
    title="Quecto"
    description="quecto: the leanest, fastest, smallest AI harness, and quecto-agent, the coding agent built on it — a 1.3 MB core and a 5.5 MB agent, both statically linked with zero async runtime."
    pathname="/quecto/"
  />
)
