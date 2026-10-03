# Building a Coding Agent Harness

## Front Matter

---

**Title:** Building a Coding Agent Harness

**Subtitle:** From Model Calls to a Safe, Observable, Evaluable Runtime

**Supporting line:** A practical systems guide built with Rust and proven through Quecto

**Author:** Aditya Karnam

**Edition:** 1.0.0

**Published:** October 2026

**License:** MIT

---

## Preface

> **You will not learn much by reading this book about models.** You will learn a great deal by reading it about harnesses.

The model gives the agent its raw capability, but the harness gives it its behavior, its safety, its safety, its traceability, and its cost. A well-designed harness can make a small model outperform a large one by constraining the search space effectively. A poorly designed harness can make a large model produce worse results than a small model with guardrails.

This book teaches you to build a harness, not to study models. You will not train a single model in these pages. What you will train is judgment — about where to draw boundaries, what to gate, what to observe, and what to measure.

The writing assumes you know programming and basic computer science but might not know agent-system architecture. You will build along. Every chapter adds code to a shared reference implementation in Rust, tests it, and compares it to a production system (Quecto) that uses the same design.

This book is not documentation of one repository. It is a general guide to harness design, using Rust for implementation and Quecto as evidence that the architecture works.

## How to Use This Book

Read sequentially. Each chapter builds on the previous chapter's code. The reference harness compiles and tests are provided for every visible chunk.

The book uses a build-first rhythm:

1. State the system problem.
2. Define the invariant the harness must preserve.
3. Introduce the smallest workable design.
4. Add code to the shared reference implementation.
5. Demonstrate a realistic failure mode.
6. Compare the teaching design with production Quecto.
7. End with a focused exercise or design question.

Callouts appear throughout:

- **System invariant** — the property that must remain true.
- **Failure mode** — how a plausible implementation breaks.
- **Quecto in production** — how the real project handles the concern.
- **Beyond Rust** — how the boundary maps to other ecosystems.
- **Build checkpoint** — what the reader can run at this stage.

Prerequisites: Rust 2021, a Unix terminal, familiarity with HTTP and basic system programming. Python or TypeScript familiarity is helpful but not required.

## Architecture Map (Summary)

The system consists of seven layers, each built in a chapter:

| Layer | Purpose | Chapter |
|-------|---------|---------|
| Model transport | Reach a model provider | 2 |
| Agent loop | Reason through steps safely | 3 |
| Tools | Typed communication | 4 |
| Policy | Gate reads, edits, commands | 5 |
| Verification | Confirm before finishing | 6 |
| Context / Instructions | Load knowledge safely | 7 |
| Sessions / Recovery | Persist across restarts | 8 |
| Profiles | Layered configuration | 9 |
| MCP | External tool integration | 10 |
| Observability | Trace without leaking secrets | 11 |
| Evaluation | Prove quality | 12 |
| Reference harness | Assemble everything | 13 |

The architecture map below shows how the layers interact. Each layer is a module in the reference implementation.

```
┌─────────────────────────────────────────────┐
│              Evaluation                     │ 12
│  ┌─────────────────────────────────────┐    │
│  │  Observability (trace, no leaks)    │ 11  │
│  │  ┌──────────────────────────────┐  │    │
│  │  │  MCP (external trust)       │ 10  │  │
│  │  │  ┌────────────────────────┐  │  │    │
│  │  │  │  Profiles /Extensibility│ 9   │  │  │
│  │  │  │  ┌───────────────────┐  │  │  │    │
│  │  │  │  │  Sessions (persist)│ 8   │  │  │  │
│  │  │  │  │  ┌───────────────┐│  │  │  │    │
│  │  │  │  │  │  Policy/Gate  │ 7   │  │  │  │
│  │  │  │  │  │  ┌───────────┐│  │  │  │    │
│  │  │  │  │  │  │  Context  │ 6   │  │  │  │
│  │  │  │  │  │  │  ┌────────┐│  │  │  │    │
│  │  │  │  │  │  │  │ Tools  │ 5   │  │  │  │
│  │  │  │  │  │  │  │  ┌────┐│  │  │  │    │
│  │  │  │  │  │  │  │  │Agent│ 4   │  │  │  │
│  │  │  │  │  │  │  │  │  ┌─┐│  │  │  │    │
│  │  │  │  │  │  │  │  │  │Model│ 3   │  │  │  │
│  │  │  │  │  │  │  │  └──┘   │  │  │  │    │
│  │  │  │  │  └───────────────┘  │  │  │  │
│  │  │  │  └─────────────────────┘  │  │  │  │
│  │  │  └──────────────────────────┘  │  │  │  │
│  │  └──────────────────────────────┘  │  │  │  │
│  └─────────────────────────────────────┘  │  │  │
└─────────────────────────────────────────────┘  │  │  │
                                                  └──┘  │  │
                                                         └──┘
```

## How This Book Is Structured

The book is divided into four parts:

**Part I — Build the smallest useful core (Chapters 1–3):** Model transport, the agent loop, and typed tools.

**Part II — Add safety and context (Chapters 4–7):** Policy, verification, instruction loading.

**Part III — Turn a loop into a runtime (Chapters 8–11):** Sessions, profiles, MCP, observability.

**Part IV — Know whether it works (Chapters 12–13):** Evaluation, final assembly.

## Notes

- Code excerpts are drawn from the reference implementation. Long listings are in the source; short excerpts appear inline.
- The production comparison (Quecto) links to the repository. Use the book's version pin in `PRODUCTION-MAPPING.md` (source of truth) when checking.
- "Beyond Rust" notes map interfaces to Python, TypeScript, and Go without creating parallel implementations.

---

*This book is released under the MIT License. The reference implementation uses `serde`, `serde_json`, `ureq`, and `tempfile`.*
