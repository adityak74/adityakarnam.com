# 11. Observability and Telemetry

> Chapter 11 teaches you to *observe* the agent's runtime: *what* it did (tool calls, file changes, verification results), *when* it did it (timestamps, duration), and *why* it failed (reason codes). You will implement a `Telemetry` struct that: (1) records events (tool calls, errors, verification outcomes), (2) writes them to a *local log file* (JSON Lines), and (3) provides a `query` method for the user (or the harness UI) to inspect past sessions.

## The Problem

A coding agent *succeeds or fails* based on the model's output. But *why* did it fail? The model's reasoning is *internal* (a hidden chain-of-thought, or a unreasoned answer). The harness must *observe* the agent's *visible* behavior: tool calls, file changes, verification results, errors, and the final outcome.

If the harness *does not observe* these, the user (or the harness UI) cannot *diagnose* failures. The user sees: "the agent failed" — but has *no data* about what happened.

A telemetry system is *observability*: it records every visible event (tool calls, results, errors) in a *structured log*. The log is *durable* (written to a file, not in memory). The user (or the harness) can *query* the log (for debugging, for analytics, for auditing).

> **System invariant:** The telemetry system must *never* record the *content* of the model's internal reasoning (the system prompt, the hidden reasoning). It records only *visible events*: tool names, arguments (truncated to 1 KB), results (truncated to 1 KB), and error codes.

## The Telemetry Struct

```rust
{{include:../../examples/reference-harness/src/telemetry.rs#ANCHOR: telemetry-struct}}
```

A `Telemetry` object holds:
- `log_path` — the path to the log file (a `.jsonl` file in the session's output directory).
- `session_id` — the current session's ID (used to correlate events).
- `events` — a *buffered* list of events (flushed to disk at session end).

Each event is a JSON object:
```json
{
  "timestamp": "2026-10-02T23:59:00Z",
  "session_id": "abc-123",
  "event_type": "tool_call",
  "tool_name": "write_file",
  "arguments": {"path": "src/main.rs", "content": "fn entry() {}"},
  "result": null
}
```

The event types are:
- `tool_call` — a tool was called (recorded before execution).
- `tool_result` — a tool produced a result (recorded after execution).
- `error` — an error occurred (during tool execution, model transport, or verification).
- `session_start` — the session began.
- `session_end` — the session ended (with `outcome`).

> **Failure mode:** If the log file *cannot be written* (permissions, disk full), the telemetry system must *not crash*. It should *log an error* (to stderr) and *continue* (without telemetry). The harness *does not depend* on telemetry for correctness. Telemetry is *observability only*.

## The Telemetry API

| Method | Returns |
|--------|---------|
| `Telemetry::new(log_path)` | A telemetry object (writes to the file). |
| `Telemetry::log_event(event)` | Writes a JSON object to the file (append mode). |
| `Telemetry::query_since(start_time)` | Returns events from `start_time` (as a list of JSON objects). |
| `Telemetry::flush()` | Flushes the buffer to disk (called at session end). |

The harness *calls* `log_event` at:
- Before every tool execution (a `tool_call` event).
- After every tool execution (a `tool_result` event).
- On every error (an `error` event).
- At session start/end (a `session_start` / `session_end` event).

> **System invariant:** The telemetry must *truncate* arguments and results to 1 KB (to prevent logs from growing to millions of lines). The truncated value is recorded as `"<truncated: 1024 chars>"` (with the full string in a *detailed log file*, if the harness is configured for debug mode).

## The Telemetry File Format

The log file is *JSON Lines* (one JSON object per line). Each line is *independent* (the file can be truncated at any line boundary without corruption). The format is:

```
{"timestamp":"...","session_id":"...","event_type":"session_start","args":{}}
{"timestamp":"...","session_id":"...","event_type":"tool_call","tool_name":"write_file",...}
{"timestamp":"...","session_id":"...","event_type":"tool_result","tool_name":"write_file","result":{...}}
{"timestamp":"...","session_id":"...","event_type":"session_end","outcome":"Complete",...}
```

The harness *can query* the file (using `grep` or a JSONL reader) to *inspect* past sessions:
- `grep -c tool_call .q/.logs/*.jsonl` — total tool calls across all sessions.
- `grep -c error .q/.logs/*.jsonl` — total errors (across all sessions).
- `grep session_start .q/.logs/*.jsonl | wc -l` — number of sessions (concurrent vs sequential).

> **Quecto in production:** Quecto writes telemetry to `~/.quecto/logs/<session_id>.jsonl` (one file per session). The CLI command `quecto logs --session <id>` reads the file and displays it in a terminal UI (with timestamps, tool names, and results). The *production telemetry* (for Quecto's developers) writes to a *remote server* (an HTTP endpoint, POSTing JSON objects). The *local log* is the *only* telemetry that the user sees (the remote server is *not* exposed to the agent).

## The Telemetry as a Debug Tool

Telemetry is *the primary debug tool* for a coding agent. The user (or the harness) can:
1. *Inspect* a session's log (for a specific task).
2. *Compare* two sessions (did the agent fix the same bug twice?).
3. *Analyze* the model's *error rate* (how often does the model call `WriteFile` on a file that already exists? — a redundant call).
4. *Audit* the agent's *approvals* (how often does the agent request approval, and what does the user approve/deny?).

> **Failure mode:** If the telemetry *format* changes (e.g., a new field is added, or a field is removed), the log query (`grep`) must *still work* (backward-compatible queries). The telemetry format *must not* break existing queries. A new field should be *optional* (with a default value).

## Exercise

Write a test that:
1. Creates a `Telemetry` object with `log_path = temp_dir() / "test.jsonl"`.
2. Logs 3 events (a `session_start`, a `tool_call` (write_file), and a `session_end`).
3. Verifies that the log file contains exactly 3 JSON objects (3 lines).
4. Verifies that `query_since(start_time)` returns 2 events (the tool_call and session_end).

This test demonstrates the *telemetry format*: a JSONL file, one event per line, with a query interface.

---

## Beyond Rust

| Concern | Python | TypeScript |
|---------|--------|-----------|
| JSONL write | `json.dump(obj, f)` | `fs.appendFileSync(file, obj + "\n")` |
| Query | `grep -c event file.jsonl` | Same (shell) |
| Session start/end | `{event_type: "session_start"}` | Same |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test telemetry telemetry_writes_jsonl_and_returns_events
```

This test verifies that a `Telemetry` object writes 3 JSONL events and returns 2 on query.
