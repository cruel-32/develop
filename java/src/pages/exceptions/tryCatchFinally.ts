import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const SYNTAX = `
try {
  // 예외가 발생할 수 있는 코드
} catch (SpecificException e) {
  // 그 예외 타입일 때만 실행
} finally {
  // 예외 발생 여부와 상관없이 항상 실행 (자원 정리 등)
}
`;

const CHECKED_VS_UNCHECKED = `
// Unchecked(RuntimeException 계열): 컴파일러가 처리를 강제하지 않는다
// 예: ArrayIndexOutOfBoundsException, NullPointerException, ArithmeticException
// - 대부분 "코드를 고쳐야 할 버그"에 가깝다

// Checked(그 외 Exception 계열): 반드시 catch하거나 메서드에 throws로 선언해야 컴파일된다
// 예: IOException
// - "코드가 맞아도 외부 요인(파일 없음 등)으로 실패할 수 있는 상황"에 가깝다
`;

const PLAYGROUND = `
public class Main {
  public static void main(String[] args) {
    int[] numbers = { 1, 2, 3 };

    try {
      System.out.println(numbers[5]); // 배열 범위를 벗어난 인덱스
    } catch (ArrayIndexOutOfBoundsException e) {
      System.out.println("배열 인덱스 오류: " + e.getClass().getSimpleName());
    } finally {
      System.out.println("finally는 예외 발생 여부와 상관없이 항상 실행된다");
    }

    try {
      int result = 10 / 0;
      System.out.println(result);
    } catch (ArithmeticException e) {
      System.out.println("산술 오류: " + e.getClass().getSimpleName());
    }

    try {
      Object obj = "문자열";
      Integer number = (Integer) obj; // 잘못된 캐스팅
      System.out.println(number);
    } catch (ClassCastException | NullPointerException e) {
      // 서로 다른 예외 타입을 |로 묶어 하나의 catch에서 함께 처리할 수 있다
      System.out.println("캐스팅/null 오류: " + e.getClass().getSimpleName());
    }
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>try · catch · finally <span class="badge">예외 처리</span></h1>
      <p>
        예외(Exception)는 프로그램 실행 중 발생하는 비정상적인 상황입니다.
        <code>try</code> 블록 안에서 예외가 발생하면, 그 즉시 나머지 <code>try</code>
        코드는 건너뛰고 타입이 맞는 <code>catch</code> 블록으로 넘어갑니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="checked-vs-unchecked">Checked vs Unchecked 예외</h2>
      ${codeBlock(CHECKED_VS_UNCHECKED, "두 종류의 차이")}

      <h2 id="multi-catch">여러 catch, 그리고 catch 순서</h2>
      <p>
        <code>catch</code> 블록은 여러 개 이어 쓸 수 있고, Java 7부터는
        <code>catch (A | B e)</code>처럼 관련 없는 예외 타입 여러 개를 하나의
        블록에서 함께 처리할 수도 있습니다. 여러 <code>catch</code>를 쓸 때는
        <strong>더 구체적인 예외를 먼저</strong> 써야 합니다 — 부모 타입인
        <code>Exception</code>을 먼저 잡아버리면 그 아래 더 구체적인
        <code>catch</code>는 절대 실행되지 않아 컴파일 오류가 납니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>numbers[5]</code>를 <code>numbers[1]</code>로 바꿔보세요 — 예외가
        발생하지 않아도 <code>finally</code> 블록은 여전히 실행되는 걸 확인할 수
        있습니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "try-catch",
    code: PLAYGROUND,
  });
};
