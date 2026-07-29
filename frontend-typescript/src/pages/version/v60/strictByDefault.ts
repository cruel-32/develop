import type { PageRender } from "../../../router";
import { mountTsPlayground } from "../../../tsPlayground";
import { codeBlock } from "../../../pageHelpers";

const VERSION = "6.0.3";

const SAMPLE = `
function greet(name) {
  return "Hello, " + name.toUpperCase();
}

let user: string | null = null;
console.log(greet(user));
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>strict 기본값 true <span class="ts-playground-version-badge">TypeScript ${VERSION}</span></h1>
      <p>
        TypeScript 6.0부터는 <code>tsconfig.json</code>에 아무것도 적지 않아도
        <code>strict: true</code>가 기본값입니다. 그동안 계속 opt-in이었던 엄격 모드가
        마침내 기본 동작이 된 것입니다. <code>"strict": false</code>를 명시하면 여전히
        끌 수는 있지만, 더 이상 권장되지 않습니다.
      </p>

      <h2 id="why">6.0을 "다리(bridge)" 릴리스라고 부르는 이유</h2>
      <p>
        6.0은 순수 JavaScript(및 자체 컴파일러)로 작성된 마지막 TypeScript 버전입니다.
        strict 모드를 기본값으로 만들어 생태계 전반의 타입 안정성 기준선을 끌어올린 뒤,
        Go로 새로 작성된 네이티브 컴파일러인 7.0으로 넘어갈 발판을 마련했습니다.
      </p>
      ${codeBlock(SAMPLE, "컴파일러 옵션을 아무것도 지정하지 않은 코드")}
      <p>
        이 코드는 5.x 시절 기본 설정(<code>strict</code> 꺼짐)이라면 조용히 통과했습니다.
        <code>name</code>의 타입이 암시적으로 <code>any</code>가 되고, <code>user</code>가
        <code>null</code>일 수 있다는 사실도 무시됐기 때문입니다. 6.0부터는 같은 설정 파일로도
        <code>noImplicitAny</code>와 <code>strictNullChecks</code>가 기본으로 켜져 있습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        이 실습창은 <code>compilerOptions</code>를 <strong>일부러 비워뒀습니다</strong> —
        그런데도 <code>noImplicitAny</code> 위반 에러가 나는 것 자체가 "6.0부터는 기본값이
        strict"라는 사실을 증명합니다. <code>name: string</code>으로 타입을 명시해서 이
        에러를 없애보세요 — 그러면 감춰져 있던 두 번째 문제, <code>greet(user)</code>에
        <code>null</code>을 넘긴다는 <code>strictNullChecks</code> 에러가 새로 나타납니다.
        (<code>name</code>이 <code>any</code>였을 때는 무엇을 넘겨도 통과되어 이 문제가
        가려져 있었습니다.) <code>user ?? ""</code>로 null을 처리하면 완전히 사라집니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountTsPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    version: VERSION,
    code: SAMPLE.trim(),
  });
};
