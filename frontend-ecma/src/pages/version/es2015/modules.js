import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
// script 태그 여러 개로 전역 스코프를 공유하던 시절
// math.js
var MathUtils = MathUtils || {};
MathUtils.add = function (a, b) { return a + b; };

// main.js — math.js가 먼저 로드되어야 하고, 전역 변수 이름 충돌에 항상 주의해야 했다
console.log(MathUtils.add(1, 2));
`;

const AFTER = `
// math.js
export function add(a, b) {
  return a + b;
}
export const PI = 3.14159;
export default function multiply(a, b) {
  return a * b;
}

// main.js
import multiply, { add, PI } from "./math.js";
console.log(add(1, 2), PI, multiply(2, 3));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>모듈 (import / export) <span class="badge">ES2015</span></h1>
      <p>
        ES2015 이전에는 표준 모듈 시스템이 없어서, 파일을 나누려면 여러 <code>&lt;script&gt;</code>
        태그를 순서대로 로드하며 전역 변수로 값을 주고받거나(위 예시), CommonJS(Node.js의
        <code>require</code>)나 AMD 같은 커뮤니티 표준에 의존해야 했습니다.
      </p>

      <h2 id="before">스크립트 태그 + 전역 변수</h2>
      ${codeBlock(BEFORE, "전역 네임스페이스 객체로 흉내 낸 모듈")}

      <h2 id="after">ES 모듈</h2>
      <p>
        <code>export</code>로 값을 내보내고 <code>import</code>로 가져옵니다. named export는
        <code>{ }</code>로, default export는 이름 없이 하나만 지정할 수 있습니다. 모듈은
        자동으로 자신만의 스코프를 가지므로 전역 변수 충돌 걱정이 없고, 정적 분석이 가능해
        번들러의 tree-shaking(안 쓰는 export 제거)도 가능해졌습니다.
      </p>
      ${codeBlock(AFTER, "export / import")}

      <p class="hint">
        이 학습실 자체도 Vite가 각 페이지 파일을 ES 모듈로 <code>import</code>해서 라우터에
        등록하는 방식으로 동작합니다 — <code>src/main.js</code>를 열어보면 바로 이 문법입니다.
        브라우저에서 직접 실습창으로 재현하기보다는(모듈 로딩은 파일 단위 기능이라
        <code>new Function()</code> 샌드박스로 표현하기 어렵습니다), 코드로 문법을 확인하는
        페이지로 구성했습니다.
      </p>
    </article>
  `;
};
