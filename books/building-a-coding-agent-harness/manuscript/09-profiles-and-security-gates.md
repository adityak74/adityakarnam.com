# 9. Profiles and Security Gates

> Chapter 9 designs layered per-project policy configuration. The generic "profile" model below is illustrative; the compact crate has only fixed presets, while production Quecto calls its TOML configuration *flavors*.

## The Problem

The three presets (ReadOnly, Editor, Full) from Chapter 5 are a *starting point* for teaching. In production, every repository has a *different threat model*. A Rust web server is not the same security posture as a personal finance script. A "Full" policy that allows `sudo docker run` on one repo is reckless on another.

A *profile* in the generic design is a named bundle of rules: allowed tools, blocked commands, approval requirements. The policy checks every proposed tool call against the resolved configuration before execution.

> **System invariant:** The harness must *never* execute a tool call that violates the active profile's rules. The policy decision is *not advisory* — a denied call is rejected, no approval prompt is shown, and the tool is *not executed*.

## The Profile Struct

A profile is a *deterministic configuration* (no file I/O during policy decisions). It contains:
- `allowed_tools` — the set of tool names permitted (empty = no tools, `*` = all).
- `blocked_commands` — patterns of shell commands that are always blocked (e.g., `sudo`, `git push`).
- `approval_required` — a set of (tool, path) pairs that require human approval, even if the tool is allowed.
- `profiles` — a map of *sub-profiles* (named overrides for specific tools).

> **Implementation boundary:** Profiles are a design chapter, not a module in the compact teaching crate. In Quecto, the corresponding production feature is called a *flavor* and is implemented in `quecto-agent/src/flavor.rs`.

In a profile-based design, load the active configuration before the run rather than allowing it to change unpredictably between tool calls. Quecto uses layered TOML flavor configuration; the compact reference crate has no configuration-file loader.

> **Failure mode:** If configuration changes while a run is in progress, the same tool call may be allowed under one policy state and denied under another. Snapshot the resolved policy at a clearly defined boundary and surface parse errors rather than silently falling back to a weaker mode.

## Profile Resolution

The exact configuration precedence is an application contract. Quecto's flavor resolution is implemented by `resolve` and related functions in `quecto-agent/src/flavor.rs`; read those before relying on a presumed filesystem path or default.

Quecto resolves ordered layers: user base flavor, optional user named flavor, project base flavor, and optional project named flavor. Later layers override keys left unspecified by earlier layers. Do not assume every merge policy is automatically restrictive; trust checks specifically gate project settings that grant privilege.

> **System invariant:** A repository profile *can only restrict*, never *relax*, the user profile. If the user profile says "no sudo" and the repository profile says "allow sudo", the effective result is "no sudo" (the *more restrictive* wins). This is the *default-deny* principle: the user's intent is always honored, even if the repository's intent conflicts.

## The Profile File Format

A profile file is a JSON document:

```json
{
  "name": "docker-build",
  "allowed_tools": ["ReadFile", "WriteFile", "RunCommand", "Grep"],
  "blocked_commands": ["sudo", "rm -rf /", "git push"],
  "approval_required": [],
  "sub_profiles": {
    "run_docker": {
      "allowed_tools": ["RunCommand"],
      "blocked_commands": ["sudo"],
      "approval_required": ["docker run --privileged"]
    }
  }
}
```

- `name` is the profile's identifier, selected by the application.
- `allowed_tools` is a set (subset of all tools).
- `blocked_commands` is a list of *patterns* (substring match).
- `approval_required` is a list of (tool, path) pairs, or wildcard `*` for *all* paths.
- `sub_profiles` is a map of *named overrides* (resolved dynamically when the agent explicitly requests the sub-profile, via a tool call `use_profile(name)`).

> **Quecto in production:** Quecto flavors are TOML manifests with layered configuration. The `Flavor` type denies unknown fields for its strict sections; `resolve` and related functions combine configuration sources. Project-scoped privilege is subject to trust checks. There is no `quecto profile list/create` subcommand; inspect `quecto-agent --help` and `quecto-agent/src/flavor.rs` for the actual interface and precedence.

## Profiles in Production

Quecto uses the `--flavor` option to select named TOML layers. Base files are `~/.config/quecto/flavor.toml` and `<repo>/.quecto/flavor.toml`; optional named files are stored under `flavors/<name>.toml` within those directories. The project layer follows the user layer. Trust-on-first-use protects project flavor settings that grant additional privilege.

> **Failure mode:** If the user override is persisted *globally* (applied to all future tasks), a one-time override becomes permanent. Overrides must *expire* (TTL). The harness should store an override as `{ profile: "full", expires: "2026-10-02T23:59:00Z" }`. After `expires`, the override is *automatically removed*.

## The Profile Gate

The policy checks against the active profile:
1. *Is the tool in `allowed_tools`?* (If not, `Deny("not in profile")`).
2. *Does the command match `blocked_commands`?* (If so, `Deny("blocked by profile")`).
3. *Is the (tool, path) pair in `approval_required`?* (If so, `Ask("approval required")`).

If the call passes all three checks, `Allow`. Otherwise, the harness *rejects* it (no execution, no approval prompt — the denial is logged and the tool call is *dropped*).

> **System invariant:** The policy must *never* execute a tool that is denied. The harness must *log* the denial (with the reason) and *skip* the tool call. The agent's next turn will receive a *denial message* (the text from `Deny(String)`), which the model will use to adjust its next call.

## Exercise

Write a test that:
1. Creates a `docker-build` profile with `allowed_tools: ["RunCommand"]`, `blocked_commands: ["sudo"]`.
2. Verifies that `RunCommand("docker build .")` returns `Allow`.
3. Verifies that `RunCommand("sudo docker run ...")` returns `Deny("blocked by profile")`.
4. Verifies that `WriteFile("main.rs", "...")` returns `Deny("not in profile")`.

This test demonstrates the *profile gate*: a named configuration that *restricts* tools and commands beyond the three presets.

---

## Beyond Rust

| Concern | Python | TypeScript |
|---------|--------|-----------|
| Profile JSON | `json.load(f)` | `JSON.parse(fs.readFileSync(...))` |
| Resolution | `resolve_profile(user, repo)` | `resolveProfile(userProfile, repoProfile)` |
| `allowed_tools` check | `tool_name in allowed` | `allowedTools.includes(toolName)` |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test safety policy_presets_gate_reads_edits_and_commands
```

This checkpoint exercises the implemented teaching policy. The profile exercise above is a design task, not an existing test.
