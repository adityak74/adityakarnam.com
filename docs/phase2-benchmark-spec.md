# Phase 2 Benchmark Spec — MLX / Apple Silicon Long-Context and Concurrency

**Status:** ready to run. Scripts live in `scripts/benchmarks/`.
**Who runs it:** Aditya, on the M5 Pro (48 GB).
**What comes back:** the entire `scripts/benchmarks/results/` directory.

---

## 1. Why these four experiments

Google Search Console shows the site already ranks for questions it does not fully
answer. Every competing page on these queries is either vendor documentation or a
reblogged spec sheet. The one thing nobody has published is **measured, first-hand data
that isolates a cause**. That is the entire wedge.

| Query | Impr. | Pos. | Experiment that answers it |
|---|---:|---:|---|
| `mlx long context performance drop apple silicon kv cache` | 36 | 13.5 | **Exp 1** (primary) + Exp 2 (mechanism) |
| `mlx apple silicon optimization` | 17 | 9.3 | **Exp 2** |
| `mlx batch inference` | 2 | 7 | **Exp 3** |
| `mlx vs ollama performance apple silicon 2025` | 2 | 9 | **Exp 4** |
| `mlx concurrency` | 1 | 6 | **Exp 3** |

### What is deliberately NOT repeated

The 2026-07-08 post (`benchmarking_local_llms_ollama_vllm_sglang_apple_silicon`) already
covered runtime-vs-runtime wall latency on six fixed workloads at one context length,
plus the Qwen size sweep and the LLM-judge quality pass. None of that is repeated here.
This phase holds the workload constant and sweeps **context length, KV precision, and
batch size** — the variables the search demand is actually about, and the variables the
earlier post did not touch. Exp 4 is the only overlap in spirit, and it differs by
sweeping context length and separating prefill from decode rather than reporting a
per-workload leaderboard.

---

## 2. The experiments

### Exp 1 — KV cache and the long-context decode collapse *(the flagship)*

`scripts/benchmarks/exp1_kv_cache_longcontext.py`

**Hypothesis (H1).** Decode slowdown at long context is a memory-**bandwidth** effect
(streaming the KV cache through the attention kernel every single token), not a memory-
**capacity** effect (paging), and not kernel overhead. Formally:

```
t_decode(L) = t0 + (kv_bytes_per_token × L) / B_eff
```

**How the cause is isolated.** Observing that tok/s falls is worthless — everyone has
that. The causal move is the **KV precision ablation**: run the identical sweep with an
fp16 cache, an 8-bit cache, and a 4-bit cache. Quantising the cache changes *only* the
number of bytes the attention kernel must read per token. Nothing else about the model,
the weights, the prompt, or the decode loop changes. So:

- If the degradation is KV-read bound, the fitted **slope must fall ~2× at 8-bit and ~4×
  at 4-bit**, while the **intercept `t0` stays flat**.
- If the slope does not move, the cause is not KV reads, and H1 is dead.

That single test is what makes this publishable rather than anecdotal. The script
computes it and prints `SUPPORTS H1` / `DOES NOT SUPPORT H1` per arm.

| | |
|---|---|
| **Independent vars** | `context_len` 512 → 131072 (geometric, 9 points); `kv_bits` ∈ {fp16, 8, 4}; optionally a second model size |
| **Dependent vars** | `decode_tok_s`, `ms_per_decode_token`, `prefill_tok_s`, `ttft_s`, `peak_mlx_memory_bytes`, `swap_delta_mb`, `compressed_mb` |
| **Pinned controls** | 128 generated tokens at *every* context length; greedy argmax; synthetic token ids so the realised context is exactly the nominal one; model warmed; one MLX process only |
| **Reps** | 7 timed + 1 discarded warmup per cell |
| **Falsified if** | slope is flat across `kv_bits`; or degradation is super-linear from the first cell with no memory-pressure signal; or `swap_delta_mb` rises from cell 1; or `t0` drifts with `kv_bits` (confounded ablation) |

**Secondary finding it will produce for free:** the *knee*. Cells where peak memory
crosses ~85 % of RAM, or swap grows >1 GB over the startup baseline, are flagged
`memory_pressure_flag` and excluded from the fit. The context length at which that flag
first trips is "the point where your Mac stops being fast and starts being sad" — a
concrete, quotable number per machine.

---

### Exp 2 — Unified memory bandwidth and the roofline

`scripts/benchmarks/exp2_bandwidth_roofline.py`

**Hypothesis (H2).** Decode is bandwidth bound, and the ceiling that matters is the
*MLX-achieved* streaming bandwidth, not the spec-sheet peak. Four arms: a pure streaming
kernel (the ceiling `B_stream`), GEMV (the shape decode runs), GEMM (the shape prefill
and batching run), and a synthetic single-token attention over a KV cache of length *L*
— which is Exp 1's mechanism reproduced with the model, tokenizer, sampler and Python
loop all removed.

**Why it must run first.** It supplies the denominator that makes Exp 1's causal claim
checkable. Without an independently measured `B_stream`, Exp 1's "implied effective
bandwidth" is a number with nothing to compare against. It is also cheap, so it doubles
as the machine's pre-flight health check.

**Falsified if** attention-over-KV achieves far below `B_stream` (say <25 %) — in which
case the honest story flips from "physics" to "MLX's attention kernel leaves bandwidth on
the table", which is a *better* post, just a different one.

**Caveat baked into the script:** the timing loop repeats each op to amortise command-
buffer launch overhead, which keeps small operands cache-resident and inflates their
apparent bandwidth. Any cell under `--ceiling-min-mb` (default 256 MB) is marked
`cache_resident_suspect` and excluded from every ceiling and efficiency figure. **Do not
chart those cells as bandwidth.**

---

### Exp 3 — Batch inference and concurrency

`scripts/benchmarks/exp3_batch_concurrency.py`

**Hypothesis (H3).** Because single-stream decode is bandwidth bound, weight bytes are
amortisable across concurrent sequences — batch size *B* reads the same weights once and
does *B×* the work. So aggregate throughput should scale near-linearly to a knee while
per-stream throughput stays roughly flat.

**The headline prediction (H3c), and the thing nobody has published:** the knee moves
**earlier as context grows**, because KV bytes scale with `B × L` while weight bytes are
constant. Long context does not merely slow you down — it destroys your batching
headroom. That is a distinct, quotable, first-hand claim.

The Ollama arm (H3d) tests whether `OLLAMA_NUM_PARALLEL` captures any of the same
headroom, or whether its aggregate gain is pure scheduling.

| | |
|---|---|
| **Independent vars** | `batch` ∈ {1,2,4,8,16,32}; `context_len` ∈ {512, 16384}; `engine` ∈ {mlx, ollama} |
| **Dependent vars** | `aggregate_tok_s`, `per_stream_tok_s`, `ttft_p50/p95`, peak memory, derived `scaling_efficiency` |
| **Pinned controls** | identical generation length and identical prompt length across all streams (no stragglers); greedy decode; one engine resident at a time |
| **Reps** | 5 timed + 1 warmup |
| **Falsified if** | aggregate throughput is flat in *B*; or per-stream falls as 1/*B* (pure serialisation); or Ollama matches MLX scaling |

> **Ollama arm prerequisite.** The *server* must have been started with parallelism
> enabled or it silently serialises and the arm is meaningless:
> `OLLAMA_NUM_PARALLEL=32 ollama serve`. The script warns if it cannot see the variable.

---

### Exp 4 — MLX vs Ollama across context length

`scripts/benchmarks/exp4_mlx_vs_ollama_longcontext.py`

**Hypothesis (H4).** Both runtimes obey the same affine decode model but with different
constants: Ollama's tighter C++ loop should win on the intercept `t0` (short context),
whichever has the better KV layout and attention kernel wins on the slope (long context),
and therefore **the ranking can invert at a crossover point**. The deliverable is a
crossover chart and a crossover length in tokens — not a leaderboard.

The script fits both lines and solves for the intersection directly.

**Two traps it handles explicitly:**
- Ollama's default `num_ctx` silently truncates long prompts, so runs that do not set it
  are measuring a shorter context than they think. The script sets it per cell and
  records it.
- `think: false` is required or Ollama returns empty visible content (established in the
  2026-07-08 post), which would make the timing incomparable.

**Model parity caveat — state this in the post.** MLX and Ollama do not ship byte-
identical quantised artifacts. Pick the closest pair (same base model, same parameter
count, comparable bits-per-weight). Absolute tok/s carries a quantisation-mismatch
caveat; **the fitted slopes are the robust part**, which is another reason to frame the
post around slopes and the crossover rather than around who is "faster".

**Falsified if** one engine wins at every context length — still publishable, just as
"X wins everywhere on this machine, and here is the mechanism".

---

## 3. Controlling for MLX non-determinism

The `mlx_non_determinism` post established that MLX results vary run to run. Timing
variance is a related but separate problem: Apple Silicon latency distributions are
**right-skewed**, because an OS background task or a thermal excursion only ever *adds*
time. The methodology therefore:

1. **Reports the median, never the mean.** The mean chases outliers; the median does not.
2. **Reports dispersion as IQR** (p75 − p25) alongside every median. Charts get median
   lines with IQR bands.
3. **Discards a warmup rep** in every cell, so first-touch allocation and kernel
   compilation never land in the reported statistic.
4. **Flags noisy cells automatically.** Robust CV = IQR / median. Any cell above **0.10**
   prints `<<< NOISY, re-run this cell` and sets `noisy_cell: true` in the output.
   **Do not chart a noisy cell — re-run it.**
5. **Fits on per-cell medians, never on raw reps**, so one bad rep cannot tilt a slope.
6. Repetition counts: 7 (Exp 1), 9 (Exp 2, it is cheap), 5 (Exp 3, Exp 4).

If a cell stays noisy after a re-run, that itself is a finding worth a paragraph —
report it rather than hiding it.

---

## 4. Pre-flight checklist

Apple Silicon results are materially changed by power and thermal state. Do all of this
before starting, and do not touch the machine mid-run.

- [ ] **Plug in AC power.** On battery the SoC is power-limited. Every script prints a
      warning and records `on_ac_power` in metadata.
- [ ] **Disable Low Power Mode** (System Settings → Battery). On macOS 15+ set Energy
      Mode to **High Power** or Automatic, not Low Power. Captured as `power_mode`.
- [ ] **Quit everything else.** Browsers, Docker, Slack, Xcode, other Python kernels.
      Anything holding unified memory shifts the memory-pressure knee.
- [ ] **Confirm no other MLX/Ollama/vLLM/SGLang server is resident.** The 2026-07-08 post
      already showed co-resident runtimes fight over unified memory and produce invalid
      numbers. `ollama ps` should be empty before the MLX experiments.
- [ ] **Let the machine cool** to idle. Check `pmset -g therm` shows no CPU speed limit;
      the scripts warn if it is already throttled.
- [ ] **Disable Time Machine / Spotlight indexing** for the run window if convenient.
- [ ] **Prevent sleep:** run under `caffeinate -dimsu ./scripts/benchmarks/run_all.sh`.
- [ ] **Note the ambient conditions** (lid open/closed, desk vs lap, room temp). Long-run
      thermals differ enough to matter; one line in the notes is enough.
- [ ] **Record the baseline swap** — the scripts do this automatically and judge memory
      pressure on *growth above* it, since macOS normally carries GBs of swap from
      unrelated apps.

---

## 5. Run order and runtimes

Run in this order. Exp 2 first because it is cheap, validates machine state, and produces
the reference number Exp 1 is checked against.

```bash
# 0. verify everything in ~5 seconds, no MLX and no model needed
./scripts/benchmarks/run_all.sh --dry-run

# 1. real but tiny, ~10 minutes total — proves the model path works
./scripts/benchmarks/run_all.sh --smoke

# 2. the real run
caffeinate -dimsu ./scripts/benchmarks/run_all.sh
```

Or run experiments individually (recommended — it lets you stop between them and let the
machine cool):

```bash
PY="uv run --with mlx --with mlx-lm python3"

$PY scripts/benchmarks/exp2_bandwidth_roofline.py
$PY scripts/benchmarks/exp1_kv_cache_longcontext.py --model mlx-community/Qwen3-8B-4bit
$PY scripts/benchmarks/exp3_batch_concurrency.py --engines mlx --mlx-model mlx-community/Qwen3-8B-4bit
$PY scripts/benchmarks/exp4_mlx_vs_ollama_longcontext.py \
    --mlx-model mlx-community/Qwen3-8B-4bit --ollama-model qwen3:8b
```

### Runtime estimates (M5 Pro, 8B 4-bit model)

| Exp | Full scope | Notes | Reduced variant |
|---|---|---|---|
| **Exp 2** | **5–10 min** | Cheapest. Always run full. | n/a |
| **Exp 1** | **90 min – 2.5 h** ⚠️ | Dominated by the 65 k and 131 k cells, where a single prefill takes ~45–90 s and is repeated 8× per cell across 3 KV arms. | `--contexts 512,2048,8192,32768,65536 --kv-bits none,4 --reps 5` → **~35 min**. Keeps both endpoints of the causal ablation. |
| **Exp 3** | **25–45 min** (MLX only) | Add 20–30 min for the Ollama arm. B=32 at 16 k context is the expensive cell. | `--batches 1,2,4,8,16 --contexts 512,16384 --reps 3` → **~15 min** |
| **Exp 4** | **40–70 min** | Two engines × 6 contexts × 6 runs, plus model load/unload between arms. | `--contexts 512,4096,16384,32768 --reps 3` → **~20 min** |

**Total full suite: roughly 3–4.5 hours.** `./scripts/benchmarks/run_all.sh --reduced`
runs the reduced variant of everything in **~1.5 hours** and still answers every
hypothesis, just with fewer points on each curve.

⚠️ **Exp 1 is the one to plan around.** Every script prints a live ETA from the first
cell onward, so start it, read the ETA after 3–4 cells, and decide then whether to let it
finish or restart with the reduced scope. Nothing is lost by killing it — results are
written incrementally.

### Crash and OOM behaviour

Every measurement is appended to `<exp>.jsonl` and fsynced immediately. An OOM at 131 k
context cannot destroy the rows already collected at shorter lengths. When a cell fails,
the script records the failure with its reason, marks the rest of that arm as skipped,
and continues with the next arm. `Ctrl-C` finalises cleanly and still writes the CSV,
JSON, and analysis. Re-running appends to the same JSONL, so partial runs compose.

---

## 6. What each experiment proves

| Experiment | The claim it lets you make | The chart |
|---|---|---|
| Exp 1 | "Long-context slowdown on Apple Silicon is KV-cache read bandwidth, and here is the ablation that proves it: quartering the cache bytes quarters the slope." Plus the exact context length where your Mac tips into paging. | decode tok/s vs context length, one line per `kv_bits`, log-x + the three fitted slopes |
| Exp 2 | "Your M5 Pro achieves *N* GB/s in MLX, not the spec-sheet number, and attention over a long KV cache runs at *X* % of that ceiling." | roofline: GB/s and GFLOP/s per kernel shape; attention GB/s vs KV length |
| Exp 3 | "Batching is nearly free up to B=*k* — and *k* shrinks as context grows." | aggregate + per-stream tok/s vs batch, one panel per context length |
| Exp 4 | "MLX and Ollama cross over at ~*L* tokens of context; below that Ollama wins on overhead, above it MLX wins on slope." | decode tok/s vs context, two lines, crossover marked |

---

## 7. Exactly what to hand back

Hand back **the whole `scripts/benchmarks/results/` directory**, unedited. Per experiment
it contains:

| File | Contents |
|---|---|
| `<exp>.jsonl` | every individual rep and every median row, append-only, crash-safe |
| `<exp>.csv` | the same rows flattened — direct input for charts and tables |
| `<exp>.json` | metadata + all rows + the computed **`analysis`** block (fits, predictions, verdicts) |
| `<exp>.meta.json` | machine + software + power state, captured automatically |
| `logs/<exp>-<ts>.log` | full console output including the live progress and ETA |

Plus, in your own words (a few lines each, this is where the post's voice comes from):

1. **Anything that surprised you** or looked wrong while it ran.
2. **Anything that crashed or OOM'd**, and at what context/batch size.
3. **Machine conditions** — lid open or closed, fans audible, room temperature, whether
   you touched the machine mid-run.
4. **Which cells came back `noisy_cell: true`** and whether re-running them settled.
5. **The exact model artifacts used** for Exp 4 on both sides, so the parity caveat can
   be stated precisely.

### Read these before handing back

Each script prints its verdict at the end. Skim them — if `P2` in Exp 1 says
`DOES NOT SUPPORT H1`, that is not a failure of the run, it is a finding, and it changes
which post gets written first. Say so in the handback notes.

---

## 8. Environment

MLX is not installed system-wide, which is fine — `uv` handles it per-run with no venv to
manage:

```bash
uv run --with mlx --with mlx-lm python3 scripts/benchmarks/exp1_kv_cache_longcontext.py --smoke
```

Verified working on this machine: `mlx 0.32.0`, Python 3.14, macOS 26.5.2 (25F84),
Apple M5 Pro / 48 GB.

Model suggestions (any MLX-community model works; pass `--model`):

- Primary: `mlx-community/Qwen3-8B-4bit` — big enough for the memory story, small enough
  to reach 131 k context on 48 GB.
- Second size for Exp 1's `--models` arm: `mlx-community/Qwen3-1.7B-4bit` — shows the
  intercept tracking weight bytes while the slope tracks KV bytes.
- Smoke tests: `mlx-community/Qwen3-0.6B-4bit` (~350 MB, downloads in seconds).
