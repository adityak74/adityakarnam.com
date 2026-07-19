import { describe, it, expect } from "vitest"
import { renderCorpusDoc } from "./render-corpus-doc.mjs"

describe("renderCorpusDoc", () => {
  it("renders title as an H1 followed by the body", () => {
    const result = renderCorpusDoc({ title: "Example Title", body: "Example body text." })

    expect(result).toBe("# Example Title\n\nExample body text.\n")
  })
})
