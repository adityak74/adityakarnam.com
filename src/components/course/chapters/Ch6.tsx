import * as React from "react"
import { ChapterShell, Lesson, Figure, Callout, Check } from "../CourseShell"
import { TextLink } from "../../world-model/pages-systems-stack-now/editorial"
import Ch6_FairComparison from "../visuals/Ch6_FairComparison"
import Ch6_BudgetSweep from "../visuals/Ch6_BudgetSweep"
import Ch6_IntervalPlot from "../visuals/Ch6_IntervalPlot"
import Ch6_NullGallery from "../visuals/Ch6_NullGallery"

const Mono = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9em" }}>{children}</code>
)
const Pre = ({ children }: { children: string }) => (
  <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: "#F3F1EB", border: "1px solid #E3E0D8", borderRadius: 4, padding: 12, overflowX: "auto", margin: "16px 0" }}>{children}</pre>
)

const Ch6 = () => (
  <ChapterShell n={6}>
    <Lesson n="6.1" title="A demo is not evidence">
      <p>
        An agent that works once on a task you chose is a demo. An <strong>eval</strong> (short for evaluation) is a repeatable procedure that
        scores a system on a set of tasks, so that you or someone else can run it again and compare. The skill in this chapter is less about
        running benchmarks and more about not fooling yourself with the numbers they produce.
      </p>
      <p>
        Chapter 5 ended with a claim from Aditya's harness guide: the same model can behave very differently in different harnesses. If that is
        true, then "which model is better" and "which harness is better" are different questions, and any comparison has to say which one it is
        asking. That is the idea of an <strong>independent variable</strong>: the one thing you change on purpose while everything else stays fixed.
      </p>
    </Lesson>

    <Lesson n="6.2" title="One variable at a time">
      <p>
        Suppose you want to know whether retrieval beats truncation for an agent's memory. You run strategy A and strategy B and B scores higher.
        Was it the strategy? Only if nothing else changed. If B also ran on a larger model, or with more tokens, or with a different sampling
        temperature, the gap has several possible causes and you cannot tell them apart.
      </p>
      <Figure caption="Interactive: choose what differs between run A and run B. The verdict says what the result could tell you. Run outcomes are not shown because this is about design, not data.">
        <Ch6_FairComparison />
      </Figure>
      <p>
        Try the second preset, then the first. BudgetBench takes the strict route. In{" "}
        <TextLink to="/budgetbench-explained/">BudgetBench Explained</TextLink> the harness fixes the model, task, sampler and decoding settings.
        All runs use temperature 0 and a fixed seed. The one thing swept on purpose is the per-call input-token budget, at 2K, 4K, 8K, 16K and 32K
        tokens. Each strategy is then scored at each budget, so every cell differs from its neighbor in one way.
      </p>
      <Callout>If two things changed, you measured the pair, not either one.</Callout>
    </Lesson>

    <Lesson n="6.3" title="Budget as the variable you sweep">
      <p>
        Why make budget the variable? Because a model's advertised context window is not what you spend per call. The post separates the nominal
        window, the total cost of a task and the <strong>active budget</strong>, meaning how many input tokens one call may see. On a laptop you may
        not want to pay the prefill cost of a full window on every turn, so the budget you choose is a real engineering decision.
      </p>
      <p>
        A <strong>memory strategy</strong> is a function that takes the message history and a budget and returns messages that fit. The strategies
        compared include truncation (keep what fits), summary compression, episodic RAG (retrieval-augmented generation, which fetches only the
        relevant pieces) and lean retrieval. Drag the slider to see the real numbers.
      </p>
      <Figure caption="Interactive: choose a budget tier and read each strategy's score. Numbers are copied from the BudgetBench post; tiers it did not report are marked not run.">
        <Ch6_BudgetSweep />
      </Figure>
      <p>
        On the LongMemEval oracle study (500 questions), the post's headline is that retrieval at 2K scored 0.646 while truncation needed 8K to
        reach 0.650. On the smaller LongBench v2 pilot, nothing rises steadily with budget at all. That contrast is the reason to sweep: a
        single-budget evaluation would have picked one column and reported a conclusion that the neighboring column contradicts.
      </p>
      <p>
        One design choice is worth copying. The runner does not trust the strategy. After the strategy returns a prompt, an enforcer counts the
        tokens independently. If the prompt is still over budget, the harness logs a violation row for that item instead of dropping it. A
        strategy that cannot produce a legal prompt has failed differently from one that produced a legal prompt and got the answer wrong, and a
        benchmark that silently drops the first kind overstates it.
      </p>
    </Lesson>

    <Lesson n="6.4" title="Reading nulls and intervals">
      <p>
        A <strong>null result</strong> is a comparison that shows no clear difference. Nulls are easy to hide and honest papers report them. A
        number alone is not enough. You also need to know how uncertain it is. A <strong>bootstrap interval</strong> is a range built by
        resampling the data; if the range for a difference includes zero, the data does not show a difference.
      </p>
      <Figure caption="Interactive: paired differences against full context at 32K, from the BudgetBench post's local and hosted comparisons. Select a row to read it.">
        <Ch6_IntervalPlot />
      </Figure>
      <p>
        Only one row excludes zero: truncation at 8K on the hosted model, which is clearly worse than full context. The others do not establish a
        loss and, importantly, do not establish equivalence either. The post says this directly: the local 1.5B result is near-null and the
        intervals are far too wide to claim a tie. The paper's honest summary is that nothing in its paired intervals establishes equivalence.
      </p>
      <p>
        The post is just as careful about what it does not claim. It does not rank strategies, because most studies used 30 to 89 items and were
        mostly single runs. It makes no latency claims, since durations are only operational diagnostics: in the hosted run, two settings that send
        identical prompts still differ by about 16 seconds, which the post attributes to provider variance. It treats only one local model as
        publicly reproducible. And the SWE-bench rows use a patch-similarity proxy, not the official resolved rate, so the paper treats them as a
        check of the plumbing, not as a result. A list of limits like this is part of the evidence. It tells the reader which conclusions the data
        will not support.
      </p>
      <p>The post also contains several cases where a tidy number would have misled. Open each one.</p>
      <Figure caption="Interactive: four cases from the BudgetBench post, each with the tempting claim and what the data supports.">
        <Ch6_NullGallery />
      </Figure>
      <p>
        The last case is the most instructive. The team found that their own token counts were off, downgraded their own table, and made the
        runner take an explicit <Mono>--tokenizer</Mono> flag and log the tokenizer ID, a prompt hash and the counted tokens for every call. The
        post's reasoning: a budget benchmark whose counts are off (Qwen's counts averaged 5.5% higher than the tiktoken counts) is measuring a different budget than the one on the label.
      </p>
      <Callout label="Habit to build">
        Report the rows where the strategy failed, the rows where your tooling was wrong, and the comparisons that came out as nulls.
      </Callout>
    </Lesson>

    <Lesson n="6.5" title="Evals for agents, not just prompts">
      <p>
        Agents are harder to score than single answers because the result is a sequence of actions. In{" "}
        <TextLink to="/ai-research/building-quecto-from-minimal-harness-to-evaluable-agent/">Building Quecto</TextLink>, Aditya describes moving
        from demos to a native evaluation harness. Tasks are described in an <Mono>eval.yaml</Mono> file, run in isolated workspaces and graded
        with scripts, telemetry or rubrics, while traces record turns, tokens, latency and tool use. An earlier 10-task TerminalBench-style smoke
        suite passed 10 out of 10 deterministic runs. The post sorts tasks by purpose: regression, capability, compatibility and telemetry.
      </p>
      <p>
        The same lesson holds when the model runs on your own machine, which is the thread through two more of Aditya's projects. locobench is a
        set of local coding-model benchmarks that uses the Harbor harness, the Terminus-2 agent and Ollama. local-code-review is a parallel council of
        local AI reviewers for correctness, security and regression, routed by a deterministic code graph and gated by a verifier, running on a
        laptop. Both are linked below. The common move is a verifier or grader that is separate from the model being tested, so the model does not
        mark its own work.
      </p>
      <p>
        Grading deserves the same care. A grader is the code or model that scores an answer. BudgetBench uses deterministic or versioned graders,
        so a score means the same thing on a later run. Quecto's eval harness composes script graders, telemetry graders and LLM rubric graders. A
        script that checks whether a test passes is cheap and repeatable. A model acting as a judge can cover softer questions, but then the judge
        becomes one more variable you have to hold still. For the LongMemEval study the post used the official evaluator with GPT-4o, which is an
        example of borrowing a published grader instead of inventing one.
      </p>
      <p>
        The BudgetBench post lists what to do before acting on a comparison: pin the envelope first (model, tokenizer, hardware or provider, and the
        budget tiers you will actually ship), gate on compliance before quality, use tiny runs only to check plumbing, use at least 100 items with
        paired item-level estimates for anything you will act on, and measure full cost, including latency and auxiliary model calls.
      </p>
    </Lesson>

    <Lesson n="6.6" title="Try it yourself">
      <p>
        The BudgetBench post gives these commands to run the full five-tier sweep against a local Ollama model, using the served model's
        tokenizer:
      </p>
      <Pre>{`git clone https://github.com/aviskaar/budgetbench
cd budgetbench
pip install -e .

python scripts/run_pilot.py --full-study \\
  --model qwen2.5:1.5b \\
  --tokenizer Qwen/Qwen2.5-1.5B-Instruct \\
  --repeat-cells 3 --shuffle-cells`}</Pre>
      <p>
        Per the post, raw logs land as one JSONL file per task, strategy and budget, and <Mono>scripts/analyze_results.py</Mono> and{" "}
        <Mono>scripts/plot_tradeoffs.py</Mono> turn them into tables and figures. When you have them, find one place where a larger budget scored
        lower than a smaller one and look at the item-level flips, as the post suggests, before calling it noise.
      </p>
      <p>
        Conceptual exercise: write down a comparison you care about, such as two coding agents on your own repository. List every variable that
        could differ. Choose one to change and fix the rest. Then decide, before running anything, how many items you need and what result would
        count as a null.
      </p>
    </Lesson>

    <Check
      items={[
        { q: "What is the independent variable in BudgetBench, and what is held fixed?", a: "The independent variable is the per-call input-token budget (2K, 4K, 8K, 16K and 32K). The model, task, sampler and decoding settings are held fixed, with temperature 0 and a fixed seed." },
        { q: "Why does the BudgetBench runner count tokens itself and log a violation row instead of dropping an over-budget item?", a: "A strategy that cannot produce a compliant prompt has failed differently from one that answered wrongly. Dropping those items silently would overstate the strategy, so they are recorded as violations." },
        { q: "A paired difference is -0.07 with an interval of [-0.17, +0.02]. What can you conclude?", a: "The interval includes zero, so the data does not show a difference. It also does not show that the two are equivalent, because the interval is wide." },
        { q: "What was the tokenizer bug, and how did the paper respond?", a: "The early pilot counted tokens with tiktoken, not the served model's tokenizer. Recounted, many prompts would have been over budget, yet all rows reported a violation rate of 0.00. The paper labeled those rows tokenizer-approximation diagnostics and the runner now takes an explicit --tokenizer flag." },
      ]}
    />
  </ChapterShell>
)

export default Ch6
