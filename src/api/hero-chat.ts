import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby"
import {
  VISITOR_LENSES,
  LENS_FALLBACKS,
  DEFAULT_FALLBACK_SOURCES,
  buildSystemMessage,
  type VisitorLens,
} from "../components/world-model/hero-chat/hero-chat-types"
import { buildSourcesFromChunks, type SourceLink } from "../components/world-model/hero-chat/map-source-url"
import { checkRateLimit } from "../components/world-model/hero-chat/rate-limiter"
import {
  queryAiSearch,
  extractAnswer,
  extractChunks,
  type ChatMessage,
} from "../components/world-model/hero-chat/ai-search-client"

type HeroChatMessage = { role: "user" | "assistant"; content: string }

type HeroChatBody = {
  messages?: HeroChatMessage[]
  persona?: string
}

type HeroChatPayload = {
  text: string
  sources: SourceLink[]
  fallback: boolean
}

const TTL_MS = 1000 * 60 * 10
const cache = new Map<string, { expiresAt: number; payload: HeroChatPayload }>()

const normalizePersona = (value: unknown): VisitorLens =>
  (VISITOR_LENSES as string[]).includes(value as string) ? (value as VisitorLens) : "AI Researcher"

const normalizeMessages = (value: unknown): HeroChatMessage[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter(
      (entry): entry is HeroChatMessage =>
        Boolean(entry) &&
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.trim().length > 0
    )
    .map((entry) => ({ role: entry.role, content: entry.content.slice(0, 2000) }))
    .slice(-10)
}

const buildFallback = (persona: VisitorLens): HeroChatPayload => ({
  text: LENS_FALLBACKS[persona],
  sources: DEFAULT_FALLBACK_SOURCES,
  fallback: true,
})

export default async function handler(
  req: GatsbyFunctionRequest<HeroChatBody>,
  res: GatsbyFunctionResponse<HeroChatPayload | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." })
  }

  const clientIp = String(req.headers["cf-connecting-ip"] ?? req.headers["x-forwarded-for"] ?? "unknown")
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: "Too many questions. Try again in a bit." })
  }

  const persona = normalizePersona(req.body?.persona)
  const messages = normalizeMessages(req.body?.messages)

  if (messages.length === 0) {
    return res.status(400).json({ error: "At least one user message is required." })
  }

  const cacheKey = `${persona}:${messages.map((message) => `${message.role}:${message.content}`).join("|")}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json(cached.payload)
  }

  try {
    const aiSearchMessages: ChatMessage[] = [buildSystemMessage(persona), ...messages]
    const result = await queryAiSearch(aiSearchMessages)
    const text = extractAnswer(result)
    const chunks = extractChunks(result)
    const sources = buildSourcesFromChunks(chunks)

    const payload: HeroChatPayload =
      text && sources.length > 0 ? { text, sources, fallback: false } : buildFallback(persona)

    cache.set(cacheKey, { expiresAt: Date.now() + TTL_MS, payload })
    return res.status(200).json(payload)
  } catch (_error) {
    return res.status(200).json(buildFallback(persona))
  }
}

export const config = {
  bodyParser: {
    json: {
      limit: "32kb",
    },
  },
}
