import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const SYNTAX = `
collection.stream()
  .filter(x -> condition)   // 조건에 맞는 것만 남긴다
  .map(x -> transform)      // 각 원소를 변형한다
  .collect(Collectors.toList());  // 다시 List로 모은다(스트림은 "소모"되면 재사용 불가)
`;

const IMPERATIVE_VS_STREAM = `
// 명령형: "어떻게" 반복하고 누적할지 직접 기술
List<Integer> result = new ArrayList<>();
for (int n : numbers) {
  if (n % 2 == 0) {
    result.add(n * n);
  }
}

// 스트림: "무엇을" 할지만 선언 - filter/map 각각의 책임이 분리된다
List<Integer> result2 = numbers.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .collect(Collectors.toList());
`;

const PLAYGROUND = `
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
  public static void main(String[] args) {
    List<Integer> numbers = new ArrayList<>();
    for (int i = 1; i <= 10; i++) {
      numbers.add(i);
    }

    List<Integer> evenSquares = numbers.stream()
        .filter(n -> n % 2 == 0)
        .map(n -> n * n)
        .collect(Collectors.toList());
    System.out.println("짝수의 제곱: " + evenSquares);

    int sum = numbers.stream()
        .mapToInt(Integer::intValue)
        .sum();
    System.out.println("합계: " + sum);

    long count = numbers.stream()
        .filter(n -> n > 5)
        .count();
    System.out.println("5보다 큰 수의 개수: " + count);
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Stream API <span class="badge">함수형</span></h1>
      <p>
        Stream은 컬렉션을 "어떻게 반복할지"가 아니라 "무엇을 할지"로 선언하게 해주는
        API입니다. <code>filter</code>(거르기), <code>map</code>(변형하기),
        <code>collect</code>(다시 모으기) 같은 연산을 체이닝으로 이어 붙입니다.
      </p>
      ${codeBlock(SYNTAX, "기본 흐름")}
      ${codeBlock(IMPERATIVE_VS_STREAM, "for 반복문 vs Stream")}
      <p>
        스트림 연산은 <code>filter</code>/<code>map</code>처럼 다른 스트림을
        돌려주는 "중간 연산"과, <code>collect</code>/<code>sum</code>/<code>count</code>
        처럼 최종 결과를 만들어내는 "최종 연산"으로 나뉩니다. 최종 연산이 호출되기
        전까지는 중간 연산이 실제로 실행되지 않고(지연 평가), 스트림 하나는 최종
        연산 한 번으로 소모되면 다시 쓸 수 없습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>mapToInt(Integer::intValue).sum()</code>을
        <code>mapToInt(Integer::intValue).max()</code>로 바꿔보세요 —
        <code>max()</code>는 값이 없을 수도 있어(빈 스트림) <code>int</code>가 아니라
        <code>OptionalInt</code>를 반환하므로, <code>.getAsInt()</code>를 붙여야
        합니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "Stream",
    code: PLAYGROUND,
  });
};
