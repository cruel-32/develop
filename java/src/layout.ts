import { menuTree, type MenuNode } from "./menu";
import { toRoutePath } from "./router";

function renderMenuNode(node: MenuNode): string {
  if (node.children) {
    return `
      <details class="menu-group" open>
        <summary>${node.label}</summary>
        <div class="menu-children">
          ${node.children.map(renderMenuNode).join("")}
        </div>
      </details>
    `;
  }
  const routePath = toRoutePath(node.path);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const href = base + (routePath === "/" ? "" : routePath);
  return `<a class="menu-link" href="${href}" data-route="${routePath}">${node.label}</a>`;
}

/**
 * topbar/sidebar/content/page-index 뼈대를 한 번 그리고, 라우터가 렌더링할 콘텐츠
 * 컨테이너를 반환한다.
 */
export function mountLayout(root: HTMLElement): { contentEl: HTMLElement; pageIndexEl: HTMLElement } {
  root.innerHTML = `
    <div class="layout">
      <header class="topbar">
        <a class="back" href="/">← 전체 메뉴로</a>
        <span class="topbar-title">Java 학습실</span>
      </header>
      <div class="body">
        <nav class="sidebar">
          ${menuTree.map(renderMenuNode).join("")}
        </nav>
        <main class="content" id="content"></main>
        <aside class="page-index" id="page-index" hidden></aside>
      </div>
    </div>
  `;

  return {
    contentEl: root.querySelector<HTMLElement>("#content")!,
    pageIndexEl: root.querySelector<HTMLElement>("#page-index")!,
  };
}
