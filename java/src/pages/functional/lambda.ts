import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const SYNTAX = `
(매개변수) -> 표현식
(매개변수) -> { 여러 줄 문장; return 값; }

// 예: 두 정수를 더하는 람다
(int a, int b) -> a + b
(a, b) -> a + b   // 문맥으로 타입을 알 수 있으면 타입 생략 가능
`;

const FUNCTIONAL_INTERFACE = `
// "추상 메서드가 딱 하나뿐인" 인터페이스에만 람다를 대입할 수 있다
@FunctionalInterface
interface Calculator {
  int calculate(int a, int b);
}

Calculator add = (a, b) -> a + b; // Calculator.calculate(int,int)의 구현으로 취급된다
`;

const PLAYGROUND = `
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

interface Calculator {
  int calculate(int a, int b);
}

public class Main {
  public static void main(String[] args) {
    List<String> names = new ArrayList<>();
    names.add("Charlie");
    names.add("Alice");
    names.add("Bob");

    // Comparator도 결국 추상 메서드 하나짜리 인터페이스라 람다로 바로 구현할 수 있다
    Collections.sort(names, (a, b) -> a.compareTo(b));
    System.out.println("이름순: " + names);

    Collections.sort(names, (a, b) -> a.length() - b.length());
    System.out.println("길이순: " + names);

    // 커스텀 함수형 인터페이스도 마찬가지다
    Calculator add = (a, b) -> a + b;
    Calculator multiply = (a, b) -> a * b;

    System.out.println("3 + 4 = " + add.calculate(3, 4));
    System.out.println("3 * 4 = " + multiply.calculate(3, 4));
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>람다 표현식 <span class="badge">함수형</span></h1>
      <p>
        람다는 "이름 없는 함수"를 아주 짧게 표현하는 문법입니다. 익명 클래스로
        <code>new Comparator&lt;String&gt;() { public int compare(...) {...} }</code>
        처럼 장황하게 쓰던 코드를 한 줄로 줄여줍니다.
      </p>
      ${codeBlock(SYNTAX, "람다 문법")}

      <h2 id="functional-interface">함수형 인터페이스</h2>
      <p>
        람다는 아무 곳에나 쓸 수 있는 게 아니라, <strong>추상 메서드가 정확히
        하나뿐인 인터페이스</strong>(함수형 인터페이스)의 구현으로만 쓰입니다.
        <code>@FunctionalInterface</code>는 필수는 아니지만, 실수로 메서드를
        추가해 조건이 깨지면 컴파일 오류로 바로 알려주는 안전장치입니다.
      </p>
      ${codeBlock(FUNCTIONAL_INTERFACE, "함수형 인터페이스 정의와 람다 대입")}
      <p>
        <code>List.sort</code>가 받는 <code>Comparator&lt;T&gt;</code>도
        <code>compare(T, T)</code> 메서드 하나뿐인 함수형 인터페이스라서, 아래
        실습 코드처럼 람다를 바로 넘길 수 있습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>Calculator subtract = (a, b) -> a - b;</code>를 추가하고
        <code>subtract.calculate(10, 3)</code>을 출력해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "람다",
    code: PLAYGROUND,
  });
};
