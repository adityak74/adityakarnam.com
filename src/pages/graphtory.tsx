/** @jsx jsx */
import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Eyebrow, TextLink, Mono, Pre, ed, Explore } from "../components/world-model/pages-systems-stack-now/editorial"

type Kids = { children: React.ReactNode }

const Post = ({ children }: Kids) => (
  <article sx={{ maxWidth: 680, mx: `auto`, py: [4, 5], fontFamily: ed.sans, color: ed.ink }}>{children}</article>
)
const H2 = ({ children }: Kids) => (
  <h2 sx={{ fontFamily: ed.serif, fontWeight: 400, fontSize: `clamp(1.55rem, 3vw, 1.95rem)`, letterSpacing: `-0.02em`, lineHeight: 1.2, mt: [5, 6], mb: 3 }}>{children}</h2>
)
const H3 = ({ children }: Kids) => (
  <h3 sx={{ fontFamily: ed.sans, fontWeight: 600, fontSize: `17px`, mt: 4, mb: 1 }}>{children}</h3>
)
const P = ({ children }: Kids) => (
  <p sx={{ fontSize: `18px`, lineHeight: 1.7, mt: 0, mb: 3 }}>{children}</p>
)
const Fig = ({ caption, wide, children }: { caption: React.ReactNode; wide?: boolean; children: React.ReactNode }) => (
  <figure sx={{ m: 0, my: 4, mx: wide ? [0, 0, -5] : 0 }}>
    {children}
    <figcaption sx={{ mt: 2, fontSize: `14px`, lineHeight: 1.5, color: ed.secondary }}>{caption}</figcaption>
  </figure>
)
const Img = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} sx={{ display: `block`, width: `100%`, border: `1px solid ${ed.hairline}`, borderRadius: `4px` }} />
)
const Pull = ({ children }: Kids) => (
  <blockquote sx={{ m: 0, my: 4, pl: 3, borderLeft: `3px solid ${ed.clay}`, fontFamily: ed.serif, fontSize: `1.35rem`, lineHeight: 1.45, letterSpacing: `-0.01em` }}>{children}</blockquote>
)

const Flow = () => {
  const box = (x: number, y: number, w: number, label: string, human = false) => (
    <g key={label}>
      <rect x={x} y={y} width={w} height={34} rx={4} fill={human ? ed.panel : `#fff`} stroke={human ? ed.clay : ed.ink} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + 21} textAnchor="middle" fontFamily={ed.mono} fontSize={11} fill={ed.ink}>{label}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 860 190" role="img" aria-label="The bug-fix graph: plan gate, build, review, team review, merge gate, merge, verify, with capped loop-backs to build"
      sx={{ width: `100%`, height: `auto`, border: `1px solid ${ed.hairline}`, borderRadius: `4px`, bg: `#fff` }}>
      <defs>
        <marker id="gt-arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill={ed.ink} />
        </marker>
        <marker id="gt-arrow-loop" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill={ed.clay} />
        </marker>
      </defs>
      {box(14, 40, 96, "plan_gate", true)}
      {box(138, 40, 76, "build")}
      {box(242, 40, 80, "review")}
      {box(350, 40, 108, "team_review", true)}
      {box(486, 40, 108, "merge_gate", true)}
      {box(622, 40, 70, "merge")}
      {box(720, 40, 76, "verify")}
      {[[110, 138], [214, 242], [322, 350], [458, 486], [594, 622], [692, 720]].map(([a, b]) => (
        <line key={a} x1={a} y1={57} x2={b - 1} y2={57} stroke={ed.ink} strokeWidth={1.2} markerEnd="url(#gt-arrow)" />
      ))}
      <path d="M404 74 V140 H176 V76" fill="none" stroke={ed.clay} strokeWidth={1.2} strokeDasharray="4 3" markerEnd="url(#gt-arrow-loop)" />
      <path d="M758 74 V164 H160 V76" fill="none" stroke={ed.clay} strokeWidth={1.2} strokeDasharray="4 3" markerEnd="url(#gt-arrow-loop)" />
      <text x={290} y={134} fontFamily={ed.mono} fontSize={10} fill={ed.clay}>changes requested, capped</text>
      <text x={430} y={158} fontFamily={ed.mono} fontSize={10} fill={ed.clay}>verify fails, capped</text>
      <text x={14} y={20} fontFamily={ed.mono} fontSize={10} fill={ed.secondary}>human gates have a clay border; the agent only works inside build and review</text>
    </svg>
  )
}

const GraphtoryPage = (_props: PageProps) => (
  <Layout>
    <Post>
      <Eyebrow>Project · Agents</Eyebrow>
      <h1 sx={{ fontFamily: ed.serif, fontWeight: 400, fontSize: `clamp(2.4rem, 5.5vw, 3.7rem)`, lineHeight: 1.08, letterSpacing: `-0.025em`, m: 0 }}>
        Introducing Graphtory
      </h1>
      <p sx={{ fontFamily: ed.serif, fontSize: `1.35rem`, lineHeight: 1.5, color: ed.secondary, mt: 3, mb: 4 }}>
        Task graphs for coding agents, where the graph decides what runs next, what has to pass, and who has to approve.
      </p>
      <div sx={{ display: `flex`, flexWrap: `wrap`, gap: `0.5rem 2rem`, py: 3, mb: 4, borderTop: `1px solid ${ed.hairline}`, borderBottom: `1px solid ${ed.hairline}`, fontSize: `14px`, color: ed.secondary }}>
        <span>Published <span sx={{ color: ed.ink }}>November 26, 2026</span></span>
        <span>By <span sx={{ color: ed.ink }}>Aditya Karnam</span></span>
        <TextLink href="https://github.com/adityak74/graphtory">GitHub</TextLink>
      </div>

      <P>
        Coding agents are good at writing code and bad at knowing when they are done. In most frameworks, the same
        conversation that does the work also decides what to do next and when to stop. That is convenient, and it means
        the thing being checked is also the thing doing the checking.
      </P>
      <P>
        Graphtory moves that control flow out of the model. A task becomes a graph of steps, validated before it runs.
        The agent works inside the nodes. The graph decides which checks must pass, which steps need a person, and how
        many times a failure may send the work backwards.
      </P>

      <Fig caption="The bug-fix graph that ships with Graphtory. Human gates have a clay border. The agent only works inside the build and review steps, and both loops back to build have a cap.">
        <Flow />
      </Fig>

      <H2>A real run</H2>
      <P>
        The clip below is a run with real Claude on a toy repository. A test is failing because the code computes{` `}
        <Mono>a - b</Mono> where it should compute <Mono>a + b</Mono>. The agent fixes it, three gates are approved by
        hand, the branch merges to <Mono>main</Mono>, and verify passes. It takes about a minute.
      </P>
      <Fig wide caption="A bug-fix run, captured from the terminal. The three approvals are the human gates in the graph above.">
        <Img src="/graphtory/demo-claude.gif" alt="A Graphtory bug-fix run with real Claude: failing test, three gates approved, merged, verify passes" />
      </Fig>

      <H2>How it works</H2>
      <H3>The plan is a contract</H3>
      <P>
        A task is a graph of nodes and edges, written in a small Python DSL and compiled to JSON. Node kinds include{` `}
        <Mono>build</Mono>, <Mono>review</Mono>, <Mono>team_review</Mono>, <Mono>merge_gate</Mono>, <Mono>merge</Mono>{` `}
        and <Mono>verify</Mono>. A person approves the plan at the first gate before anything runs, and because it is
        plain JSON, a plan can be diffed and reviewed like code. You can write one by hand, or have an agent design it
        from a sentence of free text and then read what it produced.
      </P>
      <H3>The validator refuses shortcuts</H3>
      <P>
        Before a plan runs, a pure function checks it. Every path to the end has to pass through build, review, verify
        and both human gates. Every back edge needs a cap between 1 and 5. A deploy needs a deploy gate. Verify nodes
        are locked and carry their signals. A plan that can route around a check does not start, and the planner
        cannot set the commands that verify runs.
      </P>
      <H3>Verification the agent cannot influence</H3>
      <P>
        A verify node runs commands you chose, on the host, in the run&apos;s git worktree, outside the agent&apos;s
        process. A failing signal is rerun twice to flag flaky tests, and a flaky pass still counts as failed. Only a
        clean pass is a pass.
      </P>
      <Pull>Nothing passes because the agent says so.</Pull>
      <H3>Temporal runs it</H3>
      <P>
        Execution is a durable <TextLink href="https://temporal.io">Temporal</TextLink> workflow. After a node
        finishes, the first outgoing edge that matches its status is taken. Every model call is cached by run, node and
        visit, so a retry or a worker restart never pays for the same step twice, and an infrastructure failure ends
        the run instead of following a loop-back.
      </P>
      <H3>Gates are signed, loops end in a person</H3>
      <P>
        Human gates, <Mono>resume</Mono> and <Mono>kill</Mono> can require a per-approver HMAC bound to the run, the
        action and the visit it was issued for, so a captured approval cannot be replayed later. Authentication is
        opt-in. With it off, <Mono>--user</Mono> is honour-system. A loop-back edge counts its uses, and past its cap
        the run pauses and notifies a person instead of failing quietly.
      </P>
      <H3>The agent is sandboxed</H3>
      <P>
        The Claude adapter runs shell commands inside the SDK sandbox, with writes only to the worktree, no network,
        and no readable home directory. File tools are denied outside the worktree, and the agent gets only an
        allowlist of environment variables.
      </P>

      <H2>Watching it work</H2>
      <P>
        A live board shows every run&apos;s graph, node states, loop-backs and outputs. Its one write is approving or
        rejecting a waiting gate, and the workflow still checks that decision.
      </P>
      <Fig wide caption="The board with three runs live, and a finished run in which a review failed and the work looped back to build.">
        <div sx={{ display: `grid`, gridTemplateColumns: [`1fr`, `1fr 1fr`], gap: 3 }}>
          <Img src="/graphtory/dashboard.png" alt="The dashboard: three runs live, each with its own graph" />
          <Img src="/graphtory/ui.png" alt="A finished run with a review failure and a loop back to build" />
        </div>
      </Fig>

      <H2>Same agent, different behavior</H2>
      <P>
        Skills change what an agent does without changing the agent. A skill is a markdown file, and a plan pins each
        one by its sha256, so a skill edited after approval cannot change an approved run. The planner can only pick
        from your library, and review, verify, gates and merge take none. An optional <Mono>SOUL.md</Mono> works the
        same way for behavior that should apply to every agent in the graph.
      </P>
      <P>
        Builds can also leave the machine the agents run on. <Mono>--build-queue</Mono> sends verify to its own task
        queue served by other machines, and <Mono>GRAPHTORY_CI_CMD</Mono> hands each signal to an outside CI such as
        GitHub Actions. The check still runs outside the agent and with your command. Per-node and per-run dollar
        budgets, a cap on concurrent model calls and automatic backoff on rate limits keep a large batch from running
        away.
      </P>

      <H2>Try it</H2>
      <Pre>
{`$ uv tool install graphtory`}
      </Pre>
      <p sx={{ fontSize: `15px`, lineHeight: 1.6, color: ed.secondary, mt: 2, mb: 4 }}>
        That installs the <Mono>graphtory</Mono> command. You also need Python 3.12 or later and the Temporal CLI.
      </p>
      <P>Then start Temporal and a worker, and run a task against a repository:</P>
      <Pre>
{`$ temporal server start-dev
$ graphtory worker &
$ graphtory run --repo PATH --title "fix the failing test" --test-cmd "pytest -q" --agent claude --solo`}
      </Pre>
      <p sx={{ fontSize: `15px`, lineHeight: 1.6, color: ed.secondary, mt: 2, mb: 0 }}>
        <Mono>--agent fake</Mono> walks the whole graph without calling a model. <Mono>graphtory ui</Mono> serves the
        live board at <Mono>127.0.0.1:7802</Mono>, <Mono>graphtory approve RUN_ID plan_gate --user NAME</Mono> approves a
        gate, and <Mono>graphtory approver-add NAME</Mono> turns on signed approvals.
      </p>

      <H2>What this does and does not show</H2>
      <P>
        This is an early release. The evidence so far is four runs with a real model on toy repositories, one run per
        condition, with no baseline and no benchmark, so there is no claim here about success rates or cost. The
        sandbox has only been verified on macOS. The projection is SQLite, so running on several machines needs one
        projection host. The scaling work, including the merge queue, heartbeats, budgets, the build pool and the CI
        hook, is covered by tests but has not been load-tested or run on real remote machines. Most of the individual
        ideas have precedent in recent work, and what is offered here is a tested combination of them.
      </P>
      <P>
        The code is on <TextLink href="https://github.com/adityak74/graphtory">GitHub</TextLink>. Graphtory can run
        agents through <TextLink to="/quecto/">Quecto</TextLink>, and there is more in{` `}
        <TextLink to="/systems/">systems</TextLink>.
      </P>
    </Post>
    <Explore keys={["systems", "quecto", "writing"]} />
  </Layout>
)

export default GraphtoryPage

export const Head: HeadFC = () => (
  <Seo
    title="Introducing Graphtory"
    description="Graphtory puts coding agents inside a validated task graph, so the graph, not the agent, decides what runs next, what must pass and who must approve."
    pathname="/graphtory/"
  />
)
