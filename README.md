# Panopticon Auth Server

**Panopticon 모니터링 플랫폼의 중앙 인증 서버**

OAuth 기반 소셜 로그인, JWT 토큰 관리, SLO 정책 관리, 알림 웹훅 설정을 제공하는 NestJS 기반 인증 서비스입니다.

---

## Features

- **OAuth 2.0 인증** - GitHub, Google 소셜 로그인
- **JWT 토큰 관리** - Access Token / Refresh Token 기반 인증
- **SLO 정책 관리** - Service Level Objective 설정 및 모니터링 연동
- **멀티 채널 웹훅** - Slack, Discord, Teams, Email 알림 지원

---

## Quick Start

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:8080)
npm run start:dev
```

**환경 변수 설정** - 프로젝트 루트에 `.env` 파일 생성:
```env
DATABASE_URL=postgresql://appuser:apppassword@localhost:15432/panopticon_app
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | NestJS 10.x |
| Database | PostgreSQL + Prisma ORM |
| Authentication | OAuth 2.0, JWT (jose) |
| API Docs | Swagger/OpenAPI |

---

## API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `POST /auth/oauth/callback` | OAuth 인증 |
| Auth | `POST /auth/refresh` | 토큰 갱신 |
| Users | `GET /auth/users/me` | 현재 사용자 조회 |
| SLOs | `GET /auth/slos` | SLO 정책 목록 |
| Webhooks | `GET /auth/webhooks` | 웹훅 설정 목록 |

**Swagger UI**: http://localhost:8080/docs (개발 환경)

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRD](./docs/PRD.md) | 제품 요구사항 문서 |
| [Architecture](./docs/ARCHITECTURE.md) | 시스템 아키텍처 |
| [Development Guidelines](./ORGANIZATION_RULES.md) | 개발 가이드 및 컨벤션 |
| [PostgreSQL Setup](./POSTGRES_DOC.md) | 데이터베이스 설정 가이드 |

---

## Project Structure

```
src/
├── auth/           # OAuth, 토큰 관리
├── users/          # 사용자 CRUD
├── slos/           # SLO 정책 관리
├── webhooks/       # 웹훅 설정
├── jwt/            # JWT 서비스
├── prisma/         # DB 서비스
└── common/         # 공통 유틸리티
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | 개발 서버 (watch mode) |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | 코드 린트 |
| `npx prisma studio` | DB GUI |

---

## License

Panopticon Team - Krafton Jungle
