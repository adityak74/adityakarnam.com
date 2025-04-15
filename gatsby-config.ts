import type { GatsbyConfig, PluginRef } from "gatsby"
import "dotenv/config"

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE

const config: GatsbyConfig = {
  siteMetadata: {
    // You can overwrite values here that are used for the SEO component
    // You can also add new values here to query them like usual
    // See all options: https://github.com/LekoArts/gatsby-themes/blob/main/themes/gatsby-theme-minimal-blog/gatsby-config.mjs
    siteTitle: `Aditya Karnam`,
    siteTitleAlt: `Aditya Karnam - Personal Blog`,
    siteHeadline: `Personal blog of Aditya Karnam - a software engineer, writer, and creator.`,
    siteUrl: `https://adityakarnam.com`,
    siteDescription: `Personal blog of Aditya Karnam - a software engineer, writer, and creator.`,
    siteImage: `/banner-aditya.png`,
    siteLanguage: `en`,
    author: `@aditya_karnam`,
  },
  trailingSlash: `always`,
  plugins: [
    {
      resolve: `@lekoarts/gatsby-theme-minimal-blog`,
      // See the theme's README for all available options
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
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#6B46C1`,
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
    // You can remove this plugin if you don't need it
    shouldAnalyseBundle && {
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
