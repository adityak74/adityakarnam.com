/** @jsx jsx */
import * as React from "react"
import { Box, Flex, Grid, Heading, Text, jsx } from "theme-ui"

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
  bg: "#0b1110",
  panel: "#101917",
  panelAlt: "#131f1c",
  border: "rgba(124, 240, 197, 0.18)",
  borderStrong: "rgba(124, 240, 197, 0.34)",
  text: "#e9f3ee",
  muted: "rgba(233, 243, 238, 0.7)",
  soft: "rgba(233, 243, 238, 0.52)",
  accent: "#7cf0c5",
  accentAlt: "#74d4ff",
  warning: "#f3c86b",
}

export const pageShellSx = {
  color: consoleColors.text,
  background: `
    radial-gradient(circle at top, rgba(116, 212, 255, 0.12), transparent 28%),
    radial-gradient(circle at bottom right, rgba(124, 240, 197, 0.08), transparent 24%),
    linear-gradient(180deg, #0b1110 0%, #0d1413 100%)
  `,
  border: `1px solid ${consoleColors.border}`,
  borderRadius: 24,
  overflow: `hidden`,
  position: `relative` as const,
  boxShadow: `0 24px 80px rgba(0, 0, 0, 0.24)`,
  "::before": {
    content: `""`,
    position: `absolute` as const,
    inset: 0,
    pointerEvents: `none` as const,
    backgroundImage: `
      linear-gradient(rgba(124, 240, 197, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124, 240, 197, 0.08) 1px, transparent 1px)
    `,
    backgroundSize: `48px 48px`,
    maskImage: `linear-gradient(180deg, rgba(0,0,0,0.85), transparent)`,
  },
}

export const ConsoleShell = ({ children }: ShellProps) => (
  <Box sx={pageShellSx}>
    <Flex
      sx={{
        px: [3, 4],
        py: 2,
        alignItems: `center`,
        justifyContent: `space-between`,
        borderBottom: `1px solid ${consoleColors.border}`,
        bg: `rgba(7, 11, 10, 0.55)`,
        backdropFilter: `blur(12px)`,
        position: `relative`,
        zIndex: 1,
      }}
    >
      <Flex sx={{ gap: 2, alignItems: `center` }}>
        <Flex sx={{ gap: 2 }}>
          {["#f87171", "#f3c86b", "#7cf0c5"].map(color => (
            <Box
              key={color}
              sx={{
                width: 10,
                height: 10,
                borderRadius: `50%`,
                bg: color,
                opacity: 0.8,
              }}
            />
          ))}
        </Flex>
        <Text sx={{ fontFamily: `monospace`, fontSize: 0, color: consoleColors.soft }}>
          world-model-interface://lab
        </Text>
      </Flex>
      <Text sx={{ fontFamily: `monospace`, fontSize: 0, color: consoleColors.soft }}>
        observe -&gt; model -&gt; simulate -&gt; act
      </Text>
    </Flex>
    <Box sx={{ p: [3, 4, 5], position: `relative`, zIndex: 1 }}>{children}</Box>
  </Box>
)

export const SectionBlock = ({ eyebrow, title, description, children }: SectionProps) => (
  <Box sx={{ mb: [4, 5, 6] }}>
    <Box sx={{ mb: 3 }}>
      {eyebrow ? (
        <Text
          sx={{
            display: `block`,
            textTransform: `uppercase`,
            letterSpacing: `0.18em`,
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
          fontSize: [3, 4, 5],
          mb: description ? 2 : 0,
          maxWidth: `14ch`,
        }}
      >
        {title}
      </Heading>
      {description ? (
        <Text sx={{ color: consoleColors.muted, maxWidth: `64ch`, fontSize: [1, 2] }}>{description}</Text>
      ) : null}
    </Box>
    {children}
  </Box>
)

export const ConsoleCard = ({ title, children, accent = consoleColors.accent }: CardProps) => (
  <Box
    sx={{
      bg: `rgba(16, 25, 23, 0.9)`,
      border: `1px solid ${consoleColors.border}`,
      borderRadius: 18,
      p: [3, 3, 4],
      height: `100%`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03)`,
      position: `relative`,
      overflow: `hidden`,
      "::before": {
        content: `""`,
        position: `absolute`,
        inset: `0 auto auto 0`,
        width: `100%`,
        height: 2,
        bg: accent,
        opacity: 0.85,
      },
    }}
  >
    <Text
      sx={{
        display: `block`,
        fontFamily: `monospace`,
        color: accent,
        fontSize: 0,
        textTransform: `uppercase`,
        letterSpacing: `0.14em`,
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
      bg: `rgba(116, 212, 255, 0.08)`,
      color: consoleColors.text,
      fontFamily: `monospace`,
      fontSize: 0,
      letterSpacing: `0.04em`,
    }}
  >
    {children}
  </Box>
)

export const HeroStat = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <Box
    sx={{
      border: `1px solid ${consoleColors.border}`,
      borderRadius: 16,
      p: 3,
      bg: `rgba(7, 11, 10, 0.34)`,
      minWidth: 0,
    }}
  >
    <Text sx={{ display: `block`, fontFamily: `monospace`, color: consoleColors.soft, fontSize: 0, mb: 1 }}>
      {label}
    </Text>
    <Text sx={{ display: `block`, color: consoleColors.text, fontSize: [2, 3], fontWeight: 600 }}>{value}</Text>
  </Box>
)

export const TwoColumnGrid = ({ children }: ShellProps) => (
  <Grid sx={{ gridTemplateColumns: [`1fr`, `1fr`, `repeat(2, minmax(0, 1fr))`], gap: 3 }}>{children}</Grid>
)

export const ThreeColumnGrid = ({ children }: ShellProps) => (
  <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`, `repeat(3, minmax(0, 1fr))`], gap: 3 }}>
    {children}
  </Grid>
)
