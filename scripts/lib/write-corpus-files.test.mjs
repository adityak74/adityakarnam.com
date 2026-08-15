import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { writeCorpusFiles } from "./write-corpus-files.mjs"

const tempDirs = []

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rag-corpus-"))
  tempDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe("writeCorpusFiles", () => {
  it("writes sources with nested slugs by creating parent directories", () => {
    const outDir = makeTempDir()
    const files = writeCorpusFiles(
      [
        {
          slug: "ai-research/building-quecto",
          title: "Building QuECTO",
          body: "A lean harness note.",
        },
      ],
      outDir
    )

    const expectedPath = path.join(outDir, "ai-research", "building-quecto.md")

    expect(files).toEqual([{ fileName: "ai-research/building-quecto.md", filePath: expectedPath }])
    expect(fs.readFileSync(expectedPath, "utf8")).toBe("# Building QuECTO\n\nA lean harness note.\n")
  })
})
