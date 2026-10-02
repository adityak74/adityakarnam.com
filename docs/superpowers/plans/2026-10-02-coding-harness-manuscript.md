# Coding Harness Manuscript Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write the complete 70-80 page manuscript against the tested reference harness and a pinned Quecto revision.

**Architecture:** Four parts advance one build from model transport to evaluation. Markdown include directives pull checked source ranges from the reference harness, while a validator enforces chapter order, callout syntax, live links, source anchors, and the target word/page budget.

**Tech Stack:** Markdown, Node.js validation scripts, Vitest, Rust source includes, Mermaid/SVG source diagrams.

**Spec:** `docs/superpowers/specs/2026-10-02-building-a-coding-agent-harness-book-design.md`

## Global Constraints

- Execute after `2026-10-02-coding-harness-reference-implementation.md` passes.
- Target 70-80 designed pages and approximately 18,000-24,000 manuscript words.
- Every implementation chapter follows problem, invariant, minimal design, code, failure mode, Quecto comparison, and exercise.
- Use `{{include:path#anchor}}` for runnable code; do not paste divergent long listings.
- Quecto claims cite the pinned commit recorded in `PRODUCTION-MAPPING.md`.
- Main prose is language-agnostic; Rust is the build language; Beyond Rust notes are short mappings, not parallel tutorials.
- Do not repeat the existing harness and Quecto posts when a link or concise recap suffices.

## Review Focus

- A code anchor removed or renamed in the reference harness must fail manuscript validation; Task 1 pins this.
- A chapter missing its invariant, failure mode, Quecto comparison, or exercise must fail structure validation; Task 1 pins this.
- A Quecto factual claim without a source-map entry must fail the source audit; Task 5 pins this.
- The narrative must distinguish model failure, harness failure, and evaluation failure; Parts I, II, and IV each include an explicit example.
- The final build must stay within the page/word budget without shrinking code below readable size; Task 5 checks the editorial budget before PDF layout.

---

## File Structure

```text
books/building-a-coding-agent-harness/
├── book.yml
├── references.md
├── manuscript/
│   ├── 00-front-matter.md
│   ├── 01-the-harness-is-the-system.md
│   ├── ...
│   ├── 14-complete-reference-harness.md
│   └── 90-appendices.md
└── diagrams/
    ├── 01-system-map.mmd
    ├── 03-agent-loop.mmd
    ├── 06-policy-gate.mmd
    ├── 09-session-state.mmd
    ├── 11-mcp-boundary.mmd
    └── 13-evaluation-loop.mmd
```

### Task 1: Manuscript Contract and Validation Harness

**Files:**
- Create: `books/building-a-coding-agent-harness/book.yml`
- Create: `books/building-a-coding-agent-harness/references.md`
- Create: `scripts/validate-coding-harness-book.mjs`
- Create: `scripts/validate-coding-harness-book.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: reference-harness source anchors and `PRODUCTION-MAPPING.md`.
- Produces: `npm run validate:book`, parsed chapter metadata, resolved code includes, and machine-readable validation errors.

- [ ] **Step 1: Write failing validator tests**

Use temporary fixtures to assert failures for missing chapter, missing required callout, duplicate heading id, broken include anchor, path escape, broken local link, absent Quecto source id, and out-of-budget word count; assert a minimal valid fixture passes.

- [ ] **Step 2: Run validator tests and confirm RED**

Run: `npx vitest run scripts/validate-coding-harness-book.test.mjs`
Expected: tests fail because the validator does not exist.

- [ ] **Step 3: Implement the validator and manifest**

`book.yml` defines exact chapter order, title/subtitle, author, edition, target word range, required callouts, and output metadata. Export `validateBook(rootDir, { throughChapter })` from the script for tests and CLI use; the optional prefix mode validates work in progress without accepting gaps inside that prefix.

- [ ] **Step 4: Run validator tests**

Run: `npx vitest run scripts/validate-coding-harness-book.test.mjs`
Expected: all validator tests pass.

- [ ] **Step 5: Commit**

```bash
git add books/building-a-coding-agent-harness/book.yml books/building-a-coding-agent-harness/references.md scripts/validate-coding-harness-book.mjs scripts/validate-coding-harness-book.test.mjs package.json
git commit -m "feat(book): add manuscript validation contract"
```

### Task 2: Front Matter and Part I

**Files:**
- Create: `books/building-a-coding-agent-harness/manuscript/00-front-matter.md`
- Create: `books/building-a-coding-agent-harness/manuscript/01-the-harness-is-the-system.md`
- Create: `books/building-a-coding-agent-harness/manuscript/02-one-model-call.md`
- Create: `books/building-a-coding-agent-harness/manuscript/03-bounded-agent-loop.md`
- Create: `books/building-a-coding-agent-harness/diagrams/01-system-map.mmd`
- Create: `books/building-a-coding-agent-harness/diagrams/03-agent-loop.mmd`

**Interfaces:**
- Consumes: Tasks 1-2 of the reference implementation.
- Produces: the book premise, prerequisites, complete model boundary, bounded loop, first runnable checkpoint, and diagram sources.

- [ ] **Step 1: Draft front matter and Chapters 1-3 to the approved page budgets**

Use the working title/subtitle, state the reader outcome, define the five system boundaries, and include commands that run the first checkpoint.

- [ ] **Step 2: Add anchored source excerpts and accessible diagram descriptions**

Every include resolves to the reference harness; each diagram file begins with a plain-language description used as PDF alt text/caption.

- [ ] **Step 3: Run validation and reference tests**

Run: `npm run validate:book -- --through 3 && cargo test --manifest-path books/building-a-coding-agent-harness/examples/reference-harness/Cargo.toml`
Expected: manuscript structure and all referenced code pass.

- [ ] **Step 4: Commit**

```bash
git add books/building-a-coding-agent-harness/manuscript books/building-a-coding-agent-harness/diagrams
git commit -m "docs(book): write coding harness foundations"
```

### Task 3: Part II - Controlled Capabilities

**Files:**
- Create: `books/building-a-coding-agent-harness/manuscript/04-typed-tools.md`
- Create: `books/building-a-coding-agent-harness/manuscript/05-safe-editing.md`
- Create: `books/building-a-coding-agent-harness/manuscript/06-policy-and-approvals.md`
- Create: `books/building-a-coding-agent-harness/manuscript/07-verification-gate.md`
- Create: `books/building-a-coding-agent-harness/manuscript/08-context-and-instructions.md`
- Create: `books/building-a-coding-agent-harness/diagrams/06-policy-gate.mmd`

**Interfaces:**
- Consumes: Tasks 2-4 of the reference implementation.
- Produces: the complete capability, mutation, safety, verification, and context build track.

- [ ] **Step 1: Draft Chapters 4-8 with one realistic failure per chapter**

Required demonstrations: malformed tool input, path escape, command-wrapper bypass, false completion after failed tests, and instruction precedence conflict.

- [ ] **Step 2: Add build checkpoints and exercises**

Each checkpoint names an exact Cargo test or CLI command and its expected outcome.

- [ ] **Step 3: Run manuscript and Rust validation**

Run: `npm run validate:book -- --through 8 && cargo test --manifest-path books/building-a-coding-agent-harness/examples/reference-harness/Cargo.toml`
Expected: all checks pass.

- [ ] **Step 4: Commit**

```bash
git add books/building-a-coding-agent-harness/manuscript books/building-a-coding-agent-harness/diagrams
git commit -m "docs(book): write controlled capability chapters"
```

### Task 4: Part III - Runtime Systems

**Files:**
- Create: `books/building-a-coding-agent-harness/manuscript/09-sessions-and-recovery.md`
- Create: `books/building-a-coding-agent-harness/manuscript/10-profiles-and-extensibility.md`
- Create: `books/building-a-coding-agent-harness/manuscript/11-mcp-and-external-tools.md`
- Create: `books/building-a-coding-agent-harness/manuscript/12-observability.md`
- Create: `books/building-a-coding-agent-harness/diagrams/09-session-state.mmd`
- Create: `books/building-a-coding-agent-harness/diagrams/11-mcp-boundary.mmd`

**Interfaces:**
- Consumes: Tasks 5-6 of the reference implementation.
- Produces: persistence, trust, MCP, and telemetry chapters with production Quecto comparisons.

- [ ] **Step 1: Draft Chapters 9-12 and their source-backed Quecto comparisons**

Explicitly separate reasoning configuration, reasoning content, and execution behavior; explain TOFU limitations; show MCP degraded operation; define a privacy-conscious event schema.

- [ ] **Step 2: Add build checkpoints and diagrams**

Checkpoints exercise resume, changed-profile trust rejection, local MCP fixture discovery, and JSONL trace inspection.

- [ ] **Step 3: Run validation**

Run: `npm run validate:book -- --through 12 && cargo test --manifest-path books/building-a-coding-agent-harness/examples/reference-harness/Cargo.toml`
Expected: all checks pass.

- [ ] **Step 4: Commit**

```bash
git add books/building-a-coding-agent-harness/manuscript books/building-a-coding-agent-harness/diagrams
git commit -m "docs(book): write coding runtime chapters"
```

### Task 5: Part IV, Appendices, and Editorial Audit

**Files:**
- Create: `books/building-a-coding-agent-harness/manuscript/13-evaluation.md`
- Create: `books/building-a-coding-agent-harness/manuscript/14-complete-reference-harness.md`
- Create: `books/building-a-coding-agent-harness/manuscript/90-appendices.md`
- Create: `books/building-a-coding-agent-harness/diagrams/13-evaluation-loop.mmd`
- Modify: all manuscript chapters as needed for consistency and budget.

**Interfaces:**
- Consumes: complete reference harness, all earlier chapters, production map, and references.
- Produces: complete validated manuscript ready for PDF layout.

- [ ] **Step 1: Draft evaluation, capstone, production map, glossary, safety checklist, and rubric**

The capstone follows one task from prompt through verified change and trace. The appendix records the exact Quecto commit.

- [ ] **Step 2: Run the source and claim audit**

Check every `Quecto in production` claim against `PRODUCTION-MAPPING.md` and the pinned source. Add or correct the source id; do not leave unsupported claims.

- [ ] **Step 3: Run the editorial pass**

Normalize terminology, remove repeated explanations, expand acronyms on first use, verify commands, and keep the manuscript within 18,000-24,000 words.

- [ ] **Step 4: Run final manuscript validation**

Run: `npm run validate:book && cargo fmt --manifest-path books/building-a-coding-agent-harness/examples/reference-harness/Cargo.toml --check && cargo test --manifest-path books/building-a-coding-agent-harness/examples/reference-harness/Cargo.toml`
Expected: validator and reference implementation pass.

- [ ] **Step 5: Commit**

```bash
git add books/building-a-coding-agent-harness
git commit -m "docs(book): complete coding harness manuscript"
```
