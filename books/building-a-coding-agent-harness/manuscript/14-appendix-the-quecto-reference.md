# Appendix A. The Quecto Reference

Quecto is the production system behind this book's examples. The repository is at <https://github.com/adityak74/quecto>. The chapter mapping below uses the local reference checkout at revision `97158860a490790edeb58f9727b684423f04cbe3` (2026-10-03). Paths are relative to that repository root. Check the remote `main` branch for newer source before treating a path as current.

## The Runnable Book Harness

The compact, self-contained teaching crate is `books/building-a-coding-agent-harness/examples/reference-harness`. It has five modules: `model`, `agent`, `tools`, `context`, and `policy`. This crate is deliberately smaller than Quecto. The chapters about persistence, profile composition, MCP, telemetry, and evaluation explain production concerns and map them to Quecto; they do not claim those systems are implemented in this teaching crate.

| Book topic | Teaching implementation | Production Quecto source |
|---|---|---|
| Model messages and HTTP | `examples/reference-harness/src/model.rs` | `quecto-agent/src/model.rs`, plus root `src/lib.rs` for the tiny core |
| Bounded loop and outcomes | `examples/reference-harness/src/agent.rs` | `quecto-agent/src/agent.rs` |
| Tools and schemas | `examples/reference-harness/src/tools.rs` | `quecto-agent/src/tools/` and `quecto-agent/src/lib.rs` |
| Repository context and command sandbox | `examples/reference-harness/src/context.rs` | `quecto-agent/src/context.rs`, `quecto-agent/src/sandbox.rs` |
| Execution policy | `examples/reference-harness/src/policy.rs` | `quecto-agent/src/policy.rs`, `quecto-agent/src/approval.rs` |
| Verification | Design chapter; not in the teaching crate | `quecto-agent/src/verify.rs` |
| Instructions | Design chapter; not in the teaching crate | `quecto-agent/src/instructions.rs` |
| Sessions and persistence | Design chapter; not in the teaching crate | `quecto-agent/src/session.rs`, `quecto-agent/src/recorder.rs` |
| Profiles / layered config | Design chapter; not in the teaching crate | `quecto-agent/src/flavor.rs` |
| MCP | Design chapter; not in the teaching crate | `quecto-mcp/` and feature-gated `quecto-agent/src/mcp_adapter.rs` |
| OpenTelemetry | Design chapter; not in the teaching crate | `quecto-agent/src/main.rs` (`otel` feature), `quecto-agent/Cargo.toml` |
| Evaluation | Design chapter; not in the teaching crate | `quecto-eval/` |

## How to Explore the Production Repository

Quecto is a Cargo workspace. Its root `quecto` crate is the small synchronous OpenAI-compatible model transport. `quecto-agent` builds the interactive and one-shot coding agent on top of it; `quecto-mcp` contains MCP transport support; `quecto-eval` contains evaluation contracts, manifests, and runners. Begin with each crate's `src/lib.rs` and `Cargo.toml`, then follow the named module paths in the table.

Useful commands from a Quecto checkout:

```sh
cargo test --workspace
cargo run -p quecto-agent -- --help
cargo run -p quecto-agent -- "Summarize this repository"
cargo run -p quecto-eval -- --help
```

Optional features alter the build: MCP is enabled with `--features mcp`; OpenTelemetry with `--features otel`. The default agent build does not enable these optional features.

## What the Two Implementations Share

| Concern | Teaching harness | Production Quecto |
|---|---|---|
| Model boundary | Small `Model::complete` trait and OpenAI-compatible HTTP implementation | Core model transport plus the agent crate's own model abstraction and provider wire-format handling |
| Agent | Bounded synchronous loop with step, repeat, and policy-denial limits | Coding-agent run loop with model completion options, tools, session data, and recorder hooks |
| Tools | Read, write, patch, and command examples | File, search, git, shell, and optional MCP-backed tools |
| Policy | Three educational presets and hard-deny examples | Approval modes, flavors, tool filtering, and trust configuration |
| Verification | Architectural treatment only | Configured completion gate implemented by `quecto-agent/src/verify.rs` |
| State | In-memory teaching objects | SQLite-backed session storage and change summaries |
| Telemetry | Not implemented in the teaching crate | Optional OpenTelemetry tracing; do not confuse it with a JSONL session log |
| Evaluation | Not implemented in the teaching crate | Separate `quecto-eval` crate and evaluation data |

The teaching code prioritizes readable boundaries over feature parity. It is not a drop-in library for production use. Production Quecto has its own types, error paths, config system, and platform constraints; compare behaviors rather than assuming identical APIs.

## CLI Orientation

The production binary is `quecto-agent`, not a `quecto run` subcommand. It accepts a task prompt directly, supports `chat`, `resume`, `undo`, `diff`, and `new` subcommands, and provides flags such as `--yes`, `--no-verify`, `--flavor`, `--model`, `--base-url`, and `--max-steps`. Run `cargo run -p quecto-agent -- --help` for the current interface. Evaluation is a separate binary in `quecto-eval`; it is not a `quecto benchmark` subcommand.

## Further Reading

1. [Quecto repository](https://github.com/adityak74/quecto) — source, README, and release information.
2. [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) — one provider's message interface.
3. [OpenAI function calling](https://platform.openai.com/docs/guides/function-calling) — tool-call schemas and request flow.
4. [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification) — protocol foundations relevant to MCP.
5. [Cargo workspaces](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html) — how the production crates fit together.

## Glossary

| Term | Definition |
|---|---|
| Harness | The runtime around a model that controls tools, state, policy, and completion. |
| Policy | A gate that allows, asks about, or denies an action before execution. |
| Session | The persisted state for an agent run, including messages and recoverable changes. |
| Flavor | Quecto's layered configuration profile for model, tools, approvals, and verification. |
| MCP | Model Context Protocol, used to discover and invoke external tools through servers. |
| Telemetry | Instrumentation emitted for operational observation; in Quecto this means optional OpenTelemetry, not a local JSONL CLI log. |
| Evaluation | Repeatable task execution with defined inputs and measurable outcomes. |

## Rebuild This Book

The source manuscript, build script, stylesheet, and reference crate live together in the book directory. From `books/building-a-coding-agent-harness/examples`, run:

```sh
python3 build_book.py
cargo test --manifest-path reference-harness/Cargo.toml
```

The builder writes the PDF and HTML to `static/books/`. It resolves source-code includes from the reference crate so the short listings stay aligned with executable code.

---

*End of Appendix A.*
