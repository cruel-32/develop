import { defineConfig } from "vite";

export default defineConfig({
  base: "/typescript/",
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
