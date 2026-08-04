/**
 * HTML/CSS 실습용 라이브 프리뷰 플레이그라운드.
 *
 * tsPlayground.ts와 짝을 이루는 컴포넌트지만, 여기서는 타입 검사 대신 HTML/CSS를
 * 그대로 iframe(srcdoc)에 렌더링해서 "고친 즉시 눈으로 확인"하는 것이 목적이다.
 * sandbox="allow-scripts"만 주고 allow-same-origin은 주지 않아 iframe 내부 코드가
 * 부모 페이지(document, localStorage 등)에 접근하지 못하게 막는다.
 */
export interface HtmlCssPlaygroundOptions {
  html: string;
  css: string;
}

let instanceCounter = 0;

function buildSrcdoc(html: string, css: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: system-ui, sans-serif; margin: 1rem; color: #1a1a1a; }
      ${css}
    </style>
  </head>
  <body>
    ${html}
  </body>
</html>`;
}

/** 에디터(HTML/CSS 탭) + 프리뷰 iframe UI를 container 안에 그리고, 입력할 때마다(디바운스) 다시 렌더링한다. */
export function mountHtmlCssPlayground(container: HTMLElement, opts: HtmlCssPlaygroundOptions): void {
  const id = `html-css-playground-${instanceCounter++}`;
  const initialHtml = opts.html.trim();
  const initialCss = opts.css.trim();

  container.innerHTML = `
    <div class="html-css-playground-wrapper">
      <div class="html-css-playground-toolbar">
        <span class="html-css-playground-label">코드를 직접 수정해보세요</span>
        <div class="html-css-playground-tabs" role="tablist">
          <button type="button" class="html-css-playground-tab active" id="${id}-tab-html">HTML</button>
          <button type="button" class="html-css-playground-tab" id="${id}-tab-css">CSS</button>
        </div>
        <button type="button" class="html-css-playground-reset" id="${id}-reset">⟳ 초기 코드로 되돌리기</button>
      </div>
      <div class="html-css-playground-body">
        <div class="html-css-playground-editor-pane">
          <textarea class="html-css-playground-editor" id="${id}-editor-html" spellcheck="false" autocapitalize="off"></textarea>
          <textarea class="html-css-playground-editor" id="${id}-editor-css" spellcheck="false" autocapitalize="off" hidden></textarea>
        </div>
        <iframe class="html-css-playground-preview" id="${id}-preview" title="미리보기" sandbox="allow-scripts"></iframe>
      </div>
    </div>
  `;

  const htmlEditor = container.querySelector<HTMLTextAreaElement>(`#${id}-editor-html`)!;
  const cssEditor = container.querySelector<HTMLTextAreaElement>(`#${id}-editor-css`)!;
  const preview = container.querySelector<HTMLIFrameElement>(`#${id}-preview`)!;
  const tabHtml = container.querySelector<HTMLButtonElement>(`#${id}-tab-html`)!;
  const tabCss = container.querySelector<HTMLButtonElement>(`#${id}-tab-css`)!;
  const resetBtn = container.querySelector<HTMLButtonElement>(`#${id}-reset`)!;

  htmlEditor.value = initialHtml;
  cssEditor.value = initialCss;

  function selectTab(tab: "html" | "css") {
    const showHtml = tab === "html";
    htmlEditor.hidden = !showHtml;
    cssEditor.hidden = showHtml;
    tabHtml.classList.toggle("active", showHtml);
    tabCss.classList.toggle("active", !showHtml);
  }

  let debounceTimer: number | undefined;
  function renderPreview() {
    preview.srcdoc = buildSrcdoc(htmlEditor.value, cssEditor.value);
  }
  function scheduleRender() {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(renderPreview, 300);
  }

  tabHtml.addEventListener("click", () => selectTab("html"));
  tabCss.addEventListener("click", () => selectTab("css"));
  htmlEditor.addEventListener("input", scheduleRender);
  cssEditor.addEventListener("input", scheduleRender);
  resetBtn.addEventListener("click", () => {
    htmlEditor.value = initialHtml;
    cssEditor.value = initialCss;
    renderPreview();
  });

  renderPreview();
}
