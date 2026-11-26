import * as React from "react"
import { ChapterShell, Lesson, Figure, Callout, Check } from "../CourseShell"
import { TextLink, Mono, Pre } from "../../world-model/pages-systems-stack-now/editorial"
import PrefillDecode from "../visuals/Ch2_PrefillDecode"
import KVCache from "../visuals/Ch2_KVCache"
import Speculative from "../visuals/Ch2_Speculative"
import SpecSweep from "../visuals/Ch2_SpecSweep"

const Ch2 = () => (
  <ChapterShell n={2}>
    <Lesson n="2.1" title="One request, two phases">
      <p>
        A language model does not read words. Text is first cut into <strong>tokens</strong>, which are short pieces of text, often a word or part of one. The model reads tokens and predicts one new token at a time. To answer a prompt it repeats the prediction, feeding each new token back in, until it stops.
      </p>
      <p>
        Serving this splits into two phases. <strong>Prefill</strong> processes the whole prompt in one go and produces the first new token. <strong>Decode</strong> then produces the rest, one token per <strong>forward pass</strong> (one trip through the whole model). Prefill pushes many tokens through at once, so it is matrix-matrix work. Decode pushes one, so it is matrix-vector work. Chapter 1 showed how different those two are on the same chip.
      </p>
      <Figure caption="Schematic, not to scale. Step through a request and watch how many tokens each pass handles.">
        <PrefillDecode />
      </Figure>
      <p>
        Notice what the figure shows about cost. The first pass is large but happens once. Every pass after it is small, yet each one still has to move the model&apos;s weights through the chip. That is why a long answer takes noticeably longer than a long prompt of the same size, and why most of the tricks in this chapter aim at decode.
      </p>
      <p>
        Two terms you will see in benchmarks follow from this. <strong>Time to first token</strong> (TTFT) is dominated by prefill. <strong>Tokens per second</strong> during generation is dominated by decode.
      </p>
    </Lesson>

    <Lesson n="2.2" title="The KV cache, and why long context slows decode">
      <p>
        Predicting the next token needs information from every earlier token. Recomputing that information from scratch each step would be wasteful, so the model keeps it. For each earlier token, each layer stores two vectors, a <strong>key</strong> and a <strong>value</strong>. This store is the <strong>KV cache</strong>. Prefill fills it, and each decode pass adds one entry per layer and reads all of it.
      </p>
      <p>
        <TextLink to="/mlx-long-context-kv-cache-apple-silicon/">The long-context post</TextLink> opens with the symptom. On a Mac, a local model gives about 55 tokens per second on a short prompt and 10 at 64k tokens of context. The model and machine are the same. The post measured <Mono>mlx-community/Qwen3-8B-4bit</Mono> (36 layers, 8 KV heads, head dimension 128) on an Apple M5 Pro and found decode falls with context in a straight line, because each token must read the whole cache.
      </p>
      <p>
        It first ruled out slow software. The machine&apos;s streaming bandwidth measured 265.6 GB/s, and an attention-shaped read over the cache ran at 260.9 GB/s, which is 98.3% of that ceiling. Decode here is limited by how fast memory can be read.
      </p>
      <p>
        The cache has a second cost: memory. It sits in the same RAM as the weights, and it grows with context and with every concurrent request. That is the capacity limit from Chapter 1, and it is why the batch concurrency post says the wall arrives sooner at longer context. Use the slider to see both effects on the same model.
      </p>
      <Figure caption="Decode speed: measured medians from the long-context post.">
        <KVCache />
      </Figure>
      <Callout>
        Every generated token reads the entire KV cache. Double the context and you double that read. At 64k context the same model generated 10.19 tok/s instead of 55.65 at 512.
      </Callout>
    </Lesson>

    <Lesson n="2.3" title="Shrinking the cache: a trade, not a free win">
      <p>
        If decode is limited by cache bytes, store fewer bytes. <strong>Quantization</strong> means storing numbers with fewer bits. You have already seen it in model names: <Mono>4bit</Mono> means the weights are stored at 4 bits each. The same idea can be applied to the KV cache, at 8 or 4 bits instead of 16.
      </p>
      <p>
        The post turned this into a test. If the cache is the cause, halving its bytes should halve how fast decode degrades. The prediction was 2.0 times, and the measured slope ratio at 8-bit was 1.92 times. At 4-bit it predicted 4 times and measured 3.21 times, and the post says it cannot yet explain that gap. The explanation held up.
      </p>
      <p>
        The catch is prefill. With an 8-bit cache, prefill throughput fell from 1,145.3 to 604.7 tokens per second at 16,384 context, and from 558.5 to 247.6 at 65,536. Time to first token at 64k rose from 117.3 seconds to 264.7 seconds. So the post worked out break-even points, the number of generated tokens needed to repay the slower start. At 16,384 context it never pays off. At 32,768 you need 1,810 tokens, and at 65,536 you need 4,166.
      </p>
      <p>
        The practical rule from the post: for long context and a short answer, such as extracting data from a big document, keep the default fp16 cache. For long context and a long answer, quantizing the cache can win. Below roughly 32k context, quantizing for speed is slower overall.
      </p>
      <p>
        The post also reports a limit. One run at 131,072 context took 1,650 seconds of prefill and decoded at 1.02 tokens per second, and it offers no verified mechanism for why.
      </p>
    </Lesson>

    <Lesson n="2.4" title="Speculative decoding: guess ahead, check in bulk">
      <p>
        Decode is slow because each token needs a full pass through a big model whose weights must be read from memory. <strong>Speculative decoding</strong> uses a small <strong>draft model</strong> to propose several tokens, then has the big <strong>target model</strong> check all of them in a single pass. A check is a batched pass, so it costs about the same as producing one token normally. The target keeps the longest run of proposals it agrees with, corrects the first miss with its own token, and discards the rest.
      </p>
      <p>
        Set how many tokens the draft proposes and how many the target agrees with, then step through a round.
      </p>
      <Figure caption="Schematic of one round, not to scale. The agreement slider is yours to set; in practice it depends on how predictable the text is.">
        <Speculative />
      </Figure>
      <p>
        The payoff depends on how often the draft guesses right. More proposals per round can mean more free tokens, but the draft must run once per proposal, so wrong guesses are pure overhead.
      </p>
      <Callout label="The number to remember">
        In the speculative decoding post, a 0.8B draft model took Qwen3.8-27B from 17.9 to 39.2 tok/s, a 119% speedup, on a code prompt with 4 draft tokens. The same method on open-ended text with 16 draft tokens ran 54% slower than no draft at all.
      </Callout>
    </Lesson>

    <Lesson n="2.5" title="When speculation helps and when it fails">
      <p>
        <TextLink to="/mlx-speculative-decoding-qwen3-8-apple-silicon/">The speculative decoding post</TextLink> swept the number of draft tokens for two model pairs on two prompts: a structured one (four small Python functions) and an open-ended one (a short reflective piece). Select a bar or button to compare.
      </p>
      <Figure caption="Measured medians, Apple M5 Pro, 320 tokens generated, 5 repetitions. Source: the speculative decoding post.">
        <SpecSweep />
      </Figure>
      <ul>
        <li>On code-like text the draft is right more often, so speculation helped. On open-ended text it won only at small settings with the larger pair, and never won with the Qwen3-8B pair.</li>
        <li>Past the peak, more draft tokens made things slower even as acceptance rose. The post explains that draft passes run one after another, so their cost grows with the number of draft tokens whether or not the guesses are accepted.</li>
        <li>The best setting differed by pair: 2 for Qwen3-8B (+58%), 4 for Qwen3.8-27B (+119%). Sweep it on your own models.</li>
        <li>Memory was not free for the Qwen3.8 pair. Peak memory rose from about 16 GB to about 22 to 24 GB. For Qwen3-8B it stayed within about 70 MB.</li>
      </ul>
      <p>
        There was also a compatibility problem. Qwen3.8 mixes ordinary attention layers with linear-attention layers that keep a compressed running state instead of a per-token list. That state cannot be trimmed after a rejected guess, so stock <Mono>mlx_lm</Mono> refused with <Mono>Speculative decoding requires a trimmable prompt cache (got {"{'ArraysCache'}"})</Mono>. Aditya got a number by checking out an existing, unmerged upstream pull request (#1486) and first verifying that greedy output matched the non-speculative output byte for byte. The post also tested a built-in multi-token head on Qwen3.6, which gave +51% at its best and was the only approach that beat baseline on open-ended text at every depth tested.
      </p>
    </Lesson>

    <Lesson n="2.6" title="Choosing a runtime, and a small project">
      <p>
        Speed tricks sit inside a serving runtime. In <TextLink to="/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon/">the serving benchmark post</TextLink>, Aditya ran Ollama, vLLM Metal and SGLang on one M5 Pro with 48 GB, using a Qwen3 0.6B model, across six workloads. Ollama had the lowest latency on 5 of 6, for example 0.759 s on short chat against 1.394 s for SGLang and 3.450 s for vLLM. SGLang won the structured JSON workload at 0.074 s. In the warmed quality check, Ollama passed 1.00 of the rubric, vLLM 0.72 and SGLang 0.47, mostly because the other two leaked visible reasoning text. The post says that reflects the serving path, not the model weights.
      </p>
      <p>
        A second sweep stayed on Ollama and compared Qwen 3.5 sizes. Average latency across the six workloads was 1.643 s for 0.8b and 7.889 s for 9b. The post judged <Mono>qwen3.5:2b</Mono> the practical default on that machine, with a rubric pass rate of 0.93 at 2.348 s, matching the 9b model&apos;s 0.93, which took 5.642 s.
      </p>
      <p>
        <strong>Try it yourself.</strong> The long-context post gives this command to measure decode speed against context length and KV precision on your own Apple Silicon Mac. It appends results as JSONL and should be run plugged in.
      </p>
      <Pre>{`./scripts/benchmarks/exp1_kv_cache_longcontext.py \\
    --contexts 512,1024,2048,4096,8192,16384,32768,65536 \\
    --kv-bits none,8,4 --reps 7`}</Pre>
      <p>
        Before you run it, predict from lesson 2.2 how many times slower decode will be at 65,536 tokens than at 512 for the default cache, then compare with the post&apos;s 10.19 and 55.65 tok/s. No Mac? Do the same with the speculative slider above: pick a draft length and agreement and say how many target passes you saved.
      </p>
    </Lesson>

    <Check
      items={[
        { q: "What is the difference between prefill and decode?", a: "Prefill processes the whole prompt in one pass and produces the first token. Decode produces each later token in its own forward pass, one token at a time." },
        { q: "Why does decode slow down as context grows?", a: "Each generated token must read the whole KV cache, which grows with context. The post found the attention read ran at 98.3% of streaming bandwidth, so memory bandwidth is the limit." },
        { q: "Why did quantizing the KV cache not always help?", a: "It cut decode degradation (1.92 times measured for 8-bit) but roughly halved prefill throughput. At 16,384 context it never paid back, and at 65,536 it needed about 4,166 generated tokens." },
        { q: "Why can speculative decoding make generation slower?", a: "Draft passes run in sequence, so their cost grows with the number of draft tokens even when guesses are rejected. On open-ended text at 16 draft tokens the Qwen3.8 pair ran 54% slower than baseline." },
      ]}
    />
  </ChapterShell>
)

export default Ch2
