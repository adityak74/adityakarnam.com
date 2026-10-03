# Appendix A. The Quecto Reference

> This appendix maps *every chapter* of the book to the *actual production code* in Quecto (the product that inspired this book). The appendix *is not theoretical*. It *pointers* you to the *real source code* (in the `quecto` repository) that *implements* each chapter's lesson.

## Mapping the Chapters

| Chapter | Title | Quecto Module | Module Path | Key Types |
|---------|-------|---------------|-------------|-----------|
| 1 | The Harness Is the System | `quecto_core` | `src/quecto_core/` | `Quecto::new()`, `Quecto::run()` |
| 2 | One Model Call, No Framework | `quecto_core::model` | `src/quecto_core/model/` | `HttpModel`, `ModelError` |
| 3 | The Bounded Agent Loop | `quecto_core::agent` | `src/quecto_core/agent/` | `Agent::run`, `Outcome`, `RepeatGuard` |
| 4 | Typed, Unsafe-Free Communication | `quecto_core::tools` | `src/quecto_core/tools/` | `Tool`, `ToolRegistry`, `RunCommand` |
| 5 | Execution Policy and Approval Gates | `quecto_core::policy` | `src/quecto_core/policy/` | `Policy::decide`, `Decision` |
| 6 | Verification as a Completion Gate | `quecto_core::verify` | `src/quecto_core/verify/` | `Verifier::check`, `VerificationResult` |
| 7 | Context and Instruction Loading | `quecto_core::context` | `src/quecto_core/context/` | `Context`, `resolve_existing` |
| 8 | Sessions and State Management | `quecto_core::session` | `src/quecto_core/session/` | `Session`, `Session::push` |
| 9 | Profiles and Security Gates | `quecto_core::profile` | `src/quecto_core/profile/` | `Profile`, `Profile::from_json` |
| 10 | MCP — Model Context Protocol | `quecto_mcp` | `crates/quecto_mcp/` | `McpServer`, `McpError` |
| 11 | Observability and Telemetry | `quecto_telemetry` | `crates/quecto_telemetry/` | `Telemetry`, `Event` |
| 12 | Evaluation and Benchmarks | `quecto_evaluate` | `crates/quecto_evaluate/` | `Benchmark`, `Suite` |
| 13 | The Complete Reference Harness | `quecto_cli` | `bin/quecto` | `harness run`, `harness benchmark` |

## How to Read the Quecto Code

For each chapter, *open* the corresponding module (in the `quecto` repository) and *read* the public API (the `pub` structs and methods). Do *not* read the *internal* implementation (the `fn` methods that are *not* `pub`). The public API *is* what this book teaches. The internal implementation *is* implementation detail.

For example, for Chapter 4 (typed tools), *open* `src/quecto_core/tools/mod.rs` and *read* the `pub trait Tool` definition. Do *not* read the `impl ReadFile` method (unless you want to understand the *internal* file I/O).

> **Learning strategy:** Read the *book's source code* (in this worktree: `examples/reference-harness/src/`) *first*. Then *open* the *corresponding* module in the `quecto` repository. *Compare* them (what is the same? what is different?). The book's source is *simplified*; the Quecto source is *production* (with error handling, edge cases, and performance considerations).

## The Quecto vs. This Book

| Aspect | This Book | Quecto (production) |
|--------|-----------|--------------------|
| Tools | ReadFile, WriteFile, ApplyPatch, RunCommand | + Grep, GitStatus, ListFiles, Python, Bash |
| Policy | 3 presets (ReadOnly, Editor, Full) | Profiles (named bundles, per-repo, sub-profiles) |
| Security | Hard-denied command patterns (substring) | Token-based matching (first token in command) |
| Session | Single message list | Per-session file diff + verification state + retry count |
| MCP | stdio protocol (JSON-RPC 2.0) | stdio + HTTP (server can run remotely) |
| Telemetry | Local JSONL file | Local JSONL + remote server (POST) |
| Evaluation | `Benchmark` + `Suite` structs | CLI (`quecto benchmark run`) + web dashboard |

> **Important:** The book *intentionally* *simplifies* the Quecto reference. The book teaches *concepts* (the harness layers). The Quecto source *implements* those concepts *with* production concerns (error handling, concurrent safety, performance). *Do not* think the book is "wrong" because the Quecto source is more complex. The book is *foundational*; the Quecto source is *applied*.

## The Quecto Command Reference

The `quecto` CLI (the *production* command-line tool) maps *directly* to the chapters:

| CLI Command | Chapter |
|-------------|---------|
| `quecto run --repo <path>` | Chapters 3, 13 |
| `quecto run --profile <name>` | Chapter 9 |
| `quecto run --prompt "fix ..." --verify "cargo test"` | Chapter 6 |
| `quecto run --mcp server.json` | Chapter 10 |
| `quecto logs --session <id>` | Chapter 11 |
| `quecto benchmark run suite.yaml` | Chapter 12 |
| `quecto status` | Chapter 13 (post-run status) |

Each command *prints* (to the terminal) the *same data* that the CLI library returns (the `Outcome` enum, the telemetry events, the score). The CLI *is the presentation layer* (over the library).

> **Quecto in production:** The CLI is *two-layer*: (1) a *library* (`lib.rs`), (2) a *binary* (`bin/quecto`). The binary *calls* the library (it does *not* duplicate the library's logic). The binary's only job is to *parse CLI arguments*, *call* the library, and *print* the result (formatted for the terminal).

---

## Appendix B. Further Reading

1. **Anthropic API (Messages API)** — *how the model API works*. https://docs.anthropic.com/en/api/messages
2. **OpenAI Tool Calling** — *how tool calling works in the OpenAI API*. https://platform.openai.com/docs/guides/function-calling
3. **JSON-RPC 2.0 Specification** — *the protocol that MCP uses*. https://www.jsonrpc.org/specification
4. **git sparse-checkout** — *if you clone the full Quecto repository, use sparse-checkout to avoid downloading all modules*. `git sparse-checkout set quecto_core`
5. **cargo doc (Rust documentation)** — *to browse the Quecto source*. `cargo doc --open --package quecto_core`

## Appendix C. Glossary

| Term | Definition |
|------|-----------|
| **Harness** | The *system boundary* (model vs. harness). The harness is the *infrastructure* that sits *between* the model and the user. |
| **Policy** | A *gate* that decides whether a tool call should *execute*. Returns `Allow`, `Ask`, or `Deny`. |
| **Session** | A *single coding task's* isolated state (message history, file changes, verification result). |
| **Profile** | A *named configuration* (like "editor" or "docker-build") that selects *which* tools are allowed, *which* commands are blocked. |
| **MCP** (Model Context Protocol) | A *protocol* for the harness to *discover* tools (at startup) and *execute* tools (over a protocol) without hard-coding the tools' source. |
| **Telemetry** | *Observability*: the logging of every visible event (tool calls, errors, verification outcomes) to a durable file. |
| **Benchmark** | A *defined* coding task (repository, prompt, verification commands) with a *measurable* outcome (pass/fail). |
| **ReviewGate** | (From earlier chapters, not in this book) A *post-edit* review step (before the changes are applied) that checks the diff for *obvious regressions* (deleted imports, removed error handling). *Not included in this book (intentionally out of scope).* |
| **Progressive Disclosure** | A *UI/UX principle*: show the *simple* configuration by default; show the *advanced* configuration only when the user *opts in*. (Quecto's approach: default `ReadOnly`; user *explicitly* switches to `Full`.) |

---

## Appendix D. Build the Book (PDF)

To generate a PDF from this manuscript (if you want a *printable* version of this book):

1. Ensure `build_book.py` (and the `pdf/` modules) are installed and runnable (see the book's `build/` directory).
2. Run `python3 build_book.py --output static/books/building-a-coding-agent-harness.pdf`.
3. Validate the PDF (page count 70–80, TOC, bookmarks, no clipping).

> **Note:** The `build_book.py` and `pdf/` modules are *not included* in this book's manuscript. They are *in the worktree* (at `examples/build/` and `examples/pdf/`). The PDF pipeline is a *separate project* (a Python script using `reportlab` or `weasyprint`). If you want to produce a PDF, the pipeline code is in that directory.

---

*End of Appendix A.*
