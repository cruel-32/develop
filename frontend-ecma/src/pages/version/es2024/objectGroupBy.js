import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var people = [
  { name: "Ada", job: "engineer" },
  { name: "Grace", job: "engineer" },
  { name: "Linus", job: "manager" },
];

var byJob = {};
people.forEach(function (p) {
  if (!byJob[p.job]) byJob[p.job] = [];
  byJob[p.job].push(p);
});
console.log(byJob);
// lodash의 _.groupBy(people, "job") 로 우회하는 경우도 많았다
`;

const AFTER = `
const people = [
  { name: "Ada", job: "engineer" },
  { name: "Grace", job: "engineer" },
  { name: "Linus", job: "manager" },
];

const byJob = Object.groupBy(people, (p) => p.job);
console.log(byJob);

// 그룹 키가 객체 참조 등 문자열이 아니어도 되는 경우엔 Map.groupBy
const teamLead = { name: "Linus", job: "manager" };
const byJobMap = Map.groupBy(people, (p) => (p.job === "manager" ? teamLead : p.job));
console.log(byJobMap.get(teamLead));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Object.groupBy / Map.groupBy <span class="badge">ES2024</span></h1>
      <p>
        배열을 특정 기준으로 그룹핑하는 것은 아주 흔한 작업이지만 표준 API가 없어서
        <code>reduce</code>나 <code>forEach</code>로 직접 구현하거나, lodash의
        <code>_.groupBy</code> 같은 외부 라이브러리에 의존하는 경우가 많았습니다.
      </p>

      <h2 id="before">forEach로 직접 그룹핑 / lodash 의존</h2>
      ${codeBlock(BEFORE, "forEach + 직접 누적")}

      <h2 id="after">Object.groupBy / Map.groupBy</h2>
      <p>
        <code>Object.groupBy(items, keyFn)</code>는 <code>keyFn</code>이 반환한 문자열(또는
        심볼) 키를 프로퍼티로 갖는 일반 객체를 반환합니다. 그룹 키로 객체 참조 등 임의의 값을
        쓰고 싶다면 <code>Map.groupBy</code>를 사용합니다 — 결과가 <code>Map</code>이라
        어떤 값도 키로 쓸 수 있습니다.
      </p>
      ${codeBlock(AFTER, "Object.groupBy / Map.groupBy")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        아주 최근(2024년) 표준화된 기능이라, 오래된 브라우저에서는 아직 지원되지 않을 수
        있습니다. 실행 시 <code>TypeError: Object.groupBy is not a function</code>가 뜬다면
        브라우저를 최신 버전으로 업데이트해야 합니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2024",
    code: AFTER,
  });
};
