import * as React from "react";
import LazyVideo from "./src/components/LazyVideo";
import PromptComposer from "./src/components/PromptComposer";
import PromptGrader from "./src/components/PromptGrader";
import FablePromptGrader from "./src/components/FablePromptGrader";
import TweetThreadGenerator from "./src/components/TweetThreadGenerator";

// A small easter egg for anyone curious enough to open devtools.
export const onClientEntry = () => {
  const style = "color:#f97316;font-size:13px;font-weight:600;";
  const verse = "color:#94a3b8;font-style:italic;font-size:12px;";
  console.log("%c👋 hey, curious dev.", style);
  console.log(
    "%cश्रीगुरु चरन सरोज रज निज मन मुकुरु सुधारि।\nबरनउं रघुबर बिमल जसु जो दायकु फल चारि।।\n\nजय हनुमान ज्ञान गुण सागर। जय कपीश तिहुं लोक उजागर।।",
    verse
  );
  console.log(
    "%cOpening lines of the Hanuman Chalisa — full text: https://www.hanumanchalisa.co/",
    "color:#64748b;font-size:11px;"
  );
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
