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
