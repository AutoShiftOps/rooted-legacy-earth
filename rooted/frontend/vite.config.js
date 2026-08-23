import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// build.target and optimizeDeps.esbuildOptions.target are both set to
// "esnext" because react-globe.gl's dependency (three.js) ships a
// top-level `await navigator.gpu.requestAdapter()` WebGPU capability check.
// Vite's default esbuild target (chrome87/es2020/etc.) doesn't support
// top-level await, which fails the production build. "esnext" is safe here
// since modern browsers all support top-level await natively.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
});
