import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  plugins: [solidPlugin()],
  root: ".",
  build: {
    outDir: "dist",
    target: "esnext",
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
})
