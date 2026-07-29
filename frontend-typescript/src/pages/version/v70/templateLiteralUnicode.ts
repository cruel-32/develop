import type { PageRender } from "../../../router";
import { mountTsPlayground } from "../../../tsPlayground";
import { codeBlock } from "../../../pageHelpers";

const OLD_VERSION = "6.0.3";

const SHARED_TYPE = `
type HeadTail<S extends string> =
  S extends \`\${infer Head}\${infer Tail}\` ? [Head, Tail] : never;

type Result = HeadTail<"😀abc">;
`;

const OLD_CODE = `
${SHARED_TYPE}
// 6.0까지: 이모지가 UTF-16 서로게이트 쌍으로 쪼개집니다.
type AssertOldBehavior = Result extends ["\\ud83d", "\\ude00abc"] ? true : false;
const check: AssertOldBehavior = true;
`;

const NEW_CODE = `
${SHARED_TYPE}
// 7.0부터: 이모지 전체가 하나의 유니코드 코드 포인트로 취급됩니다.
type AssertNewBehavior = Result extends ["😀", "abc"] ? true : false;
const check: AssertNewBehavior = true;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>템플릿 리터럴 타입의 유니코드 처리 <span class="ts-playground-version-badge">TypeScript 7.0.2</span></h1>
      <p>
        템플릿 리터럴 타입에서 <code>\`\${infer Head}\${infer Tail}\`</code> 같은 패턴으로
        문자열을 한 글자씩 분해할 때, TypeScript 7.0부터는 이모지처럼 여러 UTF-16 코드
        유닛으로 이루어진 문자를 <strong>하나의 완전한 유니코드 코드 포인트</strong>로
        취급합니다.
      </p>

      <h2 id="before">7.0 이전: 서로게이트 쌍이 쪼개짐</h2>
      <p>
        😀 같은 이모지는 UTF-16에서 두 개의 코드 유닛(서로게이트 쌍)으로 표현됩니다.
        6.0까지는 <code>Head</code>/<code>Tail</code> 추론이 이 둘을 인식하지 못하고
        기계적으로 반으로 쪼개서, 그 자체로는 의미 없는(unpaired) 문자열 리터럴 타입을
        만들어냈습니다.
      </p>
      ${codeBlock(OLD_CODE, "6.0까지의 동작 (실제로 실행 가능)")}

      <h2 id="live">직접 실습해보기 (TypeScript ${OLD_VERSION})</h2>
      <p class="hint">
        아래 실습창은 CDN에서 직접 불러올 수 있는 마지막 브라우저용 컴파일러인
        ${OLD_VERSION}으로 동작합니다. <code>AssertOldBehavior</code>가 <code>true</code>로
        평가되기 때문에 <code>const check: AssertOldBehavior = true;</code>가 에러 없이
        통과하는 걸 확인할 수 있습니다 — 이게 바로 "쪼개짐" 버그입니다.
      </p>
      <div id="playground-slot"></div>

      <h2 id="after">7.0부터: 코드 포인트 단위로 취급</h2>
      <p>
        새 동작은 JavaScript의 <code>for...of</code> 순회나 스프레드(<code>[...str]</code>)가
        문자열을 다루는 방식과 일치합니다 — 즉 이모지 하나를 항상 하나의 단위로 봅니다.
        공식 발표에서는 이를 "UTF-16 코드 유닛을 의도적으로 모델링한 일부 문자열
        <code>Length</code> 유틸리티 타입에는 브레이킹 체인지"라고 설명합니다.
      </p>
      ${codeBlock(NEW_CODE, "7.0부터의 동작 (정적 코드 — 아래 참고)")}

      <div class="crash-box">
        <h2 style="margin-top: 0">왜 이 코드는 실습창으로 실행할 수 없나요?</h2>
        <p style="margin-bottom: 0">
          TypeScript 7.0은 컴파일러 자체를 Go로 새로 작성한 네이티브 포트입니다. 공식 발표는
          "7.0에는 아직 안정된 프로그래밍 API가 없으며, API는 7.1에서 제공될 예정"이라고
          명시하고 있습니다. 실제로 npm의 <code>typescript@7.0.2</code> 패키지를 열어봐도
          브라우저에서 로드할 수 있는 <code>lib/typescript.js</code> 번들이 아예 들어있지
          않고, 네이티브 실행 파일을 실행하는 런처 스크립트만 들어있습니다. 그래서 이 페이지의
          "7.0부터" 코드는 실시간으로 검사하는 대신, 공식 발표에 나온 예시를 그대로 옮겨
          정적으로 보여드립니다.
        </p>
      </div>
    </article>
  `;

  mountTsPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    version: OLD_VERSION,
    code: OLD_CODE.trim(),
  });
};
