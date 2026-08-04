import type { PageRender } from "../../../router";
import { mountHtmlCssPlayground } from "../../../htmlCssPlayground";
import { codeBlock } from "../../../pageHelpers";

const NO_PARENT_SELECTOR = `
/* CSS에는 오랫동안 "부모 선택자"가 없었다.
   자식의 상태를 보고 부모를 스타일링하려면 JS로 클래스를 토글해야 했다: */
input.addEventListener("invalid", () => {
  input.closest(".field").classList.add("has-error");
});
`;

const HAS_SYNTAX = `
/* :has()는 "부모 선택자"이자 "관계 선택자"다 */
.field:has(input:invalid) { border-color: red; }      /* 자식 상태로 부모 선택 */
.card:has(img) { padding: 0; }                          /* 특정 자손이 있는지 */
h2:has(+ p.lead) { margin-bottom: 0.25rem; }             /* 다음 형제 존재 여부 */
li:has(~ li:hover) { opacity: 0.5; }                     /* 이후 형제의 상태 */
`;

const PLAYGROUND_HTML = `
<form>
  <div class="field">
    <label>이메일</label>
    <input type="email" required value="not-an-email">
  </div>

  <div class="field">
    <label>이름</label>
    <input type="text" required value="홍길동">
  </div>
</form>

<div class="cards">
  <div class="card">
    <img src="https://placehold.co/60x60" alt="">
    <p>이미지가 있는 카드</p>
  </div>
  <div class="card">
    <p>이미지가 없는 카드</p>
  </div>
</div>
`;

const PLAYGROUND_CSS = `
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.6rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

/* JS 없이, 순수 CSS만으로 "이 안의 input이 invalid면 부모(.field) 테두리를 빨갛게" */
.field:has(input:invalid) {
  border-color: #ef4444;
  background: #fef2f2;
}

.cards { display: flex; gap: 0.75rem; margin-top: 1rem; }

.card {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
}

.card img { width: 100%; display: block; border-radius: 8px 8px 0 0; }
.card p { margin: 0.5rem; font-size: 0.85rem; }

/* 이미지가 있는 카드만 내부 여백을 다르게 - 자손의 존재 여부로 부모를 분기 */
.card:has(img) {
  padding: 0;
}

.card:not(:has(img)) {
  padding: 1.5rem 0.5rem;
  background: #f8fafc;
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>:has() — CSS가 오랫동안 갖지 못했던 부모 선택자</h1>
      <p>
        "이 자식 요소가 이런 상태일 때 부모를 다르게 스타일링하고 싶다"는 아주 흔한
        요구였지만, CSS는 형제나 조상을 거슬러 선택하는 방법을 제공한 적이 없었습니다.
        그래서 이런 케이스는 항상 JS로 클래스를 토글해야 했습니다.
      </p>
      ${codeBlock(NO_PARENT_SELECTOR, "이전: JS로 부모에 클래스 토글")}

      <h2 id="relational">관계 선택자로서의 :has()</h2>
      <p>
        <code>:has()</code>는 흔히 "부모 선택자"로 소개되지만, 사실은 더 일반적인
        <strong>관계 선택자(relational selector)</strong>입니다. 괄호 안에 어떤 선택자를
        넣든 "그 조건을 만족하는 무언가가 내부/이후에 있는 요소"를 고를 수 있습니다.
      </p>
      ${codeBlock(HAS_SYNTAX, ":has()의 다양한 활용")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        이메일 필드는 <code>value="not-an-email"</code>이라 <code>:invalid</code>
        상태입니다 — 그래서 부모 <code>.field</code>가 빨갛게 표시됩니다. HTML 탭에서
        그 값을 <code>you@example.com</code>처럼 유효한 이메일로 고쳐보면 테두리가
        원래대로 돌아갑니다. 카드 두 개는 이미지 유무에 따라
        <code>:has(img)</code>로 패딩이 다르게 적용된 걸 확인할 수 있습니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: PLAYGROUND_HTML,
    css: PLAYGROUND_CSS,
  });
};
