import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const SYNTAX = `
class ClassName {
  // 필드(상태)
  private String field;

  // 생성자: 클래스와 이름이 같고 반환 타입이 없다
  public ClassName(String field) {
    this.field = field; // this로 매개변수와 필드 이름 충돌을 구분
  }

  // 메서드(행동)
  public String getField() {
    return field;
  }
}
`;

const PLAYGROUND = `
class Book {
  private String title;
  private String author;
  private int year;

  public Book(String title, String author, int year) {
    this.title = title;
    this.author = author;
    this.year = year;
  }

  public String describe() {
    return title + " by " + author + " (" + year + ")";
  }
}

public class Main {
  public static void main(String[] args) {
    Book b1 = new Book("Effective Java", "Joshua Bloch", 2018);
    Book b2 = new Book("Clean Code", "Robert C. Martin", 2008);

    System.out.println(b1.describe());
    System.out.println(b2.describe());
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>클래스 · 생성자 <span class="badge">OOP</span></h1>
      <p>
        클래스는 데이터(필드)와 그 데이터를 다루는 동작(메서드)을 하나로 묶는 틀입니다.
        <code>new</code>로 클래스의 인스턴스(객체)를 만들 때마다 생성자가 실행되어
        초기 상태를 설정합니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}
      <p>
        <code>this.field = field</code>처럼 생성자 매개변수 이름과 필드 이름이 같으면,
        <code>this</code>를 붙여야 "지금 이 매개변수"와 "이 객체의 필드"를 컴파일러가
        구분할 수 있습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>Book</code>에 <code>isAvailable</code>(대출 가능 여부) 같은
        <code>boolean</code> 필드를 추가하고, 생성자와 <code>describe()</code>에도
        반영해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "클래스",
    code: PLAYGROUND,
  });
};
