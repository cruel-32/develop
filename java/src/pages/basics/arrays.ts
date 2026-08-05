import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const DECLARE = `
// 선언과 동시에 초기화
int[] scores = { 90, 85, 77, 100 };

// 크기만 정해서 선언 (모든 원소가 기본값 0으로 채워진다)
int[] empty = new int[5];

// 길이는 length "필드"다 (메서드가 아니라 괄호 없이 접근)
System.out.println(scores.length); // 4
`;

const MULTI_DIM = `
// 2차원 배열 = "배열의 배열"
int[][] grid = {
  { 1, 2, 3 },
  { 4, 5, 6 },
};

System.out.println(grid[1][2]); // 1행 2열 -> 6
`;

const PLAYGROUND = `
public class Main {
  public static void main(String[] args) {
    int[] scores = { 90, 85, 77, 100, 63 };

    int sum = 0;
    int max = scores[0];
    for (int score : scores) {
      sum += score;
      if (score > max) {
        max = score;
      }
    }

    double average = (double) sum / scores.length; // int / int는 정수 나눗셈이라 (double)로 먼저 바꿔야 한다

    System.out.println("총합 = " + sum);
    System.out.println("평균 = " + average);
    System.out.println("최고점 = " + max);
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>배열 <span class="badge">기초</span></h1>
      <p>
        Java의 배열은 <strong>크기가 고정</strong>됩니다 — 한 번 만들면 나중에
        원소를 추가/삭제해서 늘리거나 줄일 수 없습니다(늘리려면 컬렉션 페이지에서
        다루는 <code>ArrayList</code>가 필요합니다). 모든 원소는 같은 타입이어야
        합니다.
      </p>
      ${codeBlock(DECLARE, "선언과 초기화")}

      <h2 id="foreach">for-each로 순회하기</h2>
      <p>
        인덱스가 필요 없다면 <code>for (타입 변수 : 배열)</code> 형태의 for-each가
        <code>for (int i = 0; i &lt; arr.length; i++)</code>보다 훨씬 간결하고,
        인덱스 범위를 잘못 계산해 <code>ArrayIndexOutOfBoundsException</code>이
        나는 실수도 원천적으로 막아줍니다.
      </p>

      <h2 id="multi-dim">다차원 배열</h2>
      <p>
        Java의 2차원 배열은 사실 "배열을 원소로 갖는 배열"입니다. 그래서 각 행의
        길이가 서로 달라도(울퉁불퉁한 배열, jagged array) 문법적으로는 문제없습니다.
      </p>
      ${codeBlock(MULTI_DIM, "2차원 배열")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>max</code>를 구하는 로직 옆에 <code>min</code>(최저점)도 같은 방식으로
        추가해보세요. 초기값은 <code>scores[0]</code>으로 시작하면 됩니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "배열",
    code: PLAYGROUND,
  });
};
