# develop.cloudish.cloud

Express + Drizzle ORM 백엔드 하나와, React / Vue / TypeScript(vanilla) / ECMAScript(vanilla)
네 가지로 빌드한 프론트엔드를 같은 오리진에서 서빙하는 서비스입니다.

## 구조

```
.
├── Dockerfile              # 멀티스테이지: 4개 프론트엔드 + 백엔드 빌드 -> 런타임 이미지
├── docker-compose.yml       # app(Express, 고정 호스트 포트) + db(postgres:17-alpine, 내부 전용)
├── backend/                 # Express API + Drizzle ORM 스키마/마이그레이션
│   ├── src/
│   │   ├── index.ts         # /, /react, /vue, /typescript, /ecma, /api 라우팅
│   │   ├── db/              # schema.ts, client.ts(drizzle+pg pool), migrate.ts
│   │   └── routes/people.ts # /api/people 페이지네이션 CRUD
│   ├── drizzle/             # drizzle-kit generate 로 생성된 마이그레이션 (커밋됨)
│   └── public/landing/      # 메뉴 랜딩 페이지 (정적 HTML)
├── frontend-react/          # Vite react-ts, base: /react/
├── frontend-vue/            # Vite vue-ts, base: /vue/
├── frontend-typescript/     # Vite vanilla-ts, base: /typescript/
└── frontend-ecma/           # Vite vanilla-js, base: /ecma/ — ES2015~최신 스펙 학습실
```

런타임 이미지 안에서 Express 하나가 다음을 전부 처리합니다:

- `GET /` — 메뉴 랜딩 페이지
- `/react/*`, `/vue/*`, `/typescript/*`, `/ecma/*` — 각 프레임워크로 빌드한 정적 파일 + SPA fallback
- `/api/people` — Drizzle ORM으로 Postgres에 접근하는 페이지네이션 CRUD API
  (`{ id, name, age, job, address? }`, `GET /api/people?page=&pageSize=`로 목록,
  `GET/PUT/DELETE /api/people/:id`로 상세). `id`는 자동 증가가 아니라 클라이언트가
  POST/PUT body에 직접 넣는 값이다 — 중복 id로 생성하거나 기존 레코드의 id를 다른 값으로
  바꿔 저장(PK 변경)하면 `409`로 충돌을 알려준다.

네 프론트엔드 모두 동일하게 `/api/people`을 호출해 페이지네이션이 있는 목록 조회/생성/삭제와
개별 레코드 상세 조회/수정/삭제(master-detail)를 지원하는 CRUD Demo 화면을 갖고 있습니다.
최초 배포 시(테이블이 비어있을 때) 예시 인물 12명이 자동으로 채워집니다(`backend/src/db/seed.ts`).

`frontend-ecma`는 TypeScript 학습실과 달리 CDN에서 컴파일러를 불러와 타입 검사를 흉내내는
대신, 브라우저 자체 JS 엔진으로 코드를 직접 실행하고 `console.log` 출력을 캡처해 보여주는
라이브 실습창을 갖고 있습니다(`src/ecmaPlayground.js`). ES2015(ES6)부터 ES2025까지 연도별로
핵심 기능 페이지가 정리되어 있습니다.

## 로컬 개발

각 프로젝트는 독립된 `package.json`을 가진 별도 패키지입니다 (workspace 아님).

```bash
# 백엔드
cd backend
npm install
cp .env.example .env   # DATABASE_URL이 로컬에 뜬 postgres를 가리키는지 확인
npm run dev             # tsx watch, http://localhost:4000

# 프론트엔드 (각각 별도 터미널)
cd frontend-react && npm install && npm run dev   # http://localhost:5173
cd frontend-vue && npm install && npm run dev
cd frontend-typescript && npm install && npm run dev
cd frontend-ecma && npm install && npm run dev
```

`docker-compose.yml`의 `db`는 기본적으로 호스트에 포트를 노출하지 않으므로,
컨테이너 밖에서 백엔드만 단독 실행하려면 임시로 `db` 서비스에 `ports: ["5432:5432"]`를
추가하고 `docker compose up -d db`로 Postgres만 띄운 뒤 개발하세요.

프론트엔드 dev 서버는 `vite.config.ts`의 `server.proxy`로 `/api` 요청을
`http://localhost:4000`으로 프록시하므로, 백엔드를 먼저 띄워두면 CRUD 데모가
로컬에서도 그대로 동작합니다.

### 스키마 변경 시

`backend/src/db/schema.ts`를 수정한 뒤:

```bash
cd backend
npm run db:generate   # drizzle/ 아래에 새 마이그레이션 SQL 생성
```

생성된 마이그레이션은 커밋하세요. 컨테이너 시작 시 `runMigrations()`가
자동으로 `drizzle/` 폴더의 마이그레이션을 적용한 뒤 서버를 기동합니다.

## 배포 (docker compose)

```bash
cp .env.example .env
# .env 에서 POSTGRES_PASSWORD를 실제 값으로 변경, 필요하면 APP_PORT도 조정

docker compose up -d --build
```

- `app` 컨테이너는 `.env`의 `APP_PORT`(기본 4000)를 호스트에 고정 바인딩합니다.
  홈서버에 이미 떠 있는 리버스 프록시가 `develop.cloudish.cloud` → `127.0.0.1:${APP_PORT}`로
  포워딩하도록 설정하면 됩니다. (TLS는 기존 프록시가 처리, 이 스택은 관여하지 않음)
- `db` 컨테이너는 호스트에 포트를 노출하지 않고 compose 내부 네트워크에서만 `app`과 통신합니다.
- Postgres 데이터는 `db-data` named volume에 영속화됩니다.

## CI/CD (GitHub Actions → 홈서버 자동 배포)

`master`에 push하면 `.github/workflows/deploy.yml`이 SSH로 홈서버에 접속해
`git pull` → `docker compose up -d --build`(멀티스테이지 Dockerfile이 backend +
frontend-react/vue/typescript를 전부 다시 빌드) → 오래된 이미지 정리 → 헬스체크(`curl /`)
순으로 배포합니다. `workflow_dispatch`로 수동 실행도 가능하고, 연달아 push해도
`concurrency` 그룹으로 배포가 겹쳐 실행되지 않습니다.

### 최초 1회 설정 (홈서버 쪽)

```bash
# 1) 배포 전용 SSH 키 생성 (로컬에서)
ssh-keygen -t ed25519 -f ./deploy_key -C "github-actions-deploy" -N ""

# 2) 공개키를 홈서버의 authorized_keys에 등록
ssh-copy-id -i ./deploy_key.pub -p <SSH_PORT> <SSH_USER>@<SSH_HOST>

# 3) 홈서버에 저장소를 미리 한 번 clone해둔다 (PROJECT_DIR로 쓸 경로)
ssh <SSH_USER>@<SSH_HOST> "git clone https://github.com/<owner>/<repo>.git ~/develop"

# 4) <SSH_USER>가 docker 명령을 sudo 없이 쓸 수 있어야 함
ssh <SSH_USER>@<SSH_HOST> "sudo usermod -aG docker <SSH_USER>"
```

### 최초 1회 설정 (GitHub 저장소 쪽)

`Settings → Secrets and variables → Actions → New repository secret`에 아래 5개를 등록:

| Secret | 값 |
|---|---|
| `SSH_HOST` | 홈서버 접속 주소 (IP 또는 도메인) |
| `SSH_PORT` | SSH 포트 (생략하면 기본값 22) |
| `SSH_USER` | SSH 접속 계정 |
| `SSH_PRIVATE_KEY` | 위에서 만든 `deploy_key`의 **개인키 전체 내용** (`cat ./deploy_key`) |
| `PROJECT_DIR` | 홈서버에서 저장소를 clone해둔 절대 경로 (예: `/home/ubuntu/develop`) |

`deploy_key`(개인키) 파일은 GitHub Secret에 등록한 뒤 로컬/서버 어디에도 남기지 말고 삭제할 것.

## 새 프론트엔드 추가하기

1. `frontend-<name>/` 디렉토리에 Vite 프로젝트 생성, `vite.config.ts`에 `base: "/<name>/"` 설정
2. 루트 `Dockerfile`에 빌드 스테이지 추가 후 런타임 스테이지에 `COPY --from=<name>-build /app/dist ./public/<name>` 추가
3. `backend/src/index.ts`의 `FRONTEND_APPS` 배열에 `"<name>"` 추가
4. `backend/public/landing/index.html`에 메뉴 링크 추가
