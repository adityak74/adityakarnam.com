import * as React from "react"
import { ChapterShell, Lesson, Figure, Callout, Check } from "../CourseShell"
import { TextLink } from "../../world-model/pages-systems-stack-now/editorial"
import StackRecap from "../visuals/Ch7_StackRecap"
import ControlPlane from "../visuals/Ch7_ControlPlane"
import CostExplorer from "../visuals/Ch7_CostExplorer"

const th = { textAlign: "left" as const, padding: "6px 8px", borderBottom: "1px solid #E3E0D8", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase" as const, color: "#5E5D59", fontWeight: 400 }
const td = { padding: "8px", borderBottom: "1px solid #E3E0D8", fontSize: 15 }

const Ch7 = () => (
  <ChapterShell n={7}>
    <Lesson n="7.1" title="From one model to a factory">
      <p>
        Six chapters gave you the parts. A chip does arithmetic and moves memory. An inference runtime turns a model into answers. Training and distillation make a small model better. Retrieval puts the right context in a small window. An agent harness wraps a loop around the model. Evals tell you whether any of it worked.
      </p>
      <p>
        A software factory is what you get when you run those parts together on purpose. Instead of one chat window talking to one model, you have several roles, such as a planner, an implementer and a reviewer. Each role has its own model, its own tools and its own machine. Something has to decide which request goes where, keep the machines warm, and show you what happened. That something is a control plane.
      </p>
      <Figure caption="Click a layer. Each line restates a result from that chapter's sources. Schematic, not to scale.">
        <StackRecap />
      </Figure>
      <p>
        The rest of this chapter looks at one concrete control plane, what its evaluation found, what the hardware costs compared with renting, and the gap in the stack that nobody is filling. All of it comes from the author's own posts.
      </p>
    </Lesson>

    <Lesson n="7.2" title="One config, many machines">
      <p>
        subagent-fleet is an open-source control plane for running Claude Code-style subagents across local Ollama machines. The problem it solves is simple to state. Most coding-agent setups ask for one model endpoint. That is fine for one chat. It breaks down once you have subagents, because a planner does not need the same model as an implementer, and a long session should not silently fail because one machine dropped off the network.
      </p>
      <p>
        It sits above Ollama and LiteLLM and replaces neither. You describe the fleet once in a file called <code>fleet.yaml</code>: which machines exist, which Ollama models live on each, which role uses which model, and how the LiteLLM gateway should route. Running <code>subagent-fleet generate</code> then writes the LiteLLM config, the agent definition files and a local environment file from that one source of truth.
      </p>
      <p>
        The routing in the post is deliberately plain. The planner goes to a small fast model on a lightweight node. The implementer and the reviewer go to a larger coding model on a bigger node. The summarizer goes to a small local model on the controller. Try it below.
      </p>
      <Figure caption="Pick a role and press Step to follow one request. Routes follow the example in the subagent-fleet post. Schematic, not to scale.">
        <ControlPlane />
      </Figure>
      <Callout label="Remember">
        Agent roles are not interchangeable, so their compute should not be either.
      </Callout>
      <p>
        A model route in the file looks like this. The post's example maps a model called <code>heavy-coder</code> to the node <code>m4-mini-64gb</code>, running <code>qwen2.5-coder:32b</code>, exposed to agents under the alias <code>claude-sonnet-local</code>, with a context of 32768 and a timeout of 600.
      </p>
      <p>
        Two operational details matter more than they sound. First, cold starts: the first request to a model can be slow enough to make the whole system feel unreliable, so <code>subagent-fleet warmup</code> preloads the configured models before the session starts. Second, visibility: <code>subagent-fleet ui</code> opens a live dashboard on port 8080 that shows node health, agent routing, the LiteLLM trace stream and warmup progress. Once agents do real work, you need to see which model answered.
      </p>
      <p>
        It is also built for private networks only: a LAN, Tailscale, WireGuard or a private subnet. The post says not to expose Ollama to the public internet and not to expose LiteLLM without authentication.
      </p>
    </Lesson>

    <Lesson n="7.3" title="Does the local fleet hold up?">
      <p>
        After building the control plane, the author asked the obvious question and ran a head-to-head eval. It sends 8 real coding tasks to three systems: the local fleet, Claude Sonnet 5 and GPT-4o-mini, the last two through OpenRouter. A separate LLM judge scores each answer blind from 0 to 10 for correctness, code quality and completeness.
      </p>
      <div style={{ overflowX: "auto", margin: "16px 0" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 420 }}>
          <thead><tr><th style={th}>System</th><th style={th}>Mean score</th><th style={th}>Mean latency</th><th style={th}>Total cost</th></tr></thead>
          <tbody>
            <tr><td style={td}>Local fleet</td><td style={td}>8.38</td><td style={td}>17.47 s</td><td style={td}>$0.0000</td></tr>
            <tr><td style={td}>Sonnet 5</td><td style={td}>8.88</td><td style={td}>5.22 s</td><td style={td}>$0.0077</td></tr>
            <tr><td style={td}>GPT-4o-mini</td><td style={td}>7.50</td><td style={td}>3.47 s</td><td style={td}>$0.0004</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The fleet reached 94% of Sonnet 5's mean quality at zero marginal model cost, and beat GPT-4o-mini on mean score. It passed 7 of 8 prompts against the author's bar of staying within 80% of the best frontier score for that prompt.
      </p>
      <p>
        Read the table the way chapter 6 taught you. The local fleet was also the slowest, at 17.47 seconds against 5.22 for Sonnet 5. And it had one clear miss: on the <code>pytest_unit_tests</code> prompt it scored 4.0 while Sonnet 5 scored 8.0. The author's reading is that local coding models can be strong at implementation and refactoring while still needing work on edge-case test generation. His own summary is that local does not beat frontier here. A well-routed local fleet can get close enough to be useful, private and effectively free per extra run.
      </p>
      <Callout label="Remember">
        94% of Sonnet 5's quality, 1 miss out of 8 prompts, and the slowest of the three. All three facts belong in the same sentence.
      </Callout>
      <p>
        Which model goes on the nodes is its own measured choice. In the author's serving benchmark on one MacBook Pro with an M5 Pro and 48 GB of memory, Ollama was the best overall latency baseline and won 5 of 6 workloads. In the Qwen 3.5 size sweep on Ollama, the 0.8b model averaged 146.03 tokens per second and the 9b model 29.77, but <code>qwen3.5:2b</code> looked like the practical default. The same benchmark also shows how memory limits a shared machine: vLLM Metal crashed with an out-of-memory error once SGLang had reserved a large KV pool, so the runs had to be isolated.
      </p>
    </Lesson>

    <Lesson n="7.4" title="What it costs: local versus cloud">
      <p>
        The author's overkill ML lab is one Mac mini M2 Pro with 64 GB of unified memory, running Ray, MinIO, Streamlit and Docker. The post lists a monthly electricity cost of $1.73 and says the machine draws 20 watts under full ML load. For the equivalent AWS setup it lists a c5.4xlarge for CPU at $196 per month, GPU instances for training at $300, and S3 storage and transfer at $50, for $546 per month in total. It states a break-even point of 5.1 months.
      </p>
      <p>
        Those are the post's numbers and they are one person's estimate for one workload. Use the explorer to test them. Untick the GPU line if you do not train models. Lower the share of the cloud bill you would really rent. Then enter what a machine would cost you and see how the break-even moves.
      </p>
      <Figure caption="Local versus cloud, using only the figures from the overkill-lab post. Hardware price is yours to enter. Schematic, not a quote.">
        <CostExplorer />
      </Figure>
      <p>
        The post's $1.73 counts electricity and treats internet as free because it already existed. The hardware price is not in that monthly figure, so the hardware slider starts at zero for you to fill in. The author also admits he could do most of his ML work on a laptop with 16 GB of RAM and a cloud account. Cheap local compute pays off when you keep the machine busy. It pays off less when it sits idle.
      </p>
    </Lesson>

    <Lesson n="7.5" title="The layer between model and product">
      <p>
        In July 2026 the author wrote about five news stories from one week in Indian tech, including a $1.5 billion valuation for Emergent and up to ₹3,500 crore approved by HCLTech for AI data centers scaling to 50 MW. His argument is that the money is going to two ends of the stack: applications on top and compute underneath. What is still mostly missing is the runtime between a model endpoint and a working product, the harness that decides whether an agent finishes the job.
      </p>
      <p>He lists what that missing middle contains:</p>
      <ul>
        <li>Agent evaluation that measures the harness, not only the model's benchmark score.</li>
        <li>Tool and MCP interoperability, so an agent is not locked to one vendor's format.</li>
        <li>Telemetry: a trace of what the agent tried and called.</li>
        <li>Permission and identity boundaries with an auditable approval model.</li>
        <li>Cost-aware routing, so a planning step does not burn the budget of an implementation step.</li>
        <li>Human approval gates that are real checkpoints.</li>
        <li>Multilingual reliability, in a market with 22 scheduled languages.</li>
        <li>Reproducible benchmarks.</li>
      </ul>
      <p>
        You have now seen most of this list in this course. Cost-aware routing is subagent-fleet. Approval gates and tracing are the harness work in chapter 5, where Quecto's core is described as 1.3 MB. Reproducible benchmarks are chapter 6. The post's claim is that the factory is the combination, and that evaluating which harness wired to which model finishes a class of task inside a budget is more useful than asking which model is best.
      </p>
      <Callout label="Remember">
        A model score tells you about a model. A factory needs evidence about the harness, the routing and the budget around it.
      </Callout>
    </Lesson>

    <Lesson n="7.6" title="Plan your own factory">
      <p>
        You do not need three machines. The post lists examples for a laptop only, a Mac mini, and multi-node clusters. Answer these on paper before you install anything.
      </p>
      <ol>
        <li><strong>Roles.</strong> Which jobs do you hand to an agent: planning, implementing, reviewing, summarizing? Which of them need a strong model and which do not?</li>
        <li><strong>Machines.</strong> What do you already own? Which one has the most memory? Remember that on Apple Silicon, memory is the system.</li>
        <li><strong>Models and runtime.</strong> What is the smallest model that passes your own tasks? Measure it the way the Qwen sweep did, on speed and on a rubric, not on a leaderboard.</li>
        <li><strong>Evidence.</strong> What are your eight tasks? Who or what judges them, and what bar counts as good enough? Write the bar down before you run it.</li>
        <li><strong>Cost.</strong> What would the same work cost in the cloud, and how many months until your hardware breaks even? Be honest about idle time.</li>
        <li><strong>Safety.</strong> Is everything on a private network? Is the gateway behind a key? Which actions need a human to approve?</li>
        <li><strong>Visibility.</strong> When a request goes wrong, how will you know which model answered and why?</li>
      </ol>
      <p>
        When you are ready to try it, subagent-fleet starts with <code>subagent-fleet init</code>, then <code>validate</code>, <code>discover</code>, <code>generate</code> and <code>ui</code>. Running examples are on the <TextLink to="/live/">Live page</TextLink> and the <TextLink to="/systems/">Systems page</TextLink>.
      </p>
    </Lesson>

    <Check
      items={[
        { q: "What does the single fleet.yaml file generate?", a: "The LiteLLM gateway config, the Claude Code-style agent definition files and a local environment file, all from one description of machines, models and roles." },
        { q: "In the head-to-head eval, where did the local fleet lose, and by how much?", a: "It scored 4.0 on the pytest_unit_tests prompt where Sonnet 5 scored 8.0. It was also the slowest system, at 17.47 seconds mean latency against 5.22 for Sonnet 5." },
        { q: "Why is the $1.73 monthly figure not a full cost comparison?", a: "It counts electricity only. The hardware price is not part of it, so the break-even point depends on what the machine cost and on how busy you keep it." },
        { q: "Which roles does the post route to the larger coding model on the bigger node?", a: "The implementer and the reviewer. The planner goes to a small fast model on a lightweight node, and the summarizer to a small local model on the controller." },
      ]}
    />
  </ChapterShell>
)

export default Ch7
