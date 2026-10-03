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
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from html import escape
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
MERMAID_FENCE = re.compile(r"(?ms)^```mermaid[ \t]*\n(.*?)^```[ \t]*$")


# ── helpers ──────────────────────────────────────────────────────────────────


def load_book_yml() -> dict:
    """Load the small, intentionally dependency-free subset used in book.yml."""
    text = BOOK_YML.read_text()
    # Strip comment lines and key: value
    chapters: list[str] = []
    meta: dict = {}
    current = None
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        indent = len(line) - len(line.lstrip())
        if current == "chapters" and indent >= 4:
            chapter_file = re.match(r'^file:\s*["\']?([^"\']+)', stripped)
            if chapter_file:
                chapters.append(chapter_file.group(1).strip())
            continue
        if indent > 0:
            continue
        if stripped == "chapters:":
            current = "chapters"
            continue
        m = re.match(r"^(\w+):\s*(.+)$", stripped)
        if m:
            current = m.group(1)
            if current in ("chapters", "title", "author", "subtitle", "supporting_line", "edition", "version"):
                if current == "chapters":
                    pass  # list items below
                else:
                    meta[current] = m.group(2).strip().strip('"')
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

        candidate = (MANUSCRIPT_DIR / path_rel).resolve()
        if not candidate.exists():
            raise FileNotFoundError(f"include target does not exist: {path_rel}")

        content = candidate.read_text(encoding="utf-8")

        if anchor:
            anchor_clean = anchor.split(":", 1)[-1].strip() if ":" in anchor else anchor.strip()
            marker = f"ANCHOR: {anchor_clean}"
            idx = content.find(marker)
            if idx < 0:
                raise ValueError(f"anchor {anchor_clean!r} not found in {path_rel}")
            start = content.find("\n", idx)
            end_marker = f"ANCHOR_END: {anchor_clean}"
            end = content.find(end_marker, start)
            if end < 0:
                raise ValueError(f"anchor end {anchor_clean!r} not found in {path_rel}")
            content = content[start + 1:end].rstrip()
        else:
            content = re.sub(r"(?m)^\s*// ANCHOR(?:_END)?: .*\n", "", content).rstrip()

        # Authors may put an include inside a fenced Rust block or use a bare
        # directive for a whole source file. Add a fence only in the latter
        # case; nested fences turn Rust attributes beginning with `#` into
        # Markdown headings and corrupt both layout and PDF bookmarks.
        fences_before = len(re.findall(r"(?m)^\s*```", md[:m.start()]))
        if fences_before % 2:
            return content.rstrip()
        return "```\n" + content.rstrip() + "\n```"

    return pattern.sub(replacer, md)


def find_mermaid_cli() -> str:
    """Find the book-local Mermaid CLI or a user-installed `mmdc`."""
    local_cli = SCRIPT_DIR / "node_modules" / ".bin" / "mmdc"
    if local_cli.is_file():
        return str(local_cli)
    cli = shutil.which("mmdc")
    if cli:
        return cli
    raise RuntimeError(
        "Mermaid diagrams require mmdc. From examples/, run `npm ci` "
        "or install @mermaid-js/mermaid-cli globally."
    )


def render_mermaid_blocks(
    md: str,
    output_dir: Path,
    *,
    group: str = "diagram",
    runner=None,
    renderer: str | None = None,
) -> str:
    """Replace Mermaid fences with local SVG figures; fail rather than leak source."""
    if not MERMAID_FENCE.search(md):
        if re.search(r"(?m)^```mermaid(?:[ \t]|$)", md):
            raise ValueError("unterminated Mermaid code fence")
        return md

    runner = runner or subprocess.run
    renderer = renderer or find_mermaid_cli()
    output_dir.mkdir(parents=True, exist_ok=True)
    diagram_index = 0

    def render_match(match: re.Match) -> str:
        nonlocal diagram_index
        diagram_index += 1
        source = match.group(1).strip() + "\n"
        filename = f"{group}-{diagram_index:02d}.svg"
        output_path = output_dir / filename
        source_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", suffix=".mmd", dir=output_dir, delete=False
            ) as source_file:
                source_file.write(source)
                source_path = Path(source_file.name)
            runner(
                [
                    renderer,
                    "-i", str(source_path),
                    "-o", str(output_path),
                    "-c", str(SCRIPT_DIR / "mermaid-config.json"),
                    "-b", "#f7f4ed",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
        except FileNotFoundError as error:
            raise RuntimeError("could not start Mermaid CLI (mmdc)") from error
        except subprocess.CalledProcessError as error:
            detail = (error.stderr or error.stdout or "renderer returned a failure").strip()
            raise RuntimeError(f"could not render diagram {diagram_index}: {detail}") from error
        finally:
            if source_path is not None:
                source_path.unlink(missing_ok=True)

        if not output_path.is_file() or output_path.stat().st_size == 0:
            raise RuntimeError(f"Mermaid CLI produced no SVG for diagram {diagram_index}")

        description = f"Diagram {diagram_index}"
        for line in source.splitlines():
            accessible_description = re.match(r"\s*accDescr:\s*(.+)", line)
            if accessible_description:
                description = accessible_description.group(1).strip()
                break
        return (
            f'<figure class="diagram"><img src="{filename}" '
            f'alt="{escape(description, quote=True)}" /></figure>'
        )

    rendered = MERMAID_FENCE.sub(render_match, md)
    if re.search(r"(?m)^```mermaid(?:[ \t]|$)", rendered):
        raise ValueError("unprocessed Mermaid code fence remains in manuscript")
    return rendered


def load_chapters() -> list[Chapter]:
    manifest_files = load_book_yml()["chapters"]
    if not manifest_files:
        raise ValueError("book.yml must declare chapter file order")
    files = [MANUSCRIPT_DIR / name for name in manifest_files]
    missing = [str(path) for path in files if not path.is_file()]
    if missing:
        raise FileNotFoundError("chapter file(s) missing from book.yml: " + ", ".join(missing))
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
    # Python-Markdown follows the blank-line-before-list rule. Normalize the
    # manuscript's compact prose lists without touching fenced code or list
    # continuation lines, so labels and callout lists render as actual lists.
    normalized: list[str] = []
    in_fence = False
    previous = ""
    for line in md.splitlines():
        if re.match(r"^\s*```", line):
            in_fence = not in_fence
        is_list = bool(re.match(r"^\s{0,3}(?:[-*+]\s+|\d+[.)]\s+)", line))
        previous_is_list = bool(re.match(r"^\s{0,3}(?:[-*+]\s+|\d+[.)]\s+)", previous))
        if not in_fence and is_list and previous.strip() and not previous_is_list:
            normalized.append("")
        normalized.append(line)
        previous = line
    md = "\n".join(normalized)

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


def build_html(
    chapters: list[Chapter],
    yml: dict,
    diagram_dir: Path | None = None,
    *,
    mermaid_runner=None,
    mermaid_renderer: str | None = None,
) -> str:
    """Assemble the final HTML (TOC + chapters + appendices)."""
    diagram_dir = diagram_dir or (SCRIPT_DIR / "static" / "books")
    toc_html = ""
    for i, ch in enumerate(chapters):
        if i == 0:
            continue
        anchor = f"chapter-{i}"
        toc_html += f'<li><a href="#{anchor}">{ch.title}</a><span class="toc-page" href="#{anchor}"></span></li>\n'
    toc_html = f'<section class="toc"><h1>Contents</h1><ul>{toc_html}</ul></section>'

    cover_html = f"""
    <section class="cover">
      <img src="building-a-coding-agent-harness-cover.png" alt="Layered coding-agent runtime illustration" />
      <div class="cover-kicker">A PRACTICAL SYSTEMS GUIDE</div>
      <h1>{yml.get('title', 'Building a Coding Agent Harness')}</h1>
      <p class="cover-subtitle">{yml.get('subtitle', '')}</p>
      <p class="cover-support">{yml.get('supporting_line', '')}</p>
      <p class="cover-author">{yml.get('author', '')}</p>
      <p class="cover-edition">EDITION {yml.get('edition', '1.0.0')} &nbsp;·&nbsp; OCTOBER 2026</p>
    </section>
    """

    chapter_html_parts: list[str] = []
    for i, ch in enumerate(chapters):
        if i == 0:
            body = re.sub(r"(?m)^# .*\n?", "", ch.body, count=1)
            body = re.sub(r"(?ms)^## Front Matter\s*.*?(?=^## Preface)", "", body, count=1)
            body = render_mermaid_blocks(
                body,
                diagram_dir,
                group=f"chapter-{i:02d}-diagram",
                runner=mermaid_runner,
                renderer=mermaid_renderer,
            )
            chapter_html_parts.append(f'<section class="front-matter">{md_to_html(body)}</section>')
            continue
        anchor = f"chapter-{i}"
        chapter_html_parts.append(f'<section class="chapter"><h1 id="{anchor}">{ch.title}</h1>')
        # The source heading is represented by the manifest-backed heading above.
        body = re.sub(r"(?m)^# .*\n?", "", ch.body, count=1)
        body = render_mermaid_blocks(
            body,
            diagram_dir,
            group=f"chapter-{i:02d}-diagram",
            runner=mermaid_runner,
            renderer=mermaid_renderer,
        )
        chapter_html_parts.append(md_to_html(body))
        chapter_html_parts.append("</section>")

    return (
        cover_html + toc_html + "\n".join(chapter_html_parts)
    )


def render_pdf(html: str, output_path: Path, yml: dict) -> None:
    """Write HTML to PDF via weasyprint (primary path).

    Target: 70–80 pages. 9pt font, 18mm margins.
    """
    from weasyprint import HTML

    css = (SCRIPT_DIR / "pdf" / "book.css").read_text(encoding="utf-8")
    doc_html = (
        f"<html><head><meta charset='utf-8'><title>{yml.get('title', '')}</title>"
        f"<meta name='author' content='{yml.get('author', '')}'>"
        f"<style>{css}</style></head><body>{html}</body></html>"
    )
    HTML(string=doc_html, base_url=str(output_path.parent.resolve())).write_pdf(str(output_path))


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
    output_dir = Path(args.output).parent
    html = build_html(chapters, yml, output_dir)

    if args.standalone:
        out_path = Path(args.output).with_suffix(".html")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        cover_asset = out_path.parent / "building-a-coding-agent-harness-cover.png"
        cover_asset.write_bytes((BOOK_DIR / "assets" / "cover-illustration.png").read_bytes())
        out_path.write_text(
            f"<html><head><meta charset='utf-8'><title>{yml.get('title', '')}</title>"
            f"<meta name='author' content='{yml.get('author', '')}'>"
            f"<style>{open(SCRIPT_DIR / 'pdf' / 'book.css').read()}</style>"
            f"</head><body>{html}</body></html>")
        print(f"HTML written: {out_path}")
        return

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cover_asset = out_path.parent / "building-a-coding-agent-harness-cover.png"
    cover_asset.write_bytes((BOOK_DIR / "assets" / "cover-illustration.png").read_bytes())
    print(f"Rendering PDF: {out_path} ...")
    render_pdf(html, out_path, yml)
    print(f"Done: {out_path}")


if __name__ == "__main__":
    main()
