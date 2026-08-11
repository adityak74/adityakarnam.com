#!/usr/bin/env python3
"""
exp4_mlx_vs_ollama_longcontext.py
=================================
EXPERIMENT 4 — Where do MLX and Ollama cross over as context length grows?

TARGET QUERY
    "mlx vs ollama performance apple silicon 2025" (pos 9)

WHY THIS IS NOT A REPEAT OF THE 2026-07-08 POST
    The existing Ollama vs vLLM vs SGLang post compared runtimes at essentially ONE
    context length, on six fixed workloads, and reported per-workload wall latency.
    It answered "which stack is fastest for my prompts". It did not sweep context length,
    did not separate prefill from decode, and did not include MLX directly.
    This experiment holds the workload constant and sweeps ONLY context length, which is
    the variable the search demand is actually about. The deliverable is a crossover
    chart, not a leaderboard.

HYPOTHESIS (H4)
    Ollama (llama.cpp) and MLX have different constants in the same affine decode model
    established by exp1: t(L) = t0 + L * kv_bytes / B_eff.
      H4a: at SHORT context the winner is decided by t0 (kernel + runtime overhead per
           step), where Ollama's tighter C++ loop is expected to win or tie.
      H4b: at LONG context the winner is decided by the SLOPE, i.e. by KV-cache layout
           and attention kernel bandwidth efficiency. Whichever runtime has the better
           slope wins, and the ranking can therefore INVERT at some crossover length.
      H4c: a crossover exists inside the practical 512..65536 window, so "MLX vs Ollama"
           has no single correct answer — it depends on your context length. That
           context-dependence is the finding.
      H4d: Ollama's default num_ctx (2048 in many builds) silently truncates long
           prompts. Runs that do not set num_ctx explicitly are measuring a shorter
           context than they think. The script sets it explicitly and records it.

FALSIFIABLE PREDICTIONS
    P1: both engines fit t(L) = t0 + slope*L with R^2 > 0.95 over the non-paging range.
    P2: the two fitted lines intersect at an L inside the swept range (the crossover).
    P3: the ranking at the smallest context differs from the ranking at the largest.
        If one engine wins at every single context length, H4c is falsified and the
        honest headline is "X wins everywhere on this machine", which is still publishable.

VARIABLES
    Independent : engine (mlx | ollama), context_len
    Dependent   : ttft_s (prefill), decode_tok_s, ms_per_decode_token, total wall
    Controlled  : SAME quantisation family and SAME parameter count across engines
                  (pass matched model ids — see --mlx-model / --ollama-model; the script
                  records both and will NOT pretend they are identical artifacts),
                  same generated token count, greedy decode, thinking disabled on Ollama
                  (the prior post showed `think: false` is required or visible output is
                  empty and the timing is not comparable), single engine resident at a time

MODEL PARITY CAVEAT — READ THIS
    MLX and Ollama do not ship byte-identical quantised artifacts. Pick the closest pair
    you can (same base model, same parameter count, comparable bits-per-weight) and state
    the mismatch in the post. The measured SLOPE is far more robust to this mismatch than
    the absolute tok/s, which is another reason the slope-based framing is the right one.

REPETITIONS
    --reps 5, warmup 1, median + IQR, robust CV > 0.10 flags a cell.

RUNTIME
    ~40-70 min for the default sweep with a mid-size model. Reduce with
    --contexts 512,4096,16384,32768 to roughly halve it.

PRE-REQ
    Ollama server running, model pulled:  ollama pull <model>
    Do NOT run the MLX arm and the Ollama arm concurrently — the prior post already
    showed co-resident runtimes fight over unified memory and produce invalid numbers.
    This script serialises them and unloads between arms.

USAGE
    python3 scripts/benchmarks/exp4_mlx_vs_ollama_longcontext.py --dry-run
    uv run --with mlx --with mlx-lm python3 scripts/benchmarks/exp4_mlx_vs_ollama_longcontext.py --smoke
    uv run --with mlx --with mlx-lm python3 scripts/benchmarks/exp4_mlx_vs_ollama_longcontext.py \
        --mlx-model mlx-community/Qwen3-8B-4bit --ollama-model qwen3:8b

OUTPUT
    results/exp4_mlx_vs_ollama.{jsonl,csv,json}
"""

from __future__ import annotations

import argparse
import gc
import json
import math
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
    host_memory_pressure,
    linfit,
    out_name,
    require_mlx,
    robust_stats,
)

DEFAULT_CONTEXTS = "512,2048,8192,16384,32768,65536"


# --------------------------------------------------------------------------------------
# Ollama
# --------------------------------------------------------------------------------------


def make_filler(target_tokens: int, seed: int) -> str:
    """
    Build a prompt of roughly `target_tokens` tokens. ~0.75 words per token is the usual
    English ratio; we generate words and let each engine tokenize it. The script records
    the ACTUAL prompt token count reported by each engine so the x-axis is real, not
    assumed — this matters because a mis-stated context length is the single most common
    error in published local-LLM benchmarks.
    """
    rng = random.Random(seed)
    vocab = [
        "system", "latency", "memory", "kernel", "bandwidth", "tensor", "context",
        "throughput", "cache", "silicon", "unified", "quantised", "attention", "decode",
    ]
    # Calibrated against Qwen3's tokenizer on this word list (~1.09 tokens/word), so the
    # realised context lands near the nominal sweep point. The ACTUAL count is measured
    # and recorded regardless — the x-axis never uses the nominal value.
    n_words = int(target_tokens * 0.92)
    return " ".join(rng.choice(vocab) for _ in range(n_words))


def ollama_cell(host: str, model: str, target_ctx: int, gen_tokens: int, seed: int) -> dict:
    prompt = make_filler(target_ctx, seed) + "\n\nReply with a single short sentence."
    body = json.dumps(
        {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "think": False,  # required, see the 2026-07-08 post: otherwise content is empty
            "options": {
                "num_predict": gen_tokens,
                "num_ctx": max(target_ctx + gen_tokens + 256, 4096),  # H4d
                "temperature": 0.0,
                "seed": seed,
            },
        }
    ).encode()
    req = urllib.request.Request(
        f"{host}/api/generate", data=body, headers={"Content-Type": "application/json"}
    )
    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=3600) as resp:
        p = json.loads(resp.read())
    wall = time.perf_counter() - t0

    prompt_eval_s = (p.get("prompt_eval_duration") or 0) / 1e9
    eval_s = (p.get("eval_duration") or 0) / 1e9
    eval_count = p.get("eval_count") or 0
    prompt_count = p.get("prompt_eval_count") or 0
    return {
        "wall_s": wall,
        "actual_prompt_tokens": prompt_count,
        "ttft_s": prompt_eval_s or None,
        "prefill_tok_s": (prompt_count / prompt_eval_s) if prompt_eval_s else None,
        "decode_s": eval_s or None,
        "decode_tok_s": (eval_count / eval_s) if eval_s else None,
        "ms_per_decode_token": (1000 * eval_s / eval_count) if eval_count else None,
        "generated_tokens": eval_count,
    }


def unload_ollama(host: str, model: str) -> None:
    """Ask Ollama to evict the model so the MLX arm gets the whole unified memory pool."""
    try:
        body = json.dumps({"model": model, "keep_alive": 0}).encode()
        req = urllib.request.Request(
            f"{host}/api/generate", data=body, headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req, timeout=60).read()
    except Exception:
        pass


# --------------------------------------------------------------------------------------
# MLX
# --------------------------------------------------------------------------------------


def mlx_cell(mx, model, tokenizer, mem, target_ctx: int, gen_tokens: int,
             chunk: int, seed: int) -> dict:
    from mlx_lm.models import cache as cache_mod

    text = make_filler(target_ctx, seed) + "\n\nReply with a single short sentence."
    ids = tokenizer.encode(text)
    prompt = mx.array(ids)[None]
    actual = prompt.shape[1]

    mem.reset_peak()
    mem.clear_cache()
    gc.collect()
    cache = cache_mod.make_prompt_cache(model)

    t0 = time.perf_counter()
    logits = None
    for i in range(0, actual, chunk):
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
    return {
        "wall_s": prefill_s + decode_s,
        "actual_prompt_tokens": actual,
        "ttft_s": prefill_s,
        "prefill_tok_s": actual / prefill_s if prefill_s else None,
        "decode_s": decode_s,
        "decode_tok_s": gen_tokens / decode_s if decode_s else None,
        "ms_per_decode_token": 1000 * decode_s / gen_tokens,
        "generated_tokens": gen_tokens,
        "peak_mlx_memory_bytes": peak,
    }


# --------------------------------------------------------------------------------------
# Dry run
# --------------------------------------------------------------------------------------


def synth(engine: str, ctx: int, gen_tokens: int, rep: int) -> dict:
    # MLX: higher per-step overhead, better slope. Ollama: lower overhead, worse slope.
    t0 = 0.010 if engine == "mlx" else 0.007
    slope = 1.4e-7 if engine == "mlx" else 3.0e-7
    ms = (t0 + slope * ctx) * 1000 * (1 + 0.02 * math.sin(rep * 1.9 + ctx))
    decode_s = ms * gen_tokens / 1000
    prefill = ctx / (3200.0 if engine == "mlx" else 2400.0)
    return {
        "wall_s": prefill + decode_s,
        "actual_prompt_tokens": ctx,
        "ttft_s": prefill,
        "prefill_tok_s": ctx / prefill,
        "decode_s": decode_s,
        "decode_tok_s": gen_tokens / decode_s,
        "ms_per_decode_token": ms,
        "generated_tokens": gen_tokens,
        "peak_mlx_memory_bytes": int(5e9 + ctx * 1.2e5) if engine == "mlx" else None,
    }


# --------------------------------------------------------------------------------------
# Analysis
# --------------------------------------------------------------------------------------


def analyse(rows: list[dict]) -> dict:
    arms: dict[str, list[dict]] = {}
    for r in rows:
        if r.get("stat") != "median":
            continue
        arms.setdefault(r["engine"], []).append(r)

    fits = {}
    for engine, cells in arms.items():
        cells = sorted(cells, key=lambda c: c["actual_prompt_tokens"])
        xs = [c["actual_prompt_tokens"] for c in cells]
        ys = [c["ms_per_decode_token"] / 1000 for c in cells]
        f = linfit(xs, ys)
        fits[engine] = {
            "t0_s": f["intercept"],
            "slope_s_per_ctx_token": f["slope"],
            "r2": f["r2"],
            "P1_r2_gt_0.95": (f["r2"] or 0) > 0.95,
            "decode_tok_s_by_context": {
                c["actual_prompt_tokens"]: c["decode_tok_s"] for c in cells
            },
            "prefill_tok_s_by_context": {
                c["actual_prompt_tokens"]: c["prefill_tok_s"] for c in cells
            },
        }

    crossover = None
    if len(fits) == 2:
        (e1, f1), (e2, f2) = list(fits.items())
        d_slope = f1["slope_s_per_ctx_token"] - f2["slope_s_per_ctx_token"]
        if d_slope:
            L = (f2["t0_s"] - f1["t0_s"]) / d_slope
            all_ctx = [
                c["actual_prompt_tokens"] for cells in arms.values() for c in cells
            ]
            crossover = {
                "engines": [e1, e2],
                "crossover_context_tokens": L,
                "inside_swept_range": bool(all_ctx and min(all_ctx) <= L <= max(all_ctx)),
                "faster_below_crossover": e1 if f1["t0_s"] < f2["t0_s"] else e2,
                "faster_above_crossover": (
                    e1 if f1["slope_s_per_ctx_token"] < f2["slope_s_per_ctx_token"] else e2
                ),
            }

    ranking_flip = None
    if len(arms) == 2:
        engines = list(arms)
        short = {e: min(arms[e], key=lambda c: c["actual_prompt_tokens"]) for e in engines}
        long_ = {e: max(arms[e], key=lambda c: c["actual_prompt_tokens"]) for e in engines}
        win_short = max(engines, key=lambda e: short[e]["decode_tok_s"] or 0)
        win_long = max(engines, key=lambda e: long_[e]["decode_tok_s"] or 0)
        ranking_flip = {
            "winner_at_shortest_context": win_short,
            "winner_at_longest_context": win_long,
            "P3_ranking_inverts": win_short != win_long,
        }

    return {
        "hypothesis": "H4: MLX and Ollama differ in both the constant and the slope of "
        "the affine decode model, so the winner depends on context length.",
        "affine_fits": fits,
        "P2_crossover": crossover,
        "P3_ranking": ranking_flip,
        "how_to_read": (
            "The chart to publish is decode tok/s vs context length, one line per engine, "
            "log-x. The claim to publish is the crossover point in tokens. If "
            "P3_ranking_inverts is false, publish 'X wins at every context length on this "
            "machine' and report both slopes anyway — the slopes are the mechanism."
        ),
        "model_parity_caveat": "MLX and Ollama artifacts are not byte-identical. Absolute "
        "tok/s carries a quantisation-mismatch caveat; the fitted slopes are the robust part.",
    }


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------


def main() -> int:
    ap = argparse.ArgumentParser(description="MLX vs Ollama decode throughput vs context length.")
    add_common_args(ap)
    ap.add_argument("--mlx-model", default="mlx-community/Qwen3-8B-4bit")
    ap.add_argument("--ollama-model", default="qwen3:8b")
    ap.add_argument("--ollama-host", default="http://127.0.0.1:11434")
    ap.add_argument("--engines", default="mlx,ollama")
    ap.add_argument("--contexts", default=DEFAULT_CONTEXTS)
    ap.add_argument("--gen-tokens", type=int, default=128)
    ap.add_argument("--reps", type=int, default=5)
    ap.add_argument("--warmup", type=int, default=1)
    ap.add_argument("--prefill-chunk", type=int, default=2048)
    args = ap.parse_args()

    if args.smoke:
        args.contexts, args.reps, args.warmup, args.gen_tokens = "512,1024", 2, 1, 16

    engines = [e.strip() for e in args.engines.split(",") if e.strip()]
    contexts = [int(c) for c in args.contexts.split(",") if c.strip()]

    meta = collect_metadata(
        {
            "experiment": "exp4_mlx_vs_ollama_longcontext",
            "args": vars(args),
            "model_parity_note": f"mlx={args.mlx_model} vs ollama={args.ollama_model} "
            "— not byte-identical artifacts; state this in the post.",
        }
    )
    banner("EXP4 — MLX vs Ollama across context length", meta)

    writer = ResultWriter(Path(args.results_dir), out_name("exp4_mlx_vs_ollama", args.tag), meta)
    prog = Progress(len(engines) * len(contexts), "exp4")
    median_rows: list[dict] = []
    mx = None if (args.dry_run or "mlx" not in engines) else require_mlx()

    try:
        for engine in engines:
            model = tokenizer = mem = None
            if engine == "mlx" and not args.dry_run:
                if "ollama" in engines:
                    unload_ollama(args.ollama_host, args.ollama_model)
                    time.sleep(3)  # let the OS reclaim before we allocate
                from mlx_lm import load

                print(f"\nloading {args.mlx_model} ...", flush=True)
                t = time.perf_counter()
                model, tokenizer = load(args.mlx_model)
                mx.eval(model.parameters())
                mem = MemProbe(mx)
                print(f"loaded in {fmt_dur(time.perf_counter() - t)}", flush=True)

            dead = False
            for ctx in contexts:
                if dead:
                    writer.note_failure(engine=engine, context_len=ctx, reason="arm aborted")
                    prog.step(f"{engine} ctx={ctx} SKIPPED")
                    continue
                reps, failure = [], None
                for rep in range(args.warmup + args.reps):
                    try:
                        if args.dry_run:
                            r = synth(engine, ctx, args.gen_tokens, rep)
                        elif engine == "mlx":
                            r = mlx_cell(
                                mx, model, tokenizer, mem, ctx, args.gen_tokens,
                                args.prefill_chunk, args.seed + rep,
                            )
                        else:
                            r = ollama_cell(
                                args.ollama_host, args.ollama_model, ctx,
                                args.gen_tokens, args.seed + rep,
                            )
                    except (Exception, urllib.error.URLError) as e:
                        failure = f"{type(e).__name__}: {e}"
                        break
                    if rep >= args.warmup:
                        reps.append(r)
                        writer.append(
                            {
                                "stat": "rep", "engine": engine, "context_len": ctx,
                                "rep": rep - args.warmup, **r,
                            }
                        )
                if failure or not reps:
                    writer.note_failure(engine=engine, context_len=ctx, reason=failure)
                    dead = True
                    prog.step(f"{engine} ctx={ctx} FAILED: {failure}")
                    continue

                pressure = host_memory_pressure() if not args.dry_run else {}
                row = {
                    "stat": "median", "engine": engine, "context_len": ctx,
                    "model": args.mlx_model if engine == "mlx" else args.ollama_model,
                    "actual_prompt_tokens": robust_stats(
                        [r["actual_prompt_tokens"] for r in reps]
                    )["median"],
                    "peak_mlx_memory_bytes": max(
                        (r.get("peak_mlx_memory_bytes") or 0) for r in reps
                    ) or None,
                    "swap_used_mb": pressure.get("swap_used_mb"),
                }
                for f in ("decode_tok_s", "ms_per_decode_token", "prefill_tok_s", "ttft_s"):
                    vals = [r.get(f) for r in reps if r.get(f) is not None]
                    s = robust_stats(vals, prefix=f"{f}_")
                    row[f] = s.get(f"{f}_median")
                    row[f"{f}_iqr"] = s.get(f"{f}_iqr")
                    row[f"{f}_cv"] = s.get(f"{f}_cv_robust")
                noisy = (row.get("decode_tok_s_cv") or 0) > 0.10
                row["noisy_cell"] = noisy
                writer.append(row)
                median_rows.append(row)
                prog.step(
                    f"{engine} ctx={ctx:>6} (actual {int(row['actual_prompt_tokens'])}) "
                    f"decode={row['decode_tok_s']:.2f} tok/s "
                    f"ttft={row['ttft_s']:.2f}s" + ("  <<< NOISY" if noisy else "")
                )

            if engine == "ollama" and not args.dry_run:
                unload_ollama(args.ollama_host, args.ollama_model)
            del model, tokenizer
            gc.collect()

    except KeyboardInterrupt:
        print("\ninterrupted — finalising", flush=True)
    finally:
        prog.done_msg()
        payload = writer.finalize(analyse(median_rows))
        writer.close()
        print(f"\nwrote:\n  {writer.jsonl_path}\n  {writer.csv_path}\n  {writer.json_path}")
        a = payload["analysis"]
        print("\n--- affine fits ---")
        for e, f in a.get("affine_fits", {}).items():
            print(
                f"  {e}: t0={f['t0_s'] * 1000:.2f} ms/token  "
                f"slope={f['slope_s_per_ctx_token']:.3e} s per ctx-token  R2={f['r2']:.4f}"
            )
        if a.get("P2_crossover"):
            c = a["P2_crossover"]
            print(
                f"\n  crossover at ~{c['crossover_context_tokens']:.0f} context tokens "
                f"(inside swept range: {c['inside_swept_range']}); "
                f"{c['faster_below_crossover']} faster below, "
                f"{c['faster_above_crossover']} faster above"
            )
        if a.get("P3_ranking"):
            print(f"  ranking: {a['P3_ranking']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
