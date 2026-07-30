import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/react/",
  plugins: [react()],
  server: {
    host: true,
    // Docker(특히 Windows) bind mount는 파일시스템 이벤트를 못 넘겨받을 때가 있어 폴링으로 대체한다.
    watch: process.env.VITE_WATCH_POLL ? { usePolling: true } : undefined,
    proxy: {
      "/api": process.env.VITE_API_PROXY_TARGET ?? "http://localhost:4000",
    },
  },
});
