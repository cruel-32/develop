import type { PageRender } from "../../router";
import { codeBlock, staticExampleNote } from "../../pageHelpers";

const MAIN_CLASS = `
// @SpringBootApplication은 @Configuration + @EnableAutoConfiguration + @ComponentScan을 합친 것
@SpringBootApplication
public class DevelopApplication {
  public static void main(String[] args) {
    SpringApplication.run(DevelopApplication.class, args);
  }
}
`;

const REST_CONTROLLER = `
// @RestController = @Controller + @ResponseBody
// (반환값을 뷰 이름이 아니라 그대로 JSON 응답 본문으로 직렬화한다)
@RestController
@RequestMapping("/api/people")
public class PersonController {

  private final PersonService personService;

  public PersonController(PersonService personService) {
    this.personService = personService;
  }

  @GetMapping("/{id}")
  public ResponseEntity<PersonResponse> getPerson(@PathVariable Long id) {
    Person person = personService.findById(id);
    return ResponseEntity.ok(PersonResponse.from(person));
  }

  @GetMapping
  public ResponseEntity<List<PersonResponse>> listPeople(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int pageSize) {
    List<PersonResponse> people = personService.findPage(page, pageSize);
    return ResponseEntity.ok(people);
  }

  @PostMapping
  public ResponseEntity<PersonResponse> createPerson(@RequestBody PersonCreateRequest request) {
    Person saved = personService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(PersonResponse.from(saved));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePerson(@PathVariable Long id) {
    personService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Spring Boot & REST API <span class="badge">Spring</span></h1>
      ${staticExampleNote()}
      <p>
        Spring Boot는 "설정보다 관례(convention over configuration)"를 앞세워, XML로
        일일이 설정하던 예전 Spring을 어노테이션 몇 개와 자동 설정(auto configuration)으로
        대체합니다. <code>@SpringBootApplication</code> 하나만 붙이면 컴포넌트 스캔,
        내장 톰캣 서버 실행, 각종 기본 설정이 한 번에 켜집니다.
      </p>
      ${codeBlock(MAIN_CLASS, "진입점")}

      <h2 id="rest-controller">@RestController</h2>
      <p>
        이 프로젝트의 <code>backend/src/routes/people.ts</code>(Express)가 하는 일을
        Spring으로 그대로 옮기면 이런 모양이 됩니다. <code>@GetMapping</code>/
        <code>@PostMapping</code>/<code>@PutMapping</code>/<code>@DeleteMapping</code>이
        HTTP 메서드를, <code>@PathVariable</code>이 URL 경로 조각을,
        <code>@RequestParam</code>이 쿼리스트링을, <code>@RequestBody</code>가 JSON
        요청 본문을 자바 객체로 매핑합니다.
      </p>
      ${codeBlock(REST_CONTROLLER, "PersonController")}
      <p class="hint">
        <code>ResponseEntity</code>로 감싸면 상태 코드(<code>200</code>,
        <code>201</code>, <code>204</code> 등)를 명시적으로 제어할 수 있습니다 — 그냥
        객체를 반환하면 항상 <code>200</code>으로 응답합니다.
      </p>
    </article>
  `;
};
