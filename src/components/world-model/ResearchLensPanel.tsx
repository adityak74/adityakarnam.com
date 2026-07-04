import * as React from "react"
import { Box, Button, Flex, Text } from "theme-ui"
import { lensFallbacks, lensOptions } from "./data"

const ResearchLensPanel = () => {
  const [activeLens, setActiveLens] = React.useState(lensOptions[0])
  const [response, setResponse] = React.useState(lensFallbacks[lensOptions[0]])
  const [loading, setLoading] = React.useState(false)

  const updateLens = React.useCallback(async (lens: string) => {
    setActiveLens(lens)
    setLoading(true)

    try {
      const result = await fetch("/api/research-lens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lens }),
      })

      if (!result.ok) {
        throw new Error("Lens request failed")
      }

      const data = await result.json()
      setResponse(data.text || lensFallbacks[lens] || lensFallbacks[lensOptions[0]])
    } catch (_error) {
      setResponse(lensFallbacks[lens] || lensFallbacks[lensOptions[0]])
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divide",
        borderRadius: "16px",
        p: [3, 4],
        background: "#FFFFFF",
        boxShadow: "0 1px 2px rgba(26,26,24,0.06)",
      }}
    >
      <Text sx={{ display: "block", color: "primary", fontFamily: "monospace", fontSize: 0, mb: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Explore My Work Through Your Lens
      </Text>
      <Flex sx={{ gap: 2, flexWrap: "wrap", mb: 3 }}>
        {lensOptions.map((lens) => (
          <Button
            key={lens}
            onClick={() => void updateLens(lens)}
            sx={{
              border: "1px solid",
              borderColor: lens === activeLens ? "primary" : "divide",
              backgroundColor: lens === activeLens ? "primary" : "transparent",
              color: lens === activeLens ? "#ffffff" : "secondary",
              px: 3,
              py: 2,
              borderRadius: "999px",
              fontSize: 1,
              fontFamily: "body",
              fontWeight: 400,
              cursor: "pointer",
              boxShadow: "none",
              ":hover": {
                backgroundColor: lens === activeLens ? "#A8421F" : "muted",
              },
            }}
          >
            {lens}
          </Button>
        ))}
      </Flex>
      <Text sx={{ color: "secondary", fontSize: "17px", lineHeight: 1.65 }}>
        {loading ? "Calibrating research profile..." : response}
      </Text>
    </Box>
  )
}

export default ResearchLensPanel
