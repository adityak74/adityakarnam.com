import type { ResearchSource, VisitorLens } from "./research-context"
import { FIXED_CONTEXT } from "./research-context"

type OpenRouterResult = {
  text: string | null
}

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_MODEL = "openrouter/free"

const extractText = (payload: any): string | null => {
  const content = payload?.choices?.[0]?.message?.content

  if (typeof content === "string") {
    return content.trim()
  }

  if (Array.isArray(content)) {
    const joined = content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim()

    return joined || null
  }

  return null
}

const withSourceList = (sources: ResearchSource[]) =>
  sources.map((source) => `- ${source.label}: ${source.href} — ${source.summary}`).join("\n")

export const hasOpenRouterKey = () => Boolean(process.env.OPENROUTER_API_KEY)

export const requestResearchLens = async (lens: VisitorLens, sources: ResearchSource[]): Promise<OpenRouterResult> => {
  if (!hasOpenRouterKey()) {
    return { text: null }
  }

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://adityakarnam.com",
      "X-OpenRouter-Title": "Aditya Karnam Ask My Work",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.2,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content: [
            "You generate short adaptive profiles for Aditya Karnam's website.",
            "Use only the provided context and sources.",
            "Do not invent achievements, roles, metrics, or unavailable projects.",
            "Keep the answer between 70 and 120 words.",
            "Be serious, technical, and concise.",
            "Mention concrete project names when they are relevant.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            `Visitor lens: ${lens}`,
            `Context:\n${FIXED_CONTEXT}`,
            `Allowed sources:\n${withSourceList(sources)}`,
            "Write a concise, source-grounded summary of why this work matters for the selected lens.",
          ].join("\n\n"),
        },
      ],
    }),
  })

  if (!response.ok) {
    return { text: null }
  }

  const payload = await response.json()
  return { text: extractText(payload) }
}

export const requestAskMyWork = async (question: string, sources: ResearchSource[]): Promise<OpenRouterResult> => {
  if (!hasOpenRouterKey()) {
    return { text: null }
  }

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://adityakarnam.com",
      "X-OpenRouter-Title": "Aditya Karnam Ask My Work",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.2,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content: [
            "You answer questions about Aditya Karnam's work.",
            "Use only the provided context and source list.",
            "If the answer is not supported by the source context, say you do not have enough source context to answer precisely.",
            "Keep answers under 120 words.",
            "Be concise, technical, and grounded.",
            "Do not mention private information or secrets.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            `Question: ${question}`,
            `Context:\n${FIXED_CONTEXT}`,
            `Allowed sources:\n${withSourceList(sources)}`,
            "Answer briefly and ground the answer in the provided material only.",
          ].join("\n\n"),
        },
      ],
    }),
  })

  if (!response.ok) {
    return { text: null }
  }

  const payload = await response.json()
  return { text: extractText(payload) }
}

