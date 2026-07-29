import type { PageRender } from "../../../router";
import { mountTsPlayground } from "../../../tsPlayground";
import { codeBlock } from "../../../pageHelpers";

const VERSION = "5.8.3";

const SAMPLE = `
class Point {
  constructor(public x: number, public y: number) {}
}

enum Direction {
  Up,
  Down,
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>erasableSyntaxOnly <span class="ts-playground-version-badge">TypeScript ${VERSION}</span></h1>
      <p>
        Node.js 23.6의 실험적 기능인 <code>--experimental-strip-types</code>는 TypeScript 파일에서
        타입 구문만 <strong>그대로 지워내면(erase)</strong> 유효한 JavaScript가 되는 경우에만
        동작합니다. 문제는 TypeScript 문법 중 일부는 "지워지는" 게 아니라 실제 런타임 코드를
        만들어낸다는 점입니다.
      </p>

      <h2 id="restricted">지워지지 않는(erasable하지 않은) 문법들</h2>
      <ul>
        <li><code>enum</code> 선언 — 실제로는 객체와 역방향 매핑 코드를 생성합니다.</li>
        <li>런타임 코드가 있는 <code>namespace</code> / <code>module</code></li>
        <li>클래스 생성자의 파라미터 프로퍼티 (<code>constructor(public x: number)</code>) —
          내부적으로 <code>this.x = x;</code> 대입문을 생성합니다.</li>
        <li><code>import =</code> 별칭(alias) 구문</li>
      </ul>
      <p>
        <code>--erasableSyntaxOnly</code> 플래그를 켜면, 이런 문법을 쓸 때 런타임에 가서야
        문제를 발견하는 대신 <strong>컴파일 시점에 바로</strong> 에러로 잡아낼 수 있습니다.
      </p>
      ${codeBlock(SAMPLE, "erasableSyntaxOnly 위반 예시")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        파라미터 프로퍼티(<code>public x: number</code>)와 <code>enum</code> 둘 다 에러가
        나는 걸 확인해보세요. 파라미터 프로퍼티를 <code>constructor(x: number) { this.x = x; }</code>
        처럼 일반 대입으로, enum을 <code>const</code> 객체 리터럴로 바꾸면 에러가 사라집니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountTsPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    version: VERSION,
    code: SAMPLE.trim(),
    compilerOptions: { erasableSyntaxOnly: true },
  });
};
