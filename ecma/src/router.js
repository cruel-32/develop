/**
 * 프레임워크 없는(vanilla) 최소 클라이언트 라우터.
 *
 * 내부 라우트 경로는 항상 "/"로 시작한다("" 홈 -> "/"). 실제 브라우저 URL은
 * `import.meta.env.BASE_URL`("/ecma/")을 접두어로 붙인 값이다.
 */

const routes = [];
let contentContainer = null;
let afterNavigate = null;

export function toRoutePath(menuPath) {
  return "/" + (menuPath ?? "");
}

function normalize(path) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path === "" ? "/" : path;
}

export function registerRoute(menuPath, render) {
  routes.push({ path: normalize(toRoutePath(menuPath)), render });
}

function currentRoutePath() {
  const base = import.meta.env.BASE_URL; // 예: "/ecma/"
  let path = location.pathname;
  if (path.startsWith(base)) {
    path = "/" + path.slice(base.length);
  }
  return normalize(path);
}

function toFullUrl(routePath) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const suffix = routePath === "/" ? "" : routePath;
  return base + suffix;
}

function updateActiveLinks(routePath) {
  document.querySelectorAll("a[data-route]").forEach((a) => {
    const linkPath = normalize(a.dataset.route ?? "/");
    a.classList.toggle("active", linkPath === routePath);
  });
}

function renderCurrentRoute() {
  if (!contentContainer) return;
  const routePath = currentRoutePath();
  const route = routes.find((r) => r.path === routePath);

  contentContainer.innerHTML = "";
  try {
    if (route) {
      route.render(contentContainer);
    } else {
      contentContainer.innerHTML = `<article><h1>페이지를 찾을 수 없습니다</h1><p class="hint">${routePath}</p></article>`;
    }
  } catch (err) {
    console.error("[router] page render failed", err);
    contentContainer.innerHTML = `
      <div class="crash-box">
        <h2>페이지를 표시하는 중 문제가 발생했습니다</h2>
        <p class="error">${err instanceof Error ? err.message : String(err)}</p>
      </div>
    `;
  }

  updateActiveLinks(routePath);
  afterNavigate?.(routePath);
}

export function navigate(routePath) {
  const normalized = normalize(routePath);
  const url = toFullUrl(normalized);
  if (location.pathname !== url) {
    history.pushState({}, "", url);
  }
  renderCurrentRoute();
  window.scrollTo(0, 0);
}

export function initRouter(container, onNavigate) {
  contentContainer = container;
  afterNavigate = onNavigate ?? null;

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-route]");
    if (!link) return;
    event.preventDefault();
    navigate(link.dataset.route ?? "/");
  });

  window.addEventListener("popstate", renderCurrentRoute);

  renderCurrentRoute();
}
