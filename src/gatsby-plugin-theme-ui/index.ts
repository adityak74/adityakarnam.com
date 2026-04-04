import { merge } from "theme-ui"
import tailwind from "@theme-ui/preset-tailwind"
import { lightThemeVars, darkThemeVars } from "@lekoarts/gatsby-theme-minimal-blog/src/utils/prism-themes"

const theme = merge(tailwind, {
  config: {
    initialColorModeName: `light`,
  },
  colors: {
    text: `#111827`,
    background: `#FAFAFA`,
    primary: `#2563EB`,
    secondary: `#6B7280`,
    toggleIcon: tailwind.colors.gray[8],
    heading: `#111827`,
    divide: `#E5E7EB`,
    muted: `#F3F4F6`,
    highlightLineBg: `rgba(0, 0, 0, 0.04)`,
    ...lightThemeVars,
    modes: {
      dark: {
        text: `#C9D1D9`,
        background: `#0D1117`,
        primary: `#58A6FF`,
        secondary: `#8B949E`,
        toggleIcon: tailwind.colors.gray[4],
        heading: `#F0F6FC`,
        divide: `#21262D`,
        muted: `#161B22`,
        highlightLineBg: `rgba(255, 255, 255, 0.05)`,
        ...darkThemeVars,
      },
    },
  },
  fonts: {
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    monospace: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace`,
  },
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 600,
  },
  lineHeights: {
    body: 1.75,
    heading: 1.25,
  },
  letterSpacings: {
    heading: `-0.02em`,
  },
  styles: {
    root: {
      color: `text`,
      backgroundColor: `background`,
      margin: 0,
      padding: 0,
      boxSizing: `border-box`,
      textRendering: `optimizeLegibility`,
      WebkitFontSmoothing: `antialiased`,
      MozOsxFontSmoothing: `grayscale`,
      WebkitTextSizeAdjust: `100%`,
      img: {
        borderStyle: `none`,
      },
      pre: {
        fontFamily: `monospace`,
        fontSize: `0.9em`,
      },
      a: {
        transition: `color 0.2s ease`,
        color: `text`,
      },
    },
    p: {
      fontSize: [1, 1, 2],
      letterSpacing: `-0.003em`,
      lineHeight: `body`,
      "--baseline-multiplier": 0.179,
      "--x-height-multiplier": 0.35,
      wordBreak: `break-word`,
    },
    ul: {
      li: {
        fontSize: [1, 1, 2],
        letterSpacing: `-0.003em`,
        lineHeight: `body`,
      },
    },
    ol: {
      li: {
        fontSize: [1, 1, 2],
        letterSpacing: `-0.003em`,
        lineHeight: `body`,
      },
    },
    h1: {
      variant: `text.heading`,
      fontSize: [4, 5, 5, 6],
      mt: 4,
      letterSpacing: `-0.03em`,
    },
    h2: {
      variant: `text.heading`,
      fontSize: [3, 4, 4, 5],
      mt: 5,
      mb: 2,
      letterSpacing: `-0.025em`,
    },
    h3: {
      variant: `text.heading`,
      fontSize: [2, 3, 3, 4],
      mt: 4,
      mb: 2,
      letterSpacing: `-0.02em`,
    },
    h4: {
      variant: `text.heading`,
      fontSize: [1, 2, 2, 3],
      mt: 3,
      letterSpacing: `-0.015em`,
    },
    h5: {
      variant: `text.heading`,
      fontSize: [1, 2],
      mt: 3,
    },
    h6: {
      variant: `text.heading`,
      fontSize: 1,
      mb: 2,
    },
    blockquote: {
      borderLeftColor: `primary`,
      borderLeftStyle: `solid`,
      borderLeftWidth: `3px`,
      mx: 0,
      pl: 4,
      py: 1,
      color: `secondary`,
      fontStyle: `italic`,
      p: {
        fontStyle: `italic`,
        my: 0,
      },
    },
    table: {
      width: `100%`,
      my: 4,
      borderCollapse: `separate`,
      borderSpacing: 0,
      fontSize: [1, 1, 2],
      th: {
        textAlign: `left`,
        py: `4px`,
        pr: `4px`,
        pl: 0,
        borderColor: `divide`,
        borderBottomStyle: `solid`,
      },
      td: {
        textAlign: `left`,
        py: `4px`,
        pr: `4px`,
        pl: 0,
        borderColor: `divide`,
        borderBottomStyle: `solid`,
      },
    },
    th: {
      verticalAlign: `bottom`,
      borderBottomWidth: `2px`,
      color: `heading`,
      fontWeight: 600,
    },
    td: {
      verticalAlign: `top`,
      borderBottomWidth: `1px`,
    },
    hr: {
      mx: 0,
      borderColor: `divide`,
    },
    img: {
      borderRadius: `6px`,
      boxShadow: `0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)`,
      maxWidth: `100%`,
    },
    code: {
      fontFamily: `monospace`,
      fontSize: `0.875em`,
      backgroundColor: `muted`,
      borderRadius: `4px`,
      px: `0.4em`,
      py: `0.15em`,
      color: `heading`,
    },
    inlineCode: {
      fontFamily: `monospace`,
      fontSize: `0.875em`,
      backgroundColor: `muted`,
      borderRadius: `4px`,
      px: `0.4em`,
      py: `0.15em`,
      color: `heading`,
    },
  },
  layout: {
    container: {
      padding: [3, 4, 5],
      maxWidth: `1400px`,
    },
    content: {
      figure: {
        margin: 0,
        img: {
          borderRadius: `6px`,
          maxWidth: `100%`,
        },
      },
    },
  },
  text: {
    heading: {
      fontFamily: `heading`,
      fontWeight: `heading`,
      lineHeight: `heading`,
      color: `heading`,
    },
  },
  copyButton: {
    backgroundColor: `muted`,
    border: `none`,
    color: `secondary`,
    cursor: `pointer`,
    fontSize: [`12px`, `12px`, `13px`],
    fontFamily: `monospace`,
    letterSpacing: `0.02rem`,
    transition: `all 0.2s ease`,
    "&[disabled]": {
      cursor: `not-allowed`,
    },
    ":not([disabled]):hover": {
      bg: `primary`,
      color: `white`,
    },
    position: `absolute`,
    right: 0,
    zIndex: 1,
    borderRadius: `0 0 0 4px`,
    padding: `0.2rem 0.5rem`,
  },
  dividers: {
    bottom: {
      borderBottomStyle: `solid`,
      borderBottomWidth: `1px`,
      borderBottomColor: `divide`,
      pb: 3,
    },
    top: {
      borderTopStyle: `solid`,
      borderTopWidth: `1px`,
      borderTopColor: `divide`,
      pt: 3,
    },
  },
  links: {
    secondary: {
      color: `secondary`,
      textDecoration: `none`,
      ":hover": {
        color: `primary`,
        textDecoration: `none`,
      },
      ":focus": {
        color: `primary`,
      },
    },
    listItem: {
      fontSize: [1, 2, 3],
      color: `text`,
      fontWeight: 500,
    },
  },
})

export default theme
