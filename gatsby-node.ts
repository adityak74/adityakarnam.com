import type { GatsbyNode } from "gatsby"

export const createPages: GatsbyNode["createPages"] = async ({ actions }) => {
  actions.createRedirect({
    fromPath: "/ask/",
    toPath: "/",
    isPermanent: true,
  })
  actions.createRedirect({
    fromPath: "/mlx-speculative-decoding-apple-silicon/",
    toPath: "/mlx-speculative-decoding-qwen3-8-apple-silicon/",
    isPermanent: true,
  })
}

// The minimal-blog-core theme supports `description` / `canonicalUrl` on posts but not on
// pages, so `/awesome-agentic-memory/` and friends fell back to the sitewide description.
// Extend the `Page` interface (and its `MdxPage` implementation) with the SEO fields.
export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  actions.createTypes(`
    interface Page implements Node {
      id: ID!
      description: String
      keywords: [String]
      canonicalUrl: String
      hideTitle: Boolean
    }

    type MdxPage implements Node & Page {
      description: String
      keywords: [String]
      canonicalUrl: String
      hideTitle: Boolean
    }
  `)
}

// `MdxPage` nodes are created by the theme's onCreateNode and don't carry these fields,
// so resolve them from the parent `Mdx` node's frontmatter.
export const createResolvers: GatsbyNode["createResolvers"] = ({ createResolvers }) => {
  const fromFrontmatter = (fieldName: string, type: string) => ({
    type,
    resolve: (source: any, _args: unknown, context: any) => {
      const parent = context.nodeModel.getNodeById({ id: source.parent })
      return parent?.frontmatter?.[fieldName] ?? null
    },
  })

  createResolvers({
    MdxPage: {
      description: fromFrontmatter(`description`, `String`),
      keywords: fromFrontmatter(`keywords`, `[String]`),
      canonicalUrl: fromFrontmatter(`canonicalUrl`, `String`),
      hideTitle: fromFrontmatter(`hideTitle`, `Boolean`),
    },
  })
}
