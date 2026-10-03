# 7. Context and Instruction Loading

> Chapter 7 teaches you to load repository instructions, system prompts, seeded context, and precedence rules *before* the agent starts. You will also learn to protect against accidental instruction mixing (e.g., a `.env` file's instructions are not the *project* instructions).

## The Problem

A coding agent needs *context* before it starts working. It needs to know:
- What is the repository root?
- What are the rules (encoded in a `.rules.md` file)?
- What is the project structure (file tree)?
- What are the APIs used in this codebase?
- What commands are available (lint, test, build)?

If the agent cannot find these instructions, it must *guess*, and guessing is bad. A well-designed harness *loads context* from a standardized location (`.claude/rules.md`, `.gpt_prompt.md`, `README.md`) *before* any model call.

> **System invariant:** The agent must *never* inject instructions that are not authorized by the current project. If the user's `.env` file contains an instruction like "always prepend the UUID header," the agent must *not* load that instruction.

## The Context Object

The `Context` struct holds:
- `repo_root` — the repository root (canonicalized).
- `changes` — a list of all file modifications (before/after).
- `limits` — optional command execution limits (timeout, output size).
- `cancel_token` — a handle that allows the harness to cancel a running command.

```rust
{{include:../examples/reference-harness/src/context.rs}}
```

The `Context::new(root)` constructor canonicalizes the root and returns an error if it is not a valid directory. The `Context::with_command_limits(root, limits, token)` constructor adds command execution support (see the `run_command` section below).

> **System invariant:** `Context::new` must *never* panic or accept an invalid path. It must return `ContextError` (or `None` in the result type) for any invalid path.

## Path Resolution

The harness exposes two path resolution methods:

| Method | Purpose | Behavior |
|--------|---------|----------|
| `resolve_existing(relative)` | Read a file. | Must exist (canonicalized). Rejects path escapes (canonical path outside repo). |
| `resolve_for_create(relative)` | Write a file. | Parent directory must exist (but the file itself need not). |

> **System invariant:** Both methods must *reject* paths that escape the repository root. If `relative = "../etc/passwd"`, the canonicalized path is outside the repo, and the method returns `ContextError`.

A path escape is any `..` component or symlink that, when resolved, points outside the repo root.

## The Command Boundary

When command execution is configured (`with_command_limits`), the context exposes `run_command(command)`:

```rust
// Part of context.rs (full implementation)
```

The command is executed as `/bin/sh -c "command"`. The harness supports:
- **Timeout** — the command aborts after the configured duration (default: 30 seconds).
- **Output truncation** — if the output exceeds `max_output_bytes` (default: 64 KB), the output is truncated and the `truncated` flag is set.
- **Cancellation** — the `CancelToken` allows the harness to cancel a running command at any point (used in the agent's cancellation flow).

> **Failure mode:** If the harness does not apply a timeout, a hanging `sleep 10000` command will block the agent indefinitely. Always set a timeout (default 30 seconds).

## Seed Instructions

The harness can be seeded with instructions:
- **System prompt** (hard-coded in the harness).
- **Repository instructions** (from a `.claude/rules.md` file in the repo root).
- **Seeded context** (explicitly provided in the model config).

The precedence is:
1. Hard-coded system prompt (always present).
2. Repository instructions (if `.claude/rules.md` exists).
3. Seeded context (explicit, highest priority).

> **Quecto in production:** `quecto-agent/src/instructions.rs` loads `AGENTS.md`, `CLAUDE.md`, and `.agent/instructions.md` from the repository root down to the current working directory. Root instructions are emitted first and nearer instructions later. `quecto-agent/src/context.rs` separately seeds task context; see the pinned source in Appendix A.

## Exercise

Write a test that:
1. Creates a temp directory with a file `instructions.md` containing `always prepend "PRIORITY: "` to output`.
2. Verifies that the context's `resolve_existing("instructions.md")` succeeds, but the *instructions file is NOT injected* as system prompt (system prompt must come from the config, not from arbitrary files).

This test demonstrates the *separation of concerns*: instructions are input to the *user's prompt*, not the *model's system prompt*.

---

## Beyond Rust

| Concern | Python | TypeScript |
|---------|--------|-----------|
| Repo root | `Path(os.getenv("REPO_ROOT"))` | `process.env.REPO_ROOT` |
| Instructions | `open(rules_path)` | `readFileSync(rules_path, 'utf-8')` |
| Seed | `config.seed: "..."` | `seed: "..."` |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test safety context_rejects_parent_and_symlink_path_escapes
```

This test verifies that the context rejects path escapes (including symlinks).
