/** @jsx jsx */
import * as React from "react"
import { HeadFC } from "gatsby"
import { Box, Grid, Heading, Text, jsx } from "theme-ui"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import {
  ConsoleShell,
  HeroStat,
  SectionBlock,
  SignalPill,
  consoleColors,
} from "../components/world-model/pages-field-notes-about/primitives"

const PDF_URL = "/books/ai-systems-design-field-guide.pdf"

const AiSystemsDesignFieldGuidePage = () => {
  return (
    <Layout>
      <Box sx={{ display: `grid`, gap: [3, 4], my: [3, 4] }}>
        <ConsoleShell>
          <Grid sx={{ gridTemplateColumns: [`1fr`, `1fr`, `1.35fr 0.95fr`], gap: 3, alignItems: `start` }}>
            <Box>
              <SignalPill>Book</SignalPill>
              <Heading
                as="h1"
                sx={{
                  color: consoleColors.text,
                  fontSize: [5, 6, 7],
                  mt: 3,
                  mb: 3,
                  maxWidth: `16ch`,
                  lineHeight: 1.02,
                }}
              >
                AI Systems Design Field Guide
              </Heading>
              <Text sx={{ display: `block`, color: consoleColors.muted, fontSize: [2, 2, 3], maxWidth: `60ch`, mb: 3 }}>
                A field guide to model APIs, agent runtimes, MCP, A2A, and production engineering.
              </Text>
              <Text sx={{ display: `block`, color: consoleColors.soft, fontSize: [1, 2], maxWidth: `62ch` }}>
                Read it below, or open it in a new tab / download it if your browser can't render it inline.
              </Text>
              <Box sx={{ display: `flex`, gap: 3, flexWrap: `wrap`, mt: 3 }}>
                <a
                  href={PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: consoleColors.accent, fontFamily: `monospace`, textDecoration: `none` }}
                >
                  Open in new tab
                </a>
                <a
                  href={PDF_URL}
                  download
                  sx={{ color: consoleColors.accentAlt, fontFamily: `monospace`, textDecoration: `none` }}
                >
                  Download PDF
                </a>
              </Box>
            </Box>

            <Box sx={{ border: `1px solid ${consoleColors.border}`, borderRadius: 12, p: 3, bg: consoleColors.panelAlt }}>
              <Text sx={{ display: `block`, fontFamily: `monospace`, color: consoleColors.accent, fontSize: 0, mb: 2 }}>
                Coverage
              </Text>
              <Box as="pre" sx={{ m: 0, p: 0, bg: `transparent`, border: `none`, color: consoleColors.text, fontSize: 1 }}>
                <code>
                  {`model APIs
agent runtimes
MCP + A2A
production engineering`}
                </code>
              </Box>
            </Box>
          </Grid>

          <Grid sx={{ gridTemplateColumns: [`repeat(2, minmax(0, 1fr))`, `repeat(4, minmax(0, 1fr))`], gap: 3, mt: 4 }}>
            <HeroStat label="Pages" value="37" />
            <HeroStat label="Format" value="PDF" />
            <HeroStat label="Size" value="~300 KB" />
            <HeroStat label="Status" value="Read online" />
          </Grid>
        </ConsoleShell>

        <SectionBlock
          eyebrow="Read Online"
          title="AI Systems Design Field Guide"
          description="Embedded below via your browser's PDF viewer. If it doesn't render (common on some mobile browsers), use the links above to open or download it."
        >
          <Box
            sx={{
              border: `1px solid ${consoleColors.border}`,
              borderRadius: 12,
              overflow: `hidden`,
              bg: consoleColors.panelAlt,
            }}
          >
            <iframe
              src={PDF_URL}
              title="AI Systems Design Field Guide"
              sx={{
                display: `block`,
                width: `100%`,
                height: [`70vh`, `80vh`, `85vh`],
                border: `none`,
              }}
            />
          </Box>
        </SectionBlock>
      </Box>
    </Layout>
  )
}

export default AiSystemsDesignFieldGuidePage

export const Head: HeadFC = () => (
  <Seo
    title="AI Systems Design Field Guide | Aditya Karnam"
    description="A field guide to model APIs, agent runtimes, MCP, A2A, and production engineering — read online, free."
    pathname="/ai-systems-design-field-guide/"
  />
)
