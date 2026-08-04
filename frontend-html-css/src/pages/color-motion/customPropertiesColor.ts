import type { PageRender } from "../../../router";
import { mountHtmlCssPlayground } from "../../../htmlCssPlayground";
import { codeBlock } from "../../../pageHelpers";

const OLD_THEME = `
/* 이전: 라이트/다크 값을 각각 다른 변수로 중복 선언하고 미디어 쿼리로 스위칭 */
:root { --bg-light: white; --bg-dark: #0f172a; }
body { background: var(--bg-light); }
@media (prefers-color-scheme: dark) {
  body { background: var(--bg-dark); }
}
`;

const LIGHT_DARK = `
/* light-dark(): 한 줄에 라이트/다크 값을 같이 선언 */
:root {
  color-scheme: light dark; /* 브라우저 기본 UI(스크롤바 등)도 같이 전환됨 */
  --bg: light-dark(white, #0f172a);
  --text: light-dark(#0f172a, #f1f5f9);
}
body { background: var(--bg); color: var(--text); }
`;

const COLOR_MIX = `
/* color-mix(): SCSS의 mix()/darken() 없이도 색을 섞을 수 있다 */
.btn { background: var(--brand); }
.btn:hover {
  background: color-mix(in oklch, var(--brand) 85%, black 15%);
}
`;

const PLAYGROUND_HTML = `
<div class="panel">
  <button id="theme-toggle">🌙 다크 모드 전환</button>
  <button class="btn">저장하기</button>
</div>
`;

const PLAYGROUND_CSS = `
:root {
  color-scheme: light dark;
  /* light-dark()는 첫 값을 라이트 모드에, 두 번째 값을 다크 모드에 쓴다 */
  --bg: light-dark(#ffffff, #0f172a);
  --text: light-dark(#0f172a, #e2e8f0);
  --brand: #3b82f6;
}

body { background: var(--bg); color: var(--text); transition: background 0.2s, color 0.2s; }

.panel { display: flex; gap: 0.75rem; padding: 1.5rem; }

button {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid #64748b;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.btn {
  border: none;
  background: var(--brand);
  color: white;
}

/* color-mix(): 전처리기 없이 색을 섞어 hover 상태를 만든다 */
.btn:hover {
  background: color-mix(in oklch, var(--brand) 85%, black 15%);
}
`;

const PLAYGROUND_SCRIPT_HINT = `
document.getElementById("theme-toggle").addEventListener("click", () => {
  const root = document.documentElement;
  const current = getComputedStyle(root).colorScheme;
  root.style.colorScheme = current.includes("dark") && !current.includes("light")
    ? "light"
    : "dark";
});
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Custom Properties + 새로운 색상 함수</h1>
      <p>
        CSS 변수(<code>--이름</code>) 자체는 오래된 기능이지만, 최근 스펙은 그 위에
        "라이트/다크 값을 한 번에 선언"하고 "전처리기 없이 색을 섞는" 새로운 도구를
        더했습니다.
      </p>

      <h2 id="light-dark">light-dark() — 변수 두 벌을 관리하지 않기</h2>
      <p>
        예전에는 라이트용/다크용 변수를 각각 선언하고 <code>@media
        (prefers-color-scheme: dark)</code> 안에서 매번 다시 대입해줘야 했습니다.
      </p>
      ${codeBlock(OLD_THEME, "이전: 변수를 두 벌 관리")}
      <p>
        <code>light-dark(라이트값, 다크값)</code>은 한 선언 안에 두 값을 같이 넣고,
        <code>color-scheme</code> 값(또는 사용자의 OS 설정)에 따라 브라우저가 알아서
        골라 씁니다.
      </p>
      ${codeBlock(LIGHT_DARK, "light-dark()로 한 번에 선언")}

      <h2 id="color-mix">color-mix() — 전처리기 없이 색 섞기</h2>
      <p>
        Sass의 <code>darken()</code>/<code>mix()</code> 없이도 순수 CSS만으로 두 색을
        섞을 수 있습니다. <code>in oklch</code>처럼 색공간을 지정하면 사람 눈에
        더 균일하게 느껴지는 방식으로 보간됩니다(전통적인 <code>rgb</code> 보간은 중간
        색이 탁하게 느껴질 때가 있습니다).
      </p>
      ${codeBlock(COLOR_MIX, "color-mix()로 hover 색 만들기")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        "다크 모드 전환" 버튼을 눌러보세요 — <code>--bg</code>/<code>--text</code> 변수를
        따로 바꾸는 게 아니라, <code>document.documentElement.style.colorScheme</code>
        하나만 바꿨는데 <code>light-dark()</code>를 쓰는 모든 곳이 함께 전환됩니다.
        "저장하기" 버튼에 마우스를 올려보면 <code>color-mix()</code>로 만든 hover 색도
        확인할 수 있습니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: `${PLAYGROUND_HTML}\n<script>${PLAYGROUND_SCRIPT_HINT}</script>`,
    css: PLAYGROUND_CSS,
  });
};
