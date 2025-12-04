# Panopticon Auth Server - Architecture Document

> **Version**: 1.0.0
> **Last Updated**: 2025-12-04
> **Author**: Panopticon Team

---

## 1. System Overview

### 1.1 High-Level Architecture

```
                                    ┌─────────────────────────────────────┐
                                    │          External Services          │
                                    │  ┌───────────┐    ┌───────────────┐ │
                                    │  │  GitHub   │    │    Google     │ │
                                    │  │  OAuth    │    │    OAuth      │ │
                                    │  └─────┬─────┘    └───────┬───────┘ │
                                    └────────┼──────────────────┼─────────┘
                                             │                  │
                                             ▼                  ▼
┌──────────────────┐              ┌─────────────────────────────────────────┐
│                  │   HTTPS      │                                         │
│   Frontend       │◀────────────▶│         Panopticon Auth Server          │
│   (Next.js)      │              │              (NestJS)                   │
│                  │              │                                         │
└──────────────────┘              │  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
                                  │  │  Auth   │ │  Users  │ │   SLOs   │  │
                                  │  │ Module  │ │ Module  │ │  Module  │  │
                                  │  └────┬────┘ └────┬────┘ └────┬─────┘  │
                                  │       │          │           │         │
                                  │       └──────────┼───────────┘         │
                                  │                  │                     │
                                  │            ┌─────▼─────┐               │
                                  │            │  Prisma   │               │
                                  │            │    ORM    │               │
                                  │            └─────┬─────┘               │
                                  └──────────────────┼─────────────────────┘
                                                     │
                                                     ▼
                                  ┌─────────────────────────────────────────┐
                                  │              PostgreSQL                  │
                                  │              (AWS RDS)                   │
                                  └─────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 20 | JavaScript 실행 환경 |
| **Framework** | NestJS 10.x | 모듈러 백엔드 프레임워크 |
| **ORM** | Prisma 5.x | 타입 안전 데이터베이스 접근 |
| **Database** | PostgreSQL 15+ | 관계형 데이터 저장소 |
| **Authentication** | jose | JWT 토큰 생성/검증 |
| **Documentation** | Swagger/OpenAPI | API 문서 자동 생성 |
| **Container** | Docker | 배포 패키징 |

---

## 2. Module Architecture

### 2.1 Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                        AppModule                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Imports                            │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────────┐  │   │
│  │  │ AuthModule  │ │ UsersModule │ │ WebhooksModule │  │   │
│  │  └──────┬──────┘ └──────┬──────┘ └───────┬────────┘  │   │
│  │         │               │                │           │   │
│  │         │        ┌──────┴──────┐         │           │   │
│  │         │        │ SlosModule  │         │           │   │
│  │         │        └──────┬──────┘         │           │   │
│  │         │               │                │           │   │
│  │         └───────────────┼────────────────┘           │   │
│  │                         ▼                            │   │
│  │              ┌──────────────────┐                    │   │
│  │              │  PrismaService   │                    │   │
│  │              │    (Global)      │                    │   │
│  │              └──────────────────┘                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Module Responsibilities

| Module | Responsibility | Dependencies |
|--------|----------------|--------------|
| **AuthModule** | OAuth 인증, 토큰 발급/갱신 | UsersModule, JwtService |
| **UsersModule** | 사용자 CRUD, 세션 관리 | PrismaService |
| **SlosModule** | SLO 정책 관리, 웹훅 매핑 | PrismaService, WebhooksModule |
| **WebhooksModule** | 웹훅 설정, 테스트 발송 | PrismaService |

---

## 3. Directory Structure

```
panopticon_authserver/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   │
│   ├── auth/                        # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts       # OAuth endpoints
│   │   └── dto/
│   │       └── auth-response.dto.ts
│   │
│   ├── users/                       # User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts      # User CRUD endpoints
│   │   ├── users.service.ts         # Business logic
│   │   └── dto/
│   │       ├── upsert-user.dto.ts
│   │       ├── upsert-response.dto.ts
│   │       ├── user-response.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── slos/                        # SLO policy module
│   │   ├── slos.module.ts
│   │   ├── slos.controller.ts       # SLO CRUD + webhook mapping
│   │   ├── slos.service.ts
│   │   └── dto/
│   │       ├── create-slo.dto.ts
│   │       ├── update-slo.dto.ts
│   │       └── slo-response.dto.ts
│   │
│   ├── webhooks/                    # Webhook configuration module
│   │   ├── webhooks.module.ts
│   │   ├── webhooks.controller.ts
│   │   ├── webhooks.service.ts
│   │   └── dto/
│   │       ├── create-webhook.dto.ts
│   │       ├── update-webhook.dto.ts
│   │       └── webhook-response.dto.ts
│   │
│   ├── jwt/                         # JWT service
│   │   └── jwt.service.ts
│   │
│   ├── prisma/                      # Database service
│   │   └── prisma.service.ts
│   │
│   └── common/                      # Shared utilities
│       ├── decorators/
│       │   └── current-user.decorator.ts
│       └── guards/
│           └── jwt-auth.guard.ts
│
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Migration history
│
├── docs/                            # Documentation
│   ├── PRD.md
│   └── ARCHITECTURE.md
│
├── Dockerfile                       # Container definition
├── package.json
├── tsconfig.json
└── .env / .env.production           # Environment configs
```

---

## 4. Data Architecture

### 4.1 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                              User                                    │
├─────────────────────────────────────────────────────────────────────┤
│ PK │ id: UUID                                                        │
│    │ email: String (UNIQUE)                                         │
│    │ emailVerified: Boolean                                         │
│    │ displayName: String                                            │
│    │ avatarUrl: String                                              │
│    │ role: String (default: "user")                                 │
│    │ metadata: JSON                                                 │
│    │ passwordHash: String                                           │
│    │ lastLoginAt: DateTime                                          │
│    │ createdAt: DateTime                                            │
│    │ updatedAt: DateTime                                            │
└──────────────┬──────────────────────┬──────────────────────┬────────┘
               │                      │                      │
               │ 1:N                  │ 1:N                  │ 1:N
               ▼                      ▼                      ▼
┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────────┐
│    OAuthAccount      │  │      Session        │  │     SloPolicy      │
├──────────────────────┤  ├─────────────────────┤  ├────────────────────┤
│ PK │ id: UUID        │  │ PK │ id: UUID       │  │ PK │ id: UUID      │
│ FK │ userId: UUID    │  │ FK │ userId: UUID   │  │ FK │ userId: UUID  │
│    │ provider        │  │    │ refreshToken-  │  │    │ name          │
│    │ providerAccId   │  │    │ Hash           │  │    │ serviceName   │
│    │ accessToken     │  │    │ expiresAt      │  │    │ metric        │
│    │ refreshToken    │  │    │ revoked        │  │    │ target        │
│    │ scope           │  │    │ ip             │  │    │ sliValue      │
│    │ tokenExpiresAt  │  │    │ userAgent      │  │    │ totalMinutes  │
│    │ profileJson     │  │    │ createdAt      │  │    │ connected-    │
│    │ createdAt       │  └─────────────────────┘  │    │ Channels[]    │
│    │ updatedAt       │                           │    │ createdAt     │
└──────────────────────┘                           │    │ updatedAt     │
                                                   └─────────┬──────────┘
       ┌─────────────────────────────────────────────────────┤
       │                                                     │
       │ N:M (via SloWebhookMapping)                         │
       ▼                                                     │
┌──────────────────────┐                     ┌───────────────┴────────┐
│   WebhookConfig      │                     │   SloWebhookMapping    │
├──────────────────────┤                     ├────────────────────────┤
│ PK │ id: UUID        │                     │ PK │ id: UUID          │
│ FK │ userId: UUID    │◀────────────────────│ FK │ sloId: UUID       │
│    │ type (enum)     │                     │ FK │ webhookId: UUID   │
│    │ name            │                     │    │ createdAt         │
│    │ webhookUrl      │                     └────────────────────────┘
│    │ enabled         │
│    │ smtpHost        │  (Email 전용 필드)
│    │ smtpPort        │
│    │ smtpUser        │
│    │ smtpPassword    │
│    │ smtpTls         │
│    │ lastTestedAt    │
│    │ createdAt       │
│    │ updatedAt       │
└──────────────────────┘
```

### 4.2 Key Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| User → OAuthAccount | 1:N | 사용자당 여러 OAuth 계정 연결 가능 |
| User → Session | 1:N | 사용자당 여러 활성 세션 |
| User → SloPolicy | 1:N | 사용자당 여러 SLO 정책 |
| User → WebhookConfig | 1:N | 사용자당 여러 웹훅 설정 |
| SloPolicy ↔ WebhookConfig | N:M | SLO 정책에 여러 웹훅 연결 가능 |

---

## 5. Authentication Flow

### 5.1 OAuth 2.0 Authorization Code Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Client  │     │  Auth Server │     │   OAuth     │     │    DB    │
│(Frontend)│     │   (NestJS)   │     │  Provider   │     │(Postgres)│
└────┬─────┘     └──────┬───────┘     └──────┬──────┘     └────┬─────┘
     │                  │                    │                  │
     │ 1. GET /auth/github                   │                  │
     │─────────────────▶│                    │                  │
     │                  │                    │                  │
     │ 2. Redirect to GitHub OAuth           │                  │
     │◀─────────────────│                    │                  │
     │                  │                    │                  │
     │ 3. User authorizes                    │                  │
     │──────────────────────────────────────▶│                  │
     │                  │                    │                  │
     │ 4. Redirect with ?code=xxx            │                  │
     │◀──────────────────────────────────────│                  │
     │                  │                    │                  │
     │ 5. GET /auth/github/callback?code=xxx │                  │
     │─────────────────▶│                    │                  │
     │                  │                    │                  │
     │                  │ 6. Exchange code   │                  │
     │                  │ for access_token   │                  │
     │                  │───────────────────▶│                  │
     │                  │                    │                  │
     │                  │ 7. access_token    │                  │
     │                  │◀───────────────────│                  │
     │                  │                    │                  │
     │                  │ 8. Fetch user profile                 │
     │                  │───────────────────▶│                  │
     │                  │                    │                  │
     │                  │ 9. User data       │                  │
     │                  │◀───────────────────│                  │
     │                  │                    │                  │
     │                  │ 10. Upsert user                       │
     │                  │───────────────────────────────────────▶
     │                  │                    │                  │
     │                  │ 11. Create session │                  │
     │                  │───────────────────────────────────────▶
     │                  │                    │                  │
     │ 12. Set cookies (auth-token, refresh-token)              │
     │◀─────────────────│                    │                  │
     │                  │                    │                  │
     │ 13. Redirect to frontend              │                  │
     │◀─────────────────│                    │                  │
     │                  │                    │                  │
```

### 5.2 Token Refresh Flow

```
┌──────────┐          ┌──────────────┐          ┌──────────┐
│  Client  │          │  Auth Server │          │    DB    │
└────┬─────┘          └──────┬───────┘          └────┬─────┘
     │                       │                       │
     │ 1. POST /auth/refresh │                       │
     │   {refreshToken}      │                       │
     │──────────────────────▶│                       │
     │                       │                       │
     │                       │ 2. Find session by    │
     │                       │    tokenHash          │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │ 3. Validate:          │
     │                       │    - Not expired      │
     │                       │    - Not revoked      │
     │                       │◀──────────────────────│
     │                       │                       │
     │                       │ 4. Revoke old session │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │ 5. Create new session │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │ 6. Generate new JWT   │
     │                       │                       │
     │ 7. Response:          │                       │
     │    {token, user}      │                       │
     │    + Set-Cookie       │                       │
     │◀──────────────────────│                       │
     │                       │                       │
```

### 5.3 Request Authentication

```
┌──────────┐          ┌──────────────┐          ┌──────────┐
│  Client  │          │  JwtAuthGuard │         │JwtService│
└────┬─────┘          └──────┬───────┘          └────┬─────┘
     │                       │                       │
     │ Request with          │                       │
     │ Authorization: Bearer │                       │
     │ or Cookie: auth-token │                       │
     │──────────────────────▶│                       │
     │                       │                       │
     │                       │ 1. Extract token      │
     │                       │    (Header > Cookie)  │
     │                       │                       │
     │                       │ 2. Verify JWT         │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │ 3. {valid, payload}   │
     │                       │◀──────────────────────│
     │                       │                       │
     │                       │ 4. Set request.user   │
     │                       │    = payload          │
     │                       │                       │
     │ Continue to controller│                       │
     │◀──────────────────────│                       │
     │                       │                       │
```

---

## 6. API Design

### 6.1 API Endpoints Summary

| Module | Prefix | Auth Required | Description |
|--------|--------|---------------|-------------|
| Auth | `/auth` | Partial | OAuth, 토큰 관리 |
| Users | `/auth/users` | Yes | 사용자 CRUD |
| SLOs | `/auth/slos` | Yes | SLO 정책 관리 |
| Webhooks | `/auth/webhooks` | Yes | 웹훅 설정 |

### 6.2 Response Format

**Success Response:**
```json
{
  "id": "uuid",
  "data": { ... },
  "createdAt": "2025-12-04T00:00:00Z"
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### 6.3 Authentication Methods

| Method | Header/Cookie | Format |
|--------|---------------|--------|
| Bearer Token | `Authorization` | `Bearer <jwt>` |
| Cookie | `Cookie` | `auth-token=<jwt>` |

---

## 7. Security Architecture

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│ Layer 1: Transport Security                              │
│ ├─ HTTPS Only (Production)                              │
│ └─ TLS 1.2+                                             │
├─────────────────────────────────────────────────────────┤
│ Layer 2: CORS Policy                                     │
│ ├─ Whitelist: jungle-panopticon.cloud, localhost        │
│ └─ Credentials: true                                    │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Authentication                                  │
│ ├─ JWT (Access Token) - 24h expiry                      │
│ ├─ Refresh Token (SHA256 hashed) - 30d expiry           │
│ └─ Session revocation support                           │
├─────────────────────────────────────────────────────────┤
│ Layer 4: Cookie Security                                 │
│ ├─ HttpOnly: true                                       │
│ ├─ Secure: true (Production)                            │
│ └─ SameSite: lax                                        │
├─────────────────────────────────────────────────────────┤
│ Layer 5: Input Validation                                │
│ ├─ class-validator (DTO validation)                     │
│ └─ Whitelist mode (unknown fields stripped)             │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Token Security

| Token Type | Storage | Expiry | Hash Algorithm |
|------------|---------|--------|----------------|
| Access Token (JWT) | Client (Cookie/Memory) | 24 hours | HS256 |
| Refresh Token | DB (hashed) | 30 days | SHA256 |

---

## 8. Deployment Architecture

### 8.1 Production Environment

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                    │
│                                                                     │
│  ┌────────────────┐                                                 │
│  │   Route 53     │                                                 │
│  │   DNS          │                                                 │
│  └───────┬────────┘                                                 │
│          │                                                          │
│          ▼                                                          │
│  ┌────────────────┐                                                 │
│  │   CloudFront   │     ┌──────────────────────────────────────┐   │
│  │   (CDN)        │     │           VPC                         │   │
│  └───────┬────────┘     │                                      │   │
│          │              │  ┌─────────────┐    ┌──────────────┐ │   │
│          │              │  │    ECS      │    │   RDS        │ │   │
│          └──────────────┼─▶│   Fargate   │───▶│  PostgreSQL  │ │   │
│                         │  │             │    │  (Multi-AZ)  │ │   │
│                         │  └─────────────┘    └──────────────┘ │   │
│                         │                                      │   │
│                         └──────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Docker Configuration

**Multi-stage Build:**

```dockerfile
# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Stage 2: Production
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main.js"]
```

---

## 9. Monitoring & Observability

### 9.1 Health Checks

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | 서버 상태 확인 |
| `GET /auth/health` | 인증 모듈 상태 |

### 9.2 Logging Strategy

| Level | Usage |
|-------|-------|
| ERROR | 예외, 인증 실패 |
| WARN | 만료 세션, 잘못된 토큰 |
| INFO | 로그인/로그아웃, SLO 생성 |
| DEBUG | 상세 요청/응답 (개발 환경) |

---

## 10. Future Considerations

### 10.1 Scalability

- [ ] Redis 기반 세션 캐싱
- [ ] 수평 확장을 위한 Stateless 아키텍처 유지
- [ ] 데이터베이스 Read Replica 구성

### 10.2 Security Enhancements

- [ ] 2FA/MFA 지원
- [ ] API Rate Limiting
- [ ] 감사 로그 (Audit Log)
- [ ] JWT Secret Rotation

### 10.3 Feature Extensions

- [ ] SAML/LDAP 엔터프라이즈 인증
- [ ] 역할 기반 접근 제어 (RBAC) 확장
- [ ] API Key 기반 서비스 인증
