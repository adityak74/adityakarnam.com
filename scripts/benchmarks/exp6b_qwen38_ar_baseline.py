#!/usr/bin/env python3
"""
exp6b_qwen38_ar_baseline.py
=============================
Plain autoregressive decode baseline for Qwen3.8-27B, for comparison against
the Qwen3.6-27B MTP self-speculative results in exp6.

WHY A SEPARATE SCRIPT
    Qwen3.8's MTP head ships as a separate 239MB sidecar repo
    (mlx-community/Qwen3.8-27B-MTP-4bit), not bundled into the base model like
    Qwen3.6-27B-OptiQ-4bit was. optiq's OptiqEngine only auto-detects an MTP
    head already embedded in the loaded checkpoint — there is no supported
    path to attach a separate MTP sidecar to a base model, and hand-splicing
    the raw safetensors would risk silently wrong generations with no quick
    way to verify correctness. So this script measures ONLY the plain-AR
    number on real Qwen3.8-27B weights, via stock mlx_lm (no optiq, no MTP).
    It is a same-methodology reference point, not a speculative-decoding
    result.

MODEL
    mlx-community/Qwen3.8-27B-4bit — tagged "image-text-to-text" (converted
    via mlx-vlm) but loadable as a plain text model: mlx_lm's own
    models/qwen3_5.py wraps a `language_model` submodule built from
    `text_config` and discards `vision_tower.*` weights during sanitize
    (confirmed by reading mlx_lm's source, not assumed from the README tag).

REPETITIONS
    --reps 5, warmup 1, median + IQR, robust CV > 0.10 flags a cell.

USAGE
    <venv>/bin/python scripts/benchmarks/exp6b_qwen38_ar_baseline.py --dry-run
    <venv>/bin/python scripts/benchmarks/exp6b_qwen38_ar_baseline.py --smoke
    <venv>/bin/python scripts/benchmarks/exp6b_qwen38_ar_baseline.py

OUTPUT
    results/exp6b_qwen38_ar_baseline.{jsonl,csv,json}
"""

from __future__ import annotations

import argparse
import gc
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from bench_common import (  # noqa: E402
    MemProbe,
    Progress,
    ResultWriter,
    add_common_args,
    banner,
    collect_metadata,
    out_name,
    require_mlx,
    robust_stats,
)

DEFAULT_MODEL = "mlx-community/Qwen3.8-27B-4bit"

PROMPTS = {
    "structured": (
        "Write a Python function `binary_search(arr, target)` that returns the index "
        "of target in a sorted list, or -1 if not found. Include a docstring and a "
        "short usage example. Then write three more small utility functions in the "
        "same file: `is_palindrome(s)`, `flatten(nested_list)`, and `chunk(lst, n)`. "
        "Keep each function under 10 lines.",
        320,
    ),
    "open_ended": (
        "Write a short reflection on what it might feel like for an AI model to run "
        "faster because another, smaller model is guessing its next words for it. "
        "Explore the idea from a few different angles.",
        320,
    ),
}


def build_argparser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    add_common_args(p)
    p.add_argument("--model", default=DEFAULT_MODEL)
    p.add_argument("--reps", type=int, default=5)
    p.add_argument("--warmup", type=int, default=1)
    return p


def run_generation(model, tokenizer, prompt: str, max_tokens: int):
    from mlx_lm.generate import stream_generate

    last = None
    for resp in stream_generate(model, tokenizer, prompt, max_tokens=max_tokens):
        last = resp
    return last.generation_tps, last.peak_memory


def main() -> None:
    args = build_argparser().parse_args()

    metadata = collect_metadata(
        extra={
            "experiment": "exp6b_qwen38_ar_baseline",
            "model": args.model,
            "prompts": {k: {"max_tokens": v[1]} for k, v in PROMPTS.items()},
            "args": vars(args),
        }
    )
    banner("exp6b: Qwen3.8-27B plain AR baseline (no MTP)", metadata)

    writer = ResultWriter(Path(args.results_dir), out_name("exp6b_qwen38_ar_baseline", args.tag), metadata)

    if args.dry_run:
        import random

        rng = random.Random(args.seed)
        for prompt_kind in PROMPTS:
            for rep in range(args.reps):
                writer.append(
                    {
                        "prompt_kind": prompt_kind,
                        "mode": "AR",
                        "rep": rep,
                        "generation_tps": rng.uniform(10, 20),
                        "peak_memory_gb": rng.uniform(15, 20),
                    }
                )
        writer.finalize()
        writer.close()
        print("dry-run complete:", writer.json_path)
        return

    mx = require_mlx()
    from mlx_lm.utils import load

    reps = 1 if args.smoke else args.reps
    prompt_items = list(PROMPTS.items())
    if args.smoke:
        prompt_items = prompt_items[:1]

    print(f"Loading model: {args.model}")
    model, tokenizer = load(args.model)
    mem = MemProbe(mx)

    progress = Progress(total=len(prompt_items) * (reps + args.warmup), label="exp6b")

    for prompt_kind, (prompt_text, max_tokens) in prompt_items:
        tps_vals, mem_vals = [], []
        for i in range(args.warmup + reps):
            mem.reset_peak()
            gc.collect()
            try:
                tps, peak_gb = run_generation(model, tokenizer, prompt_text, max_tokens)
            except Exception as e:  # noqa: BLE001
                writer.note_failure(prompt_kind=prompt_kind, mode="AR", error=str(e))
                progress.step(f"{prompt_kind}/AR FAILED: {e}")
                continue
            progress.step(f"{prompt_kind}/AR tps={tps:.1f}")
            if i < args.warmup:
                continue
            tps_vals.append(tps)
            mem_vals.append(peak_gb)

        row = {
            "prompt_kind": prompt_kind,
            "mode": "AR",
            **robust_stats(tps_vals, prefix="tps_"),
            **robust_stats(mem_vals, prefix="mem_gb_"),
        }
        writer.append(row)

    writer.finalize()
    writer.close()
    progress.done_msg()
    print(f"Results: {writer.json_path}")


if __name__ == "__main__":
    main()
