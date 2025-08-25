import * as React from "react";
import LazyVideo from "./src/components/LazyVideo";
import PromptComposer from "./src/components/PromptComposer";
import PromptGrader from "./src/components/PromptGrader";
import TweetThreadGenerator from "./src/components/TweetThreadGenerator";

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
        TweetThreadGenerator,
      }}
    >
      {element}
    </MDXProvider>
  );
};
