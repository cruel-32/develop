import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const SYNTAX = `
class Parent {
  public String greet() {
    return "Parent";
  }
}

class Child extends Parent {
  @Override
  public String greet() {
    // super로 부모의 구현을 그대로 활용할 수도 있다
    return super.greet() + " -> Child";
  }
}
`;

const PLAYGROUND = `
class Animal {
  protected String name;

  public Animal(String name) {
    this.name = name;
  }

  public String makeSound() {
    return "...";
  }
}

class Dog extends Animal {
  public Dog(String name) {
    super(name); // 부모(Animal)의 생성자를 먼저 호출해야 한다
  }

  @Override
  public String makeSound() {
    return "멍멍!";
  }
}

class Cat extends Animal {
  public Cat(String name) {
    super(name);
  }

  @Override
  public String makeSound() {
    return "야옹!";
  }
}

public class Main {
  public static void main(String[] args) {
    // Animal 타입 배열에 Dog/Cat 인스턴스를 그대로 담을 수 있다 (업캐스팅)
    Animal[] animals = { new Dog("바둑이"), new Cat("나비"), new Animal("이름없음") };

    for (Animal a : animals) {
      // a의 선언 타입은 Animal이지만, 실제로 호출되는 건 각자의 오버라이드된 메서드다
      System.out.println(a.name + ": " + a.makeSound());
    }
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>상속과 다형성 <span class="badge">OOP</span></h1>
      <p>
        <code>extends</code>로 다른 클래스를 상속하면 부모의 필드와 메서드를
        물려받습니다. 자식 클래스의 생성자는 <code>super(...)</code>로 부모 생성자를
        먼저 호출해야 하고(명시하지 않으면 컴파일러가 매개변수 없는
        <code>super()</code>를 자동으로 넣어줍니다), <code>@Override</code>로 부모의
        메서드를 자식이 다시 정의(오버라이딩)할 수 있습니다.
      </p>
      ${codeBlock(SYNTAX, "상속 기본 문법")}

      <h2 id="polymorphism">다형성 — 선언 타입이 아니라 실제 타입의 메서드가 실행된다</h2>
      <p>
        <code>Animal</code> 타입의 변수(또는 배열)에 <code>Dog</code>,
        <code>Cat</code> 같은 자식 인스턴스를 그대로 담을 수 있습니다(업캐스팅). 이때
        <code>makeSound()</code>를 호출하면, 변수의 <em>선언된 타입</em>이 아니라
        <em>실제로 담긴 객체의 타입</em>에 오버라이드된 메서드가 실행됩니다 — 이게
        다형성입니다. 덕분에 <code>Animal[]</code> 배열 하나로 서로 다른 동물을 같은
        코드로 순회할 수 있습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>Bird</code> 클래스를 <code>Animal</code>을 상속해서 새로 만들고(예:
        <code>makeSound()</code>가 "짹짹!"을 반환), <code>animals</code> 배열에
        <code>new Bird("참새")</code>를 추가해보세요 — 나머지 코드는 전혀 손대지
        않아도 그대로 동작하는 게 다형성의 핵심입니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "상속",
    code: PLAYGROUND,
  });
};
