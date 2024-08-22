import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { libInjectCss } from "vite-plugin-lib-inject-css";

import * as packageJson from "./package.json";

export default defineConfig({
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
});
