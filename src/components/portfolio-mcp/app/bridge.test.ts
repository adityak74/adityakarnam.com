import { describe, expect, it } from "vitest"
import { parseToolResult, ToolCallError } from "./bridge"

describe("parseToolResult", () => {
  it("parses JSON from the first text content entry", () => {
    const result = { content: [{ type: "text" as const, text: JSON.stringify({ ok: true }) }] }
    expect(parseToolResult<{ ok: boolean }>(result)).toEqual({ ok: true })
  })

  it("throws ToolCallError when the result is marked isError", () => {
    const result = { content: [{ type: "text" as const, text: "Rate limit exceeded." }], isError: true }
    expect(() => parseToolResult(result)).toThrow(ToolCallError)
    expect(() => parseToolResult(result)).toThrow("Rate limit exceeded.")
  })

  it("throws ToolCallError when there is no text content", () => {
    const result = { content: [] }
    expect(() => parseToolResult(result)).toThrow(ToolCallError)
  })

  it("throws ToolCallError when the text content is not valid JSON", () => {
    const result = { content: [{ type: "text" as const, text: "not json" }] }
    expect(() => parseToolResult(result)).toThrow(ToolCallError)
  })
})
