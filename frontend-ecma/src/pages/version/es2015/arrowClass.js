import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function Counter(start) {
  this.count = start;
}
Counter.prototype.increment = function () {
  this.count += 1;
  return this.count;
};

var Timer = function () {
  this.seconds = 0;
  var self = this; // this를 미리 저장해둬야 콜백 안에서 쓸 수 있었다
  setInterval(function () {
    self.seconds += 1;
  }, 1000);
};
`;

const AFTER = `
class Counter {
  #count; // private 필드는 ES2022, 여기선 일반 프로퍼티로

  constructor(start) {
    this.count = start;
  }

  increment() {
    this.count += 1;
    return this.count;
  }
}

class Timer {
  seconds = 0;

  start() {
    // 화살표 함수는 자기 this가 없다 -> 클래스 인스턴스의 this를 그대로 가리킨다
    setInterval(() => {
      this.seconds += 1;
    }, 1000);
  }
}

const c = new Counter(0);
console.log(c.increment(), c.increment(), c.increment());
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>화살표 함수 & 클래스 <span class="badge">ES2015</span></h1>
      <p>
        <code>function</code> 표현식은 호출될 때마다 <code>this</code>가 새로 바인딩되어,
        콜백 안에서 바깥 <code>this</code>를 쓰려면 <code>var self = this</code> 같은
        우회가 필요했습니다. 그리고 프로토타입 기반 "생성자 함수" 패턴은 상속 구현이 장황했습니다.
      </p>

      <h2 id="before">이전 패턴</h2>
      ${codeBlock(BEFORE, "생성자 함수 + prototype + self = this")}

      <h2 id="after">화살표 함수 + class</h2>
      <p>
        화살표 함수(<code>=&gt;</code>)는 자신만의 <code>this</code>를 만들지 않고 정의된
        스코프의 <code>this</code>를 그대로 사용합니다(lexical this). <code>class</code>는
        생성자 함수 + prototype 패턴을 감싼 문법 설탕이지만, <code>extends</code>/<code>super</code>로
        상속을 훨씬 명확하게 표현할 수 있습니다.
      </p>
      ${codeBlock(AFTER, "class + 화살표 함수")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>start()</code> 안의 화살표 함수를 일반 <code>function</code>으로 바꿔보면
        <code>this.seconds</code>가 <code>undefined</code>가 되는 것을 콘솔에서 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2015",
    code: AFTER,
  });
};
