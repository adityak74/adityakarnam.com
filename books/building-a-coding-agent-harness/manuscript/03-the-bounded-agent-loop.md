# 3. The Bounded Agent Loop

> Chapter 3 teaches you to wrap a single model call in a loop that: (1) executes tool calls the model produces, (2) accumulates results, (3) detects when the model is stuck repeating itself, and (4) terminates safely. This is the core algorithm of any coding agent: ask, act, measure, repeat — bounded.

## The Problem

A model call returns a response with a list of tool calls (or just text). The harness must:

1. Execute each tool call (run a file edit, a command, a read).
2. Record the tool result.
3. Send the accumulated message list back to the model.
4. Repeat until the model says "done" (no tool calls).

Without a loop bound, the model can:
- Loop forever (repeating the same tool call).
- Execute too many tools (cost blowup, time blowup).
- Get stuck in a verification loop (retrying a failing test forever).

The loop must terminate *bounded by steps, by repetition, or by policy denial*.

## The Loop

The agent is initialized with a model, a tool registry, a context (file system), and a configuration. The `run` method receives a prompt string, pushes it as a user message, and then enters the loop:

```rust
{{include:../../examples/reference-harness/src/agent.rs#ANCHOR: bounded-agent-loop}}
```

Each iteration:
1. Send all accumulated messages to the model.
2. Push the model's response (assistant message with tool calls).
3. For each tool call: execute it (via the registry), push the tool result.
4. Repeat until the model returns no tool calls (success), the step limit is reached, or the policy denies too many calls in a row.

> **System invariant:** Every tool call in the response must correspond to a tool registered in the registry. An unknown tool name is a *tool error*, not a panic. The harness must never crash on an unknown tool name.

## The Repeat Guard

The `RepeatGuard` struct detects when the model is stuck in a feedback loop: it sends the same tool call with the same arguments and receives the same output — repeated 3 or more times in a row (configurable via `repeat_limit`).

```rust
// Inside agent.rs (RepeatGuard struct)
```

The guard computes a *fingerprint* from (call name, call arguments, tool result). If the fingerprint matches the previous call *and* the file system has not changed (checked via `context.changes().len()`), the repetition count increments. Once the streak reaches `repeat_limit`, the agent returns `Outcome::RepeatedAction`.

> **Failure mode:** A naive guard that only checks the call name (ignoring arguments and result) will detect distinct writes as identical. The fingerprint must include the full call + full result. The file-system-change counter is the critical differentiator: writing "file v1" and "file v2" are *different* even with the same tool name.

## Termination Conditions

The agent returns one of these outcomes:

| Outcome | When |
|---------|------|
| `Complete(String)` | Model returned no tool calls (text only). |
| `StepLimit` | Exceeded `max_steps` iterations without a text-only response. |
| `RepeatedAction` | Model sent the same tool call 3+ times with unchanged results. |
| `Blocked` | Policy denied 3+ tool calls in a row (configurable via `denial_limit`). |
| `Cancelled` | The user invoked a cancellation token. |
| `VerificationFailed { attempts }` | The verification gate failed too many times. |
| `Error(String)` | A non-recoverable error occurred (model transport failure, file-system I/O). |

> **System invariant:** The harness must never return a partial success. If `StepLimit` is reached, the result is *no progress*, not a partial edit. The harness must report this clearly to the user and *not* leave the file system in a modified state (each tool records a before/after change for undo, but the harness should only commit changes once the final result is `Complete`).

## Policy Gating (Optional)

When `denial_limit > 0`, each tool call is checked against a default `ReadOnly` policy. If the call is denied (e.g., the model calls `write_file` or `run_command` under a read-only preset), the harness records the denial and increments the denial counter. After `denial_limit` consecutive denials, the agent returns `Outcome::Blocked`.

This is an *optional* safety layer. It is not enabled by default (`denial_limit: 0` means no gating). You enable it when you want the agent to ask before performing risky operations.

> **Quecto in production:** Quecto uses a *profile* system (see Chapter 9) where each repository has a named profile (e.g., "readonly", "editor", "full") that selects which tools are allowed, which commands are blocked, and which require approval. The teaching harness simplifies this to a single default policy for safety.

## Exercise

Write a test that:
1. Creates a scripted model returning 3 identical `write_file` calls (same path, same content).
2. Registers `WriteFile` in the registry.
3. Sets `repeat_limit: 3`.
4. Verifies the agent returns `Outcome::RepeatedAction`.

You should be able to find an equivalent test in `tests/agent_loop.rs` (test name: `agent_stops_after_three_identical_tool_observations`).

---

## Beyond Rust

| Concern | Python | TypeScript |
|---------|--------|-----------|
| Loop bound | `for _ in range(max_steps):` | `while (step < max_steps) { ... }` |
| Repeat guard | Track `(tool_name, args, result)` tuple in a list | Map<string, number> |
| State | `agent.messages` (mutated in place) | `const history: Message[]` |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test agent_loop agent_stops_after_three_identical_tool_observations
```

This test verifies that repeated identical tool calls (no file-system change) trigger the repeat guard.
