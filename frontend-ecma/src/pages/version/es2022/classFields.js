import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
class BankAccount {
  constructor(owner, initialBalance) {
    this.owner = owner;
    this._balance = initialBalance; // 관례상 _ 접두어로 "private"임을 표시할 뿐, 진짜 private은 아니다
  }

  getBalance() {
    return this._balance;
  }

  deposit(amount) {
    this._balance += amount;
    return this._balance;
  }
}

const acc = new BankAccount("Ada", 1000);
acc._balance = 999999999; // 관례를 무시하면 외부에서 그냥 접근/조작 가능
console.log(acc.getBalance());
`;

const AFTER = `
class BankAccount {
  owner;          // 퍼블릭 클래스 필드 — constructor 밖에서 바로 선언
  #balance;       // # 접두어 = 진짜 private 필드. 클래스 밖에서는 문법적으로 접근 자체가 불가능

  static #bankName = "ES Bank"; // static private 필드

  constructor(owner, initialBalance) {
    this.owner = owner;
    this.#balance = initialBalance;
  }

  get balance() {
    return this.#balance;
  }

  deposit(amount) {
    this.#balance += amount;
    return this.#balance;
  }

  static describe() {
    return \`\${BankAccount.#bankName} 계좌\`;
  }
}

const acc = new BankAccount("Ada", 1000);
acc.deposit(500);
console.log(acc.balance, BankAccount.describe());

// 아래 줄의 주석을 풀고 다시 실행해보세요 — acc.#balance는 클래스 밖에서 문법적으로
// 아예 쓸 수 없는 이름이라 SyntaxError가 됩니다. TypeError와 달리 "문법 파싱 단계"의
// 에러라서 try/catch로도 잡을 수 없고(스크립트 자체가 파싱에 실패해 실행조차 안 됨),
// 그래서 이 줄이 살아있으면 이 실습창 전체가 실행되지 않습니다.
// console.log(acc.#balance);
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>클래스 필드 & private 필드 <span class="badge">ES2022</span></h1>
      <p>
        클래스 프로퍼티는 관례적으로 <code>constructor</code> 안에서 <code>this.x = ...</code>로
        초기화했고, "private"은 언더스코어(<code>_balance</code>) 같은 이름 규칙으로만
        표시했을 뿐 실제로는 외부에서 얼마든지 접근/수정할 수 있었습니다.
      </p>

      <h2 id="before">관례적 private (_ 접두어)</h2>
      ${codeBlock(BEFORE, "_balance는 이름만 private, 실제로는 그냥 public")}

      <h2 id="after">클래스 필드 + # 진짜 private</h2>
      <p>
        <code>owner;</code>처럼 <code>constructor</code> 밖에서 바로 필드를 선언할 수
        있습니다(퍼블릭 클래스 필드). <code>#</code> 접두어가 붙은 필드/메서드는
        <strong>문법 레벨에서</strong> 클래스 밖에서 접근이 차단되는 진짜 private이며,
        <code>static #x</code>처럼 정적 private 필드도 가능합니다.
      </p>
      ${codeBlock(AFTER, "퍼블릭 클래스 필드 + #private")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>acc.#balance</code>로 직접 접근하는 줄의 주석을 풀어보면(이 실습창은
        <code>new Function</code>으로 코드를 감싸 실행하므로, 클래스 밖 스코프에서 <code>#</code>
        참조가 실제로 SyntaxError가 되는 것을 콘솔에서 확인할 수 있습니다), private 필드가
        런타임 검사가 아니라 진짜 문법 규칙이라는 걸 체감해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2022",
    code: AFTER,
  });
};
