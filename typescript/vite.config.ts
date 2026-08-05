import { defineConfig } from "vite";

export default defineConfig({
  base: "/typescript/",
  server: {
    host: true,
    watch: process.env.VITE_WATCH_POLL ? { usePolling: true } : undefined,
    proxy: {
      "/api": process.env.VITE_API_PROXY_TARGET ?? "http://localhost:4000",
    },
  },
});
