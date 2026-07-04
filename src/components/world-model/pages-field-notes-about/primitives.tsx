/** @jsx jsx */
import * as React from "react"
import { Box, Grid, Heading, Text, jsx } from "theme-ui"

type ShellProps = {
  children: React.ReactNode
}

type SectionProps = {
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
}

type CardProps = {
  title: string
  children: React.ReactNode
  accent?: string
}

type SignalPillProps = {
  children: React.ReactNode
}

export const consoleColors = {
  bg: "#FAF9F7",
  panel: "#FFFFFF",
  panelAlt: "#F2F0EC",
  border: "#D8D4CC",
  borderStrong: "#CFC9BE",
  text: "#1A1A18",
  muted: "#6B6B63",
  soft: "#8A857C",
  accent: "#C2522D",
  accentAlt: "#D4A574",
  warning: "#B67A45",
}

export const pageShellSx = {
  color: consoleColors.text,
  background: `linear-gradient(180deg, #FFFFFF 0%, ${consoleColors.bg} 100%)`,
  border: `1px solid ${consoleColors.border}`,
  borderRadius: 16,
  overflow: `hidden`,
  position: `relative` as const,
  boxShadow: `0 4px 24px rgba(26, 26, 24, 0.08)`,
}

export const ConsoleShell = ({ children }: ShellProps) => (
  <Box sx={pageShellSx}>
    <Box
      sx={{
        px: [3, 4],
        py: 2,
        borderBottom: `1px solid ${consoleColors.border}`,
        bg: `#FAF9F7`,
      }}
    >
      <Text sx={{ fontFamily: `monospace`, fontSize: 0, color: consoleColors.soft, letterSpacing: `0.08em`, textTransform: `uppercase` }}>
        Aditya Karnam · World Model Infrastructure Lab
      </Text>
    </Box>
    <Box sx={{ p: [4, 5, 6] }}>{children}</Box>
  </Box>
)

export const SectionBlock = ({ eyebrow, title, description, children }: SectionProps) => (
  <Box sx={{ mb: [6, 7, 8] }}>
    <Box sx={{ mb: 4 }}>
      {eyebrow ? (
        <Text
          sx={{
            display: `block`,
            textTransform: `uppercase`,
            letterSpacing: `0.12em`,
            fontSize: 0,
            fontFamily: `monospace`,
            color: consoleColors.accent,
            mb: 2,
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Heading
        as="h2"
        sx={{
          color: consoleColors.text,
          fontSize: [`2rem`, `2.4rem`, `2.9rem`],
          mb: description ? 2 : 0,
          maxWidth: `18ch`,
          fontWeight: 500,
          letterSpacing: `-0.03em`,
          lineHeight: 1.08,
        }}
      >
        {title}
      </Heading>
      {description ? (
        <Text sx={{ color: consoleColors.muted, maxWidth: `60ch`, fontSize: `17px`, lineHeight: 1.65 }}>
          {description}
        </Text>
      ) : null}
    </Box>
    {children}
  </Box>
)

export const ConsoleCard = ({ title, children, accent = consoleColors.accent }: CardProps) => (
  <Box
    sx={{
      bg: consoleColors.panel,
      border: `1px solid ${consoleColors.border}`,
      borderRadius: 12,
      p: [3, 4],
      height: `100%`,
      boxShadow: `0 1px 2px rgba(26, 26, 24, 0.06)`,
    }}
  >
    <Text
      sx={{
        display: `block`,
        fontFamily: `monospace`,
        color: accent,
        fontSize: 0,
        textTransform: `uppercase`,
        letterSpacing: `0.12em`,
        mb: 2,
      }}
    >
      {title}
    </Text>
    {children}
  </Box>
)

export const SignalPill = ({ children }: SignalPillProps) => (
  <Box
    as="span"
    sx={{
      display: `inline-flex`,
      alignItems: `center`,
      px: 2,
      py: 1,
      borderRadius: 999,
      border: `1px solid ${consoleColors.border}`,
      bg: consoleColors.panelAlt,
      color: consoleColors.muted,
      fontFamily: `monospace`,
      fontSize: 0,
      letterSpacing: `0.04em`,
    }}
  >
    {children}
  </Box>
)

export const HeroStat = ({ label, value }: { label: string; value: string }) => (
  <Box
    sx={{
      borderTop: `1px solid ${consoleColors.border}`,
      pt: 3,
      minWidth: 0,
    }}
  >
    <Text sx={{ display: `block`, fontFamily: `monospace`, color: consoleColors.soft, fontSize: 0, mb: 1 }}>
      {label}
    </Text>
    <Text sx={{ display: `block`, color: consoleColors.text, fontSize: [2, 3], fontWeight: 500 }}>{value}</Text>
  </Box>
)

export const TwoColumnGrid = ({ children }: ShellProps) => (
  <Grid sx={{ gridTemplateColumns: [`1fr`, `1fr`, `repeat(2, minmax(0, 1fr))`], gap: 4 }}>{children}</Grid>
)

export const ThreeColumnGrid = ({ children }: ShellProps) => (
  <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`, `repeat(3, minmax(0, 1fr))`], gap: 4 }}>
    {children}
  </Grid>
)
