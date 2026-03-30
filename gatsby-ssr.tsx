import * as React from "react";
import LazyVideo from "./src/components/LazyVideo";
import PromptComposer from "./src/components/PromptComposer";
import PromptGrader from "./src/components/PromptGrader";
import TweetThreadGenerator from "./src/components/TweetThreadGenerator";

export const wrapRootElement = ({ element }) => {
  const { MDXProvider } = require("@mdx-js/react");
  return (
    <MDXProvider
      components={{
        LazyVideo,
        PromptComposer,
        PromptGrader,
        TweetThreadGenerator,
      }}
    >
      {element}
    </MDXProvider>
  );
};

// Preserve existing JS onRenderBody implementation (migrated from gatsby-ssr.js)
export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
      key="viewport"
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
          jobTitle: "Software Engineer & AI Researcher",
          description:
            "AI researcher and software engineer exploring LLMs, agentic AI, brain-computer interfaces, and next-generation reasoning systems.",
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
            "AI researcher and software engineer Aditya Karnam explores the frontiers of artificial intelligence — from LLMs and agentic AI to brain-computer interfaces and next-generation reasoning systems.",
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
