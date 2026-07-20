import { describe, expect, it } from "vitest"
import { CLAUDE_CODE_INSTALL_COMMAND, PORTFOLIO_MCP_INSTALL_MARKDOWN } from "./install-copy"

describe("install copy", () => {
  it("contains the exact Claude Code install command", () => {
    expect(CLAUDE_CODE_INSTALL_COMMAND).toBe(
      "claude mcp add --transport http aditya-portfolio https://adityakarnam.com/mcp"
    )
  })

  it("contains generic agent instructions and privacy scope", () => {
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("## Other Agents")
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("Codex")
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("Cursor")
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("Antigravity")
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("does not expose private files")
  })

  it("contains an mcp-remote fallback for local-only MCP clients", () => {
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("mcp-remote")
    expect(PORTFOLIO_MCP_INSTALL_MARKDOWN).toContain("npx mcp-remote https://adityakarnam.com/mcp")
  })
})
