import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const WHEN_TO_USE = `
List<E>  순서가 있고 중복을 허용한다     (예: 대기열, 방문 기록)
Set<E>   순서 보장 없고 중복을 허용 안 함 (예: 태그, 중복 제거된 id 목록)
Map<K,V> 키-값 쌍                        (예: 사용자 id -> 사용자 정보)
`;

const ARRAYLIST_VS_ARRAY = `
// 배열은 크기 고정, ArrayList는 필요에 따라 자동으로 늘어난다
int[] fixedArray = new int[3];        // 크기 3으로 고정
List<Integer> growable = new ArrayList<>();
growable.add(1);
growable.add(2);
growable.add(3);
growable.add(4); // 배열과 달리 계속 추가할 수 있다
`;

const PLAYGROUND = `
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Main {
  public static void main(String[] args) {
    List<String> names = new ArrayList<>();
    names.add("Ada");
    names.add("Grace");
    names.add("Linus");
    names.remove("Linus");

    Map<String, Integer> scores = new HashMap<>();
    scores.put("Ada", 95);
    scores.put("Grace", 88);

    Set<Integer> uniqueNumbers = new HashSet<>();
    uniqueNumbers.add(1);
    uniqueNumbers.add(2);
    uniqueNumbers.add(1); // 이미 있는 값이라 무시된다 -> 크기는 여전히 2

    System.out.println("names = " + names);
    System.out.println("Ada의 점수 = " + scores.get("Ada"));
    System.out.println("uniqueNumbers 크기 = " + uniqueNumbers.size());

    for (Map.Entry<String, Integer> entry : scores.entrySet()) {
      System.out.println(entry.getKey() + " -> " + entry.getValue());
    }
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>List · Map · Set <span class="badge">컬렉션</span></h1>
      <p>
        <code>java.util</code> 패키지의 컬렉션 프레임워크는 배열의 "크기 고정"이라는
        한계를 넘어서는 자료구조를 제공합니다. 세 가지는 서로 다른 상황에 맞게
        고릅니다.
      </p>
      ${codeBlock(WHEN_TO_USE, "언제 무엇을 쓸까")}
      ${codeBlock(ARRAYLIST_VS_ARRAY, "배열 vs ArrayList")}

      <h2 id="interface-impl">인터페이스와 구현체</h2>
      <p>
        <code>List</code>, <code>Map</code>, <code>Set</code>은 모두 인터페이스이고,
        <code>ArrayList</code>, <code>HashMap</code>, <code>HashSet</code>은 그
        구현체 중 하나입니다. <code>List&lt;String&gt; names = new ArrayList&lt;&gt;()</code>
        처럼 <strong>선언은 인터페이스 타입으로, 생성은 구체 클래스로</strong> 하는 게
        관례입니다 — 나중에 <code>ArrayList</code>를 <code>LinkedList</code>로
        바꿔도 <code>names</code>를 사용하는 나머지 코드는 전혀 손댈 필요가 없습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>scores.containsKey("Linus")</code>의 결과를 출력해보거나,
        <code>scores.getOrDefault("Linus", 0)</code>으로 존재하지 않는 키를 안전하게
        조회하는 방법도 시도해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "List/Map/Set",
    code: PLAYGROUND,
  });
};
