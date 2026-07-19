export type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

export type AiSearchChunk = {
  item?: { key?: string; metadata?: Record<string, unknown> }
  text?: string
  score?: number
}

export type AiSearchResult = {
  choices?: Array<{ message?: { content?: string } }>
  chunks?: AiSearchChunk[]
}

const AI_SEARCH_INSTANCE = "hero-chat"

export const hasAiSearchCredentials = (): boolean =>
  Boolean(process.env.CLOUDFLARE_API_TOKEN) && Boolean(process.env.CLOUDFLARE_ACCOUNT_ID)

export const queryAiSearch = async (messages: ChatMessage[]): Promise<AiSearchResult | null> => {
  if (!hasAiSearchCredentials()) {
    return null
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai-search/instances/${AI_SEARCH_INSTANCE}/chat/completions`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    return null
  }

  const payload = await response.json()
  const result: AiSearchResult = payload?.result ?? payload

  return result ?? null
}

export const extractAnswer = (result: AiSearchResult | null): string | null =>
  result?.choices?.[0]?.message?.content?.trim() || null

export const extractChunks = (result: AiSearchResult | null): AiSearchChunk[] => result?.chunks ?? []
