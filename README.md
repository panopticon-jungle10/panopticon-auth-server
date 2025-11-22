# panopticon-auth-server — 개발자 안내서

이 저장소는 Panopticon 프로젝트의 인증(Auth) 마이크로서비스입니다. 아래는 로컬 개발, OAuth 제공자 설정(GitHub/Google), Prisma 마이그레이션 적용 및 주요 엔드포인트 테스트 방법을 정리한 안내서입니다.

빠른 시작 (개발)
-----------------

1. 의존성 설치 후 개발 모드로 실행:

```bash
cd panopticon_authserver
npm install
npm run start:dev
```

2. 기본 포트는 `8080`이며, 개발 환경에서는 `http://localhost:8080/docs`에서 Swagger UI를 확인할 수 있습니다.

필수 환경 변수
----------------

`.env` 파일을 프로젝트 루트에 생성(또는 `.env.example` 복사)하고 최소한 아래 값을 설정하세요:

- `DATABASE_URL` — Postgres 연결 문자열 (예: `postgres://user:pass@localhost:5432/dbname`)
- `JWT_SECRET` — 내부 액세스 JWT 서명에 사용할 비밀키
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI` — GitHub OAuth 앱 값
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` — Google OAuth 앱 값

선택적 DB TLS 설정 (RDS/관리형 DB 사용시)

- `PG_SSL` (기본: `"true"`) — Postgres TLS 사용 여부
- `PG_SSL_REJECT_UNAUTHORIZED` (기본: `"true"`) — 개발용으로만 `0`/`false` 설정 권장
- `PG_SSL_CA` — base64로 인코딩된 PEM 형식 CA 번들(서버 인증서 검증용)

기타 유용한 환경 변수

- `NODE_ENV` — `development` 또는 `production` (쿠키의 `secure` 동작 및 Swagger 노출 제어)
- `PORT` — 바인드할 포트(기본 8080)

Prisma 및 DB 마이그레이션
-------------------------

Prisma를 사용합니다. 스키마 변경 후 또는 최초 설정 시 다음을 실행하세요:

```bash
cd panopticon_authserver
npx prisma generate
npx prisma migrate dev --name init
```

참고:

- 개발에서는 `migrate dev`를 사용하여 마이그레이션 파일 생성 및 적용을 동시에 할 수 있습니다.
- 프로덕션/CI에서는 `npx prisma migrate deploy`로 기존 마이그레이션을 비대화형으로 적용하세요.

OAuth 제공자 설정 (GitHub / Google)
----------------------------------

OAuth 앱을 등록할 때 아래 값을 사용하세요:

- 리디렉션(콜백) URI 예시:
  - GitHub: `https://<AUTH_HOST>/auth/github/callback`
  - Google: `https://<AUTH_HOST>/auth/google/callback`

- 권한 범위(Scopes):
  - GitHub: `read:user user:email` (primary/verified 이메일 접근을 위해 필요)
  - Google: `openid email profile` (OpenID Connect 기반)

발급된 Client ID / Client Secret은 `.env`에 복사하세요.

지원하는 인증 흐름
-------------------

- `GET /auth/github/callback`, `GET /auth/google/callback`: Provider가 브라우저를 리디렉트하는 서버 측 콜백 엔드포인트
- `POST /auth/oauth/callback`: `{ provider, code }` 형식으로 SPA가 code를 서버로 전달할 때 사용
- `POST /auth/refresh`: 리프레시 토큰으로 액세스 토큰 재발급(서버는 기본적으로 HttpOnly 쿠키 `refreshToken` 사용)

쿠키 및 토큰 동작
-----------------

- 액세스 토큰: 로그인 성공 시 응답 본문에 짧은 만료시간의 JWT를 반환합니다.
- 리프레시 토큰: 로그인 시 `refreshToken` 이름의 HttpOnly 쿠키를 설정하며, `/auth/refresh` 호출 시 토큰을 회전(rotate)하여 쿠키를 업데이트합니다.
  - `httpOnly: true`
  - `secure: true` (프로덕션에서 `NODE_ENV=production`일 경우)
  - `sameSite: 'lax'`

로컬(HTTP) 테스트 시에는 `NODE_ENV !== 'production'`이면 `secure`가 `false`로 동작하도록 구현되어 있습니다.

테스트 예시
------------

리프레시 토큰(쿠키 기반):

```bash
curl -i -X POST http://localhost:8080/auth/refresh
```

POST 콜백 (SPA 패턴):

```bash
curl -X POST http://localhost:8080/auth/oauth/callback \
  -H "Content-Type: application/json" \
  -d '{"provider":"github","code":"<AUTH_CODE_FROM_GITHUB>"}'
```

문제 해결(Troubleshooting)
--------------------------

- `cookie-parser` 또는 `express` 타입 관련 TypeScript 오류가 발생하면:

```bash
npm install
npm install -D @types/express @types/cookie-parser
```

- Prisma 관계(validation) 오류가 발생하면 `npx prisma format` 후 `npx prisma generate`를 실행하고 마이그레이션을 재시도하세요.

배포 체크리스트(요약)
-------------------

1. 컨테이너 이미지를 빌드하고 레지스트리에 푸시하세요.
2. DB 크리덴셜, OAuth 클라이언트 시크릿, `JWT_SECRET` 등을 시크릿 매니저에 저장하고 태스크/컨테이너에 주입하세요.
3. CI에서 마이그레이션을 적용하세요: `npx prisma migrate deploy`.
4. `DATABASE_URL`에 필요한 SSL 옵션이 포함되어 있는지 확인하고, 필요 시 `PG_SSL_CA`를 제공하세요.
5. 서비스(예: ECS)를 업데이트하고 로그를 모니터링하세요.

---

원하시면 이 파일(`README.md`)을 팀 표준으로 덮어쓰기 하거나, 프론트엔드 연동 예제(Next.js 스니펫)를 추가해 드리겠습니다.
