import * as React from "react"
import { ChapterShell, Lesson, Figure, Callout, Check } from "../CourseShell"
import { TextLink, Mono, Pre } from "../../world-model/pages-systems-stack-now/editorial"
import Ch3_LoRA from "../visuals/Ch3_LoRA"
import Ch3_Distill from "../visuals/Ch3_Distill"
import Ch3_Termination from "../visuals/Ch3_Termination"
import Ch3_StopGradient from "../visuals/Ch3_StopGradient"

const Ch3 = () => (
  <ChapterShell n={3}>
    <Lesson n="3.1" title="Weights, training and LoRA">
      <p>
        A language model is a very large pile of numbers called <b>weights</b>. <b>Training</b> means showing the model examples, measuring how wrong its output is, and nudging every weight a little in the direction that reduces the error. The nudge comes from a <b>gradient</b>, which is the slope of the error with respect to each weight. <b>Fine-tuning</b> is the same loop run again on a smaller, narrower set of examples, starting from a model that already works.
      </p>
      <p>
        Updating every weight is expensive. The distillation post explains the cost for a 9B model: the weights alone are about 18 GB in bf16 (a 16-bit number format), and the optimizer called AdamW adds about 72 GB of extra state. That does not fit in 64 GB, so a full fine-tune was never an option on that Mac. <b>LoRA</b> (low-rank adaptation) was.
      </p>
      <p>
        The idea is to freeze a big weight matrix W and learn a correction on the side. The correction is the product of two thin matrices, B and A. The shared inner size of those two matrices is called the <b>rank</b>. A small rank means very few new numbers to train. Use the slider to see the count change. The matrix width d is an illustration, not a measured value.
      </p>
      <Figure caption="LoRA for one matrix. Schematic, not to scale. Parameter counts are exact for the chosen d and r.">
        <Ch3_LoRA />
      </Figure>
      <p>
        Because only B and A train, the optimizer state shrinks with them. When training ends, the product B times A can be added into W, which is called <b>fusing</b>. Two posts in this chapter use LoRA on MLX, Apple's array framework for Apple Silicon: the MEDFIT-LLM study and the Ornith distillation.
      </p>
    </Lesson>

    <Lesson n="3.2" title="Does a bigger model gain more from fine-tuning?">
      <p>
        <TextLink to="/medfit-llm-explained/">MEDFIT-LLM</TextLink> is a paper by Aditya and co-authors that tested exactly this. A synthetic set of 10,000 healthcare question and answer pairs was generated with Phi-4. After removing duplicates, 6,444 unique questions remained, split into 5,155 training, 645 test and 644 validation examples. Four small open models, from 3B to 9B parameters, were each LoRA-fine-tuned on MLX with the same recipe. Each was then compared with its own untuned version on the same 50 held-out questions.
      </p>
      <p>
        The post combines several measures into one weighted improvement score. The smallest model, Llama-3.2-3B, scored 108.2. Mistral-7B scored 83.6, Gemma-2-9B scored 12.0 and Qwen2-7B scored 1.8. One measure is easy to read on its own: how often the answer starts with a direct answer instead of preamble. Llama-3.2-3B went from 6.0% to 36.0%, and Mistral-7B from 10.0% to 30.0%. Gemma-2-9B stayed at 0.0%, and Qwen2-7B stayed at 42.0%.
      </p>
      <p>
        The most concrete fix was a failure mode. Asked a question about real-time feedback during clinical procedures, the untuned Llama-3.2-3B repeated one sentence until it hit the token limit. The fine-tuned version answered normally. The two models that barely moved were already well-behaved instruction-tuned checkpoints, so there was less broken behaviour to fix.
      </p>
      <Callout label="Remember">
        Fine-tuning pays off in proportion to how much is broken, not how big the model is. The paper's own limits: 50 questions, one synthetic dataset, one recipe.
      </Callout>
    </Lesson>

    <Lesson n="3.3" title="Distillation with two teachers">
      <p>
        <b>Distillation</b> means a smaller student model learns from a stronger teacher. In the form used in <TextLink to="/distilling-ornith-9b-two-teacher-mlx/">the Ornith post</TextLink>, the teachers write complete answers, and the student trains on that text. The post notes that a deeper version, matching the teachers' probabilities token by token, is possible because all three models share one 248,044-token vocabulary, but that is listed as a future change.
      </p>
      <p>
        The student was Ornith-1.5-9B. Its 4-bit build (called oQ4, 4.9 GB) is the one that fits on a laptop, and it scored 78.0 on MMLU, against 82.6 for the 17 GB bf16 original. The post calls that a quantization problem, not a knowledge problem. <b>Quantization</b> stores each weight in fewer bits so the model is smaller. So the plan was to improve the full-precision student first and quantize afterward.
      </p>
      <p>
        There were two teachers because they are good at different things. Qwen3.6-35B-A3B-4bit scored 6.3 points higher on MMLU and 2.8 higher on TruthfulQA, so it taught knowledge and truthfulness. Ornith-1.5-35B-A3B-4bit matched it exactly on HumanEval (153 of 164 each) while running the benchmark suite 4.6 times faster, 2.6 hours against 6.1. So it taught code and did most of the generation.
      </p>
      <Figure caption="The six stages of the pipeline. Step through them, then flip the training target between intact reasoning and answer only.">
        <Ch3_Distill />
      </Figure>
      <p>
        Verification is where quality comes from. A teacher answer is kept only if it is verifiably correct. Of 3,974 traces, 1,672 survived. Training used rank 32 on the top 16 of 32 layers, 1,024-token sequences, 3,200 steps and 1.76M tokens on one M4 Pro.
      </p>
    </Lesson>

    <Lesson n="3.4" title="What the distilled model actually fixed">
      <p>
        The first comparison looked like a failure: 84.1% HumanEval for the distilled 4-bit model against 88.4% for the bf16 base. The post then spotted the error. A 4.72-bit model was being compared with a bf16 one, so the cost of quantization was mixed into the distillation result. Compared against the stock 4-bit model, which is the fair baseline, the result flipped.
      </p>
      <p>
        On the author's own harness, the shipped 4-bit model reached an answer on 125 of 164 HumanEval problems and was cut off mid-reasoning on 39. The distilled model reached an answer on 145 and was cut off on 19. Of the 28 problems the distilled model gained, 22 were ones the shipped model had run out of budget on. The working hypothesis in the post is that quantization hurts a model's ability to <i>stop</i> reasoning more than its ability to reason.
      </p>
      <Figure caption="HumanEval, 164 problems, the author's own harness. Toggle the model to see how many problems were cut off.">
        <Ch3_Termination />
      </Figure>
      <p>
        The post also reports two harnesses, and says to trust the smaller number. On the serving harness, which does not penalise truncation the same way, the distilled model gained 5.5 points on MMLU and 3.0 on HumanEval over the stock 4-bit build. Its published scores are 83.5 MMLU, 79.0 TruthfulQA and 90.8 HumanEval, at 4.9 GB against 8.9 GB for the 8-bit build, which scored 83.1 and 88.4 on MMLU and HumanEval. TruthfulQA went down by 1.7 points on both harnesses. The post blames the training data, which came from datasets that reward confident recall.
      </p>
      <Callout label="Report truncations">
        For a reasoning model, a low score and a small token budget look the same. The post's rule: always show the truncation count next to the accuracy.
      </Callout>
    </Lesson>

    <Lesson n="3.5" title="Reading a bug fix in an open-source trainer">
      <p>
        <TextLink to="/mlx-lm-lora-moe-stop-gradient-fix/">mlx-lm PR #1795</TextLink> is a small fix with a clear mechanism. A <b>mixture-of-experts</b> (MoE) model has many expert sub-networks. For each token, a small learned <b>router</b> scores the experts, picks the top k, and only those run. The scores are floating-point numbers and can be trained. The choice of which experts won is a list of integer indices, and an integer index cannot be nudged by a gradient.
      </p>
      <p>
        Running <Mono>mlx_lm.lora --train</Mono> on <Mono>granitemoe</Mono>, <Mono>granitemoehybrid</Mono> and <Mono>lfm2_moe</Mono> crashed on the first backward pass. Forward inference was fine, because only the backward pass asks for gradients. The fix was to wrap the indices in <Mono>mx.stop_gradient</Mono>, a marker meaning "do not differentiate through this". Most sibling MoE models in the repository already did this.
      </p>
      <Figure caption="Turn the barrier on and off, then step to the backward pass. Schematic of the routing path as the post describes it.">
        <Ch3_StopGradient />
      </Figure>
      <p>
        The PR added 88 lines and removed 6, almost all of it tests. Each model got a regression test using a tiny config with 16 hidden size and 4 experts, one forward and one backward pass. All three failed 3 of 3 before the fix and passed 3 of 3 after. A related post, <TextLink to="/ornith-9b-local-model-quecto-code-review-claude-sonnet-5/">Ornith-9B reviewing Quecto code</TextLink>, shows the same habit applied to a pull request written by a local 9B model: of its three claimed optimizations, one was correct, one was mislabeled, and one did not do what it said.
      </p>
      <Callout label="Remember">
        The forward pass and the backward pass can disagree. A model that runs for inference can still fail to train.
      </Callout>
    </Lesson>

    <Lesson n="3.6" title="Try it yourself">
      <p>
        The distilled model from the Ornith post can be run with Ollama:
      </p>
      <Pre>{`ollama run adityakarnam/Ornith-1.5-9B-MLX-distil-oQ4`}</Pre>
      <p>
        Or straight from MLX, as quoted in the post:
      </p>
      <Pre>{`pip install mlx-lm
mlx_lm.generate --model adityak74/Ornith-1.5-9B-MLX-distil-oQ4 \\
  --prompt "Explain the difference between a process and a thread." \\
  --max-tokens 1024`}</Pre>
      <p>
        The post says it needs about 8 GB free on an Apple Silicon Mac. It opens a thinking block, so the post advises 4096 max tokens for coding problems and 2048 or more for everything else. Try the same prompt with a very small <Mono>--max-tokens</Mono>, then a larger one, and see for yourself what a truncated answer looks like. That is the failure mode from lesson 3.4.
      </p>
      <p>
        Conceptual exercise: pick a task where a small model fails in an obvious way, like the repeating loop in lesson 3.2. Write down what a teacher's verified answer would look like, and how you would check it automatically.
      </p>
    </Lesson>

    <Check
      items={[
        { q: "With LoRA, which weights are trained and which are frozen?", a: "The big matrix W is frozen. Only the two thin matrices B and A are trained, and their count is 2 × d × r for a matrix of width d and rank r." },
        { q: "In MEDFIT-LLM, did the largest model gain the most from fine-tuning?", a: "No. The smallest, Llama-3.2-3B, scored 108.2. Gemma-2-9B scored 12.0 and Qwen2-7B scored 1.8. The post explains this as headroom: those two had less broken behaviour to fix." },
        { q: "Why did the Ornith post keep the teacher's reasoning in the training targets even though it cost half the data?", a: "Answer-only targets would teach the student to emit the closing think tag immediately and stop reasoning, which is the behaviour it is served with." },
        { q: "Why did the MoE LoRA training crash only on the backward pass?", a: "The backward pass asks for gradients, including with respect to the integer expert indices, and MLX refuses. Wrapping the indices in mx.stop_gradient fixes it. Forward inference never asks for gradients." },
      ]}
    />
  </ChapterShell>
)

export default Ch3
