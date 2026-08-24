import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// build.target and optimizeDeps.esbuildOptions.target are "esnext" because
// react-globe.gl's dependency (three.js) ships a top-level
// `await navigator.gpu.requestAdapter()` WebGPU capability check, which
// Vite's default esbuild target can't transpile.
//
// resolve.dedupe forces a single shared instance of "three" across the
// dependency graph. react-globe.gl bundles its own internal copy of three;
// if "three" is also listed as a direct dependency (or gets duplicated via
// nested node_modules), two separate Three.js module instances end up
// loaded at once. Their internal classes (e.g. Matrix4) are then
// version-mismatched, causing runtime errors like
// "matrixWorld.determinantAffine is not a function" and a blank/crashed
// globe. Removing "three" from package.json direct dependencies plus this
// dedupe config ensures only one Three.js instance is ever bundled.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    dedupe: ["three"],
  },
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
});
