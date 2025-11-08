/* eslint-disable no-undef */
import { resolve } from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { libInjectCss } from "vite-plugin-lib-inject-css";

import * as packageJson from "./package.json";

// When deploying the demo page, `base:` needs to be the full subpath of the URL.
// e.g. if deployed to `domain.com/pr-preview/pr-5`, then you need to set `base: '/pr-preview/pr-5'`
// read it from an env variable to allow the various different deploy destinations.

export default defineConfig(({ mode }) => {
  const common = {
    assetsInclude: ["**/*.wasm"],
  };

  if (mode === "lib") {
    return {
      ...common,
      plugins: [react(), libInjectCss(), tailwindcss()],
      build: {
        lib: {
          entry: resolve(__dirname, "src/lib/index.js"),
          fileName: "main",
          formats: ["es"],
        },
        rollupOptions: {
          external: [
            ...Object.keys(packageJson.peerDependencies),
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
          ],
        },
        outDir: "dist/lib",
      },
    };
  }
  return {
    ...common,
    plugins: [react(), tailwindcss()],
    base: process.env.VITE_BASE_PATH || "/",
    build: {
      outDir: "dist/app",
    },
  };
});
