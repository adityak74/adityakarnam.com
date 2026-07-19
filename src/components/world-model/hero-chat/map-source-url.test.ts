import { describe, it, expect } from "vitest"
import { mapChunkKeyToUrl, buildSourcesFromChunks } from "./map-source-url"

describe("mapChunkKeyToUrl", () => {
  it("strips the .md extension and builds a full URL", () => {
    expect(mapChunkKeyToUrl("india-agent-infrastructure-layer.md")).toBe(
      "https://adityakarnam.com/india-agent-infrastructure-layer/"
    )
  })
})

describe("buildSourcesFromChunks", () => {
  it("dedupes chunks from the same source document", () => {
    const chunks = [
      { item: { key: "embenx-python-embedding-toolkit.md" }, score: 0.9 },
      { item: { key: "embenx-python-embedding-toolkit.md" }, score: 0.8 },
    ]

    expect(buildSourcesFromChunks(chunks)).toHaveLength(1)
  })

  it("drops chunks below the score threshold", () => {
    const chunks = [{ item: { key: "ai-toolkit.md" }, score: 0.1 }]

    expect(buildSourcesFromChunks(chunks, 0.4)).toHaveLength(0)
  })

  it("drops chunks with no item key", () => {
    const chunks = [{ score: 0.9 }]

    expect(buildSourcesFromChunks(chunks)).toHaveLength(0)
  })
})
