import type { PageRender } from "../../router";

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Java 학습실</h1>
      <p>
        왼쪽 사이드바에서 배우고 싶은 항목을 선택하세요. 각 페이지는 개념 설명과 함께,
        실제 <code>javac</code> + <code>java</code>를 브라우저 안에서 그대로 실행하는
        실습창(에디터 + 실행 결과)으로 구성되어 있습니다.
      </p>
      <p>
        실습창은 <a href="https://cheerpj.com/" target="_blank" rel="noreferrer">CheerpJ</a>
        (OpenJDK를 WebAssembly로 실행하는 프로젝트)로 만들어져 있어, 여러분이 입력한
        Java 코드가 서버가 아니라 <strong>이 브라우저 탭 안에서</strong> 컴파일되고
        실행됩니다. postgre 학습실의 PGlite와 같은 원리지만, Java 런타임 초기화 자체가
        무거워서(첫 로딩에 OpenJDK 전체를 내려받습니다) 페이지를 이동해도 다시 초기화하지
        않고 세션당 한 번만 불러옵니다 — 그래서 이 학습실에 처음 들어와 "실행"을 누르면
        몇 초 정도 걸릴 수 있습니다. 이후 실행부터는 훨씬 빠릅니다.
      </p>
      <p class="hint">
        CheerpJ는 Community License 조건상 자체 서버에 파일을 올려둘 수 없어, 이
        페이지는 Leaning Technologies의 CDN에서 CheerpJ 런타임을 직접 불러옵니다 — 이
        사이트에서 유일하게 외부 CDN에 의존하는 학습실입니다.
      </p>

      <h2 id="learning-path">학습 순서</h2>
      <p>
        <strong>기초 문법</strong>(변수/타입, 제어문, 배열) →
        <strong>객체지향</strong>(클래스, 상속과 다형성, 인터페이스·추상 클래스) →
        <strong>컬렉션 & 제네릭</strong>(List/Map/Set, 제네릭) →
        <strong>함수형 & 스트림</strong>(람다, Stream API) →
        <strong>예외 처리</strong>(try-catch-finally, 커스텀 예외) 순으로 읽으면 됩니다.
        각 페이지의 실습창 코드는 항상 <code>public class Main</code>과
        <code>main</code> 메서드를 포함한 완결된 스크립트라, 어느 페이지에서나 바로
        실행할 수 있습니다.
      </p>
    </article>
  `;
};
