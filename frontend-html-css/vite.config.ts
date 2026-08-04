import { defineConfig } from "vite";

export default defineConfig({
  base: "/html-css/",
  server: {
    host: true,
    watch: process.env.VITE_WATCH_POLL ? { usePolling: true } : undefined,
  },
});
