import { defineConfig } from "vite";

export default defineConfig({
  base: "/ecma/",
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
