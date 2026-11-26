import * as React from "react"
import { ChapterShell, Lesson, Figure, Callout, Check } from "../CourseShell"
import { TextLink, Mono, Pre } from "../../world-model/pages-systems-stack-now/editorial"
import Roofline from "../visuals/Ch1_Roofline"
import GemvGemm from "../visuals/Ch1_GemvGemm"
import MemoryWall from "../visuals/Ch1_MemoryWall"
import Reduction from "../visuals/Ch1_Reduction"

const Ch1 = () => (
  <ChapterShell n={1}>
    <Lesson n="1.1" title="Two ways a chip can be slow">
      <p>
        A language model, at the lowest level, is a long list of multiplications and additions on big grids of numbers. A GPU is a chip built to do very many of those at once. But the chip does not work on numbers where they are stored. Every number has to travel from memory to the arithmetic units first.
      </p>
      <p>
        That gives two limits on how fast a piece of work can run. The <strong>compute limit</strong> is how many operations per second the chip can perform. The <strong>memory limit</strong> is how many bytes per second it can read. Which one you hit depends on how much arithmetic you do for each byte you fetch. A <strong>roofline</strong> chart draws both limits on one plot: a sloped line where memory is the bottleneck, then a flat ceiling where compute is. Work on the slope is <strong>memory-bound</strong>. Work on the ceiling is <strong>compute-bound</strong>.
      </p>
      <p>
        Drag the slider below. It stands for how many tokens share each read of the model weights. With one token, every weight is read from memory and used once, so the dot sits low on the slope.
      </p>
      <p>
        One more piece of vocabulary. On Apple Silicon the CPU and GPU share a single pool of <strong>unified memory</strong>, instead of the GPU having its own separate memory. The batch concurrency post points out that this avoids copying data between chips, but it also means the model, the cache and the operating system all compete for the same RAM. You will see why that matters in lesson 1.3.
      </p>
      <Figure caption="Schematic roofline, not to scale. The ridge is drawn near 80x above the one-token level to match the gap measured in the next lesson.">
        <Roofline />
      </Figure>
      <Callout>
        Speed is set by whichever is smaller: bytes you can read, or operations you can perform. Reading more weights per token never helps if the chip is already waiting on memory.
      </Callout>
    </Lesson>

    <Lesson n="1.2" title="Matrix-vector versus matrix-matrix">
      <p>
        Generating text happens in two phases that we will meet properly in the next chapter. For now, all you need is the shape of the multiply. When a model produces one new token, each weight matrix is multiplied by a single vector. This is a <strong>GEMV</strong> (general matrix-vector multiply). When a model reads a whole prompt, or when several requests are combined, the same weight matrix is multiplied by a stack of vectors. This is a <strong>GEMM</strong> (general matrix-matrix multiply).
      </p>
      <p>
        The arithmetic explains the difference. In <TextLink to="/mlx-gemv-gemm-roofline-apple-silicon/">the roofline post</TextLink>, Aditya notes that a GEMV on an N by N matrix does roughly 2N² operations while reading the whole weight matrix once, so its operations per byte are low and about the same at every size. A GEMM does roughly 2N³ operations over the same order of bytes, so its operations per byte grow with N.
      </p>
      <p>
        He then measured it on an Apple M5 Pro with 52 GB of unified memory, using <Mono>mlx</Mono> 0.32.0, float16, medians of 9 repetitions. GEMM throughput stayed between 24 and 31 TFLOP/s across sizes from 1,024 to 12,288. GEMV stayed between 277 and 488 GFLOP/s. The ratio was roughly 80 to 85 times at every size tested. Choose a size to see the actual numbers.
      </p>
      <Figure caption="Measured, float16, GFLOP/s, Apple M5 Pro. Source: the roofline post.">
        <GemvGemm />
      </Figure>
      <p>
        The post reads the flat GEMM line as a sign that it is compute-bound from the smallest size tested, and the wandering GEMV numbers as a sign that it is memory-bound. It also lists what it did not establish: it never found the size where GEMM stops being compute-bound, and it did not compare against the chip&apos;s published peak. It is one chip and one framework.
      </p>
    </Lesson>

    <Lesson n="1.3" title="Why batching helps, and where it stops">
      <p>
        Since a GEMM is so much better than a GEMV, you can ask for GEMMs. <strong>Batching</strong> means serving several requests together so that their next tokens form one matrix instead of several separate vectors. The roofline post puts it this way: that is a change in the shape of the operation, not a scheduling trick.
      </p>
      <p>
        But each request brings its own memory with it (the KV cache, covered in Chapter 2). In <TextLink to="/mlx-batch-concurrency-memory-wall-apple-silicon/">the batch concurrency post</TextLink>, Aditya ran <Mono>mlx-community/Qwen3-8B-4bit</Mono> on an M5 Pro with 48 GB, generating 64 tokens per request at 4,096 tokens of context. Total throughput rose from 50.2 tokens per second at batch 1 to a peak of 138.9 at batch 8. Then it fell: 97.7 at batch 16, and 40.0 at batch 32.
      </p>
      <Figure caption="Measured, 4,096-token context. Source: the batch concurrency post. Two of these cells (batch 16 here, and a 16,384 context cell not shown) were flagged noisy in the raw data.">
        <MemoryWall />
      </Figure>
      <p>
        At batch 32, peak memory was 50.3 GB, 97.6% of the machine&apos;s 48 GB. The run did not stop with an error. It slowed until Aditya killed a later cell after more than 50 minutes, with 18.8 GB of swap in use. The post&apos;s reading is that macOS was paging memory to disk, so a memory problem turned into a latency problem.
      </p>
      <p>
        The post also looked at other context lengths. At 512 tokens the sweep never collapsed and was still rising at batch 32, at 387.1 tok/s. At 16,384 tokens, batch 8 already used 30.5 GB (59.2% of RAM) and throughput had flattened against batch 4. A longer context means a bigger cache per request, so the wall arrives at a smaller batch. Its advice is to think in terms of the share of RAM that batch size times context length will use, not the batch size alone.
      </p>
      <Callout label="The limit to remember">
        Batching trades one limit for another. It beats the memory-bandwidth limit on compute, then runs into the capacity limit of RAM. In this experiment, throughput peaked at batch 8, when memory use was 31.1% of RAM.
      </Callout>
    </Lesson>

    <Lesson n="1.4" title="Why identical inputs can give different outputs">
      <p>
        Computers store most numbers in <strong>floating point</strong>, which keeps only a fixed number of significant digits. After each addition the result is rounded. Rounding means that adding a list of numbers in a different order can give a slightly different total, even though the maths says the order should not matter.
      </p>
      <p>
        Here is a real demonstration in 32-bit floats. The true sum of these six numbers is 4.
      </p>
      <Figure caption="Computed live in your browser with 32-bit rounding after every addition.">
        <Reduction />
      </Figure>
      <p>
        This matters for GPUs because the best strategy for splitting up a multiply depends on the matrix shape. In <TextLink to="/mlx-non-determinism-apple-silicon">the non-determinism post</TextLink>, Aditya describes Metal kernels that pick different tile layouts and summation orders for different sizes. So computing one row alone, and computing that row as part of a big batch, can sum in different orders. On an M2 MacBook Pro, that test gave a maximum difference of about 1449. Errors grew with matrix size, from about 145 at 512 by 512 to about 1771 at 4096 by 4096. NumPy on the CPU gave a difference of 0.00.
      </p>
      <p>
        The post also tested data types. float32 gave consistent small errors, bfloat16 was inconsistent, and float16 was unstable with large values and often produced NaN. Chaining 100 matrix multiplications reached complete numerical breakdown (NaN) by operation 80. The post credits Thinking Machines research on batch invariance for the framing.
      </p>
      <Callout>
        The same prompt can give different tokens when the batch it sits in changes, because the kernel changes its summation order. This is rounding, not randomness.
      </Callout>
    </Lesson>

    <Lesson n="1.5" title="When the hardware says no">
      <p>
        The same limits show up as error messages. <TextLink to="/mlx-errors-apple-silicon-troubleshooting/">The MLX errors reference</TextLink> separates two that look alike. <Mono>[METAL] Command buffer execution failed: Insufficient Memory.</Mono> is Metal&apos;s own text relayed by MLX. Aditya hit it when vllm-metal ran after SGLang had already reserved a large KV pool on the same 48 GB machine. The fix on unified memory is nearly always to stop competing with yourself, and run one inference runtime at a time.
      </p>
      <p>
        <Mono>[metal::malloc] Attempting to allocate N bytes which is greater than the maximum allowed buffer size</Mono> is different. One single tensor is larger than Metal&apos;s per-buffer ceiling, and you can hit it with plenty of memory free. The post&apos;s advice is to reduce the batch or sequence length, or split the operation.
      </p>
      <p>
        Its closing tip is a good habit: read the prefix. A <Mono>[METAL]</Mono> or <Mono>[metal::...]</Mono> message means the platform said no. A plain Python <Mono>ValueError</Mono> from <Mono>mlx_lm</Mono> means the library has not been taught your model yet.
      </p>
    </Lesson>

    <Lesson n="1.6" title="Try it yourself">
      <p>
        The batch-invariance test from the non-determinism post is short enough to run as is. It needs the <Mono>mlx</Mono> package on an Apple Silicon Mac.
      </p>
      <Pre>{`import mlx.core as mx

# Test batch invariance
B, D = 2048, 4096
a = mx.linspace(-1000, 1000, B * D).reshape(B, D)
b = mx.linspace(-1000, 1000, D * D).reshape(D, D)

# Process one row
out1 = mx.matmul(a[:1], b)

# Process all rows, take first
out2 = mx.matmul(a, b)[:1]

print(f"Difference: {mx.abs(out1 - out2).max().item()}")`}</Pre>
      <p>
        Your number will differ from the 1449 reported on an M2, and that is expected: it depends on your chip and kernels. Try changing the matrix sizes and see whether the difference grows. If you have the benchmark repository from the roofline post, the GEMV and GEMM sweep is part of this script:
      </p>
      <Pre>{`./scripts/benchmarks/exp2_bandwidth_roofline.py`}</Pre>
      <p>
        No Mac handy? Use the roofline slider above and find, by eye, the number of tokens at which the dot stops moving.
      </p>
    </Lesson>

    <Check
      items={[
        { q: "What makes a piece of work memory-bound rather than compute-bound?", a: "It does little arithmetic for each byte it reads, so the chip waits on memory. A GEMV does about the same low number of operations per byte at every size." },
        { q: "In the roofline post, how much faster was GEMM than GEMV, and did the gap shrink as matrices got bigger?", a: "Roughly 80 to 85 times, and it did not shrink. It was already there at N = 1,024 and held through 12,288." },
        { q: "At 4,096 context, where did throughput peak as batch size grew, and what happened to memory at batch 32?", a: "It peaked at batch 8 (138.9 tok/s). At batch 32 throughput fell to 40.0 tok/s while peak memory reached 50.3 GB, 97.6% of 48 GB, and the system swapped." },
        { q: "Why can the same input give different outputs on the same machine?", a: "Kernels choose different tiling and summation orders for different batch shapes. Floating-point addition rounds after each step, so a different order can give a slightly different result." },
      ]}
    />
  </ChapterShell>
)

export default Ch1
