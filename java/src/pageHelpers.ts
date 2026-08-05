export function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

/** 정적(비실행) 코드 예시를 보여줄 때 쓰는 공통 블록. 라이브 실습이 불가능한 경우에도 사용한다. */
export function codeBlock(code: string, title?: string): string {
  return `
    <div class="code-block-wrapper">
      ${title ? `<p class="code-title">${escapeHtml(title)}</p>` : ""}
      <pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre>
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
