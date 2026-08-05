import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
// config.js — 모듈 최상위는 async 함수가 아니므로 await를 바로 쓸 수 없었다
async function loadConfig() {
  const res = await fetch("/config.json");
  return res.json();
}

let config;
loadConfig().then((c) => { config = c; }); // 이 즉시실행 함수(IIFE) 패턴을 어디서든 반복해야 했다

export { config }; // 문제: export되는 시점엔 아직 config가 undefined일 수 있다 (경쟁 상태)
`;

const AFTER = `
// config.js (ES 모듈)
const res = await fetch("/config.json"); // 모듈 최상위에서 바로 await
export const config = await res.json();

// 이 모듈을 import하는 쪽은 자동으로 config가 완전히 로드된 뒤의 값을 받는다.
// import { config } from "./config.js";
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>top-level await <span class="badge">ES2022</span></h1>
      <p>
        ES2017의 <code>await</code>는 <code>async</code> 함수 안에서만 쓸 수 있었습니다.
        모듈 최상위에서 초기화 시점에 비동기 작업(설정 파일 로드, DB 연결 등)이 필요하면
        <code>async</code> IIFE로 감싸고, 결과를 나중에 채워지는 변수에 대입하는 우회가
        흔했습니다 — import하는 쪽이 그 값이 준비됐는지 알 방법이 마땅치 않았습니다.
      </p>

      <h2 id="before">async IIFE로 우회</h2>
      ${codeBlock(BEFORE, "즉시실행 async 함수 + 나중에 채워지는 변수")}

      <h2 id="after">모듈 최상위 await</h2>
      <p>
        ES 모듈(<code>&lt;script type="module"&gt;</code> 또는 번들러의 ESM) 최상위에서
        <code>await</code>를 바로 쓸 수 있습니다. 이 모듈을 <code>import</code>하는 다른
        모듈은 이 모듈의 최상위 await가 모두 끝날 때까지 자동으로 기다린 뒤 로드됩니다 —
        "완전히 초기화된 뒤의 값"이 보장됩니다.
      </p>
      ${codeBlock(AFTER, "모듈 최상위 await")}

      <p class="hint">
        top-level await는 <strong>ES 모듈에서만</strong> 동작하는 기능이라(일반
        <code>&lt;script&gt;</code>나 CommonJS에서는 불가능), 이 학습실의 다른 페이지처럼
        <code>new Function()</code> 샌드박스(모듈이 아닌 일반 함수 스코프) 안에서는 재현할 수
        없습니다. 대신 이 페이지는 코드로 문법과 동작을 설명합니다. 브라우저 콘솔이나
        <code>&lt;script type="module"&gt;</code>이 포함된 HTML 파일로 직접 실험해볼 수
        있습니다.
      </p>
    </article>
  `;
};
