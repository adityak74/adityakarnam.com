import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData } from "./build-data"
import { handlePortfolioMcpRequest } from "./protocol"

const postJson = (body: unknown, headers: HeadersInit = {}) =>
  new Request("https://adityakarnam.com/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  })

describe("handlePortfolioMcpRequest", () => {
  const data = buildPortfolioMcpData({ generatedAt: "2026-07-19T12:00:00.000Z" })

  it("handles initialize", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }), data)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result.serverInfo.name).toBe("aditya-portfolio")
  })

  it("lists tools", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 2, method: "tools/list" }), data)
    const body = await response.json()

    expect(body.result.tools.map((tool: { name: string }) => tool.name)).toContain("get_recruiter_brief")
  })

  it("calls get_profile", async () => {
    const response = await handlePortfolioMcpRequest(
      postJson({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_profile", arguments: {} } }),
      data
    )
    const body = await response.json()

    expect(body.result.content[0].type).toBe("text")
    expect(body.result.content[0].text).toContain("Aditya Karnam")
  })

  it("lists resources", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 4, method: "resources/list" }), data)
    const body = await response.json()

    expect(body.result.resources.map((resource: { uri: string }) => resource.uri)).toContain("portfolio://profile")
  })

  it("rejects unsupported methods with JSON-RPC error", async () => {
    const response = await handlePortfolioMcpRequest(postJson({ jsonrpc: "2.0", id: 5, method: "unknown/method" }), data)
    const body = await response.json()

    expect(body.error.code).toBe(-32601)
  })

  it("rejects unsupported MCP protocol versions after initialize", async () => {
    const response = await handlePortfolioMcpRequest(
      postJson({ jsonrpc: "2.0", id: 6, method: "tools/list" }, { "MCP-Protocol-Version": "1999-01-01" }),
      data
    )
    const body = await response.json()

    expect(body.error.code).toBe(-32600)
    expect(body.error.message).toMatch(/unsupported protocol version/i)
  })

  it("accepts the supported MCP protocol version after initialize", async () => {
    const response = await handlePortfolioMcpRequest(
      postJson({ jsonrpc: "2.0", id: 7, method: "tools/list" }, { "MCP-Protocol-Version": "2025-06-18" }),
      data
    )
    const body = await response.json()

    expect(body.result.tools.map((tool: { name: string }) => tool.name)).toContain("search_work")
  })

  it("does not require MCP protocol version on initialize", async () => {
    const response = await handlePortfolioMcpRequest(
      postJson({ jsonrpc: "2.0", id: 8, method: "initialize", params: {} }, { "MCP-Protocol-Version": "1999-01-01" }),
      data
    )
    const body = await response.json()

    expect(body.result.serverInfo.name).toBe("aditya-portfolio")
  })

  it("returns a JSON-RPC error instead of throwing when a tool rejects its arguments", async () => {
    const response = await handlePortfolioMcpRequest(
      postJson({ jsonrpc: "2.0", id: 9, method: "tools/call", params: { name: "search_work", arguments: { query: "   " } } }),
      data
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.error.code).toBe(-32602)
    expect(body.error.message).toMatch(/query is required/i)
  })
})
