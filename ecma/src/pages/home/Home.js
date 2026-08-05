/** @type {import("../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>ECMAScript 학습실</h1>
      <p>
        왼쪽 사이드바에서 배우고 싶은 스펙 연도를 선택하세요. 각 페이지는 개념 설명과 함께,
        <strong>여러분의 브라우저가 실제로 실행하는</strong> 라이브 실습창으로 구성되어
        있습니다 — TypeScript 학습실처럼 CDN에서 특정 버전의 컴파일러를 불러와 흉내 내는
        방식이 아니라, 표준화된 스펙 그대로를 브라우저 JS 엔진이 직접 실행한 결과를 보여줍니다.
      </p>
      <p>
        메뉴 구조는 <strong>Version</strong>(ES2015부터 최신 연도까지) 아래에 그 해에 추가된
        핵심 기능들이 정리되어 있으며, 새 스펙이 확정될 때마다 같은 방식으로 추가될 예정입니다.
      </p>
      <p class="hint">
        아주 최근에 표준화된 기능(예: 이터레이터 헬퍼, Set 메서드)은 사용 중인 브라우저
        버전에 따라 아직 지원되지 않을 수 있습니다. 그런 경우 실습창 콘솔에 에러가 표시되며,
        해당 페이지에 안내를 함께 적어두었습니다.
      </p>
    </article>
  `;
};
