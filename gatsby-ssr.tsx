import * as React from "react";
import LazyVideo from "./src/components/LazyVideo";
import PromptComposer from "./src/components/PromptComposer";
import PromptGrader from "./src/components/PromptGrader";
import FablePromptGrader from "./src/components/FablePromptGrader";
import TweetThreadGenerator from "./src/components/TweetThreadGenerator";
import PeekGuide from "./src/components/PeekGuide";

export const wrapRootElement = ({ element }) => {
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

export const wrapPageElement = ({ element, props }) => (
  <>
    {element}
    <PeekGuide pathname={props.location.pathname} />
  </>
);

// Preserve existing JS onRenderBody implementation (migrated from gatsby-ssr.js)
export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
      key="viewport"
    />,
    <link rel="preconnect" href="https://fonts.googleapis.com" key="fonts-preconnect" />,
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" key="fonts-gstatic-preconnect" />,
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500&family=JetBrains+Mono:wght@400;500&family=Press+Start+2P&display=swap"
      key="google-fonts"
    />,
    <link
      rel="alternate"
      hrefLang="en"
      href="https://adityakarnam.com/"
      key="hreflang-en"
    />,
    <link
      rel="alternate"
      hrefLang="x-default"
      href="https://adityakarnam.com/"
      key="hreflang-x-default"
    />,
    <script
      key="json-ld-person"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Aditya Karnam",
          url: "https://adityakarnam.com",
          jobTitle: "AI Research Engineer",
          description:
            "AI research engineer working across the AI stack: hardware and inference performance, model training and distillation, agent systems, retrieval and memory, evals and software factories.",
          knowsAbout: ["AI agents", "LLM evaluation", "retrieval", "inference performance", "Apple Silicon", "model distillation", "coding agents", "healthcare machine learning"],
          sameAs: [
            "https://twitter.com/aditya_karnam",
            "https://www.linkedin.com/in/adityakarnamgrao/",
            "https://github.com/adityak74",
            "https://medium.com/@adityakarnam",
            "https://scholar.google.com/citations?user=WujCeDkAAAAJ&hl=en",
            "https://dzone.com/users/5236541/adityakarnam.html",
          ],
        }),
      }}
    />,
    <script
      key="json-ld-website"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Aditya Karnam",
          url: "https://adityakarnam.com",
          description:
            "Research and writing by Aditya Karnam, AI research engineer: inference on real hardware, distillation, agent systems, retrieval, memory and evals.",
          author: {
            "@type": "Person",
            name: "Aditya Karnam",
            url: "https://adityakarnam.com",
          },
          inLanguage: "en",
        }),
      }}
    />,
    <script
      key="cronitor-rum-script"
      src="https://rum.cronitor.io/script.js"
      async
      defer
    />,
    <script
      key="cronitor-rum-config"
      dangerouslySetInnerHTML={{
        __html: `window.cronitor = window.cronitor || function() { (window.cronitor.q = window.cronitor.q || []).push(arguments); };\ncronitor('config', { clientKey: 'a1dafbd7a3d4ccf2454f3d67f1a4c6c3' });`,
      }}
    />,
  ]);
};
