import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const IF_SYNTAX = `
if (condition) {
  // ...
} else if (otherCondition) {
  // ...
} else {
  // ...
}
`;

const FOR_WHILE_SYNTAX = `
for (int i = 0; i < 5; i++) {
  // 0, 1, 2, 3, 4
}

int i = 0;
while (i < 5) {
  // ...
  i++;
}

// 배열/컬렉션을 순회할 때는 for-each가 더 간결하다
int[] numbers = { 1, 2, 3 };
for (int n : numbers) {
  // n에 1, 2, 3이 차례로 들어온다
}
`;

const SWITCH_SYNTAX = `
switch (day) {
  case 1:
  case 7:
    System.out.println("주말");
    break;   // break를 빠뜨리면 다음 case로 그대로 흘러 내려간다(fall-through)
  case 2:
  case 3:
  case 4:
  case 5:
  case 6:
    System.out.println("평일");
    break;
  default:
    System.out.println("알 수 없는 요일");
}
`;

const PLAYGROUND = `
public class Main {
  public static void main(String[] args) {
    // 고전적인 FizzBuzz: 3의 배수면 Fizz, 5의 배수면 Buzz, 둘 다면 FizzBuzz
    for (int i = 1; i <= 20; i++) {
      if (i % 15 == 0) {
        System.out.println("FizzBuzz");
      } else if (i % 3 == 0) {
        System.out.println("Fizz");
      } else if (i % 5 == 0) {
        System.out.println("Buzz");
      } else {
        System.out.println(i);
      }
    }
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>제어문 (if · for · switch) <span class="badge">기초</span></h1>
      <p>
        조건에 따라 분기하거나 코드를 반복 실행하는 기본 구조입니다. 다른 C 계열
        언어(JavaScript, C, C#)를 다뤄봤다면 문법이 거의 그대로 눈에 익을 것입니다.
      </p>

      <h2 id="if">if / else</h2>
      ${codeBlock(IF_SYNTAX, "if-else 문법")}

      <h2 id="loops">for / while</h2>
      ${codeBlock(FOR_WHILE_SYNTAX, "반복문 문법")}

      <h2 id="switch">switch</h2>
      <p>
        <code>switch</code>는 하나의 값을 여러 <code>case</code>와 비교합니다.
        <code>break</code>를 빠뜨리면 그 아래 <code>case</code>로 실행이 그대로
        이어지는 "fall-through"가 일어나는데, 이는 실수로 자주 발생하는 버그의
        원인이지만 아래처럼 <strong>여러 case를 의도적으로 묶을 때</strong>는 오히려
        유용하게 쓰입니다.
      </p>
      ${codeBlock(SWITCH_SYNTAX, "switch 문법 (case 묶기 포함)")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        범위를 <code>i &lt;= 20</code>에서 <code>i &lt;= 30</code>으로 늘려보거나,
        7의 배수일 때 "Bazz"를 추가로 출력하는 조건을 <code>else if</code>로
        끼워 넣어보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "제어문",
    code: PLAYGROUND,
  });
};
