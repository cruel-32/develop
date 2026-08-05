import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const ABSTRACT_SYNTAX = `
abstract class Shape {
  protected String label; // 추상 클래스는 필드(상태)와 생성자를 가질 수 있다

  public Shape(String label) {
    this.label = label;
  }

  public abstract double area(); // 구현이 없는 추상 메서드 - 자식이 반드시 구현해야 한다

  public String describe() { // 일반 메서드도 자유롭게 가질 수 있다
    return label + "의 넓이는 " + area();
  }
}
`;

const INTERFACE_VS_ABSTRACT = `
// 인터페이스: 필드는 사실상 public static final 상수만 가능, 인스턴스 상태(this.x = x) 불가
// 추상 클래스: 일반 클래스처럼 필드/생성자를 가질 수 있다 (단, new로 직접 인스턴스화는 불가)
// 인터페이스: 여러 개를 동시에 implements 가능 (다중 "타입" 상속)
// 추상 클래스: extends는 하나만 가능 (단일 상속)
`;

const PLAYGROUND = `
interface Shape {
  double area(); // 본문이 없다 - 구현하는 클래스가 반드시 정의해야 한다

  // default 메서드는 인터페이스에도 실제 구현을 둘 수 있다 (Java 8+)
  default String describe() {
    return String.format("넓이는 %.2f 입니다", area());
  }
}

class Circle implements Shape {
  private double radius;

  public Circle(double radius) {
    this.radius = radius;
  }

  @Override
  public double area() {
    return Math.PI * radius * radius;
  }
}

class Rectangle implements Shape {
  private double width;
  private double height;

  public Rectangle(double width, double height) {
    this.width = width;
    this.height = height;
  }

  @Override
  public double area() {
    return width * height;
  }
}

public class Main {
  public static void main(String[] args) {
    Shape[] shapes = { new Circle(3), new Rectangle(4, 5) };

    for (Shape s : shapes) {
      System.out.println(s.getClass().getSimpleName() + " -> " + s.describe());
    }
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>인터페이스 · 추상 클래스 <span class="badge">OOP</span></h1>
      <p>
        둘 다 "구체적인 구현 없이 규격만 정의"할 수 있다는 공통점이 있지만, 쓰임새가
        다릅니다.
      </p>

      <h2 id="abstract">추상 클래스 (abstract class)</h2>
      <p>
        <code>abstract</code>가 붙은 클래스는 <code>new</code>로 직접 인스턴스를 만들
        수 없고, 반드시 상속해서 써야 합니다. 일반 클래스처럼 필드와 생성자를 가질 수
        있어서 "공통 상태 + 일부는 구현, 일부는 자식에게 강제"하고 싶을 때 씁니다.
      </p>
      ${codeBlock(ABSTRACT_SYNTAX, "추상 클래스 문법")}

      <h2 id="interface">인터페이스와의 차이</h2>
      ${codeBlock(INTERFACE_VS_ABSTRACT, "핵심 차이")}
      <p>
        실무에서는 "이 타입이 할 수 있는 일"만 규격으로 강제하고 싶을 때(다중 구현이
        필요할 때) 인터페이스를, 여러 클래스가 공통 필드/로직을 공유해야 할 때 추상
        클래스를 선택하는 경우가 많습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>Triangle</code>(밑변 <code>base</code>, 높이 <code>height</code>,
        넓이 = <code>base * height / 2</code>) 클래스를 <code>Shape</code>를
        구현해서 새로 만들고, <code>shapes</code> 배열에 추가해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "인터페이스",
    code: PLAYGROUND,
  });
};
