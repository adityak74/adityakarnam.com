#!/usr/bin/env python3
"""
exp2_bandwidth_roofline.py
==========================
EXPERIMENT 2 — What is the actual achievable unified-memory bandwidth, and where does
attention-over-KV sit against it?

TARGET QUERY
    "mlx apple silicon optimization" (17 impressions, pos 9.3)
    Also: this experiment supplies the DENOMINATOR that makes exp1's causal claim checkable.
    Without an independently measured bandwidth ceiling, exp1's "implied effective
    bandwidth" is an unfalsifiable number. With it, the claim becomes testable.

HYPOTHESIS (H2)
    Apple Silicon LLM decode is memory-bandwidth bound, and the bandwidth ceiling that
    matters is the ACHIEVED streaming bandwidth in MLX (measurably below the marketing
    peak), not the spec-sheet figure. Specifically:
      H2a: a large elementwise streaming kernel reaches some B_stream GB/s that is a
           stable fraction (expected 60-85%) of Apple's published peak for the chip.
      H2b: matrix-vector (GEMV, the shape decode actually runs) is bandwidth bound and
           lands near B_stream, while matrix-matrix (GEMM, the shape prefill and batching
           run) is compute bound and reaches far higher arithmetic intensity.
      H2c: a synthetic scaled-dot-product attention over a KV cache of length L achieves
           an effective bandwidth in the same band as B_stream, and its time is linear
           in L. This is exp1's mechanism reproduced in isolation, with the model,
           tokenizer, sampler, and Python loop all removed.

FALSIFIABLE PREDICTIONS
    P1: B_stream is reproducible within 10% across reps and roughly flat above ~256 MB
        working sets (below that, cache effects inflate it — those points are reported
        but excluded from the ceiling estimate).
        NOTE: the timing loop repeats each op to amortise launch overhead, which keeps
        small operands resident in the system-level cache. Any cell whose traffic is
        under --ceiling-min-mb is marked `cache_resident_suspect` and excluded from every
        ceiling and efficiency figure. Do NOT chart those cells as bandwidth.
    P2: GEMV achieved GB/s >= 0.5 * B_stream, and GEMV achieved GFLOP/s is a small
        fraction of GEMM GFLOP/s. If GEMV instead reaches GEMM-class FLOP/s, decode is
        NOT bandwidth bound and H1/H2 both need rethinking.
    P3: synthetic attention time is linear in KV length with R^2 > 0.98 and its implied
        bandwidth is within 2x of B_stream.

WHAT WOULD FALSIFY H2
    * Attention-over-KV achieves far LOWER effective bandwidth than B_stream (say < 25%)
      -> the attention kernel is inefficient, and the honest story becomes "MLX's
      attention kernel leaves bandwidth on the table at long context", which is a
      different (and more interesting) post than "physics".
    * B_stream varies wildly with buffer size above 256 MB -> the ceiling is not a
      stable reference and exp1's P3 cannot be evaluated.

VARIABLES
    Independent : buffer_bytes (stream sweep), matrix N (GEMV/GEMM sweep),
                  kv_len (synthetic attention sweep), dtype (float16, float32)
    Dependent   : achieved_gb_s, achieved_gflop_s, seconds_per_op
    Controlled  : same dtype per arm, mx.eval barrier around every timed region,
                  warmup iterations discarded, allocation done outside the timed loop

REPETITIONS
    --reps 9 by default; this experiment is cheap so repetitions are free and the
    tighter dispersion makes it a better reference. Median + IQR reported, same rule
    as exp1: robust CV > 0.10 flags the cell.

RUNTIME
    Full run ~5-10 minutes. This is the cheapest experiment in the suite and it should
    be run FIRST, because it validates that the machine is in a clean thermal/power
    state before the expensive runs begin.

USAGE
    python3 scripts/benchmarks/exp2_bandwidth_roofline.py --dry-run
    uv run --with mlx python3 scripts/benchmarks/exp2_bandwidth_roofline.py --smoke
    uv run --with mlx python3 scripts/benchmarks/exp2_bandwidth_roofline.py

OUTPUT
    results/exp2_bandwidth.{jsonl,csv,json}
    The `analysis` block reports B_stream_GBs — copy that number into the exp1 write-up
    as the reference ceiling.
"""

from __future__ import annotations

import argparse
import gc
import math
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
    linfit,
    out_name,
    require_mlx,
    robust_stats,
)

DEFAULT_BUFFERS_MB = "16,64,256,512,1024,2048"
DEFAULT_MATRIX_N = "1024,2048,4096,8192,12288"
DEFAULT_KV_LENS = "1024,4096,16384,65536,131072"


TARGET_TIMED_REGION_S = 0.020


def time_op(mx, fn, reps: int, warmup: int = 3, target_s: float = TARGET_TIMED_REGION_S
            ) -> list[float]:
    """
    Time `fn` with explicit eval barriers, amortising command-buffer launch overhead.

    A single MLX op at small sizes can complete in tens of microseconds, which is the
    same order as the launch + eval + perf_counter overhead. Timing one op at a time
    therefore measures the harness, not the hardware. So we calibrate an inner
    repeat count such that each timed region is at least `target_s`, run `inner` ops
    into a list, evaluate them all at once, and divide.

    Returns per-rep seconds PER OP, warmups dropped.
    """
    if hasattr(mx, "synchronize"):
        mx.synchronize()

    # calibration pass (also serves as the first warmup)
    t0 = time.perf_counter()
    r = fn()
    mx.eval(r)
    single = max(time.perf_counter() - t0, 1e-9)
    inner = max(1, min(1000, int(target_s / single)))
    del r

    out: list[float] = []
    for i in range(warmup + reps):
        if hasattr(mx, "synchronize"):
            mx.synchronize()
        t0 = time.perf_counter()
        results = [fn() for _ in range(inner)]
        mx.eval(results)
        dt = (time.perf_counter() - t0) / inner
        del results
        if i >= warmup:
            out.append(dt)
    return out


# --------------------------------------------------------------------------------------
# Arms
# --------------------------------------------------------------------------------------


def arm_stream(mx, nbytes: int, dtype, reps: int) -> dict:
    """
    Pure streaming: c = a + b over a large buffer.
    Traffic = 3 * nbytes (read a, read b, write c). This is the bandwidth ceiling probe.
    """
    itemsize = 2 if dtype == mx.float16 else 4
    n = nbytes // itemsize
    a = mx.ones((n,), dtype=dtype)
    b = mx.ones((n,), dtype=dtype)
    mx.eval(a, b)
    times = time_op(mx, lambda: a + b, reps)
    traffic = 3 * n * itemsize
    return {
        "kind": "stream_add",
        "bytes": n * itemsize,
        "traffic_bytes": traffic,
        "times": times,
        "gb_s": [traffic / t / 1e9 for t in times],
    }


def arm_gemv(mx, n: int, dtype, reps: int) -> dict:
    """
    GEMV: y = A @ x, A is (n, n). This is the shape a decode step runs for every
    weight matrix — one token in, one token out. Bandwidth bound by construction:
    2*n^2 FLOPs against n^2 bytes of weight traffic.
    """
    itemsize = 2 if dtype == mx.float16 else 4
    A = mx.ones((n, n), dtype=dtype)
    x = mx.ones((n, 1), dtype=dtype)
    mx.eval(A, x)
    times = time_op(mx, lambda: A @ x, reps)
    traffic = n * n * itemsize
    flops = 2 * n * n
    return {
        "kind": "gemv",
        "n": n,
        "traffic_bytes": traffic,
        "flops": flops,
        "times": times,
        "gb_s": [traffic / t / 1e9 for t in times],
        "gflop_s": [flops / t / 1e9 for t in times],
    }


def arm_gemm(mx, n: int, dtype, reps: int) -> dict:
    """
    GEMM: C = A @ B, both (n, n). This is the shape PREFILL and BATCHED decode run.
    Compute bound: 2*n^3 FLOPs against 3*n^2 bytes. The gap between this and GEMV is
    exactly the headroom that batching (exp3) converts into throughput.
    """
    itemsize = 2 if dtype == mx.float16 else 4
    A = mx.ones((n, n), dtype=dtype)
    B = mx.ones((n, n), dtype=dtype)
    mx.eval(A, B)
    times = time_op(mx, lambda: A @ B, reps)
    traffic = 3 * n * n * itemsize
    flops = 2 * n * n * n
    return {
        "kind": "gemm",
        "n": n,
        "traffic_bytes": traffic,
        "flops": flops,
        "times": times,
        "gb_s": [traffic / t / 1e9 for t in times],
        "gflop_s": [flops / t / 1e9 for t in times],
    }


def arm_attention(mx, kv_len: int, n_heads: int, n_kv_heads: int, head_dim: int,
                  dtype, reps: int) -> dict:
    """
    Synthetic single-token attention over a KV cache of `kv_len` entries — exp1's
    mechanism with the entire model removed. One query token attends over the whole
    cache. Traffic = K + V = 2 * kv_len * n_kv_heads * head_dim * itemsize.

    Uses mx.fast.scaled_dot_product_attention when available (the real kernel MLX uses),
    otherwise falls back to explicit softmax(QK^T)V so the arm still produces a number.
    """
    itemsize = 2 if dtype == mx.float16 else 4
    q = mx.ones((1, n_heads, 1, head_dim), dtype=dtype)
    k = mx.ones((1, n_kv_heads, kv_len, head_dim), dtype=dtype)
    v = mx.ones((1, n_kv_heads, kv_len, head_dim), dtype=dtype)
    mx.eval(q, k, v)
    scale = 1.0 / math.sqrt(head_dim)

    sdpa = getattr(getattr(mx, "fast", None), "scaled_dot_product_attention", None)
    if sdpa is not None:
        fn = lambda: sdpa(q, k, v, scale=scale)  # noqa: E731
        impl = "mx.fast.scaled_dot_product_attention"
    else:
        rep = n_heads // n_kv_heads

        def fn():
            kk = mx.repeat(k, rep, axis=1) if rep > 1 else k
            vv = mx.repeat(v, rep, axis=1) if rep > 1 else v
            s = (q @ kk.transpose(0, 1, 3, 2)) * scale
            return mx.softmax(s, axis=-1) @ vv

        impl = "manual_softmax_qk_v"

    times = time_op(mx, fn, reps)
    traffic = 2 * kv_len * n_kv_heads * head_dim * itemsize
    return {
        "kind": "attention_over_kv",
        "kv_len": kv_len,
        "impl": impl,
        "n_heads": n_heads,
        "n_kv_heads": n_kv_heads,
        "head_dim": head_dim,
        "traffic_bytes": traffic,
        "times": times,
        "gb_s": [traffic / t / 1e9 for t in times],
    }


# --------------------------------------------------------------------------------------
# Dry run
# --------------------------------------------------------------------------------------


def synth(kind: str, size: int, reps: int, dtype_bytes: int = 2) -> dict:
    if kind == "stream_add":
        traffic = 3 * size
        t = traffic / 300e9
    elif kind == "gemv":
        traffic = size * size * dtype_bytes
        t = traffic / 280e9
    elif kind == "gemm":
        traffic = 3 * size * size * dtype_bytes
        t = 2 * size**3 / 9e12
    else:
        traffic = 2 * size * 8 * 128 * dtype_bytes
        t = traffic / 220e9
    times = [t * (1 + 0.02 * math.sin(i)) for i in range(reps)]
    d = {"traffic_bytes": traffic, "times": times, "gb_s": [traffic / x / 1e9 for x in times]}
    if kind in ("gemv", "gemm"):
        flops = 2 * size * size * (size if kind == "gemm" else 1)
        d["flops"] = flops
        d["gflop_s"] = [flops / x / 1e9 for x in times]
    return d


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Measure achievable unified-memory bandwidth and the GEMV/GEMM/attention roofline."
    )
    add_common_args(ap)
    ap.add_argument("--buffers-mb", default=DEFAULT_BUFFERS_MB, help="Stream buffer sizes in MB")
    ap.add_argument("--matrix-n", default=DEFAULT_MATRIX_N, help="Square matrix dimensions")
    ap.add_argument("--kv-lens", default=DEFAULT_KV_LENS, help="Synthetic attention KV lengths")
    ap.add_argument("--dtypes", default="float16,float32", help="Comma-separated dtypes")
    ap.add_argument("--reps", type=int, default=9, help="Timed reps per cell (default 9)")
    ap.add_argument("--n-heads", type=int, default=32, help="Attention arm: query heads")
    ap.add_argument("--n-kv-heads", type=int, default=8, help="Attention arm: KV heads (GQA)")
    ap.add_argument("--head-dim", type=int, default=128, help="Attention arm: head dim")
    ap.add_argument(
        "--ceiling-min-mb", type=int, default=256,
        help="Stream buffers smaller than this are excluded from the B_stream ceiling "
             "estimate because they fit in cache and overstate bandwidth (default 256)",
    )
    args = ap.parse_args()

    if args.smoke:
        args.buffers_mb, args.matrix_n, args.kv_lens = "64,256", "1024,2048", "1024,4096"
        args.dtypes, args.reps = "float16", 3

    buffers = [int(b) for b in args.buffers_mb.split(",") if b.strip()]
    matrices = [int(n) for n in args.matrix_n.split(",") if n.strip()]
    kv_lens = [int(n) for n in args.kv_lens.split(",") if n.strip()]
    dtypes = [d.strip() for d in args.dtypes.split(",") if d.strip()]

    meta = collect_metadata({"experiment": "exp2_bandwidth_roofline", "args": vars(args)})
    banner("EXP2 — unified memory bandwidth & roofline", meta)

    writer = ResultWriter(Path(args.results_dir), out_name("exp2_bandwidth", args.tag), meta)
    total = len(dtypes) * (len(buffers) + 2 * len(matrices) + len(kv_lens))
    prog = Progress(total, "exp2")
    rows: list[dict] = []

    mx = None if args.dry_run else require_mlx()
    mem = MemProbe(mx) if mx else None

    cache_floor = args.ceiling_min_mb * 1024 * 1024

    def record(base: dict, dtype_name: str) -> None:
        st = robust_stats(base["gb_s"], prefix="gb_s_")
        row = {
            "dtype": dtype_name,
            **{k: v for k, v in base.items() if k not in ("times", "gb_s", "gflop_s")},
            "gb_s": st["gb_s_median"],
            "gb_s_iqr": st["gb_s_iqr"],
            "gb_s_cv": st["gb_s_cv_robust"],
            "seconds_median": robust_stats(base["times"])["median"],
            "noisy_cell": st["gb_s_cv_robust"] > 0.10,
            # Operands smaller than the system-level cache stay resident across the
            # inner repeat loop and report bandwidth far above what DRAM can deliver.
            # These cells are kept in the raw data but excluded from every ceiling and
            # efficiency figure — see `--ceiling-min-mb`.
            "cache_resident_suspect": base.get("traffic_bytes", 0) < cache_floor,
        }
        if "gflop_s" in base:
            fs = robust_stats(base["gflop_s"], prefix="gflop_s_")
            row["gflop_s"] = fs["gflop_s_median"]
            row["gflop_s_iqr"] = fs["gflop_s_iqr"]
        writer.append(row)
        rows.append(row)
        warn = "  <<< NOISY" if row["noisy_cell"] else ""
        extra = f" {row['gflop_s']:.0f} GFLOP/s" if "gflop_s" in row else ""
        prog.step(
            f"{dtype_name} {row['kind']} "
            f"{row.get('n') or row.get('kv_len') or row.get('bytes')} "
            f"-> {row['gb_s']:.1f} GB/s{extra}{warn}"
        )

    try:
        for dname in dtypes:
            dtype = getattr(mx, dname) if mx else None
            for mb in buffers:
                nbytes = mb * 1024 * 1024
                base = (
                    synth("stream_add", nbytes, args.reps)
                    if args.dry_run
                    else arm_stream(mx, nbytes, dtype, args.reps)
                )
                base.setdefault("kind", "stream_add")
                base["bytes"] = nbytes
                base["buffer_mb"] = mb
                record(base, dname)
                if mem:
                    mem.clear_cache()
                gc.collect()

            for n in matrices:
                for kind, fn in (("gemv", arm_gemv), ("gemm", arm_gemm)):
                    base = (
                        synth(kind, n, args.reps)
                        if args.dry_run
                        else fn(mx, n, dtype, args.reps)
                    )
                    base.setdefault("kind", kind)
                    base["n"] = n
                    record(base, dname)
                    if mem:
                        mem.clear_cache()
                    gc.collect()

            for L in kv_lens:
                base = (
                    synth("attention_over_kv", L, args.reps)
                    if args.dry_run
                    else arm_attention(
                        mx, L, args.n_heads, args.n_kv_heads, args.head_dim, dtype, args.reps
                    )
                )
                base.setdefault("kind", "attention_over_kv")
                base["kv_len"] = L
                record(base, dname)
                if mem:
                    mem.clear_cache()
                gc.collect()

    except KeyboardInterrupt:
        print("\ninterrupted — finalising", flush=True)
    finally:
        prog.done_msg()

        stream_ceiling = {}
        for dname in dtypes:
            vals = [
                r["gb_s"] for r in rows
                if r["dtype"] == dname and r["kind"] == "stream_add"
                and not r["cache_resident_suspect"]
            ]
            if vals:
                stream_ceiling[dname] = robust_stats(vals)

        attn_fit = {}
        for dname in dtypes:
            cells = sorted(
                (r for r in rows if r["dtype"] == dname and r["kind"] == "attention_over_kv"),
                key=lambda r: r["kv_len"],
            )
            big = [c for c in cells if not c["cache_resident_suspect"]] or cells
            if len(cells) >= 2:
                f = linfit([c["kv_len"] for c in cells], [c["seconds_median"] for c in cells])
                bw = [c["gb_s"] for c in big]
                ceil = (stream_ceiling.get(dname) or {}).get("median")
                attn_fit[dname] = {
                    "seconds_vs_kvlen_slope": f["slope"],
                    "seconds_vs_kvlen_r2": f["r2"],
                    "P3_linear_r2_gt_0.98": (f["r2"] or 0) > 0.98,
                    "attention_gb_s_median": robust_stats(bw)["median"],
                    "attention_efficiency_vs_stream": (
                        robust_stats(bw)["median"] / ceil if ceil else None
                    ),
                }

        gemv_vs_gemm = {}
        for dname in dtypes:
            gv = [
                r for r in rows if r["dtype"] == dname and r["kind"] == "gemv"
                and "gflop_s" in r and not r["cache_resident_suspect"]
            ] or [r for r in rows if r["dtype"] == dname and r["kind"] == "gemv" and "gflop_s" in r]
            gm = [r for r in rows if r["dtype"] == dname and r["kind"] == "gemm" and "gflop_s" in r]
            if gv and gm:
                gvmax = max(r["gflop_s"] for r in gv)
                gmmax = max(r["gflop_s"] for r in gm)
                ceil = (stream_ceiling.get(dname) or {}).get("median")
                gemv_bw = max(r["gb_s"] for r in gv)
                gemv_vs_gemm[dname] = {
                    "gemv_peak_gflop_s": gvmax,
                    "gemm_peak_gflop_s": gmmax,
                    "compute_headroom_x": gmmax / gvmax if gvmax else None,
                    "gemv_peak_gb_s": gemv_bw,
                    "gemv_bandwidth_efficiency_vs_stream": gemv_bw / ceil if ceil else None,
                    "P2_gemv_is_bandwidth_bound": (gemv_bw / ceil > 0.5) if ceil else None,
                }

        analysis = {
            "hypothesis": "H2: decode is bandwidth bound; the ceiling that matters is "
            "MLX-achieved streaming bandwidth, not spec-sheet peak.",
            "B_stream_GBs": {k: v.get("median") for k, v in stream_ceiling.items()},
            "B_stream_detail": stream_ceiling,
            "gemv_vs_gemm": gemv_vs_gemm,
            "attention_over_kv": attn_fit,
            "how_to_read": (
                "B_stream_GBs is the reference ceiling. Feed it into exp1: if exp1's "
                "implied_effective_bandwidth_GBs is within ~2x of it, exp1 P3 holds and the "
                "long-context decay is bandwidth physics. If attention_efficiency_vs_stream "
                "is well below ~0.25, the attention kernel itself is the bottleneck and the "
                "story is a software one, not a hardware one."
            ),
        }
        writer.finalize(analysis)
        writer.close()
        print(f"\nwrote:\n  {writer.jsonl_path}\n  {writer.csv_path}\n  {writer.json_path}")
        print("\n--- headline numbers ---")
        for k, v in analysis["B_stream_GBs"].items():
            print(f"  B_stream ({k}) = {v:.1f} GB/s" if v else f"  B_stream ({k}) = n/a")
        for k, v in gemv_vs_gemm.items():
            print(
                f"  {k}: GEMV {v['gemv_peak_gflop_s']:.0f} GFLOP/s @ "
                f"{v['gemv_peak_gb_s']:.0f} GB/s | GEMM {v['gemm_peak_gflop_s']:.0f} GFLOP/s "
                f"| compute headroom {v['compute_headroom_x']:.1f}x"
            )
        for k, v in attn_fit.items():
            eff = v["attention_efficiency_vs_stream"]
            print(
                f"  {k}: attention-over-KV {v['attention_gb_s_median']:.0f} GB/s "
                f"({eff:.0%} of stream ceiling)" if eff else f"  {k}: attention arm recorded"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
