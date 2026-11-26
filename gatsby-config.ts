import type { GatsbyConfig, PluginRef } from "gatsby"
import "dotenv/config"

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE

const config: GatsbyConfig = {
  siteMetadata: {
    // You can overwrite values here that are used for the SEO component
    // You can also add new values here to query them like usual
    // See all options: https://github.com/LekoArts/gatsby-themes/blob/main/themes/gatsby-theme-minimal-blog/gatsby-config.mjs
    siteTitle: `Aditya Karnam`,
    siteTitleAlt: `Aditya Karnam — AI Research Engineer`,
    siteHeadline: `Aditya Karnam is an AI research engineer working across the AI stack, from hardware and inference to agents, evals and software factories.`,
    siteUrl: `https://adityakarnam.com`,
    siteDescription: `Aditya Karnam is an AI research engineer working on inference performance, model distillation, agent systems, retrieval and memory, and evaluation.`,
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
            title: `Research`,
            slug: `/ai-research`,
          },
          {
            title: `Writing`,
            slug: `/blog`,
          },
          {
            title: `Systems`,
            slug: `/systems`,
          },
          {
            title: `Live`,
            slug: `/live`,
          },
          {
            title: `Course`,
            slug: `/course`,
          },
          {
            title: `About`,
            slug: `/about`,
          },
        ],
        externalLinks: [
          {
            name: `Resume`,
            url: `/resume.pdf`,
          },
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
        name: `Aditya Karnam - AI Research Engineer`,
        short_name: `adityakarnam`,
        description: `AI research and engineering across hardware, inference, models, agents and evals, by Aditya Karnam.`,
        start_url: `/`,
        background_color: `#FAF9F6`,
        theme_color: `#FAF9F6`,
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
