import type { GatsbyNode } from "gatsby"

export const createPages: GatsbyNode["createPages"] = async ({ actions }) => {
  actions.createRedirect({
    fromPath: "/ask/",
    toPath: "/",
    isPermanent: true,
  })
}
