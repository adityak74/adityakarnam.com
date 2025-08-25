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
