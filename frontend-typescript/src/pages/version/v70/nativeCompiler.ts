import type { PageRender } from "../../../router";
import { codeBlock } from "../../../pageHelpers";

const BENCHMARKS: Array<[string, string, string, string]> = [
  ["VSCode", "125.7s", "10.6s", "11.9x"],
  ["Sentry", "139.8s", "15.7s", "8.9x"],
  ["Bluesky", "24.3s", "2.8s", "8.7x"],
  ["Playwright", "12.8s", "1.47s", "8.7x"],
];

const INSTALL = `
# 표준 설치
npm install -D typescript

# 6.0 호환 컴파일러가 계속 필요하다면 별칭으로 함께 설치
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
`;

const FLAGS = `
# 타입 검사 워커 수 (기본값 4)
tsc --checkers 8

# 모노레포의 프로젝트 레퍼런스 빌드를 병렬화
tsc --build --builders 4

# 디버깅/자원 제약 환경에서 모든 병렬화를 끔
tsc --singleThreaded
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>네이티브(Go) 컴파일러 <span class="ts-playground-version-badge">TypeScript 7.0.2</span></h1>
      <p>
        TypeScript 7.0은 기존 코드베이스의 구조와 로직을 그대로 유지하면서, 컴파일러 자체를
        JavaScript에서 <strong>Go로 새로 이식(port)</strong>한 버전입니다. 공식 발표는 이를
        "최대 12배 빠른 네이티브 포트"라고 소개합니다.
      </p>

      <h2 id="benchmarks">실측 빌드 속도</h2>
      <table class="stat-table">
        <thead>
          <tr><th>프로젝트</th><th>TS 6</th><th>TS 7</th><th>배속</th></tr>
        </thead>
        <tbody>
          ${BENCHMARKS.map(
            ([name, before, after, speedup]) =>
              `<tr><td>${name}</td><td>${before}</td><td>${after}</td><td class="num">${speedup}</td></tr>`,
          ).join("")}
        </tbody>
      </table>
      <p class="hint">
        메모리 사용량도 프로젝트에 따라 -6% ~ -26% 개선됐고, 에디터 진단(diagnostics) 속도는
        VSCode 코드베이스 기준 17.5초 → 1.3초로 13배 이상 빨라졌습니다.
      </p>

      <h2 id="install">설치 방법</h2>
      <p>
        가장 흔한 배포 경로는 베타 기간 동안 주간 850만 다운로드를 기록했던
        <code>@typescript/native-preview</code> 패키지에서, 정식 <code>typescript</code>
        패키지로 옮겨오는 것입니다. 6.0과 7.0을 나란히 써야 한다면 npm 별칭을 활용합니다.
      </p>
      ${codeBlock(INSTALL, "설치 / 별칭 설정")}

      <h2 id="parallelization">멀티스레딩 플래그</h2>
      <p>
        네이티브 컴파일러는 공유 메모리 기반 멀티스레딩을 지원합니다. <code>--checkers</code>를
        8로 올리면 VSCode 기준 16.7배, Sentry 기준 11.6배까지 빨라지지만, 그만큼 메모리
        사용량도 늘어납니다. 팀 전체가 같은 값을 쓰도록 맞추는 게 좋습니다 — 체커 수에 따라
        드물게 순서 의존적인 결과 차이가 날 수 있다고 공식 문서에 명시되어 있습니다.
      </p>
      ${codeBlock(FLAGS, "병렬화 관련 CLI 플래그")}

      <h2 id="editor">에디터 / 언어 서버</h2>
      <p>
        Language Server Protocol(LSP) 기반의 멀티스레드 언어 서버가 함께 제공되며,
        VS Code 확장은 <code>TypeScriptTeam.native-preview</code>로 미리 체험할 수 있었습니다.
        6.0 대비 언어 서버 크래시가 60% 이상, 실패하는 명령이 80% 이상 줄었습니다.
        <code>--watch</code> 모드도 Parcel의 C++ 워처를 Go로 이식해 다시 만들었습니다.
      </p>

      <div class="crash-box">
        <h2 style="margin-top: 0">이 페이지에 실습 플레이그라운드가 없는 이유</h2>
        <p style="margin-bottom: 0">
          공식 발표는 "7.0에는 아직 안정된 프로그래밍 API가 없으며(Vue, Angular, Svelte, Astro,
          MDX 같은 임베디드 언어 도구들이 아직 TS 7을 채택하지 못한 이유이기도 합니다), API는
          7.1에서 제공될 예정"이라고 명시합니다. 이 학습실의 실습창은 브라우저에서
          <code>ts.createProgram()</code>을 직접 호출하는 방식이라, 그 API 자체가 없는 7.0을
          대상으로는 애초에 만들 수 없습니다. 대신 이 페이지는 공식 벤치마크와 설치 방법을
          정리해 보여드립니다.
        </p>
      </div>
    </article>
  `;
};
