# Java 학습실

`/java` 경로에서 서빙되는 이 앱은 Java를 브라우저 안에서 직접 컴파일·실행하며 배우는
학습실입니다. 다른 학습실(react/vue/typescript/ecma/html-css/postgre)과 같은 설계
철학(대/중/소 메뉴, 사이드바+콘텐츠+목차 3단 레이아웃, 편집 가능한 라이브 예제)을 Java에
맞게 옮겼습니다.

## 실습창이 동작하는 방식

postgre의 PGlite와 같은 원리로, [CheerpJ](https://cheerpj.com/)(OpenJDK를
WebAssembly로 실행하는 프로젝트)로 진짜 `javac` + `java`를 이 브라우저 탭 안에서 그대로
컴파일·실행합니다(`src/javaClient.ts`, `src/javaPlayground.ts`). 다만 PGlite와 다른 점이
두 가지 있습니다.

1. **세션당 한 번만 초기화**: `cheerpjInit()`이 OpenJDK 전체를 불러오는 무거운
   작업이라(첫 호출에 수 초) postgre처럼 실행마다 새 인스턴스를 만들지 않고, 세션당 한
   번만 초기화해서 재사용합니다. "실행"을 누르면 컴파일/실행만 매번 새로 합니다.
2. **`#console`가 페이지 전역에 하나뿐**: CheerpJ는 `System.out`/`System.err` 출력을
   반환값이 아니라 `id="console"`인 DOM 엘리먼트에 직접 써주는 방식으로 동작합니다
   (Leaning Technologies의 공식 데모 [javafiddle](https://github.com/leaningtech/javafiddle)의
   실제 구현을 참고했습니다). 이 SPA 라우터는 페이지 이동마다 `#app` 내부를 통째로 다시
   그리므로, `#console`/`#output`은 `index.html`에서 `#app` 바깥 `body` 직속 자식으로
   두어 라우팅과 무관하게 항상 같은 노드가 유지되게 했습니다. 서로 다른 페이지에서 거의
   동시에 "실행"을 누르는 경쟁 상태를 막기 위해, 모든 컴파일/실행 요청은 `javaClient.ts`의
   큐를 통해 항상 하나씩만 순서대로 처리됩니다.

## tools.jar

CheerpJ에서 `javac`(`com.sun.tools.javac.Main`)를 실행하려면 컴파일러 클래스가 담긴
jar가 classpath에 있어야 하는데, CheerpJ 런타임 자체는 이 jar를 제공하지 않습니다.
`public/tools.jar`는 Leaning Technologies의 공식 데모 [javafiddle](https://github.com/leaningtech/javafiddle)
저장소에 정적 자산으로 커밋되어 있는 것과 동일한 파일(OpenJDK의 javac 컴파일러 클래스,
Apache-2.0 라이선스인 javafiddle 저장소에 포함된 OpenJDK GPL 산출물)을 그대로 가져온
것입니다.

CheerpJ는 classpath 항목 `/app/tools.jar`를 **현재 페이지의 오리진 루트**에서 찾습니다
(이 앱의 `base` 경로인 `/java`를 무시합니다). 그래서:

- **로컬 dev 서버**(`npm run dev`, `docker-compose.local.yml`)에서는 `vite.config.ts`의
  커스텀 플러그인이 `/tools.jar` 요청을 `/java/tools.jar`로 바꿔치기해서, Vite가 이미
  올바르게 구현해둔 Range 요청 지원(CheerpJ가 18MB 파일 전체가 아니라 필요한 부분만
  읽어오기 위해 사용) 그대로 재사용합니다.
- **프로덕션**에서는 여러 학습실이 한 오리진 아래 `/java`, `/postgre` 같은 하위 경로로
  서빙되므로, `backend/src/index.ts`가 도메인 루트에 `GET /tools.jar`를 별도로
  등록해 서빙합니다(`Dockerfile`이 빌드 시 `public/tools.jar`를 그 위치로도 복사합니다).

## Spring Framework & 외부 모듈 섹션

"Spring Framework"/"자주 쓰는 외부 모듈"(Spring Security, Spring Data JPA, QueryDSL,
Lombok, MyBatis) 그룹의 페이지들은 실습창(`mountJavaPlayground`)이 없는 정적 코드
설명 페이지입니다 — 이 코드들은 Spring 컨테이너, 서블릿 환경, 실제 DB 연결이 있어야
동작하는데, CheerpJ는 단일 `.java` 파일을 `javac` + `java`로 컴파일·실행하는 것만
지원할 뿐 Spring Boot 애플리케이션을 띄우는 건 지원 범위 밖입니다. 각 페이지 맨 위의
안내문(`pageHelpers.ts`의 `staticExampleNote()`)이 이 사실을 알려줍니다.

## CheerpJ 라이선스

CheerpJ Core는 Community License로 개인 프로젝트·1인 상업적 사용까지 무료이지만, 자체
호스팅/재배포는 허용되지 않습니다. 그래서 이 앱은 CheerpJ 런타임 자체는 npm 패키지로
번들링하지 않고, `index.html`에서 Leaning Technologies의 CDN
(`https://cjrtnc.leaningtech.com/`)을 직접 불러옵니다 — 이 사이트에서 유일하게 외부
CDN에 의존하는 학습실입니다. 정확한 조건은 배포 전에
[공식 라이선스 페이지](https://cheerpj.com/docs/licensing.html)에서 다시 확인하세요.
