import * as React from "react"

// Original 12-wide pixel sprites (no third-party characters). One char = one pixel.
const PAL: Record<string, string> = {
  K: "#141413", G: "#5E5D59", L: "#E3E0D8", R: "#C2522D", W: "#FFFFFF", S: "#B9B5AA", Y: "#D9A441",
}

const SPRITES = {
  cartridge: [
    "............",
    ".KKKKKKKKKK.",
    ".KGGGGGGGGK.",
    ".KGLLLLLLGK.",
    ".KGLRRRRLGK.",
    ".KGLRRRRLGK.",
    ".KGLLLLLLGK.",
    ".KGGGGGGGGK.",
    ".KGKKKKKKGK.",
    ".KGKYKYKYGK.",
    ".KKKKKKKKKK.",
    "............",
  ],
  chef: [
    "....KKKK.KK.",
    "...KWWWWKWWK",
    "..KWWWWWWWWK",
    "..KWWWWWWWWK",
    "..KWWWWWWWWK",
    "...KKKKKKKK.",
    "...KWWWWWWK.",
    "...KWWWWWWK.",
    "...KWWWWWWK.",
    "...KKKKKKKK.",
    "............",
    "............",
  ],
  chefFace: [
    "....KKKK.KK.",
    "...KWWWWKWWK",
    "..KWWWWWWWWK",
    "..KWWWWWWWWK",
    "...KKKKKKKK.",
    "...KLLLLLLK.",
    "...KLKLLKLK.",
    "...KLLRRLLK.",
    "...KKKKKKKK.",
    "............",
    "............",
    "............",
  ],
  pot: [
    "..S...S...S.",
    "...S...S....",
    "............",
    ".KKKKKKKKKK.",
    "KKRRRRRRRRKK",
    "K.RRRRRRRR.K",
    "..RRRRRRRR..",
    "..RRRRRRRR..",
    "..KKKKKKKK..",
    "............",
    "............",
    "............",
  ],
  heart: [
    "..KK....KK..",
    ".KRRK..KRRK.",
    "KRRRRKKRRRRK",
    "KRRRRRRRRRRK",
    ".KRRRRRRRRK.",
    "..KRRRRRRK..",
    "...KRRRRK...",
    "....KRRK....",
    ".....KK.....",
    "............",
    "............",
    "............",
  ],
}

export type SpriteName = keyof typeof SPRITES

const PixelSprite = ({ name, size = 48, label }: { name: SpriteName; size?: number; label?: string }) => {
  const rows = SPRITES[name]
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: "block", imageRendering: "pixelated" }}
    >
      {rows.flatMap((row, y) =>
        row.split("").map((ch, x) => (ch === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PAL[ch]} />))
      )}
    </svg>
  )
}

export default PixelSprite
