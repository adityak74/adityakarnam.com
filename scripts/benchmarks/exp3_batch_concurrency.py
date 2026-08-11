#!/usr/bin/env python3
"""
exp3_batch_concurrency.py
=========================
EXPERIMENT 3 — How much free throughput does batching buy on Apple Silicon, and does
Ollama concurrency capture any of it?

TARGET QUERIES
    "mlx batch inference"  (pos 7)
    "mlx concurrency"      (pos 6)
    "mlx vs ollama performance apple silicon 2025" (pos 9) — the Ollama arm feeds exp4 too

HYPOTHESIS (H3)
    Single-stream decode is bandwidth bound (established by exp1 + exp2), which means the
    weight bytes streamed per decode step are AMORTISABLE across concurrent sequences:
    batch size B reads the same weights once and does B times the useful work. Therefore
      H3a: aggregate throughput scales near-linearly with batch size up to a knee, while
           per-stream throughput stays nearly FLAT over that same range — the batching is
           close to free.
      H3b: the knee arrives when either (i) the arithmetic intensity crosses over into
           compute-bound territory (predicted by exp2's GEMM/GEMV headroom ratio), or
           (ii) B * per-sequence KV bytes starts to dominate weight bytes, at which point
           the KV read is no longer amortised and scaling flattens.
      H3c: the knee moves EARLIER as context length grows, because KV bytes scale with
           B * L while weight bytes are constant. This is the practically useful finding:
           long context does not just slow you down, it destroys your batching headroom.
      H3d: Ollama's concurrency (OLLAMA_NUM_PARALLEL) captures materially less of this
           headroom than MLX batching, because its aggregate gain comes from scheduling
           rather than from a single batched GEMM.

FALSIFIABLE PREDICTIONS
    P1: at short context, aggregate tok/s at B=8 is >= 4x the B=1 aggregate.
    P2: per-stream tok/s at the knee is >= 0.7x the B=1 per-stream tok/s.
    P3: knee_batch(long context) < knee_batch(short context).
    P4: MLX aggregate speedup at its knee > Ollama aggregate speedup at the same parallelism.

WHAT WOULD FALSIFY H3
    * Aggregate throughput is flat in B from B=1 -> decode was never weight-bandwidth
      bound in the way assumed, or MLX's batched path is not actually batching.
    * Per-stream throughput falls as 1/B -> the work is serialised, batching is pure
      queueing with no arithmetic benefit.
    * Ollama matches or beats MLX aggregate scaling -> H3d is wrong and Ollama's
      scheduler is doing real batching.

VARIABLES
    Independent : batch_size / parallelism (1,2,4,8,16,32), context_len (short vs long),
                  engine (mlx | ollama)
    Dependent   : aggregate_tok_s, per_stream_tok_s, ttft_p50_s, ttft_p95_s,
                  peak_mlx_memory_bytes, scaling_efficiency
    Controlled  : identical generation length per sequence, greedy decode, identical
                  prompt length across all streams (so no straggler skews the batch),
                  model resident and warmed, single engine running at a time

REPETITIONS
    --reps 5 per cell (batching cells are longer than exp1 cells, so 5 rather than 7).
    Median + IQR; robust CV > 0.10 flags a cell for re-run.

RUNTIME
    MLX arm: ~25-45 min for the default grid.
    Ollama arm: add ~20-30 min. Use --engines mlx to skip it if short on time.

IMPORTANT — the Ollama arm needs the server configured for parallelism BEFORE you start:
    OLLAMA_NUM_PARALLEL=<max parallelism you will test> ollama serve
    Without this, Ollama silently serialises and the comparison is meaningless. The
    script records the value it sees and warns if it is unset.

USAGE
    python3 scripts/benchmarks/exp3_batch_concurrency.py --dry-run
    uv run --with mlx --with mlx-lm python3 scripts/benchmarks/exp3_batch_concurrency.py --smoke
    uv run --with mlx --with mlx-lm python3 scripts/benchmarks/exp3_batch_concurrency.py \
        --engines mlx,ollama --batches 1,2,4,8,16,32 --contexts 512,16384

OUTPUT
    results/exp3_batch_concurrency.{jsonl,csv,json}
"""

from __future__ import annotations

import argparse
import concurrent.futures as futures
import gc
import json
import math
import os
import random
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from bench_common import (  # noqa: E402
    MemProbe,
    Progress,
    ResultWriter,
    add_common_args,
    banner,
    collect_metadata,
    fmt_dur,
    out_name,
    require_mlx,
    robust_stats,
)

DEFAULT_MLX_MODEL = "mlx-community/Qwen3-8B-4bit"
DEFAULT_OLLAMA_MODEL = "qwen3.6:27b"


# --------------------------------------------------------------------------------------
# MLX batched decode
# --------------------------------------------------------------------------------------


def mlx_batch_cell(mx, model, mem, batch: int, context_len: int, gen_tokens: int,
                   chunk: int, vocab_size: int, seed: int) -> dict:
    """
    True batched decode: one prompt cache shared across a (batch, seq) input, so every
    decode step is a single GEMM of shape (batch, hidden) @ (hidden, out) rather than
    `batch` separate GEMVs. That is the whole point of the experiment.
    """
    from mlx_lm.models import cache as cache_mod

    rng = random.Random(seed)
    ids = [
        [rng.randrange(1, max(2, vocab_size - 1)) for _ in range(context_len)]
        for _ in range(batch)
    ]
    prompt = mx.array(ids)  # (batch, context_len)

    mem.reset_peak()
    mem.clear_cache()
    gc.collect()
    cache = cache_mod.make_prompt_cache(model)

    t0 = time.perf_counter()
    logits = None
    for i in range(0, prompt.shape[1], chunk):
        logits = model(prompt[:, i : i + chunk], cache=cache)
        mx.eval(logits)
    prefill_s = time.perf_counter() - t0

    y = mx.argmax(logits[:, -1, :], axis=-1)[:, None]
    t1 = time.perf_counter()
    for _ in range(gen_tokens):
        logits = model(y, cache=cache)
        y = mx.argmax(logits[:, -1, :], axis=-1)[:, None]
        mx.eval(y)
    decode_s = time.perf_counter() - t1

    peak = mem.peak()
    del cache, logits, y, prompt
    gc.collect()

    total_tokens = batch * gen_tokens
    return {
        "prefill_s": prefill_s,
        "ttft_p50_s": prefill_s,  # batched: all streams get their first token together
        "ttft_p95_s": prefill_s,
        "decode_s": decode_s,
        "aggregate_tok_s": total_tokens / decode_s,
        "per_stream_tok_s": gen_tokens / decode_s,
        "peak_mlx_memory_bytes": peak,
    }


# --------------------------------------------------------------------------------------
# Ollama concurrent requests
# --------------------------------------------------------------------------------------


def ollama_num_parallel(host: str) -> str | None:
    return os.environ.get("OLLAMA_NUM_PARALLEL")


def _ollama_one(host: str, model: str, prompt: str, gen_tokens: int) -> dict:
    body = json.dumps(
        {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "think": False,
            "options": {"num_predict": gen_tokens, "temperature": 0.0, "seed": 0},
        }
    ).encode()
    req = urllib.request.Request(
        f"{host}/api/generate", data=body, headers={"Content-Type": "application/json"}
    )
    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=1800) as resp:
        payload = json.loads(resp.read())
    wall = time.perf_counter() - t0
    eval_count = payload.get("eval_count") or 0
    eval_dur = (payload.get("eval_duration") or 0) / 1e9
    prompt_dur = (payload.get("prompt_eval_duration") or 0) / 1e9
    return {
        "wall_s": wall,
        "eval_count": eval_count,
        "eval_duration_s": eval_dur,
        "ttft_s": prompt_dur if prompt_dur else None,
        "tok_s": eval_count / eval_dur if eval_dur else None,
    }


def ollama_cell(host: str, model: str, parallel: int, context_words: int,
                gen_tokens: int, seed: int) -> dict:
    """
    Fire `parallel` concurrent /api/generate requests and measure aggregate throughput.
    Each request gets a DIFFERENT prompt prefix so Ollama's prefix cache cannot
    short-circuit the comparison and inflate the concurrency result.
    """
    rng = random.Random(seed)
    words = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta"]
    prompts = [
        f"[req{i}] " + " ".join(rng.choice(words) for _ in range(context_words))
        + "\nSummarise the above in one sentence."
        for i in range(parallel)
    ]

    t0 = time.perf_counter()
    with futures.ThreadPoolExecutor(max_workers=parallel) as ex:
        results = list(
            ex.map(lambda p: _ollama_one(host, model, p, gen_tokens), prompts)
        )
    wall = time.perf_counter() - t0

    total_tokens = sum(r["eval_count"] for r in results)
    ttfts = sorted(r["ttft_s"] for r in results if r["ttft_s"])
    per_stream = [r["tok_s"] for r in results if r["tok_s"]]

    def pct(vals, q):
        if not vals:
            return None
        i = min(len(vals) - 1, int(q * (len(vals) - 1)))
        return vals[i]

    return {
        "decode_s": wall,
        "aggregate_tok_s": total_tokens / wall if wall else None,
        "per_stream_tok_s": robust_stats(per_stream).get("median"),
        "ttft_p50_s": pct(ttfts, 0.5),
        "ttft_p95_s": pct(ttfts, 0.95),
        "total_tokens": total_tokens,
        "peak_mlx_memory_bytes": None,
    }


# --------------------------------------------------------------------------------------
# Dry run
# --------------------------------------------------------------------------------------


def synth_batch(engine: str, batch: int, context_len: int, gen_tokens: int, rep: int) -> dict:
    knee = 16 if context_len < 4096 else 4
    eff = 1.0 if batch <= knee else knee / batch
    base = 55.0 if engine == "mlx" else 30.0
    per_stream = base * eff * (1 - 0.3 * math.log2(max(context_len, 512) / 512) / 8)
    if engine == "ollama":
        per_stream *= 0.75 / max(1.0, batch / 8)
    jitter = 1 + 0.02 * math.sin(rep * 2.3 + batch)
    per_stream *= jitter
    decode_s = gen_tokens / per_stream
    return {
        "prefill_s": context_len / 3000.0,
        "decode_s": decode_s,
        "aggregate_tok_s": per_stream * batch,
        "per_stream_tok_s": per_stream,
        "ttft_p50_s": context_len / 3000.0,
        "ttft_p95_s": context_len / 3000.0 * 1.2,
        "peak_mlx_memory_bytes": int(5e9 + batch * context_len * 1.2e5),
    }


# --------------------------------------------------------------------------------------
# Analysis
# --------------------------------------------------------------------------------------


def analyse(rows: list[dict]) -> dict:
    arms: dict[tuple, list[dict]] = {}
    for r in rows:
        if r.get("stat") != "median":
            continue
        arms.setdefault((r["engine"], r["context_len"]), []).append(r)

    out = {}
    for (engine, ctx), cells in arms.items():
        cells = sorted(cells, key=lambda c: c["batch"])
        b1 = next((c for c in cells if c["batch"] == 1), None)
        if not b1 or not b1.get("aggregate_tok_s"):
            continue
        series = []
        knee = cells[-1]["batch"]
        for c in cells:
            speedup = c["aggregate_tok_s"] / b1["aggregate_tok_s"]
            efficiency = speedup / c["batch"]
            series.append(
                {
                    "batch": c["batch"],
                    "aggregate_tok_s": c["aggregate_tok_s"],
                    "per_stream_tok_s": c["per_stream_tok_s"],
                    "aggregate_speedup_vs_b1": speedup,
                    "scaling_efficiency": efficiency,
                    "per_stream_retention": (
                        c["per_stream_tok_s"] / b1["per_stream_tok_s"]
                        if b1.get("per_stream_tok_s") else None
                    ),
                }
            )
        # knee = largest batch that still holds >= 70% scaling efficiency
        eff_ok = [s["batch"] for s in series if s["scaling_efficiency"] >= 0.70]
        knee = max(eff_ok) if eff_ok else 1
        b8 = next((s for s in series if s["batch"] == 8), None)
        out[f"{engine}|ctx={ctx}"] = {
            "series": series,
            "knee_batch_at_70pct_efficiency": knee,
            "P1_b8_speedup_ge_4x": (b8["aggregate_speedup_vs_b1"] >= 4.0) if b8 else None,
            "P2_per_stream_retention_at_knee": next(
                (s["per_stream_retention"] for s in series if s["batch"] == knee), None
            ),
            "max_aggregate_tok_s": max(s["aggregate_tok_s"] for s in series),
        }

    p3 = {}
    for engine in {k.split("|")[0] for k in out}:
        entries = {
            int(k.split("ctx=")[1]): v["knee_batch_at_70pct_efficiency"]
            for k, v in out.items() if k.startswith(engine + "|")
        }
        if len(entries) >= 2:
            ctxs = sorted(entries)
            p3[engine] = {
                "knee_by_context": entries,
                "P3_knee_shrinks_with_context": entries[ctxs[-1]] < entries[ctxs[0]],
            }

    return {
        "hypothesis": "H3: batching amortises weight bandwidth, so aggregate throughput "
        "scales near-linearly until KV bytes or compute becomes the binding constraint.",
        "by_arm": out,
        "P3_knee_vs_context": p3,
        "how_to_read": (
            "scaling_efficiency = aggregate_speedup / batch. 1.0 means the batching was "
            "free. The knee is the last batch size holding >= 0.70. P3 is the headline: "
            "if the knee shrinks as context grows, long context costs you batching "
            "headroom on top of raw speed, which is a claim nobody has published numbers for."
        ),
    }


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------


def main() -> int:
    ap = argparse.ArgumentParser(description="MLX batching vs Ollama concurrency scaling.")
    add_common_args(ap)
    ap.add_argument("--engines", default="mlx", help="Comma-separated: mlx,ollama")
    ap.add_argument("--mlx-model", default=DEFAULT_MLX_MODEL)
    ap.add_argument("--ollama-model", default=DEFAULT_OLLAMA_MODEL)
    ap.add_argument("--ollama-host", default="http://127.0.0.1:11434")
    ap.add_argument("--batches", default="1,2,4,8,16,32", help="Batch / parallelism sweep")
    ap.add_argument("--contexts", default="512,16384", help="Short and long context arms")
    ap.add_argument("--gen-tokens", type=int, default=64, help="Tokens generated per stream")
    ap.add_argument("--reps", type=int, default=5)
    ap.add_argument("--warmup", type=int, default=1)
    ap.add_argument("--prefill-chunk", type=int, default=2048)
    args = ap.parse_args()

    if args.smoke:
        args.batches, args.contexts = "1,2", "512"
        args.reps, args.warmup, args.gen_tokens = 2, 1, 16

    engines = [e.strip() for e in args.engines.split(",") if e.strip()]
    batches = [int(b) for b in args.batches.split(",") if b.strip()]
    contexts = [int(c) for c in args.contexts.split(",") if c.strip()]

    meta = collect_metadata(
        {
            "experiment": "exp3_batch_concurrency",
            "args": vars(args),
            "ollama_num_parallel_env": ollama_num_parallel(args.ollama_host),
        }
    )
    banner("EXP3 — batch inference & concurrency scaling", meta)
    if "ollama" in engines and not meta.get("ollama_num_parallel_env"):
        print(
            "  !! OLLAMA_NUM_PARALLEL is not set in this shell. If the SERVER was not "
            "started with it, Ollama will serialise and the concurrency arm is invalid.\n"
            "     Restart the server as: OLLAMA_NUM_PARALLEL=32 ollama serve",
            flush=True,
        )

    writer = ResultWriter(
        Path(args.results_dir), out_name("exp3_batch_concurrency", args.tag), meta
    )
    prog = Progress(len(engines) * len(contexts) * len(batches), "exp3")
    median_rows: list[dict] = []
    mx = None
    if not args.dry_run and "mlx" in engines:
        mx = require_mlx()

    try:
        for engine in engines:
            model = mem = None
            vocab_size = 32000
            if engine == "mlx" and not args.dry_run:
                from mlx_lm import load

                print(f"\nloading {args.mlx_model} ...", flush=True)
                t = time.perf_counter()
                model, tok = load(args.mlx_model)
                mx.eval(model.parameters())
                vocab_size = getattr(tok, "vocab_size", None) or 32000
                mem = MemProbe(mx)
                print(f"loaded in {fmt_dur(time.perf_counter() - t)}", flush=True)

            for ctx in contexts:
                dead = False
                for batch in batches:
                    if dead:
                        writer.note_failure(
                            engine=engine, context_len=ctx, batch=batch,
                            reason="arm aborted after earlier failure at smaller batch",
                        )
                        prog.step(f"{engine} ctx={ctx} B={batch} SKIPPED")
                        continue
                    reps, failure = [], None
                    for rep in range(args.warmup + args.reps):
                        try:
                            if args.dry_run:
                                r = synth_batch(engine, batch, ctx, args.gen_tokens, rep)
                            elif engine == "mlx":
                                r = mlx_batch_cell(
                                    mx, model, mem, batch, ctx, args.gen_tokens,
                                    args.prefill_chunk, vocab_size, args.seed + rep,
                                )
                            else:
                                r = ollama_cell(
                                    args.ollama_host, args.ollama_model, batch,
                                    max(1, ctx // 2), args.gen_tokens, args.seed + rep,
                                )
                        except (Exception, urllib.error.URLError) as e:
                            failure = f"{type(e).__name__}: {e}"
                            break
                        if rep >= args.warmup:
                            reps.append(r)
                            writer.append(
                                {
                                    "stat": "rep", "engine": engine, "context_len": ctx,
                                    "batch": batch, "gen_tokens": args.gen_tokens,
                                    "rep": rep - args.warmup, **r,
                                }
                            )
                    if failure or not reps:
                        writer.note_failure(
                            engine=engine, context_len=ctx, batch=batch, reason=failure
                        )
                        dead = True
                        prog.step(f"{engine} ctx={ctx} B={batch} FAILED: {failure}")
                        continue

                    row = {
                        "stat": "median", "engine": engine, "context_len": ctx,
                        "batch": batch, "gen_tokens": args.gen_tokens,
                        "peak_mlx_memory_bytes": max(
                            (r.get("peak_mlx_memory_bytes") or 0) for r in reps
                        ) or None,
                    }
                    for f in ("aggregate_tok_s", "per_stream_tok_s", "ttft_p50_s", "ttft_p95_s"):
                        vals = [r.get(f) for r in reps if r.get(f) is not None]
                        s = robust_stats(vals, prefix=f"{f}_")
                        row[f] = s.get(f"{f}_median")
                        row[f"{f}_iqr"] = s.get(f"{f}_iqr")
                        row[f"{f}_cv"] = s.get(f"{f}_cv_robust")
                    noisy = (row.get("aggregate_tok_s_cv") or 0) > 0.10
                    row["noisy_cell"] = noisy
                    writer.append(row)
                    median_rows.append(row)
                    prog.step(
                        f"{engine} ctx={ctx} B={batch:>3} agg={row['aggregate_tok_s']:.1f} tok/s "
                        f"per-stream={row['per_stream_tok_s']:.1f} tok/s"
                        + ("  <<< NOISY" if noisy else "")
                    )

            del model
            gc.collect()

    except KeyboardInterrupt:
        print("\ninterrupted — finalising", flush=True)
    finally:
        prog.done_msg()
        payload = writer.finalize(analyse(median_rows))
        writer.close()
        print(f"\nwrote:\n  {writer.jsonl_path}\n  {writer.csv_path}\n  {writer.json_path}")
        print("\n--- scaling summary ---")
        for arm, v in payload["analysis"].get("by_arm", {}).items():
            print(
                f"  {arm}: knee at B={v['knee_batch_at_70pct_efficiency']}, "
                f"peak aggregate {v['max_aggregate_tok_s']:.1f} tok/s, "
                f"per-stream retention at knee "
                f"{v['P2_per_stream_retention_at_knee']:.2f}"
                if v.get("P2_per_stream_retention_at_knee") is not None
                else f"  {arm}: knee at B={v['knee_batch_at_70pct_efficiency']}"
            )
        for engine, v in payload["analysis"].get("P3_knee_vs_context", {}).items():
            print(
                f"  {engine}: knee by context {v['knee_by_context']} -> "
                f"P3 {'HOLDS' if v['P3_knee_shrinks_with_context'] else 'FAILS'}"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
