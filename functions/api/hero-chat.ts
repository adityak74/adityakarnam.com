import {
  VISITOR_LENSES,
  LENS_FALLBACKS,
  DEFAULT_FALLBACK_SOURCES,
  buildSystemMessage,
  type VisitorLens,
} from "../../src/components/world-model/hero-chat/hero-chat-types"
import { buildSourcesFromChunks, type SourceLink } from "../../src/components/world-model/hero-chat/map-source-url"
import { checkRateLimit } from "../../src/components/world-model/hero-chat/rate-limiter"
import {
  queryAiSearch,
  extractAnswer,
  extractChunks,
  type ChatMessage,
} from "../../src/components/world-model/hero-chat/ai-search-client"

type HeroChatMessage = { role: "user" | "assistant"; content: string }

type HeroChatPayload = {
  text: string
  sources: SourceLink[]
  fallback: boolean
}

type Env = {
  CLOUDFLARE_API_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
}

const TTL_MS = 1000 * 60 * 10
const cache = new Map<string, { expiresAt: number; payload: HeroChatPayload }>()

const jsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

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

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context

  const clientIp = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown"
  if (!checkRateLimit(clientIp)) {
    return jsonResponse({ error: "Too many questions. Try again in a bit." }, 429)
  }

  const body = (await request.json().catch(() => null)) as { persona?: string; messages?: unknown } | null
  const persona = normalizePersona(body?.persona)
  const messages = normalizeMessages(body?.messages)

  if (messages.length === 0) {
    return jsonResponse({ error: "At least one user message is required." }, 400)
  }

  const cacheKey = `${persona}:${messages.map((message) => `${message.role}:${message.content}`).join("|")}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return jsonResponse(cached.payload, 200)
  }

  try {
    const aiSearchMessages: ChatMessage[] = [buildSystemMessage(persona), ...messages]
    const result = await queryAiSearch(aiSearchMessages, {
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      apiToken: env.CLOUDFLARE_API_TOKEN,
    })
    const text = extractAnswer(result)
    const chunks = extractChunks(result)
    const sources = buildSourcesFromChunks(chunks)

    const payload: HeroChatPayload =
      text && sources.length > 0 ? { text, sources, fallback: false } : buildFallback(persona)

    cache.set(cacheKey, { expiresAt: Date.now() + TTL_MS, payload })
    return jsonResponse(payload, 200)
  } catch (_error) {
    return jsonResponse(buildFallback(persona), 200)
  }
}

export const onRequestGet = async (): Promise<Response> => jsonResponse({ error: "Method not allowed." }, 405)
