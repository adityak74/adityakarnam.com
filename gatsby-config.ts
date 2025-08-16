import type { GatsbyConfig, PluginRef } from "gatsby"
import "dotenv/config"

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE

const config: GatsbyConfig = {
  siteMetadata: {
    // You can overwrite values here that are used for the SEO component
    // You can also add new values here to query them like usual
    // See all options: https://github.com/LekoArts/gatsby-themes/blob/main/themes/gatsby-theme-minimal-blog/gatsby-config.mjs
    siteTitle: `Aditya Karnam`,
    siteTitleAlt: `Aditya Karnam - AI Researcher | LLM Expert | Software Engineer | Python & Rust`,
    siteHeadline: `Personal blog of Aditya Karnam - a software engineer, writer, and creator.`,
    siteUrl: `https://adityakarnam.com`,
    siteDescription: `Software engineer Aditya Karnam shares expert insights on Python, PostgreSQL database sharding, system design, and software development best practices. Learn from real-world experience.`,
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
            title: `Spotlight`,
            slug: `/spotlight`,
          },
        ],
        externalLinks: [
          {
            name: `Dzone`,
            url: `https://dzone.com/users/5236541/adityakarnam.html`,
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
            name: `Google Scholar`,
            url: `https://scholar.google.com/citations?user=WujCeDkAAAAJ&hl=en`,
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
        name: `Aditya Karnam - Personal Blog`,
        short_name: `adityakarnam-blog`,
        description: `Personal blog of Aditya Karnam - a software engineer, writer, and creator.`,
        start_url: `/`,
        background_color: `#fff`,
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
