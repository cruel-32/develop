import Prism from "prismjs";
import "prismjs/components/prism-java";
import "prismjs/components/prism-sql";
// prismjs 코어 번들에 이미 clike/markup(HTML·XML)이 포함되어 있어 java는 별도 import만
// 있으면 되고(clike를 확장), markup은 core에서 바로 쓸 수 있다.

export function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

/**
 * 정적(비실행) 코드 예시를 보여줄 때 쓰는 공통 블록. 라이브 실습이 불가능한 Spring/외부
 * 모듈 페이지에서는 이 블록이 유일한 코드 표시 수단이라, ecma 학습실과 같은 방식으로
 * Prism.js로 하이라이팅한다(react-live의 vsDark 팔레트와 맞춘 색상 — index.css 참고).
 */
export function codeBlock(code: string, title?: string, language: "java" | "xml" | "sql" = "java"): string {
  const grammar = Prism.languages[language] ?? Prism.languages.java;
  const highlighted = Prism.highlight(code.trim(), grammar, language);
  return `
    <div class="code-block-wrapper">
      ${title ? `<p class="code-title">${escapeHtml(title)}</p>` : ""}
      <pre class="code-block"><code>${highlighted}</code></pre>
    </div>
  `;
}

/**
 * Spring/외부 모듈 페이지처럼 컨테이너·서블릿 환경·DB 연결이 필요해 CheerpJ 브라우저
 * 실행 환경에서 돌릴 수 없는 페이지 맨 위에 붙이는 공통 안내문.
 */
export function staticExampleNote(): string {
  return `
    <p class="hint">
      이 페이지의 코드는 Spring 컨테이너 · 서블릿 환경 · 실제 DB 연결이 필요해, 이
      학습실의 브라우저 실행 환경(CheerpJ)에서는 실행할 수 없습니다. 아래 예제는
      실행이 아니라 읽고 이해하는 용도의 정적 코드입니다.
    </p>
  `;
}
