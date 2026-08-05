import type { PageRender } from "../../router";
import { codeBlock, staticExampleNote } from "../../pageHelpers";

const WITHOUT_DI = `
// 나쁜 예: 협력 객체를 직접 new해서 만든다 -> 어떤 구현체를 쓸지가 이 클래스 안에 박제된다
public class OrderService {
  private final EmailSender emailSender = new SmtpEmailSender();

  public void placeOrder(Order order) {
    // ...
    emailSender.send(order.getCustomerEmail(), "주문이 접수되었습니다");
  }
}
`;

const WITH_DI = `
public interface EmailSender {
  void send(String to, String message);
}

@Component
public class SmtpEmailSender implements EmailSender {
  @Override
  public void send(String to, String message) {
    // 실제 SMTP 발송 로직
  }
}

@Service
public class OrderService {

  private final EmailSender emailSender;

  // 생성자가 하나뿐이면 @Autowired도 생략할 수 있다 (Spring이 자동으로 인식)
  public OrderService(EmailSender emailSender) {
    this.emailSender = emailSender;
  }

  public void placeOrder(Order order) {
    // ...
    emailSender.send(order.getCustomerEmail(), "주문이 접수되었습니다");
  }
}
`;

const CONFIGURATION_BEAN = `
// 내가 만들지 않은 클래스(외부 라이브러리)를 빈으로 등록할 때는 @Configuration + @Bean을 쓴다
@Configuration
public class AppConfig {

  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}

// 다른 클래스에서는 그냥 주입받아 쓰면 된다
@Service
public class WeatherClient {
  private final RestTemplate restTemplate;

  public WeatherClient(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Spring 핵심 (IoC · DI) <span class="badge">Spring</span></h1>
      ${staticExampleNote()}
      <p>
        Spring의 핵심은 <strong>IoC(제어의 역전, Inversion of Control)</strong>입니다 —
        객체를 누가 언제 만들고 연결할지 결정하는 "제어"를 개발자 코드가 아니라
        스프링 컨테이너(<code>ApplicationContext</code>)가 대신 가져갑니다. 그 컨테이너가
        객체(빈, Bean)를 만들면서 필요한 협력 객체를 자동으로 연결해주는 것이
        <strong>DI(의존성 주입, Dependency Injection)</strong>입니다.
      </p>

      <h2 id="without-di">DI 없이 vs DI로</h2>
      ${codeBlock(WITHOUT_DI, "협력 객체를 직접 생성 - 결합도가 높다")}
      <p>
        구현체를 직접 <code>new</code>하면, 테스트할 때 가짜(mock) 구현체로 바꿔치기하기
        어렵고, 나중에 실제 SMTP 대신 다른 발송 수단으로 바꾸려면 <code>OrderService</code>
        코드 자체를 고쳐야 합니다.
      </p>
      ${codeBlock(WITH_DI, "생성자로 주입받기 - 어떤 구현체를 쓸지는 바깥에서 결정")}
      <p>
        <code>@Component</code>/<code>@Service</code>/<code>@Repository</code>/
        <code>@Controller</code>는 전부 "이 클래스를 스프링 컨테이너가 관리하는 빈으로
        등록하라"는 같은 의미의 어노테이션이고, 역할을 드러내기 위해 이름만 다르게
        나뉘어 있습니다(내부적으로는 전부 <code>@Component</code>를 포함합니다).
        생성자 주입을 쓰면 <code>emailSender</code> 필드를 <code>final</code>로 선언할
        수 있어 "생성 이후에는 절대 바뀌지 않는다"는 게 컴파일러 차원에서 보장되고,
        테스트 코드에서도 생성자로 가짜 구현체를 그냥 넘기면 되니 필드 주입보다 널리
        권장됩니다.
      </p>

      <h2 id="configuration-bean">@Configuration과 @Bean</h2>
      <p>
        내가 직접 만들지 않은 외부 라이브러리 클래스(예: <code>RestTemplate</code>)는
        <code>@Component</code>를 붙일 수 없으니, <code>@Configuration</code> 클래스
        안에서 <code>@Bean</code> 메서드로 직접 인스턴스를 만들어 컨테이너에 등록합니다.
      </p>
      ${codeBlock(CONFIGURATION_BEAN, "@Configuration + @Bean")}
    </article>
  `;
};
