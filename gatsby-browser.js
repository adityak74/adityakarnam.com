import * as React from "react";
import LazyVideo from "./src/components/LazyVideo";

// Global MDX components mapping for MDXProvider wrapping at runtime
export const wrapRootElement = ({ element }) => {
  // Defer require to avoid SSR mismatch if needed
  const { MDXProvider } = require("@mdx-js/react");
  return (
    <MDXProvider
      components={{
        LazyVideo,
      }}
    >
      {element}
    </MDXProvider>
  );
};
