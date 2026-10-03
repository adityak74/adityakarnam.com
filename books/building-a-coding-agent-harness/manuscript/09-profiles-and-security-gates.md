# 9. Profiles and Security Gates

> Chapter 9 teaches you to replace *one-size-fits-all* safety with *per-repository profiles*. A profile is a named configuration (e.g., "readonly," "editor," "docker-build") that selects which tools are allowed, which commands are blocked, and which operations require human approval. The harness *configures* one profile per repository and *denies* calls that violate the profile's rules.

## The Problem

The three presets (ReadOnly, Editor, Full) from Chapter 5 are a *starting point* for teaching. In production, every repository has a *different threat model*. A Rust web server is not the same security posture as a personal finance script. A "Full" policy that allows `sudo docker run` on one repo is reckless on another.

A *profile* is a named bundle of rules: allowed tools, blocked commands, approval requirements. The harness selects one profile per repository (from a `.quecto/profile` file, a CLI flag, or a profile directory). The policy *checks* every tool call against that profile's rules.

> **System invariant:** The harness must *never* execute a tool call that violates the active profile's rules. The policy decision is *not advisory* — a denied call is rejected, no approval prompt is shown, and the tool is *not executed*.

## The Profile Struct

A profile is a *deterministic configuration* (no file I/O during policy decisions). It contains:
- `allowed_tools` — the set of tool names permitted (empty = no tools, `*` = all).
- `blocked_commands` — patterns of shell commands that are always blocked (e.g., `sudo`, `git push`).
- `approval_required` — a set of (tool, path) pairs that require human approval, even if the tool is allowed.
- `profiles` — a map of *sub-profiles* (named overrides for specific tools).

```rust
{{include:../../examples/reference-harness/src/profile.rs#ANCHOR: profile-struct}}
```

A profile is loaded *once* (at harness startup) from a YAML or JSON file (e.g., `~/.quecto/profiles/docker-build.json`). The harness *does not read a profile file at every tool call*. Reading a file per call makes the policy *unreliable* (if the file is deleted, a lock is held, or the permissions change, the policy decision changes mid-run).

> **Failure mode:** If the harness reads a profile file *during* policy decisions (instead of loading it once at startup), and the file is accidentally moved or deleted, the policy falls back to *default* (which may be unsafe). The profile must be *loaded once, executed always*.

## Profile Resolution

The harness resolves a profile by:
1. Reading `~/.quecto/profiles/<name>.json` (user's profile directory).
2. Reading `<repo>/.quecto/profile` (repository-level override).
3. If neither exists, using `ReadOnly` (default).

The resolution order is *always* — user profile → repository profile → default. A repository-level profile *cannot* relax a user-level restriction (a user-level profile can restrict a repository's wider permissions).

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

- `name` is the profile's identifier (used in `~/.quecto/profile` and in CLI).
- `allowed_tools` is a set (subset of all tools).
- `blocked_commands` is a list of *patterns* (substring match).
- `approval_required` is a list of (tool, path) pairs, or wildcard `*` for *all* paths.
- `sub_profiles` is a map of *named overrides* (resolved dynamically when the agent explicitly requests the sub-profile, via a tool call `use_profile(name)`).

> **Quecto in production:** Quecto stores profiles in `~/.quecto/profiles/*.json`. The CLI command `quecto profile list` lists them. The user can *create* a profile with `quecto profile create --allow RunCommand --deny "sudo "` (which writes a JSON file). The harness *does not validate the JSON against a schema*; an invalid profile file is *silently skipped* (loaded once, if parse fails, the next session uses the default `ReadOnly`).

## Profiles in Production

Quecto uses profiles in four ways:
1. **Per-repository** — each repository has a `.quecto/profile` file. If the file says `"docker-build"`, the harness loads the corresponding profile and applies it.
2. **Per-task** — the user can specify a profile at task start: `quecto task --profile editor "fix the auth bug"`. The task-level profile *overrides* the repository-level one.
3. **Sub-profiles** — a profile can have sub-profiles (e.g., `docker-build/run_docker`). The agent can *request* a sub-profile explicitly (a tool call `use_profile("run_docker")`). The harness checks the sub-profile's rules (approval_required: `docker run --privileged`).
4. **User override** — the user can *temporarily* override a profile for one task (e.g., `quecto task --allow-sudo "install this package"`). The harness records the override in a *cache* (valid for 1 hour) and applies it only to that task.

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
cargo test --test safety profile_docker_build_allows_run_denies_sudo
```

This test verifies that a `docker-build` profile allows `RunCommand` but blocks `sudo` and disallows `WriteFile`.
