/**
 * CheerpJ는 npm 패키지가 아니라 index.html의 <script> 태그로 전역에 로드된다
 * (Community License상 우리가 자체 호스팅/번들링할 수 없어 CDN 로더를 그대로 쓴다).
 * 공식 타입 패키지가 없어 실제 사용하는 함수만 최소한으로 선언한다.
 */
declare function cheerpjInit(options?: { status?: "splash" | "none" | "default" }): Promise<void>;
declare function cheerpjCreateDisplay(width: number, height: number, target?: HTMLElement): unknown;
declare function cheerpjRunMain(
  className: string,
  classPath: string,
  ...args: string[]
): Promise<number>;
declare function cheerpjAddStringFile(path: string, content: Uint8Array): void;
