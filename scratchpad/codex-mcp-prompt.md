You are working in the git worktree at the current directory, on branch feat/hosted-portfolio-mcp, inside a Gatsby 5 + Cloudflare Pages Functions repo.

Read these two files in full before writing any code:
- docs/superpowers/specs/2026-07-19-portfolio-mcp-design.md (the spec)
- docs/superpowers/plans/2026-07-19-hosted-portfolio-mcp.md (the implementation plan, Tasks 1 through 8)

Execute the plan task by task, in order, exactly as written, including Task 8 (DDoS/abuse safety hardening). Ignore the `rtk` prefix in front of shell commands in the plan file — that is a Claude-Code-specific proxy wrapper that does not exist in this environment. Run the plain equivalents instead: use `npm test -- <path>` instead of `rtk npm test -- <path>`, `git add`/`git commit` instead of `rtk git add`/`rtk git commit`, `npm run build` instead of `rtk npm run build`, `rg` instead of `rtk rg`, `curl` instead of `rtk curl`.

Follow test-driven development exactly as the plan specifies: write the failing test first, confirm it fails for the stated reason, then implement, then confirm it passes, then commit with the exact commit message given in that step before moving to the next task. Check off each `- [ ]` checkbox in the plan file itself as you complete it (edit the checkbox to `- [x]`) and include that edit in the same commit as the task's other files.

Constraints carried over from the plan's Global Constraints section — do not violate any of these:
- Endpoint URL must stay `https://adityakarnam.com/mcp`.
- Install docs page must stay `/mcp-install/`.
- Discovery manifest must stay `/.well-known/aditya-portfolio-mcp.json`.
- Health endpoint must stay `/mcp-health`.
- MCP name must stay `aditya-portfolio`, transport `http`.
- No npm package, no local MCP install flow, no LLM-backed answer synthesis, no write tools, no arbitrary URL fetches, no dynamic code execution.
- Never expose private files, email, analytics, personal data, availability, compensation, immigration status, references, or non-public employment history through any tool or resource.
- Every tool that returns claims about work must include source URLs.
- Task 8's rate limiter must fail open (allow the request) whenever the `RATE_LIMIT_KV` binding is missing or KV throws — the KV namespace exists but is not yet bound to the Pages project, and the endpoint must work correctly without it.

When all 8 tasks are complete:
1. Run the full test suite: `npm test`
2. Run the production build: `npm run build`
3. Run the local smoke checks from Task 7 Step 4/5 against the built site (start `npm run serve` in the background, curl the endpoints, then stop the server).
4. Fix anything broken, re-run tests/build until clean.
5. Write a summary to scratchpad/codex-mcp-done.md containing: which tasks/commits were completed, final `npm test` output tail, final `npm run build` result, the smoke test curl outputs, any deviations you made from the plan and why, and any open items or risks you noticed. This file is how another agent will pick up verification, so be concrete and include exact file paths and commit SHAs (`git log --oneline` since branching from origin/main).
6. Do not push, do not open a PR, do not merge. Leave the branch as local commits on feat/hosted-portfolio-mcp for a separate verification and PR step.

Work autonomously through all 8 tasks without stopping to ask questions — make reasonable judgment calls consistent with the spec and plan, and note any judgment calls in the final summary file.
