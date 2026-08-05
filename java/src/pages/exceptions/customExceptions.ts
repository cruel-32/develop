import type { PageRender } from "../../router";
import { mountJavaPlayground } from "../../javaPlayground";
import { codeBlock } from "../../pageHelpers";

const SYNTAX = `
// Exception을 상속하면 checked 예외가 된다 (호출하는 쪽에서 반드시 처리해야 함)
class MyException extends Exception {
  public MyException(String message) {
    super(message); // Exception의 생성자가 message를 보관해 getMessage()로 꺼낼 수 있게 한다
  }
}

// 이 예외를 던질 수 있는 메서드는 반드시 throws로 선언해야 한다
void doSomething() throws MyException {
  throw new MyException("문제가 발생했습니다");
}
`;

const PLAYGROUND = `
class InsufficientFundsException extends Exception {
  public InsufficientFundsException(String message) {
    super(message);
  }
}

class BankAccount {
  private double balance;

  public BankAccount(double balance) {
    this.balance = balance;
  }

  public void withdraw(double amount) throws InsufficientFundsException {
    if (amount > balance) {
      throw new InsufficientFundsException(
          "잔액 부족: 잔액 " + balance + ", 요청 금액 " + amount);
    }
    balance -= amount;
  }

  public double getBalance() {
    return balance;
  }
}

public class Main {
  public static void main(String[] args) {
    BankAccount account = new BankAccount(1000);

    try {
      account.withdraw(300);
      System.out.println("출금 성공, 잔액: " + account.getBalance());

      account.withdraw(2000); // 잔액을 초과하는 출금 -> 예외 발생
      System.out.println("이 줄은 실행되지 않는다");
    } catch (InsufficientFundsException e) {
      System.out.println("출금 실패: " + e.getMessage());
    }

    System.out.println("최종 잔액: " + account.getBalance());
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>커스텀 예외 <span class="badge">예외 처리</span></h1>
      <p>
        <code>ArithmeticException</code> 같은 표준 예외로는 "왜" 실패했는지를
        도메인 언어로 표현하기 어렵습니다. <code>Exception</code>(또는
        <code>RuntimeException</code>)을 상속해서 직접 예외 클래스를 만들면, "잔액
        부족" 같은 비즈니스 규칙 위반을 그 자체로 타입이 있는 신호로 표현할 수
        있습니다.
      </p>
      ${codeBlock(SYNTAX, "커스텀 예외 정의와 throws")}

      <h2 id="throw-vs-throws">throw와 throws</h2>
      <p>
        <code>throw</code>는 실제로 예외 객체를 "던지는" 실행문이고,
        <code>throws</code>는 메서드 시그니처에 "이 메서드는 이런 예외를 던질 수
        있다"고 미리 선언하는 것입니다. <code>InsufficientFundsException</code>처럼
        <code>Exception</code>을 상속한 checked 예외는 <code>throws</code> 선언
        없이 <code>throw</code>만 하면 컴파일되지 않습니다 — 호출하는 쪽이 이
        가능성을 <code>try-catch</code>로든 자신의 <code>throws</code>로든 반드시
        인지하게 만드는 게 checked 예외의 목적입니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>account.withdraw(2000)</code>을 <code>account.withdraw(500)</code>로
        바꿔보세요 — 잔액(700) 이내라 예외 없이 성공하고, "이 줄은 실행되지 않는다"도
        실제로 출력되는 걸 확인할 수 있습니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountJavaPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "커스텀 예외",
    code: PLAYGROUND,
  });
};
