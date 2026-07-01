import { merge } from "theme-ui"
import tailwind from "@theme-ui/preset-tailwind"
import { lightThemeVars, darkThemeVars } from "@lekoarts/gatsby-theme-minimal-blog/src/utils/prism-themes"

const theme = merge(tailwind, {
  config: {
    initialColorModeName: `light`,
  },
  colors: {
    text: `#181818`,
    background: `#F0EEE6`,
    primary: `#181818`,
    secondary: `#66635C`,
    accent: `#D97757`,
    toggleIcon: tailwind.colors.gray[8],
    heading: `#181818`,
    divide: `#DDD9CD`,
    muted: `#E8E4D9`,
    highlightLineBg: `rgba(0, 0, 0, 0.04)`,
    ...lightThemeVars,
    modes: {
      dark: {
        text: `#E8E6DD`,
        background: `#141310`,
        primary: `#E8E6DD`,
        secondary: `#97927F`,
        accent: `#E08A6B`,
        toggleIcon: tailwind.colors.gray[4],
        heading: `#F5F2E9`,
        divide: `#2D2A22`,
        muted: `#211F18`,
        highlightLineBg: `rgba(255, 255, 255, 0.05)`,
        ...darkThemeVars,
      },
    },
  },
  fonts: {
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
    heading: `'Fraunces', Georgia, 'Iowan Old Style', 'Times New Roman', serif`,
    monospace: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace`,
  },
  fontWeights: {
    body: 400,
    heading: 500,
    bold: 600,
  },
  lineHeights: {
    body: 1.7,
    heading: 1.2,
  },
  letterSpacings: {
    heading: `-0.005em`,
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
        backgroundColor: `muted`,
        borderRadius: `6px`,
        border: `1px solid`,
        borderColor: `divide`,
        color: `heading`,
        lineHeight: 1.65,
        overflowX: `auto`,
        p: 3,
        my: 4,
        code: {
          backgroundColor: `transparent`,
          borderRadius: 0,
          color: `inherit`,
          display: `block`,
          fontSize: `inherit`,
          lineHeight: `inherit`,
          p: 0,
          whiteSpace: `pre`,
        },
      },
      a: {
        transition: `color 0.2s ease`,
        color: `text`,
        textDecorationColor: `divide`,
        ":hover": {
          color: `accent`,
        },
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
      fontSize: [5, 6, 6, 7],
      fontWeight: 600,
      mt: 4,
      letterSpacing: `-0.02em`,
    },
    h2: {
      variant: `text.heading`,
      fontSize: [3, 4, 4, 5],
      mt: 5,
      mb: 2,
      letterSpacing: `-0.008em`,
    },
    h3: {
      variant: `text.heading`,
      fontSize: [2, 3, 3, 4],
      mt: 4,
      mb: 2,
      letterSpacing: `-0.006em`,
    },
    h4: {
      variant: `text.heading`,
      fontSize: [1, 2, 2, 3],
      mt: 3,
      letterSpacing: `-0.004em`,
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
      borderLeftColor: `accent`,
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
      border: `1px solid`,
      borderColor: `divide`,
      boxShadow: `0 1px 2px rgba(0,0,0,0.04)`,
      maxWidth: `100%`,
    },
    code: {
      fontFamily: `monospace`,
      fontSize: `0.875em`,
      backgroundColor: `muted`,
      borderRadius: `6px`,
      px: `0.4em`,
      py: `0.15em`,
      color: `heading`,
    },
    inlineCode: {
      fontFamily: `monospace`,
      fontSize: `0.875em`,
      backgroundColor: `muted`,
      borderRadius: `6px`,
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
        color: `accent`,
        textDecoration: `none`,
      },
      ":focus": {
        color: `accent`,
      },
    },
    listItem: {
      fontSize: [1, 2, 3],
      color: `text`,
      fontWeight: 500,
      ":hover": {
        color: `accent`,
      },
    },
  },
  buttons: {
    primary: {
      fontFamily: `body`,
      fontWeight: `bold`,
      backgroundColor: `accent`,
      color: `background`,
      borderRadius: `8px`,
      border: `none`,
      cursor: `pointer`,
      transition: `opacity 0.2s ease`,
      ":hover": {
        opacity: 0.9,
      },
    },
  },
  cards: {
    primary: {
      backgroundColor: `muted`,
      border: `1px solid`,
      borderColor: `divide`,
      borderRadius: `12px`,
    },
  },
})

export default theme
