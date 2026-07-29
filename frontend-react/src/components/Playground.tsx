import { useEffect, useRef, useState } from "react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { themes } from "prism-react-renderer";
import { TYPESCRIPT_VERSION } from "../lib/constants";

interface PlaygroundProps {
  code: string;
  /** 편집 중인 코드에서 이름으로 바로 쓸 수 있게 넘겨줄 값들 (React 훅, 유틸 등)만 화이트리스트로 제공한다. */
  scope: Record<string, unknown>;
}

type LogLevel = "log" | "info" | "warn" | "error";

interface LogEntry {
  id: number;
  level: LogLevel;
  text: string;
}

function formatArg(arg: unknown): string {
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return arg.message;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

/**
 * react.dev 레퍼런스 페이지의 편집 가능한 예제와 같은 역할을 하는 컴포넌트.
 *
 * - noInline 모드로 동작하므로 편집 코드는 반드시 `render(<Something />)`으로 끝나야 한다.
 * - language="tsx" + enableTypeScript(react-live 기본값 true)로 TypeScript 문법을 그대로
 *   쓸 수 있다 (sucrase가 타입 주석을 "지워주기"만 할 뿐 실제 타입 검사는 하지 않으므로,
 *   여기 들어가는 모든 데모 코드는 실제 tsc로 미리 타입 에러가 없는지 확인하고 작성했다).
 * - scope에 없는 이름(import 등)은 사용할 수 없다 — react-live는 import/require를 지원하지
 *   않으므로 시도하면 "허용되지 않은 작업"으로 보고 즉시 에러 메시지만 표시되고 페이지는
 *   멀쩡하게 유지된다.
 * - 편집 코드 안의 console.* 호출은 진짜 브라우저 콘솔이 아니라, scope로 주입한 가짜
 *   console(이 인스턴스 전용 클로저)로 가로채져 오른쪽 아래 로그 패널에 표시된다.
 * - 문법 오류/렌더링 중 오류는 react-live 내부 에러 바운더리가 잡아 로그 패널에 에러로
 *   표시하고, 나머지 페이지에는 영향이 없다. 이벤트 핸들러 안에서 던져진 예외처럼 React
 *   렌더 트리 밖에서 발생하는 오류는 window의 error/unhandledrejection 이벤트로 잡아
 *   같은 패널에 보여준다(다른 Playground와 공존 시 드물게 같이 표시될 수 있음 — 이 앱은
 *   개인 학습용이라 감내할 수 있는 수준의 한계로 판단).
 */
export default function Playground({ code, scope }: PlaygroundProps) {
  const [resetKey, setResetKey] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const nextLogId = useRef(0);

  function appendLog(level: LogLevel, args: unknown[]) {
    const text = args.map(formatArg).join(" ");
    setLogs((prev) => [...prev.slice(-49), { id: nextLogId.current++, level, text }]);
  }

  useEffect(() => {
    function handleWindowError(event: ErrorEvent) {
      appendLog("error", [event.message]);
    }
    function handleRejection(event: PromiseRejectionEvent) {
      appendLog("error", [`Unhandled promise rejection: ${String(event.reason)}`]);
    }
    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  const sandboxConsole = {
    log: (...args: unknown[]) => appendLog("log", args),
    info: (...args: unknown[]) => appendLog("info", args),
    warn: (...args: unknown[]) => appendLog("warn", args),
    error: (...args: unknown[]) => appendLog("error", args),
  };

  function handleReset() {
    setLogs([]);
    setResetKey((k) => k + 1);
  }

  return (
    <LiveProvider
      key={resetKey}
      code={code.trim()}
      scope={{ ...scope, console: sandboxConsole }}
      noInline
      language="tsx"
      theme={themes.vsDark}
    >
      <div className="playground">
        <div className="playground-toolbar">
          <span className="playground-label">
            코드를 직접 수정해보세요
            <span className="playground-lang-badge">TypeScript {TYPESCRIPT_VERSION}</span>
          </span>
          <button type="button" className="playground-reset" onClick={handleReset}>
            ⟳ 초기 코드로 되돌리기
          </button>
        </div>
        <div className="playground-main">
          <div className="playground-left">
            <LiveEditor className="playground-editor" />
          </div>
          <div className="playground-right">
            <div className="playground-pane playground-preview-pane">
              <div className="playground-pane-header">
                <span>미리보기</span>
              </div>
              <div className="playground-preview">
                <LivePreview />
              </div>
            </div>
            <div className="playground-pane playground-console">
              <div className="playground-pane-header">
                <span>콘솔</span>
                <button type="button" onClick={() => setLogs([])}>
                  지우기
                </button>
              </div>
              <div className="playground-console-body">
                <LiveError className="console-line console-error" />
                {logs.length === 0 && (
                  <p className="playground-console-empty">
                    console.log/warn/error 출력이 여기에 표시됩니다.
                  </p>
                )}
                {logs.map((entry) => (
                  <div key={entry.id} className={`console-line console-${entry.level}`}>
                    {entry.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LiveProvider>
  );
}
