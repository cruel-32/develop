import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function applyDefaults(config) {
  if (!config.timeout) {
    config.timeout = 3000;
  }
  if (config.debug === null || config.debug === undefined) {
    config.debug = false;
  }
  config.cache = config.cache || {};
  return config;
}
`;

const AFTER = `
function applyDefaults(config) {
  config.timeout ||= 3000;      // falsy면 대입 (0, ""도 대체됨에 주의)
  config.debug ??= false;       // null/undefined일 때만 대입
  config.cache &&= freezeCache(config.cache); // 이미 값이 있을 때만 변환해서 재대입
  return config;
}

function freezeCache(cache) {
  console.log("캐시 동결");
  return Object.freeze(cache);
}

console.log(applyDefaults({ cache: { a: 1 } }));
console.log(applyDefaults({}));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>논리 할당 연산자 <span class="badge">ES2021</span></h1>
      <p>
        "값이 없을 때만 기본값을 채운다", "값이 있을 때만 변환해서 다시 저장한다" 같은 패턴은
        <code>if</code>문이나 삼항 연산자로 매번 풀어써야 했습니다.
      </p>

      <h2 id="before">if문으로 조건부 대입</h2>
      ${codeBlock(BEFORE, "if문 / 삼항 연산자")}

      <h2 id="after">||= / ??= / &amp;&amp;=</h2>
      <p>
        <code>a ||= b</code>는 <code>a = a || b</code>, <code>a ??= b</code>는
        <code>a = a ?? b</code>, <code>a &amp;&amp;= b</code>는 <code>a = a &amp;&amp; b</code>의
        축약형입니다. 일반 산술 복합 대입(<code>+=</code> 등)과 다르게, 이 세 연산자는
        <strong>단축 평가</strong>되어 조건에 따라 오른쪽이 아예 실행되지 않을 수 있습니다.
      </p>
      ${codeBlock(AFTER, "||= / ??= / &&=")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>cache</code>가 없는 <code>{}</code>를 넘기면 <code>&amp;&amp;=</code>의 오른쪽
        (<code>freezeCache</code> 호출)이 아예 실행되지 않아 "캐시 동결" 로그가 찍히지 않는
        것을 확인해보세요 — 단축 평가의 핵심입니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2021",
    code: AFTER,
  });
};
