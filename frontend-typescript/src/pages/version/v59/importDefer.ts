import type { PageRender } from "../../../router";
import { mountTsPlayground } from "../../../tsPlayground";
import { codeBlock } from "../../../pageHelpers";

const VERSION = "5.9.3";

const FEATURE_MODULE = `
console.log("some-feature 모듈이 평가되었습니다");
export const specialConstant = 42;
`;

const SAMPLE = `
// 네임스페이스(* as ...) import만 defer와 함께 쓸 수 있습니다.
import defer * as feature from "./some-feature.js";

// 이 시점까지는 "./some-feature.js" 모듈이 아직 평가(evaluate)되지 않습니다.
console.log("모듈 평가 전");

// feature의 export를 처음 "사용"하는 순간 비로소 모듈이 평가됩니다.
console.log(feature.specialConstant);

// named import는 defer와 함께 쓸 수 없습니다 - 주석을 풀어서 에러를 확인해보세요.
// import defer { specialConstant } from "./some-feature.js";
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>import defer <span class="ts-playground-version-badge">TypeScript ${VERSION}</span></h1>
      <p>
        <code>import defer</code>는 모듈을 <strong>가져오되(import) 평가는 나중으로 미루는</strong>
        새로운 문법입니다. 핵심은 "모듈은 그 안의 export를 처음 접근하는 순간에만 평가된다"는 점입니다.
      </p>

      <h2 id="syntax">문법 제약: 네임스페이스 import만 가능</h2>
      <p>
        <code>import defer * as feature from "..."</code> 형태의 네임스페이스 import만
        허용됩니다. <code>import defer { x } from "..."</code> 같은 named import나
        <code>import defer x from "..."</code> 같은 default import는 허용되지 않습니다 —
        어떤 export를 접근했는지를 정확히 추적해서 "처음 접근하는 순간"을 판단해야 하는데,
        구조 분해(destructuring)된 named import로는 이 추적이 애매해지기 때문입니다.
      </p>
      ${codeBlock(SAMPLE, "import defer 사용 예시 (옆의 실습창은 ./some-feature.js도 함께 컴파일합니다)")}

      <h2 id="module-mode">지원되는 module 모드</h2>
      <p>
        TypeScript는 <code>import defer</code>를 다른 문법으로 변환(downlevel)하지 않습니다.
        런타임이 이 기능을 네이티브로 지원해야 하므로, <code>--module</code>이
        <code>preserve</code> 또는 <code>esnext</code>일 때만 사용할 수 있습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        마지막 줄의 주석(named import 시도)을 풀어보면 "정확히 이 문법은 지원되지 않는다"는
        에러를 직접 확인할 수 있습니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountTsPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    version: VERSION,
    code: SAMPLE.trim(),
    compilerOptions: { module: "esnext", target: "esnext", moduleResolution: "bundler" },
    extraFiles: { "some-feature.ts": FEATURE_MODULE.trim() },
  });
};
