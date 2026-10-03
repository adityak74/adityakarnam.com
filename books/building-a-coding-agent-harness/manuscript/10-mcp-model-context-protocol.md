# 10. MCP — Model Context Protocol for Tool Expansion

> Chapter 10 teaches you to *expand* the harness's tool surface *without changing the harness itself*. You will implement an MCP server (a tool provider) that: (1) advertises tools over a stdio/pipe or HTTP transport, (2) the harness *discovers* tools at startup (no compile-time dependency on the tool's source), and (3) the harness *executes* tools over the protocol (calling back into the MCP server).

## The Problem

The three built-in tools (ReadFile, WriteFile, ApplyPatch) + RunCommand are *hard-coded* in the harness. If a harness user wants to add a tool (e.g., "run `cargo test` with a custom filter"), they must *modify the harness source* and *recompile*. This defeats the purpose of a *reusable* harness.

MCP (Model Context Protocol) solves this: the harness *discovers* tools at startup (a list of tool schemas), and *executes* tools over a protocol (a request-response pattern). The tool's source lives in a *separate process* (an MCP server). The harness *does not know* the tool's implementation; it only knows the tool's *schema* (name, description, parameters).

> **System invariant:** The harness must *never* load or *execute* a tool without the user's explicit consent (the user must *opt in* to each MCP server). The harness must *not* run MCP servers from untrusted sources (no hash verification of the server's binary). The user *knows* which server is running (from the command line or a trusted path).

## The MCP Server

An MCP server is a *process* that:
- Exposes a list of tools (name, description, JSON schema).
- Listens for tool calls (a request with `method`, `params`).
- Returns a result (a response with `result` and `error`).

The server can communicate over:
- **stdio** — the harness starts the process, sends JSON-RPC 2.0 messages over stdin/stdout.
- **HTTP** — the harness POSTs JSON-RPC 2.0 messages to an HTTP endpoint (more complex, but supports remote servers).

The harness *discovers* tools (at startup) by *sending an initialize request* to the server:

```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": { "protocolVersion": "2024-11-05" },
  "id": 1
}
```

The server responds with `tools/list` (an array of tool schemas). The harness *registers* each tool in the `ToolRegistry` (so the model sees them).

> **Failure mode:** If the MCP server *times out* (no initialize response), the harness must *skip* the server (not crash). The harness should log a warning: "MCP server `<name>` did not respond; skipping." The harness *does not block* on a dead MCP server.

## The MCP Tool

An MCP tool is a *tool* that the harness executes over the protocol:
- The harness *sends* a request: `{"method": "tools/call", "params": {"name": "read_file", "arguments": {"path": "src/main.rs"}}}`.
- The server *responds* with `{"result": {"content": [...]}}` (or `{"error": {"code": ..., "message": ...}}`).
- The harness *parses* the response (converting it to a `ToolResult`).

The harness *does not care* what the server does. The server might read a file (the built-in ReadFile), or run a docker command, or query an API. The harness *only* cares about the schema and the result.

> **System invariant:** The harness must *validate* the MCP response (the response must be a valid JSON-RPC 2.0 object). If the server returns invalid JSON, or an unexpected field, the harness must *not* crash. Instead, it must return a `ToolResult::Failed` with the error message from the server.

## The Protocol (JSON-RPC 2.0)

MCP uses JSON-RPC 2.0 over a transport (stdio or HTTP). The protocol defines:
- `initialize` — client sends capabilities, server responds with capabilities + tool list.
- `tools/list` — client requests tool list (called once at startup).
- `tools/call` — client calls a tool (per agent step).
- `notifications/initialized` — client sends an acknowledgment (after initialization).
- `notifications/message` — server sends a log message (for observability).

The harness *must implement* the `initialize` + `tools/list` handshake (at startup) and the `tools/call` execution (per tool call).

> **Quecto in production:** Quecto runs MCP servers *in the same process* (as separate tasks, not separate processes) for debugging ease. In production, Quecto runs MCP servers *in separate processes* (with a timeout of 10 seconds per call). The harness *does not share* memory with the server (the server's memory space is *isolated* from the harness's memory space — a server crash does not corrupt the harness's state).

## The Discovery Protocol

The discovery process is:
1. The harness *starts* the MCP server (as a subprocess, with a known binary path).
2. The harness *sends* the `initialize` request (JSON-RPC 2.0 over stdio).
3. The harness *parses* the response (tool list).
4. The harness *registers* each tool in the `ToolRegistry` (adds the tool name + schema).
5. The harness *sends* `notifications/initialized`.

If the server *fails to respond* (timeout), the harness *logs a warning* and *continues* (without the server's tools). The harness *does not fail* if a server is unreachable.

> **Failure mode:** If the harness *crashes* during initialization (e.g., the server's response is a malformed JSON), the harness *must* recover (log the error, skip the server, continue). The harness *must not* leave the agent in a crashed state.

## Exercise

Write a test that:
1. Starts a *mock* MCP server (a test double that returns a fixed tool list).
2. Verifies that the harness registers 2 tools (one named "read_file", one named "write_file").
3. Verifies that the harness *can execute* a tool call (sends a `tools/call`, receives a result).

This test demonstrates the *discovery protocol*: the harness discovers tools (at startup) and *executes* them (over the protocol) without knowing the implementation.

---

## Beyond Rust

| Concern | Python | TypeScript |
|---------|--------|-----------|
| MCP stdio | `subprocess.Popen` + `json.loads` | `child_process.spawn` + `JSON.parse` |
| Tool list | `{"jsonrpc":"2.0","method":"initialize"}` | Same |
| Tool call | `{ "method":"tools/call", "params":{...} }` | Same |

## Build checkpoint

```bash
cd books/building-a-coding-agent-harness/examples/reference-harness
cargo test --test mcp mock_server_discovers_two_tools_and_executes_call
```

This test verifies that a mock MCP server's tool list is discovered and registered (with one successful tool call).
