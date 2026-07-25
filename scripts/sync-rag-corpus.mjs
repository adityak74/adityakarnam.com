import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { discoverSources } from "./lib/discover-content.mjs"
import { writeCorpusFiles } from "./lib/write-corpus-files.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, "..")
const OUT_DIR = path.join(REPO_ROOT, ".rag-corpus")

const BUCKET = process.env.RAG_CORPUS_BUCKET || "adityakarnam-rag-corpus"
const AI_SEARCH_INSTANCE = process.env.AI_SEARCH_INSTANCE || "hero-chat"

function uploadToR2(fileName, filePath) {
  execFileSync("npx", ["wrangler", "r2", "object", "put", `${BUCKET}/${fileName}`, "--file", filePath, "--remote"], {
    stdio: "inherit",
  })
}

function triggerAiSearchSync() {
  execFileSync("npx", ["wrangler", "ai-search", "jobs", "create", AI_SEARCH_INSTANCE], { stdio: "inherit" })
}

function main() {
  const sources = discoverSources()
  const files = writeCorpusFiles(sources, OUT_DIR)

  for (const { fileName, filePath } of files) {
    uploadToR2(fileName, filePath)
  }

  triggerAiSearchSync()

  console.log(`Synced ${sources.length} sources to r2://${BUCKET} and triggered an AI Search sync job for ${AI_SEARCH_INSTANCE}.`)
}

main()
