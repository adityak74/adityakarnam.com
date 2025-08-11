// gatsby-ssr.js
// Injects Cronitor RUM tracking script into <head>

import React from "react";

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <script
      key="cronitor-rum-script"
      async
      src="https://rum.cronitor.io/script.js"
    />,
    <script
      key="cronitor-rum-config"
      dangerouslySetInnerHTML={{
        __html: `window.cronitor = window.cronitor || function() { (window.cronitor.q = window.cronitor.q || []).push(arguments); };\ncronitor('config', { clientKey: 'a1dafbd7a3d4ccf2454f3d67f1a4c6c3' });`
      }}
    />
  ]);
};
