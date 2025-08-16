import * as React from "react";
import LazyVideo from "../../../components/LazyVideo";

// This file allows MDX in the minimal-blog theme to use <LazyVideo /> directly
// by mapping the MDX component name.

// The theme expects a default export of the components mapping. Some setups also
// look for a named export "components" so we provide both.
export const components = {
  LazyVideo,
};

export default components;
