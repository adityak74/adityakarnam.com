import { graphql } from "gatsby"
import PostComponent, { Head } from "../../gatsby-theme-minimal-blog/components/post"

export default PostComponent

export { Head }

export const query = graphql`
  query ($slug: String!, $formatString: String!) {
    post(slug: { eq: $slug }) {
      slug
      title
      date(formatString: $formatString)
      dateISO: date(formatString: "YYYY-MM-DD")
      tags {
        name
        slug
      }
      description
      canonicalUrl
      excerpt
      timeToRead
      banner {
        childImageSharp {
          resize(width: 1200, quality: 90) {
            src
          }
        }
      }
    }
  }
`
