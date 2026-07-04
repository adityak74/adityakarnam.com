import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby"
import {
  buildAskFallback,
  collectSources,
  selectProjectSlugsForQuestion,
  type ResearchSource,
} from "../components/world-model/pages-ask/research-context"
import { requestAskMyWork } from "../components/world-model/pages-ask/openrouter"

type AskBody = {
  question?: string
}

type AskPayload = {
  text: string
  fallback: boolean
  sources: ResearchSource[]
}

const TTL_MS = 1000 * 60 * 10
const cache = new Map<string, { expiresAt: number; payload: AskPayload }>()

const normalizeQuestion = (value: string) =>
  value.replace(/\s+/g, " ").trim().slice(0, 320)

export default async function handler(
  req: GatsbyFunctionRequest<AskBody>,
  res: GatsbyFunctionResponse<AskPayload | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." })
  }

  const rawQuestion = typeof req.body?.question === "string" ? req.body.question : ""
  const question = normalizeQuestion(rawQuestion)

  if (!question) {
    return res.status(400).json({ error: "Question is required." })
  }

  const cached = cache.get(question)
  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json(cached.payload)
  }

  const slugs = selectProjectSlugsForQuestion(question)
  const sources = collectSources(slugs.length > 0 ? slugs : ["subagent-fleet", "embenx", "ai-toolkit"])
  const fallback = buildAskFallback(question)

  try {
    const result = await requestAskMyWork(question, sources)
    const payload: AskPayload = {
      text: result.text ?? fallback.text,
      fallback: !result.text,
      sources: sources.length > 0 ? sources : fallback.sources,
    }

    cache.set(question, {
      expiresAt: Date.now() + TTL_MS,
      payload,
    })

    return res.status(200).json(payload)
  } catch (_error) {
    const payload: AskPayload = {
      text: fallback.text,
      fallback: true,
      sources: fallback.sources,
    }

    return res.status(200).json(payload)
  }
}

export const config = {
  bodyParser: {
    json: {
      limit: "32kb",
    },
  },
}

