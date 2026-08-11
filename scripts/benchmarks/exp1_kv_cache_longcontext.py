#!/usr/bin/env python3
"""
exp1_kv_cache_longcontext.py
============================
EXPERIMENT 1 — Why does MLX decode throughput collapse as context grows on Apple Silicon?

TARGET QUERY
    "mlx long context performance drop apple silicon kv cache" (36 impressions, pos 13.5)

THE QUESTION NOBODY HAS ANSWERED WITH DATA
    Everyone observes that tokens/sec falls off as the conversation gets long. Almost
    nobody separates the three candidate causes:
      (A) KV-cache read bandwidth   — each decoded token must stream the entire KV cache
                                      out of unified memory through the attention kernel.
      (B) OS memory pressure        — the working set exceeds physical RAM, macOS starts
                                      compressing/swapping, and everything falls off a cliff.
      (C) Kernel/software overhead  — attention kernel inefficiency, cache reallocation,
                                      Python-side per-token overhead.
    This script is designed to tell them apart.

HYPOTHESIS (H1)
    Steady-state decode throughput degradation with context length on Apple Silicon is
    primarily (A): a memory-BANDWIDTH effect, not a memory-CAPACITY effect.
    Concretely, per-token decode latency should be affine in context length:

        t_decode(L)  =  t0  +  (kv_bytes_per_token * L) / B_eff

    where t0 is the context-independent cost (weight streaming for the MLP/projections)
    and B_eff is an effective achievable bandwidth that should land close to the
    measured streaming bandwidth ceiling from exp2.

FALSIFIABLE PREDICTIONS
    P1 (linearity): t_decode vs L is linear with R^2 > 0.95, up to the point where the
        total working set approaches physical RAM.
    P2 (bytes-proportional slope): quantising the KV cache to 8-bit halves kv_bytes_per_token
        versus fp16, and to 4-bit quarters it. If the cause is KV bandwidth, the SLOPE must
        fall by ~2x and ~4x respectively while the INTERCEPT t0 stays roughly constant.
        This is the load-bearing causal test. Nothing else in the system changes.
    P3 (bandwidth agreement): B_eff implied by the fp16 slope lands within ~2x of the
        measured streaming bandwidth ceiling from exp2.
    P4 (capacity is a separate regime): a knee — a sharp super-linear break — appears only
        once (weights + KV + activations) approaches installed RAM, and it coincides with
        a rise in swap_used_mb / compressed_mb, which this script samples per cell.

WHAT WOULD FALSIFY H1
    * Slope does NOT scale down with kv_bits -> degradation is not KV-read bound.
      (If the slope is flat across kv_bits but throughput still decays, suspect the
      attention kernel's compute or its per-step launch overhead instead.)
    * t_decode is super-linear from the very start with no memory-pressure signal ->
      quadratic attention compute or cache reallocation, i.e. cause (C).
    * Degradation tracks swap_used_mb from the first cell -> cause (B) dominates and the
      honest headline is "you ran out of RAM", not "bandwidth".
    * The intercept t0 moves with kv_bits -> the ablation is confounded (quantised KV
      changed the kernel path itself), and P2 cannot be read causally.

VARIABLES
    Independent
        context_len   : prompt tokens already in the KV cache before decoding starts.
                        default sweep 512 .. 131072, geometric
        kv_bits       : None (fp16 cache) | 8 | 4        <- the causal ablation
        model         : one primary model; --models lets you add a second size to show
                        that the intercept scales with weights while the slope scales
                        with KV bytes
    Dependent
        prefill_tok_s, ttft_s, decode_tok_s, ms_per_decode_token,
        peak_mlx_memory_bytes, active_mlx_memory_bytes,
        swap_used_mb, compressed_mb  (sampled after the cell)
        kv_bytes_analytic (computed from model config, not measured)
    Controlled / pinned
        gen_tokens fixed (default 128) at EVERY context length, so decode cost is measured
            over an identical number of steps and prefill is amortised identically
        greedy argmax sampling, no sampler randomness, no repetition penalty
        identical prompt construction (deterministic pseudo-token ids, not natural text,
            so tokenizer behaviour cannot vary the true context length)
        model resident and warmed before timing; a warmup cell is discarded
        wired-memory limit untouched; no other MLX process running

REPETITIONS AND STATISTICS (accounting for the author's own MLX non-determinism finding)
    MLX is not run-to-run deterministic and Apple Silicon timing is right-skewed.
    Default --reps 7 with 1 discarded warmup per cell. Report the MEDIAN with IQR.
    The script computes a robust CV (IQR/median) per cell and prints a WARNING for any
    cell above 0.10 — those cells must be re-run before they are charted.
    Fits (P1/P2) are performed on per-cell MEDIANS, never on raw reps.

USAGE
    # verify the harness in ~2 seconds, no MLX and no model needed
    python3 scripts/benchmarks/exp1_kv_cache_longcontext.py --dry-run

    # real end-to-end check on a tiny sweep, ~2 minutes
    uv run --with mlx --with mlx-lm python3 scripts/benchmarks/exp1_kv_cache_longcontext.py --smoke

    # the real thing
    uv run --with mlx --with mlx-lm python3 scripts/benchmarks/exp1_kv_cache_longcontext.py \
        --model mlx-community/Qwen3-8B-4bit \
        --contexts 512,1024,2048,4096,8192,16384,32768,65536,131072 \
        --kv-bits none,8,4 --gen-tokens 128 --reps 7

OUTPUT
    results/exp1_kv_cache.{jsonl,csv,json} + results/exp1_kv_cache.meta.json
    The JSON `analysis` block carries the per-arm affine fits, the implied effective
    bandwidth, and the slope ratios that decide P2.
"""

from __future__ import annotations

import argparse
import gc
import math
import random
import sys
import time
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

DEFAULT_MODEL = "mlx-community/Qwen3-8B-4bit"
DEFAULT_CONTEXTS = "512,1024,2048,4096,8192,16384,32768,65536,131072"
SMOKE_CONTEXTS = "512,1024"


# --------------------------------------------------------------------------------------
# Model config introspection — lets us compute KV bytes analytically
# --------------------------------------------------------------------------------------


def kv_geometry(model) -> dict:
    """
    Pull the numbers needed to compute KV bytes per token:
        2 (K and V) * n_layers * n_kv_heads * head_dim * bytes_per_elem

    Attribute names differ across mlx-lm model implementations, so probe a few.
    Returns Nones rather than raising — the measurement is still valid without it,
    only the analytic bandwidth number is lost.
    """
    cfg = getattr(model, "args", None) or getattr(model, "config", None)

    def pick(*names):
        for n in names:
            if cfg is not None and hasattr(cfg, n):
                return getattr(cfg, n)
            if isinstance(cfg, dict) and n in cfg:
                return cfg[n]
        return None

    n_layers = pick("num_hidden_layers", "n_layers", "num_layers")
    n_kv_heads = pick("num_key_value_heads", "n_kv_heads", "num_kv_heads")
    n_heads = pick("num_attention_heads", "n_heads")
    hidden = pick("hidden_size", "d_model")
    head_dim = pick("head_dim")
    if head_dim is None and hidden and n_heads:
        head_dim = hidden // n_heads
    if n_kv_heads is None:
        n_kv_heads = n_heads
    return {
        "n_layers": n_layers,
        "n_kv_heads": n_kv_heads,
        "n_heads": n_heads,
        "head_dim": head_dim,
        "hidden_size": hidden,
    }


def kv_bytes_per_token(geo: dict, kv_bits: int | None) -> float | None:
    if not (geo.get("n_layers") and geo.get("n_kv_heads") and geo.get("head_dim")):
        return None
    elems = 2 * geo["n_layers"] * geo["n_kv_heads"] * geo["head_dim"]
    if kv_bits is None:
        bytes_per = 2.0  # fp16 / bf16
    else:
        # quantised cache also stores per-group scale + bias (fp16 each)
        group_size = 64
        bytes_per = kv_bits / 8.0 + (2 * 2.0) / group_size
    return elems * bytes_per


# --------------------------------------------------------------------------------------
# Cache construction
# --------------------------------------------------------------------------------------


def make_cache(model, kv_bits: int | None, group_size: int = 64):
    """
    Build a prompt cache. For the quantised arms we construct QuantizedKVCache directly
    so that the cache is quantised from step 0 — mlx-lm's generate() only switches over
    after `quantized_kv_start` tokens, which would confound the slope measurement.
    Raises RuntimeError if the installed mlx-lm cannot do it; caller records a failed cell.
    """
    from mlx_lm.models import cache as cache_mod

    if kv_bits is None:
        return cache_mod.make_prompt_cache(model)

    QKV = getattr(cache_mod, "QuantizedKVCache", None)
    if QKV is None:
        raise RuntimeError("installed mlx-lm has no QuantizedKVCache; skip the kv_bits arms")
    layers = getattr(model, "layers", None)
    n = len(layers) if layers is not None else len(cache_mod.make_prompt_cache(model))
    return [QKV(group_size=group_size, bits=kv_bits) for _ in range(n)]


# --------------------------------------------------------------------------------------
# One measurement cell
# --------------------------------------------------------------------------------------


def run_cell(mx, model, mem, context_len: int, gen_tokens: int, kv_bits: int | None,
             chunk: int, vocab_size: int, seed: int) -> dict:
    """
    Prefill `context_len` synthetic tokens, then decode `gen_tokens` greedily,
    timing prefill and decode separately with explicit mx.eval barriers.

    Synthetic token ids (not natural text) are used on purpose: it guarantees the KV
    cache holds EXACTLY context_len entries at every sweep point, which a tokenizer
    round-trip cannot guarantee. Decode speed does not depend on token semantics.
    """
    rng = random.Random(seed)
    ids = [rng.randrange(1, max(2, vocab_size - 1)) for _ in range(context_len)]
    prompt = mx.array(ids)[None]

    mem.reset_peak()
    mem.clear_cache()
    gc.collect()

    cache = make_cache(model, kv_bits)

    # ---- prefill, chunked to bound peak activation memory at long contexts ----
    t0 = time.perf_counter()
    logits = None
    for i in range(0, prompt.shape[1], chunk):
        part = prompt[:, i : i + chunk]
        logits = model(part, cache=cache)
        mx.eval(logits)
    mx.eval([c.state for c in cache] if hasattr(cache[0], "state") else logits)
    prefill_s = time.perf_counter() - t0
    ttft_s = prefill_s  # first token is produced by argmax over the last prefill logits

    y = mx.argmax(logits[:, -1, :], axis=-1)[:, None]

    # ---- decode ----
    t1 = time.perf_counter()
    for _ in range(gen_tokens):
        logits = model(y, cache=cache)
        y = mx.argmax(logits[:, -1, :], axis=-1)[:, None]
        mx.eval(y)
    decode_s = time.perf_counter() - t1

    peak = mem.peak()
    active = mem.active()
    del cache, logits, y, prompt
    gc.collect()

    return {
        "prefill_s": prefill_s,
        "ttft_s": ttft_s,
        "prefill_tok_s": context_len / prefill_s if prefill_s > 0 else None,
        "decode_s": decode_s,
        "decode_tok_s": gen_tokens / decode_s if decode_s > 0 else None,
        "ms_per_decode_token": 1000.0 * decode_s / gen_tokens,
        "peak_mlx_memory_bytes": peak,
        "active_mlx_memory_bytes": active,
    }


# --------------------------------------------------------------------------------------
# Dry run
# --------------------------------------------------------------------------------------


def synth_cell(context_len: int, gen_tokens: int, kv_bits: int | None, rep: int) -> dict:
    """Plausible synthetic numbers so --dry-run exercises stats, fits, and IO end to end."""
    kvb = 2.0 if kv_bits is None else kv_bits / 8.0
    base_ms = 12.0
    slope_ms = 0.00022 * kvb / 2.0
    jitter = 1.0 + 0.03 * math.sin(rep * 1.7 + context_len)
    ms = (base_ms + slope_ms * context_len) * jitter
    decode_s = ms * gen_tokens / 1000.0
    prefill_s = context_len / 3500.0
    return {
        "prefill_s": prefill_s,
        "ttft_s": prefill_s,
        "prefill_tok_s": context_len / prefill_s,
        "decode_s": decode_s,
        "decode_tok_s": gen_tokens / decode_s,
        "ms_per_decode_token": ms,
        "peak_mlx_memory_bytes": int(5e9 + context_len * 1.2e5 * kvb / 2.0),
        "active_mlx_memory_bytes": int(4.5e9 + context_len * 1.2e5 * kvb / 2.0),
    }


# --------------------------------------------------------------------------------------
# Analysis
# --------------------------------------------------------------------------------------


def analyse(rows: list[dict], geo: dict, ram_bytes: int | None) -> dict:
    """Affine fits per (model, kv_bits) arm + the P2 slope-ratio test + implied bandwidth."""
    arms: dict[tuple, list[dict]] = {}
    for r in rows:
        if r.get("status") == "failed" or r.get("stat") != "median":
            continue
        arms.setdefault((r["model"], r["kv_bits"]), []).append(r)

    fits = {}
    for (model_id, kv_bits), cells in arms.items():
        cells = sorted(cells, key=lambda c: c["context_len"])
        xs = [c["context_len"] for c in cells]
        ys = [c["ms_per_decode_token"] / 1000.0 for c in cells]  # seconds
        # Restrict the fit to the pre-knee regime: cells with no swap growth.
        clean = [(x, y, c) for x, y, c in zip(xs, ys, cells) if not c.get("memory_pressure_flag")]
        fit_all = linfit(xs, ys)
        used_clean = len(clean) >= 3
        fit_clean = (
            linfit([x for x, _, _ in clean], [y for _, y, _ in clean]) if used_clean else fit_all
        )
        kvb = kv_bytes_per_token(geo, kv_bits)
        implied_bw = (kvb / fit_clean["slope"]) if (kvb and fit_clean["slope"]) else None
        fits[f"{model_id}|kv_bits={kv_bits}"] = {
            "kv_bits": kv_bits,
            "slope_s_per_token_of_context": fit_clean["slope"],
            "intercept_s": fit_clean["intercept"],
            "r2_prefit_clean": fit_clean["r2"],
            "r2_all_cells": fit_all["r2"],
            "n_cells_in_fit": fit_clean["n"],
            "fit_excluded_memory_pressure_cells": used_clean,
            "fit_caveat": (
                None if used_clean else
                "Fewer than 3 cells were free of memory pressure, so the fit uses ALL "
                "cells including paging ones. Treat the slope as contaminated and re-run "
                "with a smaller model or shorter contexts."
            ),
            "kv_bytes_per_token_analytic": kvb,
            "implied_effective_bandwidth_GBs": (implied_bw / 1e9) if implied_bw else None,
            "P1_linear_r2_gt_0.95": (fit_clean["r2"] or 0) > 0.95,
        }

    # P2: slope must fall ~2x for kv_bits=8 and ~4x for kv_bits=4 versus fp16.
    p2 = {}
    base = next((v for v in fits.values() if v["kv_bits"] is None), None)
    if base and base["slope_s_per_token_of_context"]:
        for key, v in fits.items():
            if v["kv_bits"] is None or not v["slope_s_per_token_of_context"]:
                continue
            ratio = base["slope_s_per_token_of_context"] / v["slope_s_per_token_of_context"]
            expected = 16.0 / v["kv_bits"]
            p2[key] = {
                "slope_reduction_vs_fp16": ratio,
                "expected_if_kv_bandwidth_bound": expected,
                "within_30pct_of_expected": abs(ratio - expected) / expected < 0.30,
                "intercept_drift_vs_fp16": (
                    v["intercept_s"] / base["intercept_s"] if base["intercept_s"] else None
                ),
            }

    knees = [
        {
            "model": r["model"],
            "kv_bits": r["kv_bits"],
            "context_len": r["context_len"],
            "swap_used_mb": r.get("swap_used_mb"),
            "peak_mlx_memory_bytes": r.get("peak_mlx_memory_bytes"),
        }
        for r in rows
        if r.get("stat") == "median" and r.get("memory_pressure_flag")
    ]

    return {
        "hypothesis": "H1: long-context decode decay on Apple Silicon is KV-cache read "
        "bandwidth bound, not capacity bound.",
        "kv_geometry": geo,
        "installed_ram_bytes": ram_bytes,
        "affine_fits": fits,
        "P2_slope_scales_with_kv_bytes": p2,
        "P4_memory_pressure_cells": knees,
        "how_to_read": (
            "P1 holds if r2_prefit_clean > 0.95. P2 holds if slope_reduction_vs_fp16 is "
            "~2 for kv_bits=8 and ~4 for kv_bits=4 while intercept_drift stays near 1.0. "
            "P3 holds if implied_effective_bandwidth_GBs is within ~2x of the streaming "
            "bandwidth measured by exp2. If P2 fails, H1 is falsified: the decay is not "
            "KV-read bound and the cause is the attention kernel or per-step overhead."
        ),
    }


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Isolate the cause of MLX long-context decode degradation on Apple Silicon."
    )
    add_common_args(ap)
    ap.add_argument("--model", default=DEFAULT_MODEL, help=f"MLX model id (default: {DEFAULT_MODEL})")
    ap.add_argument(
        "--models",
        default="",
        help="Comma-separated extra models to sweep. A second model size shows that the "
        "fit INTERCEPT tracks weight bytes while the SLOPE tracks KV bytes.",
    )
    ap.add_argument("--contexts", default=DEFAULT_CONTEXTS, help="Comma-separated context lengths")
    ap.add_argument(
        "--kv-bits",
        default="none,8,4",
        help="Comma-separated cache precisions: none (fp16), 8, 4. 'none' alone measures "
        "the symptom; including 8 and 4 is what makes the result CAUSAL.",
    )
    ap.add_argument("--gen-tokens", type=int, default=128, help="Decode steps per cell (default 128)")
    ap.add_argument("--reps", type=int, default=7, help="Repetitions per cell (default 7)")
    ap.add_argument("--warmup", type=int, default=1, help="Discarded warmup reps per cell (default 1)")
    ap.add_argument("--prefill-chunk", type=int, default=2048, help="Prefill chunk size (default 2048)")
    ap.add_argument(
        "--max-context-bytes",
        type=float,
        default=0.85,
        help="Flag the memory-pressure regime once measured peak MLX memory exceeds this "
        "fraction of installed RAM (default 0.85).",
    )
    ap.add_argument(
        "--swap-delta-mb",
        type=float,
        default=1024.0,
        help="Flag the memory-pressure regime once swap grows this many MB ABOVE the "
        "baseline captured at startup (default 1024). Absolute swap is not used: macOS "
        "normally carries GBs of swap from unrelated apps.",
    )
    args = ap.parse_args()

    if args.smoke:
        args.contexts = SMOKE_CONTEXTS
        args.reps = 2
        args.warmup = 1
        args.gen_tokens = 32
    if args.dry_run:
        args.reps = min(args.reps, 3)

    contexts = [int(c) for c in args.contexts.split(",") if c.strip()]
    kv_arms: list[int | None] = [
        None if k.strip().lower() in ("none", "fp16", "") else int(k)
        for k in args.kv_bits.split(",")
        if k.strip()
    ]
    models = [args.model] + [m for m in args.models.split(",") if m.strip()]

    meta = collect_metadata(
        {
            "experiment": "exp1_kv_cache_longcontext",
            "args": vars(args),
            "models": models,
            "contexts": contexts,
            "kv_bits_arms": kv_arms,
        }
    )
    banner("EXP1 — KV cache & long-context decode decay", meta)

    writer = ResultWriter(Path(args.results_dir), out_name("exp1_kv_cache", args.tag), meta)
    total = len(models) * len(kv_arms) * len(contexts)
    prog = Progress(total, "exp1")
    ram_bytes = meta.get("ram_bytes")
    # macOS routinely carries several GB of swap from unrelated apps. Flagging on the
    # ABSOLUTE swap figure marks every cell as paging and destroys the fit. What matters
    # is swap the BENCHMARK caused, so record a baseline and flag on the delta.
    swap_baseline_mb = (host_memory_pressure().get("swap_used_mb") or 0.0) if not args.dry_run else 0.0
    meta["swap_baseline_mb"] = swap_baseline_mb
    print(f"swap baseline: {swap_baseline_mb:.0f} MB (pressure is judged on growth above this)\n", flush=True)
    geo: dict = {}
    all_median_rows: list[dict] = []

    mx = None if args.dry_run else require_mlx()

    try:
        for model_id in models:
            model = tokenizer = None
            mem = None
            vocab_size = 32000

            if not args.dry_run:
                from mlx_lm import load

                print(f"\nloading {model_id} ...", flush=True)
                t_load = time.perf_counter()
                model, tokenizer = load(model_id)
                mx.eval(model.parameters())
                print(f"loaded in {fmt_dur(time.perf_counter() - t_load)}", flush=True)
                mem = MemProbe(mx)
                geo = kv_geometry(model)
                vocab_size = getattr(tokenizer, "vocab_size", None) or 32000
                print(f"kv geometry: {geo}", flush=True)

            for kv_bits in kv_arms:
                arm_dead = False
                for ctx in contexts:
                    if arm_dead:
                        writer.note_failure(
                            model=model_id, kv_bits=kv_bits, context_len=ctx,
                            reason="arm aborted after earlier failure at shorter context",
                        )
                        prog.step(f"{model_id} kv={kv_bits} ctx={ctx} SKIPPED")
                        continue

                    reps: list[dict] = []
                    cell_failed = None
                    for rep in range(args.warmup + args.reps):
                        try:
                            if args.dry_run:
                                r = synth_cell(ctx, args.gen_tokens, kv_bits, rep)
                            else:
                                r = run_cell(
                                    mx, model, mem, ctx, args.gen_tokens, kv_bits,
                                    args.prefill_chunk, vocab_size, args.seed + rep,
                                )
                        except Exception as e:  # OOM, unsupported arm, anything
                            cell_failed = f"{type(e).__name__}: {e}"
                            break
                        if rep >= args.warmup:
                            reps.append(r)
                            writer.append(
                                {
                                    "stat": "rep", "model": model_id, "kv_bits": kv_bits,
                                    "context_len": ctx, "gen_tokens": args.gen_tokens,
                                    "rep": rep - args.warmup, **r,
                                }
                            )

                    if cell_failed or not reps:
                        writer.note_failure(
                            model=model_id, kv_bits=kv_bits, context_len=ctx, reason=cell_failed
                        )
                        arm_dead = True
                        prog.step(f"{model_id} kv={kv_bits} ctx={ctx} FAILED: {cell_failed}")
                        continue

                    pressure = host_memory_pressure() if not args.dry_run else {"swap_used_mb": 0.0}
                    peak = max((r["peak_mlx_memory_bytes"] or 0) for r in reps)
                    swap_delta = (pressure.get("swap_used_mb") or 0.0) - swap_baseline_mb
                    pressure_flag = bool(
                        (ram_bytes and peak > args.max_context_bytes * ram_bytes)
                        or swap_delta > args.swap_delta_mb
                    )

                    med_row = {
                        "stat": "median", "model": model_id, "kv_bits": kv_bits,
                        "context_len": ctx, "gen_tokens": args.gen_tokens,
                        "kv_bytes_per_token_analytic": kv_bytes_per_token(geo, kv_bits),
                        "peak_mlx_memory_bytes": peak,
                        "swap_used_mb": pressure.get("swap_used_mb"),
                        "swap_delta_mb": swap_delta,
                        "compressed_mb": pressure.get("compressed_mb"),
                        "memory_pressure_flag": pressure_flag,
                    }
                    for field in (
                        "decode_tok_s", "ms_per_decode_token", "prefill_tok_s", "ttft_s"
                    ):
                        s = robust_stats([r[field] for r in reps], prefix=f"{field}_")
                        med_row[field] = s.get(f"{field}_median")
                        med_row[f"{field}_iqr"] = s.get(f"{field}_iqr")
                        med_row[f"{field}_cv"] = s.get(f"{field}_cv_robust")
                    noisy = (med_row.get("decode_tok_s_cv") or 0) > 0.10
                    med_row["noisy_cell"] = noisy
                    writer.append(med_row)
                    all_median_rows.append(med_row)

                    warn = "  <<< NOISY, re-run this cell" if noisy else ""
                    prog.step(
                        f"{model_id} kv={kv_bits} ctx={ctx:>7} "
                        f"decode={med_row['decode_tok_s']:.2f} tok/s "
                        f"({med_row['ms_per_decode_token']:.2f} ms/tok) "
                        f"peak={peak / 1e9:.2f} GB{warn}"
                    )

                    if pressure_flag:
                        print(
                            f"  !! memory-pressure regime entered at ctx={ctx} "
                            f"(peak {peak / 1e9:.1f} GB, swap +{swap_delta:.0f} MB over baseline). "
                            f"Cells beyond here measure paging, not bandwidth.",
                            flush=True,
                        )

            del model, tokenizer
            gc.collect()

    except KeyboardInterrupt:
        print("\ninterrupted — finalising whatever was collected so far", flush=True)
    finally:
        prog.done_msg()
        payload = writer.finalize(analyse(all_median_rows, geo, ram_bytes))
        writer.close()
        print(f"\nwrote:\n  {writer.jsonl_path}\n  {writer.csv_path}\n  {writer.json_path}")
        fits = payload["analysis"].get("affine_fits", {})
        if fits:
            print("\n--- affine fits (t_decode = t0 + slope * context_len) ---")
            for k, v in fits.items():
                print(
                    f"  {k}: slope={v['slope_s_per_token_of_context']:.3e} s/ctx-token  "
                    f"t0={v['intercept_s']:.4f} s  R2={v['r2_prefit_clean']:.4f}  "
                    f"implied BW={v['implied_effective_bandwidth_GBs']}"
                )
        p2 = payload["analysis"].get("P2_slope_scales_with_kv_bytes", {})
        if p2:
            print("\n--- P2 causal test (slope must scale with KV bytes) ---")
            for k, v in p2.items():
                print(
                    f"  {k}: observed {v['slope_reduction_vs_fp16']:.2f}x vs expected "
                    f"{v['expected_if_kv_bandwidth_bound']:.2f}x -> "
                    f"{'SUPPORTS H1' if v['within_30pct_of_expected'] else 'DOES NOT SUPPORT H1'}"
                )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
