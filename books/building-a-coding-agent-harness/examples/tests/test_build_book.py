import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build_book


class RenderMermaidBlocksTests(unittest.TestCase):
    def test_mermaid_fence_becomes_a_local_svg_image(self):
        source = "Before.\n\n```mermaid\naccDescr: Model request crosses the harness boundary.\nflowchart LR\n  A[Model] --> B[Harness]\n```\n\nAfter."

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)

            def fake_mmdc(command, **_kwargs):
                self.assertIn("-c", command)
                self.assertTrue(Path(command[command.index("-c") + 1]).is_file())
                source_path = Path(command[command.index("-i") + 1])
                output_path = Path(command[command.index("-o") + 1])
                self.assertIn("flowchart LR", source_path.read_text())
                output_path.write_text('<svg xmlns="http://www.w3.org/2000/svg"></svg>')

            rendered = build_book.render_mermaid_blocks(
                source, output_dir, runner=fake_mmdc, renderer="mmdc"
            )

            self.assertNotIn("```mermaid", rendered)
            self.assertIn('src="diagram-01.svg" alt="Model request crosses the harness boundary."', rendered)
            self.assertTrue((output_dir / "diagram-01.svg").is_file())
            self.assertIn("Before.", rendered)
            self.assertIn("After.", rendered)

    def test_mermaid_renderer_failure_stops_the_build(self):
        source = "```mermaid\nnot a valid diagram\n```"

        def failed_mmdc(command, **_kwargs):
            raise subprocess.CalledProcessError(1, command, stderr="parse error")

        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaisesRegex(RuntimeError, "diagram 1"):
                build_book.render_mermaid_blocks(
                    source, Path(temp_dir), runner=failed_mmdc, renderer="mmdc"
                )

    def test_text_without_mermaid_does_not_require_a_renderer(self):
        source = "No figures in this section."

        with tempfile.TemporaryDirectory() as temp_dir:
            rendered = build_book.render_mermaid_blocks(
                source,
                Path(temp_dir),
                runner=lambda *_args, **_kwargs: self.fail("renderer should not run"),
            )

        self.assertEqual(source, rendered)

    def test_book_html_uses_the_svg_figure_instead_of_mermaid_source(self):
        front_matter = build_book.Chapter(Path("front.md"), "Front Matter", "## Preface\nText.")
        chapter = build_book.Chapter(
            Path("chapter.md"),
            "The Model Boundary",
            "```mermaid\nflowchart LR\n  A[Model] --> B[Harness]\n```",
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)

            def fake_mmdc(command, **_kwargs):
                Path(command[command.index("-o") + 1]).write_text(
                    '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
                )

            html = build_book.build_html(
                [front_matter, chapter],
                {"title": "Test", "author": "Author"},
                output_dir,
                mermaid_runner=fake_mmdc,
                mermaid_renderer="mmdc",
            )

            self.assertIn('<figure class="diagram">', html)
            self.assertIn('src="chapter-01-diagram-01.svg"', html)
            self.assertNotIn("```mermaid", html)
            self.assertTrue((output_dir / "chapter-01-diagram-01.svg").is_file())


if __name__ == "__main__":
    unittest.main()
