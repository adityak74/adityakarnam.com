export type { SourceLink } from "./hero-chat-types"
import type { SourceLink } from "./hero-chat-types"

export const mapChunkKeyToUrl = (key: string): string => {
  const slug = key.replace(/\.mdx?$/i, "")
  return `https://adityakarnam.com/${slug}/`
}

type Chunk = { item?: { key?: string }; score?: number }

export const buildSourcesFromChunks = (chunks: Chunk[], scoreThreshold = 0.4): SourceLink[] => {
  const seen = new Set<string>()
  const sources: SourceLink[] = []

  for (const chunk of chunks) {
    const key = chunk.item?.key
    if (!key) continue
    if (typeof chunk.score === "number" && chunk.score < scoreThreshold) continue

    const href = mapChunkKeyToUrl(key)
    if (seen.has(href)) continue
    seen.add(href)

    sources.push({ label: key.replace(/\.mdx?$/i, ""), href })
  }

  return sources
}
