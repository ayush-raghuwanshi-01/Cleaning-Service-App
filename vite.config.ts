import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";

const projectRoot = import.meta.dirname ?? process.cwd();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Auto-generates the type-safe route tree from src/routes.
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    // Allow the sandbox preview host and any custom domain.
    allowedHosts: true,
    // Proxy API calls to the local FastAPI backend during development.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
