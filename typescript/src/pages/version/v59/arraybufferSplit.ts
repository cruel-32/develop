import type { PageRender } from "../../../router";
import { mountTsPlayground } from "../../../tsPlayground";
import { codeBlock } from "../../../pageHelpers";

const VERSION = "5.9.3";

const SAMPLE = `
function readBytes(data: Uint8Array<ArrayBuffer>) {
  console.log(data.byteLength);
}

declare const source: Uint8Array<ArrayBufferLike>;

readBytes(source);
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>ArrayBuffer / TypedArray 타입 분리 <span class="ts-playground-version-badge">TypeScript ${VERSION}</span></h1>
      <p>
        TypeScript 5.9 이전에는 <code>ArrayBuffer</code>가 <code>Uint8Array</code> 같은
        TypedArray들의 상위 타입(supertype)처럼 취급되어, 서로 다른 버퍼 종류가 느슨하게
        호환됐습니다. 5.9부터는 이 관계가 끊어지면서 <code>Uint8Array&lt;ArrayBuffer&gt;</code>와
        <code>Uint8Array&lt;ArrayBufferLike&gt;</code>처럼 <strong>버퍼 종류까지 제네릭으로
        명시</strong>해야 하는 경우가 생겼습니다.
      </p>

      <h2 id="why">왜 바뀌었나</h2>
      <p>
        <code>ArrayBufferLike</code>는 <code>ArrayBuffer</code>뿐 아니라
        <code>SharedArrayBuffer</code> 등도 포함하는 더 넓은 타입입니다. 예전처럼 느슨하게
        호환되면, 실제로는 <code>SharedArrayBuffer</code> 기반일 수도 있는 타입 정보를
        <code>ArrayBuffer</code>로 잘못 좁혀버릴 위험이 있었습니다. Node.js의
        <code>Buffer</code>도 이 변화의 영향을 받으므로, 마이그레이션 시
        <code>@types/node</code>를 최신으로 올리는 것이 권장됩니다.
      </p>
      ${codeBlock(SAMPLE, "버퍼 종류 불일치 예시")}
      <p>
        <code>source</code>는 (타입스크립트가 아는 한) <code>ArrayBuffer</code>일 수도,
        <code>SharedArrayBuffer</code>일 수도 있는 <code>ArrayBufferLike</code> 기반입니다.
        반면 <code>readBytes</code>는 정확히 <code>ArrayBuffer</code> 기반만 받겠다고
        선언했습니다. 5.9부터는 이 둘이 더 이상 자동으로 호환되지 않습니다.
      </p>

      <h2 id="fix">고치는 방법</h2>
      <p>
        가장 간단한 해결책은 함수 시그니처를 <code>ArrayBufferLike</code>로 넓히거나,
        호출부에서 <code>source.buffer</code>처럼 실제 버퍼 프로퍼티에 접근해 정확한
        타입으로 좁혀주는 것입니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>readBytes</code>의 매개변수 타입을 <code>Uint8Array&lt;ArrayBufferLike&gt;</code>로
        바꾸면 에러가 사라지는 걸 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountTsPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    version: VERSION,
    code: SAMPLE.trim(),
  });
};
