import type { PageRender } from "../../../router";
import { mountTsPlayground } from "../../../tsPlayground";
import { codeBlock } from "../../../pageHelpers";

const VERSION = "6.0.3";

const BEFORE = `
function processOptions(compilerOptions: Map<string, unknown>) {
  let strictValue: unknown;
  if (compilerOptions.has("strict")) {
    strictValue = compilerOptions.get("strict");
  } else {
    strictValue = true;
    compilerOptions.set("strict", strictValue);
  }
  return strictValue;
}
`;

const AFTER = `
function processOptions(compilerOptions: Map<string, unknown>) {
  return compilerOptions.getOrInsert("strict", true);
}

function processComputed(compilerOptions: Map<string, unknown[]>) {
  return compilerOptions.getOrInsertComputed("plugins", (key) => {
    console.log("계산 중:", key);
    return [];
  });
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Map / WeakMap getOrInsert <span class="ts-playground-version-badge">TypeScript ${VERSION}</span></h1>
      <p>
        "키가 있으면 가져오고, 없으면 기본값을 넣고 그걸 반환한다"는 패턴은 아주 흔합니다.
        ECMAScript의 stage 4에 도달한 "upsert" 제안을 반영해, <code>Map</code>과
        <code>WeakMap</code>에 <code>getOrInsert</code> / <code>getOrInsertComputed</code>가
        새로 생겼습니다. 이 타입 선언은 <code>esnext</code> lib에 포함되어 있습니다.
      </p>

      <h2 id="before">이전 패턴</h2>
      ${codeBlock(BEFORE, "has() + get()/set()을 직접 조합")}

      <h2 id="after">getOrInsert / getOrInsertComputed</h2>
      <p>
        <code>getOrInsert(key, defaultValue)</code>는 위 if/else 블록 전체를 한 줄로
        줄여줍니다. 기본값 계산 비용이 클 때는 <code>getOrInsertComputed(key, callback)</code>를
        쓰면, 콜백은 <strong>키가 실제로 없을 때만</strong> 실행됩니다.
      </p>
      ${codeBlock(AFTER, "getOrInsert로 줄인 코드")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>getOrInsert</code>의 두 번째 인자 타입을 일부러 <code>string</code> 대신
        <code>number</code>로 바꿔보면, <code>Map&lt;string, unknown&gt;</code>의 값 타입과
        맞지 않아 에러가 나는지도 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountTsPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    version: VERSION,
    code: AFTER.trim(),
    compilerOptions: { lib: ["esnext", "dom"], target: "esnext" },
  });
};
