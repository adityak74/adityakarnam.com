import type { RecruiterBrief } from "./bridge"

export type FitCheckState =
  | { status: "empty" }
  | { status: "loading"; roleDescription: string }
  | { status: "results"; roleDescription: string; brief: RecruiterBrief }
  | { status: "error"; roleDescription: string; message: string }

export type FitCheckAction =
  | { type: "submit"; roleDescription: string }
  | { type: "resolved"; brief: RecruiterBrief }
  | { type: "rejected"; message: string }
  | { type: "reset" }

export const initialFitCheckState: FitCheckState = { status: "empty" }

export const fitCheckReducer = (state: FitCheckState, action: FitCheckAction): FitCheckState => {
  switch (action.type) {
    case "submit":
      return { status: "loading", roleDescription: action.roleDescription }
    case "resolved":
      if (state.status !== "loading") return state
      return { status: "results", roleDescription: state.roleDescription, brief: action.brief }
    case "rejected":
      if (state.status !== "loading") return state
      return { status: "error", roleDescription: state.roleDescription, message: action.message }
    case "reset":
      return { status: "empty" }
    default:
      return state
  }
}
