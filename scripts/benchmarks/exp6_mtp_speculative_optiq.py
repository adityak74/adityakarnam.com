#!/usr/bin/env python3
"""
exp6_mtp_speculative_optiq.py
==============================
EXPERIMENT 6 — Does a self-speculative MTP head beat plain autoregressive decode
                on a 27B dense model, and does the vendor's claimed 1.4x hold up?

TARGET QUERY
    "mtp speculative decoding mlx" / "multi-token prediction apple silicon" /
    "optiq mtp benchmark"

WHY THIS EXPERIMENT
    exp5 tested speculative decoding with a *separate* small draft model
    (Qwen3-0.6B drafting for Qwen3-8B). This experiment tests the other kind of
    speculative decoding: a single model with a built-in multi-token-prediction
    (MTP) head that drafts its own next few tokens, verified in one batched pass
    by the same model's main head. No second model, no second set of weights
    loaded, no separate tokenizer-compatibility requirement.

    The model (`mlx-community/Qwen3.6-27B-OptiQ-4bit`) ships a bundled MTP head
    and the vendor (mlx-optiq) publishes a specific claim on the model card:
    "enables 1.4x decode via `optiq serve --mtp`". That is a falsifiable,
    checkable number. This experiment checks it independently, on this machine,
    with this repo's own methodology (median/IQR over reps, not a single run).

HYPOTHESIS (H6)
    H6a: MTP decoding (depth>=1) is faster than depth=0 (plain AR) on at least
         one depth setting, replicating the direction of the vendor's claim.
    H6b: like exp5's external-draft-model case, there is a sweet spot depth;
         the CLI's own help text says depth 2 is the "empirical sweet spot on
         Qwen3.5/3.6 (acceptance ~70% at depth 2, drops at depth 3+)" — this
         experiment checks whether throughput (not just acceptance) also peaks
         near depth 2, or whether they diverge the way exp5's num_draft_tokens
         and acceptance rate diverged.
    H6c: acceptance rate is higher on the structured (code) prompt than the
         open-ended prompt, mirroring exp5's finding for external-draft
         speculative decoding.

FALSIFIABLE PREDICTIONS
    P1: decode_tok_s at some depth > 0 exceeds decode_tok_s at depth 0. If not,
        H6a is falsified and the vendor's 1.4x claim does not replicate on this
        hardware/prompt set.
    P2: decode_tok_s as a function of depth is not monotonically increasing.
    P3: acceptance_rate on the structured prompt exceeds the open-ended prompt
        at matched depth.

MODEL
    mlx-community/Qwen3.6-27B-OptiQ-4bit (dense 27B, mixed 4/8-bit OptiQ quant,
    bundled `mtp.safetensors` head). Single model, single set of weights loaded
    once via `optiq.runtime.engine.OptiqEngine`; depth=0 selects the plain AR
    path in the SAME loaded engine, depth>=1 selects the MTP path. This avoids
    the load-order confound of comparing two separate processes.

REPETITIONS
    --reps 5, warmup 1, median + IQR, robust CV > 0.10 flags a cell.

USAGE
    <venv>/bin/python scripts/benchmarks/exp6_mtp_speculative_optiq.py --dry-run
    <venv>/bin/python scripts/benchmarks/exp6_mtp_speculative_optiq.py --smoke
    <venv>/bin/python scripts/benchmarks/exp6_mtp_speculative_optiq.py

OUTPUT
    results/exp6_mtp_speculative_optiq.{jsonl,csv,json}
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

DEFAULT_MODEL = "mlx-community/Qwen3.6-27B-OptiQ-4bit"
DEFAULT_DEPTHS = "1,2,3,4"

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
    p.add_argument("--depths", default=DEFAULT_DEPTHS, help="Comma-separated MTP depths (num draft tokens/cycle)")
    p.add_argument("--reps", type=int, default=5)
    p.add_argument("--warmup", type=int, default=1)
    return p


def main() -> None:
    args = build_argparser().parse_args()
    depth_values = [int(x) for x in args.depths.split(",") if x.strip()]

    metadata = collect_metadata(
        extra={
            "experiment": "exp6_mtp_speculative_optiq",
            "model": args.model,
            "depths_swept": depth_values,
            "prompts": {k: {"max_tokens": v[1]} for k, v in PROMPTS.items()},
            "args": vars(args),
        }
    )
    banner("exp6: MTP self-speculative decoding (optiq) on Apple Silicon", metadata)

    writer = ResultWriter(Path(args.results_dir), out_name("exp6_mtp_speculative_optiq", args.tag), metadata)

    if args.dry_run:
        import random

        rng = random.Random(args.seed)
        for prompt_kind in PROMPTS:
            for mode, depth in [("AR", 0)] + [("MTP", d) for d in depth_values]:
                for rep in range(args.reps):
                    writer.append(
                        {
                            "prompt_kind": prompt_kind,
                            "mode": mode,
                            "depth": depth,
                            "rep": rep,
                            "decode_tok_s": rng.uniform(20, 80),
                            "acceptance_rate": rng.uniform(0.3, 0.8) if mode == "MTP" else None,
                        }
                    )
        writer.finalize()
        writer.close()
        print("dry-run complete:", writer.json_path)
        return

    mx = require_mlx()
    from optiq.runtime.engine import OptiqEngine

    reps = 1 if args.smoke else args.reps
    prompt_items = list(PROMPTS.items())
    depths = depth_values[:2] if args.smoke else depth_values
    if args.smoke:
        prompt_items = prompt_items[:1]

    print(f"Loading model: {args.model}")
    engine = OptiqEngine(args.model)
    if not engine.has_mtp:
        print("ERROR: loaded model has no MTP head; nothing to benchmark.")
        writer.close()
        sys.exit(1)
    mem = MemProbe(mx)

    cells = []
    for prompt_kind, _ in prompt_items:
        cells.append((prompt_kind, "AR", 0))
        for d in depths:
            cells.append((prompt_kind, "MTP", d))

    progress = Progress(total=len(cells) * (reps + args.warmup), label="exp6")

    for prompt_kind, (prompt_text, max_tokens) in prompt_items:
        for _, mode, depth in [c for c in cells if c[0] == prompt_kind]:
            tps_vals, mem_vals, acc_vals = [], [], []
            for i in range(args.warmup + reps):
                mem.reset_peak()
                gc.collect()
                try:
                    stats = engine.generate(
                        prompt_text, max_tokens=max_tokens, depth=depth, temperature=0.0,
                    )
                except Exception as e:  # noqa: BLE001
                    writer.note_failure(prompt_kind=prompt_kind, mode=mode, depth=depth, error=str(e))
                    progress.step(f"{prompt_kind}/{mode}/depth={depth} FAILED: {e}")
                    continue
                peak_bytes = mem.peak()
                peak_gb = (peak_bytes / 1e9) if peak_bytes is not None else None
                progress.step(f"{prompt_kind}/{mode}/depth={depth} tok_s={stats.decode_tok_s:.1f}")
                if i < args.warmup:
                    continue
                tps_vals.append(stats.decode_tok_s)
                if peak_gb is not None:
                    mem_vals.append(peak_gb)
                if mode == "MTP":
                    acc_vals.append(stats.acceptance_rate)

            row = {
                "prompt_kind": prompt_kind,
                "mode": mode,
                "depth": depth,
                **robust_stats(tps_vals, prefix="tps_"),
                **robust_stats(mem_vals, prefix="mem_gb_"),
            }
            if acc_vals:
                row.update(robust_stats(acc_vals, prefix="acceptance_"))
            writer.append(row)

    writer.finalize()
    writer.close()
    progress.done_msg()
    print(f"Results: {writer.json_path}")


if __name__ == "__main__":
    main()
