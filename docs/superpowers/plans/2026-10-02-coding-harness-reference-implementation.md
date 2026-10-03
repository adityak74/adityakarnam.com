# Coding Harness Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the compact, tested Rust coding harness that readers assemble throughout the book.

**Architecture:** A standalone Rust crate exposes narrow model, agent, tool, policy, verification, session, MCP, and telemetry boundaries. It deliberately mirrors Quecto's important seams without copying its full production complexity, and all book excerpts are sourced from this runnable implementation.

**Tech Stack:** Rust 2021, `ureq`, `serde`, `serde_json`, `toml`, `rusqlite` with bundled SQLite, `tiny_http` dev dependency, Cargo tests.

**Spec:** `docs/superpowers/specs/2026-10-02-building-a-coding-agent-harness-book-design.md`

## Global Constraints

- Work only in `books/building-a-coding-agent-harness/examples/reference-harness/` for this plan.
- Use `/Users/adityakarnam/Projects/quecto` as the authoritative local Quecto implementation reference; record its exact commit before extracting claims or patterns.
- The crate must compile on stable Rust and run without an async runtime.
- All network tests use a local mock server; tests must not call a live model provider.
- Repository tools must reject paths outside the configured repository root.
- Unknown tools and malformed tool arguments fail closed.
- The agent loop must terminate on completion, step limit, repeated action, policy denial streak, cancellation, or failed verification.
- Every intentional difference from Quecto must be recorded in `PRODUCTION-MAPPING.md` against a named Quecto commit.
- Never persist API keys, authorization headers, prompt bodies, or file contents in telemetry.
- Source excerpts use paired `// ANCHOR: name` and `// ANCHOR_END: name` comments, and every published include is validated against those anchors.

## Review Focus

- A symlink or `..` path escape must be rejected by `Context::resolve_existing` and `Context::resolve_for_create`; Task 3 pins both cases.
- A model repeating the same tool request must terminate before consuming the full step budget; Task 2 pins a three-observation guard.
- An unknown tool or malformed JSON arguments must become a structured tool error rather than panic; Task 2 pins both inputs.
- A verification command that times out or exits non-zero must prevent `Outcome::Complete`; Task 4 pins both outcomes.
- MCP and telemetry failures must degrade safely without losing the local run; Task 6 pins unavailable-server and unwritable-sink cases.

---

## File Structure

```text
books/building-a-coding-agent-harness/examples/reference-harness/
├── Cargo.toml
├── README.md
├── PRODUCTION-MAPPING.md
├── src/
│   ├── lib.rs
│   ├── main.rs
│   ├── model.rs
│   ├── agent.rs
│   ├── tools.rs
│   ├── context.rs
│   ├── policy.rs
│   ├── verify.rs
│   ├── instructions.rs
│   ├── session.rs
│   ├── profile.rs
│   ├── mcp.rs
│   └── telemetry.rs
└── tests/
    ├── model_http.rs
    ├── agent_loop.rs
    ├── safety.rs
    ├── persistence.rs
    └── end_to_end.rs
```

### Task 1: Model Boundary and OpenAI-Compatible Transport

**Files:**
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/Cargo.toml`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/lib.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/model.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/tests/model_http.rs`

**Interfaces:**
- Produces: `Message::{system,user,assistant,tool_result}`, `ToolCall`, `AssistantMessage`, `Model::complete(&[Message], &[Value])`, `HttpModel::new(ModelConfig)`.

- [ ] **Step 1: Write failing parsing and mock-HTTP tests**

Cover text replies, multiple tool calls, null content, missing choices, non-2xx status, and authorization-header omission when no key is configured.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `cargo test --test model_http`
Expected: compilation fails because the crate and model interfaces do not exist.

- [ ] **Step 3: Implement the model types and transport**

Use these exact public signatures:

```rust
pub trait Model: Send { fn complete(&mut self, messages: &[Message], tools: &[Value]) -> Result<AssistantMessage, ModelError>; }
pub struct ModelConfig { pub base_url: String, pub api_key: Option<String>, pub model: String, pub timeout_secs: u64 }
impl HttpModel { pub fn new(config: ModelConfig) -> Result<Self, ModelError>; }
```

- [ ] **Step 4: Run model tests and crate checks**

Run: `cargo test --test model_http && cargo clippy --all-targets -- -D warnings`
Expected: all model tests pass and Clippy reports no warnings.

- [ ] **Step 5: Commit**

```bash
git add books/building-a-coding-agent-harness/examples/reference-harness
git commit -m "feat(book): add reference model transport"
```

### Task 2: Typed Tools and Bounded Agent Loop

**Files:**
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/tools.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/agent.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/context.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/tests/agent_loop.rs`
- Modify: `books/building-a-coding-agent-harness/examples/reference-harness/src/lib.rs`

**Interfaces:**
- Consumes: Task 1 `Model`, `Message`, `ToolCall`, and `AssistantMessage`.
- Produces: minimal `Context`, `Tool`, `ToolRegistry`, `Agent`, `AgentConfig`, and `Outcome::{Complete,StepLimit,RepeatedAction,Blocked,Cancelled,VerificationFailed,Error}`.

- [ ] **Step 1: Write failing registry and loop tests**

Assert schema ordering is deterministic, unknown tools return `ToolError::Unknown`, malformed arguments return `ToolError::InvalidArguments`, ordinary completion returns text, step limit stops, and three identical call/result observations return `RepeatedAction`.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `cargo test --test agent_loop`
Expected: compilation fails on missing tool and agent types.

- [ ] **Step 3: Implement the tool and agent interfaces**

```rust
pub trait Tool: Send + Sync { fn name(&self) -> &'static str; fn description(&self) -> &'static str; fn schema(&self) -> Value; fn run(&self, args: &Value, cx: &mut Context) -> ToolResult; }
pub struct FileChange { pub path: PathBuf, pub before: Option<Vec<u8>>, pub after: Option<Vec<u8>> }
impl Context { pub fn new(repo_root: PathBuf) -> Result<Self, ContextError>; pub fn changes(&self) -> &[FileChange]; }
impl ToolRegistry { pub fn register(&mut self, tool: Box<dyn Tool>); pub fn schemas(&self) -> Vec<Value>; pub fn execute(&self, call: &ToolCall, cx: &mut Context) -> ToolResult; }
pub struct AgentConfig { pub system_prompt: String, pub max_steps: usize, pub repeat_limit: usize, pub denial_limit: usize }
impl Agent { pub fn new(model: Box<dyn Model>, registry: ToolRegistry, context: Context, config: AgentConfig) -> Self; pub fn run(&mut self, prompt: &str) -> Outcome; }
```

- [ ] **Step 4: Run loop tests and all crate tests**

Run: `cargo test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add books/building-a-coding-agent-harness/examples/reference-harness
git commit -m "feat(book): add bounded agent loop"
```

### Task 3: Repository Context, Editing, Policy, and Command Safety

**Files:**
- Modify: `books/building-a-coding-agent-harness/examples/reference-harness/src/context.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/policy.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/tests/safety.rs`
- Modify: `books/building-a-coding-agent-harness/examples/reference-harness/src/tools.rs`
- Modify: `books/building-a-coding-agent-harness/examples/reference-harness/src/agent.rs`

**Interfaces:**
- Consumes: Task 2 tool execution, agent loop, and minimal repository context.
- Produces: `Context`, `FileChange`, built-ins `ReadFile`, `SearchText`, `WriteFile`, `ApplyPatch`, `RunCommand`, and `Policy::decide(&ToolCall) -> Decision`.

- [ ] **Step 1: Write failing safety and mutation tests**

Cover canonical path escape, symlink escape, missing-parent creation, atomic write, ordered change journal, undo data, read-only/editor/full presets, unknown-tool denial, three consecutive policy denials returning `Blocked`, root deletion, `sudo`, shell-wrapper bypass, `git push`, timeout, cancellation, and bounded output.

- [ ] **Step 2: Run safety tests and confirm RED**

Run: `cargo test --test safety`
Expected: compilation fails on missing context and policy types.

- [ ] **Step 3: Implement context, built-ins, and fail-closed policy**

```rust
impl Context { pub fn new(repo_root: PathBuf) -> Result<Self, ContextError>; pub fn resolve_existing(&self, rel: &str) -> Result<PathBuf, ContextError>; pub fn resolve_for_create(&self, rel: &str) -> Result<PathBuf, ContextError>; pub fn changes(&self) -> &[FileChange]; }
pub enum Decision { Allow, Ask, Deny(String) }
pub enum Preset { ReadOnly, Editor, Full }
impl Policy { pub fn from_preset(preset: Preset) -> Self; pub fn decide(&self, call: &ToolCall) -> Decision; }
```

- [ ] **Step 4: Run safety, loop, and Clippy checks**

Run: `cargo test --test safety && cargo test --test agent_loop && cargo clippy --all-targets -- -D warnings`
Expected: all checks pass.

- [ ] **Step 5: Commit**

```bash
git add books/building-a-coding-agent-harness/examples/reference-harness
git commit -m "feat(book): add safe editing and policy gates"
```

### Task 4: Instructions and Verification Completion Gate

**Files:**
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/instructions.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/verify.rs`
- Modify: `books/building-a-coding-agent-harness/examples/reference-harness/src/agent.rs`
- Modify: `books/building-a-coding-agent-harness/examples/reference-harness/tests/end_to_end.rs`

**Interfaces:**
- Consumes: Task 3 bounded command runner and change journal.
- Produces: `load_instructions(repo_root) -> Result<Vec<InstructionSource>, InstructionError>`, `Verifier::run(&Context) -> VerificationReport`, and agent completion gating.

- [ ] **Step 1: Write failing precedence and verification tests**

Assert repository instructions append in documented order, missing instruction files are allowed, successful commands permit completion, non-zero and timeout reports block completion, and three unchanged failed attempts return `VerificationFailed`.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `cargo test --test end_to_end verification instructions`
Expected: tests fail because the modules are absent.

- [ ] **Step 3: Implement instruction loading and verification**

```rust
pub struct VerificationReport { pub passed: bool, pub attempts: usize, pub checks: Vec<CheckResult> }
impl Verifier { pub fn new(commands: Vec<String>) -> Self; pub fn run(&self, cx: &Context) -> VerificationReport; }
```

- [ ] **Step 4: Run all tests**

Run: `cargo test`
Expected: all tests pass, including failed-verification termination.

- [ ] **Step 5: Commit**

```bash
git add books/building-a-coding-agent-harness/examples/reference-harness
git commit -m "feat(book): gate completion on verification"
```

### Task 5: Sessions, Recovery, and Trusted Profiles

**Files:**
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/session.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/profile.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/tests/persistence.rs`
- Modify: `books/building-a-coding-agent-harness/examples/reference-harness/src/agent.rs`

**Interfaces:**
- Consumes: transcript messages, metadata, and Task 3 `FileChange` values.
- Produces: SQLite `SessionStore`, `SessionRecorder`, `Profile::load`, deterministic profile hashing, and trust-on-first-use decisions.

- [ ] **Step 1: Write failing persistence and trust tests**

Cover create/resume, ordered transcript round-trip, change round-trip, undo restoration, transaction rollback, corrupt database error, profile precedence, stable hash, changed privileged profile requiring renewed trust, and API-key rejection in profile files.

- [ ] **Step 2: Run persistence tests and confirm RED**

Run: `cargo test --test persistence`
Expected: compilation fails on missing session/profile modules.

- [ ] **Step 3: Implement persistence and profile interfaces**

```rust
impl SessionStore { pub fn open(path: &Path) -> Result<Self, SessionError>; pub fn create(&mut self) -> Result<SessionId, SessionError>; pub fn load(&self, id: &SessionId) -> Result<SessionSnapshot, SessionError>; pub fn record_turn(&mut self, id: &SessionId, messages: &[Message], changes: &[FileChange]) -> Result<(), SessionError>; }
pub struct CliOverrides { pub model: Option<String>, pub base_url: Option<String>, pub max_steps: Option<usize>, pub verify: Vec<String>, pub preset: Option<Preset> }
impl Profile { pub fn load(global: Option<&Path>, project: Option<&Path>, cli: CliOverrides) -> Result<Self, ProfileError>; pub fn content_hash(&self) -> String; }
```

- [ ] **Step 4: Run all tests and Clippy**

Run: `cargo test && cargo clippy --all-targets -- -D warnings`
Expected: all checks pass.

- [ ] **Step 5: Commit**

```bash
git add books/building-a-coding-agent-harness/examples/reference-harness
git commit -m "feat(book): add sessions and trusted profiles"
```

### Task 6: MCP, Telemetry, Evaluation Fixture, and CLI

**Files:**
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/mcp.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/telemetry.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/src/main.rs`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/README.md`
- Create: `books/building-a-coding-agent-harness/examples/reference-harness/PRODUCTION-MAPPING.md`
- Modify: `books/building-a-coding-agent-harness/examples/reference-harness/tests/end_to_end.rs`

**Interfaces:**
- Consumes: registry, agent, session, profile, and model interfaces from Tasks 1-5.
- Produces: `McpClient::discover`, `EventSink::emit`, executable `reference-harness`, a deterministic fixture evaluation, and the Quecto production map.

- [ ] **Step 1: Write failing integration tests**

Assert MCP tool discovery/dispatch against a local fixture, unavailable MCP server leaves built-ins usable, duplicate external names are rejected, JSONL telemetry contains run/step/tool/verify/end events without secrets or contents, unwritable telemetry logs a warning without failing the run, and the fixture task completes with a verified file change.

- [ ] **Step 2: Run integration tests and confirm RED**

Run: `cargo test --test end_to_end`
Expected: tests fail on absent MCP, telemetry, and CLI wiring.

- [ ] **Step 3: Implement the final interfaces and CLI**

```rust
pub trait EventSink: Send { fn emit(&mut self, event: &Event) -> Result<(), TelemetryError>; }
pub struct McpConfig { pub servers: Vec<McpServerConfig>, pub timeout_secs: u64 }
impl McpClient { pub fn discover(config: &McpConfig) -> Result<Vec<Box<dyn Tool>>, McpError>; }
```

The CLI accepts `--repo`, `--model`, `--base-url`, `--profile`, `--max-steps`, `--verify`, `--session-db`, `--trace`, and a prompt; environment variables supply the API key.

- [ ] **Step 4: Pin the Quecto reference and document differences**

Record the inspected Quecto commit hash and map each teaching module to its production counterpart in `PRODUCTION-MAPPING.md`.

- [ ] **Step 5: Run the complete reference validation**

Run: `cargo fmt --check && cargo clippy --all-targets -- -D warnings && cargo test`
Expected: formatting, linting, unit, integration, and fixture evaluation all pass.

- [ ] **Step 6: Commit**

```bash
git add books/building-a-coding-agent-harness/examples/reference-harness
git commit -m "feat(book): complete reference coding harness"
```
