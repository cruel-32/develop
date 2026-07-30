import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import peopleRouter from "./routes/people.js";
import { runMigrations } from "./db/migrate.js";
import { seedIfEmpty } from "./db/seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dist/index.js -> ../public holds the landing page + built frontend bundles
const publicDir = path.join(__dirname, "..", "public");

const app = express();
app.use(express.json());

// 개발 모드에서는 프론트엔드가 별도 vite dev 서버(다른 포트)에서 뜨므로 CORS를 허용한다.
// 프로덕션은 Express가 빌드된 프론트엔드를 같은 오리진에서 서빙하므로 필요 없다.
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
}

app.use("/api/people", peopleRouter);

const FRONTEND_APPS = ["react", "vue", "typescript", "ecma"] as const;

// 개발 모드(docker-compose.local.yml)에서는 각 프론트엔드가 자기 자신의 vite dev 서버
// (별도 호스트 포트)에서 뜨고, backend는 빌드된 정적 파일을 갖고 있지 않다. 이때는
// public/<name>을 서빙하는 대신 그 dev 서버로 리다이렉트한다.
// FRONTEND_DEV_PORTS 형식: "react=5273,vue=5274,typescript=5275,ecma=5276"
const devPorts = new Map(
  (process.env.FRONTEND_DEV_PORTS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, port] = entry.split("=");
      return [name, port] as const;
    }),
);

for (const name of FRONTEND_APPS) {
  const devPort = devPorts.get(name);
  if (devPort) {
    app.get(`/${name}`, (req, res) => {
      res.redirect(`http://${req.hostname}:${devPort}/${name}/`);
    });
    app.get(`/${name}/*`, (req, res) => {
      res.redirect(`http://${req.hostname}:${devPort}${req.originalUrl}`);
    });
    continue;
  }

  const appDir = path.join(publicDir, name);
  app.use(`/${name}`, express.static(appDir));
  // SPA fallback so client-side routing works for deep links under each app
  app.get(`/${name}/*`, (_req, res) => {
    res.sendFile(path.join(appDir, "index.html"));
  });
}

if (devPorts.size > 0) {
  app.get("/", (req, res) => {
    const links = FRONTEND_APPS.map((name) => {
      const devPort = devPorts.get(name);
      const href = devPort ? `http://${req.hostname}:${devPort}/${name}/` : `/${name}`;
      return `<a class="card" href="${href}">${name}</a>`;
    }).join("\n      ");
    res.type("html").send(`<!doctype html>
<html lang="ko">
  <body style="font-family:system-ui,sans-serif;background:#0f172a;color:#f1f5f9;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1.5rem;margin:0;">
    <h1>어떤 프론트엔드를 확인하시겠어요? (개발 모드)</h1>
    <nav style="display:flex;gap:1rem;">
      ${links}
    </nav>
  </body>
</html>`);
  });
} else {
  app.use("/", express.static(path.join(publicDir, "landing")));
}

const port = Number(process.env.PORT) || 4000;

runMigrations()
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to run migrations", err);
    process.exit(1);
  });
