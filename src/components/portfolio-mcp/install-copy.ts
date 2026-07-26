export const CLAUDE_CODE_INSTALL_COMMAND =
  "claude mcp add --transport http aditya-portfolio https://adityakarnam.com/mcp"

export const CLAUDE_CODE_VERIFY_COMMAND = "claude mcp list"

export const PORTFOLIO_MCP_INSTALL_MARKDOWN = `# Install Aditya Karnam's Portfolio MCP

Use this public, read-only MCP server to query Aditya Karnam's portfolio, recent work, systems, blog posts, research agenda, and source links.

MCP name: \`aditya-portfolio\`
Transport: \`http\`
URL: \`https://adityakarnam.com/mcp\`
Discovery manifest: \`https://adityakarnam.com/.well-known/aditya-portfolio-mcp.json\`
Health check: \`https://adityakarnam.com/mcp-health\`

This MCP exposes only public portfolio data: projects, blog posts from the Thoughts feed (including full post text), systems, research agenda, and source links. It does not expose private files, email, analytics, personal data, availability, compensation, immigration status, or references.

## Claude App

1. Open Claude.
2. Go to Settings / Customize.
3. Open Connectors.
4. Choose Add custom connector.
5. Paste \`https://adityakarnam.com/mcp\`.
6. Save the connector.

For Team or Enterprise accounts, an organization owner may need to add the connector first.

## Claude Code

Run:

\`\`\`bash
${CLAUDE_CODE_INSTALL_COMMAND}
\`\`\`

Verify:

\`\`\`bash
${CLAUDE_CODE_VERIFY_COMMAND}
\`\`\`

## Other Agents

For Codex, Cursor, Antigravity, or any agent that supports remote MCP servers, add:

- Name: \`aditya-portfolio\`
- Transport: \`http\`
- URL: \`https://adityakarnam.com/mcp\`

If your agent supports custom instructions but not direct MCP installation, ask it:

> Use the remote MCP server at \`https://adityakarnam.com/mcp\` as \`aditya-portfolio\`. If you can install MCP servers, add it with HTTP transport. If you cannot install MCP servers directly, tell me the exact setup steps for this client.

## If Your Client Only Supports Local MCP Servers

Clients without native remote MCP support can bridge to this HTTP endpoint through the third-party \`mcp-remote\` adapter. This is not a package hosted by this site; it is a compatibility bridge for local/stdio-only clients.

\`\`\`bash
npx mcp-remote https://adityakarnam.com/mcp
\`\`\`

## Try These Prompts

- Use Aditya Karnam's portfolio connector. Is he a fit for this AI infrastructure role?
- Which projects show agent runtime or MCP experience?
- Give me a recruiter brief with evidence and source links.
- What is his recent work around local inference and evals?
- Compare his work to this role description and list the strongest evidence.
- Act as a hiring manager. What should I ask him about based on public evidence?
- Act as an engineer. Which systems should I inspect first?
- Act as a researcher. What is his clearest research wedge?
- List his latest blog posts from Thoughts.
- Read his post on building QuECTO and summarize the argument.
- Which of his posts discuss agent harnesses?
`
