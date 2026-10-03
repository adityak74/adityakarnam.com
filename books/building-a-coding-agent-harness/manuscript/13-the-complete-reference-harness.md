# 13. The Complete Reference Harness

> This chapter assembles the runnable teaching crate from Chapters 1–5 and connects it to the runtime concerns studied in Chapters 6–12. The book's crate is intentionally compact; it is not a duplicate of production Quecto.

## What You Have Built

At this point, the reference crate has a real model boundary, a bounded loop, typed tools, repository path checks, a command boundary, and a policy gate. Its structure is deliberately small:

```text
reference-harness/
├── Cargo.toml
├── src/
│   ├── lib.rs       # module exports
│   ├── model.rs     # messages, Model, OpenAI-compatible HTTP
│   ├── agent.rs     # loop, outcomes, repeat/denial limits
│   ├── tools.rs     # typed tools and deterministic registry
│   ├── context.rs   # repository paths and bounded command runner
│   └── policy.rs    # allow / ask / deny decisions
└── tests/
    ├── agent_loop.rs
    ├── model_http.rs
    └── safety.rs
```

The implementation does **not** include production sessions, profiles, verification retries, MCP, telemetry, evaluation, or a CLI. Those concerns are explored as design extensions and mapped to production source in Appendix A. Keeping that distinction visible matters: a reader should be able to run every claim about the teaching crate without discovering that the corresponding file was never written.

## Exercise the Integrated Core

Run the full reference suite:

```sh
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test
```

The integration tests use a scripted model and local mock HTTP server, so they do not need model credentials. They exercise normal completion, tool dispatch, bounded stopping, repeat detection, policy decisions, repository path containment, and HTTP error handling. Tests that spawn shell processes are marked ignored in restricted environments; run them only where subprocess creation is permitted.

The crate is a library component, not a ready-to-use coding-agent executable. To turn it into one, add a small CLI that parses a repository path and task, constructs `Context`, registers the built-in tools, chooses a policy preset, builds `HttpModel` from environment configuration, and invokes `Agent::run`. Keep the CLI as an adapter: transport, policy, and tool behavior should remain testable without terminal input.

## Production Quecto Is the Larger Reference

The production system is a Cargo workspace rather than this one-crate teaching example:

```text
quecto/                 # synchronous OpenAI-compatible core
quecto-agent/           # coding-agent runtime and CLI
quecto-mcp/              # optional MCP client transports
quecto-eval/             # evaluation and compatibility experiments
```

The `quecto-agent` library exports its public agent, model, policy, tool, sandbox, session, verification, flavor, and trust APIs. Its binary is named `quecto-agent`; it supports direct prompts and the `chat`, `resume`, `undo`, `diff`, and `new` subcommands. MCP and OpenTelemetry are opt-in Cargo features. Consult `quecto-agent --help` and Appendix A instead of relying on commands from an earlier draft of this book.

From a Quecto checkout, the general verification entry point is:

```sh
cargo test --workspace
```

The teaching crate and production workspace intentionally have different public types. Port a concept, not an assumed API: compare the invariant first, then identify how the production system enforces it.

## Design Review Checklist

Before adapting the harness to a real repository, answer these questions:

1. Is every model response represented as either ordinary text or a typed tool call?
2. Are tool names, arguments, paths, and command permissions checked before side effects?
3. Are loop limits and error outcomes explicit and testable?
4. Can a user distinguish a model claim from a verified result?
5. Are secrets excluded from logs and diagnostics by construction?
6. Can an interrupted task be recovered without replaying unsafe operations?
7. Can an evaluation reproduce the agent, tool set, repository revision, and verification commands used?

These are not all implemented in the book's compact crate. Treat unanswered items as deliberate follow-up engineering, not as implied features.

---

*End of Chapter 13.*
