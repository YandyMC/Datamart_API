import { defineConfig, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
//import node from "@astrojs/node";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  output: "server",
  devToolbar: {
    enabled: false
  },
  /*
  adapter: node({
    mode: "standalone"
  }),
  */
  build: {
    inlineStylesheets: "always"
  },
  image: {
    service: passthroughImageService()
  },
  vite: {
    build: {
      cssMinify: "lightningcss"
    },
    ssr: {
      noExternal: ["path-to-regexp"]
    }
  },
  integrations: [tailwind()],
  adapter: netlify()
});