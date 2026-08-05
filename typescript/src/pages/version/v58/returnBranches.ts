import type { PageRender } from "../../../router";
import { mountTsPlayground } from "../../../tsPlayground";
import { codeBlock } from "../../../pageHelpers";

const VERSION = "5.8.3";

const SAMPLE = `
declare const untypedCache: Map<any, any>;

function getUrlObject(urlString: string): URL {
  return untypedCache.has(urlString)
    ? untypedCache.get(urlString)
    : urlString;
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>return문 분기별 타입 검사 <span class="ts-playground-version-badge">TypeScript ${VERSION}</span></h1>
      <p>
        TypeScript 5.8부터는 <code>return</code>문에 바로 등장하는 조건식(삼항 연산자 등)의
        <strong>각 분기를 개별적으로</strong> 함수의 선언된 반환 타입과 비교합니다.
      </p>

      <h2 id="before">5.8 이전에는 왜 버그를 놓쳤나</h2>
      <p>
        예전에는 조건식의 두 분기 타입을 먼저 하나로 합친(union) 뒤에야 반환 타입과 비교했습니다.
        그런데 분기 중 하나라도 <code>any</code>였다면, union 전체가 <code>any</code>로
        무너져버려서 검사 자체가 무의미해졌습니다.
      </p>
      ${codeBlock(SAMPLE, "any가 섞인 캐시 조회 함수")}
      <p>
        <code>untypedCache</code>는 <code>Map&lt;any, any&gt;</code>이므로
        <code>.get(urlString)</code>의 타입은 <code>any</code>입니다. 5.8 이전에는
        <code>any | string</code>가 그냥 <code>any</code>로 합쳐져서 반환 타입
        <code>URL</code>과의 불일치가 조용히 통과됐습니다. 5.8부터는 두 분기
        (<code>any</code> 쪽과 <code>string</code> 쪽)를 따로따로 검사하기 때문에,
        <code>string</code> 분기가 <code>URL</code>에 대입될 수 없다는 진짜 버그가 드러납니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        아래 코드는 실제로 이 버그를 재현합니다. <code>: urlString</code> 부분을
        <code>: new URL(urlString)</code>로 고쳐서 에러가 사라지는지 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountTsPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    version: VERSION,
    code: SAMPLE.trim(),
  });
};
