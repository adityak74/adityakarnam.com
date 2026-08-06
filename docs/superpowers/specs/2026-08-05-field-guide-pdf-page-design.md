# Field Guide PDF Page

## Purpose

Aditya has a new short book, *AI Systems Design Field Guide* (37 pages, PDF, ~313KB), and wants it readable online directly on adityakarnam.com — not just linked out to an external host.

## Placement

- New dedicated page at `/ai-systems-design-field-guide/` (`src/pages/ai-systems-design-field-guide.tsx`).
- One cross-link added from `/ai-research/` (a `ConsoleCard` pointing to `/ai-systems-design-field-guide/`), so it's discoverable from the page where the rest of Aditya's writing/research lives.
- No homepage or nav changes.

## Asset

- Copy the PDF from `/Users/adityakarnam/Documents/Codex/2026-08-05/referenced-chatgpt-conversation-this-is-an/outputs/AI_Systems_Design_Field_Guide.pdf` into `static/books/ai-systems-design-field-guide.pdf` (new `static/books/` directory, parallel to the existing `static/papers/`).
- Served at `/books/ai-systems-design-field-guide.pdf` in production (Gatsby copies `static/` verbatim to site root).

## Page content (`/ai-systems-design-field-guide/`)

Reuses the existing shared primitives from `src/components/world-model/pages-field-notes-about/primitives` (`ConsoleShell`, `SectionBlock`, `ConsoleCard`, `HeroStat`, `SignalPill`, `consoleColors`) so the page matches the visual language of `/ai-research/` and `/field-notes/`.

1. **Hero** (inside `ConsoleShell`):
   - `SignalPill`: "Book"
   - `Heading`: "AI Systems Design Field Guide"
   - Subtitle: "A field guide to model APIs, agent runtimes, MCP, A2A, and production engineering" (from the PDF's own metadata)
   - `HeroStat` row: Pages (37), Format (PDF), Size (~300KB), Status ("Read online")

2. **Reader section**:
   - An `<iframe>` pointing at `/books/ai-systems-design-field-guide.pdf`, styled full-width with a tall fixed/viewport-relative height (e.g. `80vh`) and a bordered container matching `ConsoleCard`/`ConsoleShell` chrome.
   - Directly above or below the iframe: an explicit "Open in new tab" link and a "Download PDF" link (both pointing at the same static URL), so the content is reachable even where inline iframe PDF rendering is unsupported (notably many mobile browsers).

3. **SEO** (`Head` export):
   - Title: "AI Systems Design Field Guide | Aditya Karnam"
   - Description: the book's subtitle
   - `pathname="/ai-systems-design-field-guide/"`

## Cross-link on `/ai-research/`

Add one `ConsoleCard` (in the existing "Start here" section or a new small section) linking to `/ai-systems-design-field-guide/`, titled "AI Systems Design Field Guide" with a one-line description, using the same `Link`/card pattern already used for the other guide cards on that page (`what-is-an-ai-agent-harness`, `building-quecto`).

## Out of scope

- No JS-based PDF renderer (pdf.js/react-pdf) — native browser iframe rendering only, per explicit choice.
- No homepage or header nav changes.
- No analytics/tracking additions.
- No changes to the existing `/ai-research/` "My Papers" academic-paper cards — the new book gets its own card, not folded into that list.
