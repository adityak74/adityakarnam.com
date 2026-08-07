import type { GatsbyConfig, PluginRef } from "gatsby"
import "dotenv/config"

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE

const config: GatsbyConfig = {
  siteMetadata: {
    // You can overwrite values here that are used for the SEO component
    // You can also add new values here to query them like usual
    // See all options: https://github.com/LekoArts/gatsby-themes/blob/main/themes/gatsby-theme-minimal-blog/gatsby-config.mjs
    siteTitle: `Aditya Karnam`,
    siteTitleAlt: `Aditya Karnam — World Model Infrastructure Lab`,
    siteHeadline: `Aditya Karnam builds the infrastructure layer for world-model-driven AI: memory, retrieval, model routing, local inference, agent runtimes, and evals.`,
    siteUrl: `https://adityakarnam.com`,
    siteDescription: `Aditya Karnam is a world model infrastructure builder focused on agent runtimes, memory, retrieval, model routing, local inference, and evaluation systems.`,
    siteImage: `/banner-aditya.png`,
    siteLanguage: `en`,
    author: `@aditya_karnam`,
  },
  trailingSlash: `always`,
  plugins: [
    {
      resolve: `@lekoarts/gatsby-theme-minimal-blog`,
      options: {
        navigation: [
          {
            title: `AI Research`,
            slug: `/ai-research`,
          },
          {
            title: `AI Toolkit`,
            slug: `/ai-toolkit`,
          },
          {
            title: `Thoughts`,
            slug: `/blog`,
          },
          {
            title: `Systems`,
            slug: `/systems`,
          },
          {
            title: `Field Notes`,
            slug: `/field-notes`,
          },
          {
            title: `Quecto`,
            slug: `/quecto`,
          },
          {
            title: `Value Lab`,
            slug: `/value-lab`,
          },
          {
            title: `About`,
            slug: `/about`,
          },
        ],
        externalLinks: [
          {
            name: `LinkedIn`,
            url: `https://www.linkedin.com/in/adityakarnamgrao/`,
          },
          {
            name: `Twitter`,
            url: `https://twitter.com/aditya_karnam`,
          },
          {
            name: `GitHub`,
            url: `https://github.com/adityak74`,
          },
          {
            name: `Medium`,
            url: `https://medium.com/@adityakarnam`,
          },
          {
            name: `Google Scholar`,
            url: `https://scholar.google.com/citations?user=WujCeDkAAAAJ&hl=en`,
          },
          {
            name: `Call to Think`,
            url: `https://calltothink.com`,
          },
          {
            name: `Homepage`,
            url: `https://www.adityakarnam.com`,
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-sharp`,
      options: {},
    },
    {
      resolve: `gatsby-transformer-sharp`,
      options: {},
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: `/`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Aditya Karnam - World Model Infrastructure Lab`,
        short_name: `adityakarnam`,
        description: `World model infrastructure, agent runtimes, memory, retrieval, routing, and evaluation systems by Aditya Karnam.`,
        start_url: `/`,
        background_color: `#02090d`,
        display: `standalone`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
              linkImagesToOriginal: false,
              showCaptions: true,
              quality: 80,
              withWebp: true,
              loading: "lazy",
            },
          },
        ],
      },
    },
    // Only include statoscope when ANALYSE_BUNDLE is set (not in production)
    process.env.ANALYSE_BUNDLE && {
      resolve: `gatsby-plugin-webpack-statoscope`,
      options: {
        saveReportTo: `${__dirname}/public/.statoscope/_bundle.html`,
        saveStatsTo: `${__dirname}/public/.statoscope/_stats.json`,
        open: false,
      },
    },
    {
      resolve: `gatsby-plugin-cloudflare-pages`,
      options: {
        headers: {
          // Cloudflare Pages merges headers from every matching rule rather than letting a more
          // specific path override a less specific one, so a path-scoped override for /books/*
          // would combine with this DENY into an invalid "DENY, SAMEORIGIN" value (still blocked).
          // SAMEORIGIN site-wide still blocks cross-origin framing (clickjacking protection intact)
          // while allowing the /ai-systems-design-field-guide/ page to embed its own PDF.
          [`/*`]: [`X-Frame-Options: SAMEORIGIN`],
        },
      },
    },
  ].filter(Boolean) as Array<PluginRef>,
}

export default config

interface IPostTag {
  name: string
  slug: string
}

interface IPost {
  slug: string
  title: string
  defer: boolean
  date: string
  excerpt: string
  contentFilePath: string
  html: string
  timeToRead: number
  wordCount: number
  tags: Array<IPostTag>
  banner: any
  description: string
  canonicalUrl: string
}

interface IAllPost {
  nodes: Array<IPost>
}

interface ISiteMetadata {
  siteTitle: string
  siteTitleAlt: string
  siteHeadline: string
  siteUrl: string
  siteDescription: string
  siteImage: string
  author: string
}
