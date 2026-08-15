import fs from "node:fs"
import path from "node:path"
import { renderCorpusDoc } from "./render-corpus-doc.mjs"

export function writeCorpusFiles(sources, outDir) {
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })

  return sources.map((source) => {
    const fileName = `${source.slug}.md`
    const filePath = path.join(outDir, fileName)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, renderCorpusDoc(source))
    return { fileName, filePath }
  })
}
