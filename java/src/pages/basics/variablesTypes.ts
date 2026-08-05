import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const PRIMITIVE_TABLE = `
byte    1바이트  -128 ~ 127
short   2바이트  -32768 ~ 32767
int     4바이트  약 -21억 ~ 21억 (정수 기본 타입)
long    8바이트  int보다 훨씬 큰 정수. 리터럴 끝에 L을 붙인다 (예: 8_000_000_000L)
float   4바이트  소수 (정밀도 낮음, 끝에 f 필요)
double  8바이트  소수 기본 타입
char    2바이트  문자 하나 (작은따옴표)
boolean 1비트*   true / false
`;

const CASTING = `
// 좁은 타입 -> 넓은 타입: 자동 형변환(widening), 정보 손실 없음
int smallNumber = 100;
double widened = smallNumber;

// 넓은 타입 -> 좁은 타입: 명시적 형변환(narrowing) 필요, 정보 손실 가능
double pi = 3.14159;
int truncated = (int) pi;   // 소수점 아래가 그냥 잘려나간다 (반올림 아님) -> 3
`;

const PLAYGROUND = `
public class Main {
  public static void main(String[] args) {
    int age = 25;
    double price = 19.99;
    boolean isOpen = true;
    char grade = 'A';
    long population = 8_000_000_000L; // int 범위를 넘으므로 long + L 접미사가 필요

    int smallNumber = 100;
    double widened = smallNumber;

    double pi = 3.14159;
    int truncated = (int) pi;

    System.out.println("age = " + age);
    System.out.println("price = " + price);
    System.out.println("isOpen = " + isOpen);
    System.out.println("grade = " + grade);
    System.out.println("population = " + population);
    System.out.println("widened(자동 변환) = " + widened);
    System.out.println("truncated(명시적 캐스팅) = " + truncated);
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>변수 · 타입 <span class="badge">기초</span></h1>
      <p>
        Java는 변수를 선언할 때 반드시 타입을 명시하는 정적 타입 언어입니다. 타입은
        크게 <strong>기본형(primitive)</strong> 8종과, 그 외 모든 것(문자열, 배열,
        객체)에 해당하는 <strong>참조형(reference)</strong>으로 나뉩니다.
      </p>
      ${codeBlock(PRIMITIVE_TABLE, "기본형(primitive) 8종")}
      <p class="hint">
        * <code>boolean</code>은 JVM 내부적으로 1비트만 쓰지는 않지만(구현에 따라
        다름), 개념적으로 참/거짓 두 값만 표현합니다.
      </p>

      <h2 id="casting">형변환 (Casting)</h2>
      <p>
        더 작은 범위의 타입에서 더 큰 범위의 타입으로 바꾸는 건 정보 손실이 없어
        자동으로 이루어지지만(widening), 그 반대는 정보가 잘릴 수 있어 반드시
        <code>(타입)</code>을 앞에 붙여 "내가 손실을 감수하겠다"고 명시해야
        컴파일됩니다(narrowing).
      </p>
      ${codeBlock(CASTING, "widening vs narrowing")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>int truncated = (int) pi;</code>를 <code>Math.round(pi)</code>로
        바꿔보세요 — 단순히 자르는 것과 반올림하는 것의 차이를 확인할 수 있습니다
        (<code>Math.round</code>는 <code>long</code>을 반환하니 <code>(int)</code>로
        한 번 더 감싸야 합니다).
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "변수/타입",
    code: PLAYGROUND,
  });
};
