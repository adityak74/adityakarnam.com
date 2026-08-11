import { graphql } from "gatsby"
import PageComponent, { Head } from "../../gatsby-theme-minimal-blog/components/page"

export default PageComponent

export { Head }

export const query = graphql`
  query ($slug: String!) {
    page(slug: { eq: $slug }) {
      title
      slug
      excerpt
      description
      keywords
      canonicalUrl
      hideTitle
    }
  }
`
