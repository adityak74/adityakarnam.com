# 4. Typed, Unsafe-Free Communication

> Chapter 4 teaches you to design a tool interface that is: (1) *typed* (the harness knows the schema before the model speaks), (2) *safe* (unregistered tools fail closed, not with a panic), and (3) *observable* (every tool produces output the harness can record).

## The Problem

A raw text prompt ("delete /tmp") is unsafe: the model's intent is ambiguous. A typed tool definition ("delete_file: {path: string} → {error: null | string}") improves the boundary because:
- The harness knows *which* tool names it exposes before the model speaks.
- The tool implementation validates its own required arguments before performing I/O. A published JSON schema informs the model, but is not a substitute for validation at execution time.
- The harness can intercept or deny the call based on policy (see Chapter 5).

A tool is a callable unit of work. It has a name, a description, a JSON schema, and a run function. The harness *exposes* the tool to the model via the tool schema, and *executes* the tool when the model requests it.

## The Tool Trait

The tool trait is the interface the harness uses to discover, register, and execute tools:

```rust
{{include:../examples/reference-harness/src/tools.rs#ANCHOR: tool-trait}}
```

Four methods:
- `name()` — the unique identifier (lowercase, underscore-separated).
- `description()` — a human-readable summary (used in the schema).
- `schema()` — the JSON Schema for arguments (used by the model).
- `run(args, context)` — the execution function (takes arguments, returns output).

The `Send + Sync` bounds make a tool eligible to be moved or shared across threads; the teaching agent loop itself does not spawn worker threads.

> **System invariant:** A tool's `run` method must never panic. If a tool encounters an error (file not found, command timeout), it must return `ToolError::Failed(...)` — never a Rust `panic!()`. A panic inside a tool execution corrupts the agent's state and forces a restart.

## The Tool Registry

The registry is a BTreeMap from tool name to a boxed tool trait object. It provides:
- `register(tool)` — add a tool.
- `schemas()` — generate the JSON schema list (sent to the model).
- `execute(call, context)` — find and run a tool by name.

```rust
{{include:../examples/reference-harness/src/tools.rs#ANCHOR: tool-registry}}
```

The `BTreeMap` ensures deterministic ordering of tools in the schema (alphabetical). This matters because the model's output depends on the order of tools it sees.

> **Failure mode:** If the registry silently ignores a duplicate registration (allowing two tools to share the same name), the last-registered tool silently wins. The harness should *log* a duplicate-name warning but *not* reject the registration (the programmer made a mistake, the harness should tolerate it).

## Built-in Tools

The reference harness includes four tools:

| Tool | Operation | Example |
|------|-----------|---------|
| `ReadFile` | Read a file (path must be inside repo). | `read_file(path: "src/main.rs")` |
| `WriteFile` | Write/overwrite a file (records undo snapshots). | `write_file(path: "src/main.rs", content: "...")` |
| `ApplyPatch` | Replace the first occurrence of `old` text with `new`. | `apply_patch(path: "src/main.rs", old: "fn foo()", new: "fn bar()")` |
| `RunCommand` | Run a command through the context's timeout and output limits. | `run_command(command: "cargo test")` |

Each tool records a `FileChange` (before/after content) in the context. This enables:
- Undo (revert a file to its previous state).
- Diff (see what the agent changed in a single step).
- Verification (diff the output of the agent's edits against a baseline).

> **Quecto in production:** Quecto adds `SearchText`, `ListFiles`, `GitDiff`, and `GitStatus` around the file, patch, and shell tools. The exported tool surface is listed in `quecto-agent/src/lib.rs` and implemented under `quecto-agent/src/tools/`.

## Quecto's Version

Quecto's tools extend this interface with repository search, file listing, Git status/diff inspection, shell execution, and optional MCP-backed tools.

See the "Beyond Rust" note for how Quecto's tool system maps to Python (using `openai::tools` parameter with a custom tool schema).

## Exercise

Write a tool `AppendFile` that appends text to the end of a file (creating the file if it does not exist). Register it in the test suite and verify that:
1. Reading the file before writing returns the original content.
2. Reading the file after writing returns the appended content.
3. The context records a `FileChange` with the before/after.

You can find an equivalent pattern in `tests/safety.rs` (test name: `write_file_is_atomic_and_records_ordered_undo_snapshots`).

---

## Beyond Rust

| Concept | Python | TypeScript |
|---------|--------|-----------|
| `Tool::schema()` | `{"type":"object","properties":{...}}` | Same |
| `Tool::run()` | Custom callable object | Custom class/method |
| Registry | `dict[str, Tool]` | `Map<string, Tool>` |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test agent_loop registry_emits_schemas_in_name_order
```

This test verifies that the registry sorts tool schemas alphabetically (`echo` < `zeta`).
