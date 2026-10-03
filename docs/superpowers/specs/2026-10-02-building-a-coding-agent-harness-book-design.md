# Building a Coding Agent Harness Book Design

## Purpose

Create a compact, textbook-style systems book that teaches readers how to build a small but complete coding-agent harness. The book uses a purpose-built Rust reference implementation as the build-along project and Quecto as the production proof, source of deeper examples, and upgrade path.

The finished work will be published as a designed PDF, supported by a standalone technical article, and hosted on `adityakarnam.com` with clear links to the existing Quecto project page and repository.

## Product promise

By the end of the book, a reader can build and reason about a Quecto-style coding harness from the model transport upward: bounded agent loop, typed tools, safe file edits, execution policy, verification, context loading, persistence, extension profiles, MCP integration, observability, and evaluation.

The book teaches transferable system boundaries rather than documenting one repository. Quecto appears throughout as evidence that the architecture works in a real implementation.

## Audience

The book serves three overlapping audiences through a layered presentation:

1. Experienced software engineers who are new to agent systems.
2. AI and ML engineers building production agents.
3. Rust developers who want to build along with a concrete implementation.

The main narrative stays language-agnostic where possible. Rust is the implementation language. Short "Beyond Rust" notes map important interfaces and trade-offs to Python, TypeScript, and Go without adding parallel implementations.

## Format and scope

- Target length: 70-80 pages.
- Format: free downloadable PDF with a browser-readable portfolio page.
- Style: compact systems textbook with architectural diagrams, annotated code, terminal sessions, failure cases, exercises, and production notes.
- Reference implementation: a standalone compact Rust harness developed incrementally through the chapters.
- Production comparison: selected Quecto source, decisions, tests, and failure modes.
- Companion article: a substantial standalone excerpt that also leads readers to the full book and Quecto.

The book will not imitate O'Reilly's protected cover trade dress. It will borrow the qualities the user values in serious systems publishing: authority, hierarchy, practical depth, and strong technical illustration.

## Editorial identity

### Working title

**Building a Coding Agent Harness**

### Subtitle

**From Model Calls to a Safe, Observable, Evaluable Runtime**

### Supporting line

**A practical systems guide built with Rust and proven through Quecto**

These remain working editorial choices until the cover proof is reviewed. The page slug and output filenames should remain stable even if the subtitle changes.

## Teaching method

The book uses a build-first progression. Every implementation chapter follows the same rhythm:

1. State the system problem.
2. Define the invariant the harness must preserve.
3. Introduce the smallest workable design.
4. Add code to the shared reference implementation.
5. Demonstrate a realistic failure mode.
6. Compare the teaching design with production Quecto.
7. End with a focused exercise or design question.

Recurring callouts:

- **System invariant** - the property that must remain true.
- **Failure mode** - how a plausible implementation breaks.
- **Quecto in production** - how the real project handles the concern.
- **Beyond Rust** - how the boundary maps to other ecosystems.
- **Build checkpoint** - what the reader can run at this stage.

Code excerpts must be runnable or extracted from runnable source. Long listings belong in the reference implementation rather than filling pages.

## Chapter architecture

The page budget is approximate and includes diagrams, code, and exercises.

### Front matter - 4 pages

- Cover, title page, copyright/license, and repository links.
- Preface: why the harness, not only the model, determines agent behavior.
- How to use the book and prerequisites.
- Architecture map of the final system.

### Part I: Build the smallest useful core - 14 pages

#### 1. The Harness Is the System - 4 pages

- Separate model capability from harness behavior.
- Define the model, policy, tool, state, and evaluation boundaries.
- Establish the book's system invariants and threat assumptions.

#### 2. One Model Call, No Framework - 5 pages

- OpenAI-compatible request and response boundaries.
- Configuration, authentication, buffered output, and streaming.
- Provider differences and preservation of raw model behavior.

#### 3. The Bounded Agent Loop - 5 pages

- Message and tool-call representations.
- Step limits, termination, malformed output, and repeated-action guards.
- First runnable build checkpoint.

### Part II: Give the agent controlled capabilities - 24 pages

#### 4. Tools as Typed Boundaries - 5 pages

- Tool schemas, registry, dispatch, validation, and structured errors.
- Read-only filesystem, search, and git inspection tools.

#### 5. Editing Without Losing Control - 5 pages

- File creation, patching, path resolution, and atomic writes.
- Change journals, diffs, and undo semantics.

#### 6. Execution Policy and Approvals - 5 pages

- Allow/ask/deny decisions and the central policy gate.
- Working-directory boundaries, command denial, timeouts, output bounds, cancellation, and redaction.
- Threat-model checkpoint.

#### 7. Verification as a Completion Gate - 5 pages

- Tests and linters as part of the agent state machine.
- Retry budgets, failed verification, and honest completion.
- Separating model confidence from measured outcome.

#### 8. Context and Instruction Loading - 4 pages

- Repository instructions, system prompts, seeded context, and precedence.
- Token discipline and protection against accidental instruction mixing.

### Part III: Turn a loop into a runtime - 20 pages

#### 9. Sessions, State, and Recovery - 5 pages

- Persistent transcripts, session identity, resume, undo, and replay.
- Reasoning configuration versus provider-exposed reasoning traces.

#### 10. Profiles and Extensibility - 5 pages

- Layered configuration, named profiles, tool allow-lists, and approval presets.
- Trust-on-first-use for repository-owned configuration.
- Quecto capsules as a production extension case study.

#### 11. MCP and External Tools - 5 pages

- Tool discovery and registration.
- STDIO and Streamable HTTP transports.
- External trust boundaries, naming collisions, timeouts, and degraded operation.

#### 12. Observability - 5 pages

- Run, step, completion, tool, verification, and error events.
- Trace identity and correlation.
- Useful signals without leaking prompts, secrets, or file contents.

### Part IV: Know whether it works - 10 pages

#### 13. Evaluation - 5 pages

- Deterministic unit and integration tests.
- Task workspaces, fixtures, scoring, and repeatability.
- Why anecdotal demos do not establish harness quality.

#### 14. Complete the Reference Harness - 5 pages

- Assemble and run the final system.
- Inspect a complete task from prompt through verification and trace.
- Map teaching shortcuts to production Quecto modules.
- Prioritized upgrade path for readers continuing beyond the book.

### Appendices - 6 pages

- Compact configuration reference.
- Threat-model and safety checklist.
- Harness evaluation rubric.
- Quecto source map, glossary, and further reading.

## Reference implementation

The book repository area will contain a compact Rust workspace that readers can build independently from the production Quecto repository. It should remain small enough to understand end to end while retaining the same important boundaries.

Proposed modules:

```text
reference-harness/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── model.rs
│   ├── agent.rs
│   ├── tools.rs
│   ├── context.rs
│   ├── policy.rs
│   ├── verify.rs
│   ├── session.rs
│   ├── mcp.rs
│   └── telemetry.rs
├── tests/
├── fixtures/
└── README.md
```

The teaching build may simplify Quecto's module layout and dependency choices, but it must not fake core behavior. Every deliberate simplification will be disclosed in the final chapter's production mapping.

The local repository at `/Users/adityakarnam/Projects/quecto` is the primary implementation reference. Published claims must be checked against that checkout's pinned commit and the current public Quecto repository before release.

## Book source and build system

The book will remain reproducible and maintainable in the portfolio repository:

```text
books/building-a-coding-agent-harness/
├── manuscript/
│   ├── 00-front-matter.md
│   ├── 01-the-harness-is-the-system.md
│   ├── ...
│   ├── 14-complete-reference-harness.md
│   └── appendices.md
├── examples/reference-harness/
├── diagrams/
├── cover/
├── references.md
└── build_book.py
```

The build will generate:

- `static/books/building-a-coding-agent-harness.pdf`
- a web cover image;
- a social-preview image;
- optional page-preview images used only when the site design needs them.

The PDF builder should provide stable typography, syntax-highlighted code, automatic chapter starts, running headers, page numbers, a clickable table of contents, working external links, and consistent callout styles. The manuscript source, diagrams, examples, and build script are committed; rendered QA images are temporary and are not committed unless the site uses them.

## Cover design

The cover uses an original technical composition:

- A tiny central execution core surrounded by concentric system layers.
- Layers represent model transport, agent loop, tools, policy, state, observability, and evaluation.
- A subtle `10^-30` scale motif connects the design to the Quecto name.
- Warm off-white ground, charcoal typography, rust-orange primary accent, and cyan secondary accent.
- Strong title hierarchy that remains legible as a small portfolio card.
- No animal engraving or layout that could be confused with O'Reilly trade dress.

The same visual system should carry into chapter openers, architecture diagrams, callout rules, the web cover, and the social card.

## Companion article

Working title: **How to Build a Coding Agent Harness from Scratch**.

Target length: 2,500-3,500 words.

The article must work as a standalone tutorial rather than a launch announcement. It will cover:

- why the harness is the system;
- the bounded agent loop;
- typed tool boundaries;
- execution policy and approval gates;
- verification as a completion condition;
- a compact architecture diagram and selected runnable excerpts.

It will point readers to the book for persistence, MCP, observability, and evaluation, and to Quecto for the full production implementation. It will link to the two existing Quecto/harness articles rather than restating their material.

## Portfolio integration

### New book page

Create `/building-a-coding-agent-harness/` with:

- book cover and concise promise;
- audience and expected outcome;
- chapter list;
- page count and edition metadata;
- actions for **Read online**, **Download PDF**, **Read the article**, **View Quecto**, and **View the reference implementation**;
- an embedded native-browser PDF reader with a mobile fallback;
- accessible labels and useful SEO metadata.

The page should reuse the existing `ConsoleShell`, `SectionBlock`, `ConsoleCard`, `HeroStat`, `SignalPill`, and related site primitives. It may use the existing AI Systems Design Field Guide page as a structural precedent while giving this book a more complete landing-page treatment.

### Existing Quecto project page

Quecto is already represented at `/quecto/` and in the site's project data. Do not create a duplicate project entry. Add prominent links from the existing page to the new book and companion article.

### Discovery links

- Add a featured book card to `/ai-research/`.
- Link to the book from the existing "What Is an AI Agent Harness?" and "Building Quecto" articles.
- Link back to those articles from the companion article where they add depth.
- Include the new book and article in generated portfolio/RAG content through the site's normal build process.

No global navigation or homepage change is required for the first edition unless the existing design makes the book otherwise difficult to discover.

## Accessibility and usability

- Diagrams require meaningful titles, descriptions, and readable grayscale contrast.
- Code must use a font size suitable for both screen reading and print.
- Links must remain distinguishable without relying only on color.
- PDF bookmarks, logical heading order, selectable text, and descriptive link labels are required.
- The book page must provide direct open/download links when inline PDF rendering is unavailable.
- Cover title and author must remain legible in small cards and social previews.

## Validation

### Technical validation

- Build and test the reference Rust workspace.
- Run every command and code path printed as a reader checkpoint.
- Verify selected Quecto comparisons against the current repository revision.
- Validate all internal and external links.
- Run the portfolio test suite and production Gatsby build.

### Editorial validation

- Check that each chapter advances the same reference implementation.
- Remove duplicated explanations across the book, article, and existing posts.
- Distinguish implementation facts from design recommendations.
- Define specialized terms on first use and keep naming consistent.
- Record the Quecto version or commit used as the production reference.

### PDF validation

- Generate the final PDF from committed source.
- Confirm page count remains within the 70-80 page target or explicitly approve an exception.
- Inspect every rendered page for clipping, overflow, poor code wrapping, broken diagrams, widows/orphans, and inconsistent headers.
- Confirm table of contents, bookmarks, page numbers, links, metadata, and fonts.
- Test the PDF in at least one desktop and one mobile reading path.

### Site validation

- Confirm the cover, metadata, actions, and embedded reader at desktop and mobile widths.
- Confirm the direct download works independently of the embedded reader.
- Confirm all discovery links and generated content entries.
- Check build output for the book page, article, PDF, and image assets.

## Delivery sequence

1. Freeze the source revision and create the manuscript/repository skeleton.
2. Build the compact Rust reference harness with tests.
3. Draft the manuscript against the working reference build.
4. Create architecture diagrams and the cover system.
5. Generate and visually inspect the PDF.
6. Write the companion article from the completed book.
7. Implement the book page and portfolio cross-links.
8. Run editorial, technical, PDF, accessibility, and site validation.

This order prevents prose from promising code that does not work and prevents the article from drifting away from the final book.

## Success criteria

The project is complete when:

- the 70-80 page PDF teaches a coherent start-to-finish build;
- the reference implementation compiles, passes its tests, and supports the promised workflow;
- the production comparisons accurately reflect a named Quecto revision;
- the companion article is useful without requiring the book;
- the book is readable and downloadable from the portfolio;
- `/quecto/`, `/ai-research/`, and relevant existing posts lead readers to it;
- all PDF and site quality checks pass.

## Explicitly out of scope for the first edition

- A second full implementation in Python, TypeScript, or Go.
- A commercial checkout, email gate, account system, or analytics funnel.
- A custom JavaScript PDF renderer.
- Exhaustive model or agent-framework comparisons.
- A comprehensive Rust primer.
- Reproducing every Quecto feature or every production optimization in the teaching build.
- Duplicating Quecto as a new portfolio project.
