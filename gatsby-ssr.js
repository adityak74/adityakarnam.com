// gatsby-ssr.js
// Injects Cronitor RUM tracking script into <head>

import React from "react";

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
        __html: `window.cronitor = window.cronitor || function() { (window.cronitor.q = window.cronitor.q || []).push(arguments); };\ncronitor('config', { clientKey: 'a1dafbd7a3d4ccf2454f3d67f1a4c6c3' });`
      }}
    />
  ]);
};
