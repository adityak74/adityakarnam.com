import * as React from "react"
import { ChapterShell, Lesson, Figure, Callout, Check } from "../CourseShell"
import { TextLink } from "../../world-model/pages-systems-stack-now/editorial"
import Ch5_AgentLoop from "../visuals/Ch5_AgentLoop"
import Ch5_HarnessAnatomy from "../visuals/Ch5_HarnessAnatomy"
import Ch5_ContextBudget from "../visuals/Ch5_ContextBudget"
import Ch5_QuectoLayers from "../visuals/Ch5_QuectoLayers"

const Mono = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9em" }}>{children}</code>
)
const Pre = ({ children }: { children: string }) => (
  <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: "#F3F1EB", border: "1px solid #E3E0D8", borderRadius: 4, padding: 12, overflowX: "auto", margin: "16px 0" }}>{children}</pre>
)

const Ch5 = () => (
  <ChapterShell n={5}>
    <Lesson n="5.1" title="A model is not an agent">
      <p>
        A language model takes text in and gives text out. It cannot read your files, run a command or remember yesterday. If you ask it to fix a
        failing test, it can only write what it thinks the fix looks like.
      </p>
      <p>
        An <strong>agent</strong> is a model placed inside a loop that lets it act. The loop sends the model some context, takes the tool call it
        asks for, runs that call, and feeds the result back. It repeats until the model answers without asking for another tool. Everything
        around the model that makes this work is called the <strong>harness</strong>.
      </p>
      <p>
        Aditya's guide <TextLink to="/ai-research/what-is-an-ai-agent-harness/">What Is an AI Agent Harness?</TextLink> defines it as the software
        layer that surrounds a model and manages its interaction with tools, memory, files, environments, users and evaluators. It makes a strong
        claim: two systems using the same model can behave very differently, because the harness controls what the model sees, what it can do,
        how failures are handled and when execution stops.
      </p>
      <Callout>The model proposes. The harness decides what actually happens.</Callout>
    </Lesson>

    <Lesson n="5.2" title="The loop, one step at a time">
      <p>
        Below is one pass through the loop for a coding task. Press Step and watch two things: the highlighted part of the loop, and the context
        window at the bottom, which is the only thing the model ever sees. When the loop reaches the gate for a file edit, you decide whether it
        is allowed.
      </p>
      <Figure caption="Interactive: the agent loop with a permission gate. Try both Approve and Deny, then Reset.">
        <Ch5_AgentLoop />
      </Figure>
      <p>
        Three things are worth noticing. First, the model never runs anything. It writes a request, and the harness executes it. Second, a denied
        call is not silent: the refusal goes into the context as a tool result, so the model can react. Third, the loop ends when the model
        replies with no tool call. Quecto, covered in 5.5, also enforces a <Mono>max_steps</Mono> limit so a confused model cannot loop forever.
      </p>
      <p>
        A term you will see again: a <strong>tool</strong> is a function the harness exposes to the model, described by a name, a description and
        a schema for its arguments. The Quecto write-up lists its tool shape as <Mono>Tool {"{ name, description, schema, run }"}</Mono>, with built-in tools and
        MCP tools sharing one dispatch surface.
      </p>
      <p>
        What if the model is wrong? The guide describes a verification step that checks the result against success criteria, and a recovery step
        that retries or replans when the check fails. A failed check loops back into reasoning before the harness returns a final result. This is why
        a harness can be better than its model: it does not have to trust the first answer.
      </p>
    </Lesson>

    <Lesson n="5.3" title="Anatomy of a harness">
      <p>
        The same guide splits every harness into eight components. Click each one in the diagram below. The descriptions are the ones from the
        guide, and the notes connect them to Quecto where the sources do.
      </p>
      <Figure caption="Interactive: the eight components of an agent harness. Click a part to read what it does.">
        <Ch5_HarnessAnatomy />
      </Figure>
      <p>
        The guide's main point about this list is that swapping any one component gives you a different agent, even with the same model underneath.
        It also contrasts a minimal harness with a research-grade one. A minimal harness sends a prompt, exposes tools and stops when the model
        responds. A research-grade harness versions the whole execution contract, records every tool request and response, uses explicit
        completion criteria and classifies failure modes. Most demos live in the first column; most production systems need the second.
      </p>
    </Lesson>

    <Lesson n="5.4" title="Context is a budget">
      <p>
        Every turn of the loop adds to the context: the model's message, then the tool result. Files and command output can be long. A model has
        a limit on how much context fits in one call, so the context manager has to decide what stays. That decision is part of the harness, not the
        model.
      </p>
      <Figure caption="Interactive: add turns and watch the window fill. Units are abstract. Try the same turns with Drop oldest and Keep all.">
        <Ch5_ContextBudget />
      </Figure>
      <p>
        Dropping the oldest turns is the simplest policy, and the diagram shows its cost: whatever was in those turns is gone. Better policies
        retrieve or summarize instead, which is what Chapter 4 covered and what Chapter 6 measures. The BudgetBench write-up makes the same point
        in a sentence: budget is part of the agent harness, the same way the tool set and the verification loop are. It also separates three
        numbers that are often blurred: the advertised context window, the total tokens spent across a task, and the active budget, which is how
        many input tokens one call is allowed to see.
      </p>
    </Lesson>

    <Lesson n="5.5" title="Quecto: a minimal harness you can read">
      <p>
        Aditya built <TextLink to="/quecto/">Quecto</TextLink> to study agent behavior as a system. It has two layers. The core is a model
        transport: it sends a prompt to any OpenAI-compatible endpoint, local or cloud, and returns the answer. The agent adds the pieces that
        involve policy. Switch between the two below.
      </p>
      <Figure caption="Interactive: the two Quecto layers and what each contains. Sizes are the size-optimized builds listed on the Quecto page.">
        <Ch5_QuectoLayers />
      </Figure>
      <p>
        The design rule, from <TextLink to="/ai-research/building-quecto-from-minimal-harness-to-evaluable-agent/">Building Quecto</TextLink>, was to
        describe the full harness first and then ask which responsibilities must live in the smallest core. The answer was exactly one: model
        transport. Everything else was assigned a home in the agent crate.
      </p>
      <p>Four of the agent's design choices are worth learning by name.</p>
      <ul>
        <li>
          <strong>Approval gating.</strong> The policy layer returns allow, ask or deny. Edits and commands go through a configurable approval
          preset before anything touches disk, and dangerous commands are denied even under permissive approval.
        </li>
        <li>
          <strong>Sandbox.</strong> A separate layer enforces the repository directory, a command denylist, a timeout, output caps and redaction.
        </li>
        <li>
          <strong>Session persistence.</strong> Messages and file changes are stored in SQLite, so chat, resume, diff and undo are runtime
          features and not terminal scrollback.
        </li>
        <li>
          <strong>Verification as a stop condition.</strong> A configured check, not the model's own confidence, decides whether an edit counts.
        </li>
      </ul>
      <p>
        Two more details show how policy shows up in small places. File edits use exact search and replace blocks. An edit that matches more than
        one place is rejected, and the prior content is recorded, so every change can be replayed and undone instead of being a vague rewrite of a
        file. Project-local flavor files, which can declare commands and loosen approvals, use trust on first use: the project has to be trusted
        before its settings apply. In both cases the model can propose, but a rule outside the model decides.
      </p>
      <p>
        The same post describes subagents, which are agents started by another agent. A background subagent returns an id, a read-only monitor
        reports status and recent activity, and cancellation is explicit. Its stated reason: concurrency is only useful if the supervisor can still
        tell what is happening.
      </p>
      <Callout label="Design principle">
        The post puts it this way: when it fails, the failure should have an address. Each boundary above is a place to look.
      </Callout>
      <p>
        There is also a book. <a href="/books/coding-agent-harness/" style={{ color: "#C2522D" }}>Building a Coding Agent Harness</a>, by Aditya Karnam
        and Arjun Jaggi, is a free 75-page guide that builds a compact Rust core: an OpenAI-compatible transport, a bounded tool-calling loop,
        typed tools, repository path checks and execution policy. The announcement,{" "}
        <TextLink to="/building-a-coding-agent-harness/">I Wrote the Practical Systems Guide I Wanted</TextLink>, is careful to say that the
        teaching crate is a library component, not a finished terminal product, and that later chapters on sessions and MCP are design studies
        mapped to Quecto's source.
      </p>
    </Lesson>

    <Lesson n="5.6" title="Plugins and MCP: how tools get shared">
      <p>
        Hand-writing every tool does not scale, so there are shared formats for adding tools to an agent. <strong>MCP</strong>, the Model Context
        Protocol, is a way for a client to call tools on a server. Aditya's site runs one: the post{" "}
        <TextLink to="/portfolio-mcp-server/">I Turned My Portfolio Into an MCP Server</TextLink> describes a public, read-only endpoint that
        exposes seven tools, such as <Mono>get_profile</Mono>, <Mono>list_projects</Mono> and <Mono>search_work</Mono>. It also records two
        real bugs from hardening it: rate-limit writes that silently did nothing, and a missing <Mono>inputSchema</Mono> field that the MCP spec
        requires.
      </p>
      <p>
        <TextLink to="/agent-plugins-spec-v1/">Agent Plugins v1.0.0</TextLink> is the packaging side. Its portable core is small: a plugin is a
        directory with a required <Mono>plugin.json</Mono>, an optional <Mono>skills/</Mono> directory and an optional <Mono>mcp.json</Mono>. The
        post notes that v1 defines no trust model, permission declarations or sandboxing, and calls that a real gap.
      </p>
    </Lesson>

    <Lesson n="5.7" title="Try it yourself">
      <p>
        The portfolio server post gives one command to connect it to Claude Code. This gives you an agent calling a tool server, so you can watch
        the loop from 5.2 in practice:
      </p>
      <Pre>{"claude mcp add --transport http aditya-portfolio https://adityakarnam.com/mcp"}</Pre>
      <p>
        Then ask a normal question such as "tell me about quecto". The post shows Claude choosing to call <Mono>get_project</Mono> on its own.
        Notice where it asks for permission.
      </p>
      <p>
        Conceptual exercise: pick a task you would give a coding agent. Write down which tools it needs, then label each tool call allow, ask or
        deny, and say why. Finally, decide what check would tell the harness the task is finished. If you cannot name that check, the harness has
        no completion criterion yet.
      </p>
    </Lesson>

    <Check
      items={[
        { q: "In the agent loop, who actually runs a tool call, the model or the harness?", a: "The harness. The model only writes the request. The gate decides whether the call is allowed and the tool then runs it." },
        { q: "What happens to the loop when you deny a tool call?", a: "The denial is added to the context as a tool result, so the model can see it and respond. The action does not run, but the loop continues until the model answers without a tool call." },
        { q: "Why is the context a budget, and what does a simple drop-oldest policy cost?", a: "A call can only hold so much context, so the harness has to choose what stays. Dropping the oldest turns keeps the window within its limit but removes whatever those turns contained." },
        { q: "What did Quecto's design keep in the core, and why?", a: "Only model transport. Policy-heavy pieces such as the tool loop, approval, sandbox and sessions live in the agent layer, so the core stays small and has fewer places to hide behavior." },
      ]}
    />
  </ChapterShell>
)

export default Ch5
