import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function greet(person) {
  var name = person.name;
  var age = person.age;
  return "Hi " + name + ", you are " + age + " years old.";
}

var arr = [1, 2, 3];
var first = arr[0];
var rest = arr.slice(1);
`;

const AFTER = `
function greet({ name, age }) {
  // 템플릿 리터럴: 문자열 연결(+) 대신 백틱과 \${표현식}
  return \`Hi \${name}, you are \${age} years old.\`;
}

const [first, ...rest] = [1, 2, 3];
console.log(first, rest);

const person = { name: "Ada", age: 30, city: "London" };
const { name, ...others } = person; // 객체 구조분해 + 나머지는 ES2018부터
console.log(name, others);

console.log(greet(person));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>템플릿 리터럴 & 구조분해 할당 <span class="badge">ES2015</span></h1>
      <p>
        문자열을 <code>+</code>로 이어붙이고, 객체/배열에서 값을 하나씩 <code>obj.x</code>,
        <code>arr[0]</code>으로 꺼내던 방식을 훨씬 선언적으로 바꿔주는 두 문법입니다.
      </p>

      <h2 id="before">이전 방식</h2>
      ${codeBlock(BEFORE, "문자열 연결 + 인덱스 접근")}

      <h2 id="after">템플릿 리터럴 + 구조분해</h2>
      <p>
        백틱(<code>\`</code>)으로 감싼 <strong>템플릿 리터럴</strong>은 <code>${"${표현식}"}</code>
        로 값을 바로 삽입할 수 있고 줄바꿈도 그대로 유지됩니다. <strong>구조분해 할당</strong>은
        객체/배열의 값을 변수로 바로 꺼내며, 함수 매개변수 자리에서도 그대로 쓸 수 있습니다.
      </p>
      ${codeBlock(AFTER, "템플릿 리터럴 + 구조분해")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>person</code>에 <code>country: "UK"</code>를 추가하고, 구조분해에서
        <code>country</code>만 따로 꺼내보거나 기본값(<code>= "Unknown"</code>)을 지정해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2015",
    code: AFTER,
  });
};
