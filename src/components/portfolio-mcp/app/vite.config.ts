import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: dirname,
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: path.join(dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.join(dirname, "mcp-app.html"),
    },
  },
})
