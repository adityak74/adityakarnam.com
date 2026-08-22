#!/usr/bin/env python3
"""
exp5_speculative_decoding.py
=============================
EXPERIMENT 5 — Does speculative decoding actually pay off on unified memory, and
                how many draft tokens is too many?

TARGET QUERY
    "speculative decoding mlx apple silicon" / "mlx draft model speedup"

WHY THIS EXPERIMENT
    Speculative decoding trades draft-model compute for fewer expensive target-model
    forward passes. On a GPU cluster with spare compute this is close to free. On a
    unified-memory Apple Silicon machine, BOTH models share the same memory bandwidth
    budget that exp1-exp4 already showed is the actual bottleneck for decode. It is not
    obvious a priori that draft-then-verify beats plain autoregressive decode here —
    the draft model's forward passes are not free, they compete for the same bandwidth
    the target model needs.

HYPOTHESIS (H5)
    H5a: speculative decoding improves generation tok/s over the target model alone,
         but the win is smaller than commonly quoted GPU numbers because of shared
         memory bandwidth contention between draft and target.
    H5b: there is a sweet spot for --num-draft-tokens. Too few wastes the fixed
         overhead of running the draft model; too many wastes compute on draft tokens
         that get rejected once the draft model's predictions diverge from the target's,
         costing more than it saves. The relationship is therefore non-monotonic.
    H5c: acceptance rate (fraction of emitted tokens that originated from the draft
         model) is higher on easy/predictable continuations (e.g. code, structured
         text) than on open-ended generation, and acceptance rate predicts speedup
         better than num_draft_tokens alone.

FALSIFIABLE PREDICTIONS
    P1: speculative generation_tps > baseline generation_tps for at least one
        num_draft_tokens value. If not, H5a is falsified on this hardware and the
        honest headline is "speculative decoding doesn't help on M-series unified
        memory at this model size pairing".
    P2: generation_tps as a function of num_draft_tokens is NOT monotonically
        increasing — there is an interior maximum. If tok/s keeps rising with more
        draft tokens across the full swept range, H5b is falsified (or the range
        needs to extend further).
    P3: acceptance_rate on the structured (code) prompt is higher than on the
        open-ended (creative) prompt.

VARIABLES
    Independent : mode (baseline | speculative), num_draft_tokens in {1,2,4,8,16}
                  (baseline is equivalent to num_draft_tokens=0, run once per prompt),
                  prompt_kind (structured | open_ended)
    Dependent   : generation_tps, peak_memory_gb, acceptance_rate (speculative only)
    Controlled  : same draft/target model pair for every speculative cell, greedy
                  decode (temp handled by mlx_lm defaults / generate_step kwargs),
                  same max_tokens per prompt_kind, single process (draft+target
                  co-resident, nothing else sharing the GPU)

MODEL PAIR
    Target : mlx-community/Qwen3-8B-4bit
    Draft  : mlx-community/Qwen3-0.6B-4bit
    Same tokenizer family (both Qwen3) is a hard requirement for mlx_lm's speculative
    decoding — the draft model must use the same tokenizer as the target.

REPETITIONS
    --reps 5, warmup 1, median + IQR, robust CV > 0.10 flags a cell.

RUNTIME
    ~15-25 min for the default sweep on an 8B target / 0.6B draft pair.

USAGE
    python3 scripts/benchmarks/exp5_speculative_decoding.py --dry-run
    <venv>/bin/python scripts/benchmarks/exp5_speculative_decoding.py --smoke
    <venv>/bin/python scripts/benchmarks/exp5_speculative_decoding.py

OUTPUT
    results/exp5_speculative_decoding.{jsonl,csv,json}
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
    fmt_dur,
    out_name,
    require_mlx,
    robust_stats,
)

DEFAULT_TARGET = "mlx-community/Qwen3-8B-4bit"
DEFAULT_DRAFT = "mlx-community/Qwen3-0.6B-4bit"
DEFAULT_DRAFT_TOKENS = "1,2,4,8,16"

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
    p.add_argument("--target-model", default=DEFAULT_TARGET)
    p.add_argument("--draft-model", default=DEFAULT_DRAFT)
    p.add_argument("--draft-tokens", default=DEFAULT_DRAFT_TOKENS, help="Comma-separated num_draft_tokens sweep")
    p.add_argument("--reps", type=int, default=5)
    p.add_argument("--warmup", type=int, default=1)
    return p


def run_generation(model, tokenizer, prompt: str, max_tokens: int, draft_model=None, num_draft_tokens=None):
    """One generation call. Returns (generation_tps, peak_memory_gb, acceptance_rate)."""
    from mlx_lm.generate import stream_generate

    kwargs = {}
    if draft_model is not None:
        kwargs["draft_model"] = draft_model
        kwargs["num_draft_tokens"] = num_draft_tokens

    last = None
    from_draft_count = 0
    total_count = 0
    for resp in stream_generate(model, tokenizer, prompt, max_tokens=max_tokens, **kwargs):
        last = resp
        total_count += 1
        if resp.from_draft:
            from_draft_count += 1

    acceptance_rate = (from_draft_count / total_count) if (draft_model is not None and total_count) else None
    return last.generation_tps, last.peak_memory, acceptance_rate


def main() -> None:
    args = build_argparser().parse_args()
    draft_token_values = [int(x) for x in args.draft_tokens.split(",") if x.strip()]

    metadata = collect_metadata(
        extra={
            "experiment": "exp5_speculative_decoding",
            "target_model": args.target_model,
            "draft_model": args.draft_model,
            "draft_tokens_swept": draft_token_values,
            "prompts": {k: {"max_tokens": v[1]} for k, v in PROMPTS.items()},
            "args": vars(args),
        }
    )
    banner("exp5: speculative decoding on Apple Silicon", metadata)

    writer = ResultWriter(Path(args.results_dir), out_name("exp5_speculative_decoding", args.tag), metadata)

    if args.dry_run:
        import random

        rng = random.Random(args.seed)
        for prompt_kind in PROMPTS:
            for mode, ndt in [("baseline", 0)] + [("speculative", n) for n in draft_token_values]:
                for rep in range(args.reps):
                    writer.append(
                        {
                            "prompt_kind": prompt_kind,
                            "mode": mode,
                            "num_draft_tokens": ndt,
                            "rep": rep,
                            "generation_tps": rng.uniform(20, 80),
                            "peak_memory_gb": rng.uniform(4, 8),
                            "acceptance_rate": rng.uniform(0.3, 0.8) if mode == "speculative" else None,
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
        draft_token_values = draft_token_values[:2]

    print(f"Loading target model: {args.target_model}")
    target_model, tokenizer = load(args.target_model)
    print(f"Loading draft model:  {args.draft_model}")
    draft_model, draft_tokenizer = load(args.draft_model)
    mem = MemProbe(mx)

    cells = []
    for prompt_kind, _ in prompt_items:
        cells.append((prompt_kind, "baseline", 0))
        for ndt in draft_token_values:
            cells.append((prompt_kind, "speculative", ndt))

    progress = Progress(total=len(cells) * (reps + args.warmup), label="exp5")

    for prompt_kind, prompt_text_and_len in [(k, v) for k, v in prompt_items]:
        prompt_text, max_tokens = prompt_text_and_len
        for mode, ndt in [c[1:] for c in cells if c[0] == prompt_kind]:
            tps_vals, mem_vals, acc_vals = [], [], []
            draft_arg = draft_model if mode == "speculative" else None
            for i in range(args.warmup + reps):
                mem.reset_peak()
                gc.collect()
                try:
                    tps, peak_gb, acc = run_generation(
                        target_model,
                        tokenizer,
                        prompt_text,
                        max_tokens,
                        draft_model=draft_arg,
                        num_draft_tokens=ndt if mode == "speculative" else None,
                    )
                except Exception as e:  # noqa: BLE001
                    writer.note_failure(prompt_kind=prompt_kind, mode=mode, num_draft_tokens=ndt, error=str(e))
                    progress.step(f"{prompt_kind}/{mode}/ndt={ndt} FAILED: {e}")
                    continue
                progress.step(f"{prompt_kind}/{mode}/ndt={ndt} tps={tps:.1f}")
                if i < args.warmup:
                    continue
                tps_vals.append(tps)
                mem_vals.append(peak_gb)
                if acc is not None:
                    acc_vals.append(acc)

            row = {
                "prompt_kind": prompt_kind,
                "mode": mode,
                "num_draft_tokens": ndt,
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
