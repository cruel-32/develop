import type { PageRender } from "../../router";

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>HTML5 / CSS 학습실</h1>
      <p>
        왼쪽 사이드바에서 배우고 싶은 항목을 선택하세요. 각 페이지는 개념 설명과 함께,
        HTML/CSS를 직접 고쳐가며 결과를 바로 확인할 수 있는 실습창(에디터 + 실시간
        프리뷰 iframe)으로 구성되어 있습니다.
      </p>
      <p>
        <code>&lt;dialog&gt;</code>/<code>&lt;details&gt;</code> 같은 시맨틱 엘리먼트부터,
        <code>:has()</code>·CSS Nesting·<code>@layer</code> 같은 선택자/캐스케이드,
        Container Queries·View Transitions 같은 비교적 최신 스펙까지 주제별로 정리되어
        있습니다.
      </p>
    </article>
  `;
};
