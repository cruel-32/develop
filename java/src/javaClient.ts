/**
 * CheerpJ(WASM JVM)로 Java 소스를 브라우저 안에서 컴파일하고 실행한다.
 *
 * cheerpjInit()은 OpenJDK 전체를 불러오는 무거운 작업이라(첫 호출에 수 초) PGlite처럼
 * 실행마다 새로 만들지 않고 세션당 딱 한 번만 초기화해서 재사용한다(ensureInit). "실행"을
 * 누르면 매번 새로 컴파일/실행만 반복한다.
 *
 * CheerpJ는 System.out/System.err 출력을 문서화된 반환값이 아니라 id="console"인
 * DOM 엘리먼트에 직접 써주는 방식으로 동작한다(Leaning Technologies의 공식 데모인
 * javafiddle의 실제 구현을 참고했다). 이 프로젝트는 SPA 라우터가 페이지 이동마다
 * #app 내부를 통째로 새로 그리므로, #console/#output은 index.html에서 #app 바깥
 * body 직속 자식으로 두어 라우팅과 무관하게 항상 같은 노드가 유지되도록 했다.
 */

let initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await cheerpjInit({ status: "none" });
      const outputEl = document.getElementById("output") ?? undefined;
      cheerpjCreateDisplay(-1, -1, outputEl);
    })();
  }
  return initPromise;
}

/** `public class Foo`를 소스에서 찾아 클래스 이름을 뽑는다. javac는 파일명이 public 클래스 이름과 일치해야 하므로, 가상 파일 경로도 이 이름을 따른다. */
function deriveClassName(code: string): string {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : "Main";
}

export interface JavaRunResult {
  /** 컴파일러/프로그램이 System.out·System.err에 쓴 전체 텍스트 */
  consoleText: string;
  /** javac 종료 코드. 0이 아니면 컴파일 실패 */
  compileExitCode: number;
  /** 컴파일이 성공했을 때만 존재하는 프로그램 실행 종료 코드. 0이 아니면 예외로 비정상 종료 */
  runExitCode: number | null;
}

const CLASSPATH = "/app/tools.jar:/files/";

async function runOnce(code: string): Promise<JavaRunResult> {
  await ensureInit();

  const consoleEl = document.getElementById("console")!;
  consoleEl.textContent = "";

  const className = deriveClassName(code);
  cheerpjAddStringFile(`/str/${className}.java`, new TextEncoder().encode(code));

  const compileExitCode = await cheerpjRunMain(
    "com.sun.tools.javac.Main",
    CLASSPATH,
    `/str/${className}.java`,
    "-d",
    "/files/",
  );

  let runExitCode: number | null = null;
  if (compileExitCode === 0) {
    runExitCode = await cheerpjRunMain(className, CLASSPATH);
  }

  return {
    consoleText: consoleEl.textContent ?? "",
    compileExitCode,
    runExitCode,
  };
}

// #console/#output은 페이지 전체에서 단 하나뿐인 전역 DOM이다. 서로 다른 페이지의
// 실습창에서 거의 동시에 "실행"을 누르면 한쪽이 다른 쪽의 #console을 지우면서 결과가
// 섞일 수 있어, 모든 컴파일/실행 요청을 큐에 넣어 항상 하나씩만 순서대로 처리한다.
let queue: Promise<unknown> = Promise.resolve();

export function compileAndRun(code: string): Promise<JavaRunResult> {
  const result = queue.then(() => runOnce(code));
  queue = result.catch(() => {});
  return result;
}
