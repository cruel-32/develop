# java

Java 학습실 스캐폴드입니다. 아직 백엔드 라우팅(`backend/src/index.ts`)이나 랜딩 페이지
(`backend/public/landing/index.html`), 루트 `Dockerfile`/`docker-compose*.yml`에는
통합되어 있지 않습니다.

기존 프론트엔드 학습실(`react/`, `vue/`, `typescript/`, `ecma/`, `html-css/`)과 달리 Java는
브라우저에서 직접 실행되는 프론트엔드가 아니므로, 실제 사이트에 통합하려면 다음을 먼저
정해야 합니다.

- 콘텐츠 형태: 정적 문서/예제 위주로 보여줄지, 실행 가능한 코드 샌드박스(JShell, 온라인
  컴파일러 연동 등)를 붙일지
- 서빙 방식: 기존 5개 프론트엔드처럼 Vite로 빌드해 정적 서빙할지, 별도 백엔드
  라우트(`/java`)로 서빙할지

## 새 프론트엔드 추가하기 (참고)

루트 `README.md`의 "새 프론트엔드 추가하기" 절차를 따르면 됩니다.
