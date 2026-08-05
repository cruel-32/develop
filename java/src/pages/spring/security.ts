import type { PageRender } from "../../router";
import { codeBlock, staticExampleNote } from "../../pageHelpers";

const SECURITY_FILTER_CHAIN = `
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final JwtAuthFilter jwtAuthFilter;

  public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
    this.jwtAuthFilter = jwtAuthFilter;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable()) // 세션 대신 토큰(JWT)을 쓰는 REST API는 보통 비활성화한다
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 서버가 세션을 들고 있지 않는다
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(); // 비밀번호는 절대 평문으로 저장하지 않는다
  }
}
`;

const METHOD_SECURITY = `
@Configuration
@EnableMethodSecurity // 메서드 단위 @PreAuthorize를 쓰려면 이 어노테이션이 필요하다
public class MethodSecurityConfig {}

@Service
public class AdminService {

  // 이 메서드가 실행되기 "전에" 현재 인증된 사용자가 ADMIN 권한을 가졌는지 검사한다
  @PreAuthorize("hasRole('ADMIN')")
  public void deleteUser(Long userId) {
    // ...
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Spring Security <span class="badge">Spring</span></h1>
      ${staticExampleNote()}
      <p>
        Spring Security는 <strong>인증(authentication)</strong>("당신은 누구인가")과
        <strong>인가(authorization)</strong>("당신은 이걸 할 수 있는가")를 필터 체인으로
        처리합니다. Spring Security 6부터는 예전의 <code>WebSecurityConfigurerAdapter</code>
        상속 방식이 제거되고, <code>SecurityFilterChain</code> 빈을 직접 등록하는
        방식으로 바뀌었습니다.
      </p>

      <h2 id="filter-chain">SecurityFilterChain</h2>
      ${codeBlock(SECURITY_FILTER_CHAIN, "요청 URL 단위 인가 설정")}
      <p>
        <code>authorizeHttpRequests</code>가 URL 패턴별로 누가 접근할 수 있는지 정의하는
        핵심입니다 — 규칙은 <strong>위에서부터 순서대로</strong> 평가되므로, 더 구체적인
        패턴을 더 위에 둬야 합니다. <code>addFilterBefore</code>로 커스텀 필터(JWT
        토큰 검증 등)를 스프링 시큐리티의 기본 인증 필터보다 먼저 실행되게 끼워 넣는
        것도 자주 쓰는 패턴입니다.
      </p>

      <h2 id="method-security">메서드 단위 보안</h2>
      <p>
        URL 단위 규칙만으로 부족할 때는(같은 엔드포인트인데 데이터에 따라 권한이
        갈리는 경우 등) <code>@PreAuthorize</code>로 메서드 진입 자체를 막을 수
        있습니다. SpEL(Spring Expression Language)로 <code>hasRole(...)</code>뿐
        아니라 메서드 인자를 참조하는 조건도 쓸 수 있습니다(예:
        <code>@PreAuthorize("#userId == authentication.principal.id")</code>).
      </p>
      ${codeBlock(METHOD_SECURITY, "@PreAuthorize")}
    </article>
  `;
};
