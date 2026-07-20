import { describe, expect, it } from "vitest"
import type { RecruiterBrief } from "./bridge"
import { fitCheckReducer, initialFitCheckState } from "./fitCheckState"

const brief: RecruiterBrief = {
  dataVersion: "1",
  fitSummary: "Strong match.",
  evidence: [],
  interviewTopics: [],
  gaps: [],
  sourceUrls: [],
}

describe("fitCheckReducer", () => {
  it("starts empty", () => {
    expect(initialFitCheckState).toEqual({ status: "empty" })
  })

  it("moves to loading on submit", () => {
    const next = fitCheckReducer(initialFitCheckState, { type: "submit", roleDescription: "Backend role" })
    expect(next).toEqual({ status: "loading", roleDescription: "Backend role" })
  })

  it("moves to results on resolved after loading", () => {
    const loading = fitCheckReducer(initialFitCheckState, { type: "submit", roleDescription: "Backend role" })
    const next = fitCheckReducer(loading, { type: "resolved", brief })
    expect(next).toEqual({ status: "results", roleDescription: "Backend role", brief })
  })

  it("moves to error on rejected after loading", () => {
    const loading = fitCheckReducer(initialFitCheckState, { type: "submit", roleDescription: "Backend role" })
    const next = fitCheckReducer(loading, { type: "rejected", message: "Rate limit exceeded." })
    expect(next).toEqual({ status: "error", roleDescription: "Backend role", message: "Rate limit exceeded." })
  })

  it("ignores a stale resolved action when not loading", () => {
    const next = fitCheckReducer(initialFitCheckState, { type: "resolved", brief })
    expect(next).toEqual(initialFitCheckState)
  })

  it("resets to empty", () => {
    const loading = fitCheckReducer(initialFitCheckState, { type: "submit", roleDescription: "Backend role" })
    expect(fitCheckReducer(loading, { type: "reset" })).toEqual({ status: "empty" })
  })
})
