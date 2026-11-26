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

// Design contract palette. Keys kept stable for existing consumers.
export const consoleColors = {
  bg: "#FAF9F6",
  panel: "#FAF9F6",
  panelAlt: "#F3F1EB",
  border: "#E3E0D8",
  borderStrong: "#E3E0D8",
  text: "#141413",
  muted: "#5E5D59",
  soft: "#5E5D59",
  accent: "#C2522D",
  accentAlt: "#5E5D59",
  warning: "#C2522D",
}

export const monoLabelSx = {
  fontFamily: `monospace`,
  fontSize: `12px`,
  lineHeight: 1.5,
  letterSpacing: `0.06em`,
  textTransform: `uppercase` as const,
  color: consoleColors.muted,
}

export const pageShellSx = {
  color: consoleColors.text,
  position: `relative` as const,
}

/** Mono uppercase label. */
export const Eyebrow = ({ children }: ShellProps) => (
  <Text sx={{ display: `block`, mb: 2, ...monoLabelSx }}>{children}</Text>
)

/** Serif h1 with optional lede paragraph. */
export const PageTitle = ({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string
  title: string
  lede?: React.ReactNode
}) => (
  <Box sx={{ mb: [4, 5] }}>
    {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
    <Heading as="h1" sx={{ variant: `styles.h1`, mt: 0, mb: lede ? 3 : 0, maxWidth: `20ch` }}>
      {title}
    </Heading>
    {lede ? (
      <Text as="p" sx={{ color: consoleColors.muted, fontSize: [`18px`, `20px`], lineHeight: 1.55, maxWidth: `60ch` }}>
        {lede}
      </Text>
    ) : null}
  </Box>
)

/** Hairline-ruled list. Children are rows; each gets a top rule, last gets a bottom rule. */
export const RuledList = ({ children }: ShellProps) => (
  <Box
    as="div"
    sx={{
      borderTop: `1px solid ${consoleColors.border}`,
      "& > *": { borderBottom: `1px solid ${consoleColors.border}`, py: 3 },
    }}
  >
    {children}
  </Box>
)

export const ConsoleShell = ({ children }: ShellProps) => (
  <Box sx={{ ...pageShellSx, pb: 3, mb: [3, 4] }}>{children}</Box>
)

export const SectionBlock = ({ eyebrow, title, description, children }: SectionProps) => (
  <Box sx={{ mt: [5, 6], mb: [4, 5], borderTop: `1px solid ${consoleColors.border}`, pt: 4 }}>
    <Box sx={{ mb: 4 }}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading
        as="h2"
        sx={{
          variant: `styles.h2`,
          mt: 0,
          mb: description ? 2 : 0,
          maxWidth: `24ch`,
          lineHeight: 1.15,
        }}
      >
        {title}
      </Heading>
      {description ? (
        <Text as="p" sx={{ color: consoleColors.muted, maxWidth: `62ch`, fontSize: `17px`, lineHeight: 1.65 }}>
          {description}
        </Text>
      ) : null}
    </Box>
    {children}
  </Box>
)

// ponytail: `accent` prop kept for API stability, ignored (single accent used sparingly).
export const ConsoleCard = ({ title, children }: CardProps) => (
  <Box sx={{ borderTop: `1px solid ${consoleColors.border}`, pt: 3, display: `grid`, gap: 2, minWidth: 0, height: `100%`, alignContent: `start` }}>
    <Text sx={{ display: `block`, ...monoLabelSx }}>{title}</Text>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Box>
)

export const SignalPill = ({ children }: SignalPillProps) => (
  <Text as="span" sx={{ display: `block`, width: `fit-content`, mb: 3, ...monoLabelSx, color: consoleColors.accent }}>
    {children}
  </Text>
)

export const HeroStat = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ borderTop: `1px solid ${consoleColors.border}`, pt: 3, minWidth: 0 }}>
    <Text sx={{ display: `block`, mb: 1, ...monoLabelSx }}>{label}</Text>
    <Text sx={{ display: `block`, color: consoleColors.text, fontFamily: `heading`, fontSize: [3, 4], letterSpacing: `-0.02em` }}>
      {value}
    </Text>
  </Box>
)

export const TwoColumnGrid = ({ children }: ShellProps) => (
  <Grid sx={{ gridTemplateColumns: [`1fr`, `1fr`, `repeat(2, minmax(0, 1fr))`], gap: [4, 5] }}>{children}</Grid>
)

export const ThreeColumnGrid = ({ children }: ShellProps) => (
  <Grid sx={{ gridTemplateColumns: [`1fr`, `repeat(2, minmax(0, 1fr))`, `repeat(3, minmax(0, 1fr))`], gap: [4, 5] }}>
    {children}
  </Grid>
)
