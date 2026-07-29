import Prism from "prismjs";
import "prismjs/components/prism-javascript";

export function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

/** 정적(비실행) 코드 예시를 보여줄 때 쓰는 공통 블록. 라이브 실습이 불가능한 경우에도 사용한다. */
export function codeBlock(code, title, language = "javascript") {
  const grammar = Prism.languages[language] ?? Prism.languages.javascript;
  const highlighted = Prism.highlight(code.trim(), grammar, language);
  return `
    <div class="code-block-wrapper">
      ${title ? `<p class="code-title">${escapeHtml(title)}</p>` : ""}
      <pre class="code-block"><code>${highlighted}</code></pre>
    </div>
  `;
}
