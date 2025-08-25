import * as React from "react";
import LazyVideo from "../../../components/LazyVideo";
import PromptComposer from "../../../components/PromptComposer";
import PromptGrader from "../../../components/PromptGrader";

// This file allows MDX in the minimal-blog theme to use components directly
// by mapping the MDX component name.

// The theme expects a default export of the components mapping. Some setups also
// look for a named export "components" so we provide both.
export const components = {
  LazyVideo,
  PromptComposer,
  PromptGrader,
};

export default components;
