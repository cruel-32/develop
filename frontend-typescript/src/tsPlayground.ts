import { createDefaultMapFromCDN, createSystem, createVirtualCompilerHost } from "@typescript/vfs";

/**
 * 실제 TypeScript 컴파일러(정확히 지정한 버전)를 CDN에서 불러와 진짜 타입 검사를 돌리는
 * 플레이그라운드. 공식 TypeScript Playground(typescriptlang.org/play)가 쓰는 것과 같은
 * 조합(typescript.js UMD 빌드 + @typescript/vfs)이다.
 *
 * ts.transpileModule()은 문법만 확인할 뿐 실제 타입 검사(semantic diagnostics)를 하지
 * 않는다 — 직접 검증해봄: `let x: number = "hello"` 같은 코드도 진단 0개로 나온다.
 * 그래서 실제 tsc가 쓰는 ts.createProgram() + getPreEmitDiagnostics()를 그대로 쓴다.
 * @typescript/vfs는 target/lib에 맞는 lib.d.ts 파일들을 브라우저에서 CDN으로 받아와
 * 가상 파일시스템을 만들어준다.
 */

// 버전별로 한 번만 <script> 태그를 만든다. 각 Promise는 onload 시점의 window.ts를
// "그 순간 즉시" 캡처해서 resolve하므로, 이후 다른 버전이 window.ts를 덮어써도
// 이미 resolve된 참조에는 영향이 없다.
const versionPromiseCache = new Map<string, Promise<any>>();

function loadTypeScript(version: string): Promise<any> {
  const cached = versionPromiseCache.get(version);
  if (cached) return cached;

  const promise = new Promise<any>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://cdn.jsdelivr.net/npm/typescript@${version}/lib/typescript.js`;
    script.onload = () => resolve((window as any).ts);
    script.onerror = () => {
      versionPromiseCache.delete(version);
      reject(new Error(`TypeScript ${version} 컴파일러를 CDN에서 불러오지 못했습니다.`));
    };
    document.head.appendChild(script);
  });

  versionPromiseCache.set(version, promise);
  return promise;
}

export interface Diagnostic {
  line: number;
  character: number;
  message: string;
}

export async function checkTypeScript(
  version: string,
  code: string,
  compilerOptions: Record<string, unknown> = {},
  extraFiles: Record<string, string> = {},
): Promise<Diagnostic[]> {
  const ts = await loadTypeScript(version);
  // @typescript/vfs의 타입은 (우리 devDependency인) 고정된 typescript 버전의 CompilerOptions를
  // 기준으로 삼는데, 실제로는 CDN에서 받아온 임의 버전의 ts를 덕타이핑으로 쓰는 것이라 맞지
  // 않는다 - 의도적으로 any로 넘긴다.
  const options = compilerOptions as any;

  const fsMap = await createDefaultMapFromCDN(options, version, false, ts);
  fsMap.set("input.ts", code);
  for (const [path, content] of Object.entries(extraFiles)) {
    fsMap.set(path, content);
  }

  const system = createSystem(fsMap);
  const host = createVirtualCompilerHost(system, options, ts);
  const program = ts.createProgram({
    rootNames: ["input.ts", ...Object.keys(extraFiles)],
    options,
    host: host.compilerHost,
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);

  return diagnostics.map((d: any) => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    if (d.file && d.start !== undefined) {
      const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
      return { line: line + 1, character: character + 1, message };
    }
    return { line: 0, character: 0, message };
  });
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function renderDiagnostics(el: HTMLElement, diagnostics: Diagnostic[]): void {
  if (diagnostics.length === 0) {
    el.innerHTML = `<p class="ts-playground-diagnostics-empty">✓ 타입 에러가 없습니다.</p>`;
    return;
  }
  el.innerHTML = diagnostics
    .map((d) => `<div class="ts-diagnostic-item">[${d.line}:${d.character}] ${escapeHtml(d.message)}</div>`)
    .join("");
}

export interface TsPlaygroundOptions {
  code: string;
  version: string;
  compilerOptions?: Record<string, unknown>;
  /** input.ts 외에 함께 컴파일할 고정 파일들 (예: import 대상 모듈). 사용자가 편집하는 대상은 아니다. */
  extraFiles?: Record<string, string>;
}

let instanceCounter = 0;

/** 에디터 + 진단 패널 UI를 container 안에 그리고, 입력할 때마다(디바운스) 다시 타입 검사한다. */
export function mountTsPlayground(container: HTMLElement, opts: TsPlaygroundOptions): void {
  const id = `ts-playground-${instanceCounter++}`;
  const initialCode = opts.code.trim();

  container.innerHTML = `
    <div class="ts-playground-wrapper">
      <div class="ts-playground-toolbar">
        <span class="ts-playground-label">
          코드를 직접 수정해보세요
          <span class="ts-playground-version-badge">TypeScript ${opts.version}</span>
        </span>
        <button type="button" class="ts-playground-reset" id="${id}-reset">⟳ 초기 코드로 되돌리기</button>
      </div>
      <div class="ts-playground-body">
        <textarea class="ts-playground-editor" id="${id}-editor" spellcheck="false" autocapitalize="off"></textarea>
        <div class="ts-playground-diagnostics">
          <div class="ts-playground-diagnostics-header">
            <span>진단 (Diagnostics)</span>
          </div>
          <div class="ts-playground-diagnostics-body" id="${id}-diagnostics">
            <p class="ts-playground-diagnostics-loading">TypeScript ${opts.version} 컴파일러를 불러오는 중...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const editor = container.querySelector<HTMLTextAreaElement>(`#${id}-editor`)!;
  const diagnosticsEl = container.querySelector<HTMLDivElement>(`#${id}-diagnostics`)!;
  const resetBtn = container.querySelector<HTMLButtonElement>(`#${id}-reset`)!;
  editor.value = initialCode;

  let debounceTimer: number | undefined;
  let requestSeq = 0;

  async function runCheck() {
    const mySeq = ++requestSeq;
    const code = editor.value;
    try {
      const diagnostics = await checkTypeScript(opts.version, code, opts.compilerOptions ?? {}, opts.extraFiles ?? {});
      if (mySeq !== requestSeq) return; // 그 사이 더 최신 입력이 있었으면 이 결과는 버린다
      renderDiagnostics(diagnosticsEl, diagnostics);
    } catch (err) {
      if (mySeq !== requestSeq) return;
      diagnosticsEl.innerHTML = `<p class="ts-playground-diagnostics-loading" style="color: var(--danger);">${escapeHtml(
        err instanceof Error ? err.message : String(err),
      )}</p>`;
    }
  }

  function scheduleCheck() {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(runCheck, 500);
  }

  editor.addEventListener("input", scheduleCheck);
  resetBtn.addEventListener("click", () => {
    editor.value = initialCode;
    runCheck();
  });

  runCheck();
}
