import * as React from "react"
import { Box, Button, Flex, Text } from "theme-ui"
import { lensFallbacks, lensOptions } from "./data"

const buttonStyles = {
  border: "1px solid",
  borderColor: "rgba(111, 255, 233, 0.18)",
  bg: "rgba(4, 19, 24, 0.78)",
  color: "heading",
  px: 3,
  py: 2,
  borderRadius: "999px",
  fontSize: 1,
  fontFamily: "monospace",
  cursor: "pointer",
  transition: "all 0.2s ease",
}

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
        border: "1px solid rgba(111, 255, 233, 0.16)",
        borderRadius: "24px",
        p: [3, 4],
        background:
          "linear-gradient(180deg, rgba(7, 24, 29, 0.92) 0%, rgba(4, 14, 19, 0.92) 100%)",
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.28)",
      }}
    >
      <Text sx={{ display: "block", color: "accent", fontFamily: "monospace", fontSize: 1, mb: 2 }}>
        Explore My Work Through Your Lens
      </Text>
      <Flex sx={{ gap: 2, flexWrap: "wrap", mb: 3 }}>
        {lensOptions.map((lens) => (
          <Button
            key={lens}
            onClick={() => void updateLens(lens)}
            sx={{
              ...buttonStyles,
              color: lens === activeLens ? "#07171d" : "heading",
              bg: lens === activeLens ? "accent" : buttonStyles.bg,
              borderColor: lens === activeLens ? "accent" : buttonStyles.borderColor,
            }}
          >
            {lens}
          </Button>
        ))}
      </Flex>
      <Text sx={{ color: "secondary", fontSize: [1, 2], lineHeight: 1.8 }}>
        {loading ? "Calibrating research profile..." : response}
      </Text>
    </Box>
  )
}

export default ResearchLensPanel
