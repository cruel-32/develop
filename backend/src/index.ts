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

app.use("/api/people", peopleRouter);

const FRONTEND_APPS = ["react", "vue", "typescript", "ecma"] as const;

for (const name of FRONTEND_APPS) {
  const appDir = path.join(publicDir, name);
  app.use(`/${name}`, express.static(appDir));
  // SPA fallback so client-side routing works for deep links under each app
  app.get(`/${name}/*`, (_req, res) => {
    res.sendFile(path.join(appDir, "index.html"));
  });
}

app.use("/", express.static(path.join(publicDir, "landing")));

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
