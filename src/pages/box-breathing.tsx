import * as React from "react"

export function Head() {
  return (
    <>
      <title>box breathing</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>{`
        body { margin: 0; padding: 0; background: #06060f; }
        #box-breathing-root * { margin: 0; padding: 0; box-sizing: border-box; }
        #box-breathing-root { background: #06060f; height: 100vh; overflow: hidden; user-select: none; }
        #box-breathing-root canvas { position: fixed; inset: 0; width: 100%; height: 100%; }
        #phase-label, #count, #cycles, #hint, .bl {
          position: fixed;
          font-family: Georgia, 'Times New Roman', serif;
          pointer-events: none;
          z-index: 5;
        }
        #phase-label {
          left: 50%; transform: translateX(-50%);
          font-size: 11px; letter-spacing: .65em; text-transform: lowercase;
          color: rgba(255,255,255,.33); white-space: nowrap;
        }
        #count {
          top: 50%; left: 50%; transform: translate(-50%,-50%);
          font-size: 54px; font-weight: 300; color: rgba(255,255,255,.1);
        }
        #cycles {
          bottom: 22px; right: 22px; font-size: 10px; letter-spacing: .3em;
          color: rgba(255,255,255,.13); text-transform: lowercase;
        }
        #hint {
          bottom: 22px; left: 22px; font-size: 10px; letter-spacing: .25em;
          color: rgba(255,255,255,.1); text-transform: lowercase;
          opacity: 0; transition: opacity 1.5s;
        }
        .bl {
          font-size: 9px; letter-spacing: .42em; text-transform: lowercase;
          color: rgba(255,255,255,.1); transition: color .8s; display: none;
        }
        #start {
          position: fixed; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 18px;
          z-index: 20; background: #06060f; transition: opacity 2.2s ease;
        }
        #start.fade { opacity: 0; pointer-events: none; }
        .st {
          font-family: Georgia, serif; font-weight: normal; font-size: 13px;
          letter-spacing: .88em; text-transform: lowercase; color: rgba(255,255,255,.3);
        }
        .sr { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
        .sp { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .sn { font-family: Georgia, serif; font-size: 30px; font-weight: 300; color: rgba(255,255,255,.2); }
        .sl { font-family: Georgia, serif; font-size: 9px; letter-spacing: .2em; color: rgba(255,255,255,.14); text-transform: lowercase; }
        .sd { font-size: 16px; color: rgba(255,255,255,.1); padding-bottom: 8px; }
        .sb {
          margin-top: 28px; background: none; border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.26); padding: 13px 52px;
          font-family: Georgia, serif; font-size: 10px; letter-spacing: .55em;
          text-transform: lowercase; cursor: pointer; transition: all .5s;
        }
        .sb:hover { border-color: rgba(255,255,255,.28); color: rgba(255,255,255,.55); }
      `}</style>
    </>
  )
}

const BoxBreathingPage = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const phaseLbl = document.getElementById("phase-label")!
    const countEl = document.getElementById("count")!
    const cyclesEl = document.getElementById("cycles")!
    const hintEl = document.getElementById("hint")!
    const startEl = document.getElementById("start")!
    const LABELS = ["bl-t", "bl-r", "bl-b", "bl-l"].map(id => document.getElementById(id)!)

    let W: number, H: number, cx: number, cy: number, R: number, BS: number
    let running = false, paused = false
    let phaseIdx = 0, phaseStart = 0, pausedAt = 0
    let cycles = 0
    let particles: any[] = []
    let ripples: any[] = []
    let ambT = 0, prevNow = 0
    let rafId: number

    const PH = [
      { name: "inhale",    dur: 4000, label: "breathe in",  h: 215, s: 58, l: 62 },
      { name: "hold_in",   dur: 4000, label: "hold",         h: 185, s: 40, l: 76 },
      { name: "exhale",    dur: 4000, label: "breathe out",  h: 168, s: 50, l: 58 },
      { name: "hold_out",  dur: 4000, label: "hold",         h: 232, s: 28, l: 28 },
    ]
    const PH_OFF = [0, 4000, 8000, 12000]

    const lerp  = (a: number, b: number, t: number) => a + (b - a) * t
    const ease  = (t: number) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
    const hsl   = (h: number, s: number, l: number, a = 1) => `hsla(${h | 0},${s | 0}%,${l | 0}%,${a})`

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      cx = W / 2; cy = H / 2
      R  = Math.min(W, H) * .115
      BS = R * 2.55

      phaseLbl.style.top = (cy + BS + 22) + "px"

      const [T, Ri, B, L] = LABELS
      T.style.left = cx + "px"; T.style.top = (cy - BS - 17) + "px"
      T.style.transform = "translateX(-50%)"
      Ri.style.left = (cx + BS + 14) + "px"; Ri.style.top = cy + "px"
      Ri.style.transform = "translateY(-50%)"
      B.style.left = cx + "px"; B.style.top = (cy + BS + 9) + "px"
      B.style.transform = "translateX(-50%)"
      L.style.left = (cx - BS - 14) + "px"; L.style.top = cy + "px"
      L.style.transform = "translate(-100%,-50%)"

      buildParticles()
    }

    function buildParticles() {
      particles = Array.from({ length: 200 }, (_, i) => {
        const ang = Math.random() * Math.PI * 2
        const d   = R * 1.9 + Math.random() * Math.min(W, H) * .30
        return {
          ha: ang, hd: d,
          x: cx + Math.cos(ang) * d, y: cy + Math.sin(ang) * d,
          oa: Math.random() * Math.PI * 2,
          os: (.003 + Math.random() * .004) * (Math.random() < .5 ? 1 : -1),
          sz: .6 + Math.random() * 1.4,
          al: .18 + Math.random() * .4,
          lane: i % 4,
        }
      })
    }

    function spawnRipple(ph: any) {
      ripples.push({ r: R * .15, h: ph.h, s: ph.s, l: ph.l, a: .48 })
    }

    function updateLabels() {
      LABELS.forEach((el, i) => {
        el.style.display = "block"
        el.style.color = i === phaseIdx
          ? hsl(PH[i].h, PH[i].s, PH[i].l + 12, .46)
          : "rgba(255,255,255,.08)"
      })
    }

    function begin() {
      startEl.classList.add("fade")
      setTimeout(() => { startEl.style.display = "none" }, 2600)
      hintEl.style.opacity = "1"
      running    = true
      phaseIdx   = 0
      phaseStart = performance.now()
      phaseLbl.textContent = PH[0].label
      spawnRipple(PH[0])
      updateLabels()
    }

    function togglePause() {
      if (!running) return
      paused = !paused
      if (paused) {
        pausedAt = performance.now()
        phaseLbl.textContent = "paused"
        hintEl.textContent   = "tap to resume  ·  space"
      } else {
        phaseStart += performance.now() - pausedAt
        phaseLbl.textContent = PH[phaseIdx].label
        hintEl.textContent   = "tap to pause  ·  space"
      }
    }

    function drawOrb(orbR: number, fill: number, h: number, s: number, l: number) {
      for (let i = 5; i >= 1; i--) {
        const gr = orbR * (1 + i * .62)
        const ga = (.048 - i * .007) * (.1 + fill * .9)
        const g  = ctx.createRadialGradient(cx, cy, orbR * .12, cx, cy, gr)
        g.addColorStop(0, hsl(h, s, l + 10, ga * 6))
        g.addColorStop(1, hsl(h, s, l, 0))
        ctx.beginPath()
        ctx.arc(cx, cy, gr, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }
      if (orbR > 1) {
        const cg = ctx.createRadialGradient(cx - orbR * .27, cy - orbR * .27, 0, cx, cy, orbR)
        const ca  = .08 + fill * .92
        cg.addColorStop(0,   hsl(h, Math.max(s - 22, 0), Math.min(l + 38, 96), ca))
        cg.addColorStop(.55, hsl(h, s, l, ca * .72))
        cg.addColorStop(1,   hsl(h, s, l - 14, 0))
        ctx.beginPath()
        ctx.arc(cx, cy, orbR, 0, Math.PI * 2)
        ctx.fillStyle = cg
        ctx.fill()
      }
    }

    function drawBox(totalT: number, ch: number, cs: number, cl: number) {
      const K = [
        [cx - BS, cy - BS],
        [cx + BS, cy - BS],
        [cx + BS, cy + BS],
        [cx - BS, cy + BS],
        [cx - BS, cy - BS],
      ]

      ctx.beginPath()
      ctx.moveTo(K[0][0], K[0][1])
      for (let i = 1; i <= 4; i++) ctx.lineTo(K[i][0], K[i][1])
      ctx.strokeStyle = "rgba(255,255,255,.042)"
      ctx.lineWidth = 1
      ctx.stroke()

      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.arc(K[i][0], K[i][1], 1.5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255,255,255,.08)"
        ctx.fill()
      }

      let dotX: number | undefined, dotY: number | undefined
      for (let i = 0; i < 4; i++) {
        const ss = i * .25
        if (totalT <= ss) break

        const ph = PH[i]
        const [x1, y1] = K[i], [x2, y2] = K[i + 1]
        const segT = Math.min((totalT - ss) / .25, 1)
        const ex = lerp(x1, x2, segT), ey = lerp(y1, y2, segT)

        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey)
        ctx.strokeStyle = hsl(ph.h, ph.s, ph.l + 12, .2)
        ctx.lineWidth = 5
        ctx.stroke()

        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey)
        ctx.strokeStyle = hsl(ph.h, ph.s, ph.l + 18, .5)
        ctx.lineWidth = 1.3
        ctx.stroke()

        if (segT < 1) {
          dotX = ex; dotY = ey
        } else {
          const cg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 9)
          cg.addColorStop(0, hsl(ph.h, ph.s, ph.l + 20, .38))
          cg.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = cg
          ctx.beginPath(); ctx.arc(ex, ey, 9, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, Math.PI * 2)
          ctx.fillStyle = hsl(ph.h, ph.s, ph.l + 25, .6); ctx.fill()
        }
      }

      if (dotX !== undefined && dotY !== undefined) {
        const dg = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 24)
        dg.addColorStop(0, hsl(ch, cs, cl + 28, .38))
        dg.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = dg
        ctx.beginPath(); ctx.arc(dotX, dotY, 24, 0, Math.PI * 2); ctx.fill()

        ctx.beginPath(); ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2)
        ctx.fillStyle = hsl(ch, cs, cl + 30, .94); ctx.fill()

        ctx.beginPath(); ctx.arc(dotX, dotY, 2, 0, Math.PI * 2)
        ctx.fillStyle = "hsla(0,0%,96%,.9)"; ctx.fill()
      }
    }

    function drawParticles(name: string, et: number, fill: number, h: number, s: number, l: number) {
      const maxD = Math.min(W, H) * .48
      particles.forEach((p, i) => {
        let tx: number, ty: number
        switch (name) {
          case "inhale": {
            const d = lerp(p.hd, R * .4, et), a = p.ha + et * .44
            tx = cx + Math.cos(a) * d; ty = cy + Math.sin(a) * d; break
          }
          case "hold_in": {
            p.oa += p.os
            const lr = R * (.5 + p.lane * .11)
            tx = cx + Math.cos(p.oa) * lr; ty = cy + Math.sin(p.oa) * lr; break
          }
          case "exhale": {
            const d = lerp(R * .4, p.hd, et), a = p.ha + (1 - et) * .44
            tx = cx + Math.cos(a) * d; ty = cy + Math.sin(a) * d; break
          }
          default: {
            tx = cx + Math.cos(p.ha + ambT * .04) * p.hd
            ty = cy + Math.sin(p.ha + ambT * .03) * p.hd
          }
        }
        p.x += (tx - p.x) * .046; p.y += (ty - p.y) * .046
        const dist = Math.hypot(p.x - cx, p.y - cy)
        const fade = clamp(1 - dist / maxD, 0, 1)
        ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2)
        ctx.fillStyle = hsl(h, s, l + 18, p.al * fade * (.2 + fill * .62))
        ctx.fill()
      })
    }

    function drawAmbient() {
      particles.forEach(p => {
        const tx = cx + Math.cos(p.ha + ambT * .08) * p.hd
        const ty = cy + Math.sin(p.ha + ambT * .06) * p.hd
        p.x += (tx - p.x) * .008; p.y += (ty - p.y) * .008
        ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(80,100,162,${p.al * .25})`; ctx.fill()
      })
    }

    function drawRipples(dt: number) {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.r += dt * .115; rp.a *= .924
        if (rp.a < .01) { ripples.splice(i, 1); continue }
        ctx.beginPath(); ctx.arc(cx, cy, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = hsl(rp.h, rp.s, rp.l, rp.a * .5)
        ctx.lineWidth = 1.2; ctx.stroke()
      }
    }

    function drawVignette() {
      const vg = ctx.createRadialGradient(cx, cy, R * 1.4, cx, cy, Math.hypot(W, H) * .65)
      vg.addColorStop(0, "rgba(0,0,0,0)")
      vg.addColorStop(1, "rgba(0,0,0,.62)")
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)
    }

    function loop(now: number) {
      rafId = requestAnimationFrame(loop)
      const dt = clamp(now - prevNow, 0, 100)
      prevNow = now
      ambT += dt * .00024

      ctx.fillStyle = "#06060f"
      ctx.fillRect(0, 0, W, H)

      if (!running || paused) {
        drawAmbient()
        drawRipples(dt)
        drawVignette()
        return
      }

      const ph   = PH[phaseIdx]
      const nph  = PH[(phaseIdx + 1) % 4]
      const rawT = (now - phaseStart) / ph.dur
      const t    = clamp(rawT, 0, 1)
      const et   = ease(t)

      if (rawT >= 1) {
        phaseIdx = (phaseIdx + 1) % 4
        if (phaseIdx === 0) {
          cycles++
          cyclesEl.textContent = `${cycles} cycle${cycles > 1 ? "s" : ""}`
        }
        phaseStart = now
        phaseLbl.textContent = PH[phaseIdx].label
        spawnRipple(PH[phaseIdx])
        updateLabels()
      }

      const fill = ph.name === "inhale"   ? et
                 : ph.name === "hold_in"  ? 1
                 : ph.name === "exhale"   ? 1 - et
                 :                          0

      const ch = lerp(ph.h, nph.h, et)
      const cs = lerp(ph.s, nph.s, et)
      const cl = lerp(ph.l, nph.l, et)

      const orbR = R * (.1 + .9 * fill)

      const totalT = clamp((PH_OFF[phaseIdx] + (now - phaseStart)) / 16000, 0, .9999)

      const bgG = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 5.5)
      bgG.addColorStop(0, hsl(ch, cs, cl, .05 * (0.08 + fill * .92)))
      bgG.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = bgG
      ctx.fillRect(0, 0, W, H)

      drawRipples(dt)
      drawParticles(ph.name, et, fill, ch, cs, cl)
      drawBox(totalT, ch, cs, cl)
      drawOrb(orbR, fill, ch, cs, cl)
      drawVignette()

      countEl.textContent = String(Math.min(4, Math.floor(t * 4) + 1))
      countEl.style.color = hsl(ch, cs, cl + 28, .07 + fill * .13)
    }

    canvas.addEventListener("click", togglePause)
    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); togglePause() }
      if (e.code === "Enter" && !running) begin()
    }
    document.addEventListener("keydown", keyHandler)
    document.getElementById("sbtn")!.addEventListener("click", e => {
      e.stopPropagation(); begin()
    })

    window.addEventListener("resize", resize)
    resize()
    prevNow = performance.now()
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
      document.removeEventListener("keydown", keyHandler)
    }
  }, [])

  return (
    <div id="box-breathing-root">
      <canvas ref={canvasRef} id="c" />
      <div id="phase-label" />
      <div id="count" />
      <div id="cycles">0 cycles</div>
      <div id="hint">tap to pause &nbsp;·&nbsp; space</div>
      <div className="bl" id="bl-t">in</div>
      <div className="bl" id="bl-r">hold</div>
      <div className="bl" id="bl-b">out</div>
      <div className="bl" id="bl-l">hold</div>
      <div id="start">
        <h1 className="st">box breathing</h1>
        <div className="sr">
          <div className="sp"><div className="sn">4</div><div className="sl">in</div></div>
          <div className="sd">·</div>
          <div className="sp"><div className="sn">4</div><div className="sl">hold</div></div>
          <div className="sd">·</div>
          <div className="sp"><div className="sn">4</div><div className="sl">out</div></div>
          <div className="sd">·</div>
          <div className="sp"><div className="sn">4</div><div className="sl">hold</div></div>
        </div>
        <button className="sb" id="sbtn">begin</button>
      </div>
    </div>
  )
}

export default BoxBreathingPage
