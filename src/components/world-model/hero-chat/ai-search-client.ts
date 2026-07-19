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

export type AiSearchCredentials = { accountId: string; apiToken: string }

export const queryAiSearch = async (
  messages: ChatMessage[],
  credentials: AiSearchCredentials
): Promise<AiSearchResult | null> => {
  if (!credentials.accountId || !credentials.apiToken) {
    return null
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${credentials.accountId}/ai-search/instances/${AI_SEARCH_INSTANCE}/chat/completions`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.apiToken}`,
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
