# Building a Coding Agent Harness — Edition 1

This package contains the manuscript, build pipeline, printable PDF, web HTML, cover assets, and the runnable Rust teaching crate.

## Build

From `examples/`:

```sh
python3 build_book.py
python3 build_book.py --standalone
cargo test --manifest-path reference-harness/Cargo.toml
```

The builder requires Python-Markdown and WeasyPrint. It writes the PDF and HTML under `examples/static/books/`.

## What Is Implemented

The compact reference crate implements the model boundary, bounded agent loop, typed tools, repository context, command boundary, and execution policy. Chapters on verification design, persisted sessions, layered profiles, MCP, telemetry, and evaluation distinguish design extensions from code present in that teaching crate. Appendix A maps those concerns to production Quecto source.

Production reference: [github.com/adityak74/quecto](https://github.com/adityak74/quecto), reviewed at revision `97158860a490790edeb58f9727b684423f04cbe3` on 2026-10-03. That external repository is not duplicated in this package.

## License

The book and teaching reference crate are MIT licensed. The cover artwork is original artwork generated for this book; title and author typography are typeset in the build stylesheet.
