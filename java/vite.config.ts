import { defineConfig, type Plugin } from "vite";

/**
 * CheerpJ의 classpath 항목 "/app/tools.jar"는 CheerpJ 런타임이 현재 페이지의
 * "오리진 루트"(base 경로 무시)에서 tools.jar를 가져오는 방식으로 동작한다
 * (프로덕션에서는 backend가 별도로 도메인 루트에 /tools.jar를 서빙한다 —
 * backend/src/index.ts 참고). 로컬 dev 서버는 base가 "/java/"라 Vite가 public/의
 * 정적 파일도 "/java/tools.jar"로만 서빙해서 그대로는 CheerpJ가 못 찾는다.
 *
 * CheerpJ는 이 jar(18MB)를 통째로 받지 않고 HTTP Range 요청으로 필요한 부분만
 * 읽어오므로, 직접 파일을 읽어 응답하면 Range를 지원하지 않아 거부당한다
 * ("HTTP server does not support the 'Range' header"). 그래서 파일을 직접
 * 서빙하는 대신, 요청 URL을 "/java/tools.jar"로 바꿔치기해서 Vite가 이미
 * Range를 올바르게 지원하는 자체 정적 파일 서버가 그대로 처리하게 한다.
 */
function serveToolsJarAtOrigin(): Plugin {
  return {
    name: "serve-tools-jar-at-origin-root",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/tools.jar") {
          req.url = "/java/tools.jar";
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: "/java/",
  plugins: [serveToolsJarAtOrigin()],
  server: {
    host: true,
    watch: process.env.VITE_WATCH_POLL ? { usePolling: true } : undefined,
  },
});
