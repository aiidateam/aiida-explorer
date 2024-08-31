import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { libInjectCss } from "vite-plugin-lib-inject-css";

import * as packageJson from "./package.json";

// When deploying the demo page, `base:` needs to be the full subpath of the URL.
// e.g. if deployed to `domain.com/pr-preview/pr-5`, then you need to set `base: '/pr-preview/pr-5'`
// read it from an env variable to allow the various different deploy destinations.

export default defineConfig(({ mode }) => {
  if (mode === "lib") {
    return {
      plugins: [react(), libInjectCss()],
      build: {
        lib: {
          entry: resolve(__dirname, "src/AiidaExplorer/index.jsx"),
          fileName: "main",
          formats: ["es"],
        },
        rollupOptions: {
          external: [...Object.keys(packageJson.peerDependencies)],
        },
      },
    };
  }
  return {
    plugins: [react()],
    base: process.env.VITE_BASE_PATH || "/",
  };
});
