# Coding Harness Cover and PDF Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the validated manuscript into an original, polished, accessible 70-80 page technical-book PDF with coordinated web assets.

**Architecture:** A reproducible ReportLab/Platypus builder reads `book.yml`, resolves manuscript includes, renders diagrams and code, and emits the final PDF. Cover typography and system graphics are composed deterministically around an original image-generated abstract core illustration.

**Tech Stack:** Python 3, ReportLab, markdown-it-py, Pygments, PyYAML, pypdf, Poppler (`pdfinfo`, `pdftoppm`), SVG/PNG assets.

**Spec:** `docs/superpowers/specs/2026-10-02-building-a-coding-agent-harness-book-design.md`

## Global Constraints

- Execute after the manuscript plan passes.
- Before the first PDF authoring command, run the PDF skill's required `mark_artifact_operation_started.mjs` command exactly once.
- Final PDF path: `static/books/building-a-coding-agent-harness.pdf`.
- Target 70-80 pages; exceptions require explicit approval.
- Use selectable text, embedded fonts, PDF bookmarks, logical heading order, clickable links, page numbers, and a linked table of contents.
- Use ASCII hyphens in generated PDF text where Unicode dash handling could break rendering.
- Cover and interior must remain original and must not imitate O'Reilly trade dress.
- No final delivery until every page has been rendered and visually checked.

## Review Focus

- A code line longer than the measure must wrap or split without clipping; Task 2 tests synthetic long tokens and commands.
- A heading or callout near a page break must not orphan its body; Task 2 tests keep-with-next behavior.
- Broken internal/external links or missing bookmarks must fail PDF validation; Task 4 pins both.
- Missing glyphs and unembedded fonts must fail preflight; Task 4 checks font resources and rendered black-square artifacts.
- Cover text must remain legible at portfolio-card size and in grayscale; Task 3 checks thumbnail and grayscale renders.

---

## File Structure

```text
books/building-a-coding-agent-harness/
├── build_book.py
├── requirements.txt
├── pdf/
│   ├── styles.py
│   ├── manuscript.py
│   ├── diagrams.py
│   ├── cover.py
│   └── preflight.py
├── tests/
│   ├── test_manuscript.py
│   ├── test_layout.py
│   └── test_preflight.py
└── cover/
    ├── cover-source.svg
    ├── cover-web.webp
    └── cover-social.png
```

### Task 1: Reproducible PDF Builder Core

**Files:**
- Create: `books/building-a-coding-agent-harness/requirements.txt`
- Create: `books/building-a-coding-agent-harness/build_book.py`
- Create: `books/building-a-coding-agent-harness/pdf/__init__.py`
- Create: `books/building-a-coding-agent-harness/pdf/styles.py`
- Create: `books/building-a-coding-agent-harness/pdf/manuscript.py`
- Create: `books/building-a-coding-agent-harness/tests/test_manuscript.py`

**Interfaces:**
- Consumes: `book.yml`, ordered Markdown chapters, resolved source includes.
- Produces: `load_book(root) -> BookDocument`, `build_pdf(book, output_path) -> BuildReport`.

- [ ] **Step 1: Start the PDF artifact operation**

Run: `node container_tools/mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 1 --output-format pdf`
Expected: the marker exits successfully. Run it exactly once before the first PDF authoring command.

- [ ] **Step 2: Write failing parser and metadata tests**

Assert deterministic chapter order, include resolution, title/author/subject metadata, linked TOC entries, bookmarks, and rejection of unresolved directives.

- [ ] **Step 3: Run tests and confirm RED**

Run: `python3 -m unittest discover -s books/building-a-coding-agent-harness/tests -p 'test_manuscript.py'`
Expected: import or interface failures.

- [ ] **Step 4: Implement parser, styles, document template, TOC, headers, and footers**

Use a two-pass build so TOC page numbers stabilize. Expose `--output` and `--draft` flags from `build_book.py`.

- [ ] **Step 5: Run tests and create a draft**

Run: `python3 books/building-a-coding-agent-harness/build_book.py --draft --output tmp/pdfs/coding-harness-draft.pdf`
Expected: PDF opens, metadata is present, and TOC page references resolve.

- [ ] **Step 6: Commit**

```bash
git add books/building-a-coding-agent-harness
git commit -m "feat(book): add reproducible PDF builder"
```

### Task 2: Code, Callouts, Diagrams, and Pagination

**Files:**
- Create: `books/building-a-coding-agent-harness/pdf/diagrams.py`
- Create: `books/building-a-coding-agent-harness/tests/test_layout.py`
- Modify: `books/building-a-coding-agent-harness/pdf/styles.py`
- Modify: `books/building-a-coding-agent-harness/pdf/manuscript.py`
- Modify: `books/building-a-coding-agent-harness/build_book.py`

**Interfaces:**
- Consumes: manuscript callouts, fenced code, Mermaid source descriptions, and image assets.
- Produces: syntax-highlighted code blocks, labeled callouts, sharp diagrams, captions, and stable pagination rules.

- [ ] **Step 1: Write failing layout stress tests**

Generate fixtures with long code tokens, a 100-line listing, callout at page bottom, table wider than the frame, missing diagram description, and grayscale output; assert no flowable exceeds its frame and required warnings are emitted.

- [ ] **Step 2: Implement layout components**

Create dedicated flowables for code, callouts, captions, tables, chapter openers, and diagrams. Split code at logical boundaries; never reduce body code below the configured minimum size.

- [ ] **Step 3: Render representative pages and inspect them**

Run: `pdftoppm -f 1 -l 12 -png tmp/pdfs/coding-harness-draft.pdf tmp/pdfs/coding-harness-sample`
Expected: no clipping, overlap, unreadable code, orphan headings, or blurry diagrams.

- [ ] **Step 4: Run layout tests**

Run: `python3 -m unittest discover -s books/building-a-coding-agent-harness/tests -p 'test_layout.py'`
Expected: all stress fixtures pass.

- [ ] **Step 5: Commit**

```bash
git add books/building-a-coding-agent-harness
git commit -m "feat(book): add technical book layout system"
```

### Task 3: Original Cover and Coordinated Web Assets

**Files:**
- Create: `books/building-a-coding-agent-harness/pdf/cover.py`
- Create: `books/building-a-coding-agent-harness/cover/cover-source.svg`
- Create: `books/building-a-coding-agent-harness/cover/cover-web.webp`
- Create: `books/building-a-coding-agent-harness/cover/cover-social.png`
- Create: `static/images/books/building-a-coding-agent-harness-cover.webp`
- Create: `static/images/books/building-a-coding-agent-harness-social.png`

**Interfaces:**
- Consumes: approved title, subtitle, author, palette, concentric system-layer concept, and optional image-generated abstract core.
- Produces: print cover, card-sized cover, and 1200x630 social image.

- [ ] **Step 1: Generate the central illustration concept with the imagegen skill**

Prompt for an original abstract tiny execution core with concentric model/tool/policy/state/evaluation layers, no text, no logos, no animals, no imitation of a named publisher, warm off-white/rust/cyan palette.

- [ ] **Step 2: Compose cover typography and deterministic vector layers**

Keep all title, subtitle, author, and edition text as vector/text elements outside the generated illustration.

- [ ] **Step 3: Export print, web, social, thumbnail, and grayscale proofs**

Check the cover at full size, 320px card width, 160px thumbnail width, and grayscale.

- [ ] **Step 4: Inspect the proofs and correct hierarchy or contrast defects**

Expected: title and author remain legible, the central idea reads without fine detail, and the design is unmistakably original.

- [ ] **Step 5: Commit**

```bash
git add books/building-a-coding-agent-harness/cover books/building-a-coding-agent-harness/pdf/cover.py static/images/books
git commit -m "design(book): add coding harness cover system"
```

### Task 4: Final PDF Preflight and Visual QA

**Files:**
- Create: `books/building-a-coding-agent-harness/pdf/preflight.py`
- Create: `books/building-a-coding-agent-harness/tests/test_preflight.py`
- Create: `static/books/building-a-coding-agent-harness.pdf`
- Modify: manuscript or layout sources only where QA finds defects.

**Interfaces:**
- Consumes: complete manuscript, reference code, diagrams, and cover.
- Produces: final PDF and machine-readable preflight report.

- [ ] **Step 1: Write failing preflight tests**

Assert page count 70-80, non-empty text per content page, title/author metadata, bookmarks for all chapters, linked TOC, embedded fonts, zero unresolved tokens, expected external links, and no page outside the selected trim size.

- [ ] **Step 2: Implement preflight and build the release PDF**

Run: `python3 books/building-a-coding-agent-harness/build_book.py --output static/books/building-a-coding-agent-harness.pdf`
Expected: deterministic successful build.

- [ ] **Step 3: Run machine preflight**

Run: `python3 -m unittest discover -s books/building-a-coding-agent-harness/tests && python3 books/building-a-coding-agent-harness/pdf/preflight.py static/books/building-a-coding-agent-harness.pdf`
Expected: all checks pass and page count is 70-80.

- [ ] **Step 4: Render and inspect every page**

Run: `pdftoppm -png static/books/building-a-coding-agent-harness.pdf tmp/pdfs/coding-harness-page`
Expected: every rendered page has zero clipping, overlap, black squares, broken diagrams, unreadable code, or inconsistent running furniture.

- [ ] **Step 5: Reopen and verify the final artifact**

Use `pdfinfo`, `pypdf`, and text extraction to confirm metadata, page count, bookmarks, links, and selectable text after the final write.

- [ ] **Step 6: Commit**

```bash
git add books/building-a-coding-agent-harness static/books/building-a-coding-agent-harness.pdf
git commit -m "feat(book): publish coding harness PDF"
```
