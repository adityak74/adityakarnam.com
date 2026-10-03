# 2. One Model Call, No Framework

> Chapter 2 teaches you to treat the model as a **fidelity source of truth**, not as a co-scientist. The model gives you output; the harness gives you safety. You will build a model transport that preserves the model's raw behavior (including its failures) while surfacing errors in a structured way.

## The Problem

Many agent frameworks add layers *between* the user and the model: a "safety filter" that rewrites prompts, a "pre-processor" that reformats messages, a "post-processor" that claims to improve the output. These layers are invisible to the harness writer and may contradict the harness's own invariants.

A minimal harness says: the model gives you what the model gives you. The harness decides what to *do* with it. The model is not trusted to decide what to *say* (that is the harness's job: policy, tools, constraints). The model is trusted to *generate text* (that is its job).

The boundary: **one model call per loop iteration, full history sent together.**

## Configuration

The model transport is configured with a single struct:

```rust
{{include:../examples/reference-harness/src/model.rs#ANCHOR: model-config}}
```

`ModelConfig` carries four fields:
- `base_url` — the provider endpoint (normalize to always append `/v1/chat/completions`).
- `api_key` — optional; omitting it is valid for local providers (Ollama, LM Studio).
- `model` — the model name (e.g., `"qwen3.8-35b"`).
- `timeout_secs` — how long to wait before giving up.

> **Failure mode:** If `base_url` is empty and `timeout_secs` is `0`, the `HttpModel::new` constructor returns `ModelError::InvalidConfig`. A zero timeout means the request will *always* fail (the HTTP client will abort immediately). This is not a runtime bug; it is a configuration bug surfaced at initialization.

## HTTP Round-Trip

The harness constructs the request body as a JSON object with `model` and `messages`. If tools exist, it adds a `tools` array. It sends a `POST` with `Content-Type: application/json` and an optional `Authorization` header.

```rust
{{include:../examples/reference-harness/src/model.rs#ANCHOR: http-completion}}
```

The `endpoint` method normalizes the URL: if the base URL already ends with `/v1`, it appends `/chat/completions`; otherwise it appends `/v1/chat/completions`. This handles both `https://api.openai.com/v1` and `https://api.openai.com` correctly.

> **System invariant:** The request body must be a valid OpenAI-compatible format. The harness must not add custom fields (like `temperature`, `max_tokens`) unless they are explicitly supported by the target provider. Do not assume a model supports `temperature=0.5` just because another model does.

## Parsing the Response

The model returns a JSON body. The harness parses it into an `AssistantMessage`:

```rust
{{include:../examples/reference-harness/src/model.rs#ANCHOR: parse-assistant}}
```

The parser extracts:
- `content` — the text (empty string if null).
- `tool_calls` — a list of call objects (empty list if none).
- `finish_reason` — `"stop"`, `"length"`, or `"tool_calls"` (or empty string if missing).

> **Failure mode:** If the model returns `finish_reason: "content_filter"` (content filtered out by the provider), the harness treats the text as empty. Some frameworks interpret this as a *request for user feedback*. The harness here is silent: no text, no tool calls, step ends (and the next loop iteration will send the same messages). This is intentional — we do not want the agent to *retry* a filtered prompt without understanding *why* it was filtered.

The `parse_assistant` function returns `ModelError::InvalidResponse` if the response is structurally wrong (no `choices`, no `message`, non-string content, or invalid tool call arguments). A malformed response is *never* treated as "the model gave no output."

## Provider Differences

Different providers behave differently:

| Provider | Tool call format | `finish_reason` on tool calls |
|----------|-----------------|-------------------------------|
| OpenAI   | `{"id":"call_...", "function":{"name":"read_file","arguments":"..."}}` | `"tool_calls"` |
| Anthropic | `{"id":"toolu_...", "input":{"path":"..."}, "type":"tool_use"}` | (no finish_reason, tool calls implied) |
| Ollama   | Same as OpenAI (OpenAI-compatible endpoint) | `"tool_calls"` |

The teaching harness uses the OpenAI format. If you target Anthropic, you must parse a slightly different structure (`input` is a raw object, not a JSON string). The `Beyond Rust` note below shows the mapping.

> **Quecto in production:** Quecto supports provider adapters that normalize all responses to a single internal format before parsing. This isolates provider-specific parsing from the harness's core logic.

## Exercise

Write a mock model that returns a response with `finish_reason: "content_filter"` and an empty content string. Verify the harness returns `Outcome::Complete("")`.

---

## Beyond Rust

| Layer | Python | TypeScript |
|-------|--------|-----------|
| Transport | `openai::client.chat.completions.create(messages=msgs, tools=tools)` | `openai-js` or `fetch` |
| Config | `base_url` (default `"https://api.openai.com/v1"`) | Same, or `OPENAI_API_KEY` env var |
| Timeout | `timeout=float(options.timeout)` | `AbortSignal.timeout(timeout)` |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test model_http
```

Test `returns_text_reply_and_sends_openai_compatible_body` asserts the request body matches the OpenAI spec. Run it in isolation:

```bash
cargo test --test model_http returns_text_reply
```
