/** @jsx jsx */
import * as React from "react"
import { Box, Flex, Grid, Heading, Link as ThemeLink, Text, jsx } from "theme-ui"
import { Link } from "gatsby"
import {
  currentInvestigations,
  fieldNotes,
  heroBootSequence,
  operatingPrinciples,
  researchAgenda,
  siteIdentity,
  systems,
  worldModelStack,
} from "./data"
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
                <Box key={step} sx={{ borderTop: index === 0 ? "1px solid" : "1px solid", borderColor: "divide", pt: 2 }}>
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

      <HeroChat />

      <Grid columns={[1, null, "1.1fr 0.9fr"]} gap={[5, 6]} sx={{ mb: [5, 6] }}>
        <Box sx={{ bg: "emphasisBg", color: "emphasisText", borderRadius: "10px", p: [4, 5] }}>
          <Text sx={{ ...sectionLabelStyles, color: "#B8B2A0" }}>The Systems Layer</Text>
          <Text sx={{ color: "#B8B2A0", lineHeight: 1.65, mb: 3, fontSize: "17px" }}>
            AI agents need more than a foundation model. They need infrastructure for state, memory, retrieval,
            simulation, tool use, model routing, and evaluation. My research explores that connective tissue
            between models and reliable action.
          </Text>
          <Grid columns={1} gap={3}>
            {worldModelStack.map((layer, index) => (
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
                <Heading as="h3" sx={{ fontSize: ["1.35rem", "1.55rem"], mb: 2, fontWeight: 500, color: "emphasisText" }}>
                  {layer.name}
                </Heading>
                <Text sx={{ color: "#B8B2A0", lineHeight: 1.65, mb: 2, fontSize: "17px" }}>{layer.description}</Text>
                <Text sx={{ color: "#B8B2A0", fontSize: "14px" }}>Relevant work: {layer.relevantWork.join(" · ")}</Text>
              </Box>
            ))}
          </Grid>
        </Box>

        <Box>
          <Box sx={{ ...cardStyles, p: [4, 5] }}>
            <Text sx={sectionLabelStyles}>Research Agenda</Text>
            <Grid columns={1} gap={3}>
              {researchAgenda.map((track, index) => (
                <Box key={track.title} sx={{ borderTop: "1px solid", borderColor: "divide", pt: index === 0 ? 3 : 3 }}>
                  <Heading as="h3" sx={{ fontSize: ["1.35rem", "1.55rem"], mb: 2, fontWeight: 500 }}>
                    {track.title}
                  </Heading>
                  <Text sx={{ color: "secondary", lineHeight: 1.65, fontSize: "17px" }}>{track.question}</Text>
                </Box>
              ))}
            </Grid>
          </Box>
        </Box>
      </Grid>

      <Box sx={{ ...cardStyles, p: [4, 5], mb: [5, 6] }}>
        <Flex sx={{ justifyContent: "space-between", alignItems: "flex-end", gap: 3, flexWrap: "wrap", mb: 4 }}>
          <Box>
            <Text sx={sectionLabelStyles}>Current Systems</Text>
            <Text sx={{ color: "secondary", lineHeight: 1.65, maxWidth: "46rem", fontSize: "17px" }}>
              Projects are framed here as research artifacts: each one explores a concrete question in the systems
              layer around AI agents.
            </Text>
          </Box>
          <Link to="/systems/" sx={{ color: "primary", textDecoration: "none", fontFamily: "monospace", fontSize: 0 }}>
            View full system index
          </Link>
        </Flex>
        <Grid columns={[1, null, 2]} gap={4}>
          {systems.map((system) => (
            <Box
              key={system.name}
              sx={{
                border: "1px solid",
                borderColor: "divide",
                borderRadius: "12px",
                p: 4,
                background: "muted",
              }}
            >
              <Heading as="h3" sx={{ fontSize: ["1.35rem", "1.65rem"], mb: 2, fontWeight: 500 }}>
                {system.name}
              </Heading>
              <Text sx={{ color: "secondary", fontFamily: "monospace", fontSize: 0, mb: 2 }}>
                {system.tags.join(" · ")}
              </Text>
              <Box sx={{ display: "grid", gap: 3, mb: 3 }}>
                <Box>
                  <Text as="div" sx={{ color: "text", fontSize: 1, fontWeight: 500, mb: 1 }}>
                    Research Question
                  </Text>
                  <Text as="div" sx={{ color: "secondary", lineHeight: 1.65, fontSize: "17px" }}>
                    {system.researchQuestion}
                  </Text>
                </Box>
                <Box>
                  <Text as="div" sx={{ color: "text", fontSize: 1, fontWeight: 500, mb: 1 }}>
                    System Built
                  </Text>
                  <Text as="div" sx={{ color: "secondary", lineHeight: 1.65, fontSize: "17px" }}>
                    {system.systemBuilt}
                  </Text>
                </Box>
                <Box>
                  <Text as="div" sx={{ color: "text", fontSize: 1, fontWeight: 500, mb: 1 }}>
                    Why It Matters
                  </Text>
                  <Text as="div" sx={{ color: "secondary", lineHeight: 1.65, fontSize: "17px" }}>
                    {system.whyItMatters}
                  </Text>
                </Box>
                <Box>
                  <Text as="div" sx={{ color: "text", fontSize: 1, fontWeight: 500, mb: 1 }}>
                    Status
                  </Text>
                  <Text as="div" sx={{ color: "secondary", lineHeight: 1.65, fontSize: "17px" }}>
                    {system.status}
                  </Text>
                </Box>
              </Box>
              <Flex sx={{ gap: 3, flexWrap: "wrap" }}>
                {system.links.map((link) => {
                  const external = link.href.startsWith("http")
                  return external ? (
                    <ThemeLink key={link.label} href={link.href} target="_blank" rel="noreferrer" sx={{ color: "primary" }}>
                      {link.label}
                    </ThemeLink>
                  ) : (
                    <Link key={link.label} to={link.href} sx={{ color: "primary", textDecoration: "none" }}>
                      {link.label}
                    </Link>
                  )
                })}
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>

      <Box sx={{ ...cardStyles, p: [4, 5], mb: [5, 6], background: "#F7F4EE" }}>
        <Flex sx={{ justifyContent: "space-between", alignItems: "flex-end", gap: 3, flexWrap: "wrap", mb: 4 }}>
          <Box>
            <Text sx={sectionLabelStyles}>New Eval</Text>
            <Heading as="h2" sx={{ fontSize: ["1.8rem", "2.2rem"], fontWeight: 500, mb: 2 }}>
              Local LLM serving on Apple Silicon, evaluated instead of guessed
            </Heading>
            <Text sx={{ color: "secondary", lineHeight: 1.65, maxWidth: "48rem", fontSize: "17px" }}>
              I ran the same workload set through Ollama, vLLM Metal, and SGLang on an Apple M5 Pro MacBook Pro,
              added a warmed response-quality eval suite, used Gemma 4 as a second quality judge, and then followed
              up with a Qwen 3.5 model sweep from 0.8B to 9B on Ollama.
            </Text>
          </Box>
          <Link
            to="/benchmarking-local-llms-ollama-vllm-sglang-apple-silicon/"
            sx={{ color: "primary", textDecoration: "none", fontFamily: "monospace", fontSize: 0 }}
          >
            Open eval note
          </Link>
        </Flex>

        <Grid columns={[1, null, 4]} gap={3} sx={{ mb: 4 }}>
          <Box sx={{ border: "1px solid", borderColor: "divide", borderRadius: "12px", p: 3, bg: "#FFFFFF" }}>
            <Text sx={{ color: "primary", fontFamily: "monospace", fontSize: 0, mb: 1 }}>Model sweep</Text>
            <Text sx={{ color: "text", fontSize: 2, fontWeight: 500 }}>Qwen 3.5 2B</Text>
            <Text sx={{ color: "secondary", fontSize: 1, mt: 1 }}>Best balance point in the Ollama-only follow-up sweep.</Text>
          </Box>
          <Box sx={{ border: "1px solid", borderColor: "divide", borderRadius: "12px", p: 3, bg: "#FFFFFF" }}>
            <Text sx={{ color: "primary", fontFamily: "monospace", fontSize: 0, mb: 1 }}>Structured JSON</Text>
            <Text sx={{ color: "text", fontSize: 2, fontWeight: 500 }}>vLLM</Text>
            <Text sx={{ color: "secondary", fontSize: 1, mt: 1 }}>Only non-Ollama runtime that fully passed the JSON eval.</Text>
          </Box>
          <Box sx={{ border: "1px solid", borderColor: "divide", borderRadius: "12px", p: 3, bg: "#FFFFFF" }}>
            <Text sx={{ color: "primary", fontFamily: "monospace", fontSize: 0, mb: 1 }}>Judge winner</Text>
            <Text sx={{ color: "text", fontSize: 2, fontWeight: 500 }}>Ollama + Gemma 4</Text>
            <Text sx={{ color: "secondary", fontSize: 1, mt: 1 }}>Won all 6 quality comparisons for visible answers.</Text>
          </Box>
          <Box sx={{ border: "1px solid", borderColor: "divide", borderRadius: "12px", p: 3, bg: "#FFFFFF" }}>
            <Text sx={{ color: "primary", fontFamily: "monospace", fontSize: 0, mb: 1 }}>Key failure mode</Text>
            <Text sx={{ color: "text", fontSize: 2, fontWeight: 500 }}>Metal memory pressure</Text>
            <Text sx={{ color: "secondary", fontSize: 1, mt: 1 }}>vLLM crashed when co-resident with SGLang.</Text>
          </Box>
        </Grid>

        <Text sx={{ color: "secondary", lineHeight: 1.65, fontSize: "17px", maxWidth: "52rem" }}>
          The useful part of the eval was not just the chart. It exposed the runtime-specific details that decide
          whether a local stack is actually practical: memory contention, answer formatting behavior, and how much
          configuration it takes to get stable outputs on Apple Silicon.
        </Text>
      </Box>

      <Grid columns={[1, null, "0.95fr 1.05fr"]} gap={[5, 6]} sx={{ mb: [5, 6] }}>
        <Box sx={{ ...cardStyles, p: [4, 5] }}>
          <Text sx={sectionLabelStyles}>Field Notes</Text>
          <Text sx={{ color: "secondary", lineHeight: 1.65, mb: 4, fontSize: "17px" }}>
            Essays and system notes that reinforce the thesis: AI is moving from chat interfaces toward stateful,
            operational systems that need better infrastructure.
          </Text>
          <Grid columns={1} gap={3}>
            {fieldNotes.map((note) => (
              <Box key={note.title} sx={{ borderTop: "1px solid", borderColor: "divide", pt: 3 }}>
                <Text sx={{ color: "primary", fontFamily: "monospace", fontSize: 0, mb: 1 }}>{note.status}</Text>
                {note.href ? (
                  <Link to={note.href} sx={{ color: "text", textDecoration: "none", fontSize: 3, fontWeight: 500 }}>
                    {note.title}
                  </Link>
                ) : (
                  <Text sx={{ color: "text", fontSize: 3, fontWeight: 500 }}>{note.title}</Text>
                )}
                <Text sx={{ color: "secondary", lineHeight: 1.65, mt: 2, fontSize: "17px" }}>{note.thesis}</Text>
              </Box>
            ))}
          </Grid>

          <Box sx={{ borderTop: "1px solid", borderColor: "divide", mt: 4, pt: 3 }}>
            <Text sx={{ color: "primary", fontFamily: "monospace", fontSize: 0, mb: 1 }}>Also Writing</Text>
            <ThemeLink
              href="https://calltothink.com"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "text", textDecoration: "none", fontSize: 3, fontWeight: 500 }}
            >
              Call to Think ↗
            </ThemeLink>
            <Text sx={{ color: "secondary", lineHeight: 1.65, mt: 2, fontSize: "17px" }}>
              A separate essay practice on technology, AI, and society — longer arguments about how these systems
              change the way we think, written slowly on purpose.
            </Text>
          </Box>
        </Box>

        <Box>
          <Box sx={{ ...cardStyles, p: [4, 5], mb: 4 }}>
            <Text sx={sectionLabelStyles}>Operating Principles</Text>
            <Grid columns={1} gap={2}>
              {operatingPrinciples.map((principle) => (
                <Text key={principle} sx={{ color: "secondary", lineHeight: 1.65, fontSize: "17px" }}>
                  {principle}
                </Text>
              ))}
            </Grid>
          </Box>
          <Box sx={{ ...cardStyles, p: [4, 5] }}>
            <Text sx={sectionLabelStyles}>Open Research Channel</Text>
            <Text sx={{ color: "secondary", lineHeight: 1.65, mb: 3, fontSize: "17px" }}>
              Current threads I am actively pushing forward in agent infrastructure research.
            </Text>
            <Grid columns={1} gap={3}>
              {currentInvestigations.map((item) => (
                <Box key={item.label} sx={{ borderTop: "1px solid", borderColor: "divide", pt: 3 }}>
                  <Text sx={{ color: "text", fontSize: 2, mb: 1, fontWeight: 500 }}>{item.label}</Text>
                  <Text sx={{ color: "secondary", lineHeight: 1.65, fontSize: "17px" }}>{item.detail}</Text>
                </Box>
              ))}
            </Grid>
          </Box>
        </Box>
      </Grid>

      <Box sx={{ ...cardStyles, p: [4, 5], background: "muted" }}>
        <Text sx={sectionLabelStyles}>System Boot Notes</Text>
        <Grid columns={[1, null, 2]} gap={3}>
          {heroBootSequence.map((line, index) => (
            <Text
              key={line}
              sx={{
                fontFamily: "monospace",
                color: "secondary",
                fontSize: 0,
                opacity: 0,
                transform: "translateY(4px)",
                animation: "bootNoteReveal 480ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
                animationDelay: `${index * 140}ms`,
                "@keyframes bootNoteReveal": {
                  "0%": {
                    opacity: 0,
                    transform: "translateY(4px)",
                  },
                  "100%": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                  opacity: 1,
                  transform: "none",
                },
              }}
            >
              {line}
            </Text>
          ))}
        </Grid>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          justifyItems: "center",
          mx: "auto",
          mt: [5, 6],
          maxWidth: "42rem",
          px: 3,
          textAlign: "center",
        }}
      >
        <Text
          as="p"
          lang="sa"
          sx={{
            color: "text",
            fontSize: ["1.35rem", "1.55rem"],
            letterSpacing: "0.01em",
            lineHeight: 1.7,
            mb: 0,
          }}
        >
          रूपं देहि जयं देहि यशो देहि द्विषो जहि॥
        </Text>
        <Text
          as="p"
          sx={{
            color: "secondary",
            fontSize: 1,
            fontStyle: "italic",
            letterSpacing: "0.03em",
            mb: 0,
          }}
        >
          Rūpaṁ dehi, jayaṁ dehi, yaśo dehi, dviṣo jahi.
        </Text>
        <Text
          as="p"
          sx={{
            color: "secondary",
            fontSize: 1,
            lineHeight: 1.7,
            maxWidth: "32rem",
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
