export default function Home() {
  return (
    <article>
      <h1>React 학습실</h1>
      <p>
        왼쪽 사이드바에서 배우고 싶은 항목을 선택하세요. 각 페이지는 개념 설명과 함께,
        직접 값을 입력하거나 버튼을 눌러 동작을 확인할 수 있는 인터랙티브 데모로
        구성되어 있습니다.
      </p>
      <p>
        메뉴 구조는 <strong>Version</strong>(React 버전별 신규 API)처럼 계속 늘어날 수
        있도록 설계되어 있어서, 이후 v20 같은 새 버전이나 다른 상태관리/데이터 페칭
        라이브러리도 같은 방식으로 추가될 예정입니다.
      </p>
    </article>
  );
}
