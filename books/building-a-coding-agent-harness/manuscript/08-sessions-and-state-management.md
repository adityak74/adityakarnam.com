# 8. Sessions and State Management

> This chapter designs session persistence and recovery. The `Session` APIs below are illustrative; the compact reference crate does not define this type. Quecto production uses a SQLite-backed store and a separate agent/run lifecycle.

## The Problem

A raw model API is a single pair: *you* send text, it returns text. A coding agent has *state* between turns: file edits, command output, lint results, the last verification result, the retry count. If this state is fragmented across variables, the harness has *no single source of truth* about what happened — and every new feature adds another variable, doubling the chance of inconsistency.

A session is the *single mutable handle* for one coding task. It owns the message history, the file diff, the verification state, and the cancellation token. One object.

## The Session Struct

> **Implementation boundary:** This chapter presents a session design, not code from the compact reference crate. The teaching `Agent` keeps its messages in memory for one instance; production Quecto persists resumable sessions in SQLite.

A session holds:
- `id` — a UUID (for logging, for the user).
- `root` — the repository root (canonicalized).
- `context` — the file-system handle (read/write with undo snapshots).
- `messages` — the accumulated message list (user prompt, assistant tool calls, tool results).
- `changes` — the list of file changes (before/after), used by the verification gate.
- `result` — the final outcome (Complete, VerificationFailed, StepLimit, ...).

The session is created by the harness and handed to the agent. The agent *mutates* the session's message list and the context's file state. The session is *not* shared with the model — the harness reads the messages and passes them to the model, then writes the result *back* into the session.

> **System invariant:** The session's message list must contain *every* tool call and result, in order. If a result is dropped, the model's next turn is wrong (it receives an incomplete conversation).

## The Session API

| Method | Returns |
|--------|---------|
| `Session::new(root)` | A session with an empty message list. |
| `Session::push_user(prompt)` | Pushes a user message (returns `&mut Self`). |
| `Session::push_assistant(messages)` | Pushes assistant tool calls (returns `&mut Self`). |
| `Session::push_tool_result(name, result)` | Pushes a tool result (returns `&mut Self`). |
| `Session::messages()` | Returns the full message list (for the model). |
| `Session::changes()` | Returns the diff (for verification). |
| `Session::result()` | Returns the final outcome. |
| `Session::cancel()` | Cancels the session (sets the cancellation token). |

> **System invariant:** `Session::push_user` must *reject* a prompt that is empty or contains only whitespace. The harness must never send an empty prompt to the model (the model's behavior on empty text is undefined and may crash).

## The Execution Flow

The harness runs the session in a single loop:

```
session.push_user("fix the bug in src/main.rs")
loop:
  response = model.complete(session.messages())
  for call in response.tool_calls:
    result = context.run(call)
    session.push_tool_result(call.name, result)
  session.push_assistant(response.tool_calls)
  if response.no_tool_calls: break  (model said "done")
session.result = Outcome::Complete(...)  (or fail)
```

The session's `result` field is the *only* place the final outcome is stored. The harness reads `session.result()` at the end.

> **Failure mode:** If the harness does not call `push_tool_result` (and instead discards the result into a log), the session's message list is incomplete and the model's *next* turn will be confused (it will re-send the same tool call, because it never received the answer).

## The Session as a Scope

The session's lifetime is the scope of one coding task. In a production runtime, a user submits a task and the harness creates or resumes persisted state. A second task should begin with isolated state rather than accidentally inheriting another task's messages or changes.

This is the key insight: *a session is not a conversation across tasks*. It is a single task. If a user says "first fix the auth bug, then refactor the API," the harness creates *two sessions* (one after the other), not one session with 400 messages.

> **System invariant:** A new session must not inherit another task's messages or tool-call state. Reusing a session is explicit resume; a fresh task receives a fresh identity and state boundary.

## Exercise

Write a test that:
1. Creates a session with `root = temp_dir()`.
2. Writes a file `a.rs` with `fn main() {}`.
3. Pushes a user prompt "rename fn main to fn entry".
4. Calls the model (mocked to return one `WriteFile` call renaming `main` → `entry`).
5. Verifies that `session.changes()` returns exactly one change (old: `fn main() {}`, new: `fn entry() {}`).
6. Verifies that `session.result()` is `Outcome::Complete`.

This is a design exercise for a future session module. The compact crate currently tests message accumulation and tool results within the `Agent`; it does not expose a `Session` type or persist changes.

---

## Beyond Rust

| Concern | Python | TypeScript |
|---------|--------|-----------|
| Session creation | `Session.new(root)` | `new Session(root)` |
| Message push | `session.push(...)` | `session.push(message)` |
| `no_tool_calls` check | `if not response.tool_calls: break` | `if (response.toolCalls.length === 0) break` |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test agent_loop session_populates_messages_and_records_change
```

Run `cargo test` for the implemented teaching-crate checkpoints. The session exercise above is not an existing test.
