import { resolve } from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { libInjectCss } from "vite-plugin-lib-inject-css";

import * as packageJson from "./package.json";

import { visualizer } from "rollup-plugin-visualizer";

// When deploying the demo page, `base:` needs to be the full subpath of the URL.
// e.g. if deployed to `domain.com/pr-preview/pr-5`, then you need to set `base: '/pr-preview/pr-5'`
// read it from an env variable to allow the various different deploy destinations.

export default defineConfig(({ mode }) => {
  if (mode === "lib") {
    return {
      plugins: [
        react(),
        libInjectCss(),
        tailwindcss(),
        visualizer({
          filename: "./dist/stats.html",
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
      ],
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
    plugins: [react(), tailwindcss()],
    base: process.env.VITE_BASE_PATH || "/",
    build: {
      outDir: "dist/app",
    },
  };
});
