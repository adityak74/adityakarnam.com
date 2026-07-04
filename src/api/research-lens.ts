import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby"
import {
  VISITOR_LENSES,
  buildLensFallback,
  type VisitorLens,
} from "../components/world-model/pages-ask/research-context"
import { requestResearchLens } from "../components/world-model/pages-ask/openrouter"

type LensBody = {
  lens?: string
}

type LensPayload = {
  text: string
  fallback: boolean
  sources: ReturnType<typeof buildLensFallback>["sources"]
}

const TTL_MS = 1000 * 60 * 15
const cache = new Map<string, { expiresAt: number; payload: LensPayload }>()

const isVisitorLens = (value: string): value is VisitorLens =>
  VISITOR_LENSES.includes(value as VisitorLens)

export default async function handler(
  req: GatsbyFunctionRequest<LensBody>,
  res: GatsbyFunctionResponse<LensPayload | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." })
  }

  const lensValue = typeof req.body?.lens === "string" ? req.body.lens.trim() : ""

  if (!isVisitorLens(lensValue)) {
    return res.status(400).json({ error: "Invalid visitor lens." })
  }

  const cached = cache.get(lensValue)
  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json(cached.payload)
  }

  const fallback = buildLensFallback(lensValue)

  try {
    const result = await requestResearchLens(lensValue, fallback.sources)
    const payload: LensPayload = {
      text: result.text ?? fallback.text,
      fallback: !result.text,
      sources: fallback.sources,
    }

    cache.set(lensValue, {
      expiresAt: Date.now() + TTL_MS,
      payload,
    })

    return res.status(200).json(payload)
  } catch (_error) {
    const payload: LensPayload = {
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

