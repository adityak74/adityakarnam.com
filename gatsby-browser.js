import * as React from "react";
import LazyVideo from "./src/components/LazyVideo";
import PromptComposer from "./src/components/PromptComposer";
import PromptGrader from "./src/components/PromptGrader";
import FablePromptGrader from "./src/components/FablePromptGrader";
import TweetThreadGenerator from "./src/components/TweetThreadGenerator";

// Easter egg: Konami code shows a 1UP toast.
export const onClientEntry = () => {
  const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let i = 0;
  window.addEventListener("keydown", (e) => {
    i = e.key === seq[i] ? i + 1 : e.key === seq[0] ? 1 : 0;
    if (i !== seq.length) return;
    i = 0;
    const t = document.createElement("div");
    t.textContent = "+30 LIVES";
    t.setAttribute("role", "status");
    t.style.cssText = "position:fixed;left:50%;bottom:32px;transform:translateX(-50%);background:#141413;color:#FAF9F6;font:10px 'Press Start 2P',monospace;padding:12px 16px;border-radius:2px;z-index:9999";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  });
};

// Global MDX components mapping for MDXProvider wrapping at runtime
export const wrapRootElement = ({ element }) => {
  // Defer require to avoid SSR mismatch if needed
  const { MDXProvider } = require("@mdx-js/react");
  return (
    <MDXProvider
      components={{
        LazyVideo,
        PromptComposer,
        PromptGrader,
        FablePromptGrader,
        TweetThreadGenerator,
      }}
    >
      {element}
    </MDXProvider>
  );
};

// Scroll effects: sections fade up as they enter, plus a thin reading-progress line.
// Hidden state is applied from JS only (no-JS visitors see everything) and only to
// content below the fold. Skipped entirely under prefers-reduced-motion.
let scrollFxReady = false
export const onRouteUpdate = () => {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  if (!scrollFxReady) {
    scrollFxReady = true
    const st = document.createElement("style")
    st.textContent =
      ".rv{opacity:0;transform:translateY(18px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}" +
      ".rv.rv-in{opacity:1;transform:none}" +
      "#scroll-progress{position:fixed;top:0;left:0;right:0;height:2px;background:#2F5D8C;transform:scaleX(0);transform-origin:left;z-index:100;pointer-events:none}"
    document.head.appendChild(st)
    const bar = document.createElement("div")
    bar.id = "scroll-progress"
    document.body.appendChild(bar)
    let tick = false
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")"
      tick = false
    }
    window.addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(update) } }, { passive: true })
    window.addEventListener("resize", update)
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target) } }),
    { rootMargin: "0px 0px -8% 0px" }
  )
  document.querySelectorAll('main section, main nav[aria-label="Keep exploring"]').forEach((el) => {
    if (el.getBoundingClientRect().top > window.innerHeight * 0.9) { el.classList.add("rv"); io.observe(el) }
  })
}
