/** @jsx jsx */
import * as React from "react"
import { Box, Flex, Grid, Heading, Link as ThemeLink, Text, jsx } from "theme-ui"
import { Link } from "gatsby"
import ResearchLensPanel from "./ResearchLensPanel"
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

const cardStyles = {
  border: "1px solid rgba(111, 255, 233, 0.14)",
  borderRadius: "22px",
  background: "rgba(5, 17, 23, 0.8)",
  boxShadow: "0 24px 70px rgba(0, 0, 0, 0.24)",
}

const sectionLabelStyles = {
  display: "inline-block",
  color: "accent",
  fontFamily: "monospace",
  fontSize: 1,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  mb: 3,
}

const HomepageConsole = () => {
  return (
    <Box sx={{ color: "text" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "28px",
          px: [3, 4, 5],
          py: [4, 5, 6],
          mb: [5, 6],
          background:
            "radial-gradient(circle at top left, rgba(111, 255, 233, 0.16), transparent 32%), linear-gradient(180deg, rgba(5, 18, 24, 0.98) 0%, rgba(3, 11, 16, 0.98) 100%)",
          border: "1px solid rgba(111, 255, 233, 0.16)",
          boxShadow: "0 30px 120px rgba(0, 0, 0, 0.32)",
          "::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(111, 255, 233, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(111, 255, 233, 0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.26,
            pointerEvents: "none",
          },
        }}
      >
        <Grid columns={[1, null, "1.5fr 0.9fr"]} gap={[4, 5]}>
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Text sx={sectionLabelStyles}>{siteIdentity.labName}</Text>
            <Heading as="h1" sx={{ fontSize: ["2.4rem", "3.3rem", "4.6rem"], lineHeight: 1.02, mb: 3, maxWidth: "11ch" }}>
              {siteIdentity.tagline}
            </Heading>
            <Text sx={{ color: "secondary", fontSize: [2, 3], lineHeight: 1.75, maxWidth: "46rem", mb: 3 }}>
              I work on the systems layer behind next-generation AI agents: memory, retrieval, model routing, evaluation,
              local inference, and runtimes that help agents maintain state, simulate outcomes, and act reliably.
            </Text>
            <Text sx={{ color: "secondary", fontSize: [1, 2], lineHeight: 1.75, maxWidth: "44rem", mb: 4 }}>
              The future of AI is not just larger language models. It is infrastructure that lets models understand
              environments, reason across time, and interact with the world.
            </Text>
            <Flex sx={{ gap: 3, flexWrap: "wrap", alignItems: "center" }}>
              <Link
                to="/systems/"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  color: "#07171d",
                  bg: "accent",
                  px: 3,
                  py: 2,
                  borderRadius: "999px",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Explore Current Systems
              </Link>
              <Link
                to="/ask/"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  color: "heading",
                  border: "1px solid rgba(111, 255, 233, 0.18)",
                  px: 3,
                  py: 2,
                  borderRadius: "999px",
                  textDecoration: "none",
                }}
              >
                Ask My Work
              </Link>
            </Flex>
          </Box>

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ ...cardStyles, p: 3, mb: 3 }}>
              <Text sx={{ ...sectionLabelStyles, mb: 2 }}>Boot Sequence</Text>
              {heroBootSequence.map((line) => (
                <Text key={line} sx={{ fontFamily: "monospace", color: "secondary", fontSize: 1, mb: 2 }}>
                  {line}
                </Text>
              ))}
            </Box>
            <Box sx={{ ...cardStyles, p: 3 }}>
              <Text sx={{ ...sectionLabelStyles, mb: 2 }}>Observe → Model → Simulate → Act</Text>
              <Text sx={{ color: "secondary", lineHeight: 1.75, fontSize: [1, 2], mb: 3 }}>
                The recurring framework behind the site: observe the environment, model current state, simulate options,
                act through tools, evaluate the result, and update memory.
              </Text>
              <Grid columns={2} gap={2}>
                {siteIdentity.loop.map((step, index) => (
                  <Box
                    key={step}
                    sx={{
                      border: "1px solid rgba(111, 255, 233, 0.1)",
                      borderRadius: "16px",
                      p: 2,
                      background: "rgba(9, 26, 32, 0.72)",
                    }}
                  >
                    <Text sx={{ display: "block", color: "accent", fontFamily: "monospace", fontSize: 0, mb: 1 }}>
                      0{index + 1}
                    </Text>
                    <Text sx={{ color: "heading", fontSize: 1 }}>{step}</Text>
                  </Box>
                ))}
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Box>

      <Grid columns={[1, null, "1.15fr 0.85fr"]} gap={[4, 5]} sx={{ mb: [5, 6] }}>
        <Box sx={{ ...cardStyles, p: [3, 4] }}>
          <Text sx={sectionLabelStyles}>The World Model Infrastructure Stack</Text>
          <Text sx={{ color: "secondary", lineHeight: 1.8, mb: 4 }}>
            World-model-driven AI needs more than a foundation model. It needs infrastructure for state, memory,
            retrieval, simulation, tool use, model routing, and evaluation. My work explores that connective tissue
            between models and reliable action.
          </Text>
          <Grid columns={1} gap={3}>
            {worldModelStack.map((layer, index) => (
              <Box
                key={layer.name}
                sx={{
                  border: "1px solid rgba(111, 255, 233, 0.1)",
                  borderRadius: "18px",
                  p: 3,
                  background: "rgba(8, 22, 29, 0.78)",
                }}
              >
                <Text sx={{ color: "accent", fontFamily: "monospace", fontSize: 0, mb: 1 }}>
                  LAYER 0{index + 1}
                </Text>
                <Heading as="h3" sx={{ fontSize: [2, 3], mb: 2 }}>
                  {layer.name}
                </Heading>
                <Text sx={{ color: "secondary", lineHeight: 1.75, mb: 2 }}>{layer.description}</Text>
                <Text sx={{ color: "heading", fontSize: 1 }}>
                  Relevant work: {layer.relevantWork.join(" · ")}
                </Text>
              </Box>
            ))}
          </Grid>
        </Box>

        <Box>
          <ResearchLensPanel />
          <Box sx={{ ...cardStyles, p: [3, 4], mt: 4 }}>
            <Text sx={sectionLabelStyles}>Research Agenda</Text>
            <Grid columns={1} gap={3}>
              {researchAgenda.map((track, index) => (
                <Box key={track.title} sx={{ borderTop: index === 0 ? "none" : "1px solid rgba(111, 255, 233, 0.1)", pt: index === 0 ? 0 : 3 }}>
                  <Heading as="h3" sx={{ fontSize: [2, 3], mb: 2 }}>
                    {track.title}
                  </Heading>
                  <Text sx={{ color: "secondary", lineHeight: 1.75 }}>{track.question}</Text>
                </Box>
              ))}
            </Grid>
          </Box>
        </Box>
      </Grid>

      <Box sx={{ ...cardStyles, p: [3, 4], mb: [5, 6] }}>
        <Flex sx={{ justifyContent: "space-between", alignItems: "flex-end", gap: 3, flexWrap: "wrap", mb: 4 }}>
          <Box>
            <Text sx={sectionLabelStyles}>Current Systems</Text>
            <Text sx={{ color: "secondary", lineHeight: 1.8, maxWidth: "46rem" }}>
              Projects are framed here as research artifacts: each one explores a concrete question in the world-model
              stack and makes the systems layer more legible.
            </Text>
          </Box>
          <Link to="/systems/" sx={{ color: "accent", textDecoration: "none", fontFamily: "monospace" }}>
            View full system index
          </Link>
        </Flex>
        <Grid columns={[1, null, 2]} gap={4}>
          {systems.map((system) => (
            <Box
              key={system.name}
              sx={{
                border: "1px solid rgba(111, 255, 233, 0.12)",
                borderRadius: "20px",
                p: 3,
                background: "rgba(8, 22, 29, 0.72)",
              }}
            >
              <Heading as="h3" sx={{ fontSize: [2, 3], mb: 2 }}>
                {system.name}
              </Heading>
              <Text sx={{ color: "accent", fontFamily: "monospace", fontSize: 0, mb: 2 }}>
                {system.tags.join(" · ")}
              </Text>
              <Text sx={{ color: "heading", fontSize: 1, mb: 1 }}>Research Question</Text>
              <Text sx={{ color: "secondary", lineHeight: 1.75, mb: 2 }}>{system.researchQuestion}</Text>
              <Text sx={{ color: "heading", fontSize: 1, mb: 1 }}>System Built</Text>
              <Text sx={{ color: "secondary", lineHeight: 1.75, mb: 2 }}>{system.systemBuilt}</Text>
              <Text sx={{ color: "heading", fontSize: 1, mb: 1 }}>Why It Matters</Text>
              <Text sx={{ color: "secondary", lineHeight: 1.75, mb: 3 }}>{system.whyItMatters}</Text>
              <Text sx={{ color: "heading", fontSize: 1, mb: 2 }}>Status: {system.status}</Text>
              <Flex sx={{ gap: 3, flexWrap: "wrap" }}>
                {system.links.map((link) => {
                  const external = link.href.startsWith("http")
                  return external ? (
                    <ThemeLink key={link.label} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </ThemeLink>
                  ) : (
                    <Link key={link.label} to={link.href} sx={{ color: "accent", textDecoration: "none" }}>
                      {link.label}
                    </Link>
                  )
                })}
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>

      <Grid columns={[1, null, "0.95fr 1.05fr"]} gap={[4, 5]} sx={{ mb: [5, 6] }}>
        <Box sx={{ ...cardStyles, p: [3, 4] }}>
          <Text sx={sectionLabelStyles}>Field Notes</Text>
          <Text sx={{ color: "secondary", lineHeight: 1.8, mb: 4 }}>
            Essays and system notes that reinforce the thesis: AI is moving from chat interfaces toward stateful,
            operational systems that need better infrastructure.
          </Text>
          <Grid columns={1} gap={3}>
            {fieldNotes.map((note) => (
              <Box key={note.title} sx={{ border: "1px solid rgba(111, 255, 233, 0.1)", borderRadius: "18px", p: 3 }}>
                <Text sx={{ color: "accent", fontFamily: "monospace", fontSize: 0, mb: 1 }}>{note.status}</Text>
                {note.href ? (
                  <Link to={note.href} sx={{ color: "heading", textDecoration: "none", fontSize: 3, fontWeight: 600 }}>
                    {note.title}
                  </Link>
                ) : (
                  <Text sx={{ color: "heading", fontSize: 3, fontWeight: 600 }}>{note.title}</Text>
                )}
                <Text sx={{ color: "secondary", lineHeight: 1.75, mt: 2 }}>{note.thesis}</Text>
              </Box>
            ))}
          </Grid>
        </Box>

        <Box>
          <Box sx={{ ...cardStyles, p: [3, 4], mb: 4 }}>
            <Text sx={sectionLabelStyles}>Operating Principles</Text>
            <Grid columns={1} gap={2}>
              {operatingPrinciples.map((principle) => (
                <Text key={principle} sx={{ color: "secondary", lineHeight: 1.75 }}>
                  {principle}
                </Text>
              ))}
            </Grid>
          </Box>
          <Box sx={{ ...cardStyles, p: [3, 4] }}>
            <Text sx={sectionLabelStyles}>Open Research Channel</Text>
            <Text sx={{ color: "secondary", lineHeight: 1.8, mb: 3 }}>
              Current threads I am actively pushing forward across the world-model stack.
            </Text>
            <Grid columns={1} gap={3}>
              {currentInvestigations.map((item) => (
                <Box key={item.label} sx={{ border: "1px solid rgba(111, 255, 233, 0.1)", borderRadius: "18px", p: 3 }}>
                  <Text sx={{ color: "heading", fontSize: 2, mb: 1 }}>{item.label}</Text>
                  <Text sx={{ color: "secondary", lineHeight: 1.75 }}>{item.detail}</Text>
                </Box>
              ))}
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Box>
  )
}

export default HomepageConsole
