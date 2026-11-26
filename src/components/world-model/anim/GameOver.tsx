import * as React from "react"
import PixelSprite from "../../PixelSprite"

// 8-bit continue screen: a simmering pot and a looping CONTINUE? countdown.
// Hover or click resets the countdown. Reduced motion shows one still frame.
const GameOver = () => {
  const [n, setN] = React.useState(9)
  const [flip, setFlip] = React.useState(false)
  const [reduce, setReduce] = React.useState(false)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setReduce(true); return }
    const tick = setInterval(() => setN(v => (v <= -2 ? 9 : v - 1)), 1000)
    const steam = setInterval(() => setFlip(f => !f), 450)
    return () => { clearInterval(tick); clearInterval(steam) }
  }, [])

  const reset = () => setN(9)
  return (
    <div
      role="img"
      aria-label="Pixel art cooking pot with a looping CONTINUE countdown"
      onPointerEnter={reset}
      onClick={reset}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "16px 0", cursor: "pointer", touchAction: "pan-y" }}
    >
      <div style={{ transform: flip ? "scaleX(-1)" : "none" }}>
        <PixelSprite name="pot" size={96} />
      </div>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: n >= 0 ? "#141413" : "#C2522D", minHeight: 16 }}>
        {n >= 0 ? `CONTINUE? ${n}` : "GAME OVER"}
      </div>
      <div style={{ display: "flex", gap: 6, opacity: n >= 0 ? 1 : 0.3 }}>
        {[0, 1, 2].map(i => <PixelSprite key={i} name="heart" size={20} />)}
      </div>
    </div>
  )
}

export default GameOver
