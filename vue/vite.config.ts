import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/vue/",
  plugins: [vue()],
  // @vue/repl 자체 번들을 Vite의 dep 사전 최적화가 건드리면 깨지므로 공식 문서대로 제외한다.
  optimizeDeps: {
    exclude: ["@vue/repl"],
  },
  server: {
    host: true,
    watch: process.env.VITE_WATCH_POLL ? { usePolling: true } : undefined,
    proxy: {
      "/api": process.env.VITE_API_PROXY_TARGET ?? "http://localhost:4000",
    },
  },
});
