import type { PageRender } from "../../../router";
import { mountHtmlCssPlayground } from "../../../htmlCssPlayground";
import { codeBlock } from "../../../pageHelpers";

const INPUT_TYPES = `
<input type="email" required>
<input type="url">
<input type="tel" pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}">
<input type="number" min="1" max="10">
<input type="date">
<input type="color">
<input type="range" min="0" max="100">
`;

const PLAYGROUND_HTML = `
<form id="signup">
  <label>
    이메일
    <input type="email" required placeholder="you@example.com">
  </label>

  <label>
    닉네임 (영문/숫자 3~10자)
    <input type="text" required pattern="[A-Za-z0-9]{3,10}" placeholder="nickname">
  </label>

  <label>
    나이
    <input type="number" min="14" max="120" required>
  </label>

  <button type="submit">가입하기</button>
</form>
`;

const PLAYGROUND_CSS = `
form { display: flex; flex-direction: column; gap: 0.9rem; max-width: 20rem; }
label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; color: #333; }
input {
  padding: 0.5rem 0.65rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* :invalid는 페이지 로드 즉시(사용자가 손도 대기 전에) 적용된다 - 첫인상이 나쁘다 */
/* input:invalid { border-color: red; } 대신 :user-invalid를 쓴다 */

/* :user-invalid: 사용자가 값을 입력/포커스아웃한 "이후"에만 걸린다 */
input:user-invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

input:user-valid {
  border-color: #22c55e;
}

button {
  padding: 0.6rem;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>신규 input type과 Constraint Validation API</h1>
      <p>
        <code>type="text"</code>와 JS 정규식 검증에만 의존하던 시절과 달리, HTML5는
        의미 있는 <code>input</code> 타입과 선언적 검증 속성을 제공합니다. 브라우저가
        모바일 키보드 레이아웃(숫자패드, 이메일 키보드 등)까지 알아서 바꿔줍니다.
      </p>
      ${codeBlock(INPUT_TYPES, "의미별 input type")}

      <h2 id="constraint-validation">선언적 검증: required / pattern / min / max</h2>
      <p>
        <code>required</code>, <code>pattern</code>, <code>min</code>/<code>max</code>,
        <code>minlength</code>/<code>maxlength</code> 속성만으로 폼 제출 시점에 브라우저가
        자동으로 검증하고, 실패하면 네이티브 말풍선으로 이유를 보여줍니다. JS로는
        <code>input.validity</code>(<code>ValidityState</code>)와
        <code>input.setCustomValidity()</code>로 커스텀 에러 메시지를 얹을 수 있습니다.
      </p>

      <h2 id="user-invalid">:invalid보다 :user-invalid</h2>
      <p>
        <code>:invalid</code>는 사용자가 아무것도 입력하기 전, 페이지가 막 로드된
        순간에도 <code>required</code> 필드에 걸려버립니다 — 손도 대지 않았는데 빨간
        테두리부터 보이는 나쁜 UX입니다. 상대적으로 최신 가상 클래스인
        <code>:user-invalid</code>/<code>:user-valid</code>는 사용자가 실제로 값을
        입력하거나 포커스를 벗어난 "이후"에만 적용되어 이 문제를 해결합니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        닉네임 필드를 클릭했다가 아무것도 입력하지 않고 벗어나 보세요(포커스아웃) —
        그제서야 빨간 테두리가 나타납니다. 페이지가 처음 열렸을 때는 아무 필드도 빨갛지
        않았다는 점이 <code>:user-invalid</code>의 핵심입니다. CSS 탭에서
        <code>:user-invalid</code>를 <code>:invalid</code>로 바꿔서 차이를 비교해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: PLAYGROUND_HTML,
    css: PLAYGROUND_CSS,
  });
};
