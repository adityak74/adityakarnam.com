/** @jsx jsx */
import * as React from "react"
import { Box, Flex, Grid, Heading, Link as ThemeLink, Text, jsx } from "theme-ui"
import { Link } from "gatsby"
import { openSourceContributions, siteIdentity, systems, worldModelStack } from "./data"
import HeroChat from "./HeroChat"

const cardStyles = {
  border: "1px solid",
  borderColor: "divide",
  borderRadius: "10px",
  background: "#FFFFFF",
}

const sectionLabelStyles = {
  display: "inline-block",
  color: "secondary",
  fontFamily: "monospace",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  mb: 2,
}

const featuredSystems = systems.slice(0, 6)

const howIThinkLayers = worldModelStack.filter((layer) =>
  ["Agent Runtime", "State + Memory Layer", "Retrieval + Context Layer", "Model Routing + Local/Cloud Inference", "Observability + Evaluation"].includes(
    layer.name,
  ),
)

const HomepageConsole = () => {
  return (
    <Box sx={{ color: "text" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "16px",
          px: [4, 5, 5],
          py: [5, 5, 6],
          mb: [5, 6],
          background:
            "radial-gradient(circle at top left, rgba(212, 165, 116, 0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #faf9f7 100%)",
          border: "1px solid",
          borderColor: "divide",
          boxShadow: "0 4px 24px rgba(26,26,24,0.08)",
        }}
      >
        <Grid columns={[1, null, "1.45fr 0.85fr"]} gap={[5, 6]}>
          <Box>
            <Text sx={sectionLabelStyles}>{siteIdentity.labName}</Text>
            <Heading
              as="h1"
              sx={{
                fontFamily: "serif",
                fontSize: ["2.75rem", "3.75rem", "4.6rem"],
                lineHeight: 1.04,
                mb: 2,
                maxWidth: "11ch",
                fontWeight: 500,
              }}
            >
              {siteIdentity.tagline}
            </Heading>
            <Text sx={{ color: "secondary", fontSize: "17px", lineHeight: 1.65, maxWidth: "44rem", mb: 2 }}>
              I work on the systems layer behind next-generation AI agents: memory, retrieval, model routing,
              evaluation, local inference, and runtimes that help agents maintain state, simulate outcomes, and act
              reliably.
            </Text>
            <Text sx={{ color: "secondary", fontSize: "17px", lineHeight: 1.65, maxWidth: "42rem", mb: 3 }}>
              The future of AI is not just larger language models. It is infrastructure that lets models understand
              environments, reason across time, and interact with the world.
            </Text>
            <Flex sx={{ gap: 3, flexWrap: "wrap", alignItems: "center" }}>
              <Link
                to="/systems/"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "#ffffff",
                  bg: "primary",
                  px: 3,
                  py: 2,
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 500,
                  ":hover": {
                    bg: "#A8421F",
                  },
                }}
              >
                Explore Current Systems
              </Link>
              <Link
                to="/ai-research/"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "text",
                  border: "1px solid",
                  borderColor: "divide",
                  px: 3,
                  py: 2,
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 500,
                  ":hover": {
                    borderColor: "primary",
                    color: "primary",
                  },
                }}
              >
                Published Research
              </Link>
            </Flex>
          </Box>

          <Box sx={{ ...cardStyles, p: [3, 4], background: "#F2F0EC" }}>
            <Text sx={{ ...sectionLabelStyles, mb: 2 }}>Operating Loop</Text>
            <Text sx={{ color: "secondary", fontSize: "17px", lineHeight: 1.65, mb: 3 }}>
              {siteIdentity.supportingLine}
            </Text>
            <Grid columns={1} gap={2}>
              {siteIdentity.loop.map((step, index) => (
                <Box key={step} sx={{ borderTop: "1px solid", borderColor: "divide", pt: 2 }}>
                  <Text sx={{ color: "primary", fontFamily: "monospace", fontSize: 0, mb: 1 }}>
                    0{index + 1}
                  </Text>
                  <Text sx={{ color: "text", fontSize: 1 }}>{step}</Text>
                </Box>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Box>

      <Box sx={{ ...cardStyles, p: [4, 5], mb: [5, 6] }}>
        <Flex sx={{ justifyContent: "space-between", alignItems: "flex-end", gap: 3, flexWrap: "wrap", mb: 4 }}>
          <Box>
            <Text sx={sectionLabelStyles}>Proof</Text>
            <Text sx={{ color: "secondary", lineHeight: 1.65, maxWidth: "46rem", fontSize: "17px" }}>
              Six systems that show the work, not just describe it.
            </Text>
          </Box>
          <Link to="/systems/" sx={{ color: "primary", textDecoration: "none", fontFamily: "monospace", fontSize: 0 }}>
            View full index →
          </Link>
        </Flex>
        <Grid columns={[1, null, 3]} gap={3}>
          {featuredSystems.map((system) => {
            const primaryLink = system.links[0]
            const external = primaryLink.href.startsWith("http")
            return (
              <Box
                key={system.name}
                sx={{
                  border: "1px solid",
                  borderColor: "divide",
                  borderRadius: "10px",
                  p: 3,
                  background: "muted",
                }}
              >
                <Heading as="h3" sx={{ fontSize: "1.1rem", mb: 1, fontWeight: 500 }}>
                  {system.name}
                </Heading>
                <Text sx={{ color: "secondary", fontFamily: "monospace", fontSize: "11px", mb: 2 }}>
                  {system.tags.slice(0, 2).join(" · ")}
                </Text>
                <Text sx={{ color: "secondary", lineHeight: 1.55, fontSize: 1, mb: 2 }}>{system.whyItMatters}</Text>
                {external ? (
                  <ThemeLink
                    href={primaryLink.href}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: "primary", fontSize: 1 }}
                  >
                    {primaryLink.label} →
                  </ThemeLink>
                ) : (
                  <Link to={primaryLink.href} sx={{ color: "primary", textDecoration: "none", fontSize: 1 }}>
                    {primaryLink.label} →
                  </Link>
                )}
              </Box>
            )
          })}
        </Grid>
      </Box>

      <Box sx={{ ...cardStyles, p: [4, 5], mb: [5, 6] }}>
        <Text sx={sectionLabelStyles}>Contributed to Open Source</Text>
        <Text sx={{ color: "secondary", lineHeight: 1.65, maxWidth: "46rem", fontSize: "17px", mb: 3 }}>
          Fixes and improvements landed upstream in projects I use, not just my own.
        </Text>
        <Grid columns={[1]} gap={3}>
          {openSourceContributions.map((contribution) => (
            <Box
              key={contribution.prHref}
              sx={{
                border: "1px solid",
                borderColor: "divide",
                borderRadius: "10px",
                p: 3,
                background: "muted",
              }}
            >
              <Flex sx={{ justifyContent: "space-between", alignItems: "baseline", gap: 2, flexWrap: "wrap", mb: 1 }}>
                <Heading as="h3" sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
                  {contribution.project}
                </Heading>
                <Text sx={{ color: "secondary", fontFamily: "monospace", fontSize: "11px" }}>
                  {contribution.status}
                </Text>
              </Flex>
              <Text sx={{ color: "secondary", lineHeight: 1.55, fontSize: 1, mb: 2 }}>{contribution.summary}</Text>
              <Flex sx={{ gap: 3, flexWrap: "wrap" }}>
                <ThemeLink
                  href={contribution.prHref}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ color: "primary", fontSize: 1 }}
                >
                  {contribution.repo} · {contribution.prLabel} →
                </ThemeLink>
                {contribution.writeUpHref && (
                  <Link to={contribution.writeUpHref} sx={{ color: "primary", textDecoration: "none", fontSize: 1 }}>
                    Write-up →
                  </Link>
                )}
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>

      <Box sx={{ bg: "emphasisBg", color: "emphasisText", borderRadius: "10px", p: [4, 5], mb: [5, 6] }}>
        <Text sx={{ ...sectionLabelStyles, color: "#B8B2A0" }}>How I Think</Text>
        <Text sx={{ color: "#B8B2A0", lineHeight: 1.65, mb: 3, fontSize: "17px", maxWidth: "52rem" }}>
          AI agents need more than a foundation model — they need infrastructure for state, memory, retrieval, tool
          use, model routing, and evaluation, with interfaces and simulation loops layered on top as that foundation
          matures. My research explores that connective tissue between models and reliable action.
        </Text>
        <Grid columns={[1, null, 2]} gap={3}>
          {howIThinkLayers.map((layer, index) => (
            <Box
              key={layer.name}
              sx={{
                borderTop: "1px solid",
                borderColor: "rgba(237,232,221,0.16)",
                pt: 3,
              }}
            >
              <Text sx={{ color: "#E08A62", fontFamily: "monospace", fontSize: "11px", mb: 1 }}>
                Layer 0{index + 1}
              </Text>
              <Heading as="h3" sx={{ fontSize: "1.2rem", mb: 1, fontWeight: 500, color: "emphasisText" }}>
                {layer.name}
              </Heading>
              <Text sx={{ color: "#B8B2A0", lineHeight: 1.55, fontSize: 1 }}>{layer.description}</Text>
            </Box>
          ))}
        </Grid>
      </Box>

      <Box sx={{ ...cardStyles, p: [4, 5], mb: [5, 6], background: "#F7F4EE" }}>
        <Flex sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ maxWidth: "48rem" }}>
            <Text sx={sectionLabelStyles}>Latest Signal</Text>
            <Heading as="h2" sx={{ fontSize: ["1.5rem", "1.8rem"], fontWeight: 500, mb: 2 }}>
              Local LLM serving on Apple Silicon, evaluated instead of guessed
            </Heading>
            <Text sx={{ color: "secondary", lineHeight: 1.65, fontSize: "17px" }}>
              Ran the same workload set through Ollama, vLLM Metal, and SGLang on an Apple M5 Pro, with a warmed
              response-quality eval suite and Gemma 4 as a second judge — then a Qwen 3.5 sweep from 0.8B to 9B.
            </Text>
          </Box>
          <Link
            to="/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon/"
            sx={{ color: "primary", textDecoration: "none", fontFamily: "monospace", fontSize: 0, whiteSpace: "nowrap" }}
          >
            Open eval note →
          </Link>
        </Flex>
      </Box>

      <HeroChat />

      <Box
        sx={{
          display: "grid",
          gap: 1,
          justifyItems: "center",
          mx: "auto",
          mt: [4, 5],
          maxWidth: "36rem",
          px: 3,
          textAlign: "center",
        }}
      >
        <Text
          as="p"
          lang="sa"
          sx={{
            color: "secondary",
            fontSize: 1,
            letterSpacing: "0.01em",
            mb: 0,
          }}
        >
          रूपं देहि जयं देहि यशो देहि द्विषो जहि॥
        </Text>
        <Text
          as="p"
          sx={{
            color: "secondary",
            fontSize: "12px",
            fontStyle: "italic",
            opacity: 0.75,
            mb: 0,
          }}
        >
          May I be granted excellence, victory, worthy recognition, and freedom from hostility.
        </Text>
      </Box>
    </Box>
  )
}

export default HomepageConsole
