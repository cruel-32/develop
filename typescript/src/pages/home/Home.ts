import type { PageRender } from "../../router";

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>TypeScript 학습실</h1>
      <p>
        왼쪽 사이드바에서 배우고 싶은 항목을 선택하세요. 각 페이지는 개념 설명과 함께,
        실제로 CDN에서 그 버전의 TypeScript 컴파일러를 그대로 불러와
        <code>ts.createProgram()</code> + <code>getPreEmitDiagnostics()</code>로 진짜
        타입 검사를 돌리는 실습창으로 구성되어 있습니다 — 공식 TypeScript Playground와
        동일한 방식입니다.
      </p>
      <p>
        메뉴 구조는 <strong>Version</strong>(5.8 이후 마이너/메이저 버전별 변경점)처럼
        계속 늘어날 수 있도록 설계되어 있어서, 이후 새 버전이 나오면 같은 방식으로
        추가될 예정입니다.
      </p>
      <p class="hint">
        단, TypeScript 7.0은 컴파일러 자체가 Go로 새로 작성되어 아직 브라우저에서 쓸 수
        있는 프로그래밍 API가 없습니다 (7.1에서 제공 예정). 그래서 v7.0 페이지 중 일부는
        실습창 대신 정적 코드와 공식 발표 내용으로 대신합니다 — 자세한 이유는 해당
        페이지에서 설명합니다.
      </p>
    </article>
  `;
};
