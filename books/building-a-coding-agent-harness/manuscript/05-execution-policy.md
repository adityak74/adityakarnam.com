# 5. Execution Policy and Approval Gates

> Chapter 5 teaches you to design a *gate* that decides *whether* a tool call should execute. This gate is separate from the tool itself (a tool's job is to *do* something; the policy's job is to *decide* if it may). The gate supports three presets: readonly, editor, and full — each with increasing permissions.

## The Problem

A model will happily call `rm -rf /` if it thinks the file path matches. A model will also call `git push origin main` when you asked it to "fix a bug" (it thought you wanted to push the fix). Without a policy, the harness executes every tool call the model makes.

The policy layer answers: *should this tool call execute?*

The policy returns one of three decisions:
- **Allow** — execute immediately.
- **Ask** — wait for the user (human in the loop).
- **Deny** — reject unconditionally (the tool is unknown, or the command is hard-blocked).

> **System invariant:** The policy must be a *pure function* of the call and the preset. It must not inspect the file system (no file I/O in the policy decision). If it does, a file system error could *throttle* the agent (a file-system "file not found" error causes the policy to reject all calls).

## The Decision Enum

```rust
pub enum Decision {
    Allow,
    Ask,
    Deny(String),
}
```

- `Allow` — proceed without interruption.
- `Ask` — the user has authorized this operation but the preset does not permit it directly. The harness displays a prompt: "The agent wants to call `write_file("main.rs", ...). Approve?" The user (or a stored preset) responds Yes/No.
- `Deny(String)` — the call is unconditionally rejected. The string explains why (used in logs and in the agent's "Blocked" message).

## Presets

Three presets encode safety trade-offs:

| Preset | ReadFile | WriteFile | ApplyPatch | RunCommand |
|--------|----------|-----------|------------|------------|
| `ReadOnly` | ✓ (Allow) | ✗ (Ask) | ✗ (Ask) | ✗ (Ask) |
| `Editor` | ✓ (Allow) | ✓ (Allow) | ✓ (Allow) | ✗ (Ask) |
| `Full` | ✓ (Allow) | ✓ (Allow) | ✓ (Allow) | ✓ (Allow)* |

*\*Full does not mean all commands are allowed. It means all *tools* are allowed. The hard-denied command list (below) still applies.*

> **Quecto in production:** Quecto supports *profiles* (named configurations like `git-pushing`, `docker-build`, `readonly`). Each profile is a combination of preset + additional allowed commands. The teaching harness stops at the three presets above.

## Hard-Denied Commands

Even under the `Full` preset, certain commands are always blocked:

| Pattern | Example |
|---------|---------|
| `sudo ` (with space) | `sudo rm -rf /` |
| `sudo$` | `sudo; rm -rf /` |
| `git push` (with space) | `git push origin main` |
| `sh -c` | `sh -c 'rm -rf /'` |

These are patterns, not exact matches. A command containing any of these substrings is rejected. This is a conservative heuristic: it may *over-block* (e.g., a legitimate `sudo docker run --rm ...` is blocked because it contains "sudo "), but it avoids *under-blocking* (a destructive command slips through).

> **Failure mode:** If the pattern matching is too loose (matching "prefix" substring in "file-prefixed.log"), the agent cannot run legitimate commands. The heuristic should be tuned empirically. A better approach is *token-based* matching (match the first token against a block list) rather than substring matching.

## The Decide Method

The `Policy::decide(call)` method follows a simple three-step logic:

1. **Check the hard-denied list.** If the command matches a pattern, return `Deny("hard-denied command")`. (The check is performed on the `command` argument of the call.)
2. **Is the tool known?** A tool is "known" if it appears in *any* preset (across all presets). If the tool name is not known, return `Deny("unknown tool 'name'")`.
3. **Is the tool in the current preset?** If yes, `Allow`. If no (it is known but not in this preset), `Ask`.

```rust
{{include:../../examples/reference-harness/src/policy.rs}}
```

> **System invariant:** The `ALL_TOOLS` array (union of all preset tools) must be kept in sync with the actual tools registered in the harness. If you add a new tool, add its name to `ALL_TOOLS`. Otherwise the policy will incorrectly classify it as "unknown" (and deny it).

## Quecto's Version

Quecto's policy extends this with:
- **Per-repository profiles** (each repo has a named profile).
- **Per-tool overrides** (a specific tool can be allowed in one profile but denied in another).
- **Approval presets** (store user approval for a specific tool+path combination).

The teaching harness is simpler: one policy, one preset, no overrides.

## Exercise

Write a test that:
1. Creates a `ReadOnly` policy.
2. Verifies that `read_file("a")` returns `Allow`, `write_file("a", "...")` returns `Ask`.
3. Verifies that `run_command("printf safe")` returns `Ask`.
4. Creates a `Full` policy and verifies `run_command("echo ok")` returns `Allow`.

You can find equivalent tests in `tests/safety.rs` (test name: `policy_presets_gate_reads_edits_and_commands`).

---

## Beyond Rust

| Concept | Python | TypeScript |
|---------|--------|-----------|
| `Decision` | `enum: {Allow, Ask, Deny}` | `enum: { Allow, Ask, Deny }` |
| `Policy::decide` | Callable class: `def decide(self, call: ToolCall) -> Decision:` | `decide(call: ToolCall): Decision` |
| Preset | Dictionary mapping tool name → boolean | Record type |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test safety policy_presets_gate_reads_edits_and_commands
```

This test verifies that `ReadOnly` allows reads, asks writes, and asks commands.
