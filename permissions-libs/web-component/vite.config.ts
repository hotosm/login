import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/hotosm-share-dialog.ts"),
      formats: ["es"],
      fileName: () => "hotosm-share-dialog.js",
    },
    rollupOptions: {
      // Left to the tool's bundler, so it dedupes them with its own copies.
      external: [/^lit($|\/)/, /^@lit\//, /^@awesome\.me\/webawesome($|\/)/],
    },
  },
});
