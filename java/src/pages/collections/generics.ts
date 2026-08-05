import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const WITHOUT_GENERICS = `
// 제네릭이 없다면 Object로 뭐든 담을 수 있지만, 꺼낼 때마다 형변환이 필요하고
// 실수로 다른 타입을 넣어도 "컴파일 시점"에는 아무 문제가 없어 보인다
class Box {
  private Object content;
  public void set(Object content) { this.content = content; }
  public Object get() { return content; }
}

Box box = new Box();
box.set("hello");
String s = (String) box.get(); // 매번 캐스팅 필요, 캐스팅 실수는 "실행 중"에야 터진다
`;

const WITH_GENERICS = `
// <T>로 "이 클래스가 다룰 타입"을 사용하는 쪽에서 정하게 한다
class Box<T> {
  private T content;
  public void set(T content) { this.content = content; }
  public T get() { return content; } // 캐스팅 없이 T 그대로 반환
}

Box<String> box = new Box<>();
box.set("hello");
String s = box.get(); // 캐스팅 불필요, 애초에 String 아닌 값은 컴파일조차 안 된다
`;

const PLAYGROUND = `
class Box<T> {
  private T content;

  public void set(T content) {
    this.content = content;
  }

  public T get() {
    return content;
  }
}

class Pair<K, V> {
  private K key;
  private V value;

  public Pair(K key, V value) {
    this.key = key;
    this.value = value;
  }

  @Override
  public String toString() {
    return key + " = " + value;
  }
}

public class Main {
  public static void main(String[] args) {
    Box<String> stringBox = new Box<>();
    stringBox.set("Hello Generics");
    System.out.println(stringBox.get());

    Box<Integer> intBox = new Box<>();
    intBox.set(42);
    System.out.println(intBox.get());

    Pair<String, Integer> pair = new Pair<>("age", 30);
    System.out.println(pair);
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>제네릭 <span class="badge">컬렉션</span></h1>
      <p>
        제네릭은 "이 클래스/메서드가 어떤 타입을 다룰지"를 사용하는 쪽에서 나중에
        정할 수 있게 해주는 기능입니다. <code>List&lt;String&gt;</code>의
        <code>&lt;String&gt;</code>이 바로 제네릭 타입 인자입니다.
      </p>
      ${codeBlock(WITHOUT_GENERICS, "제네릭 없이 Object로 만들면")}
      ${codeBlock(WITH_GENERICS, "제네릭으로 바꾸면")}
      <p>
        핵심은 <strong>타입 오류를 실행 중이 아니라 컴파일 시점에</strong> 잡아낸다는
        것입니다. <code>Box&lt;String&gt;</code>에 <code>set(42)</code>를 호출하려고
        하면 애초에 컴파일이 되지 않습니다.
      </p>

      <h2 id="multiple-params">타입 매개변수 여러 개</h2>
      <p>
        <code>Pair&lt;K, V&gt;</code>처럼 타입 매개변수는 여러 개를 둘 수 있습니다.
        관례상 하나짜리는 <code>T</code>(Type), 컬렉션 요소는 <code>E</code>
        (Element), 키/값 쌍은 <code>K</code>/<code>V</code>(Key/Value)를 씁니다 —
        Java 컬렉션 프레임워크 자체가 이 관례를 따릅니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>Pair&lt;String, Integer&gt;</code>를
        <code>Pair&lt;String, String&gt;</code>으로 바꿔서
        <code>new Pair&lt;&gt;("도시", "서울")</code>처럼 다른 타입 조합으로도
        재사용해보세요 — 같은 <code>Pair</code> 클래스 코드를 전혀 고치지 않고도
        됩니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "제네릭",
    code: PLAYGROUND,
  });
};
