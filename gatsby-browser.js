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
