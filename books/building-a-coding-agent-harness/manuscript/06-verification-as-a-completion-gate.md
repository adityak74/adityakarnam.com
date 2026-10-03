# 6. Verification as a Completion Gate

> This chapter designs a verification gate. The compact reference crate does not include verification retries or automatic rollback; Quecto's production verifier is a separate, simpler command gate.

## The Problem

A model will claim its work is finished when:
- The last edit was syntactically valid.
- The model's *internal reasoning* says "I'm done."
- The model *prefers* to stop (lower token count, "stop" finish reason).

None of these are sufficient. The model may have introduced a regression that the tests will catch. The model may have deleted a dependency that a linter will flag.

Verification is one answer: before the agent reports "done," run appropriate verification commands. If verification fails, report the result and define explicitly whether the agent may make a bounded repair attempt. Rollback is a separate policy decision; automatically discarding all edits can destroy useful work and is not a behavior of the compact teaching crate.

> **System invariant:** The agent must never report `Outcome::Complete(...)` if verification has not been run. Verification must always run (unless explicitly disabled).

## The Verification Loop

When the agent's model says "done" (no tool calls), the harness:
1. Collects all file changes since the prompt.
2. Runs the verification commands (tests, linters, etc.).
3. If verification passes → `Outcome::Complete(...)`.
4. If verification fails → report failures and, if configured, allow a bounded repair attempt.
5. If retry budget exhausted → `Outcome::VerificationFailed { attempts }`.

```
┌──────────────────────────────────────────────────────┐
│  Verification Loop                                   │
│                                                      │
│  ┌─────────────────┐    ┌─────────────────────────┐  │
│  │  Agent loop     │ →  │  Verify (tests, lint)   │  │
│  │  (model says    │    │  (pass or fail)         │  │
│  │   "done")       │    └────────┬────────────────┘  │
│  └─────────────────┘             │                  │
│           │                      │ pass?            │
│  ┌────────▼────────┐            │ yes → Complete   │
│  │  Undo changes  │  ←──────────┘                  │
│  │  Report errors  │                                │
│  │  Retry (max 3)  │                                │
│  └─────────────────┘                                │
└──────────────────────────────────────────────────────┘
```

## The Verification Command

A verification command is any command that:
- Returns exit code `0` on success.
- Returns non-zero on failure.
- Produces output that the harness can parse (test names, file paths).

Common verification commands:
- `cargo test` (Rust unit tests).
- `cargo clippy` (Rust linter).
- `cargo fmt --check` (formatting check).
- `npm test` (JavaScript/TypeScript tests).
- `flake8` (Python linter).
- `tsc --noEmit` (TypeScript type check).

> **Failure mode:** If verification fails with a *structural* error (e.g., the test runner crashed with a syntax error), the harness must *not* blindly retry (the agent will undo and re-apply the same broken code). Instead, the harness should *short-circuit* and report the structural error.

## Retry Budget

Each verification failure consumes one *retry*. The budget (configurable, default 3) limits how many times the agent retried after verification failures.

| Outcome | Meaning |
|---------|---------|
| `Complete(String)` | Model said done, verification passed. |
| `VerificationFailed { attempts }` | Model said done, verification failed, retried 3 times and failed again. |
| (loop continues) | Model said done, verification failed, retry budget not exhausted. |

> **Quecto in production:** `quecto-agent/src/verify.rs` runs configured verification commands through the repository command boundary and reports each command's status and output. Quecto does not implement the incremental, parallel, or statistical policies sketched in earlier drafts of this chapter. Verification is a completion gate, not proof that a change is correct; choose commands that exercise the behavior you care about.

## Example

Suppose the model edits `src/main.rs` and runs `cargo test`. The test output is:

```
test src/main.rs ... FAILED (assertion: x == y, got 5, expected 10)
test src/util.rs ... PASSED
```

The harness:
1. Detects one failure in `src/main.rs`.
2. *Does* call `cargo test` again (retry 1).
3. Result: same failure. Retry 2. Same failure. Retry 3. Same failure.
4. Budget exhausted → `Outcome::VerificationFailed { attempts: 3 }`.
5. The harness reports: "Verification failed 3 times: 1 test in `src/main.rs`."

The model (prompted with the failures) may then make a corrective edit (change `x = 5` to `x = 10` in `src/main.rs`).

> **System invariant:** A retry policy must define what happens to the current diff. Do not claim that a retry implies rollback: preserve, checkpoint, or revert changes intentionally, and make the user-visible behavior explicit.

## Exercise

Write a verification test that:
1. Creates a file `test.rs` with `assert_eq!(1, 2)` (always fails).
2. Runs the verification command `cargo test` (which will include `test.rs`).
3. Verifies that the harness returns `Outcome::VerificationFailed { attempts: 3 }`.

This test is a design exercise: the compact teaching crate does not yet include a `Verifier` module. To experiment, build the command-runner boundary first and keep subprocess tests opt-in where the environment restricts process creation.

---

## Beyond Rust

| Verification | Python | TypeScript |
|-------------|--------|-----------|
| Unit tests | `pytest` | `jest`, `mocha` |
| Linter | `flake8`, `pylint` | `eslint` |
| Type check | N/A (dynamic) | `tsc --noEmit` |
| Formatter | `black --check` | `prettier --check` |

## Build checkpoint

The current teaching-crate suite includes non-spawning model, tool, context, policy, and agent tests. Command execution and verification require child processes and should be run only in an environment that permits them.
