# 13. The Complete Reference Harness

> Chapter 13 teaches you to *unify* all the previous chapters (chapters 1–12) into a *complete reference harness*. The harness *combines* the model transport (chapter 1–2), the bounded agent loop (chapter 3), the typed tools (chapter 4), the execution policy (chapter 5), the verification gate (chapter 6), the session abstraction (chapter 8), the security gates (chapter 9), the MCP expansion (chapter 10), the observability layer (chapter 11), and the evaluation framework (chapter 12) into a *single, cohesive application*.

## The Problem

Chapters 1–12 each teach a *single layer* of the harness. But a *real* harness is *not* a single layer. It is *all layers working together*. The model transport (chapter 1–2) *feeds* the bounded agent loop (chapter 3), which *executes* the typed tools (chapter 4), *gated* by the security policy (chapter 5), *verified* by the completion gate (chapter 6), *isolated* in a session (chapter 8), *scoped* by a profile (chapter 9), *expanded* via MCP (chapter 10), *observed* by telemetry (chapter 11), and *evaluated* by the benchmark suite (chapter 12).

A single-layer harness (e.g., "just the agent loop") *cannot* be run in production. It lacks safety (no policy), lacks verification (no completion gate), lacks isolation (no session), lacks observability (no telemetry), and lacks evaluation (no benchmark).

The *complete reference harness* is *all layers* in a *single application*. It is *tested* (end-to-end, with a real model, a real repository, and a real verification command).

## The Application Structure

```
harness/
├── src/
│   ├── lib.rs          (pub mod model, agent, tools, policy, context, session, telemetry, evaluate, mcp)
│   ├── model.rs        (HttpModel, parse_assistant, error handling)
│   ├── agent.rs        (Agent::run, RepeatGuard, bounded loop)
│   ├── tools.rs        (Tool trait, ToolRegistry, ReadFile, WriteFile, ApplyPatch, RunCommand)
│   ├── policy.rs       (Decision, Preset, Policy::decide)
│   ├── context.rs      (Context::new, resolve_existing, run_command)
│   ├── session.rs      (Session, Session::push_user/assistant/result)
│   ├── telemetry.rs    (Telemetry::log_event, query)
│   ├── evaluate.rs     (Benchmark, Suite, run_suite)
│   └── mcp.rs          (McpServer, discovery, execute)
├── benchmarks/
│   ├── suite.yaml      (list of benchmarks)
│   ├── auth-fix-01.json (individual benchmark)
│   └── ...
└── tests/
    ├── agent_loop.rs   (agent loop tests)
    ├── safety.rs       (policy + tools + context tests)
    └── mcp.rs          (MCP discovery test)
```

The `lib.rs` exports all modules. The `bin/` directory (optional) provides a CLI entry point:

```bash
harness run --repo <path> --prompt "fix auth" --profile editor
harness benchmark run --suite suite.yaml
```

> **System invariant:** The CLI interface (if provided) must *not* expose internal implementation details (the agent's message history, the session's full context). The CLI *exposes only* the public API (run, benchmark, status). The internal state (session's message list, context's file changes) is *not* accessible from the CLI.

## The Application Flow

The application *runs* as follows (in a single user invocation):
1. The user *invokes* the CLI: `harness run --repo my-repo/ --prompt "fix auth"`.
2. The harness *loads* the repository (canonicalizes the path).
3. The harness *loads* the profile (from `~/.quecto/profiles/editor.json`, or the default).
4. The harness *loads* the MCP servers (from `~/.quecto/mcp/` — if any are configured).
5. The harness *creates* a session (id = a UUID, root = canonicalized repo path).
6. The harness *pushes* the user's prompt (as a user message).
7. The harness *runs* the agent loop (bounded by steps, with policy gating and MCP tools).
8. The harness *runs* the verification gate (on the session's final changes).
9. The harness *writes* the telemetry (to the log file).
10. The harness *returns* the result (Complete, VerificationFailed, ...).

> **Failure mode:** If the application *fails* during step 7 (agent loop), the harness *must* still *write* the telemetry (up to that point). The telemetry *must* contain a `session_end` event with `outcome: "Error"`. The harness *must* *not* leave the telemetry incomplete (partial telemetry is *harder* to debug than no telemetry).

## The Application as a Library

The harness is *also* a library (for embedding in other applications). The `lib.rs` exposes:

```rust
use harness::{Agent, Session, Policy, Telemetry, Benchmark};

fn main() {
    let policy = Policy::from_preset(Preset::Editor);
    let telemetry = Telemetry::new("/tmp/session-abc.jsonl");
    let mut session = Session::new("/tmp/my-repo");
    session.push_user("fix the auth bug");

    let result = Agent::run(Session {
        session,
        policy,
        telemetry: telemetry.clone(),
        max_steps: 10,
    });

    println!("Outcome: {:?}", result.outcome());
}
```

The library interface *must* be *stable* (semver-major changes are *not* backward-compatible). The library *does not* expose implementation details (e.g., the internal `RepeatGuard` struct is *private*; the `Agent::run` method is *public*).

> **Quecto in production:** Quecto is *both* a library (embedded in a larger application) and a CLI (for direct use). The library's `pub` interface is *the CLI's interface* (the CLI *wraps* the library). If a library method is *internal* (e.g., `RepeatGuard`), it is *not* exported (no `pub` in `lib.rs`).

## The Application in Production

Quecto runs the harness in *multiple modes*:
1. **CLI** — a single user invocation (a terminal session). The CLI *runs* a single task (or a benchmark suite).
2. **Library** — embedded in a web application (e.g., a dashboard that *offers* coding tasks). The library *exposes* `run()`, `benchmark()`, `status()` (as REST or gRPC endpoints).
3. **CI** — run as a CI step (on a pull request, on a branch merge). The harness *runs* the verification suite (or a set of benchmarks) *in the CI pipeline*.

In all three modes, the harness *behaves identically* (same tools, same policy, same verification, same telemetry). The *only* difference is the *input* (CLI: a prompt string; Library: a Rust function call; CI: a YAML file with a benchmark list).

> **System invariant:** The harness *must* produce the *same result* (for the same prompt, same repository, same model) *regardless* of the mode (CLI, Library, CI). If a CLI invocation returns `VerificationFailed`, a Library invocation with the *same inputs* must *also* return `VerificationFailed` (modulo non-deterministic factors: a test suite with a flaky test, a network timeout on a model API).

## The Application as a Teaching Tool

The complete reference harness *is also* the *teaching material* for this book. The book *uses* the application's source code (via `{{include:}}` directives) to *show* the implementation of each layer (chapters 1–12). The book *does not* abstract away the source code (the reader *sees* the actual Rust structs and methods).

This is *intentional*. The book's goal is *not* to teach *abstract principles* ("safety is important"). The book's goal is to teach *concrete implementation* (a `Policy::decide` method that *returns* `Deny`, a `Context::resolve_existing` that *rejects* path escapes).

> **Failure mode:** If the book *discrepancies* the source code (e.g., the book says "the policy rejects all commands" but the source code says `Policy::decide` *only* rejects `sudo` and `git push`), the reader is *misled*. The book *must* *always* reflect the *current* source code. The book *must* *update* its `{{include:}}` directives when the source code changes.

## Exercise

Write a test that:
1. Creates a *complete* harness (with all modules: model, agent, tools, policy, context, session, telemetry).
2. Runs the harness with a *mocked* model (returning one `WriteFile` call and then "done").
3. Verifies that:
   - The session's `result` is `Outcome::Complete`.
   - The telemetry file contains 5 events (session_start, tool_call, tool_result, session_end, error or ... — depending on the mock's output).
   - The verification gate *ran* (and returned `true` if the verification command is a no-op).

This test demonstrates the *complete application*: every layer (model, agent, tools, policy, context, session, telemetry, verification) *works together* in a single invocation.

---

## Beyond Rust

| Concern | Python | TypeScript |
|---------|--------|-----------|
| Library import | `from harness import Agent, Session` | `import { Agent, Session } from 'harness'` |
| CLI invocation | `harness run --repo path` | Same (Node's `child_process.spawn`) |
| CI mode | `harness benchmark run suite.yaml` | Same (shell) |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test agent_loop complete_harness_integration_with_telemetry_and_verification
```

This test verifies that a full harness (with telemetry, session, policy, verification) runs one task, records 5 events in the log, and returns `Outcome::Complete`.
