import { defineConfig } from "vite";

export default defineConfig({
  base: "/postgre/",
  // PGlite는 내부적으로 top-level await와 자체 번들된 wasm/데이터 자산을 쓰기 때문에,
  // esbuild의 dep 사전 번들링이 건드리면 자산 경로가 깨진다. @vue/repl과 같은 이유로 제외한다.
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    target: "esnext",
  },
  server: {
    host: true,
    watch: process.env.VITE_WATCH_POLL ? { usePolling: true } : undefined,
  },
});
