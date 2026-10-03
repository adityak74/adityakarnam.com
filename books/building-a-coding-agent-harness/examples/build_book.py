#!/usr/bin/env python3
"""build_book.py — Build the coding-agent-harness book PDF from manuscript files.

Pipeline:
  1. Read book.yml (metadata, chapter ordering).
  2. For each chapter, resolve {{include: path#ANCHOR}} by pulling actual
     source code from the reference harness.
  3. Convert Markdown → HTML (Python Markdown library).
  4. Render to PDF (weasyprint, default path; falls back to reportlab).

Usage:
    python3 build_book.py [--output PATH] [--font-size N] [--standalone]
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

import markdown
from markdown.extensions import Extension
from markdown.extensions.meta import MetaExtension
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor

SCRIPT_DIR = Path(__file__).resolve().parent  # examples/
BOOK_DIR = SCRIPT_DIR.parent  # book root (sibling of examples/)
MANUSCRIPT_DIR = BOOK_DIR / "manuscript"
REFERENCE_ROOT = SCRIPT_DIR / "reference-harness"
BOOK_YML = BOOK_DIR / "book.yml"


# ── helpers ──────────────────────────────────────────────────────────────────


def load_book_yml() -> dict:
    """Load book.yml (simple YAML-like text)."""
    text = BOOK_YML.read_text()
    # Strip comment lines and key: value
    chapters: list[str] = []
    meta: dict = {}
    current = None
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        m = re.match(r"^(\w+):\s*(.+)$", stripped)
        if m:
            current = m.group(1)
            if current in ("chapters", "title", "author", "subtitle", "version"):
                if current == "chapters":
                    pass  # list items below
                else:
                    meta[current] = m.group(2).strip().strip('"')
        elif stripped.startswith("- "):
            chapters.append(stripped[2:].strip())
    return {"chapters": chapters, **meta}


@dataclass
class Chapter:
    file: Path
    title: str
    body: str


def parse_front_matter(text: str) -> tuple[dict, str]:
    """Split at '---' front matter, return (meta, body)."""
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    meta_raw = parts[1].strip()
    body = parts[2].lstrip()
    meta: dict = {}
    for line in meta_raw.splitlines():
        m = re.match(r"^(\w+):\s*(.+)$", line)
        if m:
            meta[m.group(1)] = m.group(2).strip().strip('"')
    return meta, body


def title_from_file(file: Path) -> str:
    raw = file.read_text(encoding="utf-8")
    _, body = parse_front_matter(raw)
    for line in body.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line.lstrip("# ").strip()
    return file.stem.replace("-", " ").title()


def resolve_includes(md: str) -> str:
    """Replace {{include: path#ANCHOR}} with code from the reference harness."""
    pattern = re.compile(r"\{\{include:\s*([^#}]+)(?:#([^}]+))?\s*\}\}")

    def replacer(m: re.Match) -> str:
        path_rel = m.group(1).strip()
        anchor = m.group(2)  # may be None

        candidate = MANUSCRIPT_DIR.parent.parent / path_rel
        if not candidate.exists():
            return ""  # drop stale includes silently

        content = candidate.read_text(encoding="utf-8")

        if anchor:
            anchor_clean = anchor.split(":", 1)[-1].strip() if ":" in anchor else anchor.strip()
            marker = f"#ANCHOR: {anchor_clean}"
            idx = content.find(marker)
            if idx >= 0:
                content = content[idx:]
            path_prefix = path_rel.split("/")[-1] + ":"
            if content.startswith(path_prefix):
                content = content[len(path_prefix):]

        return "```\n" + content.rstrip() + "\n```"

    return pattern.sub(replacer, md)


def load_chapters() -> list[Chapter]:
    files = sorted(MANUSCRIPT_DIR.glob("*.md"))
    chapters: list[Chapter] = []
    for f in files:
        raw = f.read_text(encoding="utf-8")
        _, body = parse_front_matter(raw)
        resolved = resolve_includes(body)
        title = title_from_file(f)
        # Strip the title line from the body
        lines = resolved.splitlines()
        prefix = f"# {title}"
        for i, line in enumerate(lines):
            if line.strip() == prefix:
                body = "\n".join(lines[i + 1:]).strip()
                break
        chapters.append(Chapter(file=f, title=title, body=body))
    return chapters


# ── Markdown → HTML ──────────────────────────────────────────────────────────


def md_to_html(md: str) -> str:
    extensions = [
        "fenced_code",
        "codehilite",
        "toc",
        "meta",
        "tables",
        "def_list",
    ]
    return markdown.markdown(md, extensions=extensions, extension_configs={
        "codehilite": {"use_pygments": True, "css_class": "codehilite"},
    })


# ── PDF generation ───────────────────────────────────────────────────────────


def build_html(chapters: list[Chapter], yml: dict) -> str:
    """Assemble the final HTML (TOC + chapters + appendices)."""
    toc_html = ""
    for i, ch in enumerate(chapters):
        num = f"{i+1}. " if i > 0 else ""
        toc_html += f"<li><strong>{num}{ch.title}</strong></li>\n"
    toc_html = f"<h1>Table of Contents</h1><ul>{toc_html}</ul><hr/>"

    chapter_html_parts: list[str] = []
    for ch in chapters:
        if ch.title.startswith("Appendix"):
            chapter_html_parts.append(f"<h1>{ch.title}</h1>")
        else:
            chapter_html_parts.append(f"<h1>{ch.title}</h1>")
        chapter_html_parts.append(md_to_html(ch.body))

    appendix_parts = []
    for ch in chapters:
        if ch.title.startswith("Appendix"):
            appendix_parts.append(f"<h1>{ch.title}</h1>")
            appendix_parts.append(md_to_html(ch.body))

    return (
        f"<h1 style='page-break-after:always;'>" + toc_html + "</h1>" +
        "\n".join(chapter_html_parts) +
        (f"<h1 style='page-break-after:always;'>" + "\n".join(appendix_parts) + "</h1>" if appendix_parts else "")
    )


def render_pdf(html: str, output_path: Path) -> None:
    """Write HTML to PDF via weasyprint (primary path).

    Target: 70–80 pages. 9pt font, 18mm margins.
    """
    from weasyprint import HTML

    css = """
    @page {
        size: A4;
        margin: 34mm 24mm 34mm 24mm;
        @top-center { content: string(book-title); font-size: 8pt; color: #888; }
        @bottom-center { content: counter(page); font-size: 9pt; }
    }
    body { font-family: "Source Sans 3", "Linux Libertine", serif;
           font-size: 12.5pt; line-height: 1.6; color: #222; }
    h1 { font-size: 26pt; page-break-after: avoid; margin-bottom: 10pt;
         border-bottom: 2px solid #333; padding-bottom: 4pt;
         string-set: book-title attr(title); }
    h2 { font-size: 16pt; page-break-after: avoid; margin-top: 12pt; margin-bottom: 6pt; }
    h3 { font-size: 13pt; page-break-after: avoid; margin-top: 8pt; }
    p { margin: 0 0 10pt 0; text-align: justify; orphans: 3; widows: 3; }
    pre, code { font-family: "DejaVu Sans Mono", monospace; font-size: 8.5pt; line-height: 1.3; }
    pre { background: #f4f4f4; border: 1px solid #ddd; padding: 8px;
          margin: 5pt 0; border-radius: 2pt; }
    code { background: #f0f0f0; padding: 1pt 2pt; border-radius: 1pt; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; margin: 8pt 0; font-size: 9pt; width: 100%; }
    th { border-bottom: 2px solid #333; text-align: left; padding: 4pt 5pt; }
    td { border-bottom: 1px solid #ccc; padding: 4pt 5pt; }
    blockquote { border-left: 3px solid #666; padding-left: 12pt; margin: 8pt 0;
                 font-style: italic; color: #444; font-size: 11pt; }
    .page-break-after { page-break-after: always; }
    .page-break-before { page-break-before: always; }
    hr { border: none; border-top: 1px solid #ccc; margin: 12pt 0; }
    ul, ol { margin: 7pt 0; padding-left: 18pt; }
    li { margin-bottom: 4pt; font-size: 12.5pt; }
    """

    doc_html = f"<html><head><style>{css}</style></head><body>{html}</body></html>"
    HTML(string=doc_html).write_pdf(str(output_path))


def fallback_reportlab(output_path: Path, chapters: list[Chapter], yml: dict) -> None:
    """Fallback using reportlab SimpleDocTemplate (no CSS / no weasyprint)."""
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, Preformatted,
    )
    from reportlab.lib import colors
    from reportlab.platypus.doctemplate import NextPageTemplate

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="BookTitle", fontName="Helvetica-Bold",
                              fontSize=28, leading=36, textColor=HexColor("#222"), spaceAfter=mm(8)))
    styles.add(ParagraphStyle(name="ChapterTitle", fontName="Helvetica-Bold",
                              fontSize=18, leading=24, textColor=HexColor("#111"),
                              spaceBefore=mm(12), spaceAfter=mm(6)))
    styles.add(ParagraphStyle(name="Body", fontName="Helvetica", fontSize=12,
                              leading=15.5, spaceAfter=mm(6), alignment=TA_JUSTIFY))
    styles.add(ParagraphStyle(name="Code", fontName="Courier", fontSize=8, leading=10))

    story: list = []

    def parse_body(text: str) -> list:
        result = []
        code_block: list[str] = []
        in_code = False
        lines = text.splitlines()
        for line in lines:
            if line.strip() == "```":
                if in_code:
                    result.append(Preformatted("\n".join(code_block), styles["Code"]))
                    code_block = []
                    in_code = False
                else:
                    in_code = True
                continue
            if in_code:
                code_block.append(line)
                continue

            if line.startswith("> "):
                result.append(Paragraph(line[2:], styles["Body"]))
                continue

            if line.startswith("## "):
                result.append(Paragraph(line[3:], styles["ChapterTitle"]))
                result.append(Spacer(1, mm(2)))
                continue

            if line.strip():
                text = line.replace("**", "").replace("`", "").replace("_", "")
                result.append(Paragraph(text, styles["Body"]))
        return result

    story.append(Paragraph(yml.get("title", ""), styles["BookTitle"]))
    for ch in chapters:
        story.append(Paragraph(ch.title, styles["ChapterTitle"]))
        story.extend(parse_body(ch.body))

    doc = SimpleDocTemplate(
        str(output_path), pagesize=A4,
        leftMargin=mm(34), rightMargin=mm(24),
        topMargin=mm(34), bottomMargin=mm(24),
    )
    doc.build(story)


# ── Main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="Build the coding-agent-harness book PDF.")
    parser.add_argument("--output", default="static/books/building-a-coding-agent-harness.pdf")
    parser.add_argument("--font-size", type=int, default=10, help="Base font size (default 10pt)")
    parser.add_argument("--standalone", action="store_true", help="Output HTML, not PDF")
    args = parser.parse_args()

    yml = load_book_yml()
    chapters = load_chapters()
    html = build_html(chapters, yml)

    if args.standalone:
        out_path = Path(args.output).with_suffix(".html")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(
            f"<html><head><style>{open(SCRIPT_DIR / 'pdf' / 'book.css').read()}</style>"
            f"</head><body>{html}</body></html>")
        print(f"HTML written: {out_path}")
        return

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Rendering PDF: {out_path} ...")
    try:
        render_pdf(html, out_path)
        print(f"Done: {out_path}")
    except Exception as exc:
        print(f"  → weasyprint failed ({exc}). Falling back to reportlab.")
        fallback_reportlab(out_path, chapters, yml)


if __name__ == "__main__":
    main()
