# 12. Evaluation and Benchmarks

> Chapter 12 teaches you to *evaluate* the harness (and the models it uses) *objectively*. A *benchmark* is a *defined* coding task (a repository, a prompt, a set of verification commands) that *produces* a *measurable* outcome (did it pass? how many steps? how long?). A *suite* of benchmarks is a *comparison* (model A vs model B). The harness *runs* benchmarks, *records* results (in a JSON file), and *compares* them (scores).

## The Problem

The model's quality is *ambiguous* (does it "fix the bug"?). A human says "yes," but the benchmark says "no" (the test output says "3 tests failed"). The harness must *measure* quality *objectively* (verification output, not the human's intuition).

An *evaluation* (or *benchmark*) is a *structured task*:
- A *repository* (the codebase to edit).
- A *prompt* (the user's request: "fix the auth bug").
- A *verification command* (e.g., `cargo test`).
- A *success criterion* (what counts as "pass"?).

A *benchmark suite* is a *collection* of benchmarks (to compare models). The harness *runs* each benchmark (against each model), *collects* the results (pass/fail, steps, time), and *reports* a *score* (percentage passed, average steps).

> **System invariant:** The benchmark *must* be *reproducible*. If the benchmark is *not* reproducible (e.g., the verification depends on a random seed, or the model's output changes per run), the benchmark *is not a benchmark* (it is an *experiment*). The harness *must* record the *seed* (if any) and *pin* the repository state (a commit hash, not a branch name).

## The Benchmark Struct

```rust
{{include:../../examples/reference-harness/src/evaluate.rs#ANCHOR: benchmark-struct}}
```

A `Benchmark` holds:
- `id` — a unique identifier (e.g., "auth-fix-01").
- `repo_url` — the repository URL (or local path).
- `repo_commit` — the repository commit (pinned state).
- `prompt` — the user's prompt (the task description).
- `verification` — the verification commands (a list of strings).
- `pass_threshold` — the pass criteria (e.g., "0 tests failed").
- `expected_steps` — an *expected* step range (for a sanity check: "this benchmark should take 1–5 steps").

A benchmark is *loaded* from a YAML/JSON file (a `benchmarks/<id>.json` file in the benchmark suite directory). The harness *runs* the benchmark (clones the repository at `repo_commit`, runs the agent, runs the verification commands).

> **Failure mode:** If the repository *clone* fails (network down, repository deleted), the benchmark *must* record a `Skipped` result (not a crash). The harness *does not fail* the entire suite because one benchmark is skipped.

## The Benchmark Runner

The harness runs a benchmark in a *single session* (with a *fixed* repository state):
1. *Clone* the repository at `repo_commit`.
2. *Run* the agent (with the prompt, the verification commands).
3. *Collect* the result (pass/fail, steps, time).
4. *Record* the result (to a JSON file).

The harness *does not modify* the original repository (it works in a *temporary clone*). After the benchmark runs, the harness *deletes* the clone (to avoid disk space leaks).

> **System invariant:** The benchmark runner *must* *isolate* each benchmark (a benchmark's file changes *must not* affect the next benchmark). The harness *must* *delete* the cloned repository after each benchmark.

## The Benchmark Suite

A *suite* is a collection of benchmarks (with metadata). The suite file is:

```yaml
name: "coding-agent-harness-benchmarks"
version: "1.0"
benchmarks:
  - "auth-fix-01"
  - "refactor-api-02"
  - "test-cleanup-03"
  - "feature-add-04"
```

The harness *loads* the suite (reads the file), *resolves* each benchmark (loads the JSON file), and *runs* them (sequentially, or in parallel — with a configurable concurrency limit).

The harness *reports* a suite score:
- `total` — number of benchmarks.
- `passed` — number of benchmarks that passed.
- `failed` — number of benchmarks that failed.
- `skipped` — number of benchmarks that were skipped (failed to clone, timed out).
- `avg_steps` — average step count across *passed* benchmarks.

> **Quecto in production:** Quecto stores benchmark suites in `~/.quecto/benchmarks/*.yaml`. The CLI command `quecto benchmark run suite.yaml` runs the suite (and writes results to `~/.quecto/benchmarks/results/<suite>.json`). The results file contains: `{ "benchmarks": { "auth-fix-01": { "outcome": "Complete", "steps": 3, "time_ms": 45000 } }, "score": { "passed": 4, "total": 4, "avg_steps": 3.0 } }`.

## The Score Format

The score file is a JSON object:

```json
{
  "suite_name": "coding-agent-harness-benchmarks",
  "runs_at": "2026-10-02T23:59:00Z",
  "results": {
    "auth-fix-01": {
      "outcome": "Complete",
      "steps": 3,
      "time_ms": 45000,
      "verification_output": "2/2 tests passed"
    }
  },
  "score": {
    "passed": 4,
    "failed": 0,
    "skipped": 0,
    "total": 4,
    "avg_steps": 3.0
  }
}
```

The harness *reports* the score (to the user or the CLI output). The user *can compare* two score files (e.g., "Model A: avg 3.0 steps, 4/4 passed; Model B: avg 5.2 steps, 3/4 passed").

> **Failure mode:** If the score file *is corrupted* (an incomplete JSON), the harness *must not* crash. It should *log a warning* (and skip that score file). The harness *does not* use a corrupted score for comparison.

## Exercise

Write a test that:
1. Creates a benchmark suite with 2 benchmarks (a "pass" and a "fail" benchmark).
2. Runs the suite (with a *mocked* agent that returns "Complete" for the pass benchmark and "VerificationFailed" for the fail benchmark).
3. Verifies that the score file has `passed: 1, failed: 1, total: 2`.
4. Verifies that `avg_steps` is a valid number (not null).

This test demonstrates the *benchmark suite format*: a collection of benchmarks with a *scored* result.

---

## Beyond Rust

| Concern | Python | TypeScript |
|---------|--------|-----------|
| Benchmark file | `yaml.safe_load(f)` | `JSON.parse(fs.readFileSync(...))` |
| Suite score | `{passed: 4, total: 4}` | Same |
| Session clone | `git clone <url> --depth 1` | Same (shell) |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test evaluate suite_reports_score_with_one_passed_one_failed
```

This test verifies that a benchmark suite with two benchmarks (one pass, one fail) reports a score of `{passed: 1, failed: 1, total: 2}`.
