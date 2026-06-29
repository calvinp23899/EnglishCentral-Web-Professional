import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  cacheDir: command === "serve" ? `.vite-dev-${process.pid}` : ".vite",
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
}));
