# 1. The Harness Is the System

> Chapter 1 teaches you to separate *capability* from *behavior*, to define the boundaries that determine what an agent will (and will not) do, and to establish invariants that constrain the system even when the model drifts.

## The Problem

You can buy a model that writes Python, solves equations, and reasons about code. You can prompt it to "fix a bug" and it will attempt to do so. What is missing is the harness: the system that *constrains* what the model attempts, *watches* what it does, *measures* whether it succeeded, and *controls* what resources it touches.

A harness decides:

- Which tools the model may call.
- Which files the model may read or write.
- How many steps the agent may take before giving up.
- When the agent has repeated an action without progress.
- Which commands are permitted and which are blocked.
- Whether the output passes verification (tests, linters).
- How many verification attempts it gets before reporting failure.

Without a harness, you have a model that may write `rm -rf /` and you have no way to stop it. With a harness, you have a model that may *try* to write `rm -rf /` and the harness denies the call before it executes.

The harness is the system. The model is only the model.

## The Model Boundary

The boundary between the model and the harness is the **API call**. This is a request (messages + tools) and a response (content + tool calls). Everything between the API call and the next API call is the harness.

```
┌─────────────────────────────────────┐
│        THE MODEL                    │
│  (capability: reasoning, generation)│
│                                     │
│  request  ←────────────────────→  response  │
│  (messages, tools)              (content, tool_calls)
│                                     │
│  392 tokens in, 190 tokens out      │
│  (example, model-dependent)         │
└─────────────────────────────────────┘
        ↑                                    │
        │  (HARNESS: steps 1 through N)       │
        │                                     │
```

The harness sits between calls. It transforms the response into a decision (what to do next), executes that decision (tools), and accumulates the result (messages) for the next model call.

> **System invariant:** The harness must preserve the contract of the API. The response it receives from the model must be parseable as either text output or tool calls — no unhandled format is acceptable.

## The Message Protocol

The model protocol is simple: a list of messages (system, user, assistant, tool), each with a role, a content string, and optional tool calls. The tool call returns a tool result. The harness builds the message list, sends it, and processes the response.

```rust
{{include:../examples/reference-harness/src/model.rs#ANCHOR: message-types}}
```

The `Message` type distinguishes four roles: `system`, `user`, `assistant`, and `tool`. The `ToolCall` type carries an identifier, a name, and JSON arguments. The `AssistantMessage` carries the model's response (text plus optional tool calls) and a finish reason.

> **Failure mode:** If the harness silently drops a response field that affects control flow, it can mis-handle the turn. Decide explicitly which fields are part of the supported contract. This teaching parser validates the fields it consumes; it does not reject every unknown JSON field, which is a separate forward-compatibility choice.

The harness also sends tool definitions (JSON schemas) alongside the messages. This is how the model knows *what* tools exist and *what* arguments each accepts.

## The Model Trait

The model trait is the single interface between the harness and the model:

```rust
{{include:../examples/reference-harness/src/model.rs#ANCHOR: model-trait}}
```

This is intentionally narrow. The harness calls `complete` once per loop iteration and passes all messages together (full history). The model mutates its own state (session variables, token cache, stream buffer). The harness never inspects the internal state.

The `Send` bound means the model can be moved between threads if a caller chooses to do so; this teaching agent loop does not spawn a worker. The model receives tool schemas from the harness as JSON values, letting the harness control what the model sees without hard-coding tool types in the transport layer.

> **System invariant:** The model trait must never leak memory addresses, file handles, or tokens into the message flow. The only thing crossing the boundary is messages, tool schemas, and responses.

## The HTTP Transport

The default transport is a minimal HTTP client that:

- Normalizes the endpoint URL (trailing slash handling).
- Sends `Authorization: Bearer <key>` when a key is configured.
- Parses the JSON response into typed structs (`AssistantMessage` with `content`, `tool_calls`, `finish_reason`).
- Returns structured errors (`ModelError`) rather than panicking.

```rust
{{include:../examples/reference-harness/src/model.rs#ANCHOR: http-completion}}
{{include:../examples/reference-harness/src/model.rs#ANCHOR: parse-assistant}}
```

The error type distinguishes four classes:
- `InvalidConfig` — the harness configuration is wrong (missing base URL, empty model name).
- `Transport` — the network call itself failed (DNS, TLS handshake, timeout).
- `HttpStatus` — the server returned a non-200 status (401, 500, etc.).
- `InvalidResponse` — the model's response structure was unexpected (no `choices[0]`).

> **Failure mode:** If the harness silently accepts any HTTP response (treating a 400 Bad Request as a "model is thinking" signal), the agent will loop forever on a configuration error. Every non-200 response *must* be surfaced as an error.

## Quecto in Production

Quecto's production `quecto-agent` crate defines its own related `Model` interface; it is not the same Rust trait as this teaching crate. Its production path adds:

- Streaming output (incremental token-by-token rendering).
- OpenAI-compatible and Anthropic wire formats, plus configurable providers such as local OpenAI-compatible servers.
- Optional native reasoning controls and token-usage telemetry.
- Session persistence, verification, and optional OpenTelemetry integration at the agent layer.

The teaching harness omits streaming (the book's primary path is synchronous). See the "Beyond Rust" note below for how these features map to Python (using `httpx` streams) or TypeScript (using `ReadableStream`).

## Exercise: Extend the Model

Write a unit test that sends a 401 Unauthorized response and verifies the harness returns `ModelError::HttpStatus`. Then modify `HttpModel::new` to reject empty `base_url`. Push these tests to the reference harness.

---

## Beyond Rust

| Concern | Python | TypeScript | Go |
|---------|--------|-----------|----|
| `Model::complete` | `openai::client.complete(messages, tools)` | `openai.Client.chat.completions.create` | `openai.Client.Chat` |
| `Send` bound | Not needed (GIL) | `Promise` in async/await | `sync` |
| Streaming | `response.iter_lines()` | `ReadableStream` | `http.Response.Body` |

## Build checkpoint

You can build the crate and run the model transport tests:

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test model_http
```

The model transport integration tests should pass. Run `cargo test` to execute the full reference-crate suite.
