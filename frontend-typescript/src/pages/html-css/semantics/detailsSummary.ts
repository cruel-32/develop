import type { PageRender } from "../../../router";
import { mountHtmlCssPlayground } from "../../../htmlCssPlayground";
import { codeBlock } from "../../../pageHelpers";

const NAME_ATTR_SAMPLE = `
<!-- 같은 name을 공유하면, 하나를 열 때 나머지는 자동으로 닫힌다 -->
<!-- 라디오 버튼처럼 동작하는 "배타적 아코디언"을 JS 없이 구현 -->
<details name="faq">
  <summary>배송은 얼마나 걸리나요?</summary>
  <p>영업일 기준 2~3일 소요됩니다.</p>
</details>
<details name="faq">
  <summary>환불은 어떻게 하나요?</summary>
  <p>마이페이지 &gt; 주문내역에서 신청할 수 있습니다.</p>
</details>
`;

const PLAYGROUND_HTML = `
<h3>자주 묻는 질문</h3>

<details name="faq" open>
  <summary>결제 수단은 무엇이 있나요?</summary>
  <p>신용카드, 계좌이체, 간편결제를 지원합니다.</p>
</details>

<details name="faq">
  <summary>배송은 얼마나 걸리나요?</summary>
  <p>영업일 기준 2~3일 소요됩니다.</p>
</details>

<details name="faq">
  <summary>환불은 어떻게 하나요?</summary>
  <p>마이페이지 &gt; 주문내역에서 신청할 수 있습니다.</p>
</details>
`;

const PLAYGROUND_CSS = `
details {
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

summary {
  cursor: pointer;
  font-weight: 600;
  list-style: none; /* 기본 삼각형 마커 제거 */
}

/* 마커를 직접 그린 화살표 아이콘으로 교체 */
summary::before {
  content: "▸";
  display: inline-block;
  margin-right: 0.5rem;
  transition: transform 0.15s ease;
}

/* :open 상태(2024+ 지원)를 순수 CSS로 감지 가능 */
details[open] summary::before {
  transform: rotate(90deg);
}

details p {
  margin: 0.6rem 0 0;
  color: #57606a;
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>&lt;details&gt;/&lt;summary&gt; 아코디언</h1>
      <p>
        JavaScript 한 줄 없이 여닫히는 아코디언이 필요하면 <code>&lt;details&gt;</code>와
        <code>&lt;summary&gt;</code>만으로 충분합니다. <code>open</code> 속성 유무로
        펼침/접힘 상태가 결정되고, 클릭 토글은 브라우저가 알아서 처리합니다.
      </p>

      <h2 id="name-attr">name 속성 — 배타적 아코디언</h2>
      <p>
        예전엔 "하나를 열면 나머지는 자동으로 닫히는" 아코디언을 만들려면 JS로 형제
        요소들을 순회하며 직접 닫아줘야 했습니다. 지금은 여러 <code>&lt;details&gt;</code>에
        같은 <code>name</code> 값을 주기만 하면, 라디오 버튼 그룹처럼 브라우저가 배타적으로
        동작시켜 줍니다.
      </p>
      ${codeBlock(NAME_ATTR_SAMPLE, "name 속성으로 묶은 배타적 아코디언")}

      <h2 id="css-hooks">CSS로 다룰 수 있는 상태</h2>
      <p>
        <code>details[open]</code> 선택자로 펼쳐진 상태를 스타일링할 수 있고,
        <code>summary { list-style: none; }</code>로 기본 삼각형 마커를 지운 뒤
        <code>::marker</code>나 <code>::before</code>로 원하는 아이콘을 넣을 수 있습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        FAQ 항목 중 하나를 클릭해 열어보면 다른 항목이 자동으로 닫히는지 확인해보세요
        (<code>name="faq"</code> 덕분입니다). HTML 탭에서 <code>name="faq"</code>를
        지워보면 여러 개가 동시에 열리는 원래 동작으로 돌아갑니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: PLAYGROUND_HTML,
    css: PLAYGROUND_CSS,
  });
};
